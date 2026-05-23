"""
Assessment views — API endpoints for the EQ Assessment System.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import UserAssessment, Scenario, Question, Response as AssessmentResponse, Result
from .serializers import (
    UserAssessmentSerializer,
    QuestionSerializer,
    ResultSerializer,
)

# EQ Engine Integrations
from eq_engine.scenario_generator import generate_scenario
from eq_engine.question_generator import generate_questions

@api_view(["POST"])
def start_assessment(request):
    """
    Start a new assessment:
    1. Create UserAssessment from request data
    2. (Engine) Generate Scenario based on profession
    3. (Engine) Generate Questions for the Scenario
    4. Return the assessment ID, scenario, and questions
    """
    serializer = UserAssessmentSerializer(data=request.data)
    if serializer.is_valid():
        assessment = serializer.save()
        
        # --- Real Engine Call: generate_scenario() ---
        scenario_data = generate_scenario(assessment.profession, assessment.age)
        
        # Save mapped profession group back to assessment
        assessment.profession_group = scenario_data["profession_group"]
        assessment.save()
        
        scenario = Scenario.objects.create(
            assessment=assessment,
            scenario_text=scenario_data["scenario_text"],
            scenario_type=scenario_data["scenario_type"],
            profession_group=scenario_data["profession_group"],
            difficulty=scenario_data["difficulty"],
        )
        
        # --- Real Engine Call: generate_questions() ---
        questions_data = generate_questions(scenario.scenario_type, scenario.scenario_text)
        
        questions = []
        for q_data in questions_data:
            questions.append(
                Question(
                    scenario=scenario, 
                    eq_dimension=q_data["eq_dimension"], 
                    order=q_data["order"], 
                    question_text=q_data["question_text"]
                )
            )
        Question.objects.bulk_create(questions)
        
        return Response({
            "assessment_id": assessment.id,
            "scenario": {
                "text": scenario.scenario_text,
                "type": scenario.scenario_type
            },
            "questions": QuestionSerializer(questions, many=True).data
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_questions(request, assessment_id):
    """Get questions and scenario context for an assessment."""
    assessment = get_object_or_404(UserAssessment, id=assessment_id)
    scenario = get_object_or_404(Scenario, assessment=assessment)
    questions = Question.objects.filter(scenario=scenario).order_by("order")
    
    return Response({
        "scenario": {
            "text": scenario.scenario_text,
            "type": scenario.scenario_type,
            "difficulty": scenario.difficulty
        },
        "questions": QuestionSerializer(questions, many=True).data
    })


from eq_engine.validators import validate_response
from eq_engine.emotion_analyzer import analyze_text
from eq_engine.eq_scoring import calculate_eq_scores, get_eq_level
from eq_engine.feedback_generator import generate_feedback

@api_view(["POST"])
def submit_responses(request, assessment_id):
    """
    Submit all responses:
    1. Save user answers and validate them
    2. (Engine) Analyze emotions/sentiment for each response
    3. (Engine) Calculate EQ scores based on analysis
    4. (Engine) Generate AI feedback
    5. Save Result and mark assessment as completed
    """
    assessment = get_object_or_404(UserAssessment, id=assessment_id)
    
    if assessment.is_completed:
        return Response({"message": "Assessment already completed."}, status=status.HTTP_200_OK)
    
    responses_data = request.data.get("responses", [])
    
    saved_responses = []
    has_invalid = False
    
    for resp_data in responses_data:
        question = get_object_or_404(Question, id=resp_data["question_id"])
        user_answer = resp_data.get("user_answer", "")
        
        is_valid, validation_msg = validate_response(user_answer)
        if not is_valid:
            has_invalid = True
            
        nlp_results = analyze_text(user_answer) if is_valid else {}
        
        response_obj, created = AssessmentResponse.objects.update_or_create(
            question=question,
            assessment=assessment,
            defaults={
                "user_answer": user_answer,
                "emotion_detected": nlp_results.get("emotion_detected", "") if is_valid else "",
                "emotion_scores": nlp_results.get("emotion_scores", {}) if is_valid else {},
                "sentiment_label": nlp_results.get("sentiment_label", "") if is_valid else "",
                "sentiment_score": nlp_results.get("sentiment_score", 0.0) if is_valid else 0.0,
                "emotional_intensity": nlp_results.get("emotional_intensity", 0.0) if is_valid else 0.0,
                "is_valid": is_valid,
                "validation_message": validation_msg
            }
        )
        saved_responses.append(response_obj)
        
    if has_invalid:
        invalid_details = [
            {"question_id": str(r.question.id), "message": r.validation_message}
            for r in saved_responses if not r.is_valid
        ]
        return Response({
            "error": "Some responses failed validation.",
            "details": invalid_details
        }, status=status.HTTP_400_BAD_REQUEST)

        
    # --- Real Engine Call: calculate_eq_scores() ---
    calculated_scores = calculate_eq_scores(saved_responses)
    
    # Extract data for personalized feedback
    scenario = get_object_or_404(Scenario, assessment=assessment)
    user_answers_dict = {r.question.eq_dimension: r.user_answer for r in saved_responses}
    
    # --- Real Engine Call: generate_feedback() ---
    feedback = generate_feedback(calculated_scores, scenario.scenario_text, user_answers_dict)
    
    result = Result.objects.create(
        assessment=assessment,
        overall_eq_score=calculated_scores["overall_eq_score"],
        self_awareness_score=calculated_scores["self_awareness"],
        self_regulation_score=calculated_scores["self_regulation"],
        empathy_score=calculated_scores["empathy"],
        social_skills_score=calculated_scores["social_skills"],
        motivation_score=calculated_scores["motivation"],
        stress_management_score=calculated_scores["stress_management"],
        conflict_resolution_score=calculated_scores["conflict_resolution"],
        adaptability_score=calculated_scores["adaptability"],
        resilience_score=calculated_scores["resilience"],
        strengths=feedback["strengths"],
        weaknesses=feedback["weaknesses"],
        recommendations=feedback["recommendations"],
        feedback_text=feedback["feedback_text"]
    )
    
    assessment.is_completed = True
    assessment.completed_at = timezone.now()
    assessment.overall_eq_score = result.overall_eq_score
    assessment.eq_level = get_eq_level(result.overall_eq_score)
    assessment.save()
    
    return Response({"message": "Responses submitted successfully."}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_results(request, assessment_id):
    """Get EQ scores, feedback, and visualization data."""
    assessment = get_object_or_404(UserAssessment, id=assessment_id)
    if not assessment.is_completed:
        return Response({"error": "Assessment is not completed yet."}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = UserAssessmentSerializer(assessment)
    return Response(serializer.data)


from django.http import HttpResponse
from datetime import datetime
import io
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter

@api_view(["GET"])
def get_report(request, assessment_id):
    """Download a PDF report using reportlab."""
    assessment = get_object_or_404(UserAssessment, id=assessment_id)
    if not assessment.is_completed:
        return Response({"error": "Assessment is not completed yet."}, status=status.HTTP_400_BAD_REQUEST)
        
    result = assessment.result
    
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=letter,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='MainTitle', fontSize=24, spaceAfter=30, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle(name='SubHeader', fontSize=14, spaceAfter=10, spaceBefore=20, fontName='Helvetica-Bold'))
        styles.add(ParagraphStyle(name='NormalText', fontSize=11, spaceAfter=10, fontName='Helvetica', leading=16))
        
        story = []
        
        # Header
        story.append(Paragraph("Blissey EQ Assessment Report", styles['MainTitle']))
        story.append(Paragraph(f"<b>Name:</b> {assessment.name}", styles['NormalText']))
        story.append(Paragraph(f"<b>Profession:</b> {assessment.profession}", styles['NormalText']))
        story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", styles['NormalText']))
        
        story.append(Spacer(1, 20))
        
        # Score
        story.append(Paragraph(f"<b>Overall EQ Score:</b> {result.overall_eq_score} / 100", styles['SubHeader']))
        story.append(Paragraph(f"<b>Level:</b> {assessment.eq_level.replace('_', ' ').title()}", styles['NormalText']))
        
        # Summary
        story.append(Paragraph("AI Analysis Summary", styles['SubHeader']))
        
        # Split by paragraphs (newlines) instead of sentences, and let ReportLab handle word wrapping
        for paragraph in result.feedback_text.split('\n'):
            if paragraph.strip():
                story.append(Paragraph(paragraph.strip(), styles['NormalText']))
        
        doc.build(story)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"EQ_Report_{assessment.name.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
        
    except Exception as e:
        return Response(
            {"error": f"PDF Generation failed: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_history(request):
    """List past assessments."""
    assessments = UserAssessment.objects.all().order_by("-created_at")
    serializer = UserAssessmentSerializer(assessments, many=True)
    return Response(serializer.data)

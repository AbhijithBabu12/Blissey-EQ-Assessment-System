"""
Question Generator — Dynamically creates contextual EQ questions.
"""
import random
from .constants import SCENARIO_DIMENSION_MAP, EQ_DIMENSIONS


# Question banks mapped to EQ dimensions.
# These questions are designed to elicit responses that models can analyze for emotion/sentiment.
QUESTION_BANK = {
    "self_awareness": [
        "What emotions are you feeling immediately after the situation described above occurs?",
        "How might your personal biases or stress levels be influencing your reaction to this specific scenario?",
        "What is your biggest fear or concern about how this situation might unfold?",
    ],
    "self_regulation": [
        "How do you manage your immediate emotional reaction before responding to this scenario?",
        "What steps do you take to ensure you don't act impulsively given these circumstances?",
        "Describe how you maintain your composure and professionalism during this exact situation.",
    ],
    "empathy": [
        "How do you think the other parties involved are feeling right now, and why?",
        "What underlying pressures might be driving the behavior of the others in this scenario?",
        "How would you demonstrate to them that you understand their perspective?",
    ],
    "social_skills": [
        "How do you communicate your concerns without damaging the professional dynamics?",
        "What specific words would you use to initiate a productive conversation regarding this situation?",
        "How do you rally everyone involved to move past this obstacle effectively?",
    ],
    "motivation": [
        "How do you stay focused on your end goals despite this major obstacle?",
        "What drives you to resolve this situation professionally instead of walking away?",
        "How do you reframe this scenario as a learning opportunity for yourself?",
    ],
    "stress_management": [
        "Given the stakes of this situation, what is your immediate strategy to reduce your own anxiety?",
        "How do you prioritize your next steps when everything in this scenario feels urgent?",
        "What coping mechanisms do you rely on right now to handle the pressure?",
    ],
    "conflict_resolution": [
        "What is your strategy for finding a compromise or solution that satisfies all parties involved?",
        "How do you de-escalate the tension in this situation before it worsens?",
        "What would you do if the other parties outright refuse your proposed solution?",
    ],
    "adaptability": [
        "Your original expectations are disrupted. How do you pivot your strategy in the moment?",
        "How do you adjust your mindset to accept this new reality described in the scenario?",
        "What is your immediate 'Plan B' for this specific situation?",
    ],
    "resilience": [
        "How do you bounce back from this setback and regain your confidence?",
        "What specific lesson will you take away from this situation to prevent it from happening again?",
        "How do you prevent this issue from negatively affecting your future performance?",
    ],
}


def generate_questions(scenario_type: str) -> list[dict]:
    """
    Generates a set of 5 questions based on the scenario type.
    Ensures primary dimensions for the scenario are targeted.
    Returns: list of dicts {"eq_dimension": str, "question_text": str, "order": int}
    """
    # Get the primary dimensions this scenario tests (from constants.py)
    # Default to a generic mix if not found.
    primary_dims = SCENARIO_DIMENSION_MAP.get(
        scenario_type, 
        ["self_awareness", "self_regulation", "empathy"]
    )
    
    selected_questions = []
    selected_dims = set()
    order = 1
    
    # 1. First, grab one question for each primary dimension
    for dim in primary_dims:
        if dim in QUESTION_BANK:
            q_text = random.choice(QUESTION_BANK[dim])
            selected_questions.append({
                "eq_dimension": dim,
                "question_text": q_text,
                "order": order
            })
            selected_dims.add(dim)
            order += 1
            
    # 2. Fill the rest up to 5 questions using random OTHER dimensions
    # We want a holistic assessment, so we bring in untargeted dimensions
    remaining_dims = [d for d in EQ_DIMENSIONS if d not in selected_dims]
    random.shuffle(remaining_dims)
    
    while order <= 5 and remaining_dims:
        dim = remaining_dims.pop()
        if dim in QUESTION_BANK:
            q_text = random.choice(QUESTION_BANK[dim])
            selected_questions.append({
                "eq_dimension": dim,
                "question_text": q_text,
                "order": order
            })
            order += 1
            
    return selected_questions

"""
Transformer-based NLP Pipeline for Emotion and Sentiment Analysis.
"""
from transformers import pipeline
import re
from .constants import EMOTION_MODEL, SENTIMENT_MODEL

# We use lazy loading for the pipelines so they don't block Django server startup.
# They will be loaded into memory the first time analyze_text is called.
_emotion_pipeline = None
_sentiment_pipeline = None


def get_emotion_pipeline():
    global _emotion_pipeline
    if _emotion_pipeline is None:
        print(f"Loading Emotion Model: {EMOTION_MODEL}...")
        _emotion_pipeline = pipeline("text-classification", model=EMOTION_MODEL, top_k=None)
    return _emotion_pipeline


def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        print(f"Loading Sentiment Model: {SENTIMENT_MODEL}...")
        _sentiment_pipeline = pipeline("sentiment-analysis", model=SENTIMENT_MODEL)
    return _sentiment_pipeline


def calculate_semantic_richness(text: str) -> float:
    """
    A simple heuristic for semantic richness.
    Returns a score between 0.0 and 1.0 based on vocabulary variety and sentence structure.
    """
    words = re.findall(r'\b\w+\b', text.lower())
    if not words:
        return 0.0
        
    unique_words = set(words)
    lexical_diversity = len(unique_words) / len(words)
    
    # Cap length bonus at ~100 words
    length_bonus = min(len(words) / 100.0, 1.0)
    
    # Weight diversity higher than pure length
    richness = (lexical_diversity * 0.6) + (length_bonus * 0.4)
    return min(richness, 1.0)


def analyze_text(text: str) -> dict:
    """
    Passes the user's text response through Hugging Face transformer models.
    
    Returns:
    {
        "emotion_detected": str,        # Primary emotion
        "emotion_scores": dict,         # All emotion probabilities
        "sentiment_label": str,         # POSITIVE or NEGATIVE
        "sentiment_score": float,       # Confidence score (0-1)
        "emotional_intensity": float,   # Calculated intensity metric
        "semantic_richness": float      # Lexical diversity metric
    }
    """
    # 1. Emotion Analysis
    emo_pipe = get_emotion_pipeline()
    # top_k=None returns a list of dictionaries with all labels and scores
    emo_results = emo_pipe(text)[0] 
    
    emotion_scores = {item['label']: item['score'] for item in emo_results}
    
    # The primary emotion is the one with the highest score
    primary_emotion = max(emotion_scores, key=emotion_scores.get)
    primary_emotion_score = emotion_scores[primary_emotion]
    
    # 2. Sentiment Analysis
    sent_pipe = get_sentiment_pipeline()
    sent_results = sent_pipe(text)[0]
    
    sentiment_label = sent_results['label']
    sentiment_score = sent_results['score']
    
    # 3. Emotional Intensity Calculation
    # If a user is highly confident in an emotion (especially a strong one like anger/joy), intensity is high.
    # Neutral lowers intensity.
    intensity = primary_emotion_score
    if primary_emotion == "neutral":
        intensity = 1.0 - primary_emotion_score  # High confidence in neutral = low intensity
    
    # Combine with sentiment confidence
    emotional_intensity = (intensity * 0.7) + (sentiment_score * 0.3)
    
    # 4. Semantic Richness
    richness = calculate_semantic_richness(text)
    
    return {
        "emotion_detected": primary_emotion,
        "emotion_scores": emotion_scores,
        "sentiment_label": sentiment_label,
        "sentiment_score": sentiment_score,
        "emotional_intensity": min(emotional_intensity, 1.0),
        "semantic_richness": richness
    }

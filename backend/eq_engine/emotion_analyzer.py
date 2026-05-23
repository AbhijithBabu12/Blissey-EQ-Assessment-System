"""
HuggingFace Inference API Pipeline for Emotion and Sentiment Analysis.

Uses the free HuggingFace Inference API to run the exact same transformer models
without requiring a local PyTorch installation — making it compatible with free-tier hosting.
"""
import os
import re
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from .constants import EMOTION_MODEL, SENTIMENT_MODEL

HF_API_URL = "https://api-inference.huggingface.co/models/"
HF_TOKEN = os.environ.get("HF_TOKEN", "")

HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

def _query_hf_api(model_id: str, text: str, parameters: dict = None, retries: int = 5) -> list:
    """
    Send text to HuggingFace Inference API and return model output.
    Automatically retries on 503 (loading) or ConnectionError (DNS issues on free tiers).
    """
    url = f"{HF_API_URL}{model_id}"
    payload = {"inputs": text}
    if parameters:
        payload["parameters"] = parameters

    for attempt in range(retries):
        try:
            response = requests.post(url, headers=HEADERS, json=payload, timeout=120)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 503:
                # Model is loading on HF servers — wait and retry
                body = response.json()
                wait_time = body.get("estimated_time", 20)
                print(f"[HF API] Model '{model_id}' is loading, waiting {wait_time:.0f}s (attempt {attempt + 1}/{retries})...")
                time.sleep(min(wait_time, 15))
            else:
                print(f"[HF API] Error {response.status_code}: {response.text}")
                response.raise_for_status()
        except requests.exceptions.RequestException as e:
            # Catches Timeout, ConnectionError, DNS Resolution Errors, etc.
            print(f"[HF API] Network error for '{model_id}' (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(2)  # Wait 2 seconds before retrying
            else:
                raise Exception(f"HuggingFace API failed after {retries} retries: {str(e)}")

    raise Exception(f"HuggingFace Inference API failed after {retries} retries for model '{model_id}'")


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
    Passes the user's text response through HuggingFace Inference API.
    Uses ThreadPoolExecutor to run both API calls concurrently to save time.
    """
    # Run both Emotion and Sentiment analysis in parallel
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_emo = executor.submit(_query_hf_api, EMOTION_MODEL, text, {"top_k": None})
        future_sent = executor.submit(_query_hf_api, SENTIMENT_MODEL, text)
        
        emo_results = future_emo.result()
        sent_results = future_sent.result()
    
    # Parse Emotion Results
    if isinstance(emo_results, list) and len(emo_results) > 0:
        if isinstance(emo_results[0], list):
            emo_results = emo_results[0]
    
    emotion_scores = {item['label']: item['score'] for item in emo_results}
    primary_emotion = max(emotion_scores, key=emotion_scores.get)
    primary_emotion_score = emotion_scores[primary_emotion]
    
    # Parse Sentiment Results
    if isinstance(sent_results, list) and len(sent_results) > 0:
        if isinstance(sent_results[0], list):
            sent_results = sent_results[0]
            
    sentiment_label = sent_results[0]['label']
    sentiment_score = sent_results[0]['score']
    
    # Calculate Emotional Intensity
    intensity = primary_emotion_score
    if primary_emotion == "neutral":
        intensity = 1.0 - primary_emotion_score
        
    emotional_intensity = (intensity * 0.7) + (sentiment_score * 0.3)
    
    # Calculate Semantic Richness
    richness = calculate_semantic_richness(text)
    
    return {
        "emotion_detected": primary_emotion,
        "emotion_scores": emotion_scores,
        "sentiment_label": sentiment_label,
        "sentiment_score": sentiment_score,
        "emotional_intensity": min(emotional_intensity, 1.0),
        "semantic_richness": richness
    }

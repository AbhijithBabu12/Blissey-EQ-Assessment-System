"""
Scenario Generator — Dynamically creates profession-aware emotional scenarios.
"""
import random
from .constants import PROFESSION_GROUPS, SCENARIO_TYPES


# A database of parameterized scenario templates.
# Each profession group has specific templates for each scenario type.
SCENARIO_TEMPLATES = {
    "technical": {
        "workplace_conflict": "You and a senior developer are clashing over the architecture of a new microservice. They want to use a legacy framework they are comfortable with, but you strongly believe a modern stack is required for scalability. They just dismissed your proposal in front of the entire team.",
        "high_pressure_decision": "It's 2 AM on a Friday. A critical production database just went down during a routine migration you were leading. Your manager is calling you, and clients are starting to complain on social media.",
        "team_failure": "Your engineering team missed a major release deadline by three weeks. During the post-mortem, the product manager blames your team's lack of velocity. You know the delay was caused by shifting requirements from the product team.",
        "ethical_dilemma": "You discover a major security vulnerability in the code your team just pushed to production. Fixing it will require taking the platform offline for 4 hours during peak traffic. Your manager tells you to ignore it until the weekend.",
        "criticism_handling": "During your performance review, your tech lead tells you that while your code is brilliant, you are 'difficult to work with' and 'intimidating to junior developers'.",
        "unexpected_failure": "You spent 3 months building an intricate machine learning pipeline. When it finally deploys, it completely fails to scale and crashes the server. The project might be scrapped.",
    },
    "medical": {
        "workplace_conflict": "You and the attending physician disagree on a patient's treatment plan. You noticed a subtle symptom they missed, but when you point it out, they tell you to 'stay in your lane'.",
        "high_pressure_decision": "You are in the ER and multiple critical trauma patients arrive simultaneously. You have to triage who gets immediate life-saving surgery and who has to wait, knowing the wait could be fatal.",
        "team_failure": "A miscommunication between shifts resulted in a patient receiving the wrong medication dosage. The patient is stable, but the family is furious and threatening legal action.",
    },
    "management": {
        "workplace_conflict": "Two of your top performers refuse to work together due to a personal dispute. It is starting to drag down the morale of the entire department, and an important deadline is approaching.",
        "team_failure": "Your department missed its quarterly KPIs by a wide margin. The CEO demands an explanation at the upcoming board meeting and implies your leadership is the problem.",
        "criticism_handling": "An anonymous employee feedback survey results in harsh comments about your management style, calling you a 'micromanager' who 'doesn't trust the team'.",
    },
    "education": {
        "workplace_conflict": "A parent aggressively confronts you in the hallway, accusing you of treating their child unfairly and threatening to go to the school board.",
        "high_pressure_decision": "You suspect a student is facing abuse at home, but you lack concrete proof. Reporting it could severely disrupt their life, but ignoring it could put them in danger.",
    },
    "creative": {
        "criticism_handling": "You spent weeks pouring your soul into a design project. The client reviews it and completely tears it apart, calling it 'amateurish' and 'completely off-brand'.",
        "workplace_conflict": "An agency partner takes full credit for a campaign concept that you originally pitched and developed.",
    },
    "general": {
        "workplace_conflict": "A coworker has been consistently passing off their work to you, claiming they are 'overwhelmed'. Today, they took credit for a report you wrote.",
        "social_rejection": "You discover that your entire department organized a weekend retreat and you were the only person intentionally excluded from the invite list.",
        "unexpected_failure": "You prepared for 6 months for a certification exam that is crucial for your career advancement. You just received your results, and you failed.",
        "emotional_loss": "You are dealing with a severe personal loss, but you have a mandatory presentation today that could determine whether your team gets funding for the next year.",
        "communication_breakdown": "A sarcastic email you sent to a peer was accidentally forwarded to the entire department, offending several people.",
    }
}


def map_profession_to_group(profession: str) -> str:
    """
    Takes a free-text profession and maps it to a standard PROFESSION_GROUP.
    """
    if not profession:
        return "general"
        
    profession_lower = profession.lower().strip()
    
    for group, titles in PROFESSION_GROUPS.items():
        if profession_lower in titles:
            return group
            
        # Partial matching (e.g. "software dev" matches "software engineer")
        for title in titles:
            # Check if any significant word matches
            title_words = set(title.split())
            prof_words = set(profession_lower.split())
            if len(title_words.intersection(prof_words)) > 0:
                return group
                
    return "general"


def generate_scenario(profession: str, age: int) -> dict:
    """
    Generates a personalized scenario based on profession and age.
    Returns a dict with scenario_text, scenario_type, profession_group, difficulty.
    """
    group = map_profession_to_group(profession)
    
    # Get available templates for this group. Fallback to general if group lacks templates.
    available_templates = SCENARIO_TEMPLATES.get(group, SCENARIO_TEMPLATES["general"])
    
    # Pick a random scenario type from the available ones
    scenario_type = random.choice(list(available_templates.keys()))
    scenario_text = available_templates[scenario_type]
    
    # Adjust difficulty context loosely based on age
    difficulty = "medium"
    if age < 25:
        # Younger professionals might find conflict handling harder
        if scenario_type in ["workplace_conflict", "criticism_handling"]:
            difficulty = "hard"
    elif age > 40:
        # Older professionals might face higher stakes
        if scenario_type in ["leadership_pressure", "team_failure"]:
            difficulty = "hard"
            
    return {
        "scenario_text": scenario_text,
        "scenario_type": scenario_type,
        "profession_group": group,
        "difficulty": difficulty
    }

# 🧠 Advanced EQ Assessment System — System Design

> AI-powered psychological emotional intelligence evaluation platform using
> transformer-based NLP and adaptive scenario reasoning.

---

## 1. Complete User Flow

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE                         │
│  ─ Project intro & description                         │
│  ─ "Start Assessment" CTA                              │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│               USER DETAILS FORM                         │
│  ─ Name                                                 │
│  ─ Age                                                  │
│  ─ Gender (Male / Female / Non-binary / Prefer not)     │
│  ─ Profession (free text + autocomplete from groups)    │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           AI SCENARIO GENERATION                        │
│  ─ Backend receives user profile                        │
│  ─ Maps profession → profession group                   │
│  ─ Selects scenario type based on profession + age      │
│  ─ Generates realistic emotional scenario               │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│         INTERACTIVE ASSESSMENT PAGE                     │
│  ─ Scenario displayed at top                            │
│  ─ 5-7 adaptive EQ questions shown                     │
│  ─ Each question maps to an EQ dimension                │
│  ─ User types free-text responses                       │
│  ─ Optional: voice input via Web Speech API             │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           RESPONSE VALIDATION                           │
│  ─ Check minimum response length (≥ 20 chars)           │
│  ─ Detect spam / gibberish                              │
│  ─ Verify emotional coherence                           │
│  ─ Reject with feedback if invalid                      │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│         AI ANALYSIS LOADING SCREEN                      │
│  ─ Animated typing: "Analyzing emotional patterns..."   │
│  ─ Progress indicators per analysis stage               │
│  ─ ~3-5 second artificial delay for UX                  │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           NLP ANALYSIS PIPELINE                         │
│  ─ Emotion detection (distilroberta)                    │
│  ─ Sentiment analysis (distilbert)                      │
│  ─ Emotional intensity scoring                          │
│  ─ Semantic richness evaluation                         │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           EQ SCORING ENGINE                             │
│  ─ Map NLP outputs → EQ dimension scores                │
│  ─ Apply positive/negative behavioral indicators        │
│  ─ Weight by question-dimension mapping                 │
│  ─ Normalize scores (0-100 per dimension)               │
│  ─ Calculate overall EQ score                           │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           AI FEEDBACK GENERATION                        │
│  ─ Identify top 3 strengths                             │
│  ─ Identify top 3 improvement areas                     │
│  ─ Generate personalized recommendations                │
│  ─ Interpret overall EQ level                           │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           RESULTS DASHBOARD                             │
│  ─ Overall EQ score (large animated number)             │
│  ─ Radar chart (all 9 dimensions)                       │
│  ─ Bar chart (dimension scores)                         │
│  ─ Emotion pie chart (detected emotions)                │
│  ─ Per-question emotion breakdown                       │
│  ─ AI-generated feedback section                        │
│  ─ Strengths / Weaknesses cards                         │
│  ─ "Download PDF Report" button                         │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│           PDF REPORT                                    │
│  ─ User profile summary                                 │
│  ─ Scenario presented                                   │
│  ─ All scores + charts                                  │
│  ─ AI insights + recommendations                        │
│  ─ Downloadable as professional PDF                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. EQ Dimensions

These are the 9 psychological categories the AI evaluates.

| # | Dimension            | Description                                                  |
|---|----------------------|--------------------------------------------------------------|
| 1 | Self-Awareness       | Recognizing own emotions and their impact on behavior        |
| 2 | Self-Regulation      | Managing disruptive emotions and impulses                    |
| 3 | Empathy              | Understanding and sharing the feelings of others             |
| 4 | Social Skills        | Managing relationships and building networks                 |
| 5 | Motivation           | Inner drive to achieve beyond external rewards               |
| 6 | Stress Management    | Coping effectively under pressure                            |
| 7 | Conflict Resolution  | Navigating disagreements constructively                      |
| 8 | Adaptability         | Flexibility in handling change                               |
| 9 | Resilience           | Bouncing back from setbacks and adversity                    |

```python
EQ_DIMENSIONS = [
    "self_awareness",
    "self_regulation",
    "empathy",
    "social_skills",
    "motivation",
    "stress_management",
    "conflict_resolution",
    "adaptability",
    "resilience",
]
```

### Scoring Indicators

**Positive Indicators** (increase dimension scores):

| Indicator in Response        | Affects Dimension      |
|------------------------------|------------------------|
| Acknowledges own feelings    | Self-Awareness         |
| Calm / measured language     | Self-Regulation        |
| Perspective-taking           | Empathy                |
| Collaborative tone           | Social Skills          |
| Goal-oriented thinking       | Motivation             |
| Coping strategies mentioned  | Stress Management      |
| Seeks resolution / compromise| Conflict Resolution    |
| Open to change               | Adaptability           |
| Mentions learning from failure| Resilience            |

**Negative Indicators** (decrease dimension scores):

| Indicator in Response        | Affects Dimension      |
|------------------------------|------------------------|
| Unaware of emotional state   | Self-Awareness         |
| Aggressive / impulsive tone  | Self-Regulation        |
| Blames others                | Empathy                |
| Isolated / dismissive        | Social Skills          |
| Apathetic / defeatist        | Motivation             |
| Panic / overwhelmed language | Stress Management      |
| Avoids conflict entirely     | Conflict Resolution    |
| Rigid / resistant to change  | Adaptability           |
| Gives up easily              | Resilience             |

---

## 3. Scenario Types

10 categories of emotional situations the system can generate.

| # | Scenario Type             | Example Context                                        |
|---|---------------------------|--------------------------------------------------------|
| 1 | Workplace Conflict        | Disagreement with a colleague over project direction   |
| 2 | Ethical Dilemma           | Pressure to cut corners vs. doing the right thing      |
| 3 | Leadership Pressure       | Making a tough decision that affects the whole team     |
| 4 | Team Failure              | Project fails and you're responsible for team morale   |
| 5 | Criticism Handling        | Receiving harsh but valid feedback from a superior     |
| 6 | Emotional Loss            | Dealing with personal loss while maintaining work      |
| 7 | High-Pressure Decision    | Critical deadline with insufficient resources          |
| 8 | Communication Breakdown   | Miscommunication leading to a serious error            |
| 9 | Social Rejection          | Being excluded from an important meeting or group      |
| 10| Unexpected Failure        | A major plan or initiative completely falls apart      |

```python
SCENARIO_TYPES = [
    "workplace_conflict",
    "ethical_dilemma",
    "leadership_pressure",
    "team_failure",
    "criticism_handling",
    "emotional_loss",
    "high_pressure_decision",
    "communication_breakdown",
    "social_rejection",
    "unexpected_failure",
]
```

### Scenario-to-Dimension Mapping

Each scenario type primarily tests certain EQ dimensions:

| Scenario Type             | Primary Dimensions Tested                          |
|---------------------------|-----------------------------------------------------|
| Workplace Conflict        | Conflict Resolution, Social Skills, Self-Regulation |
| Ethical Dilemma           | Self-Awareness, Motivation, Resilience              |
| Leadership Pressure       | Stress Management, Social Skills, Motivation        |
| Team Failure              | Resilience, Empathy, Adaptability                   |
| Criticism Handling        | Self-Awareness, Self-Regulation, Resilience         |
| Emotional Loss            | Resilience, Stress Management, Self-Awareness       |
| High-Pressure Decision    | Stress Management, Adaptability, Motivation         |
| Communication Breakdown   | Social Skills, Empathy, Conflict Resolution         |
| Social Rejection          | Resilience, Self-Awareness, Adaptability            |
| Unexpected Failure        | Resilience, Adaptability, Stress Management         |

---

## 4. Profession Groups

How the AI adapts scenarios to the user's profession.

```python
PROFESSION_GROUPS = {
    "technical": [
        "software engineer",
        "data scientist",
        "cybersecurity analyst",
        "devops engineer",
        "ml engineer",
        "web developer",
        "system administrator",
    ],

    "medical": [
        "doctor",
        "nurse",
        "therapist",
        "pharmacist",
        "paramedic",
        "psychologist",
    ],

    "education": [
        "teacher",
        "professor",
        "trainer",
        "academic researcher",
        "teaching assistant",
    ],

    "management": [
        "manager",
        "team lead",
        "hr",
        "project manager",
        "ceo",
        "cto",
        "product manager",
    ],

    "creative": [
        "designer",
        "writer",
        "artist",
        "musician",
        "content creator",
        "photographer",
    ],

    "general": [
        "student",
        "freelancer",
        "unemployed",
        "intern",
        "entrepreneur",
        "other",
    ],
}
```

### Profession → Scenario Adaptation Logic

- **Technical**: Scenarios emphasize code review conflicts, deadline pressure, debugging failures
- **Medical**: Scenarios emphasize patient care dilemmas, life-death decisions, emotional burnout
- **Education**: Scenarios emphasize student conflicts, parent interactions, curriculum pressure
- **Management**: Scenarios emphasize team dynamics, layoff decisions, performance reviews
- **Creative**: Scenarios emphasize rejection of work, creative blocks, client disagreements
- **General**: Scenarios use universal workplace/life situations

---

## 5. Emotion Labels

Emotions detected by the NLP pipeline from user responses.

```python
EMOTIONS = [
    "anger",
    "disgust",
    "fear",
    "joy",
    "neutral",
    "sadness",
    "surprise",
]
```

These map to the output labels of `j-hartmann/emotion-english-distilroberta-base`.

### Sentiment Labels

```python
SENTIMENTS = [
    "POSITIVE",
    "NEGATIVE",
]
```

From `distilbert-base-uncased-finetuned-sst-2-english`.

---

## 6. Database Schema

### Table: `UserAssessment`

| Column           | Type         | Description                         |
|------------------|--------------|-------------------------------------|
| id               | UUID (PK)    | Unique assessment ID                |
| name             | CharField    | User's name                         |
| age              | IntegerField | User's age                          |
| gender           | CharField    | User's gender                       |
| profession       | CharField    | User's profession (free text)       |
| profession_group | CharField    | Mapped profession group             |
| overall_eq_score | FloatField   | Final overall EQ score (0-100)      |
| eq_level         | CharField    | Interpretation (Low/Average/High)   |
| created_at       | DateTimeField| When the assessment was taken       |

### Table: `Scenario`

| Column           | Type         | Description                         |
|------------------|--------------|-------------------------------------|
| id               | UUID (PK)    | Unique scenario ID                  |
| assessment       | ForeignKey   | → UserAssessment                    |
| scenario_text    | TextField    | The generated scenario content      |
| scenario_type    | CharField    | From SCENARIO_TYPES                 |
| profession_group | CharField    | Target profession group             |
| difficulty       | CharField    | easy / medium / hard                |

### Table: `Question`

| Column           | Type         | Description                         |
|------------------|--------------|-------------------------------------|
| id               | UUID (PK)    | Unique question ID                  |
| scenario         | ForeignKey   | → Scenario                          |
| question_text    | TextField    | The generated question              |
| eq_dimension     | CharField    | Which EQ dimension it tests         |
| order            | IntegerField | Display order (1-7)                 |

### Table: `Response`

| Column              | Type         | Description                      |
|----------------------|--------------|----------------------------------|
| id                   | UUID (PK)    | Unique response ID               |
| question             | ForeignKey   | → Question                       |
| assessment           | ForeignKey   | → UserAssessment                 |
| user_answer          | TextField    | User's text response             |
| emotion_detected     | CharField    | Primary emotion label            |
| emotion_scores       | JSONField    | All emotion probabilities        |
| sentiment_label      | CharField    | POSITIVE / NEGATIVE              |
| sentiment_score      | FloatField   | Confidence (0-1)                 |
| emotional_intensity  | FloatField   | How strong the emotion is (0-1)  |
| is_valid             | BooleanField | Passed validation?               |

### Table: `Result`

| Column                  | Type         | Description                   |
|--------------------------|--------------|-------------------------------|
| id                       | UUID (PK)    | Unique result ID              |
| assessment               | ForeignKey   | → UserAssessment              |
| self_awareness_score     | FloatField   | Score (0-100)                 |
| self_regulation_score    | FloatField   | Score (0-100)                 |
| empathy_score            | FloatField   | Score (0-100)                 |
| social_skills_score      | FloatField   | Score (0-100)                 |
| motivation_score         | FloatField   | Score (0-100)                 |
| stress_management_score  | FloatField   | Score (0-100)                 |
| conflict_resolution_score| FloatField   | Score (0-100)                 |
| adaptability_score       | FloatField   | Score (0-100)                 |
| resilience_score         | FloatField   | Score (0-100)                 |
| overall_eq_score         | FloatField   | Aggregated score (0-100)      |
| strengths                | JSONField    | Top 3 strengths               |
| weaknesses               | JSONField    | Top 3 improvement areas       |
| recommendations          | JSONField    | AI-generated suggestions      |
| feedback_text            | TextField    | Overall feedback paragraph     |

### ER Diagram

```
UserAssessment (1) ──── (1) Scenario
                 │              │
                 │         (1:many)
                 │              │
                 │         Question (many)
                 │              │
                 (1:many)  (1:1)
                 │              │
                 Response (many)─┘
                 │
                 (1:1)
                 │
                 Result (1)
```

---

## 7. Folder Structure

### Frontend (`frontend/`)

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                  # Images, fonts, icons
│   ├── components/
│   │   ├── ui/                  # Reusable UI (Button, Card, Input, etc.)
│   │   ├── charts/              # RadarChart, BarChart, PieChart
│   │   └── layout/              # Navbar, Footer, PageWrapper
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── AssessmentPage.jsx
│   │   ├── LoadingPage.jsx
│   │   ├── ResultsPage.jsx
│   │   └── ReportPage.jsx
│   ├── services/
│   │   └── api.js               # Axios calls to Django backend
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React context (assessment state)
│   ├── utils/                   # Helpers, constants
│   ├── animations/              # Framer Motion configs
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Tailwind base + custom styles
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

### Backend (`backend/`)

```
backend/
├── config/                      # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── assessment/                  # Main Django app
│   ├── __init__.py
│   ├── models.py                # DB models
│   ├── serializers.py           # DRF serializers
│   ├── views.py                 # API views
│   ├── urls.py                  # App URL routes
│   └── admin.py                 # Admin panel config
├── eq_engine/                   # Core AI/EQ logic (NOT a Django app)
│   ├── __init__.py
│   ├── constants.py             # EQ_DIMENSIONS, SCENARIO_TYPES, etc.
│   ├── scenario_generator.py    # Profession-aware scenario creation
│   ├── question_generator.py    # Dynamic EQ question creation
│   ├── validators.py            # Response validation logic
│   ├── emotion_analyzer.py      # Transformer-based NLP pipeline
│   ├── eq_scoring.py            # Weighted EQ score calculation
│   └── feedback_generator.py    # AI insights + recommendations
├── manage.py
├── requirements.txt
└── .env
```

---

## 8. API Endpoints

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| POST   | `/api/assessment/start/`      | Submit user details, get scenario  |
| GET    | `/api/assessment/{id}/questions/` | Get questions for assessment   |
| POST   | `/api/assessment/{id}/submit/`| Submit all responses               |
| GET    | `/api/assessment/{id}/results/`| Get scores, feedback, charts data |
| GET    | `/api/assessment/{id}/report/`| Download PDF report                |
| GET    | `/api/assessments/history/`   | List past assessments              |

---

## 9. NLP Pipeline Architecture

```
User Response (text)
       │
       ├──→ Emotion Detection Model
       │    (j-hartmann/emotion-english-distilroberta-base)
       │    Output: {anger: 0.05, joy: 0.72, ...}
       │
       ├──→ Sentiment Analysis Model
       │    (distilbert-base-uncased-finetuned-sst-2-english)
       │    Output: {label: "POSITIVE", score: 0.94}
       │
       ├──→ Emotional Intensity Calculator
       │    Output: intensity_score (0.0 - 1.0)
       │
       └──→ Semantic Richness Evaluator
            Output: richness_score (word variety, depth)
                    │
                    ▼
            Combined NLP Features
            {emotion, sentiment, intensity, richness}
                    │
                    ▼
            EQ Scoring Engine
                    │
                    ▼
            Per-dimension scores + Overall EQ
```

---

## 10. Score Interpretation

| Overall EQ Score | Level           | Description                              |
|------------------|-----------------|------------------------------------------|
| 0 – 30           | Low EQ          | Significant room for emotional growth    |
| 31 – 50          | Below Average   | Some emotional awareness, needs work     |
| 51 – 70          | Average EQ      | Decent emotional intelligence            |
| 71 – 85          | Above Average   | Strong emotional awareness and skills    |
| 86 – 100         | Exceptional EQ  | Outstanding emotional intelligence       |

---

## 11. Tech Stack Summary

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | React 19 (Vite) + TailwindCSS + Framer Motion       |
| Routing      | React Router v7                                      |
| Charts       | Chart.js + react-chartjs-2                           |
| HTTP Client  | Axios                                                |
| Backend      | Django 5.x + Django REST Framework                   |
| NLP Models   | Hugging Face Transformers (PyTorch)                  |
| Database     | SQLite (dev) → PostgreSQL (prod)                     |
| PDF Reports  | WeasyPrint or jsPDF                                  |
| Deployment   | Vercel (frontend) + Render (backend)                 |

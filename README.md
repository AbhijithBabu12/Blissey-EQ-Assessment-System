# Blissey: AI-Powered Emotional Intelligence Assessment

Blissey is a modern, dynamic web application that evaluates a user's Emotional Intelligence (EQ) through personalized, profession-specific scenarios and advanced Natural Language Processing (NLP).

## 🌟 How It Works

1. **Personalization**: You enter your basic information (Name, Age, Profession).
2. **Dynamic Scenario Generation**: The backend uses a parameterized template engine to generate a realistic, high-stress scenario specifically tailored to your profession group.
3. **Assessment**: You are presented with 9 scenario-agnostic questions. Each question targets one of 9 specific EQ dimensions (e.g., Empathy, Resilience, Self-Regulation).
4. **NLP Analysis**: Your written answers are sent to the backend where two pre-trained HuggingFace Transformer models analyze the raw text:
   - **Emotion Model**: Detects core emotions (Joy, Anger, Fear, Sadness, etc.).
   - **Sentiment Model**: Evaluates if the tone is positive, negative, or neutral.
5. **Scoring Engine**: The system calculates a "Semantic Richness" score based on the length, depth, and vocabulary of your answer. This richness score acts as a multiplier against the NLP emotion scores to generate a final score out of 100 for each dimension.
6. **Results & Feedback**: The app displays your overall EQ score, visualizes your dimensional profile using Radar and Bar charts, and generates a personalized feedback report highlighting your strengths and growth areas.
7. **PDF Export**: You can download a clean, professionally formatted PDF of your results.

---

## 🏗️ Architecture & File Structure

### Backend (Django REST Framework)
Located in `backend/`, the backend handles the heavy lifting of NLP analysis, database management, and API endpoints.

**Core Files (`backend/eq_engine/`):**
- `constants.py`: Defines the 9 EQ dimensions, validation rules, and the specific HuggingFace model IDs used for NLP.
- `emotion_analyzer.py`: Initializes and runs the HuggingFace text-classification pipelines to extract raw emotion and sentiment scores from user text.
- `eq_scoring.py`: Contains the complex math logic. It combines the NLP scores with a "Semantic Richness" calculator to produce the final 0-100 scores.
- `feedback_generator.py`: Takes the final scores, identifies top strengths and weaknesses, and selects actionable recommendations from a predefined logic bank.
- `question_generator.py`: Holds the static, scenario-agnostic question bank mapped to the 9 EQ dimensions.
- `scenario_generator.py`: Maps the user's profession to predefined, highly tailored situational templates without relying on external APIs.

**API & Data (`backend/assessment/`):**
- `models.py`: Defines the SQLite database schemas (`UserAssessment`, `Scenario`, `Response`, `AssessmentResult`).
- `views.py`: Exposes the REST API endpoints (`/start`, `/questions`, `/submit`, `/results`, `/report`).
- `templates/report.html`: The HTML template used by `xhtml2pdf` to generate the downloadable PDF report.

### Frontend (React + Vite + TailwindCSS)
Located in `frontend/`, the frontend provides a sleek, dark-themed, glassmorphism UI with smooth Framer Motion animations.

**Core Pages (`frontend/src/pages/`):**
- `LandingPage.jsx`: The entrance. Collects user demographics to feed the scenario generator.
- `AssessmentPage.jsx`: Displays the dynamic scenario and cycles through the 9 questions with animated transitions.
- `LoadingPage.jsx`: A stylized waiting screen featuring a spinning Mew GIF while the backend NLP models process the data.
- `ResultsPage.jsx`: The final dashboard displaying the Overall Score, Radar Chart, Bar Chart, and textual feedback.

**Components (`frontend/src/components/charts/`):**
- `RadarChart.jsx` & `BarChart.jsx`: Utilizes `Chart.js` to render the interactive data visualizations.

---

## 🚀 Tech Stack

**Frontend:**
- React (Vite)
- TailwindCSS (Styling & Layout)
- Framer Motion (Micro-animations & Page Transitions)
- Chart.js / react-chartjs-2 (Data Visualization)

**Backend:**
- Python / Django
- Django REST Framework (API)
- HuggingFace `transformers` (NLP Analysis)
- PyTorch (Tensor processing)
- `xhtml2pdf` (PDF Generation)
- SQLite (Database)

## ⚙️ Running Locally

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

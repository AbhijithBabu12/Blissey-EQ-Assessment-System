import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { submitResponses } from '../services/api';

export default function AssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // State to hold user answers: { [question_id]: "answer text" }
  const [answers, setAnswers] = useState({});
  // State to hold validation errors: { [question_id]: "error message" }
  const [errors, setErrors] = useState(location.state?.validationErrors || {});
  const [globalError, setGlobalError] = useState(location.state?.globalError || '');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/api/assessment/${id}/questions/`);
        setScenario(response.data.scenario);
        setQuestions(response.data.questions);
        
        // Initialize answers state
        const initialAnswers = {};
        response.data.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setGlobalError("Failed to load assessment. It may not exist.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [id]);

  const handleAnswerChange = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGlobalError('');

    // Format for backend: [{"question_id": "...", "user_answer": "..."}, ...]
    const formattedResponses = questions.map(q => ({
      question_id: q.id,
      user_answer: answers[q.id] || ""
    }));

    // Instantly navigate to the Loading page with the responses. 
    // The Loading page will handle the actual API call!
    navigate(`/loading/${id}`, { state: { formattedResponses } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
      </div>
    );
  }

  if (globalError && !scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        <div className="glass-card p-8">{globalError}</div>
      </div>
    );
  }

  return (
    <div className="relative z-10" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header & Scenario */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-t-4 text-center"
        style={{ 
          padding: '4rem 3rem', 
          borderColor: 'var(--color-accent)', 
          marginBottom: '6rem',
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(17, 17, 17, 0.8) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex flex-col items-center justify-center mb-8 gap-3">
          <h2 className="text-sm md:text-base uppercase tracking-widest font-bold" style={{ color: 'var(--color-accent)', letterSpacing: '0.2em' }}>
            Generated Scenario
          </h2>
          <div style={{ height: '2px', width: '40px', backgroundColor: 'var(--color-accent)', opacity: 0.5, margin: '0.5rem 0' }}></div>
        </div>
        <p className="text-xl md:text-2xl leading-relaxed font-light text-white tracking-wide max-w-3xl mx-auto">
          "{scenario?.text}"
        </p>
      </motion.div>

      {globalError && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-10 p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-lg shadow-sm"
        >
          {globalError}
        </motion.div>
      )}

      {/* Questions List */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
        {questions.map((q, index) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-3xl border transition-colors shadow-sm"
            style={{ 
              padding: '2.5rem 2rem', 
              backgroundColor: errors[q.id] ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-bg-card)',
              borderColor: errors[q.id] ? 'rgba(239, 68, 68, 0.5)' : 'var(--color-border)',
              width: '100%',
              maxWidth: '700px',
              margin: '0 auto'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6 text-left">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
                {q.order}
              </div>
              <div className="pt-1">
                <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed" style={{ marginBottom: '1.25rem' }}>
                  {q.question_text}
                </h3>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent)', marginTop: '0.5rem', marginBottom: '2.5rem' }}>
                  Analyzing: {q.eq_dimension.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="mt-8 w-full">
              <textarea
                value={answers[q.id]}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder="Type your detailed response here... (Minimum 10 characters)"
                className="w-full resize-y transition-all text-base md:text-lg leading-relaxed text-left"
                style={{
                  minHeight: '140px',
                  padding: '1.5rem',
                  backgroundColor: '#000000',
                  border: '1px solid',
                  borderColor: errors[q.id] ? 'rgba(239, 68, 68, 0.5)' : 'var(--color-border)',
                  borderRadius: '16px',
                  color: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors[q.id]) e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = errors[q.id] ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px var(--color-accent-glow)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors[q.id] ? 'rgba(239, 68, 68, 0.5)' : 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              {/* Validation Error Message */}
              {errors[q.id] && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 text-sm font-medium text-red-400 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors[q.id]}
                </motion.p>
              )}
            </div>
          </motion.div>
        ))}

        <div className="flex justify-center" style={{ paddingBottom: '6rem' }}>
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full md:w-auto md:min-w-[320px]"
          >
            {submitting ? 'Analyzing Responses...' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}

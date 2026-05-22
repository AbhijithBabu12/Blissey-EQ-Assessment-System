import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import RadarChart from '../components/charts/RadarChart';
import BarChart from '../components/charts/BarChart';

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/api/assessment/${id}/results/`);
        setAssessment(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load results. They may still be processing.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !assessment || !assessment.result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="glass-card p-8 text-red-400 mb-6">{error || "Results not available."}</div>
        <button onClick={() => navigate('/')} className="btn-secondary">Return Home</button>
      </div>
    );
  }

  const { result } = assessment;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1rem' }}>
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ marginBottom: '1rem' }}>Your EQ Profile</h1>
        <p className="text-lg text-center" style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Based on the NLP analysis of your responses to the {assessment.profession_group} scenario.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Main Score & Narrative Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card flex flex-col justify-center"
          style={{ flex: '1 1 500px', padding: '2.5rem' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
            <div>
              <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-7xl font-bold text-white">{result.overall_eq_score}</span>
                <span className="text-xl" style={{ color: 'var(--color-text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Assessment Level</p>
              <span className="inline-block px-4 py-2 rounded font-semibold uppercase text-sm border" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
                {assessment.eq_level.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div style={{ height: '1px', width: '100%', backgroundColor: 'var(--color-border)', marginBottom: '2rem' }}></div>
          
          <div>
            <h3 className="text-xl font-medium text-white" style={{ marginBottom: '1rem' }}>AI Analysis Summary</h3>
            <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {result.feedback_text}
            </p>
          </div>
        </motion.div>

        {/* Visualizations Column */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col items-center justify-center"
            style={{ padding: '2rem' }}
          >
            <h3 className="text-sm uppercase tracking-widest font-semibold self-start" style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Dimension Mapping (Radar)</h3>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <RadarChart resultData={result} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card flex flex-col items-center justify-center"
            style={{ padding: '2rem' }}
          >
            <h3 className="text-sm uppercase tracking-widest font-semibold self-start" style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Score Comparison (Bar)</h3>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <BarChart data={[
                { subject: 'Self-Awareness', A: result.self_awareness_score },
                { subject: 'Self-Regulation', A: result.self_regulation_score },
                { subject: 'Empathy', A: result.empathy_score },
                { subject: 'Social Skills', A: result.social_skills_score },
                { subject: 'Motivation', A: result.motivation_score },
                { subject: 'Stress Mgmt', A: result.stress_management_score },
                { subject: 'Conflict Res', A: result.conflict_resolution_score },
                { subject: 'Adaptability', A: result.adaptability_score },
                { subject: 'Resilience', A: result.resilience_score },
              ]} />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* Strengths */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: '2rem' }}
        >
          <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-medium text-white">Core Strengths</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-1" style={{ color: 'var(--color-accent)' }}>•</span> {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ padding: '2rem' }}
        >
          <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-medium text-white">Growth Areas</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-1" style={{ color: '#ef4444' }}>•</span> {w}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: '2rem' }}
        >
          <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-medium text-white">Action Plan</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="mt-0.5 font-mono" style={{ color: '#3b82f6' }}>{i+1}.</span> {r}
              </li>
            ))}
          </ul>
        </motion.div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => {
            window.open(`http://localhost:8000/api/assessment/${id}/report/`, '_blank');
          }} 
          className="btn-primary"
        >
          Download PDF Report
        </button>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Take Another Assessment
        </button>
      </div>
    </div>
  );
}

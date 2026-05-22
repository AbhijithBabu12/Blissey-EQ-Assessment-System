import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { startAssessment } from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'prefer_not',
    profession: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send data to Django backend
      const data = await startAssessment({
        ...formData,
        age: parseInt(formData.age, 10)
      });
      
      // Navigate to assessment page with the ID
      navigate(`/assessment/${data.assessment_id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to start assessment. Please check your connection to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative">
      
      {/* Background Gradient Mesh */}
      <div className="gradient-bg"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card w-full text-center relative z-10 mx-auto my-8"
        style={{ padding: '3.5rem', maxWidth: '1000px' }}
      >
        <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img 
            src="https://media.tenor.com/6S9w6LQV48wAAAAi/mew-spinning.gif" 
            alt="Blissey Logo" 
            style={{ width: '120px', height: '120px', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))' }} 
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white" style={{ marginBottom: '0.75rem' }}>
            Blissey
          </h1>
          <h2 className="text-lg md:text-2xl font-medium tracking-tight" style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Emotional Intelligence Assessment
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Evaluate your EQ through adaptive, profession-specific scenarios analyzed by advanced NLP models.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-8 p-4 rounded-xl border text-sm"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', textAlign: 'left' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)] ml-2">
                Full Name
              </label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange} required
                placeholder="John Doe"
                className="w-full transition-all bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl text-white outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_var(--color-accent-glow)]"
                style={{ padding: '1.25rem 1.5rem' }}
              />
            </div>

            {/* Age Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="age" className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)] ml-2">
                Age
              </label>
              <input
                type="number" id="age" name="age"
                value={formData.age} onChange={handleChange} required
                min="16" max="99" placeholder="28"
                className="w-full transition-all bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl text-white outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_var(--color-accent-glow)]"
                style={{ padding: '1.25rem 1.5rem' }}
              />
            </div>

            {/* Profession Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="profession" className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)] ml-2">
                Profession / Job Title
              </label>
              <input
                type="text" id="profession" name="profession"
                value={formData.profession} onChange={handleChange} required
                placeholder="e.g. Software Engineer, Nurse"
                className="w-full transition-all bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl text-white outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_var(--color-accent-glow)]"
                style={{ padding: '1.25rem 1.5rem' }}
              />
            </div>

            {/* Gender Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="gender" className="text-xs uppercase tracking-widest font-semibold text-[var(--color-text-secondary)] ml-2">
                Gender
              </label>
              <select
                id="gender" name="gender"
                value={formData.gender} onChange={handleChange} required
                className="w-full transition-all bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl text-white outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_2px_var(--color-accent-glow)] appearance-none cursor-pointer"
                style={{ padding: '1.25rem 1.5rem' }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center" style={{ marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full md:w-auto md:min-w-[280px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 md:h-6 md:w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Scenario...
                </span>
              ) : (
                "Start Assessment"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

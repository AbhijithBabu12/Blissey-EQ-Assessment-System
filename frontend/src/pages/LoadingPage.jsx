import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoadingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    "Initializing Transformer Models...",
    "Running Emotion & Sentiment Analysis...",
    "Scanning for Behavioral Indicators...",
    "Calculating EQ Dimensions...",
    "Generating AI Feedback Profile..."
  ];

  useEffect(() => {
    // Cycle through the steps to simulate intense AI processing
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 800);

    // Redirect to results after 4 seconds
    const redirectTimer = setTimeout(() => {
      navigate(`/results/${id}`);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [id, navigate, steps.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 max-w-lg w-full flex flex-col items-center text-center"
      >
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <img 
            src="https://media.tenor.com/6S9w6LQV48wAAAAi/mew-spinning.gif" 
            alt="Analyzing" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))' }} 
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 tracking-tight">AI Analysis in Progress</h2>
        
        <div className="h-6 overflow-hidden w-full relative">
          <motion.p 
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-[var(--color-text-secondary)] text-sm absolute w-full"
          >
            {steps[step]}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

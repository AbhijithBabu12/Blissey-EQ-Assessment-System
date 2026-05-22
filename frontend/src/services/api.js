// API service — handles all communication with Django backend
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Assessment Endpoints ──────────────────────────────────

/** Start a new assessment — sends user details, receives scenario + questions */
export const startAssessment = async (userDetails) => {
  const response = await api.post('/api/assessment/start/', userDetails);
  return response.data;
};

/** Submit all responses for analysis */
export const submitResponses = async (assessmentId, responses) => {
  const response = await api.post(`/api/assessment/${assessmentId}/submit/`, { responses });
  return response.data;
};

/** Get results for a completed assessment */
export const getResults = async (assessmentId) => {
  const response = await api.get(`/api/assessment/${assessmentId}/results/`);
  return response.data;
};

/** Download PDF report */
export const downloadReport = async (assessmentId) => {
  const response = await api.get(`/api/assessment/${assessmentId}/report/`, {
    responseType: 'blob',
  });
  return response.data;
};

/** Get assessment history */
export const getHistory = async () => {
  const response = await api.get('/api/assessments/history/');
  return response.data;
};

export default api;

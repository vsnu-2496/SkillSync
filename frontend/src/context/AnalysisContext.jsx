/**
 * AnalysisContext.jsx
 * ─────────────────────────────────────────────────────────────────────
 * Single Source of Truth for the user's latest career analysis.
 *
 * Automatically fetches from GET /api/resume/latest on mount / login / refresh.
 * All pages (Dashboard, Career Recommendations, Company Explorer, Interview Prep)
 * read from this context — zero duplicate API calls.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis]     = useState(null);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState(null);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const fetchLatest = useCallback(async () => {
    if (!user) {
      setAnalysis(null);
      setHasAnalysis(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/resume/latest');
      const payload = res.data?.analysis || res.data?.data;
      if (res.data?.success && payload) {
        setAnalysis(payload);
        setHasAnalysis(true);
      } else {
        setAnalysis(null);
        setHasAnalysis(false);
      }
    } catch (err) {
      console.error('[AnalysisContext] Error loading latest analysis:', err);
      setAnalysis(null);
      setHasAnalysis(false);
      setError(err?.response?.data?.error || 'Could not load analysis.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on login or mount; re-fetch when user object changes
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const refreshAnalysis = useCallback(() => fetchLatest(), [fetchLatest]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setHasAnalysis(false);
    setError(null);
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analysis,
      loading,
      error,
      hasAnalysis,
      refresh: refreshAnalysis,
      refreshAnalysis,
      clearAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used inside <AnalysisProvider>');
  return ctx;
};

export default AnalysisContext;

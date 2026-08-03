/**
 * AnalysisContext.jsx
 * ─────────────────────────────────────────────────────────────────────
 * Single Source of Truth for the user's latest career analysis.
 *
 * Fetches once from GET /api/resume/latest on mount.
 * All pages (Dashboard, Career Mapping, Skill Matrix, Company Explorer)
 * read from this context — zero duplicate API calls.
 *
 * Usage:
 *   import { useAnalysis } from '../context/AnalysisContext';
 *   const { analysis, loading, hasAnalysis, refresh } = useAnalysis();
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
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/resume/latest');
      if (res.data.success) {
        setAnalysis(res.data.data);
        setHasAnalysis(res.data.hasAnalysis);
      }
    } catch (err) {
      // Non-blocking: pages degrade gracefully when no analysis exists
      setError(err?.response?.data?.error || 'Could not load analysis.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on login; re-fetch when user changes
  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // Call this after a new analysis is completed to sync all pages immediately
  const refresh = useCallback(() => fetchLatest(), [fetchLatest]);

  // Call this on logout to clear stale data
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setHasAnalysis(false);
    setError(null);
  }, []);

  return (
    <AnalysisContext.Provider value={{ analysis, loading, error, hasAnalysis, refresh, clearAnalysis }}>
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

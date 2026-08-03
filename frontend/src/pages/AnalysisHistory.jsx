/**
 * AnalysisHistory.jsx
 * ─────────────────────────────────────────────────────────────────────
 * Persistent Analysis History page.
 * Features: search, filter by company/role, sort newest/oldest,
 *           view full report, delete, re-analyze actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Trash2, Eye, RefreshCw, ChevronDown,
  Brain, FileText, Building2, Calendar, TrendingUp,
  SortDesc, SortAsc, Zap, AlertTriangle, CheckCircle,
  Clock, Award, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import api from '../api/axiosConfig';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge, ProgressBar } from '../components/ui';

// ─── Helpers ─────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const readinessColor = (score) => {
  if (score >= 75) return '#10b981';
  if (score >= 55) return '#6366f1';
  if (score >= 35) return '#f59e0b';
  return '#f43f5e';
};

const readinessLabel = (score) => {
  if (score >= 75) return 'Industry Ready';
  if (score >= 55) return 'On Track';
  if (score >= 35) return 'Developing';
  return 'Early Stage';
};

const ScorePill = ({ label, value, color, max = 100 }) => (
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
    <p style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}{max === 100 ? '%' : `/${max}`}</p>
  </div>
);

// ─── Confirm Delete Modal ─────────────────────────────────────────────
const DeleteModal = ({ item, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #080e1e)',
      border: '1px solid rgba(244,63,94,0.2)', borderRadius: '20px', padding: '2rem',
      maxWidth: '420px', width: '100%',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <AlertTriangle size={24} color="#f43f5e" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Delete Analysis</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Delete the analysis for <strong style={{ color: 'white' }}>{item?.jobRole}</strong> at <strong style={{ color: 'white' }}>{item?.company}</strong>?
          <br />This action cannot be undone.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
        >Cancel</button>
        <button
          onClick={onConfirm}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#f43f5e,#e11d48)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
        >Delete</button>
      </div>
    </div>
  </div>
);

// ─── Single History Card ──────────────────────────────────────────────
const HistoryCard = ({ item, onView, onDelete, onReanalyze }) => {
  const cr = item.careerReadiness ?? 0;
  const color = readinessColor(cr);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,14,30,0.95))',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '18px', padding: '1.5rem',
      transition: 'all 0.25s',
      position: 'relative', overflow: 'hidden'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      {/* Cached badge */}
      {item.fromCache && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '99px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cached</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
        {/* Score Ring */}
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
            <circle
              cx="30" cy="30" r="24" fill="none"
              stroke={color} strokeWidth="5"
              strokeDasharray={`${(cr / 100) * 150.8} 150.8`}
              strokeLinecap="round" strokeDashoffset="37.7"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">{cr}%</text>
          </svg>
          <p style={{ fontSize: '0.55rem', color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-4px' }}>{readinessLabel(cr)}</p>
        </div>

        {/* Job details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.jobRole}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: '0.5rem' }}>
            @ {item.company}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FileText size={10} /> {item.resumeFilename || 'Resume'}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={10} /> {fmt(item.createdAt)} · {fmtTime(item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Score pills */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem',
        padding: '0.75rem', borderRadius: '12px',
        background: 'rgba(255,255,255,0.02)', marginBottom: '1rem'
      }}>
        <ScorePill label="ATS" value={item.atsScore ?? 0} color="#10b981" />
        <ScorePill label="Keywords" value={item.keywordMatch ?? 0} color="#6366f1" />
        <ScorePill label="Readiness" value={cr} color={color} />
        <ScorePill label="Projected" value={item.estimatedScoreAfterImprovements ?? 0} color="#a855f7" />
      </div>

      {/* Sub-score bar row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 0.75rem', marginBottom: '1rem' }}>
        {[
          { l: 'Interest', v: item.interestScore, c: '#6366f1' },
          { l: 'Projects', v: item.projectScore,  c: '#a855f7' },
          { l: 'Internships', v: item.internshipScore, c: '#f59e0b' },
          { l: 'Certifications', v: item.certificationScore, c: '#10b981' }
        ].map(({ l, v, c }) => (
          <div key={l}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>{l}</span>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800 }}>{v ?? 0}/25</span>
            </div>
            <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((v ?? 0) / 25) * 100}%`, background: c, borderRadius: '99px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          id={`view-analysis-${item._id}`}
          onClick={() => onView(item._id)}
          style={{
            flex: 2, padding: '0.6rem', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
          }}
        >
          <Eye size={13} /> View Report
        </button>
        <button
          id={`reanalyze-${item._id}`}
          onClick={() => onReanalyze(item)}
          title="Re-analyze with fresh AI"
          style={{
            flex: 1, padding: '0.6rem', borderRadius: '10px',
            border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)',
            color: '#818cf8', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
          }}
        >
          <RefreshCw size={13} /> Re-analyze
        </button>
        <button
          id={`delete-analysis-${item._id}`}
          onClick={() => onDelete(item)}
          title="Delete analysis"
          style={{
            padding: '0.6rem 0.75rem', borderRadius: '10px',
            border: '1px solid rgba(244,63,94,0.15)', background: 'rgba(244,63,94,0.05)',
            color: '#f43f5e', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const AnalysisHistory = () => {
  const navigate = useNavigate();

  const [analyses, setAnalyses]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [sort, setSort]               = useState('newest');
  const [page, setPage]               = useState(1);
  const [pagination, setPagination]   = useState({ total: 0, pages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [companies, setCompanies]     = useState([]);
  const [roles, setRoles]             = useState([]);

  const LIMIT = 12;

  // Fetch history with filters
  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: p, limit: LIMIT, sort,
        ...(search        && { search }),
        ...(filterCompany && { company: filterCompany }),
        ...(filterRole    && { role: filterRole })
      });
      const res = await api.get(`/resume/history?${params}`);
      if (res.data.success) {
        setAnalyses(res.data.data);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
        setPage(p);

        // Extract unique companies and roles for filter dropdowns
        const allCos  = [...new Set(res.data.data.map(a => a.company))];
        const allRoles = [...new Set(res.data.data.map(a => a.jobRole))];
        if (allCos.length)  setCompanies(prev => [...new Set([...prev, ...allCos])]);
        if (allRoles.length) setRoles(prev => [...new Set([...prev, ...allRoles])]);
      }
    } catch (err) {
      setError('Failed to load analysis history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterCompany, filterRole, sort]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { fetchHistory(1); }, 400);
    return () => clearTimeout(t);
  }, [search, filterCompany, filterRole, sort]);

  // View full report — load from DB and push to sessionStorage
  const handleView = async (id) => {
    try {
      const res = await api.get(`/resume/history/${id}`);
      if (res.data.success) {
        const data = res.data.data;
        sessionStorage.setItem('careerAnalysis', JSON.stringify({
          analysisId: data._id,
          atsScore: data.atsScore,
          careerReadiness: data.careerReadiness,
          keywordMatch: data.keywordMatch,
          interestScore: data.interestScore,
          projectScore: data.projectScore,
          internshipScore: data.internshipScore,
          certificationScore: data.certificationScore,
          matchedSkills: data.matchedSkills,
          missingSkills: data.missingSkills,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          whyThisScore: data.whyThisScore,
          interestExplanation: data.interestExplanation,
          projectExplanation: data.projectExplanation,
          internshipExplanation: data.internshipExplanation,
          certificationExplanation: data.certificationExplanation,
          recommendations: data.recommendations,
          roadmap: data.roadmap,
          estimatedScoreAfterImprovements: data.estimatedScoreAfterImprovements,
          company: data.company,
          jobRole: data.jobRole,
          resumeFilename: data.resumeFilename,
          jdSource: data.jobDescriptionSource,
          fromHistory: true
        }));
        navigate('/career-report');
      }
    } catch (err) {
      setError('Could not load report. Please try again.');
    }
  };

  // Delete confirmation flow
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/resume/history/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchHistory(page);
    } catch (err) {
      setError('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Re-analyze: navigate to upload page with pre-filled company/role
  const handleReanalyze = (item) => {
    sessionStorage.setItem('reanalyze', JSON.stringify({
      company: item.company,
      jobRole: item.jobRole,
      force: true
    }));
    navigate('/resume');
  };

  const isEmpty = !loading && analyses.length === 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader
        title="Analysis History"
        subtitle={`${pagination.total} saved ${pagination.total === 1 ? 'analysis' : 'analyses'} — persistent across sessions`}
        icon={<Layers size={28} color="#6366f1" />}
      />

      <div style={{ padding: '0 2rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Filter Bar ───────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto auto',
          gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="history-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company, role, or filename..."
              style={{
                width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', color: 'white', fontSize: '0.875rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Company filter */}
          <select
            id="history-filter-company"
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            style={{
              padding: '0.7rem 2rem 0.7rem 0.75rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: filterCompany ? 'white' : '#64748b', fontSize: '0.875rem',
              outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px'
            }}
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Role filter */}
          <select
            id="history-filter-role"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{
              padding: '0.7rem 2rem 0.7rem 0.75rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: filterRole ? 'white' : '#64748b', fontSize: '0.875rem',
              outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px'
            }}
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Sort */}
          <button
            id="history-sort-toggle"
            onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
            style={{
              padding: '0.7rem 1rem', borderRadius: '12px',
              border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)',
              color: '#818cf8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
            }}
          >
            {sort === 'newest' ? <SortDesc size={15} /> : <SortAsc size={15} />}
            {sort === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {/* ── Active filter chips ───────────────────────────────────────── */}
        {(filterCompany || filterRole || search) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Filters:</span>
            {search && (
              <span style={{ fontSize: '0.72rem', color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '99px', padding: '2px 10px', cursor: 'pointer' }} onClick={() => setSearch('')}>
                "{search}" ×
              </span>
            )}
            {filterCompany && (
              <span style={{ fontSize: '0.72rem', color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '99px', padding: '2px 10px', cursor: 'pointer' }} onClick={() => setFilterCompany('')}>
                {filterCompany} ×
              </span>
            )}
            {filterRole && (
              <span style={{ fontSize: '0.72rem', color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '99px', padding: '2px 10px', cursor: 'pointer' }} onClick={() => setFilterRole('')}>
                {filterRole} ×
              </span>
            )}
            <button onClick={() => { setSearch(''); setFilterCompany(''); setFilterRole(''); }} style={{ fontSize: '0.7rem', color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Clear all
            </button>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ padding: '0.875rem 1.25rem', borderRadius: '12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '280px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,14,30,0.95))', border: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Brain size={36} color="#334155" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>
              {search || filterCompany || filterRole ? 'No results found' : 'No analyses yet'}
            </h3>
            <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {search || filterCompany || filterRole
                ? 'Try clearing your filters'
                : 'Upload your resume to start your first career analysis'}
            </p>
            <button
              onClick={() => search || filterCompany || filterRole ? (setSearch(''), setFilterCompany(''), setFilterRole('')) : navigate('/resume')}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {search || filterCompany || filterRole ? <><Filter size={14} /> Clear Filters</> : <><Zap size={14} /> Analyze Resume</>}
            </button>
          </div>
        )}

        {/* ── Cards grid ────────────────────────────────────────────────── */}
        {!loading && analyses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {analyses.map(item => (
              <HistoryCard
                key={item._id}
                item={item}
                onView={handleView}
                onDelete={setDeleteTarget}
                onReanalyze={handleReanalyze}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page <= 1}
              style={{
                padding: '0.6rem 1rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                color: page <= 1 ? '#334155' : '#94a3b8', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchHistory(i + 1)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: page === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  background: page === i + 1 ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.04)',
                  color: page === i + 1 ? 'white' : '#64748b',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page >= pagination.pages}
              style={{
                padding: '0.6rem 1rem', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                color: page >= pagination.pages ? '#334155' : '#94a3b8',
                cursor: page >= pagination.pages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── Summary strip ─────────────────────────────────────────────── */}
        {!loading && pagination.total > 0 && (
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.72rem', color: '#334155' }}>
            Showing {analyses.length} of {pagination.total} analyses
          </p>
        )}
      </div>

      {/* ── Delete modal ──────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AnalysisHistory;

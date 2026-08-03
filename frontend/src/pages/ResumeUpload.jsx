/**
 * ResumeUpload.jsx — Career Readiness Platform
 * ─────────────────────────────────────────────────────────────────────
 * Multi-step wizard:
 *   Step 1: Upload Resume (PDF/DOCX)
 *   Step 2: Select Company + Job Role
 *   Step 3: AI Analysis in progress
 *   Step 4: Redirects to /career-report with results
 *
 * Design matches existing SkillSync dark theme.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
  Upload, FileText, CheckCircle2, AlertCircle, Cpu,
  Zap, ShieldCheck, Fingerprint, Building2, Briefcase,
  ChevronRight, ChevronLeft, Search, Sparkles, Target,
  Brain, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, Skeleton } from '../components/ui';
import { useAnalysis } from '../context/AnalysisContext';

const STEPS = ['Upload Resume', 'Select Target', 'AI Analysis', 'Complete'];

const ResumeUpload = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2 state
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Step 3 state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { refresh: refreshAnalysis } = useAnalysis();

  // ─── Re-analyze pre-fill ─────────────────────────────────────────────
  // When arriving from AnalysisHistory "Re-analyze" button, sessionStorage
  // contains { company, jobRole, force: true }. Pre-fill and set force flag.
  const [forceReanalyze, setForceReanalyze] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('reanalyze');
    if (stored) {
      try {
        const { company, jobRole, force } = JSON.parse(stored);
        sessionStorage.removeItem('reanalyze'); // consume once
        if (company) setSelectedCompany(company);
        if (force)   setForceReanalyze(true);
        // Role is set after companies load — handled in the companies useEffect below
        if (jobRole) {
          // Store temporarily; applied once companies are loaded
          sessionStorage.setItem('_pendingRole', jobRole);
        }
      } catch (e) { /* ignore parse errors */ }
    }
  }, []);

  // Fetch companies on mount
  useEffect(() => {
    setLoadingCompanies(true);
    api.get('/resume/companies')
      .then(res => {
        if (res.data.success) setCompanies(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Update roles when company changes; also apply pending role from re-analyze
  useEffect(() => {
    if (selectedCompany) {
      const found = companies.find(c => c.name === selectedCompany);
      setAvailableRoles(found?.roles || []);
      setSelectedRole('');

      // Apply pending role (set by re-analyze flow)
      const pendingRole = sessionStorage.getItem('_pendingRole');
      if (pendingRole) {
        sessionStorage.removeItem('_pendingRole');
        const roles = found?.roles || [];
        if (roles.includes(pendingRole)) setSelectedRole(pendingRole);
      }
    }
  }, [selectedCompany, companies]);

  const validateAndSetFile = (f) => {
    if (!f) return;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const isDocxName = f.name?.toLowerCase().endsWith('.docx');

    if (allowedTypes.includes(f.type) || isDocxName) {
      setFile(f);
      setError('');
    } else {
      setError('Only PDF and DOCX resume files are accepted.');
    }
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files?.[0]);
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file || !selectedCompany || !selectedRole) return;

    setStep(3);
    setIsAnalyzing(true);
    setError('');

    const phases = [
      'Extracting resume content...',
      `Fetching ${selectedRole} job description at ${selectedCompany}...`,
      'Running Gemini AI analysis...',
      'Calculating Career Readiness score...',
      'Generating personalized recommendations...',
      'Finalizing your career report...'
    ];

    let phaseIdx = 0;
    setAnalysisPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setAnalysisPhase(phases[phaseIdx]);
    }, 2200);

    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('company', selectedCompany);
      fd.append('jobRole', selectedRole);

      // ?force=true bypasses the fingerprint cache and forces fresh Gemini analysis
      const url = forceReanalyze
        ? '/resume/analyze-career?force=true'
        : '/resume/analyze-career';

      const response = await api.post(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000 // 180s — AI analysis can take up to 2 mins for large resumes
      });

      clearInterval(phaseInterval);

      if (response.data.success) {
        await refreshUser();
        if (refreshAnalysis) await refreshAnalysis();
        setForceReanalyze(false); // reset after use
        setStep(4);
        // Store result in sessionStorage and navigate to report page
        const reportData = {
          ...response.data.data,
          fromCache: response.data.fromCache
        };
        sessionStorage.setItem('careerAnalysis', JSON.stringify(reportData));
        setTimeout(() => navigate('/career-report'), 1200);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      clearInterval(phaseInterval);
      setIsAnalyzing(false);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      setError(
        isTimeout
          ? 'Analysis timed out. Your resume may be too large or the AI service is busy. Please try again.'
          : err.response?.data?.message || err.message || 'Analysis failed. Please try again.'
      );
      setStep(2);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  // ─── Step Indicator ──────────────────────────────────────────────────
  const StepDot = ({ num, label }) => {
    const isActive = step === num;
    const isDone = step > num;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.3s',
          background: isDone ? '#10b981' : isActive ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.04)',
          color: (isDone || isActive) ? 'white' : '#475569',
          border: `2px solid ${isDone ? '#10b981' : isActive ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.4)' : 'none'
        }}>
          {isDone ? <CheckCircle2 size={16} /> : num}
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isActive ? 'white' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
    );
  };

  const StepConnector = ({ active }) => (
    <div style={{ flex: 1, height: '2px', background: active ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)', margin: '0 0.5rem', marginBottom: '1.5rem', transition: 'all 0.5s' }} />
  );

  return (
    <div className="max-w-[900px] mx-auto animate-fade-up">
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Badge icon={Cpu}>Career Readiness Platform</Badge>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
          AI Career <span className="text-gradient">Analysis</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 500, maxWidth: '560px', lineHeight: 1.6 }}>
          Upload your resume, select your dream company and role, and get an explainable AI career readiness report with personalized recommendations.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
        <StepDot num={1} label="Upload" />
        <StepConnector active={step >= 2} />
        <StepDot num={2} label="Target" />
        <StepConnector active={step >= 3} />
        <StepDot num={3} label="Analysis" />
        <StepConnector active={step >= 4} />
        <StepDot num={4} label="Report" />
      </div>

      {/* ── STEP 1: Upload Resume ── */}
      {step === 1 && (
        <GlassCard style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }} hover={false}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03, pointerEvents: 'none' }}>
            <Fingerprint size={280} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: '100%', borderRadius: '24px', padding: '4rem 2rem',
                border: `2px dashed ${file ? '#6366f1' : isDragging ? '#818cf8' : 'rgba(255,255,255,0.06)'}`,
                backgroundColor: isDragging ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="sr-only" onChange={handleFileChange} />
              {file ? (
                <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 1.5rem', position: 'relative' }}>
                    <FileText size={36} />
                    <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: '#10b981', borderRadius: '50%', padding: '4px', border: '3px solid #0f172a' }}>
                      <CheckCircle2 size={14} color="white" />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>{file.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                    {(file.size / 1024).toFixed(0)} KB — Ready for analysis
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', margin: '0 auto 1.5rem' }}>
                    <Upload size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Drop your resume here</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>PDF or DOCX • Max 10MB</p>
                </div>
              )}
            </label>

            {error && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(244,63,94,0.2)', backgroundColor: 'rgba(244,63,94,0.05)', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 700 }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <Button variant="ghost" fullWidth onClick={() => { setFile(null); setError(''); }}>Clear</Button>
              <Button
                variant="primary" fullWidth disabled={!file} icon={ChevronRight}
                onClick={() => setStep(2)}
              >
                Continue to Target Selection
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── STEP 2: Select Company + Role ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard hover={false}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={22} color="#6366f1" />
              Select Target Company
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem' }}>
              Choose the company you're applying to. The AI will tailor the analysis to their specific requirements.
            </p>

            {/* Search box */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="text"
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                style={{
                  width: '100%', height: '44px', paddingLeft: '42px', paddingRight: '16px',
                  backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', color: 'white', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>

            {loadingCompanies ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} height="48px" borderRadius="12px" />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {filteredCompanies.map(company => (
                  <button
                    key={company.name}
                    onClick={() => setSelectedCompany(company.name)}
                    style={{
                      padding: '0.875rem 1rem', borderRadius: '14px', fontSize: '0.875rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      border: selectedCompany === company.name
                        ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                      background: selectedCompany === company.name
                        ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                      color: selectedCompany === company.name ? '#818cf8' : '#94a3b8',
                      boxShadow: selectedCompany === company.name ? '0 0 16px rgba(99,102,241,0.2)' : 'none'
                    }}
                  >
                    {company.name}
                  </button>
                ))}
                {filteredCompanies.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '1.5rem', color: '#475569', fontSize: '0.85rem' }}>
                    No companies match your search. You can still proceed — we'll use a generic JD.
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Role selection — appears after company is selected */}
          {selectedCompany && availableRoles.length > 0 && (
            <GlassCard hover={false}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase size={20} color="#a855f7" />
                Select Job Role at {selectedCompany}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.25rem' }}>
                The job description for this role will be fetched automatically.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    style={{
                      padding: '0.625rem 1.25rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: selectedRole === role ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.06)',
                      background: selectedRole === role ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                      color: selectedRole === role ? '#c084fc' : '#64748b'
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Custom company/role input if not in list */}
          {(!selectedCompany || availableRoles.length === 0) && (
            <GlassCard hover={false} style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem' }}>
                OR enter a custom company and role:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Company name (e.g., Zoho)"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  style={{
                    height: '46px', padding: '0 1rem', backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                    color: 'white', fontSize: '0.875rem', outline: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Job role (e.g., Frontend Developer)"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    height: '46px', padding: '0 1rem', backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                    color: 'white', fontSize: '0.875rem', outline: 'none'
                  }}
                />
              </div>
            </GlassCard>
          )}

          {error && (
            <div style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(244,63,94,0.2)', backgroundColor: 'rgba(244,63,94,0.05)', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 700 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" icon={ChevronLeft} onClick={() => setStep(1)}>Back</Button>
            <Button
              variant="primary" fullWidth
              disabled={!selectedCompany || !selectedRole}
              icon={Sparkles}
              onClick={handleAnalyze}
            >
              Start AI Analysis
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: AI Analysis in Progress ── */}
      {step === 3 && (
        <GlassCard hover={false} style={{ padding: '4rem 3rem', textAlign: 'center' }}>
          {/* Animated brain icon */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2.5rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <Brain size={46} color="#6366f1" />
            </div>
            {/* Orbiting ring */}
            <div style={{
              position: 'absolute', inset: '-12px', borderRadius: '50%',
              border: '2px dashed rgba(99,102,241,0.3)',
              animation: 'spin 8s linear infinite'
            }} />
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } 50% { box-shadow: 0 0 0 16px rgba(99,102,241,0.08); } }
            @keyframes spin { to { transform: rotate(360deg); } }
          ` }} />

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>
            Gemini AI is analyzing your profile
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500, marginBottom: '2.5rem' }}>
            Comparing resume against <strong style={{ color: 'white' }}>{selectedRole}</strong> requirements at <strong style={{ color: '#818cf8' }}>{selectedCompany}</strong>
          </p>

          {/* Progress phase indicator */}
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '14px',
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
            marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 1.5s infinite' }} />
            <p style={{ color: '#818cf8', fontSize: '0.875rem', fontWeight: 700 }}>{analysisPhase}</p>
          </div>

          {/* Score preview chips */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Career Readiness', 'Keyword Match', 'Skills Gap', 'Recommendations', 'Roadmap'].map((label, i) => (
              <div key={label} style={{
                padding: '0.4rem 0.875rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: `pulse ${1 + i * 0.3}s infinite` }} />
                {label}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── STEP 4: Complete ── */}
      {step === 4 && (
        <GlassCard hover={false} style={{ padding: '4rem 3rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Analysis Complete!</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Redirecting to your career report...</p>
        </GlassCard>
      )}

      {/* Bottom info cards — only on step 1 */}
      {step === 1 && (
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <GuidelineItem icon={<ShieldCheck size={18} />} title="Secure Analysis" desc="Your resume data is processed and not stored." />
          <GuidelineItem icon={<Target size={18} />} title="Job Targeted" desc="Analysis tailored to your selected company & role." />
          <GuidelineItem icon={<Zap size={18} />} title="Gemini Powered" desc="Google's Gemini AI drives every insight." />
        </div>
      )}
    </div>
  );
};

const GuidelineItem = ({ icon, title, desc }) => (
  <GlassCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>{icon}</div>
    <div>
      <h4 style={{ fontSize: '0.825rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>{title}</h4>
      <p style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>{desc}</p>
    </div>
  </GlassCard>
);

export default ResumeUpload;

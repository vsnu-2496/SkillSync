/**
 * CompanyExplorer.jsx — Dynamic Job Portal & Enterprise Intelligence
 * ─────────────────────────────────────────────────────────────────────
 * Full-fledged dynamic job portal & company explorer powered by backend APIs.
 *
 * Features:
 *  - Company search & multi-attribute filtering (Difficulty, Hiring Status)
 *  - Analysis-driven match enrichment banner when user's target company matches
 *  - Interactive Company Detail & Role Job Description Inspector Modal
 *  - Dynamic Job Roles listing with complete JD, salary, rounds & eligibility
 *  - Directly launch interview preparation or re-analyze target
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Search, ArrowRight, TrendingUp, Briefcase, Zap, Clock,
  MessagesSquare, DollarSign, Filter, CheckCircle2, XCircle, ShieldCheck,
  Brain, FileText, ChevronRight, Sparkles, Award, MapPin, Users
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import Modal from '../components/ui/Modal';
import api from '../api/axiosConfig';
import { useAnalysis } from '../context/AnalysisContext';

const CompanyExplorer = () => {
  const navigate = useNavigate();
  const { analysis } = useAnalysis();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [hiringFilter, setHiringFilter] = useState('All');

  // Selected company & role details for modal
  const [selectedCompany, setSelectedCompany] = useState(null); // Company detail object
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyDetailLoading, setCompanyDetailLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null); // Role detail object
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);

  // Fetch companies list on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      if (res.data.success && Array.isArray(res.data.data)) {
        setCompanies(res.data.data);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies
  const filteredCompanies = companies.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (comp.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || comp.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const matchesHiring = hiringFilter === 'All' || comp.hiringStatus.toLowerCase().includes(hiringFilter.toLowerCase());

    return matchesSearch && matchesDiff && matchesHiring;
  });

  // Open company detail modal
  const handleOpenCompany = async (companyName) => {
    setCompanyModalOpen(true);
    setCompanyDetailLoading(true);
    setSelectedRole(null);
    try {
      const res = await api.get(`/companies/${encodeURIComponent(companyName)}`);
      if (res.data.success) {
        setSelectedCompany(res.data.data);
        // Default select first role if available
        if (res.data.data.roles && res.data.data.roles.length > 0) {
          handleSelectRole(companyName, res.data.data.roles[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch company detail:", err);
    } finally {
      setCompanyDetailLoading(false);
    }
  };

  // Fetch specific role detail
  const handleSelectRole = async (companyName, roleName) => {
    setRoleDetailLoading(true);
    try {
      const res = await api.get(`/companies/${encodeURIComponent(companyName)}/roles/${encodeURIComponent(roleName)}`);
      if (res.data.success) {
        setSelectedRole(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch role detail:", err);
    } finally {
      setRoleDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ width: '45px', height: '45px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Loading Job Portal...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Company"
        gradient="Explorer"
        subtitle="Dynamic AI job portal with live role descriptions, interview rounds, and personalized match benchmarks."
        badge={<Badge variant="primary" icon={Zap}>Job Portal Active</Badge>}
      />

      {/* ── RECOMMENDED TARGET BANNER ── */}
      {analysis && (
        <GlassCard style={{ marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Active Benchmark Target</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>
                  {analysis.jobRole} <span style={{ color: '#818cf8' }}>@ {analysis.company}</span>
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{analysis.careerReadiness}%</p>
                <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px' }}>Readiness</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{analysis.atsScore}%</p>
                <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px' }}>ATS Score</p>
              </div>
              <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => handleOpenCompany(analysis.company)}>
                Inspect Target JD
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── SEARCH & FILTER STRIP ── */}
      <GlassCard style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center' }}>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search companies, domains, technology stacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'white', fontSize: '0.9rem', outline: 'none'
              }}
            />
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(255,255,255,0.06)', color: 'white', fontSize: '0.85rem', outline: 'none'
              }}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Hiring Status Filter */}
          <select
            value={hiringFilter}
            onChange={(e) => setHiringFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(255,255,255,0.06)', color: 'white', fontSize: '0.85rem', outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Hiring">Actively Hiring</option>
            <option value="Selective">Selective</option>
          </select>
        </div>
      </GlassCard>

      {/* ── COMPANIES GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((comp) => {
            const isTarget = analysis && analysis.company.toLowerCase() === comp.name.toLowerCase();

            return (
              <GlassCard
                key={comp.name}
                style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  border: isTarget ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.04)',
                  position: 'relative'
                }}
              >
                {isTarget && (
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.35rem 0.85rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '0 0 0 12px' }}>
                    Active Target
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${comp.color || '#6366f1'}20`, border: `1px solid ${comp.color || '#6366f1'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: comp.color || 'white', fontWeight: 900, fontSize: '1.2rem' }}>
                    {comp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{comp.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{comp.domain}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <Badge variant={comp.hiringStatus.includes('Active') ? 'success' : 'primary'}>{comp.hiringStatus}</Badge>
                  <Badge variant="ghost" style={{ background: 'rgba(255,255,255,0.03)', color: '#94a3b8' }}>{comp.difficulty}</Badge>
                  {comp.internship && <Badge variant="ghost" style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7' }}>Internships Open</Badge>}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  Avg Compensation: <span style={{ color: '#10b981', fontWeight: 700 }}>{comp.salary}</span>
                </p>

                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Popular Roles ({comp.rolesCount})</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {(comp.popularRoles || []).map(r => (
                      <span key={r} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: '0.75rem' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="primary" fullWidth icon={ArrowRight} onClick={() => handleOpenCompany(comp.name)}>
                  Explore Roles & JDs
                </Button>
              </GlassCard>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <Building2 size={40} color="#475569" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No companies match your filters.</p>
          </div>
        )}
      </div>

      {/* ── COMPANY & ROLE INSPECTOR MODAL ── */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => { setCompanyModalOpen(false); setSelectedCompany(null); setSelectedRole(null); }}
        title={selectedCompany ? `${selectedCompany.name} Job Portal` : "Loading..."}
        subtitle={selectedCompany ? `${selectedCompany.domain} • ${selectedCompany.hq || ''}` : ''}
      >
        {companyDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b' }}>Fetching live job descriptions...</p>
          </div>
        ) : selectedCompany ? (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>

            {/* Left Column: Roles Selector & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRight: '1px solid rgba(255,255,255,0.04)', paddingRight: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Available Roles</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(selectedCompany.roles || []).map(r => {
                    const isSelected = selectedRole && selectedRole.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleSelectRole(selectedCompany.name, r)}
                        style={{
                          padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'left',
                          border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                          background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? 'white' : '#94a3b8', fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <span>{r}</span>
                        {isSelected && <ChevronRight size={14} color="#6366f1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company Info Box */}
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Company Facts</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}><strong>HQ:</strong> {selectedCompany.hq || 'Global'}</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}><strong>Size:</strong> {selectedCompany.size || '10,000+'}</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}><strong>Internships:</strong> {selectedCompany.internship ? 'Available' : 'Closed'}</p>
              </div>

              {/* Interview Rounds List */}
              {selectedCompany.interviewProcess && (
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Hiring Rounds</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedCompany.interviewProcess.map((round, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <span>{round}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Selected Role Full JD */}
            <div>
              {roleDetailLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: '28px', height: '28px', border: '2px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading Job Description...</p>
                </div>
              ) : selectedRole ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Role Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>{selectedRole.salary}</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{selectedRole.role}</h3>
                    </div>
                    <Link to="/interview-prep" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" icon={MessagesSquare}>Start Prep</Button>
                    </Link>
                  </div>

                  {/* Match Banner if User analyzed this company & role */}
                  {selectedRole.matchData && (
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>Analysis Match Available</p>
                        <p style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>Career Readiness: {selectedRole.matchData.careerReadiness}% | ATS Score: {selectedRole.matchData.atsScore}%</p>
                      </div>
                      <Link to="/career-report" style={{ textDecoration: 'none' }}>
                        <Button variant="ghost" size="sm">Full Report</Button>
                      </Link>
                    </div>
                  )}

                  {/* Job Description Text */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Job Description & Requirements</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {selectedRole.description}
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Select a role to view the full job description.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CompanyExplorer;

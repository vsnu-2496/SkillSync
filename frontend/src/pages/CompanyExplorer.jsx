import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Zap,
  Clock,
  MessagesSquare,
  BarChart3,
  DollarSign
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import Modal from '../components/ui/Modal';
import api from '../api/axiosConfig';

const CompanyExplorer = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalType, setModalType] = useState(null); // 'analytics' | 'explorer'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      if (res.data.success && Array.isArray(res.data.companies)) {
        setCompanies(res.data.companies);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies list:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = (companies || []).filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (selectedCompany && modalType === 'explorer') {
      fetchCompanyQuestions(selectedCompany.name);
    }
  }, [selectedCompany, modalType]);

  const fetchCompanyQuestions = async (companyName) => {
    setQuestionsLoading(true);
    try {
      const res = await api.get(`/interview/company-questions/${encodeURIComponent(companyName)}`);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Failed to fetch company questions", err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSolve = () => {
    if (selectedCompany) {
      navigate(`/interview-prep?company=${encodeURIComponent(selectedCompany.name)}`);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Company" 
        gradient="Library" 
        subtitle="Explore verified interview question banks and placement experiences from global technology enterprise leaders."
      />

      <div style={{ position: 'relative', marginBottom: '3rem' }}>
        <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
        <input 
          type="text" 
          placeholder="Filter by company name (e.g. Google, Amazon, Microsoft, Zoho, TCS, Meta)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="portal-company-search"
          style={{
            width: '100%',
            height: '72px',
            padding: '0 2rem 0 4.5rem',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 500,
            outline: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            transition: 'all 0.2s'
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', flexDirection: 'column' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Syncing Company Intelligence Manifest...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {filtered.length > 0 ? filtered.map((c) => (
            <GlassCard key={c._id || c.name} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1.5rem', fontWeight: 900, border: '1px solid rgba(255,255,255,0.08)' }}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: c.hiringStatus === 'Actively Hiring' ? '#10b981' : '#f59e0b', marginTop: '2px' }}>● {c.hiringStatus || 'Hiring'}</p>
                  </div>
                </div>
                <Badge variant={c.difficulty === 'Hard' ? 'danger' : (c.difficulty === 'Medium' ? 'primary' : 'success')}>
                  {c.difficulty}
                </Badge>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Avg Compensation</span>
                  <span style={{ color: 'white', fontWeight: 800 }}>{c.avgSalary}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Question Pool</span>
                  <span style={{ color: 'white', fontWeight: 800 }}>{c.questionsCount || 30}+ Items</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Focus Domains</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {(c.tags || []).slice(0, 3).map(tag => (
                      <Badge key={tag} variant="ghost" size="sm">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Button variant="ghost" fullWidth onClick={() => { setSelectedCompany(c); setModalType('analytics'); }}>Stats</Button>
                <Button variant="primary" fullWidth icon={ArrowRight} onClick={() => { setSelectedCompany(c); setModalType('explorer'); }}>Explore</Button>
              </div>
            </GlassCard>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>No companies matched "{search}".</p>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      <Modal
        isOpen={selectedCompany && modalType === 'analytics'}
        onClose={() => setSelectedCompany(null)}
        title={`${selectedCompany?.name} Intelligence`}
        subtitle="Hiring analytics and baseline specs."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <GlassCard style={{ textAlign: 'center', padding: '1.5rem' }}>
              <DollarSign size={24} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Avg Salary</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginTop: '0.25rem' }}>{selectedCompany?.avgSalary}</p>
            </GlassCard>
            <GlassCard style={{ textAlign: 'center', padding: '1.5rem' }}>
              <BarChart3 size={24} color="#6366f1" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Difficulty</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginTop: '0.25rem' }}>{selectedCompany?.difficulty}</p>
            </GlassCard>
            <GlassCard style={{ textAlign: 'center', padding: '1.5rem' }}>
              <Briefcase size={24} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Questions</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginTop: '0.25rem' }}>{selectedCompany?.questionsCount}+</p>
            </GlassCard>
          </div>

          <div>
            <h4 style={{ color: 'white', fontWeight: 800, marginBottom: '1rem' }}>Popular Roles</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {(selectedCompany?.popularRoles || ["Software Engineer", "Systems Architect"]).map(r => (
                <Badge key={r} variant="primary" icon={Briefcase}>{r}</Badge>
              ))}
            </div>
          </div>

          <Button variant="primary" fullWidth icon={MessagesSquare} onClick={handleSolve}>Start Company Practice Session</Button>
        </div>
      </Modal>

      <Modal
        isOpen={selectedCompany && modalType === 'explorer'}
        onClose={() => setSelectedCompany(null)}
        title={`${selectedCompany?.name} Interview Bank`}
        subtitle="Real interview questions asked in recent placement rounds."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questionsLoading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading questions from neural bank...</p>
          ) : questions.length > 0 ? (
            questions.map((q, idx) => (
              <div key={q.id || idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Badge variant="ghost" size="sm">{q.round || 'Technical Round'}</Badge>
                  <Badge variant="primary" size="sm">{q.category || 'General'}</Badge>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{q.title}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No direct questions stored for {selectedCompany?.name} yet. Use general technical prep.</p>
          )}

          <Button variant="primary" fullWidth icon={Zap} onClick={handleSolve}>Launch Interactive Quiz for {selectedCompany?.name}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyExplorer;

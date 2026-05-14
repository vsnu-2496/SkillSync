import React, { useState, useEffect } from 'react';
import { 
  MessagesSquare, 
  Search, 
  TrendingUp,
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Brain,
  Cpu,
  Trophy,
  X,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import api from '../api/axiosConfig';

const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDomain, setUserDomain] = useState("Web Development");
  const [readiness, setReadiness] = useState(0);
  
  // Test Session State
  const [isTestMode, setIsTestMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const dRes = await api.get('/dashboard');
      const domain = dRes.data.data.topRole || "Web Development";
      setUserDomain(domain === "Not Analyzed" ? "Web Development" : domain);
      setReadiness(dRes.data.data.metrics.prepReadiness);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const startTest = async () => {
    setLoading(true);
    try {
      // 1. Initialize Neural Session
      await api.post('/interview/start-test');
      
      // 2. Fetch Questions
      const qRes = await api.get(`/interview/questions?domain=${encodeURIComponent(userDomain)}`);
      if (qRes.data.questions && qRes.data.questions.length > 0) {
        setQuestions(qRes.data.questions);
        setAnswers({});
        setTestResults(null);
        setIsTestMode(true);
      } else {
        // Silent fallback to Java if domain still has 0 questions (safety)
        const retryRes = await api.get('/interview/questions?domain=Java');
        setQuestions(retryRes.data.questions);
        setIsTestMode(true);
      }
    } catch (err) {
      console.error("Neural Error Object:", err);
      const errorMsg = err.response?.data?.error || err.message;
      const statusCode = err.response?.status || "LOCAL";
      
      if (statusCode === 404) {
        // Try a heartbeat to verify if /api is reachable at all
        try {
          const heartRes = await api.get('/heartbeat');
          console.log("Heartbeat Check:", heartRes.data);
          alert(`404 Error: Server is alive but /interview/start-test is missing. Heartbeat: ${heartRes.data.status}`);
        } catch (hErr) {
          alert(`Critical: Backend on port 5000 is UNREACHABLE. Ensure 'npm start' is running in backend folder.`);
        }
      } else {
        alert(`Connection Refused [${statusCode}]: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const submitTest = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please complete all neural nodes before submission.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/interview/submit', {
        answers,
        questionIds: questions.map(q => q.id)
      });
      setTestResults(res.data);
      setReadiness(res.data.readiness);
    } catch (err) {
      alert("Submission Synchronization Failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Execution" 
        gradient="Interview Prep" 
        subtitle="Domain-specific assessment engine driven by your professional skill manifest."
        badge={<Badge variant="success">Neural Sync Active</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <GlassCard style={{ border: '1px solid rgba(99, 102, 241, 0.2)', position: 'relative', overflow: 'hidden', padding: '2.5rem' }}>
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', color: 'rgba(99, 102, 241, 0.05)' }}>
              <Brain size={160} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <Zap size={40} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Neural Test: {userDomain}</h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
                  A targeted MCQ assessment curated to calibrate your placement readiness for {userDomain} roles.
                </p>
              </div>
              <Button size="lg" icon={ArrowRight} onClick={startTest}>Begin Assessment</Button>
            </div>
          </GlassCard>

          {/* Guidelines */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
             <FeatureItem icon={<Cpu size={20} />} title="Domain Specific" desc="Tailored to your resume analysis." />
             <FeatureItem icon={<CheckCircle2 size={20} />} title="Real-time Scoring" desc="Immediate feedback on submission." />
             <FeatureItem icon={<TrendingUp size={20} />} title="Dashboard Sync" desc="Updates your overall readiness." />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Trophy size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Prep Readiness</h4>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <p style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{readiness}%</p>
               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginTop: '0.5rem', letterSpacing: '0.1em' }}>Neural Rating</p>
            </div>
            <ProgressBar progress={readiness} color="#f59e0b" />
          </GlassCard>
        </div>
      </div>

      {/* ── ASSESSMENT MODAL ── */}
      {isTestMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
           <GlassCard style={{ maxWidth: '900px', width: '100%', padding: '3.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
              <button onClick={() => setIsTestMode(false)} style={{ position: 'absolute', right: '25px', top: '25px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
              
              {!testResults ? (
                <>
                  <div style={{ marginBottom: '3rem' }}>
                    <Badge variant="primary" style={{ marginBottom: '1rem' }}>Active Assessment</Badge>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>{userDomain} Proficiency</h2>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>Select the correct option for each neural node. Precision is critical.</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '3rem' }}>
                    {questions.map((q, i) => (
                      <div key={q.id}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', gap: '1rem' }}>
                          <span style={{ color: '#6366f1', opacity: 0.5 }}>{i+1}.</span> {q.question}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          {q.options.map(opt => (
                            <button 
                              key={opt}
                              onClick={() => handleOptionSelect(q.id, opt)}
                              style={{
                                padding: '1.25rem',
                                borderRadius: '14px',
                                background: answers[q.id] === opt ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${answers[q.id] === opt ? '#6366f1' : 'rgba(255,255,255,0.05)'}`,
                                color: answers[q.id] === opt ? 'white' : '#94a3b8',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: 600,
                                fontSize: '0.95rem'
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button fullWidth variant="primary" size="lg" onClick={submitTest} disabled={submitting}>
                    {submitting ? "Analyzing Manifest..." : "Submit Neural Data"}
                  </Button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 2.5rem' }}>
                      <CheckCircle2 size={70} />
                   </div>
                   <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Assessment Complete</h2>
                   <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>Your performance has been synthesized with your professional manifest.</p>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
                      <ResultStat label="Test Score" value={`${testResults.score}%`} color="#6366f1" />
                      <ResultStat label="Accuracy" value={`${testResults.correct}/${testResults.total}`} color="#10b981" />
                      <ResultStat label="Combined Readiness" value={`${testResults.readiness}%`} color="#f59e0b" />
                   </div>
                   
                   <Button variant="ghost" fullWidth size="lg" onClick={() => setIsTestMode(false)}>Return to Prep Terminal</Button>
                </div>
              )}
           </GlassCard>
        </div>
      )}
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <GlassCard style={{ padding: '1.5rem' }}>
    <div style={{ color: '#6366f1', marginBottom: '1rem' }}>{icon}</div>
    <h5 style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h5>
    <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>{desc}</p>
  </GlassCard>
);

const ResultStat = ({ label, value, color }) => (
  <div style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
     <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{label}</p>
     <p style={{ fontSize: '2.25rem', fontWeight: 900, color }}>{value}</p>
  </div>
);

export default InterviewPrep;

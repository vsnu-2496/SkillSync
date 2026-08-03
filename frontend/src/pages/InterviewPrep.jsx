import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Brain,
  Trophy,
  X,
  Clock,
  LayoutGrid,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import api from '../api/axiosConfig';
import { useAnalysis } from '../context/AnalysisContext';

const InterviewPrep = () => {
  const { analysis } = useAnalysis();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDomain, setUserDomain] = useState("Web Development");
  const [readiness, setReadiness] = useState(0);
  const [topics, setTopics] = useState([]);
  const [referenceLinks, setReferenceLinks] = useState([]);
  
  // Test Session State
  const [isTestMode, setIsTestMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isTestMode && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      submitTest(); // Auto-submit on timeout
    }
    return () => clearInterval(timerRef.current);
  }, [isTestMode, timeLeft]);

  const fetchInitialData = async () => {
    try {
      const [dRes, tRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/interview/topics')
      ]);
      const domain = analysis?.jobRole || dRes.data?.data?.topRole || "Web Development";
      const cleanDomain = domain === "Not Analyzed" ? "Web Development" : domain;
      setUserDomain(cleanDomain);
      setReadiness(analysis?.careerReadiness || dRes.data?.data?.metrics?.prepReadiness || 65);
      setTopics(tRes.data?.topics || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load interview prep initial data:", err);
      setLoading(false);
    }
  };

  const startTest = async (topic = null) => {
    setLoading(true);
    const targetTopic = topic || userDomain;
    try {
      await api.post('/interview/start-test');
      
      const urlParams = new URLSearchParams(window.location.search);
      const companyParam = urlParams.get('company');
      
      const url = companyParam 
        ? `/interview/questions?company=${encodeURIComponent(companyParam)}`
        : `/interview/questions?domain=${encodeURIComponent(targetTopic)}`;
        
      const qRes = await api.get(url);
      if (qRes.data.questions && qRes.data.questions.length > 0) {
        setQuestions(qRes.data.questions);
        setReferenceLinks(qRes.data.referenceLinks || []);
        setAnswers({});
        setTestResults(null);
        setIsTestMode(true);
        setTimeLeft(600); // 10 minutes
      }
    } catch (err) {
      console.error("Failed to start assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const submitTest = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const res = await api.post('/interview/submit', {
        answers,
        questionIds: questions.map(q => q.id)
      });
      setTestResults(res.data);
      setReadiness(res.data.readiness);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
      setTimeLeft(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Execution" 
        gradient="Interview Prep" 
        subtitle="Domain-specific assessment engine driven by your professional skill manifest and official learning resources."
        badge={<Badge variant="success">Neural Sync Active</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Assessment Card */}
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
                  A targeted MCQ assessment curated to calibrate your placement readiness.
                </p>
              </div>
              <Button size="lg" icon={ArrowRight} onClick={() => startTest()}>Begin Assessment</Button>
            </div>
          </GlassCard>

          {/* Official Learning & Reference Section */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <BookOpen size={20} color="#10b981" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Official Study Resources</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              <a href="https://roadmap.sh" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>Roadmap.sh</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Interactive Developer Paths</p>
                  </div>
                  <ExternalLink size={16} color="#10b981" />
                </div>
              </a>
              <a href="https://developer.mozilla.org" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>MDN Web Docs</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Standard Web Reference</p>
                  </div>
                  <ExternalLink size={16} color="#6366f1" />
                </div>
              </a>
              <a href="https://www.geeksforgeeks.org" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>GeeksforGeeks</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Algorithms & Practice</p>
                  </div>
                  <ExternalLink size={16} color="#f59e0b" />
                </div>
              </a>
              <a href="https://skillbuilder.aws" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>AWS Skill Builder</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Cloud Architecture</p>
                  </div>
                  <ExternalLink size={16} color="#a855f7" />
                </div>
              </a>
            </div>
          </GlassCard>

          {/* Topic-wise Challenges */}
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <LayoutGrid size={20} color="#6366f1" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>Topic Challenges</h4>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                {(topics || []).map(topic => (
                   <GlassCard key={topic} style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h5 style={{ color: 'white', fontWeight: 800, fontSize: '1rem', marginBottom: '1rem' }}>{topic}</h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>10 Questions</span>
                         <Button size="sm" variant="ghost" onClick={() => startTest(topic)}>Solve</Button>
                      </div>
                   </GlassCard>
                ))}
             </div>
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

          <GlassCard style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Clock size={18} color="#f59e0b" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>Mock Test Rules</h4>
             </div>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <RuleItem text="10 Questions per set" />
                <RuleItem text="10 Minute time limit" />
                <RuleItem text="Auto-submission on timeout" />
             </ul>
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
                  <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Badge variant="primary" style={{ marginBottom: '1rem' }}>Active Assessment</Badge>
                      <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Proficiency Test</h2>
                      <p style={{ color: '#64748b', fontWeight: 500 }}>Select the correct option for each neural node.</p>
                    </div>
                    {timeLeft !== null && (
                      <div style={{ background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '16px', border: `1px solid ${timeLeft < 60 ? '#ef4444' : 'var(--border)'}`, textAlign: 'center' }}>
                         <p style={{ fontSize: '0.7rem', fontWeight: 800, color: timeLeft < 60 ? '#ef4444' : '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Time Remaining</p>
                         <p style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft < 60 ? '#ef4444' : 'white' }}>{formatTime(timeLeft)}</p>
                      </div>
                    )}
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
                   <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 2rem' }}>
                      <CheckCircle2 size={60} />
                   </div>
                   <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Assessment Completed</h2>
                   <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1rem' }}>Detailed breakdown with official explanations:</p>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                      <ResultStat label="Test Score" value={`${testResults.score}%`} color="#6366f1" />
                      <ResultStat label="Accuracy" value={`${testResults.correct}/${testResults.total}`} color="#10b981" />
                      <ResultStat label="Combined Readiness" value={`${testResults.readiness}%`} color="#f59e0b" />
                   </div>

                   {/* Explanations List */}
                   <div style={{ textAlign: 'left', marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <h4 style={{ color: 'white', fontWeight: 800 }}>Explanations & Review</h4>
                     {(testResults.results || []).map((r, idx) => (
                       <div key={idx} style={{ padding: '1rem', borderRadius: '12px', background: r.isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${r.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                         <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{idx + 1}. {r.question}</p>
                         <p style={{ color: r.isCorrect ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>Your Answer: {r.userAnswer || 'Not answered'} {r.isCorrect ? '✓' : `(Correct: ${r.correctAnswer})`}</p>
                         <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.25rem' }}>Explanation: {r.explanation}</p>
                       </div>
                     ))}
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

const RuleItem = ({ text }) => (
  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
     <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }}></div>
     {text}
  </li>
);

const ResultStat = ({ label, value, color }) => (
  <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
     <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{label}</p>
     <p style={{ fontSize: '2rem', fontWeight: 900, color }}>{value}</p>
  </div>
);

export default InterviewPrep;

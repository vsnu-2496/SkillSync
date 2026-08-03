import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Play, 
  Send, 
  Clock, 
  Brain, 
  RotateCcw, 
  History,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Award,
  Mic,
  MicOff,
  ChevronLeft
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import api from '../api/axiosConfig';
import { useAnalysis } from '../context/AnalysisContext';

const DOMAIN_OPTIONS = [
  'Web Development',
  'Data Science',
  'Software Engineering',
  'Information Technology',
  'Database Management',
  'System Design',
  'HR Behavior'
];

const MockInterview = () => {
  const { analysis } = useAnalysis();
  // Navigation Phases: 'setup' | 'session' | 'results'
  const [phase, setPhase] = useState('setup');
  
  // Setup Options
  const [domain, setDomain] = useState(analysis?.bestCareerRole || analysis?.jobRole || 'Full Stack Developer');
  const [difficulty, setDifficulty] = useState(
    (analysis?.careerReadiness || 65) >= 75 ? 'hard' : (analysis?.careerReadiness || 65) >= 55 ? 'medium' : 'easy'
  );

  useEffect(() => {
    if (analysis) {
      setDomain(analysis.bestCareerRole || analysis.jobRole || 'Full Stack Developer');
      if (analysis.careerReadiness) {
        setDifficulty(analysis.careerReadiness >= 75 ? 'hard' : analysis.careerReadiness >= 55 ? 'medium' : 'easy');
      }
    }
  }, [analysis]);

  
  // Live Session State
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60s per question
  const [timeTaken, setTimeTaken] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [avatarPulsing, setAvatarPulsing] = useState(true);

  // Speech-to-Text Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Result Reports State
  const [report, setReport] = useState(null);
  
  // History list
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Timers & Input Refs
  const timerRef = useRef(null);
  const currentAnswerRef = useRef('');

  useEffect(() => {
    currentAnswerRef.current = answerInput;
  }, [answerInput]);

  useEffect(() => {
    fetchHistory();
    // Check Speech Recognition Browser Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    if (phase === 'session' && currentQuestion) {
      setTimeLeft(60);
      setTimeTaken(0);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitCurrentAnswer(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopVoiceInput();
    };
  }, [phase, currentQuestion]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/mock/history');
      if (res.data?.sessions) {
        setPastSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('History Fetch Error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewSession = async () => {
    setPhase('session');
    setAnsweredCount(0);
    setAnswerInput('');
    setReport(null);
    
    try {
      const res = await api.post('/mock/start', { domain, difficulty });
      if (res.data) {
        setSession(res.data);
        setCurrentQuestion(res.data.question);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to initialize mock interview session.');
      setPhase('setup');
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setAnswerInput(prev => (prev ? prev + ' ' : '') + transcript.trim());
        }
      };

      recognition.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error("Speech Init Error:", err);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech stop warning:", err.message);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const submitCurrentAnswer = async (isTimeout = false) => {
    stopVoiceInput();
    if (submittingAnswer) return;
    setSubmittingAnswer(true);
    setAvatarPulsing(false);

    const textToSubmit = isTimeout ? (currentAnswerRef.current || 'Time Limit Exceeded') : answerInput;

    try {
      const res = await api.post('/mock/answer', {
        sessionId: session.sessionId,
        userAnswer: textToSubmit,
        timeTaken: timeTaken
      });

      if (res.data) {
        setAnsweredCount(prev => prev + 1);
        setAnswerInput('');
        
        if (res.data.isLast) {
          finalizeSession();
        } else {
          setCurrentQuestion(res.data.next);
          setAvatarPulsing(true);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Answer delivery offline. Synced parameters lost.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const finalizeSession = async () => {
    try {
      const res = await api.post('/mock/finish', { sessionId: session.sessionId });
      if (res.data) {
        setReport(res.data);
        setPhase('results');
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to finalize assessment report.');
      setPhase('setup');
    }
  };

  const quitActiveSession = () => {
    if (window.confirm('Are you sure you want to abort the active assessment? Progress will be lost.')) {
      stopVoiceInput();
      setPhase('setup');
      setSession(null);
      setCurrentQuestion(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Intelligence"
        gradient="Mock Interview"
        subtitle="Practice job interviews with an AI bot using voice or text in real-time and review structured scores."
        badge={<Badge variant="primary" icon={Cpu}>Simulation Portal</Badge>}
      />

      {/* ── SETUP PHASE ── */}
      {phase === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <GlassCard style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Brain size={24} color="#6366f1" />
              Configure Interview Vector
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Target Job Domain</label>
                <select 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                  style={selectStyle}
                >
                  {DOMAIN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Calibration Tier</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '12px',
                        border: difficulty === level ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.03)',
                        backgroundColor: difficulty === level ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255,255,255,0.01)',
                        color: difficulty === level ? 'white' : '#64748b',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              variant="primary" 
              icon={Play}
              onClick={startNewSession}
            >
              Start Session Terminal
            </Button>
          </GlassCard>

          {/* History */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} color="#f59e0b" />
                Past Sessions History
              </h4>
              <Badge variant="ghost">Top 10</Badge>
            </div>

            {loadingHistory ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Retrieving parameters...</p>
            ) : pastSessions.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>No simulation files created yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                {pastSessions.map(sess => (
                  <div 
                    key={sess._id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{sess.domain}</p>
                      <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                        {new Date(sess.completedAt).toLocaleDateString()} • {sess.difficulty?.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: sess.totalScore >= 70 ? '#10b981' : sess.totalScore >= 45 ? '#f59e0b' : '#ef4444' }}>
                        {sess.totalScore}%
                      </span>
                      <p style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Rating</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* ── LIVE SESSION PHASE ── */}
      {phase === 'session' && session && currentQuestion && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '4fr 8fr', gap: '2rem' }}>
          
          <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 35px rgba(239, 68, 68, 0.8)' : (avatarPulsing ? '0 0 35px rgba(99, 102, 241, 0.6)' : 'none'),
              animation: avatarPulsing ? 'pulse 2s infinite' : 'none',
              marginBottom: '2rem',
              border: `4px solid ${isListening ? '#ef4444' : 'rgba(255,255,255,0.08)'}`
            }}>
              <Cpu size={64} color="white" />
            </div>

            <Badge variant={isListening ? "danger" : "primary"} style={{ marginBottom: '0.75rem' }}>
              {isListening ? "Voice Mic Active..." : "Cognitive Agent"}
            </Badge>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>SkillSync Recruiter</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
              {isListening ? "Listening to your spoken answer..." : "Ready to evaluate your technical answer."}
            </p>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '2rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>PROGRESS</span>
                <span style={{ color: 'white', fontWeight: 800 }}>{answeredCount + 1} / {session.totalQuestions}</span>
              </div>
              <ProgressBar progress={((answeredCount) / session.totalQuestions) * 100} color="#6366f1" />
            </div>

            <button 
              onClick={quitActiveSession}
              style={{
                marginTop: '3rem',
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer'
              }}
            >
              Abort Interview
            </button>
          </GlassCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GlassCard style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Domain</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{session.domain} • {session.difficulty?.toUpperCase()}</p>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                backgroundColor: timeLeft < 15 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${timeLeft < 15 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                color: timeLeft < 15 ? '#ef4444' : 'white',
                fontWeight: 900
              }}>
                <Clock size={16} />
                <span>{timeLeft}s</span>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <HelpCircle size={16} color="#6366f1" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      Question Node {currentQuestion.index + 1}
                    </span>
                  </div>

                  {/* Speech to Text Toggle Button */}
                  <Button
                    variant={isListening ? "danger" : "ghost"}
                    size="sm"
                    icon={isListening ? MicOff : Mic}
                    onClick={toggleVoiceInput}
                    disabled={!speechSupported}
                  >
                    {isListening ? "Stop Voice Input" : "Speak Answer"}
                  </Button>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', lineHeight: 1.4, marginBottom: '2rem' }}>
                  {currentQuestion.text}
                </h3>

                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Formulate your response here using voice mic or text input... (mention core parameters, components, and methodologies)"
                  style={{
                    width: '100%',
                    minHeight: '180px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: isListening ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Word Count: {answerInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <Button 
                  variant="primary" 
                  icon={Send} 
                  loading={submittingAnswer} 
                  disabled={!answerInput.trim()}
                  onClick={() => submitCurrentAnswer(false)}
                >
                  Submit Node Response
                </Button>
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === 'results' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <GlassCard style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', color: 'rgba(16, 185, 129, 0.03)' }}>
              <Award size={200} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                width: '140px', 
                height: '140px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.01)',
                border: `8px solid ${report.totalScore >= 70 ? '#10b981' : report.totalScore >= 45 ? '#f59e0b' : '#ef4444'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
              }}>
                <p style={{ fontSize: '2.75rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{report.totalScore}%</p>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>Score</p>
              </div>

              <div>
                <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Session Analysis Completed</Badge>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Interview Report</h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
                  Domain: <span style={{ color: 'white', fontWeight: 800 }}>{report.domain}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="primary" icon={RotateCcw} onClick={startNewSession}>Re-run Simulation</Button>
                <Button variant="ghost" icon={ChevronLeft} onClick={() => setPhase('setup')}>Back to Terminal</Button>
              </div>
            </div>
          </GlassCard>

          {/* Question Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#6366f1" />
              Question-by-Question Evaluation
            </h4>

            {(report.answers || []).map((ans, idx) => (
              <GlassCard key={idx} style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h5 style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', flex: 1, marginRight: '1rem' }}>
                    {idx + 1}. {ans.question}
                  </h5>
                  <Badge variant={ans.tier === 'Excellent' ? 'success' : (ans.tier === 'Good' ? 'primary' : 'danger')}>
                    {ans.tier} ({ans.score}%)
                  </Badge>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Answer</p>
                  <p style={{ color: 'white', fontSize: '0.9rem' }}>{ans.userAnswer || 'No answer provided'}</p>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Target Answer Key</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{ans.correctAnswer}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.1em'
};

const selectStyle = {
  width: '100%',
  padding: '1rem 1.25rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: 600,
  outline: 'none'
};

export default MockInterview;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  Rocket, 
  TrendingUp, 
  ArrowRight,
  Brain,
  Zap,
  Clock,
  Briefcase,
  MessagesSquare,
  Building2,
  Trophy,
  CheckCircle2,
  ShieldPlus,
  ShieldAlert,
  Cpu,
  Star,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';
import api from '../api/axiosConfig';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge, ProgressBar, ScoreBar } from '../components/ui';

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    match_score: 0, 
    gaps_found: 0, 
    career_options: 0, 
    prep_readiness: 64, 
    performance_score: 0,
    ats_score: 0,
    tech_score: 0,
    profile_completeness: 0,
    resume_quality: 'Average',
    projects_count: 0,
    internships_count: 0,
    career_readiness: 0,
    interest_score: 0,
    project_score: 0,
    internship_score: 0,
    certification_score: 0,
    keyword_match: 0,
    target_company: '',
    target_role: '',
    analysis_count: 0
  });
  const [bestMatch, setBestMatch] = useState({ domain: "Web Development", confidence_score: 92 });
  const [recentVault, setRecentVault] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard')
      .then((res) => {
        if (res.data.success) {
          const dash = res.data.data;
          setStats({
            match_score: dash.metrics.careerSynergy,
            gaps_found: dash.metrics.criticalDeficits,
            career_options: dash.metrics.targetCompanies,
            prep_readiness: dash.metrics.prepReadiness,
            performance_score: dash.metrics.performanceScore,
            ats_score: dash.metrics.atsScore || 0,
            tech_score: dash.metrics.techScore || 0,
            profile_completeness: dash.metrics.profileCompleteness || 0,
            resume_quality: dash.metrics.resumeQuality || 'Average',
            projects_count: dash.metrics.projectsCount || 0,
            internships_count: dash.metrics.internshipsCount || 0,
            career_readiness: dash.metrics.careerReadiness || 0,
            interest_score: dash.metrics.interestScore || 0,
            project_score: dash.metrics.projectScore || 0,
            internship_score: dash.metrics.internshipScore || 0,
            certification_score: dash.metrics.certificationScore || 0,
            keyword_match: dash.metrics.keywordMatch || 0,
            target_company: dash.metrics.targetCompany || '',
            target_role: dash.metrics.targetRole || '',
            analysis_count: dash.metrics.analysisCount || 0
          });
          setBestMatch({
            domain: dash.topRole,
            confidence_score: dash.metrics.careerSynergy
          });
          setGaps(dash.skillGaps);
          setCompanies(dash.companyMatches);
          setRecentVault(dash.recentVault || []);
          
          // Map recent activity for the radar
          const activity = dash.recentActivity.map((msg, index) => ({
            time: index === 0 ? 'LIVE' : `${index * 2}h ago`,
            title: index === 0 ? 'System Intelligence' : 'Status Update',
            body: msg,
            type: index === 0 ? 'primary' : 'success'
          }));
          setActivityLogs(activity); 
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading Career Intelligence...</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Career"
        gradient="Suite"
        subtitle="The unified neural dashboard for skill analysis, career intelligence, and professional interview preparation."
        badge={<Badge variant="primary" icon={Zap}>SkillSync x EasyPrep Connected</Badge>}
      />

      {/* ── UNIFIED STATS GRID ── */}
      <div className="stats-grid" style={{ marginBottom: '3rem' }}>
        <StatCard icon={<TrendingUp size={24} />} value={`${stats.match_score}%`} label="Career Synergy" trend="+5.2%" color="var(--primary)" />
        <StatCard icon={<Trophy size={24} />} value={`${stats.prep_readiness}%`} label="Prep Readiness" trend="Resume + Test" color="#f59e0b" />
        <StatCard icon={<Activity size={24} />} value={stats.gaps_found} label="Critical Deficits" trend="Action Required" color="#f43f5e" />
        <StatCard icon={<Building2 size={24} />} value={stats.career_options} label="Target Entities" trend="Hiring" color="#10b981" />
      </div>

      <div className="main-grid">
        {/* ── LEFT: CAREER MAPPING & INTERVIEW WORKFLOW ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Integrated Intelligence Card */}
          <GlassCard style={{ border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Intelligence Mapping</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Optimal trajectory and placement preparation sync.</p>
              </div>
              <Badge variant="success" icon={CheckCircle2}>Synchronized</Badge>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', textAlign: 'center', minWidth: '200px' }}>
                 <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{bestMatch.confidence_score}%</p>
                 <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Alignment</p>
              </div>
              <div style={{ flex: 1 }}>
                 <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>{bestMatch.domain}</h4>
                 <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginBottom: '1.5rem' }}>Your profile matches the industry standard for {bestMatch.domain} architect roles.</p>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/interview-prep" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm" icon={MessagesSquare}>Start Prep</Button>
                    </Link>
                    <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
                      <Button variant="ghost" size="sm">Review Gaps</Button>
                    </Link>
                 </div>
              </div>
            </div>
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <GlassCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <Zap size={20} />
                  </div>
                  <h4 style={{ fontWeight: 800, color: 'white' }}>Contextual Prep</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {gaps.length > 0 ? gaps.map((gap, idx) => (
                    <RecommendedItem key={idx} label={gap} type={idx === 0 ? "Technical" : (idx === 1 ? "System" : "Core")} />
                  )) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No deficits identified. You are industry-ready.</p>
                  )}
                </div>
             </GlassCard>
             <GlassCard>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                    <Building2 size={20} />
                  </div>
                  <h4 style={{ fontWeight: 800, color: 'white' }}>Target Entities</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {companies.length > 0 ? companies.map((comp, idx) => (
                    <EntityItem key={idx} name={comp.name} match={`${comp.match}%`} color={comp.color} />
                  )) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Calculating company alignments...</p>
                  )}
                </div>
             </GlassCard>
          </div>

          {/* ── RESUME INTELLIGENCE METRICS & CHARTS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <GlassCard style={{ padding: '2rem' }}>
                <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <Brain size={20} color="#6366f1" />
                   Skill Distribution
                </h4>
                <div style={{ width: '100%', height: '240px' }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" radius="80%" data={[
                         { subject: 'Languages', A: stats.tech_score ? Math.round(stats.tech_score * 0.95) : 75 },
                         { subject: 'Frameworks', A: stats.ats_score ? Math.round(stats.ats_score * 0.9) : 80 },
                         { subject: 'Databases', A: stats.profile_completeness ? Math.round(stats.profile_completeness * 0.85) : 70 },
                         { subject: 'Cloud', A: stats.tech_score ? Math.round(stats.tech_score * 0.8) : 65 },
                         { subject: 'Tools', A: stats.ats_score ? Math.round(stats.ats_score * 0.88) : 85 }
                      ]}>
                         <PolarGrid stroke="rgba(255,255,255,0.05)" />
                         <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                         <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
             </GlassCard>

             <GlassCard style={{ padding: '2rem' }}>
                <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <Target size={20} color="#a855f7" />
                   Target Alignment
                </h4>
                <div style={{ width: '100%', height: '240px' }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(companies || []).map(c => ({ name: c.name, Match: typeof c.match === 'string' ? parseInt(c.match) : (c.match || 0) }))}>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                         <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                         <YAxis stroke="#64748b" fontSize={11} />
                         <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                         <Bar dataKey="Match" fill="url(#colorMatch)" radius={[4, 4, 0, 0]} />
                         <defs>
                            <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2}/>
                            </linearGradient>
                         </defs>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </GlassCard>
          </div>

          {/* ── CAREER READINESS METRICS (upgraded from old Resume Diagnostics) ── */}
          <GlassCard style={{ padding: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h4 style={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Brain size={20} color="#6366f1" />
                  Career Readiness Score
               </h4>
               {stats.analysis_count > 0 ? (
                 <Link to="/career-report" style={{ textDecoration: 'none' }}>
                   <Button variant="ghost" size="sm" icon={ArrowRight}>Full Report</Button>
                 </Link>
               ) : (
                 <Link to="/resume" style={{ textDecoration: 'none' }}>
                   <Button variant="primary" size="sm" icon={Zap}>Analyze Resume</Button>
                 </Link>
               )}
             </div>

             {stats.career_readiness > 0 ? (
               <>
                 {/* Overall score display */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem', padding: '1rem', borderRadius: '16px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                   <div style={{ textAlign: 'center', minWidth: '70px' }}>
                     <p style={{ fontSize: '2.25rem', fontWeight: 900, color: stats.career_readiness >= 70 ? '#10b981' : stats.career_readiness >= 55 ? '#6366f1' : '#f59e0b' }}>
                       {stats.career_readiness}%
                     </p>
                     <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>Readiness</p>
                   </div>
                   <div style={{ flex: 1 }}>
                     {stats.target_role && (
                       <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                         {stats.target_role}
                         {stats.target_company && <span style={{ color: '#818cf8' }}> @ {stats.target_company}</span>}
                       </p>
                     )}
                     <ProgressBar
                       progress={stats.career_readiness}
                       height={8}
                       color={stats.career_readiness >= 70 ? 'linear-gradient(90deg, #10b981, #6366f1)' : 'linear-gradient(90deg, #f59e0b, #f43f5e)'}
                     />
                   </div>
                 </div>

                 {/* Sub-score bars */}
                 <ScoreBar label="Area of Interest" score={stats.interest_score} maxScore={25} color="#6366f1" delay={0} />
                 <ScoreBar label="Projects" score={stats.project_score} maxScore={25} color="#a855f7" delay={0.1} />
                 <ScoreBar label="Internships" score={stats.internship_score} maxScore={25} color="#f59e0b" delay={0.2} />
                 <ScoreBar label="Certifications" score={stats.certification_score} maxScore={25} color="#10b981" delay={0.3} />

                 {/* Quick stats */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem' }}>
                   <div style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>ATS Score</p>
                     <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{stats.ats_score}%</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Keyword Match</p>
                     <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1' }}>{stats.keyword_match}%</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Tech Score</p>
                     <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{stats.tech_score}%</p>
                   </div>
                 </div>
               </>
             ) : (
               <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                 <Brain size={40} color="#334155" style={{ margin: '0 auto 1rem' }} />
                 <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, marginBottom: '1.25rem' }}>
                   No career analysis yet. Upload your resume to get your Career Readiness Score.
                 </p>
                 <Link to="/resume" style={{ textDecoration: 'none', display: 'inline-block' }}>
                   <Button variant="primary" size="sm" icon={Zap}>Analyze Now</Button>
                 </Link>
               </div>
             )}
          </GlassCard>

          {/* New Vault Widget */}
          <GlassCard>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                      <ShieldPlus size={20} />
                   </div>
                   <h4 style={{ fontWeight: 800, color: 'white' }}>Senior Guidance Feed</h4>
                </div>
                <Link to="/vault" style={{ textDecoration: 'none' }}>
                   <Button variant="ghost" size="sm" icon={ArrowRight}>Enter Vault</Button>
                </Link>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {recentVault.length > 0 ? recentVault.map(v => (
                  <div key={v._id} style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.3s' }} className="hover-card">
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{v.companyName}</span>
                        </div>
                        <Badge variant="ghost" size="sm" style={{ background: 'rgba(99, 102, 241, 0.05)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.1)' }}>{v.roundType}</Badge>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(45deg, #6366f1, #a855f7)', fontSize: '0.6rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {v.contributorName?.charAt(0) || 'S'}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>By {v.contributorName}</p>
                     </div>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>No recent guidance manifests available.</p>
                  </div>
                )}
             </div>
          </GlassCard>
        </div>

        {/* ── RIGHT: PLACEMENT ACTIVITY FEED ── */}
        <GlassCard>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99,102,241,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Rocket size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>Placement Radar</h3>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activityLogs.length > 0 ? activityLogs.map((item, idx) => (
                <ActivityItem key={idx} time={item.time} title={item.title} body={item.body} type={item.type} />
              )) : (
                <ActivityItem time="LIVE" title="Welcome" body="Complete your resume analysis to see real-time placement radar data." type="primary" />
              )}
            </div>

           <Link to="/companies" style={{ marginTop: '3rem', display: 'block' }}>
              <Button variant="ghost" fullWidth icon={Building2}>Explore Company Archive</Button>
           </Link>
        </GlassCard>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, trend, color }) => (
  <GlassCard style={{ padding: '1.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
      <div style={{ color }}>{icon}</div>
      <Badge variant={trend.includes('+') ? 'success' : 'primary'}>{trend}</Badge>
    </div>
    <h4 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem' }}>{value}</h4>
    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
  </GlassCard>
);

const RecommendedItem = ({ label, type }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
     <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{label}</span>
     <Badge variant="ghost" size="sm">{type}</Badge>
  </div>
);

const EntityItem = ({ name, match, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{name}</span>
     </div>
     <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>{match} Match</span>
  </div>
);

const ActivityItem = ({ time, title, body, type }) => (
  <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ position: 'absolute', left: '-4.5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: type === 'success' ? '#10b981' : (type === 'warning' ? '#f59e0b' : (type === 'primary' ? '#6366f1' : '#475569')) }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
      <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{title}</h5>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: time === 'LIVE' ? '#6366f1' : '#475569' }}>{time}</span>
    </div>
    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', lineHeight: 1.4 }}>{body}</p>
  </div>
);

export default Dashboard;

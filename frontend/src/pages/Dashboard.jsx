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
  ShieldPlus
} from 'lucide-react';
import api from '../api/axiosConfig';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge, ProgressBar } from '../components/ui';

const Dashboard = () => {
  const [stats, setStats] = useState({ match_score: 0, gaps_found: 0, career_options: 0, prep_readiness: 64 });
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
            performance_score: dash.metrics.performanceScore
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

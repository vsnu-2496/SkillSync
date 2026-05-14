import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  Star,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  MessagesSquare,
  BarChart3,
  Globe,
  DollarSign
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, ProgressBar } from '../components/ui';
import Modal from '../components/ui/Modal';

const COMPANIES = [
  { id: 1, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", totalQuestions: 234, difficulty: "Hard", roles: ["Software Engineer", "PM", "Data Scientist"], avgSalary: "$165k", growth: "+12%", hiringRate: 85 },
  { id: 2, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", totalQuestions: 189, difficulty: "Medium", roles: ["SDE", "Program Manager"], avgSalary: "$152k", growth: "+8%", hiringRate: 72 },
  { id: 3, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", totalQuestions: 267, difficulty: "Hard", roles: ["SDE", "Solutions Architect"], avgSalary: "$158k", growth: "+15%", hiringRate: 91 },
  { id: 4, name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", totalQuestions: 156, difficulty: "Medium", roles: ["SDE", "Data Engineer"], avgSalary: "$162k", growth: "+5%", hiringRate: 65 },
  { id: 5, name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg", totalQuestions: 412, difficulty: "Easy", roles: ["Assistant Systems Engineer", "System Engineer"], avgSalary: "₹7.5L", growth: "+20%", hiringRate: 98 },
  { id: 6, name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg", totalQuestions: 385, difficulty: "Easy", roles: ["Systems Engineer", "Power Programmer"], avgSalary: "₹6.8L", growth: "+18%", hiringRate: 95 },
  { id: 7, name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg", totalQuestions: 289, difficulty: "Medium", roles: ["ASE", "App Development Analyst"], avgSalary: "₹9.2L", growth: "+14%", hiringRate: 88 },
  { id: 8, name: "Zoho", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Zoho_Corporation_Logo.svg", totalQuestions: 145, difficulty: "Medium", roles: ["SDE", "Product Designer"], avgSalary: "₹12L", growth: "+10%", hiringRate: 78 }
];

const MOCK_QUESTIONS = [
  { id: 101, title: "LRU Cache Implementation", round: "Technical Round 1", category: "System Design", tags: ["OOD", "Caching"] },
  { id: 102, title: "Trapping Rain Water", round: "Technical Round 2", category: "Algorithms", tags: ["Hard", "Arrays"] },
  { id: 103, title: "State Management in Microfrontends", round: "Technical Round 1", category: "Web Architecture", tags: ["Frontend", "Scale"] },
  { id: 104, title: "Leadership Principles Deep Dive", round: "HR / Bar Raiser", category: "Behavioral", tags: ["Soft Skills", "Culture"] }
];

const CompanyExplorer = () => {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalType, setModalType] = useState(null); // 'analytics' | 'explorer'

  const filtered = COMPANIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
          placeholder="Filter by company name (e.g. Amazon, TCS, Zoho)..." 
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
        {filtered.map(company => (
           <GlassCard key={company.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                 <div style={{ 
                   width: '72px', 
                   height: '72px', 
                   borderRadius: '16px', 
                   background: 'white', 
                   padding: '12px', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                 }}>
                    <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{company.name}</h3>
                       <Badge variant={company.difficulty === 'Hard' ? 'danger' : (company.difficulty === 'Medium' ? 'warning' : 'success')}>
                          {company.difficulty}
                       </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Star size={14} color="#f59e0b" />
                          <span>4.8 Rating</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} />
                          <span>{company.totalQuestions} Questions</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div style={{ flex: 1 }}>
                 <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Common Roles</p>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {company.roles.map(role => (
                       <div key={role} style={{ 
                         padding: '0.5rem 0.75rem', 
                         borderRadius: '8px', 
                         background: 'rgba(255,255,255,0.02)', 
                         border: '1px solid rgba(255,255,255,0.05)', 
                         fontSize: '0.75rem', 
                         fontWeight: 700, 
                         color: '#94a3b8' 
                       }}>
                          {role}
                       </div>
                    ))}
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Button variant="ghost" icon={TrendingUp} fullWidth onClick={() => { setSelectedCompany(company); setModalType('analytics'); }}>Analytics</Button>
                <Button variant="primary" icon={ArrowRight} fullWidth onClick={() => { setSelectedCompany(company); setModalType('explorer'); }}>Explorer</Button>
              </div>
           </GlassCard>
        ))}
      </div>

      {/* ── ANALYTICS MODAL ── */}
      <Modal 
        isOpen={selectedCompany && modalType === 'analytics'} 
        onClose={() => setSelectedCompany(null)}
        title={`${selectedCompany?.name} Hiring Analytics`}
        subtitle="Market benchmarks and community placement trends."
        sidePanel
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
             <StatMini icon={<DollarSign size={16} />} label="Avg. Package" value={selectedCompany?.avgSalary} color="#10b981" />
             <StatMini icon={<BarChart3 size={16} />} label="Market Growth" value={selectedCompany?.growth} color="#6366f1" />
          </div>

          <div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Hiring Intensity</p>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>{selectedCompany?.hiringRate}%</span>
             </div>
             <ProgressBar progress={selectedCompany?.hiringRate || 0} />
          </div>

          <GlassCard hover={false} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={16} color="#f59e0b" />
                Critical Preparation Nodes
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SkillReq label="System Scalability" val={92} />
                <SkillReq label="Data Structures" val={88} />
                <SkillReq label="Cultural Alignment" val={75} />
             </div>
          </GlassCard>

          <Button variant="primary" fullWidth size="lg" icon={Globe}>View Full Placement Report</Button>
        </div>
      </Modal>

      {/* ── EXPLORER MODAL ── */}
      <Modal
        isOpen={selectedCompany && modalType === 'explorer'}
        onClose={() => setSelectedCompany(null)}
        title={`${selectedCompany?.name} Question Bank`}
        subtitle={`Exploring ${selectedCompany?.totalQuestions} community-verified interview identifiers.`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
             <input type="text" placeholder="Internal search for questions..." style={{ width: '100%', height: '48px', padding: '0 1rem 0 3.25rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {MOCK_QUESTIONS.map(q => (
               <div key={q.id} style={{ 
                 padding: '1.5rem', 
                 borderRadius: '16px', 
                 background: 'rgba(255,255,255,0.02)', 
                 border: '1px solid rgba(255,255,255,0.05)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between'
               }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                        <MessagesSquare size={18} />
                     </div>
                     <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>{q.title}</h5>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <Badge variant="ghost" size="sm">{q.round}</Badge>
                           <Badge variant="primary" size="sm">{q.category}</Badge>
                        </div>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm">Solve</Button>
               </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
             <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing 4 of {selectedCompany?.totalQuestions} questions.</p>
          </div>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-company-search:focus {
          border-color: rgba(99, 102, 241, 0.4) !important;
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
      `}} />
    </div>
  );
};

const StatMini = ({ icon, label, value, color }) => (
  <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
        {icon}
        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
     </div>
     <p style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</p>
  </div>
);

const SkillReq = ({ label, val }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>{label}</span>
     <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{val}% Priority</span>
  </div>
);

export default CompanyExplorer;

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  User, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Zap,
  Edit,
  Trash2,
  Award,
  Users,
  Target,
  BarChart,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge, Input } from '../components/ui';
import Modal from '../components/ui/Modal';

/**
 * InterviewVault
 * Enterprise-grade Local-First Guidance Hub.
 * Features background synchronization and resilient localStorage persistence.
 */
const InterviewVault = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [stats, setStats] = useState({ companies: 0, questions: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    roundType: 'Technical',
    questionsAsked: '',
    suggestions: '',
    importantTopics: '',
    difficulty: 'Medium'
  });

  // ── 1. INITIALIZE VAULT GRID ──
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Load from LocalStorage immediately for zero-lag UI (Requested Point 8)
      const cachedData = localStorage.getItem('interviewVaultData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setExperiences(parsed);
        updateSummary(parsed);
      }

      try {
        // Attempt to sync with real MongoDB backend (Requested Point 3)
        const res = await api.get('/vault/get');
        const remoteData = Array.isArray(res.data) ? res.data : [];
        if (remoteData.length > 0) {
          setExperiences(remoteData);
          updateSummary(remoteData);
          localStorage.setItem('interviewVaultData', JSON.stringify(remoteData));
        }
      } catch (err) {
        console.warn("Backend vault unreachable. Operating in high-fidelity local mode.");
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const updateSummary = (data) => {
    const uniqueCompanies = new Set(data.map(i => (i.companyName || "").toLowerCase().trim())).size;
    setStats({
      companies: uniqueCompanies,
      questions: data.length * 4,
      contributors: new Set(data.map(i => i.contributorName)).size
    });
  };

  const handleOpenForm = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        companyName: exp.companyName,
        role: exp.role,
        roundType: exp.roundType,
        questionsAsked: exp.questionsAsked,
        suggestions: exp.suggestions || '',
        importantTopics: exp.importantTopics?.join(', ') || '',
        difficulty: exp.difficulty
      });
    } else {
      setEditingExp(null);
      setFormData({
        companyName: '',
        role: '',
        roundType: 'Technical',
        questionsAsked: '',
        suggestions: '',
        importantTopics: '',
        difficulty: 'Medium'
      });
    }
    setIsFormOpen(true);
  };

  const handleViewDetails = (exp) => {
    setSelectedExp(exp);
    setIsDetailOpen(true);
  };

  // ── 2. NEW FULLY RECONSTRUCTED SAVE LOGIC (Requested Point 2 & 8) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Construct experience manifest
    const experienceManifest = {
      ...formData,
      importantTopics: formData.importantTopics.split(',').map(s => s.trim()).filter(Boolean),
      contributorName: user?.name || "Senior Student",
      createdAt: new Date().toISOString(),
      _id: editingExp ? editingExp._id : `LOCAL_${Date.now()}`
    };

    // A. INSTANT OPTIMISTIC UI UPDATE
    let updatedList;
    if (editingExp) {
      updatedList = experiences.map(exp => exp._id === editingExp._id ? experienceManifest : exp);
    } else {
      updatedList = [experienceManifest, ...experiences];
    }
    
    setExperiences(updatedList);
    updateSummary(updatedList);
    
    // B. SAVE TO LOCAL STORAGE IMMEDIATELY
    localStorage.setItem("interviewVaultData", JSON.stringify(updatedList));

    // C. CLOSE MODAL IMMEDIATELY (Requested Point 7)
    setIsFormOpen(false);

    // D. BACKGROUND SYNC TO MONGOBD (Requested Point 6)
    try {
      if (editingExp && !editingExp._id.startsWith('LOCAL_')) {
        await api.put(`/vault/update/${editingExp._id}`, experienceManifest);
      } else {
        // If it was a local card, or new, create on server
        await api.post('/vault/save', experienceManifest);
      }
      
      // Update with server-assigned properties (like real MongoDB _id)
      const res = await api.get('/vault/get');
      if (Array.isArray(res.data)) {
        setExperiences(res.data);
        localStorage.setItem('interviewVaultData', JSON.stringify(res.data));
      }
    } catch (apiErr) {
      // Requested Point 9: Remove generic failure popup, log exact error
      console.error("Backend Synchronization Bypass:", apiErr.response?.data || apiErr.message);
      // Data is already in state and localStorage, so user sees success.
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Purge this manifest from the guidance repository?")) {
      try {
        const updated = experiences.filter(e => e._id !== id);
        setExperiences(updated);
        updateSummary(updated);
        localStorage.setItem('interviewVaultData', JSON.stringify(updated));
        
        if (!id.toString().startsWith('LOCAL_')) {
          await api.delete(`/vault/delete/${id}`);
        }
      } catch (err) {
        console.error("Deletion sync failed:", err);
      }
    }
  };

  const filtered = experiences.filter(exp => {
    const matchesSearch = (exp.companyName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (exp.role || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || exp.roundType === categoryFilter;
    const matchesDifficulty = difficultyFilter === "All" || exp.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '2rem' }}>
        <PageHeader 
          title="Senior" 
          gradient="Guidance Hub" 
          subtitle="Collective intelligence manifests for specialized company preparation."
          badge={<Badge variant="primary" icon={Shield}>Intelligence Vault</Badge>}
        />
        <Button 
          variant="primary" 
          size="lg" 
          icon={Plus} 
          onClick={() => handleOpenForm()}
          style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)', minWidth: '260px' }}
        >
          Add Company Experience
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
         <InsightCard icon={<Building2 size={24} />} label="Companies Tracked" value={stats.companies} color="#6366f1" />
         <InsightCard icon={<BookOpen size={24} />} label="Shared Manifests" value={stats.questions} color="#a855f7" />
         <InsightCard icon={<Users size={24} />} label="Active Contributors" value={stats.contributors} color="#10b981" />
      </div>

      <GlassCard style={{ marginBottom: '3.5rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
             <p className="label-sm">Intel Search</p>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input type="text" placeholder="Find company interview details..." value={search} onChange={(e) => setSearch(e.target.value)} className="premium-input-vault" style={{ paddingLeft: '3.5rem' }} />
             </div>
          </div>
          <div style={{ width: '220px' }}>
             <p className="label-sm">Round Category</p>
             <div style={{ position: 'relative' }}>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="premium-input-vault">
                   {['All', 'Aptitude', 'Technical', 'HR', 'Core'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#475569' }} />
             </div>
          </div>
          <div style={{ width: '220px' }}>
             <p className="label-sm">Difficulty Level</p>
             <div style={{ position: 'relative' }}>
                <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="premium-input-vault">
                   {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#475569' }} />
             </div>
          </div>
          <Button variant="ghost" icon={Filter} onClick={() => { setSearch(""); setCategoryFilter("All"); setDifficultyFilter("All"); }}>Reset</Button>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {filtered.length > 0 ? filtered.map(exp => (
          <GlassCard key={exp._id} className="vault-entry-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                 <div className="icon-frame-vault"><Building2 size={26} /></div>
                 <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{exp.companyName}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{exp.role}</p>
                 </div>
              </div>
              <Badge variant={exp.difficulty === 'Hard' ? 'danger' : (exp.difficulty === 'Medium' ? 'warning' : 'success')}>{exp.difficulty}</Badge>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Badge variant="ghost" icon={Target}>{exp.roundType}</Badge>
                  <Badge variant="primary" icon={User}>{exp.contributorName}</Badge>
               </div>
               <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '16px' }}>
                  <p className="label-sm" style={{ color: '#475569', marginBottom: '0.5rem' }}>Strategic Manifest</p>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>
                     "{exp.suggestions ? (exp.suggestions.substring(0, 90) + '...') : 'Preparation suggestions banked in vault.'}"
                  </p>
               </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', pt: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {(user?.id === exp.createdBy || exp._id.toString().startsWith('LOCAL_')) && (
                    <>
                      <button onClick={() => handleDelete(exp._id)} className="vault-action-btn del"><Trash2 size={16} /></button>
                      <button onClick={() => handleOpenForm(exp)} className="vault-action-btn"><Edit size={16} /></button>
                    </>
                  )}
               </div>
               <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => handleViewDetails(exp)}>View Details</Button>
            </div>
          </GlassCard>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '32px' }}>
             <AlertCircle size={64} style={{ color: '#1e293b', margin: '0 auto 2.5rem auto' }} />
             <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>No experiences available</h3>
             <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 600, maxWidth: '450px', margin: '0 auto' }}>Company interview cards will render here immediately after saving.</p>
             <Button variant="primary" icon={Plus} style={{ marginTop: '2.5rem' }} onClick={() => handleOpenForm()}>Add Company Experience</Button>
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingExp ? "Edit Intel" : "Add Company Experience"} subtitle="Synchronize interview intelligence with the peer Guidance Hub." maxWidth="750px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
              <Input label="Enterprise Identity" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Amazon, Zoho" />
              <Input label="Professional Role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Frontend Developer" />
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <p className="label-sm">Logic Round</p>
                 <select value={formData.roundType} onChange={e => setFormData({...formData, roundType: e.target.value})} className="premium-input-vault">
                    {['Aptitude', 'Technical', 'HR', 'Core'].map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <p className="label-sm">Difficulty Rating</p>
                 <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="premium-input-vault">
                    {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
           </div>
           <div>
              <p className="label-sm" style={{ marginBottom: '0.75rem' }}>Questions Manifest</p>
              <textarea required className="premium-input-vault" style={{ height: '140px', padding: '1.25rem', resize: 'none' }} value={formData.questionsAsked} onChange={e => setFormData({...formData, questionsAsked: e.target.value})} placeholder="Detail the questions and challenges encountered..." />
           </div>
           <div>
              <p className="label-sm" style={{ marginBottom: '0.75rem' }}>Senior Preparation Pulse</p>
              <textarea className="premium-input-vault" style={{ height: '100px', padding: '1.25rem', resize: 'none' }} value={formData.suggestions} onChange={e => setFormData({...formData, suggestions: e.target.value})} placeholder="Tactical suggestions for peers..." />
           </div>
           <div>
              <p className="label-sm" style={{ marginBottom: '0.75rem' }}>Core Intelligence Topics</p>
              <textarea className="premium-input-vault" style={{ height: '80px', padding: '1.25rem', resize: 'none' }} value={formData.importantTopics} onChange={e => setFormData({...formData, importantTopics: e.target.value})} placeholder="e.g. Closure, DP, Culture-Fit" />
           </div>
           <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
              <Button type="button" variant="ghost" fullWidth onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" fullWidth icon={Zap}>Save Experience</Button>
           </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedExp?.companyName} subtitle={`${selectedExp?.role} | ${selectedExp?.roundType}`} maxWidth="800px">
        {selectedExp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Badge variant={selectedExp.difficulty === 'Hard' ? 'danger' : (selectedExp.difficulty === 'Medium' ? 'warning' : 'success')}>Difficulty: {selectedExp.difficulty}</Badge>
                <Badge variant="primary" icon={User}>Senior: {selectedExp.contributorName}</Badge>
             </div>
             <section>
                <h4 style={{ color: 'white', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MessageSquare size={20} className="text-secondary" /> Shared Questions</h4>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selectedExp.questionsAsked}</div>
             </section>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <section>
                   <h4 style={{ color: '#10b981', fontWeight: 850, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={18} /> Strategic Advice</h4>
                   <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', background: 'rgba(16, 185, 129, 0.04)', padding: '1.25rem', borderRadius: '16px' }}>{selectedExp.suggestions || "N/A"}</p>
                </section>
                <section>
                   <h4 style={{ color: '#6366f1', fontWeight: 850, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Target size={18} /> Required Topics</h4>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>{selectedExp.importantTopics?.map((topic, i) => (<Badge key={i} variant="ghost">{topic}</Badge>)) || "N/A"}</div>
                </section>
             </div>
             <Button variant="ghost" fullWidth onClick={() => setIsDetailOpen(false)}>Close Archive</Button>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .label-sm { font-size: 0.75rem; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; display: block; }
        .premium-input-vault { width: 100%; padding: 0 1.25rem; height: 56px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; color: white; font-size: 0.95rem; outline: none; transition: all 0.2s; appearance: none; }
        .premium-input-vault:focus { border-color: rgba(99, 102, 241, 0.4); background-color: rgba(255,255,255,0.04); }
        .vault-entry-card:hover { transform: translateY(-10px); border-color: rgba(99, 102, 241, 0.3) !important; box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.1); }
        .icon-frame-vault { width: 56px; height: 56px; border-radius: 18px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99, 102, 241, 0.2); display: flex; align-items: center; justify-content: center; color: #6366f1; }
        .vault-action-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .vault-action-btn:hover { background: rgba(99, 102, 241, 0.2); color: #818cf8; border-color: rgba(99, 102, 241, 0.3); }
        .vault-action-btn.del:hover { background: rgba(244, 63, 94, 0.15); color: #fb7185; border-color: rgba(244, 63, 94, 0.3); }
      `}} />
    </div>
  );
};

const InsightCard = ({ icon, label, value, color }) => (
  <GlassCard style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.75rem', transition: 'all 0.3s' }}>
    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>{icon}</div>
    <div>
      <h4 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{value}</h4>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>{label}</p>
    </div>
  </GlassCard>
);

export default InterviewVault;

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  ShieldCheck, 
  BarChart2, 
  CheckCircle, 
  XCircle,
  PlusCircle,
  Trash2,
  Filter
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { Button, GlassCard, Badge } from '../components/ui';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [vaultItems, setVaultItems] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    domain: '', type: 'MCQ', difficulty: 'medium', question: '', options: ['', '', '', ''], answer: ''
  });

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    try {
      if (tab === 'analytics') {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
      } else if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data || []);
      } else if (tab === 'vault') {
        const res = await api.get('/admin/vault');
        setVaultItems(res.data || []);
      } else if (tab === 'content') {
        const res = await api.get('/admin/questions');
        setQuestions(res.data || []);
      }
    } catch (err) {
      console.error('Admin API Error:', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await api.delete(`/admin/users/${id}`);
      fetchData('users');
    }
  };

  const handleApproveVault = async (id) => {
    await api.put(`/admin/vault/${id}/approve`);
    fetchData('vault');
  };

  const handleDeleteVault = async (id) => {
    if (window.confirm("Are you sure you want to delete this vault item?")) {
      await api.delete(`/admin/vault/${id}`);
      fetchData('vault');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/questions', newQuestion);
      alert('Question injected into neural bank.');
      setNewQuestion({ domain: '', type: 'MCQ', difficulty: 'medium', question: '', options: ['', '', '', ''], answer: '' });
      fetchData('content');
    } catch (err) {
      alert('Failed to add question.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Remove question from the neural bank?")) {
      await api.delete(`/admin/questions/${id}`);
      fetchData('content');
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'all') return true;
    return (u.role || 'student').toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Admin Control" 
        gradient="System Dashboard" 
        subtitle="Manage users, approve vault contributions, and maintain the intelligence network."
        badge={<Badge variant="primary" icon={ShieldCheck}>Master Access Active</Badge>}
      />

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart2} label="Analytics" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users Management" />
        <TabButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={Database} label="Vault Moderation" />
        <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={PlusCircle} label="Question Bank" />
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Total Users" value={stats.totalUsers} color="#6366f1" />
          <StatCard title="Resumes Processed" value={stats.usersWithResumes} color="#10b981" />
          <StatCard title="Vault Contributions" value={stats.totalVaultItems} color="#f59e0b" />
          <StatCard title="Pending Moderation" value={stats.pendingVaultItems} color="#ef4444" />
          <StatCard title="Neural Questions" value={stats.totalQuestions} color="#a855f7" />
          <StatCard title="Global Score Avg" value={`${stats.avgPerformance}%`} color="#3b82f6" />
        </div>
      )}

      {/* Users Tab with Role Filter */}
      {activeTab === 'users' && (
        <GlassCard style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>User Management Directory</h3>
            
            {/* Role Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="#64748b" />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="senior">Senior</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <div key={u._id} style={listItemStyle}>
                <div>
                  <p style={{ color: 'white', fontWeight: 800 }}>{u.name} <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>({u.email})</span></p>
                  <p style={{ color: '#6366f1', fontSize: '0.8rem' }}>Role: <span style={{ color: '#10b981', fontWeight: 700 }}>{(u.role || 'student').toUpperCase()}</span> • Institution: {u.university || 'N/A'}</p>
                </div>
                <button onClick={() => handleDeleteUser(u._id)} style={dangerButtonStyle}><Trash2 size={16} /> Delete</button>
              </div>
            )) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No users found matching selected role.</p>
            )}
          </div>
        </GlassCard>
      )}

      {/* Vault Moderation Tab */}
      {activeTab === 'vault' && (
        <GlassCard style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1rem' }}>Vault Contributions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(vaultItems || []).map(item => (
              <div key={item._id} style={{ ...listItemStyle, borderLeft: item.isApproved ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontWeight: 800 }}>{item.companyName} • {item.role} <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>by {item.contributorName}</span></p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>{item.questionsAsked?.substring(0, 80)}...</p>
                  <Badge variant={item.isApproved ? 'success' : 'warning'} style={{ marginTop: '0.5rem' }}>
                    {item.isApproved ? 'Approved & Public' : 'Pending Review'}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!item.isApproved && (
                    <button onClick={() => handleApproveVault(item._id)} style={successButtonStyle}><CheckCircle size={16} /> Approve</button>
                  )}
                  <button onClick={() => handleDeleteVault(item._id)} style={dangerButtonStyle}><XCircle size={16} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '4fr 8fr', gap: '2rem' }}>
          <GlassCard style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem' }}>Inject New Question</h3>
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder="Domain (e.g., Web Development)" value={newQuestion.domain} onChange={e => setNewQuestion({...newQuestion, domain: e.target.value})} style={inputStyle} required />
              <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} style={inputStyle}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <textarea placeholder="Question Text" value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} style={{ ...inputStyle, minHeight: '80px' }} required />
              {newQuestion.options.map((opt, i) => (
                <input key={i} placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                  const opts = [...newQuestion.options];
                  opts[i] = e.target.value;
                  setNewQuestion({...newQuestion, options: opts});
                }} style={inputStyle} required />
              ))}
              <input placeholder="Exact Correct Answer" value={newQuestion.answer} onChange={e => setNewQuestion({...newQuestion, answer: e.target.value})} style={inputStyle} required />
              <Button type="submit" variant="primary" fullWidth>Inject Question Node</Button>
            </form>
          </GlassCard>

          <GlassCard style={{ padding: '2rem', maxHeight: '700px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1rem' }}>Neural Question Bank</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(questions || []).map(q => (
                <div key={q._id} style={listItemStyle}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 800 }}>{q.question}</p>
                    <p style={{ color: '#6366f1', fontSize: '0.8rem' }}>{q.domain} • {q.difficulty?.toUpperCase()}</p>
                  </div>
                  <button onClick={() => handleDeleteQuestion(q._id)} style={dangerButtonStyle}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

// Sub-components and Styles
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1.5rem', borderRadius: '12px',
    backgroundColor: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    border: `1px solid ${active ? '#6366f1' : 'transparent'}`,
    color: active ? 'white' : '#94a3b8',
    fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
  }}>
    <Icon size={18} /> {label}
  </button>
);

const StatCard = ({ title, value, color }) => (
  <GlassCard style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${color}` }}>
    <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{title}</p>
    <p style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900, marginTop: '0.5rem' }}>{value}</p>
  </GlassCard>
);

const listItemStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'
};

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', backgroundColor: '#090d16',
  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white',
  outline: 'none', fontFamily: 'inherit'
};

const dangerButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.5rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444',
  borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
};

const successButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.5rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981',
  borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
};

export default AdminDashboard;

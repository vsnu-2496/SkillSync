import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  BookOpen,
  LogOut,
  Sparkles,
  Settings,
  CreditCard,
  X,
  MessagesSquare,
  Building2,
  Workflow,
  Cpu,
  ShieldPlus,
  Brain,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INTELLIGENCE_ITEMS = [
  { name: 'Dashboard',          icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Neural Analysis',    icon: FileText,         path: '/resume' },
  { name: 'Analysis History',   icon: History,          path: '/history' },
  { name: 'Career Mapping',     icon: Briefcase,        path: '/careers' },
  { name: 'Skill Matrix',       icon: Target,           path: '/skill-gap' },
  { name: 'System Logic',       icon: Cpu,              path: '/how-it-works' },
];

const EXECUTION_ITEMS = [
  { name: 'Interview Prep',   icon: MessagesSquare, path: '/interview-prep' },
  { name: 'Mock Interview',   icon: Brain,          path: '/mock-interview' },
  { name: 'Company Explorer', icon: Building2,      path: '/companies' },
  { name: 'Interview Vault',   icon: ShieldPlus,     path: '/interview-vault' },
];

const ADMIN_ITEMS = [
  { name: 'Admin Dashboard',  icon: ShieldPlus, path: '/admin' }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar" style={{
      transform: isOpen ? 'translateX(0)' : (window.innerWidth < 1024 ? 'translateX(-100%)' : 'translateX(0)'),
      position: window.innerWidth < 1024 ? 'fixed' : 'relative',
    }}>
      {/* Brand */}
      <div style={{ height: '80px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={16} />
          </div>
          <div style={{ lineHeight: 1 }}>
            <p style={{ fontSize: '1rem', fontWeight: 900, color: 'white', tracking: '-0.02em' }}>SkillSync AI</p>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>Professional</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: window.innerWidth < 1024 ? 'block' : 'none' }}>
          <X size={20} />
        </button>
      </div>

      {/* Sync Status Badge */}
      {user?.hasResume && (
        <div style={{ padding: '1rem 1.5rem', marginBottom: '-0.5rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Neural Sync Active</span>
          </div>
          <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }' }} />
        </div>
      )}

      {/* Navigation */}
      <div style={{ flex: 1, padding: '1.5rem 1rem', overflowY: 'auto' }}>
        
        {/* Intelligence Group (Hidden for Admins) */}
        {user?.role !== 'admin' && (
          <>
            <p style={{ padding: '0 0.5rem', marginBottom: '1rem', fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2.5rem' }}>
              {INTELLIGENCE_ITEMS.map((item) => (
                <SidebarLink key={item.path} item={item} active={location.pathname === item.path} />
              ))}
            </nav>
          </>
        )}

        {/* Execution Group (Hidden for Admins) */}
        {user?.role !== 'admin' && (
          <>
            <p style={{ padding: '0 0.5rem', marginBottom: '1rem', fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Execution (EasyPrep)</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2.5rem' }}>
              {EXECUTION_ITEMS.map((item) => (
                <SidebarLink key={item.path} item={item} active={location.pathname === item.path} />
              ))}
            </nav>
          </>
        )}

        {/* Admin Group (Conditional) */}
        {user?.role === 'admin' && (
          <>
            <p style={{ padding: '0 0.5rem', marginBottom: '1rem', fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Controls</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2.5rem' }}>
              {ADMIN_ITEMS.map((item) => (
                <SidebarLink key={item.path} item={item} active={location.pathname === item.path} />
              ))}
            </nav>
          </>
        )}

        {/* Configuration Group */}
        <p style={{ padding: '0 0.5rem', marginBottom: '1rem', fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configuration</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link to="#" style={linkStyle(false)}>
            <CreditCard size={18} />
            <span>Billing</span>
          </Link>
          <Link to="/settings" style={linkStyle(location.pathname === '/settings')}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              style={{...linkStyle(false), width: '100%', background: 'rgba(99, 102, 241, 0.05)', color: '#6366f1', border: '1px dashed rgba(99, 102, 241, 0.3)', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              <Workflow size={18} />
              <span>Install Neural Desktop</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(244, 63, 94, 0.05)',
            color: '#f43f5e',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)'}
        >
          <LogOut size={18} />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarLink = ({ item, active }) => (
  <Link
    to={item.path}
    style={linkStyle(active)}
  >
    <item.icon size={18} />
    <span>{item.name}</span>
  </Link>
);

const linkStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: active ? '#6366f1' : '#94a3b8',
  backgroundColor: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
  transition: 'all 0.2s',
  border: active ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent'
});

export default Sidebar;

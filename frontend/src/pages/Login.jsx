import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';
import { Button, Input } from '../components/ui';

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.hasResume) {
        navigate('/dashboard');
      } else {
        navigate('/resume');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Neural Uplink failed. Verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#020617' }}>
      <div style={{ flex: 1, padding: '5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)', background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.1), transparent 50%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Sparkles size={20} /></div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>SkillSync AI</span>
        </div>
        <div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>Accelerate Your<br /><span className="text-gradient">Career Journey</span></h1>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', fontWeight: 500, maxWidth: '500px', lineHeight: 1.6, marginBottom: '4rem' }}>Leverage neural intelligence to identify your competitive edge and bridge the gap to your dream role.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <FeatureItem icon={<Cpu size={22} />} title="Neural Ingestion" desc="Deep-parsing of your professional identity manifest." />
            <FeatureItem icon={<Zap size={22} />} title="Synergy Mapping" desc="AI-driven roadmaps architected from industry trends." />
            <FeatureItem icon={<ShieldCheck size={22} />} title="Security Protocols" desc="Bank-level encryption for your career data." />
          </div>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>© 2024 SKILLSYNC AI · OPERATIONAL GATEWAY</p>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem', backgroundColor: '#04091d' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600, marginBottom: '3rem' }}>Access your professional portal</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <Input label="Corporate Email" icon={Mail} type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
            <Input label="Password" icon={Lock} type="password" required placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" fullWidth loading={isSubmitting} icon={ArrowRight}>Initialize Sync</Button>
          </form>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
             <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>New to the Ecosystem? <Link to="/register" style={{ color: '#6366f1', fontWeight: 800, textDecoration: 'none' }}>Register Node</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>{icon}</div>
    <div><h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>{title}</h4><p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{desc}</p></div>
  </div>
);

export default Login;

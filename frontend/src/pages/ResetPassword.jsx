import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Button, Input } from '../components/ui';
import api from '../api/axiosConfig';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(response.data.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
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
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: '2rem', letterSpacing: '-0.04em' }}>Restore Your<br /><span className="text-gradient">Access</span></h1>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', fontWeight: 500, maxWidth: '500px', lineHeight: 1.6, marginBottom: '4rem' }}>Set your new corporate password security credentials.</p>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>© 2024 SKILLSYNC AI · SECURITY LAYER</p>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem', backgroundColor: '#04091d' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>Reset Password</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600, marginBottom: '3rem' }}>Enter your new secure access credentials</p>

          {error && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <Input label="New Password" icon={Lock} type="password" required placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm New Password" icon={Lock} type="password" required placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button type="submit" fullWidth loading={isSubmitting} icon={ArrowRight}>Update Credentials</Button>
          </form>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
             <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}><Link to="/login" style={{ color: '#6366f1', fontWeight: 800, textDecoration: 'none' }}>Return to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

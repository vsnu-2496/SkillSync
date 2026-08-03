import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  Upload, 
  Save, 
  Bell, 
  Palette, 
  Check, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  KeyRound,
  LogOut,
  Target
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { GlassCard, Button, Badge } from '../components/ui';

const PRESET_GRADIENTS = [
  { name: 'Cyber Indigo', value: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { name: 'Solar Fusion', value: 'linear-gradient(135deg, #ff007f, #7f00ff)' },
  { name: 'Neon Emerald', value: 'linear-gradient(135deg, #10b981, #059669)' },
  { name: 'Oceanic Glow', value: 'linear-gradient(135deg, #0284c7, #0369a1)' },
  { name: 'Supernova', value: 'linear-gradient(135deg, #f59e0b, #e11d48)' },
  { name: 'Nebula', value: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }
];

const SettingsPage = () => {
  const { user, refreshUser, logout } = useAuth();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [yearLevel, setYearLevel] = useState('Year 1');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student');
  const [profileImage, setProfileImage] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Settings toggles
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUniversity(user.university || '');
      setYearLevel(user.yearLevel || 'Year 1');
      setDepartment(user.department || 'Computer Science');
      setRole(user.role || 'student');
      setTargetCompany(user.targetCompany || '');
      setTargetRole(user.targetRole || '');
      setProfileImage(user.profileImage || 'gradient:linear-gradient(135deg, #6366f1, #a855f7)');
      
      if (user.settings) {
        setTheme(user.settings.theme || 'dark');
        setNotifications(user.settings.notifications ?? true);
        setPrivacyMode(user.settings.privacyMode ?? false);
      }
    }
  }, [user]);

  // Handle custom image file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Only image files are allowed!');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    setMessage(null);

    try {
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data?.user) {
        setProfileImage(response.data.user.profileImage);
        showFeedback('success', 'Custom avatar uploaded successfully!');
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', err.response?.data?.error || 'Failed to upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  // Select a preset gradient
  const selectPreset = (gradValue) => {
    setProfileImage(`gradient:${gradValue}`);
  };

  // Feedback helper
  const showFeedback = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Submit profile & settings update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name,
        university,
        yearLevel,
        department,
        role,
        profileImage,
        targetCompany,
        targetRole,
        settings: {
          theme,
          notifications,
          privacyMode
        }
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await api.put('/auth/profile/update', payload);

      if (response.data) {
        showFeedback('success', 'Profile and preferences updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', err.response?.data?.error || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  // Render current avatar preview
  const renderAvatarPreview = () => {
    if (profileImage) {
      if (profileImage.startsWith('linear-gradient') || profileImage.startsWith('gradient:')) {
        const grad = profileImage.replace('gradient:', '');
        return (
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '24px',
            background: grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2.8rem',
            fontWeight: 900,
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            {name ? name.charAt(0).toUpperCase() : <User size={44} />}
          </div>
        );
      } else {
        const imageUrl = profileImage.startsWith('http') 
          ? profileImage 
          : `http://localhost:5000${profileImage}`;
        return (
          <img 
            src={imageUrl} 
            alt="Avatar Preview" 
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '24px',
              objectFit: 'cover',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<div style="width: 110px; height: 110px; border-radius: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.8rem; font-weight: 900;">${name ? name.charAt(0).toUpperCase() : 'U'}</div>`;
            }}
          />
        );
      }
    }

    return (
      <div style={{
        width: '110px',
        height: '110px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
      }}>
        <User size={44} />
      </div>
    );
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Account"
        gradient="Settings"
        subtitle="Manage your profile, target benchmarks, security parameters, and preferences."
        badge={<Badge variant="primary" icon={Sliders}>Settings Module</Badge>}
      />

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              marginBottom: '2rem', 
              padding: '1.25rem 1.5rem', 
              borderRadius: '16px', 
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
              color: message.type === 'success' ? '#10b981' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Identity Vector GlassCard */}
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Profile Coordinates</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem' }}>Update your identity and academic details.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>University / Institute</label>
                  <input 
                    type="text" 
                    value={university} 
                    onChange={(e) => setUniversity(e.target.value)} 
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Year Level</label>
                  <select 
                    value={yearLevel} 
                    onChange={(e) => setYearLevel(e.target.value)} 
                    style={selectStyle}
                  >
                    <option value="Year 1">Year 1 (Freshman)</option>
                    <option value="Year 2">Year 2 (Sophomore)</option>
                    <option value="Year 3">Year 3 (Junior)</option>
                    <option value="Year 4">Year 4 (Senior)</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Department / Stream</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    style={selectStyle}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Target Career Benchmarks */}
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#6366f1" /> Target Career Benchmarks
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '1.5rem' }}>Set your preferred target company and role for AI matching.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Target Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google, Microsoft, Amazon" 
                    value={targetCompany} 
                    onChange={(e) => setTargetCompany(e.target.value)} 
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Target Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Software Engineer, Data Scientist" 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                    style={inputStyle}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Password Security */}
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} color="#f59e0b" /> Change Password
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '1.5rem' }}>Leave blank if you do not want to change your password.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    style={inputStyle}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Avatar & System Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Profile Avatar</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem', alignSelf: 'flex-start' }}>Upload an avatar image or choose a preset.</p>
              
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                {renderAvatarPreview()}
              </div>

              <label style={{
                padding: '0.65rem 1.25rem', borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 700,
                fontSize: '0.82rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'
              }}>
                <Upload size={16} />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'left' }}>Presets</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {PRESET_GRADIENTS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => selectPreset(p.value)}
                      style={{
                        height: '36px', borderRadius: '10px', background: p.value, border: 'none', cursor: 'pointer'
                      }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Submit & Session Actions */}
            <GlassCard>
              <Button type="submit" variant="primary" fullWidth size="lg" icon={Save} loading={saving}>
                Save All Changes
              </Button>

              <button
                type="button"
                onClick={logout}
                style={{
                  width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </GlassCard>
          </div>
        </div>
      </form>
    </div>
  );
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const inputStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none'
};

const selectStyle = {
  ...inputStyle,
  background: 'rgba(15,23,42,0.9)',
  cursor: 'pointer'
};

export default SettingsPage;

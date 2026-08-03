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
  Globe
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
  const { user, refreshUser } = useAuth();
  
  // Form states
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [yearLevel, setYearLevel] = useState('Year 1');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState('student');
  const [profileImage, setProfileImage] = useState('');
  
  // Settings toggles
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUniversity(user.university || '');
      setYearLevel(user.yearLevel || 'Year 1');
      setDepartment(user.department || 'Computer Science');
      setRole(user.role || 'student');
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
      const response = await api.put('/auth/profile/update', {
        name,
        university,
        yearLevel,
        department,
        role,
        profileImage,
        settings: {
          theme,
          notifications,
          privacyMode
        }
      });

      if (response.data) {
        showFeedback('success', 'System parameters updated and synchronized.');
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', err.response?.data?.error || 'Synchronization failed.');
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
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            background: grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem',
            fontWeight: 900,
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            {name ? name.charAt(0).toUpperCase() : <User size={48} />}
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
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              objectFit: 'cover',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<div style="width: 120px; height: 120px; border-radius: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 900;">${name ? name.charAt(0).toUpperCase() : 'U'}</div>`;
            }}
          />
        );
      }
    }

    return (
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
      }}>
        <User size={48} />
      </div>
    );
  };

  return (
    <div className="animate-fade-up">
      <PageHeader 
        title="Neural"
        gradient="Settings"
        subtitle="Manage your identity vector, system configuration, and placement preference matrix."
        badge={<Badge variant="primary" icon={Sliders}>Configuration Module</Badge>}
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
        
        {/* Main Grid: Left Settings & Details, Right Avatar selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '7fr 5fr', gap: '2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Identity Vector GlassCard */}
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Identity Vector</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem' }}>Customize your professional coordinates for exact recruiting sync.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1fr', gap: '1.5rem' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>System Role</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                    <label style={roleCardStyle(role === 'student')}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="student" 
                        checked={role === 'student'} 
                        onChange={() => setRole('student')}
                        style={{ display: 'none' }}
                      />
                      <Sparkles size={16} color={role === 'student' ? '#6366f1' : '#64748b'} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 800, color: role === 'student' ? 'white' : '#64748b', fontSize: '0.85rem' }}>Student</p>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Standard career trajectories and tests.</p>
                      </div>
                    </label>
                    <label style={roleCardStyle(role === 'senior')}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="senior" 
                        checked={role === 'senior'} 
                        onChange={() => setRole('senior')}
                        style={{ display: 'none' }}
                      />
                      <Palette size={16} color={role === 'senior' ? '#a855f7' : '#64748b'} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 800, color: role === 'senior' ? 'white' : '#64748b', fontSize: '0.85rem' }}>Senior</p>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Contribute manifests to Interview Vault.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            </GlassCard>

            {/* Neural System Parameters */}
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>System Parameters</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '2rem' }}>Configure visual state and communication channels.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Theme Selector */}
                <div 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  style={{ ...switchRowStyle, cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={iconBoxStyle('#6366f1')}>
                      <Palette size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Neural Dark Theme</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Uses highly optimized deep space palette.</p>
                    </div>
                  </div>
                  <div style={switchStyle}>
                    <div style={switchKnobStyle(theme === 'dark')} />
                  </div>
                </div>

                {/* Notifications Switch */}
                <div 
                  onClick={() => setNotifications(!notifications)}
                  style={{ ...switchRowStyle, cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={iconBoxStyle('#f59e0b')}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Desktop Notifications</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Allow real-time notifications about assessment results.</p>
                    </div>
                  </div>
                  <div style={switchStyle}>
                    <div style={switchKnobStyle(notifications)} />
                  </div>
                </div>

                {/* Privacy Mode Switch */}
                <div 
                  onClick={() => setPrivacyMode(!privacyMode)}
                  style={{ ...switchRowStyle, cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={iconBoxStyle('#10b981')}>
                      {privacyMode ? <Lock size={20} /> : <Globe size={20} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>Stealth Privacy Mode</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{privacyMode ? 'Your data is encrypted and invisible to partner entities.' : 'Partner recruiting entities can scan your placement score.'}</p>
                    </div>
                  </div>
                  <div style={switchStyle}>
                    <div style={switchKnobStyle(privacyMode)} />
                  </div>
                </div>

              </div>
            </GlassCard>
          </div>

          {/* Right Column: Avatar Uplink */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Avatar Uplink</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '2.5rem', alignSelf: 'flex-start' }}>Choose preset linear coordinates or upload a custom image.</p>
              
              {/* Avatar Preview */}
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                {renderAvatarPreview()}
                
                {uploading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '24px',
                    backgroundColor: 'rgba(2, 6, 23, 0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s',
                marginBottom: '2.5rem'
              }} className="hover-card">
                <Upload size={16} />
                <span>Upload Custom Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>

              {/* Preset Gradients */}
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', textAlign: 'left' }}>Preset Neural Clusters</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {PRESET_GRADIENTS.map((grad) => {
                    const isSelected = profileImage === `gradient:${grad.value}`;
                    return (
                      <button
                        key={grad.name}
                        type="button"
                        onClick={() => selectPreset(grad.value)}
                        style={{
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                          border: isSelected ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: grad.value,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {isSelected && <Check size={16} />}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: isSelected ? 'white' : '#64748b', fontWeight: 800 }}>{grad.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </GlassCard>
          </div>

        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Button 
            type="submit" 
            variant="primary" 
            loading={saving} 
            icon={Save}
          >
            Save Parameters
          </Button>
        </div>

      </form>
    </div>
  );
};

// Styles
const labelStyle = {
  fontSize: '0.7rem',
  fontWeight: 800,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  paddingLeft: '4px'
};

const inputStyle = {
  width: '100%',
  height: '52px',
  padding: '0 1.25rem',
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const selectStyle = {
  width: '100%',
  height: '52px',
  padding: '0 1.25rem',
  backgroundColor: '#090d16',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.9rem',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const roleCardStyle = (active) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.25rem',
  borderRadius: '16px',
  border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.03)',
  backgroundColor: active ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const switchRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.25rem',
  borderRadius: '16px',
  backgroundColor: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.03)'
};

const iconBoxStyle = (color) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: `rgba(${color === '#6366f1' ? '99,102,241' : (color === '#f59e0b' ? '245,158,11' : '16,185,129')}, 0.1)`,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const switchStyle = {
  position: 'relative',
  display: 'inline-block',
  width: '48px',
  height: '28px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '99px',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const switchKnobStyle = (active) => ({
  position: 'absolute',
  top: '3px',
  left: active ? '23px' : '3px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: active ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#475569',
  boxShadow: active ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
});

export default SettingsPage;

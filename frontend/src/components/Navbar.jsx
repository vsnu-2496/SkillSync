import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Menu, ChevronDown, Sparkles, LayoutDashboard, Sliders, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderAvatar = () => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith('linear-gradient') || user.profileImage.startsWith('gradient:')) {
        const grad = user.profileImage.replace('gradient:', '');
        return (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
        );
      } else {
        const imageUrl = user.profileImage.startsWith('http') 
          ? user.profileImage 
          : `http://localhost:5000${user.profileImage}`;
        return (
          <img 
            src={imageUrl} 
            alt={user.name} 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              // Set up inline fallback in case image fails to load
              const parent = e.target.parentNode;
              if (parent) {
                parent.innerHTML = `<div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800;">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>`;
              }
            }}
          />
        );
      }
    }

    return (
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
      }}>
        <User size={20} />
      </div>
    );
  };

  return (
    <header className="navbar">
      {/* Left side: Menu toggle + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>

        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search neural database..."
            style={{
              width: '100%',
              height: '44px',
              padding: '0 1rem 0 2.5rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>
      </div>

      {/* Right side: Actions + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <Sparkles size={12} />
          <span>PRO ENGINE</span>
        </button>

        <div style={{ position: 'relative', color: '#94a3b8', cursor: 'pointer' }}>
          <Bell size={22} />
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#f43f5e',
            borderRadius: '50%',
            border: '2px solid #020617'
          }} />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* User Profile Dropper Trigger Container */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                {user?.name || 'Operator'}
              </p>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                {user?.yearLevel || 'Level 1'}
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              {renderAvatar()}
            </div>
            <ChevronDown 
              size={14} 
              color="#64748b" 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.2s ease-in-out' 
              }}
            />
          </div>

          {/* Floating Glassmorphic Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '55px',
              right: 0,
              width: '200px',
              backgroundColor: 'rgba(9, 13, 22, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '0.75rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div 
                onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                style={dropdownItemStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              <div 
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                style={dropdownItemStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Sliders size={16} />
                <span>Settings</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '0.5rem 0' }} />
              <div 
                onClick={handleLogout}
                style={{ ...dropdownItemStyle, color: '#f43f5e' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.08)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                <span>Exit System</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  color: '#94a3b8',
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
  userSelect: 'none'
};

export default Navbar;

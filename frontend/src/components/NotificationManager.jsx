import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const NotificationManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 1. Request Permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // 2. Check Activity Status
    const checkActivity = async () => {
      try {
        const res = await api.get('/notifications/status');
        if (res.data.success && res.data.isInactive) {
          showNotification(res.data.message);
        }
      } catch (err) {
        console.warn("Neural Notification Uplink failed.");
      }
    };

    // Initial check after 5 seconds to not overwhelm the UI
    const timer = setTimeout(checkActivity, 5000);
    
    // Periodically check every 4 hours
    const interval = setInterval(checkActivity, 4 * 60 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user]);

  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification("SkillSync AI Pro", {
        body: message,
        icon: '/favicon.ico', // Ensure path is correct or use a public URL
        badge: '/favicon.ico',
        tag: 'inactivity-reminder'
      });
    }
  };

  return null; // Silent component
};

export default NotificationManager;

import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { getNetworkErrorMessage } from '../api';

const AuthContext = createContext(null);

const normalizeUser = (data) => {
  // Supports both legacy array response and current object response
  if (Array.isArray(data)) {
    return {
      id: data[0],
      name: data[1],
      email: data[2]
    };
  }

  if (data && typeof data === 'object') {
    return {
      id: data.id ?? data.user_id,
      name: data.name,
      email: data.email
    };
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const res = await API.get(`profile/${userId}`);
          const restoredUser = normalizeUser(res.data);
          if (restoredUser?.id) {
            setUser(restoredUser);
          } else {
            localStorage.removeItem('user_id');
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('user_id');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('login', { email, password });
      if (res.data.user_id) {
        localStorage.setItem('user_id', res.data.user_id);
        const profileRes = await API.get(`profile/${res.data.user_id}`);
        const userData = normalizeUser(profileRes.data);
        if (!userData?.id) {
          return { success: false, error: 'Invalid profile response' };
        }
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: 'Invalid login response' };
    } catch (err) {
      return {
        success: false,
        error: getNetworkErrorMessage(err) || err.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

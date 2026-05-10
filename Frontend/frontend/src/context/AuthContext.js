import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const res = await API.get(`/profile/${userId}`);
          // res.data: [id, name, email]
          setUser({
            id: res.data[0],
            name: res.data[1],
            email: res.data[2]
          });
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
      const res = await API.post('/login', { email, password });
      if (res.data.user_id) {
        localStorage.setItem('user_id', res.data.user_id);
        const profileRes = await API.get(`/profile/${res.data.user_id}`);
        const userData = {
          id: profileRes.data[0],
          name: profileRes.data[1],
          email: profileRes.data[2]
        };
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
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

import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bracu_bazaar_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Corrupted bracu_bazaar_user localStorage cleared:", e);
      try { localStorage.removeItem('bracu_bazaar_user'); } catch (_) {}
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bracu_bazaar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bracu_bazaar_user');
    }
  }, [user]);

  const login = async (studentIdOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ studentIdOrEmail, password })
      });

      setUser(data);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // 8-digit student ID check
      if (!/^\d{8}$/.test(userData.studentId.trim())) {
        throw new Error('Student ID must consist of exactly 8 numeric digits!');
      }

      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      setUser(data);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bracu_bazaar_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      loading: false,
      error: null,
      login: async () => ({ success: false, error: 'Auth unavailable' }),
      register: async () => ({ success: false, error: 'Auth unavailable' }),
      logout: () => {},
      isAdmin: false
    };
  }
  return context;
};

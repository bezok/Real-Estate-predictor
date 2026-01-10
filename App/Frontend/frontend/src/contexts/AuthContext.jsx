import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function checkAuth() {
    try {
      const res = await api.get('/api/me/');
      if (res && res.username) setUser({ username: res.username });
      else setUser(null);
    } catch (e) {
      setUser(null);
    }
  }

  async function login(username, password) {
    await api.fetchCsrf();
    const res = await api.post('/api/login/', { username, password });
    if (res && res.success) {
      await checkAuth();
      return res;
    }
    throw new Error(res.error || 'Login failed');
  }

  async function register(username, email, password) {
    await api.fetchCsrf();
    const res = await api.post('/api/register/', { username, email, password });
    if (res && res.success) {
      await checkAuth();
      return res;
    }
    throw new Error(res.error || 'Register failed');
  }

  async function logout() {
    try {
      await api.post('/api/logout/', {});
    } finally {
      setUser(null);
    }
  }

  useEffect(() => { checkAuth(); }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Axios instance with base URL — import this in every page instead of raw axios
export const api = axios.create({ baseURL: API_URL });

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Persist token across page refreshes
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [isEmployer, setIsEmployer] = useState(() => {
    const t = localStorage.getItem('access_token');
    if (!t) return false;
    try { return jwtDecode(t).is_employer ?? false; } catch { return false; }
  });
  const [loading, setLoading] = useState(false);

  // Attach token to every request automatically
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;
    try {
      const { exp } = jwtDecode(token);
      const msUntilExpiry = exp * 1000 - Date.now();
      if (msUntilExpiry <= 0) { logout(); return; }
      const timer = setTimeout(logout, msUntilExpiry);
      return () => clearTimeout(timer);
    } catch {
      logout();
    }
  }, [token]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/token/', { username, password });
      const receivedToken = data.access;
      localStorage.setItem('access_token', receivedToken);
      setToken(receivedToken);
      const decoded = jwtDecode(receivedToken);
      setIsEmployer(decoded.is_employer ?? false);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setLoading(true);
    try {
      await api.post('/api/register/', { username, password });
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setIsEmployer(false);
  }, []);

  const value = { token, isEmployer, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://127.0.0.1:8000';
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/token/`, { username, password });
      const receivedToken = response.data.access;
      setToken(receivedToken);

      const decodedToken = jwtDecode(receivedToken);
      setIsEmployer(decodedToken.is_employer);
      setLoading(false);
      return true; // Success
    } catch (error) {
      console.error("Login error!", error);
      setLoading(false);
      throw error; // Let the component handle the error message
    }
  };

  const register = async (username, password) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/register/`, { username, password });
      setLoading(false);
      return true; // Success
    } catch (error) {
      console.error("Registration error!", error);
      setLoading(false);
      throw error; // Let the component handle the error
    }
  };

  const logout = () => {
    setToken(null);
    setIsEmployer(false);
  };

  const value = {
    token,
    isEmployer,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
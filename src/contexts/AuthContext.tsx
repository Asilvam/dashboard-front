import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isPinValidated: boolean;
  validatePin: (pin: string) => Promise<boolean>;
  logout: () => void;
  api: typeof axios;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a dedicated axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [isPinValidated, setPinValidated] = useState<boolean>(false);

  // Configure the axios instance to use the JWT
  api.interceptors.request.use((config) => {
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  });

  const validatePin = async (pin: string): Promise<boolean> => {
    if (pin === import.meta.env.VITE_FRONTEND_PIN) {
      setPinValidated(true);
      try {
        // PIN is correct, now perform the backend login automatically
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          email: 'admin@test.com',
          password: 'Admin12',
        });
        
        const { access_token } = response.data;
        if (access_token) {
          setJwt(access_token);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Backend login failed", error);
        setPinValidated(false); // Reset pin validation if login fails
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    setJwt(null);
    setPinValidated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!jwt, isPinValidated, validatePin, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

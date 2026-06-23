import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isPinValidated: boolean;
  validatePin: (pin: string) => Promise<boolean>;
  logout: () => void;
  api: AxiosInstance;
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
    console.log('Validating PIN...');
    console.log('Entered PIN:', pin);
    console.log('Expected PIN:', import.meta.env.VITE_FRONTEND_PIN);

    if (pin !== import.meta.env.VITE_FRONTEND_PIN) {
      console.error('PIN Mismatch');
      return false;
    }
    
    console.log('PIN is correct. Attempting backend login...');
    setPinValidated(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email: 'admin@test.com',
        password: 'Admin12',
      });
      
      const { accessToken } = response.data;
      if (accessToken) {
        console.log('Backend login successful. JWT received.');
        setJwt(accessToken);
        return true;
      }
      
      console.error('Backend login succeeded but no accessToken was received.');
      return false;
    } catch (error) {
      console.error("Backend login failed:", error);
      setPinValidated(false);
      return false;
    }
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

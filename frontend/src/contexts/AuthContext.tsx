import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  picture?: string;
  role: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname?: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Set authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token and get user data
          const response = await axios.get('/api/v1/usuarios/me');
          setUser({
            id: response.data.id.toString(),
            email: response.data.email,
            name: response.data.name,
            surname: response.data.surname,
            role: response.data.role,
            phone: response.data.phone,
            address: response.data.address
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Remove invalid token
        localStorage.removeItem('access_token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('/api/v1/login/access-token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      
      // Store token
      localStorage.setItem('access_token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Get user data
      const userResponse = await axios.get('/api/v1/usuarios/me');
      const userData = {
        id: userResponse.data.id.toString(),
        email: userResponse.data.email,
        name: userResponse.data.name,
        surname: userResponse.data.surname,
        role: userResponse.data.role,
        phone: userResponse.data.phone,
        address: userResponse.data.address
      };
      
      setUser(userData);
      return userData.role;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await axios.post('/api/v1/usuarios/', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        surname: userData.surname || '',
        phone: userData.phone || '',
        address: userData.address || '',
        role: 'cliente'
      });

      // Auto-login after registration (returns role but we don't use it here as all new users are 'cliente')
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error('Error registering:', error);
      throw new Error(error.response?.data?.detail || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('access_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
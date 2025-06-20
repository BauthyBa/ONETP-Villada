import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://onetp-backend.onrender.com';

// Configuración global de Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // Importante para enviar cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Configurar axios por defecto
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Interceptor para manejar errores globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar y redirigir si es un error de autenticación en endpoints críticos
      const url = error.config?.url || '';
      if (url.includes('/auth/me/') || url.includes('/auth/token/')) {
        // Manejar cierre de sesión si el token es inválido
        localStorage.removeItem('access_token');
        delete axiosInstance.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
      // Para otros endpoints, simplemente rechazar el error sin redirigir
    }
    return Promise.reject(error);
  }
);

// Interceptor para axios por defecto también
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar y redirigir si es un error de autenticación en endpoints críticos
      const url = error.config?.url || '';
      if (url.includes('/auth/me/') || url.includes('/auth/token/')) {
        // Manejar cierre de sesión si el token es inválido
        localStorage.removeItem('access_token');
        delete axiosInstance.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
      // Para otros endpoints, simplemente rechazar el error sin redirigir
    }
    return Promise.reject(error);
  }
);

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

// Create a custom hook for using the auth context
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the hook as a named export
export { useAuth };

// Create the Auth Provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Set authorization header for all requests (both axiosInstance and axios.defaults)
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        // Verify token and get user data
        const response = await axiosInstance.get('/api/v1/auth/me/');
        setUser({
          id: response.data.id.toString(),
          email: response.data.email,
          name: response.data.nombre,  // Changed from response.data.name
          surname: response.data.apellido,  // Changed from response.data.surname
          role: response.data.tipo_usuario,  // Changed from response.data.role
          phone: response.data.telefono,  // Changed from response.data.phone
          address: response.data.direccion  // Changed from response.data.address
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        // If there's an error, clear the invalid token
        localStorage.removeItem('access_token');
        delete axiosInstance.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axiosInstance.post('/api/v1/auth/token/', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access } = response.data;
      
      if (!access) {
        throw new Error('No se recibió el token de acceso');
      }
      
      // Store token and set headers for both axios instances
      localStorage.setItem('access_token', access);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Get user data
      const userResponse = await axiosInstance.get('/api/v1/auth/me/', {
        withCredentials: true
      });
      const userData = {
        id: userResponse.data.id.toString(),
        email: userResponse.data.email,
        name: userResponse.data.nombre,  // Changed from name to nombre
        surname: userResponse.data.apellido,  // Changed from surname to apellido
        role: userResponse.data.tipo_usuario,  // Changed from role to tipo_usuario
        phone: userResponse.data.telefono,  // Changed from phone to telefono
        address: userResponse.data.direccion  // Changed from address to direccion
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
      await axiosInstance.post('/api/v1/auth/register/', {
        email: userData.email,
        password: userData.password,
        password2: userData.password, // Add password confirmation
        nombre: userData.name,        // Changed from 'name' to 'nombre'
        apellido: userData.surname || '', // Changed from 'surname' to 'apellido'
        telefono: userData.phone || '',    // Changed from 'phone' to 'telefono'
        direccion: userData.address || '', // Changed from 'address' to 'direccion'
        tipo_usuario: 'cliente'            // Changed from 'role' to 'tipo_usuario'
      });

      // Auto-login after registration
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error('Error registering:', error);
      // Extract validation errors if they exist
      const errorMessage = error.response?.data?.detail || 
                         (error.response?.data ? JSON.stringify(error.response.data) : 'Error al registrarse');
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el backend
      try {
        await axiosInstance.post('/api/v1/auth/logout/');
      } catch (error) {
        console.error('Error en el logout del backend:', error);
        // Continuar a limpiar el estado aunque falle el logout en el backend
      }
      
      // Limpiar el estado local
      localStorage.removeItem('access_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
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

// Export the context for direct usage
export { AuthContext };

// Export the AuthProvider as the default export
export default AuthProvider;
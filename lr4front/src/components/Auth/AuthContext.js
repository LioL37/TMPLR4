import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/api';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const decodeToken = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  };

  const fetchUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = decodeToken(token);
    if (!payload?.user_id) {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    setUser({
      id: payload.user_id,
      is_admin: payload.is_admin || false,
      email: payload.email
    });
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      fetchUserFromToken();
      navigate('/');
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed');
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/token', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      fetchUserFromToken();
      navigate('/');
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed');
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    fetchUserFromToken();
  }, []);

  const handleCloseError = () => {
    setError(null);
  };

  if (loading && !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <>
      <AuthContext.Provider value={{ 
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user?.id,
        isLoading: loading,
        error
      }}>
        {children}
      </AuthContext.Provider>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
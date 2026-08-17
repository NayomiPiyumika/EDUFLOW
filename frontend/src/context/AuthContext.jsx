import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore session from localStorage and verify it against the API.
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('eduflow_token');
      const cachedUser = localStorage.getItem('eduflow_user');

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      try {
        const freshUser = await authService.me();
        setUser(freshUser);
        localStorage.setItem('eduflow_user', JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token } = await authService.login(email, password);
    localStorage.setItem('eduflow_token', token);
    localStorage.setItem('eduflow_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails (e.g. token already expired), clear local state.
    } finally {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authLogin, authRegister, authLogout } from '../services/api';

const AuthContext = createContext(null);

// Cookie-based JWT expiration: 24 hours in ms (must match backend jwt.expiration)
const JWT_EXPIRATION_MS = 86400000;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const logout = useCallback(async () => {
    clearLogoutTimer();
    setUser(null);
    localStorage.removeItem('fingrow_user');
    // Tell backend to clear the HttpOnly cookie
    try { await authLogout(); } catch { /* ignore */ }
  }, []);

  // Schedule auto-logout when the cookie/token expires
  const scheduleAutoLogout = useCallback(
    (loginTimestamp) => {
      clearLogoutTimer();
      const elapsed = Date.now() - loginTimestamp;
      const remainingMs = JWT_EXPIRATION_MS - elapsed;
      if (remainingMs <= 0) {
        logout();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, remainingMs);
    },
    [logout]
  );

  // Check for persisted session on mount
  useEffect(() => {
    const saved = localStorage.getItem('fingrow_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const elapsed = Date.now() - (parsed.loginAt || 0);
        if (elapsed < JWT_EXPIRATION_MS) {
          setUser(parsed);
          scheduleAutoLogout(parsed.loginAt);
        } else {
          // Session expired — clear
          localStorage.removeItem('fingrow_user');
          try { authLogout(); } catch { /* ignore */ }
        }
      } catch {
        localStorage.removeItem('fingrow_user');
      }
    }
    setLoading(false);
  }, [scheduleAutoLogout]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearLogoutTimer();
  }, []);

  const persist = (userData) => {
    setUser(userData);
    localStorage.setItem('fingrow_user', JSON.stringify(userData));
    scheduleAutoLogout(userData.loginAt);
  };

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    // Call real backend POST /api/auth/login — JWT cookie is set automatically
    const data = await authLogin(email, password);

    const userData = {
      email: data.email,
      name: data.fullname,
      avatar: (data.fullname || email).slice(0, 2).toUpperCase(),
      loginAt: Date.now(), // track when the session started
    };
    persist(userData);
    return userData;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    if (!fullName || !email || !password || !confirmPassword) {
      throw new Error('All fields are required.');
    }

    // Call real backend POST /api/auth/register
    await authRegister(fullName, email, password, confirmPassword);

    // Auto‑login after successful registration — JWT cookie is set automatically
    const data = await authLogin(email, password);

    const userData = {
      email: data.email,
      name: data.fullname,
      avatar: (data.fullname || email).slice(0, 2).toUpperCase(),
      loginAt: Date.now(),
    };
    persist(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

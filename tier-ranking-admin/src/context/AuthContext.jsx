import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi.js';
import { apiErrorMessage, setAccessToken } from '../api/axiosInstance.js';

export const AuthContext = createContext(null);

const storedToken = () => localStorage.getItem('tier-admin-access') || sessionStorage.getItem('tier-admin-access') || '';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [booting, setBooting] = useState(Boolean(storedToken()));

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const { data } = await authApi.login({ email, password, rememberMe });
    setAccessToken(data.data.accessToken, rememberMe);
    setAdmin(data.data.admin);
    return data.data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_error) {
      // Logout should clear local credentials even if the API session is already gone.
    }
    setAccessToken('');
    setAdmin(null);
    toast.success('Logged out');
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadMe = async () => {
      try {
        const { data } = await authApi.me();
        if (!ignore) setAdmin(data.data.admin);
      } catch (error) {
        if (!ignore) {
          setAccessToken('');
          setAdmin(null);
          if (storedToken()) toast.error(apiErrorMessage(error));
        }
      } finally {
        if (!ignore) setBooting(false);
      }
    };

    if (storedToken()) loadMe();
    else setBooting(false);

    return () => {
      ignore = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      admin,
      booting,
      isAuthenticated: Boolean(admin),
      login,
      logout
    }),
    [admin, booting, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

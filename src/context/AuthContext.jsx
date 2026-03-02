import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as api from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          const data = await api.getUser(stored);
          setToken(stored);
          setUser(data.data ?? data);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function signIn(email, password) {
    const data = await api.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    const userData = await api.getUser(data.token);
    setUser(userData.data ?? userData);
  }

  async function signUp(name, email, password, passwordConfirmation) {
    const data = await api.register(name, email, password, passwordConfirmation);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    const userData = await api.getUser(data.token);
    setUser(userData.data ?? userData);
  }

  async function signOut() {
    try {
      await api.logout(token);
    } catch {
      // Ignore logout errors — clear locally regardless
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as api from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const BIOMETRIC_KEY = 'biometric_enabled';
const BIOMETRIC_USER_KEY = 'biometric_user_id';
const BIOMETRIC_USER_NAME_KEY = 'biometric_user_name';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricUserName, setBiometricUserName] = useState(null);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const [pendingBiometric, setPendingBiometric] = useState(false);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(hasHardware && isEnrolled);

        const bioPref = await SecureStore.getItemAsync(BIOMETRIC_KEY);
        const bioEnabled = bioPref === 'true';
        setBiometricEnabled(bioEnabled);
        if (bioEnabled) {
          const name = await SecureStore.getItemAsync(BIOMETRIC_USER_NAME_KEY);
          setBiometricUserName(name);
        }

        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        setHasStoredToken(!!stored);

        if (stored) {
          if (bioEnabled && hasHardware && isEnrolled) {
            setPendingBiometric(true);
            return;
          }

          const data = await api.getUser(stored);
          setToken(stored);
          setUser(data.data ?? data);
        }
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setHasStoredToken(false);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function clearBiometricIfDifferentUser(newUserId) {
    const bioUserId = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
    if (bioUserId && bioUserId !== String(newUserId)) {
      await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_USER_NAME_KEY);
      setBiometricEnabled(false);
      setBiometricUserName(null);
    }
  }

  async function signIn(email, password) {
    const data = await api.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setHasStoredToken(true);
    const userData = await api.getUser(data.token);
    const u = userData.data ?? userData;
    await clearBiometricIfDifferentUser(u.id);
    setUser(u);
  }

  async function signUp(name, email, password, passwordConfirmation) {
    const data = await api.register(name, email, password, passwordConfirmation);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setHasStoredToken(true);
    const userData = await api.getUser(data.token);
    const u = userData.data ?? userData;
    await clearBiometricIfDifferentUser(u.id);
    setUser(u);
  }

  async function signOut() {
    if (biometricEnabled) {
      setToken(null);
      setUser(null);
      return;
    }

    try {
      await api.logout(token);
    } catch {
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setHasStoredToken(false);
    setToken(null);
    setUser(null);
  }

  async function enableBiometric() {
    if (!token) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Потвърди за биометричен вход',
      cancelLabel: 'Отказ',
    });
    if (result.success) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
      await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, String(user.id));
      await SecureStore.setItemAsync(BIOMETRIC_USER_NAME_KEY, user.name || '');
      setBiometricEnabled(true);
      setBiometricUserName(user.name);
      return true;
    }
    return false;
  }

  async function disableBiometric() {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_NAME_KEY);
    setBiometricEnabled(false);
    setBiometricUserName(null);
  }

  async function authenticateWithBiometric() {
    setPendingBiometric(false);
    if (!biometricAvailable || !biometricEnabled) return { success: false };

    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) {
      setHasStoredToken(false);
      return { success: false };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Потвърди самоличността си',
      cancelLabel: 'Отказ',
      fallbackLabel: 'Използвай код',
    });

    if (result.success) {
      try {
        const data = await api.getUser(stored);
        setToken(stored);
        setUser(data.data ?? data);
        setHasStoredToken(true);
        return { success: true };
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
          await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
          await SecureStore.deleteItemAsync(BIOMETRIC_USER_NAME_KEY);
          setBiometricEnabled(false);
          setBiometricUserName(null);
          setHasStoredToken(false);
        }
        return { success: false };
      }
    }

    const cancelled = result.error === 'user_cancel' || result.error === 'system_cancel';
    return { success: false, cancelled };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        biometricAvailable,
        biometricEnabled,
        biometricUserName,
        hasStoredToken,
        pendingBiometric,
        setUser,
        signIn,
        signUp,
        signOut,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
      }}
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

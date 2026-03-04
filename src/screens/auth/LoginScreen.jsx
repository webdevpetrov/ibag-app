import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import theme from '../../config/theme';

export default function LoginScreen({ navigation }) {
  const { signIn, biometricAvailable, biometricEnabled, hasStoredToken, pendingBiometric, authenticateWithBiometric } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [bioLoading, setBioLoading] = useState(false);

  const showBiometricButton = biometricAvailable && biometricEnabled && hasStoredToken;

  useEffect(() => {
    if (pendingBiometric) {
      handleBiometricLogin();
    }
  }, []);

  async function handleBiometricLogin() {
    setBioLoading(true);
    try {
      const result = await authenticateWithBiometric();
      if (!result.success && !result.cancelled) {
        setGeneralError('Неуспешно удостоверяване. Влезте с имейл и парола.');
      }
    } catch {
      setGeneralError('Неуспешно удостоверяване. Влезте с имейл и парола.');
    } finally {
      setBioLoading(false);
    }
  }

  async function handleLogin() {
    setFieldErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Нещо се обърка.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Logo />
        <View style={styles.authTabs}>
          <Text style={styles.authTabActive}>Вход</Text>
          <Text style={styles.authTabSeparator}>|</Text>
          <Text style={styles.authTabLink} onPress={() => navigation.navigate('Register')}>Регистрация</Text>
        </View>

        {showBiometricButton && (
          <View style={styles.biometricSection}>
            <Button
              mode="outlined"
              onPress={handleBiometricLogin}
              loading={bioLoading}
              disabled={bioLoading}
              icon={() => (
                <MaterialCommunityIcons name="fingerprint" size={22} color={theme.colors.primary} />
              )}
              style={styles.biometricButton}
              textColor={theme.colors.primary}
            >
              Вход с биометрия
            </Button>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        <TextInput
          label="Имейл"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={!!fieldErrors.email}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.email}>
          {fieldErrors.email?.[0]}
        </HelperText>

        <TextInput
          label="Парола"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          error={!!fieldErrors.password}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword((v) => !v)}
            />
          }
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.password}>
          {fieldErrors.password?.[0]}
        </HelperText>

        {!!generalError && (
          <Text style={styles.errorText}>{generalError}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          Вход
        </Button>

        <View style={styles.linkRow}>
          <Text>Нямаш акаунт? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Регистрация</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 4,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  authTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authTabActive: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  authTabSeparator: {
    fontSize: 28,
    marginHorizontal: 12,
    color: '#ccc',
  },
  authTabLink: {
    fontSize: 28,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 0,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  biometricSection: {
    marginBottom: 16,
  },
  biometricButton: {
    paddingVertical: 4,
    borderColor: theme.colors.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 13,
  },
});

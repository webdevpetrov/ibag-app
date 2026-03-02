import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import theme from '../config/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  async function handleLogin() {
    setFieldErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigation.goBack();
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
        <Text style={styles.title}>Вход</Text>

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
          <Text
            style={styles.link}
            onPress={() => navigation.replace('Register')}
          >
            Регистрация
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!generalError}
        onDismiss={() => setGeneralError('')}
        duration={4000}
      >
        {generalError}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.colors.text,
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
});

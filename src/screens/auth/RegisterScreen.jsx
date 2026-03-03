import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import theme from '../../config/theme';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  function validate() {
    const errors = {};
    if (!name.trim()) {
      errors.name = ['Името е задължително.'];
    } else if (name.trim().length > 255) {
      errors.name = ['Името не може да надвишава 255 символа.'];
    }
    if (!email.trim()) {
      errors.email = ['Имейлът е задължителен.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = ['Невалиден имейл адрес.'];
    }
    if (!password) {
      errors.password = ['Паролата е задължителна.'];
    } else if (password.length < 8) {
      errors.password = ['Паролата трябва да е поне 8 символа.'];
    }
    if (password && password !== passwordConfirmation) {
      errors.password_confirmation = ['Паролите не съвпадат.'];
    }
    return errors;
  }

  async function handleRegister() {
    setFieldErrors({});
    setGeneralError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await signUp(name, email, password, passwordConfirmation);
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
        <Text style={styles.title}>Регистрация</Text>

        <TextInput
          label="Име"
          mode="outlined"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={!!fieldErrors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.name}>
          {fieldErrors.name?.[0]}
        </HelperText>

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

        <TextInput
          label="Потвърди парола"
          mode="outlined"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          error={!!fieldErrors.password_confirmation}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.password_confirmation}>
          {fieldErrors.password_confirmation?.[0]}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          Регистрация
        </Button>

        <View style={styles.linkRow}>
          <Text>Вече имаш акаунт? </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Вход
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

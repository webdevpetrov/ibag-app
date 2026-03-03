import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';

export default function ProfileEditScreen() {
  const { user, token, setUser } = useAuth();

  const [name, setName] = useState(user.name);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  async function handleSave() {
    setErrors({});
    setSaving(true);
    try {
      const data = await api.updateProfile(token, { name: name.trim() });
      setUser(data.data ?? data);
      setSnackbar('Профилът е обновен.');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setSnackbar(err.message || 'Нещо се обърка.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <TextInput
          label="Име"
          mode="outlined"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          error={!!errors.name}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name?.[0]}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          buttonColor={theme.colors.primary}
          style={styles.button}
        >
          Запази промените
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={3000}
      >
        {snackbar}
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
    padding: 20,
    paddingBottom: 40,
  },
  input: {
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
});

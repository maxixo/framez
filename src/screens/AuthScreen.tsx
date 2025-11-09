import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from './../stores/authStore';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuthStore();

  const submit = async () => {
    setError(null);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email.trim(), password, fullName.trim());
      if (error) setError(error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.title}>Framez</Text>
      {mode === 'signup' && (
        <TextInput
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          autoCapitalize="words"
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        <Text style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 24 },
  input: { width: '100%', height: 48, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  button: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  switchText: { marginTop: 12, color: '#111' },
  error: { color: 'crimson', marginBottom: 8 },
});

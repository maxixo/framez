import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePostStore } from './../stores/postStore';
import { useThemeStore } from '../stores/themeStore';

type NewPost = {
  content?: string;
  imageUri: string | null;
};

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { createPost } = usePostStore();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets?.length) {
      setImageUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    const { error } = await createPost({ content: content.trim() || undefined, imageUri } as NewPost);
    if (error) Alert.alert('Error', error);
    else {
      setContent('');
      setImageUri(null);
      Alert.alert('Posted', 'Your post has been shared.');
    }
  };

  const colors = {
    bg: isDark ? '#0b0b0c' : '#fff',
    card: isDark ? '#1c1c1e' : '#fff',
    border: isDark ? '#2c2c2e' : '#ddd',
    text: isDark ? '#e5e5ea' : '#111',
    sub: isDark ? '#a1a1aa' : '#666',
    button: isDark ? '#fafafa' : '#111',
    buttonText: isDark ? '#111' : '#fff',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: colors.text }]}>Create</Text>
        <TouchableOpacity
          accessibilityLabel="Toggle theme"
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={[
            styles.themeSwitch,
            {
              backgroundColor: isDark ? '#27272a' : '#e5e7eb',
              justifyContent: isDark ? 'flex-end' : 'flex-start',
              borderColor: isDark ? '#3f3f46' : '#d4d4d8',
            },
          ]}
        >
          <View
            style={[
              styles.themeThumb,
              { backgroundColor: isDark ? '#3f3f46' : '#fff', borderColor: isDark ? '#52525b' : '#d4d4d8' },
            ]}
          >
            <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TextInput
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
        placeholderTextColor={colors.sub}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
      />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity onPress={pickImage} style={[styles.button, { backgroundColor: isDark ? '#e5e7eb' : '#eee' }]}> 
          <Text style={[styles.buttonText, { color: '#111' }]}>Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={submit} style={[styles.button, { backgroundColor: colors.button }]}>
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Post</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  themeSwitch: { width: 56, height: 32, borderRadius: 16, padding: 2, borderWidth: 1 },
  themeThumb: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  themeIcon: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  input: { minHeight: 120, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, textAlignVertical: 'top' },
  button: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flex: 1 },
  buttonText: { color: '#fff', fontWeight: '700' },
  preview: { width: '100%', aspectRatio: 4/5, borderRadius: 8, marginBottom: 12 }
});

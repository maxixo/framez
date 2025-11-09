import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePostStore } from './../stores/postStore';

type NewPost = {
  content?: string;
  imageUri: string | null;
};

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { createPost } = usePostStore();

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

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
        style={styles.input}
      />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity onPress={pickImage} style={[styles.button, { backgroundColor: '#eee' }]}> 
          <Text style={[styles.buttonText, { color: '#111' }]}>Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: { minHeight: 120, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, textAlignVertical: 'top' },
  button: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flex: 1 },
  buttonText: { color: '#fff', fontWeight: '700' },
  preview: { width: '100%', aspectRatio: 4/5, borderRadius: 8, marginBottom: 12 }
});

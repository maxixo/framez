import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';


export const Avatar: React.FC<{ uri: string | null; size?: number; name?: string | null }> = ({ uri, size = 36, name }) => {
const initials = (name || '?')
.split(' ')
.map((p) => p[0])
.join('')
.slice(0, 2)
.toUpperCase();


if (uri) {
return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#ddd' }} />;
}
return (
<View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
<Text style={styles.initials}>{initials}</Text>
</View>
);
};


const styles = StyleSheet.create({
fallback: { backgroundColor: '#e5e5ea', alignItems: 'center', justifyContent: 'center' },
initials: { color: '#333', fontWeight: '700' },
});
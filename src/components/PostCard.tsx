import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Post } from './../lib/types';
import { Avatar } from './../components/Avatar';


dayjs.extend(relativeTime);


export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
const name = post.author?.username || post.author?.full_name || 'Unknown';
const when = dayjs(post.created_at).fromNow();


return (
<View style={styles.card}>
{/* Header */}
<View style={styles.header}>
<Avatar uri={post.author?.avatar_url || null} size={36} name={name} />
<View style={{ flex: 1 }}>
<Text style={styles.author}>{name}</Text>
<Text style={styles.time}>{when}</Text>
</View>
<TouchableOpacity accessibilityLabel="Post options">
<Text style={styles.dots}>•••</Text>
</TouchableOpacity>
</View>


{/* Image (Instagram-style square) */}
{post.image_url ? (
<Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />
) : null}


{/* Caption */}
{post.content ? (
<View style={styles.captionWrap}>
<Text style={styles.caption}>
<Text style={styles.captionAuthor}>{name} </Text>
{post.content}
</Text>
</View>
) : null}
</View>
);
};


const styles = StyleSheet.create({
card: { backgroundColor: '#fff', marginBottom: 10 },
header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
author: { fontSize: 14, fontWeight: '700', color: '#111' },
time: { fontSize: 12, color: '#888' },
dots: { fontSize: 18, color: '#111', paddingHorizontal: 8 },
image: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f0f0' },
captionWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
caption: { fontSize: 14, color: '#111', lineHeight: 20 },
captionAuthor: { fontWeight: '700' },
});
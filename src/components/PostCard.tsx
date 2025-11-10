import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Post } from '../lib/types';
import { Avatar } from './Avatar';
import { useThemeStore } from '../stores/themeStore';

dayjs.extend(relativeTime);

type PostCardProps = {
  post: Post;
  onPress?: () => void;
  isDark?: boolean;
  showImage?: boolean;
  onDelete?: () => void;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onPress, isDark, showImage, onDelete }) => {
  const name = post.author?.username || post.author?.full_name || (post as any).username || 'Unknown';
  const when = dayjs(post.created_at).fromNow();
  const storeDark = useThemeStore((s) => s.isDark);
  const dark = typeof isDark === 'boolean' ? isDark : storeDark;
  const avatarUri = post.author?.avatar_url || (post as any).user_avatar || null;

  const Container: any = onPress ? TouchableOpacity : View;

  const cardColors = {
    bg: dark ? '#1c1c1e' : '#fff',
    border: dark ? '#2c2c2e' : '#e6e6e6',
    text: dark ? '#e5e5ea' : '#111',
    sub: dark ? '#a1a1aa' : '#888',
    dots: dark ? '#d4d4d8' : '#111',
  };

  return (
    <Container style={[styles.card, { backgroundColor: cardColors.bg, borderColor: cardColors.border }]} onPress={onPress} activeOpacity={0.8}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar uri={avatarUri} size={40} name={name} />
        <View style={styles.info}>
          <Text style={[styles.author, { color: cardColors.text }]}>{name}</Text>
          <Text style={[styles.time, { color: cardColors.sub }]}>{when}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity accessibilityLabel="Delete post" onPress={onDelete} style={styles.actionBtn} activeOpacity={0.8}>
            <Text style={[styles.deleteText, { color: cardColors.dots }]}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Post options" style={styles.actionBtn} activeOpacity={0.8}>
            <Text style={[styles.dots, { color: cardColors.dots }]}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Media */}
      {showImage && !!post.image_url ? (
        <Image source={{ uri: post.image_url }} style={styles.media} resizeMode="cover" />
      ) : null}

      {/* Content (text only, no images) */}
      {post.content ? (
        <View style={styles.captionWrap}>
          <Text style={[styles.caption, { color: cardColors.text }]}>{post.content}</Text>
        </View>
      ) : null}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  info: { flex: 1 },
  author: { fontSize: 14, fontWeight: '700', color: '#111' },
  time: { fontSize: 12, color: '#888' },
  dots: { fontSize: 18, color: '#111', paddingHorizontal: 8 },
  deleteText: { fontSize: 16 },
  media: { width: '100%', aspectRatio: 16/9, backgroundColor: '#f0f0f0' },
  captionWrap: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12 },
  caption: { fontSize: 14, color: '#111', lineHeight: 20 },
});

import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from './../stores/authStore';
import { usePostStore } from './../stores/postStore';
import { PostCard } from './../components/PostCard';
import { Avatar } from './../components/Avatar';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profile, user, signOut, refreshProfile } = useAuthStore();
  const { posts, refresh } = usePostStore();
  const isDark = useThemeStore((s) => s.isDark);

  const selectedUserId = (route.params as any)?.userId as string | undefined;
  const userIdToShow = selectedUserId ?? user?.id;

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    console.log('Profile data:', profile);
  }, [profile]);

  const viewPosts = useMemo(
    () => posts.filter((p) => p.author_id === userIdToShow),
    [posts, userIdToShow]
  );
  const viewImages = useMemo(() => viewPosts.filter((p) => !!p.image_url), [viewPosts]);

  const first = viewPosts[0];
  const displayName = selectedUserId
    ? first?.author?.username || first?.author?.full_name || first?.username || 'User'
    : profile?.username || profile?.full_name || 'Your Profile';
  const emailToShow = selectedUserId ? undefined : profile?.email;
  const avatarUri = selectedUserId
    ? first?.author?.avatar_url || first?.user_avatar || null
    : profile?.avatar_url || null;

  return (
    <FlatList
      data={viewPosts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PostCard post={item} />}
      onRefresh={refresh}
      refreshing={false}
      ListHeaderComponent={
        <View style={[styles.page, isDark && styles.pageDark]}>
          {/* Top bar with back button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Feed')}
              activeOpacity={0.8}
            >
              <Text style={styles.backIcon}>{'<'}</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Profile header */}
          <View style={styles.header}>
            <Avatar uri={avatarUri || null} size={86} name={displayName || 'User'} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>{displayName}</Text>
              {emailToShow ? <Text style={styles.email}>{emailToShow}</Text> : null}
              <View style={styles.counters}>
                <View style={styles.counterItem}>
                  <Text style={styles.counterNum}>{viewPosts.length}</Text>
                  <Text style={styles.counterLabel}>Posts</Text>
                </View>
                <View style={styles.counterItem}>
                  <Text style={styles.counterNum}>-</Text>
                  <Text style={styles.counterLabel}>Followers</Text>
                </View>
                <View style={styles.counterItem}>
                  <Text style={styles.counterNum}>-</Text>
                  <Text style={styles.counterLabel}>Following</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Image grid */}
          {viewImages.length > 0 && (
            <View>
              <View style={styles.gridTabs}>
                <Text style={styles.gridTabActive}>Posts</Text>
              </View>
              <View style={styles.gridWrap}>
                {viewImages.map((item) => (
                  <View key={`grid-${item.id}`} style={styles.gridTile}>
                    <Image source={{ uri: item.image_url! }} style={styles.gridImage} />
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Posts</Text>
        </View>
      }
      contentContainerStyle={[styles.content, isDark && styles.contentDark]}
    />
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#fff' },
  pageDark: { backgroundColor: '#0b0b0c' },
  content: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16 },
  contentDark: { backgroundColor: '#0b0b0c' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f2f2f2', borderRadius: 9999 },
  backIcon: { fontSize: 16, color: '#111' },
  backText: { marginLeft: 6, fontWeight: '600', color: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  name: { fontSize: 18, fontWeight: '700', color: '#111' },
  email: { fontSize: 13, color: '#666', marginTop: 2 },
  counters: { flexDirection: 'row', gap: 16, marginTop: 10 },
  counterItem: { alignItems: 'center' },
  counterNum: { fontWeight: '800', fontSize: 16 },
  counterLabel: { color: '#666', fontSize: 12 },
  logoutBtn: { backgroundColor: '#f33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  logoutText: { color: '#fff', fontWeight: '700' },
  gridTabs: { borderTopWidth: 1, borderTopColor: '#eee', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  gridTabActive: { fontWeight: '700', letterSpacing: 0.5 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  gridTile: { width: '33.3333%', aspectRatio: 1, backgroundColor: '#f0f0f0', padding: 1 },
  gridImage: { width: '100%', height: '100%' },
  sectionTitle: { paddingHorizontal: 16, paddingVertical: 12, fontWeight: '700', borderTopColor: '#eee', borderTopWidth: 1 },
});


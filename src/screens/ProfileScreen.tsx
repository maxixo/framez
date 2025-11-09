import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuthStore } from './../stores/authStore';
import { usePostStore } from './../stores/postStore';
import { PostCard } from './../components/PostCard';
import { Avatar } from './../components/Avatar';

export default function ProfileScreen() {
  const { profile, user, signOut, refreshProfile } = useAuthStore();
  const { posts, refresh } = usePostStore();

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
  console.log("Profile data:", profile);
}, [profile]);


  const myPosts = useMemo(() => posts.filter(p => p.author_id === user?.id), [posts, user?.id]);
  const myImages = useMemo(() => myPosts.filter(p => !!p.image_url), [myPosts]);

  return (
    <FlatList
      data={myPosts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PostCard post={item} />}
      onRefresh={refresh}
      refreshing={false}
      ListHeaderComponent={
        <View>
          {/* Profile header (Instagram-like) */}
          <View style={styles.header}>
            <Avatar uri={profile?.avatar_url || null} size={86} name={profile?.full_name || profile?.username || 'You'} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>{profile?.username || profile?.full_name || 'Your Profile'}</Text>
              <Text style={styles.email}>{profile?.email}</Text>
              <View style={styles.counters}>
                <View style={styles.counterItem}><Text style={styles.counterNum}>{myPosts.length}</Text><Text style={styles.counterLabel}>Posts</Text></View>
                <View style={styles.counterItem}><Text style={styles.counterNum}>—</Text><Text style={styles.counterLabel}>Followers</Text></View>
                <View style={styles.counterItem}><Text style={styles.counterNum}>—</Text><Text style={styles.counterLabel}>Following</Text></View>
              </View>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Image grid */}
          {myImages.length > 0 && (
            <View>
              <View style={styles.gridTabs}>
                <Text style={styles.gridTabActive}>Posts</Text>
              </View>
              <View style={styles.gridWrap}>
                {myImages.map((item) => (
                  <View key={`grid-${item.id}`} style={styles.gridTile}>
                    <Image source={{ uri: item.image_url! }} style={styles.gridImage} />
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Your Posts</Text>
        </View>
      }
      contentContainerStyle={{ backgroundColor: '#fff' }}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
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


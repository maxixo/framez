import React, { useEffect } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet } from 'react-native';
import { usePostStore } from './../stores/postStore';
import { PostCard } from './../components/PostCard';

export default function FeedScreen() {
  const { posts, fetchInitial, subscribeRealtime, refresh } = usePostStore();

  useEffect(() => {
    fetchInitial();
    subscribeRealtime();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        ListHeaderComponent={() => (
          <View style={styles.topBar}>
            <Text style={styles.brand}>Framez</Text>
          </View>
        )}
        stickyHeaderIndices={[0]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 12, borderBottomColor: '#eee', borderBottomWidth: 1 },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostStore, Post } from '../stores/postStore';
import { useStoryStore } from '../stores/storyStore';
import { PostCard } from '../components/PostCard';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/Avatar';
import { useThemeStore } from '../stores/themeStore';

interface StoryUser {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  isYours: boolean;
  hasStory: boolean;
  storyCount: number;
  lastUpdated: string | null;
}

interface StoryItemProps {
  story: StoryUser;
  onPress: () => void;
}

const StoryItem: React.FC<StoryItemProps> = ({ story, onPress }) => {
  return (
    <TouchableOpacity style={styles.storyContainer} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={
          story.isYours && !story.hasStory
            ? ['#d3d3d3', '#d3d3d3']
            : story.hasStory
            ? ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']
            : ['#d3d3d3', '#d3d3d3']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientRing}
      >
        <View style={styles.storyImageContainer}>
          <Image source={{ uri: story.avatar }} style={styles.storyImage} />
        </View>
      </LinearGradient>
      {story.isYours && !story.hasStory && (
        <View style={styles.addStoryBadge}>
          <Text style={styles.addStoryText}>+</Text>
        </View>
      )}
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
};

interface StoriesBarProps {
  stories: StoryUser[];
}

const StoriesBar: React.FC<StoriesBarProps> = ({ stories }) => {
  const handleStoryPress = (story: StoryUser): void => {
    if (story.isYours && !story.hasStory) {
      console.log('Add new story');
    } else if (story.hasStory) {
      console.log('View story:', story.username);
    }
  };

  if (!stories || stories.length === 0) return null;

  return (
    <View style={styles.storiesWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
        {stories.map((story: StoryUser) => (
          <StoryItem key={story.id} story={story} onPress={() => handleStoryPress(story)} />
        ))}
      </ScrollView>
    </View>
  );
};

const FeedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const posts = usePostStore((state) => state.posts);
  const fetchInitial = usePostStore((state) => state.fetchInitial);
  const subscribeRealtime = usePostStore((state) => state.subscribeRealtime);
  const refresh = usePostStore((state) => state.refresh);
  const deletePost = usePostStore((state) => state.deletePost);

  const stories = useStoryStore((state) => state.stories);
  const fetchStories = useStoryStore((state) => state.fetchStories);
  const refreshStories = useStoryStore((state) => state.refreshStories);

  const profile = useAuthStore((s) => s.profile);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const [randSeed, setRandSeed] = useState<number>(Date.now());

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await fetchStories();
        await fetchInitial();
        subscribeRealtime();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [fetchStories, fetchInitial, subscribeRealtime]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refresh();
      await refreshStories();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
      setRandSeed(Date.now());
    }
  };

  const renderHeader = (): React.ReactElement => {
    const headerBg = isDark ? '#0f0f10' : '#fff';
    const border = isDark ? '#1f1f22' : '#e0e0e0';
    return (
      <View>
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: border }]}>
          <LinearGradient
            colors={['#FFD700', '#FF9A00', '#FF6A00', '#FF3D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>Framez</Text>
          </LinearGradient>
          <View style={styles.headerIcons}>
            {/* Theme Switch */}
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

            {/* Profile Button */}
            <TouchableOpacity
              accessibilityLabel="Open profile"
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
              style={[styles.profileBtn, { borderColor: isDark ? '#3f3f46' : '#e5e7eb' }]}
            >
              <Avatar
                uri={profile?.avatar_url || null}
                size={28}
                name={profile?.full_name || profile?.username || 'You'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <StoriesBar stories={stories} />
      </View>
    );
  };

  // Deterministic seeded random in [0,1)
  const rand01 = (id: string, seed: number): number => {
    const s = id + ':' + String(seed);
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  };

  const renderItem: ListRenderItem<Post> = ({ item }): React.ReactElement => {
    const showImage = !!item.image_url && rand01(String(item.id), randSeed) < 0.5; // ~50% selection per refresh
    return (
      <PostCard
        post={item}
        isDark={isDark}
        showImage={showImage}
        onPress={() => navigation.navigate('Profile', { userId: item.author_id })}
        onDelete={() => deletePost(item.id)}
      />
    );
  };

  const keyExtractor = (item: Post): string => {
    return String(item.id);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList<Post>
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#262626"
            colors={['#262626']}
          />
        }
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#0b0b0c',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  logoGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 0.8,
    color: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 0,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  themeSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
  },
  themeThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 14,
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storiesWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  storiesScroll: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyContainer: {
    alignItems: 'center',
    width: 72,
  },
  gradientRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  storyImageContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: 20,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0095f6',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#262626',
    maxWidth: 70,
  },
  listContent: {
    paddingBottom: 16,
  },
});



import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ListRenderItem } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostStore, Post } from '../stores/postStore';
import { useStoryStore } from '../stores/storyStore';
import { PostCard } from '../components/PostCard';

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {stories.map((story: StoryUser) => (
          <StoryItem
            key={story.id}
            story={story}
            onPress={() => handleStoryPress(story)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const FeedScreen: React.FC = () => {
  const posts = usePostStore((state) => state.posts);
  const fetchInitial = usePostStore((state) => state.fetchInitial);
  const subscribeRealtime = usePostStore((state) => state.subscribeRealtime);
  const refresh = usePostStore((state) => state.refresh);
  
  const stories = useStoryStore((state) => state.stories);
  const fetchStories = useStoryStore((state) => state.fetchStories);
  const refreshStories = useStoryStore((state) => state.refreshStories);
  
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
    }
  };

  const renderHeader = (): React.ReactElement => {
    return (
      <View>
        <View style={styles.header}>
          <LinearGradient
            colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>Framez</Text>
          </LinearGradient>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Text style={styles.icon}>♥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Text style={styles.icon}>✉</Text>
            </TouchableOpacity>
          </View>
        </View>
        <StoriesBar stories={stories} />
      </View>
    );
  };

  const renderItem: ListRenderItem<Post> = ({ item }): React.ReactElement => {
    return <PostCard post={item} />;
  };

  const keyExtractor = (item: Post): string => {
    return String(item.id);
  };

  return (
    <View style={styles.container}>
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
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  icon: {
    fontSize: 24,
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
});
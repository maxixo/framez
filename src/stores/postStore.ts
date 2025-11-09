import { create } from 'zustand';
import postsData from './../data/posts.json';
import { useAuthStore } from './authStore';

// Type matching your Supabase schema
export interface Post {
  id: string;
  user_id: string;
  username: string;
  user_avatar: string;
  image_url: string | null;
  caption: string;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
  author_id: string;
  content: string;
  // Added to align with UI (PostCard) expectations
  author?: {
    username?: string | null;
    avatar_url?: string | null;
    full_name?: string | null;
  };
}

interface PostStore {
  posts: Post[];
  loading: boolean;
  error: string | null;
  
  
  // Actions
  fetchInitial: () => Promise<void>;
  fetchFromSupabase: () => Promise<void>;
  refresh: () => Promise<void>;
  subscribeRealtime: () => void;
  likePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string) => void;
  createPost: (newPost: { content?: string; imageUri: string | null }) => Promise<{ error?: string }>;
  deletePost: (postId: string) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  fetchInitial: async () => {
    set({ loading: true, error: null });
    try {
      // For development: Load from mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const transformed = (postsData.posts as any[]).map((p) => {
        const post: Post = {
          ...p,
          id: String(p.id),
          // Align fields used by UI
          author_id: p.user_id,
          content: p.caption,
          author: {
            username: p.username ?? null,
            avatar_url: p.user_avatar ?? null,
            full_name: p.username ?? null,
          },
          // Ensure required numeric/boolean fields exist
          likes_count: typeof p.likes_count === 'number' ? p.likes_count : 0,
          comments_count: typeof p.comments_count === 'number' ? p.comments_count : 0,
          is_liked: Boolean(p.is_liked),
          is_bookmarked: Boolean(p.is_bookmarked),
          location: p.location ?? null,
        };
        return post;
      });
      set({ posts: transformed as Post[], loading: false });
      
      // For production with Supabase:
      // await get().fetchFromSupabase();
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ error: 'Failed to load posts', loading: false });
    }
  },

  fetchFromSupabase: async () => {
    set({ loading: true, error: null });
    try {
      // Uncomment and use this when connecting to Supabase
      /*
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_url,
          caption,
          location,
          created_at,
          users!posts_user_id_fkey (
            username,
            avatar_url
          ),
          likes:post_likes(count),
          comments:post_comments(count),
          user_likes:post_likes!post_likes_user_id_fkey(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to match Post interface
      const transformedPosts = data.map(post => ({
        id: post.id,
        user_id: post.user_id,
        username: post.users.username,
        user_avatar: post.users.avatar_url,
        image_url: post.image_url,
        caption: post.caption,
        location: post.location,
        likes_count: post.likes[0]?.count || 0,
        comments_count: post.comments[0]?.count || 0,
        created_at: post.created_at,
        is_liked: post.user_likes.length > 0,
        is_bookmarked: false, // You'd need to check bookmarks table
      }));

      set({ posts: transformedPosts, loading: false });
      */
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      set({ error: 'Failed to load posts from database', loading: false });
    }
  },

  refresh: async () => {
    await get().fetchInitial();
  },

  subscribeRealtime: () => {
    // For development: Do nothing
    console.log('Realtime subscription would be set up here');
    
    // For production with Supabase:
    /*
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Change received!', payload);
          get().refresh();
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
    */
  },

  likePost: (postId: string) => {
    set(state => ({
      posts: state.posts.map(post => 
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              likes_count: post.is_liked 
                ? post.likes_count - 1 
                : post.likes_count + 1
            }
          : post
      )
    }));

    // For production: Make API call to Supabase
    /*
    const post = get().posts.find(p => p.id === postId);
    if (post?.is_liked) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUserId });
    }
    */
  },

  bookmarkPost: (postId: string) => {
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, is_bookmarked: !post.is_bookmarked }
          : post
      )
    }));

    // For production: Make API call to Supabase
    /*
    const post = get().posts.find(p => p.id === postId);
    if (post?.is_bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('bookmarks')
        .insert({ post_id: postId, user_id: currentUserId });
    }
    */
  },

  addComment: (postId: string) => {
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      )
    }));
  },

  createPost: async (input: { content?: string; imageUri: string | null }) => {
    try {
      const content = (input.content ?? '').trim();
      const imageUri = input.imageUri ?? null;
      if (!content && !imageUri) {
        return { error: 'Please add text or an image' };
      }

      // Pull current user/profile if available
      const { user, profile } = useAuthStore.getState();
      const authorId = user?.id ?? 'local_user';
      const authorUsername = profile?.username ?? profile?.full_name ?? 'You';
      const authorAvatar = profile?.avatar_url ?? null;

      const newPost: Post = {
        id: Date.now().toString(),
        user_id: authorId,
        author_id: authorId,
        username: authorUsername,
        user_avatar: authorAvatar ?? 'https://i.pravatar.cc/150?img=1',
        image_url: imageUri,
        caption: content,
        content,
        location: null,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        is_liked: false,
        is_bookmarked: false,
        author: {
          username: authorUsername,
          avatar_url: authorAvatar,
          full_name: authorUsername,
        },
      };

      // Simulate network latency
      await new Promise((r) => setTimeout(r, 300));

      // Prepend new post
      set((state) => ({ posts: [newPost, ...state.posts] }));
      return {};
    } catch (e) {
      console.error('Error creating post:', e);
      return { error: 'Failed to create post' };
    }
  },

  deletePost: (postId: string) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
  }
}));

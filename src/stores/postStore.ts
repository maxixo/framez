import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import postsData from './../data/posts.json';
import { supabase } from './../lib/supabase';
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

export const usePostStore = create<PostStore>()(
  persist(
    (set, get) => ({
  posts: [],
  loading: false,
  error: null,
  fetchInitial: async () => {
    // If we already have persisted posts, show them immediately
    if (get().posts.length > 0) {
      set({ loading: false });
      // Fetch from Supabase in background
      get().fetchFromSupabase().catch(() => {});
      return;
    }
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
      
      // Then try Supabase (if configured)
      await get().fetchFromSupabase();
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ error: 'Failed to load posts', loading: false });
    }
  },

  fetchFromSupabase: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_url,
          caption,
          location,
          created_at,
          profiles:profiles ( username, avatar_url, full_name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: Post[] = (data as any[]).map((post: any) => {
        const username = post?.profiles?.username ?? null;
        const avatar_url = post?.profiles?.avatar_url ?? null;
        const full_name = post?.profiles?.full_name ?? null;
        const p: Post = {
          id: String(post.id),
          user_id: post.user_id,
          author_id: post.user_id,
          username: username ?? '',
          user_avatar: avatar_url ?? '',
          image_url: post.image_url ?? null,
          caption: post.caption ?? '',
          content: post.caption ?? '',
          location: post.location ?? null,
          likes_count: 0,
          comments_count: 0,
          created_at: post.created_at,
          is_liked: false,
          is_bookmarked: false,
          author: { username, avatar_url, full_name },
        };
        return p;
      });

      set({ posts: transformedPosts, loading: false });
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      set({ error: 'Failed to load posts from database', loading: false });
    }
  },

  refresh: async () => {
    await get().fetchInitial();
  },

  subscribeRealtime: () => {
    try {
      const channel = supabase
        .channel('posts_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          (payload: any) => {
            const { eventType } = payload;
            if (eventType === 'INSERT') {
              const n = payload.new;
              const post: Post = {
                id: String(n.id),
                user_id: n.user_id,
                author_id: n.user_id,
                username: '',
                user_avatar: '',
                image_url: n.image_url ?? null,
                caption: n.caption ?? '',
                content: n.caption ?? '',
                location: n.location ?? null,
                likes_count: 0,
                comments_count: 0,
                created_at: n.created_at,
                is_liked: false,
                is_bookmarked: false,
                author: {},
              };
              set((state) => ({ posts: [post, ...state.posts] }));
            } else if (eventType === 'UPDATE') {
              const n = payload.new;
              set((state) => ({
                posts: state.posts.map((p) =>
                  String(p.id) === String(n.id)
                    ? { ...p, caption: n.caption ?? p.caption, content: n.caption ?? p.content, image_url: n.image_url ?? p.image_url, location: n.location ?? p.location }
                    : p
                ),
              }));
            } else if (eventType === 'DELETE') {
              const o = payload.old;
              set((state) => ({ posts: state.posts.filter((p) => String(p.id) !== String(o.id)) }));
            }
          }
        )
        .subscribe();

      // Optional: return cleanup
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription failed', e);
    }
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
      // Attempt to insert into Supabase
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert({ user_id: authorId, image_url: imageUri, caption: content, location: null })
          .select()
          .maybeSingle();
        if (!error && data) {
          const p: Post = {
            id: String(data.id),
            user_id: data.user_id,
            author_id: data.user_id,
            username: authorUsername,
            user_avatar: authorAvatar ?? 'https://i.pravatar.cc/150?img=1',
            image_url: data.image_url ?? null,
            caption: data.caption ?? '',
            content: data.caption ?? '',
            location: data.location ?? null,
            likes_count: 0,
            comments_count: 0,
            created_at: data.created_at ?? new Date().toISOString(),
            is_liked: false,
            is_bookmarked: false,
            author: { username: authorUsername, avatar_url: authorAvatar, full_name: authorUsername },
          };
          set((state) => ({ posts: [p, ...state.posts] }));
          return {};
        }
      } catch (e) {
        console.warn('Supabase insert failed, falling back to local', e);
      }

      // Fallback to local only
      const local: Post = {
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
        author: { username: authorUsername, avatar_url: authorAvatar, full_name: authorUsername },
      };
      set((state) => ({ posts: [local, ...state.posts] }));
      return {};
    } catch (e) {
      console.error('Error creating post:', e);
      return { error: 'Failed to create post' };
    }
  },

  deletePost: async (postId: string) => {
    try {
      // Try delete in Supabase first (will respect RLS)
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
    } catch (e) {
      console.error('Failed to delete post from Supabase:', e);
    }
  }
    }),
    {
      name: 'posts-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ posts: state.posts }),
    }
  )
);

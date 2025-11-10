import { create } from 'zustand';
import postsData from './../data/posts.json';
import { supabase } from './../lib/supabase';
import { useAuthStore } from './authStore';

// Type matching your Supabase schema
export interface Post {
  id: string;
  user_id: string;
  author_id: string;
  username: string;
  user_avatar: string;
  image_url: string | null;
  caption: string;
  content: string | null;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface PostStore {
  deletePost: (postId: string) => void;
  posts: Post[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createPost: (newPost: { content?: string; imageUri: string | null }) => Promise<{ error?: string }>;
  fetchInitial: () => Promise<void>;
  fetchFromSupabase: () => Promise<void>;
  refresh: () => Promise<void>;
  subscribeRealtime: () => void;
  // alias to support older callers
  subscribeToRealtime?: () => void;
  likePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  createPost: async (newPost: { content?: string; imageUri: string | null }) => {
    try {
      set({ loading: true, error: null });

      const { user, profile } = useAuthStore.getState();
      const authorId = user?.id;
      if (!authorId) {
        const msg = 'Not authenticated';
        set({ loading: false, error: msg });
        return { error: msg };
      }

      const content = newPost.content ?? '';
      const image_url = newPost.imageUri ?? null;

      const { data, error } = await supabase
        .from('posts')
        .insert({ user_id: authorId, author_id: authorId, image_url, caption: content })
        .select('id, user_id, author_id, image_url, caption, created_at')
        .single();

      if (error) {
        // Fallback to local mock if DB insert fails
        console.warn('Supabase insert failed, falling back to local:', error);
        const mockPost: Post = {
          id: Date.now().toString(),
          user_id: authorId,
          author_id: authorId,
          username: profile?.username || profile?.full_name || 'You',
          user_avatar: profile?.avatar_url || 'https://i.pravatar.cc/150?img=1',
          image_url,
          caption: content,
          content,
          location: null,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString(),
          is_liked: false,
          is_bookmarked: false,
        };
        set((state) => ({ posts: [mockPost, ...state.posts], loading: false }));
        return {};
      }

      // Build the new post for immediate UI; dedupe if realtime also adds it
      const built: Post = {
        id: String(data.id),
        user_id: (data as any).user_id ?? (data as any).author_id,
        author_id: (data as any).author_id ?? (data as any).user_id,
        username: profile?.username || profile?.full_name || 'You',
        user_avatar: profile?.avatar_url || 'https://i.pravatar.cc/150?img=1',
        image_url: data.image_url ?? null,
        caption: data.caption ?? '',
        content: data.caption ?? '',
        location: null,
        likes_count: 0,
        comments_count: 0,
        created_at: data.created_at ?? new Date().toISOString(),
        is_liked: false,
        is_bookmarked: false,
      };

      set((state) => {
        const exists = state.posts.some((p) => String(p.id) === String(built.id));
        return exists ? { loading: false } : { posts: [built, ...state.posts], loading: false };
      });

      return {};
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create post';
      set({ loading: false, error: errorMessage });
      return { error: errorMessage };
    }
  },

  fetchInitial: async () => {
    set({ loading: true, error: null });
    try {
      // For development: Load from mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const transformed = (postsData.posts as any[]).map((p) => {
        const post: Post = {
          ...p,
          id: String(p.id),
          user_id: p.user_id,
          author_id: p.user_id,
          image_url: p.image_url ?? null,
          caption: p.caption ?? '',
          content: p.caption ?? '',
          location: p.location ?? null,
          likes_count: typeof p.likes_count === 'number' ? p.likes_count : 0,
          comments_count: typeof p.comments_count === 'number' ? p.comments_count : 0,
          created_at: p.created_at ?? new Date().toISOString(),
          is_liked: Boolean(p.is_liked),
          is_bookmarked: Boolean(p.is_bookmarked),
        };
        return post;
      });
      set({ posts: transformed, loading: false });
      
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
    try {
      const channel = supabase
        .channel('posts_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          async (payload: any) => {
            const { eventType } = payload;
            if (eventType === 'INSERT') {
              const n = payload.new;
              const aId = n.user_id ?? n.author_id;
              let username = '';
              let user_avatar: string | null = null;
              try {
                const { data: prof } = await supabase
                  .from('profiles')
                  .select('username, full_name, avatar_url')
                  .eq('id', aId)
                  .maybeSingle();
                if (prof) {
                  username = prof.username || prof.full_name || '';
                  user_avatar = prof.avatar_url || null;
                }
              } catch {}

              const post: Post = {
                id: String(n.id),
                user_id: aId,
                author_id: aId,
                username,
                user_avatar: user_avatar || 'https://i.pravatar.cc/150?img=1',
                image_url: n.image_url ?? null,
                caption: n.caption ?? '',
                content: n.caption ?? '',
                location: null,
                likes_count: 0,
                comments_count: 0,
                created_at: n.created_at ?? new Date().toISOString(),
                is_liked: false,
                is_bookmarked: false,
              };
              set((state) => {
                const exists = state.posts.some((p) => String(p.id) === String(post.id));
                return exists ? state : { posts: [post, ...state.posts] };
              });
            } else if (eventType === 'UPDATE') {
              const n = payload.new;
              set((state) => ({
                posts: state.posts.map((p) =>
                  String(p.id) === String(n.id)
                    ? {
                        ...p,
                        user_id: (n.user_id ?? n.author_id ?? p.user_id),
                        author_id: (n.author_id ?? n.user_id ?? p.author_id),
                        image_url: n.image_url ?? p.image_url,
                        caption: n.caption ?? p.caption,
                        content: n.caption ?? p.content,
                        created_at: n.created_at ?? p.created_at,
                      }
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

      // Note: store method returns void; unsubscribe can be added if needed
    } catch (e) {
      console.warn('Realtime subscription setup failed:', e);
    }
  },

  // Backward-compat alias
  subscribeToRealtime: () => {
    get().subscribeRealtime();
    
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

  deletePost: (postId: string) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
  }
}));

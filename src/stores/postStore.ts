import { create } from 'zustand';
import { supabase } from './../lib/supabase';
import type { Post } from './../lib/types';

type CreateArgs = { content?: string; imageUri?: string | null };

type PostState = {
  posts: Post[];
  loading: boolean;
  subscribeOnce: boolean;
  fetchInitial: () => Promise<void>;
  createPost: (args: CreateArgs) => Promise<{ error?: string }>;
  subscribeRealtime: () => void;
  refresh: () => Promise<void>;
};

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  loading: false,
  subscribeOnce: false,

  // Load latest 50 posts (most-recent-first) with author info
  fetchInitial: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('posts')
      .select(
        `id, author_id, content, image_url, created_at,
         author:profiles(full_name, avatar_url, username)`
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error) set({ posts: (data ?? []) as Post[] });
    set({ loading: false });
  },

  // Create a post (text + optional image to bucket `post-images`)
  createPost: async ({ content, imageUri }) => {
    try {
      let image_url: string | null = null;
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { error: 'Not authenticated' };

      if (imageUri) {
        const ext = imageUri.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const resp = await fetch(imageUri);
        const blob = await resp.blob();

        const { error: upErr } = await supabase.storage
          .from('post-images')
          .upload(filePath, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: false,
          });
        if (upErr) return { error: upErr.message };

        const { data: pub } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        image_url = pub.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({ author_id: user.id, content: content ?? null, image_url });
      if (error) return { error: error.message };

      return {};
    } catch (e: any) {
      return { error: e?.message ?? 'Upload failed' };
    }
  },

  // Realtime: refresh on any INSERT/UPDATE/DELETE
  subscribeRealtime: () => {
    if (get().subscribeOnce) return;

    supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => get().refresh()
      )
      .subscribe();

    set({ subscribeOnce: true });
  },

  refresh: async () => {
    await get().fetchInitial();
  },
}));

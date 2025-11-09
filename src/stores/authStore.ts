    import { create } from 'zustand';
    import { supabase } from './../lib/supabase';
    import type { Session, User } from '@supabase/supabase-js';
    import type { Profile } from './../lib/types';


    interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    init: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, full_name?: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    }


    export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    loading: true,


    init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null });


    // subscribe to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, user: session?.user ?? null });
    if (session?.user) get().refreshProfile();
    else set({ profile: null });
    });


    if (data.session?.user) await get().refreshProfile();
    set({ loading: false });
    },


    signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
    },


    signUp: async (email, password, full_name) => {
    const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
    data: { full_name },
    },
    });
    if (error) return { error: error.message };
    return {};
    },

    signOut: async () => {
    await supabase.auth.signOut();
    },

    refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    set({ profile });
    },
    }));
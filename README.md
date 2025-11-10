Framez (Expo + Supabase + Zustand)

Overview
- Instagram‑style feed built with Expo React Native, Zustand for state, and Supabase for backend data, auth, and realtime.

Quick Start
- Prerequisites
  - Node 18+ and npm 9+ (or Yarn)
  - Android Studio/Xcode for emulators (optional if using a physical device)
  - A Supabase project (free tier is fine)
- Install
  - `npm install`
- Configure env
  - Create `.env.local` with:
    - `SUPABASE_URL=your-project-url`
    - `SUPABASE_ANON_KEY=your-anon-key`
  - Secrets are injected at build time via `app.config.ts`; do not put keys in `app.json`.
- Run
  - `npm run start` (or `npx expo start`) and choose Android/iOS/Web
  - Android: `npm run android`
  - iOS (macOS): `npm run ios`

Backend: Supabase
- Why Supabase
  - Postgres + Realtime + Auth with an excellent JS SDK
  - Simple RLS policies for secure mobile access
  - Easy local dev and hosted production
- How it’s wired
  - `app.config.ts` reads `.env.local` and injects `extra.supabaseUrl` and `extra.supabaseAnonKey`
  - `src/lib/supabase.ts` creates a `supabase` client from `expo-constants` `extra`
  - `src/stores/postStore.ts` fetches/creates posts and listens to realtime changes

Minimal Schema
- Use `author_id` (preferred) or `user_id` (fallback). The app will try `author_id` first and transparently fall back to `user_id` if that’s what your table uses.
- Profiles (example)
  - `id uuid primary key references auth.users(id)`
  - `username text`, `full_name text`, `avatar_url text`, `email text`
- Posts (author_id flavor)
  - `id uuid primary key default gen_random_uuid()`
  - `author_id uuid not null references public.profiles(id) on delete cascade`
  - `caption text`, `image_url text`, `created_at timestamptz not null default now()`
  - Index: `create index if not exists idx_posts_author_id on public.posts(author_id);`
- RLS policies (adjust to your needs)
  - Enable RLS on `public.posts`
  - Select: `using (true)` for public read or add custom filters
  - Insert: `with check (auth.uid() = author_id)`
  - Update/Delete: `using (auth.uid() = author_id)`
- If you currently use `user_id` instead:
  - Rename: `alter table public.posts rename column user_id to author_id;`, or
  - Keep `user_id`: add a FK to `profiles(id)` and the app will use it automatically.

Features Implemented
- Feed and posts
  - Fetches posts with only essential fields: `id`, `image_url`, `caption`, `created_at`, author relation
  - Realtime subscription updates list on insert/update/delete
  - Create/delete posts with optimistic UI fallbacks
  - Local mock data for instant first load before network
- Theming
  - Global light/dark switch via `Zustand` persisted store
  - Feed header & stories section theme-aware
  - Profile screen colors/borders/text theme-aware
  - Bottom tab bar (navbar) background/border/tints toggle with theme
- State & types
  - Stores with `zustand` + `AsyncStorage` persistence
  - Typescript path aliases for `@stores/*`, `@components/*`, `@screens/*`, `@lib/*`

File Map (Key Spots)
- Config injection: `app.config.ts`
- Supabase client: `src/lib/supabase.ts`
- Posts store: `src/stores/postStore.ts`
- Stories store: `src/stores/storyStore.ts`
- Theme store: `src/stores/themeStore.ts`
- Feed UI: `src/screens/FeedScreen.tsx`
- Profile UI: `src/screens/ProfileScreen.tsx`
- Navigation + themed tabs: `src/navigation/index.tsx`

EAS/CI Notes
- Add secrets in EAS for production builds:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- Because config is dynamic (`app.config.ts`), Expo picks up values at build time without committing secrets.

Troubleshooting
- Credentials error at startup
  - Ensure `.env.local` exists and restart the Expo server so `app.config.ts` runs
- Column does not exist (e.g., `posts.user_id` or `posts.author_id`)
  - Create the missing column + FK or rename to match the preferred `author_id`
- RLS blocking reads/inserts
  - Add policies listed above; test with the SQL editor
- Theme not toggling
  - The toggle lives in the Feed header (`src/screens/FeedScreen.tsx`) and updates `useThemeStore`; navbar and stories/profile respond automatically

Scripts
- `npm run start` — start Metro bundler
- `npm run android` — build/run Android dev client
- `npm run ios` — build/run iOS dev client (macOS)
- `npm run web` — web preview


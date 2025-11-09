export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  username: string;
  email: string;
};

export type Post = {
  id: string;
  author_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  author?: {
    full_name?: string | null;
    avatar_url?: string | null;
    username?: string | null;
  };
};

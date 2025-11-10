import { create } from 'zustand';
import storiesData from './../data/stories.json';

export interface StoryMedia {
  id: string;
  type: string;
  url: string;
  duration: number;
  timestamp: string;
}

export interface StoryUser {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  isYours: boolean;
  hasStory: boolean;
  storyCount: number;
  lastUpdated: string | null;
  stories?: StoryMedia[];
}

// Type guard to validate StoryUser objects from JSON
function isStoryUser(obj: any): obj is StoryUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.avatar === 'string' &&
    typeof obj.isYours === 'boolean' &&
    typeof obj.hasStory === 'boolean'
  );
}

export interface StoryStore {
  stories: StoryUser[];
  currentStory: StoryUser | null;
  loading: boolean;

  // Actions
  fetchStories: () => Promise<void>;
  addStory: (userId: string, story: StoryMedia) => void;
  viewStory: (storyId: string) => void;
  setCurrentStory: (story: StoryUser | null) => void;
  markStoryAsViewed: (storyId: string) => void;
  refreshStories: () => Promise<void>;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  stories: [],
  currentStory: null,
  loading: false,

  fetchStories: async () => {
    set({ loading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const typed = storiesData as { stories: unknown[] };
      if (Array.isArray(typed?.stories)) {
        const valid = typed.stories.filter(isStoryUser) as StoryUser[];
        set({ stories: valid, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      set({ loading: false });
    }
  },

  addStory: (userId: string, story: StoryMedia) => {
    set((state) => {
      const updated = state.stories.map((s) =>
        s.userId === userId
          ? {
              ...s,
              hasStory: true,
              storyCount: s.storyCount + 1,
              lastUpdated: new Date().toISOString(),
              stories: [...(s.stories ?? []), story],
            }
          : s
      );
      return { stories: updated };
    });
  },

  viewStory: (storyId: string) => {
    const storyUser = get().stories.find((s) => s.id === storyId || s.userId === storyId);
    if (storyUser) set({ currentStory: storyUser });
  },

  setCurrentStory: (story: StoryUser | null) => {
    set({ currentStory: story });
  },

  markStoryAsViewed: (storyId: string) => {
    console.log('Story viewed:', storyId);
  },

  refreshStories: async () => {
    await get().fetchStories();
  },
}));

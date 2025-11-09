import { create } from 'zustand';
import storiesData from './../data/stories.json';

interface Story {
  id: string;
  username: string;
  avatar:string;
  image: string;
 
}

// Type guard to check if an object is a valid Story
function isStory(obj: any): obj is Story {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.avatar === 'string' &&
    typeof obj.image === 'string'
  );
}

interface StoryStore {
  stories: Story[];
  currentStory: Story | null;
  loading: boolean;
  
  // Actions
  fetchStories: () => Promise<void>;
  addStory: (storyData: Omit<Story, 'id'>) => void;
  viewStory: (storyId: string) => void;
  setCurrentStory: (story: Story | null) => void;
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (Array.isArray(storiesData)) {
        const validStories = storiesData.filter(isStory);
        set({ stories: validStories, loading: false });
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      set({ loading: false });
    }
  },

  addStory: (storyData: Omit<Story, 'id'>) => {
    set(state => {
      const newStory: Story = {
        id: new Date().toISOString(),
        ...storyData,
      };
      return { stories: [newStory, ...state.stories] };
    });
  },

  viewStory: (storyId: string) => {
    const story = get().stories.find(s => s.id === storyId);
    if (story) {
      set({ currentStory: story });
    }
  },

  setCurrentStory: (story: Story | null) => {
    set({ currentStory: story });
  },

  markStoryAsViewed: (storyId: string) => {
    // In production, this would make an API call to mark as viewed
    console.log('Story viewed:', storyId);
  },

  refreshStories: async () => {
    await get().fetchStories();
  }
}));
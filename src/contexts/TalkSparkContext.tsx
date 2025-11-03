import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useUserPlan } from '@/hooks/useUserPlan';
import { toast } from 'sonner';

export interface Opener {
  id: string;
  text: string;
  tone: string;
}

export interface FollowUp {
  id: string;
  text: string;
  openerId: string;
}

export interface Favorite {
  id: string;
  text: string;
  tone: string[];
  createdAt: string;
  type: 'opener' | 'followup';
  likes: number;
  remindAt?: string;
}

interface TalkSparkContextType {
  profileText: string;
  setProfileText: (text: string) => void;
  userProfileText: string;
  setUserProfileText: (text: string) => void;
  selectedTones: string[];
  setSelectedTones: (tones: string[]) => void;
  generatedOpeners: Opener[];
  setGeneratedOpeners: (openers: Opener[]) => void;
  followUps: FollowUp[];
  setFollowUps: (followUps: FollowUp[]) => void;
  favorites: Favorite[];
  addToFavorites: (item: Opener | FollowUp, type: 'opener' | 'followup', tones: string[], remindIn24h?: boolean) => void;
  removeFromFavorites: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  rateFavorite: (itemId: string, rating: number) => void;
  getExpiredReminders: () => Favorite[];
  dismissReminder: (itemId: string) => void;
}

const TalkSparkContext = createContext<TalkSparkContextType | undefined>(undefined);

export const TalkSparkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileText, setProfileText] = useState('');
  const [userProfileText, setUserProfileText] = useState('');
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [generatedOpeners, setGeneratedOpeners] = useState<Opener[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { plan } = useUserPlan();
  const { usage, incrementFavorites } = useUsageTracking();

  // Load userProfileText from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('talkSpark-userProfile');
    if (stored) {
      try {
        setUserProfileText(stored);
      } catch (e) {
        console.error('Failed to load user profile', e);
      }
    }
  }, []);

  // Save userProfileText to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('talkSpark-userProfile', userProfileText);
  }, [userProfileText]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('talkSpark-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('talkSpark-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = async (item: Opener | FollowUp, type: 'opener' | 'followup', tones: string[], remindIn24h?: boolean) => {
    // Check favorites limit for free users
    if (plan === 'free' && usage.hasExceededFavoriteLimit) {
      toast.error('Favorites limit reached. Upgrade for unlimited favorites!');
      return;
    }

    if (!favorites.find(f => f.id === item.id)) {
      const remindAt = remindIn24h 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined;
      
      const favorite: Favorite = {
        id: item.id,
        text: item.text,
        tone: tones,
        createdAt: new Date().toISOString(),
        type,
        likes: 0,
        remindAt,
      };
      setFavorites([...favorites, favorite]);

      // Increment favorites count in usage tracking
      await incrementFavorites();
    }
  };

  const removeFromFavorites = (itemId: string) => {
    setFavorites(favorites.filter(f => f.id !== itemId));
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.id === itemId);
  };

  const rateFavorite = (itemId: string, rating: number) => {
    setFavorites(favorites.map(f => 
      f.id === itemId ? { ...f, likes: rating } : f
    ));
  };

  const getExpiredReminders = () => {
    const now = Date.now();
    return favorites.filter(f => f.remindAt && new Date(f.remindAt).getTime() <= now);
  };

  const dismissReminder = (itemId: string) => {
    setFavorites(favorites.map(f => 
      f.id === itemId ? { ...f, remindAt: undefined } : f
    ));
  };

  return (
    <TalkSparkContext.Provider
      value={{
        profileText,
        setProfileText,
        userProfileText,
        setUserProfileText,
        selectedTones,
        setSelectedTones,
        generatedOpeners,
        setGeneratedOpeners,
        followUps,
        setFollowUps,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        rateFavorite,
        getExpiredReminders,
        dismissReminder,
      }}
    >
      {children}
    </TalkSparkContext.Provider>
  );
};

export const useTalkSpark = () => {
  const context = useContext(TalkSparkContext);
  if (!context) {
    throw new Error('useTalkSpark must be used within TalkSparkProvider');
  }
  return context;
};

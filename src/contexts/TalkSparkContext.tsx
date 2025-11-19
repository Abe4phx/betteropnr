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
  remindAt?: string;
  matchName?: string;
}

export interface Rating {
  id: string;
  stars: number;
}

interface BetterOpnrContextType {
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
  addToFavorites: (item: Opener | FollowUp, type: 'opener' | 'followup', tones: string[], remindIn24h?: boolean, matchName?: string) => void;
  removeFromFavorites: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  ratings: Rating[];
  rateItem: (itemId: string, stars: number) => void;
  getItemRating: (itemId: string) => number;
  getExpiredReminders: () => Favorite[];
  dismissReminder: (itemId: string) => void;
}

const BetterOpnrContext = createContext<BetterOpnrContextType | undefined>(undefined);

export const BetterOpnrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileText, setProfileText] = useState('');
  const [userProfileText, setUserProfileText] = useState('');
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [generatedOpeners, setGeneratedOpeners] = useState<Opener[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const { plan } = useUserPlan();
  const { usage, incrementFavorites } = useUsageTracking();

  const MAX_FAVORITES = 20;

  // Load userProfileText from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('betterOpnr-userProfile');
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
    localStorage.setItem('betterOpnr-userProfile', userProfileText);
  }, [userProfileText]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('betterOpnr-favorites');
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
    localStorage.setItem('betterOpnr-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load ratings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('betterOpnr-ratings');
    if (stored) {
      try {
        setRatings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load ratings', e);
      }
    }
  }, []);

  // Save ratings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('betterOpnr-ratings', JSON.stringify(ratings));
  }, [ratings]);

  const addToFavorites = async (item: Opener | FollowUp, type: 'opener' | 'followup', tones: string[], remindIn24h?: boolean, matchName?: string) => {
    // Check if already at max favorites
    if (favorites.length >= MAX_FAVORITES) {
      toast.error(`Maximum ${MAX_FAVORITES} saved items reached. Remove some to add more.`);
      return;
    }

    // Check favorites limit for free users
    if (plan === 'free' && usage.hasExceededFavoriteLimit) {
      toast.error('Favorites limit reached. Upgrade for unlimited favorites!');
      return;
    }

    // Check reminder limits if user wants a reminder
    if (remindIn24h) {
      const activeReminders = favorites.filter(f => f.remindAt).length;
      const maxReminders = plan === 'free' ? 3 : 10;
      
      if (activeReminders >= maxReminders) {
        toast.error(`Maximum ${maxReminders} active reminders reached. ${plan === 'free' ? 'Upgrade for more reminders!' : 'Remove some to add more.'}`);
        return;
      }
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
        remindAt,
        matchName,
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

  const rateItem = (itemId: string, stars: number) => {
    setRatings(prevRatings => {
      const existingRating = prevRatings.find(r => r.id === itemId);
      if (existingRating) {
        return prevRatings.map(r => r.id === itemId ? { ...r, stars } : r);
      }
      return [...prevRatings, { id: itemId, stars }];
    });
  };

  const getItemRating = (itemId: string): number => {
    const rating = ratings.find(r => r.id === itemId);
    return rating?.stars || 0;
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
    <BetterOpnrContext.Provider
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
        ratings,
        rateItem,
        getItemRating,
        getExpiredReminders,
        dismissReminder,
      }}
    >
      {children}
    </BetterOpnrContext.Provider>
  );
};

export const useBetterOpnr = () => {
  const context = useContext(BetterOpnrContext);
  if (!context) {
    throw new Error('useBetterOpnr must be used within BetterOpnrProvider');
  }
  return context;
};

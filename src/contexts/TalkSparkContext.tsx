import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface TalkSparkContextType {
  profileText: string;
  setProfileText: (text: string) => void;
  selectedTones: string[];
  setSelectedTones: (tones: string[]) => void;
  generatedOpeners: Opener[];
  setGeneratedOpeners: (openers: Opener[]) => void;
  followUps: FollowUp[];
  setFollowUps: (followUps: FollowUp[]) => void;
  favorites: Opener[];
  addToFavorites: (opener: Opener) => void;
  removeFromFavorites: (openerId: string) => void;
  isFavorite: (openerId: string) => boolean;
}

const TalkSparkContext = createContext<TalkSparkContextType | undefined>(undefined);

export const TalkSparkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileText, setProfileText] = useState('');
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [generatedOpeners, setGeneratedOpeners] = useState<Opener[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [favorites, setFavorites] = useState<Opener[]>([]);

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

  const addToFavorites = (opener: Opener) => {
    if (!favorites.find(f => f.id === opener.id)) {
      setFavorites([...favorites, opener]);
    }
  };

  const removeFromFavorites = (openerId: string) => {
    setFavorites(favorites.filter(f => f.id !== openerId));
  };

  const isFavorite = (openerId: string) => {
    return favorites.some(f => f.id === openerId);
  };

  return (
    <TalkSparkContext.Provider
      value={{
        profileText,
        setProfileText,
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

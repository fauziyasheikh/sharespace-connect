import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_PROFILES } from '../data/demoUsers';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

type ThemeMode = 'light' | 'dark';

interface AppContextValue {
  currentUser: Profile | null;
  isLoggingIn: boolean;
  loginError: string | null;
  loginWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearLoginError: () => void;
  refreshCurrentUser: () => Promise<void>;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'sharespace-theme';
const USER_STORAGE_KEY = 'sharespace-profile';

const AppContext = createContext<AppContextValue | undefined>(undefined);

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getInitialProfile(): Profile | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed === 'object' &&
        (parsed.role === 'user' || parsed.role === 'admin')
      ) {
        return parsed;
      }
    }
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore parse error
  }
  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(getInitialProfile);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  // Sync theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen to OS system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (saved !== 'light' && saved !== 'dark') {
          setTheme(event.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.warn('Supabase profile query note:', error.message);
      }

      if (data) {
        const profile: Profile = {
          ...data,
          verified: data.verified ?? true,
          points: data.points ?? 0,
        };
        setCurrentUser(profile);
        try {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        } catch {
          // Ignore
        }
        return { success: true };
      }

      // If database does not yet contain this row, use the matching demo profile
      const fallback = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (fallback) {
        setCurrentUser(fallback);
        try {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fallback));
        } catch {
          // Ignore
        }
        return { success: true };
      }

      const msg = `Profile for "${email}" was not found in the profiles table.`;
      setLoginError(msg);
      return { success: false, error: msg };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during demo login.';
      setLoginError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser?.email) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (data) {
        setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
      }
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setLoginError(null);
    try {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  const value: AppContextValue = {
    currentUser,
    isLoggingIn,
    loginError,
    loginWithEmail,
    logout,
    clearLoginError,
    refreshCurrentUser,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

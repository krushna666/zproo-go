import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../api/services';
import type { User } from '../api/types';

const USER_KEY = 'zproo.user.v1';

interface AuthState {
  user: User | null;
  ready: boolean;
  signIn: (u: User) => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((raw) => {
        if (raw) {
          const u = JSON.parse(raw) as User;
          setAuthToken(u.token);
          setUser(u);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (u: User) => {
    setAuthToken(u.token);
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const updateUser = useCallback(
    async (patch: Partial<User>) => {
      if (!user) return;
      const next = { ...user, ...patch };
      setUser(next);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
    },
    [user],
  );

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, updateUser, signOut }), [user, ready, signIn, updateUser, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}

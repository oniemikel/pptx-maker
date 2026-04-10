'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useSyncExternalStore } from 'react';
import { auth } from '@/lib/firebase';

type AuthState = User | null | undefined;

let currentUser: AuthState;
let unsubscribeAuth: (() => void) | null = null;
const listeners = new Set<() => void>();

const emitChange = (): void => {
  listeners.forEach((listener) => listener());
};

const ensureSubscription = (): void => {
  if (unsubscribeAuth) {
    return;
  }

  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    currentUser = user;
    emitChange();
  });
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  ensureSubscription();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && unsubscribeAuth) {
      unsubscribeAuth();
      unsubscribeAuth = null;
      currentUser = undefined;
    }
  };
};

const getSnapshot = (): AuthState => currentUser;

const getServerSnapshot = (): AuthState => undefined;

export const useAuthUser = () => {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (user === undefined) {
    return { status: 'loading', user } as const;
  }

  if (user === null) {
    return { status: 'unauthenticated', user } as const;
  }

  return { status: 'authenticated', user } as const;
};

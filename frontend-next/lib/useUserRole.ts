'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useSyncExternalStore } from 'react';
import { auth, db } from '@/lib/firebase';
import { UserDoc } from '@/lib/types';

type RoleSnapshot = {
  status: 'loading' | 'ready';
  role: string;
};

let currentSnapshot: RoleSnapshot = { status: 'loading', role: '' };
let unsubscribeAuth: (() => void) | null = null;
let unsubscribeUserDoc: (() => void) | null = null;
const listeners = new Set<() => void>();

const emitChange = (): void => {
  listeners.forEach((listener) => listener());
};

const clearUserDocSubscription = (): void => {
  if (!unsubscribeUserDoc) {
    return;
  }

  unsubscribeUserDoc();
  unsubscribeUserDoc = null;
};

const setSnapshot = (next: RoleSnapshot): void => {
  currentSnapshot = next;
  emitChange();
};

const startAuthSubscription = (): void => {
  if (unsubscribeAuth) {
    return;
  }

  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    clearUserDocSubscription();

    if (!user?.email) {
      setSnapshot({ status: 'ready', role: '' });
      return;
    }

    setSnapshot({ status: 'loading', role: '' });

    unsubscribeUserDoc = onSnapshot(doc(db, 'users', user.email), (snapshot) => {
      if (!snapshot.exists()) {
        setSnapshot({ status: 'ready', role: '' });
        return;
      }

      const data = snapshot.data() as UserDoc;
      setSnapshot({ status: 'ready', role: data.role ?? '' });
    });
  });
};

const stopAllSubscriptions = (): void => {
  clearUserDocSubscription();

  if (unsubscribeAuth) {
    unsubscribeAuth();
    unsubscribeAuth = null;
  }

  currentSnapshot = { status: 'loading', role: '' };
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  startAuthSubscription();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      stopAllSubscriptions();
    }
  };
};

const getSnapshot = (): RoleSnapshot => currentSnapshot;

const getServerSnapshot = (): RoleSnapshot => ({ status: 'loading', role: '' });

export const useUserRole = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

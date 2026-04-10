'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/');
        return;
      }
      setReady(true);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('ログインしています...');

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('ログインしました。');
      router.replace('/');
    } catch {
      setPassword('');
      setMessage('ユーザ名またはパスワードが違います。');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <main className="centered">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="centered">
      <section className="authCard">
        <h1>ログイン</h1>

        <form onSubmit={login} className="authForm">
          <label htmlFor="email">e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

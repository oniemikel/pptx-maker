'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ContentForm from '@/components/ContentForm';
import { auth } from '@/lib/firebase';
import { DialogItem } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState<DialogItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);

      if (!user) {
        setIsAuthenticated(false);
        router.replace('/login');
        return;
      }

      setIsAuthenticated(true);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  if (!authReady || !isAuthenticated) {
    return (
      <main className="centered">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <h1 className="topbarTitle">DA研 定例会資料作成フォーム (Next.js)</h1>
        <div className="topbarActions">
          <button type="button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <section className="workspace">
        <ContentForm onDialogChange={setAgendaItems} />

        <aside className="agendaPanel">
          <h2>目次プレビュー</h2>
          <p className="agendaHint">1. 部門報告</p>
          {agendaItems.length === 0 ? (
            <p className="agendaHint">2. 連絡事項（未登録）</p>
          ) : (
            <div>
              <p className="agendaHint">2. 連絡事項</p>
              <ul>
                {agendaItems.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="agendaItem">
                    {item.title || '（タイトルなし）'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

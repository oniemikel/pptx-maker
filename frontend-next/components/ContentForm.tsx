'use client';

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db, apiBaseUrl } from '@/lib/firebase';
import {
  DepartmentsDoc,
  DialogItem,
  GenerateResponse,
} from '@/lib/types';
import { toDisplayDate, toFilenameDate, todayAsInput } from '@/lib/date';
import { useUserRole } from '@/lib/useUserRole';

type ContentFormProps = {
  onDialogChange?: (items: DialogItem[]) => void;
};

type BusyState = 'idle' | 'saving' | 'downloading';

const initialDialogItem: DialogItem = {
  title: '',
  content: '',
};

const pptxMimeType =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const normalizeApiBaseUrl = (url: string): string => url.replace(/\/$/, '');

const parseGenerateResponse = (payload: unknown): GenerateResponse => {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('API response is not an object.');
  }

  const raw = payload as Record<string, unknown>;
  if (typeof raw.file === 'string' && typeof raw.filename === 'string') {
    return { file: raw.file, filename: raw.filename };
  }

  if (typeof raw.body === 'string') {
    const parsedBody = JSON.parse(raw.body) as Record<string, unknown>;
    if (
      typeof parsedBody.file === 'string' &&
      typeof parsedBody.filename === 'string'
    ) {
      return {
        file: parsedBody.file,
        filename: parsedBody.filename,
      };
    }
  }

  throw new Error('Unexpected API response format.');
};

const downloadBase64File = (fileBase64: string, filename: string): void => {
  const binaryString = atob(fileBase64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: pptxMimeType });
  const downloadUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
};

export default function ContentForm({ onDialogChange }: ContentFormProps) {
  const [date, setDate] = useState<string>(todayAsInput());
  const [ds, setDs] = useState<string>('');
  const [de, setDe] = useState<string>('');
  const [biz, setBiz] = useState<string>('');
  const [cc, setCc] = useState<string>('');
  const [dialog, setDialog] = useState<DialogItem[]>([]);
  const [draftItem, setDraftItem] = useState<DialogItem>(initialDialogItem);
  const [busyState, setBusyState] = useState<BusyState>('idle');
  const [message, setMessage] = useState<string>('');
  const { role } = useUserRole();

  const setDialogWithCallback = (
    updater: (current: DialogItem[]) => DialogItem[],
  ): void => {
    setDialog((current) => {
      const nextDialog = updater(current);
      onDialogChange?.(nextDialog);
      return nextDialog;
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'root', 'departments'), (snapshot) => {
      const data = snapshot.data() as Partial<DepartmentsDoc> | undefined;
      if (!data) {
        return;
      }

      setDs(data.ds ?? '');
      setDe(data.de ?? '');
      setBiz(data.biz ?? '');
      setCc(data.cc ?? '');
      const nextDialog = Array.isArray(data.info_contents) ? data.info_contents : [];
      setDialog(nextDialog);
      onDialogChange?.(nextDialog);
    });

    return () => unsubscribe();
  }, []);

  const isBusy = busyState !== 'idle';

  const formattedDate = toDisplayDate(date);

  const canEditDepartment = (department: 'ds' | 'de' | 'biz' | 'cc'): boolean =>
    role.includes(department);

  const addInfoItem = () => {
    const title = draftItem.title.trim();
    const content = draftItem.content.trim();

    if (title.length === 0 && content.length === 0) {
      return;
    }

    setDialogWithCallback((current) => [...current, { title, content }]);
    setDraftItem(initialDialogItem);
    setMessage('連絡事項を追加しました。');
  };

  const removeInfoItem = (index: number) => {
    setDialogWithCallback((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    setMessage('連絡事項を削除しました。');
  };

  const reset = () => {
    setDs('');
    setDe('');
    setBiz('');
    setCc('');
    setDraftItem(initialDialogItem);
    setDialogWithCallback(() => []);
    setMessage('入力内容をリセットしました。');
  };

  const save = async () => {
    setBusyState('saving');
    setMessage('下書きを保存しています...');

    const payload: DepartmentsDoc = {
      ds,
      de,
      biz,
      cc,
      info_contents: dialog,
    };

    try {
      await setDoc(doc(db, 'root', 'departments'), payload, { merge: true });
      setMessage('下書きを保存しました。');
    } catch {
      setMessage('下書き保存に失敗しました。');
    } finally {
      setBusyState('idle');
    }
  };

  const downloadPowerpoint = async () => {
    if (!apiBaseUrl) {
      setMessage('NEXT_PUBLIC_API_URL が未設定です。');
      return;
    }

    setBusyState('downloading');
    setMessage('PowerPointを生成しています...');

    const params = {
      departments_contents: {
        ds: [ds],
        de: [de],
        biz: [biz],
        cc: [cc],
      },
      datefmt: formattedDate,
      datefmt_filename: toFilenameDate(date),
      info_contents: dialog,
    };

    try {
      const response = await fetch(`${normalizeApiBaseUrl(apiBaseUrl)}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate file: ${response.status}`);
      }

      const responseJson = (await response.json()) as unknown;
      const parsedResponse = parseGenerateResponse(responseJson);
      downloadBase64File(parsedResponse.file, parsedResponse.filename);
      setMessage('PowerPointをダウンロードしました。');
    } catch {
      setMessage('PowerPointの生成に失敗しました。');
    } finally {
      setBusyState('idle');
    }
  };

  return (
    <section className="panel">
      <h2 className="panelTitle">定例会資料フォーム</h2>

      <div className="fieldGroup">
        <label htmlFor="meeting-date">定例会日時</label>
        <input
          id="meeting-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          disabled={isBusy}
        />
      </div>

      <div className="actionsRow">
        <button type="button" onClick={save} disabled={isBusy}>
          {busyState === 'saving' ? '保存中...' : '下書き保存'}
        </button>
        <button type="button" onClick={downloadPowerpoint} disabled={isBusy}>
          {busyState === 'downloading' ? '生成中...' : 'PowerPoint生成'}
        </button>
        <button type="button" className="danger" onClick={reset} disabled={isBusy}>
          リセット
        </button>
      </div>

      <p className="datePreview">発行日: {formattedDate}</p>

      <div className="fieldGroup">
        <label htmlFor="ds">DS部門</label>
        <textarea
          id="ds"
          value={ds}
          onChange={(event) => setDs(event.target.value)}
          disabled={!canEditDepartment('ds') || isBusy}
          rows={3}
        />
      </div>

      <div className="fieldGroup">
        <label htmlFor="de">DE部門</label>
        <textarea
          id="de"
          value={de}
          onChange={(event) => setDe(event.target.value)}
          disabled={!canEditDepartment('de') || isBusy}
          rows={3}
        />
      </div>

      <div className="fieldGroup">
        <label htmlFor="biz">Biz部門</label>
        <textarea
          id="biz"
          value={biz}
          onChange={(event) => setBiz(event.target.value)}
          disabled={!canEditDepartment('biz') || isBusy}
          rows={3}
        />
      </div>

      <div className="fieldGroup">
        <label htmlFor="cc">CC部門</label>
        <textarea
          id="cc"
          value={cc}
          onChange={(event) => setCc(event.target.value)}
          disabled={!canEditDepartment('cc') || isBusy}
          rows={3}
        />
      </div>

      <hr className="divider" />

      <h3 className="sectionTitle">連絡事項</h3>
      <div className="fieldGroup">
        <label htmlFor="new-title">タイトル</label>
        <input
          id="new-title"
          type="text"
          value={draftItem.title}
          onChange={(event) =>
            setDraftItem((current) => ({ ...current, title: event.target.value }))
          }
          disabled={isBusy}
        />
      </div>

      <div className="fieldGroup">
        <label htmlFor="new-content">内容</label>
        <textarea
          id="new-content"
          value={draftItem.content}
          onChange={(event) =>
            setDraftItem((current) => ({ ...current, content: event.target.value }))
          }
          rows={4}
          disabled={isBusy}
        />
      </div>

      <button type="button" onClick={addInfoItem} disabled={isBusy}>
        連絡事項を追加
      </button>

      <ul className="itemsList">
        {dialog.length === 0 ? (
          <li className="empty">連絡事項は未登録です。</li>
        ) : (
          dialog.map((item, index) => (
            <li key={`${item.title}-${index}`} className="itemCard">
              <div>
                <p className="itemTitle">{item.title || '（タイトルなし）'}</p>
                <p className="itemContent">{item.content || '（内容なし）'}</p>
              </div>
              <button
                type="button"
                className="danger"
                onClick={() => removeInfoItem(index)}
                disabled={isBusy}
              >
                削除
              </button>
            </li>
          ))
        )}
      </ul>

      {message && <p className="message">{message}</p>}
    </section>
  );
}

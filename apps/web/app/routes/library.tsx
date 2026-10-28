import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LessonRow } from '../components/LessonRow';
import { buttonPrimary, EmptyState, Page } from '../components/Page';
import { Segmented } from '../components/Segmented';
import { useApp, useBookmarks, useEvents, useSeen } from '../data/app-context';

type Tab = 'saved' | 'history' | 'completed';

export default function LibraryPage() {
  const { t } = useTranslation();
  const { library } = useApp();
  const bookmarks = useBookmarks();
  const events = useEvents();
  const { seen, completed } = useSeen();
  const [tab, setTab] = useState<Tab>('saved');

  const savedIds = useMemo(
    () =>
      bookmarks
        .filter((b) => b.saved)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((b) => b.conceptId),
    [bookmarks],
  );
  const savedSet = new Set(savedIds);
  const ordered = (type: 'lesson_opened' | 'lesson_completed') => {
    const out: string[] = [];
    for (const e of [...events].reverse())
      if (e.type === type && !out.includes(e.conceptId)) out.push(e.conceptId);
    return out;
  };
  const lists = {
    saved: savedIds,
    history: ordered('lesson_opened'),
    completed: ordered('lesson_completed'),
  };
  const ids = lists[tab];
  const label = (key: Tab) =>
    t('library.tabCount', { label: t(`library.${key}`), count: lists[key].length });
  const concepts = ids.map((id) => library.concept(id)).filter((c) => c !== undefined);

  return (
    <Page title={t('library.title')}>
      <div className="mb-5">
        <Segmented<Tab>
          label={t('library.title')}
          hideLabel
          options={[
            { value: 'saved', label: label('saved') },
            { value: 'history', label: label('history') },
            { value: 'completed', label: label('completed') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {concepts.length === 0 ? (
        <EmptyState
          title={t(`library.empty.${tab}Title`)}
          body={t(`library.empty.${tab}Body`)}
          action={
            <Link to="/app/discover" className={buttonPrimary}>
              {t('review.goDiscover')}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {concepts.map((c) => (
            <li key={c.id}>
              <LessonRow
                concept={c}
                saved={savedSet.has(c.id)}
                seen={seen.has(c.id)}
                completed={completed.has(c.id)}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-center text-[13.5px] text-muted">{t('library.localNote')}</p>
    </Page>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { SearchIcon } from '../components/icons';
import { LessonRow } from '../components/LessonRow';
import { EmptyState, Page, Section } from '../components/Page';
import { TopicIcon, topicTint } from '../components/TopicIcon';
import { useApp, useSavedIds, useSeen } from '../data/app-context';

export default function Explore() {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const { seen, completed } = useSeen();
  const saved = useSavedIds();
  const [query, setQuery] = useState('');
  const results = query.trim() === '' ? null : library.search(query, prefs.locale);

  return (
    <Page title={t('explore.title')} subtitle={t('explore.subtitle')}>
      <div className="relative mb-8">
        <SearchIcon
          size={20}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
        />
        <label htmlFor="search" className="sr-only">
          {t('explore.searchLabel')}
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder={t('explore.searchPlaceholder')}
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-13 w-full rounded-2xl bg-surface py-3.5 pr-4 pl-12 text-[16px] shadow-card ring-1 ring-line outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
        />
      </div>

      {results !== null ? (
        <Section title={t('explore.results', { count: results.length })}>
          <div aria-live="polite">
            {results.length === 0 ? (
              <EmptyState title={t('explore.noResultsTitle')} body={t('explore.noResultsBody')} />
            ) : (
              <ul className="flex flex-col gap-2">
                {results.map((c) => (
                  <li key={c.id}>
                    <LessonRow
                      concept={c}
                      saved={saved.has(c.id)}
                      seen={seen.has(c.id)}
                      completed={completed.has(c.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      ) : (
        <Section title={t('explore.topics')}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {library.topics.map((topic) => {
              const concepts = library.conceptsInTopic(topic.id);
              const explored = concepts.filter((c) => seen.has(c.id)).length;
              const trails = library.clustersInTopic(topic.id).length;
              const following = prefs.interests.includes(topic.id);
              const muted = prefs.mutedTopics.includes(topic.id);
              return (
                <li key={topic.id}>
                  <Link
                    to={`/app/topic/${topic.slug[prefs.locale]}`}
                    className="pressable topic-card relative flex h-full flex-col gap-3 overflow-hidden rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line hover:ring-primary"
                  >
                    <span
                      className="absolute -top-10 -right-10 size-32 rounded-full"
                      style={{ background: topicTint(topic.accentColor, 0.16) }}
                      aria-hidden="true"
                    />
                    <span
                      className="relative flex size-12 items-center justify-center rounded-2xl"
                      style={{ background: topicTint(topic.accentColor, 0.22) }}
                    >
                      <TopicIcon icon={topic.icon} size={26} />
                    </span>
                    <span className="relative">
                      <span className="block font-display text-xl leading-snug font-semibold">
                        {topic.name[prefs.locale]}
                      </span>
                      <span className="mt-1 block text-[15px] text-muted">
                        {topic.description[prefs.locale]}
                      </span>
                    </span>
                    <span className="relative mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
                      <span>{t('explore.lessonCount', { count: concepts.length })}</span>
                      <span>{t('explore.trailCount', { count: trails })}</span>
                      {explored > 0 && (
                        <span className="text-primary-strong">
                          {t('explore.exploredCount', { count: explored, total: concepts.length })}
                        </span>
                      )}
                      {following && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-ink">
                          {t('topic.following')}
                        </span>
                      )}
                      {muted && (
                        <span className="rounded-full bg-danger-soft px-2 py-0.5 font-semibold text-ink">
                          {t('topic.muted')}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </Page>
  );
}

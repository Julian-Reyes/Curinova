import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { SearchIcon } from '../components/icons';
import { LessonRow } from '../components/LessonRow';
import { EmptyState, Page, Section } from '../components/Page';
import { TopicArt } from '../components/TopicArt';
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
          className="min-h-[50px] w-full rounded-2xl bg-surface py-3 pr-4 pl-12 text-[16px] ring-1 ring-line outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/40"
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
          <ul className="topic-tiles">
            {library.topics.map((topic, i) => {
              const concepts = library.conceptsInTopic(topic.id);
              const explored = concepts.filter((c) => seen.has(c.id)).length;
              const trails = library.clustersInTopic(topic.id).length;
              const following = prefs.interests.includes(topic.id);
              const muted = prefs.mutedTopics.includes(topic.id);
              return (
                <li key={topic.id} className={i === 0 ? 'is-wide' : undefined}>
                  <Link
                    to={`/app/topic/${topic.slug[prefs.locale]}`}
                    className="topic-tile pressable"
                    data-topic={topic.id}
                  >
                    <TopicArt topic={topic} size="sm" />
                    <span className="topic-tile-text">
                      {(following || muted) && (
                        <span className="topic-tile-flag">
                          {following ? t('topic.following') : t('topic.muted')}
                        </span>
                      )}
                      <span className="block font-display text-[16px] leading-tight font-bold tracking-tight">
                        {topic.name[prefs.locale]}
                      </span>
                      <span className="block text-[12px] font-medium opacity-85">
                        {t('explore.trailCount', { count: trails })} ·{' '}
                        {t('explore.lessonCount', { count: concepts.length })}
                      </span>
                      <span
                        className="topic-tile-bar"
                        role="img"
                        aria-label={t('explore.exploredCount', {
                          count: explored,
                          total: concepts.length,
                        })}
                      >
                        <i
                          style={{ width: `${(explored / Math.max(1, concepts.length)) * 100}%` }}
                        />
                      </span>
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

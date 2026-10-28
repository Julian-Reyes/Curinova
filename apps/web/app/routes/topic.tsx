import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon } from '../components/icons';
import { LessonRow } from '../components/LessonRow';
import {
  buttonPrimary,
  buttonSecondary,
  Card,
  EmptyState,
  Page,
  Section,
} from '../components/Page';
import { Segmented } from '../components/Segmented';
import { TopicArt, topicImageCredit } from '../components/TopicArt';
import { useApp, useSavedIds, useSeen } from '../data/app-context';
import { trailHref } from '../features/feed/LessonSheets';

type Filter = 'suggested' | 'shortest' | 'unseen';

export default function TopicPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const { library, prefs, updatePrefs } = useApp();
  const { seen, completed } = useSeen();
  const saved = useSavedIds();
  const [filter, setFilter] = useState<Filter>('suggested');
  const topic = library.topicBySlug(slug, prefs.locale);

  if (!topic) {
    return (
      <Page title={t('topic.notFound')}>
        <Link to="/app/explore" className={buttonPrimary}>
          {t('nav.explore')}
        </Link>
      </Page>
    );
  }

  const clusters = library.clustersInTopic(topic.id);
  let concepts = library.conceptsInTopic(topic.id);
  if (filter === 'shortest') {
    concepts = [...concepts].sort((a, b) => {
      const va = library.variant(a.id, prefs.locale);
      const vb = library.variant(b.id, prefs.locale);
      return (va ? library.readingSeconds(va) : 0) - (vb ? library.readingSeconds(vb) : 0);
    });
  } else if (filter === 'unseen') {
    concepts = concepts.filter((c) => !seen.has(c.id));
  }
  const following = prefs.interests.includes(topic.id);
  const muted = prefs.mutedTopics.includes(topic.id);

  const credit = topicImageCredit(topic);
  const here = `/app/topic/${topic.slug[prefs.locale]}`;

  return (
    <Page
      title={topic.name[prefs.locale]}
      hero={
        <header className="topic-hero mb-4" data-topic={topic.id}>
          <TopicArt topic={topic} size="full" />
          <Link
            to="/app/explore"
            className="topic-hero-back pressable"
            aria-label={t('nav.explore')}
          >
            <ChevronLeftIcon size={24} />
          </Link>
          <div className="topic-hero-text">
            <h1 className="font-display text-[28px] leading-tight font-extrabold tracking-tight">
              {topic.name[prefs.locale]}
            </h1>
            <p className="mt-1.5 text-[15px] leading-snug opacity-90">
              {topic.description[prefs.locale]}
            </p>
          </div>
        </header>
      }
    >
      <div className="mb-2 flex flex-wrap items-center gap-2" data-topic={topic.id}>
        <button
          type="button"
          aria-pressed={following}
          onClick={() => {
            updatePrefs({
              interests: following
                ? prefs.interests.filter((id) => id !== topic.id)
                : [...prefs.interests, topic.id],
              mutedTopics: prefs.mutedTopics.filter((id) => id !== topic.id),
            });
          }}
          className={`${following ? buttonPrimary : buttonSecondary} min-h-11`}
        >
          {following && <CheckIcon size={16} strokeWidth={2.6} />}
          {following ? t('topic.following') : t('topic.follow')}
        </button>
        <button
          type="button"
          aria-pressed={muted}
          onClick={() => {
            updatePrefs({
              mutedTopics: muted
                ? prefs.mutedTopics.filter((id) => id !== topic.id)
                : [...prefs.mutedTopics, topic.id],
              interests: prefs.interests.filter((id) => id !== topic.id),
            });
          }}
          className={`pressable min-h-11 rounded-full px-4 text-sm font-semibold ${muted ? 'bg-danger-soft text-danger' : 'text-muted hover:text-ink'}`}
        >
          {muted ? t('topic.unmute') : t('topic.mute')}
        </button>
      </div>
      {(following || muted) && (
        <p className="mb-4 text-sm text-muted">{t('topic.appliesNextSession')}</p>
      )}

      <div className="mt-6" data-topic={topic.id}>
        <Section title={t('topic.trails')}>
          <ul className="flex flex-col gap-3">
            {clusters.map((cluster) => {
              const ids = cluster.conceptIds;
              const done = ids.filter((id) => seen.has(id)).length;
              const nextId = ids.find((id) => !completed.has(id)) ?? ids[0];
              const href = nextId ? trailHref(library, nextId, prefs.locale, here) : undefined;
              return (
                <li key={cluster.id}>
                  <Card className="p-4">
                    <h3 className="font-display text-[17px] leading-snug font-bold">
                      {cluster.title[prefs.locale]}
                    </h3>
                    <p className="mt-1.5 text-[14.5px] leading-snug text-ink-soft">
                      {cluster.hook[prefs.locale]}
                    </p>
                    <div className="mt-3 mb-3.5 flex items-center gap-1.5">
                      {ids.map((id) => (
                        <i
                          key={id}
                          aria-hidden="true"
                          className={`h-[5px] w-[26px] rounded-full ${seen.has(id) ? 'bg-tl' : 'bg-line-strong'}`}
                        />
                      ))}
                      <span className="ml-1.5 text-[12.5px] text-muted">
                        {t('topic.trailProgress', { done, total: ids.length })}
                      </span>
                    </div>
                    {href && (
                      <Link to={href} className={`${buttonPrimary} w-full`}>
                        {done === 0
                          ? t('topic.startTrail')
                          : done >= ids.length
                            ? t('topic.revisitTrail')
                            : t('topic.continueTrail')}
                        <ArrowRightIcon size={18} />
                      </Link>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title={t('topic.lessons')}>
          <div className="mb-3">
            <Segmented<Filter>
              label={t('topic.filter')}
              hideLabel
              options={[
                { value: 'suggested', label: t('topic.filterSuggested') },
                { value: 'shortest', label: t('topic.filterShortest') },
                { value: 'unseen', label: t('topic.filterUnseen') },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          {concepts.length === 0 ? (
            <EmptyState title={t('topic.allSeenTitle')} body={t('topic.allSeenBody')} />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {concepts.map((c) => (
                <li key={c.id}>
                  <LessonRow
                    concept={c}
                    tall
                    saved={saved.has(c.id)}
                    seen={seen.has(c.id)}
                    completed={completed.has(c.id)}
                    meta={library.cluster(c.clusterId)?.title[prefs.locale]}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
      {credit !== null && (
        <p className="text-[12.5px] text-muted">{t('deeper.photoCredit', { credit })}</p>
      )}
    </Page>
  );
}

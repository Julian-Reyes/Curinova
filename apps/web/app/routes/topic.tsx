import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { ArrowRightIcon, CheckIcon, TrailIcon } from '../components/icons';
import { LessonRow } from '../components/LessonRow';
import { buttonPrimary, buttonSecondary, EmptyState, Page, Section } from '../components/Page';
import { Segmented } from '../components/Segmented';
import { TopicIcon, topicTint } from '../components/TopicIcon';
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

  return (
    <Page
      back={{ to: '/app/explore', label: t('nav.explore') }}
      title={topic.name[prefs.locale]}
      subtitle={topic.description[prefs.locale]}
      actions={
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: topicTint(topic.accentColor, 0.22) }}
        >
          <TopicIcon icon={topic.icon} size={30} />
        </span>
      }
    >
      <div className="-mt-2 mb-6 flex flex-wrap gap-2">
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
          className={`pressable flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 ${following ? 'bg-accent-soft ring-primary' : 'bg-surface ring-line-strong hover:ring-primary'}`}
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
          className={`pressable min-h-11 rounded-full px-4 text-sm font-semibold ring-1 ${muted ? 'bg-danger-soft ring-danger' : 'bg-surface ring-line-strong hover:ring-danger'}`}
        >
          {muted ? t('topic.unmute') : t('topic.mute')}
        </button>
      </div>
      {(following || muted) && (
        <p className="-mt-3 mb-6 text-sm text-muted">{t('topic.appliesNextSession')}</p>
      )}

      <Section title={t('topic.trails')}>
        <ul className="flex flex-col gap-3">
          {clusters.map((cluster) => {
            const ids = cluster.conceptIds;
            const done = ids.filter((id) => seen.has(id)).length;
            const nextId = ids.find((id) => !completed.has(id)) ?? ids[0];
            const href = nextId ? trailHref(library, nextId, prefs.locale) : undefined;
            return (
              <li
                key={cluster.id}
                className="rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line"
              >
                <div className="flex items-start gap-3">
                  <TrailIcon size={22} className="mt-1 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg leading-snug font-semibold">
                      {cluster.title[prefs.locale]}
                    </h3>
                    <p className="mt-0.5 text-[15px] text-muted">{cluster.hook[prefs.locale]}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full bg-sunken ring-1 ring-line"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(done / ids.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-muted">
                    {t('topic.trailProgress', { done, total: ids.length })}
                  </span>
                </div>
                {href && (
                  <Link
                    to={href}
                    className={`${done > 0 ? buttonSecondary : buttonPrimary} mt-3 w-full`}
                  >
                    {done === 0
                      ? t('topic.startTrail')
                      : done >= ids.length
                        ? t('topic.revisitTrail')
                        : t('topic.continueTrail')}
                    <ArrowRightIcon size={18} />
                  </Link>
                )}
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
          <ul className="flex flex-col gap-2">
            {concepts.map((c) => (
              <li key={c.id}>
                <LessonRow
                  concept={c}
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
    </Page>
  );
}

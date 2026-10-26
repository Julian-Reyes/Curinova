import type { Accuracy } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ReviewIcon, SettingsIcon } from '../components/icons';
import { buttonPrimary, Card, Page, Section } from '../components/Page';
import { TopicIcon, topicTint } from '../components/TopicIcon';
import { useApp, useStats } from '../data/app-context';

export default function You() {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const stats = useStats();

  if (stats === null) {
    return (
      <Page title={t('you.title')} subtitle={t('you.subtitle')}>
        <div className="h-64" aria-busy="true" />
      </Page>
    );
  }
  const hasActivity = stats.explored > 0;

  return (
    <Page
      title={t('you.title')}
      subtitle={t('you.subtitle')}
      actions={
        <Link
          to="/app/settings"
          className="pressable flex size-12 items-center justify-center rounded-full bg-surface shadow-card ring-1 ring-line hover:bg-sunken"
          aria-label={t('settings.title')}
        >
          <SettingsIcon />
        </Link>
      }
    >
      <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('you.explored')} value={stats.explored} />
        <Stat label={t('you.completed')} value={stats.completed} />
        <Stat label={t('you.saved')} value={stats.saved} />
        <Stat label={t('you.trails')} value={stats.trailsCompleted} />
      </ul>

      <Section title={t('you.learning')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <AccuracyCard
            title={t('you.immediate')}
            hint={t('you.immediateHint')}
            accuracy={stats.immediate}
          />
          <AccuracyCard
            title={t('you.delayed')}
            hint={t('you.delayedHint')}
            accuracy={stats.delayed}
          />
        </div>
        <Card className="mt-3 flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-semibold">
              {t('you.recalled', { count: stats.recalledConcepts })}
            </p>
            <p className="text-sm text-muted">{t('you.recalledHint')}</p>
          </div>
          {stats.dueNow > 0 && (
            <Link to="/app/review" className={buttonPrimary}>
              <ReviewIcon size={20} />
              {t('you.dueCta', { count: stats.dueNow })}
            </Link>
          )}
        </Card>
      </Section>

      <Section title={t('you.thisWeek')}>
        <Card>
          <p className="font-semibold">
            {t('you.activeDays', { count: stats.activeDaysThisWeek })}
          </p>
          <p className="mt-1 text-sm text-muted">{t('you.noStreakPressure')}</p>
        </Card>
      </Section>

      <Section title={t('you.topics')}>
        {!hasActivity ? (
          <p className="text-muted">{t('you.noActivity')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.topics.map((ta) => {
              const topic = library.topic(ta.topicId);
              if (!topic) return null;
              const total = library.conceptsInTopic(topic.id).length;
              return (
                <li
                  key={ta.topicId}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: topicTint(topic.accentColor, 0.2) }}
                  >
                    <TopicIcon icon={topic.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{topic.name[prefs.locale]}</span>
                      <span className="text-[13px] text-muted">
                        {t('you.topicCounts', { explored: ta.explored, total })}
                      </span>
                    </span>
                    <span
                      className="mt-1.5 block h-2 overflow-hidden rounded-full bg-sunken"
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(ta.explored / Math.max(1, total)) * 100}%`,
                          background: topic.accentColor,
                        }}
                      />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
      <p className="text-sm text-muted">{t('you.localNote')}</p>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line">
      <span className="block font-display text-3xl font-semibold tabular-nums">{value}</span>
      <span className="mt-0.5 block text-[13px] leading-snug font-medium text-muted">{label}</span>
    </li>
  );
}

function AccuracyCard({
  title,
  hint,
  accuracy,
}: {
  title: string;
  hint: string;
  accuracy: Accuracy;
}) {
  const { t } = useTranslation();
  const pct = accuracy.total === 0 ? null : Math.round((accuracy.correct / accuracy.total) * 100);
  return (
    <Card>
      <p className="text-sm font-semibold text-muted">{title}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
        {pct === null ? '—' : t('you.percent', { value: pct })}
      </p>
      <p className="mt-1 text-[13px] text-muted">
        {accuracy.total === 0
          ? hint
          : t('you.sample', { correct: accuracy.correct, count: accuracy.total })}
      </p>
    </Card>
  );
}

import type { Accuracy } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ReviewIcon, SettingsIcon } from '../components/icons';
import { buttonPrimary, Card, Page } from '../components/Page';
import { TopicIcon } from '../components/TopicIcon';
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

  const dayLetter = new Intl.DateTimeFormat(prefs.locale, { weekday: 'narrow' });

  return (
    <Page
      title={t('you.title')}
      subtitle={t('you.subtitle')}
      actions={
        <Link
          to="/app/settings"
          className="pressable flex size-12 items-center justify-center rounded-full bg-surface ring-1 ring-line hover:bg-sunken"
          aria-label={t('settings.title')}
        >
          <SettingsIcon />
        </Link>
      }
    >
      <ul className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label={t('you.explored')} value={stats.explored} />
        <Stat label={t('you.completed')} value={stats.completed} />
        <Stat label={t('you.saved')} value={stats.saved} />
        <Stat label={t('you.mastered')} value={stats.mastered} />
      </ul>

      <Card className="mb-3">
        <h2 className="section-label mb-2">{t('you.learning')}</h2>
        <AccuracyLine
          title={t('you.delayed')}
          hint={t('you.delayedHint')}
          accuracy={stats.delayed}
          big
        />
        <AccuracyLine
          title={t('you.immediate')}
          hint={t('you.immediateHint')}
          accuracy={stats.immediate}
        />
        <p className="mt-3 border-t border-line pt-3 text-[14px]">
          <span className="font-semibold">
            {t('you.recalled', { count: stats.recalledConcepts })}
          </span>
          <span className="block text-[13px] text-muted">{t('you.recalledHint')}</span>
        </p>
        {stats.dueNow > 0 && (
          <Link to="/app/review" className={`${buttonPrimary} mt-3 w-full`}>
            <ReviewIcon size={20} />
            {t('you.dueCta', { count: stats.dueNow })}
          </Link>
        )}
      </Card>

      <Card className="mb-3">
        <h2 className="section-label mb-3">{t('you.thisWeek')}</h2>
        <ol
          className="grid grid-cols-7 gap-1"
          aria-label={t('you.activeDays', { count: stats.activeDaysThisWeek })}
        >
          {stats.week.map((d, i) => (
            <li
              key={d.date}
              className={`flex flex-col items-center gap-1.5 text-[12px] ${i === 6 ? 'font-bold text-ink' : 'font-medium text-muted'}`}
            >
              <span
                aria-hidden="true"
                className={`size-[30px] rounded-full border-[1.5px] ${d.active ? 'border-ink bg-ink' : 'border-line-strong'}`}
              />
              <span aria-hidden="true">{dayLetter.format(new Date(`${d.date}T12:00`))}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[14px] font-semibold">
          {t('you.activeDays', { count: stats.activeDaysThisWeek })}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">{t('you.noStreakPressure')}</p>
      </Card>

      <Card className="mb-6">
        <h2 className="section-label mb-2">{t('you.topics')}</h2>
        {!hasActivity ? (
          <p className="text-[14px] text-muted">{t('you.noActivity')}</p>
        ) : (
          <ul className="flex flex-col">
            {library.topics.map((topic) => {
              const total = library.conceptsInTopic(topic.id).length;
              const explored = stats.topics.find((ta) => ta.topicId === topic.id)?.explored ?? 0;
              return (
                <li
                  key={topic.id}
                  data-topic={topic.id}
                  className="grid grid-cols-[20px_minmax(0,1fr)_56px_40px] items-center gap-2.5 py-[7px] text-[14px] font-medium"
                >
                  <TopicIcon icon={topic.icon} size={18} className="text-tl" />
                  <span className="truncate">{topic.name[prefs.locale]}</span>
                  <span className="progress-bar" aria-hidden="true">
                    <i style={{ width: `${(explored / Math.max(1, total)) * 100}%` }} />
                  </span>
                  <span className="text-right text-[13px] text-muted tabular-nums">
                    {t('you.topicCounts', { explored, total })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <p className="text-sm text-muted">{t('you.localNote')}</p>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-[18px] bg-surface p-4 ring-1 ring-line">
      <span className="font-display text-[32px] leading-none font-extrabold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="text-[13px] leading-snug font-medium text-ink-soft">{label}</span>
    </li>
  );
}

function AccuracyLine({
  title,
  hint,
  accuracy,
  big = false,
}: {
  title: string;
  hint: string;
  accuracy: Accuracy;
  big?: boolean;
}) {
  const { t } = useTranslation();
  const pct = accuracy.total === 0 ? null : Math.round((accuracy.correct / accuracy.total) * 100);
  return (
    <div className={big ? 'mb-3' : ''}>
      <p className="flex flex-wrap items-baseline gap-x-2.5">
        <span className={big ? 'font-display text-[22px] font-bold' : 'text-[15px] font-semibold'}>
          {pct === null ? '—' : t('you.percent', { value: pct })}
        </span>
        <span className="text-[13.5px] text-ink-soft">{title}</span>
      </p>
      <p className="text-[13px] text-muted">
        {accuracy.total === 0
          ? hint
          : t('you.sample', { correct: accuracy.correct, count: accuracy.total })}
      </p>
      {big && pct !== null && (
        <span className="progress-bar mt-2 h-2" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
      )}
    </div>
  );
}

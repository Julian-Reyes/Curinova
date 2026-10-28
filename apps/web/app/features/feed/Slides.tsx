import type { Cluster } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRightIcon, CheckIcon, ReviewIcon, SparkIcon } from '../../components/icons';
import { TopicIcon, topicTint } from '../../components/TopicIcon';
import { useApp } from '../../data/app-context';

/** Full-bleed dark slide for the feed's non-lesson moments (Concept E's end card). */
function SlideShell({
  children,
  tone = 'glow',
}: {
  children: React.ReactNode;
  tone?: 'glow' | 'plain';
}) {
  return (
    <div
      className={`feed-end fade-up flex h-full flex-col items-center justify-center gap-4 overflow-y-auto px-7 py-8 text-center text-ink ${
        tone === 'glow' ? 'is-glow' : ''
      }`}
    >
      {children}
    </div>
  );
}

const primaryBtn =
  'pressable flex min-h-[50px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-on-primary';
const secondaryBtn =
  'pressable flex min-h-[50px] w-full max-w-xs items-center justify-center gap-2 rounded-full px-5 font-semibold text-ink ring-1 ring-white/25 hover:bg-white/10';
const linkBtn = 'pressable min-h-11 px-4 font-semibold text-ink/80 hover:text-ink';

/** Soft stop after the session goal (§3.8). Not a quota: "Keep exploring" is always there. */
export function EndOfSessionSlide({
  explored,
  quizzes,
  onKeepExploring,
  onDone,
}: {
  explored: number;
  quizzes: number;
  onKeepExploring: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SlideShell>
      <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-ink">
        <SparkIcon size={34} />
      </div>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
        {t('session.title')}
      </h2>
      <p className="max-w-xs text-lg text-ink/75">
        {t('session.summary', { count: explored })}
        {quizzes > 0 && ` ${t('session.quizzes', { count: quizzes })}`}
      </p>
      <p className="max-w-xs text-ink">{t('session.question')}</p>
      <div className="mt-2 flex w-full flex-col items-center gap-2.5">
        <Link to="/app/review" className={primaryBtn}>
          <ReviewIcon size={20} />
          {t('session.review')}
        </Link>
        <button type="button" onClick={onKeepExploring} className={secondaryBtn}>
          {t('session.keepExploring')}
        </button>
        <div className="flex flex-wrap justify-center gap-1">
          <Link to="/app/settings#session" className={linkBtn}>
            {t('session.changeGoal')}
          </Link>
          <button type="button" onClick={onDone} className={linkBtn}>
            {t('session.done')}
          </button>
        </div>
      </div>
    </SlideShell>
  );
}

export function FinishedSlide({ onNewSession }: { onNewSession: () => void }) {
  const { t } = useTranslation();
  return (
    <SlideShell tone="plain">
      <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-ink">
        <CheckIcon size={32} />
      </div>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight">
        {t('session.finishedTitle')}
      </h2>
      <p className="max-w-xs text-ink/75">{t('session.finishedBody')}</p>
      <button type="button" onClick={onNewSession} className={`${secondaryBtn} mt-2`}>
        {t('session.newSession')}
      </button>
    </SlideShell>
  );
}

/** Catalog exhaustion, said honestly instead of silently recycling (§6). */
export function ExhaustedSlide({ onRecycle }: { onRecycle: () => void }) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  const suggestions = library.topics
    .filter((tp) => !prefs.interests.includes(tp.id) && !prefs.mutedTopics.includes(tp.id))
    .slice(0, 3);
  return (
    <SlideShell>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
        {t('exhausted.title')}
      </h2>
      <p className="max-w-xs text-ink/75">{t('exhausted.body')}</p>
      {suggestions.length > 0 && (
        <div className="flex w-full max-w-xs flex-col gap-2">
          <p className="text-sm font-semibold text-muted">{t('exhausted.try')}</p>
          {suggestions.map((tp) => (
            <Link
              key={tp.id}
              to={`/app/topic/${tp.slug[prefs.locale]}`}
              className="pressable flex min-h-12 items-center gap-3 rounded-2xl bg-white/8 px-3 text-left font-semibold ring-1 ring-white/15 hover:bg-white/12"
            >
              <span
                className="flex size-8 items-center justify-center rounded-xl"
                style={{ background: topicTint(tp.accentColor, 0.2) }}
              >
                <TopicIcon icon={tp.icon} size={18} />
              </span>
              <span className="flex-1">{tp.name[prefs.locale]}</span>
              <ArrowRightIcon size={18} className="text-muted" />
            </Link>
          ))}
        </div>
      )}
      <button type="button" onClick={onRecycle} className={linkBtn}>
        {t('exhausted.recycle')}
      </button>
    </SlideShell>
  );
}

export function AllMutedSlide() {
  const { t } = useTranslation();
  return (
    <SlideShell tone="plain">
      <h2 className="font-display text-2xl font-bold tracking-tight">{t('feed.allMutedTitle')}</h2>
      <p className="max-w-xs text-ink/75">{t('feed.allMutedBody')}</p>
      <Link to="/app/settings#topics" className={primaryBtn}>
        {t('feed.openSettings')}
      </Link>
    </SlideShell>
  );
}

export function TrailEndSlide({ cluster }: { cluster: Cluster }) {
  const { t } = useTranslation();
  const { library, prefs } = useApp();
  return (
    <SlideShell>
      <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-ink">
        <CheckIcon size={32} />
      </div>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
        {t('trail.endTitle')}
      </h2>
      <p className="max-w-xs text-ink/75">
        {t('trail.endBody', {
          count: cluster.conceptIds.length,
          trail: cluster.title[prefs.locale],
        })}
      </p>
      {cluster.links.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <p className="text-sm font-semibold text-muted">{t('trail.nextTrails')}</p>
          {cluster.links.map((link) => {
            const target = library.cluster(link.clusterId);
            if (!target) return null;
            return (
              <Link
                key={link.clusterId}
                to={`/app/trail/${target.slug[prefs.locale]}`}
                className="pressable rounded-2xl bg-white/8 p-3 text-left ring-1 ring-white/15 hover:bg-white/12"
              >
                <span className="block font-semibold">{target.title[prefs.locale]}</span>
                <span className="mt-0.5 block text-sm text-muted">{link.reason[prefs.locale]}</span>
              </Link>
            );
          })}
        </div>
      )}
      <Link to="/app/discover" className={secondaryBtn}>
        {t('trail.backToFeed')}
      </Link>
    </SlideShell>
  );
}

/**
 * "Remember more" mode (P7): an explicit, skippable review invitation in the feed.
 * Due reviews are never disguised as new lessons (§6).
 */
export function ReviewPromptSlide({ due, onSkip }: { due: number; onSkip: () => void }) {
  const { t } = useTranslation();
  return (
    <SlideShell>
      <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-ink">
        <ReviewIcon size={32} />
      </div>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
        {t('reviewPrompt.title')}
      </h2>
      <p className="max-w-xs text-ink/75">{t('reviewPrompt.body', { count: due })}</p>
      <div className="mt-2 flex w-full flex-col items-center gap-2.5">
        <Link to="/app/review" className={primaryBtn}>
          <ReviewIcon size={20} />
          {t('reviewPrompt.start')}
        </Link>
        <button type="button" onClick={onSkip} className={linkBtn}>
          {t('reviewPrompt.later')}
        </button>
      </div>
    </SlideShell>
  );
}

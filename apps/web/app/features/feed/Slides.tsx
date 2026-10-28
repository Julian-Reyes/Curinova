import type { Cluster } from '@lumen/domain';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { CheckIcon, ReviewIcon, SparkIcon } from '../../components/icons';
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

/**
 * Shown once when every lesson has been seen (§6, honestly, D17); the feed then carries
 * on with the lessons seen longest ago.
 */
export function SeenItAllSlide() {
  const { t } = useTranslation();
  return (
    <SlideShell>
      <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-ink">
        <SparkIcon size={32} />
      </div>
      <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
        {t('feed.seenAllTitle')}
      </h2>
      <p className="max-w-xs text-ink/75">{t('feed.seenAllBody')}</p>
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

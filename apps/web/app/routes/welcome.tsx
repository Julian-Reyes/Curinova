import {
  LOCALES,
  type Locale,
  type Purpose,
  type SessionGoal,
  type Theme,
  type UserPreferences,
} from '@lumen/domain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  GlobeIcon,
  MoonIcon,
  SunIcon,
  SystemIcon,
} from '../components/icons';
import { Illustration } from '../components/Illustration';
import { Segmented } from '../components/Segmented';
import { TopicChip } from '../components/TopicChip';
import { TopicIcon, topicTint } from '../components/TopicIcon';
import { useApp } from '../data/app-context';
import { progress } from '../data/progress';

const STEPS = ['welcome', 'interests', 'goal', 'theme'] as const;
const PURPOSES: readonly Purpose[] = ['explore', 'deep', 'remember'];
const GOALS: readonly SessionGoal[] = [3, 5, 10, 'unlimited'];

/**
 * First-run onboarding (§3.1): skippable, under 30 seconds, no registration and no
 * permission prompts. Every choice is stored locally right away.
 */
export default function Welcome() {
  const { t } = useTranslation();
  const { library, prefs, updatePrefs, reportStorageError } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = STEPS[step] ?? 'welcome';

  useEffect(() => {
    document.title = t('app.name');
  }, [t]);

  const finish = async (patch: Partial<UserPreferences> = {}) => {
    const next = { ...prefs, ...patch, onboardedAt: new Date().toISOString() };
    updatePrefs(next);
    try {
      await progress.savePreferences(next);
    } catch {
      reportStorageError();
    }
    void navigate('/app/discover', { replace: true });
  };

  // Preview a real card: the first lesson of the first trail.
  const previewConcept = library.concepts[0];
  const preview = previewConcept ? library.variant(previewConcept.id, prefs.locale) : undefined;
  const previewTopic = previewConcept ? library.topic(previewConcept.topicId) : undefined;

  return (
    <div className="glow-bg flex min-h-dvh flex-col pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-4">
        <div className="flex min-h-12 items-center gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setStep((s) => s - 1);
              }}
              className="pressable -ml-2 flex size-11 items-center justify-center rounded-full hover:bg-surface"
              aria-label={t('common.back')}
            >
              <ChevronLeftIcon />
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" width={28} height={28} className="rounded-lg" />
              <span className="font-display text-lg font-semibold">{t('app.name')}</span>
            </span>
          )}
          <div
            className="mx-auto flex gap-1.5"
            aria-label={t('onboarding.step', { current: step + 1, total: STEPS.length })}
            role="img"
          >
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-[var(--dur)] ${i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary' : 'w-1.5 bg-line-strong'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => void finish()}
            className="pressable min-h-11 rounded-full px-3 text-sm font-semibold text-muted hover:text-ink"
          >
            {t('onboarding.skip')}
          </button>
        </div>

        <div key={current} className="page-in flex flex-1 flex-col">
          {current === 'welcome' && (
            <>
              <div className="mt-6">
                <Segmented<Locale>
                  label={t('settings.language')}
                  hideLabel
                  options={LOCALES.map((l) => ({
                    value: l,
                    label: t(`language.${l}`),
                    icon: <GlobeIcon size={18} />,
                  }))}
                  value={prefs.locale}
                  onChange={(locale) => {
                    updatePrefs({ locale });
                  }}
                />
              </div>
              <h1 className="mt-8 font-display text-[34px] leading-[1.1] font-semibold text-balance">
                {t('onboarding.welcomeTitle')}
              </h1>
              <p className="mt-3 text-lg text-muted">{t('onboarding.welcomeBody')}</p>
              {preview && previewTopic && (
                <div
                  className="welcome-preview mt-7 overflow-hidden rounded-[22px] bg-surface shadow-card ring-1 ring-line"
                  aria-hidden="true"
                >
                  <div
                    style={{ background: `linear-gradient(160deg, var(--glow-1), var(--glow-2))` }}
                  >
                    <div className="flex items-center gap-1.5 px-4 pt-3 text-[11px] font-semibold tracking-wide uppercase">
                      <span
                        className="flex size-5 items-center justify-center rounded-full"
                        style={{ background: topicTint(previewTopic.accentColor, 0.25) }}
                      >
                        <TopicIcon icon={previewTopic.icon} size={13} />
                      </span>
                      {previewTopic.name[prefs.locale]}
                    </div>
                    <Illustration
                      id={
                        preview.heroMedia.type === 'illustration'
                          ? preview.heroMedia.illustrationId
                          : 'fixture'
                      }
                      accent={previewTopic.accentColor}
                      className="welcome-preview-art mx-auto block h-24 w-full"
                    />
                  </div>
                  <div className="px-4 pt-2 pb-4">
                    <p className="font-display text-lg leading-snug font-semibold">
                      {preview.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">{preview.hook}</p>
                  </div>
                </div>
              )}
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                  }}
                  className="pressable flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-on-primary hover:bg-primary-strong"
                >
                  {t('onboarding.start')}
                  <ArrowRightIcon size={20} />
                </button>
                <p className="mt-3 text-center text-sm text-muted">{t('onboarding.noAccount')}</p>
              </div>
            </>
          )}

          {current === 'interests' && (
            <>
              <h1 className="mt-6 font-display text-[30px] leading-tight font-semibold">
                {t('onboarding.interestsTitle')}
              </h1>
              <p className="mt-2 text-muted">{t('onboarding.interestsBody')}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {library.topics.map((topic) => {
                  const selected = prefs.interests.includes(topic.id);
                  return (
                    <TopicChip
                      key={topic.id}
                      topic={topic}
                      selected={selected}
                      onToggle={() => {
                        updatePrefs({
                          interests: selected
                            ? prefs.interests.filter((id) => id !== topic.id)
                            : [...prefs.interests, topic.id],
                        });
                      }}
                    />
                  );
                })}
              </div>
              <NextButton
                label={
                  prefs.interests.length === 0 ? t('onboarding.surpriseMe') : t('onboarding.next')
                }
                onClick={() => {
                  setStep(2);
                }}
              />
            </>
          )}

          {current === 'goal' && (
            <>
              <h1 className="mt-6 font-display text-[30px] leading-tight font-semibold">
                {t('onboarding.goalTitle')}
              </h1>
              <fieldset className="mt-6">
                <legend className="mb-2 text-sm font-semibold">
                  {t('onboarding.purposeLabel')}
                </legend>
                <div className="flex flex-col gap-2">
                  {PURPOSES.map((p) => {
                    const checked = prefs.purpose === p;
                    return (
                      <label
                        key={p}
                        className={`pressable flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-1 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary ${
                          checked ? 'bg-accent-soft ring-primary' : 'bg-surface ring-line-strong'
                        }`}
                      >
                        <input
                          type="radio"
                          name="purpose"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            updatePrefs({ purpose: p });
                          }}
                        />
                        <span className="flex-1">
                          <span className="block font-semibold">{t(`purpose.${p}`)}</span>
                          <span className="block text-sm text-muted">{t(`purpose.${p}Hint`)}</span>
                        </span>
                        <span
                          className={`size-5 shrink-0 rounded-full ring-2 ${checked ? 'bg-primary ring-primary' : 'ring-line-strong'}`}
                          aria-hidden="true"
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-6">
                <Segmented<SessionGoal>
                  label={t('settings.sessionSize')}
                  options={GOALS.map((g) => ({
                    value: g,
                    label: g === 'unlimited' ? t('settings.unlimited') : String(g),
                  }))}
                  value={prefs.sessionGoal}
                  onChange={(sessionGoal) => {
                    updatePrefs({ sessionGoal });
                  }}
                />
                <p className="mt-2 text-sm text-muted">{t('settings.sessionSizeHint')}</p>
              </div>
              <NextButton
                label={t('onboarding.next')}
                onClick={() => {
                  setStep(3);
                }}
              />
            </>
          )}

          {current === 'theme' && (
            <>
              <h1 className="mt-6 font-display text-[30px] leading-tight font-semibold">
                {t('onboarding.themeTitle')}
              </h1>
              <div className="mt-6">
                <Segmented<Theme>
                  label={t('settings.theme')}
                  hideLabel
                  options={[
                    { value: 'system', label: t('theme.system'), icon: <SystemIcon size={18} /> },
                    { value: 'light', label: t('theme.light'), icon: <SunIcon size={18} /> },
                    { value: 'dark', label: t('theme.dark'), icon: <MoonIcon size={18} /> },
                  ]}
                  value={prefs.theme}
                  onChange={(theme) => {
                    updatePrefs({ theme });
                  }}
                />
              </div>
              <p className="mt-4 text-muted">{t('onboarding.themeBody')}</p>
              <NextButton label={t('onboarding.finish')} onClick={() => void finish()} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mt-auto pt-8">
      <button
        type="button"
        onClick={onClick}
        className="pressable flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-on-primary hover:bg-primary-strong"
      >
        {label}
        <ArrowRightIcon size={20} />
      </button>
    </div>
  );
}

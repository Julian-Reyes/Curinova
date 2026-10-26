import { AUDIO_SPEEDS, LOCALES, type Locale, type SessionGoal, type Theme } from '@lumen/domain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { GlobeIcon, MoonIcon, SunIcon, SystemIcon, TrashIcon } from '../components/icons';
import { buttonPrimary, buttonSecondary, Card, Page, Section } from '../components/Page';
import { Segmented } from '../components/Segmented';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Toggle } from '../components/Toggle';
import { TopicChip } from '../components/TopicChip';
import { useApp } from '../data/app-context';
import { defaultPreferences, progress } from '../data/progress';
import { useSpeech } from '../hooks/useSpeech';

const GOALS: readonly SessionGoal[] = [3, 5, 10, 'unlimited'];

export default function Settings() {
  const { t } = useTranslation();
  const { library, prefs, updatePrefs, reportStorageError } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ptVoice = useSpeech('pt-BR', prefs.audioSpeed, 'settings-pt');
  const enVoice = useSpeech('en', prefs.audioSpeed, 'settings-en');

  // Support deep links such as /app/settings#session from the soft stop.
  useEffect(() => {
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  const toggleIn = (list: readonly string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const deleteAll = async () => {
    try {
      await progress.clearAll();
      updatePrefs({ ...defaultPreferences(prefs.locale), theme: prefs.theme });
      setConfirmDelete(false);
      toast(t('settings.deleted'));
      void navigate('/app/welcome', { replace: true });
    } catch {
      reportStorageError();
    }
  };

  const voiceStatus = (
    availability: ReturnType<typeof useSpeech>['availability'],
    name: string | undefined,
  ) =>
    availability === 'ready'
      ? t('settings.voiceReady', { name })
      : availability === 'no-voice'
        ? t('settings.voiceMissing')
        : t('settings.voiceUnsupported');

  return (
    <Page title={t('settings.title')} back={{ to: '/app/you', label: t('nav.you') }}>
      <Section title={t('settings.language')}>
        <Card>
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
          <p className="mt-3 text-sm text-muted">{t('settings.languageHint')}</p>
        </Card>
      </Section>

      <Section title={t('settings.appearance')}>
        <Card className="flex flex-col gap-4">
          <Segmented<Theme>
            label={t('settings.theme')}
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
          <Toggle
            label={t('settings.reduceMotion')}
            description={t('settings.reduceMotionHint')}
            checked={prefs.reducedMotion === 'reduce'}
            onChange={(on) => {
              updatePrefs({ reducedMotion: on ? 'reduce' : 'system' });
            }}
          />
        </Card>
      </Section>

      <Section title={t('settings.session')} id="session">
        <Card>
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
          <p className="mt-3 text-sm text-muted">{t('settings.sessionSizeHint')}</p>
        </Card>
      </Section>

      <Section title={t('settings.topics')} id="topics">
        <Card className="flex flex-col gap-5">
          <div>
            <p className="mb-1 font-medium">{t('settings.interests')}</p>
            <p className="mb-3 text-sm text-muted">{t('settings.interestsHint')}</p>
            <div className="flex flex-wrap gap-2">
              {library.topics.map((topic) => (
                <TopicChip
                  key={topic.id}
                  topic={topic}
                  selected={prefs.interests.includes(topic.id)}
                  onToggle={() => {
                    updatePrefs({
                      interests: toggleIn(prefs.interests, topic.id),
                      mutedTopics: prefs.mutedTopics.filter((id) => id !== topic.id),
                    });
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 font-medium">{t('settings.muted')}</p>
            <p className="mb-3 text-sm text-muted">{t('settings.mutedHint')}</p>
            <div className="flex flex-wrap gap-2">
              {library.topics.map((topic) => (
                <TopicChip
                  key={topic.id}
                  tone="mute"
                  topic={topic}
                  selected={prefs.mutedTopics.includes(topic.id)}
                  onToggle={() => {
                    updatePrefs({
                      mutedTopics: toggleIn(prefs.mutedTopics, topic.id),
                      interests: prefs.interests.filter((id) => id !== topic.id),
                    });
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted">{t('topic.appliesNextSession')}</p>
        </Card>
      </Section>

      <Section title={t('settings.audio')}>
        <Card className="flex flex-col gap-3">
          <Segmented<number>
            label={t('settings.audioSpeed')}
            options={AUDIO_SPEEDS.map((s) => ({
              value: s,
              label: t('audio.speedValue', { speed: s }),
            }))}
            value={prefs.audioSpeed}
            onChange={(speed) => {
              const audioSpeed = AUDIO_SPEEDS.find((s) => s === speed);
              if (audioSpeed !== undefined) updatePrefs({ audioSpeed });
            }}
          />
          <dl className="text-sm">
            <div className="flex gap-2">
              <dt className="font-medium">{t('language.pt-BR')}:</dt>
              <dd className="text-muted">{voiceStatus(ptVoice.availability, ptVoice.voiceName)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">{t('language.en')}:</dt>
              <dd className="text-muted">{voiceStatus(enVoice.availability, enVoice.voiceName)}</dd>
            </div>
          </dl>
        </Card>
      </Section>

      <Section title={t('settings.review')}>
        <Card>
          <Toggle
            label={t('settings.reviewOptIn')}
            description={t('settings.reviewOptInHint')}
            checked={prefs.reviewOptIn}
            onChange={(reviewOptIn) => {
              updatePrefs({ reviewOptIn });
            }}
          />
        </Card>
      </Section>

      <Section title={t('settings.privacy')}>
        <Card className="flex flex-col gap-3">
          <p className="text-[15px]">{t('settings.privacyBody')}</p>
          <p className="text-sm text-muted">{t('settings.exportSoon')}</p>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(true);
            }}
            className="pressable inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl px-4 font-semibold text-danger ring-1 ring-danger hover:bg-danger-soft"
          >
            <TrashIcon size={20} />
            {t('settings.delete')}
          </button>
        </Card>
      </Section>

      <Section title={t('settings.about')}>
        <Card className="flex flex-col gap-3">
          <p className="text-[15px]">
            {library.channel === 'production'
              ? t('settings.contentReviewed')
              : t('settings.contentPreview')}
          </p>
          <button
            type="button"
            onClick={() => {
              updatePrefs({ onboardedAt: null });
              void progress
                .savePreferences({ ...prefs, onboardedAt: null })
                .catch(reportStorageError)
                .finally(() => {
                  void navigate('/app/welcome');
                });
            }}
            className={`${buttonSecondary} self-start`}
          >
            {t('settings.replayIntro')}
          </button>
        </Card>
      </Section>

      <Sheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('settings.deleteConfirmTitle')}
        description={t('settings.deleteConfirmBody')}
      >
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => void deleteAll()}
            className={`${buttonPrimary} !bg-danger !text-bg`}
          >
            {t('settings.deleteConfirm')}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false);
            }}
            className={buttonSecondary}
          >
            {t('common.cancel')}
          </button>
        </div>
      </Sheet>
    </Page>
  );
}

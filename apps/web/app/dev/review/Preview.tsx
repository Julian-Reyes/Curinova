import type { ContentLibrary, Locale } from '@lumen/domain';
import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ToastProvider } from '../../components/Toast';
import {
  ProgressWriterProvider,
  StaticAppProvider,
  type ProgressWriter,
} from '../../data/app-context';
import { buildLibrary } from '../../data/library';
import { defaultPreferences } from '../../data/progress';
import { SessionProvider } from '../../features/feed/session';
import { createI18n } from '../../i18n';
import type { LessonView } from './api';

/** Answers, saves and lesson events in the preview never touch the guest's progress. */
const noProgress: ProgressWriter = {
  record: () => Promise.resolve(),
  setBookmark: () => Promise.resolve(),
  answer: () => Promise.resolve(),
};

/**
 * Renders the app's own lesson components for one locale of a lesson under review: the UI
 * in that locale, a library holding just this lesson, and progress writes switched off.
 */
export function LessonPreview({
  lesson,
  locale,
  children,
}: {
  lesson: LessonView;
  locale: Locale;
  children: React.ReactNode;
}) {
  const i18n = useMemo(() => createI18n(locale), [locale]);
  const library = useMemo(() => {
    const raw: ContentLibrary = {
      topics: lesson.topic ? [lesson.topic] : [],
      clusters: lesson.cluster ? [lesson.cluster] : [],
      concepts: [lesson.concept, ...lesson.neighbors.concepts],
      // The app hides rejected variants; the preview still shows them.
      variants: [
        ...Object.values(lesson.locales).map((l) => l.variant),
        ...lesson.neighbors.variants,
      ].map((v) => ({
        ...v,
        reviewStatus: v.reviewStatus === 'rejected' ? 'draft' : v.reviewStatus,
      })),
      questions: Object.values(lesson.locales).flatMap((l) => l.questions),
      sources: lesson.sources,
    };
    return buildLibrary(raw, 'preview', locale);
  }, [lesson, locale]);
  const prefs = useMemo(() => defaultPreferences(locale), [locale]);
  return (
    <I18nextProvider i18n={i18n}>
      <StaticAppProvider library={library} prefs={prefs}>
        <ProgressWriterProvider writer={noProgress}>
          <SessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
        </ProgressWriterProvider>
      </StaticAppProvider>
    </I18nextProvider>
  );
}

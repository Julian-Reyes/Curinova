import type { ProgressEvent, UserPreferences } from '@lumen/domain';

/*
 * Aggregate, cookieless analytics (§9.2, §13, D26) behind one adapter. Only allowlisted
 * events leave the device, each with allowlisted properties: what happened and to which
 * lesson, never who did it (no event or device IDs, no times, no free text). Nothing is
 * sent unless a provider is connected, the learner hasn't opted out, and the browser
 * doesn't ask not to be tracked (Do Not Track or Global Privacy Control).
 */

export const ANALYTICS_EVENTS = [
  'lesson_opened',
  'lesson_completed',
  'quiz_answered',
  'review_answered',
  'trail_started',
  'trail_step',
  'deep_dive_opened',
  'share_clicked',
  'language_switched',
  'session_finished',
] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  props: {
    lesson: string;
    topic: string;
    locale: string;
    /** Quiz and review answers only, for per-question accuracy (§13). */
    question?: string;
    correct?: boolean;
  };
}

/** Where events go: a provider's adapter (Umami, GoatCounter…), once one is chosen. */
export interface AnalyticsSink {
  send(event: AnalyticsEvent): void;
}

/**
 * No provider is connected yet (D26): the founder picks one after the LGPD question (P3)
 * is answered. Until then this is null and nothing is ever sent.
 */
export const analyticsSink: AnalyticsSink | null = null;

const ALLOWED = new Set<string>(ANALYTICS_EVENTS);

/** The allowlisted analytics event for a progress event, or null if it isn't one. */
export function toAnalyticsEvent(
  event: ProgressEvent,
  topicOf: (conceptId: string) => string | undefined,
): AnalyticsEvent | null {
  if (!ALLOWED.has(event.type)) return null;
  const props: AnalyticsEvent['props'] = {
    lesson: event.conceptId,
    topic: topicOf(event.conceptId) ?? 'unknown',
    locale: event.locale,
  };
  if (event.questionGroupId !== undefined) props.question = event.questionGroupId;
  if (event.response !== undefined) props.correct = event.response.correct;
  return { name: event.type as AnalyticsEventName, props };
}

/** Whether this learner may be counted: not opted out, and no Do Not Track / GPC signal. */
export function analyticsAllowed(
  prefs: Pick<UserPreferences, 'analyticsOptOut'>,
  browser: { doNotTrack?: string | null; globalPrivacyControl?: boolean } = navigator,
): boolean {
  if (prefs.analyticsOptOut) return false;
  if (browser.globalPrivacyControl === true) return false;
  return browser.doNotTrack !== '1' && browser.doNotTrack !== 'yes';
}

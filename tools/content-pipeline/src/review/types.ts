import type {
  Claim,
  Cluster,
  Concept,
  LessonVariant,
  Locale,
  QuizQuestion,
  Source,
  Topic,
} from '@lumen/domain';
import type { Issue } from '../validate/validate';

/*
 * Shapes exchanged between the review operations and the /_review screen (D20).
 * Types only, so the web app can import them without pulling in Node code.
 */

export type LocaleState = 'waiting' | 'approved' | 'rejected' | 'missing';

export interface QueueLesson {
  /** Folder name under content/drafts/lessons/ (and content/lessons/). */
  key: string;
  conceptId: string;
  clusterOrder: number;
  titles: Partial<Record<Locale, string>>;
  locales: Partial<
    Record<
      Locale,
      {
        state: LocaleState;
        verdicts: Record<Claim['autoVerdict'], number>;
        claims: number;
        approvedClaims: number;
      }
    >
  >;
  /** check-drafts errors in this lesson's draft files. */
  errors: Issue[];
  /** Empty when the lesson can be opened; otherwise why not. */
  blockers: string[];
  /**
   * Approved lessons stay in drafts until the lessons they link to (`related`) are in the
   * library too; these are the missing ones.
   */
  waitingFor: string[];
}

export interface QueueTrail {
  clusterId: string;
  title: Partial<Record<Locale, string>>;
  /** True when content/drafts/clusters/<id>.json exists. */
  hasDraft: boolean;
  lessons: QueueLesson[];
}

export interface ReadyLesson {
  key: string;
  conceptId: string;
  titles: Partial<Record<Locale, string>>;
  /** Empty when both locales can be published together. */
  blockers: string[];
}

export interface Queue {
  trails: QueueTrail[];
  /** Approved (reviewed) lessons in the library that are not published yet. */
  ready: ReadyLesson[];
  /** Median minutes on the lesson screen per reviewed or rejected variant; null with no data. */
  medianMinutes: number | null;
  reviewedVariants: number;
  targetMinutes: number;
}

/** Where a claim sits in the lesson text (best-matching sentence), for highlighting. */
export interface ClaimLocation {
  claimId: string;
  /** Field path, e.g. "cardBlocks[1].text", "deepDiveBlocks[0].text", "title". */
  field: string;
  start: number;
  end: number;
}

export interface SupportView {
  sourceId: string;
  excerpt: string;
  locator?: string | undefined;
  source: Pick<Source, 'title' | 'publisher' | 'url'> | null;
  /** Snapshot text around the excerpt, or why there is none. */
  context:
    | { kind: 'found'; before: string; match: string; after: string }
    | { kind: 'not-found' }
    | { kind: 'missing' };
}

export interface LessonLocaleView {
  variant: LessonVariant;
  questions: QuizQuestion[];
  state: LocaleState;
  locations: ClaimLocation[];
  support: Record<string, SupportView[]>;
}

export interface LessonView {
  key: string;
  concept: Concept;
  topic: Topic | null;
  cluster: Cluster | null;
  locales: Partial<Record<Locale, LessonLocaleView>>;
  /** Sources cited by any locale, for the app's Sources sheet. */
  sources: Source[];
  reports: { name: string; text: string }[];
  /** Notes from the review log for this lesson, oldest first. */
  notes: ReviewLogLine[];
  errors: Issue[];
  blockers: string[];
}

/** Text fields a reviewer may edit. IDs, excerpts and sources are never editable. */
export interface LessonEdit {
  title?: string;
  hook?: string;
  summary?: string;
  cardText?: string;
  /** Text by block index. */
  cardBlocks?: Record<number, string>;
  deepDiveBlocks?: Record<number, string>;
  /** Claim wording by claim ID. */
  claims?: Record<string, string>;
  questions?: Record<
    string,
    {
      prompt?: string;
      options?: Record<string, string>;
      explanation?: string;
      misconception?: string;
    }
  >;
}

export type ReviewAction =
  | { type: 'approve-claim'; key: string; locale: Locale; claimId: string; ms: number }
  | { type: 'approve-locale'; key: string; locale: Locale; ms: number }
  | { type: 'edit'; key: string; locale: Locale; edit: LessonEdit; ms: number }
  | {
      type: 'reject';
      key: string;
      locale: Locale;
      claimId: string | null;
      note: string;
      ms: number;
    }
  | {
      type: 'note';
      key: string;
      locale: Locale | null;
      claimId: string | null;
      note: string;
      ms: number;
    }
  | { type: 'publish'; key: string; ms: number };

export type ActionResult =
  { ok: true; message: string } | { ok: false; message: string; issues: Issue[] };

export interface ReviewLogLine {
  at: string;
  reviewer: string;
  conceptId: string;
  locale: Locale | null;
  action: ReviewAction['type'];
  claimId: string | null;
  note: string | null;
  ms: number;
}

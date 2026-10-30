import type {
  ActionResult,
  LessonView,
  Queue,
  ReviewAction,
} from '../../../../../tools/content-pipeline/src/review/types';

export type {
  ActionResult,
  ClaimLocation,
  LessonEdit,
  LessonLocaleView,
  LessonView,
  Queue,
  QueueLesson,
  ReviewAction,
  ReviewActionInput,
  SupportView,
} from '../../../../../tools/content-pipeline/src/review/types';

/** Served by the dev-only Vite plugin in apps/web/review-plugin.ts. */
const API = '/__review/api';

async function json<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;
  if (!response.ok && response.status !== 422) {
    const message =
      (body as { message?: string } | null)?.message ?? `HTTP ${String(response.status)}`;
    throw new Error(message);
  }
  return body as T;
}

export async function fetchQueue(): Promise<Queue> {
  return json<Queue>(await fetch(`${API}/queue`, { cache: 'no-store' }));
}

export async function fetchLesson(key: string): Promise<LessonView> {
  return json<LessonView>(
    await fetch(`${API}/lesson?key=${encodeURIComponent(key)}`, { cache: 'no-store' }),
  );
}

export async function postAction(action: ReviewAction): Promise<ActionResult> {
  return json<ActionResult>(
    await fetch(`${API}/action`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(action),
    }),
  );
}

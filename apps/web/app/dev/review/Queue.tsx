import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchQueue, postAction, type Queue, type QueueLesson } from './api';
import { LOCALE_LABEL, StateBadge, Verdicts } from './ui';

/** Every drafted trail and lesson, what blocks each one, and approved lessons to publish. */
export function QueueScreen() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const reload = useCallback(() => {
    fetchQueue()
      .then((q) => {
        setQueue(q);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      });
  }, []);
  useEffect(reload, [reload]);

  const publish = async (key: string) => {
    const r = await postAction({ type: 'publish', key, ms: 0 });
    setMessage({
      ok: r.ok,
      text: r.ok ? `${key}: ${r.message}` : `${key}: ${r.message} ${issueText(r.issues)}`,
    });
    reload();
  };

  if (error) return <Failure text={error} onRetry={reload} />;
  if (!queue) return <p className="p-8 text-muted">Loading the review queue…</p>;
  const lessons = queue.trails.flatMap((t) => t.lessons);
  const openable = lessons.filter((l) => l.blockers.length === 0).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Dev only · not in production builds
          </p>
          <h1 className="font-display text-3xl font-semibold">Content review</h1>
          <p className="mt-1 text-muted">
            {lessons.length} lesson(s) in drafts across {queue.trails.length} trail(s); {openable}{' '}
            ready to review.
          </p>
        </div>
        <div
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm"
          data-testid="median"
        >
          <p className="text-muted">Median time per variant</p>
          <p className="text-lg font-semibold">
            {queue.medianMinutes === null ? '—' : `${String(queue.medianMinutes)} min`}{' '}
            <span className="text-sm font-normal text-muted">
              target ≤ {queue.targetMinutes} min · {queue.reviewedVariants} decided
            </span>
          </p>
        </div>
      </header>

      {message && (
        <p
          role="status"
          className={`mb-4 rounded-xl px-4 py-2 text-sm ${message.ok ? 'bg-success-soft' : 'bg-danger-soft'}`}
        >
          {message.text}
        </p>
      )}

      {queue.trails.length === 0 && (
        <p className="rounded-2xl border border-line bg-surface p-6 text-muted">
          Nothing in content/drafts/ to review.
        </p>
      )}

      {queue.trails.map((trail) => (
        <section key={trail.clusterId} className="mb-8">
          <h2 className="mb-1 text-xl font-semibold">
            {trail.title['pt-BR'] ?? trail.clusterId}
            {trail.title.en && <span className="font-normal text-muted"> · {trail.title.en}</span>}
          </h2>
          <p className="mb-3 text-xs text-muted">
            {trail.clusterId}
            {trail.hasDraft ? ' · draft trail file' : ' · trail already in the library'}
          </p>
          {trail.lessons.length === 0 ? (
            <p className="text-sm text-muted">No lessons left in drafts.</p>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
              {trail.lessons.map((l) => (
                <LessonRow key={l.key} lesson={l} />
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mb-8">
        <h2 className="mb-1 text-xl font-semibold">Approved, not published</h2>
        <p className="mb-3 text-sm text-muted">
          Publishing puts both locales of a lesson live together (D4, D20).
        </p>
        {queue.ready.length === 0 ? (
          <p className="text-sm text-muted">No approved lessons waiting.</p>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {queue.ready.map((r) => (
              <li
                key={r.key}
                className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.titles['pt-BR'] ?? r.key}</p>
                  <p className="text-xs text-muted">
                    {r.key} · {r.titles.en ?? 'no en variant'}
                  </p>
                  {r.blockers.length > 0 && (
                    <ul className="mt-1 text-xs text-danger">
                      {r.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  disabled={r.blockers.length > 0}
                  onClick={() => void publish(r.key)}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-40"
                >
                  Publish both locales
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: QueueLesson }) {
  const blocked = lesson.blockers.length > 0;
  return (
    <li className="flex flex-wrap items-start gap-4 border-b border-line px-4 py-3 last:border-0">
      <div className="min-w-0 flex-1 basis-64">
        <p className="font-medium">{lesson.titles['pt-BR'] ?? lesson.titles.en ?? lesson.key}</p>
        <p className="text-xs text-muted">
          {lesson.key}
          {lesson.titles.en && lesson.titles['pt-BR'] ? ` · ${lesson.titles.en}` : ''}
        </p>
        {blocked && (
          <ul
            className="mt-1 text-xs text-danger"
            aria-label="Why this lesson can't be reviewed yet"
          >
            {lesson.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
            {lesson.errors.slice(0, 5).map((i) => (
              <li key={`${i.file}${i.field}${i.message}`} className="text-muted">
                {i.file.replace(`content/drafts/lessons/${lesson.key}/`, '')}
                {i.field ? ` › ${i.field}` : ''}: {i.message}
              </li>
            ))}
          </ul>
        )}
        {lesson.waitingFor.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            Approved; stays in drafts until these are in the library: {lesson.waitingFor.join(', ')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 text-xs">
        {Object.entries(lesson.locales).map(([locale, s]) => (
          <div key={locale} className="flex items-center gap-2">
            <span className="w-10 font-semibold">{LOCALE_LABEL[locale as 'en']}</span>
            <StateBadge state={s.state} />
            <Verdicts verdicts={s.verdicts} />
            <span className="text-muted">
              {s.approvedClaims}/{s.claims} claims approved
            </span>
          </div>
        ))}
      </div>
      <div className="w-24 text-right">
        {blocked ? (
          <span className="text-xs text-muted">Blocked</span>
        ) : (
          <Link
            to={`/_review?lesson=${lesson.key}`}
            className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Review
          </Link>
        )}
      </div>
    </li>
  );
}

export function issueText(issues: { file: string; field: string; message: string }[]): string {
  return issues.map((i) => `${i.file}${i.field ? ` › ${i.field}` : ''}: ${i.message}`).join('; ');
}

export function Failure({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-xl font-semibold">The review API failed</h1>
      <p className="mb-4 rounded-xl bg-danger-soft p-3 text-sm">{text}</p>
      <p className="mb-4 text-sm text-muted">
        The review tool only works on the dev server (<code>pnpm dev</code>).
      </p>
      <button type="button" onClick={onRetry} className="rounded-full border border-line px-4 py-2">
        Try again
      </button>
    </div>
  );
}

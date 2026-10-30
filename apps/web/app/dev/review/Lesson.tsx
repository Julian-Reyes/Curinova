import {
  lessonImageUrl,
  MEDIA_SLOTS,
  type Concept,
  type ImageOrigin,
  type Locale,
  type MediaSlot,
} from '@lumen/domain';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { QuizRunner } from '../../components/QuizRunner';
import { LessonCard } from '../../features/feed/LessonCard';
import {
  fetchLesson,
  fetchQueue,
  postAction,
  type ActionResult,
  type ClaimLocation,
  type LessonEdit,
  type LessonLocaleView,
  type LessonView,
  type ReviewActionInput,
  type SupportView,
} from './api';
import { LessonPreview } from './Preview';
import { Failure } from './Queue';
import { LOCALE_LABEL, SHORTCUTS, StateBadge, VerdictBadge } from './ui';

const LOCALES: Locale[] = ['pt-BR', 'en'];

interface Focus {
  locale: Locale;
  /** null = the locale itself (its header). */
  claimId: string | null;
}

type DialogState =
  { kind: 'reject' | 'note'; locale: Locale; claimId: string | null } | { kind: 'help' } | null;

const focusId = (f: Focus) => `focus-${f.locale}-${f.claimId ?? 'locale'}`;
const isApproved = (v: string) => v === 'approved' || v === 'edited';

/** Keys the screen handles; ignored while typing or while any dialog is open. */
function shouldIgnore(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const t = e.target as HTMLElement | null;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return true;
  return document.querySelector('[role="dialog"]') !== null;
}

export function LessonScreen({
  lessonKey,
  onNavigate,
}: {
  lessonKey: string;
  onNavigate: (key: string) => void;
}) {
  const [view, setView] = useState<LessonView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [editing, setEditing] = useState<Locale | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(true);
  const openedAt = useRef(0);

  const reload = useCallback(() => {
    fetchLesson(lessonKey)
      .then((v) => {
        setView(v);
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      });
    fetchQueue()
      .then((q) => {
        setOrder(
          q.trails.flatMap((t) =>
            t.lessons.filter((l) => l.blockers.length === 0).map((l) => l.key),
          ),
        );
      })
      .catch(() => {
        setOrder([]);
      });
  }, [lessonKey]);

  // The route remounts this screen per lesson (key), so state starts fresh each time.
  useEffect(() => {
    openedAt.current = Date.now();
    reload();
  }, [reload]);

  const locales = useMemo(() => LOCALES.filter((l) => view?.locales[l] !== undefined), [view]);
  const focusList = useMemo<Focus[]>(
    () =>
      locales.flatMap((locale) => [
        { locale, claimId: null },
        ...(view?.locales[locale]?.variant.claims ?? []).map((c) => ({ locale, claimId: c.id })),
      ]),
    [locales, view],
  );
  const focus = focusList[Math.min(focusIndex, focusList.length - 1)];
  const readOnly = (view?.blockers.length ?? 0) > 0;

  useEffect(() => {
    if (focus) document.getElementById(focusId(focus))?.scrollIntoView({ block: 'nearest' });
  }, [focus]);

  const run = useCallback(
    async (action: ReviewActionInput) => {
      setBusy(true);
      try {
        const r = await postAction({
          ...action,
          ms: Date.now() - openedAt.current,
        });
        setResult(r);
        if (r.ok) reload();
        return r;
      } catch (e) {
        const r: ActionResult = {
          ok: false,
          message: e instanceof Error ? e.message : String(e),
          issues: [],
        };
        setResult(r);
        return r;
      } finally {
        setBusy(false);
      }
    },
    [reload],
  );

  const approve = useCallback(
    (f: Focus) => {
      if (readOnly || busy) return;
      if (f.claimId === null)
        void run({ type: 'approve-locale', key: lessonKey, locale: f.locale });
      else
        void run({ type: 'approve-claim', key: lessonKey, locale: f.locale, claimId: f.claimId });
    },
    [busy, lessonKey, readOnly, run],
  );

  const neighbor = useCallback(
    (step: number) => {
      const i = order.indexOf(lessonKey);
      const next = i === -1 ? order[0] : order[i + step];
      if (next !== undefined && next !== lessonKey) onNavigate(next);
    },
    [lessonKey, onNavigate, order],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editing) {
        setEditing(null);
        return;
      }
      if (shouldIgnore(e) || editing) return;
      const f = focus;
      switch (e.key) {
        case 'j':
          setFocusIndex((i) => Math.min(i + 1, focusList.length - 1));
          break;
        case 'k':
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case 'a':
          if (f) approve(f);
          break;
        case 'e':
          if (f && !readOnly) setEditing(f.locale);
          break;
        case 'r':
          if (f && !readOnly) setDialog({ kind: 'reject', locale: f.locale, claimId: f.claimId });
          break;
        case 'n':
          if (f) setDialog({ kind: 'note', locale: f.locale, claimId: f.claimId });
          break;
        case '[':
          neighbor(-1);
          break;
        case ']':
          neighbor(1);
          break;
        case '?':
          setDialog({ kind: 'help' });
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [approve, editing, focus, focusList.length, neighbor, readOnly]);

  if (error) return <Failure text={error} onRetry={reload} />;
  if (!view) return <p className="p-8 text-muted">Loading {lessonKey}…</p>;

  const setFocus = (f: Focus) => {
    const i = focusList.findIndex((x) => x.locale === f.locale && x.claimId === f.claimId);
    if (i !== -1) setFocusIndex(i);
  };
  const position = order.indexOf(lessonKey);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/_review" className="text-sm text-muted underline">
            ← Queue
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">
              {view.locales['pt-BR']?.variant.title ?? view.locales.en?.variant.title}
            </h1>
            <p className="text-xs text-muted">
              {view.key} · {view.concept.id} · {view.cluster?.title.en ?? view.concept.clusterId} ·
              lesson {view.concept.clusterOrder}
              {position !== -1 && ` · ${String(position + 1)} of ${String(order.length)} to review`}
            </p>
          </div>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              neighbor(-1);
            }}
          >
            [ Previous
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              neighbor(1);
            }}
          >
            Next ]
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              setReportOpen((o) => !o);
            }}
          >
            {reportOpen ? 'Hide' : 'Show'} verifier report ({view.reports.length})
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              setDialog({ kind: 'help' });
            }}
          >
            ? Shortcuts
          </button>
        </div>
        {result && (
          <ResultLine
            result={result}
            onClose={() => {
              setResult(null);
            }}
          />
        )}
        {readOnly && (
          <div className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-sm" role="alert">
            <p className="font-semibold">This lesson can't be reviewed yet:</p>
            <ul className="list-disc pl-5">
              {view.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
              {view.errors.map((i) => (
                <li key={`${i.file}${i.field}${i.message}`}>
                  {i.file}
                  {i.field ? ` › ${i.field}` : ''}: {i.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div
        className={`grid gap-6 px-6 py-6 ${reportOpen ? 'xl:grid-cols-[1fr_1fr_400px]' : 'lg:grid-cols-2'}`}
      >
        {locales.map((locale) => {
          const lv = view.locales[locale];
          if (!lv) return null;
          return (
            <LocaleColumn
              key={locale}
              view={view}
              locale={locale}
              lv={lv}
              focus={focus}
              readOnly={readOnly}
              busy={busy}
              editing={editing === locale}
              onFocus={setFocus}
              onApprove={approve}
              onEdit={() => {
                setEditing(locale);
              }}
              onCancelEdit={() => {
                setEditing(null);
              }}
              onSave={async (edit) => {
                const r = await run({ type: 'edit', key: view.key, locale, edit });
                if (r.ok) setEditing(null);
              }}
              onDialog={setDialog}
            />
          );
        })}
        {reportOpen && <ReportPanel view={view} />}
      </div>

      {dialog?.kind === 'help' && (
        <Dialog
          title="Keyboard shortcuts"
          onClose={() => {
            setDialog(null);
          }}
        >
          <dl className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-2 text-sm">
            {SHORTCUTS.map(([k, what]) => (
              <div key={k} className="contents">
                <dt>
                  <kbd className="rounded border border-line bg-sunken px-1.5 font-mono">{k}</kbd>
                </dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
        </Dialog>
      )}
      {(dialog?.kind === 'reject' || dialog?.kind === 'note') && (
        <NoteDialog
          kind={dialog.kind}
          target={`${view.key} · ${dialog.locale}${dialog.claimId ? ` · claim ${dialog.claimId}` : ''}`}
          onClose={() => {
            setDialog(null);
          }}
          onSubmit={async (note) => {
            const r =
              dialog.kind === 'reject'
                ? await run({
                    type: 'reject',
                    key: view.key,
                    locale: dialog.locale,
                    claimId: dialog.claimId,
                    note,
                  })
                : await run({
                    type: 'note',
                    key: view.key,
                    locale: dialog.locale,
                    claimId: dialog.claimId,
                    note,
                  });
            if (r.ok) setDialog(null);
          }}
        />
      )}
    </div>
  );
}

const BTN =
  'rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-sunken disabled:opacity-40';
const BTN_PRIMARY =
  'rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary disabled:opacity-40';

function ResultLine({ result, onClose }: { result: ActionResult; onClose: () => void }) {
  return (
    <div
      role="status"
      className={`mt-2 flex items-start gap-3 rounded-xl px-3 py-2 text-sm ${result.ok ? 'bg-success-soft' : 'bg-danger-soft'}`}
    >
      <div className="flex-1">
        <p>{result.message}</p>
        {!result.ok && result.issues.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-xs">
            {result.issues.map((i) => (
              <li key={`${i.file}${i.field}${i.message}`}>
                {i.file}
                {i.field ? ` › ${i.field}` : ''}: {i.message} [{i.code}]
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" onClick={onClose} className="text-xs underline">
        Dismiss
      </button>
    </div>
  );
}

function LocaleColumn({
  view,
  locale,
  lv,
  focus,
  readOnly,
  busy,
  editing,
  onFocus,
  onApprove,
  onEdit,
  onCancelEdit,
  onSave,
  onDialog,
}: {
  view: LessonView;
  locale: Locale;
  lv: LessonLocaleView;
  focus: Focus | undefined;
  readOnly: boolean;
  busy: boolean;
  editing: boolean;
  onFocus: (f: Focus) => void;
  onApprove: (f: Focus) => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (edit: LessonEdit) => Promise<void>;
  onDialog: (d: DialogState) => void;
}) {
  const v = lv.variant;
  const allClaims = v.claims.every((c) => isApproved(c.humanVerdict));
  const headerFocused = focus?.locale === locale && focus.claimId === null;
  const canAct = !readOnly && lv.fromDraft;
  return (
    <section lang={locale} className="min-w-0" aria-label={`${locale} variant`}>
      <div
        id={focusId({ locale, claimId: null })}
        className={`mb-4 flex flex-wrap items-center gap-2 rounded-2xl border bg-surface px-4 py-3 ${headerFocused ? 'border-primary ring-2 ring-primary' : 'border-line'}`}
      >
        <button
          type="button"
          className="text-lg font-semibold"
          onClick={() => {
            onFocus({ locale, claimId: null });
          }}
        >
          {LOCALE_LABEL[locale]}
        </button>
        <StateBadge state={lv.state} />
        <span className="text-xs text-muted">
          {v.claims.filter((c) => isApproved(c.humanVerdict)).length}/{v.claims.length} claims
          approved · license {v.contentLicense}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={!canAct || busy || !allClaims || lv.state === 'approved'}
          title={allClaims ? undefined : 'Approve every claim first'}
          onClick={() => {
            onApprove({ locale, claimId: null });
          }}
        >
          Approve {locale}
        </button>
        <button type="button" className={BTN} disabled={!canAct || editing} onClick={onEdit}>
          Edit
        </button>
        <button
          type="button"
          className={BTN}
          disabled={!canAct}
          onClick={() => {
            onDialog({ kind: 'reject', locale, claimId: null });
          }}
        >
          Reject…
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            onDialog({ kind: 'note', locale, claimId: null });
          }}
        >
          Note…
        </button>
      </div>

      {editing ? (
        <EditForm
          lv={lv}
          focusClaim={focus?.locale === locale ? focus.claimId : null}
          onCancel={onCancelEdit}
          onSave={onSave}
          busy={busy}
        />
      ) : (
        <>
          <h3 className={H3}>As the learner sees it</h3>
          <p className="mb-2 text-xs text-muted">
            The app's own Discover card. Tap it or “Dive in” for Go Deeper; Quiz is on the rail.
            Nothing here is saved to your progress.
          </p>
          <LessonPreview lesson={view} locale={locale}>
            <div className="relative mx-auto mb-6 h-[600px] w-[340px] overflow-hidden rounded-[28px] shadow-lg">
              <LessonCard
                concept={view.concept}
                variant={v}
                active
                saved={false}
                seed={1}
                onNextInTrail={() => undefined}
              />
            </div>
          </LessonPreview>

          <h3 className={H3}>Images</h3>
          <ImagesPanel concept={view.concept} locale={locale} />

          <h3 className={H3}>Text and claims</h3>
          <LessonText lv={lv} focus={focus} onFocus={onFocus} />

          <h3 className={H3}>Claims ({v.claims.length})</h3>
          <ol className="mb-6 flex flex-col gap-3">
            {v.claims.map((c) => (
              <ClaimCard
                key={c.id}
                locale={locale}
                claim={c}
                support={lv.support[c.id] ?? []}
                placed={lv.locations.some((l) => l.claimId === c.id)}
                focused={focus?.locale === locale && focus.claimId === c.id}
                canAct={canAct && !busy}
                onFocus={() => {
                  onFocus({ locale, claimId: c.id });
                }}
                onApprove={() => {
                  onApprove({ locale, claimId: c.id });
                }}
                onDialog={onDialog}
              />
            ))}
          </ol>

          <h3 className={H3}>Quiz ({lv.questions.length})</h3>
          <LessonPreview lesson={view} locale={locale}>
            <QuizPreview lv={lv} />
          </LessonPreview>
        </>
      )}
      {view.notes.filter((n) => n.locale === locale || n.locale === null).length > 0 && (
        <>
          <h3 className={H3}>Review log notes</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {view.notes
              .filter((n) => n.locale === locale || n.locale === null)
              .map((n) => (
                <li key={`${n.at}${n.note ?? ''}`} className="rounded-xl bg-sunken px-3 py-2">
                  <span className="text-xs text-muted">
                    {n.at.slice(0, 16).replace('T', ' ')} · {n.action}
                    {n.claimId ? ` · ${n.claimId}` : ''}
                  </span>
                  <p>{n.note}</p>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}

const H3 = 'mt-2 mb-2 text-sm font-semibold tracking-wide text-muted uppercase';

const FIELD_LABEL: Record<string, string> = {
  title: 'Title',
  hook: 'Hook',
  summary: 'Summary',
  cardText: 'Card text (Discover)',
};

function fieldsOf(lv: LessonLocaleView): { field: string; label: string; text: string }[] {
  const v = lv.variant;
  return [
    { field: 'title', label: FIELD_LABEL.title ?? '', text: v.title },
    { field: 'hook', label: FIELD_LABEL.hook ?? '', text: v.hook },
    { field: 'summary', label: FIELD_LABEL.summary ?? '', text: v.summary },
    ...(v.cardText !== undefined
      ? [{ field: 'cardText', label: FIELD_LABEL.cardText ?? '', text: v.cardText }]
      : []),
    ...v.cardBlocks.map((b, i) => ({
      field: `cardBlocks[${String(i)}].text`,
      label: b.type === 'takeaway' ? 'Takeaway' : `Card paragraph ${String(i + 1)}`,
      text: b.text,
    })),
    ...v.deepDiveBlocks.map((b, i) => ({
      field: `deepDiveBlocks[${String(i)}].text`,
      label: `Go Deeper ${b.type} ${String(i + 1)}`,
      text: b.text,
    })),
  ];
}

/** Every text field, each claim's best-matching sentence highlighted with its ID. */
function LessonText({
  lv,
  focus,
  onFocus,
}: {
  lv: LessonLocaleView;
  focus: Focus | undefined;
  onFocus: (f: Focus) => void;
}) {
  const locale = lv.variant.locale;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 text-[15px] leading-relaxed">
      {fieldsOf(lv).map(({ field, label, text }) => {
        const spans = new Map<string, ClaimLocation[]>();
        for (const loc of lv.locations.filter((l) => l.field === field)) {
          const k = `${String(loc.start)}-${String(loc.end)}`;
          spans.set(k, [...(spans.get(k) ?? []), loc]);
        }
        const ordered = [...spans.values()].sort((a, b) => (a[0]?.start ?? 0) - (b[0]?.start ?? 0));
        const parts: React.ReactNode[] = [];
        let at = 0;
        for (const group of ordered) {
          const first = group[0];
          if (!first) continue;
          parts.push(text.slice(at, first.start));
          const ids = group.map((g) => g.claimId);
          const focused =
            focus?.locale === locale && focus.claimId !== null && ids.includes(focus.claimId);
          parts.push(
            <button
              key={first.start}
              type="button"
              onClick={() => {
                onFocus({ locale, claimId: ids[0] ?? null });
              }}
              className={`inline rounded px-0.5 text-left ${focused ? 'bg-primary text-on-primary' : 'bg-accent-soft'}`}
            >
              {text.slice(first.start, first.end)}
              <sup className="ml-0.5 font-mono text-[10px] font-semibold">{ids.join(',')}</sup>
            </button>,
          );
          at = first.end;
        }
        parts.push(text.slice(at));
        return (
          <div key={field}>
            <p className="text-[11px] font-semibold text-muted uppercase">{label}</p>
            <p>{parts}</p>
          </div>
        );
      })}
    </div>
  );
}

function ClaimCard({
  locale,
  claim,
  support,
  placed,
  focused,
  canAct,
  onFocus,
  onApprove,
  onDialog,
}: {
  locale: Locale;
  claim: LessonLocaleView['variant']['claims'][number];
  support: SupportView[];
  placed: boolean;
  focused: boolean;
  canAct: boolean;
  onFocus: () => void;
  onApprove: () => void;
  onDialog: (d: DialogState) => void;
}) {
  const approvable = claim.autoVerdict !== 'unsupported' && claim.autoVerdict !== 'pending';
  return (
    <li
      id={focusId({ locale, claimId: claim.id })}
      className={`rounded-2xl border bg-surface p-4 ${focused ? 'border-primary ring-2 ring-primary' : 'border-line'}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onFocus} className="font-mono text-sm font-bold">
          {claim.id}
        </button>
        <VerdictBadge label="verifier" value={claim.autoVerdict} />
        <VerdictBadge label="human" value={claim.humanVerdict} />
        {claim.highStakes && (
          <span className="rounded-md bg-danger-soft px-1.5 text-[11px] font-semibold">
            high stakes
          </span>
        )}
        {!placed && <span className="text-[11px] text-muted">not matched to a sentence</span>}
        <span className="flex-1" />
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={!canAct || !approvable || claim.humanVerdict === 'approved'}
          onClick={onApprove}
        >
          Approve
        </button>
        <button
          type="button"
          className={BTN}
          disabled={!canAct}
          onClick={() => {
            onDialog({ kind: 'reject', locale, claimId: claim.id });
          }}
        >
          Reject…
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            onDialog({ kind: 'note', locale, claimId: claim.id });
          }}
        >
          Note…
        </button>
      </div>
      <p className="mb-3 font-medium">{claim.text}</p>
      <ul className="flex flex-col gap-3">
        {support.map((s, i) => (
          <li
            key={`${s.sourceId}-${String(i)}`}
            className="rounded-xl bg-sunken p-3 text-sm"
            lang={undefined}
          >
            <p className="mb-1 text-xs">
              {s.source ? (
                <>
                  <a
                    href={s.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline"
                  >
                    {s.source.title}
                  </a>{' '}
                  · {s.source.publisher}
                </>
              ) : (
                <span className="text-danger">No source record for {s.sourceId}</span>
              )}
              {s.locator && <span className="text-muted"> · {s.locator}</span>}
            </p>
            <blockquote className="mb-2 border-l-4 border-primary pl-3 italic">
              {s.excerpt}
            </blockquote>
            <SnapshotContext s={s} />
          </li>
        ))}
        {support.length === 0 && <li className="text-sm text-danger">No supporting excerpt.</li>}
      </ul>
    </li>
  );
}

function SnapshotContext({ s }: { s: SupportView }) {
  if (s.context.kind === 'missing')
    return (
      <p className="text-xs text-muted">
        No local snapshot for <code>{s.sourceId}</code>. Re-create snapshots with{' '}
        <code>pnpm content:sources refetch</code>.
      </p>
    );
  if (s.context.kind === 'not-found')
    return <p className="text-xs text-danger">The excerpt was not found in the local snapshot.</p>;
  return (
    <p className="text-xs leading-relaxed text-ink-soft">
      <span className="text-muted">In the source: …</span>
      {s.context.before}
      <mark className="bg-accent-soft text-ink">{s.context.match}</mark>
      {s.context.after}…
    </p>
  );
}

const SLOT_LABEL: Record<MediaSlot, string> = {
  discover: 'Discover card (9:16)',
  deeper: 'Go Deeper (12:7)',
  review: 'Quiz and Review (16:9)',
};

function originText(o: ImageOrigin): string {
  switch (o.kind) {
    case 'generated':
      return `Generated · ${o.tool} · ${o.createdBy}, ${o.createdAt}`;
    case 'licensed':
      return `${o.creator}${o.platform ? `, ${o.platform}` : ''} · ${o.license}`;
    case 'owned':
      return `Owned · ${o.creator}`;
    case 'unknown':
      return 'Origin unknown';
  }
}

/** Every image slot of the lesson, with its alt text and credit, so each can be checked here. */
function ImagesPanel({ concept, locale }: { concept: Concept; locale: Locale }) {
  return (
    <div className="mb-6 grid grid-cols-[2fr_3fr] gap-3">
      {MEDIA_SLOTS.map((slot) => {
        const image = concept.media?.[slot];
        return (
          <figure
            key={slot}
            className={`flex flex-col gap-1 rounded-2xl border border-line bg-surface p-2 ${slot === 'discover' ? 'row-span-2' : ''}`}
          >
            <figcaption className="text-xs font-semibold">{SLOT_LABEL[slot]}</figcaption>
            {image ? (
              <>
                <img
                  src={lessonImageUrl(concept.id, slot, 'full', image.hash)}
                  width={image.width}
                  height={image.height}
                  alt={image.alt[locale] ?? ''}
                  loading="lazy"
                  className="h-auto w-full rounded-xl bg-sunken"
                />
                <p className="text-xs">{image.alt[locale] ?? 'No alt text for this language'}</p>
                <p className="text-xs text-muted">
                  {image.origin.kind === 'licensed' ? (
                    <a
                      href={image.origin.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {originText(image.origin)}
                    </a>
                  ) : (
                    originText(image.origin)
                  )}{' '}
                  · {image.width}×{image.height} · accuracy{' '}
                  {image.accuracyReviewedBy ?? 'not checked'}
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-sunken p-3 text-xs text-muted">
                No image: the app shows the lesson&apos;s diagram or the topic icon here.
              </p>
            )}
          </figure>
        );
      })}
    </div>
  );
}

function QuizPreview({ lv }: { lv: LessonLocaleView }) {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
      {lv.questions.length === 0 ? (
        <p className="text-muted">No questions.</p>
      ) : done ? (
        <button
          type="button"
          className={BTN}
          onClick={() => {
            setDone(false);
            setRun((n) => n + 1);
          }}
        >
          Answer again
        </button>
      ) : (
        <QuizRunner
          key={run}
          questions={lv.questions}
          seed={run + 1}
          onAnswer={() => undefined}
          onFinish={() => {
            setDone(true);
          }}
          finishLabel="Finish"
        />
      )}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold">Answer key</summary>
        <ol className="mt-2 flex flex-col gap-2">
          {lv.questions.map((q) => (
            <li key={q.id}>
              <p className="font-medium">{q.prompt}</p>
              <p>
                ✓ {q.options.find((o) => o.id === q.correctOptionId)?.text}{' '}
                <span className="text-muted">
                  · claims {q.claimIds.join(', ') || 'none'} · {q.status}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/** Field keys in the edit form, mapped back to a LessonEdit on save. */
function editableValues(lv: LessonLocaleView): [string, string, string][] {
  const out: [string, string, string][] = fieldsOf(lv).map(({ field, label, text }) => [
    field,
    label,
    text,
  ]);
  for (const c of lv.variant.claims) out.push([`claim:${c.id}`, `Claim ${c.id}`, c.text]);
  for (const q of lv.questions) {
    const n = q.id;
    out.push([`q:${n}:prompt`, `${n} · prompt`, q.prompt]);
    for (const o of q.options)
      out.push([
        `q:${n}:opt:${o.id}`,
        `${n} · option ${o.id}${o.id === q.correctOptionId ? ' (correct)' : ''}`,
        o.text,
      ]);
    out.push([`q:${n}:explanation`, `${n} · explanation`, q.explanation]);
    if (q.misconception !== undefined)
      out.push([`q:${n}:misconception`, `${n} · misconception`, q.misconception]);
  }
  return out;
}

export function toEdit(changed: Record<string, string>): LessonEdit {
  const edit: LessonEdit = {};
  for (const [key, value] of Object.entries(changed)) {
    let m: RegExpExecArray | null;
    if (key === 'title' || key === 'hook' || key === 'summary' || key === 'cardText')
      edit[key] = value;
    else if ((m = /^(cardBlocks|deepDiveBlocks)\[(\d+)\]\.text$/.exec(key)))
      (edit[m[1] as 'cardBlocks'] ??= {})[Number(m[2])] = value;
    else if ((m = /^claim:(.+)$/.exec(key))) (edit.claims ??= {})[m[1] ?? ''] = value;
    else if ((m = /^q:([^:]+):(prompt|explanation|misconception)$/.exec(key)))
      ((edit.questions ??= {})[m[1] ?? ''] ??= {})[m[2] as 'prompt'] = value;
    else if ((m = /^q:([^:]+):opt:(.+)$/.exec(key)))
      (((edit.questions ??= {})[m[1] ?? ''] ??= {}).options ??= {})[m[2] ?? ''] = value;
  }
  return edit;
}

function EditForm({
  lv,
  focusClaim,
  busy,
  onCancel,
  onSave,
}: {
  lv: LessonLocaleView;
  focusClaim: string | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (edit: LessonEdit) => Promise<void>;
}) {
  const fields = useMemo(() => editableValues(lv), [lv]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(([k, , v]) => [k, v])),
  );
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const target = focusClaim ? `claim:${focusClaim}` : fields[0]?.[0];
    const el = form.current?.querySelector<HTMLTextAreaElement>(`[data-key="${target ?? ''}"]`);
    el?.focus();
    el?.scrollIntoView({ block: 'center' });
  }, [fields, focusClaim]);
  const changed = Object.fromEntries(
    fields.filter(([k, , v]) => values[k] !== v).map(([k]) => [k, values[k] ?? '']),
  );
  const save = () => void onSave(toEdit(changed));
  return (
    <form
      ref={form}
      className="flex flex-col gap-3 rounded-2xl border border-primary bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p className="text-sm text-muted">
        Edit text only; IDs, excerpts and sources can't change. Saving re-runs the checks and marks
        the claims touched as “edited”. ⌘/Ctrl+Enter saves, Esc cancels.
      </p>
      {fields.map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
          <span
            className={`text-xs font-semibold ${values[key] !== fields.find((f) => f[0] === key)?.[2] ? 'text-primary-strong' : 'text-muted'}`}
          >
            {label}
          </span>
          <textarea
            data-key={key}
            value={values[key] ?? ''}
            rows={Math.min(8, Math.max(1, Math.ceil((values[key]?.length ?? 0) / 70)))}
            onChange={(e) => {
              setValues((cur) => ({ ...cur, [key]: e.target.value }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                save();
              }
            }}
            className="rounded-lg border border-line bg-bg px-2 py-1.5 text-[15px] leading-relaxed"
          />
        </label>
      ))}
      <div className="sticky bottom-0 flex gap-2 bg-surface py-2">
        <button
          type="submit"
          className={BTN_PRIMARY}
          disabled={busy || Object.keys(changed).length === 0}
        >
          Save {Object.keys(changed).length} change(s)
        </button>
        <button type="button" className={BTN} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReportPanel({ view }: { view: LessonView }) {
  const [index, setIndex] = useState(0);
  const report = view.reports[index];
  return (
    <aside
      className="min-w-0 xl:sticky xl:top-28 xl:max-h-[calc(100dvh-8rem)] xl:overflow-auto"
      aria-label="Verifier report"
    >
      <h3 className={H3}>Verifier report</h3>
      {view.reports.length === 0 ? (
        <p className="text-sm text-muted">
          No report in content/drafts/verify/ for {view.concept.clusterId}.
        </p>
      ) : (
        <>
          <select
            aria-label="Report file"
            className="mb-2 w-full rounded-lg border border-line bg-surface px-2 py-1 text-sm"
            value={index}
            onChange={(e) => {
              setIndex(Number(e.target.value));
            }}
          >
            {view.reports.map((r, i) => (
              <option key={r.name} value={i}>
                {r.name}
                {i === 0 ? ' (newest)' : ''}
              </option>
            ))}
          </select>
          <pre className="rounded-xl bg-sunken p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {report?.text}
          </pre>
        </>
      )}
    </aside>
  );
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-2xl bg-surface p-5 shadow-xl"
      >
        <div className="mb-3 flex items-center">
          <h2 className="flex-1 text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NoteDialog({
  kind,
  target,
  onClose,
  onSubmit,
}: {
  kind: 'reject' | 'note';
  target: string;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    field.current?.focus();
  }, []);
  return (
    <Dialog title={kind === 'reject' ? `Reject ${target}` : `Note on ${target}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (note.trim() !== '') void onSubmit(note);
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">
            {kind === 'reject'
              ? 'Required. Goes to content/drafts/review/ for the writer, and to the review log.'
              : 'Saved to the review log.'}
          </span>
          <textarea
            ref={field}
            value={note}
            rows={5}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && note.trim() !== '') {
                e.preventDefault();
                void onSubmit(note);
              }
            }}
            className="rounded-lg border border-line bg-bg px-2 py-1.5"
          />
        </label>
        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            className={
              kind === 'reject'
                ? 'rounded-full bg-danger px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40'
                : BTN_PRIMARY
            }
            disabled={note.trim() === ''}
          >
            {kind === 'reject' ? 'Reject' : 'Add note'}
          </button>
          <button type="button" className={BTN} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
}

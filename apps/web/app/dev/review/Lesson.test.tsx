import 'fake-indexeddb/auto';
import type { LessonVariant, Locale, QuizQuestion } from '@lumen/domain';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonView, Queue, ReviewAction } from './api';
import { LessonScreen, toEdit } from './Lesson';

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${String(i)}`).join(' ');

function variant(locale: Locale): LessonVariant {
  return {
    id: `lesson_moon__${locale}`,
    conceptId: 'concept_moon',
    locale,
    slug: `moon-${locale.toLowerCase()}`,
    title: `Why one face (${locale})?`,
    hook: 'A hook.',
    summary: 'A summary.',
    cardBlocks: [
      { type: 'paragraph', text: `The Moon spins once per orbit. ${words(90)}.` },
      { type: 'takeaway', text: 'One spin per orbit.' },
    ],
    deepDiveBlocks: [{ type: 'paragraph', text: 'Tidal forces slowed its spin long ago.' }],
    heroMedia: { type: 'illustration', illustrationId: 'moon', alt: 'Moon', license: 'original' },
    claims: [
      {
        id: 'c1',
        text: 'The Moon spins once per orbit.',
        highStakes: false,
        support: [{ sourceId: 'src_nasa_moon', excerpt: 'rotates once per orbit' }],
        autoVerdict: 'supported',
        humanVerdict: 'pending',
      },
      {
        id: 'c2',
        text: 'Tidal forces slowed its spin.',
        highStakes: false,
        support: [{ sourceId: 'src_nasa_moon', excerpt: 'tidal forces slowed' }],
        autoVerdict: 'partial',
        humanVerdict: 'approved',
      },
    ],
    sourceIds: ['src_nasa_moon'],
    quizIds: [`q_moon_1__${locale}`],
    contentLicense: 'pending',
    generation: null,
    reviewStatus: 'draft',
    publicationStatus: 'draft',
    reviewedBy: null,
    reviewedAt: null,
    reviewAfter: null,
    publishedAt: null,
    updatedAt: '2026-10-30T00:00:00Z',
  };
}

const question = (locale: Locale): QuizQuestion => ({
  id: `q_moon_1__${locale}`,
  questionGroupId: 'qg_moon_1',
  conceptId: 'concept_moon',
  locale,
  prompt: 'How often does the Moon spin?',
  options: [
    { id: 'a', text: 'Once per orbit' },
    { id: 'b', text: 'Once a day' },
    { id: 'c', text: 'Never' },
  ],
  correctOptionId: 'a',
  explanation: 'Once per orbit.',
  claimIds: ['c1'],
  status: 'draft',
});

const support = {
  c1: [
    {
      sourceId: 'src_nasa_moon',
      excerpt: 'rotates once per orbit',
      source: { title: 'Moon', publisher: 'NASA', url: 'https://science.nasa.gov/moon' },
      context: {
        kind: 'found' as const,
        before: 'It ',
        match: 'rotates once per orbit',
        after: '.',
      },
    },
  ],
  c2: [
    {
      sourceId: 'src_nasa_moon',
      excerpt: 'tidal forces slowed',
      source: null,
      context: { kind: 'missing' as const },
    },
  ],
};

const lesson: LessonView = {
  key: 'moon',
  concept: {
    id: 'concept_moon',
    topicId: 'space',
    clusterId: 'cluster_moon',
    clusterOrder: 1,
    tags: [],
    difficulty: 'beginner',
    related: [],
    variants: ['pt-BR', 'en'],
    media: {
      review: {
        width: 1000,
        height: 562,
        alt: { 'pt-BR': 'A Lua cheia', en: 'The full Moon' },
        origin: {
          kind: 'licensed',
          creator: 'Jane Doe',
          platform: 'Wikimedia Commons',
          license: 'CC BY 4.0',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Moon.jpg',
        },
        accuracyReviewedBy: null,
        addedAt: '2026-10-30',
        hash: '0123abcd',
      },
    },
  },
  topic: null,
  cluster: null,
  locales: Object.fromEntries(
    (['pt-BR', 'en'] as const).map((l) => [
      l,
      {
        variant: variant(l),
        fromDraft: true,
        questions: [question(l)],
        state: 'waiting',
        locations: [{ claimId: 'c1', field: 'cardBlocks[0].text', start: 0, end: 30 }],
        support,
      },
    ]),
  ),
  neighbors: { concepts: [], variants: [] },
  sources: [],
  reports: [{ name: '2026-10-30-cluster_moon.md', text: '# Verifier report\nAll good.' }],
  notes: [],
  errors: [],
  blockers: [],
};

const queue: Queue = {
  trails: [],
  ready: [],
  medianMinutes: null,
  reviewedVariants: 0,
  targetMinutes: 4,
};

let actions: ReviewAction[];

beforeEach(() => {
  actions = [];
  // jsdom has no layout, so no scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const body = url.includes('/lesson')
        ? lesson
        : url.includes('/queue')
          ? queue
          : (actions.push(JSON.parse(init?.body as string) as ReviewAction),
            { ok: true, message: 'Done.' });
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

async function setup() {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(
    <MemoryRouter>
      <LessonScreen lessonKey="moon" onNavigate={onNavigate} />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { level: 1, name: /Why one face/ });
  return { user, onNavigate };
}

describe('review lesson screen', () => {
  it('shows both locales side by side, with claims, excerpts and snapshot context', async () => {
    await setup();
    expect(screen.getByRole('region', { name: 'pt-BR variant' })).toBeTruthy();
    const en = screen.getByRole('region', { name: 'en variant' });
    expect(within(en).getAllByText('rotates once per orbit').length).toBeGreaterThan(0);
    expect(within(en).getByText(/No local snapshot for/)).toBeTruthy();
    expect(within(en).getByText(/pnpm content:sources refetch/)).toBeTruthy();
    expect(screen.getByText(/All good\./)).toBeTruthy();
  });

  it('shows every image slot with its alt text and credit, or says the slot is empty', async () => {
    await setup();
    const en = screen.getByRole('region', { name: 'en variant' });
    expect(within(en).getByRole('img', { name: 'The full Moon' })).toBeTruthy();
    expect(
      within(en).getByRole('link', { name: /Jane Doe, Wikimedia Commons · CC BY 4.0/ }),
    ).toBeTruthy();
    expect(within(en).getAllByText(/No image: the app shows/)).toHaveLength(2);
    const pt = screen.getByRole('region', { name: 'pt-BR variant' });
    expect(within(pt).getByRole('img', { name: 'A Lua cheia' })).toBeTruthy();
  });

  it('is keyboard driven: j/k move, a approves the claim or the locale', async () => {
    const { user } = await setup();
    await user.keyboard('j'); // pt-BR c1
    await user.keyboard('a');
    await waitFor(() => {
      expect(actions).toHaveLength(1);
    });
    expect(actions[0]).toMatchObject({
      type: 'approve-claim',
      key: 'moon',
      locale: 'pt-BR',
      claimId: 'c1',
    });
    expect(actions[0]?.ms).toBeGreaterThanOrEqual(0);

    await user.keyboard('jj'); // pt-BR c2, then the en header
    await user.keyboard('a');
    await waitFor(() => {
      expect(actions).toHaveLength(2);
    });
    expect(actions[1]).toMatchObject({ type: 'approve-locale', locale: 'en' });
  });

  it('r asks for a required note; n adds a note; ? lists the shortcuts', async () => {
    const { user } = await setup();
    await user.keyboard('j');
    await user.keyboard('r');
    const dialog = await screen.findByRole('dialog', { name: /Reject moon · pt-BR · claim c1/ });
    const reject = within(dialog).getByRole('button', { name: 'Reject' });
    expect((reject as HTMLButtonElement).disabled).toBe(true);
    // Shortcuts are off while typing in the dialog.
    await user.type(within(dialog).getByRole('textbox'), 'Excerpt says nothing about this.');
    await user.click(reject);
    await waitFor(() => {
      expect(actions[0]).toMatchObject({
        type: 'reject',
        locale: 'pt-BR',
        claimId: 'c1',
        note: 'Excerpt says nothing about this.',
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    await user.keyboard('n');
    const note = await screen.findByRole('dialog', { name: /Note on/ });
    await user.type(
      within(note).getByRole('textbox'),
      'Check the date.{Control>}{Enter}{/Control}',
    );
    await waitFor(() => {
      expect(actions[1]).toMatchObject({ type: 'note', note: 'Check the date.' });
    });

    await user.keyboard('?');
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();
  });

  it('e opens the editor on the focused claim and saves only what changed', async () => {
    const { user } = await setup();
    await user.keyboard('j');
    await user.keyboard('e');
    const field = await screen.findByLabelText('Claim c1');
    expect(document.activeElement).toBe(field);
    await user.clear(field);
    await user.type(field, 'The Moon turns once per orbit.');
    await user.click(screen.getByRole('button', { name: 'Save 1 change(s)' }));
    await waitFor(() => {
      expect(actions[0]).toMatchObject({
        type: 'edit',
        locale: 'pt-BR',
        edit: { claims: { c1: 'The Moon turns once per orbit.' } },
      });
    });
  });

  it('[ and ] move between reviewable lessons', async () => {
    queue.trails = [
      {
        clusterId: 'cluster_moon',
        title: {},
        hasDraft: true,
        lessons: ['earlier', 'moon', 'later'].map((key) => ({
          key,
          conceptId: `concept_${key}`,
          clusterOrder: 1,
          titles: {},
          locales: {},
          errors: [],
          blockers: [],
          waitingFor: [],
        })),
      },
    ];
    const { user, onNavigate } = await setup();
    await waitFor(() => {
      expect(screen.getByText(/2 of 3 to review/)).toBeTruthy();
    });
    await user.keyboard(']');
    expect(onNavigate).toHaveBeenLastCalledWith('later');
    await user.keyboard('[[');
    expect(onNavigate).toHaveBeenLastCalledWith('earlier');
    queue.trails = [];
  });
});

describe('toEdit', () => {
  it('maps form fields back to a lesson edit', () => {
    expect(
      toEdit({
        title: 'T',
        'cardBlocks[1].text': 'Take',
        'claim:c3': 'Claim',
        'q:q_x__en:prompt': 'P',
        'q:q_x__en:opt:b': 'B',
      }),
    ).toEqual({
      title: 'T',
      cardBlocks: { 1: 'Take' },
      claims: { c3: 'Claim' },
      questions: { q_x__en: { prompt: 'P', options: { b: 'B' } } },
    });
  });
});

import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { LumenDB } from './db';
import { defaultPreferences, ProgressStore } from './progress';

let n = 0;
function store() {
  n += 1;
  const database = new LumenDB(`test-${n}`);
  return { database, progress: new ProgressStore(database) };
}

const answer = {
  mode: 'quiz' as const,
  conceptId: 'concept_tides',
  questionGroupId: 'qg_tides_1',
  questionId: 'q_tides_1__pt-BR',
  selectedOptionId: 'a',
  correct: true,
  attempt: 1,
  locale: 'pt-BR' as const,
  timeZone: 'America/Sao_Paulo',
  reviewOptIn: true,
  now: new Date('2026-10-23T12:00:00Z'),
};

describe('ProgressStore (IndexedDB)', () => {
  afterEach(() => {
    n += 0;
  });

  it('round-trips preferences and falls back to defaults when none are stored', async () => {
    const { progress } = store();
    const fallback = defaultPreferences('en');
    expect(await progress.loadPreferences(fallback)).toEqual(fallback);
    await progress.savePreferences({ ...fallback, sessionGoal: 10, interests: ['space'] });
    expect(await progress.loadPreferences(fallback)).toMatchObject({
      sessionGoal: 10,
      interests: ['space'],
    });
  });

  it('ignores corrupted stored preferences instead of crashing', async () => {
    const { database, progress } = store();
    await database.settings.put({ key: 'prefs', value: { sessionGoal: 'lots' } });
    const fallback = defaultPreferences('pt-BR');
    expect(await progress.loadPreferences(fallback)).toEqual(fallback);
  });

  it('stores bookmarks by concept and logs the change', async () => {
    const { database, progress } = store();
    await progress.setBookmark('concept_tides', true, 'pt-BR');
    await progress.setBookmark('concept_tides', false, 'en');
    const bookmarks = await database.bookmarks.toArray();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0]).toMatchObject({ conceptId: 'concept_tides', saved: false });
    expect((await database.events.toArray()).map((e) => e.type)).toEqual([
      'bookmark_changed',
      'bookmark_changed',
    ]);
  });

  it('a first quiz answer schedules a review for the next day, keyed by question group', async () => {
    const { database, progress } = store();
    const state = await progress.answer(answer);
    expect(state).toMatchObject({
      conceptId: 'concept_tides',
      questionGroupId: 'qg_tides_1',
      intervalDays: 1,
    });
    expect(await database.reviews.count()).toBe(1);
    const [event] = await database.events.toArray();
    expect(event).toMatchObject({ type: 'quiz_answered', response: { correct: true, attempt: 1 } });
  });

  it('a review answered in the other language updates the same schedule', async () => {
    const { database, progress } = store();
    await progress.answer(answer);
    await progress.answer({
      ...answer,
      mode: 'review',
      locale: 'en',
      questionId: 'q_tides_1__en',
      now: new Date('2026-10-24T12:00:00Z'),
    });
    const reviews = await database.reviews.toArray();
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ correctStreak: 1, intervalDays: 3 });
  });

  it('does not schedule reviews when the learner opted out or on retries', async () => {
    const { database, progress } = store();
    await progress.answer({ ...answer, reviewOptIn: false });
    await progress.answer({ ...answer, attempt: 2 });
    expect(await database.reviews.count()).toBe(0);
    expect(await database.events.count()).toBe(2);
  });

  it('deletes every piece of guest data', async () => {
    const { database, progress } = store();
    await progress.answer(answer);
    await progress.setBookmark('concept_tides', true, 'pt-BR');
    await progress.clearAll();
    expect([
      await database.events.count(),
      await database.reviews.count(),
      await database.bookmarks.count(),
      await database.settings.count(),
    ]).toEqual([0, 0, 0, 0]);
  });
});

describe('database upgrades', () => {
  /** Stores prefs in a version 1 database, as installs before D25 have it, then opens it. */
  async function upgradeFrom(prefs: unknown) {
    n += 1;
    const name = `upgrade-${n}`;
    const v1 = new Dexie(name);
    v1.version(1).stores({ settings: 'key' });
    await v1.table('settings').put({ key: 'prefs', value: prefs });
    v1.close();
    const database = new LumenDB(name);
    return (await database.settings.get('prefs'))?.value;
  }

  it('v2: learners who picked or muted Body get the same for Nature (D25)', async () => {
    const prefs = { ...defaultPreferences('pt-BR'), interests: ['body', 'space'] };
    expect(await upgradeFrom({ ...prefs, mutedTopics: ['body'] })).toMatchObject({
      interests: ['body', 'space', 'nature'],
      mutedTopics: ['body', 'nature'],
    });
  });

  it('v2: leaves other preferences, and partial ones, as they were', async () => {
    const prefs = { ...defaultPreferences('en'), interests: ['history'] };
    expect(await upgradeFrom(prefs)).toEqual(prefs);
    expect(await upgradeFrom({ sessionGoal: 10 })).toEqual({ sessionGoal: 10 });
  });
});

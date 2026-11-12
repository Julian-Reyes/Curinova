import type { Bookmark, ProgressEvent, ReviewState, Session } from '@lumen/domain';
import Dexie, { type EntityTable } from 'dexie';
import { DB_NAME } from '../platform/storage-keys';

export interface SettingRow {
  key: string;
  value: unknown;
}

/*
 * Guest data lives in IndexedDB under the permanent name "lumen".
 * Schema changes MUST add a new `this.version(n)` with an upgrade function; never
 * edit an existing version, or updates could corrupt or drop progress (§12).
 */
export class LumenDB extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>;
  events!: EntityTable<ProgressEvent, 'eventId'>;
  bookmarks!: EntityTable<Bookmark, 'conceptId'>;
  reviews!: Dexie.Table<ReviewState, [string, string]>;
  sessions!: EntityTable<Session, 'sessionId'>;

  constructor(name = DB_NAME) {
    super(name);
    this.version(1).stores({
      settings: 'key',
      events: 'eventId, conceptId, type, occurredAt',
      bookmarks: 'conceptId, updatedAt',
      reviews: '[conceptId+questionGroupId], conceptId, dueAt',
      sessions: 'sessionId, startedAt',
    });
    // v2 (D25): the Amazon trail moved from Body & Biology to the new Nature & Animals
    // topic, so learners who picked or muted Body get the same choice for Nature.
    this.version(2).upgrade(async (tx) => {
      const row = await tx.table<SettingRow, string>('settings').get('prefs');
      if (row === undefined || typeof row.value !== 'object' || row.value === null) return;
      const prefs = { ...(row.value as Record<string, unknown>) };
      for (const key of ['interests', 'mutedTopics']) {
        const list = prefs[key];
        if (Array.isArray(list) && list.includes('body') && !list.includes('nature'))
          prefs[key] = [...(list as unknown[]), 'nature'];
      }
      await tx.table<SettingRow, string>('settings').put({ key: 'prefs', value: prefs });
    });
  }
}

export const db = new LumenDB();

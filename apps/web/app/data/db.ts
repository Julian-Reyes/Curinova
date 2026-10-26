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
  }
}

export const db = new LumenDB();

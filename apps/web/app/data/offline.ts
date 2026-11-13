import { CONTENT_DIR } from '@lumen/domain';
import { lessonImageSources } from '../components/LessonArt';
import type { Library } from './library';

/*
 * Saving lessons for offline use (§12, D28). The service worker keeps a copy of every
 * content file and photo the page fetches, so saving is just fetching through it: the
 * content files (on a first visit they were loaded before the service worker took over)
 * and the starter pack's Discover photos. A photo is loaded as an image with the card's
 * srcset, so the browser picks, and the cache keeps, the same file the card will show.
 */

/** The Network Information API (Chrome and Android only; absent elsewhere). */
export interface ConnectionInfo {
  saveData?: boolean;
  effectiveType?: string;
}

/** This browser's connection details, where it reports them. */
export function currentConnection(): ConnectionInfo | undefined {
  return (navigator as Navigator & { connection?: ConnectionInfo }).connection;
}

/** Whether a service worker already controlled the page when it loaded (not on a first visit). */
export const controlledAtLoad =
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  navigator.serviceWorker.controller !== null;

/** Whether to download the starter pack's photos: switched on, no data saver, not 2G. */
export function photosAllowed(offlineDownload: boolean, connection?: ConnectionInfo): boolean {
  if (!offlineDownload || connection?.saveData === true) return false;
  return connection?.effectiveType !== '2g' && connection?.effectiveType !== 'slow-2g';
}

/**
 * Resolves true once a service worker controls the page, or false when aborted. Never
 * resolves without one (e.g. the dev server, which registers none).
 */
export async function whenControlled(
  sw: ServiceWorkerContainer | undefined,
  signal: AbortSignal,
): Promise<boolean> {
  if (!sw) return false;
  const aborted = new Promise<false>((resolve) => {
    signal.addEventListener(
      'abort',
      () => {
        resolve(false);
      },
      { once: true },
    );
  });
  if (sw.controller) return true;
  const controlled = new Promise<true>((resolve) => {
    sw.addEventListener(
      'controllerchange',
      () => {
        resolve(true);
      },
      { once: true },
    );
  });
  return Promise.race([controlled, aborted]);
}

export type ImageLoader = (sources: {
  src: string;
  srcSet: string;
  sizes: string;
}) => Promise<void>;

/** Loads an image off screen and resolves when it has loaded or failed. */
export const loadImage: ImageLoader = (sources) =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = () => {
      resolve();
    };
    img.sizes = sources.sizes;
    img.srcset = sources.srcSet;
    img.src = sources.src;
  });

/**
 * Fetches what should work offline, one file at a time so it never competes with what
 * the learner is looking at: the content files when `content` is set (the page loaded
 * them before it was controlled), then the starter pack's photos when `photos` is set.
 * Failures are ignored: whatever wasn't saved is tried again on the next visit.
 */
export async function saveForOffline(
  library: Library,
  options: {
    content: boolean;
    photos: boolean;
    signal: AbortSignal;
    fetchFile?: (url: string) => Promise<unknown>;
    load?: ImageLoader;
  },
): Promise<void> {
  const { signal, fetchFile = (url) => fetch(url), load = loadImage } = options;
  if (options.content) {
    for (const name of library.files) {
      if (signal.aborted) return;
      await fetchFile(`${CONTENT_DIR}/${name}`).catch(() => undefined);
    }
  }
  if (!options.photos) return;
  for (const id of library.starterPack) {
    if (signal.aborted) return;
    const image = library.concept(id)?.media?.discover;
    if (image) await load(lessonImageSources(id, 'discover', image));
  }
}

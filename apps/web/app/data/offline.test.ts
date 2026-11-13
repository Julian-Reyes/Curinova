import type { Concept } from '@lumen/domain';
import { describe, expect, it, vi } from 'vitest';
import type { Library } from './library';
import { photosAllowed, saveForOffline, whenControlled } from './offline';

const photo = { width: 1080, height: 1920, hash: 'abc123' };
const concepts: Record<string, Partial<Concept>> = {
  concept_tides: { media: { discover: photo } as Concept['media'] },
  concept_moon: { media: {} },
};
const library = {
  files: ['manifest.json', 'index.1.json'],
  starterPack: ['concept_tides', 'concept_moon'],
  concept: (id: string) => concepts[id],
} as unknown as Library;

describe('saving for offline use (D28)', () => {
  it('fetches the content files, then the starter pack photos with the card’s srcset', async () => {
    const fetchFile = vi.fn(() => Promise.resolve());
    const load = vi.fn(() => Promise.resolve());
    const signal = new AbortController().signal;
    await saveForOffline(library, { content: true, photos: true, signal, fetchFile, load });
    expect(fetchFile.mock.calls).toEqual([['/content/manifest.json'], ['/content/index.1.json']]);
    // The lesson without a Discover photo is skipped.
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({
      src: '/media/tides/discover.webp?v=abc123',
      srcSet:
        '/media/tides/discover-sm.webp?v=abc123 720w, /media/tides/discover.webp?v=abc123 1080w',
      sizes: '(min-width: 1024px) 500px, 100vw',
    });
  });

  it('skips what is switched off, ignores failures and stops when aborted', async () => {
    const controller = new AbortController();
    const fetchFile = vi.fn(() => {
      controller.abort();
      return Promise.reject(new Error('offline'));
    });
    const load = vi.fn(() => Promise.resolve());
    const { signal } = controller;
    await saveForOffline(library, { content: true, photos: true, signal, fetchFile, load });
    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(load).not.toHaveBeenCalled();

    const fresh = new AbortController().signal;
    await saveForOffline(library, {
      content: false,
      photos: false,
      signal: fresh,
      fetchFile,
      load,
    });
    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(load).not.toHaveBeenCalled();
  });

  it('downloads photos only when switched on, without data saver and not on 2G', () => {
    expect(photosAllowed(true)).toBe(true);
    expect(photosAllowed(true, { effectiveType: '4g' })).toBe(true);
    expect(photosAllowed(false)).toBe(false);
    expect(photosAllowed(true, { saveData: true })).toBe(false);
    expect(photosAllowed(true, { effectiveType: '2g' })).toBe(false);
    expect(photosAllowed(true, { effectiveType: 'slow-2g' })).toBe(false);
  });

  it('waits until a service worker controls the page', async () => {
    const container = Object.assign(new EventTarget(), { controller: null });
    const sw = container as unknown as ServiceWorkerContainer;
    const pending = whenControlled(sw, new AbortController().signal);
    container.dispatchEvent(new Event('controllerchange'));
    expect(await pending).toBe(true);

    const controller = new AbortController();
    const aborted = whenControlled(sw, controller.signal);
    controller.abort();
    expect(await aborted).toBe(false);
    expect(await whenControlled(undefined, controller.signal)).toBe(false);
  });
});

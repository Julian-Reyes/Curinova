import { describe, expect, it, vi } from 'vitest';
import { applyPendingUpdate } from './sw-update';

class FakeWorker extends EventTarget {
  constructor(public state: ServiceWorkerState) {
    super();
  }
  postMessage = vi.fn();
  install() {
    this.state = 'installed';
    this.dispatchEvent(new Event('statechange'));
  }
}

function setup(registration: { waiting?: FakeWorker; installing?: FakeWorker } | undefined) {
  const container = new EventTarget();
  const update = vi.fn(() => Promise.resolve());
  const reg = registration && { waiting: null, installing: null, ...registration, update };
  Object.assign(container, { getRegistration: () => Promise.resolve(reg) });
  const reload = vi.fn();
  const run = () => applyPendingUpdate(container as unknown as ServiceWorkerContainer, reload);
  return { container, update, reload, run };
}

describe('applyPendingUpdate', () => {
  it('activates a waiting version and reloads once it takes over', async () => {
    const waiting = new FakeWorker('installed');
    const { container, reload, run } = setup({ waiting });
    expect(await run()).toBe(true);
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).not.toHaveBeenCalled();
    container.dispatchEvent(new Event('controllerchange'));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('waits for a version that is still installing', async () => {
    const installing = new FakeWorker('installing');
    const { run } = setup({ installing });
    expect(await run()).toBe(true);
    expect(installing.postMessage).not.toHaveBeenCalled();
    installing.install();
    expect(installing.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('checks for a new version, and does nothing when there is none', async () => {
    const { update, reload, run } = setup({});
    expect(await run()).toBe(false);
    expect(update).toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('does nothing without a service worker', async () => {
    expect(await setup(undefined).run()).toBe(false);
  });
});

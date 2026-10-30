import { afterEach, describe, expect, it, vi } from 'vitest';

interface Entry {
  path?: string;
  children?: Entry[];
}
const paths = (entries: Entry[]): string[] =>
  entries.flatMap((e) => [...(e.path ? [e.path] : []), ...paths(e.children ?? [])]);

async function routesFor(nodeEnv: string): Promise<string[]> {
  vi.stubEnv('NODE_ENV', nodeEnv);
  vi.resetModules();
  const routes = (await import('../../routes')).default as Entry[];
  return paths(routes);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('the review tool route (D20)', () => {
  it('exists on the dev server', async () => {
    expect(await routesFor('development')).toContain('_review');
  });

  it('is not in the production route list', async () => {
    const list = await routesFor('production');
    expect(list).not.toContain('_review');
    expect(list).toContain('app/discover');
  });
});

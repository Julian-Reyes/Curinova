import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import type * as Review from '../../tools/content-pipeline/src/review/review';
import type { ReviewAction } from '../../tools/content-pipeline/src/review/types';

export const REVIEW_API = '/__review/api';
const MAX_BODY = 1_000_000;

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('request body too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

/**
 * The review tool's file access (D20), on the dev server only (`apply: 'serve'`): JSON at
 * /__review/api/{queue,lesson,action}. The operations live in tools/content-pipeline and
 * are loaded with ssrLoadModule, because Vite loads this config with Node, which cannot
 * resolve the domain package's extensionless TypeScript imports (see content-plugin.ts).
 * They only read and write the repository's content/ directory.
 */
export function lumenReview(): Plugin {
  const repoRoot = resolve(import.meta.dirname, '../..');
  const modulePath = resolve(repoRoot, 'tools/content-pipeline/src/review/review.ts');
  return {
    name: 'lumen-review',
    apply: 'serve',
    configureServer(server) {
      const load = () => server.ssrLoadModule(modulePath) as Promise<typeof Review>;
      server.middlewares.use(REVIEW_API, (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const ctx = { repoRoot };
        const handle = async () => {
          const review = await load();
          if (req.method === 'GET' && url.pathname === '/queue') {
            send(res, 200, await review.loadQueue(ctx));
          } else if (req.method === 'GET' && url.pathname === '/lesson') {
            const lesson = await review.loadLesson(ctx, url.searchParams.get('key') ?? '');
            send(res, lesson ? 200 : 404, lesson ?? { message: 'no such lesson' });
          } else if (req.method === 'POST' && url.pathname === '/action') {
            const result = await review.runAction(ctx, (await readJson(req)) as ReviewAction);
            send(res, result.ok ? 200 : 422, result);
          } else
            send(res, 404, {
              message: `unknown review API call: ${req.method ?? ''} ${url.pathname}`,
            });
        };
        handle().catch((error: unknown) => {
          server.config.logger.error(`review API: ${String(error)}`);
          send(res, 400, { message: error instanceof Error ? error.message : String(error) });
        });
      });
    },
  };
}

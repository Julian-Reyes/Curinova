// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { BOOT_SCRIPT_ID } from '../platform/storage-keys';
import { withoutAppCode } from './site-files';

// The shape of a prerendered page (React Router 7, React 19), shortened.
const page = `<!DOCTYPE html><html lang="en"><head>
<script id="${BOOT_SCRIPT_ID}">(function(){/* theme */})();</script>
<link rel="modulepreload" href="/assets/manifest-1.js"/><link rel="modulepreload" href="/assets/root-2.js"/>
<link rel="stylesheet" href="/assets/app-3.css"/>
<script type="application/ld+json">{"@type":"LearningResource"}</script>
</head><body><main><h1>Is your skeleton alive?</h1><p>Yes.</p></main>
<script>((storageKey2, restoreKey) => {})("x", null)</script>
<script>window.__reactRouterContext = {};</script>
<script type="module" async="">import "/assets/manifest-1.js";</script>
<!--$?--><template id="B:0"></template><!--/$-->
<script id="_R_">requestAnimationFrame(function(){})</script>
<div hidden id="S:0"><script>window.__reactRouterContext.streamController.enqueue("x");</script><!--$?--><template id="B:1"></template><!--/$--></div>
<script>$RC("B:0","S:0")</script>
<div hidden id="S:1"><script>window.__reactRouterContext.streamController.close();</script></div>
<script>$RC("B:1","S:1")</script></body></html>`;

describe('public pages without the app’s code (D28)', () => {
  const out = withoutAppCode(page);

  it('keeps the content, styles, boot script and JSON-LD', () => {
    expect(out).toContain('<h1>Is your skeleton alive?</h1><p>Yes.</p>');
    expect(out).toContain('<link rel="stylesheet" href="/assets/app-3.css"/>');
    expect(out).toContain(`<script id="${BOOT_SCRIPT_ID}">`);
    expect(out).toContain('<script type="application/ld+json">');
  });

  it('removes every other script, module preload and streaming placeholder', () => {
    expect(out.match(/<script/g)).toHaveLength(2);
    expect(out).not.toContain('modulepreload');
    expect(out).not.toMatch(/template id="B:|id="S:|__reactRouterContext/);
  });

  it('refuses to leave streamed content hidden', () => {
    expect(() => withoutAppCode('<div hidden id="S:0"><p>Late content</p></div>')).toThrow(
      /stay hidden/,
    );
  });
});

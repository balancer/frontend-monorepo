import { pathToFileURL } from 'node:url'

/*
  Workaround for @sentry/nextjs >= 10.72 crashing when it is imported in a DOM
  test environment (happy-dom/jsdom).

  Its server entry eagerly loads the vendored orchestrion webpack plugin, which
  computes LOADER_PATH at module scope and picks the "browser" branch whenever a
  `document` global exists. That branch feeds document.baseURI (http://localhost)
  to fileURLToPath, so every spec that transitively imports @sentry/nextjs fails
  to load with `TypeError [ERR_INVALID_URL_SCHEME]: The URL must be of scheme file`.

  The plugin only needs a file: URL to build a loader path that is never used at
  runtime, so pointing document.currentScript at one is enough. The plugin checks
  for a SCRIPT tag before falling back to baseURI.

  Remove once Sentry ships the lazy-load fix (getsentry/sentry-javascript#23906)
  and we are on a release that includes it.
*/
if (typeof document !== 'undefined') {
  Object.defineProperty(document, 'currentScript', {
    value: { tagName: 'SCRIPT', src: pathToFileURL(import.meta.url).href },
    configurable: true,
  })
}

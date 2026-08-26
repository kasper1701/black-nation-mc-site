// ── Service worker — offline/installed app shell ────────────────────────────
// Bump CACHE_VERSION whenever you change core files so visitors get the
// fresh versions instead of a stale cached copy.
const CACHE_VERSION = "bn-mc-v1";

// Only PUBLIC, non-sensitive pages/assets are precached at install time.
// members.html is intentionally left out of this list — see the note in
// js/auth-gate.js / the chat writeup for why the vault page needs backend
// work before caching it is a good idea.
const PRECACHE_URLS = [
  "index.html",
  "about.html",
  "ranks.html",
  "rules.html",
  "404.html",
  "css/style.css",
  "js/theme.js",
  "js/transition.js",
  "js/search.js",
  "js/last-updated.js",
  "js/lightbox.js",
  "js/copy.js",
  "js/share.js",
  "manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle same-origin GET requests. Leave Supabase / CDN / anything
  // cross-origin (auth calls, jsdelivr module imports) completely alone.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // Never serve a cached copy of the vault page, or handle auth-gate.js —
  // always go to the network so login state and gated content are current.
  if (req.url.includes("members.html") || req.url.includes("auth-gate.js")) {
    event.respondWith(fetch(req));
    return;
  }

  // Network-first for everything else, falling back to cache when offline,
  // so visitors get fresh content when online and something usable when not.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

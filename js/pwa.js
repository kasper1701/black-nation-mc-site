// ── PWA registration ─────────────────────────────────────────────────────
(function () {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Fails quietly on hosts that don't serve it correctly (e.g. wrong
      // MIME type, or not served over HTTPS) — the site still works fine,
      // it just won't be installable/offline-capable.
    });
  });
})();

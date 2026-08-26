// ── Share this page ─────────────────────────────────────────────────────────
(function () {
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
  }

  function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    }
    fallbackCopy(url);
    return Promise.resolve();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("shareToggle");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const url = window.location.href;
      const title = document.title;

      // Native share sheet (mobile browsers, some desktop) — this is what
      // lets someone share straight into Discord/Messages/etc with the
      // og:title/og:description preview already attached.
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch (err) {
          // AbortError just means they cancelled the share sheet — do nothing
          if (err && err.name === "AbortError") return;
          // Otherwise fall through to clipboard copy
        }
      }

      await copyLink(url);
      btn.classList.add("copied");
      const label = btn.querySelector(".share-toggle-tip");
      setTimeout(() => btn.classList.remove("copied"), 1600);
    });
  });
})();

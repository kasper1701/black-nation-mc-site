// ── Theme toggle — Dark (default) / Light ──────────────────────────────────
// First visit: follows the visitor's OS/browser color-scheme preference.
// Once they use the toggle, that manual choice is stored and always wins
// after that — we never override an explicit choice.
(function () {
  const STORAGE_KEY = "bn-theme";

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function setStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  }

  function prefersLight() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch { return false; }
  }

  // Apply immediately (before paint) to avoid flash.
  // No stored choice yet? Follow the OS preference instead of forcing dark.
  const stored = getStored();
  applyTheme(stored || (prefersLight() ? "light" : "dark"));

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const label = btn.querySelector(".theme-toggle-label");
    const track = btn.querySelector(".theme-toggle-track");

    function syncBtn(animate) {
      const isLight = document.documentElement.hasAttribute("data-theme");
      btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
      btn.setAttribute("data-active", isLight ? "light" : "dark");
      if (label) label.textContent = isLight ? "Light" : "Dark";

      if (animate && track) {
        track.classList.remove("toggle-flash");
        void track.offsetWidth;
        track.classList.add("toggle-flash");
        setTimeout(() => track.classList.remove("toggle-flash"), 500);
      }
    }

    syncBtn(false);

    btn.addEventListener("click", () => {
      const isLight = document.documentElement.hasAttribute("data-theme");
      const next = isLight ? "dark" : "light";

      document.documentElement.classList.add("theme-transitioning");

      applyTheme(next);
      setStored(next); // explicit choice — from now on this always wins
      syncBtn(true);

      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 500);
    });

    // If the visitor never manually chose, keep following OS changes live
    // (e.g. their system flips to dark mode at sunset).
    if (!getStored() && window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => {
        if (getStored()) return;
        applyTheme(e.matches ? "light" : "dark");
        syncBtn(false);
      });
    }
  });
})();

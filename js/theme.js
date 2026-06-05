// ── Theme toggle — Dark (default) / Light ──────────────────────────────────
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

  // Apply immediately (before paint) to avoid flash
  applyTheme(getStored() || "dark");

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
        // Ripple flash on the track
        track.classList.remove("toggle-flash");
        void track.offsetWidth; // reflow
        track.classList.add("toggle-flash");
        setTimeout(() => track.classList.remove("toggle-flash"), 500);
      }
    }

    syncBtn(false);

    btn.addEventListener("click", () => {
      const isLight = document.documentElement.hasAttribute("data-theme");
      const next = isLight ? "dark" : "light";

      // Add transition class to html for smooth color/bg crossfade
      document.documentElement.classList.add("theme-transitioning");

      applyTheme(next);
      setStored(next);
      syncBtn(true);

      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 500);
    });
  });
})();

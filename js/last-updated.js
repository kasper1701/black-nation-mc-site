// ── Auto "last updated" stamp ───────────────────────────────────────────────
// Uses document.lastModified (set by the browser from the file's server
// timestamp) so the footer date updates itself whenever the page file is
// changed — no manual editing needed on every page.
//
// NOTE: this relies on the hosting server sending accurate Last-Modified
// headers / file mtimes. Some hosts (certain static hosts, some git-based
// deploys) reset file timestamps on every deploy — if the date looks wrong
// after publishing, check how your host serves the files.
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("footerUpdated");
    if (!el) return;

    const d = new Date(document.lastModified);
    if (isNaN(d.getTime())) return;

    const formatted = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    el.textContent = "Page updated: " + formatted;
  });
})();

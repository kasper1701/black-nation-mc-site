// ── Lightbox — click any .lightbox-img to view full size ───────────────────
// Images sharing a data-lightbox-group navigate together with prev/next.
(function () {
  let group = [];
  let index = 0;

  function buildOverlay() {
    if (document.getElementById("lightboxOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "lightboxOverlay";
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <img class="lightbox-image" id="lightboxImage" src="" alt="">
      <button class="lightbox-nav lightbox-next" aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="lightbox-counter" id="lightboxCounter"></div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => nav(-1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => nav(1));

    document.addEventListener("keydown", e => {
      if (!overlay.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === "ArrowRight") nav(1);
    });
  }

  function render() {
    const overlay = document.getElementById("lightboxOverlay");
    const img = document.getElementById("lightboxImage");
    const counter = document.getElementById("lightboxCounter");
    const current = group[index];
    img.src = current.src;
    img.alt = current.alt || "";
    const multi = group.length > 1;
    overlay.querySelector(".lightbox-prev").style.display = multi ? "flex" : "none";
    overlay.querySelector(".lightbox-next").style.display = multi ? "flex" : "none";
    counter.textContent = multi ? `${index + 1} / ${group.length}` : "";
    counter.style.display = multi ? "block" : "none";
  }

  function nav(dir) {
    index = (index + dir + group.length) % group.length;
    render();
  }

  function open(clickedImg) {
    buildOverlay();
    const groupName = clickedImg.getAttribute("data-lightbox-group") || "_single_";
    group = Array.from(document.querySelectorAll(`.lightbox-img[data-lightbox-group="${groupName}"]`));
    if (!group.length) group = [clickedImg];
    index = group.indexOf(clickedImg);
    if (index < 0) index = 0;
    render();
    document.getElementById("lightboxOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    const overlay = document.getElementById("lightboxOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lightbox-img").forEach(img => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => open(img));
    });
  });
})();

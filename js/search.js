// ── Site search — lightweight client-side index ────────────────────────────
// NOTE: only public page content is indexed here. Nothing behind the
// Members Vault password gate (names, numbers, roster) is included,
// so the vault stays actually private.
(function () {
  const INDEX = [
    { title: "Home", url: "index.html", desc: "Club homepage, news, and photos." },
    { title: "About — Origin Story", url: "about.html", desc: "How Black Nation MC started and what the club stands for." },
    { title: "What We Stand For", url: "about.html", desc: "Club values — keep the circle tight, protect the name." },
    { title: "Ranks — Rank Structure", url: "ranks.html", desc: "Full chain of command from President down to Prospects." },
    { title: "President", url: "ranks.html", desc: "Top rank. Final say on all club matters." },
    { title: "Vice President", url: "ranks.html", desc: "Second in command, runs the club when the President is unavailable." },
    { title: "Sergeant At Arms", url: "ranks.html", desc: "Handles security and discipline." },
    { title: "Treasurer", url: "ranks.html", desc: "Manages club money, supplies, and assets." },
    { title: "Road Captain", url: "ranks.html", desc: "Organizes rides and convoys." },
    { title: "Life Members", url: "ranks.html", desc: "Earned through years of loyalty and service." },
    { title: "Members & Prospects", url: "ranks.html", desc: "Patched members and trial prospects." },
    { title: "Path To The Patch", url: "ranks.html", desc: "The steps from prospect to patched member." },
    { title: "Rules — Club Rules", url: "rules.html", desc: "Brotherhood, loyalty, and respect — the three pillars." },
    { title: "General Rules", url: "rules.html", desc: "Chain of command, meetings, patch etiquette." },
    { title: "Prospect Rules", url: "rules.html", desc: "What's expected of prospects." },
    { title: "Criminal Activity Rules", url: "rules.html", desc: "RP reasoning, wars, and conflict approval." },
    { title: "Motorcycle Rules", url: "rules.html", desc: "Riding, convoys, and formation." },
    { title: "Communication Rules", url: "rules.html", desc: "Keeping club info private." },
    { title: "Punishments", url: "rules.html", desc: "Minor and major punishment tiers." },
    { title: "Members Vault", url: "members.html", desc: "Members-only area — access code required." },
  ];

  function normalize(s) {
    return s.toLowerCase();
  }

  function search(query) {
    const q = normalize(query.trim());
    if (!q) return [];
    return INDEX.filter(item =>
      normalize(item.title).includes(q) || normalize(item.desc).includes(q)
    ).slice(0, 8);
  }

  function render(results) {
    const box = document.getElementById("siteSearchResults");
    if (!box) return;
    if (!results.length) {
      box.innerHTML = '<p class="site-search-empty">No matches. Try a different word.</p>';
      return;
    }
    box.innerHTML = results.map(r => `
      <a class="site-search-result" href="${r.url}">
        <span class="site-search-result-title">${r.title}</span>
        <span class="site-search-result-desc">${r.desc}</span>
      </a>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("searchToggle");
    const overlay = document.getElementById("searchOverlay");
    const closeBtn = document.getElementById("searchClose");
    const input = document.getElementById("siteSearchInput");
    if (!toggle || !overlay || !input) return;

    function open() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(() => input.focus(), 50);
      render(search(""));
    }
    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      input.value = "";
    }

    toggle.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    input.addEventListener("input", () => render(search(input.value)));

    // Land on first result with Enter
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const first = document.querySelector(".site-search-result");
        if (first) window.location = first.getAttribute("href");
      }
    });
  });
})();

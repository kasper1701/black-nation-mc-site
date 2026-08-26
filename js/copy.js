// ── Copy phone number buttons ───────────────────────────────────────────────
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

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  function flash(btn) {
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 1400);
  }

  // Grid member cards — build a copy button next to each phone number,
  // skipping placeholder values like "WIP".
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".member-phone-row").forEach(row => {
      const p = row.querySelector(".member-phone");
      if (!p) return;
      const number = p.textContent.trim();
      if (!number || number.toUpperCase() === "WIP") return;

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.setAttribute("aria-label", "Copy phone number");
      btn.innerHTML = `
        <svg class="copy-icon-copy" viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M4 13V4.5A1.5 1.5 0 0 1 5.5 3H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <svg class="copy-icon-check" viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      `;
      btn.addEventListener("click", () => {
        copy(number);
        flash(btn);
      });
      row.appendChild(btn);
    });

    // Member viewer carousel — single static button, content updates on profile change
    const mvBtn = document.getElementById("mvPhoneCopy");
    const mvPhone = document.getElementById("rank-phone");
    if (mvBtn && mvPhone) {
      mvBtn.addEventListener("click", () => {
        const number = mvPhone.textContent.trim();
        if (!number || number.toUpperCase() === "WIP") return;
        copy(number);
        flash(mvBtn);
      });
    }
  });

  // Expose so vault.js can grey the button out when a profile's phone is WIP
  window.__updateCopyBtnState = function (btn, number) {
    if (!btn) return;
    const disabled = !number || number.toUpperCase() === "WIP";
    btn.classList.toggle("copy-btn--disabled", disabled);
    btn.disabled = disabled;
  };
})();

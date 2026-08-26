// ── Member Viewer carousel ──────────────────────────────────────────────
// Password-gate logic has been removed — access to the vault is now
// controlled by real Supabase accounts (see js/auth-gate.js). This file
// only handles the rank/profile carousel shown once inside the vault.

const rankProfiles = [
  { pfp: "pfp1.png",  name: "Daquavion Rangateti",   role: "President",      phone: "022 764 0431" },
  { pfp: "pfp2.png",  name: "Denero Rangateti",      role: "Vice President", phone: "021 344 0513" },
  { pfp: "pfp3.png",  name: "Weston Kopara",         role: "SGT of Arms",    phone: "027 714 2738" },
  { pfp: "pfp4.png",  name: "Danehura Rangateti",    role: "Treasurer",      phone: "022 990 0359" },
  { pfp: "pfp5.png",  name: "Rangi Tatoe",           role: "Road Captain",   phone: "021 148 2254" },
  { pfp: "pfp6.png",  name: "Queenie Rangateti",     role: "Queen",          phone: "022 990 0359" },
  { pfp: "pfp7.png",  name: "Tama TeRangi",          role: "Life Member",    phone: "022 708 7922" },
  { pfp: "pfp8.png",  name: "Wiremu Terangi",        role: "Hangi",          phone: "WIP" },
  { pfp: "pfp9.png",  name: "Zephyr Lafaungi",       role: "Hangi",          phone: "WIP" }
];

let rankIndex = 0;
let animating  = false;

function buildDots() {
  const row = document.getElementById("mvDotsRow");
  if (!row) return;
  row.innerHTML = "";
  rankProfiles.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "mv-dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Profile " + (i + 1));
    d.addEventListener("click", () => { if (!animating) jumpProfile(i); });
    row.appendChild(d);
  });
  document.getElementById("mvTotal").textContent = rankProfiles.length;
}

function jumpProfile(i) {
  const dir = i > rankIndex ? "left" : "right";
  rankIndex = i;
  animateCard(dir);
}

// Direction-aware slide transition
function animateCard(dir) {
  if (animating) return;
  animating = true;
  const card = document.getElementById("mvCard");
  const outClass = dir === "left" ? "slide-out-left" : "slide-out-right";
  const inClass  = dir === "left" ? "slide-in-left"  : "slide-in-right";
  card.classList.add(outClass);
  setTimeout(() => {
    card.classList.remove(outClass);
    _applyProfile();
    card.classList.add(inClass);
    const onEnd = () => {
      card.classList.remove(inClass);
      animating = false;
      card.removeEventListener("animationend", onEnd);
    };
    card.addEventListener("animationend", onEnd);
  }, 220);
}

function _applyProfile() {
  const p = rankProfiles[rankIndex];
  document.getElementById("rank-pfp").src            = "assets/images/" + p.pfp;
  document.getElementById("rank-name").innerHTML     = "<b>" + p.name + "</b>";
  document.getElementById("rank-role").textContent   = p.role;
  document.getElementById("rank-phone").textContent  = p.phone;
  document.getElementById("mv-badge").textContent    = p.role.toUpperCase();
  document.getElementById("mvPatchNum").textContent  = "#" + String(rankIndex + 1).padStart(3, "0");
  document.getElementById("mvCurrent").textContent   = rankIndex + 1;
  // Progress bar
  document.getElementById("mvProgress").style.width =
    ((rankIndex + 1) / rankProfiles.length * 100) + "%";
  // Dots
  document.querySelectorAll(".mv-dot").forEach((d, i) =>
    d.classList.toggle("active", i === rankIndex)
  );
  // Copy button — grey out for placeholder ("WIP") numbers
  if (window.__updateCopyBtnState) {
    window.__updateCopyBtnState(document.getElementById("mvPhoneCopy"), p.phone);
  }
}

function updateRankViewer() { _applyProfile(); }

function nextProfile() {
  if (animating) return;
  rankIndex = (rankIndex + 1) % rankProfiles.length;
  animateCard("left");
}
function prevProfile() {
  if (animating) return;
  rankIndex = (rankIndex - 1 + rankProfiles.length) % rankProfiles.length;
  animateCard("right");
}

// Touch / swipe support on the card
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("mvCard");
  if (!card) return;
  let startX = 0;
  card.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) dx < 0 ? nextProfile() : prevProfile();
  }, { passive: true });
});

// Exposed so members.html's auth-gate script can call these once
// a logged-in session is confirmed
window.updateRankViewer = updateRankViewer;
window.buildDots        = buildDots;
window.nextProfile      = nextProfile;
window.prevProfile      = prevProfile;
window.jumpProfile      = jumpProfile;

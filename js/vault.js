// Password stored as SHA-256 hash — plain text never in this file
const _h = "41e56c6355e62dd12595d8836db729dbedda31d6e02fcc598dd5a0a71babe9c7";

async function _sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Sync dot indicators with input length
function vaultDotSync(val) {
  document.querySelectorAll('.vd').forEach((d, i) => {
    d.classList.toggle('filled', i < val.length);
  });
}

async function unlock() {
  const pass  = document.getElementById("pass");
  const msg   = document.getElementById("msg");
  const gate  = document.getElementById("gate");
  const vault = document.getElementById("vault");
  const wrap  = document.querySelector(".vault-gate-wrap");

  const inputHash = await _sha256(pass.value);

  if (inputHash === _h) {
    msg.innerText = "ACCESS GRANTED";
    msg.style.color = "lime";
    wrap.classList.add("granted");
    setTimeout(() => {
      gate.style.display  = "none";
      vault.style.display = "block";
      vault.classList.add("visible");
      updateRankViewer();
      buildDots();
    }, 460);
  } else {
    msg.innerText = "INCORRECT CODE";
    msg.style.color = "#ff4444";
    wrap.classList.add("denied");
    document.querySelectorAll('.vd').forEach(d => d.classList.remove('filled'));
    pass.value = "";
    setTimeout(() => wrap.classList.remove("denied"), 420);
  }
}

// Enter key support
document.addEventListener("DOMContentLoaded", () => {
  const p = document.getElementById("pass");
  if (p) p.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });
});

const rankProfiles = [
  { pfp: "pfp1.png",  name: "Daquavion Rangateti",  role: "President",      phone: "022 764 0431" },
  { pfp: "pfp2.png",  name: "Denero Rangateti",      role: "Vice President", phone: "021 344 0513" },
  { pfp: "pfp3.png",  name: "Weston Kopara",         role: "SGT of Arms",    phone: "027 714 2738" },
  { pfp: "pfp4.png",  name: "Danehura Rangateti",    role: "Treasurer",      phone: "022 990 0359" },
  { pfp: "pfp5.png",  name: "Rangi Tatoe",           role: "Road Captain",   phone: "021 148 2254" },
  { pfp: "pfp6.png",  name: "Queenie Rangateti",     role: "Queen",          phone: "022 990 0359" },
  { pfp: "pfp7.png",  name: "Tama TeRangi",          role: "Life Member",    phone: "022 708 7922" }
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

window.unlock       = unlock;
window.vaultDotSync = vaultDotSync;
window.nextProfile  = nextProfile;
window.prevProfile  = prevProfile;
window.jumpProfile  = jumpProfile;

// ── Vault password verification ─────────────────────────────────────────────
// Uses salted PBKDF2 (250,000 iterations) instead of a single SHA-256 pass.
// This does NOT make the vault unhackable — the check still runs in the
// browser, so anyone can read this file. What it does do is make every
// single guess (online or offline, scripted or manual) computationally
// expensive instead of instant, and the salt stops precomputed hash-lookup
// tables from working. Real protection against a determined attacker
// requires server-side auth; see the note at the bottom of this file.
//
// To set or change the password, open generate-credentials.html (included
// alongside this file), type the new password, and paste the SALT_HEX and
// HASH_HEX it gives you in below. Never put the plain password itself here.

const SALT_HEX   = "30b1e2df4bc13bb77031639940e17b2c";
const HASH_HEX   = "5b17268c329ecacd19765168df4a04574fa708952b70f11c120a11a019857f09";
const ITERATIONS = 250000;

function _hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}
function _bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function _deriveHash(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: _hexToBytes(SALT_HEX), iterations: ITERATIONS },
    keyMaterial, 256
  );
  return _bytesToHex(new Uint8Array(bits));
}

// ── Lockout with exponential backoff ────────────────────────────────────────
// Deters casual repeated guessing through the on-page UI. It lives in
// localStorage, so it's easy for a technical visitor to clear — it's a
// speed bump for typical use, not a hard barrier.
const LOCK_KEY = "bn-vault-lock";

function _getLockState() {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 };
  } catch { return { fails: 0, until: 0 }; }
}
function _setLockState(state) {
  try { localStorage.setItem(LOCK_KEY, JSON.stringify(state)); } catch {}
}
function _backoffMs(fails) {
  if (fails < 3)  return 0;
  if (fails < 5)  return 5000;
  if (fails < 8)  return 30000;
  if (fails < 12) return 120000;
  return 600000; // capped at 10 minutes
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

  const lock = _getLockState();
  const now = Date.now();
  if (lock.until > now) {
    const secs = Math.ceil((lock.until - now) / 1000);
    msg.innerText = `TOO MANY ATTEMPTS — WAIT ${secs}s`;
    msg.style.color = "#ff4444";
    wrap.classList.add("denied");
    setTimeout(() => wrap.classList.remove("denied"), 420);
    return;
  }

  const inputHash = await _deriveHash(pass.value);

  if (inputHash === HASH_HEX) {
    _setLockState({ fails: 0, until: 0 });
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
    const fails = lock.fails + 1;
    const wait = _backoffMs(fails);
    _setLockState({ fails, until: wait ? now + wait : 0 });

    msg.innerText = wait ? `INCORRECT CODE — LOCKED ${Math.ceil(wait / 1000)}s` : "INCORRECT CODE";
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

window.unlock       = unlock;
window.vaultDotSync = vaultDotSync;
window.nextProfile  = nextProfile;
window.prevProfile  = prevProfile;
window.jumpProfile  = jumpProfile;

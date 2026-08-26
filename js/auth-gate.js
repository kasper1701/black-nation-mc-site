// ── Members Vault access control ────────────────────────────────────────
// Anyone can sign in with Discord and browse the normal site. This page
// (the Vault) only unlocks for accounts that hold DISCORD_VAULT_ROLE_ID
// in DISCORD_GUILD_ID. Everyone else — signed out, or signed in without
// the role — sees a locked gate instead.
//
// HOW THE ROLE CHECK WORKS
// Supabase only gives us the Discord "provider_token" once, right when
// someone lands back here from Discord's sign-in screen. We use that
// token immediately to ask Discord "does this person have the role?",
// then cache the yes/no answer in this browser (keyed to their user id)
// so they don't need to re-authorize on every visit. If that cache is
// ever missing (new device, cleared storage, or it's just stale) we send
// them through Discord sign-in again to get a fresh token and re-check.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";
import { DISCORD_GUILD_ID, DISCORD_VAULT_ROLE_ID } from "./discord-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gate = document.getElementById("gate");
const vault = document.getElementById("vault");
const gateTitle = document.getElementById("gateTitle");
const gateSub = document.getElementById("gateSub");
const gateActions = document.getElementById("gateActions");

const CACHE_KEY = "bn-vault-role";

function readCache(userId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!parsed || parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(userId, hasRole) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ userId, hasRole, checkedAt: Date.now() })
    );
  } catch {
    /* private browsing / storage disabled — role just re-checks every visit */
  }
}

async function checkDiscordRole(providerToken) {
  try {
    const res = await fetch(
      `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );
    if (!res.ok) return false; // not in the server, expired token, etc.
    const member = await res.json();
    return Array.isArray(member.roles) && member.roles.includes(DISCORD_VAULT_ROLE_ID);
  } catch {
    return false;
  }
}

async function signInWithDiscord() {
  await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      scopes: "identify guilds.members.read",
      redirectTo: window.location.origin + "/members.html",
    },
  });
}

function showSignedOut() {
  gate.style.display = "block";
  vault.style.display = "none";
  if (gateTitle) gateTitle.textContent = "MEMBERS VAULT";
  if (gateSub) gateSub.textContent = "Sign in with Discord to check your access.";
  if (gateActions) {
    gateActions.innerHTML = `<button id="discordSignInBtn" class="btn-primary" type="button">Sign in with Discord</button>`;
    document
      .getElementById("discordSignInBtn")
      .addEventListener("click", signInWithDiscord);
  }
}

function showNoRole() {
  gate.style.display = "block";
  vault.style.display = "none";
  if (gateTitle) gateTitle.textContent = "ACCESS DENIED";
  if (gateSub)
    gateSub.textContent =
      "You're signed in, but your Discord account doesn't have the role needed to view the Vault.";
  if (gateActions) {
    gateActions.innerHTML = `<button id="vaultRecheckBtn" class="btn-primary" type="button">Re-check with Discord</button>
      <button id="vaultSignOutBtn" class="btn-ghost" type="button">Log Out</button>`;
    document
      .getElementById("vaultRecheckBtn")
      .addEventListener("click", signInWithDiscord);
    document
      .getElementById("vaultSignOutBtn")
      .addEventListener("click", async () => {
        await supabase.auth.signOut();
        localStorage.removeItem(CACHE_KEY);
        window.location.reload();
      });
  }
}

async function showVault(session) {
  gate.style.display = "none";
  vault.style.display = "block";
  vault.classList.add("visible");

  const nameEl = document.getElementById("vaultWelcomeName");
  if (nameEl) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("ic_name")
      .eq("id", session.user.id)
      .maybeSingle();
    nameEl.textContent =
      profile?.ic_name ||
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.custom_claims?.global_name ||
      "member";
  }

  if (window.updateRankViewer) window.updateRankViewer();
  if (window.buildDots) window.buildDots();
}

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  showSignedOut();
} else if (session.provider_token) {
  // Just landed here from Discord — verify live and cache the result.
  const hasRole = await checkDiscordRole(session.provider_token);
  writeCache(session.user.id, hasRole);
  hasRole ? showVault(session) : showNoRole();
} else {
  const cached = readCache(session.user.id);
  if (cached) {
    cached.hasRole ? showVault(session) : showNoRole();
  } else {
    // No fresh token, nothing cached — need a fresh Discord round-trip.
    showSignedOut();
  }
}

document.getElementById("vaultLogoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem(CACHE_KEY);
  window.location.reload();
});

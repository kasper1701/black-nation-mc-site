// ── Site-wide sign-in gate ──────────────────────────────────────────────
// The first thing anyone sees on any page is a full-screen "Sign in with
// Discord" entry screen (backed by discordbg.jpg) — nothing else on the
// site renders until they click through and sign in. The extra role
// check for the Members Vault happens separately, in auth-gate.js, only
// on members.html.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gate = document.getElementById("siteGate");
const main = document.getElementById("siteMain");
const gateTitle = gate?.querySelector(".vault-gate-title");
const gateSub = gate?.querySelector(".vault-gate-sub");
const gateBtn = document.getElementById("siteGateSignInBtn");

async function signInWithDiscord() {
  if (gateBtn) {
    gateBtn.disabled = true;
    gateBtn.querySelector("span") && (gateBtn.querySelector("span").textContent = "Redirecting…");
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      // "guilds.members.read" is what lets us check server roles after
      // sign-in — no bot required, this uses the person's own token.
      scopes: "identify guilds.members.read",
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  // If this fires, the redirect to Discord never even happened —
  // almost always means Discord isn't enabled/saved in Supabase yet.
  if (error) {
    showError(
      "Couldn't start Discord sign-in: " + error.message,
      "Check that Discord is enabled under Supabase → Authentication → Providers, with the Client ID/Secret saved."
    );
  }
}

function showError(title, sub) {
  if (gate) gate.style.display = "flex";
  if (main) main.style.display = "none";
  if (gateTitle) gateTitle.textContent = "SIGN-IN FAILED";
  if (gateSub) gateSub.textContent = title + (sub ? " — " + sub : "");
  if (gateBtn) {
    gateBtn.disabled = false;
    const span = gateBtn.querySelector("span");
    if (span) span.textContent = "Try Again";
  }
}

// Supabase appends error details to the URL (as a query string or a
// hash fragment) when the Discord round-trip fails or is cancelled —
// e.g. ?error=server_error&error_description=... We check both so a
// failed attempt shows a real message instead of just looking stuck.
function readOAuthError() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const err = params.get("error") || hashParams.get("error");
  const desc =
    params.get("error_description") || hashParams.get("error_description");
  return err ? { err, desc } : null;
}

const oauthError = readOAuthError();

const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  if (gate) gate.style.display = "none";
  if (main) main.style.display = "";
} else if (oauthError) {
  showError(
    oauthError.desc || oauthError.err,
    "If this keeps happening, double-check the Redirect URI in Discord's OAuth2 settings matches Supabase's callback URL exactly."
  );
} else {
  if (gate) gate.style.display = "flex";
  if (main) main.style.display = "none";
}

gateBtn?.addEventListener("click", signInWithDiscord);

// Keep the whole site in sync if someone signs in/out in another tab.
supabase.auth.onAuthStateChange((_event, newSession) => {
  if (newSession && gate && gate.style.display !== "none") {
    window.location.reload();
  }
  if (!newSession && main && main.style.display !== "none") {
    window.location.reload();
  }
});

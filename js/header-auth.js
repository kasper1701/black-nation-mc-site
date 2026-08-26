// ── Header login/profile icon ───────────────────────────────────────────
// Signed out: clicking the icon goes STRAIGHT to Discord's sign-in screen
// (no separate login page anymore). Signed in: the icon links to the
// Members Vault. Runs on every page that includes it.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const btn = document.getElementById("authToggle");

async function signInWithDiscord() {
  await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      // "guilds.members.read" is what lets us check server roles after
      // sign-in — no bot required, this uses the person's own token.
      scopes: "identify guilds.members.read",
      redirectTo: window.location.origin + "/members.html",
    },
  });
}

if (btn) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    btn.href = "members.html";
    btn.setAttribute("aria-label", "My Account");
    btn.classList.add("logged-in");
  } else {
    btn.removeAttribute("href");
    btn.style.cursor = "pointer";
    btn.setAttribute("aria-label", "Sign in with Discord");
    btn.classList.remove("logged-in");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      signInWithDiscord();
    });
  }
}

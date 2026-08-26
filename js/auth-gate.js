// ── Members Vault access control ────────────────────────────────────────
// Replaces the old shared-password gate. Access is now controlled by
// real Supabase accounts: only someone who signed up with a valid,
// unused Member ID can log in and see this page's content.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gate  = document.getElementById("gate");
const vault = document.getElementById("vault");

const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Not logged in — leave the gate showing (it now just links to
  // login.html / signup.html instead of asking for a password).
  gate.style.display  = "block";
  vault.style.display = "none";
} else {
  // Logged in — pull their profile info for the welcome line, then reveal the vault.
  const { data: profile } = await supabase
    .from("profiles")
    .select("ic_name, discord_username")
    .eq("id", session.user.id)
    .single();

  const nameEl = document.getElementById("vaultWelcomeName");
  if (nameEl) nameEl.textContent = profile?.ic_name || session.user.email;

  gate.style.display  = "none";
  vault.style.display = "block";
  vault.classList.add("visible");

  if (window.updateRankViewer) window.updateRankViewer();
  if (window.buildDots) window.buildDots();
}

document.getElementById("vaultLogoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

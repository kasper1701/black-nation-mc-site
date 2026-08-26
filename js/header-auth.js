// ── Header login/profile icon ───────────────────────────────────────────
// Shows a "log in" icon when signed out, or a "my account" icon (linking
// to the vault) when signed in. Runs on every page that includes it.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const btn = document.getElementById("authToggle");

if (btn) {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    btn.href = "members.html";
    btn.setAttribute("aria-label", "My Account");
    btn.classList.add("logged-in");
  } else {
    btn.href = "login.html";
    btn.setAttribute("aria-label", "Log In");
    btn.classList.remove("logged-in");
  }
}

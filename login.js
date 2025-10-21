import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://tvhunlkpuekapgkkgtkf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aHVubGtwdWVrYXBna2tndGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NjU5NTcsImV4cCI6MjA3NjU0MTk1N30.cYBUGbWPosqKl7ecg2MwDOxsRSh3JGbo_7cCJ1ErRAQ";
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Invalid login credentials: " + error.message);
    console.error(error);
    return;
  }

  // Store the session
  localStorage.setItem("sb-token", data.session.access_token);
  window.location.href = "admin.html";
});

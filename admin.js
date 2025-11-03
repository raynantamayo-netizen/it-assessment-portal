import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL = "https://tvhunlkpuekapgkkgtkf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aHVubGtwdWVrYXBna2tndGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NjU5NTcsImV4cCI6MjA3NjU0MTk1N30.cYBUGbWPosqKl7ecg2MwDOxsRSh3JGbo_7cCJ1ErRAQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Admin.js loaded");

(async () => {
  const { data, error } = await supabase
    .from("assessments")
    .select("*");

  if (error) {
    console.error("Supabase fetch error:", error);
  } else {
    console.log("Fetched data from Supabase:", data);
  }
})();

// Protect admin access
(async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    window.location.href = "login.html";
  }
})();

// ✅ Logout button handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
}

// Fetch assessments
async function loadAssessments() {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error loading data:", error);
    return;
  }

  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.full_name}</td>
      <td>${row.email}</td>
      <td>${row.assessment_date || "-"}</td>
      <td>${row.operating_system || "-"}</td>
      <td>${row.internet_provider || "-"}</td>
      <td>
        <select class="status">
          <option ${row.status === "Passed" ? "selected" : ""}>Passed</option>
          <option ${row.status === "Failed" ? "selected" : ""}>Failed</option>
        </select>
      </td>
      <td>
        <select class="summary">
          <option ${row.summary === "All good" ? "selected" : ""}>All good</option>
          <option ${row.summary === "Okay to proceed, but please upgrade your internet" ? "selected" : ""}>Okay to proceed, but please upgrade your internet</option>
          <option ${row.summary === "Computer specification is below minimum requirement" ? "selected" : ""}>Computer specification is below minimum requirement</option>
          <option ${row.summary === "Internet speed is below minimum requirements" ? "selected" : ""}>Internet speed is below minimum requirements</option>
          <option ${row.summary === "Computer and internet did not meet our minimum requirements" ? "selected" : ""}>Computer and internet did not meet our minimum requirements</option>
        </select>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

loadAssessments();


import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// 🔧 Replace with your own Supabase credentials
const supabaseUrl = 'https://tvhunlkpuekapgkkgtkf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aHVubGtwdWVrYXBna2tndGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NjU5NTcsImV4cCI6MjA3NjU0MTk1N30.cYBUGbWPosqKl7ecg2MwDOxsRSh3JGbo_7cCJ1ErRAQ'
const supabase = createClient(supabaseUrl, supabaseKey)

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const errorMessage = document.getElementById('error-message')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error(error)
    errorMessage.textContent = "Invalid login credentials. Please try again."
  } else {
    console.log('Login successful:', data)
    window.location.href = 'admin.html'
  }
})
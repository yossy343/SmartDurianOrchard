import { supabase } from './supabase.js';

export async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = './login.html';
    return null;
  }
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = './login.html';
}

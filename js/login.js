import { supabase } from './supabase.js';

const form = document.getElementById('login-form');
const message = document.getElementById('login-message');

const { data: { session } } = await supabase.auth.getSession();
if (session) window.location.href = './dashboard.html';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = 'กำลังเข้าสู่ระบบ...';
  message.className = 'form-message';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    message.textContent = 'เข้าสู่ระบบไม่สำเร็จ: ' + error.message;
    return;
  }
  message.textContent = 'เข้าสู่ระบบสำเร็จ';
  message.classList.add('success');
  window.location.href = './dashboard.html';
});

import { requireAuth, signOut } from './auth.js';

const navigation = [
  { href: 'dashboard.html', icon: '▦', label: 'Dashboard' },
  { href: 'orchard.html', icon: '⌖', label: 'Orchard' },
  { href: 'monitoring.html', icon: '⌁', label: 'Monitoring' },
  { href: 'water-management.html', icon: '◉', label: 'Water Management' },
  { href: 'ai-intelligence.html', icon: '✧', label: 'AI Intelligence' }
];

export async function initPage() {
  const session = await requireAuth();
  if (!session) return null;

  const current = location.pathname.split('/').pop();
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
      <div class="brand"><div class="brand-mark">SO</div><div><strong>Smart Orchard</strong><small>Farm Management</small></div></div>
      <div class="nav-label">MAIN MENU</div>
      ${navigation.map(item => `<a class="nav-link ${current === item.href ? 'active' : ''}" href="${item.href}"><span>${item.icon}</span><span>${item.label}</span></a>`).join('')}
      <div class="sidebar-footer">Smart Orchard Project<br>Supabase Connected</div>`;
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.className = 'topbar';
    const email = session.user.email || 'ผู้ใช้งาน';
    topbar.innerHTML = `<div class="topbar-title">Smart Orchard Management</div><div class="topbar-user"><span>${email}</span><button id="logout-btn" class="logout-btn">ออกจากระบบ</button></div>`;
    document.getElementById('logout-btn').addEventListener('click', signOut);
  }
  return session;
}

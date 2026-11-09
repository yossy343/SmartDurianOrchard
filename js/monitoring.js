import { supabase } from './supabase.js';
import { initPage } from './common.js';

const session = await initPage();
if (session) loadMonitoring();

async function loadMonitoring() {
  const tbody = document.getElementById('monitoring-table');
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('device_id, soil_moisture, soil_ec, soil_ph, soil_temperature, air_temperature, air_humidity, recorded_at, devices(device_name, device_code)')
    .order('recorded_at', { ascending: false })
    .limit(100);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">${escapeHtml(error.message)}</td></tr>`;
    return;
  }
  const latestByNode = new Map();
  for (const row of (data || [])) if (!latestByNode.has(row.device_id)) latestByNode.set(row.device_id, row);
  const rows = [...latestByNode.values()];
  tbody.innerHTML = rows.length ? rows.map(r => `<tr>
    <td>${escapeHtml(r.devices?.device_code || r.device_id.slice(0,8))}</td>
    <td>${fmt(r.soil_moisture)}</td><td>${fmt(r.soil_ec)}</td><td>${fmt(r.soil_ph)}</td>
    <td>${fmt(r.soil_temperature)}</td><td>${fmt(r.air_temperature)}</td><td>${fmt(r.air_humidity)}</td>
    <td>${new Date(r.recorded_at).toLocaleString('th-TH')}</td></tr>`).join('')
    : '<tr><td colspan="8" class="empty">ยังไม่มีข้อมูล Sensor</td></tr>';
}
function fmt(v) { return v == null ? '—' : Number(v).toFixed(1); }
function escapeHtml(v) { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

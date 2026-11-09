import { supabase } from './supabase.js';
import { initPage } from './common.js';

const session = await initPage();
if (session) loadDashboard();

async function loadDashboard() {
  const message = document.getElementById('page-message');
  try {
    const { count: plotCount } = await supabase.from('plots').select('*', { count: 'exact', head: true });
    const { count: nodeCount } = await supabase.from('devices').select('*', { count: 'exact', head: true }).eq('device_type', 'node');
    document.getElementById('plot-count').textContent = plotCount ?? '—';
    document.getElementById('node-count').textContent = nodeCount ?? '—';

    // อ่านรายการล่าสุด แล้วเลือก record ล่าสุดของแต่ละ Node ใน Browser
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('device_id, soil_moisture, air_temperature, air_humidity, recorded_at, devices(device_name, device_code)')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const latestByNode = new Map();
    for (const row of (data || [])) {
      if (!latestByNode.has(row.device_id)) latestByNode.set(row.device_id, row);
    }
    const latest = [...latestByNode.values()];
    document.getElementById('reading-count').textContent = data?.length ?? 0;
    const temps = latest.map(x => Number(x.air_temperature)).filter(Number.isFinite);
    document.getElementById('avg-temp').textContent = temps.length ? (temps.reduce((a,b)=>a+b,0)/temps.length).toFixed(1) : '—';

    const tbody = document.getElementById('latest-readings');
    tbody.innerHTML = latest.length ? latest.map(row => `
      <tr>
        <td>${row.devices?.device_code || row.device_id.slice(0,8)}</td>
        <td>${fmt(row.soil_moisture)}%</td>
        <td>${fmt(row.air_temperature)} °C</td>
        <td>${fmt(row.air_humidity)}%</td>
        <td>${new Date(row.recorded_at).toLocaleString('th-TH')}</td>
      </tr>`).join('') : '<tr><td colspan="5" class="empty">ยังไม่มีข้อมูล Sensor</td></tr>';
  } catch (error) {
    message.textContent = 'โหลดข้อมูลไม่สำเร็จ: ' + error.message;
  }
}
function fmt(value) { return value == null ? '—' : Number(value).toFixed(1); }

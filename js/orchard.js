
import { initPage } from './common.js';
import { supabase } from './supabase.js';

await initPage();

// =====================================
// ตั้งค่า Google Maps API Key ตรงนี้
// =====================================
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// สีประจำแปลง
const plotColors = [
  '#28a745',
  '#2676db',
  '#f39c32'
];

let map;
let polygons = [];
let plotData = [];
let selectedPlotId = null;

// =====================================
// โหลด Google Maps
// =====================================
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {

    if (window.google?.maps?.geometry) {
      resolve();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY ||
        GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      reject(new Error('กรุณากำหนด Google Maps API Key'));
      return;
    }

    window.initOrchardMap = resolve;

    const script = document.createElement('script');

    script.src =
      'https://maps.googleapis.com/maps/api/js?key=' +
      encodeURIComponent(GOOGLE_MAPS_API_KEY) +
      '&callback=initOrchardMap&libraries=geometry&v=weekly';

    script.async = true;
    script.defer = true;

    script.onerror = () => {
      reject(new Error('ไม่สามารถโหลด Google Maps ได้'));
    };

    document.head.appendChild(script);
  });
}

// =====================================
// เริ่มต้นแผนที่
// =====================================
function createMap() {
  map = new google.maps.Map(
    document.getElementById('orchard-map'),
    {
      center: { lat: 6.7010, lng: 101.0163 },
      zoom: 17,
      mapTypeId: 'satellite',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    }
  );
}

// =====================================
// แปลง GeoJSON เป็น Polygon
// รองรับ Polygon และ MultiPolygon
// =====================================
function getPolygonGroups(boundary) {
  if (!boundary) return [];

  const geometry =
    boundary.type === 'Feature'
      ? boundary.geometry
      : boundary;

  if (!geometry || !geometry.coordinates) return [];

  if (geometry.type === 'Polygon') {
    return [geometry.coordinates];
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates;
  }

  return [];
}

// =====================================
// คำนวณพื้นที่จากพิกัดจริง
// =====================================
function calculateArea(groups) {
  let totalSquareMeters = 0;

  groups.forEach(rings => {
    rings.forEach((ring, index) => {

      const path = ring.map(coord => ({
        lat: Number(coord[1]),
        lng: Number(coord[0])
      }));

      const area =
        google.maps.geometry.spherical.computeArea(path);

      // วงรอบแรกเป็นพื้นที่ด้านนอก
      // วงรอบถัดไปเป็นพื้นที่รูด้านใน
      totalSquareMeters += index === 0 ? area : -area;
    });
  });

  return Math.max(0, totalSquareMeters);
}

// =====================================
// วาดขอบเขตแปลง
// =====================================
function drawPlots() {
  const bounds = new google.maps.LatLngBounds();

  plotData.forEach((plot, index) => {

    const groups = getPolygonGroups(plot.boundary);

    plot.calculatedArea = calculateArea(groups);

    groups.forEach(rings => {

      const paths = rings.map(ring =>
        ring.map(coord => {
          const position = {
            lat: Number(coord[1]),
            lng: Number(coord[0])
          };

          bounds.extend(position);
          return position;
        })
      );

      const polygon = new google.maps.Polygon({
        paths,
        strokeColor: plotColors[index % plotColors.length],
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: plotColors[index % plotColors.length],
        fillOpacity: 0.25,
        map
      });

      polygon.plotId = plot.id;

      polygon.addListener('click', () => {
        selectPlot(plot.id);
      });

      polygons.push(polygon);
    });
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  }
}

// =====================================
// แสดงพื้นที่
// =====================================
function formatArea(squareMeters) {
  if (!Number.isFinite(squareMeters)) return '-';

  const rai = squareMeters / 1600;

  return `${rai.toFixed(3)} ไร่ (${squareMeters.toFixed(1)} ตร.ม.)`;
}

// =====================================
// สร้างตารางแปลง
// =====================================
function renderPlotTable() {
  const tbody = document.getElementById('plots-table');

  tbody.innerHTML = '';

  plotData.forEach((plot, index) => {

    const area = plot.calculatedArea || 0;

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'plot-name-btn';
    button.textContent = plot.plot_name;

    button.addEventListener('click', () => {
      selectPlot(plot.id);
    });

    nameCell.appendChild(button);

    const varietyCell = document.createElement('td');
    varietyCell.textContent = plot.variety || '-';

    const treeCell = document.createElement('td');
    treeCell.textContent = plot.tree_count ?? '-';

    const areaCell = document.createElement('td');
    areaCell.textContent = formatArea(area);

    row.append(
      nameCell,
      varietyCell,
      treeCell,
      areaCell
    );

    tbody.appendChild(row);
  });
}

// =====================================
// เลือกแปลงและซูมแผนที่
// =====================================
function selectPlot(plotId) {
  const plot = plotData.find(item => item.id === plotId);

  if (!plot) return;

  selectedPlotId = plotId;

  const bounds = new google.maps.LatLngBounds();

  polygons.forEach(polygon => {

    const selected = polygon.plotId === plotId;
    const index = plotData.findIndex(
      item => item.id === polygon.plotId
    );

    const color = plotColors[index % plotColors.length];

    polygon.setOptions({
      fillOpacity: selected ? 0.40 : 0.10,
      strokeOpacity: selected ? 1 : 0.45,
      strokeWeight: selected ? 4 : 1.5
    });

    if (selected) {
      polygon.getPath().forEach(position => {
        bounds.extend(position);
      });
    }
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  }

  document.querySelectorAll('.plot-name-btn').forEach(button => {
    button.classList.remove('selected');
  });

  const buttons = document.querySelectorAll('.plot-name-btn');

  const index = plotData.findIndex(item => item.id === plotId);

  if (buttons[index]) {
    buttons[index].classList.add('selected');
  }

  const detail = document.getElementById(
    'selected-plot-detail'
  );

  detail.innerHTML = '';

  const items = [
    ['แปลงที่เลือก', plot.plot_name],
    ['พันธุ์ทุเรียน', plot.variety || '-'],
    ['จำนวนต้น', plot.tree_count ?? '-'],
    ['พื้นที่คำนวณ', formatArea(plot.calculatedArea)]
  ];

  items.forEach(([label, value]) => {
    const box = document.createElement('div');
    box.className = 'plot-detail-item';

    const title = document.createElement('span');
    title.textContent = label;

    const strong = document.createElement('strong');
    strong.textContent = value;

    box.append(title, strong);
    detail.appendChild(box);
  });

  document.getElementById('map-message').textContent =
    `กำลังแสดงขอบเขต ${plot.plot_name}`;
}

// =====================================
// อ่านข้อมูลจาก Supabase
// =====================================
async function loadOrchardData() {
  const message = document.getElementById('map-message');

  try {

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบใหม่');
    }

    // อ่านข้อมูลสวนของผู้ใช้ปัจจุบัน
    const { data: orchard, error: orchardError } =
      await supabase
        .from('orchards')
        .select('id, orchard_name, province, district, total_area')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

    if (orchardError) throw orchardError;

    if (!orchard) {
      throw new Error(
        'ไม่พบข้อมูลสวนของบัญชีนี้ กรุณาตรวจสอบสิทธิ์เจ้าของสวน'
      );
    }

    document.getElementById('orchard-name').textContent =
      orchard.orchard_name;

    document.getElementById('orchard-location').textContent =
      `${orchard.district || ''} · ${orchard.province || ''}`;

    // อ่านแปลงทั้งหมดในสวน
    const { data: plots, error: plotsError } =
      await supabase
        .from('plots')
        .select('id, plot_name, variety, tree_count, area, boundary')
        .eq('orchard_id', orchard.id)
        .order('plot_name');

    if (plotsError) throw plotsError;

    plotData = plots || [];

    document.getElementById('plot-count').textContent =
      plotData.length;

    document.getElementById('total-area').textContent =
      orchard.total_area ?? '-';

    if (!plotData.length) {
      throw new Error('ยังไม่มีข้อมูลแปลงในสวน');
    }

    await loadGoogleMaps();

    createMap();

    drawPlots();

    renderPlotTable();

    // เลือกแปลงแรกเมื่อเปิดหน้า
    if (plotData.length > 0) {
      selectPlot(plotData[0].id);
    }

    message.textContent =
      'โหลดข้อมูลแปลงและแผนที่เรียบร้อยแล้ว';

  } catch (error) {

    console.error('Orchard error:', error);

    message.textContent = error.message;

    message.style.color = '#c0392b';
  }
}

loadOrchardData();

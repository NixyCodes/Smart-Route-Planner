// SkyRoute – Shared utilities (navbar, map, data)

const API = 'http://localhost:5000/api';

let AIRPORTS    = [];
let AIRPORT_MAP = {};
let SEGMENTS    = [];
let REGIONS     = [];

// ── Navbar ─────────────────────────────────────────────────────
function buildNavbar(activePage) {
    const isAdmin = !!localStorage.getItem('skyroute_admin_token');

    const pages = [
        { href: 'index.html',     label: 'Home' },
        { href: 'dashboard.html', label: 'Route Planner' },
        isAdmin
            ? { href: 'admin.html', label: '🛡 Admin' }
            : { href: 'login.html', label: 'Admin' },
    ];

    const links = pages.map(p =>
        `<a href="${p.href}" class="nav-link${activePage === p.href ? ' active' : ''}">${p.label}</a>`
    ).join('');

    const adminBtn = isAdmin
        ? `<button class="nav-signin" style="border-color:rgba(239,68,68,.3);color:#EF4444" onclick="adminLogout()">Sign out</button>`
        : '';

    return `
    <nav class="navbar" id="navbar">
      <div class="container" style="display:flex;align-items:center;justify-content:space-between;height:72px">
        <a href="index.html" class="nav-brand">
          <em>Sky</em><span class="text-gold">Route</span>
        </a>
        <div class="nav-links" id="nav-links">${links}</div>
        <div class="nav-right">
          ${adminBtn}
          <button class="mobile-toggle" onclick="toggleMobileMenu()" id="mobile-toggle">☰</button>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu">
        ${pages.map(p =>
            `<a href="${p.href}" class="mobile-link${activePage === p.href ? ' active' : ''}">${p.label}</a>`
        ).join('')}
        ${isAdmin ? `<button class="mobile-link danger" onclick="adminLogout()" style="background:none;border:none;text-align:left;width:100%;cursor:pointer;font-size:inherit;padding:15px 0;border-bottom:1px solid var(--border)">Sign out</button>` : ''}
      </div>
    </nav>`;
}

function adminLogout() {
    localStorage.removeItem('skyroute_admin_token');
    localStorage.removeItem('skyroute_admin_user');
    window.location.href = 'login.html';
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn  = document.getElementById('mobile-toggle');
    if (!menu) return;
    menu.classList.toggle('open');
    if (btn) btn.textContent = menu.classList.contains('open') ? '✕' : '☰';
}

// ── Footer ──────────────────────────────────────────────────────
function buildFooter() {
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <em>Sky</em><span class="text-gold">Route</span>
          </div>
          <p class="footer-copy">© ${new Date().getFullYear()} SkyRoute · Dijkstra's algorithm · 47 airports · 264 routes · SQLite DBMS</p>
          <div class="footer-links">
            <a href="index.html">Home</a>
            <a href="dashboard.html">Planner</a>
            <a href="login.html">Admin</a>
          </div>
        </div>
      </div>
    </footer>`;
}

// ── Data loading from API ───────────────────────────────────────
async function loadAppData() {
    try {
        const [airportRes, segmentRes] = await Promise.all([
            fetch(`${API}/airports`),
            fetch(`${API}/segments`),
        ]);
        if (!airportRes.ok || !segmentRes.ok) throw new Error('API error');
        const { airports } = await airportRes.json();
        const { segments } = await segmentRes.json();

        AIRPORTS = airports.map(a => [
            a.iata_code, a.city_name, a.airport_name,
            a.latitude, a.longitude, a.airport_type,
            a.country, a.region
        ]);
        AIRPORT_MAP = Object.fromEntries(airports.map(a => [a.iata_code, {
            id: a.iata_code, name: a.city_name, airport: a.airport_name,
            lat: a.latitude, lng: a.longitude, type: a.airport_type,
            country: a.country, region: a.region,
        }]));
        SEGMENTS = segments.map(s => ({
            id: s.segment_id, from: s.origin_code, to: s.destination_code,
            distance: s.distance_km, time: s.duration_min, cost: s.base_cost_usd,
            airline: s.airline_code, aircraft: s.aircraft_code,
        }));
        REGIONS = [...new Set(airports.map(a => a.region))].sort();
        return true;
    } catch (err) {
        console.error('Failed to load app data', err);
        return false;
    }
}

// ── Airport select builder ──────────────────────────────────────
function buildAirportOptions(selectedId) {
    return REGIONS.map(region => {
        const aps  = AIRPORTS.filter(a => a[7] === region).sort((a, b) => a[1].localeCompare(b[1]));
        const opts = aps.map(a => {
            const label = { hub: 'Hub', international: 'Intl', national: 'Domestic' }[a[5]] || a[5];
            return `<option value="${a[0]}"${a[0] === selectedId ? ' selected' : ''}>${a[1]} (${a[0]}) · ${label}</option>`;
        }).join('');
        return `<optgroup label="${region}">${opts}</optgroup>`;
    }).join('');
}

// ── Map (Leaflet) – always dark gold ────────────────────────────
let leafletMap = null;

function destroyMap() {
    if (leafletMap) { leafletMap.remove(); leafletMap = null; }
}

function initMap(containerId, result, sourceId, destId) {
    if (!window.L) return;
    destroyMap();
    const el = document.getElementById(containerId);
    if (!el) return;

    leafletMap = L.map(el, { center: [20, 10], zoom: 2, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 18, subdomains: 'abcd' }).addTo(leafletMap);

    const GOLD     = '#D4A853';
    const DIM      = '#1e2a3a';
    const routeSet = new Set(result?.path || []);

    const drawn = new Set();
    for (const seg of SEGMENTS) {
        const key = [seg.from, seg.to].sort().join('~');
        if (drawn.has(key)) continue;
        drawn.add(key);
        if (result?.found && routeSet.has(seg.from) && routeSet.has(seg.to)) continue;
        const a = AIRPORT_MAP[seg.from], b = AIRPORT_MAP[seg.to];
        if (!a || !b) continue;
        L.polyline(greatCirclePoints(a.lat, a.lng, b.lat, b.lng, 30),
            { color: DIM, weight: 0.5, opacity: 0.5, dashArray: '3 6' }).addTo(leafletMap);
    }

    if (result?.found) {
        for (const step of result.steps) {
            const a = AIRPORT_MAP[step.from], b = AIRPORT_MAP[step.to];
            if (!a || !b) continue;
            const pts = greatCirclePoints(a.lat, a.lng, b.lat, b.lng, 80);
            L.polyline(pts, { color: GOLD, weight: 10, opacity: 0.07 }).addTo(leafletMap);
            L.polyline(pts, { color: GOLD, weight: 2.5, opacity: 0.92, dashArray: '10 5', lineCap: 'round' }).addTo(leafletMap);
            const mid = pts[Math.floor(pts.length / 2)];
            L.marker(mid, { icon: L.divIcon({
                html: `<span style="color:${GOLD};font-size:14px;filter:drop-shadow(0 0 4px ${GOLD})">✈</span>`,
                className: '', iconSize: [14, 14], iconAnchor: [7, 7]
            })}).addTo(leafletMap);
        }
    }

    const typeColor = { hub: GOLD, international: '#8B5CF6', national: '#10B981' };
    for (const ap of AIRPORTS) {
        const apt        = AIRPORT_MAP[ap[0]];
        const isEndpoint = apt.id === sourceId || apt.id === destId;
        const isOnRoute  = result?.found && routeSet.has(apt.id);
        const color      = isEndpoint ? '#F97316' : isOnRoute ? GOLD : (typeColor[apt.type] || '#64748B');
        const sz         = isEndpoint ? 14 : isOnRoute ? 11 : apt.type === 'hub' ? 9 : 7;
        const pulseHtml  = (isEndpoint || isOnRoute)
            ? `<div class="pulse-ring" style="color:${color}"></div><div class="pulse-ring pulse-ring-2" style="color:${color}"></div>` : '';

        const icon = L.divIcon({
            html: `<div style="width:${sz}px;height:${sz}px;background:${color};border:2px solid ${(isEndpoint||isOnRoute)?'#fff':'transparent'};border-radius:50%;box-shadow:0 0 ${isEndpoint?14:isOnRoute?10:6}px ${color}cc;position:relative">${pulseHtml}</div>`,
            className: '', iconSize: [sz+12, sz+12], iconAnchor: [(sz+12)/2, (sz+12)/2],
        });
        const mk = L.marker([apt.lat, apt.lng], { icon }).addTo(leafletMap);
        const typeLabel = { hub: 'Major Hub', international: 'International', national: 'National/Domestic' }[apt.type] || apt.type;
        mk.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px;padding:2px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${apt.name} <span style="color:${color}">(${apt.id})</span></div>
            <div style="font-size:12px;color:#8A8A9A;margin-bottom:6px">${apt.airport}</div>
            <span style="font-size:11px;background:${color}22;color:${color};padding:2px 8px;border-radius:999px;font-weight:600">${typeLabel}</span>
            <span style="font-size:11px;color:#64748b;margin-left:6px">${apt.country}</span>
            ${isOnRoute ? `<div style="margin-top:8px;font-size:11px;color:${GOLD};font-weight:600">● On active route</div>` : ''}
          </div>`, { maxWidth: 260 });
    }

    if (result?.found && result.path.length >= 2) {
        const locs = result.path.map(id => AIRPORT_MAP[id]).filter(Boolean);
        const lats = locs.map(l => l.lat), lngs = locs.map(l => l.lng);
        leafletMap.fitBounds([
            [Math.min(...lats) - 8, Math.min(...lngs) - 15],
            [Math.max(...lats) + 8, Math.max(...lngs) + 15],
        ], { padding: [40, 40] });
    }

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
        const d = L.DomUtil.create('div');
        d.style.cssText = 'background:rgba(6,9,19,.9);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 14px;font-family:Inter,sans-serif;font-size:11px;color:#8A8A9A;line-height:2;backdrop-filter:blur(8px)';
        d.innerHTML = `
          <div style="font-weight:700;color:#F5F0E8;margin-bottom:4px">Airport Types</div>
          <div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#D4A853;margin-right:6px;vertical-align:middle"></span>Major Hub</div>
          <div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8B5CF6;margin-right:6px;vertical-align:middle"></span>International</div>
          <div><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10B981;margin-right:6px;vertical-align:middle"></span>National</div>
          <div><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#F97316;margin-right:6px;vertical-align:middle"></span>Selected</div>`;
        return d;
    };
    legend.addTo(leafletMap);
}

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const navEl  = document.getElementById('navbar-container');
    const footEl = document.getElementById('footer-container');
    if (navEl)  navEl.outerHTML  = buildNavbar(window._activePage || 'index.html');
    if (footEl) footEl.outerHTML = buildFooter();

    const nav = document.getElementById('navbar');
    if (nav) {
        window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive: true });
    }

    await loadAppData();
    if (typeof onAppReady === 'function') onAppReady();
});

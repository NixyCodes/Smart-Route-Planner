// ══════════════════════════════════════════════════════════════
//  SkyRoute – Shared utilities (auth, theme, navbar, map)
// ══════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('skyroute_user') || 'null'); } catch { return null; }
}
function saveUser(u) { localStorage.setItem('skyroute_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('skyroute_user'); }
function logout() { clearUser(); window.location.href = 'index.html'; }

// ── Theme ─────────────────────────────────────────────────────
function getTheme() { return localStorage.getItem('skyroute_theme') || 'light'; }
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('skyroute_theme', t);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = t === 'dark' ? '☀' : '🌙';
}
function toggleTheme() {
  const t = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(t);
}

// ── Navbar ────────────────────────────────────────────────────
function buildNavbar(activePage) {
  const user = getUser();
  const pages = [
    { href: 'index.html',     label: 'Home' },
    { href: 'dashboard.html', label: 'Dashboard' },
  ];

  const links = pages.map(p => {
    const isActive = activePage === p.href;
    return `<a href="${p.href}" class="nav-link${isActive ? ' active' : ''}">${p.label}</a>`;
  }).join('');

  const authSection = user
    ? `<div class="nav-profile-wrap">
        <button class="nav-profile-btn" onclick="toggleProfileMenu()" id="profile-trigger">
          <span class="nav-avatar">✈</span>
          <span class="nav-username">${user.name.split(' ')[0]}</span>
          <span class="nav-chevron" id="profile-chevron">▾</span>
        </button>
        <div class="profile-dropdown hidden" id="profile-dropdown">
          <div class="dropdown-header">
            <div class="dropdown-name">${user.name}</div>
            <div class="dropdown-email">${user.email}</div>
          </div>
          <button class="dropdown-item danger" onclick="logout()">✕ Sign Out</button>
        </div>
       </div>`
    : `<div class="nav-auth">
        <a href="login.html" class="btn btn-ghost">Log In</a>
        <a href="signup.html" class="btn btn-primary btn-sm">Get Started</a>
       </div>`;

  return `
    <nav class="navbar" id="navbar">
      <div class="container nav-inner">
        <a href="index.html" class="nav-brand">
          <div class="brand-icon">✈</div>
          Sky<span class="text-primary">Route</span>
        </a>
        <div class="nav-links" id="nav-links">${links}</div>
        <div class="nav-right">
          <button class="btn-icon" onclick="toggleTheme()" title="Toggle theme">
            <span id="theme-icon">${getTheme() === 'dark' ? '☀' : '🌙'}</span>
          </button>
          ${authSection}
          <button class="btn-icon mobile-menu-btn" onclick="toggleMobileMenu()" id="mobile-toggle">☰</button>
        </div>
      </div>
      <div class="mobile-menu hidden" id="mobile-menu">
        ${pages.map(p => `<a href="${p.href}" class="mobile-link${activePage === p.href ? ' active' : ''}">${p.label}</a>`).join('')}
        ${user
          ? `<button class="mobile-link danger" onclick="logout()">Sign Out</button>`
          : `<a href="login.html" class="mobile-link">Log In</a><a href="signup.html" class="mobile-link primary">Get Started</a>`
        }
      </div>
    </nav>`;
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-toggle');
  menu.classList.toggle('hidden');
  btn.textContent = menu.classList.contains('hidden') ? '☰' : '✕';
}

function toggleProfileMenu() {
  const dd = document.getElementById('profile-dropdown');
  const ch = document.getElementById('profile-chevron');
  dd.classList.toggle('hidden');
  ch.style.transform = dd.classList.contains('hidden') ? '' : 'rotate(180deg)';
}

document.addEventListener('click', e => {
  const wrap = document.querySelector('.nav-profile-wrap');
  const dd = document.getElementById('profile-dropdown');
  if (wrap && dd && !wrap.contains(e.target)) dd.classList.add('hidden');
});

// ── Footer ────────────────────────────────────────────────────
function buildFooter() {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="brand-icon sm">✈</div>
          <span>Sky<span class="text-primary">Route</span></span>
        </div>
        <p class="footer-copy">© ${new Date().getFullYear()} SkyRoute. Powered by Dijkstra's algorithm · 47 airports · 264 routes.</p>
        <div class="footer-links">
          <a href="index.html">Home</a>
          <a href="dashboard.html">Dashboard</a>
          <a href="login.html">Login</a>
        </div>
      </div>
    </footer>`;
}

// ── Map (Leaflet) ─────────────────────────────────────────────
let leafletMap = null;

function destroyMap() {
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
}

function initMap(containerId, result, sourceId, destId) {
  if (!window.L) return;
  destroyMap();
  const el = document.getElementById(containerId);
  if (!el) return;

  const isDark = getTheme() === 'dark';
  const tile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  leafletMap = L.map(el, { center: [20, 10], zoom: 2, zoomControl: true, attributionControl: false });
  L.tileLayer(tile, { maxZoom: 18, subdomains: 'abcd' }).addTo(leafletMap);

  const PRIMARY = '#0ea5e9';
  const DIM = isDark ? '#1e3a5f' : '#bfdbfe';
  const routeSet = new Set(result?.path || []);

  // Background network (real segments, deduped)
  const drawn = new Set();
  for (const seg of SEGMENTS) {
    const key = [seg.from, seg.to].sort().join('~');
    if (drawn.has(key)) continue;
    drawn.add(key);
    if (result?.found && routeSet.has(seg.from) && routeSet.has(seg.to)) continue;
    const a = AIRPORT_MAP[seg.from], b = AIRPORT_MAP[seg.to];
    if (!a || !b) continue;
    L.polyline(greatCirclePoints(a.lat, a.lng, b.lat, b.lng, 30),
      { color: DIM, weight: 0.5, opacity: 0.45, dashArray: '3 6' }).addTo(leafletMap);
  }

  // Active route arcs
  if (result?.found) {
    for (const step of result.steps) {
      const a = AIRPORT_MAP[step.from], b = AIRPORT_MAP[step.to];
      if (!a || !b) continue;
      const pts = greatCirclePoints(a.lat, a.lng, b.lat, b.lng, 80);
      L.polyline(pts, { color: PRIMARY, weight: 8, opacity: 0.1 }).addTo(leafletMap);
      L.polyline(pts, { color: PRIMARY, weight: 2.5, opacity: 0.9, dashArray: '10 5', lineCap: 'round' }).addTo(leafletMap);
      const mid = pts[Math.floor(pts.length / 2)];
      L.marker(mid, { icon: L.divIcon({ html: `<span style="color:${PRIMARY};font-size:14px">✈</span>`, className:'', iconSize:[14,14], iconAnchor:[7,7] }) }).addTo(leafletMap);
    }
  }

  // Airport markers
  const typeColor = { hub:'#0ea5e9', international:'#8b5cf6', national:'#10b981' };
  for (const ap of AIRPORTS) {
    const apt = AIRPORT_MAP[ap[0]];
    const isEndpoint = apt.id === sourceId || apt.id === destId;
    const isOnRoute = result?.found && routeSet.has(apt.id);
    const color = isEndpoint ? '#f97316' : isOnRoute ? PRIMARY : (typeColor[apt.type] || '#64748b');
    const sz = isEndpoint ? 14 : isOnRoute ? 11 : apt.type === 'hub' ? 9 : 7;
    const border = (isEndpoint || isOnRoute) ? '#fff' : 'transparent';

    const icon = L.divIcon({
      html: `<div style="width:${sz}px;height:${sz}px;background:${color};border:2px solid ${border};border-radius:50%;box-shadow:0 0 6px ${color}80"></div>`,
      className: '', iconSize: [sz, sz], iconAnchor: [sz/2, sz/2]
    });
    const mk = L.marker([apt.lat, apt.lng], { icon }).addTo(leafletMap);
    const typeLabel = { hub:'Major Hub', international:'International', national:'National / Domestic' }[apt.type] || apt.type;
    mk.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:180px">
        <div style="font-weight:700;font-size:14px">${apt.name} <span style="color:${color}">(${apt.id})</span></div>
        <div style="font-size:12px;color:#475569;margin:3px 0">${apt.airport}</div>
        <span style="font-size:11px;background:${color}20;color:${color};padding:2px 8px;border-radius:999px;font-weight:600">${typeLabel}</span>
        <span style="font-size:11px;color:#94a3b8;margin-left:4px">${apt.country} · ${apt.region}</span>
        ${isOnRoute ? `<div style="margin-top:6px;font-size:11px;color:${PRIMARY};font-weight:600">● On active route</div>` : ''}
      </div>`, { maxWidth: 260, className: 'skyroute-popup' });
  }

  // Fit to route
  if (result?.found && result.path.length >= 2) {
    const locs = result.path.map(id => AIRPORT_MAP[id]).filter(Boolean);
    const lats = locs.map(l => l.lat), lngs = locs.map(l => l.lng);
    leafletMap.fitBounds([
      [Math.min(...lats) - 8, Math.min(...lngs) - 15],
      [Math.max(...lats) + 8, Math.max(...lngs) + 15]
    ], { padding: [40, 40] });
  }

  // Legend
  const legendEl = L.control({ position: 'bottomright' });
  legendEl.onAdd = () => {
    const d = L.DomUtil.create('div');
    d.style.cssText = `background:${isDark?'rgba(15,23,42,0.9)':'rgba(255,255,255,0.92)'};border:1px solid ${isDark?'#1e293b':'#e2e8f0'};border-radius:10px;padding:8px 12px;font-family:Inter,sans-serif;font-size:11px;color:${isDark?'#94a3b8':'#475569'};line-height:1.9;backdrop-filter:blur(8px)`;
    d.innerHTML = `<div style="font-weight:700;margin-bottom:3px;color:${isDark?'#f1f5f9':'#1e293b'}">Airport Types</div>
      <div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#0ea5e9;margin-right:5px;vertical-align:middle"></span>Major Hub</div>
      <div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;margin-right:5px;vertical-align:middle"></span>International</div>
      <div><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:5px;vertical-align:middle"></span>National / Domestic</div>
      <div><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#f97316;margin-right:5px;vertical-align:middle"></span>Selected</div>`;
    return d;
  };
  legendEl.addTo(leafletMap);
}

// ── Select helpers ────────────────────────────────────────────
function buildAirportOptions(selectedId) {
  return REGIONS.map(region => {
    const aps = AIRPORTS.filter(a => a[7] === region).sort((a, b) => a[1].localeCompare(b[1]));
    const opts = aps.map(a => {
      const label = { hub:'Hub', international:'Intl', national:'National' }[a[5]] || a[5];
      const sel = a[0] === selectedId ? ' selected' : '';
      return `<option value="${a[0]}"${sel}>${a[1]} (${a[0]}) · ${label}</option>`;
    }).join('');
    return `<optgroup label="${region}">${opts}</optgroup>`;
  }).join('');
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme());
  const navEl = document.getElementById('navbar-container');
  const footEl = document.getElementById('footer-container');
  if (navEl) navEl.outerHTML = buildNavbar(window._activePage || 'index.html');
  if (footEl) footEl.outerHTML = buildFooter();
});

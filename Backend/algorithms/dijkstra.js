// ══════════════════════════════════════════════════════════════
//  SkyRoute – Dijkstra's Algorithm
// ══════════════════════════════════════════════════════════════

const {
    SEGMENTS,
    AIRPORT_MAP,
    AIRLINE_MAP,
    AIRCRAFT_MAP
} = require('../data/data');

function dijkstra(sourceId, destId, optimizeBy = 'distance') {
    // Build adjacency graph
    const graph = {};
    for (const seg of SEGMENTS) {
        if (!graph[seg.from]) graph[seg.from] = [];
        const weight = optimizeBy === 'distance' ? seg.distance
            : optimizeBy === 'time' ? seg.time
                : seg.cost;
        graph[seg.from].push({ to: seg.to, weight, seg });
    }

    const dist = {};
    const prev = {};
    const visited = new Set();
    const nodes = new Set(SEGMENTS.flatMap(s => [s.from, s.to]));

    for (const n of nodes) { dist[n] = Infinity; prev[n] = null; }
    dist[sourceId] = 0;

    const pq = [{ node: sourceId, dist: 0 }];

    while (pq.length) {
        pq.sort((a, b) => a.dist - b.dist);
        const { node: u } = pq.shift();
        if (visited.has(u)) continue;
        visited.add(u);
        if (u === destId) break;

        for (const { to: v, weight, seg } of (graph[u] || [])) {
            if (visited.has(v)) continue;
            const alt = dist[u] + weight;
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = { node: u, seg };
                pq.push({ node: v, dist: alt });
            }
        }
    }

    if (!isFinite(dist[destId])) return { found: false };

    // Reconstruct path
    const path = [];
    const steps = [];
    let cur = destId;
    while (cur) {
        path.unshift(cur);
        const p = prev[cur];
        if (p) {
            const { seg } = p;
            steps.unshift({
                from: seg.from, to: seg.to,
                fromName: AIRPORT_MAP[seg.from]?.name || seg.from,
                toName: AIRPORT_MAP[seg.to]?.name || seg.to,
                distance: seg.distance, time: seg.time, cost: seg.cost,
                airline: AIRLINE_MAP[seg.airline]?.name || seg.airline,
                aircraft: AIRCRAFT_MAP[seg.aircraft]?.type || seg.aircraft,
                segId: seg.id,
            });
            cur = p.node;
        } else {
            cur = null;
        }
    }

    return {
        found: true, path, steps,
        totalDistance: steps.reduce((s, r) => s + r.distance, 0),
        totalTime: steps.reduce((s, r) => s + r.time, 0),
        totalCost: steps.reduce((s, r) => s + r.cost, 0),
    };
}

function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

// Great-circle intermediate points for map arcs
function greatCirclePoints(lat1, lng1, lat2, lng2, n = 60) {
    const R = Math.PI / 180;
    const p1 = lat1 * R, l1 = lng1 * R;
    const p2 = lat2 * R, l2 = lng2 * R;
    const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
    if (d === 0) return [[lat1, lng1]];
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const f = i / n;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
        const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
        const z = A * Math.sin(p1) + B * Math.sin(p2);
        pts.push([Math.atan2(z, Math.sqrt(x * x + y * y)) / R, Math.atan2(y, x) / R]);
    }
    return pts;
};

module.exports = dijkstra;

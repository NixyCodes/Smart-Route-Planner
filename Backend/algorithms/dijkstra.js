const FlightSegment = require('../models/FlightSegment');
const Airport = require('../models/Airport');

function dijkstra(sourceId, destId, optimizeBy = 'distance') {
    const rawSegments = FlightSegment.getEdgeList();
    const airports    = Airport.getAll();

    // Build lookup maps
    const airportMap  = Object.fromEntries(airports.map(a => [a.iata_code, a]));

    // Build adjacency graph
    const graph = {};
    for (const seg of rawSegments) {
        if (!graph[seg.origin_code]) graph[seg.origin_code] = [];
        const weight =
            optimizeBy === 'time' ? seg.duration_min :
            optimizeBy === 'cost' ? seg.base_cost_usd :
            seg.distance_km;
        graph[seg.origin_code].push({ to: seg.destination_code, weight, seg });
    }

    const nodes = new Set(rawSegments.flatMap(s => [s.origin_code, s.destination_code]));
    const dist  = {};
    const prev  = {};
    const visited = new Set();

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
    const path  = [];
    const steps = [];
    let cur = destId;

    while (cur) {
        path.unshift(cur);
        const p = prev[cur];
        if (p) {
            const { seg } = p;
            const origin = airportMap[seg.origin_code];
            const dest   = airportMap[seg.destination_code];

            // Pull airline and aircraft names from DB via a JOIN-based lookup
            const db      = require('../db/database').getDb();
            const airline = db.prepare('SELECT airline_name FROM airlines WHERE iata_code = ?').get(seg.airline_code);
            const aircraft= db.prepare('SELECT model_name  FROM aircraft  WHERE model_code  = ?').get(seg.aircraft_code);

            steps.unshift({
                from:     seg.origin_code,
                to:       seg.destination_code,
                fromName: origin?.city_name  || seg.origin_code,
                toName:   dest?.city_name    || seg.destination_code,
                distance: seg.distance_km,
                time:     seg.duration_min,
                cost:     seg.base_cost_usd,
                airline:  airline?.airline_name || seg.airline_code,
                aircraft: aircraft?.model_name  || seg.aircraft_code,
                segId:    seg.segment_id,
            });
            cur = p.node;
        } else {
            cur = null;
        }
    }

    return {
        found:         true,
        path,
        steps,
        totalDistance: steps.reduce((s, r) => s + r.distance, 0),
        totalTime:     steps.reduce((s, r) => s + r.time, 0),
        totalCost:     steps.reduce((s, r) => s + r.cost, 0),
    };
}

module.exports = dijkstra;

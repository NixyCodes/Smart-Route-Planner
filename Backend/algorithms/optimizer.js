// Multi-constraint route optimization engine
// Exposes four genuinely different weight strategies and a comparison runner.

const { getDb } = require('../db/database');

// Enriched edge list: joins airline rating, delay prob, aircraft emissions, airport congestion
function getEnrichedEdgeList() {
    return getDb().prepare(`
        SELECT
            fs.segment_id, fs.origin_code, fs.destination_code,
            fs.distance_km, fs.duration_min, fs.base_cost_usd,
            fs.airline_code, fs.aircraft_code,
            al.airline_name,
            al.airline_rating,
            al.delay_probability,
            ac.model_name        AS aircraft_name,
            ac.emissions_factor,
            ao.city_name         AS origin_city,
            ao.congestion_score  AS origin_congestion,
            ad.city_name         AS dest_city,
            ad.congestion_score  AS dest_congestion
        FROM flight_segments fs
        JOIN airlines al ON fs.airline_code     = al.iata_code
        JOIN aircraft  ac ON fs.aircraft_code   = ac.model_code
        JOIN airports  ao ON fs.origin_code     = ao.iata_code
        JOIN airports  ad ON fs.destination_code = ad.iata_code
    `).all();
}

// ── Weight functions (one per optimization mode) ─────────────────────────────
//
// Each function receives a single enriched segment and returns a scalar weight.
// Dijkstra minimises total weight — different functions naturally route through
// different hubs and carriers, producing genuinely distinct paths.

const WEIGHT_FNS = {
    // Cheapest: pure ticket cost + small per-leg booking overhead.
    // Prefers budget carriers (IndiGo, AirAsia) and more hops if each is cheap.
    cheapest(seg) {
        return seg.base_cost_usd + 30;
    },

    // Fastest Arrival: flight time plus realistic connection overhead at each hub.
    // Congested airports (LHR 0.92, ATL 0.95) add up to 114 min connection time.
    // Fewer hops through less-busy hubs (DOH 0.65, SIN 0.75) are rewarded.
    fastest(seg) {
        return seg.duration_min + 45 + seg.dest_congestion * 75;
    },

    // Smart / Recommended: multi-factor composite score balancing cost, time,
    // airline quality, delay risk, and emissions per flight leg.
    // Consistently selects premium carriers (SQ, QR, EK) even when marginally
    // more expensive, because their quality and reliability outweigh the cost penalty.
    smart(seg) {
        const costFactor    = (seg.base_cost_usd   / 500)   * 0.35;
        const timeFactor    = (seg.duration_min     / 300)   * 0.30;
        const qualityFactor = ((5.0 - seg.airline_rating) / 4.0) * 0.15;
        const delayFactor   = seg.delay_probability          * 0.12;
        const emitFactor    = (seg.emissions_factor * seg.distance_km / 50000) * 0.08;
        return (costFactor + timeFactor + qualityFactor + delayFactor + emitFactor) * 100;
    },

    // Minimum Layover: very heavy penalty per hop (200 + up to 120 min from congestion).
    // A busy hub like ATL adds 314 min overhead — strongly prefers direct or fewest
    // connections, even at higher cost or longer flight time.
    min_layover(seg) {
        return seg.duration_min + 200 + seg.dest_congestion * 120;
    },
};

// ── Core Dijkstra ─────────────────────────────────────────────────────────────

function runDijkstra(segments, sourceId, destId, weightFn) {
    const graph = {};
    for (const seg of segments) {
        if (!graph[seg.origin_code]) graph[seg.origin_code] = [];
        graph[seg.origin_code].push({ to: seg.destination_code, weight: weightFn(seg), seg });
    }

    const nodes   = new Set(segments.flatMap(s => [s.origin_code, s.destination_code]));
    const dist    = {};
    const prev    = {};
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

    if (!isFinite(dist[destId])) return null;

    const path = [], segs = [];
    let cur = destId;
    while (cur) {
        path.unshift(cur);
        const p = prev[cur];
        if (p) { segs.unshift(p.seg); cur = p.node; }
        else cur = null;
    }
    return { path, segs };
}

// ── Result builder ────────────────────────────────────────────────────────────

function buildResult(raw, mode) {
    if (!raw) return { found: false, mode };
    const { path, segs } = raw;

    const steps = segs.map((seg, i) => {
        // Layover is the estimated wait at the intermediate departure airport (not the first).
        const layoverMin = i > 0 ? Math.round(45 + seg.origin_congestion * 75) : 0;

        return {
            from:           seg.origin_code,
            to:             seg.destination_code,
            fromName:       seg.origin_city,
            toName:         seg.dest_city,
            distance:       seg.distance_km,
            time:           seg.duration_min,
            cost:           seg.base_cost_usd,
            airline:        seg.airline_name,
            airlineCode:    seg.airline_code,
            airlineRating:  seg.airline_rating,
            delayProb:      seg.delay_probability,
            aircraft:       seg.aircraft_name,
            emissionsFactor:seg.emissions_factor,
            layoverMin,
            segId:          seg.segment_id,
        };
    });

    const totalDistance  = steps.reduce((s, r) => s + r.distance, 0);
    const totalTime      = steps.reduce((s, r) => s + r.time, 0);
    const totalCost      = steps.reduce((s, r) => s + r.cost, 0);
    const totalLayover   = steps.reduce((s, r) => s + r.layoverMin, 0);
    const avgRating      = +(steps.reduce((s, r) => s + r.airlineRating, 0) / steps.length).toFixed(1);
    const avgDelay       = +(steps.reduce((s, r) => s + r.delayProb,     0) / steps.length * 100).toFixed(1);
    const totalEmissions = +(steps.reduce((s, r) => s + r.emissionsFactor * r.distance / 100, 0)).toFixed(0);

    return {
        found:          true,
        mode,
        path,
        steps,
        totalDistance,
        totalTime,
        totalCost,
        totalLayover,
        avgRating,
        avgDelay,
        totalEmissions,
        stops: path.length - 2,
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

function optimize(sourceId, destId, mode = 'smart') {
    const weightFn = WEIGHT_FNS[mode] || WEIGHT_FNS.smart;
    const segments = getEnrichedEdgeList();
    return buildResult(runDijkstra(segments, sourceId, destId, weightFn), mode);
}

function compareAll(sourceId, destId) {
    const segments = getEnrichedEdgeList(); // single DB call for all 4 modes
    const results  = {};
    for (const mode of ['cheapest', 'fastest', 'smart', 'min_layover']) {
        results[mode] = buildResult(
            runDijkstra(segments, sourceId, destId, WEIGHT_FNS[mode]),
            mode
        );
    }
    return results;
}

module.exports = { optimize, compareAll };

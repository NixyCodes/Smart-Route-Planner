// format time
function formatTime(minutes) {

    const h = Math.floor(minutes / 60);

    const m = minutes % 60;

    if (h === 0) return `${m}m`;

    if (m === 0) return `${h}h`;

    return `${h}h ${m}m`;
}


// great-circle points for map arcs
function greatCirclePoints(lat1, lng1, lat2, lng2, n = 60) {

    const R = Math.PI / 180;

    const p1 = lat1 * R;
    const l1 = lng1 * R;

    const p2 = lat2 * R;
    const l2 = lng2 * R;

    const d = 2 * Math.asin(Math.sqrt(
        Math.sin((p2 - p1) / 2) ** 2 +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin((l2 - l1) / 2) ** 2
    ));

    if (d === 0) return [[lat1, lng1]];

    const pts = [];

    for (let i = 0; i <= n; i++) {

        const f = i / n;

        const A = Math.sin((1 - f) * d) / Math.sin(d);

        const B = Math.sin(f * d) / Math.sin(d);

        const x =
            A * Math.cos(p1) * Math.cos(l1) +
            B * Math.cos(p2) * Math.cos(l2);

        const y =
            A * Math.cos(p1) * Math.sin(l1) +
            B * Math.cos(p2) * Math.sin(l2);

        const z =
            A * Math.sin(p1) +
            B * Math.sin(p2);

        pts.push([
            Math.atan2(z, Math.sqrt(x * x + y * y)) / R,
            Math.atan2(y, x) / R
        ]);
    }

    return pts;
}
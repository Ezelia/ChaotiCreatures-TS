module util.math {
    export function round(n) {
        return (0.5 + n) << 0;
    }

    export function random(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }
    export function distance(x1, y1, x2, y2) {
        return Math.sqrt((Math.pow((x2 - x1), 2)) + (Math.pow((y2 - y1), 2)));

    }

    export function getAngle(sourcePos, targetPos) {

        var ab = { x: 1, y: 0 };
        var cb = { x: sourcePos.x - targetPos.x, y: sourcePos.y - targetPos.y };

        var dot = (ab.x * cb.x + ab.y * cb.y); // dot product
        var cross = (ab.x * cb.y - ab.y * cb.x); // cross product

        var alpha = Math.atan2(cross, dot);

        return Math.floor(alpha * 180 / Math.PI + 0.5);
    }

    export function getAngleABC(a, b, c) {
        
        var ab = { x: b.x - a.x, y: b.y - a.y };
        var cb = { x: b.x - c.x, y: b.y - c.y };

        var dot = (ab.x * cb.x + ab.y * cb.y); // dot product
        var cross = (ab.x * cb.y - ab.y * cb.x); // cross product

        var alpha = Math.atan2(cross, dot);

        return Math.floor(alpha * 180 / Math.PI + 0.5);
    }
    export function d2h(d) { return d.toString(16); }
    export function h2d(h) { return parseInt(h, 16); }
    export function d2o(d) { return d.toString(8); }
    export function o2d(h) { return parseInt(h, 8); }

    export function sign(n) { return n == 0 ? 0 : n / Math.abs(n); }

}
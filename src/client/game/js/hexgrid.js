// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
// from https://www.redblobgames.com/grids/hexagons/codegen/output/lib-module.js
export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class Hex {
	constructor(q, r, s) {
		this.q = q;
		this.r = r;
		this.s = s;
		if (Math.round(q + r + s) !== 0) throw "q + r + s must be 0";
	}
	add(b) {
		return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
	}
	subtract(b) {
		return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
	}
	scale(k) {
		return new Hex(this.q * k, this.r * k, this.s * k);
	}
	rotateLeft() {
		return new Hex(-this.s, -this.q, -this.r);
	}
	rotateRight() {
		return new Hex(-this.r, -this.s, -this.q);
	}
	static direction(direction) {
		return Hex.directions[direction];
	}
	neighbor(direction) {
		return this.add(Hex.direction(direction));
	}
	diagonalNeighbor(direction) {
		return this.add(Hex.diagonals[direction]);
	}
	len() {
		return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
	}
	distance(b) {
		return this.subtract(b).len();
	}
	round() {
		let qi = Math.round(this.q);
		let ri = Math.round(this.r);
		let si = Math.round(this.s);
		const qDiff = Math.abs(qi - this.q);
		const rDiff = Math.abs(ri - this.r);
		const sDiff = Math.abs(si - this.s);
		if (qDiff > rDiff && qDiff > sDiff) {
			qi = -ri - si;
		} else if (rDiff > sDiff) {
			ri = -qi - si;
		} else {
			si = -qi - ri;
		}
		return new Hex(qi, ri, si);
	}
	lerp(b, t) {
		return new Hex(
			this.q * (1.0 - t) + b.q * t,
			this.r * (1.0 - t) + b.r * t,
			this.s * (1.0 - t) + b.s * t
		);
	}
	linedraw(b) {
		const N = this.distance(b);
		const aNudge = new Hex(this.q + 1e-6, this.r + 1e-6, this.s - 2e-6);
		const bNudge = new Hex(b.q + 1e-6, b.r + 1e-6, b.s - 2e-6);
		const results = [];
		const step = 1.0 / Math.max(N, 1);
		for (let i = 0; i <= N; i++) {
			results.push(aNudge.lerp(bNudge, step * i).round());
		}
		return results;
	}
	equal(n) {
		return this.q === n.q && this.r === n.r && this.s === n.s;
	}
}

Hex.directions = [
	new Hex(1, 0, -1),
	new Hex(1, -1, 0),
	new Hex(0, -1, 1),
	new Hex(-1, 0, 1),
	new Hex(-1, 1, 0),
	new Hex(0, 1, -1),
];
Hex.diagonals = [
	new Hex(2, -1, -1),
	new Hex(1, -2, 1),
	new Hex(-1, -1, 2),
	new Hex(-2, 1, 1),
	new Hex(-1, 2, -1),
	new Hex(1, 1, -2),
];
export class OffsetCoord {
	constructor(col, row) {
		this.col = col;
		this.row = row;
	}
	static qoffsetFromCube(offset, h) {
		const col = h.q;
		const row = h.r + (h.q + offset * (h.q & 1)) / 2;
		if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
			throw "offset must be EVEN (+1) or ODD (-1)";
		}
		return new OffsetCoord(col, row);
	}
	static qoffsetToCube(offset, h) {
		const q = h.col;
		const r = h.row - (h.col + offset * (h.col & 1)) / 2;
		const s = -q - r;
		if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
			throw "offset must be EVEN (+1) or ODD (-1)";
		}
		return new Hex(q, r, s);
	}
	static roffsetFromCube(offset, h) {
		const col = h.q + (h.r + offset * (h.r & 1)) / 2;
		const row = h.r;
		if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
			throw "offset must be EVEN (+1) or ODD (-1)";
		}
		return new OffsetCoord(col, row);
	}
	static roffsetToCube(offset, h) {
		const q = h.col - (h.row + offset * (h.row & 1)) / 2;
		const r = h.row;
		const s = -q - r;
		if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
			throw "offset must be EVEN (+1) or ODD (-1)";
		}
		return new Hex(q, r, s);
	}
}

OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
export class DoubledCoord {
	constructor(col, row) {
		this.col = col;
		this.row = row;
	}
	static qdoubledFromCube(h) {
		const col = h.q;
		const row = 2 * h.r + h.q;
		return new DoubledCoord(col, row);
	}
	qdoubledToCube() {
		const q = this.col;
		const r = (this.row - this.col) / 2;
		const s = -q - r;
		return new Hex(q, r, s);
	}
	static rdoubledFromCube(h) {
		const col = 2 * h.q + h.r;
		const row = h.r;
		return new DoubledCoord(col, row);
	}
	rdoubledToCube() {
		const q = (this.col - this.row) / 2;
		const r = this.row;
		const s = -q - r;
		return new Hex(q, r, s);
	}
}

export class Orientation {
	constructor(f0, f1, f2, f3, b0, b1, b2, b3, startAngle) {
		this.f0 = f0;
		this.f1 = f1;
		this.f2 = f2;
		this.f3 = f3;
		this.b0 = b0;
		this.b1 = b1;
		this.b2 = b2;
		this.b3 = b3;
		this.startAngle = startAngle;
	}
}

export class Layout {
	constructor(orientation, size, origin) {
		this.orientation = orientation;
		this.size = size;
		this.origin = origin;
	}
	hexToPixel(h) {
		const M = this.orientation;
		const size = this.size;
		const origin = this.origin;
		const x = (M.f0 * h.q + M.f1 * h.r) * size.x;
		const y = (M.f2 * h.q + M.f3 * h.r) * size.y;
		return new Point(x + origin.x, y + origin.y);
	}
	pixelToHex(p) {
		const M = this.orientation;
		const size = this.size;
		const origin = this.origin;
		const pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
		const q = M.b0 * pt.x + M.b1 * pt.y;
		const r = M.b2 * pt.x + M.b3 * pt.y;
		return new Hex(q, r, -q - r);
	}
	hexCornerOffset(corner) {
		const M = this.orientation;
		const size = this.size;
		const angle = (2.0 * Math.PI * (M.startAngle - corner)) / 6.0;
		return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
	}
	polygonCorners(h) {
		const corners = [];
		const center = this.hexToPixel(h);
		for (let i = 0; i < 6; i++) {
			const offset = this.hexCornerOffset(i);
			corners.push(new Point(center.x + offset.x, center.y + offset.y));
		}
		return corners;
	}
}
Layout.pointy = new Orientation(
	Math.sqrt(3.0),
	Math.sqrt(3.0) / 2.0,
	0.0,
	3.0 / 2.0,
	Math.sqrt(3.0) / 3.0,
	-1.0 / 3.0,
	0.0,
	2.0 / 3.0,
	0.5
);
Layout.flat = new Orientation(
	3.0 / 2.0,
	0.0,
	Math.sqrt(3.0) / 2.0,
	Math.sqrt(3.0),
	2.0 / 3.0,
	0.0,
	-1.0 / 3.0,
	Math.sqrt(3.0) / 3.0,
	0.0
);

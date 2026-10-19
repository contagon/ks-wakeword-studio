//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = {}, n = [], r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", w = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, T = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), E = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, D = /-\w/g, O = E((e) => e.replace(D, (e) => e.slice(1).toUpperCase())), ee = /\B([A-Z])/g, k = E((e) => e.replace(ee, "-$1").toLowerCase()), te = E((e) => e.charAt(0).toUpperCase() + e.slice(1)), ne = E((e) => e ? `on${te(e)}` : ""), re = (e, t) => !Object.is(e, t), ie = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, A = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, ae = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, oe, se = () => oe ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function ce(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? fe(r) : ce(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var le = /;(?![^(]*\))/g, ue = /:([^]+)/, de = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function fe(e) {
	let t = {};
	return e.replace(de, (e) => e.startsWith("/*") ? "" : e).split(le).forEach((e) => {
		if (e) {
			let n = e.split(ue);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function j(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = j(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var pe = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function me(e) {
	return !!e || e === "";
}
function he(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = ye(e[i], t[i], n);
	return r;
}
function ge(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && ye(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function _e(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? ge(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !ye(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function ve(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function ye(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? ve(e, t, n, he) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : ve(e, t, n, _e) : String(e) === String(t))));
}
function be(e, t) {
	return e.findIndex((e) => ye(e, t));
}
var xe = (e) => !!(e && e.__v_isRef === !0), M = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? xe(e) ? M(e.value) : JSON.stringify(e, Se, 2) : String(e), Se = (e, t) => xe(t) ? Se(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Ce(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Ce(e)) } : _(t) ? Ce(t) : v(t) && !d(t) && !C(t) ? String(t) : t, Ce = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, N, we = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && N && (N.active ? (this.parent = N, this.index = (N.scopes || (N.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].pause();
			}
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].resume();
			}
			let n = this.effects.slice();
			for (e = 0, t = n.length; e < t; e++) n[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = N;
			try {
				return N = this, e();
			} finally {
				N = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = N, N = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (N === this) N = this.prevScope;
			else {
				let e = N;
				for (; e;) {
					if (e.prevScope === this) {
						e.prevScope = this.prevScope;
						break;
					}
					e = e.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				let e = this.scopes.slice();
				for (t = 0, n = e.length; t < n; t++) e[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function Te() {
	return N;
}
function Ee(e, t = !1) {
	N && N.cleanups.push(e);
}
var P, De = /* @__PURE__ */ new WeakSet(), Oe = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, N && (N.active ? N.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, De.has(this) && (De.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Me(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ge(this), Fe(this);
		let e = P, t = Ve;
		P = this, Ve = !0;
		try {
			return this.fn();
		} finally {
			Ie(this), P = e, Ve = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) ze(e);
			this.deps = this.depsTail = void 0, Ge(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? De.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Le(this) && this.run();
	}
	get dirty() {
		return Le(this);
	}
}, ke = 0, Ae, je;
function Me(e, t = !1) {
	e.flags |= 8, t ? (e.next = je, je = e) : (e.next = Ae, Ae = e);
}
function Ne() {
	ke++;
}
function Pe() {
	if (--ke > 0) return;
	if (je) {
		let e = je;
		for (je = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Ae;) {
		let t = Ae;
		for (Ae = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function Fe(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ie(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), ze(r), Be(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Le(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Re(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Re(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ke) || (e.globalVersion = Ke, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Le(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = P, r = Ve;
	P = e, Ve = !0;
	try {
		Fe(e);
		let n = e.fn(e._value);
		(t.version === 0 || re(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		P = n, Ve = r, Ie(e), e.flags &= -3;
	}
}
function ze(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) ze(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Be(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Ve = !0, He = [];
function Ue() {
	He.push(Ve), Ve = !1;
}
function We() {
	let e = He.pop();
	Ve = e === void 0 || e;
}
function Ge(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = P;
		P = void 0;
		try {
			t();
		} finally {
			P = e;
		}
	}
}
var Ke = 0, qe = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Je = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!P || !Ve || P === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== P) t = this.activeLink = new qe(P, this), P.deps ? (t.prevDep = P.depsTail, P.depsTail.nextDep = t, P.depsTail = t) : P.deps = P.depsTail = t, Ye(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = P.depsTail, t.nextDep = void 0, P.depsTail.nextDep = t, P.depsTail = t, P.deps === t && (P.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Ke++, this.notify(e);
	}
	notify(e) {
		Ne();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Pe();
		}
	}
};
function Ye(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Ye(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Xe = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ Symbol(""), Qe = /* @__PURE__ */ Symbol(""), $e = /* @__PURE__ */ Symbol("");
function et(e, t, n) {
	if (Ve && P) {
		let t = Xe.get(e);
		t || Xe.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Je()), r.map = t, r.key = n), r.track();
	}
}
function tt(e, t, n, r, i, a) {
	let o = Xe.get(e);
	if (!o) {
		Ke++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Ne(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === $e || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get($e)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "delete":
				i || (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "set": f(e) && s(o.get(Ze));
		}
	}
	Pe();
}
function nt(e) {
	let t = /* @__PURE__ */ F(e);
	return t === e || (et(t, "iterate", $e), /* @__PURE__ */ Ht(e)) ? t : /* @__PURE__ */ Vt(e) ? /* @__PURE__ */ Bt(e) ? t.map((e) => Kt(Gt(e))) : t.map(Kt) : t.map(Gt);
}
function rt(e) {
	return et(e = /* @__PURE__ */ F(e), "iterate", $e), e;
}
function it(e, t) {
	return /* @__PURE__ */ Vt(e) ? Kt(/* @__PURE__ */ Bt(e) ? Gt(t) : t) : Gt(t);
}
var at = {
	__proto__: null,
	[Symbol.iterator]() {
		return ot(this, Symbol.iterator, (e) => it(this, e));
	},
	concat(...e) {
		return nt(this).concat(...e.map((e) => d(e) ? nt(e) : e));
	},
	entries() {
		return ot(this, "entries", (e) => (e[1] = it(this, e[1]), e));
	},
	every(e, t) {
		return lt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return lt(this, "filter", e, t, (e) => e.map((e) => it(this, e)), arguments);
	},
	find(e, t) {
		return lt(this, "find", e, t, (e) => it(this, e), arguments);
	},
	findIndex(e, t) {
		return lt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return lt(this, "findLast", e, t, (e) => it(this, e), arguments);
	},
	findLastIndex(e, t) {
		return lt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return lt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return dt(this, "includes", e);
	},
	indexOf(...e) {
		return dt(this, "indexOf", e);
	},
	join(e) {
		return nt(this).join(e);
	},
	lastIndexOf(...e) {
		return dt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return lt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return ft(this, "pop");
	},
	push(...e) {
		return ft(this, "push", e);
	},
	reduce(e, ...t) {
		return ut(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return ut(this, "reduceRight", e, t);
	},
	shift() {
		return ft(this, "shift");
	},
	some(e, t) {
		return lt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return ft(this, "splice", e);
	},
	toReversed() {
		return nt(this).toReversed();
	},
	toSorted(e) {
		return nt(this).toSorted(e);
	},
	toSpliced(...e) {
		return nt(this).toSpliced(...e);
	},
	unshift(...e) {
		return ft(this, "unshift", e);
	},
	values() {
		return ot(this, "values", (e) => it(this, e));
	}
};
function ot(e, t, n) {
	let r = rt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Ht(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => st(a.next(), n), i !== ct[t] && Object.defineProperties(e, {
				return: { get() {
					let e = a.return;
					return typeof e == "function" ? e.bind(a) : e;
				} },
				throw: { get() {
					let e = a.throw;
					return typeof e == "function" ? e.bind(a) : e;
				} }
			}), e;
		}
		a._next = a.next, a.next = () => st(a._next(), n);
	}
	return a;
}
function st(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var ct = Array.prototype;
function lt(e, t, n, r, i, a) {
	let o = rt(e), s = o !== e && !/* @__PURE__ */ Ht(e), c = o[t];
	if (c !== ct[t]) {
		let t = c.apply(e, a);
		return s ? Gt(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, it(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function ut(e, t, n, r) {
	let i = rt(e), a = i !== e && !/* @__PURE__ */ Ht(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = it(e, t)), n.call(this, t, it(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? it(e, c) : c;
}
function dt(e, t, n) {
	let r = /* @__PURE__ */ F(e);
	et(r, "iterate", $e);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Ut(n[0]) ? (n[0] = /* @__PURE__ */ F(n[0]), r[t](...n)) : i;
}
function ft(e, t, n = []) {
	Ue(), Ne();
	let r = (/* @__PURE__ */ F(e))[t].apply(e, n);
	return Pe(), We(), r;
}
var pt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), mt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function ht(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ F(this);
	return et(t, "has", e), t.hasOwnProperty(e);
}
var gt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Pt : Nt : i ? Mt : jt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = at[t])) return e;
			if (t === "hasOwnProperty") return ht;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ qt(e) ? e : n);
		if ((_(t) ? mt.has(t) : pt(t)) || (r || et(e, "get", t), i)) return o;
		if (/* @__PURE__ */ qt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ Rt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ Rt(o) : /* @__PURE__ */ It(o) : o;
	}
}, _t = class extends gt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Vt(i);
			if (!/* @__PURE__ */ Ht(n) && !/* @__PURE__ */ Vt(n) && (i = /* @__PURE__ */ F(i), n = /* @__PURE__ */ F(n)), !a && /* @__PURE__ */ qt(i) && !/* @__PURE__ */ qt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ qt(e) ? e : r);
		return e === /* @__PURE__ */ F(r) && s && (o ? re(n, i) && tt(e, "set", t, n, i) : tt(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && tt(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !mt.has(t)) && et(e, "has", t), n;
	}
	ownKeys(e) {
		return et(e, "iterate", d(e) ? "length" : Ze), Reflect.ownKeys(e);
	}
}, vt = class extends gt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, yt = /* @__PURE__ */ new _t(), bt = /* @__PURE__ */ new vt(), xt = /* @__PURE__ */ new _t(!0), St = (e) => e, Ct = (e) => Reflect.getPrototypeOf(e);
function wt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ F(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? St : t ? Kt : Gt;
		return !t && et(a, "iterate", l ? Qe : Ze), s(Object.create(u), { next() {
			let { value: e, done: t } = u.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: c ? [d(e[0]), d(e[1])] : d(e),
				done: t
			};
		} });
	};
}
function Tt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Et(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ F(r), a = /* @__PURE__ */ F(n);
			e || (re(n, a) && et(i, "get", n), et(i, "get", a));
			let { has: o } = Ct(i), s = t ? St : e ? Kt : Gt;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && et(/* @__PURE__ */ F(t), "iterate", Ze), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ F(n), i = /* @__PURE__ */ F(t);
			return e || (re(t, i) && et(r, "has", t), et(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ F(a), s = t ? St : e ? Kt : Gt;
			return !e && et(o, "iterate", Ze), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: Tt("add"),
		set: Tt("set"),
		delete: Tt("delete"),
		clear: Tt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ F(this), r = Ct(n), i = /* @__PURE__ */ F(e), a = !t && !/* @__PURE__ */ Ht(e) && !/* @__PURE__ */ Vt(e) ? i : e;
			return r.has.call(n, a) || re(e, a) && r.has.call(n, e) || re(i, a) && r.has.call(n, i) || (n.add(a), tt(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Ht(n) && !/* @__PURE__ */ Vt(n) && (n = /* @__PURE__ */ F(n));
			let r = /* @__PURE__ */ F(this), { has: i, get: a } = Ct(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ F(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? re(n, s) && tt(r, "set", e, n, s) : tt(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ F(this), { has: n, get: r } = Ct(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ F(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && tt(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ F(this), t = e.size !== 0, n = e.clear();
			return t && tt(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = wt(r, e, t);
	}), n;
}
function Dt(e, t) {
	let n = Et(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Ot = { get: /* @__PURE__ */ Dt(!1, !1) }, kt = { get: /* @__PURE__ */ Dt(!1, !0) }, At = { get: /* @__PURE__ */ Dt(!0, !1) }, jt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap();
function Ft(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function It(e) {
	return /* @__PURE__ */ Vt(e) ? e : zt(e, !1, yt, Ot, jt);
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
	return zt(e, !1, xt, kt, Mt);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
	return zt(e, !0, bt, At, Nt);
}
function zt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Ft(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return /* @__PURE__ */ Vt(e) ? /* @__PURE__ */ Bt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Ut(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ F(t) : e;
}
function Wt(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && A(e, "__v_skip", !0), e;
}
var Gt = (e) => v(e) ? /* @__PURE__ */ It(e) : e, Kt = (e) => v(e) ? /* @__PURE__ */ Rt(e) : e;
// @__NO_SIDE_EFFECTS__
function qt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function I(e) {
	return Yt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Jt(e) {
	return Yt(e, !0);
}
function Yt(e, t) {
	return /* @__PURE__ */ qt(e) ? e : new Xt(e, t);
}
var Xt = class {
	constructor(e, t) {
		this.dep = new Je(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ F(e), this._value = t ? e : Gt(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Ht(e) || /* @__PURE__ */ Vt(e);
		e = n ? e : /* @__PURE__ */ F(e), re(e, t) && (this._rawValue = e, this._value = n ? e : Gt(e), this.dep.trigger());
	}
};
function L(e) {
	return /* @__PURE__ */ qt(e) ? e.value : e;
}
var Zt = {
	get: (e, t, n) => t === "__v_raw" ? e : L(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ qt(i) && !/* @__PURE__ */ qt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Qt(e) {
	return /* @__PURE__ */ Bt(e) ? e : new Proxy(e, Zt);
}
var $t = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Je(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ke - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && P !== this) return Me(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Re(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function en(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new $t(r, i, n);
}
var tn = {}, nn = /* @__PURE__ */ new WeakMap(), rn = void 0;
function an(e, t = !1, n = rn) {
	if (n) {
		let t = nn.get(n);
		t || nn.set(n, t = []), t.push(e);
	}
}
function on(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Ht(e) || o === !1 || o === 0 ? sn(e, 1) : sn(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ qt(e) ? (g = () => e.value, y = /* @__PURE__ */ Ht(e)) : /* @__PURE__ */ Bt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ Bt(e) || /* @__PURE__ */ Ht(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ qt(e)) return e.value;
		if (/* @__PURE__ */ Bt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Ue();
			try {
				_();
			} finally {
				We();
			}
		}
		let t = rn;
		rn = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			rn = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => sn(e(), t);
	}
	let x = Te(), S = () => {
		m.stop(), x && x.active && c(x.effects, m);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			try {
				return e(...t);
			} finally {
				S();
			}
		};
	}
	let C = b ? Array(e.length).fill(tn) : tn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => re(e, C[t])) : re(t, C))) {
					let e = rn;
					Ue();
					try {
						_ && _(), rn = m;
						let e = [
							t,
							C === tn ? void 0 : b && C[0] === tn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						rn = e, We();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Oe(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => an(e, !1, m), _ = m.onStop = () => {
		let e = nn.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			nn.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function sn(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ qt(e)) sn(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) sn(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		sn(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) sn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && sn(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function cn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		un(e, t, n);
	}
}
function ln(e, t, n, r) {
	if (h(e)) {
		let i = cn(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			un(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(ln(e[a], t, n, r));
		return i;
	}
}
function un(e, n, r, i = !0) {
	let a = n ? n.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, a = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
			}
			t = t.parent;
		}
		if (o) {
			Ue(), cn(o, null, 10, [
				e,
				i,
				a
			]), We();
			return;
		}
	}
	dn(e, r, a, i, s);
}
function dn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var fn = [], pn = -1, mn = [], hn = null, gn = 0, _n = /* @__PURE__ */ Promise.resolve(), vn = null;
function yn(e) {
	let t = vn || _n;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function bn(e) {
	let t = pn + 1, n = fn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = fn[r], a = On(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function xn(e) {
	if (!(e.flags & 1)) {
		let t = On(e), n = fn[fn.length - 1];
		!n || !(e.flags & 2) && t >= On(n) ? fn.push(e) : fn.splice(bn(t), 0, e), e.flags |= 1, Sn();
	}
}
function Sn() {
	vn ||= _n.then(kn);
}
function Cn(e) {
	if (!d(e)) hn && e.id === -1 ? hn.splice(gn + 1, 0, e) : e.flags & 1 || (mn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) mn.push(e[t]);
	Sn();
}
function wn(e, t, n, r = pn + 1) {
	for (; r < fn.length; r++) {
		let n = fn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			fn.splice(r, 1), r = e ? r - 1 : pn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function Tn(e, t, n = 0) {
	if (mn.length) {
		let e = mn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < mn.length; i++) {
				let a = mn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? mn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => On(e) - On(t));
		if (mn.length = r, hn) {
			for (let e = 0; e < i.length; e++) hn.push(i[e]);
			return;
		}
		for (hn = i, gn = 0; gn < hn.length; gn++) {
			let e = hn[gn];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		hn = null, gn = 0;
	}
}
var En = !1;
function Dn(e, t) {
	if (En) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(mn);
	e(), En = !0;
	try {
		wn(void 0, t), Tn(void 0, n, t);
	} finally {
		En = !1;
	}
}
var On = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function kn(e) {
	try {
		for (pn = 0; pn < fn.length; pn++) {
			let e = fn[pn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), cn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; pn < fn.length; pn++) {
			let e = fn[pn];
			e && (e.flags &= -2);
		}
		pn = -1, fn.length = 0, Tn(e), vn = null, (fn.length || mn.length) && kn(e);
	}
}
var An = null, jn = null;
function Mn(e) {
	let t = An;
	return An = e, jn = e && e.type.__scopeId || null, t;
}
function Nn(e, t = An, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && $i(-1);
		let i = Mn(t), a = Yi.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Yi.length; e > a; e--) Zi();
			Mn(i), r._d && $i(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function R(e, n) {
	if (An === null) return e;
	let r = Na(An), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && sn(o), i.push({
			dir: a,
			instance: r,
			value: o,
			oldValue: void 0,
			arg: s,
			modifiers: c
		}));
	}
	return e;
}
function Pn(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Ue(), ln(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), We());
	}
}
function Fn(e, t) {
	if (ya) {
		let n = ya.provides, r = ya.parent && ya.parent.provides;
		r === n && (n = ya.provides = Object.create(r)), n[e] = t;
	}
}
function In(e, t, n = !1) {
	let r = ba();
	if (r || ti) {
		let i = ti ? ti._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Ln = /* @__PURE__ */ Symbol.for("v-scx"), Rn = () => In(Ln);
function z(e, t, n) {
	return zn(e, t, n);
}
function zn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Ea) {
		if (c === "sync") {
			let e = Rn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = ya;
	u.call = (e, t, n) => ln(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Ni(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : xn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = on(e, n, u);
	return Ea && (f ? f.push(h) : d && h()), h;
}
function Bn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Vn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Ca(this), s = zn(i, a.bind(r), n);
	return o(), s;
}
function Vn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Hn = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ Symbol("_vte"), Wn = (e) => e.__isTeleport, Gn = (e) => e && (e.disabled || e.disabled === ""), Kn = (e) => e && (e.defer || e.defer === ""), qn = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Jn = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Yn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, Xn = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Gn(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Gn(e.props), r = e.target = Yn(e.props, m), a = tr(r, e, h, p);
			r && (o !== "svg" && qn(r) ? o = "svg" : o !== "mathml" && Jn(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), er(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Hn.get(e) === t) {
					if (Hn.delete(e), Gn(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), er(e, !0);
					}
					x(e);
				}
			};
			Hn.set(e, t), Ni(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Kn(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), er(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Hn.get(e);
			if (u) {
				u.flags |= 8, Hn.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Gn(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || qn(p) ? o = "svg" : (o === "mathml" || Jn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), zi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Zn(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Yn(t.props, m);
				e && (t.target = e, Zn(t, e, null, l, 0));
			} else g && Zn(t, p, h, l, 1);
			er(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Gn(f), m = a || !p, h = Hn.get(e);
		if (h && (h.flags |= 8, Hn.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: Zn,
	hydrate: Qn
};
function Zn(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Hn.has(e) && (!d || Gn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function Qn(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, n) {
		let r = n;
		for (; r;) {
			if (r && r.nodeType === 8) {
				if (r.data === "teleport start anchor") t.targetStart = r;
				else if (r.data === "teleport anchor") {
					t.targetAnchor = r, e._lpa = t.targetAnchor && o(t.targetAnchor);
					break;
				}
			}
			r = o(r);
		}
	}
	function p(e, t) {
		t.anchor = d(o(e), t, s(e), n, r, i, a);
	}
	let m = t.target = Yn(t.props, c), h = Gn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || tr(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || tr(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), er(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var $n = Xn;
function er(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function tr(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Un] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var nr = /* @__PURE__ */ Symbol("_leaveCb");
function rr(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== qi) {
			t = n;
			break;
		}
	}
	return t;
}
function ir(e) {
	if (!mr(e)) return Wn(e.type) && e.children ? rr(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function ar(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		ar(Wn(n.type) && ir(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === V && d(e.children)) {
		let n = ci(e.children, !1);
		n && ar(n, t);
	}
}
function or(e) {
	if (e.component) return or(e.component.subTree);
	if (e.type === V) {
		let t = d(e.children) && ci(e.children, !1);
		return t ? or(t) : void 0;
	}
	if (e.type !== qi) return e;
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function cr(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function lr(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var ur = /* @__PURE__ */ new WeakMap();
function dr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => dr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (pr(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && dr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? Na(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ F(v), b = v === t ? i : (e) => !lr(_, e) && u(y, e), x = (e, t) => !(t && lr(_, t));
	if (m != null && m !== p) {
		if (fr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ qt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) cn(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ qt(p);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? b(p) ? v[p] : _[p] : x(p) || !e.k ? p.value : _[e.k];
					if (o) d(n) && c(n, s);
					else if (d(n)) n.includes(s) || n.push(s);
					else if (t) _[p] = [s], b(p) && (v[p] = _[p]);
					else {
						let t = [s];
						x(p, e.k) && (p.value = t), e.k && (_[e.k] = t);
					}
				} else t ? (_[p] = l, b(p) && (v[p] = l)) : n && (x(p, e.k) && (p.value = l), e.k && (_[e.k] = l));
			};
			if (l) {
				let t = () => {
					i(), ur.delete(e);
				};
				t.id = -1, ur.set(e, t), Ni(t, r);
			} else fr(e), i();
		}
	}
}
function fr(e) {
	let t = ur.get(e);
	t && (t.flags |= 8, ur.delete(e));
}
se().requestIdleCallback, se().cancelIdleCallback;
var pr = (e) => !!e.type.__asyncLoader, mr = (e) => e.type.__isKeepAlive;
function hr(e, t) {
	_r(e, "a", t);
}
function gr(e, t) {
	_r(e, "da", t);
}
function _r(e, t, n = ya) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (yr(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) mr(e.parent.vnode) && vr(r, t, n, e), e = e.parent;
	}
}
function vr(e, t, n, r) {
	let i = yr(t, e, r, !0);
	Er(() => {
		c(r[t], i);
	}, n);
}
function yr(e, t, n = ya, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ue();
			let i = Ca(n), a = ln(t, n, e, r);
			return i(), We(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var br = (e) => (t, n = ya) => {
	(!Ea || e === "sp") && yr(e, (...e) => t(...e), n);
}, xr = br("bm"), Sr = br("m"), Cr = br("bu"), wr = br("u"), Tr = br("bum"), Er = br("um"), Dr = br("sp"), Or = br("rtg"), kr = br("rtc");
function Ar(e, t = ya) {
	yr("ec", e, t);
}
var jr = /* @__PURE__ */ Symbol.for("v-ndc");
function B(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ Bt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Ht(e), s = /* @__PURE__ */ Vt(e), e = rt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Kt(Gt(e[n])) : Gt(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (v(e)) {
		if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
		else {
			let n = Object.keys(e);
			i = Array(n.length);
			for (let r = 0, o = n.length; r < o; r++) {
				let o = n[r];
				i[r] = t(e[o], o, r, a && a[r]);
			}
		}
	} else i = [];
	return n && (n[r] = i), i;
}
var Mr = (e) => e ? Ta(e) ? Na(e) : Mr(e.parent) : null, Nr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Mr(e.parent),
	$root: (e) => Mr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Hr(e),
	$forceUpdate: (e) => e.f ||= () => {
		xn(e.update);
	},
	$nextTick: (e) => e.n ||= yn.bind(e.proxy),
	$watch: (e) => Bn.bind(e)
}), Pr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Fr = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (Pr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Lr && (s[n] = 0);
		}
		let d = Nr[n], f, p;
		if (d) return n === "$attrs" && et(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Pr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Pr(n, c) || u(o, c) || u(i, c) || u(Nr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Ir(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
var Lr = !0;
function Rr(e) {
	let t = Hr(e), n = e.proxy, i = e.ctx;
	Lr = !1, t.beforeCreate && Br(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: ee, expose: k, inheritAttrs: te, components: ne, directives: re, filters: ie } = t;
	if (u && zr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ It(t));
	}
	if (Lr = !0, o) for (let e in o) {
		let t = o[e], a = J({
			get: h(t) ? t.bind(n, n) : h(t.get) ? t.get.bind(n, n) : r,
			set: !h(t) && h(t.set) ? t.set.bind(n) : r
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		});
	}
	if (c) for (let e in c) Vr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			Fn(t, e[t]);
		});
	}
	f && Br(f, e, "c");
	function A(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (A(xr, p), A(Sr, m), A(Cr, g), A(wr, _), A(hr, y), A(gr, b), A(Ar, O), A(kr, E), A(Or, D), A(Tr, S), A(Er, w), A(Dr, ee), d(k)) {
		if (k.length) {
			let t = e.exposed ||= {};
			k.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	T && e.render === r && (e.render = T), te != null && (e.inheritAttrs = te), ne && (e.components = ne), re && (e.directives = re), ee && cr(e);
}
function zr(e, t, n = r) {
	d(e) && (e = qr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? In(r.from || n, r.default, !0) : In(r.from || n) : In(r), /* @__PURE__ */ qt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Br(e, t, n) {
	ln(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Vr(e, t, n, r) {
	let i = r.includes(".") ? Vn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && z(i, n);
	} else if (h(e)) z(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Vr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && z(i, r, e);
		}
	}
}
function Hr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Ur(c, e, o, !0)), Ur(c, t, o)), v(t) && a.set(t, c), c;
}
function Ur(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Ur(e, a, n, !0), i && i.forEach((t) => Ur(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Wr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Wr = {
	data: Gr,
	props: Xr,
	emits: Xr,
	methods: Yr,
	computed: Yr,
	beforeCreate: Jr,
	created: Jr,
	beforeMount: Jr,
	mounted: Jr,
	beforeUpdate: Jr,
	updated: Jr,
	beforeDestroy: Jr,
	beforeUnmount: Jr,
	destroyed: Jr,
	unmounted: Jr,
	activated: Jr,
	deactivated: Jr,
	errorCaptured: Jr,
	serverPrefetch: Jr,
	components: Yr,
	directives: Yr,
	watch: Zr,
	provide: Gr,
	inject: Kr
};
function Gr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Kr(e, t) {
	return Yr(qr(e), qr(t));
}
function qr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Jr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Yr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Xr(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Ir(e), Ir(t ?? {})) : t;
}
function Zr(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Jr(e[r], t[r]);
	return n;
}
function Qr() {
	return {
		app: null,
		config: {
			isNativeTag: i,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var $r = 0;
function ei(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = Qr(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: $r++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Fa,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && h(e.install) ? (a.add(e), e.install(l, ...t)) : h(e) && (a.add(e), e(l, ...t))), l;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), l;
			},
			component(e, t) {
				return t ? (i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let u = l._ceVNode || G(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Na(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (ln(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = ti;
				ti = l;
				try {
					return e();
				} finally {
					ti = t;
				}
			}
		};
		return l;
	};
}
var ti = null, ni = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function ri(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ni(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(ae)));
	let c, l = i[c = ne(n)] || i[c = ne(O(n))];
	!l && o && (l = i[c = ne(k(n))]), l && ln(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, ln(u, e, 6, a);
	}
}
var ii = /* @__PURE__ */ new WeakMap();
function ai(e, t, n = !1) {
	let r = n ? ii : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ai(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function oi(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function si(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Mn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = ua(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = ua(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : li(c);
		}
	} catch (t) {
		Yi.length = 0, un(t, e, 1), v = G(qi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = ui(y, a)), b = ca(b, y, !1, !0));
	}
	return n.dirs && (b = ca(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && ar(Wn(b.type) && ir(b) || b, n.transition), v = b, Mn(_), v;
}
function ci(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (na(r)) {
			if (r.type !== qi || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var li = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, ui = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function di(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? fi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (pi(o, r, n) && !oi(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || fi(r, o, l) : !!o;
	return !1;
}
function fi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || pi(t, e, a) && !oi(n, a)) return !0;
	}
	return !1;
}
function pi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !ye(r, i) : r !== i;
}
function mi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var hi = {}, gi = () => Object.create(hi), _i = (e) => Object.getPrototypeOf(e) === hi;
function vi(e, t, n, r = !1) {
	let i = {}, a = gi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), bi(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ Lt(i) : e.type.props ? i : a, e.attrs = a;
}
function yi(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ F(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (oi(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = O(o);
						i[t] = xi(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		bi(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = k(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = xi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && tt(e.attrs, "set", "");
}
function bi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : oi(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ F(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = xi(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function xi(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Ca(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var Si = /* @__PURE__ */ new WeakMap();
function Ci(e, r, i = !1) {
	let a = i ? Si : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Ci(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		wi(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (wi(t)) {
			let n = c[e], r = l[t] = d(n) || h(n) ? { type: n } : s({}, n), i = r.type, a = !1, o = !0;
			if (d(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = h(t) && t.name;
				if (n === "Boolean") {
					a = !0;
					break;
				}
				n === "String" && (o = !1);
			}
			else a = h(i) && i.name === "Boolean";
			r[0] = a, r[1] = o, (a || u(r, "default")) && f.push(t);
		}
	}
	let m = [l, f];
	return v(e) && a.set(e, m), m;
}
function wi(e) {
	return e[0] !== "$" && !T(e);
}
var Ti = (e) => e === "_" || e === "_ctx" || e === "$stable", Ei = (e) => d(e) ? e.map(ua) : [ua(e)], Di = (e, t, n) => {
	if (t._n) return t;
	let r = Nn((...e) => Ei(t(...e)), n);
	return r._c = !1, r;
}, Oi = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ti(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Di(n, i, r);
		else if (i != null) {
			let e = Ei(i);
			t[n] = () => e;
		}
	}
}, ki = (e, t) => {
	let n = Ei(t);
	e.slots.default = () => n;
}, Ai = (e, t, n) => {
	for (let r in t) (n || !Ti(r)) && (e[r] = t[r]);
}, ji = (e, t, n) => {
	let r = e.slots = gi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Ai(r, t, n), n && A(r, "_", e, !0)) : Oi(t, r);
	} else t && ki(e, t);
}, Mi = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Ai(a, n, r) : (o = !n.$stable, Oi(n, a)), s = n;
	} else n && (ki(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ti(e) && s[e] == null && delete a[e];
}, Ni = Gi;
function Pi(e) {
	return Fi(e);
}
function Fi(e, i) {
	let a = se();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !ra(e, t) && (i = _e(e), j(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case Ki:
				y(e, t, r, i);
				break;
			case qi:
				b(e, t, r, i);
				break;
			case Ji:
				e ?? x(t, r, i, s);
				break;
			case V:
				ne(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? re(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ye);
		}
		d != null && a ? dr(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && dr(e.ref, null, o, e, !0);
	}, y = (e, t, n, r) => {
		if (e == null) o(t.el = u(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && f(n, t.children);
		}
	}, b = (e, t, n, r) => {
		e == null ? o(t.el = d(t.children || ""), n, r) : t.el = e.el;
	}, x = (e, t, n, r) => {
		[e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
	}, S = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = h(e), o(e, n, r), e = i;
		o(t, n, r);
	}, C = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, w = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) E(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), ee(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, E = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, Ii(e, a), s, u), _ && Pn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && ma(f, r, e);
		}
		_ && Pn(e, null, r, "beforeMount");
		let v = Ri(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Ni(() => {
			try {
				f && ma(f, r, e), v && g.enter(d), _ && Pn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Wi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? da(e[l]) : ua(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, ee = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Li(r, !1), (g = h.onVnodeBeforeUpdate) && ma(g, r, n, e), f && Pn(n, e, r, "beforeUpdate"), r && Li(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, Ii(n, a), o) : s || le(e, n, l, null, r, i, Ii(n, a), o, !1), u > 0) {
			if (u & 16) te(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && te(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && Ni(() => {
			g && ma(g, r, n, e), f && Pn(n, e, r, "updated");
		}, i);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Ui(c), d = u && (c.type === V || !ra(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, te = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !T(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (T(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, ne = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && zi(e, t, !0)) : le(e, t, n, f, i, a, s, c, l);
	}, re = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : A(t, n, r, i, a, o, c) : ae(e, t, c);
	}, A = (e, t, n, r, i, a, o) => {
		let s = e.component = va(e, r, i);
		if (mr(e) && (s.ctx.renderer = ye), Da(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, oe, o, a), !e.el) {
				let r = s.subTree = G(qi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else oe(s, e, t, n, i, a, o);
	}, ae = (e, t, n) => {
		let r = t.component = e.component;
		if (di(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, ce(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, oe = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Vi(e);
					if (n) {
						t && (t.el = c.el, ce(e, t, o)), n.asyncDep.then(() => {
							Ni(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Li(e, !1), t ? (t.el = c.el, ce(e, t, o)) : t = c, n && ie(n), (d = t.props && t.props.onVnodeBeforeUpdate) && ma(d, s, t, c), Li(e, !0);
				let f = si(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), _e(p), e, i, a), t.el = f.el, u === null && mi(e, f.el), r && Ni(r, i), (d = t.props && t.props.onVnodeUpdated) && Ni(() => ma(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = pr(t);
				if (Li(e, !1), l && ie(l), !m && (o = c && c.onVnodeBeforeMount) && ma(o, d, t), Li(e, !0), s && xe) {
					let t = () => {
						e.subTree = si(e), xe(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = si(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Ni(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Ni(() => ma(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && pr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Ni(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Oe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => xn(u), Li(e, !0), l();
	}, ce = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, yi(e, t.props, r, n), Mi(e, t.children, n), Ue(), wn(e), We();
	}, le = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				de(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				ue(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && ge(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? de(l, d, n, r, i, a, o, s, c) : ge(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, ue = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? da(t[p]) : ua(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? ge(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, de = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? da(t[u]) : ua(t[u]);
			if (ra(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? da(t[p]) : ua(t[p]);
			if (ra(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? da(t[u]) : ua(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) j(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? da(t[u]) : ua(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					j(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && ra(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? j(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Bi(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Ui(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? fe(n, r, p, 2) : _--);
			}
		}
	}, fe = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) fe(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, ye);
		else if (c === V) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) fe(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === Ji) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[nr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Ni(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[nr];
					a._isLeaving && a[nr](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, j = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ue(), dr(s, null, n, e, !0), We()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !pr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && ma(_, t, e), u & 6) he(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Pn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ye, r) : l && !l.hasOnce && (a !== V || d > 0 && d & 64) ? ge(l, t, n, !1, !0) : (a === V && d & 384 || !i && u & 16) && ge(c, t, n), r && pe(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Ni(() => {
			_ && ma(_, t, e), h && Pn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, pe = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === V;
		if (a && !i) {
			me(n, r);
			return;
		}
		if (t === Ji) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? or(e) : e, c = () => {
			a ? m(n) && me(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, me = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, he = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Hi(c), Hi(l), r && ie(r), i.stop(), a ? (a.flags |= 8, j(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, j(o, e, t, n)), s && Ni(s, t), Ni(() => {
			e.isUnmounted = !0;
		}, t);
	}, ge = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) j(e[o], t, n, r, i);
	}, _e = (e) => {
		if (e.shapeFlag & 6) return _e(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Un];
		return n ? h(n) : t;
	}, ve = (e, t, n) => {
		Dn(() => {
			e == null ? t._vnode && j(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : _a());
	}, ye = {
		p: v,
		um: j,
		m: fe,
		r: pe,
		mt: A,
		mc: O,
		pc: le,
		pbc: k,
		n: _e,
		o: e
	}, be, xe;
	return i && ([be, xe] = i(ye)), {
		render: ve,
		hydrate: be,
		createApp: ei(ve, be)
	};
}
function Ii({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Li({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ri(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function zi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = da(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && zi(t, a)), a.type === Ki && (a.patchFlag === -1 && (a = i[e] = da(a)), a.el = t.el), a.type === qi && !a.el && (a.el = t.el);
	}
}
function Bi(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function Vi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Vi(t);
}
function Hi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Ui(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Ui(t.subTree) : null;
}
var Wi = (e) => e.__isSuspense;
function Gi(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Cn(e);
}
var V = /* @__PURE__ */ Symbol.for("v-fgt"), Ki = /* @__PURE__ */ Symbol.for("v-txt"), qi = /* @__PURE__ */ Symbol.for("v-cmt"), Ji = /* @__PURE__ */ Symbol.for("v-stc"), Yi = [], Xi = null;
function H(e = !1) {
	Yi.push(Xi = e ? null : []);
}
function Zi() {
	Yi.pop(), Xi = Yi[Yi.length - 1] || null;
}
var Qi = 1;
function $i(e, t = !1) {
	Qi += e, e < 0 && Xi && t && (Xi.hasOnce = !0);
}
function ea(e) {
	return e.dynamicChildren = Qi > 0 ? Xi || n : null, Zi(), Qi > 0 && Xi && Xi.push(e), e;
}
function U(e, t, n, r, i, a) {
	return ea(W(e, t, n, r, i, a, !0));
}
function ta(e, t, n, r, i) {
	return ea(G(e, t, n, r, i, !0));
}
function na(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function ra(e, t) {
	return e.type === t.type && e.key === t.key;
}
var ia = ({ key: e }) => e ?? null, aa = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ qt(e) || h(e) ? {
	i: An,
	r: e,
	k: t,
	f: !!n
} : e);
function W(e, t = null, n = null, r = 0, i = null, a = e === V ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && ia(t),
		ref: t && aa(t),
		scopeId: jn,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: An
	};
	return s ? (fa(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), Qi > 0 && !o && Xi && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Xi.push(c), c;
}
var G = oa;
function oa(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === jr) && (e = qi), na(e)) {
		let r = ca(e, t, !0);
		return n && fa(r, n), Qi > 0 && !a && Xi && (r.shapeFlag & 6 ? Xi[Xi.indexOf(e)] = r : Xi.push(r)), r.patchFlag = -2, r;
	}
	if (Pa(e) && (e = e.__vccOpts), t) {
		t = sa(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = j(e)), v(n) && (/* @__PURE__ */ Ut(n) && !d(n) && (n = s({}, n)), t.style = ce(n));
	}
	let o = g(e) ? 1 : Wi(e) ? 128 : Wn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return W(e, t, n, r, i, o, a, !0);
}
function sa(e) {
	return e ? /* @__PURE__ */ Ut(e) || _i(e) ? s({}, e) : e : null;
}
function ca(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? pa(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && ia(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(aa(t)) : [a, aa(t)] : aa(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== V ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && ca(e.ssContent),
		ssFallback: e.ssFallback && ca(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && ar(u, c.clone(u)), u;
}
function K(e = " ", t = 0) {
	return G(Ki, null, e, t);
}
function la(e, t) {
	let n = G(Ji, null, e);
	return n.staticCount = t, n;
}
function q(e = "", t = !1) {
	return t ? (H(), ta(qi, null, e)) : G(qi, null, e);
}
function ua(e) {
	return e == null || typeof e == "boolean" ? G(qi) : d(e) ? G(V, null, e.slice()) : na(e) ? da(e) : G(Ki, null, String(e));
}
function da(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : ca(e);
}
function fa(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), fa(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !_i(t) ? t._ctx = An : r === 3 && An && (An.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			fa(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: An
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [K(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function pa(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = j([t.class, r.class]));
		else if (e === "style") t.style = ce([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function ma(e, t, n, r = null) {
	ln(e, t, 7, [n, r]);
}
var ha = Qr(), ga = 0;
function _a() {
	return ga;
}
function va(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || ha, o = {
		uid: ga++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new we(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: Ci(i, a),
		emitsOptions: ai(i, a),
		emit: null,
		emitted: null,
		propsDefaults: t,
		inheritAttrs: i.inheritAttrs,
		ctx: t,
		data: t,
		props: t,
		attrs: t,
		slots: t,
		refs: t,
		setupState: t,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ri.bind(null, o), e.ce && e.ce(o), o;
}
var ya = null, ba = () => ya || An, xa, Sa;
{
	let e = se(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	xa = t("__VUE_INSTANCE_SETTERS__", (e) => ya = e), Sa = t("__VUE_SSR_SETTERS__", (e) => Ea = e);
}
var Ca = (e) => {
	let t = ya;
	return xa(e), e.scope.on(), () => {
		e.scope.off(), xa(t);
	};
}, wa = () => {
	ya && ya.scope.off(), xa(null);
};
function Ta(e) {
	return e.vnode.shapeFlag & 4;
}
var Ea = !1;
function Da(e, t = !1, n = !1) {
	t && Sa(t);
	let { props: r, children: i } = e.vnode, a = Ta(e);
	vi(e, r, a, t), ji(e, i, n || t);
	let o = a ? Oa(e, t) : void 0;
	return t && Sa(!1), o;
}
function Oa(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Fr);
	let { setup: r } = n;
	if (r) {
		Ue();
		let n = e.setupContext = r.length > 1 ? Ma(e) : null, i = Ca(e), a = cn(r, e, 0, [e.props, n]), o = y(a);
		if (We(), i(), (o || e.sp) && !pr(e) && cr(e), o) {
			if (a.then(wa, wa), t) return a.then((n) => {
				Sa(!0);
				try {
					ka(e, n, t);
				} finally {
					Sa(!1);
				}
			}).catch((t) => {
				un(t, e, 0);
			});
			e.asyncDep = a;
		} else ka(e, a, t);
	} else Aa(e, t);
}
function ka(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Qt(t)), Aa(e, n);
}
function Aa(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = Ca(e);
		Ue();
		try {
			Rr(e);
		} finally {
			We(), t();
		}
	}
}
var ja = { get(e, t) {
	return et(e, "get", ""), e[t];
} };
function Ma(e) {
	return {
		attrs: new Proxy(e.attrs, ja),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Na(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Qt(Wt(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Nr) return Nr[n](e);
		},
		has(e, t) {
			return t in e || t in Nr;
		}
	}) : e.proxy;
}
function Pa(e) {
	return h(e) && "__vccOpts" in e;
}
var J = (e, t) => /* @__PURE__ */ en(e, t, Ea), Fa = "3.5.44", Ia = void 0, La = typeof window < "u" && window.trustedTypes;
if (La) try {
	Ia = /* @__PURE__ */ La.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ra = Ia ? (e) => Ia.createHTML(e) : (e) => e, za = "http://www.w3.org/2000/svg", Ba = "http://www.w3.org/1998/Math/MathML", Va = typeof document < "u" ? document : null, Ha = Va && /* @__PURE__ */ Va.createElement("template"), Ua = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Va.createElementNS(za, e) : t === "mathml" ? Va.createElementNS(Ba, e) : n ? Va.createElement(e, { is: n }) : Va.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Va.createTextNode(e),
	createComment: (e) => Va.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Va.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Ha.innerHTML = Ra(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Ha.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Wa = /* @__PURE__ */ Symbol("_vtc");
function Ga(e, t, n) {
	let r = e[Wa];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ka = /* @__PURE__ */ Symbol("_vod"), qa = /* @__PURE__ */ Symbol("_vsh"), Ja = /* @__PURE__ */ Symbol(""), Ya = /(?:^|;)\s*display\s*:/;
function Xa(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? Qa(r, t, "");
			}
			else for (let e in t) n[e] ?? Qa(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? Qa(r, i, "") : no(e, i, !g(t) && t ? t[i] : void 0, o) || Qa(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Ja];
			e && (n += ";" + e), r.cssText = n, a = Ya.test(n);
		}
	} else t && e.removeAttribute("style");
	Ka in e && ((!i || t !== n) && (e[Ka] = a ? r.display : ""), e[qa] && (r.display = "none"));
}
var Za = /\s*!important$/;
function Qa(e, t, n) {
	if (d(n)) n.forEach((n) => Qa(e, t, n));
	else if (n ??= "", t.startsWith("--")) Za.test(n) ? e.setProperty(t, n.replace(Za, ""), "important") : e.setProperty(t, n);
	else {
		let r = to(e, t);
		Za.test(n) ? e.setProperty(k(r), n.replace(Za, ""), "important") : e[r] = n;
	}
}
var $a = [
	"Webkit",
	"Moz",
	"ms"
], eo = {};
function to(e, t) {
	let n = eo[t];
	if (n) return n;
	let r = O(t);
	if (r !== "filter" && r in e) return eo[t] = r;
	r = te(r);
	for (let n = 0; n < $a.length; n++) {
		let i = $a[n] + r;
		if (i in e) return eo[t] = i;
	}
	return t;
}
function no(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var ro = "http://www.w3.org/1999/xlink";
function io(e, t, n, r, i, a = pe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ro, t.slice(6, t.length)) : e.setAttributeNS(ro, t, n) : n == null || a && !me(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function ao(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ra(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		(r !== i || !("_value" in e)) && (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = me(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function oo(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function so(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var co = /* @__PURE__ */ Symbol("_vei");
function lo(e, t, n, r, i = null) {
	let a = e[co] || (e[co] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = po(t);
		r ? oo(e, n, a[t] = _o(r, i), s) : o && (so(e, n, o, s), a[t] = void 0);
	}
}
var uo = /(Once|Passive|Capture)$/, fo = /^on:?(?:Once|Passive|Capture)$/;
function po(e) {
	let t, n;
	for (; (n = e.match(uo)) && !fo.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var mo = 0, ho = /* @__PURE__ */ Promise.resolve(), go = () => mo ||= (ho.then(() => mo = 0), Date.now());
function _o(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (d(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && ln(e, t, 5, a);
			}
		} else ln(r, t, 5, [e]);
	};
	return n.value = e, n.attached = go(), n;
}
var vo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, yo = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Ga(e, r, c) : t === "style" ? Xa(e, n, r) : a(t) ? o(t) || lo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : bo(e, t, r, c)) ? (ao(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && io(e, t, r, c, s, t !== "value")) : e._isVueCE && (xo(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? ao(e, O(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), io(e, t, r, c));
};
function bo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && vo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return vo(t) && g(n) ? !1 : t in e;
}
function xo(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = O(t);
	return Array.isArray(n) ? n.some((e) => O(e) === r) : Object.keys(n).some((e) => O(e) === r);
}
var So = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => ie(t, e) : t;
};
function Co(e) {
	e.target.composing = !0;
}
function wo(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var To = /* @__PURE__ */ Symbol("_assign"), Eo = /* @__PURE__ */ Symbol("_initialValue");
function Do(e, t, n) {
	return t && (e = e.trim()), n && (e = ae(e)), e;
}
var Y = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Eo] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Eo] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[To] = So(i);
		let a = r || i.props && i.props.type === "number";
		oo(e, t ? "change" : "input", (t) => {
			t.target.composing || e[To](Do(e.value, n, a));
		}), (n || a) && oo(e, "change", () => {
			e.value = Do(e.value, n, a);
		}), t || (oo(e, "compositionstart", Co), oo(e, "compositionend", wo), oo(e, "change", wo));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Eo];
		delete e[Eo], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[To](Do(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[To] = So(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ae(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Oo = {
	deep: !0,
	created(e, t, n) {
		e[To] = So(n), oo(e, "change", () => {
			let t = e._modelValue, n = No(e), r = e.checked, i = e[To];
			if (d(t)) {
				let e = be(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Po(e, r));
		});
	},
	mounted: ko,
	beforeUpdate(e, t, n) {
		e[To] = So(n), ko(e, t, n);
	}
};
function ko(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = be(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ye(t, Po(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Ao = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, oo(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ae(No(e)) : No(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[To](i);
			} finally {
				yn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[To] = So(r);
	},
	mounted(e, { value: t }) {
		Mo(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[To] = So(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !jo(t, n[1], n[0])) && Mo(e, t);
	}
};
function jo(e, t, n) {
	if (!n || d(e)) return ye(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function Mo(e, t) {
	let n = e.multiple, r = d(t);
	if (!n || r || p(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = No(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : be(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (ye(No(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function No(e) {
	return "_value" in e ? e._value : e.value;
}
function Po(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Fo = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Io = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => Fo.some((n) => e[`${n}Key`] && !t.includes(n))
}, Lo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Io[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Ro = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, zo = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = k(n.key);
		if (t.some((e) => e === r || Ro[e] === r)) return e(n);
	}));
}, Bo = /* @__PURE__ */ s({ patchProp: yo }, Ua), Vo;
function Ho() {
	return Vo ||= Pi(Bo);
}
var Uo = ((...e) => {
	let t = Ho().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Go(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Wo(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Wo(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Go(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/studio/routes.ts
var Ko = [
	{
		id: "wakewords",
		name: "Wakewords",
		group: "Workspace"
	},
	{
		id: "negative-datasets",
		name: "Negative Datasets",
		group: "Data"
	},
	{
		id: "artificial",
		name: "Artificial",
		group: "Data"
	},
	{
		id: "scrape",
		name: "Scrape",
		group: "Data"
	},
	{
		id: "classify",
		name: "Classify",
		group: "Data"
	},
	{
		id: "samples",
		name: "Samples",
		group: "Data"
	},
	{
		id: "train",
		name: "Train",
		group: "Models"
	},
	{
		id: "deploy",
		name: "Deploy",
		group: "Models"
	}
], qo = "studio.selectedWordId";
function Jo() {
	try {
		return localStorage.getItem(qo) ?? "";
	} catch {
		return "";
	}
}
function Yo() {
	let e = /* @__PURE__ */ I("wakewords"), t = /* @__PURE__ */ I("");
	function n() {
		let [n, r = ""] = location.hash.replace(/^#\/?/, "").split("?");
		e.value = Ko.find((e) => e.id === n)?.id ?? "wakewords", t.value = new URLSearchParams(r).get("word") ?? Jo();
	}
	n();
	function r(e) {
		return `#/${e}${t.value ? `?${new URLSearchParams({ word: t.value })}` : ""}`;
	}
	function i() {
		try {
			t.value ? localStorage.setItem(qo, t.value) : localStorage.removeItem(qo);
		} catch {}
		history.replaceState(null, "", r(e.value));
	}
	let a = z(t, i, { flush: "sync" });
	function o(t) {
		e.value = t, location.hash !== r(t) && history.pushState(null, "", r(t));
	}
	return window.addEventListener("hashchange", n), window.addEventListener("popstate", n), Ee(() => {
		a(), window.removeEventListener("hashchange", n), window.removeEventListener("popstate", n);
	}), {
		page: e,
		selectedId: t,
		href: r,
		navigate: o
	};
}
//#endregion
//#region src/studio/api.ts
var Xo = "/api/studio", Zo = encodeURIComponent;
function Qo(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var $o = class extends Error {
	status;
	constructor(e) {
		super({
			401: "Kiosk admin credentials required.",
			403: "Kiosk admin credentials required.",
			404: "Studio record no longer available.",
			409: "Studio record conflict. Refresh and try again.",
			422: "Invalid studio request. Check the supplied values.",
			502: "Kiosk rejected the request.",
			503: "Kiosk unavailable."
		}[e] ?? "Studio request failed. Try again."), this.status = e;
	}
};
async function es(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${Xo}${e}`, {
			method: t,
			signal: r,
			credentials: "same-origin",
			...n instanceof FormData ? { body: n } : n === void 0 ? {} : {
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(n)
			}
		});
	} catch (e) {
		throw r?.aborted ? e : Error("Unable to reach the studio. Check your connection and retry.");
	}
	if (!i.ok) throw new $o(i.status);
	if (i.status !== 204) return i.json();
}
function ts(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function ns(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => ts(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var X = (e) => `/wakewords/${Zo(e)}`, rs = (e, t) => `${X(e)}/samples/${Zo(t)}`, Z = (e, t, n) => es(e + Qo(t), "GET", void 0, n), Q = (e, t, n) => es(e, "POST", t, n), is = (e, t, n) => es(e, "PUT", t, n), $ = {
	capabilities: (e) => Z("/capabilities", void 0, e),
	migration: (e) => Z("/migration", void 0, e),
	importLegacy: (e, t) => Q("/migration/import", e, t),
	wakewords: (e, t) => Z("/wakewords", e, t),
	wakeword: (e, t) => Z(X(e), void 0, t),
	createWakeword: (e, t) => Q("/wakewords", e, t),
	updateWakeword: (e, t, n) => es(X(e), "PATCH", t, n),
	deleteWakeword: (e, t) => es(X(e), "DELETE", void 0, t),
	samples: (e, t, n) => Z(`${X(e)}/samples`, t, n),
	queue: (e, t, n) => Z(`${X(e)}/queue`, t, n),
	sample: (e, t, n) => Z(rs(e, t), void 0, n),
	unmapped: (e, t) => Z("/recordings/unmapped", e, t),
	assign: (e, t, n) => Q(`/recordings/${Zo(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), Q(`${X(e)}/samples/import`, i, r);
	},
	label: (e, t, n, r, i) => Q(`${rs(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => Q(`${rs(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => Q(`${rs(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => es(`${rs(e, t)}${Qo({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${Xo}${rs(e, t)}/audio${Qo({ original: n })}`,
	devices: (e) => Z("/devices", void 0, e),
	addDevice: (e, t, n, r) => Q("/devices", {
		url: e,
		password: t,
		role: n
	}, r),
	refreshDevices: (e, t) => Q(`/devices/${Zo(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => Q(`/devices/${Zo(e)}/credentials`, { password: t }, n),
	sourceMappings: (e, t) => Z(`/devices/${Zo(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => is(`/devices/${Zo(e)}/source-mappings`, t, n),
	scrape: (e, t) => Q("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Z("/scrape/runs", e, t),
	schedules: (e) => Z("/schedules", void 0, e),
	saveSchedule: (e, t, n) => is(`/schedules/${Zo(e)}`, t, n),
	jobs: (e, t) => Z("/jobs", e, t),
	enqueueScrape: (e, t) => Q("/jobs", e, t),
	health: (e) => Z("/jobs/health", void 0, e),
	job: (e, t) => Z(`/jobs/${Zo(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Z(`/jobs/${Zo(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => Q(`/jobs/${Zo(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Z(`${X(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => is(`${X(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => Q(`/datasets/${Zo(e)}/download`, void 0, t),
	generationCatalog: (e) => Z("/generation/catalog", void 0, e),
	generationRecipe: (e, t) => Z(`${X(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => is(`${X(e)}/generation/recipe`, t, n),
	generate: (e, t, n) => Q(`${X(e)}/generation/jobs`, t, n),
	preview: (e, t, n) => Q(`${X(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${Xo}${X(e)}/generation/previews/${Zo(t)}/audio`,
	batches: (e, t, n) => Z(`${X(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Z(`${X(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Z(`${X(e)}/generation/batches/${Zo(t)}`, void 0, n),
	selectBatches: (e, t, n) => is(`${X(e)}/generation/batches`, { batch_ids: t }, n),
	trainingSettings: (e, t) => Z(`${X(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => is(`${X(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Z(`${X(e)}/training/counts`, void 0, t),
	train: (e, t) => Q(`${X(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Z(`${X(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Z(`${X(e)}/training/runs/${Zo(t)}`, void 0, n),
	models: (e, t, n) => Z(`${X(e)}/models`, t, n),
	model: (e, t, n) => Z(`${X(e)}/models/${Zo(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${Xo}${X(e)}/models/${Zo(t)}/archive${n === void 0 ? "" : `/${Zo(n)}`}`,
	deploymentCapabilities: (e) => Z("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Z(`${X(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Z(`${X(e)}/deployment/history`, t, n),
	publish: (e, t, n) => Q(`${X(e)}/deployment/publish`, { version_id: t }, n),
	rollback: (e, t, n) => Q(`${X(e)}/deployment/rollback`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function as(e) {
	let t = /* @__PURE__ */ I([]), n = e.selectedId, r = /* @__PURE__ */ Jt(null), i = /* @__PURE__ */ Jt(null), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u, d, f = !1, p = "That wakeword is no longer available. Select another workspace.";
	function m(e) {
		let r = t.value.some((t) => t.id === e);
		l.value = r || !e ? "" : p, n.value = r ? e : t.value[0]?.id ?? "";
	}
	function h(e) {
		u?.abort(), a.value = !1, t.value = t.value.filter((t) => t.id !== e), n.value === e && m(t.value[0]?.id ?? "");
	}
	async function g() {
		d?.abort();
		let e = new AbortController();
		d = e;
		let a = n.value;
		if (r.value = null, i.value = null, c.value = "", o.value = !!a, !a || f) return;
		let s = () => !f && !e.signal.aborted && n.value === a;
		try {
			let [n, o, c, l] = await Promise.all([
				$.wakeword(a, e.signal),
				$.queue(a, { limit: 1 }, e.signal),
				$.models(a, { limit: 1 }, e.signal),
				$.schedules(e.signal)
			]);
			if (!s()) return;
			r.value = n, i.value = {
				pending: o.total,
				modelCount: c.total,
				latestModel: c.items[0] ?? null,
				schedule: l.find((e) => e.scope === `train:${a}`) ?? null
			}, t.value = t.value.map((e) => e.id === a ? n : e);
		} catch (e) {
			if (!s()) return;
			e instanceof $o && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
		} finally {
			s() && (o.value = !1);
		}
	}
	async function _() {
		u?.abort();
		let e = new AbortController();
		u = e, a.value = !0, s.value = "";
		try {
			let r = [], i = 0;
			for (;;) {
				let t = await $.wakewords({
					offset: i,
					limit: 100
				}, e.signal);
				if (f || e.signal.aborted) return;
				if (r.push(...t.items), i += t.items.length, i >= t.total || t.items.length === 0) break;
			}
			t.value = r;
			let a = n.value;
			m(a || r[0]?.id || ""), a === n.value && await g();
		} catch (t) {
			!f && !e.signal.aborted && (s.value = t instanceof Error ? t.message : "Unable to load workspaces.");
		} finally {
			!f && !e.signal.aborted && (a.value = !1);
		}
	}
	return z(n, () => {
		g();
	}, { flush: "sync" }), Ee(() => {
		f = !0, u?.abort(), d?.abort();
	}), {
		wakewords: t,
		selectedId: n,
		selected: r,
		summary: i,
		loading: a,
		selectedLoading: o,
		error: s,
		selectedError: c,
		notice: l,
		load: _,
		select: m,
		remove: h,
		refreshSelected: g
	};
}
var os = Symbol("studio-workspace");
function ss() {
	let e = In(os);
	if (!e) throw Error("useWorkspace requires StudioShell");
	return e;
}
//#endregion
//#region src/studio/pages/WakewordsPage.vue?vue&type=script&setup=true&lang.ts
var cs = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, ls = ["disabled"], us = {
	key: 0,
	class: "studio-card"
}, ds = { class: "grid gap-3 sm:grid-cols-2 mb-4" }, fs = { class: "studio-muted text-xs mb-3" }, ps = ["aria-pressed", "onClick"], ms = {
	key: 1,
	role: "status"
}, hs = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, gs = {
	key: 3,
	class: "studio-card mb-4"
}, _s = { class: "grid gap-3 sm:grid-cols-3 text-sm" }, vs = { class: "text-xs" }, ys = {
	key: 0,
	class: "text-xs"
}, bs = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, xs = {
	key: 5,
	role: "status",
	class: "studio-note"
}, Ss = { class: "grid gap-4 lg:grid-cols-2" }, Cs = ["disabled"], ws = ["disabled"], Ts = ["disabled"], Es = { id: "delete-heading" }, Ds = { class: "flex flex-wrap gap-3 mt-3" }, Os = ["disabled"], ks = ["disabled"], As = /* @__PURE__ */ sr({
	__name: "WakewordsPage",
	setup(e) {
		let t = ss(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ It({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ It({
			phrase: "",
			language: ""
		}), f = /* @__PURE__ */ I(!1), p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(!1), g;
		z(i, (e) => {
			d.phrase = e?.phrase ?? "", d.language = e?.language ?? "";
		}, { immediate: !0 }), z(r, () => {
			g?.abort(), f.value = !1, h.value = !1, p.value = "", m.value = "";
		}), Ee(() => {
			g?.abort();
		});
		async function _() {
			if (!h.value || f.value || !r.value) return;
			let e = r.value, n = new AbortController();
			g = n, f.value = !0, p.value = "", m.value = "";
			try {
				if (await $.deleteWakeword(e, n.signal), n.signal.aborted) return;
				t.remove(e);
			} catch (e) {
				n.signal.aborted || (p.value = e instanceof $o && e.status === 409 ? "Cancel queued or active jobs before deleting this workspace, then try again." : e instanceof Error ? e.message : "Unable to delete workspace.");
			} finally {
				g === n && (f.value = !1);
			}
		}
		async function v(e) {
			if (f.value) return;
			let i = r.value, a = new AbortController();
			g = a, f.value = !0, m.value = "", p.value = "";
			try {
				let o = e === "create" ? await $.createWakeword({ ...u }, a.signal) : await $.updateWakeword(i, { ...d }, a.signal);
				if (a.signal.aborted || r.value !== i) return;
				t.wakewords.value = e === "create" ? [...n.value, o] : n.value.map((e) => e.id === o.id ? o : e), e === "create" && (u.phrase = ""), t.select(o.id), await t.refreshSelected(), a.signal.aborted || (m.value = "Workspace saved.");
			} catch (e) {
				a.signal.aborted || (p.value = e instanceof Error ? e.message : "Unable to save workspace.");
			} finally {
				g === a && (f.value = !1);
			}
		}
		return (e, g) => (H(), U("section", null, [
			W("div", cs, [g[11] ||= W("div", null, [W("h1", null, "Wakewords"), W("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), W("button", {
				"data-action": "refresh",
				disabled: L(c),
				onClick: g[0] ||= (e) => L(t).load()
			}, "Refresh workspaces", 8, ls)]),
			!L(c) && !L(l) && !L(n).length ? (H(), U("p", us, "No wakewords yet. Create your first workspace below.")) : q("", !0),
			W("div", ds, [(H(!0), U(V, null, B(L(n), (e) => (H(), U("article", {
				key: e.id,
				class: j(["studio-card", { "studio-selected": e.id === L(r) }])
			}, [
				W("h2", null, M(e.phrase), 1),
				W("p", fs, M(e.language), 1),
				W("button", {
					"aria-pressed": e.id === L(r),
					onClick: (n) => L(t).select(e.id)
				}, M(e.id === L(r) ? "Selected workspace" : "Open workspace"), 9, ps)
			], 2))), 128))]),
			L(o) ? (H(), U("p", ms, "Loading selected workspace…")) : q("", !0),
			L(s) ? (H(), U("div", hs, [K(M(L(s)) + " ", 1), W("button", { onClick: g[1] ||= (e) => L(t).refreshSelected() }, "Retry workspace")])) : q("", !0),
			L(a) && L(i) ? (H(), U("div", gs, [W("h2", null, M(L(i).phrase) + " · Overview", 1), W("dl", _s, [
				W("div", null, [g[12] ||= W("dt", { class: "studio-muted" }, "Pending classification", -1), W("dd", null, M(L(a).pending) + " pending", 1)]),
				W("div", null, [
					g[13] ||= W("dt", { class: "studio-muted" }, "Archived models", -1),
					W("dd", null, M(L(a).modelCount) + " versions", 1),
					W("dd", vs, M(L(a).latestModel ? `Latest: ${L(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				W("div", null, [
					g[14] ||= W("dt", { class: "studio-muted" }, "Autotrain", -1),
					W("dd", null, M(L(a).schedule?.enabled ? `${L(a).schedule.cron} · ${L(a).schedule.timezone}` : "Not scheduled"), 1),
					L(a).schedule?.enabled ? (H(), U("dd", ys, "Next: " + M(L(a).schedule.next_run_at), 1)) : q("", !0)
				])
			])])) : q("", !0),
			p.value ? (H(), U("p", bs, M(p.value), 1)) : q("", !0),
			m.value ? (H(), U("p", xs, M(m.value), 1)) : q("", !0),
			W("div", Ss, [W("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: g[4] ||= Lo((e) => v("create"), ["prevent"])
			}, [
				g[17] ||= W("h2", null, "New wakeword", -1),
				W("label", null, [g[15] ||= K("Display phrase", -1), R(W("input", {
					"onUpdate:modelValue": g[2] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[Y, u.phrase]])]),
				W("label", null, [g[16] ||= K("Language", -1), R(W("input", {
					"onUpdate:modelValue": g[3] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[Y, u.language]])]),
				W("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Create wakeword", 8, Cs)
			], 32), L(i) ? (H(), U("form", {
				key: 0,
				"data-form": "edit",
				class: "studio-card grid gap-3",
				onSubmit: g[8] ||= Lo((e) => v("edit"), ["prevent"])
			}, [
				W("h2", null, "Edit " + M(L(i).phrase), 1),
				W("label", null, [g[18] ||= K("Display phrase", -1), R(W("input", {
					"onUpdate:modelValue": g[5] ||= (e) => d.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[Y, d.phrase]])]),
				W("label", null, [g[19] ||= K("Language", -1), R(W("input", {
					"onUpdate:modelValue": g[6] ||= (e) => d.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[Y, d.language]])]),
				g[20] ||= W("p", { class: "studio-muted text-xs" }, "Changing the display phrase never renames deployed models or changes a kiosk’s enabled wakewords.", -1),
				W("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Save changes", 8, ws),
				W("button", {
					"data-action": "delete-workspace",
					type: "button",
					disabled: f.value,
					onClick: g[7] ||= (e) => h.value = !0
				}, "Delete workspace", 8, Ts)
			], 32)) : q("", !0)]),
			h.value && L(i) ? (H(), U("section", {
				key: 6,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: g[10] ||= zo((e) => !f.value && (h.value = !1), ["esc"])
			}, [
				W("h2", Es, "Delete " + M(L(i).phrase) + " permanently?", 1),
				g[21] ||= W("p", { id: "delete-description" }, "This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.", -1),
				g[22] ||= W("p", { class: "studio-muted" }, "Deployed kiosk files and shared datasets are not deleted.", -1),
				W("div", Ds, [W("button", {
					"data-action": "cancel-delete",
					type: "button",
					disabled: f.value,
					onClick: g[9] ||= (e) => h.value = !1
				}, "Cancel", 8, Os), W("button", {
					"data-action": "confirm-delete",
					type: "button",
					disabled: f.value,
					onClick: _
				}, M(f.value ? "Deleting…" : "Permanently delete workspace"), 9, ks)])
			], 32)) : q("", !0)
		]));
	}
}), js = ["aria-busy"], Ms = ["data-ready"], Ns = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Ps = ["disabled", "aria-label"], Fs = ["disabled"], Is = /* @__PURE__ */ sr({
	__name: "AudioPlayer",
	props: {
		sampleId: {},
		src: {},
		autoplayRequested: { type: Boolean }
	},
	emits: [
		"ready",
		"ended",
		"playbackError"
	],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, a = /* @__PURE__ */ I(), o = /* @__PURE__ */ I(), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I("Waveform preview will appear when audio is ready."), d, f, p, m = 0, h = [], g = /* @__PURE__ */ new WeakSet();
		function _(e) {
			try {
				return new URL(e, window.location.origin).origin === window.location.origin;
			} catch {
				return !1;
			}
		}
		function v() {
			p && URL.revokeObjectURL(p), p = void 0;
		}
		function y(e) {
			g.has(e) || (g.add(e), e.close().catch(() => void 0));
		}
		function b() {
			let e = f;
			f = void 0, e && y(e);
		}
		function x() {
			let e = h.length > 0;
			h = [], l.value = !1, u.value = "Waveform preview will appear when audio is ready.";
			let t = o.value, n = e ? t?.getContext("2d") : null;
			t && n && n.clearRect(0, 0, t.width, t.height);
		}
		function S() {
			let e = a.value;
			e && (e.pause(), e.currentTime = 0), c.value = !1, C();
		}
		function C() {
			let e = o.value;
			if (!e || !h.length) return;
			let t = e.getContext("2d");
			if (!t) return;
			e.width = 240, e.height = 44, t.clearRect(0, 0, 240, 44), t.fillStyle = "rgba(222, 218, 212, .2)";
			let n = 240 / h.length;
			h.forEach((e, r) => {
				let i = Math.max(2, e * 36);
				t.fillRect(r * n, (44 - i) / 2, Math.max(1, n - 1), i);
			});
			let r = a.value, i = r?.duration, s = i && Number.isFinite(i) && i > 0 ? Math.min(1, Math.max(0, (r?.currentTime ?? 0) / i)) : 0;
			t.fillStyle = "#ff9134", t.fillRect(Math.min(239, s * 240), 0, 2, 44);
		}
		function w(e, t = 60) {
			let n = e.getChannelData(0), r = Math.max(1, Math.ceil(n.length / t)), i = [];
			for (let e = 0; e < n.length; e += r) {
				let t = 0;
				for (let i = e; i < Math.min(e + r, n.length); i += 1) t = Math.max(t, Math.abs(n[i] ?? 0));
				i.push(t);
			}
			return i.length ? i : [0];
		}
		function T() {
			let e = window.AudioContext ?? window.webkitAudioContext;
			if (!e) return null;
			try {
				return new e();
			} catch {
				return null;
			}
		}
		async function E(e, t, n) {
			let r = T();
			if (!r) !n.signal.aborted && t === m && (u.value = "Waveform preview is unavailable in this browser.");
			else {
				f = r;
				try {
					let i = await r.decodeAudioData(e);
					if (n.signal.aborted || t !== m || f !== r) return;
					h = w(i), l.value = !0, u.value = "Waveform preview ready. The orange line shows playback progress.", await yn(), !n.signal.aborted && t === m && f === r && C();
				} catch {
					!n.signal.aborted && t === m && f === r && (u.value = "Waveform preview could not be decoded.");
				} finally {
					f === r && (f = void 0), y(r);
				}
			}
		}
		async function D() {
			let e = a.value;
			if (e && e.src) try {
				await e.play(), c.value = !0;
			} catch {
				c.value = !1, i("playbackError", "Playback was blocked or unavailable. Use Play to try again.");
			}
		}
		function O() {
			a.value?.pause(), c.value = !1, C();
		}
		function ee() {
			c.value ? O() : D();
		}
		function k() {
			a.value && (a.value.currentTime = 0), D();
		}
		async function te() {
			m += 1;
			let e = m;
			if (d?.abort(), d = void 0, b(), S(), v(), x(), !r.sampleId || !r.src || !_(r.src)) return;
			let t = new AbortController();
			d = t, s.value = !0;
			try {
				let n = await fetch(r.src, {
					credentials: "same-origin",
					signal: t.signal
				});
				if (!n.ok) throw Error("Audio could not be loaded.");
				let o = await n.blob();
				if (t.signal.aborted || e !== m) return;
				p = URL.createObjectURL(o), a.value && (a.value.src = p), o.arrayBuffer().then((n) => E(n, e, t)).catch(() => {
					!t.signal.aborted && e === m && (u.value = "Waveform preview could not be decoded.");
				}), i("ready"), r.autoplayRequested && await D();
			} catch (n) {
				!t.signal.aborted && e === m && i("playbackError", n instanceof Error ? n.message : "Audio could not be loaded.");
			} finally {
				e === m && (s.value = !1);
			}
		}
		return z(() => [r.sampleId, r.src], () => {
			te();
		}, { immediate: !0 }), Tr(() => {
			m += 1, d?.abort(), b(), S(), v(), x();
		}), t({
			play: D,
			pause: O,
			toggle: ee,
			replay: k,
			stop: S
		}), (t, n) => (H(), U("div", {
			class: "studio-audio",
			"aria-busy": s.value
		}, [
			W("audio", {
				ref_key: "audio",
				ref: a,
				"data-audio-player": "",
				preload: "metadata",
				onEnded: n[0] ||= (e) => {
					c.value = !1, C(), i("ended");
				},
				onPause: n[1] ||= (e) => {
					c.value = !1, C();
				},
				onPlay: n[2] ||= (e) => {
					c.value = !0, C();
				},
				onTimeupdate: C,
				onLoadedmetadata: C
			}, null, 544),
			W("canvas", {
				ref_key: "canvas",
				ref: o,
				"data-waveform": "",
				"data-ready": l.value,
				role: "img",
				"aria-label": "Audio waveform with playback progress",
				width: "240",
				height: "44"
			}, null, 8, Ms),
			W("p", Ns, M(u.value), 1),
			W("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, M(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Ps),
			W("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: k
			}, "Replay", 8, Fs)
		], 8, js));
	}
}), Ls = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Rs = {
	"data-progress": "",
	class: "studio-muted"
}, zs = { class: "studio-card studio-toolbar mb-4" }, Bs = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Vs = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Hs = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, Us = ["data-sample-id"], Ws = { class: "flex flex-wrap justify-between gap-3" }, Gs = { class: "studio-muted text-sm" }, Ks = { class: "studio-muted" }, qs = {
	key: 0,
	class: "studio-muted text-xs"
}, Js = { class: "flex flex-wrap gap-2" }, Ys = ["disabled"], Xs = ["disabled"], Zs = ["disabled"], Qs = ["disabled"], $s = ["disabled"], ec = {
	key: 4,
	class: "studio-card"
}, tc = { key: 0 }, nc = { key: 1 }, rc = {
	key: 5,
	class: "studio-card mt-4"
}, ic = ["data-unmapped-id"], ac = ["disabled", "onClick"], oc = {
	key: 6,
	class: "studio-modal-backdrop"
}, sc = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, cc = { class: "flex gap-2" }, lc = ["disabled"], uc = [], dc = /* @__PURE__ */ sr({
	__name: "ClassifyPage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), o = /* @__PURE__ */ I(0), s = /* @__PURE__ */ I(0), c = /* @__PURE__ */ I(0), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I(""), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ I(!1), h = /* @__PURE__ */ I(null), g = /* @__PURE__ */ I(!1), _ = /* @__PURE__ */ I(""), v = /* @__PURE__ */ I(), y, b, x, S = 0, C = 0, w = J(() => r.value.filter((e) => !a.value.has(e.id))), T = J(() => w.value[o.value] ?? null), E = J(() => T.value ? $.audioUrl(T.value.word_id, T.value.id) : null), D = J(() => c.value);
		function O() {
			v.value?.stop(), r.value = [], i.value = [], a.value = new Set(n.get(t.selectedId.value) ?? []), o.value = 0, s.value = 0, c.value = 0, m.value = !1, g.value = !1, d.value = "", f.value = "";
		}
		function ee() {
			S += 1, x && (x.abort(), x = void 0, u.value = !1);
		}
		function k() {
			return {
				limit: 100,
				..._.value ? { near_miss: _.value === "true" } : {}
			};
		}
		async function te(e, n) {
			let r = 0;
			for (;;) {
				let i = await $.queue(e, {
					...k(),
					offset: r
				}, n.signal);
				if (n.signal.aborted || t.selectedId.value !== e) return i;
				let o = i.items.filter((e) => !a.value.has(e.id));
				if (r += i.items.length, o.length || !i.items.length || r >= i.total) return {
					...i,
					items: o
				};
			}
		}
		async function ne() {
			if (w.value.length || l.value) return;
			y?.abort();
			let e = new AbortController();
			y = e;
			let n = ++C, i = t.selectedId.value;
			if (i) {
				l.value = !0;
				try {
					let a = await te(i, e);
					if (e.signal.aborted || n !== C || t.selectedId.value !== i) return;
					r.value = [...new Map(a.items.map((e) => [e.id, e])).values()], s.value = a.total, o.value = 0;
				} catch {
					!e.signal.aborted && n === C && (d.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === C && (l.value = !1);
				}
			}
		}
		async function re() {
			ee(), y?.abort();
			let e = new AbortController();
			y = e;
			let n = ++C, a = t.selectedId.value;
			if (O(), a) {
				l.value = !0;
				try {
					let [o, c] = await Promise.all([te(a, e), $.unmapped({ limit: 20 }, e.signal)]);
					if (e.signal.aborted || n !== C || t.selectedId.value !== a) return;
					r.value = o.items, s.value = o.total, i.value = c.items;
				} catch (t) {
					!e.signal.aborted && n === C && (d.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === C && (l.value = !1);
				}
			}
		}
		function ie() {
			let e = T.value;
			e && (r.value = r.value.filter((t) => t.id !== e.id), s.value = Math.max(0, s.value - 1), o.value = Math.min(o.value, Math.max(0, w.value.length - 1)), v.value?.stop(), m.value = p.value, ne());
		}
		async function A(e) {
			try {
				let t = await $.sample(e.word_id, e.id);
				if (t.label !== "pending") {
					ie();
					return;
				}
				r.value = r.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function ae(e) {
			let t = T.value;
			if (!t || u.value || g.value) return;
			p.value = !0, u.value = !0, d.value = "";
			let n = new AbortController();
			b?.abort(), b = n;
			try {
				let r = await $.label(t.word_id, t.id, e, t.revision, n.signal);
				if (n.signal.aborted || T.value?.id !== t.id) return;
				uc.push({
					word: t.word_id,
					sample: r
				}), c.value += 1, f.value = `Saved ${e} label.`, ie();
			} catch (e) {
				n.signal.aborted || (e instanceof Error && e.message.includes("conflict") ? (d.value = "This recording changed elsewhere. Review the latest version before saving.", await A(t)) : d.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				b === n && (u.value = !1);
			}
		}
		function oe() {
			let e = T.value;
			!e || u.value || l.value || (p.value = !0, a.value = /* @__PURE__ */ new Set([...a.value, e.id]), n.set(e.word_id, a.value), o.value = Math.min(o.value, Math.max(0, w.value.length - 1)), v.value?.stop(), m.value = !1, f.value = "Skipped for this session; this recording remains pending.", ne());
		}
		async function se() {
			if (u.value || !uc.length) return;
			p.value = !0, u.value = !0, d.value = "";
			let e = uc[uc.length - 1], n = new AbortController();
			b?.abort(), b = n;
			try {
				let i = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (n.signal.aborted) return;
				uc.pop(), f.value = "Last label restored to pending.", t.selectedId.value === e.word && (r.value = [i, ...r.value.filter((e) => e.id !== i.id)], s.value += 1, c.value = Math.max(0, c.value - 1), o.value = 0, m.value = !1);
			} catch {
				n.signal.aborted || (d.value = "Undo was not saved. Refresh and try again.");
			} finally {
				b === n && (u.value = !1);
			}
		}
		async function ce(e) {
			let n = t.selectedId.value;
			if (u.value || !n) return;
			let a = C, o = ++S, c = new AbortController();
			x?.abort(), x = c, u.value = !0, d.value = "";
			try {
				let l = await $.assign(e.id, n, c.signal);
				if (c.signal.aborted || x !== c || o !== S || a !== C || t.selectedId.value !== n) return;
				i.value = i.value.filter((t) => t.id !== e.id), r.value = [...r.value.filter((e) => e.id !== l.id), l], s.value += 1, f.value = "Recording assigned to this workspace and added to the pending queue.";
			} catch {
				!c.signal.aborted && x === c && o === S && t.selectedId.value === n && (d.value = "Recording could not be assigned.");
			} finally {
				x === c && (x = void 0, u.value = !1);
			}
		}
		function le(e) {
			let t = e.target instanceof HTMLElement ? e.target : document.activeElement;
			return t instanceof HTMLElement && (t.isContentEditable || [
				"INPUT",
				"TEXTAREA",
				"SELECT",
				"BUTTON"
			].includes(t.tagName));
		}
		function ue(e) {
			if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || le(e)) return;
			let t = e.key.toLowerCase();
			g.value ? e.key === "Escape" && (e.preventDefault(), g.value = !1) : t === "d" ? (e.preventDefault(), T.value && !u.value && (g.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), p.value = !0, t === "p" ? ae("positive") : t === "n" ? ae("negative") : t === " " ? v.value?.toggle() : t === "r" ? v.value?.replay() : t === "s" ? oe() : se());
		}
		return z(t.selectedId, () => {
			re();
		}, { immediate: !0 }), z(_, () => {
			re();
		}), z(() => T.value?.id, () => {
			h.value = null;
		}, { flush: "sync" }), Sr(() => document.addEventListener("keydown", ue)), Tr(() => {
			document.removeEventListener("keydown", ue), y?.abort(), b?.abort(), ee(), v.value?.stop();
		}), (e, t) => (H(), U("section", null, [
			W("div", Ls, [t[8] ||= W("div", null, [W("h1", null, "Classify"), W("p", { class: "studio-muted" }, "Rapid review stays pending until the server acknowledges each label.")], -1), W("span", Rs, M(s.value) + " pending · " + M(D.value) + " reviewed · " + M(a.value.size) + " skipped", 1)]),
			W("div", zs, [W("label", null, [t[10] ||= K("Recording type", -1), R(W("select", {
				name: "kind",
				"onUpdate:modelValue": t[0] ||= (e) => _.value = e
			}, [...t[9] ||= [
				W("option", { value: "" }, "All pending", -1),
				W("option", { value: "true" }, "Near misses", -1),
				W("option", { value: "false" }, "Activations", -1)
			]], 512), [[Ao, _.value]])])]),
			f.value ? (H(), U("p", Bs, M(f.value), 1)) : q("", !0),
			d.value ? (H(), U("p", Vs, M(d.value), 1)) : q("", !0),
			l.value ? (H(), U("div", Hs, "Loading review queue…")) : T.value ? (H(), U("div", {
				key: 3,
				"data-classify-current": "",
				"data-sample-id": T.value.id,
				class: "studio-card grid gap-4"
			}, [
				W("div", Ws, [W("div", null, [W("h2", null, "Recording " + M(T.value.recording?.clip_id ?? T.value.id), 1), W("p", Gs, M(T.value.recording?.device_id ?? T.value.source) + " · " + M(T.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + M(T.value.recording?.timestamp ?? T.value.created_at), 1)]), W("span", Ks, "Revision " + M(T.value.revision), 1)]),
				G(Is, {
					ref_key: "player",
					ref: v,
					"sample-id": T.value.id,
					src: E.value,
					"autoplay-requested": m.value,
					onReady: t[1] ||= (e) => {
						m.value = !1, h.value = T.value.id;
					},
					onPlaybackError: t[2] ||= (e) => d.value = e
				}, null, 8, [
					"sample-id",
					"src",
					"autoplay-requested"
				]),
				h.value === T.value.id ? (H(), U("p", qs, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : q("", !0),
				W("div", Js, [
					W("button", {
						type: "button",
						class: "studio-primary",
						disabled: u.value,
						onClick: t[3] ||= (e) => ae("positive")
					}, "Positive (P)", 8, Ys),
					W("button", {
						type: "button",
						disabled: u.value,
						onClick: t[4] ||= (e) => ae("negative")
					}, "Negative (N)", 8, Xs),
					W("button", {
						type: "button",
						disabled: u.value,
						onClick: oe
					}, "Skip (S)", 8, Zs),
					W("button", {
						type: "button",
						disabled: u.value,
						"data-action": "discard",
						onClick: t[5] ||= (e) => g.value = !0
					}, "Discard (D)", 8, Qs),
					W("button", {
						type: "button",
						disabled: u.value || !L(uc).length,
						onClick: se
					}, "Undo (Z)", 8, $s)
				]),
				t[11] ||= W("p", {
					"data-shortcuts": "",
					class: "studio-muted text-xs"
				}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
				t[12] ||= W("input", {
					name: "search",
					type: "search",
					"aria-label": "Queue search",
					placeholder: "Shortcuts pause while editing"
				}, null, -1)
			], 8, Us)) : (H(), U("div", ec, [s.value === 0 ? (H(), U("span", tc, "No pending recordings for this workspace.")) : (H(), U("span", nc, "Pending recordings are skipped for this session or the local window needs reloading.")), s.value > 0 ? (H(), U("button", {
				key: 2,
				type: "button",
				onClick: ne
			}, "Retry pending window")) : q("", !0)])),
			i.value.length ? (H(), U("section", rc, [
				t[13] ||= W("h2", null, "Unmapped recordings", -1),
				t[14] ||= W("p", { class: "studio-muted" }, "Assign each recording explicitly; nothing is guessed or dropped.", -1),
				(H(!0), U(V, null, B(i.value, (e) => (H(), U("article", {
					key: e.id,
					"data-unmapped-id": e.id,
					class: "flex flex-wrap justify-between gap-3 py-2"
				}, [W("span", null, M(e.phrase) + " · " + M(e.device_id), 1), W("button", {
					type: "button",
					"data-action": "assign",
					disabled: u.value,
					onClick: (t) => ce(e)
				}, "Assign to this wakeword", 8, ac)], 8, ic))), 128))
			])) : q("", !0),
			g.value ? (H(), U("div", oc, [W("section", sc, [
				t[15] ||= W("h2", null, "Discard this recording?", -1),
				t[16] ||= W("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				W("div", cc, [W("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: u.value,
					onClick: t[6] ||= (e) => {
						g.value = !1, ae("discarded");
					}
				}, "Discard recording", 8, lc), W("button", {
					type: "button",
					onClick: t[7] ||= (e) => g.value = !1
				}, "Cancel")])
			])])) : q("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function fc(e, t = {}) {
	let n = await fetch(e, {
		credentials: "same-origin",
		...t,
		headers: {
			Accept: "application/json",
			...t.headers || {}
		}
	}), r = (n.headers.get("content-type") || "").includes("application/json") ? await n.json() : await n.text();
	if (!n.ok) {
		let e = typeof r == "object" && r ? r.error || r.detail || r.message : r;
		throw Error(String(e || `Request failed (${n.status})`));
	}
	return r;
}
function pc(e) {
	return fc(e);
}
//#endregion
//#region src/trainerStore.ts
var mc = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), hc = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), gc = /* @__PURE__ */ It({
	activeView: "trainer",
	initialized: !1,
	busy: /* @__PURE__ */ new Set(),
	phrase: "",
	language: "en",
	englishAccent: "mixed",
	ttsMode: "hybrid",
	languages: [{
		code: "en",
		label: "English (en)",
		engines: ["omnivoice"]
	}],
	englishAccents: [
		{
			code: "mixed",
			label: "Mixed English"
		},
		{
			code: "australian",
			label: "Australian"
		},
		{
			code: "american",
			label: "American"
		},
		{
			code: "british",
			label: "British"
		},
		{
			code: "canadian",
			label: "Canadian"
		},
		{
			code: "irish",
			label: "Irish"
		},
		{
			code: "scottish",
			label: "Scottish"
		},
		{
			code: "new_zealand",
			label: "New Zealand"
		},
		{
			code: "indian",
			label: "Indian"
		},
		{
			code: "south_african",
			label: "South African"
		}
	],
	session: {},
	samples: hc(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: mc(),
	auto: {},
	autoForm: {
		enabled: !1,
		wake_phrase: "",
		language: "en",
		english_accent: "mixed",
		stt_engine: "faster_whisper",
		minimum_transcript_chars: 2,
		delete_confirmed_wakes: !1,
		promote_close_misses: !1,
		schedule_hours: 24,
		minimum_new_negatives: 3,
		advertised_base_url: "",
		tater_url: "http://127.0.0.1:8501",
		notify_satellites: !0
	},
	wakeWords: [],
	managedData: {
		items: [],
		total_size_bytes: 0,
		total_file_count: 0
	},
	selectedFiles: [],
	sampleBucket: "personal",
	samplePage: {
		personal: 0,
		negative: 0
	},
	uploadProgress: 0,
	uploadLabel: "No upload in progress",
	uploadDetail: "Choose files and upload when you are ready.",
	consoleOpen: !1,
	taterLinkOpen: !1,
	trimItem: null,
	trimBucket: "personal",
	toast: {
		message: "",
		tone: "success",
		serial: 0
	}
});
function _c(e, t) {
	t ? gc.busy.add(e) : gc.busy.delete(e);
}
function vc(e, t = "success") {
	gc.toast = {
		message: String(e || ""),
		tone: t,
		serial: gc.toast.serial + 1
	};
}
async function yc(e = !1) {
	e || _c("samples", !0);
	try {
		let e = await pc("/api/samples");
		gc.samples = {
			...hc(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((gc.samples[e]?.length || 0) / 50) - 1);
			gc.samplePage[e] = Math.min(gc.samplePage[e], t);
		}
		return e;
	} finally {
		e || _c("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var bc = { class: "legacy-scope" }, xc = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Sc = { class: "range-grid" }, Cc = ["max"], wc = ["min"], Tc = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Ec = { class: "modal-head" }, Dc = {
	key: 0,
	class: "empty-state"
}, Oc = { class: "range-grid" }, kc = ["max"], Ac = ["min", "max"], jc = { class: "row space" }, Mc = { class: "pill" }, Nc = {
	key: 0,
	class: "pill success"
}, Pc = { class: "row modal-actions" }, Fc = ["disabled"], Ic = /* @__PURE__ */ sr({
	__name: "AudioTrimModal",
	props: { studioTarget: {} },
	emits: ["save", "close"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(1);
		z(() => n.studioTarget, (e) => {
			e && (i.value = 0, a.value = 1, fetch(e.src, { credentials: "same-origin" }).catch(() => void 0));
		}, { immediate: !0 });
		function o() {
			r("close");
		}
		function s() {
			Number.isFinite(i.value) && Number.isFinite(a.value) && i.value >= 0 && a.value > i.value && r("save", {
				start: i.value,
				end: a.value
			});
		}
		let c = /* @__PURE__ */ I(null), l = /* @__PURE__ */ I(null), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = /* @__PURE__ */ I(0), p = /* @__PURE__ */ I([]), m = /* @__PURE__ */ I(!1), h = /* @__PURE__ */ I(!1);
		z(() => gc.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(gc.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await fc(`/api/samples/${encodeURIComponent(gc.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await yn(), v();
				} catch (e) {
					vc(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), z([d, f], () => v());
		function g() {
			gc.trimItem = null, l.value = null, p.value = [];
		}
		function _() {
			let e = p.value[0];
			e && (d.value = Number(e.start), f.value = Number(e.end));
		}
		function v() {
			let e = c.value, t = l.value;
			if (!e || !t || !u.value) return;
			let n = e.getBoundingClientRect();
			if (!n.width || !n.height) return;
			let r = window.devicePixelRatio || 1;
			e.width = Math.round(n.width * r), e.height = Math.round(n.height * r);
			let i = e.getContext("2d");
			if (!i) return;
			i.scale(r, r);
			let a = n.width, o = n.height, s = o / 2, m = t.getChannelData(0), h = Math.max(1, Math.floor(m.length / a));
			i.clearRect(0, 0, a, o), i.strokeStyle = "rgba(222, 218, 212, .24)", i.lineWidth = 1, i.beginPath();
			for (let e = 0; e < a; e += 1) {
				let t = 1, n = -1;
				for (let r = 0; r < h; r += 1) {
					let i = m[Math.floor(e) * h + r] || 0;
					t = Math.min(t, i), n = Math.max(n, i);
				}
				i.moveTo(e, s + t * s * .84), i.lineTo(e, s + n * s * .84);
			}
			i.stroke();
			let g = d.value / u.value * a, _ = f.value / u.value * a;
			i.fillStyle = "rgba(8, 8, 9, .66)", i.fillRect(0, 0, g, o), i.fillRect(_, 0, a - _, o), i.fillStyle = "rgba(255, 145, 52, .12)", i.fillRect(g, 0, _ - g, o), i.strokeStyle = "#ff9134", i.lineWidth = 2;
			for (let e of [g, _]) i.beginPath(), i.moveTo(e, 0), i.lineTo(e, o), i.stroke();
			i.strokeStyle = "rgba(68, 225, 165, .55)";
			for (let e of p.value) {
				let t = e.start / u.value * a;
				i.beginPath(), i.moveTo(t, 0), i.lineTo(t, o), i.stroke();
			}
		}
		function y() {
			let e = l.value;
			if (!e) return;
			let t = new (window.AudioContext || window.webkitAudioContext)(), n = t.createBufferSource();
			n.buffer = e, n.connect(t.destination), n.start(0, d.value, Math.max(.01, f.value - d.value)), n.onended = () => void t.close();
		}
		async function b() {
			let e = l.value;
			if (!e) throw Error("Audio is not loaded.");
			let t = Math.floor(d.value * e.sampleRate), n = Math.min(Math.floor(f.value * e.sampleRate), e.length), r = 16e3, i;
			if (e.sampleRate === r) i = e.getChannelData(0).slice(t, n);
			else {
				let a = Math.max(1, Math.floor((n - t) * r / e.sampleRate)), o = new OfflineAudioContext(1, a, r), s = o.createBufferSource();
				s.buffer = e, s.connect(o.destination), s.start(0, d.value, f.value - d.value), i = (await o.startRendering()).getChannelData(0);
			}
			let a = /* @__PURE__ */ new ArrayBuffer(44 + i.length * 2), o = new DataView(a);
			o.setUint32(0, 1380533830, !1), o.setUint32(4, 36 + i.length * 2, !0), o.setUint32(8, 1463899717, !1), o.setUint32(12, 1718449184, !1), o.setUint32(16, 16, !0), o.setUint16(20, 1, !0), o.setUint16(22, 1, !0), o.setUint32(24, r, !0), o.setUint32(28, r * 2, !0), o.setUint16(32, 2, !0), o.setUint16(34, 16, !0), o.setUint32(36, 1684108385, !1), o.setUint32(40, i.length * 2, !0);
			for (let e = 0; e < i.length; e += 1) o.setInt16(44 + e * 2, Math.max(-32768, Math.min(32767, Math.round(i[e] * 32767))), !0);
			return new Blob([a], { type: "audio/wav" });
		}
		async function x() {
			let e = gc.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", gc.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await fc("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await yc(!0), vc(n.message || "Trimmed sample saved.");
				} catch (e) {
					vc(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			gc.trimItem && v();
		}
		return window.addEventListener("resize", S), Tr(() => window.removeEventListener("resize", S)), (t, n) => (H(), ta($n, { to: "body" }, [W("div", bc, [e.studioTarget ? (H(), U("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Lo(o, ["self"])
		}, [W("section", xc, [
			W("header", { class: "modal-head" }, [n[4] ||= W("div", null, [W("span", { class: "eyebrow" }, "Studio audio editor"), W("h2", null, "Trim sample")], -1), W("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= W("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			W("div", Sc, [W("label", null, [n[5] ||= W("span", null, "Start seconds", -1), R(W("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Cc), [[
				Y,
				i.value,
				void 0,
				{ number: !0 }
			]])]), W("label", null, [n[6] ||= W("span", null, "End seconds", -1), R(W("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, wc), [[
				Y,
				a.value,
				void 0,
				{ number: !0 }
			]])])]),
			W("div", { class: "row modal-actions" }, [W("button", {
				type: "button",
				class: "button primary",
				onClick: s
			}, "Save trim"), W("button", {
				type: "button",
				onClick: o
			}, "Cancel")])
		])])) : L(gc).trimItem ? (H(), U("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Lo(g, ["self"])
		}, [W("section", Tc, [
			W("header", Ec, [W("div", null, [n[8] ||= W("span", { class: "eyebrow" }, "Audio editor", -1), W("h2", null, "Trim " + M(L(gc).trimItem.saved_as), 1)]), W("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= W("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (H(), U("div", Dc, "Loading waveform…")) : (H(), U(V, { key: 1 }, [
				W("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				W("div", Oc, [W("label", null, [W("span", null, "Start · " + M(d.value.toFixed(2)) + "s", 1), R(W("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, kc), [[
					Y,
					d.value,
					void 0,
					{ number: !0 }
				]])]), W("label", null, [W("span", null, "End · " + M(f.value.toFixed(2)) + "s", 1), R(W("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Ac), [[
					Y,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				W("div", jc, [W("span", Mc, "Selection " + M(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (H(), U("span", Nc, M(p.value.length) + " speech segment" + M(p.value.length === 1 ? "" : "s"), 1)) : q("", !0)]),
				W("div", Pc, [
					W("button", {
						type: "button",
						onClick: y
					}, "Play selection"),
					p.value.length ? (H(), U("button", {
						key: 0,
						type: "button",
						onClick: _
					}, "Select first VAD")) : q("", !0),
					W("button", {
						type: "button",
						class: "button primary",
						disabled: h.value,
						onClick: x
					}, M(h.value ? "Saving…" : "Save trim"), 9, Fc)
				])
			], 64))
		])])) : q("", !0)])]));
	}
}), Lc = {
	key: 0,
	class: "studio-pagination",
	"aria-live": "polite"
}, Rc = { class: "flex gap-2" }, zc = ["disabled"], Bc = ["disabled"], Vc = /* @__PURE__ */ sr({
	__name: "PaginatedTable",
	props: {
		total: {},
		offset: {},
		limit: {},
		loading: { type: Boolean },
		noun: {}
	},
	emits: ["page"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = () => n.offset >= n.total ? 0 : n.offset + 1, a = () => n.offset >= n.total ? 0 : Math.min(n.offset + n.limit, n.total);
		return (t, n) => e.total > e.limit || e.offset > 0 ? (H(), U("div", Lc, [W("span", null, M(i()) + "–" + M(a()) + " of " + M(e.total), 1), W("div", Rc, [W("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, zc), W("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, Bc)])])) : q("", !0);
	}
}), Hc = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Uc = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Wc = { class: "studio-card mb-4" }, Gc = { class: "studio-toolbar" }, Kc = {
	"data-more-filters": "",
	class: "mt-3"
}, qc = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, Jc = ["aria-busy"], Yc = { key: 0 }, Xc = {
	key: 1,
	class: "w-full text-sm"
}, Zc = ["data-row-id"], Qc = {
	key: 0,
	class: "block studio-muted"
}, $c = {
	key: 0,
	class: "block studio-muted"
}, el = { class: "flex flex-wrap gap-1" }, tl = ["onClick"], nl = ["value", "onChange"], rl = {
	key: 0,
	value: "pending",
	disabled: ""
}, il = ["onClick"], al = ["onClick"], ol = { key: 0 }, sl = {
	key: 2,
	class: "studio-modal-backdrop"
}, cl = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Play sample"
}, ll = {
	key: 3,
	class: "studio-modal-backdrop"
}, ul = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, dl = /* @__PURE__ */ sr({
	__name: "SamplesPage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I(0), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(25), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: "",
			search: ""
		}), u = /* @__PURE__ */ I(null), d = /* @__PURE__ */ I(null), f = /* @__PURE__ */ I(null), p = /* @__PURE__ */ I(null), m = /* @__PURE__ */ I("positive"), h, g, _ = 0, v = J(() => ({
			offset: i.value,
			limit: Math.min(100, a.value),
			...l.value.label ? { label: l.value.label } : {},
			...l.value.source ? { source: l.value.source } : {},
			...l.value.kind ? { near_miss: l.value.kind === "true" } : {},
			...l.value.search ? { search: l.value.search } : {},
			...l.value.after ? { after: `${l.value.after}T00:00:00+00:00` } : {},
			...l.value.before ? { before: `${l.value.before}T23:59:59+00:00` } : {}
		}));
		function y() {
			u.value = null, d.value = null, f.value = null, s.value = "";
		}
		async function b() {
			h?.abort();
			let e = new AbortController();
			h = e;
			let c = ++_, l = t.selectedId.value;
			if (n.value = [], r.value = 0, y(), l) {
				o.value = !0;
				try {
					let o = await $.samples(l, v.value, e.signal);
					!e.signal.aborted && c === _ && t.selectedId.value === l && (n.value = Array.isArray(o.items) ? o.items : [], r.value = Number.isFinite(o.total) ? o.total : 0, i.value = Number.isInteger(o.offset) ? o.offset : 0, a.value = Number.isInteger(o.limit) && o.limit >= 1 && o.limit <= 100 ? o.limit : 25);
				} catch (t) {
					!e.signal.aborted && c === _ && (s.value = t instanceof Error ? t.message : "Samples could not be loaded.");
				} finally {
					!e.signal.aborted && c === _ && (o.value = !1);
				}
			}
		}
		function x(e) {
			n.value = n.value.map((t) => t.id === e.id ? e : t);
		}
		async function S(e) {
			g?.abort();
			let t = new AbortController();
			g = t, s.value = "";
			try {
				return await e(t.signal);
			} catch (e) {
				return t.signal.aborted || (e instanceof $o && e.status === 409 ? (await b(), s.value = "This sample changed elsewhere. The current page was reloaded.") : s.value = "Sample changes were not saved. Try again."), null;
			}
		}
		async function C(e, t) {
			let n = t.target.value;
			if (n === e.label) return;
			let r = await S((t) => $.label(e.word_id, e.id, n, e.revision, t));
			r && (x(r), c.value = "Label saved.");
		}
		async function w(e) {
			let t = u.value;
			if (!t) return;
			let n = await S((n) => $.trim(t.word_id, t.id, e.start, e.end, t.revision, n));
			n && (x(n), u.value = null, c.value = "Non-destructive trim saved.");
		}
		async function T() {
			let e = d.value;
			e && await S((t) => $.deleteSample(e.word_id, e.id, e.revision, t)) !== null && (n.value = n.value.filter((t) => t.id !== e.id), r.value = Math.max(0, r.value - 1), d.value = null, c.value = "Sample removed from this visible library.");
		}
		async function E() {
			p.value ? await S((e) => $.importAudio(t.selectedId.value, p.value, m.value, e)) && (p.value = null, c.value = "Imported audio.", await b()) : s.value = "Choose an audio file to import.";
		}
		function D() {
			i.value = 0, b();
		}
		function O(e) {
			return e.recording?.near_miss ? "close miss" : "activation";
		}
		return z(t.selectedId, () => {
			i.value = 0, b();
		}, { immediate: !0 }), Tr(() => {
			h?.abort(), g?.abort();
		}), (e, t) => (H(), U("section", null, [
			t[36] ||= W("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [W("div", null, [W("h1", null, "Samples"), W("p", { class: "studio-muted" }, "Searchable library with retained provenance and non-destructive trims.")])], -1),
			c.value ? (H(), U("p", Hc, M(c.value), 1)) : q("", !0),
			s.value ? (H(), U("p", Uc, M(s.value), 1)) : q("", !0),
			W("div", Wc, [W("div", Gc, [W("label", null, [t[14] ||= K("Phrase", -1), R(W("input", {
				name: "search",
				"onUpdate:modelValue": t[0] ||= (e) => l.value.search = e,
				type: "search",
				onInput: D
			}, null, 544), [[Y, l.value.search]])]), W("label", null, [t[16] ||= K("Label", -1), R(W("select", {
				name: "label",
				"onUpdate:modelValue": t[1] ||= (e) => l.value.label = e,
				onChange: D
			}, [...t[15] ||= [la("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Ao, l.value.label]])])]), W("details", Kc, [t[23] ||= W("summary", null, "More filters", -1), W("div", qc, [
				W("label", null, [t[18] ||= K("Source", -1), R(W("select", {
					name: "source",
					"onUpdate:modelValue": t[2] ||= (e) => l.value.source = e,
					onChange: D
				}, [...t[17] ||= [
					W("option", { value: "" }, "All sources", -1),
					W("option", { value: "diagnostic" }, "Diagnostic", -1),
					W("option", { value: "import" }, "Import", -1)
				]], 544), [[Ao, l.value.source]])]),
				W("label", null, [t[20] ||= K("Kind", -1), R(W("select", {
					name: "kind",
					"onUpdate:modelValue": t[3] ||= (e) => l.value.kind = e,
					onChange: D
				}, [...t[19] ||= [
					W("option", { value: "" }, "All kinds", -1),
					W("option", { value: "true" }, "Close miss", -1),
					W("option", { value: "false" }, "Activation", -1)
				]], 544), [[Ao, l.value.kind]])]),
				W("label", null, [t[21] ||= K("After", -1), R(W("input", {
					name: "after",
					"onUpdate:modelValue": t[4] ||= (e) => l.value.after = e,
					type: "date",
					onInput: D
				}, null, 544), [[Y, l.value.after]])]),
				W("label", null, [t[22] ||= K("Before", -1), R(W("input", {
					name: "before",
					"onUpdate:modelValue": t[5] ||= (e) => l.value.before = e,
					type: "date",
					onInput: D
				}, null, 544), [[Y, l.value.before]])])
			])])]),
			W("form", {
				"data-form": "import",
				class: "studio-card mb-4 flex flex-wrap gap-3 items-end",
				onSubmit: Lo(E, ["prevent"])
			}, [
				W("label", null, [t[24] ||= K("Audio", -1), W("input", {
					name: "import-file",
					type: "file",
					accept: "audio/*",
					required: "",
					onChange: t[6] ||= (e) => p.value = e.target.files?.[0] ?? null
				}, null, 32)]),
				W("label", null, [t[26] ||= K("Label", -1), R(W("select", {
					name: "import-label",
					"onUpdate:modelValue": t[7] ||= (e) => m.value = e
				}, [...t[25] ||= [W("option", { value: "positive" }, "Positive", -1), W("option", { value: "negative" }, "Negative", -1)]], 512), [[Ao, m.value]])]),
				t[27] ||= W("button", {
					type: "submit",
					class: "studio-primary"
				}, "Import audio", -1)
			], 32),
			W("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": o.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [o.value ? (H(), U("p", Yc, "Loading samples…")) : (H(), U("table", Xc, [t[33] ||= W("thead", null, [W("tr", null, [
				W("th", null, "Sample"),
				W("th", null, "Label"),
				W("th", null, "Provenance"),
				W("th", null, "Revision"),
				W("th", null, "Actions")
			])], -1), W("tbody", null, [(H(!0), U(V, null, B(n.value, (e) => (H(), U("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				W("td", null, [K(M(e.recording?.clip_id ?? e.id), 1), e.recording ? (H(), U("small", Qc, M(e.recording.phrase) + " · " + M(e.recording.engine) + " · " + M(O(e)), 1)) : q("", !0)]),
				W("td", null, M(e.label), 1),
				W("td", null, [K(M(e.source), 1), e.recording ? (H(), U("small", $c, M(e.recording.device_id), 1)) : q("", !0)]),
				W("td", null, "rev " + M(e.revision), 1),
				W("td", null, [W("div", el, [
					W("button", {
						type: "button",
						"data-action": "play",
						onClick: (t) => f.value = e
					}, "Play", 8, tl),
					W("label", null, [t[31] ||= W("span", { class: "sr-only" }, "Relabel", -1), W("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => C(e, t)
					}, [
						e.label === "pending" ? (H(), U("option", rl, "Set label…")) : q("", !0),
						t[28] ||= W("option", { value: "positive" }, "Positive", -1),
						t[29] ||= W("option", { value: "negative" }, "Negative", -1),
						t[30] ||= W("option", { value: "discarded" }, "Discarded", -1)
					], 40, nl)]),
					W("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => u.value = e
					}, "Trim", 8, il),
					W("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => d.value = e
					}, "Delete", 8, al)
				])])
			], 8, Zc))), 128)), n.value.length ? q("", !0) : (H(), U("tr", ol, [...t[32] ||= [W("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), G(Vc, {
				total: r.value,
				offset: i.value,
				limit: a.value,
				loading: o.value,
				noun: "samples",
				onPage: t[8] ||= (e) => {
					i.value = e, b();
				}
			}, null, 8, [
				"total",
				"offset",
				"limit",
				"loading"
			])], 8, Jc),
			f.value ? (H(), U("div", sl, [W("section", cl, [G(Is, {
				"sample-id": f.value.id,
				src: L($).audioUrl(f.value.word_id, f.value.id),
				"autoplay-requested": !0,
				onPlaybackError: t[9] ||= (e) => s.value = e
			}, null, 8, ["sample-id", "src"]), W("button", {
				type: "button",
				onClick: t[10] ||= (e) => f.value = null
			}, "Close player")])])) : q("", !0),
			G(Ic, {
				"studio-target": u.value ? {
					wordId: u.value.word_id,
					sampleId: u.value.id,
					revision: u.value.revision,
					src: L($).audioUrl(u.value.word_id, u.value.id)
				} : null,
				onSave: t[11] ||= (e) => w(e),
				onClose: t[12] ||= (e) => u.value = null
			}, null, 8, ["studio-target"]),
			d.value ? (H(), U("div", ll, [W("section", ul, [
				t[34] ||= W("h2", null, "Remove sample?", -1),
				t[35] ||= W("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				W("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: T
				}, "Remove"),
				W("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[13] ||= (e) => d.value = null
				}, "Cancel")
			])])) : q("", !0)
		]));
	}
}), fl = ["data-scope"], pl = { class: "studio-checkbox-label" }, ml = ["disabled"], hl = {
	key: 0,
	class: "studio-muted mt-3"
}, gl = {
	key: 1,
	class: "studio-muted mt-3"
}, _l = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, vl = /* @__PURE__ */ sr({
	__name: "CronEditor",
	props: {
		scope: {},
		schedule: {}
	},
	emits: ["saved"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I("UTC"), o = /* @__PURE__ */ I(!0), s = /* @__PURE__ */ I(null), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(""), u, d = J(() => n.scope === "scrape" ? "Global scrape schedule" : "Training schedule for this wakeword");
		function f(e) {
			s.value = e, i.value = e?.cron ?? "0 2 * * *", a.value = e?.timezone ?? "UTC", o.value = e?.enabled ?? !1;
		}
		z(() => n.schedule, f, { immediate: !0 });
		async function p() {
			u?.abort();
			let e = new AbortController();
			u = e, c.value = !0, l.value = "";
			try {
				let t = await $.saveSchedule(n.scope, {
					cron: i.value,
					timezone: a.value,
					enabled: o.value
				}, e.signal);
				!e.signal.aborted && u === e && (f(t), r("saved", t));
			} catch (t) {
				!e.signal.aborted && u === e && (l.value = t instanceof Error ? t.message : "Schedule was not saved.");
			} finally {
				u === e && (c.value = !1);
			}
		}
		return Tr(() => u?.abort()), (t, n) => (H(), U("section", {
			class: "studio-card",
			"data-cron-editor": "",
			"data-scope": e.scope
		}, [
			W("h2", null, M(d.value), 1),
			n[6] ||= W("p", { class: "studio-muted" }, "Standard five-field cron with explicit IANA timezone. The next run below is calculated and validated by the server.", -1),
			W("form", {
				class: "studio-schedule-row mt-3",
				onSubmit: Lo(p, ["prevent"])
			}, [
				W("label", null, [n[3] ||= K("Cron", -1), R(W("input", {
					"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
					name: "cron",
					required: "",
					pattern: "\\S+(\\s+\\S+){4}"
				}, null, 512), [[Y, i.value]])]),
				W("label", null, [n[4] ||= K("IANA timezone", -1), R(W("input", {
					"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
					name: "timezone",
					required: ""
				}, null, 512), [[Y, a.value]])]),
				W("label", pl, [R(W("input", {
					"onUpdate:modelValue": n[2] ||= (e) => o.value = e,
					name: "enabled",
					type: "checkbox"
				}, null, 512), [[Oo, o.value]]), n[5] ||= K(" Enabled", -1)]),
				W("button", {
					type: "submit",
					class: "studio-primary",
					disabled: c.value
				}, M(c.value ? "Validating…" : "Save schedule"), 9, ml)
			], 32),
			s.value ? (H(), U("p", hl, [K("Timezone: " + M(s.value.timezone) + " · Server-computed next run: ", 1), W("strong", null, M(s.value.next_run_at), 1)])) : (H(), U("p", gl, "No schedule saved. UTC is the default timezone.")),
			l.value ? (H(), U("p", _l, M(l.value), 1)) : q("", !0)
		], 8, fl));
	}
}), yl = /* @__PURE__ */ I([]), bl = /* @__PURE__ */ I(!1), xl = /* @__PURE__ */ I(""), Sl = !1, Cl;
function wl(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function Tl() {
	async function e(e = !1) {
		if (Sl && !e) return;
		Cl?.abort();
		let t = new AbortController();
		Cl = t, bl.value = !0, xl.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && Cl === t && (yl.value = e, Sl = !0);
		} catch (e) {
			!t.signal.aborted && Cl === t && (xl.value = wl(e));
		} finally {
			Cl === t && (bl.value = !1);
		}
	}
	function t(e) {
		yl.value = yl.value.findIndex((t) => t.id === e.id) < 0 ? [...yl.value, e] : yl.value.map((t) => t.id === e.id ? e : t), Sl = !0;
	}
	async function n(n, r, i) {
		let a = await $.addDevice(n, r, i);
		return t(a), await e(!0), a;
	}
	async function r(t) {
		await $.refreshDevices(t), await e(!0);
	}
	async function i(e, n) {
		let r = await $.setCredentials(e, n);
		return t(r), r;
	}
	function a() {
		Cl?.abort();
	}
	return {
		devices: /* @__PURE__ */ Rt(yl),
		loading: /* @__PURE__ */ Rt(bl),
		error: /* @__PURE__ */ Rt(xl),
		load: e,
		add: n,
		refresh: r,
		credentials: i,
		abort: a
	};
}
//#endregion
//#region src/studio/components/DeviceRegistry.vue?vue&type=script&setup=true&lang.ts
var El = {
	class: "studio-card",
	"data-device-registry": ""
}, Dl = { class: "flex flex-wrap items-start justify-between gap-3" }, Ol = ["disabled"], kl = { class: "mt-3" }, Al = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, jl = {
	key: 0,
	class: "studio-note",
	role: "status"
}, Ml = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Nl = ["open"], Pl = ["disabled"], Fl = {
	key: 2,
	class: "studio-muted mt-3"
}, Il = {
	key: 3,
	class: "mt-4 grid gap-2"
}, Ll = ["data-device-id"], Rl = { class: "studio-muted text-xs" }, zl = { class: "flex flex-wrap gap-2 items-center" }, Bl = ["disabled", "onClick"], Vl = ["onSubmit"], Hl = ["name"], Ul = ["disabled"], Wl = {
	key: 0,
	class: "studio-muted"
}, Gl = /* @__PURE__ */ sr({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Tl(), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I("standalone"), s = /* @__PURE__ */ I(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I("");
		function f(e, t) {
			t instanceof HTMLInputElement ? c.set(e, t) : c.delete(e);
		}
		function p(e) {
			return e.leader_id ? `Parent ${e.leader_id}` : "Direct registry target";
		}
		function m() {
			r("changed", [...i.devices.value]);
		}
		async function h() {
			let e = s.value?.value ?? "";
			s.value && (s.value.value = ""), l.value = "add", d.value = "", u.value = "";
			try {
				await i.add(a.value, e, o.value), a.value = "", u.value = o.value === "leader" ? "Leader added; follower membership was refreshed." : "Standalone kiosk added.", m();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Device could not be added.";
			} finally {
				l.value = "";
			}
		}
		async function g(e) {
			l.value = `refresh:${e.id}`, d.value = "";
			try {
				await i.refresh(e.id), u.value = "Fleet membership refreshed.", m();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Fleet refresh failed.";
			} finally {
				l.value = "";
			}
		}
		async function _(e) {
			let t = c.get(e.id), n = t?.value ?? "";
			t && (t.value = ""), l.value = `credentials:${e.id}`, d.value = "";
			try {
				await i.credentials(e.id, n), u.value = "Kiosk authenticated; token saved server-side.", m();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Credentials were not saved.";
			} finally {
				l.value = "";
			}
		}
		return Sr(async () => {
			await i.load(), m();
		}), Tr(() => i.abort()), (e, t) => (H(), U("section", El, [
			W("div", Dl, [t[3] ||= W("div", null, [W("h2", null, "Fleet setup"), W("p", { class: "studio-muted" }, "Register a fleet leader or standalone kiosks.")], -1), W("button", {
				type: "button",
				disabled: L(i).loading.value,
				onClick: t[0] ||= (e) => L(i).load(!0)
			}, "Refresh registry", 8, Ol)]),
			W("details", kl, [
				t[4] ||= W("summary", null, "Fleet safety details", -1),
				t[5] ||= W("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (H(), U("p", Al, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : q("", !0)
			]),
			u.value ? (H(), U("p", jl, M(u.value), 1)) : q("", !0),
			d.value || L(i).error.value ? (H(), U("p", Ml, M(d.value || L(i).error.value), 1)) : q("", !0),
			W("details", {
				"data-device-registration": "",
				class: "mt-3",
				open: !L(i).devices.value.length
			}, [
				t[10] ||= W("summary", null, "Add device", -1),
				W("form", {
					"data-device-add": "",
					class: "studio-registration-row",
					onSubmit: Lo(h, ["prevent"])
				}, [
					W("label", null, [t[6] ||= K("Address", -1), R(W("input", {
						"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
						required: "",
						name: "url",
						autocomplete: "url",
						placeholder: "http://kiosk.local:2324"
					}, null, 512), [[Y, a.value]])]),
					W("label", null, [t[8] ||= K("Role", -1), R(W("select", {
						"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
						name: "role"
					}, [...t[7] ||= [W("option", { value: "standalone" }, "Standalone", -1), W("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Ao, o.value]])]),
					W("label", null, [t[9] ||= K("Admin password", -1), W("input", {
						ref_key: "passwordInput",
						ref: s,
						required: "",
						name: "password",
						type: "password",
						autocomplete: "off"
					}, null, 512)]),
					W("button", {
						type: "submit",
						class: "studio-primary",
						disabled: l.value === "add"
					}, "Add device", 8, Pl)
				], 32),
				t[11] ||= W("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
			], 8, Nl),
			L(i).loading.value ? (H(), U("p", Fl, "Loading registered devices…")) : (H(), U("div", Il, [(H(!0), U(V, null, B(L(i).devices.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [W("div", null, [
				W("strong", null, M(e.id), 1),
				t[12] ||= K(),
				W("span", { class: j(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, M(e.role === "follower" ? "Follower" : e.role), 3),
				W("p", Rl, M(p(e)) + " · " + M(e.active ? e.url : "Inactive member"), 1)
			]), W("div", zl, [
				W("span", { class: j(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, M(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
				W("span", { class: j(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, M(e.model_eligible ? "Profile covered" : "Not covered"), 3),
				e.role === "leader" ? (H(), U("button", {
					key: 0,
					type: "button",
					disabled: l.value === `refresh:${e.id}`,
					onClick: (t) => g(e)
				}, "Refresh followers", 8, Bl)) : q("", !0),
				e.role === "follower" && e.credentials_status !== "ready" ? (H(), U("form", {
					key: 1,
					class: "flex gap-2",
					onSubmit: Lo((t) => _(e), ["prevent"])
				}, [W("input", {
					ref_for: !0,
					ref: (t) => f(e.id, t),
					name: `credentials-${e.id}`,
					required: "",
					type: "password",
					autocomplete: "off",
					"aria-label": "Follower admin password"
				}, null, 8, Hl), W("button", {
					type: "submit",
					disabled: l.value === `credentials:${e.id}`
				}, "Authenticate", 8, Ul)], 40, Vl)) : q("", !0)
			])], 8, Ll))), 128)), L(i).devices.value.length ? q("", !0) : (H(), U("p", Wl, "No kiosks registered yet."))]))
		]));
	}
}), Kl = { class: "flex flex-wrap items-start justify-between gap-3 mb-4" }, ql = ["disabled"], Jl = {
	key: 0,
	class: "studio-note",
	role: "status"
}, Yl = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Xl = { class: "studio-card mb-4" }, Zl = {
	key: 0,
	class: "studio-muted"
}, Ql = {
	key: 1,
	class: "grid gap-3"
}, $l = { class: "studio-muted text-xs" }, eu = { key: 0 }, tu = {
	key: 2,
	class: "studio-muted"
}, nu = { class: "studio-card" }, ru = ["data-recording-id"], iu = { class: "studio-muted text-xs" }, au = ["onUpdate:modelValue"], ou = ["value"], su = ["disabled", "onClick"], cu = {
	key: 0,
	class: "studio-muted"
}, lu = /* @__PURE__ */ sr({
	__name: "ScrapePage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I({}), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d, f, p = 0;
		async function m() {
			d?.abort();
			let e = new AbortController();
			d = e;
			let t = ++p;
			o.value = !0, l.value = "";
			try {
				let [a, o, s] = await Promise.all([
					$.schedules(e.signal),
					$.scrapeRuns({ limit: 25 }, e.signal),
					$.unmapped({ limit: 50 }, e.signal)
				]);
				if (e.signal.aborted || t !== p) return;
				n.value = a.find((e) => e.scope === "scrape") ?? null, r.value = o.items, i.value = s.items;
			} catch (n) {
				!e.signal.aborted && t === p && (l.value = n instanceof Error ? n.message : "Scrape information could not be loaded.");
			} finally {
				!e.signal.aborted && t === p && (o.value = !1);
			}
		}
		async function h() {
			f?.abort();
			let e = new AbortController();
			f = e, s.value = !0, l.value = "";
			try {
				let t = await $.scrape(void 0, e.signal);
				!e.signal.aborted && f === e && (r.value = [t, ...r.value], u.value = `Scrape ${t.id} finished with ${t.status}.`);
			} catch (t) {
				!e.signal.aborted && f === e && (l.value = t instanceof Error ? t.message : "Manual scrape failed.");
			} finally {
				f === e && (s.value = !1);
			}
		}
		async function g(e) {
			let t = a.value[e.id];
			if (!t) return;
			f?.abort();
			let n = new AbortController();
			f = n, c.value = e.id, l.value = "";
			try {
				await $.setSourceMapping(e.device_id, {
					engine: e.engine,
					source_phrase: e.phrase,
					word_id: t
				}, n.signal), !n.signal.aborted && f === n && (i.value = i.value.filter((t) => t.id !== e.id), u.value = `Mapped “${e.phrase}” to the selected wakeword.`);
			} catch (e) {
				!n.signal.aborted && f === n && (l.value = e instanceof Error ? e.message : "Source mapping was not saved.");
			} finally {
				f === n && (c.value = "");
			}
		}
		return z(() => t.selectedId.value, () => {
			m();
		}, { immediate: !0 }), Tr(() => {
			d?.abort(), f?.abort();
		}), (e, d) => (H(), U("section", null, [
			W("div", Kl, [d[2] ||= W("div", null, [W("h1", null, "Scrape"), W("p", { class: "studio-muted" }, "Collection is global across the fleet. Source phrases are routed only by explicit mappings, never by the selected wakeword.")], -1), W("button", {
				"data-action": "scrape-now",
				type: "button",
				class: "studio-primary",
				disabled: s.value,
				onClick: h
			}, M(s.value ? "Scraping…" : "Scrape now"), 9, ql)]),
			u.value ? (H(), U("p", Jl, M(u.value), 1)) : q("", !0),
			l.value ? (H(), U("p", Yl, M(l.value), 1)) : q("", !0),
			G(vl, {
				scope: "scrape",
				schedule: n.value,
				class: "mb-4",
				onSaved: d[0] ||= (e) => n.value = e
			}, null, 8, ["schedule"]),
			G(Gl, {
				surface: "scrape",
				class: "mb-4",
				onChanged: d[1] ||= (e) => void m()
			}),
			W("section", Xl, [d[4] ||= W("h2", null, "Collection history", -1), o.value ? (H(), U("p", Zl, "Loading scrape history…")) : r.value.length ? (H(), U("div", Ql, [(H(!0), U(V, null, B(r.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history"
			}, [
				W("div", null, [W("strong", null, M(e.id), 1), K(" · " + M(e.status) + " · " + M(e.started_at), 1)]),
				W("p", $l, "Listed " + M(e.listed) + " · New " + M(e.new) + " · Unmapped " + M(e.unmapped) + " · Failed " + M(e.failed), 1),
				W("ul", null, [(H(!0), U(V, null, B(e.devices, (e) => (H(), U("li", { key: e.device_id }, [
					W("strong", null, M(e.device_id), 1),
					d[3] ||= K(": ", -1),
					W("span", { class: j(["studio-status", e.status === "complete" && e.failed === 0 ? "studio-status-success" : "studio-status-warning"]) }, M(e.status), 3),
					K(" · new " + M(e.new) + " · failed " + M(e.failed), 1),
					e.errors.length ? (H(), U("span", eu, " · " + M(e.errors.join(", ")), 1)) : q("", !0)
				]))), 128))])
			]))), 128))])) : (H(), U("p", tu, "No collection runs yet."))]),
			W("section", nu, [
				d[7] ||= W("h2", null, "Unmapped source inbox", -1),
				d[8] ||= W("p", { class: "studio-muted" }, "Map each device + engine source phrase explicitly to a wakeword. Unknown recordings remain here until assigned.", -1),
				(H(!0), U(V, null, B(i.value, (e) => (H(), U("article", {
					key: e.id,
					class: "studio-mapping-row",
					"data-recording-id": e.id
				}, [
					W("div", null, [W("strong", null, M(e.phrase), 1), W("p", iu, M(e.device_id) + " · " + M(e.engine) + " · " + M(e.near_miss ? "Near miss" : "Activation"), 1)]),
					W("label", null, [d[6] ||= K("Source phrase → wakeword", -1), R(W("select", {
						"onUpdate:modelValue": (t) => a.value[e.id] = t,
						name: "mapping-word"
					}, [d[5] ||= W("option", { value: "" }, "Choose wakeword", -1), (H(!0), U(V, null, B(L(t).wakewords.value, (e) => (H(), U("option", {
						key: e.id,
						value: e.id
					}, M(e.phrase), 9, ou))), 128))], 8, au), [[Ao, a.value[e.id]]])]),
					W("button", {
						"data-action": "save-mapping",
						type: "button",
						disabled: !a.value[e.id] || c.value === e.id,
						onClick: (t) => g(e)
					}, "Save mapping", 8, su)
				], 8, ru))), 128)),
				i.value.length ? q("", !0) : (H(), U("p", cu, "No unmapped recordings."))
			])
		]));
	}
}), uu = {
	key: 0,
	class: "studio-note",
	role: "status"
}, du = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, fu = {
	key: 2,
	class: "studio-card studio-safety mb-4",
	"data-staging-notice": ""
}, pu = {
	class: "studio-note",
	"data-quarantine-notice": "",
	role: "alert"
}, mu = { class: "studio-muted" }, hu = { class: "studio-card mb-4" }, gu = {
	key: 0,
	class: "studio-muted"
}, _u = {
	key: 1,
	class: "grid gap-3"
}, vu = ["data-version-id"], yu = { class: "flex flex-wrap justify-between gap-3" }, bu = { class: "min-w-0 flex-1" }, xu = { class: "studio-muted text-xs" }, Su = {
	key: 0,
	class: "studio-note text-xs"
}, Cu = { class: "flex flex-wrap items-center gap-2" }, wu = ["href"], Tu = ["disabled", "onClick"], Eu = [
	"data-action",
	"disabled",
	"onClick"
], Du = {
	key: 0,
	class: "studio-muted text-xs"
}, Ou = {
	key: 2,
	class: "studio-muted"
}, ku = { class: "studio-card" }, Au = ["data-device-status"], ju = {
	key: 0,
	class: "studio-status studio-status-muted"
}, Mu = { class: "studio-muted text-xs" }, Nu = { class: "text-xs" }, Pu = {
	key: 0,
	class: "studio-muted text-xs"
}, Fu = { key: 0 }, Iu = {
	key: 0,
	class: "studio-muted"
}, Lu = {
	key: 3,
	class: "studio-modal-backdrop"
}, Ru = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm rollback"
}, zu = { class: "flex gap-2" }, Bu = ["disabled"], Vu = /* @__PURE__ */ sr({
	__name: "DeployPage",
	setup(e) {
		let t = ss(), n = Tl(), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(null), u = /* @__PURE__ */ I(""), d, f, p = 0, m = 0, h = !1, g = J(() => new Map(n.devices.value.map((e) => [e.id, e])));
		function _(e) {
			return (e.state === "published" || e.state === "synced") && e.manifest_state === "verified" && e.refresh_state === "acknowledged" && e.runtime_state === "verified";
		}
		function v(e) {
			return _(e) ? "studio-status-success" : e.state === "offline" || e.state === "credentials_required" || e.state === "not_covered" || e.state === "pending" || e.state === "quarantined" || e.state === "staging_blocked" ? "studio-status-warning" : "studio-status-muted";
		}
		function y(e) {
			return e.runtime_state || "unverified";
		}
		function b(e, n, r) {
			return !h && !e.signal.aborted && f === e && r === m && t.selectedId.value === n;
		}
		async function x() {
			let e = t.selectedId.value;
			d?.abort();
			let n = new AbortController();
			d = n;
			let c = ++p;
			if (r.value = [], i.value = [], a.value = null, o.value = !!e, s.value = "", e) try {
				let [o, s, l] = await Promise.all([
					$.models(e, { limit: 50 }, n.signal),
					$.deploymentStatus(e, n.signal),
					$.deploymentCapabilities(n.signal)
				]);
				if (n.signal.aborted || c !== p || t.selectedId.value !== e) return;
				r.value = o.items, i.value = s, a.value = l;
			} catch (e) {
				!n.signal.aborted && c === p && (s.value = e instanceof Error ? e.message : "Deployment history could not be loaded.");
			} finally {
				!n.signal.aborted && c === p && (o.value = !1);
			}
		}
		async function S(e) {
			let n = t.selectedId.value;
			if (!n) return;
			f?.abort();
			let r = new AbortController();
			f = r;
			let a = ++m;
			u.value = e.id, s.value = "";
			try {
				let t = await $.publish(n, e.id, r.signal);
				b(r, n, a) && (i.value = t, c.value = "Publication requested for registered leader and standalone targets.");
			} catch (e) {
				b(r, n, a) && (s.value = e instanceof Error ? e.message : "Publication failed.");
			} finally {
				b(r, n, a) && (u.value = "");
			}
		}
		async function C() {
			let e = l.value, n = t.selectedId.value;
			if (!e || !n) return;
			f?.abort();
			let r = new AbortController();
			f = r;
			let a = ++m;
			u.value = e.id, s.value = "";
			try {
				let t = await $.rollback(n, e.id, r.signal);
				b(r, n, a) && (i.value = t, c.value = `Rollback to archive ${e.id} requested; archives were retained.`, l.value = null);
			} catch (e) {
				b(r, n, a) && (s.value = e instanceof Error ? e.message : "Rollback failed.");
			} finally {
				b(r, n, a) && (u.value = "");
			}
		}
		return z(() => t.selectedId.value, () => {
			f?.abort(), f = void 0, m += 1, u.value = "", l.value = null, c.value = "", x();
		}, { immediate: !0 }), Tr(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, t) => (H(), U("section", null, [
			t[12] ||= W("div", { class: "mb-4" }, [W("h1", null, "Deploy"), W("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (H(), U("p", uu, M(c.value), 1)) : q("", !0),
			s.value ? (H(), U("p", du, M(s.value), 1)) : q("", !0),
			a.value ? (H(), U("section", fu, [
				t[5] ||= W("h2", null, "Before publishing", -1),
				t[6] ||= W("p", null, [W("strong", null, "Clean, exclusive staging required."), K(" No concurrent manual uploads; staging cannot be checked automatically.")], -1),
				W("p", pu, [t[2] ||= W("strong", null, "Quarantine warning:", -1), K(" " + M(a.value.quarantine_notice), 1)]),
				W("details", null, [
					t[3] ||= W("summary", null, "Publication safety details", -1),
					W("p", null, M(a.value.notice), 1),
					t[4] ||= W("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
					W("p", mu, M(a.value.operator_action), 1)
				])
			])) : q("", !0),
			G(Gl, {
				surface: "deploy",
				class: "mb-4",
				onChanged: t[0] ||= (e) => void x()
			}),
			W("section", hu, [t[7] ||= W("h2", null, "Archived model versions", -1), o.value ? (H(), U("p", gu, "Loading archives…")) : r.value.length ? (H(), U("div", _u, [(H(!0), U(V, null, B(r.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [W("div", yu, [W("div", bu, [
				W("strong", null, M(e.id), 1),
				W("p", xu, M(e.trained_at) + " · Run " + M(e.run_id), 1),
				e.origin === "legacy" ? (H(), U("p", Su, "Legacy import · " + M(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : q("", !0)
			]), W("div", Cu, [
				W("a", { href: L($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, wu),
				W("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, M(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, Tu),
				W("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Eu)
			])]), L(ns)(e.metrics).recall === null ? q("", !0) : (H(), U("p", Du, "Recall " + M(L(ns)(e.metrics).recall), 1))], 8, vu))), 128))])) : (H(), U("p", Ou, "No archived model versions for this workspace."))]),
			W("section", ku, [
				t[9] ||= W("h2", null, "Target delivery", -1),
				t[10] ||= W("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(H(!0), U(V, null, B(i.value, (e) => (H(), U("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [W("div", null, [
					W("strong", null, M(e.device_id), 1),
					t[8] ||= K(),
					g.value.get(e.device_id)?.role === "follower" ? (H(), U("span", ju, "Follower")) : q("", !0),
					W("p", Mu, M(g.value.get(e.device_id)?.leader_id ? `Indirect via ${g.value.get(e.device_id)?.leader_id}` : "Direct leader/standalone target"), 1)
				]), W("div", null, [
					W("span", { class: j(["studio-status", v(e)]) }, M(e.state), 3),
					W("p", Nu, "Desired " + M(e.desired_version) + " · Observed " + M(y(e)), 1),
					e.error_code ? (H(), U("p", Pu, [K("Retry/error: " + M(e.error_code), 1), e.next_retry ? (H(), U("span", Fu, " · next " + M(e.next_retry), 1)) : q("", !0)])) : q("", !0)
				])], 8, Au))), 128)),
				i.value.length ? q("", !0) : (H(), U("p", Iu, "No publication status yet."))
			]),
			l.value ? (H(), U("div", Lu, [W("section", Ru, [
				t[11] ||= W("h2", null, "Rollback archive?", -1),
				W("p", null, "Republish " + M(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				W("div", zu, [W("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, Bu), W("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: t[1] ||= (e) => l.value = null
				}, "Cancel")])
			])])) : q("", !0)
		]));
	}
}), Hu = ["data-job-id"], Uu = { class: "flex flex-wrap items-center justify-between gap-3" }, Wu = {
	key: 0,
	class: "studio-muted text-xs"
}, Gu = {
	key: 0,
	class: "studio-log",
	"aria-label": "Job log tail"
}, Ku = {
	key: 1,
	class: "studio-muted text-xs"
}, qu = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Ju = /* @__PURE__ */ sr({
	__name: "JobConsole",
	props: {
		jobId: {},
		intervalMs: { default: 2e3 },
		logLimit: { default: 8192 }
	},
	emits: ["update"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c, l, u = 0, d = J(() => i.value !== null && [
			"complete",
			"failed",
			"cancelled",
			"interrupted"
		].includes(i.value.status)), f = J(() => i.value !== null && [
			"queued",
			"running",
			"cancelling"
		].includes(i.value.status)), p = J(() => a.value.length > n.logLimit ? `…${a.value.slice(-n.logLimit)}` : a.value);
		function m() {
			c?.abort(), c = void 0, l && clearTimeout(l), l = void 0;
		}
		function h(e) {
			!d.value && e === u && (l = setTimeout(() => void g(e), n.intervalMs));
		}
		async function g(e = ++u) {
			m();
			let t = new AbortController();
			c = t, s.value = i.value === null, o.value = "";
			try {
				let [o, s] = await Promise.all([$.job(n.jobId, t.signal), $.jobLogs(n.jobId, n.logLimit, t.signal)]);
				if (t.signal.aborted || e !== u || n.jobId !== o.id) return;
				i.value = o, a.value = s.text, r("update", o), h(e);
			} catch (n) {
				!t.signal.aborted && e === u && (o.value = n instanceof Error ? n.message : "Unable to load job status.");
			} finally {
				!t.signal.aborted && e === u && (s.value = !1);
			}
		}
		async function _() {
			if (!f.value) return;
			c?.abort(), l && clearTimeout(l), l = void 0;
			let e = ++u, t = new AbortController();
			c = t, o.value = "";
			try {
				let a = await $.cancelJob(n.jobId, t.signal);
				!t.signal.aborted && e === u && (i.value = a, r("update", a), d.value || await g(e));
			} catch (n) {
				!t.signal.aborted && e === u && (o.value = n instanceof Error ? n.message : "Unable to cancel job.");
			}
		}
		return z(() => n.jobId, () => {
			m(), i.value = null, a.value = "", g();
		}, { immediate: !0 }), Tr(m), (t, n) => (H(), U("section", {
			class: "studio-card mt-3",
			"data-job-id": e.jobId,
			"aria-live": "polite"
		}, [
			W("div", Uu, [W("div", null, [W("h3", null, "Job " + M(e.jobId), 1), s.value ? (H(), U("p", Wu, "Loading job state…")) : i.value ? (H(), U("span", {
				key: 1,
				class: j(["studio-status", `studio-status-${i.value.status}`])
			}, M(i.value.status), 3)) : q("", !0)]), f.value ? (H(), U("button", {
				key: 0,
				type: "button",
				"data-action": "cancel-job",
				onClick: _
			}, "Cancel job")) : q("", !0)]),
			p.value ? (H(), U("pre", Gu, M(p.value), 1)) : d.value ? (H(), U("p", Ku, "No retained log output.")) : q("", !0),
			o.value ? (H(), U("p", qu, M(o.value), 1)) : q("", !0)
		], 8, Hu));
	}
}), Yu = { class: "studio-card" }, Xu = { class: "studio-toolbar" }, Zu = ["disabled"], Qu = {
	key: 0,
	class: "studio-muted mt-3"
}, $u = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, ed = {
	key: 2,
	class: "studio-table mt-3 grid gap-3"
}, td = { class: "studio-dataset-row" }, nd = { class: "studio-checkbox-label" }, rd = [
	"data-dataset-id",
	"checked",
	"onChange"
], id = { class: "studio-dataset-copy" }, ad = { class: "studio-muted block text-xs" }, od = { class: "studio-muted block text-xs" }, sd = {
	key: 0,
	class: "studio-note block text-xs"
}, cd = { class: "studio-dataset-actions" }, ld = ["disabled", "onClick"], ud = {
	key: 3,
	class: "studio-muted mt-3"
}, dd = /* @__PURE__ */ sr({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I(0), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I([]), p, m, h, g = 0, _ = 0, v = 0, y = J(() => t.selectedId.value), b = J(() => [...s.value].sort());
		function x(e, t, n) {
			return y.value === e && g === t && !n.signal.aborted;
		}
		function S(e, t, n) {
			return y.value === e && _ === t && !n.signal.aborted;
		}
		function C(e, t, n) {
			return y.value === e && v === t && !n.signal.aborted;
		}
		function w() {
			m?.abort(), h?.abort(), m = void 0, h = void 0, _ += 1, v += 1, l.value = !1, u.value = !1, f.value = [];
		}
		async function T(e, t) {
			let n = [], r = 0;
			for (; !t.signal.aborted;) {
				let i = await $.datasets(e, {
					status: "selected",
					offset: r,
					limit: 100
				}, t.signal);
				if (n.push(...i.items), r += i.items.length, r >= i.total || i.items.length === 0) break;
			}
			return n;
		}
		async function E() {
			p?.abort();
			let e = new AbortController();
			p = e;
			let t = ++g, l = y.value;
			if (n.value = [], r.value = 0, s.value = /* @__PURE__ */ new Set(), d.value = "", l) {
				c.value = !0;
				try {
					let c = {
						search: a.value,
						status: o.value || void 0,
						offset: i.value,
						limit: 50
					}, [u, d] = await Promise.all([$.datasets(l, c, e.signal), T(l, e)]);
					if (!x(l, t, e)) return;
					n.value = u.items, r.value = u.total, s.value = new Set(d.map((e) => e.id));
				} catch (n) {
					x(l, t, e) && (d.value = n instanceof Error ? n.message : "Unable to load datasets.");
				} finally {
					x(l, t, e) && (c.value = !1);
				}
			}
		}
		function D(e, t) {
			let n = new Set(s.value);
			t ? n.add(e) : n.delete(e), s.value = n;
		}
		async function O() {
			let e = y.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++_, r = b.value;
			l.value = !0, d.value = "";
			try {
				await $.selectDatasets(e, r, t.signal), S(e, n, t) && await E();
			} catch (r) {
				S(e, n, t) && (d.value = r instanceof Error ? r.message : "Dataset selection was not saved.");
			} finally {
				S(e, n, t) && (l.value = !1);
			}
		}
		async function ee(e) {
			let t = y.value;
			if (!t) return;
			h?.abort();
			let n = new AbortController();
			h = n;
			let r = ++v;
			u.value = !0, d.value = "";
			try {
				let i = await $.downloadDataset(e.id, n.signal);
				C(t, r, n) && (f.value = [i, ...f.value.filter((e) => e.id !== i.id)]);
			} catch (e) {
				C(t, r, n) && (d.value = e instanceof Error ? e.message : "Dataset download was not started.");
			} finally {
				C(t, r, n) && (u.value = !1);
			}
		}
		z(y, () => {
			w(), E();
		}, { immediate: !0 }), z(i, () => {
			E();
		}), z(a, () => {
			i.value === 0 ? E() : i.value = 0;
		}), z(o, () => {
			i.value === 0 ? E() : i.value = 0;
		}), Tr(() => {
			p?.abort(), m?.abort(), h?.abort();
		});
		function k(e) {
			return e === null ? "Size not published" : `${Math.ceil(e / 1024)} KiB`;
		}
		return (e, t) => (H(), U("section", null, [t[6] ||= W("div", { class: "mb-4" }, [W("h1", null, "Negative Datasets"), W("p", { class: "studio-muted" }, "Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.")], -1), W("div", Yu, [
			W("div", Xu, [
				W("label", null, [t[3] ||= K("Search", -1), R(W("input", {
					"onUpdate:modelValue": t[0] ||= (e) => a.value = e,
					name: "dataset-search",
					type: "search",
					placeholder: "Search catalog"
				}, null, 512), [[Y, a.value]])]),
				W("label", null, [t[5] ||= K("Installation state", -1), R(W("select", {
					"onUpdate:modelValue": t[1] ||= (e) => o.value = e,
					name: "dataset-status"
				}, [...t[4] ||= [la("<option value=\"\">All states</option><option value=\"available\">Available</option><option value=\"installed\">Installed</option><option value=\"queued\">Queued</option><option value=\"running\">Running</option><option value=\"failed\">Failed</option><option value=\"selected\">Selected</option>", 7)]], 512), [[Ao, o.value]])]),
				W("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: l.value || !y.value,
					onClick: O
				}, M(l.value ? "Saving…" : "Save selection"), 9, Zu)
			]),
			c.value ? (H(), U("p", Qu, "Loading catalog…")) : q("", !0),
			d.value ? (H(), U("p", $u, M(d.value), 1)) : q("", !0),
			n.value.length ? (H(), U("div", ed, [(H(!0), U(V, null, B(n.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history"
			}, [W("div", td, [W("label", nd, [W("input", {
				"data-dataset-id": e.id,
				type: "checkbox",
				checked: s.value.has(e.id),
				onChange: (t) => D(e.id, t.target.checked)
			}, null, 40, rd), W("span", id, [
				W("strong", null, M(e.name), 1),
				W("span", ad, M(e.description) + " · " + M(e.source) + " · " + M(e.license), 1),
				W("span", od, M(e.representation) + " / " + M(e.adapter) + " · " + M(e.split) + " · " + M(k(e.installed_bytes ?? e.download_bytes)), 1),
				e.split === "evaluation" ? (H(), U("span", sd, "Evaluation-only: this dataset is not sampled as a training input.")) : q("", !0)
			])]), W("div", cd, [W("span", { class: j(["studio-status", `studio-status-${e.status}`]) }, M(e.status), 3), e.status === "available" || e.status === "failed" ? (H(), U("button", {
				key: 0,
				type: "button",
				disabled: u.value,
				onClick: (t) => ee(e)
			}, "Download", 8, ld)) : q("", !0)])]), e.job_id && [
				"queued",
				"running",
				"cancelling"
			].includes(e.status) ? (H(), ta(Ju, {
				key: 0,
				"job-id": e.job_id
			}, null, 8, ["job-id"])) : q("", !0)]))), 128))])) : c.value ? q("", !0) : (H(), U("p", ud, "No catalog datasets match these filters.")),
			G(Vc, {
				total: r.value,
				offset: i.value,
				limit: 50,
				loading: c.value,
				onPage: t[2] ||= (e) => i.value = e
			}, null, 8, [
				"total",
				"offset",
				"loading"
			]),
			(H(!0), U(V, null, B(f.value, (e) => (H(), ta(Ju, {
				key: e.id,
				"job-id": e.id
			}, null, 8, ["job-id"]))), 128))
		])]));
	}
}), fd = { class: "studio-card" }, pd = {
	"data-generation-phrase": "",
	class: "studio-muted"
}, md = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, hd = ["value"], gd = ["value"], _d = ["disabled"], vd = ["value"], yd = {
	key: 1,
	value: "mixed"
}, bd = { class: "grid gap-3 sm:grid-cols-2" }, xd = { class: "flex items-center justify-between gap-3" }, Sd = { class: "studio-checkbox-label" }, Cd = [
	"data-engine",
	"checked",
	"onChange"
], wd = [
	"data-preview",
	"disabled",
	"onClick"
], Td = {
	key: 0,
	role: "alert",
	class: "studio-note mt-3"
}, Ed = [
	"data-preview-audio",
	"src",
	"aria-label"
], Dd = ["disabled"], Od = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, kd = { class: "studio-card mt-4" }, Ad = { class: "flex flex-wrap items-center justify-between gap-3" }, jd = ["disabled"], Md = {
	key: 0,
	class: "studio-muted mt-3"
}, Nd = { class: "studio-checkbox-label" }, Pd = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], Fd = { class: "studio-muted block text-xs" }, Id = {
	key: 0,
	class: "studio-muted block text-xs"
}, Ld = { class: "studio-status ml-auto" }, Rd = {
	key: 1,
	class: "studio-muted mt-3"
}, zd = /* @__PURE__ */ sr({
	__name: "ArtificialPage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(0), o = /* @__PURE__ */ I({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), s = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I(null), f = /* @__PURE__ */ I({}), p = /* @__PURE__ */ I({}), m = /* @__PURE__ */ I({}), h = /* @__PURE__ */ new Map(), g = {
			omnivoice: "OmniVoice",
			qwen3: "Qwen3-TTS",
			moss: "MOSS-TTS",
			piper: "Piper"
		}, _, v, y = 0, b = 0, x = !1, S = J(() => t.selectedId.value), C = J(() => t.selected.value), w = J(() => n.value.find((e) => e.language === o.value.language) ?? null), T = J(() => w.value?.engines.hybrid ?? []), E = J(() => !!w.value?.accent_applies && o.value.engines?.some((e) => e !== "piper"));
		function D(e, t, n) {
			return S.value === e && y === t && !n.signal.aborted;
		}
		function O(e, t, n) {
			return S.value === e && b === t && !n.signal.aborted;
		}
		function ee() {
			let e = w.value;
			if (!e) return;
			let t = o.value.engines ?? e.engines[o.value.tts_mode];
			o.value.engines = t.filter((e) => T.value.includes(e)), E.value || (o.value.english_accent = "mixed");
		}
		function k() {
			v?.abort(), v = void 0, b += 1, l.value = !1, d.value = null;
			for (let e of h.values()) e.abort();
			h.clear(), f.value = {}, p.value = {}, m.value = {};
		}
		async function te() {
			_?.abort();
			let e = new AbortController();
			_ = e;
			let t = ++y, l = S.value;
			if (r.value = [], i.value = 0, u.value = "", l) {
				c.value = !0;
				try {
					let [c, u, d, f, p] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(l, e.signal).catch((e) => e instanceof $o && e.status === 404 ? null : Promise.reject(e)),
						$.batches(l, {
							offset: a.value,
							limit: 50
						}, e.signal),
						x ? Promise.resolve(null) : $.batchSelection(l, e.signal),
						$.wakeword(l, e.signal)
					]);
					if (!D(l, t, e)) return;
					n.value = c, x ||= (o.value = u ?? {
						language: p.language,
						english_accent: "mixed",
						tts_mode: "hybrid",
						samples: 1,
						batch_size: 1
					}, ee(), s.value = new Set(f ?? []), !0), r.value = d.items, i.value = d.total;
				} catch (n) {
					D(l, t, e) && (u.value = n instanceof Error ? n.message : "Unable to load generation settings.");
				} finally {
					D(l, t, e) && (c.value = !1);
				}
			}
		}
		function ne(e) {
			o.value.language = e, ee();
		}
		function re(e, t) {
			let n = new Set(o.value.engines);
			t ? n.add(e) : n.delete(e), o.value.engines = [...n];
		}
		function ie() {
			return !Number.isInteger(o.value.samples) || o.value.samples < 1 || !Number.isInteger(o.value.batch_size) || o.value.batch_size < 1 ? (u.value = "Sample count and batch size must be positive integers.", !1) : o.value.engines?.length ? !0 : (u.value = "Select at least one generation model.", !1);
		}
		async function A() {
			let e = S.value;
			if (!e || !ie()) return;
			v?.abort();
			let t = new AbortController();
			v = t;
			let n = ++b, r = {
				...o.value,
				engines: [...o.value.engines],
				english_accent: E.value ? o.value.english_accent : "mixed",
				tts_mode: "hybrid"
			};
			l.value = !0, u.value = "";
			try {
				let i = await $.generate(e, r, t.signal);
				O(e, n, t) && (o.value = r, d.value = i);
			} catch (r) {
				O(e, n, t) && (u.value = r instanceof Error ? r.message : "Generation job was not started.");
			} finally {
				O(e, n, t) && (l.value = !1);
			}
		}
		async function ae(e) {
			let t = S.value;
			if (!t || p.value[e]) return;
			h.get(e)?.abort();
			let n = new AbortController();
			h.set(e, n), p.value[e] = !0, m.value[e] = "", delete f.value[e];
			try {
				let r = await $.preview(t, {
					...o.value,
					tts_mode: "hybrid",
					engines: [e],
					samples: 1,
					batch_size: 1,
					english_accent: w.value?.accent_applies && e !== "piper" ? o.value.english_accent : "mixed"
				}, n.signal);
				!n.signal.aborted && S.value === t && (f.value[e] = r);
			} catch (r) {
				!n.signal.aborted && S.value === t && (m.value[e] = r instanceof Error ? r.message : "Preview could not start.");
			} finally {
				h.get(e) === n && (p.value[e] = !1, h.delete(e));
			}
		}
		function oe(e, t) {
			f.value[e]?.id === t.id && (f.value[e] = t);
		}
		function se(e) {
			let t = d.value;
			t?.id === e.id && (d.value = e, e.status === "complete" && t.status !== "complete" && (a.value = 0, te()));
		}
		function ce(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(s.value);
			t ? n.add(e.id) : n.delete(e.id), s.value = n;
		}
		async function le() {
			let e = S.value;
			if (!e || !x || c.value) return;
			v?.abort();
			let t = new AbortController();
			v = t;
			let n = ++b, r = [...s.value];
			l.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), O(e, n, t) && await te();
			} catch (r) {
				O(e, n, t) && (u.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				O(e, n, t) && (l.value = !1);
			}
		}
		return z(S, () => {
			k(), x = !1, s.value = /* @__PURE__ */ new Set(), o.value = {
				language: C.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, a.value = 0, te();
		}, { immediate: !0 }), z(a, () => {
			te();
		}), Tr(() => {
			_?.abort(), k();
		}), (e, t) => (H(), U("section", null, [
			t[15] ||= W("div", { class: "mb-4" }, [W("h1", null, "Artificial"), W("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			W("div", fd, [
				t[12] ||= W("h2", null, "Generate data", -1),
				W("p", pd, [t[5] ||= K("Wake phrase: ", -1), W("strong", null, M(C.value?.phrase ?? "No workspace selected"), 1)]),
				W("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Lo(A, ["prevent"])
				}, [
					W("div", md, [
						W("label", null, [t[6] ||= K("Language", -1), W("select", {
							name: "language",
							value: o.value.language,
							onChange: t[0] ||= (e) => ne(e.target.value)
						}, [(H(!0), U(V, null, B(n.value, (e) => (H(), U("option", {
							key: e.language,
							value: e.language
						}, M(e.name), 9, gd))), 128))], 40, hd)]),
						W("label", null, [t[7] ||= K("English accent", -1), R(W("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => o.value.english_accent = e,
							disabled: !E.value
						}, [E.value ? (H(!0), U(V, { key: 0 }, B(w.value?.english_accents ?? [], (e) => (H(), U("option", {
							key: e.code,
							value: e.code
						}, M(e.label), 9, vd))), 128)) : (H(), U("option", yd, "Not applicable"))], 8, _d), [[Ao, o.value.english_accent]])]),
						W("label", null, [t[8] ||= K("Total samples", -1), R(W("input", {
							"onUpdate:modelValue": t[2] ||= (e) => o.value.samples = e,
							name: "samples",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							Y,
							o.value.samples,
							void 0,
							{ number: !0 }
						]])]),
						W("label", null, [t[9] ||= K("Batch size", -1), R(W("input", {
							"onUpdate:modelValue": t[3] ||= (e) => o.value.batch_size = e,
							name: "batch-size",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							Y,
							o.value.batch_size,
							void 0,
							{ number: !0 }
						]])])
					]),
					W("fieldset", null, [t[10] ||= W("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), W("div", bd, [(H(!0), U(V, null, B(T.value, (e) => (H(), U("article", {
						key: e,
						class: "studio-history"
					}, [
						W("div", xd, [W("label", Sd, [W("input", {
							type: "checkbox",
							"data-engine": e,
							checked: o.value.engines?.includes(e),
							onChange: (t) => re(e, t.target.checked)
						}, null, 40, Cd), W("strong", null, M(g[e] ?? e), 1)]), W("button", {
							type: "button",
							"data-preview": e,
							disabled: p.value[e] || [
								"queued",
								"running",
								"cancelling"
							].includes(f.value[e]?.status ?? "") || !S.value,
							onClick: (t) => ae(e)
						}, M(p.value[e] ? "Starting…" : "Preview"), 9, wd)]),
						m.value[e] ? (H(), U("p", Td, M(m.value[e]), 1)) : q("", !0),
						f.value[e] && f.value[e].status !== "complete" ? (H(), ta(Ju, {
							key: 1,
							"job-id": f.value[e].id,
							onUpdate: (t) => oe(e, t)
						}, null, 8, ["job-id", "onUpdate"])) : q("", !0),
						f.value[e]?.status === "complete" ? (H(), U("audio", {
							key: 2,
							"data-preview-audio": e,
							class: "mt-3 max-w-full",
							src: L($).previewAudioUrl(S.value, f.value[e].id),
							controls: "",
							autoplay: "",
							"aria-label": `${g[e] ?? e} wakeword preview`
						}, null, 8, Ed)) : q("", !0)
					]))), 128))])]),
					t[11] ||= W("p", { class: "studio-muted text-xs" }, "Samples are shared across the selected models. Preview generates one sample without adding it to your training data. Accent support varies by model.", -1),
					W("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						disabled: l.value || c.value || !S.value
					}, M(l.value ? "Starting…" : "Generate dataset"), 9, Dd)
				], 32),
				u.value ? (H(), U("p", Od, M(u.value), 1)) : q("", !0),
				d.value ? (H(), ta(Ju, {
					key: 1,
					"job-id": d.value.id,
					onUpdate: se
				}, null, 8, ["job-id"])) : q("", !0)
			]),
			W("div", kd, [
				W("div", Ad, [t[13] ||= W("h2", null, "Generated datasets", -1), W("button", {
					type: "button",
					"data-action": "save-batches",
					disabled: l.value || c.value || !S.value,
					onClick: le
				}, "Save selection", 8, jd)]),
				t[14] ||= W("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				c.value ? (H(), U("p", Md, "Loading datasets…")) : q("", !0),
				(H(!0), U(V, null, B(r.value, (e) => (H(), U("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [W("label", Nd, [
					W("input", {
						"data-batch-id": e.id,
						type: "checkbox",
						checked: s.value.has(e.id),
						disabled: e.status !== "complete",
						onChange: (t) => ce(e, t.target.checked)
					}, null, 40, Pd),
					W("span", null, [
						W("strong", null, M(e.phrase), 1),
						W("span", Fd, M(e.audio.length) + " samples · " + M(e.recipe.engines?.map((e) => g[e] ?? e).join(", ") || "Saved generation models") + " · " + M(e.created_at ? new Date(e.created_at).toLocaleString() : ""), 1),
						e.status === "complete" ? q("", !0) : (H(), U("span", Id, M(e.status) + " — only completed datasets can be selected.", 1))
					]),
					W("span", Ld, M(e.status), 1)
				])]))), 128)),
				!c.value && !r.value.length ? (H(), U("p", Rd, "No generated datasets yet. Choose models above to create one.")) : q("", !0),
				G(Vc, {
					total: i.value,
					offset: a.value,
					limit: 50,
					loading: c.value,
					onPage: t[4] ||= (e) => a.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			])
		]));
	}
}), Bd = { class: "studio-card" }, Vd = {
	key: 0,
	class: "studio-muted"
}, Hd = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-3 my-4"
}, Ud = { class: "studio-muted" }, Wd = { class: "text-2xl font-semibold" }, Gd = { class: "studio-muted" }, Kd = { class: "text-2xl font-semibold" }, qd = { class: "studio-muted" }, Jd = { class: "text-2xl font-semibold" }, Yd = { class: "studio-card mt-4" }, Xd = { class: "grid gap-3 mt-3" }, Zd = {
	"data-dataset-compatibility": "",
	class: "studio-note text-xs"
}, Qd = { class: "flex gap-2" }, $d = ["disabled"], ef = ["disabled"], tf = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, nf = { class: "studio-card mt-4" }, rf = { class: "flex justify-between gap-3" }, af = {
	key: 0,
	class: "studio-note text-xs"
}, of = {
	key: 0,
	class: "studio-muted"
}, sf = /* @__PURE__ */ sr({
	__name: "TrainPage",
	setup(e) {
		let t = ss(), n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I({ training_steps: 4e4 }), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I([]), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I(null), f, p, m, h = 0, g = 0, _ = 0, v = J(() => t.selectedId.value), y = J(() => v.value ? `train:${v.value}` : "train:"), b = J(() => [...new Set(o.value.map((e) => `${e.representation}/${e.adapter}`))]);
		function x(e, t, n) {
			return v.value === e && h === t && !n.signal.aborted;
		}
		function S(e, t, n) {
			return v.value === e && g === t && !n.signal.aborted;
		}
		function C(e, t, n) {
			return v.value === e && _ === t && !n.signal.aborted;
		}
		function w() {
			p?.abort(), m?.abort(), p = void 0, m = void 0, g += 1, _ += 1, c.value = !1, l.value = !1, d.value = null;
		}
		async function T(e, t) {
			let n = [], r = 0;
			for (; !t.signal.aborted;) {
				let i = await $.datasets(e, {
					status: "selected",
					offset: r,
					limit: 100
				}, t.signal);
				if (n.push(...i.items), r += i.items.length, r >= i.total || i.items.length === 0) break;
			}
			return n;
		}
		async function E() {
			f?.abort();
			let e = new AbortController();
			f = e;
			let t = ++h, c = v.value;
			if (n.value = null, i.value = [], a.value = null, o.value = [], d.value = null, u.value = "", c) {
				s.value = !0;
				try {
					let [s, l, u, d, f] = await Promise.all([
						$.trainingCounts(c, e.signal),
						$.trainingSettings(c, e.signal),
						$.trainingRuns(c, { limit: 50 }, e.signal),
						$.schedules(e.signal),
						T(c, e)
					]);
					if (!x(c, t, e)) return;
					n.value = s, r.value = l, i.value = u.items, a.value = d.find((e) => e.scope === `train:${c}`) ?? null, o.value = f;
				} catch (n) {
					x(c, t, e) && (u.value = n instanceof Error ? n.message : "Unable to load training configuration.");
				} finally {
					x(c, t, e) && (s.value = !1);
				}
			}
		}
		function D() {
			return !Number.isInteger(r.value.training_steps) || r.value.training_steps < 1 || r.value.training_steps > 1e7 ? (u.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function O() {
			let e = v.value;
			if (!e || !D()) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, i = { training_steps: r.value.training_steps };
			c.value = !0, u.value = "";
			try {
				let a = await $.saveTrainingSettings(e, i, t.signal);
				S(e, n, t) && (r.value = a);
			} catch (r) {
				S(e, n, t) && (u.value = r instanceof Error ? r.message : "Training settings were not saved.");
			} finally {
				S(e, n, t) && (c.value = !1);
			}
		}
		async function ee() {
			let e = v.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++_;
			l.value = !0, u.value = "";
			try {
				let r = await $.train(e, t.signal);
				C(e, n, t) && (d.value = r);
			} catch (r) {
				C(e, n, t) && (u.value = r instanceof Error ? r.message : "Training job was not started.");
			} finally {
				C(e, n, t) && (l.value = !1);
			}
		}
		function k(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return z(v, () => {
			w(), E();
		}, { immediate: !0 }), Tr(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, t) => (H(), U("section", null, [
			t[12] ||= W("div", { class: "mb-4" }, [W("h1", null, "Train"), W("p", { class: "studio-muted" }, "Manual runs always execute. Scheduled runs snapshot inputs when they begin and can skip unchanged fingerprints.")], -1),
			W("div", Bd, [
				t[5] ||= W("h2", null, "Effective inputs for the next snapshot", -1),
				s.value ? (H(), U("p", Vd, "Loading effective inputs…")) : n.value ? (H(), U("div", Hd, [
					W("p", Ud, [W("strong", Wd, M(n.value.positive), 1), t[2] ||= K(" reviewed positives", -1)]),
					W("p", Gd, [W("strong", Kd, M(n.value.negative), 1), t[3] ||= K(" reviewed negatives", -1)]),
					W("p", qd, [W("strong", Jd, M(n.value.artificial), 1), t[4] ||= K(" selected artificial", -1)])
				])) : q("", !0),
				t[6] ||= W("p", { class: "studio-muted text-xs" }, "Only reviewed positive/negative samples and completed selected artificial batches are counted. Pending and discarded recordings are not training inputs.", -1)
			]),
			W("div", Yd, [
				t[10] ||= W("h2", null, "Training parameters", -1),
				W("div", Xd, [
					W("label", null, [t[7] ||= K("Training steps", -1), R(W("input", {
						"onUpdate:modelValue": t[0] ||= (e) => r.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						Y,
						r.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					W("p", Zd, [
						t[8] ||= K("Selected classifier representations: ", -1),
						W("strong", null, M(b.value.join(", ") || "none"), 1),
						t[9] ||= K(". microWakeWord uses mww_mmap feature tensors. dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					W("div", Qd, [W("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: c.value,
						onClick: O
					}, M(c.value ? "Saving…" : "Save parameters"), 9, $d), W("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !v.value || l.value,
						onClick: ee
					}, M(l.value ? "Starting…" : "Start training"), 9, ef)])
				]),
				u.value ? (H(), U("p", tf, M(u.value), 1)) : q("", !0),
				d.value ? (H(), ta(Ju, {
					key: 1,
					"job-id": d.value.id
				}, null, 8, ["job-id"])) : q("", !0)
			]),
			G(vl, {
				class: "mt-4",
				scope: y.value,
				schedule: a.value,
				onSaved: t[1] ||= (e) => a.value = e
			}, null, 8, ["scope", "schedule"]),
			W("div", nf, [
				t[11] ||= W("h2", null, "Run history", -1),
				(H(!0), U(V, null, B(i.value, (e) => (H(), U("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					W("div", rf, [W("strong", null, M(e.id), 1), W("span", { class: j(["studio-status", `studio-status-${e.status}`]) }, M(e.status), 3)]),
					k(e) ? (H(), U("p", af, "Skipped because inputs and configuration were unchanged.")) : q("", !0),
					G(Ju, { "job-id": e.id }, null, 8, ["job-id"])
				]))), 128)),
				!s.value && !i.value.length ? (H(), U("p", of, "No training runs for this workspace yet.")) : q("", !0)
			])
		]));
	}
}), cf = { class: "studio-sidebar" }, lf = { class: "flex items-center justify-between gap-3" }, uf = ["aria-expanded"], df = ["hidden"], ff = {
	key: 0,
	class: "studio-nav-label"
}, pf = {
	key: 1,
	class: "studio-nav-label"
}, mf = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], hf = { class: "studio-main" }, gf = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, _f = { class: "studio-muted text-xs" }, vf = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, yf = ["value", "disabled"], bf = {
	key: 0,
	value: ""
}, xf = ["value"], Sf = {
	key: 0,
	role: "status",
	class: "studio-note"
}, Cf = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, wf = {
	key: 2,
	role: "status"
}, Tf = /* @__PURE__ */ sr({
	__name: "StudioShell",
	setup(e) {
		let t = Yo(), n = as(t);
		Fn(os, n);
		let { wakewords: r, selectedId: i, selected: a, loading: o, error: s, notice: c } = n, l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(), f = /* @__PURE__ */ I(), p = J(() => Ko.find((e) => e.id === t.page.value)), m = J(() => u.value && !l.value), h = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
		function g() {
			u.value = h?.matches ?? !1;
		}
		function _() {
			l.value = !1, d.value?.focus();
		}
		function v(e) {
			e.key === "Escape" && l.value && _();
		}
		function y(e) {
			t.navigate(e), l.value = !1, f.value?.focus();
		}
		return z(u, (e) => {
			e || (l.value = !1);
		}), g(), h?.addEventListener ? h.addEventListener("change", g) : h?.addListener(g), Sr(() => {
			document.addEventListener("keydown", v), n.load();
		}), Tr(() => {
			document.removeEventListener("keydown", v), h?.removeEventListener ? h.removeEventListener("change", g) : h?.removeListener(g);
		}), (e, a) => (H(), U("div", { class: j(["studio-app", { "is-narrow": u.value }]) }, [
			W("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: a[0] ||= Lo((e) => f.value?.focus(), ["prevent"])
			}, "Skip to content"),
			W("aside", cf, [
				W("div", lf, [a[3] ||= W("div", { class: "studio-brand" }, [K("◈ Wakeword Studio"), W("small", null, "LISTEN · REFINE · DEPLOY")], -1), u.value ? (H(), U("button", {
					key: 0,
					ref_key: "toggle",
					ref: d,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": l.value,
					onClick: a[1] ||= (e) => l.value = !l.value
				}, "Menu", 8, uf)) : q("", !0)]),
				W("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: m.value
				}, [(H(!0), U(V, null, B(L(Ko), (e, n) => (H(), U(V, { key: e.id }, [
					n === 1 ? (H(), U("div", ff, "Data")) : q("", !0),
					n === 6 ? (H(), U("div", pf, "Models")) : q("", !0),
					W("a", {
						href: L(t).href(e.id),
						"data-page": e.id,
						class: j({
							active: p.value.id === e.id,
							"studio-sub": e.group === "Data"
						}),
						"aria-current": p.value.id === e.id ? "page" : void 0,
						onClick: Lo((t) => y(e.id), ["prevent"])
					}, M(e.name), 11, mf)
				], 64))), 128))], 8, df),
				a[4] ||= W("p", { class: "studio-sidebar-note" }, [
					K("Independent workspaces."),
					W("br"),
					K("Device selections stay unchanged.")
				], -1)
			]),
			W("div", hf, [W("header", gf, [W("div", _f, M(p.value.group) + " / " + M(p.value.name), 1), W("label", vf, [a[5] ||= K("WAKEWORD ", -1), W("select", {
				id: "studio-word",
				value: L(i),
				disabled: !L(r).length,
				onChange: a[2] ||= (e) => L(n).select(e.target.value)
			}, [L(r).length ? q("", !0) : (H(), U("option", bf, "No wakewords")), (H(!0), U(V, null, B(L(r), (e) => (H(), U("option", {
				key: e.id,
				value: e.id
			}, M(e.phrase), 9, xf))), 128))], 40, yf)])]), W("main", {
				id: "studio-content",
				ref_key: "content",
				ref: f,
				class: "studio-content",
				tabindex: "-1"
			}, [
				L(c) ? (H(), U("p", Sf, M(L(c)), 1)) : q("", !0),
				L(s) ? (H(), U("div", Cf, M(L(s)), 1)) : q("", !0),
				L(o) ? (H(), U("p", wf, "Loading workspaces…")) : q("", !0),
				p.value.id === "wakewords" ? (H(), ta(As, { key: 3 })) : p.value.id === "classify" ? (H(), ta(dc, { key: 4 })) : p.value.id === "samples" ? (H(), ta(dl, { key: 5 })) : p.value.id === "scrape" ? (H(), ta(lu, { key: 6 })) : p.value.id === "deploy" ? (H(), ta(Vu, { key: 7 })) : p.value.id === "negative-datasets" ? (H(), ta(dd, { key: 8 })) : p.value.id === "artificial" ? (H(), ta(zd, { key: 9 })) : p.value.id === "train" ? (H(), ta(sf, { key: 10 })) : q("", !0)
			], 512)])
		], 2));
	}
}), Ef = /* @__PURE__ */ sr({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (H(), ta(Tf));
	}
}), Df = document.getElementById("trainer-app");
if (!Df) throw Error("Missing #trainer-app mount point");
Uo(Ef).mount(Df);
//#endregion

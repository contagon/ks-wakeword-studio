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
}, D = /-\w/g, O = E((e) => e.replace(D, (e) => e.slice(1).toUpperCase())), ee = /\B([A-Z])/g, k = E((e) => e.replace(ee, "-$1").toLowerCase()), te = E((e) => e.charAt(0).toUpperCase() + e.slice(1)), A = E((e) => e ? `on${te(e)}` : ""), j = (e, t) => !Object.is(e, t), ne = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, re = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, ie = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, ae, oe = () => ae ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function se(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? de(r) : se(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var ce = /;(?![^(]*\))/g, le = /:([^]+)/, ue = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function de(e) {
	let t = {};
	return e.replace(ue, (e) => e.startsWith("/*") ? "" : e).split(ce).forEach((e) => {
		if (e) {
			let n = e.split(le);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function M(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = M(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var fe = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function pe(e) {
	return !!e || e === "";
}
function me(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = ve(e[i], t[i], n);
	return r;
}
function he(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && ve(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function ge(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? he(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !ve(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function _e(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function ve(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? _e(e, t, n, me) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : _e(e, t, n, ge) : String(e) === String(t))));
}
function ye(e, t) {
	return e.findIndex((e) => ve(e, t));
}
var be = (e) => !!(e && e.__v_isRef === !0), N = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? be(e) ? N(e.value) : JSON.stringify(e, xe, 2) : String(e), xe = (e, t) => be(t) ? xe(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Se(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Se(e)) } : _(t) ? Se(t) : v(t) && !d(t) && !C(t) ? String(t) : t, Se = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, Ce, we = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Ce && (Ce.active ? (this.parent = Ce, this.index = (Ce.scopes || (Ce.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = Ce;
			try {
				return Ce = this, e();
			} finally {
				Ce = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = Ce, Ce = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (Ce === this) Ce = this.prevScope;
			else {
				let e = Ce;
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
	return Ce;
}
function Ee(e, t = !1) {
	Ce && Ce.cleanups.push(e);
}
var P, De = /* @__PURE__ */ new WeakSet(), Oe = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Ce && (Ce.active ? Ce.effects.push(this) : this.flags &= -2);
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
		(t.version === 0 || j(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
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
		return e === /* @__PURE__ */ F(r) && s && (o ? j(n, i) && tt(e, "set", t, n, i) : tt(e, "add", t, n)), s;
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
			e || (j(n, a) && et(i, "get", n), et(i, "get", a));
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
			return e || (j(t, i) && et(r, "has", t), et(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
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
			return r.has.call(n, a) || j(e, a) && r.has.call(n, e) || j(i, a) && r.has.call(n, i) || (n.add(a), tt(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Ht(n) && !/* @__PURE__ */ Vt(n) && (n = /* @__PURE__ */ F(n));
			let r = /* @__PURE__ */ F(this), { has: i, get: a } = Ct(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ F(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? j(n, s) && tt(r, "set", e, n, s) : tt(r, "add", e, n), this;
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
	return !u(e, "__v_skip") && Object.isExtensible(e) && re(e, "__v_skip", !0), e;
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
		e = n ? e : /* @__PURE__ */ F(e), j(e, t) && (this._rawValue = e, this._value = n ? e : Gt(e), this.dep.trigger());
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
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Je(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function en(e) {
	return new $t(e);
}
var tn = class {
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
function nn(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new tn(r, i, n);
}
var rn = {}, an = /* @__PURE__ */ new WeakMap(), on = void 0;
function sn(e, t = !1, n = on) {
	if (n) {
		let t = an.get(n);
		t || an.set(n, t = []), t.push(e);
	}
}
function cn(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Ht(e) || o === !1 || o === 0 ? ln(e, 1) : ln(e), m, g, _, v, y = !1, b = !1;
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
		let t = on;
		on = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			on = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => ln(e(), t);
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
	let C = b ? Array(e.length).fill(rn) : rn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => j(e, C[t])) : j(t, C))) {
					let e = on;
					Ue();
					try {
						_ && _(), on = m;
						let e = [
							t,
							C === rn ? void 0 : b && C[0] === rn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						on = e, We();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Oe(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => sn(e, !1, m), _ = m.onStop = () => {
		let e = an.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			an.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function ln(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ qt(e)) ln(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) ln(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		ln(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) ln(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && ln(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function un(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		fn(e, t, n);
	}
}
function dn(e, t, n, r) {
	if (h(e)) {
		let i = un(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			fn(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(dn(e[a], t, n, r));
		return i;
	}
}
function fn(e, n, r, i = !0) {
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
			Ue(), un(o, null, 10, [
				e,
				i,
				a
			]), We();
			return;
		}
	}
	pn(e, r, a, i, s);
}
function pn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var mn = [], hn = -1, gn = [], _n = null, vn = 0, yn = /* @__PURE__ */ Promise.resolve(), bn = null;
function xn(e) {
	let t = bn || yn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function Sn(e) {
	let t = hn + 1, n = mn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = mn[r], a = An(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function Cn(e) {
	if (!(e.flags & 1)) {
		let t = An(e), n = mn[mn.length - 1];
		!n || !(e.flags & 2) && t >= An(n) ? mn.push(e) : mn.splice(Sn(t), 0, e), e.flags |= 1, wn();
	}
}
function wn() {
	bn ||= yn.then(jn);
}
function Tn(e) {
	if (!d(e)) _n && e.id === -1 ? _n.splice(vn + 1, 0, e) : e.flags & 1 || (gn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) gn.push(e[t]);
	wn();
}
function En(e, t, n, r = hn + 1) {
	for (; r < mn.length; r++) {
		let n = mn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			mn.splice(r, 1), r = e ? r - 1 : hn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function Dn(e, t, n = 0) {
	if (gn.length) {
		let e = gn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < gn.length; i++) {
				let a = gn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? gn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => An(e) - An(t));
		if (gn.length = r, _n) {
			for (let e = 0; e < i.length; e++) _n.push(i[e]);
			return;
		}
		for (_n = i, vn = 0; vn < _n.length; vn++) {
			let e = _n[vn];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		_n = null, vn = 0;
	}
}
var On = !1;
function kn(e, t) {
	if (On) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(gn);
	e(), On = !0;
	try {
		En(void 0, t), Dn(void 0, n, t);
	} finally {
		On = !1;
	}
}
var An = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function jn(e) {
	try {
		for (hn = 0; hn < mn.length; hn++) {
			let e = mn[hn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), un(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; hn < mn.length; hn++) {
			let e = mn[hn];
			e && (e.flags &= -2);
		}
		hn = -1, mn.length = 0, Dn(e), bn = null, (mn.length || gn.length) && jn(e);
	}
}
var Mn = null, Nn = null;
function Pn(e) {
	let t = Mn;
	return Mn = e, Nn = e && e.type.__scopeId || null, t;
}
function Fn(e, t = Mn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && ia(-1);
		let i = Pn(t), a = ea.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = ea.length; e > a; e--) na();
			Pn(i), r._d && ia(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function R(e, n) {
	if (Mn === null) return e;
	let r = La(Mn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && ln(o), i.push({
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
function In(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Ue(), dn(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), We());
	}
}
function Ln(e, t) {
	if (Ca) {
		let n = Ca.provides, r = Ca.parent && Ca.parent.provides;
		r === n && (n = Ca.provides = Object.create(r)), n[e] = t;
	}
}
function Rn(e, t, n = !1) {
	let r = wa();
	if (r || ai) {
		let i = ai ? ai._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var zn = /* @__PURE__ */ Symbol.for("v-scx"), Bn = () => Rn(zn);
function Vn(e, t) {
	return Hn(e, null, { flush: "sync" });
}
function z(e, t, n) {
	return Hn(e, t, n);
}
function Hn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Aa) {
		if (c === "sync") {
			let e = Bn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Ca;
	u.call = (e, t, n) => dn(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Ri(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Cn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = cn(e, n, u);
	return Aa && (f ? f.push(h) : d && h()), h;
}
function Un(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Wn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Da(this), s = Hn(i, a.bind(r), n);
	return o(), s;
}
function Wn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Gn = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ Symbol("_vte"), qn = (e) => e.__isTeleport, Jn = (e) => e && (e.disabled || e.disabled === ""), Yn = (e) => e && (e.defer || e.defer === ""), Xn = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Zn = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Qn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, $n = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Jn(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Jn(e.props), r = e.target = Qn(e.props, m), a = ir(r, e, h, p);
			r && (o !== "svg" && Xn(r) ? o = "svg" : o !== "mathml" && Zn(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), rr(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Gn.get(e) === t) {
					if (Gn.delete(e), Jn(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), rr(e, !0);
					}
					x(e);
				}
			};
			Gn.set(e, t), Ri(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Yn(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), rr(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Gn.get(e);
			if (u) {
				u.flags |= 8, Gn.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Jn(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Xn(p) ? o = "svg" : (o === "mathml" || Zn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Wi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : er(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Qn(t.props, m);
				e && (t.target = e, er(t, e, null, l, 0));
			} else g && er(t, p, h, l, 1);
			rr(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Jn(f), m = a || !p, h = Gn.get(e);
		if (h && (h.flags |= 8, Gn.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: er,
	hydrate: tr
};
function er(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Gn.has(e) && (!d || Jn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function tr(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Qn(t.props, c), h = Jn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || ir(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || ir(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), rr(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var nr = $n;
function rr(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function ir(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Kn] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var ar = /* @__PURE__ */ Symbol("_leaveCb");
function or(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Qi) {
			t = n;
			break;
		}
	}
	return t;
}
function sr(e) {
	if (!gr(e)) return qn(e.type) && e.children ? or(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function cr(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		cr(qn(n.type) && sr(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === V && d(e.children)) {
		let n = pi(e.children, !1);
		n && cr(n, t);
	}
}
function lr(e) {
	if (e.component) return lr(e.component.subTree);
	if (e.type === V) {
		let t = d(e.children) && pi(e.children, !1);
		return t ? lr(t) : void 0;
	}
	if (e.type !== Qi) return e;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function ur(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function dr(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var fr = /* @__PURE__ */ new WeakMap();
function pr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => pr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (hr(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && pr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? La(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ F(v), b = v === t ? i : (e) => !dr(_, e) && u(y, e), x = (e, t) => !(t && dr(_, t));
	if (m != null && m !== p) {
		if (mr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ qt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) un(p, f, 12, [l, _]);
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
					i(), fr.delete(e);
				};
				t.id = -1, fr.set(e, t), Ri(t, r);
			} else mr(e), i();
		}
	}
}
function mr(e) {
	let t = fr.get(e);
	t && (t.flags |= 8, fr.delete(e));
}
oe().requestIdleCallback, oe().cancelIdleCallback;
var hr = (e) => !!e.type.__asyncLoader, gr = (e) => e.type.__isKeepAlive;
function _r(e, t) {
	yr(e, "a", t);
}
function vr(e, t) {
	yr(e, "da", t);
}
function yr(e, t, n = Ca) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (xr(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) gr(e.parent.vnode) && br(r, t, n, e), e = e.parent;
	}
}
function br(e, t, n, r) {
	let i = xr(t, e, r, !0);
	Or(() => {
		c(r[t], i);
	}, n);
}
function xr(e, t, n = Ca, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ue();
			let i = Da(n), a = dn(t, n, e, r);
			return i(), We(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var Sr = (e) => (t, n = Ca) => {
	(!Aa || e === "sp") && xr(e, (...e) => t(...e), n);
}, Cr = Sr("bm"), wr = Sr("m"), Tr = Sr("bu"), Er = Sr("u"), Dr = Sr("bum"), Or = Sr("um"), kr = Sr("sp"), Ar = Sr("rtg"), jr = Sr("rtc");
function Mr(e, t = Ca) {
	xr("ec", e, t);
}
var Nr = /* @__PURE__ */ Symbol.for("v-ndc");
function Pr(e, t, n, r) {
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
var Fr = (e) => e ? ka(e) ? La(e) : Fr(e.parent) : null, Ir = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Fr(e.parent),
	$root: (e) => Fr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Kr(e),
	$forceUpdate: (e) => e.f ||= () => {
		Cn(e.update);
	},
	$nextTick: (e) => e.n ||= xn.bind(e.proxy),
	$watch: (e) => Un.bind(e)
}), Lr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Rr = {
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
			else if (Lr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Vr && (s[n] = 0);
		}
		let d = Ir[n], f, p;
		if (d) return n === "$attrs" && et(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Lr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Lr(n, c) || u(o, c) || u(i, c) || u(Ir, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function zr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Br(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, zr(e), zr(t));
}
var Vr = !0;
function Hr(e) {
	let t = Kr(e), n = e.proxy, i = e.ctx;
	Vr = !1, t.beforeCreate && Wr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: ee, expose: k, inheritAttrs: te, components: A, directives: j, filters: ne } = t;
	if (u && Ur(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ It(t));
	}
	if (Vr = !0, o) for (let e in o) {
		let t = o[e], a = Y({
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
	if (c) for (let e in c) Gr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			Ln(t, e[t]);
		});
	}
	f && Wr(f, e, "c");
	function re(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (re(Cr, p), re(wr, m), re(Tr, g), re(Er, _), re(_r, y), re(vr, b), re(Mr, O), re(jr, E), re(Ar, D), re(Dr, S), re(Or, w), re(kr, ee), d(k)) {
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
	T && e.render === r && (e.render = T), te != null && (e.inheritAttrs = te), A && (e.components = A), j && (e.directives = j), ee && ur(e);
}
function Ur(e, t, n = r) {
	d(e) && (e = Zr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Rn(r.from || n, r.default, !0) : Rn(r.from || n) : Rn(r), /* @__PURE__ */ qt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Wr(e, t, n) {
	dn(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Gr(e, t, n, r) {
	let i = r.includes(".") ? Wn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && z(i, n);
	} else if (h(e)) z(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Gr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && z(i, r, e);
		}
	}
}
function Kr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => qr(c, e, o, !0)), qr(c, t, o)), v(t) && a.set(t, c), c;
}
function qr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && qr(e, a, n, !0), i && i.forEach((t) => qr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Jr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Jr = {
	data: Yr,
	props: ei,
	emits: ei,
	methods: $r,
	computed: $r,
	beforeCreate: Qr,
	created: Qr,
	beforeMount: Qr,
	mounted: Qr,
	beforeUpdate: Qr,
	updated: Qr,
	beforeDestroy: Qr,
	beforeUnmount: Qr,
	destroyed: Qr,
	unmounted: Qr,
	activated: Qr,
	deactivated: Qr,
	errorCaptured: Qr,
	serverPrefetch: Qr,
	components: $r,
	directives: $r,
	watch: ti,
	provide: Yr,
	inject: Xr
};
function Yr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Xr(e, t) {
	return $r(Zr(e), Zr(t));
}
function Zr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Qr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function $r(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ei(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), zr(e), zr(t ?? {})) : t;
}
function ti(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Qr(e[r], t[r]);
	return n;
}
function ni() {
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
var ri = 0;
function ii(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = ni(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ri++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: za,
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
					let u = l._ceVNode || K(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, La(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (dn(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = ai;
				ai = l;
				try {
					return e();
				} finally {
					ai = t;
				}
			}
		};
		return l;
	};
}
var ai = null;
function oi(e, n, r = t) {
	let i = wa(), a = O(n), o = k(n), s = si(e, a), c = en((s, c) => {
		let l, u = t, d;
		return Vn(() => {
			let t = e[a];
			j(l, t) && (l = t, c());
		}), {
			get() {
				return s(), r.get ? r.get(l) : l;
			},
			set(e) {
				let s = r.set ? r.set(e) : e;
				if (!j(s, l) && !(u !== t && j(e, u))) return;
				let f = i.vnode.props, p = !!(f && (n in f || a in f || o in f) && (`onUpdate:${n}` in f || `onUpdate:${a}` in f || `onUpdate:${o}` in f));
				p || (l = e, c()), i.emit(`update:${n}`, s), j(e, u) && (j(e, s) && !j(s, d) || p && u !== t && !j(s, l)) && c(), u = e, d = s;
			}
		};
	});
	return c[Symbol.iterator] = () => {
		let e = 0;
		return { next() {
			return e < 2 ? {
				value: e++ ? s || t : c,
				done: !1
			} : { done: !0 };
		} };
	}, c;
}
var si = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function ci(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && si(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(ie)));
	let c, l = i[c = A(n)] || i[c = A(O(n))];
	!l && o && (l = i[c = A(k(n))]), l && dn(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, dn(u, e, 6, a);
	}
}
var li = /* @__PURE__ */ new WeakMap();
function ui(e, t, n = !1) {
	let r = n ? li : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ui(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function di(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function fi(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Pn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = ma(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = ma(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : mi(c);
		}
	} catch (t) {
		ea.length = 0, fn(t, e, 1), v = K(Qi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = hi(y, a)), b = fa(b, y, !1, !0));
	}
	return n.dirs && (b = fa(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && cr(qn(b.type) && sr(b) || b, n.transition), v = b, Pn(_), v;
}
function pi(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (oa(r)) {
			if (r.type !== Qi || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var mi = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, hi = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function gi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? _i(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (vi(o, r, n) && !di(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || _i(r, o, l) : !!o;
	return !1;
}
function _i(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || vi(t, e, a) && !di(n, a)) return !0;
	}
	return !1;
}
function vi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !ve(r, i) : r !== i;
}
function yi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var bi = {}, xi = () => Object.create(bi), Si = (e) => Object.getPrototypeOf(e) === bi;
function Ci(e, t, n, r = !1) {
	let i = {}, a = xi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Ti(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ Lt(i) : e.type.props ? i : a, e.attrs = a;
}
function wi(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ F(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (di(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = O(o);
						i[t] = Ei(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		Ti(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = k(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ei(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && tt(e.attrs, "set", "");
}
function Ti(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : di(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ F(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = Ei(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function Ei(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Da(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var Di = /* @__PURE__ */ new WeakMap();
function Oi(e, r, i = !1) {
	let a = i ? Di : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Oi(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		ki(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (ki(t)) {
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
function ki(e) {
	return e[0] !== "$" && !T(e);
}
var Ai = (e) => e === "_" || e === "_ctx" || e === "$stable", ji = (e) => d(e) ? e.map(ma) : [ma(e)], Mi = (e, t, n) => {
	if (t._n) return t;
	let r = Fn((...e) => ji(t(...e)), n);
	return r._c = !1, r;
}, Ni = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ai(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Mi(n, i, r);
		else if (i != null) {
			let e = ji(i);
			t[n] = () => e;
		}
	}
}, Pi = (e, t) => {
	let n = ji(t);
	e.slots.default = () => n;
}, Fi = (e, t, n) => {
	for (let r in t) (n || !Ai(r)) && (e[r] = t[r]);
}, Ii = (e, t, n) => {
	let r = e.slots = xi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Fi(r, t, n), n && re(r, "_", e, !0)) : Ni(t, r);
	} else t && Pi(e, t);
}, Li = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Fi(a, n, r) : (o = !n.$stable, Ni(n, a)), s = n;
	} else n && (Pi(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ai(e) && s[e] == null && delete a[e];
}, Ri = Xi;
function zi(e) {
	return Bi(e);
}
function Bi(e, i) {
	let a = oe();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !sa(e, t) && (i = ge(e), M(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case Zi:
				y(e, t, r, i);
				break;
			case Qi:
				b(e, t, r, i);
				break;
			case $i:
				e ?? x(t, r, i, s);
				break;
			case V:
				A(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? j(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ve);
		}
		d != null && a ? pr(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && pr(e.ref, null, o, e, !0);
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
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, Vi(e, a), s, u), _ && In(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && va(f, r, e);
		}
		_ && In(e, null, r, "beforeMount");
		let v = Ui(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Ri(() => {
			try {
				f && va(f, r, e), v && g.enter(d), _ && In(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Yi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? ha(e[l]) : ma(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, ee = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Hi(r, !1), (g = h.onVnodeBeforeUpdate) && va(g, r, n, e), f && In(n, e, r, "beforeUpdate"), r && Hi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, Vi(n, a), o) : s || ce(e, n, l, null, r, i, Vi(n, a), o, !1), u > 0) {
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
		((g = h.onVnodeUpdated) || f) && Ri(() => {
			g && va(g, r, n, e), f && In(n, e, r, "updated");
		}, i);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Ji(c), d = u && (c.type === V || !sa(c, l) || c.shapeFlag & 198) ? m(u) : n;
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
	}, A = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Wi(e, t, !0)) : ce(e, t, n, f, i, a, s, c, l);
	}, j = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : re(t, n, r, i, a, o, c) : ie(e, t, c);
	}, re = (e, t, n, r, i, a, o) => {
		let s = e.component = Sa(e, r, i);
		if (gr(e) && (s.ctx.renderer = ve), ja(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ae, o, a), !e.el) {
				let r = s.subTree = K(Qi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else ae(s, e, t, n, i, a, o);
	}, ie = (e, t, n) => {
		let r = t.component = e.component;
		if (gi(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, se(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, ae = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Ki(e);
					if (n) {
						t && (t.el = c.el, se(e, t, o)), n.asyncDep.then(() => {
							Ri(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Hi(e, !1), t ? (t.el = c.el, se(e, t, o)) : t = c, n && ne(n), (d = t.props && t.props.onVnodeBeforeUpdate) && va(d, s, t, c), Hi(e, !0);
				let f = fi(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), ge(p), e, i, a), t.el = f.el, u === null && yi(e, f.el), r && Ri(r, i), (d = t.props && t.props.onVnodeUpdated) && Ri(() => va(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = hr(t);
				if (Hi(e, !1), l && ne(l), !m && (o = c && c.onVnodeBeforeMount) && va(o, d, t), Hi(e, !0), s && be) {
					let t = () => {
						e.subTree = fi(e), be(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = fi(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Ri(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Ri(() => va(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && hr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Ri(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Oe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Cn(u), Hi(e, !0), l();
	}, se = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, wi(e, t.props, r, n), Li(e, t.children, n), Ue(), En(e), We();
	}, ce = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				ue(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				le(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && he(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? ue(l, d, n, r, i, a, o, s, c) : he(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, le = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? ha(t[p]) : ma(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? he(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, ue = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? ha(t[u]) : ma(t[u]);
			if (sa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? ha(t[p]) : ma(t[p]);
			if (sa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? ha(t[u]) : ma(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) M(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? ha(t[u]) : ma(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					M(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && sa(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? M(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Gi(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Ji(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? de(n, r, p, 2) : _--);
			}
		}
	}, de = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) de(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, ve);
		else if (c === V) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) de(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === $i) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[ar] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Ri(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[ar];
					a._isLeaving && a[ar](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, M = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ue(), pr(s, null, n, e, !0), We()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !hr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && va(_, t, e), u & 6) me(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && In(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ve, r) : l && !l.hasOnce && (a !== V || d > 0 && d & 64) ? he(l, t, n, !1, !0) : (a === V && d & 384 || !i && u & 16) && he(c, t, n), r && fe(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Ri(() => {
			_ && va(_, t, e), h && In(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, fe = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === V;
		if (a && !i) {
			pe(n, r);
			return;
		}
		if (t === $i) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? lr(e) : e, c = () => {
			a ? m(n) && pe(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, pe = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, me = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		qi(c), qi(l), r && ne(r), i.stop(), a ? (a.flags |= 8, M(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, M(o, e, t, n)), s && Ri(s, t), Ri(() => {
			e.isUnmounted = !0;
		}, t);
	}, he = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) M(e[o], t, n, r, i);
	}, ge = (e) => {
		if (e.shapeFlag & 6) return ge(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Kn];
		return n ? h(n) : t;
	}, _e = (e, t, n) => {
		kn(() => {
			e == null ? t._vnode && M(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : xa());
	}, ve = {
		p: v,
		um: M,
		m: de,
		r: fe,
		mt: re,
		mc: O,
		pc: ce,
		pbc: k,
		n: ge,
		o: e
	}, ye, be;
	return i && ([ye, be] = i(ve)), {
		render: _e,
		hydrate: ye,
		createApp: ii(_e, ye)
	};
}
function Vi({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Hi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ui(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Wi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = ha(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Wi(t, a)), a.type === Zi && (a.patchFlag === -1 && (a = i[e] = ha(a)), a.el = t.el), a.type === Qi && !a.el && (a.el = t.el);
	}
}
function Gi(e) {
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
function Ki(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Ki(t);
}
function qi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Ji(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Ji(t.subTree) : null;
}
var Yi = (e) => e.__isSuspense;
function Xi(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Tn(e);
}
var V = /* @__PURE__ */ Symbol.for("v-fgt"), Zi = /* @__PURE__ */ Symbol.for("v-txt"), Qi = /* @__PURE__ */ Symbol.for("v-cmt"), $i = /* @__PURE__ */ Symbol.for("v-stc"), ea = [], ta = null;
function H(e = !1) {
	ea.push(ta = e ? null : []);
}
function na() {
	ea.pop(), ta = ea[ea.length - 1] || null;
}
var ra = 1;
function ia(e, t = !1) {
	ra += e, e < 0 && ta && t && (ta.hasOnce = !0);
}
function aa(e) {
	return e.dynamicChildren = ra > 0 ? ta || n : null, na(), ra > 0 && ta && ta.push(e), e;
}
function U(e, t, n, r, i, a) {
	return aa(G(e, t, n, r, i, a, !0));
}
function W(e, t, n, r, i) {
	return aa(K(e, t, n, r, i, !0));
}
function oa(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function sa(e, t) {
	return e.type === t.type && e.key === t.key;
}
var ca = ({ key: e }) => e ?? null, la = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ qt(e) || h(e) ? {
	i: Mn,
	r: e,
	k: t,
	f: !!n
} : e);
function G(e, t = null, n = null, r = 0, i = null, a = e === V ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && ca(t),
		ref: t && la(t),
		scopeId: Nn,
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
		ctx: Mn
	};
	return s ? (ga(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), ra > 0 && !o && ta && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && ta.push(c), c;
}
var K = ua;
function ua(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Nr) && (e = Qi), oa(e)) {
		let r = fa(e, t, !0);
		return n && ga(r, n), ra > 0 && !a && ta && (r.shapeFlag & 6 ? ta[ta.indexOf(e)] = r : ta.push(r)), r.patchFlag = -2, r;
	}
	if (Ra(e) && (e = e.__vccOpts), t) {
		t = da(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = M(e)), v(n) && (/* @__PURE__ */ Ut(n) && !d(n) && (n = s({}, n)), t.style = se(n));
	}
	let o = g(e) ? 1 : Yi(e) ? 128 : qn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return G(e, t, n, r, i, o, a, !0);
}
function da(e) {
	return e ? /* @__PURE__ */ Ut(e) || Si(e) ? s({}, e) : e : null;
}
function fa(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? _a(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && ca(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(la(t)) : [a, la(t)] : la(t) : a,
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
		ssContent: e.ssContent && fa(e.ssContent),
		ssFallback: e.ssFallback && fa(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && cr(u, c.clone(u)), u;
}
function q(e = " ", t = 0) {
	return K(Zi, null, e, t);
}
function pa(e, t) {
	let n = K($i, null, e);
	return n.staticCount = t, n;
}
function J(e = "", t = !1) {
	return t ? (H(), W(Qi, null, e)) : K(Qi, null, e);
}
function ma(e) {
	return e == null || typeof e == "boolean" ? K(Qi) : d(e) ? K(V, null, e.slice()) : oa(e) ? ha(e) : K(Zi, null, String(e));
}
function ha(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : fa(e);
}
function ga(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), ga(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Si(t) ? t._ctx = Mn : r === 3 && Mn && (Mn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ga(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: Mn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [q(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function _a(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = M([t.class, r.class]));
		else if (e === "style") t.style = se([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function va(e, t, n, r = null) {
	dn(e, t, 7, [n, r]);
}
var ya = ni(), ba = 0;
function xa() {
	return ba;
}
function Sa(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || ya, o = {
		uid: ba++,
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
		propsOptions: Oi(i, a),
		emitsOptions: ui(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ci.bind(null, o), e.ce && e.ce(o), o;
}
var Ca = null, wa = () => Ca || Mn, Ta, Ea;
{
	let e = oe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Ta = t("__VUE_INSTANCE_SETTERS__", (e) => Ca = e), Ea = t("__VUE_SSR_SETTERS__", (e) => Aa = e);
}
var Da = (e) => {
	let t = Ca;
	return Ta(e), e.scope.on(), () => {
		e.scope.off(), Ta(t);
	};
}, Oa = () => {
	Ca && Ca.scope.off(), Ta(null);
};
function ka(e) {
	return e.vnode.shapeFlag & 4;
}
var Aa = !1;
function ja(e, t = !1, n = !1) {
	t && Ea(t);
	let { props: r, children: i } = e.vnode, a = ka(e);
	Ci(e, r, a, t), Ii(e, i, n || t);
	let o = a ? Ma(e, t) : void 0;
	return t && Ea(!1), o;
}
function Ma(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Rr);
	let { setup: r } = n;
	if (r) {
		Ue();
		let n = e.setupContext = r.length > 1 ? Ia(e) : null, i = Da(e), a = un(r, e, 0, [e.props, n]), o = y(a);
		if (We(), i(), (o || e.sp) && !hr(e) && ur(e), o) {
			if (a.then(Oa, Oa), t) return a.then((n) => {
				Ea(!0);
				try {
					Na(e, n, t);
				} finally {
					Ea(!1);
				}
			}).catch((t) => {
				fn(t, e, 0);
			});
			e.asyncDep = a;
		} else Na(e, a, t);
	} else Pa(e, t);
}
function Na(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Qt(t)), Pa(e, n);
}
function Pa(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = Da(e);
		Ue();
		try {
			Hr(e);
		} finally {
			We(), t();
		}
	}
}
var Fa = { get(e, t) {
	return et(e, "get", ""), e[t];
} };
function Ia(e) {
	return {
		attrs: new Proxy(e.attrs, Fa),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function La(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Qt(Wt(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ir) return Ir[n](e);
		},
		has(e, t) {
			return t in e || t in Ir;
		}
	}) : e.proxy;
}
function Ra(e) {
	return h(e) && "__vccOpts" in e;
}
var Y = (e, t) => /* @__PURE__ */ nn(e, t, Aa), za = "3.5.44", Ba = void 0, Va = typeof window < "u" && window.trustedTypes;
if (Va) try {
	Ba = /* @__PURE__ */ Va.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ha = Ba ? (e) => Ba.createHTML(e) : (e) => e, Ua = "http://www.w3.org/2000/svg", Wa = "http://www.w3.org/1998/Math/MathML", Ga = typeof document < "u" ? document : null, Ka = Ga && /* @__PURE__ */ Ga.createElement("template"), qa = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ga.createElementNS(Ua, e) : t === "mathml" ? Ga.createElementNS(Wa, e) : n ? Ga.createElement(e, { is: n }) : Ga.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ga.createTextNode(e),
	createComment: (e) => Ga.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ga.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Ka.innerHTML = Ha(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Ka.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ja = /* @__PURE__ */ Symbol("_vtc");
function Ya(e, t, n) {
	let r = e[Ja];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Xa = /* @__PURE__ */ Symbol("_vod"), Za = /* @__PURE__ */ Symbol("_vsh"), Qa = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[Xa] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : $a(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), $a(e, !0), r.enter(e)) : r.leave(e, () => {
			$a(e, !1);
		}) : $a(e, t));
	},
	beforeUnmount(e, { value: t }) {
		$a(e, t);
	}
};
function $a(e, t) {
	e.style.display = t ? e[Xa] : "none", e[Za] = !t;
}
var eo = /* @__PURE__ */ Symbol(""), to = /(?:^|;)\s*display\s*:/;
function no(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? io(r, t, "");
			}
			else for (let e in t) n[e] ?? io(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? io(r, i, "") : co(e, i, !g(t) && t ? t[i] : void 0, o) || io(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[eo];
			e && (n += ";" + e), r.cssText = n, a = to.test(n);
		}
	} else t && e.removeAttribute("style");
	Xa in e && ((!i || t !== n) && (e[Xa] = a ? r.display : ""), e[Za] && (r.display = "none"));
}
var ro = /\s*!important$/;
function io(e, t, n) {
	if (d(n)) n.forEach((n) => io(e, t, n));
	else if (n ??= "", t.startsWith("--")) ro.test(n) ? e.setProperty(t, n.replace(ro, ""), "important") : e.setProperty(t, n);
	else {
		let r = so(e, t);
		ro.test(n) ? e.setProperty(k(r), n.replace(ro, ""), "important") : e[r] = n;
	}
}
var ao = [
	"Webkit",
	"Moz",
	"ms"
], oo = {};
function so(e, t) {
	let n = oo[t];
	if (n) return n;
	let r = O(t);
	if (r !== "filter" && r in e) return oo[t] = r;
	r = te(r);
	for (let n = 0; n < ao.length; n++) {
		let i = ao[n] + r;
		if (i in e) return oo[t] = i;
	}
	return t;
}
function co(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var lo = "http://www.w3.org/1999/xlink";
function uo(e, t, n, r, i, a = fe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(lo, t.slice(6, t.length)) : e.setAttributeNS(lo, t, n) : n == null || a && !pe(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function fo(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ha(n) : n);
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
		r === "boolean" ? n = pe(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function po(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function mo(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var ho = /* @__PURE__ */ Symbol("_vei");
function go(e, t, n, r, i = null) {
	let a = e[ho] || (e[ho] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = yo(t);
		r ? po(e, n, a[t] = Co(r, i), s) : o && (mo(e, n, o, s), a[t] = void 0);
	}
}
var _o = /(Once|Passive|Capture)$/, vo = /^on:?(?:Once|Passive|Capture)$/;
function yo(e) {
	let t, n;
	for (; (n = e.match(_o)) && !vo.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var bo = 0, xo = /* @__PURE__ */ Promise.resolve(), So = () => bo ||= (xo.then(() => bo = 0), Date.now());
function Co(e, t) {
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
				e && dn(e, t, 5, a);
			}
		} else dn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = So(), n;
}
var wo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, To = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Ya(e, r, c) : t === "style" ? no(e, n, r) : a(t) ? o(t) || go(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : Eo(e, t, r, c)) ? (fo(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && uo(e, t, r, c, s, t !== "value")) : e._isVueCE && (Do(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? fo(e, O(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), uo(e, t, r, c));
};
function Eo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && wo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return wo(t) && g(n) ? !1 : t in e;
}
function Do(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = O(t);
	return Array.isArray(n) ? n.some((e) => O(e) === r) : Object.keys(n).some((e) => O(e) === r);
}
var Oo = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => ne(t, e) : t;
};
function ko(e) {
	e.target.composing = !0;
}
function Ao(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var jo = /* @__PURE__ */ Symbol("_assign"), Mo = /* @__PURE__ */ Symbol("_initialValue");
function No(e, t, n) {
	return t && (e = e.trim()), n && (e = ie(e)), e;
}
var Po = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Mo] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Mo] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[jo] = Oo(i);
		let a = r || i.props && i.props.type === "number";
		po(e, t ? "change" : "input", (t) => {
			t.target.composing || e[jo](No(e.value, n, a));
		}), (n || a) && po(e, "change", () => {
			e.value = No(e.value, n, a);
		}), t || (po(e, "compositionstart", ko), po(e, "compositionend", Ao), po(e, "change", Ao));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Mo];
		delete e[Mo], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[jo](No(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[jo] = Oo(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ie(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Fo = {
	deep: !0,
	created(e, t, n) {
		e[jo] = Oo(n), po(e, "change", () => {
			let t = e._modelValue, n = Bo(e), r = e.checked, i = e[jo];
			if (d(t)) {
				let e = ye(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Vo(e, r));
		});
	},
	mounted: Io,
	beforeUpdate(e, t, n) {
		e[jo] = Oo(n), Io(e, t, n);
	}
};
function Io(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = ye(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ve(t, Vo(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Lo = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, po(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ie(Bo(e)) : Bo(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[jo](i);
			} finally {
				xn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[jo] = Oo(r);
	},
	mounted(e, { value: t }) {
		zo(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[jo] = Oo(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !Ro(t, n[1], n[0])) && zo(e, t);
	}
};
function Ro(e, t, n) {
	if (!n || d(e)) return ve(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function zo(e, t) {
	let n = e.multiple, r = d(t);
	if (!n || r || p(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = Bo(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : ye(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (ve(Bo(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function Bo(e) {
	return "_value" in e ? e._value : e.value;
}
function Vo(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Ho = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Uo = {
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
	exact: (e, t) => Ho.some((n) => e[`${n}Key`] && !t.includes(n))
}, Wo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Uo[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Go = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Ko = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = k(n.key);
		if (t.some((e) => e === r || Go[e] === r)) return e(n);
	}));
}, qo = /* @__PURE__ */ s({ patchProp: To }, qa), Jo;
function Yo() {
	return Jo ||= zi(qo);
}
var Xo = ((...e) => {
	let t = Yo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Qo(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Zo(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Zo(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Qo(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/studio/routes.ts
var $o = [
	{
		id: "wakewords",
		name: "Wakewords",
		group: "Workspace"
	},
	{
		id: "kiosks",
		name: "Kiosks",
		group: "Fleet"
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
	},
	{
		id: "automate",
		name: "Automate",
		group: "Models"
	}
], es = "studio.selectedWordId";
function ts() {
	try {
		return localStorage.getItem(es) ?? "";
	} catch {
		return "";
	}
}
function ns() {
	let e = /* @__PURE__ */ I("wakewords"), t = /* @__PURE__ */ I(""), n = /* @__PURE__ */ I("review");
	function r() {
		let [r, i = ""] = location.hash.replace(/^#\/?/, "").split("?");
		e.value = r === "scrape" ? "classify" : $o.find((e) => e.id === r)?.id ?? "wakewords", t.value = new URLSearchParams(i).get("word") ?? ts();
		let a = r === "scrape" ? "collect" : new URLSearchParams(i).get("tab");
		n.value = a === "collect" || a === "unmapped" ? a : "review";
	}
	r();
	function i(e) {
		let r = new URLSearchParams();
		return t.value && r.set("word", t.value), e === "classify" && n.value !== "review" && r.set("tab", n.value), `#/${e}${r.size ? "?" + r : ""}`;
	}
	function a() {
		try {
			t.value ? localStorage.setItem(es, t.value) : localStorage.removeItem(es);
		} catch {}
		history.replaceState(null, "", i(e.value));
	}
	let o = z(t, a, { flush: "sync" });
	function s(t) {
		e.value = t, location.hash !== i(t) && history.pushState(null, "", i(t));
	}
	function c(e) {
		n.value = e, s("classify");
	}
	return window.addEventListener("hashchange", r), window.addEventListener("popstate", r), Ee(() => {
		o(), window.removeEventListener("hashchange", r), window.removeEventListener("popstate", r);
	}), {
		page: e,
		selectedId: t,
		classifyTab: n,
		selectClassifyTab: c,
		href: i,
		navigate: s
	};
}
//#endregion
//#region src/studio/api.ts
var rs = "/api/studio", is = encodeURIComponent;
function as(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var os = class extends Error {
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
async function ss(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${rs}${e}`, {
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
	if (!i.ok) throw new os(i.status);
	if (i.status !== 204) return i.json();
}
function cs(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function ls(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => cs(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var X = (e) => `/wakewords/${is(e)}`, us = (e, t) => `${X(e)}/samples/${is(t)}`, Z = (e, t, n) => ss(e + as(t), "GET", void 0, n), Q = (e, t, n) => ss(e, "POST", t, n), ds = (e, t, n) => ss(e, "PUT", t, n), $ = {
	capabilities: (e) => Z("/capabilities", void 0, e),
	migration: (e) => Z("/migration", void 0, e),
	importLegacy: (e, t) => Q("/migration/import", e, t),
	wakewords: (e, t) => Z("/wakewords", e, t),
	wakeword: (e, t) => Z(X(e), void 0, t),
	createWakeword: (e, t) => Q("/wakewords", e, t),
	updateWakeword: (e, t, n) => ss(X(e), "PATCH", t, n),
	deleteWakeword: (e, t) => ss(X(e), "DELETE", void 0, t),
	samples: (e, t, n) => Z(`${X(e)}/samples`, t, n),
	queue: (e, t, n) => Z(`${X(e)}/queue`, t, n),
	sample: (e, t, n) => Z(us(e, t), void 0, n),
	unmapped: (e, t) => Z("/recordings/unmapped", e, t),
	assign: (e, t, n) => Q(`/recordings/${is(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), Q(`${X(e)}/samples/import`, i, r);
	},
	label: (e, t, n, r, i) => Q(`${us(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => Q(`${us(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => Q(`${us(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => ss(`${us(e, t)}${as({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${rs}${us(e, t)}/audio${as({ original: n })}`,
	devices: (e) => Z("/devices", void 0, e),
	addDevice: (e, t, n, r) => Q("/devices", {
		url: e,
		password: t,
		role: n
	}, r),
	refreshDevices: (e, t) => Q(`/devices/${is(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => Q(`/devices/${is(e)}/credentials`, { password: t }, n),
	sourceMappings: (e, t) => Z(`/devices/${is(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => ds(`/devices/${is(e)}/source-mappings`, t, n),
	scrape: (e, t) => Q("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Z("/scrape/runs", e, t),
	schedules: (e) => Z("/schedules", void 0, e),
	automation: (e, t) => Z(`${X(e)}/automation`, void 0, t),
	saveAutomation: (e, t, n) => ds(`${X(e)}/automation`, t, n),
	collect: (e, t, n) => Q(`${X(e)}/collection/jobs`, { device_ids: t }, n),
	saveSchedule: (e, t, n) => ds(`/schedules/${is(e)}`, t, n),
	jobs: (e, t) => Z("/jobs", e, t),
	enqueueScrape: (e, t) => Q("/jobs", e, t),
	health: (e) => Z("/jobs/health", void 0, e),
	job: (e, t) => Z(`/jobs/${is(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Z(`/jobs/${is(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => Q(`/jobs/${is(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Z(`${X(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => ds(`${X(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => Q(`/datasets/${is(e)}/download`, void 0, t),
	generationCatalog: (e) => Z("/generation/catalog", void 0, e),
	generationDefaults: (e) => Z("/generation/defaults", void 0, e),
	generationRecipe: (e, t) => Z(`${X(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => ds(`${X(e)}/generation/recipe`, t, n),
	generate: (e, t, n) => Q(`${X(e)}/generation/jobs`, t, n),
	preview: (e, t, n) => Q(`${X(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${rs}${X(e)}/generation/previews/${is(t)}/audio`,
	batches: (e, t, n) => Z(`${X(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Z(`${X(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Z(`${X(e)}/generation/batches/${is(t)}`, void 0, n),
	selectBatches: (e, t, n) => ds(`${X(e)}/generation/batches`, { batch_ids: t }, n),
	trainingSettings: (e, t) => Z(`${X(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => ds(`${X(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Z(`${X(e)}/training/counts`, void 0, t),
	train: (e, t) => Q(`${X(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Z(`${X(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Z(`${X(e)}/training/runs/${is(t)}`, void 0, n),
	models: (e, t, n) => Z(`${X(e)}/models`, t, n),
	model: (e, t, n) => Z(`${X(e)}/models/${is(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${rs}${X(e)}/models/${is(t)}/archive${n === void 0 ? "" : `/${is(n)}`}`,
	deploymentCapabilities: (e) => Z("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Z(`${X(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Z(`${X(e)}/deployment/history`, t, n),
	publish: (e, t, n) => Q(`${X(e)}/deployment/publish`, { version_id: t }, n),
	rollback: (e, t, n) => Q(`${X(e)}/deployment/rollback`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function fs(e) {
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
			e instanceof os && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
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
		routes: e,
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
var ps = Symbol("studio-workspace");
function ms() {
	let e = Rn(ps);
	if (!e) throw Error("useWorkspace requires StudioShell");
	return e;
}
//#endregion
//#region src/studio/pages/WakewordsPage.vue?vue&type=script&setup=true&lang.ts
var hs = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, gs = ["disabled"], _s = {
	key: 0,
	class: "studio-card"
}, vs = { class: "grid gap-3 sm:grid-cols-2 mb-4" }, ys = ["aria-pressed", "onClick"], bs = { class: "flex justify-between items-center gap-3" }, xs = { class: "studio-muted text-xs ml-auto" }, Ss = {
	key: 1,
	role: "status"
}, Cs = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, ws = {
	key: 3,
	class: "studio-card mb-4"
}, Ts = { class: "flex items-start justify-between gap-3" }, Es = ["disabled"], Ds = ["disabled"], Os = { class: "grid gap-3 sm:grid-cols-3 text-sm" }, ks = { class: "text-xs" }, As = {
	key: 0,
	class: "text-xs"
}, js = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, Ms = {
	key: 5,
	role: "status",
	class: "studio-note"
}, Ns = { class: "grid gap-4" }, Ps = ["disabled"], Fs = ["disabled"], Is = ["disabled"], Ls = {
	key: 0,
	role: "alert",
	class: "studio-note"
}, Rs = { id: "delete-heading" }, zs = { class: "flex flex-wrap gap-3 mt-3" }, Bs = ["disabled"], Vs = ["disabled"], Hs = /* @__PURE__ */ B({
	__name: "WakewordsPage",
	setup(e) {
		let t = ms(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ It({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ It({
			phrase: "",
			language: ""
		}), f = /* @__PURE__ */ I(!1), p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(!1), g = /* @__PURE__ */ I(!1), _ = /* @__PURE__ */ I(), v = /* @__PURE__ */ I();
		async function y() {
			g.value = !0, await xn(), _.value?.focus();
		}
		function b() {
			g.value = !1, v.value?.focus();
		}
		let x;
		z(i, (e) => {
			d.phrase = e?.phrase ?? "", d.language = e?.language ?? "";
		}, { immediate: !0 }), z(r, () => {
			x?.abort(), f.value = !1, g.value = !1, h.value = !1, p.value = "", m.value = "";
		}), Ee(() => {
			x?.abort();
		});
		async function S() {
			if (!h.value || f.value || !r.value) return;
			let e = r.value, n = new AbortController();
			x = n, f.value = !0, p.value = "", m.value = "";
			try {
				if (await $.deleteWakeword(e, n.signal), n.signal.aborted) return;
				t.remove(e);
			} catch (e) {
				n.signal.aborted || (p.value = e instanceof os && e.status === 409 ? "Cancel queued or active jobs before deleting this workspace, then try again." : e instanceof Error ? e.message : "Unable to delete workspace.");
			} finally {
				x === n && (f.value = !1);
			}
		}
		async function C(e) {
			if (f.value) return;
			let i = r.value, a = new AbortController();
			x = a, f.value = !0, m.value = "", p.value = "";
			try {
				let o = e === "create" ? await $.createWakeword({ ...u }, a.signal) : await $.updateWakeword(i, { ...d }, a.signal);
				if (a.signal.aborted || r.value !== i) return;
				t.wakewords.value = e === "create" ? [...n.value, o] : n.value.map((e) => e.id === o.id ? o : e), e === "create" && (u.phrase = ""), t.select(o.id), await t.refreshSelected(), a.signal.aborted || (m.value = "Workspace saved.", e === "edit" && b());
			} catch (e) {
				a.signal.aborted || (p.value = e instanceof Error ? e.message : "Unable to save workspace.");
			} finally {
				x === a && (f.value = !1);
			}
		}
		return (e, x) => (H(), U("section", null, [
			G("div", hs, [x[12] ||= G("div", null, [G("h1", null, "Wakewords"), G("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), G("button", {
				"data-action": "refresh",
				disabled: L(c),
				onClick: x[0] ||= (e) => L(t).load()
			}, "Refresh workspaces", 8, gs)]),
			!L(c) && !L(l) && !L(n).length ? (H(), U("p", _s, "No wakewords yet. Create your first workspace below.")) : J("", !0),
			G("div", vs, [(H(!0), U(V, null, Pr(L(n), (e) => (H(), U("button", {
				key: e.id,
				class: M(["studio-card studio-word-card", { "studio-selected": e.id === L(r) }]),
				"aria-pressed": e.id === L(r),
				onClick: (n) => L(t).select(e.id)
			}, [G("span", bs, [G("strong", null, N(e.phrase), 1), G("span", xs, N(e.language), 1)])], 10, ys))), 128))]),
			L(o) ? (H(), U("p", Ss, "Loading selected workspace…")) : J("", !0),
			L(s) ? (H(), U("div", Cs, [q(N(L(s)) + " ", 1), G("button", { onClick: x[1] ||= (e) => L(t).refreshSelected() }, "Retry workspace")])) : J("", !0),
			L(a) && L(i) ? (H(), U("div", ws, [G("div", Ts, [G("h2", null, N(L(i).phrase) + " · Overview", 1), G("details", null, [
				x[13] ||= G("summary", null, "Actions", -1),
				G("button", {
					ref_key: "editTrigger",
					ref: v,
					"data-action": "edit-workspace",
					type: "button",
					disabled: f.value,
					onClick: y
				}, "Rename / change language", 8, Es),
				G("button", {
					"data-action": "delete-workspace",
					type: "button",
					disabled: f.value,
					onClick: x[2] ||= (e) => h.value = !0
				}, "Delete workspace", 8, Ds)
			])]), G("dl", Os, [
				G("div", null, [x[14] ||= G("dt", { class: "studio-muted" }, "Pending classification", -1), G("dd", null, N(L(a).pending) + " pending", 1)]),
				G("div", null, [
					x[15] ||= G("dt", { class: "studio-muted" }, "Archived models", -1),
					G("dd", null, N(L(a).modelCount) + " versions", 1),
					G("dd", ks, N(L(a).latestModel ? `Latest: ${L(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				G("div", null, [
					x[16] ||= G("dt", { class: "studio-muted" }, "Autotrain", -1),
					G("dd", null, N(L(a).schedule?.enabled ? `${L(a).schedule.cron} · ${L(a).schedule.timezone}` : "Not scheduled"), 1),
					L(a).schedule?.enabled ? (H(), U("dd", As, "Next: " + N(L(a).schedule.next_run_at), 1)) : J("", !0)
				])
			])])) : J("", !0),
			p.value ? (H(), U("p", js, N(p.value), 1)) : J("", !0),
			m.value ? (H(), U("p", Ms, N(m.value), 1)) : J("", !0),
			G("div", Ns, [G("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: x[5] ||= Wo((e) => C("create"), ["prevent"])
			}, [
				x[19] ||= G("h2", null, "New wakeword", -1),
				G("label", null, [x[17] ||= q("Display phrase", -1), R(G("input", {
					"onUpdate:modelValue": x[3] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[Po, u.phrase]])]),
				G("label", null, [x[18] ||= q("Language", -1), R(G("input", {
					"onUpdate:modelValue": x[4] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[Po, u.language]])]),
				G("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Create wakeword", 8, Ps)
			], 32)]),
			L(i) && g.value ? (H(), U("div", {
				key: 6,
				class: "studio-modal-backdrop",
				onKeydown: x[9] ||= Ko((e) => !f.value && b(), ["esc"])
			}, [G("form", {
				"data-form": "edit",
				class: "studio-card grid gap-3",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Edit wakeword",
				onSubmit: x[8] ||= Wo((e) => C("edit"), ["prevent"])
			}, [
				G("h2", null, "Edit " + N(L(i).phrase), 1),
				G("label", null, [x[20] ||= q("Display phrase", -1), R(G("input", {
					ref_key: "editInput",
					ref: _,
					"onUpdate:modelValue": x[6] ||= (e) => d.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[Po, d.phrase]])]),
				G("label", null, [x[21] ||= q("Language", -1), R(G("input", {
					"onUpdate:modelValue": x[7] ||= (e) => d.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[Po, d.language]])]),
				x[22] ||= G("p", { class: "studio-muted text-xs" }, "Changing the display phrase never renames deployed models or changes a kiosk’s enabled wakewords.", -1),
				G("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Save changes", 8, Fs),
				G("button", {
					type: "button",
					disabled: f.value,
					onClick: b
				}, "Cancel", 8, Is),
				p.value ? (H(), U("p", Ls, N(p.value), 1)) : J("", !0)
			], 32)], 32)) : J("", !0),
			h.value && L(i) ? (H(), U("section", {
				key: 7,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: x[11] ||= Ko((e) => !f.value && (h.value = !1), ["esc"])
			}, [
				G("h2", Rs, "Delete " + N(L(i).phrase) + " permanently?", 1),
				x[23] ||= G("p", { id: "delete-description" }, "This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.", -1),
				x[24] ||= G("p", { class: "studio-muted" }, "Deployed kiosk files and shared datasets are not deleted.", -1),
				G("div", zs, [G("button", {
					"data-action": "cancel-delete",
					type: "button",
					disabled: f.value,
					onClick: x[10] ||= (e) => h.value = !1
				}, "Cancel", 8, Bs), G("button", {
					"data-action": "confirm-delete",
					type: "button",
					disabled: f.value,
					onClick: S
				}, N(f.value ? "Deleting…" : "Permanently delete workspace"), 9, Vs)])
			], 32)) : J("", !0)
		]));
	}
}), Us = ["aria-busy"], Ws = ["data-ready"], Gs = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Ks = ["disabled", "aria-label"], qs = ["disabled"], Js = /* @__PURE__ */ B({
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
					h = w(i), l.value = !0, u.value = "Waveform preview ready. The orange line shows playback progress.", await xn(), !n.signal.aborted && t === m && f === r && C();
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
		}, { immediate: !0 }), Dr(() => {
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
			G("audio", {
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
			G("canvas", {
				ref_key: "canvas",
				ref: o,
				"data-waveform": "",
				"data-ready": l.value,
				role: "img",
				"aria-label": "Audio waveform with playback progress",
				width: "240",
				height: "44"
			}, null, 8, Ws),
			G("p", Gs, N(u.value), 1),
			G("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, N(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Ks),
			G("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: k
			}, "Replay", 8, qs)
		], 8, Us));
	}
}), Ys = {
	key: 0,
	class: "studio-pagination",
	"aria-live": "polite"
}, Xs = { class: "flex gap-2" }, Zs = ["disabled"], Qs = ["disabled"], $s = /* @__PURE__ */ B({
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
		return (t, n) => e.total > e.limit || e.offset > 0 ? (H(), U("div", Ys, [G("span", null, N(i()) + "–" + N(a()) + " of " + N(e.total), 1), G("div", Xs, [G("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, Zs), G("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, Qs)])])) : J("", !0);
	}
}), ec = { class: "studio-card" }, tc = { class: "flex justify-between gap-3" }, nc = ["disabled"], rc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, ic = {
	key: 1,
	role: "status"
}, ac = {
	key: 2,
	class: "grid gap-3"
}, oc = { class: "studio-muted text-xs" }, sc = { key: 0 }, cc = {
	key: 0,
	class: "studio-muted"
}, lc = /* @__PURE__ */ B({
	__name: "CollectionHistory",
	props: { refreshKey: {} },
	setup(e) {
		let t = e, n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(!1), a = /* @__PURE__ */ I(0), o = /* @__PURE__ */ I(0), s;
		async function c() {
			s?.abort();
			let e = new AbortController();
			s = e, i.value = !0, r.value = "";
			try {
				let t = await $.scrapeRuns({
					offset: o.value,
					limit: 25
				}, e.signal);
				if (e.signal.aborted) return;
				n.value = t.items, a.value = t.total;
			} catch (t) {
				e.signal.aborted || (r.value = t instanceof Error ? t.message : "Unable to load history.");
			} finally {
				s === e && (i.value = !1);
			}
		}
		return z([() => t.refreshKey, o], () => {
			c();
		}, { immediate: !0 }), Dr(() => s?.abort()), (e, t) => (H(), U("section", ec, [
			G("div", tc, [t[1] ||= G("h2", null, "Collection history · Fleet-wide", -1), G("button", {
				disabled: i.value,
				onClick: c
			}, "Refresh history", 8, nc)]),
			r.value ? (H(), U("p", rc, N(r.value), 1)) : J("", !0),
			i.value ? (H(), U("p", ic, "Loading collection history…")) : (H(), U("div", ac, [(H(!0), U(V, null, Pr(n.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history"
			}, [
				G("strong", null, N(e.id), 1),
				q(" · " + N(e.status) + " · " + N(e.started_at), 1),
				G("p", oc, "New " + N(e.new) + " · Unmapped " + N(e.unmapped) + " · Failed " + N(e.failed), 1),
				G("ul", null, [(H(!0), U(V, null, Pr(e.devices, (e) => (H(), U("li", { key: e.device_id }, [q(N(e.device_id) + " · " + N(e.status) + " · new " + N(e.new) + " · failed " + N(e.failed), 1), e.errors.length ? (H(), U("span", sc, " · " + N(e.errors.join(", ")), 1)) : J("", !0)]))), 128))])
			]))), 128)), n.value.length ? J("", !0) : (H(), U("p", cc, "No collection runs yet."))])),
			K($s, {
				total: a.value,
				offset: o.value,
				limit: 25,
				loading: i.value,
				onPage: t[0] ||= (e) => o.value = e
			}, null, 8, [
				"total",
				"offset",
				"loading"
			])
		]));
	}
}), uc = { class: "studio-card" }, dc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, fc = ["data-unmapped-id"], pc = { class: "studio-muted text-xs" }, mc = ["disabled", "onClick"], hc = ["onUpdate:modelValue"], gc = ["value"], _c = ["disabled", "onClick"], vc = {
	key: 1,
	class: "studio-muted"
}, yc = /* @__PURE__ */ B({
	__name: "SourceInbox",
	props: {
		recordings: {},
		busy: { type: Boolean }
	},
	emits: ["assign", "changed"],
	setup(e, { emit: t }) {
		let n = t, r = ms(), i = /* @__PURE__ */ I({}), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s;
		z(r.selectedId, () => {
			s?.abort(), a.value = "", o.value = "", i.value = {};
		});
		async function c(e) {
			let t = i.value[e.id];
			if (!t || a.value) return;
			let r = new AbortController();
			s = r, a.value = e.id, o.value = "";
			try {
				await $.setSourceMapping(e.device_id, {
					engine: e.engine,
					source_phrase: e.phrase,
					word_id: t
				}, r.signal), r.signal.aborted || n("changed");
			} catch (e) {
				r.signal.aborted || (o.value = e instanceof Error ? e.message : "Source mapping was not saved.");
			} finally {
				s === r && (a.value = "");
			}
		}
		return Dr(() => s?.abort()), (t, s) => (H(), U("section", uc, [
			s[2] ||= G("h2", null, "Unmapped recordings · Fleet-wide", -1),
			s[3] ||= G("p", { class: "studio-muted" }, "Unknown sources discovered during collection stay here, never assigned to the selected workspace automatically. Assign a recording now, or save an exact device + engine + source-phrase mapping for future collection.", -1),
			o.value ? (H(), U("p", dc, N(o.value), 1)) : J("", !0),
			(H(!0), U(V, null, Pr(e.recordings, (t) => (H(), U("article", {
				key: t.id,
				"data-unmapped-id": t.id,
				class: "studio-mapping-row"
			}, [G("div", null, [
				G("strong", null, N(t.phrase), 1),
				G("p", pc, N(t.device_id) + " · " + N(t.engine), 1),
				G("button", {
					"data-action": "assign",
					disabled: e.busy || !L(r).selectedId.value,
					onClick: (e) => n("assign", t)
				}, "Assign to this wakeword", 8, mc)
			]), G("div", null, [G("label", null, [s[1] ||= q("Source phrase → wakeword", -1), R(G("select", {
				"onUpdate:modelValue": (e) => i.value[t.id] = e,
				name: "mapping-word"
			}, [s[0] ||= G("option", { value: "" }, "Choose wakeword", -1), (H(!0), U(V, null, Pr(L(r).wakewords.value, (e) => (H(), U("option", {
				key: e.id,
				value: e.id
			}, N(e.phrase), 9, gc))), 128))], 8, hc), [[Lo, i.value[t.id]]])]), G("button", {
				class: "mt-2",
				"data-action": "save-mapping",
				disabled: !i.value[t.id] || !!a.value,
				onClick: (e) => c(t)
			}, "Save source mapping", 8, _c)])], 8, fc))), 128)),
			e.recordings.length ? J("", !0) : (H(), U("p", vc, "No unmapped recordings."))
		]));
	}
}), bc = ["data-job-id"], xc = { class: "flex flex-wrap items-center justify-between gap-3" }, Sc = {
	key: 0,
	class: "studio-muted text-xs"
}, Cc = {
	key: 0,
	class: "studio-log",
	"aria-label": "Job log tail"
}, wc = {
	key: 1,
	class: "studio-muted text-xs"
}, Tc = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Ec = /* @__PURE__ */ B({
	__name: "JobConsole",
	props: {
		jobId: {},
		intervalMs: { default: 2e3 },
		logLimit: { default: 8192 }
	},
	emits: ["update"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c, l, u = 0, d = Y(() => i.value !== null && [
			"complete",
			"failed",
			"cancelled",
			"interrupted"
		].includes(i.value.status)), f = Y(() => i.value !== null && [
			"queued",
			"running",
			"cancelling"
		].includes(i.value.status)), p = Y(() => a.value.length > n.logLimit ? `…${a.value.slice(-n.logLimit)}` : a.value);
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
		}, { immediate: !0 }), Dr(m), (t, n) => (H(), U("section", {
			class: "studio-card mt-3",
			"data-job-id": e.jobId,
			"aria-live": "polite"
		}, [
			G("div", xc, [G("div", null, [G("h3", null, "Job " + N(e.jobId), 1), s.value ? (H(), U("p", Sc, "Loading job state…")) : i.value ? (H(), U("span", {
				key: 1,
				class: M(["studio-status", `studio-status-${i.value.status}`])
			}, N(i.value.status), 3)) : J("", !0)]), f.value ? (H(), U("button", {
				key: 0,
				type: "button",
				"data-action": "cancel-job",
				onClick: _
			}, "Cancel job")) : J("", !0)]),
			p.value ? (H(), U("pre", Cc, N(p.value), 1)) : d.value ? (H(), U("p", wc, "No retained log output.")) : J("", !0),
			o.value ? (H(), U("p", Tc, N(o.value), 1)) : J("", !0)
		], 8, bc));
	}
}), Dc = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Oc = { class: "flex flex-wrap items-center gap-3" }, kc = {
	"data-progress": "",
	class: "studio-muted"
}, Ac = ["disabled"], jc = {
	class: "studio-tabs",
	role: "tablist",
	"aria-label": "Classification sections"
}, Mc = [
	"id",
	"aria-selected",
	"aria-controls",
	"onClick"
], Nc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Pc = {
	id: "classify-panel-review",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-review"
}, Fc = { class: "studio-card studio-toolbar mb-4" }, Ic = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Lc = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Rc = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, zc = ["data-sample-id"], Bc = { class: "flex flex-wrap justify-between gap-3" }, Vc = { class: "studio-muted text-sm" }, Hc = { class: "studio-muted" }, Uc = {
	key: 0,
	class: "studio-muted text-xs"
}, Wc = { class: "flex flex-wrap gap-2" }, Gc = ["disabled"], Kc = ["disabled"], qc = ["disabled"], Jc = ["disabled"], Yc = ["disabled"], Xc = {
	key: 4,
	class: "studio-card"
}, Zc = { key: 0 }, Qc = { key: 1 }, $c = {
	key: 2,
	id: "classify-panel-collect",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-collect"
}, el = { class: "studio-card mb-4" }, tl = ["href"], nl = {
	id: "classify-panel-unmapped",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-unmapped"
}, rl = {
	key: 3,
	class: "studio-modal-backdrop"
}, il = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, al = { class: "flex gap-2" }, ol = ["disabled"], sl = [], cl = /* @__PURE__ */ B({
	__name: "ClassifyPage",
	setup(e) {
		let t = ms(), { classifyTab: n } = t.routes, r = /* @__PURE__ */ I(null), i = /* @__PURE__ */ I(!1), a = /* @__PURE__ */ I(""), o;
		async function s() {
			if (!t.selectedId.value || i.value || r.value && [
				"queued",
				"running",
				"cancelling"
			].includes(r.value.status)) return;
			let e = t.selectedId.value, n = new AbortController();
			o = n, i.value = !0, a.value = "";
			try {
				let i = await $.collect(e, void 0, n.signal);
				!n.signal.aborted && t.selectedId.value === e && (r.value = i);
			} catch (e) {
				n.signal.aborted || (a.value = e instanceof Error ? e.message : "Collection was not started.");
			} finally {
				o === n && (i.value = !1);
			}
		}
		async function c(e) {
			let n = r.value;
			if (!n || e.id !== n.id || e.word_id !== t.selectedId.value || (r.value = e, e.status !== "complete" || n.status === "complete")) return;
			let i = t.selectedId.value, s = h.value, c = new AbortController();
			o?.abort(), o = c;
			try {
				let e = await $.queue(i, ae(), c.signal);
				if (c.signal.aborted || i !== t.selectedId.value || _.value || h.value !== s) return;
				let n = new Set(u.value.map((e) => e.id));
				u.value.push(...e.items.filter((e) => !n.has(e.id))), m.value = e.total;
			} catch (e) {
				c.signal.aborted || (a.value = e instanceof Error ? e.message : "Collection completed; refresh the queue to see new recordings.");
			}
		}
		let l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ I([]), d = /* @__PURE__ */ I([]), f = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), p = /* @__PURE__ */ I(0), m = /* @__PURE__ */ I(0), h = /* @__PURE__ */ I(0), g = /* @__PURE__ */ I(!1), _ = /* @__PURE__ */ I(!1), v = /* @__PURE__ */ I(""), y = /* @__PURE__ */ I(""), b = /* @__PURE__ */ I(!1), x = /* @__PURE__ */ I(!1), S = /* @__PURE__ */ I(null), C = /* @__PURE__ */ I(!1), w = /* @__PURE__ */ I(""), T = /* @__PURE__ */ I(), E, D, O, ee = 0, k = 0, te = Y(() => u.value.filter((e) => !f.value.has(e.id))), A = Y(() => te.value[p.value] ?? null), j = Y(() => A.value ? $.audioUrl(A.value.word_id, A.value.id) : null), ne = Y(() => h.value);
		function re() {
			T.value?.stop(), u.value = [], d.value = [], f.value = new Set(l.get(t.selectedId.value) ?? []), p.value = 0, m.value = 0, h.value = 0, x.value = !1, C.value = !1, v.value = "", y.value = "";
		}
		function ie() {
			ee += 1, O && (O.abort(), O = void 0, _.value = !1);
		}
		function ae() {
			return {
				limit: 100,
				...w.value ? { near_miss: w.value === "true" } : {}
			};
		}
		async function oe(e, n) {
			let r = 0;
			for (;;) {
				let i = await $.queue(e, {
					...ae(),
					offset: r
				}, n.signal);
				if (n.signal.aborted || t.selectedId.value !== e) return i;
				let a = i.items.filter((e) => !f.value.has(e.id));
				if (r += i.items.length, a.length || !i.items.length || r >= i.total) return {
					...i,
					items: a
				};
			}
		}
		async function se() {
			if (te.value.length || g.value) return;
			E?.abort();
			let e = new AbortController();
			E = e;
			let n = ++k, r = t.selectedId.value;
			if (r) {
				g.value = !0;
				try {
					let i = await oe(r, e);
					if (e.signal.aborted || n !== k || t.selectedId.value !== r) return;
					u.value = [...new Map(i.items.map((e) => [e.id, e])).values()], m.value = i.total, p.value = 0;
				} catch {
					!e.signal.aborted && n === k && (v.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === k && (g.value = !1);
				}
			}
		}
		async function ce() {
			ie(), E?.abort();
			let e = new AbortController();
			E = e;
			let n = ++k, r = t.selectedId.value;
			if (re(), r) {
				g.value = !0;
				try {
					let [i, a] = await Promise.all([oe(r, e), $.unmapped({ limit: 20 }, e.signal)]);
					if (e.signal.aborted || n !== k || t.selectedId.value !== r) return;
					u.value = i.items, m.value = i.total, d.value = a.items;
				} catch (t) {
					!e.signal.aborted && n === k && (v.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === k && (g.value = !1);
				}
			}
		}
		function le() {
			let e = A.value;
			e && (u.value = u.value.filter((t) => t.id !== e.id), m.value = Math.max(0, m.value - 1), p.value = Math.min(p.value, Math.max(0, te.value.length - 1)), T.value?.stop(), x.value = b.value, se());
		}
		async function ue(e) {
			try {
				let t = await $.sample(e.word_id, e.id);
				if (t.label !== "pending") {
					le();
					return;
				}
				u.value = u.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function de(e) {
			let t = A.value;
			if (!t || _.value || C.value) return;
			b.value = !0, _.value = !0, v.value = "";
			let n = new AbortController();
			D?.abort(), D = n;
			try {
				let r = await $.label(t.word_id, t.id, e, t.revision, n.signal);
				if (n.signal.aborted || A.value?.id !== t.id) return;
				sl.push({
					word: t.word_id,
					sample: r
				}), h.value += 1, y.value = `Saved ${e} label.`, le();
			} catch (e) {
				n.signal.aborted || (e instanceof Error && e.message.includes("conflict") ? (v.value = "This recording changed elsewhere. Review the latest version before saving.", await ue(t)) : v.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				D === n && (_.value = !1);
			}
		}
		function fe() {
			let e = A.value;
			!e || _.value || g.value || (b.value = !0, f.value = /* @__PURE__ */ new Set([...f.value, e.id]), l.set(e.word_id, f.value), p.value = Math.min(p.value, Math.max(0, te.value.length - 1)), T.value?.stop(), x.value = !1, y.value = "Skipped for this session; this recording remains pending.", se());
		}
		async function pe() {
			if (_.value || !sl.length) return;
			b.value = !0, _.value = !0, v.value = "";
			let e = sl[sl.length - 1], n = new AbortController();
			D?.abort(), D = n;
			try {
				let r = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (n.signal.aborted) return;
				sl.pop(), y.value = "Last label restored to pending.", t.selectedId.value === e.word && (u.value = [r, ...u.value.filter((e) => e.id !== r.id)], m.value += 1, h.value = Math.max(0, h.value - 1), p.value = 0, x.value = !1);
			} catch {
				n.signal.aborted || (v.value = "Undo was not saved. Refresh and try again.");
			} finally {
				D === n && (_.value = !1);
			}
		}
		async function me(e) {
			let n = t.selectedId.value;
			if (_.value || !n) return;
			let r = k, i = ++ee, a = new AbortController();
			O?.abort(), O = a, _.value = !0, v.value = "";
			try {
				let o = await $.assign(e.id, n, a.signal);
				if (a.signal.aborted || O !== a || i !== ee || r !== k || t.selectedId.value !== n) return;
				d.value = d.value.filter((t) => t.id !== e.id), u.value = [...u.value.filter((e) => e.id !== o.id), o], m.value += 1, y.value = "Recording assigned to this workspace and added to the pending queue.";
			} catch {
				!a.signal.aborted && O === a && i === ee && t.selectedId.value === n && (v.value = "Recording could not be assigned.");
			} finally {
				O === a && (O = void 0, _.value = !1);
			}
		}
		function he(e) {
			let t = e.target instanceof HTMLElement ? e.target : document.activeElement;
			return t instanceof HTMLElement && (t.isContentEditable || [
				"INPUT",
				"TEXTAREA",
				"SELECT",
				"BUTTON"
			].includes(t.tagName));
		}
		function ge(e) {
			if (n.value !== "review" || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || he(e)) return;
			let t = e.key.toLowerCase();
			C.value ? e.key === "Escape" && (e.preventDefault(), C.value = !1) : t === "d" ? (e.preventDefault(), A.value && !_.value && (C.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), b.value = !0, t === "p" ? de("positive") : t === "n" ? de("negative") : t === " " ? T.value?.toggle() : t === "r" ? T.value?.replay() : t === "s" ? fe() : pe());
		}
		return z(t.selectedId, () => {
			o?.abort(), r.value = null, i.value = !1, a.value = "", ce();
		}, { immediate: !0 }), z(w, () => {
			ce();
		}), z(() => A.value?.id, () => {
			S.value = null;
		}, { flush: "sync" }), wr(() => document.addEventListener("keydown", ge)), z(n, () => {
			T.value?.stop();
		}), Dr(() => {
			document.removeEventListener("keydown", ge), o?.abort(), E?.abort(), D?.abort(), ie(), T.value?.stop();
		}), (e, o) => (H(), U("section", null, [
			G("div", Dc, [o[10] ||= G("div", null, [G("h1", null, "Classify"), G("p", { class: "studio-muted" }, "Collect recordings, resolve source mappings, and review labels.")], -1), G("div", Oc, [G("span", kc, N(m.value) + " pending · " + N(ne.value) + " reviewed · " + N(f.value.size) + " skipped", 1), G("button", {
				"data-action": "collect-now",
				class: "studio-primary",
				disabled: !L(t).selectedId.value || i.value || !!(r.value && [
					"queued",
					"running",
					"cancelling"
				].includes(r.value.status)),
				onClick: s
			}, N(i.value ? "Starting…" : "Collect"), 9, Ac)])]),
			G("div", jc, [(H(), U(V, null, Pr([
				"review",
				"collect",
				"unmapped"
			], (e) => G("button", {
				id: `classify-tab-${e}`,
				key: e,
				role: "tab",
				"aria-selected": L(n) === e,
				"aria-controls": `classify-panel-${e}`,
				class: M({ active: L(n) === e }),
				onClick: (n) => L(t).routes.selectClassifyTab(e)
			}, N(e === "review" ? "Review" : e === "collect" ? "Collect" : "Unmapped"), 11, Mc)), 64))]),
			a.value ? (H(), U("p", Nc, N(a.value), 1)) : J("", !0),
			r.value ? (H(), W(Ec, {
				key: 1,
				"job-id": r.value.id,
				onUpdate: c
			}, null, 8, ["job-id"])) : J("", !0),
			R(G("div", Pc, [
				G("div", Fc, [G("label", null, [o[12] ||= q("Recording type", -1), R(G("select", {
					name: "kind",
					"onUpdate:modelValue": o[0] ||= (e) => w.value = e
				}, [...o[11] ||= [
					G("option", { value: "" }, "All pending", -1),
					G("option", { value: "true" }, "Near misses", -1),
					G("option", { value: "false" }, "Activations", -1)
				]], 512), [[Lo, w.value]])])]),
				y.value ? (H(), U("p", Ic, N(y.value), 1)) : J("", !0),
				v.value ? (H(), U("p", Lc, N(v.value), 1)) : J("", !0),
				g.value ? (H(), U("div", Rc, "Loading review queue…")) : A.value ? (H(), U("div", {
					key: 3,
					"data-classify-current": "",
					"data-sample-id": A.value.id,
					class: "studio-card grid gap-4"
				}, [
					G("div", Bc, [G("div", null, [G("h2", null, "Recording " + N(A.value.recording?.clip_id ?? A.value.id), 1), G("p", Vc, N(A.value.recording?.device_id ?? A.value.source) + " · " + N(A.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + N(A.value.recording?.timestamp ?? A.value.created_at), 1)]), G("span", Hc, "Revision " + N(A.value.revision), 1)]),
					K(Js, {
						ref_key: "player",
						ref: T,
						"sample-id": A.value.id,
						src: j.value,
						"autoplay-requested": x.value,
						onReady: o[1] ||= (e) => {
							x.value = !1, S.value = A.value.id;
						},
						onPlaybackError: o[2] ||= (e) => v.value = e
					}, null, 8, [
						"sample-id",
						"src",
						"autoplay-requested"
					]),
					S.value === A.value.id ? (H(), U("p", Uc, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : J("", !0),
					G("div", Wc, [
						G("button", {
							type: "button",
							class: "studio-primary",
							disabled: _.value,
							onClick: o[3] ||= (e) => de("positive")
						}, "Positive (P)", 8, Gc),
						G("button", {
							type: "button",
							disabled: _.value,
							onClick: o[4] ||= (e) => de("negative")
						}, "Negative (N)", 8, Kc),
						G("button", {
							type: "button",
							disabled: _.value,
							onClick: fe
						}, "Skip (S)", 8, qc),
						G("button", {
							type: "button",
							disabled: _.value,
							"data-action": "discard",
							onClick: o[5] ||= (e) => C.value = !0
						}, "Discard (D)", 8, Jc),
						G("button", {
							type: "button",
							disabled: _.value || !L(sl).length,
							onClick: pe
						}, "Undo (Z)", 8, Yc)
					]),
					o[13] ||= G("p", {
						"data-shortcuts": "",
						class: "studio-muted text-xs"
					}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
					o[14] ||= G("input", {
						name: "search",
						type: "search",
						"aria-label": "Queue search",
						placeholder: "Shortcuts pause while editing"
					}, null, -1)
				], 8, zc)) : (H(), U("div", Xc, [m.value === 0 ? (H(), U("span", Zc, "No pending recordings for this workspace.")) : (H(), U("span", Qc, "Pending recordings are skipped for this session or the local window needs reloading.")), m.value > 0 ? (H(), U("button", {
					key: 2,
					type: "button",
					onClick: se
				}, "Retry pending window")) : J("", !0)]))
			], 512), [[Qa, L(n) === "review"]]),
			L(n) === "collect" ? (H(), U("div", $c, [G("div", el, [
				o[15] ||= G("h2", null, "Collect recordings", -1),
				o[16] ||= G("p", { class: "studio-muted" }, "Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.", -1),
				G("a", {
					href: L(t).routes.href("automate"),
					onClick: o[6] ||= Wo((e) => L(t).routes.navigate("automate"), ["prevent"])
				}, "Collection settings →", 8, tl)
			]), K(lc, { "refresh-key": r.value?.status }, null, 8, ["refresh-key"])])) : J("", !0),
			R(G("div", nl, [K(yc, {
				recordings: d.value,
				busy: _.value,
				onAssign: me,
				onChanged: o[7] ||= (e) => y.value = "Source mapping saved for future collections."
			}, null, 8, ["recordings", "busy"])], 512), [[Qa, L(n) === "unmapped"]]),
			C.value ? (H(), U("div", rl, [G("section", il, [
				o[17] ||= G("h2", null, "Discard this recording?", -1),
				o[18] ||= G("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				G("div", al, [G("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: _.value,
					onClick: o[8] ||= (e) => {
						C.value = !1, de("discarded");
					}
				}, "Discard recording", 8, ol), G("button", {
					type: "button",
					onClick: o[9] ||= (e) => C.value = !1
				}, "Cancel")])
			])])) : J("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function ll(e, t = {}) {
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
function ul(e) {
	return ll(e);
}
//#endregion
//#region src/trainerStore.ts
var dl = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), fl = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), pl = /* @__PURE__ */ It({
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
	samples: fl(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: dl(),
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
function ml(e, t) {
	t ? pl.busy.add(e) : pl.busy.delete(e);
}
function hl(e, t = "success") {
	pl.toast = {
		message: String(e || ""),
		tone: t,
		serial: pl.toast.serial + 1
	};
}
async function gl(e = !1) {
	e || ml("samples", !0);
	try {
		let e = await ul("/api/samples");
		pl.samples = {
			...fl(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((pl.samples[e]?.length || 0) / 50) - 1);
			pl.samplePage[e] = Math.min(pl.samplePage[e], t);
		}
		return e;
	} finally {
		e || ml("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var _l = { class: "legacy-scope" }, vl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, yl = { class: "range-grid" }, bl = ["max"], xl = ["min"], Sl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Cl = { class: "modal-head" }, wl = {
	key: 0,
	class: "empty-state"
}, Tl = { class: "range-grid" }, El = ["max"], Dl = ["min", "max"], Ol = { class: "row space" }, kl = { class: "pill" }, Al = {
	key: 0,
	class: "pill success"
}, jl = { class: "row modal-actions" }, Ml = ["disabled"], Nl = /* @__PURE__ */ B({
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
		z(() => pl.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(pl.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await ll(`/api/samples/${encodeURIComponent(pl.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await xn(), v();
				} catch (e) {
					hl(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), z([d, f], () => v());
		function g() {
			pl.trimItem = null, l.value = null, p.value = [];
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
			let e = pl.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", pl.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await ll("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await gl(!0), hl(n.message || "Trimmed sample saved.");
				} catch (e) {
					hl(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			pl.trimItem && v();
		}
		return window.addEventListener("resize", S), Dr(() => window.removeEventListener("resize", S)), (t, n) => (H(), W(nr, { to: "body" }, [G("div", _l, [e.studioTarget ? (H(), U("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Wo(o, ["self"])
		}, [G("section", vl, [
			G("header", { class: "modal-head" }, [n[4] ||= G("div", null, [G("span", { class: "eyebrow" }, "Studio audio editor"), G("h2", null, "Trim sample")], -1), G("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= G("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			G("div", yl, [G("label", null, [n[5] ||= G("span", null, "Start seconds", -1), R(G("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, bl), [[
				Po,
				i.value,
				void 0,
				{ number: !0 }
			]])]), G("label", null, [n[6] ||= G("span", null, "End seconds", -1), R(G("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, xl), [[
				Po,
				a.value,
				void 0,
				{ number: !0 }
			]])])]),
			G("div", { class: "row modal-actions" }, [G("button", {
				type: "button",
				class: "button primary",
				onClick: s
			}, "Save trim"), G("button", {
				type: "button",
				onClick: o
			}, "Cancel")])
		])])) : L(pl).trimItem ? (H(), U("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Wo(g, ["self"])
		}, [G("section", Sl, [
			G("header", Cl, [G("div", null, [n[8] ||= G("span", { class: "eyebrow" }, "Audio editor", -1), G("h2", null, "Trim " + N(L(pl).trimItem.saved_as), 1)]), G("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= G("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (H(), U("div", wl, "Loading waveform…")) : (H(), U(V, { key: 1 }, [
				G("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				G("div", Tl, [G("label", null, [G("span", null, "Start · " + N(d.value.toFixed(2)) + "s", 1), R(G("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, El), [[
					Po,
					d.value,
					void 0,
					{ number: !0 }
				]])]), G("label", null, [G("span", null, "End · " + N(f.value.toFixed(2)) + "s", 1), R(G("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Dl), [[
					Po,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				G("div", Ol, [G("span", kl, "Selection " + N(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (H(), U("span", Al, N(p.value.length) + " speech segment" + N(p.value.length === 1 ? "" : "s"), 1)) : J("", !0)]),
				G("div", jl, [
					G("button", {
						type: "button",
						onClick: y
					}, "Play selection"),
					p.value.length ? (H(), U("button", {
						key: 0,
						type: "button",
						onClick: _
					}, "Select first VAD")) : J("", !0),
					G("button", {
						type: "button",
						class: "button primary",
						disabled: h.value,
						onClick: x
					}, N(h.value ? "Saving…" : "Save trim"), 9, Ml)
				])
			], 64))
		])])) : J("", !0)])]));
	}
}), Pl = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Fl = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Il = { class: "studio-card mb-4" }, Ll = { class: "studio-toolbar" }, Rl = {
	"data-more-filters": "",
	class: "mt-3"
}, zl = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, Bl = ["aria-busy"], Vl = { key: 0 }, Hl = {
	key: 1,
	class: "w-full text-sm"
}, Ul = ["data-row-id"], Wl = {
	key: 0,
	class: "block studio-muted"
}, Gl = {
	key: 0,
	class: "block studio-muted"
}, Kl = { class: "flex flex-wrap gap-1" }, ql = ["onClick"], Jl = ["value", "onChange"], Yl = {
	key: 0,
	value: "pending",
	disabled: ""
}, Xl = ["onClick"], Zl = ["onClick"], Ql = { key: 0 }, $l = {
	key: 2,
	class: "studio-modal-backdrop"
}, eu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Play sample"
}, tu = {
	key: 3,
	class: "studio-modal-backdrop"
}, nu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, ru = /* @__PURE__ */ B({
	__name: "SamplesPage",
	setup(e) {
		let t = ms(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I(0), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(25), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: "",
			search: ""
		}), u = /* @__PURE__ */ I(null), d = /* @__PURE__ */ I(null), f = /* @__PURE__ */ I(null), p = /* @__PURE__ */ I(null), m = /* @__PURE__ */ I("positive"), h, g, _ = 0, v = Y(() => ({
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
				return t.signal.aborted || (e instanceof os && e.status === 409 ? (await b(), s.value = "This sample changed elsewhere. The current page was reloaded.") : s.value = "Sample changes were not saved. Try again."), null;
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
		}, { immediate: !0 }), Dr(() => {
			h?.abort(), g?.abort();
		}), (e, t) => (H(), U("section", null, [
			t[36] ||= G("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [G("div", null, [G("h1", null, "Samples"), G("p", { class: "studio-muted" }, "Searchable library with retained provenance and non-destructive trims.")])], -1),
			c.value ? (H(), U("p", Pl, N(c.value), 1)) : J("", !0),
			s.value ? (H(), U("p", Fl, N(s.value), 1)) : J("", !0),
			G("div", Il, [G("div", Ll, [G("label", null, [t[14] ||= q("Phrase", -1), R(G("input", {
				name: "search",
				"onUpdate:modelValue": t[0] ||= (e) => l.value.search = e,
				type: "search",
				onInput: D
			}, null, 544), [[Po, l.value.search]])]), G("label", null, [t[16] ||= q("Label", -1), R(G("select", {
				name: "label",
				"onUpdate:modelValue": t[1] ||= (e) => l.value.label = e,
				onChange: D
			}, [...t[15] ||= [pa("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Lo, l.value.label]])])]), G("details", Rl, [t[23] ||= G("summary", null, "More filters", -1), G("div", zl, [
				G("label", null, [t[18] ||= q("Source", -1), R(G("select", {
					name: "source",
					"onUpdate:modelValue": t[2] ||= (e) => l.value.source = e,
					onChange: D
				}, [...t[17] ||= [
					G("option", { value: "" }, "All sources", -1),
					G("option", { value: "diagnostic" }, "Diagnostic", -1),
					G("option", { value: "import" }, "Import", -1)
				]], 544), [[Lo, l.value.source]])]),
				G("label", null, [t[20] ||= q("Kind", -1), R(G("select", {
					name: "kind",
					"onUpdate:modelValue": t[3] ||= (e) => l.value.kind = e,
					onChange: D
				}, [...t[19] ||= [
					G("option", { value: "" }, "All kinds", -1),
					G("option", { value: "true" }, "Close miss", -1),
					G("option", { value: "false" }, "Activation", -1)
				]], 544), [[Lo, l.value.kind]])]),
				G("label", null, [t[21] ||= q("After", -1), R(G("input", {
					name: "after",
					"onUpdate:modelValue": t[4] ||= (e) => l.value.after = e,
					type: "date",
					onInput: D
				}, null, 544), [[Po, l.value.after]])]),
				G("label", null, [t[22] ||= q("Before", -1), R(G("input", {
					name: "before",
					"onUpdate:modelValue": t[5] ||= (e) => l.value.before = e,
					type: "date",
					onInput: D
				}, null, 544), [[Po, l.value.before]])])
			])])]),
			G("form", {
				"data-form": "import",
				class: "studio-card mb-4 flex flex-wrap gap-3 items-end",
				onSubmit: Wo(E, ["prevent"])
			}, [
				G("label", null, [t[24] ||= q("Audio", -1), G("input", {
					name: "import-file",
					type: "file",
					accept: "audio/*",
					required: "",
					onChange: t[6] ||= (e) => p.value = e.target.files?.[0] ?? null
				}, null, 32)]),
				G("label", null, [t[26] ||= q("Label", -1), R(G("select", {
					name: "import-label",
					"onUpdate:modelValue": t[7] ||= (e) => m.value = e
				}, [...t[25] ||= [G("option", { value: "positive" }, "Positive", -1), G("option", { value: "negative" }, "Negative", -1)]], 512), [[Lo, m.value]])]),
				t[27] ||= G("button", {
					type: "submit",
					class: "studio-primary"
				}, "Import audio", -1)
			], 32),
			G("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": o.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [o.value ? (H(), U("p", Vl, "Loading samples…")) : (H(), U("table", Hl, [t[33] ||= G("thead", null, [G("tr", null, [
				G("th", null, "Sample"),
				G("th", null, "Label"),
				G("th", null, "Provenance"),
				G("th", null, "Revision"),
				G("th", null, "Actions")
			])], -1), G("tbody", null, [(H(!0), U(V, null, Pr(n.value, (e) => (H(), U("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				G("td", null, [q(N(e.recording?.clip_id ?? e.id), 1), e.recording ? (H(), U("small", Wl, N(e.recording.phrase) + " · " + N(e.recording.engine) + " · " + N(O(e)), 1)) : J("", !0)]),
				G("td", null, N(e.label), 1),
				G("td", null, [q(N(e.source), 1), e.recording ? (H(), U("small", Gl, N(e.recording.device_id), 1)) : J("", !0)]),
				G("td", null, "rev " + N(e.revision), 1),
				G("td", null, [G("div", Kl, [
					G("button", {
						type: "button",
						"data-action": "play",
						onClick: (t) => f.value = e
					}, "Play", 8, ql),
					G("label", null, [t[31] ||= G("span", { class: "sr-only" }, "Relabel", -1), G("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => C(e, t)
					}, [
						e.label === "pending" ? (H(), U("option", Yl, "Set label…")) : J("", !0),
						t[28] ||= G("option", { value: "positive" }, "Positive", -1),
						t[29] ||= G("option", { value: "negative" }, "Negative", -1),
						t[30] ||= G("option", { value: "discarded" }, "Discarded", -1)
					], 40, Jl)]),
					G("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => u.value = e
					}, "Trim", 8, Xl),
					G("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => d.value = e
					}, "Delete", 8, Zl)
				])])
			], 8, Ul))), 128)), n.value.length ? J("", !0) : (H(), U("tr", Ql, [...t[32] ||= [G("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), K($s, {
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
			])], 8, Bl),
			f.value ? (H(), U("div", $l, [G("section", eu, [K(Js, {
				"sample-id": f.value.id,
				src: L($).audioUrl(f.value.word_id, f.value.id),
				"autoplay-requested": !0,
				onPlaybackError: t[9] ||= (e) => s.value = e
			}, null, 8, ["sample-id", "src"]), G("button", {
				type: "button",
				onClick: t[10] ||= (e) => f.value = null
			}, "Close player")])])) : J("", !0),
			K(Nl, {
				"studio-target": u.value ? {
					wordId: u.value.word_id,
					sampleId: u.value.id,
					revision: u.value.revision,
					src: L($).audioUrl(u.value.word_id, u.value.id)
				} : null,
				onSave: t[11] ||= (e) => w(e),
				onClose: t[12] ||= (e) => u.value = null
			}, null, 8, ["studio-target"]),
			d.value ? (H(), U("div", tu, [G("section", nu, [
				t[34] ||= G("h2", null, "Remove sample?", -1),
				t[35] ||= G("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				G("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: T
				}, "Remove"),
				G("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[13] ||= (e) => d.value = null
				}, "Cancel")
			])])) : J("", !0)
		]));
	}
}), iu = /* @__PURE__ */ I([]), au = /* @__PURE__ */ I(!1), ou = /* @__PURE__ */ I(""), su = !1, cu;
function lu(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function uu() {
	async function e(e = !1) {
		if (su && !e) return;
		cu?.abort();
		let t = new AbortController();
		cu = t, au.value = !0, ou.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && cu === t && (iu.value = e, su = !0);
		} catch (e) {
			!t.signal.aborted && cu === t && (ou.value = lu(e));
		} finally {
			cu === t && (au.value = !1);
		}
	}
	function t(e) {
		iu.value = iu.value.findIndex((t) => t.id === e.id) < 0 ? [...iu.value, e] : iu.value.map((t) => t.id === e.id ? e : t), su = !0;
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
		cu?.abort();
	}
	return {
		devices: /* @__PURE__ */ Rt(iu),
		loading: /* @__PURE__ */ Rt(au),
		error: /* @__PURE__ */ Rt(ou),
		load: e,
		add: n,
		refresh: r,
		credentials: i,
		abort: a
	};
}
//#endregion
//#region src/studio/components/DeviceRegistry.vue?vue&type=script&setup=true&lang.ts
var du = {
	class: "studio-card",
	"data-device-registry": ""
}, fu = { class: "flex flex-wrap items-start justify-between gap-3" }, pu = ["disabled"], mu = { class: "mt-3" }, hu = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, gu = {
	key: 0,
	class: "studio-note",
	role: "status"
}, _u = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, vu = ["open"], yu = ["disabled"], bu = {
	key: 2,
	class: "studio-muted mt-3"
}, xu = {
	key: 3,
	class: "mt-4 grid gap-2"
}, Su = ["data-device-id"], Cu = { class: "studio-muted text-xs" }, wu = { class: "flex flex-wrap gap-2 items-center" }, Tu = ["disabled", "onClick"], Eu = ["onSubmit"], Du = ["name"], Ou = ["disabled"], ku = {
	key: 0,
	class: "studio-muted"
}, Au = /* @__PURE__ */ B({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = uu(), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I("standalone"), s = /* @__PURE__ */ I(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I("");
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
		return wr(async () => {
			await i.load(), m();
		}), Dr(() => i.abort()), (e, t) => (H(), U("section", du, [
			G("div", fu, [t[3] ||= G("div", null, [G("h2", null, "Fleet setup"), G("p", { class: "studio-muted" }, "Register a fleet leader or standalone kiosks.")], -1), G("button", {
				type: "button",
				disabled: L(i).loading.value,
				onClick: t[0] ||= (e) => L(i).load(!0)
			}, "Refresh registry", 8, pu)]),
			G("details", mu, [
				t[4] ||= G("summary", null, "Fleet safety details", -1),
				t[5] ||= G("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (H(), U("p", hu, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : J("", !0)
			]),
			u.value ? (H(), U("p", gu, N(u.value), 1)) : J("", !0),
			d.value || L(i).error.value ? (H(), U("p", _u, N(d.value || L(i).error.value), 1)) : J("", !0),
			G("details", {
				"data-device-registration": "",
				class: "mt-3",
				open: !L(i).devices.value.length
			}, [
				t[10] ||= G("summary", null, "Add device", -1),
				G("form", {
					"data-device-add": "",
					class: "studio-registration-row",
					onSubmit: Wo(h, ["prevent"])
				}, [
					G("label", null, [t[6] ||= q("Address", -1), R(G("input", {
						"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
						required: "",
						name: "url",
						autocomplete: "url",
						placeholder: "http://kiosk.local:2324"
					}, null, 512), [[Po, a.value]])]),
					G("label", null, [t[8] ||= q("Role", -1), R(G("select", {
						"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
						name: "role"
					}, [...t[7] ||= [G("option", { value: "standalone" }, "Standalone", -1), G("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Lo, o.value]])]),
					G("label", null, [t[9] ||= q("Admin password", -1), G("input", {
						ref_key: "passwordInput",
						ref: s,
						required: "",
						name: "password",
						type: "password",
						autocomplete: "off"
					}, null, 512)]),
					G("button", {
						type: "submit",
						class: "studio-primary",
						disabled: l.value === "add"
					}, "Add device", 8, yu)
				], 32),
				t[11] ||= G("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
			], 8, vu),
			L(i).loading.value ? (H(), U("p", bu, "Loading registered devices…")) : (H(), U("div", xu, [(H(!0), U(V, null, Pr(L(i).devices.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [G("div", null, [
				G("strong", null, N(e.id), 1),
				t[12] ||= q(),
				G("span", { class: M(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, N(e.role === "follower" ? "Follower" : e.role), 3),
				G("p", Cu, N(p(e)) + " · " + N(e.active ? e.url : "Inactive member"), 1)
			]), G("div", wu, [
				G("span", { class: M(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, N(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
				G("span", { class: M(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, N(e.model_eligible ? "Profile covered" : "Not covered"), 3),
				e.role === "leader" ? (H(), U("button", {
					key: 0,
					type: "button",
					disabled: l.value === `refresh:${e.id}`,
					onClick: (t) => g(e)
				}, "Refresh followers", 8, Tu)) : J("", !0),
				e.role === "follower" && e.credentials_status !== "ready" ? (H(), U("form", {
					key: 1,
					class: "flex gap-2",
					onSubmit: Wo((t) => _(e), ["prevent"])
				}, [G("input", {
					ref_for: !0,
					ref: (t) => f(e.id, t),
					name: `credentials-${e.id}`,
					required: "",
					type: "password",
					autocomplete: "off",
					"aria-label": "Follower admin password"
				}, null, 8, Du), G("button", {
					type: "submit",
					disabled: l.value === `credentials:${e.id}`
				}, "Authenticate", 8, Ou)], 40, Eu)) : J("", !0)
			])], 8, Su))), 128)), L(i).devices.value.length ? J("", !0) : (H(), U("p", ku, "No kiosks registered yet."))]))
		]));
	}
}), ju = /* @__PURE__ */ B({
	__name: "KiosksPage",
	setup(e) {
		return (e, t) => (H(), U("section", null, [t[0] ||= G("div", { class: "mb-4" }, [G("h1", null, "Kiosks"), G("p", { class: "studio-muted" }, "Connect and manage your kiosk fleet.")], -1), K(Au, { surface: "kiosks" })]));
	}
}), Mu = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Nu = ["name"], Pu = ["name"], Fu = /* @__PURE__ */ B({
	__name: "AutomationScheduleFields",
	props: /*@__PURE__*/ Br({ prefix: {} }, {
		modelValue: { required: !0 },
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = oi(e, "modelValue");
		return (n, r) => (H(), U("div", Mu, [G("label", null, [r[2] ||= q("Schedule (five-field cron)", -1), R(G("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value.cron = e,
			name: `${e.prefix}-cron`,
			required: "",
			placeholder: "*/30 * * * *",
			maxlength: "256"
		}, null, 8, Nu), [[Po, t.value.cron]])]), G("label", null, [r[3] ||= q("Time zone", -1), R(G("input", {
			"onUpdate:modelValue": r[1] ||= (e) => t.value.timezone = e,
			name: `${e.prefix}-timezone`,
			required: "",
			placeholder: "UTC",
			maxlength: "100"
		}, null, 8, Pu), [[Po, t.value.timezone]])])]));
	}
}), Iu = {
	key: 0,
	class: "studio-card"
}, Lu = {
	key: 1,
	role: "status"
}, Ru = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, zu = {
	key: 3,
	class: "studio-note",
	role: "status"
}, Bu = { class: "studio-card" }, Vu = { class: "flex flex-wrap items-center justify-between gap-3" }, Hu = { class: "studio-checkbox-label" }, Uu = { class: "studio-muted" }, Wu = { class: "studio-muted text-xs mt-3" }, Gu = { class: "studio-card" }, Ku = { class: "flex flex-wrap items-center justify-between gap-3" }, qu = { class: "studio-checkbox-label" }, Ju = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Yu = { class: "mt-3" }, Xu = { class: "studio-checkbox-label my-3" }, Zu = { class: "studio-checkbox-label my-3" }, Qu = { class: "studio-muted text-xs mt-3" }, $u = { class: "grid gap-4 lg:grid-cols-2" }, ed = { class: "studio-card" }, td = { class: "flex flex-wrap items-center justify-between gap-3" }, nd = { class: "studio-checkbox-label" }, rd = { class: "studio-checkbox-label my-3" }, id = { class: "studio-muted text-xs" }, ad = { class: "studio-card" }, od = { class: "flex flex-wrap items-center justify-between gap-3" }, sd = { class: "studio-status studio-status-muted" }, cd = { class: "studio-checkbox-label my-3" }, ld = { class: "studio-checkbox-label my-3" }, ud = { class: "studio-muted text-xs" }, dd = ["disabled"], fd = /* @__PURE__ */ B({
	__name: "AutomatePage",
	setup(e) {
		let t = ms(), n = Y(() => t.selectedId.value), r = /* @__PURE__ */ I(null), i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l, u, d = 0, f = Y(() => r.value?.deployment.enabled ? r.value.deployment_policy.after_training ? "Scheduled + after training" : "Scheduled" : r.value?.deployment_policy.after_training ? "After training" : "Manual only");
		function p(e) {
			let t = i.value?.schedules.find((t) => t.scope === `${e}:${n.value}`), r = i.value?.last_jobs[e], a = r && "skipped" in r.result && r.result.skipped;
			return `${r ? `Last run: ${a ? "skipped" : r.status}${r.finished_at ? ` · ${new Date(r.finished_at).toLocaleString()}` : ""}` : "No runs yet"} · ${t?.enabled ? `Next: ${new Date(t.next_run_at).toLocaleString()}` : "Not scheduled"}`;
		}
		async function m() {
			l?.abort(), u?.abort();
			let e = new AbortController();
			l = e;
			let t = ++d, f = n.value;
			if (r.value = null, i.value = null, o.value = !1, s.value = "", c.value = "", a.value = !!f, f) try {
				let n = await $.automation(f, e.signal);
				if (d !== t || e.signal.aborted) return;
				i.value = n, r.value = structuredClone(n.settings);
			} catch (n) {
				d === t && !e.signal.aborted && (s.value = n instanceof Error ? n.message : "Unable to load automation.");
			} finally {
				d === t && (a.value = !1);
			}
		}
		async function h() {
			if (!r.value || !n.value || o.value || a.value) return;
			u?.abort();
			let e = new AbortController();
			u = e;
			let l = n.value, f = d, p = JSON.parse(JSON.stringify(r.value));
			o.value = !0, s.value = "", c.value = "";
			try {
				let n = await $.saveAutomation(l, p, e.signal);
				if (d !== f || e.signal.aborted) return;
				i.value = n, r.value = structuredClone(n.settings), c.value = "Automation settings saved.", await t.refreshSelected();
			} catch (t) {
				d === f && !e.signal.aborted && (s.value = t instanceof Error ? t.message : "Settings were not saved.");
			} finally {
				d === f && (o.value = !1);
			}
		}
		return z(n, () => {
			m();
		}, { immediate: !0 }), Dr(() => {
			d++, l?.abort(), u?.abort();
		}), (e, i) => (H(), U("section", null, [
			i[40] ||= G("div", { class: "mb-4" }, [G("h1", null, "Automate"), G("p", { class: "studio-muted" }, "Collection, classification, training, and deployment for the selected workspace.")], -1),
			n.value ? J("", !0) : (H(), U("p", Iu, "Choose a wakeword to configure automation.")),
			a.value ? (H(), U("p", Lu, "Loading automation…")) : J("", !0),
			s.value ? (H(), U("p", Ru, [q(N(s.value) + " ", 1), r.value ? J("", !0) : (H(), U("button", {
				key: 0,
				onClick: m
			}, "Retry"))])) : J("", !0),
			c.value ? (H(), U("p", zu, N(c.value), 1)) : J("", !0),
			r.value ? (H(), U("form", {
				key: 4,
				class: "grid gap-4",
				onSubmit: Wo(h, ["prevent"])
			}, [
				G("section", Bu, [
					G("div", Vu, [i[15] ||= G("h2", null, "Automatic collection", -1), G("label", Hu, [R(G("input", {
						"onUpdate:modelValue": i[0] ||= (e) => r.value.collection.enabled = e,
						name: "collection-enabled",
						type: "checkbox"
					}, null, 512), [[Fo, r.value.collection.enabled]]), i[14] ||= q("Enabled", -1)])]),
					G("p", Uu, [
						i[16] ||= q("Collect recordings mapped to ", -1),
						G("strong", null, N(L(t).selected.value?.phrase ?? "this workspace"), 1),
						i[17] ||= q(" from registered kiosks. Existing recordings are preserved when disabled.", -1)
					]),
					K(Fu, {
						modelValue: r.value.collection,
						"onUpdate:modelValue": i[1] ||= (e) => r.value.collection = e,
						prefix: "collection"
					}, null, 8, ["modelValue"]),
					G("p", Wu, N(p("scrape")), 1)
				]),
				G("section", Gu, [
					G("div", Ku, [i[19] ||= G("h2", null, "Automatic classification", -1), G("label", qu, [R(G("input", {
						"onUpdate:modelValue": i[2] ||= (e) => r.value.classification.enabled = e,
						name: "classification-enabled",
						type: "checkbox"
					}, null, 512), [[Fo, r.value.classification.enabled]]), i[18] ||= q("Enabled", -1)])]),
					i[28] ||= G("p", { class: "studio-muted" }, "Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.", -1),
					G("div", Ju, [G("label", null, [i[21] ||= q("Speech recognition engine", -1), R(G("select", {
						"onUpdate:modelValue": i[3] ||= (e) => r.value.classification.engine = e,
						name: "stt-engine"
					}, [...i[20] ||= [G("option", { value: "faster_whisper" }, "Faster Whisper · recommended", -1), G("option", { value: "parakeet_onnx" }, "Parakeet ONNX", -1)]], 512), [[Lo, r.value.classification.engine]])]), G("label", null, [i[23] ||= q("Run", -1), R(G("select", {
						"onUpdate:modelValue": i[4] ||= (e) => r.value.classification.trigger = e,
						name: "classification-trigger"
					}, [...i[22] ||= [G("option", { value: "after_collection" }, "After collection", -1), G("option", { value: "schedule" }, "On a schedule", -1)]], 512), [[Lo, r.value.classification.trigger]])])]),
					r.value.classification.trigger === "schedule" ? (H(), W(Fu, {
						key: 0,
						modelValue: r.value.classification_schedule,
						"onUpdate:modelValue": i[5] ||= (e) => r.value.classification_schedule = e,
						prefix: "classification"
					}, null, 8, ["modelValue"])) : J("", !0),
					G("details", Yu, [
						i[26] ||= G("summary", null, "Classification rules", -1),
						G("label", Xu, [R(G("input", {
							"onUpdate:modelValue": i[6] ||= (e) => r.value.classification.auto_negatives = e,
							type: "checkbox"
						}, null, 512), [[Fo, r.value.classification.auto_negatives]]), i[24] ||= q("Label clear non-wake activations as negatives", -1)]),
						G("label", Zu, [R(G("input", {
							"onUpdate:modelValue": i[7] ||= (e) => r.value.classification.promote_close_misses = e,
							type: "checkbox"
						}, null, 512), [[Fo, r.value.classification.promote_close_misses]]), i[25] ||= q("Promote confirmed close misses to positives", -1)]),
						i[27] ||= G("p", { class: "studio-muted text-xs" }, "Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is automatically deleted.", -1)
					]),
					G("p", Qu, N(p("classify")), 1)
				]),
				G("div", $u, [G("section", ed, [
					G("div", td, [i[30] ||= G("h2", null, "Automatic training", -1), G("label", nd, [R(G("input", {
						"onUpdate:modelValue": i[8] ||= (e) => r.value.training.enabled = e,
						name: "training-enabled",
						type: "checkbox"
					}, null, 512), [[Fo, r.value.training.enabled]]), i[29] ||= q("Enabled", -1)])]),
					i[32] ||= G("p", { class: "studio-muted" }, "Create an archived model from reviewed and selected inputs.", -1),
					K(Fu, {
						modelValue: r.value.training,
						"onUpdate:modelValue": i[9] ||= (e) => r.value.training = e,
						prefix: "training"
					}, null, 8, ["modelValue"]),
					G("label", rd, [R(G("input", {
						"onUpdate:modelValue": i[10] ||= (e) => r.value.skip_unchanged = e,
						type: "checkbox"
					}, null, 512), [[Fo, r.value.skip_unchanged]]), i[31] ||= q("Skip when inputs are unchanged", -1)]),
					i[33] ||= G("p", { class: "studio-note text-xs" }, "Training and deployment are separate. Training alone does not publish a model.", -1),
					G("p", id, N(p("train")), 1)
				]), G("section", ad, [
					G("div", od, [i[34] ||= G("h2", null, "Automatic deployment", -1), G("span", sd, N(f.value), 1)]),
					i[37] ||= G("p", { class: "studio-muted" }, "Publish eligible archives to your registered fleet targets.", -1),
					G("label", cd, [R(G("input", {
						"onUpdate:modelValue": i[11] ||= (e) => r.value.deployment_policy.after_training = e,
						name: "after-training",
						type: "checkbox"
					}, null, 512), [[Fo, r.value.deployment_policy.after_training]]), i[35] ||= q("Deploy after successful training", -1)]),
					i[38] ||= G("p", { class: "studio-muted text-xs" }, "Optional. Failed, cancelled, or skipped runs do not trigger deployment.", -1),
					G("label", ld, [R(G("input", {
						"onUpdate:modelValue": i[12] ||= (e) => r.value.deployment.enabled = e,
						name: "deployment-enabled",
						type: "checkbox"
					}, null, 512), [[Fo, r.value.deployment.enabled]]), i[36] ||= q("Enable scheduled deployment", -1)]),
					r.value.deployment.enabled ? (H(), W(Fu, {
						key: 0,
						modelValue: r.value.deployment,
						"onUpdate:modelValue": i[13] ||= (e) => r.value.deployment = e,
						prefix: "deployment"
					}, null, 8, ["modelValue"])) : J("", !0),
					i[39] ||= G("p", { class: "studio-muted text-xs mt-3" }, "Publish the latest new eligible archive; skip if there is nothing new. Manual rollbacks are retained until a new archive is available.", -1),
					G("p", ud, N(p("deploy")), 1)
				])]),
				G("button", {
					type: "submit",
					class: "studio-primary",
					disabled: o.value || a.value
				}, N(o.value ? "Saving…" : "Save automation settings"), 9, dd)
			], 32)) : J("", !0)
		]));
	}
}), pd = {
	key: 0,
	class: "studio-note",
	role: "status"
}, md = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, hd = {
	key: 2,
	class: "studio-card studio-safety mb-4",
	"data-staging-notice": ""
}, gd = {
	class: "studio-note",
	"data-quarantine-notice": "",
	role: "alert"
}, _d = { class: "studio-muted" }, vd = { class: "mb-4" }, yd = ["href"], bd = ["href"], xd = { class: "studio-card mb-4" }, Sd = {
	key: 0,
	class: "studio-muted"
}, Cd = {
	key: 1,
	class: "grid gap-3"
}, wd = ["data-version-id"], Td = { class: "flex flex-wrap justify-between gap-3" }, Ed = { class: "min-w-0 flex-1" }, Dd = { class: "studio-muted text-xs" }, Od = {
	key: 0,
	class: "studio-note text-xs"
}, kd = { class: "flex flex-wrap items-center gap-2" }, Ad = ["href"], jd = ["disabled", "onClick"], Md = [
	"data-action",
	"disabled",
	"onClick"
], Nd = {
	key: 0,
	class: "studio-muted text-xs"
}, Pd = {
	key: 2,
	class: "studio-muted"
}, Fd = { class: "studio-card" }, Id = ["data-device-status"], Ld = {
	key: 0,
	class: "studio-status studio-status-muted"
}, Rd = { class: "studio-muted text-xs" }, zd = { class: "text-xs" }, Bd = {
	key: 0,
	class: "studio-muted text-xs"
}, Vd = { key: 0 }, Hd = {
	key: 0,
	class: "studio-muted"
}, Ud = {
	key: 3,
	class: "studio-modal-backdrop"
}, Wd = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm rollback"
}, Gd = { class: "flex gap-2" }, Kd = ["disabled"], qd = /* @__PURE__ */ B({
	__name: "DeployPage",
	setup(e) {
		let t = ms(), n = uu(), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(null), u = /* @__PURE__ */ I(""), d, f, p = 0, m = 0, h = !1, g = Y(() => new Map(n.devices.value.map((e) => [e.id, e])));
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
			let c = new AbortController();
			d = c;
			let l = ++p;
			if (r.value = [], i.value = [], a.value = null, o.value = !!e, s.value = "", e) try {
				let [o, s, u] = await Promise.all([
					$.models(e, { limit: 50 }, c.signal),
					$.deploymentStatus(e, c.signal),
					$.deploymentCapabilities(c.signal),
					n.load()
				]);
				if (c.signal.aborted || l !== p || t.selectedId.value !== e) return;
				r.value = o.items, i.value = s, a.value = u;
			} catch (e) {
				!c.signal.aborted && l === p && (s.value = e instanceof Error ? e.message : "Deployment history could not be loaded.");
			} finally {
				!c.signal.aborted && l === p && (o.value = !1);
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
		}, { immediate: !0 }), Dr(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, n) => (H(), U("section", null, [
			n[14] ||= G("div", { class: "mb-4" }, [G("h1", null, "Deploy"), G("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (H(), U("p", pd, N(c.value), 1)) : J("", !0),
			s.value ? (H(), U("p", md, N(s.value), 1)) : J("", !0),
			a.value ? (H(), U("section", hd, [
				n[6] ||= G("h2", null, "Before publishing", -1),
				n[7] ||= G("p", null, [G("strong", null, "Clean, exclusive staging required."), q(" No concurrent manual uploads; staging cannot be checked automatically.")], -1),
				G("p", gd, [n[3] ||= G("strong", null, "Quarantine warning:", -1), q(" " + N(a.value.quarantine_notice), 1)]),
				G("details", null, [
					n[4] ||= G("summary", null, "Publication safety details", -1),
					G("p", null, N(a.value.notice), 1),
					n[5] ||= G("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
					G("p", _d, N(a.value.operator_action), 1)
				])
			])) : J("", !0),
			G("p", vd, [
				G("a", {
					href: L(t).routes.href("kiosks"),
					onClick: n[0] ||= Wo((e) => L(t).routes.navigate("kiosks"), ["prevent"])
				}, "Manage kiosks →", 8, yd),
				n[8] ||= q(" · ", -1),
				G("a", {
					href: L(t).routes.href("automate"),
					onClick: n[1] ||= Wo((e) => L(t).routes.navigate("automate"), ["prevent"])
				}, "Deployment automation →", 8, bd)
			]),
			G("section", xd, [n[9] ||= G("h2", null, "Archived model versions", -1), o.value ? (H(), U("p", Sd, "Loading archives…")) : r.value.length ? (H(), U("div", Cd, [(H(!0), U(V, null, Pr(r.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [G("div", Td, [G("div", Ed, [
				G("strong", null, N(e.id), 1),
				G("p", Dd, N(e.trained_at) + " · Run " + N(e.run_id), 1),
				e.origin === "legacy" ? (H(), U("p", Od, "Legacy import · " + N(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : J("", !0)
			]), G("div", kd, [
				G("a", { href: L($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, Ad),
				G("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, N(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, jd),
				G("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Md)
			])]), L(ls)(e.metrics).recall === null ? J("", !0) : (H(), U("p", Nd, "Recall " + N(L(ls)(e.metrics).recall), 1))], 8, wd))), 128))])) : (H(), U("p", Pd, "No archived model versions for this workspace."))]),
			G("section", Fd, [
				n[11] ||= G("h2", null, "Target delivery", -1),
				n[12] ||= G("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(H(!0), U(V, null, Pr(i.value, (e) => (H(), U("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [G("div", null, [
					G("strong", null, N(e.device_id), 1),
					n[10] ||= q(),
					g.value.get(e.device_id)?.role === "follower" ? (H(), U("span", Ld, "Follower")) : J("", !0),
					G("p", Rd, N(g.value.get(e.device_id)?.leader_id ? `Indirect via ${g.value.get(e.device_id)?.leader_id}` : "Direct leader/standalone target"), 1)
				]), G("div", null, [
					G("span", { class: M(["studio-status", v(e)]) }, N(e.state), 3),
					G("p", zd, "Desired " + N(e.desired_version) + " · Observed " + N(y(e)), 1),
					e.error_code ? (H(), U("p", Bd, [q("Retry/error: " + N(e.error_code), 1), e.next_retry ? (H(), U("span", Vd, " · next " + N(e.next_retry), 1)) : J("", !0)])) : J("", !0)
				])], 8, Id))), 128)),
				i.value.length ? J("", !0) : (H(), U("p", Hd, "No publication status yet."))
			]),
			l.value ? (H(), U("div", Ud, [G("section", Wd, [
				n[13] ||= G("h2", null, "Rollback archive?", -1),
				G("p", null, "Republish " + N(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				G("div", Gd, [G("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, Kd), G("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: n[2] ||= (e) => l.value = null
				}, "Cancel")])
			])])) : J("", !0)
		]));
	}
}), Jd = { class: "studio-card" }, Yd = { class: "studio-toolbar" }, Xd = ["disabled"], Zd = {
	key: 0,
	class: "studio-muted mt-3"
}, Qd = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, $d = {
	key: 2,
	class: "studio-table mt-3 grid gap-3"
}, ef = { class: "studio-dataset-row" }, tf = { class: "studio-checkbox-label" }, nf = [
	"data-dataset-id",
	"checked",
	"onChange"
], rf = { class: "studio-dataset-copy" }, af = { class: "studio-muted block text-xs" }, of = { class: "studio-muted block text-xs" }, sf = {
	key: 0,
	class: "studio-note block text-xs"
}, cf = { class: "studio-dataset-actions" }, lf = ["disabled", "onClick"], uf = {
	key: 3,
	class: "studio-muted mt-3"
}, df = /* @__PURE__ */ B({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = ms(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I(0), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I([]), p, m, h, g = 0, _ = 0, v = 0, y = Y(() => t.selectedId.value), b = Y(() => [...s.value].sort());
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
		}), Dr(() => {
			p?.abort(), m?.abort(), h?.abort();
		});
		function k(e) {
			return e === null ? "Size not published" : `${Math.ceil(e / 1024)} KiB`;
		}
		return (e, t) => (H(), U("section", null, [t[6] ||= G("div", { class: "mb-4" }, [G("h1", null, "Negative Datasets"), G("p", { class: "studio-muted" }, "Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.")], -1), G("div", Jd, [
			G("div", Yd, [
				G("label", null, [t[3] ||= q("Search", -1), R(G("input", {
					"onUpdate:modelValue": t[0] ||= (e) => a.value = e,
					name: "dataset-search",
					type: "search",
					placeholder: "Search catalog"
				}, null, 512), [[Po, a.value]])]),
				G("label", null, [t[5] ||= q("Installation state", -1), R(G("select", {
					"onUpdate:modelValue": t[1] ||= (e) => o.value = e,
					name: "dataset-status"
				}, [...t[4] ||= [pa("<option value=\"\">All states</option><option value=\"available\">Available</option><option value=\"installed\">Installed</option><option value=\"queued\">Queued</option><option value=\"running\">Running</option><option value=\"failed\">Failed</option><option value=\"selected\">Selected</option>", 7)]], 512), [[Lo, o.value]])]),
				G("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: l.value || !y.value,
					onClick: O
				}, N(l.value ? "Saving…" : "Save selection"), 9, Xd)
			]),
			c.value ? (H(), U("p", Zd, "Loading catalog…")) : J("", !0),
			d.value ? (H(), U("p", Qd, N(d.value), 1)) : J("", !0),
			n.value.length ? (H(), U("div", $d, [(H(!0), U(V, null, Pr(n.value, (e) => (H(), U("article", {
				key: e.id,
				class: "studio-history"
			}, [G("div", ef, [G("label", tf, [G("input", {
				"data-dataset-id": e.id,
				type: "checkbox",
				checked: s.value.has(e.id),
				onChange: (t) => D(e.id, t.target.checked)
			}, null, 40, nf), G("span", rf, [
				G("strong", null, N(e.name), 1),
				G("span", af, N(e.description) + " · " + N(e.source) + " · " + N(e.license), 1),
				G("span", of, N(e.representation) + " / " + N(e.adapter) + " · " + N(e.split) + " · " + N(k(e.installed_bytes ?? e.download_bytes)), 1),
				e.split === "evaluation" ? (H(), U("span", sf, "Evaluation-only: this dataset is not sampled as a training input.")) : J("", !0)
			])]), G("div", cf, [G("span", { class: M(["studio-status", `studio-status-${e.status}`]) }, N(e.status), 3), e.status === "available" || e.status === "failed" ? (H(), U("button", {
				key: 0,
				type: "button",
				disabled: u.value,
				onClick: (t) => ee(e)
			}, "Download", 8, lf)) : J("", !0)])]), e.job_id && [
				"queued",
				"running",
				"cancelling"
			].includes(e.status) ? (H(), W(Ec, {
				key: 0,
				"job-id": e.job_id
			}, null, 8, ["job-id"])) : J("", !0)]))), 128))])) : c.value ? J("", !0) : (H(), U("p", uf, "No catalog datasets match these filters.")),
			K($s, {
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
			(H(!0), U(V, null, Pr(f.value, (e) => (H(), W(Ec, {
				key: e.id,
				"job-id": e.id
			}, null, 8, ["job-id"]))), 128))
		])]));
	}
}), ff = { class: "studio-card" }, pf = {
	"data-generation-phrase": "",
	class: "studio-muted"
}, mf = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, hf = ["value"], gf = ["value"], _f = ["disabled"], vf = ["value"], yf = {
	key: 1,
	value: "mixed"
}, bf = { class: "grid gap-3 sm:grid-cols-2" }, xf = { class: "flex items-center justify-between gap-3" }, Sf = { class: "studio-checkbox-label" }, Cf = [
	"data-engine",
	"disabled",
	"checked",
	"onChange"
], wf = [
	"data-preview",
	"disabled",
	"onClick"
], Tf = {
	key: 0,
	class: "studio-muted text-xs mt-2"
}, Ef = {
	key: 1,
	role: "alert",
	class: "studio-note mt-3"
}, Df = [
	"data-preview-audio",
	"src",
	"aria-label"
], Of = ["disabled"], kf = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, Af = { class: "studio-card mt-4" }, jf = { class: "flex flex-wrap items-center justify-between gap-3" }, Mf = ["disabled"], Nf = {
	key: 0,
	class: "studio-muted mt-3"
}, Pf = { class: "studio-checkbox-label" }, Ff = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], If = { class: "studio-muted block text-xs" }, Lf = {
	key: 0,
	class: "studio-muted block text-xs"
}, Rf = { class: "studio-status ml-auto" }, zf = {
	key: 1,
	class: "studio-muted mt-3"
}, Bf = /* @__PURE__ */ B({
	__name: "ArtificialPage",
	setup(e) {
		let t = ms(), n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(0), o = /* @__PURE__ */ I({
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
		}, _, v, y = 0, b = 0, x = !1, S = Y(() => t.selectedId.value), C = Y(() => t.selected.value), w = Y(() => n.value.find((e) => e.language === o.value.language) ?? null), T = Y(() => w.value?.engines.hybrid ?? []), E = Y(() => w.value?.model_availability ?? T.value.map((e) => ({
			engine: e,
			supported: !0,
			available: !0,
			reason: null
		}))), D = Y(() => !!w.value?.accent_applies && o.value.engines?.some((e) => e !== "piper"));
		function O(e, t, n) {
			return S.value === e && y === t && !n.signal.aborted;
		}
		function ee(e, t, n) {
			return S.value === e && b === t && !n.signal.aborted;
		}
		function k() {
			let e = w.value;
			if (!e) return;
			let t = o.value.engines ?? e.engines[o.value.tts_mode];
			o.value.engines = t.filter((e) => T.value.includes(e)), D.value || (o.value.english_accent = "mixed");
		}
		function te() {
			v?.abort(), v = void 0, b += 1, l.value = !1, d.value = null;
			for (let e of h.values()) e.abort();
			h.clear(), f.value = {}, p.value = {}, m.value = {};
		}
		async function A() {
			_?.abort();
			let e = new AbortController();
			_ = e;
			let t = ++y, l = S.value;
			if (r.value = [], i.value = 0, u.value = "", l) {
				c.value = !0;
				try {
					let [c, u, d, f, p, m] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(l, e.signal).catch((e) => e instanceof os && e.status === 404 ? null : Promise.reject(e)),
						$.batches(l, {
							offset: a.value,
							limit: 50
						}, e.signal),
						x ? Promise.resolve(null) : $.batchSelection(l, e.signal),
						$.wakeword(l, e.signal),
						$.generationDefaults(e.signal)
					]);
					if (!O(l, t, e)) return;
					n.value = c, x ||= (o.value = u ?? {
						language: p.language,
						english_accent: "mixed",
						tts_mode: "hybrid",
						...m
					}, k(), s.value = new Set(f ?? []), !0), r.value = d.items, i.value = d.total;
				} catch (n) {
					O(l, t, e) && (u.value = n instanceof Error ? n.message : "Unable to load generation settings.");
				} finally {
					O(l, t, e) && (c.value = !1);
				}
			}
		}
		function j(e) {
			o.value.language = e, k();
		}
		function ne(e, t) {
			let n = new Set(o.value.engines);
			t ? n.add(e) : n.delete(e), o.value.engines = [...n];
		}
		function re() {
			return !Number.isInteger(o.value.samples) || o.value.samples < 1 || !Number.isInteger(o.value.batch_size) || o.value.batch_size < 1 ? (u.value = "Sample count and batch size must be positive integers.", !1) : o.value.engines?.length ? !0 : (u.value = "Select at least one generation model.", !1);
		}
		async function ie() {
			let e = S.value;
			if (!e || !re()) return;
			v?.abort();
			let t = new AbortController();
			v = t;
			let n = ++b, r = {
				...o.value,
				engines: [...o.value.engines],
				english_accent: D.value ? o.value.english_accent : "mixed",
				tts_mode: "hybrid"
			};
			l.value = !0, u.value = "";
			try {
				let i = await $.generate(e, r, t.signal);
				ee(e, n, t) && (o.value = r, d.value = i);
			} catch (r) {
				ee(e, n, t) && (u.value = r instanceof Error ? r.message : "Generation job was not started.");
			} finally {
				ee(e, n, t) && (l.value = !1);
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
			t?.id === e.id && (d.value = e, e.status === "complete" && t.status !== "complete" && (a.value = 0, A()));
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
				await $.selectBatches(e, r, t.signal), ee(e, n, t) && await A();
			} catch (r) {
				ee(e, n, t) && (u.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				ee(e, n, t) && (l.value = !1);
			}
		}
		return z(S, () => {
			te(), x = !1, s.value = /* @__PURE__ */ new Set(), o.value = {
				language: C.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, a.value = 0, A();
		}, { immediate: !0 }), z(a, () => {
			A();
		}), Dr(() => {
			_?.abort(), te();
		}), (e, t) => (H(), U("section", null, [
			t[15] ||= G("div", { class: "mb-4" }, [G("h1", null, "Artificial"), G("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			G("div", ff, [
				t[12] ||= G("h2", null, "Generate data", -1),
				G("p", pf, [t[5] ||= q("Wake phrase: ", -1), G("strong", null, N(C.value?.phrase ?? "No workspace selected"), 1)]),
				G("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Wo(ie, ["prevent"])
				}, [
					G("div", mf, [
						G("label", null, [t[6] ||= q("Language", -1), G("select", {
							name: "language",
							value: o.value.language,
							onChange: t[0] ||= (e) => j(e.target.value)
						}, [(H(!0), U(V, null, Pr(n.value, (e) => (H(), U("option", {
							key: e.language,
							value: e.language
						}, N(e.name), 9, gf))), 128))], 40, hf)]),
						G("label", null, [t[7] ||= q("English accent", -1), R(G("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => o.value.english_accent = e,
							disabled: !D.value
						}, [D.value ? (H(!0), U(V, { key: 0 }, Pr(w.value?.english_accents ?? [], (e) => (H(), U("option", {
							key: e.code,
							value: e.code
						}, N(e.label), 9, vf))), 128)) : (H(), U("option", yf, "Not applicable"))], 8, _f), [[Lo, o.value.english_accent]])]),
						G("label", null, [t[8] ||= q("Total samples", -1), R(G("input", {
							"onUpdate:modelValue": t[2] ||= (e) => o.value.samples = e,
							name: "samples",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							Po,
							o.value.samples,
							void 0,
							{ number: !0 }
						]])]),
						G("label", null, [t[9] ||= q("Batch size", -1), R(G("input", {
							"onUpdate:modelValue": t[3] ||= (e) => o.value.batch_size = e,
							name: "batch-size",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							Po,
							o.value.batch_size,
							void 0,
							{ number: !0 }
						]])])
					]),
					G("fieldset", null, [t[10] ||= G("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), G("div", bf, [(H(!0), U(V, null, Pr(E.value, (e) => (H(), U("article", {
						key: e.engine,
						class: "studio-history"
					}, [
						G("div", xf, [G("label", Sf, [G("input", {
							type: "checkbox",
							"data-engine": e.engine,
							disabled: !e.available,
							checked: o.value.engines?.includes(e.engine),
							onChange: (t) => ne(e.engine, t.target.checked)
						}, null, 40, Cf), G("strong", null, N(g[e.engine] ?? e.engine), 1)]), G("button", {
							type: "button",
							"data-preview": e.engine,
							disabled: !e.available || p.value[e.engine] || [
								"queued",
								"running",
								"cancelling"
							].includes(f.value[e.engine]?.status ?? "") || !S.value,
							onClick: (t) => ae(e.engine)
						}, N(p.value[e.engine] ? "Starting…" : "Preview"), 9, wf)]),
						e.reason ? (H(), U("p", Tf, N(e.reason), 1)) : J("", !0),
						m.value[e.engine] ? (H(), U("p", Ef, N(m.value[e.engine]), 1)) : J("", !0),
						f.value[e.engine] && f.value[e.engine].status !== "complete" ? (H(), W(Ec, {
							key: 2,
							"job-id": f.value[e.engine].id,
							onUpdate: (t) => oe(e.engine, t)
						}, null, 8, ["job-id", "onUpdate"])) : J("", !0),
						f.value[e.engine]?.status === "complete" ? (H(), U("audio", {
							key: 3,
							"data-preview-audio": e.engine,
							class: "mt-3 max-w-full",
							src: L($).previewAudioUrl(S.value, f.value[e.engine].id),
							controls: "",
							autoplay: "",
							"aria-label": `${g[e.engine] ?? e.engine} wakeword preview`
						}, null, 8, Df)) : J("", !0)
					]))), 128))])]),
					t[11] ||= G("p", { class: "studio-muted text-xs" }, "Samples are shared across the selected models. Preview generates one sample without adding it to your training data. Higher batch sizes use more memory; effective limits and accent support vary by model.", -1),
					G("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						disabled: l.value || c.value || !S.value
					}, N(l.value ? "Starting…" : "Generate dataset"), 9, Of)
				], 32),
				u.value ? (H(), U("p", kf, N(u.value), 1)) : J("", !0),
				d.value ? (H(), W(Ec, {
					key: 1,
					"job-id": d.value.id,
					onUpdate: se
				}, null, 8, ["job-id"])) : J("", !0)
			]),
			G("div", Af, [
				G("div", jf, [t[13] ||= G("h2", null, "Generated datasets", -1), G("button", {
					type: "button",
					"data-action": "save-batches",
					disabled: l.value || c.value || !S.value,
					onClick: le
				}, "Save selection", 8, Mf)]),
				t[14] ||= G("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				c.value ? (H(), U("p", Nf, "Loading datasets…")) : J("", !0),
				(H(!0), U(V, null, Pr(r.value, (e) => (H(), U("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [G("label", Pf, [
					G("input", {
						"data-batch-id": e.id,
						type: "checkbox",
						checked: s.value.has(e.id),
						disabled: e.status !== "complete",
						onChange: (t) => ce(e, t.target.checked)
					}, null, 40, Ff),
					G("span", null, [
						G("strong", null, N(e.phrase), 1),
						G("span", If, N(e.audio.length) + " samples · " + N(e.recipe.engines?.map((e) => g[e] ?? e).join(", ") || "Saved generation models") + " · " + N(e.created_at ? new Date(e.created_at).toLocaleString() : ""), 1),
						e.status === "complete" ? J("", !0) : (H(), U("span", Lf, N(e.status) + " — only completed datasets can be selected.", 1))
					]),
					G("span", Rf, N(e.status), 1)
				])]))), 128)),
				!c.value && !r.value.length ? (H(), U("p", zf, "No generated datasets yet. Choose models above to create one.")) : J("", !0),
				K($s, {
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
}), Vf = { class: "studio-card" }, Hf = {
	key: 0,
	class: "studio-muted"
}, Uf = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-3 my-4"
}, Wf = { class: "studio-muted" }, Gf = { class: "text-2xl font-semibold" }, Kf = { class: "studio-muted" }, qf = { class: "text-2xl font-semibold" }, Jf = { class: "studio-muted" }, Yf = { class: "text-2xl font-semibold" }, Xf = { class: "studio-card mt-4" }, Zf = { class: "grid gap-3 mt-3" }, Qf = {
	"data-dataset-compatibility": "",
	class: "studio-note text-xs"
}, $f = { class: "flex gap-2" }, ep = ["disabled"], tp = ["disabled"], np = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, rp = { class: "studio-card mt-4" }, ip = { class: "studio-muted" }, ap = ["href"], op = { class: "studio-card mt-4" }, sp = { class: "flex justify-between gap-3" }, cp = {
	key: 0,
	class: "studio-note text-xs"
}, lp = {
	key: 0,
	class: "studio-muted"
}, up = /* @__PURE__ */ B({
	__name: "TrainPage",
	setup(e) {
		let t = ms(), n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I({ training_steps: 4e4 }), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I([]), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I(null), f, p, m, h = 0, g = 0, _ = 0, v = Y(() => t.selectedId.value), y = Y(() => [...new Set(o.value.map((e) => `${e.representation}/${e.adapter}`))]);
		function b(e, t, n) {
			return v.value === e && h === t && !n.signal.aborted;
		}
		function x(e, t, n) {
			return v.value === e && g === t && !n.signal.aborted;
		}
		function S(e, t, n) {
			return v.value === e && _ === t && !n.signal.aborted;
		}
		function C() {
			p?.abort(), m?.abort(), p = void 0, m = void 0, g += 1, _ += 1, c.value = !1, l.value = !1, d.value = null;
		}
		async function w(e, t) {
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
		async function T() {
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
						w(c, e)
					]);
					if (!b(c, t, e)) return;
					n.value = s, r.value = l, i.value = u.items, a.value = d.find((e) => e.scope === `train:${c}`) ?? null, o.value = f;
				} catch (n) {
					b(c, t, e) && (u.value = n instanceof Error ? n.message : "Unable to load training configuration.");
				} finally {
					b(c, t, e) && (s.value = !1);
				}
			}
		}
		function E() {
			return !Number.isInteger(r.value.training_steps) || r.value.training_steps < 1 || r.value.training_steps > 1e7 ? (u.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function D() {
			let e = v.value;
			if (!e || !E()) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, i = { training_steps: r.value.training_steps };
			c.value = !0, u.value = "";
			try {
				let a = await $.saveTrainingSettings(e, i, t.signal);
				x(e, n, t) && (r.value = a);
			} catch (r) {
				x(e, n, t) && (u.value = r instanceof Error ? r.message : "Training settings were not saved.");
			} finally {
				x(e, n, t) && (c.value = !1);
			}
		}
		async function O() {
			let e = v.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++_;
			l.value = !0, u.value = "";
			try {
				let r = await $.train(e, t.signal);
				S(e, n, t) && (d.value = r);
			} catch (r) {
				S(e, n, t) && (u.value = r instanceof Error ? r.message : "Training job was not started.");
			} finally {
				S(e, n, t) && (l.value = !1);
			}
		}
		function ee(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return z(v, () => {
			C(), T();
		}, { immediate: !0 }), Dr(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, o) => (H(), U("section", null, [
			o[13] ||= G("div", { class: "mb-4" }, [G("h1", null, "Train"), G("p", { class: "studio-muted" }, "Manual runs always execute. Scheduled runs snapshot inputs when they begin and can skip unchanged fingerprints.")], -1),
			G("div", Vf, [
				o[5] ||= G("h2", null, "Effective inputs for the next snapshot", -1),
				s.value ? (H(), U("p", Hf, "Loading effective inputs…")) : n.value ? (H(), U("div", Uf, [
					G("p", Wf, [G("strong", Gf, N(n.value.positive), 1), o[2] ||= q(" reviewed positives", -1)]),
					G("p", Kf, [G("strong", qf, N(n.value.negative), 1), o[3] ||= q(" reviewed negatives", -1)]),
					G("p", Jf, [G("strong", Yf, N(n.value.artificial), 1), o[4] ||= q(" selected artificial", -1)])
				])) : J("", !0),
				o[6] ||= G("p", { class: "studio-muted text-xs" }, "Only reviewed positive/negative samples and completed selected artificial batches are counted. Pending and discarded recordings are not training inputs.", -1)
			]),
			G("div", Xf, [
				o[10] ||= G("h2", null, "Training parameters", -1),
				G("div", Zf, [
					G("label", null, [o[7] ||= q("Training steps", -1), R(G("input", {
						"onUpdate:modelValue": o[0] ||= (e) => r.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						Po,
						r.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					G("p", Qf, [
						o[8] ||= q("Selected classifier representations: ", -1),
						G("strong", null, N(y.value.join(", ") || "none"), 1),
						o[9] ||= q(". microWakeWord uses mww_mmap feature tensors. dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					G("div", $f, [G("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: c.value,
						onClick: D
					}, N(c.value ? "Saving…" : "Save parameters"), 9, ep), G("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !v.value || l.value,
						onClick: O
					}, N(l.value ? "Starting…" : "Start training"), 9, tp)])
				]),
				u.value ? (H(), U("p", np, N(u.value), 1)) : J("", !0),
				d.value ? (H(), W(Ec, {
					key: 1,
					"job-id": d.value.id
				}, null, 8, ["job-id"])) : J("", !0)
			]),
			G("section", rp, [
				o[11] ||= G("h2", null, "Automatic training", -1),
				G("p", ip, N(a.value?.enabled ? `${a.value.cron} · ${a.value.timezone} · Next: ${a.value.next_run_at}` : "Not scheduled"), 1),
				G("a", {
					href: L(t).routes.href("automate"),
					onClick: o[1] ||= Wo((e) => L(t).routes.navigate("automate"), ["prevent"])
				}, "Manage in Automate →", 8, ap)
			]),
			G("div", op, [
				o[12] ||= G("h2", null, "Run history", -1),
				(H(!0), U(V, null, Pr(i.value, (e) => (H(), U("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					G("div", sp, [G("strong", null, N(e.id), 1), G("span", { class: M(["studio-status", `studio-status-${e.status}`]) }, N(e.status), 3)]),
					ee(e) ? (H(), U("p", cp, "Skipped because inputs and configuration were unchanged.")) : J("", !0),
					K(Ec, { "job-id": e.id }, null, 8, ["job-id"])
				]))), 128)),
				!s.value && !i.value.length ? (H(), U("p", lp, "No training runs for this workspace yet.")) : J("", !0)
			])
		]));
	}
});
//#endregion
//#region src/studio/theme.ts
function dp() {
	let e = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null, t = null;
	try {
		let e = localStorage.getItem("studio.theme");
		(e === "light" || e === "dark") && (t = e);
	} catch {}
	let n = /* @__PURE__ */ I(t ? t === "dark" : !!e?.matches);
	function r() {
		document.documentElement.dataset.studioTheme = n.value ? "dark" : "light";
	}
	function i() {
		t || (n.value = !!e?.matches, r());
	}
	function a() {
		n.value = !n.value, t = n.value ? "dark" : "light", r();
		try {
			localStorage.setItem("studio.theme", t);
		} catch {}
	}
	return r(), e?.addEventListener ? e.addEventListener("change", i) : e?.addListener?.(i), {
		dark: n,
		toggle: a,
		dispose() {
			e?.removeEventListener ? e.removeEventListener("change", i) : e?.removeListener?.(i);
		}
	};
}
//#endregion
//#region src/studio/components/ThemeToggle.vue?vue&type=script&setup=true&lang.ts
var fp = ["aria-pressed"], pp = /* @__PURE__ */ B({
	__name: "ThemeToggle",
	setup(e) {
		let { dark: t, toggle: n, dispose: r } = dp();
		return Dr(r), (e, r) => (H(), U("button", {
			type: "button",
			"aria-label": "Dark mode",
			"aria-pressed": L(t),
			onClick: r[0] ||= (...e) => L(n) && L(n)(...e)
		}, N(L(t) ? "☀ Light mode" : "☾ Dark mode"), 9, fp));
	}
}), mp = { class: "studio-sidebar" }, hp = { class: "flex items-center justify-between gap-3" }, gp = ["aria-expanded"], _p = ["hidden"], vp = {
	key: 0,
	class: "studio-nav-label"
}, yp = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], bp = { class: "studio-main" }, xp = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, Sp = { class: "studio-muted text-xs" }, Cp = { class: "flex flex-wrap items-center gap-3" }, wp = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, Tp = ["value", "disabled"], Ep = {
	key: 0,
	value: ""
}, Dp = ["value"], Op = {
	key: 0,
	role: "status",
	class: "studio-note"
}, kp = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Ap = {
	key: 2,
	role: "status"
}, jp = /* @__PURE__ */ B({
	__name: "StudioShell",
	setup(e) {
		let t = ns(), n = fs(t);
		Ln(ps, n);
		let { wakewords: r, selectedId: i, selected: a, loading: o, error: s, notice: c } = n, l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(), f = /* @__PURE__ */ I(), p = Y(() => $o.find((e) => e.id === t.page.value)), m = Y(() => u.value && !l.value), h = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
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
		}), g(), h?.addEventListener ? h.addEventListener("change", g) : h?.addListener(g), wr(() => {
			document.addEventListener("keydown", v), n.load();
		}), Dr(() => {
			document.removeEventListener("keydown", v), h?.removeEventListener ? h.removeEventListener("change", g) : h?.removeListener(g);
		}), (e, a) => (H(), U("div", { class: M(["studio-app", { "is-narrow": u.value }]) }, [
			G("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: a[0] ||= Wo((e) => f.value?.focus(), ["prevent"])
			}, "Skip to content"),
			G("aside", mp, [
				G("div", hp, [a[3] ||= G("div", { class: "studio-brand" }, [q("◈ Wakeword Studio"), G("small", null, "LISTEN · REFINE · DEPLOY")], -1), u.value ? (H(), U("button", {
					key: 0,
					ref_key: "toggle",
					ref: d,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": l.value,
					onClick: a[1] ||= (e) => l.value = !l.value
				}, "Menu", 8, gp)) : J("", !0)]),
				G("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: m.value
				}, [(H(!0), U(V, null, Pr(L($o), (e, n) => (H(), U(V, { key: e.id }, [(e.group === "Data" || e.group === "Models") && L($o)[n - 1]?.group !== e.group ? (H(), U("div", vp, N(e.group), 1)) : J("", !0), G("a", {
					href: L(t).href(e.id),
					"data-page": e.id,
					class: M({
						active: p.value.id === e.id,
						"studio-sub": e.group === "Data"
					}),
					"aria-current": p.value.id === e.id ? "page" : void 0,
					onClick: Wo((t) => y(e.id), ["prevent"])
				}, N(e.name), 11, yp)], 64))), 128))], 8, _p),
				a[4] ||= G("p", { class: "studio-sidebar-note" }, [
					q("Independent workspaces."),
					G("br"),
					q("Device selections stay unchanged.")
				], -1)
			]),
			G("div", bp, [G("header", xp, [G("div", Sp, N(p.value.group) + " / " + N(p.value.name), 1), G("div", Cp, [G("label", wp, [a[5] ||= q("WAKEWORD ", -1), G("select", {
				id: "studio-word",
				value: L(i),
				disabled: !L(r).length,
				onChange: a[2] ||= (e) => L(n).select(e.target.value)
			}, [L(r).length ? J("", !0) : (H(), U("option", Ep, "No wakewords")), (H(!0), U(V, null, Pr(L(r), (e) => (H(), U("option", {
				key: e.id,
				value: e.id
			}, N(e.phrase), 9, Dp))), 128))], 40, Tp)]), K(pp)])]), G("main", {
				id: "studio-content",
				ref_key: "content",
				ref: f,
				class: "studio-content",
				tabindex: "-1"
			}, [
				L(c) ? (H(), U("p", Op, N(L(c)), 1)) : J("", !0),
				L(s) ? (H(), U("div", kp, N(L(s)), 1)) : J("", !0),
				L(o) ? (H(), U("p", Ap, "Loading workspaces…")) : J("", !0),
				p.value.id === "wakewords" ? (H(), W(Hs, { key: 3 })) : p.value.id === "classify" ? (H(), W(cl, { key: 4 })) : p.value.id === "samples" ? (H(), W(ru, { key: 5 })) : p.value.id === "kiosks" ? (H(), W(ju, { key: 6 })) : p.value.id === "automate" ? (H(), W(fd, { key: 7 })) : p.value.id === "deploy" ? (H(), W(qd, { key: 8 })) : p.value.id === "negative-datasets" ? (H(), W(df, { key: 9 })) : p.value.id === "artificial" ? (H(), W(Bf, { key: 10 })) : p.value.id === "train" ? (H(), W(up, { key: 11 })) : J("", !0)
			], 512)])
		], 2));
	}
}), Mp = /* @__PURE__ */ B({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (H(), W(jp));
	}
}), Np = document.getElementById("trainer-app");
if (!Np) throw Error("Missing #trainer-app mount point");
Xo(Mp).mount(Np);
//#endregion

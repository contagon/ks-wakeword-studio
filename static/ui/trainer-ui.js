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
}, D = /-\w/g, O = E((e) => e.replace(D, (e) => e.slice(1).toUpperCase())), k = /\B([A-Z])/g, A = E((e) => e.replace(k, "-$1").toLowerCase()), ee = E((e) => e.charAt(0).toUpperCase() + e.slice(1)), te = E((e) => e ? `on${ee(e)}` : ""), j = (e, t) => !Object.is(e, t), ne = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, M = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, re = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, ie, ae = () => ie ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function N(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? P(r) : N(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var oe = /;(?![^(]*\))/g, se = /:([^]+)/, ce = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function P(e) {
	let t = {};
	return e.replace(ce, (e) => e.startsWith("/*") ? "" : e).split(oe).forEach((e) => {
		if (e) {
			let n = e.split(se);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function F(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = F(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var le = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function ue(e) {
	return !!e || e === "";
}
function de(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = he(e[i], t[i], n);
	return r;
}
function fe(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && he(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function pe(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? fe(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !he(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function me(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function he(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? me(e, t, n, de) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : me(e, t, n, pe) : String(e) === String(t))));
}
function ge(e, t) {
	return e.findIndex((e) => he(e, t));
}
var _e = (e) => !!(e && e.__v_isRef === !0), I = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? _e(e) ? I(e.value) : JSON.stringify(e, ve, 2) : String(e), ve = (e, t) => _e(t) ? ve(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[ye(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => ye(e)) } : _(t) ? ye(t) : v(t) && !d(t) && !C(t) ? String(t) : t, ye = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, be, xe = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && be && (be.active ? (this.parent = be, this.index = (be.scopes || (be.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = be;
			try {
				return be = this, e();
			} finally {
				be = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = be, be = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (be === this) be = this.prevScope;
			else {
				let e = be;
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
function Se() {
	return be;
}
function Ce(e, t = !1) {
	be && be.cleanups.push(e);
}
var L, we = /* @__PURE__ */ new WeakSet(), Te = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, be && (be.active ? be.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, we.has(this) && (we.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || ke(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, He(this), Me(this);
		let e = L, t = Re;
		L = this, Re = !0;
		try {
			return this.fn();
		} finally {
			Ne(this), L = e, Re = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Ie(e);
			this.deps = this.depsTail = void 0, He(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? we.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Pe(this) && this.run();
	}
	get dirty() {
		return Pe(this);
	}
}, Ee = 0, De, Oe;
function ke(e, t = !1) {
	e.flags |= 8, t ? (e.next = Oe, Oe = e) : (e.next = De, De = e);
}
function Ae() {
	Ee++;
}
function je() {
	if (--Ee > 0) return;
	if (Oe) {
		let e = Oe;
		for (Oe = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; De;) {
		let t = De;
		for (De = void 0; t;) {
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
function Me(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ne(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Ie(r), Le(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Pe(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Fe(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Fe(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ue) || (e.globalVersion = Ue, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Pe(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = L, r = Re;
	L = e, Re = !0;
	try {
		Me(e);
		let n = e.fn(e._value);
		(t.version === 0 || j(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		L = n, Re = r, Ne(e), e.flags &= -3;
	}
}
function Ie(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Ie(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Le(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Re = !0, ze = [];
function Be() {
	ze.push(Re), Re = !1;
}
function Ve() {
	let e = ze.pop();
	Re = e === void 0 || e;
}
function He(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = L;
		L = void 0;
		try {
			t();
		} finally {
			L = e;
		}
	}
}
var Ue = 0, We = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Ge = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!L || !Re || L === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== L) t = this.activeLink = new We(L, this), L.deps ? (t.prevDep = L.depsTail, L.depsTail.nextDep = t, L.depsTail = t) : L.deps = L.depsTail = t, Ke(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = L.depsTail, t.nextDep = void 0, L.depsTail.nextDep = t, L.depsTail = t, L.deps === t && (L.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Ue++, this.notify(e);
	}
	notify(e) {
		Ae();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			je();
		}
	}
};
function Ke(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Ke(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var qe = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ Symbol(""), Ye = /* @__PURE__ */ Symbol(""), Xe = /* @__PURE__ */ Symbol("");
function Ze(e, t, n) {
	if (Re && L) {
		let t = qe.get(e);
		t || qe.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Ge()), r.map = t, r.key = n), r.track();
	}
}
function Qe(e, t, n, r, i, a) {
	let o = qe.get(e);
	if (!o) {
		Ue++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Ae(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Xe || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Xe)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Je)), f(e) && s(o.get(Ye)));
				break;
			case "delete":
				i || (s(o.get(Je)), f(e) && s(o.get(Ye)));
				break;
			case "set": f(e) && s(o.get(Je));
		}
	}
	je();
}
function $e(e) {
	let t = /* @__PURE__ */ R(e);
	return t === e || (Ze(t, "iterate", Xe), /* @__PURE__ */ zt(e)) ? t : /* @__PURE__ */ Rt(e) ? /* @__PURE__ */ Lt(e) ? t.map((e) => Ut(Ht(e))) : t.map(Ut) : t.map(Ht);
}
function et(e) {
	return Ze(e = /* @__PURE__ */ R(e), "iterate", Xe), e;
}
function tt(e, t) {
	return /* @__PURE__ */ Rt(e) ? Ut(/* @__PURE__ */ Lt(e) ? Ht(t) : t) : Ht(t);
}
var nt = {
	__proto__: null,
	[Symbol.iterator]() {
		return rt(this, Symbol.iterator, (e) => tt(this, e));
	},
	concat(...e) {
		return $e(this).concat(...e.map((e) => d(e) ? $e(e) : e));
	},
	entries() {
		return rt(this, "entries", (e) => (e[1] = tt(this, e[1]), e));
	},
	every(e, t) {
		return ot(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return ot(this, "filter", e, t, (e) => e.map((e) => tt(this, e)), arguments);
	},
	find(e, t) {
		return ot(this, "find", e, t, (e) => tt(this, e), arguments);
	},
	findIndex(e, t) {
		return ot(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return ot(this, "findLast", e, t, (e) => tt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return ot(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return ot(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return ct(this, "includes", e);
	},
	indexOf(...e) {
		return ct(this, "indexOf", e);
	},
	join(e) {
		return $e(this).join(e);
	},
	lastIndexOf(...e) {
		return ct(this, "lastIndexOf", e);
	},
	map(e, t) {
		return ot(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return lt(this, "pop");
	},
	push(...e) {
		return lt(this, "push", e);
	},
	reduce(e, ...t) {
		return st(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return st(this, "reduceRight", e, t);
	},
	shift() {
		return lt(this, "shift");
	},
	some(e, t) {
		return ot(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return lt(this, "splice", e);
	},
	toReversed() {
		return $e(this).toReversed();
	},
	toSorted(e) {
		return $e(this).toSorted(e);
	},
	toSpliced(...e) {
		return $e(this).toSpliced(...e);
	},
	unshift(...e) {
		return lt(this, "unshift", e);
	},
	values() {
		return rt(this, "values", (e) => tt(this, e));
	}
};
function rt(e, t, n) {
	let r = et(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ zt(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => it(a.next(), n), i !== at[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => it(a._next(), n);
	}
	return a;
}
function it(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var at = Array.prototype;
function ot(e, t, n, r, i, a) {
	let o = et(e), s = o !== e && !/* @__PURE__ */ zt(e), c = o[t];
	if (c !== at[t]) {
		let t = c.apply(e, a);
		return s ? Ht(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, tt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function st(e, t, n, r) {
	let i = et(e), a = i !== e && !/* @__PURE__ */ zt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = tt(e, t)), n.call(this, t, tt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? tt(e, c) : c;
}
function ct(e, t, n) {
	let r = /* @__PURE__ */ R(e);
	Ze(r, "iterate", Xe);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Bt(n[0]) ? (n[0] = /* @__PURE__ */ R(n[0]), r[t](...n)) : i;
}
function lt(e, t, n = []) {
	Be(), Ae();
	let r = (/* @__PURE__ */ R(e))[t].apply(e, n);
	return je(), Ve(), r;
}
var ut = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), dt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function ft(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ R(this);
	return Ze(t, "has", e), t.hasOwnProperty(e);
}
var pt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? jt : At : i ? kt : Ot).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = nt[t])) return e;
			if (t === "hasOwnProperty") return ft;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Wt(e) ? e : n);
		if ((_(t) ? dt.has(t) : ut(t)) || (r || Ze(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Wt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ Ft(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ Ft(o) : /* @__PURE__ */ Nt(o) : o;
	}
}, mt = class extends pt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Rt(i);
			if (!/* @__PURE__ */ zt(n) && !/* @__PURE__ */ Rt(n) && (i = /* @__PURE__ */ R(i), n = /* @__PURE__ */ R(n)), !a && /* @__PURE__ */ Wt(i) && !/* @__PURE__ */ Wt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Wt(e) ? e : r);
		return e === /* @__PURE__ */ R(r) && s && (o ? j(n, i) && Qe(e, "set", t, n, i) : Qe(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && Qe(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !dt.has(t)) && Ze(e, "has", t), n;
	}
	ownKeys(e) {
		return Ze(e, "iterate", d(e) ? "length" : Je), Reflect.ownKeys(e);
	}
}, ht = class extends pt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, gt = /* @__PURE__ */ new mt(), _t = /* @__PURE__ */ new ht(), vt = /* @__PURE__ */ new mt(!0), yt = (e) => e, bt = (e) => Reflect.getPrototypeOf(e);
function xt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ R(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? yt : t ? Ut : Ht;
		return !t && Ze(a, "iterate", l ? Ye : Je), s(Object.create(u), { next() {
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
function St(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Ct(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ R(r), a = /* @__PURE__ */ R(n);
			e || (j(n, a) && Ze(i, "get", n), Ze(i, "get", a));
			let { has: o } = bt(i), s = t ? yt : e ? Ut : Ht;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Ze(/* @__PURE__ */ R(t), "iterate", Je), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ R(n), i = /* @__PURE__ */ R(t);
			return e || (j(t, i) && Ze(r, "has", t), Ze(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ R(a), s = t ? yt : e ? Ut : Ht;
			return !e && Ze(o, "iterate", Je), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: St("add"),
		set: St("set"),
		delete: St("delete"),
		clear: St("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ R(this), r = bt(n), i = /* @__PURE__ */ R(e), a = !t && !/* @__PURE__ */ zt(e) && !/* @__PURE__ */ Rt(e) ? i : e;
			return r.has.call(n, a) || j(e, a) && r.has.call(n, e) || j(i, a) && r.has.call(n, i) || (n.add(a), Qe(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ zt(n) && !/* @__PURE__ */ Rt(n) && (n = /* @__PURE__ */ R(n));
			let r = /* @__PURE__ */ R(this), { has: i, get: a } = bt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ R(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? j(n, s) && Qe(r, "set", e, n, s) : Qe(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ R(this), { has: n, get: r } = bt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ R(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && Qe(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ R(this), t = e.size !== 0, n = e.clear();
			return t && Qe(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = xt(r, e, t);
	}), n;
}
function wt(e, t) {
	let n = Ct(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Tt = { get: /* @__PURE__ */ wt(!1, !1) }, Et = { get: /* @__PURE__ */ wt(!1, !0) }, Dt = { get: /* @__PURE__ */ wt(!0, !1) }, Ot = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap();
function Mt(e) {
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
function Nt(e) {
	return /* @__PURE__ */ Rt(e) ? e : It(e, !1, gt, Tt, Ot);
}
// @__NO_SIDE_EFFECTS__
function Pt(e) {
	return It(e, !1, vt, Et, kt);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
	return It(e, !0, _t, Dt, At);
}
function It(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Mt(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
	return /* @__PURE__ */ Rt(e) ? /* @__PURE__ */ Lt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function R(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ R(t) : e;
}
function Vt(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && M(e, "__v_skip", !0), e;
}
var Ht = (e) => v(e) ? /* @__PURE__ */ Nt(e) : e, Ut = (e) => v(e) ? /* @__PURE__ */ Ft(e) : e;
// @__NO_SIDE_EFFECTS__
function Wt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function z(e) {
	return Kt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Gt(e) {
	return Kt(e, !0);
}
function Kt(e, t) {
	return /* @__PURE__ */ Wt(e) ? e : new qt(e, t);
}
var qt = class {
	constructor(e, t) {
		this.dep = new Ge(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ R(e), this._value = t ? e : Ht(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ zt(e) || /* @__PURE__ */ Rt(e);
		e = n ? e : /* @__PURE__ */ R(e), j(e, t) && (this._rawValue = e, this._value = n ? e : Ht(e), this.dep.trigger());
	}
};
function B(e) {
	return /* @__PURE__ */ Wt(e) ? e.value : e;
}
var Jt = {
	get: (e, t, n) => t === "__v_raw" ? e : B(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Wt(i) && !/* @__PURE__ */ Wt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Yt(e) {
	return /* @__PURE__ */ Lt(e) ? e : new Proxy(e, Jt);
}
var Xt = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Ge(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Zt(e) {
	return new Xt(e);
}
var Qt = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Ge(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ue - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && L !== this) return ke(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Fe(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function $t(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new Qt(r, i, n);
}
var en = {}, tn = /* @__PURE__ */ new WeakMap(), nn = void 0;
function rn(e, t = !1, n = nn) {
	if (n) {
		let t = tn.get(n);
		t || tn.set(n, t = []), t.push(e);
	}
}
function an(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ zt(e) || o === !1 || o === 0 ? on(e, 1) : on(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Wt(e) ? (g = () => e.value, y = /* @__PURE__ */ zt(e)) : /* @__PURE__ */ Lt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ Lt(e) || /* @__PURE__ */ zt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Wt(e)) return e.value;
		if (/* @__PURE__ */ Lt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Be();
			try {
				_();
			} finally {
				Ve();
			}
		}
		let t = nn;
		nn = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			nn = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => on(e(), t);
	}
	let x = Se(), S = () => {
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
	let C = b ? Array(e.length).fill(en) : en, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => j(e, C[t])) : j(t, C))) {
					let e = nn;
					Be();
					try {
						_ && _(), nn = m;
						let e = [
							t,
							C === en ? void 0 : b && C[0] === en ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						nn = e, Ve();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Te(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => rn(e, !1, m), _ = m.onStop = () => {
		let e = tn.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			tn.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function on(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Wt(e)) on(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) on(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		on(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) on(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && on(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function sn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		ln(e, t, n);
	}
}
function cn(e, t, n, r) {
	if (h(e)) {
		let i = sn(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			ln(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(cn(e[a], t, n, r));
		return i;
	}
}
function ln(e, n, r, i = !0) {
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
			Be(), sn(o, null, 10, [
				e,
				i,
				a
			]), Ve();
			return;
		}
	}
	un(e, r, a, i, s);
}
function un(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var dn = [], fn = -1, pn = [], mn = null, hn = 0, gn = /* @__PURE__ */ Promise.resolve(), _n = null;
function vn(e) {
	let t = _n || gn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function yn(e) {
	let t = fn + 1, n = dn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = dn[r], a = Dn(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function bn(e) {
	if (!(e.flags & 1)) {
		let t = Dn(e), n = dn[dn.length - 1];
		!n || !(e.flags & 2) && t >= Dn(n) ? dn.push(e) : dn.splice(yn(t), 0, e), e.flags |= 1, xn();
	}
}
function xn() {
	_n ||= gn.then(On);
}
function Sn(e) {
	if (!d(e)) mn && e.id === -1 ? mn.splice(hn + 1, 0, e) : e.flags & 1 || (pn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) pn.push(e[t]);
	xn();
}
function Cn(e, t, n, r = fn + 1) {
	for (; r < dn.length; r++) {
		let n = dn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			dn.splice(r, 1), r = e ? r - 1 : fn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function wn(e, t, n = 0) {
	if (pn.length) {
		let e = pn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < pn.length; i++) {
				let a = pn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? pn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => Dn(e) - Dn(t));
		if (pn.length = r, mn) {
			for (let e = 0; e < i.length; e++) mn.push(i[e]);
			return;
		}
		for (mn = i, hn = 0; hn < mn.length; hn++) {
			let e = mn[hn];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		mn = null, hn = 0;
	}
}
var Tn = !1;
function En(e, t) {
	if (Tn) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(pn);
	e(), Tn = !0;
	try {
		Cn(void 0, t), wn(void 0, n, t);
	} finally {
		Tn = !1;
	}
}
var Dn = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function On(e) {
	try {
		for (fn = 0; fn < dn.length; fn++) {
			let e = dn[fn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), sn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; fn < dn.length; fn++) {
			let e = dn[fn];
			e && (e.flags &= -2);
		}
		fn = -1, dn.length = 0, wn(e), _n = null, (dn.length || pn.length) && On(e);
	}
}
var kn = null, An = null;
function jn(e) {
	let t = kn;
	return kn = e, An = e && e.type.__scopeId || null, t;
}
function Mn(e, t = kn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && oa(-1);
		let i = jn(t), a = na.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = na.length; e > a; e--) ia();
			jn(i), r._d && oa(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function V(e, n) {
	if (kn === null) return e;
	let r = Va(kn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && on(o), i.push({
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
function Nn(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Be(), cn(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), Ve());
	}
}
function Pn(e, t) {
	if (Da) {
		let n = Da.provides, r = Da.parent && Da.parent.provides;
		r === n && (n = Da.provides = Object.create(r)), n[e] = t;
	}
}
function Fn(e, t, n = !1) {
	let r = Oa();
	if (r || si) {
		let i = si ? si._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var In = /* @__PURE__ */ Symbol.for("v-scx"), Ln = () => Fn(In);
function Rn(e, t) {
	return zn(e, null, { flush: "sync" });
}
function H(e, t, n) {
	return zn(e, t, n);
}
function zn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Pa) {
		if (c === "sync") {
			let e = Ln();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Da;
	u.call = (e, t, n) => cn(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Bi(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : bn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = an(e, n, u);
	return Pa && (f ? f.push(h) : d && h()), h;
}
function Bn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Vn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = ja(this), s = zn(i, a.bind(r), n);
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
			Hn.set(e, t), Bi(t, a);
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
			if (o === "svg" || qn(p) ? o = "svg" : (o === "mathml" || Jn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Ki(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Zn(t, n, r, l, 1);
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
		for (let n of e) if (n.type !== ea) {
			t = n;
			break;
		}
	}
	return t;
}
function ir(e) {
	if (!hr(e)) return Wn(e.type) && e.children ? rr(e.children) : e;
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
	else if (e.transition = t, e.type === W && d(e.children)) {
		let n = hi(e.children, !1);
		n && ar(n, t);
	}
}
function or(e) {
	if (e.component) return or(e.component.subTree);
	if (e.type === W) {
		let t = d(e.children) && hi(e.children, !1);
		return t ? or(t) : void 0;
	}
	if (e.type !== ea) return e;
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function cr() {
	let e = Oa();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
}
function lr(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function ur(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var dr = /* @__PURE__ */ new WeakMap();
function fr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => fr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (mr(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && fr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? Va(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ R(v), b = v === t ? i : (e) => !ur(_, e) && u(y, e), x = (e, t) => !(t && ur(_, t));
	if (m != null && m !== p) {
		if (pr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Wt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) sn(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Wt(p);
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
					i(), dr.delete(e);
				};
				t.id = -1, dr.set(e, t), Bi(t, r);
			} else pr(e), i();
		}
	}
}
function pr(e) {
	let t = dr.get(e);
	t && (t.flags |= 8, dr.delete(e));
}
ae().requestIdleCallback, ae().cancelIdleCallback;
var mr = (e) => !!e.type.__asyncLoader, hr = (e) => e.type.__isKeepAlive;
function gr(e, t) {
	vr(e, "a", t);
}
function _r(e, t) {
	vr(e, "da", t);
}
function vr(e, t, n = Da) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (br(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) hr(e.parent.vnode) && yr(r, t, n, e), e = e.parent;
	}
}
function yr(e, t, n, r) {
	let i = br(t, e, r, !0);
	Dr(() => {
		c(r[t], i);
	}, n);
}
function br(e, t, n = Da, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Be();
			let i = ja(n), a = cn(t, n, e, r);
			return i(), Ve(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var xr = (e) => (t, n = Da) => {
	(!Pa || e === "sp") && br(e, (...e) => t(...e), n);
}, Sr = xr("bm"), Cr = xr("m"), wr = xr("bu"), Tr = xr("u"), Er = xr("bum"), Dr = xr("um"), Or = xr("sp"), kr = xr("rtg"), Ar = xr("rtc");
function jr(e, t = Da) {
	br("ec", e, t);
}
var Mr = "components", Nr = /* @__PURE__ */ Symbol.for("v-ndc");
function Pr(e) {
	return g(e) ? Fr(Mr, e, !1) || e : e || Nr;
}
function Fr(e, t, n = !0, r = !1) {
	let i = kn || Da;
	if (i) {
		let n = i.type;
		if (e === Mr) {
			let e = Ha(n, !1);
			if (e && (e === t || e === O(t) || e === ee(O(t)))) return n;
		}
		let a = Ir(i[e] || n[e], t) || Ir(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Ir(e, t) {
	return e && (e[t] || e[O(t)] || e[ee(O(t))]);
}
function U(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ Lt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ zt(e), s = /* @__PURE__ */ Rt(e), e = et(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Ut(Ht(e[n])) : Ht(e[n]) : e[n], n, void 0, a && a[n]);
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
var Lr = (e) => e ? Na(e) ? Va(e) : Lr(e.parent) : null, Rr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Lr(e.parent),
	$root: (e) => Lr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Jr(e),
	$forceUpdate: (e) => e.f ||= () => {
		bn(e.update);
	},
	$nextTick: (e) => e.n ||= vn.bind(e.proxy),
	$watch: (e) => Bn.bind(e)
}), zr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Br = {
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
			else if (zr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Ur && (s[n] = 0);
		}
		let d = Rr[n], f, p;
		if (d) return n === "$attrs" && Ze(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return zr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || zr(n, c) || u(o, c) || u(i, c) || u(Rr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Vr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Hr(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, Vr(e), Vr(t));
}
var Ur = !0;
function Wr(e) {
	let t = Jr(e), n = e.proxy, i = e.ctx;
	Ur = !1, t.beforeCreate && Kr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: k, expose: A, inheritAttrs: ee, components: te, directives: j, filters: ne } = t;
	if (u && Gr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Nt(t));
	}
	if (Ur = !0, o) for (let e in o) {
		let t = o[e], a = X({
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
	if (c) for (let e in c) qr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			Pn(t, e[t]);
		});
	}
	f && Kr(f, e, "c");
	function M(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (M(Sr, p), M(Cr, m), M(wr, g), M(Tr, _), M(gr, y), M(_r, b), M(jr, O), M(Ar, E), M(kr, D), M(Er, S), M(Dr, w), M(Or, k), d(A)) {
		if (A.length) {
			let t = e.exposed ||= {};
			A.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	T && e.render === r && (e.render = T), ee != null && (e.inheritAttrs = ee), te && (e.components = te), j && (e.directives = j), k && lr(e);
}
function Gr(e, t, n = r) {
	d(e) && (e = $r(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Fn(r.from || n, r.default, !0) : Fn(r.from || n) : Fn(r), /* @__PURE__ */ Wt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Kr(e, t, n) {
	cn(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function qr(e, t, n, r) {
	let i = r.includes(".") ? Vn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && H(i, n);
	} else if (h(e)) H(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => qr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && H(i, r, e);
		}
	}
}
function Jr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Yr(c, e, o, !0)), Yr(c, t, o)), v(t) && a.set(t, c), c;
}
function Yr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Yr(e, a, n, !0), i && i.forEach((t) => Yr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Xr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Xr = {
	data: Zr,
	props: ni,
	emits: ni,
	methods: ti,
	computed: ti,
	beforeCreate: ei,
	created: ei,
	beforeMount: ei,
	mounted: ei,
	beforeUpdate: ei,
	updated: ei,
	beforeDestroy: ei,
	beforeUnmount: ei,
	destroyed: ei,
	unmounted: ei,
	activated: ei,
	deactivated: ei,
	errorCaptured: ei,
	serverPrefetch: ei,
	components: ti,
	directives: ti,
	watch: ri,
	provide: Zr,
	inject: Qr
};
function Zr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Qr(e, t) {
	return ti($r(e), $r(t));
}
function $r(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function ei(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function ti(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ni(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Vr(e), Vr(t ?? {})) : t;
}
function ri(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = ei(e[r], t[r]);
	return n;
}
function ii() {
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
var ai = 0;
function oi(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = ii(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ai++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Wa,
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
					let u = l._ceVNode || pa(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Va(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (cn(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = si;
				si = l;
				try {
					return e();
				} finally {
					si = t;
				}
			}
		};
		return l;
	};
}
var si = null;
function ci(e, n, r = t) {
	let i = Oa(), a = O(n), o = A(n), s = li(e, a), c = Zt((s, c) => {
		let l, u = t, d;
		return Rn(() => {
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
var li = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${A(t)}Modifiers`];
function ui(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && li(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(re)));
	let c, l = i[c = te(n)] || i[c = te(O(n))];
	!l && o && (l = i[c = te(A(n))]), l && cn(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, cn(u, e, 6, a);
	}
}
var di = /* @__PURE__ */ new WeakMap();
function fi(e, t, n = !1) {
	let r = n ? di : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = fi(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function pi(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, A(t)) || u(e, t));
}
function mi(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = jn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = va(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = va(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : gi(c);
		}
	} catch (t) {
		na.length = 0, ln(t, e, 1), v = pa(ea);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = _i(y, a)), b = ga(b, y, !1, !0));
	}
	return n.dirs && (b = ga(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && ar(Wn(b.type) && ir(b) || b, n.transition), v = b, jn(_), v;
}
function hi(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (la(r)) {
			if (r.type !== ea || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var gi = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, _i = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function vi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? yi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (bi(o, r, n) && !pi(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || yi(r, o, l) : !!o;
	return !1;
}
function yi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || bi(t, e, a) && !pi(n, a)) return !0;
	}
	return !1;
}
function bi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !he(r, i) : r !== i;
}
function xi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Si = {}, Ci = () => Object.create(Si), wi = (e) => Object.getPrototypeOf(e) === Si;
function Ti(e, t, n, r = !1) {
	let i = {}, a = Ci();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Di(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ Pt(i) : e.type.props ? i : a, e.attrs = a;
}
function Ei(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ R(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (pi(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = O(o);
						i[t] = Oi(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		Di(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = A(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Oi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && Qe(e.attrs, "set", "");
}
function Di(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : pi(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ R(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = Oi(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function Oi(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = ja(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === A(n)) && (r = !0));
	}
	return r;
}
var ki = /* @__PURE__ */ new WeakMap();
function Ai(e, r, i = !1) {
	let a = i ? ki : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Ai(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		ji(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (ji(t)) {
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
function ji(e) {
	return e[0] !== "$" && !T(e);
}
var Mi = (e) => e === "_" || e === "_ctx" || e === "$stable", Ni = (e) => d(e) ? e.map(va) : [va(e)], Pi = (e, t, n) => {
	if (t._n) return t;
	let r = Mn((...e) => Ni(t(...e)), n);
	return r._c = !1, r;
}, Fi = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Mi(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Pi(n, i, r);
		else if (i != null) {
			let e = Ni(i);
			t[n] = () => e;
		}
	}
}, Ii = (e, t) => {
	let n = Ni(t);
	e.slots.default = () => n;
}, Li = (e, t, n) => {
	for (let r in t) (n || !Mi(r)) && (e[r] = t[r]);
}, Ri = (e, t, n) => {
	let r = e.slots = Ci();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Li(r, t, n), n && M(r, "_", e, !0)) : Fi(t, r);
	} else t && Ii(e, t);
}, zi = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Li(a, n, r) : (o = !n.$stable, Fi(n, a)), s = n;
	} else n && (Ii(e, n), s = { default: 1 });
	if (o) for (let e in a) !Mi(e) && s[e] == null && delete a[e];
}, Bi = Qi;
function Vi(e) {
	return Hi(e);
}
function Hi(e, i) {
	let a = ae();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !ua(e, t) && (i = pe(e), F(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case $i:
				y(e, t, r, i);
				break;
			case ea:
				b(e, t, r, i);
				break;
			case ta:
				e ?? x(t, r, i, s);
				break;
			case W:
				te(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? j(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, he);
		}
		d != null && a ? fr(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && fr(e.ref, null, o, e, !0);
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
				n && n._beginPatch(), k(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, E = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, Ui(e, a), s, u), _ && Nn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && Sa(f, r, e);
		}
		_ && Nn(e, null, r, "beforeMount");
		let v = Gi(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Bi(() => {
			try {
				f && Sa(f, r, e), v && g.enter(d), _ && Nn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Zi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? ya(e[l]) : va(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, k = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Wi(r, !1), (g = h.onVnodeBeforeUpdate) && Sa(g, r, n, e), f && Nn(n, e, r, "beforeUpdate"), r && Wi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? A(e.dynamicChildren, d, l, r, i, Ui(n, a), o) : s || oe(e, n, l, null, r, i, Ui(n, a), o, !1), u > 0) {
			if (u & 16) ee(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && ee(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && Bi(() => {
			g && Sa(g, r, n, e), f && Nn(n, e, r, "updated");
		}, i);
	}, A = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Xi(c), d = u && (c.type === W || !ua(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, ee = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !T(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (T(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, te = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (A(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Ki(e, t, !0)) : oe(e, t, n, f, i, a, s, c, l);
	}, j = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : M(t, n, r, i, a, o, c) : re(e, t, c);
	}, M = (e, t, n, r, i, a, o) => {
		let s = e.component = Ea(e, r, i);
		if (hr(e) && (s.ctx.renderer = he), Fa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ie, o, a), !e.el) {
				let r = s.subTree = pa(ea);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else ie(s, e, t, n, i, a, o);
	}, re = (e, t, n) => {
		let r = t.component = e.component;
		if (vi(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, N(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, ie = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Ji(e);
					if (n) {
						t && (t.el = c.el, N(e, t, o)), n.asyncDep.then(() => {
							Bi(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Wi(e, !1), t ? (t.el = c.el, N(e, t, o)) : t = c, n && ne(n), (d = t.props && t.props.onVnodeBeforeUpdate) && Sa(d, s, t, c), Wi(e, !0);
				let f = mi(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), pe(p), e, i, a), t.el = f.el, u === null && xi(e, f.el), r && Bi(r, i), (d = t.props && t.props.onVnodeUpdated) && Bi(() => Sa(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = mr(t);
				if (Wi(e, !1), l && ne(l), !m && (o = c && c.onVnodeBeforeMount) && Sa(o, d, t), Wi(e, !0), s && _e) {
					let t = () => {
						e.subTree = mi(e), _e(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = mi(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Bi(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Bi(() => Sa(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && mr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Bi(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Te(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => bn(u), Wi(e, !0), l();
	}, N = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Ei(e, t.props, r, n), zi(e, t.children, n), Be(), Cn(e), Ve();
	}, oe = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				ce(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				se(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && fe(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? ce(l, d, n, r, i, a, o, s, c) : fe(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, se = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? ya(t[p]) : va(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? fe(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, ce = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? ya(t[u]) : va(t[u]);
			if (ua(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? ya(t[p]) : va(t[p]);
			if (ua(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? ya(t[u]) : va(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) F(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? ya(t[u]) : va(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					F(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && ua(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? F(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? qi(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Xi(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? P(n, r, p, 2) : _--);
			}
		}
	}, P = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) P(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, he);
		else if (c === W) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) P(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === ta) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[nr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Bi(() => l.enter(a), i));
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
	}, F = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Be(), fr(s, null, n, e, !0), Ve()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !mr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Sa(_, t, e), u & 6) de(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Nn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, he, r) : l && !l.hasOnce && (a !== W || d > 0 && d & 64) ? fe(l, t, n, !1, !0) : (a === W && d & 384 || !i && u & 16) && fe(c, t, n), r && le(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Bi(() => {
			_ && Sa(_, t, e), h && Nn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, le = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === W;
		if (a && !i) {
			ue(n, r);
			return;
		}
		if (t === ta) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? or(e) : e, c = () => {
			a ? m(n) && ue(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, ue = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, de = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Yi(c), Yi(l), r && ne(r), i.stop(), a ? (a.flags |= 8, F(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, F(o, e, t, n)), s && Bi(s, t), Bi(() => {
			e.isUnmounted = !0;
		}, t);
	}, fe = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) F(e[o], t, n, r, i);
	}, pe = (e) => {
		if (e.shapeFlag & 6) return pe(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Un];
		return n ? h(n) : t;
	}, me = (e, t, n) => {
		En(() => {
			e == null ? t._vnode && F(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Ta());
	}, he = {
		p: v,
		um: F,
		m: P,
		r: le,
		mt: M,
		mc: O,
		pc: oe,
		pbc: A,
		n: pe,
		o: e
	}, ge, _e;
	return i && ([ge, _e] = i(he)), {
		render: me,
		hydrate: ge,
		createApp: oi(me, ge)
	};
}
function Ui({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Wi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Gi(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Ki(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = ya(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Ki(t, a)), a.type === $i && (a.patchFlag === -1 && (a = i[e] = ya(a)), a.el = t.el), a.type === ea && !a.el && (a.el = t.el);
	}
}
function qi(e) {
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
function Ji(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Ji(t);
}
function Yi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Xi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Xi(t.subTree) : null;
}
var Zi = (e) => e.__isSuspense;
function Qi(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Sn(e);
}
var W = /* @__PURE__ */ Symbol.for("v-fgt"), $i = /* @__PURE__ */ Symbol.for("v-txt"), ea = /* @__PURE__ */ Symbol.for("v-cmt"), ta = /* @__PURE__ */ Symbol.for("v-stc"), na = [], ra = null;
function G(e = !1) {
	na.push(ra = e ? null : []);
}
function ia() {
	na.pop(), ra = na[na.length - 1] || null;
}
var aa = 1;
function oa(e, t = !1) {
	aa += e, e < 0 && ra && t && (ra.hasOnce = !0);
}
function sa(e) {
	return e.dynamicChildren = aa > 0 ? ra || n : null, ia(), aa > 0 && ra && ra.push(e), e;
}
function K(e, t, n, r, i, a) {
	return sa(q(e, t, n, r, i, a, !0));
}
function ca(e, t, n, r, i) {
	return sa(pa(e, t, n, r, i, !0));
}
function la(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function ua(e, t) {
	return e.type === t.type && e.key === t.key;
}
var da = ({ key: e }) => e ?? null, fa = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Wt(e) || h(e) ? {
	i: kn,
	r: e,
	k: t,
	f: !!n
} : e);
function q(e, t = null, n = null, r = 0, i = null, a = e === W ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && da(t),
		ref: t && fa(t),
		scopeId: An,
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
		ctx: kn
	};
	return s ? (ba(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), aa > 0 && !o && ra && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && ra.push(c), c;
}
var pa = ma;
function ma(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Nr) && (e = ea), la(e)) {
		let r = ga(e, t, !0);
		return n && ba(r, n), aa > 0 && !a && ra && (r.shapeFlag & 6 ? ra[ra.indexOf(e)] = r : ra.push(r)), r.patchFlag = -2, r;
	}
	if (Ua(e) && (e = e.__vccOpts), t) {
		t = ha(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = F(e)), v(n) && (/* @__PURE__ */ Bt(n) && !d(n) && (n = s({}, n)), t.style = N(n));
	}
	let o = g(e) ? 1 : Zi(e) ? 128 : Wn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return q(e, t, n, r, i, o, a, !0);
}
function ha(e) {
	return e ? /* @__PURE__ */ Bt(e) || wi(e) ? s({}, e) : e : null;
}
function ga(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? xa(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && da(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(fa(t)) : [a, fa(t)] : fa(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== W ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && ga(e.ssContent),
		ssFallback: e.ssFallback && ga(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && ar(u, c.clone(u)), u;
}
function J(e = " ", t = 0) {
	return pa($i, null, e, t);
}
function _a(e, t) {
	let n = pa(ta, null, e);
	return n.staticCount = t, n;
}
function Y(e = "", t = !1) {
	return t ? (G(), ca(ea, null, e)) : pa(ea, null, e);
}
function va(e) {
	return e == null || typeof e == "boolean" ? pa(ea) : d(e) ? pa(W, null, e.slice()) : la(e) ? ya(e) : pa($i, null, String(e));
}
function ya(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : ga(e);
}
function ba(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), ba(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !wi(t) ? t._ctx = kn : r === 3 && kn && (kn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ba(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: kn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [J(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function xa(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = F([t.class, r.class]));
		else if (e === "style") t.style = N([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Sa(e, t, n, r = null) {
	cn(e, t, 7, [n, r]);
}
var Ca = ii(), wa = 0;
function Ta() {
	return wa;
}
function Ea(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || Ca, o = {
		uid: wa++,
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
		scope: new xe(!0),
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
		propsOptions: Ai(i, a),
		emitsOptions: fi(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ui.bind(null, o), e.ce && e.ce(o), o;
}
var Da = null, Oa = () => Da || kn, ka, Aa;
{
	let e = ae(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	ka = t("__VUE_INSTANCE_SETTERS__", (e) => Da = e), Aa = t("__VUE_SSR_SETTERS__", (e) => Pa = e);
}
var ja = (e) => {
	let t = Da;
	return ka(e), e.scope.on(), () => {
		e.scope.off(), ka(t);
	};
}, Ma = () => {
	Da && Da.scope.off(), ka(null);
};
function Na(e) {
	return e.vnode.shapeFlag & 4;
}
var Pa = !1;
function Fa(e, t = !1, n = !1) {
	t && Aa(t);
	let { props: r, children: i } = e.vnode, a = Na(e);
	Ti(e, r, a, t), Ri(e, i, n || t);
	let o = a ? Ia(e, t) : void 0;
	return t && Aa(!1), o;
}
function Ia(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Br);
	let { setup: r } = n;
	if (r) {
		Be();
		let n = e.setupContext = r.length > 1 ? Ba(e) : null, i = ja(e), a = sn(r, e, 0, [e.props, n]), o = y(a);
		if (Ve(), i(), (o || e.sp) && !mr(e) && lr(e), o) {
			if (a.then(Ma, Ma), t) return a.then((n) => {
				Aa(!0);
				try {
					La(e, n, t);
				} finally {
					Aa(!1);
				}
			}).catch((t) => {
				ln(t, e, 0);
			});
			e.asyncDep = a;
		} else La(e, a, t);
	} else Ra(e, t);
}
function La(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Yt(t)), Ra(e, n);
}
function Ra(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = ja(e);
		Be();
		try {
			Wr(e);
		} finally {
			Ve(), t();
		}
	}
}
var za = { get(e, t) {
	return Ze(e, "get", ""), e[t];
} };
function Ba(e) {
	return {
		attrs: new Proxy(e.attrs, za),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Va(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Yt(Vt(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Rr) return Rr[n](e);
		},
		has(e, t) {
			return t in e || t in Rr;
		}
	}) : e.proxy;
}
function Ha(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ua(e) {
	return h(e) && "__vccOpts" in e;
}
var X = (e, t) => /* @__PURE__ */ $t(e, t, Pa), Wa = "3.5.44", Ga = void 0, Ka = typeof window < "u" && window.trustedTypes;
if (Ka) try {
	Ga = /* @__PURE__ */ Ka.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var qa = Ga ? (e) => Ga.createHTML(e) : (e) => e, Ja = "http://www.w3.org/2000/svg", Ya = "http://www.w3.org/1998/Math/MathML", Xa = typeof document < "u" ? document : null, Za = Xa && /* @__PURE__ */ Xa.createElement("template"), Qa = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Xa.createElementNS(Ja, e) : t === "mathml" ? Xa.createElementNS(Ya, e) : n ? Xa.createElement(e, { is: n }) : Xa.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Xa.createTextNode(e),
	createComment: (e) => Xa.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Xa.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Za.innerHTML = qa(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Za.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, $a = /* @__PURE__ */ Symbol("_vtc");
function eo(e, t, n) {
	let r = e[$a];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var to = /* @__PURE__ */ Symbol("_vod"), no = /* @__PURE__ */ Symbol("_vsh"), ro = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[to] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : io(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), io(e, !0), r.enter(e)) : r.leave(e, () => {
			io(e, !1);
		}) : io(e, t));
	},
	beforeUnmount(e, { value: t }) {
		io(e, t);
	}
};
function io(e, t) {
	e.style.display = t ? e[to] : "none", e[no] = !t;
}
var ao = /* @__PURE__ */ Symbol(""), oo = /(?:^|;)\s*display\s*:/;
function so(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? lo(r, t, "");
			}
			else for (let e in t) n[e] ?? lo(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? lo(r, i, "") : mo(e, i, !g(t) && t ? t[i] : void 0, o) || lo(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[ao];
			e && (n += ";" + e), r.cssText = n, a = oo.test(n);
		}
	} else t && e.removeAttribute("style");
	to in e && ((!i || t !== n) && (e[to] = a ? r.display : ""), e[no] && (r.display = "none"));
}
var co = /\s*!important$/;
function lo(e, t, n) {
	if (d(n)) n.forEach((n) => lo(e, t, n));
	else if (n ??= "", t.startsWith("--")) co.test(n) ? e.setProperty(t, n.replace(co, ""), "important") : e.setProperty(t, n);
	else {
		let r = po(e, t);
		co.test(n) ? e.setProperty(A(r), n.replace(co, ""), "important") : e[r] = n;
	}
}
var uo = [
	"Webkit",
	"Moz",
	"ms"
], fo = {};
function po(e, t) {
	let n = fo[t];
	if (n) return n;
	let r = O(t);
	if (r !== "filter" && r in e) return fo[t] = r;
	r = ee(r);
	for (let n = 0; n < uo.length; n++) {
		let i = uo[n] + r;
		if (i in e) return fo[t] = i;
	}
	return t;
}
function mo(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var ho = "http://www.w3.org/1999/xlink";
function go(e, t, n, r, i, a = le(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ho, t.slice(6, t.length)) : e.setAttributeNS(ho, t, n) : n == null || a && !ue(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function _o(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? qa(n) : n);
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
		r === "boolean" ? n = ue(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function vo(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function yo(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var bo = /* @__PURE__ */ Symbol("_vei");
function xo(e, t, n, r, i = null) {
	let a = e[bo] || (e[bo] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = wo(t);
		r ? vo(e, n, a[t] = Oo(r, i), s) : o && (yo(e, n, o, s), a[t] = void 0);
	}
}
var So = /(Once|Passive|Capture)$/, Co = /^on:?(?:Once|Passive|Capture)$/;
function wo(e) {
	let t, n;
	for (; (n = e.match(So)) && !Co.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : A(e.slice(2)), t];
}
var To = 0, Eo = /* @__PURE__ */ Promise.resolve(), Do = () => To ||= (Eo.then(() => To = 0), Date.now());
function Oo(e, t) {
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
				e && cn(e, t, 5, a);
			}
		} else cn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = Do(), n;
}
var ko = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ao = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? eo(e, r, c) : t === "style" ? so(e, n, r) : a(t) ? o(t) || xo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : jo(e, t, r, c)) ? (_o(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && go(e, t, r, c, s, t !== "value")) : e._isVueCE && (Mo(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? _o(e, O(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), go(e, t, r, c));
};
function jo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && ko(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return ko(t) && g(n) ? !1 : t in e;
}
function Mo(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = O(t);
	return Array.isArray(n) ? n.some((e) => O(e) === r) : Object.keys(n).some((e) => O(e) === r);
}
var No = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => ne(t, e) : t;
};
function Po(e) {
	e.target.composing = !0;
}
function Fo(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var Io = /* @__PURE__ */ Symbol("_assign"), Lo = /* @__PURE__ */ Symbol("_initialValue");
function Ro(e, t, n) {
	return t && (e = e.trim()), n && (e = re(e)), e;
}
var zo = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Lo] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Lo] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[Io] = No(i);
		let a = r || i.props && i.props.type === "number";
		vo(e, t ? "change" : "input", (t) => {
			t.target.composing || e[Io](Ro(e.value, n, a));
		}), (n || a) && vo(e, "change", () => {
			e.value = Ro(e.value, n, a);
		}), t || (vo(e, "compositionstart", Po), vo(e, "compositionend", Fo), vo(e, "change", Fo));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Lo];
		delete e[Lo], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[Io](Ro(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[Io] = No(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? re(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Bo = {
	deep: !0,
	created(e, t, n) {
		e[Io] = No(n), vo(e, "change", () => {
			let t = e._modelValue, n = Go(e), r = e.checked, i = e[Io];
			if (d(t)) {
				let e = ge(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Ko(e, r));
		});
	},
	mounted: Vo,
	beforeUpdate(e, t, n) {
		e[Io] = No(n), Vo(e, t, n);
	}
};
function Vo(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = ge(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = he(t, Ko(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Ho = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, vo(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? re(Go(e)) : Go(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[Io](i);
			} finally {
				vn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[Io] = No(r);
	},
	mounted(e, { value: t }) {
		Wo(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[Io] = No(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !Uo(t, n[1], n[0])) && Wo(e, t);
	}
};
function Uo(e, t, n) {
	if (!n || d(e)) return he(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function Wo(e, t) {
	let n = e.multiple, r = d(t);
	if (!n || r || p(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = Go(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : ge(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (he(Go(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function Go(e) {
	return "_value" in e ? e._value : e.value;
}
function Ko(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var qo = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Jo = {
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
	exact: (e, t) => qo.some((n) => e[`${n}Key`] && !t.includes(n))
}, Yo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Jo[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Xo = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Zo = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = A(n.key);
		if (t.some((e) => e === r || Xo[e] === r)) return e(n);
	}));
}, Qo = /* @__PURE__ */ s({ patchProp: Ao }, Qa), $o;
function es() {
	return $o ||= Vi(Qo);
}
var ts = ((...e) => {
	let t = es().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = rs(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, ns(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function ns(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function rs(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/studio/routes.ts
var is = [
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
		id: "online-datasets",
		name: "Downloaded",
		group: "Data"
	},
	{
		id: "artificial",
		name: "Artificial",
		group: "Data"
	},
	{
		id: "manual",
		name: "Manual",
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
	},
	{
		id: "testing",
		name: "Testing",
		group: "Models"
	}
], as = "studio.selectedWordId";
function os() {
	try {
		return localStorage.getItem(as) ?? "";
	} catch {
		return "";
	}
}
function ss() {
	let e = /* @__PURE__ */ z("wakewords"), t = /* @__PURE__ */ z(""), n = /* @__PURE__ */ z("review");
	function r() {
		let [r, i = ""] = location.hash.replace(/^#\/?/, "").split("?");
		e.value = r === "scrape" ? "classify" : r === "negative-datasets" ? "online-datasets" : r === "record" ? "manual" : is.find((e) => e.id === r)?.id ?? "wakewords", t.value = new URLSearchParams(i).get("word") ?? os();
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
			t.value ? localStorage.setItem(as, t.value) : localStorage.removeItem(as);
		} catch {}
		history.replaceState(null, "", i(e.value));
	}
	let o = H(t, a, { flush: "sync" });
	function s(t) {
		e.value = t, location.hash !== i(t) && history.pushState(null, "", i(t));
	}
	function c(e) {
		n.value = e, s("classify");
	}
	return window.addEventListener("hashchange", r), window.addEventListener("popstate", r), Ce(() => {
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
//#region src/studio/errors.ts
var cs = {
	augmentation_missing: "Selected augmentation datasets are missing. Open Downloaded and download the selected augmentation datasets before training.",
	augmentation_busy: "Augmentation datasets are still being prepared. Wait for their downloads to complete before training.",
	negative_datasets_missing: "Selected negative datasets are not installed. Open Downloaded and download them, or deselect them and save, before training.",
	augmentation_invalid: "Augmentation audio is empty, incomplete, or unsafe. Retry the download in Downloaded; inspect private diagnostics if it persists.",
	augmentation_repair_required: "An existing augmentation corpus folder is incomplete or unsafe. Move that corpus folder out of training_datasets, then retry in Downloaded. No existing files were removed.",
	gpu_memory: "Not enough GPU memory. Stop other GPU workloads or reduce the generation batch size, then retry.",
	disk_full: "Not enough disk space. Free space on the data volume before retrying; downloads and training snapshots need extra space.",
	permission_denied: "The server cannot access a required file or directory. Check ownership and permissions on the data volume before retrying.",
	dependency_missing: "A required Python dependency is missing. Inspect private diagnostics and repair the affected environment before retrying.",
	network_failed: "A dataset or model download could not reach its source. Check connectivity and retry.",
	child_command_failed: "A child command failed. Inspect this job’s private diagnostics.log on the server for the traceback.",
	handler_failed: "The operation failed. Inspect this job’s private diagnostics.log on the server for details."
};
function ls(e) {
	return typeof e == "string" && Object.hasOwn(cs, e) ? cs[e] : "";
}
var us = /* @__PURE__ */ new Set(["handler_failed", "child_command_failed"]);
function ds(e) {
	if (e.status !== "failed" && e.status !== "interrupted") return "";
	let t = "error_code" in e.result ? e.result.error_code : void 0;
	return typeof t == "string" && us.has(t) ? "" : ls(t);
}
//#endregion
//#region src/studio/api.ts
var fs = "/api/studio", ps = encodeURIComponent;
function ms(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var hs = class extends Error {
	status;
	constructor(e, t) {
		super({
			401: "Kiosk admin credentials required.",
			403: "Kiosk admin credentials required.",
			404: "Studio record no longer available.",
			409: "Studio record conflict. Refresh and try again.",
			422: "Invalid studio request. Check the supplied values.",
			502: "Kiosk rejected the request.",
			503: "Kiosk unavailable."
		}[e] ?? "Studio request failed. Try again."), this.status = e, this.message = ls(t) || this.message;
	}
};
async function gs(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${fs}${e}`, {
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
	if (!i.ok) {
		let e;
		try {
			e = (await i.json())?.code;
		} catch {}
		throw new hs(i.status, e);
	}
	if (i.status !== 204) return i.json();
}
function _s(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function vs(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => _s(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var Z = (e) => `/wakewords/${ps(e)}`, ys = (e, t) => `${Z(e)}/samples/${ps(t)}`, Q = (e, t, n) => gs(e + ms(t), "GET", void 0, n), bs = (e, t, n) => gs(e, "POST", t, n), xs = (e, t, n) => gs(e, "PUT", t, n), $ = {
	augmentationDatasets: (e) => Q("/augmentation/datasets", void 0, e),
	wakewordAugmentationDatasets: (e, t) => Q(`${Z(e)}/augmentation/datasets`, void 0, t),
	selectAugmentationDatasets: (e, t, n) => xs(`${Z(e)}/augmentation/datasets`, { dataset_ids: t }, n),
	downloadAugmentation: (e, t) => bs(`/augmentation/datasets/${ps(e)}/download`, void 0, t),
	capabilities: (e) => Q("/capabilities", void 0, e),
	testingManifest: (e, t, n, r) => Q(`${Z(e)}/models/${ps(t)}/archive/${ps(n + ".json")}`, void 0, r),
	testingModelUrl: (e, t, n) => `${fs}${Z(e)}/models/${ps(t)}/archive/${ps(n + ".tflite")}`,
	migration: (e) => Q("/migration", void 0, e),
	importLegacy: (e, t) => bs("/migration/import", e, t),
	wakewords: (e, t) => Q("/wakewords", e, t),
	wakeword: (e, t) => Q(Z(e), void 0, t),
	createWakeword: (e, t) => bs("/wakewords", e, t),
	updateWakeword: (e, t, n) => gs(Z(e), "PATCH", t, n),
	deleteWakeword: (e, t) => gs(Z(e), "DELETE", void 0, t),
	samples: (e, t, n) => Q(`${Z(e)}/samples`, t, n),
	queue: (e, t, n) => Q(`${Z(e)}/queue`, t, n),
	sample: (e, t, n) => Q(ys(e, t), void 0, n),
	unmapped: (e, t) => Q("/recordings/unmapped", e, t),
	assign: (e, t, n) => bs(`/recordings/${ps(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), bs(`${Z(e)}/samples/import`, i, r);
	},
	previewCapture: (e, t, n) => {
		let r = new FormData();
		return r.set("audio", t), bs(`${Z(e)}/samples/capture/preview`, r, n);
	},
	saveCapture: (e, t, n, r, i) => {
		let a = new FormData();
		return a.set("audio", t), a.set("label", n), a.set("start_s", String(r.start_s)), a.set("end_s", String(r.end_s)), a.set("trim_method", r.trim_method), bs(`${Z(e)}/samples/capture`, a, i);
	},
	label: (e, t, n, r, i) => bs(`${ys(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => bs(`${ys(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => bs(`${ys(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => gs(`${ys(e, t)}${ms({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${fs}${ys(e, t)}/audio${ms({ original: n })}`,
	devices: (e) => Q("/devices", void 0, e),
	addDevice: (e, t, n, r) => bs("/devices", {
		url: e,
		password: t,
		role: n
	}, r),
	updateDevice: (e, t, n) => gs(`/devices/${ps(e)}`, "PATCH", { url: t }, n),
	deleteDevice: (e, t) => gs(`/devices/${ps(e)}`, "DELETE", void 0, t),
	refreshDevices: (e, t) => bs(`/devices/${ps(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => bs(`/devices/${ps(e)}/credentials`, { password: t }, n),
	sourceMappings: (e, t) => Q(`/devices/${ps(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => xs(`/devices/${ps(e)}/source-mappings`, t, n),
	scrape: (e, t) => bs("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Q("/scrape/runs", e, t),
	schedules: (e) => Q("/schedules", void 0, e),
	automation: (e, t) => Q(`${Z(e)}/automation`, void 0, t),
	saveAutomation: (e, t, n) => xs(`${Z(e)}/automation`, t, n),
	collect: (e, t, n) => bs(`${Z(e)}/collection/jobs`, { device_ids: t }, n),
	saveSchedule: (e, t, n) => xs(`/schedules/${ps(e)}`, t, n),
	jobs: (e, t) => Q("/jobs", e, t),
	enqueueScrape: (e, t) => bs("/jobs", e, t),
	health: (e) => Q("/jobs/health", void 0, e),
	job: (e, t) => Q(`/jobs/${ps(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Q(`/jobs/${ps(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => bs(`/jobs/${ps(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Q(`${Z(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => xs(`${Z(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => bs(`/datasets/${ps(e)}/download`, void 0, t),
	generationCatalog: (e) => Q("/generation/catalog", void 0, e),
	generationDefaults: (e) => Q("/generation/defaults", void 0, e),
	generationRecipe: (e, t) => Q(`${Z(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => xs(`${Z(e)}/generation/recipe`, t, n),
	generate: (e, t, n) => bs(`${Z(e)}/generation/jobs`, t, n),
	submitGeneration: (e, t, n) => bs(`${Z(e)}/generation/submissions`, t, n),
	generationSources: (e, t, n) => Q(`${Z(e)}/generation/sources`, t, n),
	preview: (e, t, n) => bs(`${Z(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${fs}${Z(e)}/generation/previews/${ps(t)}/audio`,
	batches: (e, t, n) => Q(`${Z(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Q(`${Z(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Q(`${Z(e)}/generation/batches/${ps(t)}`, void 0, n),
	selectBatches: (e, t, n) => xs(`${Z(e)}/generation/batches`, { batch_ids: t }, n),
	deleteBatch: (e, t, n) => gs(`${Z(e)}/generation/batches/${ps(t)}`, "DELETE", void 0, n),
	trainingSettings: (e, t) => Q(`${Z(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => xs(`${Z(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Q(`${Z(e)}/training/counts`, void 0, t),
	train: (e, t) => bs(`${Z(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Q(`${Z(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Q(`${Z(e)}/training/runs/${ps(t)}`, void 0, n),
	models: (e, t, n) => Q(`${Z(e)}/models`, t, n),
	model: (e, t, n) => Q(`${Z(e)}/models/${ps(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${fs}${Z(e)}/models/${ps(t)}/archive${n === void 0 ? "" : `/${ps(n)}`}`,
	deploymentCapabilities: (e) => Q("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Q(`${Z(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Q(`${Z(e)}/deployment/history`, t, n),
	publish: (e, t, n) => bs(`${Z(e)}/deployment/publish`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function Ss(e) {
	let t = /* @__PURE__ */ z([]), n = e.selectedId, r = /* @__PURE__ */ Gt(null), i = /* @__PURE__ */ Gt(null), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(!1), s = /* @__PURE__ */ z(""), c = /* @__PURE__ */ z(""), l = /* @__PURE__ */ z(""), u, d, f = !1, p = "That wakeword is no longer available. Select another workspace.";
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
			e instanceof hs && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
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
	return H(n, () => {
		g();
	}, { flush: "sync" }), Ce(() => {
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
var Cs = Symbol("studio-workspace");
function ws() {
	let e = Fn(Cs);
	if (!e) throw Error("useWorkspace requires StudioShell");
	return e;
}
//#endregion
//#region src/studio/time.ts
function Ts(e) {
	let t = e instanceof Date ? e : new Date(e);
	return Number.isNaN(t.getTime()) ? "" : new Intl.DateTimeFormat(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(t);
}
//#endregion
//#region src/studio/pages/WakewordsPage.vue?vue&type=script&setup=true&lang.ts
var Es = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Ds = ["disabled"], Os = {
	key: 0,
	class: "studio-card"
}, ks = { class: "grid gap-3 sm:grid-cols-2 mb-4" }, As = ["aria-pressed", "onClick"], js = { class: "flex justify-between items-center gap-3" }, Ms = { class: "studio-muted text-xs ml-auto" }, Ns = {
	key: 1,
	role: "status"
}, Ps = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, Fs = {
	key: 3,
	class: "studio-card mb-4"
}, Is = { class: "flex items-start justify-between gap-3" }, Ls = { class: "min-w-0 break-words" }, Rs = ["disabled"], zs = { class: "grid gap-3 sm:grid-cols-3 text-sm" }, Bs = { class: "text-xs" }, Vs = {
	key: 0,
	class: "text-xs"
}, Hs = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, Us = {
	key: 5,
	role: "status",
	class: "studio-note"
}, Ws = { class: "grid gap-4" }, Gs = ["disabled"], Ks = { id: "delete-heading" }, qs = { class: "flex flex-wrap gap-3 mt-3" }, Js = ["disabled"], Ys = ["disabled"], Xs = /* @__PURE__ */ sr({
	__name: "WakewordsPage",
	setup(e) {
		let t = ws(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ Nt({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(""), p = /* @__PURE__ */ z(""), m = /* @__PURE__ */ z(!1), h;
		H(r, () => {
			h?.abort(), d.value = !1, m.value = !1, f.value = "", p.value = "";
		}), Ce(() => {
			h?.abort();
		});
		async function g() {
			if (!m.value || d.value || !r.value) return;
			let e = r.value, n = new AbortController();
			h = n, d.value = !0, f.value = "", p.value = "";
			try {
				if (await $.deleteWakeword(e, n.signal), n.signal.aborted) return;
				t.remove(e);
			} catch (e) {
				n.signal.aborted || (f.value = e instanceof hs && e.status === 409 ? "Cancel queued or active jobs before deleting this workspace, then try again." : e instanceof Error ? e.message : "Unable to delete workspace.");
			} finally {
				h === n && (d.value = !1);
			}
		}
		async function _() {
			if (d.value) return;
			let e = r.value, i = new AbortController();
			h = i, d.value = !0, p.value = "", f.value = "";
			try {
				let a = await $.createWakeword({ ...u }, i.signal);
				if (i.signal.aborted || r.value !== e) return;
				t.wakewords.value = [...n.value, a], u.phrase = "", t.select(a.id), await t.refreshSelected(), i.signal.aborted || (p.value = "Workspace saved.");
			} catch (e) {
				i.signal.aborted || (f.value = e instanceof Error ? e.message : "Unable to save workspace.");
			} finally {
				h === i && (d.value = !1);
			}
		}
		return (e, h) => (G(), K("section", null, [
			q("div", Es, [h[8] ||= q("div", null, [q("h1", null, "Wakewords"), q("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), q("button", {
				"data-action": "refresh",
				disabled: B(c),
				onClick: h[0] ||= (e) => B(t).load()
			}, "Refresh workspaces", 8, Ds)]),
			!B(c) && !B(l) && !B(n).length ? (G(), K("p", Os, "No wakewords yet. Create your first workspace below.")) : Y("", !0),
			q("div", ks, [(G(!0), K(W, null, U(B(n), (e) => (G(), K("button", {
				key: e.id,
				class: F(["studio-card studio-word-card", { "studio-selected": e.id === B(r) }]),
				"aria-pressed": e.id === B(r),
				onClick: (n) => B(t).select(e.id)
			}, [q("span", js, [q("strong", null, I(e.phrase), 1), q("span", Ms, I(e.language), 1)])], 10, As))), 128))]),
			B(o) ? (G(), K("p", Ns, "Loading selected workspace…")) : Y("", !0),
			B(s) ? (G(), K("div", Ps, [J(I(B(s)) + " ", 1), q("button", { onClick: h[1] ||= (e) => B(t).refreshSelected() }, "Retry workspace")])) : Y("", !0),
			B(a) && B(i) ? (G(), K("div", Fs, [q("div", Is, [q("h2", Ls, I(B(i).phrase) + " · Overview", 1), q("button", {
				class: "shrink-0",
				"data-action": "delete-workspace",
				type: "button",
				disabled: d.value,
				onClick: h[2] ||= (e) => m.value = !0
			}, "Delete workspace", 8, Rs)]), q("dl", zs, [
				q("div", null, [h[9] ||= q("dt", { class: "studio-muted" }, "Pending classification", -1), q("dd", null, I(B(a).pending) + " pending", 1)]),
				q("div", null, [
					h[10] ||= q("dt", { class: "studio-muted" }, "Archived models", -1),
					q("dd", null, I(B(a).modelCount) + " versions", 1),
					q("dd", Bs, I(B(a).latestModel ? `Latest: ${B(Ts)(B(a).latestModel.trained_at)}` : "No trained models yet"), 1)
				]),
				q("div", null, [
					h[11] ||= q("dt", { class: "studio-muted" }, "Autotrain", -1),
					q("dd", null, I(B(a).schedule?.enabled ? `${B(a).schedule.cron} · ${B(a).schedule.timezone}` : "Not scheduled"), 1),
					B(a).schedule?.enabled ? (G(), K("dd", Vs, "Next: " + I(B(Ts)(B(a).schedule.next_run_at)), 1)) : Y("", !0)
				])
			])])) : Y("", !0),
			f.value ? (G(), K("p", Hs, I(f.value), 1)) : Y("", !0),
			p.value ? (G(), K("p", Us, I(p.value), 1)) : Y("", !0),
			q("div", Ws, [q("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: h[5] ||= Yo((e) => _(), ["prevent"])
			}, [
				h[14] ||= q("h2", null, "New wakeword", -1),
				q("label", null, [h[12] ||= J("Display phrase", -1), V(q("input", {
					"onUpdate:modelValue": h[3] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[zo, u.phrase]])]),
				q("label", null, [h[13] ||= J("Language", -1), V(q("input", {
					"onUpdate:modelValue": h[4] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[zo, u.language]])]),
				q("button", {
					class: "studio-primary justify-self-start",
					disabled: d.value,
					type: "submit"
				}, "Create wakeword", 8, Gs)
			], 32)]),
			m.value && B(i) ? (G(), K("section", {
				key: 6,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: h[7] ||= Zo((e) => !d.value && (m.value = !1), ["esc"])
			}, [
				q("h2", Ks, "Delete " + I(B(i).phrase) + " permanently?", 1),
				h[15] ||= q("p", { id: "delete-description" }, "This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.", -1),
				h[16] ||= q("p", { class: "studio-muted" }, "Deployed kiosk files and shared datasets are not deleted.", -1),
				q("div", qs, [q("button", {
					"data-action": "cancel-delete",
					type: "button",
					disabled: d.value,
					onClick: h[6] ||= (e) => m.value = !1
				}, "Cancel", 8, Js), q("button", {
					"data-action": "confirm-delete",
					type: "button",
					disabled: d.value,
					onClick: g
				}, I(d.value ? "Deleting…" : "Permanently delete workspace"), 9, Ys)])
			], 32)) : Y("", !0)
		]));
	}
}), Zs = ["aria-busy"], Qs = ["data-ready"], $s = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, ec = ["disabled", "aria-label"], tc = ["disabled"], nc = /* @__PURE__ */ sr({
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
		let r = e, i = n, a = /* @__PURE__ */ z(), o = /* @__PURE__ */ z(), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(!1), u = /* @__PURE__ */ z("Waveform preview will appear when audio is ready."), d, f, p, m = 0, h = [], g = /* @__PURE__ */ new WeakSet();
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
					h = w(i), l.value = !0, u.value = "Waveform preview ready. The orange line shows playback progress.", await vn(), !n.signal.aborted && t === m && f === r && C();
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
		function k() {
			c.value ? O() : D();
		}
		function A() {
			a.value && (a.value.currentTime = 0), D();
		}
		async function ee() {
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
		return H(() => [r.sampleId, r.src], () => {
			ee();
		}, { immediate: !0 }), Er(() => {
			m += 1, d?.abort(), b(), S(), v(), x();
		}), t({
			play: D,
			pause: O,
			toggle: k,
			replay: A,
			stop: S
		}), (t, n) => (G(), K("div", {
			class: "studio-audio",
			"aria-busy": s.value
		}, [
			q("audio", {
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
			q("canvas", {
				ref_key: "canvas",
				ref: o,
				"data-waveform": "",
				"data-ready": l.value,
				role: "img",
				"aria-label": "Audio waveform with playback progress",
				width: "240",
				height: "44"
			}, null, 8, Qs),
			q("p", $s, I(u.value), 1),
			q("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, I(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, ec),
			q("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: A
			}, "Replay", 8, tc)
		], 8, Zs));
	}
}), rc = /* @__PURE__ */ z([]), ic = /* @__PURE__ */ z(!1), ac = /* @__PURE__ */ z(""), oc = !1, sc;
function cc(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function lc() {
	function e(e) {
		let t = rc.value.find((t) => t.id === e);
		return t?.name?.trim() || t?.url || "Unknown kiosk";
	}
	async function t(e = !1) {
		if (oc && !e) return;
		sc?.abort();
		let t = new AbortController();
		sc = t, ic.value = !0, ac.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && sc === t && (rc.value = e, oc = !0);
		} catch (e) {
			!t.signal.aborted && sc === t && (ac.value = cc(e));
		} finally {
			sc === t && (ic.value = !1);
		}
	}
	function n(e) {
		rc.value = rc.value.findIndex((t) => t.id === e.id) < 0 ? [...rc.value, e] : rc.value.map((t) => t.id === e.id ? e : t), oc = !0;
	}
	async function r(e, r, i) {
		let a = await $.addDevice(e, r, i);
		return n(a), await t(!0), a;
	}
	async function i(e) {
		await $.refreshDevices(e), await t(!0);
	}
	async function a(e, t) {
		let r = await $.setCredentials(e, t);
		return n(r), r;
	}
	async function o(e, r) {
		n(await $.updateDevice(e, r)), await t(!0);
	}
	async function s(e) {
		await $.deleteDevice(e), await t(!0);
	}
	function c() {
		sc?.abort();
	}
	return {
		devices: /* @__PURE__ */ Ft(rc),
		loading: /* @__PURE__ */ Ft(ic),
		error: /* @__PURE__ */ Ft(ac),
		deviceLabel: e,
		load: t,
		add: r,
		refresh: i,
		credentials: a,
		update: o,
		remove: s,
		abort: c
	};
}
//#endregion
//#region src/studio/components/PaginatedTable.vue?vue&type=script&setup=true&lang.ts
var uc = {
	key: 0,
	class: "studio-pagination",
	"aria-live": "polite"
}, dc = { class: "flex gap-2" }, fc = ["disabled"], pc = ["disabled"], mc = /* @__PURE__ */ sr({
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
		return (t, n) => e.total > e.limit || e.offset > 0 ? (G(), K("div", uc, [q("span", null, I(i()) + "–" + I(a()) + " of " + I(e.total), 1), q("div", dc, [q("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, fc), q("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, pc)])])) : Y("", !0);
	}
}), hc = { class: "studio-card" }, gc = { class: "flex justify-between gap-3" }, _c = ["disabled"], vc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, yc = {
	key: 1,
	role: "status"
}, bc = {
	key: 2,
	class: "grid gap-3"
}, xc = ["data-run-id"], Sc = { class: "studio-muted text-xs" }, Cc = { key: 0 }, wc = {
	key: 0,
	class: "studio-muted"
}, Tc = /* @__PURE__ */ sr({
	__name: "CollectionHistory",
	props: {
		refreshKey: {},
		activeRunId: {}
	},
	setup(e) {
		let t = lc();
		Cr(() => {
			t.load();
		});
		let n = e, r = /* @__PURE__ */ z([]), i = /* @__PURE__ */ z(""), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(0), s = /* @__PURE__ */ z(0), c;
		async function l() {
			c?.abort();
			let e = new AbortController();
			c = e, a.value = !0, i.value = "";
			try {
				let t = await $.scrapeRuns({
					offset: s.value,
					limit: 25
				}, e.signal);
				if (e.signal.aborted) return;
				r.value = t.items, o.value = t.total;
			} catch (t) {
				e.signal.aborted || (i.value = t instanceof Error ? t.message : "Unable to load history.");
			} finally {
				c === e && (a.value = !1);
			}
		}
		return H([() => n.refreshKey, s], () => {
			l();
		}, { immediate: !0 }), Er(() => c?.abort()), (n, c) => (G(), K("section", hc, [
			q("div", gc, [c[1] ||= q("h2", null, "Collection history · Fleet-wide", -1), q("button", {
				disabled: a.value,
				onClick: l
			}, "Refresh history", 8, _c)]),
			i.value ? (G(), K("p", vc, I(i.value), 1)) : Y("", !0),
			a.value ? (G(), K("p", yc, "Loading collection history…")) : (G(), K("div", bc, [(G(!0), K(W, null, U(r.value, (n) => (G(), K("article", {
				key: n.id,
				"data-run-id": n.id,
				class: F(["studio-history", { "studio-selected": n.id === e.activeRunId }])
			}, [
				q("strong", null, I(n.id), 1),
				J(" · " + I(n.status) + " · " + I(B(Ts)(n.started_at)), 1),
				q("p", Sc, "New " + I(n.new) + " · Unmapped " + I(n.unmapped) + " · Failed " + I(n.failed), 1),
				q("ul", null, [(G(!0), K(W, null, U(n.devices, (e) => (G(), K("li", { key: e.device_id }, [J(I(B(t).deviceLabel(e.device_id)) + " · " + I(e.status) + " · new " + I(e.new) + " · failed " + I(e.failed), 1), e.errors.length ? (G(), K("span", Cc, " · " + I(e.errors.join(", ")), 1)) : Y("", !0)]))), 128))])
			], 10, xc))), 128)), r.value.length ? Y("", !0) : (G(), K("p", wc, "No collection runs yet."))])),
			pa(mc, {
				total: o.value,
				offset: s.value,
				limit: 25,
				loading: a.value,
				onPage: c[0] ||= (e) => s.value = e
			}, null, 8, [
				"total",
				"offset",
				"loading"
			])
		]));
	}
}), Ec = { class: "studio-card" }, Dc = { class: "flex flex-wrap items-center justify-between gap-3" }, Oc = ["disabled"], kc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Ac = ["data-unmapped-id"], jc = { class: "studio-muted text-xs" }, Mc = ["disabled", "onClick"], Nc = ["onUpdate:modelValue"], Pc = ["value"], Fc = ["disabled", "onClick"], Ic = {
	key: 1,
	class: "studio-muted"
}, Lc = /* @__PURE__ */ sr({
	__name: "SourceInbox",
	props: {
		recordings: {},
		busy: { type: Boolean },
		refreshing: { type: Boolean }
	},
	emits: [
		"assign",
		"changed",
		"refresh"
	],
	setup(e, { emit: t }) {
		let n = lc();
		Cr(() => {
			n.load();
		});
		let r = t, i = ws(), a = /* @__PURE__ */ z({}), o = /* @__PURE__ */ z(""), s = /* @__PURE__ */ z(""), c;
		H(i.selectedId, () => {
			c?.abort(), o.value = "", s.value = "", a.value = {};
		});
		async function l(e) {
			let t = a.value[e.id];
			if (!t || o.value) return;
			let n = new AbortController();
			c = n, o.value = e.id, s.value = "";
			try {
				await $.setSourceMapping(e.device_id, {
					engine: e.engine,
					source_phrase: e.phrase,
					word_id: t
				}, n.signal), n.signal.aborted || r("changed");
			} catch (e) {
				n.signal.aborted || (s.value = e instanceof Error ? e.message : "Source mapping was not saved.");
			} finally {
				c === n && (o.value = "");
			}
		}
		return Er(() => c?.abort()), (t, c) => (G(), K("section", Ec, [
			q("div", Dc, [c[1] ||= q("h2", null, "Unmapped recordings · Fleet-wide", -1), q("button", {
				"data-action": "refresh-unmapped",
				disabled: e.refreshing || e.busy,
				onClick: c[0] ||= (e) => r("refresh")
			}, I(e.refreshing ? "Refreshing…" : "Refresh inbox"), 9, Oc)]),
			c[4] ||= q("p", { class: "studio-muted" }, "Collection automatically matches unique wake phrases and model identifiers. Unknown or ambiguous matches stay here, never assigned just because a workspace is selected. Assign a recording now, or save an exact kiosk + engine + source-phrase mapping to override future matching.", -1),
			s.value ? (G(), K("p", kc, I(s.value), 1)) : Y("", !0),
			(G(!0), K(W, null, U(e.recordings, (t) => (G(), K("article", {
				key: t.id,
				"data-unmapped-id": t.id,
				class: "studio-mapping-row"
			}, [q("div", null, [
				q("strong", null, I(t.phrase), 1),
				q("p", jc, I(B(n).deviceLabel(t.device_id)) + " · " + I(t.engine), 1),
				q("button", {
					"data-action": "assign",
					disabled: e.busy || !B(i).selectedId.value,
					onClick: (e) => r("assign", t)
				}, "Assign to this wakeword", 8, Mc)
			]), q("div", null, [q("label", null, [c[3] ||= J("Source phrase → wakeword", -1), V(q("select", {
				"onUpdate:modelValue": (e) => a.value[t.id] = e,
				name: "mapping-word"
			}, [c[2] ||= q("option", { value: "" }, "Choose wakeword", -1), (G(!0), K(W, null, U(B(i).wakewords.value, (e) => (G(), K("option", {
				key: e.id,
				value: e.id
			}, I(e.phrase), 9, Pc))), 128))], 8, Nc), [[Ho, a.value[t.id]]])]), q("button", {
				class: "mt-2",
				"data-action": "save-mapping",
				disabled: !a.value[t.id] || !!o.value,
				onClick: (e) => l(t)
			}, "Save source mapping", 8, Fc)])], 8, Ac))), 128)),
			!e.recordings.length && !e.refreshing ? (G(), K("p", Ic, "No unmapped recordings.")) : Y("", !0)
		]));
	}
}), Rc = (e) => [
	"queued",
	"running",
	"cancelling"
].includes(e.status), zc = Symbol("studio-job-queue");
function Bc() {
	let e = /* @__PURE__ */ z({}), t = /* @__PURE__ */ z([]), n = /* @__PURE__ */ z(0), r = /* @__PURE__ */ z(!1), i = /* @__PURE__ */ z(""), a = /* @__PURE__ */ z(""), o = /* @__PURE__ */ z(!1), s = /* @__PURE__ */ z({}), c = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), l = X(() => Object.values(e.value).filter(Rc).sort((e, t) => e.created_at.localeCompare(t.created_at))), u = X(() => l.value.length), d = X(() => t.value.map((t) => e.value[t]).filter((e) => !!e && !Rc(e))), f = X(() => t.value.length < n.value), p = !1, m, h = !1, g = 0, _, v, y = 50, b = 0, x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Set();
	function w(t) {
		e.value[t.id] && !Rc(e.value[t.id]) && Rc(t) || (e.value = {
			...e.value,
			[t.id]: t
		}, x.set(t.id, ++b));
	}
	function T(t, n) {
		e.value[t.id] && !Rc(e.value[t.id]) && Rc(t) || (x.get(t.id) ?? 0) <= n && (e.value[t.id] = t);
	}
	async function E(e, t, n = Infinity) {
		let r = [], i = 0;
		do {
			let a = await $.jobs({
				state: e,
				offset: r.length,
				limit: Math.min(100, n - r.length)
			}, t.signal);
			if (t.signal.aborted || (i = a.total, r.push(...a.items), !a.items.length)) break;
		} while (r.length < i && r.length < n);
		return {
			items: r,
			total: i,
			offset: 0,
			limit: r.length
		};
	}
	async function D() {
		let i = new AbortController();
		_ = i;
		let s = b;
		o.value = !0;
		try {
			let o = await E("active", i);
			if (i.signal.aborted) return;
			let c = new Set(o.items.map((e) => e.id)), u = l.value.filter((e) => !c.has(e.id) && (x.get(e.id) ?? 0) <= s), d = await Promise.all(u.map((e) => $.job(e.id, i.signal).catch((e) => {
				if (e instanceof Error && "status" in e && e.status === 404) return null;
				throw e;
			}))), f = r.value ? await E("history", i, y) : null;
			if (i.signal.aborted) return;
			o.items.forEach((e) => T(e, s)), d.forEach((t, n) => {
				t ? T(t, s) : (x.get(u[n].id) ?? 0) <= s && delete e.value[u[n].id];
			}), f && (f.items.forEach((e) => T(e, s)), t.value = [...new Set(f.items.map((e) => e.id))], n.value = f.total), a.value = "";
		} catch (e) {
			i.signal.aborted || (a.value = e instanceof Error ? e.message : "Unable to load job queue.");
		} finally {
			_ === i && (_ = void 0, o.value = !1);
		}
	}
	function O() {
		m && clearTimeout(m), p && (m = setTimeout(() => {
			m = void 0, k();
		}, 2e3));
	}
	function k() {
		if (h) return Promise.resolve();
		if (v) return v;
		m && clearTimeout(m), m = void 0;
		let e = D().finally(() => {
			v === e && (v = void 0, O());
		});
		return v = e, e;
	}
	function A() {
		p || (h = !1, p = !0, k());
	}
	function ee() {
		h = !0, g += 1, p = !1, m && clearTimeout(m), m = void 0, _?.abort(), S.forEach((e) => e.abort()), S.clear(), C.forEach((e) => e.abort()), C.clear();
	}
	async function te(t) {
		if (h) return;
		let n = new AbortController(), o = g;
		C.add(n);
		let s = () => !n.signal.aborted && g === o && !h;
		i.value = t ?? "", r.value = !0;
		try {
			if (v && await v, !s()) return;
			if (t && !e.value[t]) {
				let e = await $.job(t, n.signal);
				if (!s()) return;
				w(e);
			}
			s() && await k();
		} catch (e) {
			s() && (a.value = e instanceof Error ? e.message : "Unable to load job.");
		} finally {
			C.delete(n);
		}
	}
	async function j() {
		if (h) return;
		let e = g;
		y += 50, v && await v, !h && g === e && await k();
	}
	async function ne(t) {
		if (c.value.has(t) || !e.value[t] || !Rc(e.value[t])) return;
		let n = new AbortController();
		S.set(t, n), c.value = /* @__PURE__ */ new Set([...c.value, t]), delete s.value[t], x.set(t, ++b);
		try {
			let e = await $.cancelJob(t, n.signal);
			n.signal.aborted || w(e);
		} catch (e) {
			n.signal.aborted || (s.value[t] = e instanceof Error ? e.message : "Unable to cancel job.");
		} finally {
			S.delete(t), c.value = new Set([...c.value].filter((e) => e !== t)), n.signal.aborted || await k();
		}
	}
	return {
		jobs: e,
		activeJobs: l,
		history: d,
		activeCount: u,
		historyTotal: n,
		hasMore: f,
		error: a,
		loading: o,
		open: r,
		selectedJobId: i,
		cancelling: c,
		cancelErrors: s,
		start: A,
		stop: ee,
		refresh: k,
		track: w,
		show: te,
		loadMore: j,
		cancel: ne
	};
}
function Vc() {
	let e = Fn(zc, null);
	if (e) return e;
	let t = Bc();
	return Cr(t.start), Er(t.stop), t;
}
//#endregion
//#region src/studio/pages/ClassifyPage.vue?vue&type=script&setup=true&lang.ts
var Hc = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Uc = { class: "flex flex-wrap items-center gap-3" }, Wc = {
	"data-progress": "",
	class: "studio-muted"
}, Gc = ["aria-busy", "disabled"], Kc = {
	class: "studio-tabs",
	role: "tablist",
	"aria-label": "Classification sections"
}, qc = [
	"id",
	"aria-selected",
	"aria-controls",
	"onClick"
], Jc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Yc = ["role"], Xc = ["href"], Zc = {
	id: "classify-panel-review",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-review"
}, Qc = { class: "studio-card studio-toolbar mb-4" }, $c = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, el = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, tl = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, nl = ["data-sample-id"], rl = { class: "flex flex-wrap justify-between gap-3" }, il = { class: "studio-muted text-sm" }, al = { class: "studio-muted" }, ol = {
	key: 0,
	class: "studio-muted text-xs"
}, sl = { class: "flex flex-wrap gap-2" }, cl = ["disabled"], ll = ["disabled"], ul = ["disabled"], dl = ["disabled"], fl = ["disabled"], pl = {
	key: 4,
	class: "studio-card"
}, ml = { key: 0 }, hl = { key: 1 }, gl = {
	key: 2,
	id: "classify-panel-collect",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-collect"
}, _l = { class: "studio-card mb-4" }, vl = ["href"], yl = {
	id: "classify-panel-unmapped",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-unmapped"
}, bl = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, xl = {
	key: 3,
	class: "studio-modal-backdrop"
}, Sl = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, Cl = { class: "flex gap-2" }, wl = ["disabled"], Tl = [], El = /* @__PURE__ */ sr({
	__name: "ClassifyPage",
	setup(e) {
		let t = ws(), n = lc();
		Cr(() => {
			n.load();
		});
		let r = Vc(), { classifyTab: i } = t.routes, a = /* @__PURE__ */ z(null), o = /* @__PURE__ */ z(!1), s = /* @__PURE__ */ z(""), c = X(() => o.value || r.activeJobs.value.some((e) => e.kind === "scrape" && e.word_id === t.selectedId.value)), l = X(() => {
			let e = a.value;
			return e?.kind === "scrape" && e.status === "complete" && "status" in e.result ? e.result : null;
		}), u = X(() => !!(l.value && (l.value.status !== "complete" || (l.value.failed ?? 0) > 0 || (l.value.evicted ?? 0) > 0))), d = X(() => "#/classify?" + new URLSearchParams({
			word: t.selectedId.value,
			tab: "collect"
		})), f;
		async function p() {
			if (!t.selectedId.value || c.value) return;
			let e = t.selectedId.value, n = new AbortController();
			f = n, o.value = !0, s.value = "";
			try {
				let i = await $.collect(e, void 0, n.signal);
				!n.signal.aborted && t.selectedId.value === e && (a.value = i, r.track(i));
			} catch (e) {
				n.signal.aborted || (s.value = e instanceof Error ? e.message : "Collection was not started.");
			} finally {
				f === n && (o.value = !1);
			}
		}
		async function m(e) {
			let r = a.value;
			if (!r || e.id !== r.id || e.word_id !== t.selectedId.value || (a.value = e, e.status !== "complete" || r.status === "complete")) return;
			n.load(!0), x();
			let i = t.selectedId.value, o = T.value, c = new AbortController();
			f?.abort(), f = c;
			try {
				let e = await $.queue(i, pe(), c.signal);
				if (c.signal.aborted || i !== t.selectedId.value || D.value || T.value !== o) return;
				let n = new Set(g.value.map((e) => e.id));
				g.value.push(...e.items.filter((e) => !n.has(e.id))), w.value = e.total;
			} catch (e) {
				c.signal.aborted || (s.value = e instanceof Error ? e.message : "Collection completed; refresh the queue to see new recordings.");
			}
		}
		H(r.jobs, (e) => {
			let t = a.value && e[a.value.id];
			t && m(t);
		}, { deep: !0 });
		let h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ z([]), _ = /* @__PURE__ */ z([]), v = /* @__PURE__ */ z(!1), y = /* @__PURE__ */ z(""), b;
		async function x() {
			b?.abort();
			let e = new AbortController();
			b = e;
			let n = t.selectedId.value;
			v.value = !0, y.value = "";
			try {
				let r = await $.unmapped({ limit: 50 }, e.signal);
				!e.signal.aborted && b === e && t.selectedId.value === n && (_.value = r.items);
			} catch (r) {
				!e.signal.aborted && t.selectedId.value === n && (y.value = r instanceof Error ? r.message : "Unable to refresh the inbox.");
			} finally {
				b === e && (v.value = !1);
			}
		}
		let S = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), C = /* @__PURE__ */ z(0), w = /* @__PURE__ */ z(0), T = /* @__PURE__ */ z(0), E = /* @__PURE__ */ z(!1), D = /* @__PURE__ */ z(!1), O = /* @__PURE__ */ z(""), k = /* @__PURE__ */ z(""), A = /* @__PURE__ */ z(!1), ee = /* @__PURE__ */ z(!1), te = /* @__PURE__ */ z(null), j = /* @__PURE__ */ z(!1), ne = /* @__PURE__ */ z(""), M = /* @__PURE__ */ z(), re, ie, ae = 0, N, oe = 0, se = 0, ce = X(() => g.value.filter((e) => !S.value.has(e.id))), P = X(() => ce.value[C.value] ?? null), le = X(() => P.value ? $.audioUrl(P.value.word_id, P.value.id) : null), ue = X(() => T.value);
		function de() {
			M.value?.stop(), g.value = [], _.value = [], S.value = new Set(h.get(t.selectedId.value) ?? []), C.value = 0, w.value = 0, T.value = 0, ee.value = !1, j.value = !1, O.value = "", k.value = "";
		}
		function fe() {
			oe += 1, N && (N.abort(), N = void 0, D.value = !1);
		}
		function pe() {
			return {
				limit: 100,
				...ne.value ? { near_miss: ne.value === "true" } : {}
			};
		}
		async function me(e, n) {
			let r = 0;
			for (;;) {
				let i = await $.queue(e, {
					...pe(),
					offset: r
				}, n.signal);
				if (n.signal.aborted || t.selectedId.value !== e) return i;
				let a = i.items.filter((e) => !S.value.has(e.id));
				if (r += i.items.length, a.length || !i.items.length || r >= i.total) return {
					...i,
					items: a
				};
			}
		}
		async function he() {
			if (ce.value.length || E.value) return;
			re?.abort();
			let e = new AbortController();
			re = e;
			let n = ++se, r = t.selectedId.value;
			if (r) {
				E.value = !0;
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					g.value = [...new Map(i.items.map((e) => [e.id, e])).values()], w.value = i.total, C.value = 0;
				} catch {
					!e.signal.aborted && n === se && (O.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === se && (E.value = !1);
				}
			}
		}
		async function ge() {
			ie?.abort(), ae++, D.value = !1, fe(), re?.abort();
			let e = new AbortController();
			re = e;
			let n = ++se, r = t.selectedId.value;
			if (de(), b?.abort(), y.value = "", v.value = !1, r) {
				E.value = !0, x();
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					g.value = i.items, w.value = i.total;
				} catch (t) {
					!e.signal.aborted && n === se && (O.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === se && (E.value = !1);
				}
			}
		}
		function _e() {
			let e = P.value;
			e && (g.value = g.value.filter((t) => t.id !== e.id), w.value = Math.max(0, w.value - 1), C.value = Math.min(C.value, Math.max(0, ce.value.length - 1)), M.value?.stop(), ee.value = A.value, he());
		}
		async function ve(e, n, r) {
			let i = () => !n.signal.aborted && r === ae && t.selectedId.value === e.word_id && P.value?.id === e.id;
			if (i()) try {
				let t = await $.sample(e.word_id, e.id, n.signal);
				if (!i()) return;
				if (t.label !== "pending") {
					_e();
					return;
				}
				g.value = g.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function ye(e) {
			let n = P.value;
			if (!n || D.value || j.value) return;
			A.value = !0, D.value = !0, O.value = "";
			let r = new AbortController();
			ie?.abort(), ie = r;
			let i = ++ae, a = () => !r.signal.aborted && i === ae && t.selectedId.value === n.word_id;
			try {
				let t = await $.label(n.word_id, n.id, e, n.revision, r.signal);
				if (!a() || P.value?.id !== n.id) return;
				Tl.push({
					word: n.word_id,
					sample: t
				}), T.value += 1, k.value = `Saved ${e} label.`, _e();
			} catch (e) {
				a() && (e instanceof Error && e.message.includes("conflict") ? (O.value = "This recording changed elsewhere. Review the latest version before saving.", await ve(n, r, i)) : O.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				a() && (D.value = !1);
			}
		}
		function be() {
			let e = P.value;
			!e || D.value || E.value || (A.value = !0, S.value = /* @__PURE__ */ new Set([...S.value, e.id]), h.set(e.word_id, S.value), C.value = Math.min(C.value, Math.max(0, ce.value.length - 1)), M.value?.stop(), ee.value = !1, k.value = "Skipped for this session; this recording remains pending.", he());
		}
		async function xe() {
			if (D.value || !Tl.length) return;
			A.value = !0, D.value = !0, O.value = "";
			let e = Tl[Tl.length - 1], n = new AbortController();
			ie?.abort(), ie = n;
			let r = ++ae, i = t.selectedId.value, a = () => !n.signal.aborted && r === ae && t.selectedId.value === i;
			try {
				let r = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (!a()) return;
				Tl.pop(), k.value = "Last label restored to pending.", t.selectedId.value === e.word && (g.value = [r, ...g.value.filter((e) => e.id !== r.id)], w.value += 1, T.value = Math.max(0, T.value - 1), C.value = 0, ee.value = !1);
			} catch {
				a() && (O.value = "Undo was not saved. Refresh and try again.");
			} finally {
				a() && (D.value = !1);
			}
		}
		async function Se(e) {
			let n = t.selectedId.value;
			if (D.value || !n) return;
			b?.abort();
			let r = se, i = ++oe, a = new AbortController();
			N?.abort(), N = a, D.value = !0, O.value = "";
			try {
				let o = await $.assign(e.id, n, a.signal);
				if (a.signal.aborted || N !== a || i !== oe || r !== se || t.selectedId.value !== n) return;
				_.value = _.value.filter((t) => t.id !== e.id), g.value = [...g.value.filter((e) => e.id !== o.id), o], w.value += 1, k.value = "Recording assigned to this workspace and added to the pending queue.", x();
			} catch {
				!a.signal.aborted && N === a && i === oe && t.selectedId.value === n && (O.value = "Recording could not be assigned.");
			} finally {
				N === a && (N = void 0, D.value = !1);
			}
		}
		function Ce(e) {
			let t = e.target instanceof HTMLElement ? e.target : document.activeElement;
			return t instanceof HTMLElement && (t.isContentEditable || [
				"INPUT",
				"TEXTAREA",
				"SELECT",
				"BUTTON"
			].includes(t.tagName));
		}
		function L(e) {
			if (r.open.value || i.value !== "review" || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || Ce(e)) return;
			let t = e.key.toLowerCase();
			j.value ? e.key === "Escape" && (e.preventDefault(), j.value = !1) : t === "d" ? (e.preventDefault(), P.value && !D.value && (j.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), A.value = !0, t === "p" ? ye("positive") : t === "n" ? ye("negative") : t === " " ? M.value?.toggle() : t === "r" ? M.value?.replay() : t === "s" ? be() : xe());
		}
		return H(t.selectedId, () => {
			f?.abort(), a.value = null, o.value = !1, s.value = "", ge();
		}, { immediate: !0 }), H(ne, () => {
			ge();
		}), H(() => P.value?.id, () => {
			te.value = null;
		}, { flush: "sync" }), Cr(() => document.addEventListener("keydown", L)), H(i, () => {
			M.value?.stop();
		}), Er(() => {
			document.removeEventListener("keydown", L), b?.abort(), f?.abort(), re?.abort(), ie?.abort(), fe(), M.value?.stop();
		}), (e, r) => (G(), K("section", null, [
			q("div", Hc, [r[11] ||= q("div", null, [q("h1", null, "Classify"), q("p", { class: "studio-muted" }, "Collect recordings, resolve source mappings, and review labels.")], -1), q("div", Uc, [q("span", Wc, I(w.value) + " pending · " + I(ue.value) + " reviewed · " + I(S.value.size) + " skipped", 1), q("button", {
				"data-action": "collect-now",
				class: "studio-primary",
				"aria-busy": c.value,
				disabled: !B(t).selectedId.value || c.value,
				onClick: p
			}, I(o.value ? "Starting…" : c.value ? "Collecting…" : "Collect"), 9, Gc)])]),
			q("div", Kc, [(G(), K(W, null, U([
				"review",
				"collect",
				"unmapped"
			], (e) => q("button", {
				id: `classify-tab-${e}`,
				key: e,
				role: "tab",
				"aria-selected": B(i) === e,
				"aria-controls": `classify-panel-${e}`,
				class: F({ active: B(i) === e }),
				onClick: (n) => B(t).routes.selectClassifyTab(e)
			}, I(e === "review" ? "Review" : e === "collect" ? "Collect" : "Unmapped"), 11, qc)), 64))]),
			s.value ? (G(), K("p", Jc, I(s.value), 1)) : Y("", !0),
			l.value ? (G(), K("p", {
				key: 1,
				"data-collection-outcome": "",
				class: F(["studio-note", { "studio-collection-warning": u.value }]),
				role: u.value ? "alert" : "status"
			}, [
				q("strong", null, I(u.value ? "Collection needs attention" : "Collection finished"), 1),
				J(" · " + I(l.value.status) + " · " + I(l.value.new ?? 0) + " imported · " + I(l.value.failed ?? 0) + " failed · " + I(l.value.unmapped ?? 0) + " unmapped · " + I(l.value.evicted ?? 0) + " evicted. ", 1),
				q("a", {
					href: d.value,
					onClick: r[0] ||= Yo((e) => B(t).routes.selectClassifyTab("collect"), ["prevent"])
				}, "View collection run →", 8, Xc)
			], 10, Yc)) : Y("", !0),
			V(q("div", Zc, [
				q("div", Qc, [q("label", null, [r[13] ||= J("Recording type", -1), V(q("select", {
					name: "kind",
					"onUpdate:modelValue": r[1] ||= (e) => ne.value = e
				}, [...r[12] ||= [
					q("option", { value: "" }, "All pending", -1),
					q("option", { value: "true" }, "Near misses", -1),
					q("option", { value: "false" }, "Activations", -1)
				]], 512), [[Ho, ne.value]])])]),
				k.value ? (G(), K("p", $c, I(k.value), 1)) : Y("", !0),
				O.value ? (G(), K("p", el, I(O.value), 1)) : Y("", !0),
				E.value ? (G(), K("div", tl, "Loading review queue…")) : P.value ? (G(), K("div", {
					key: 3,
					"data-classify-current": "",
					"data-sample-id": P.value.id,
					class: "studio-card grid gap-4"
				}, [
					q("div", rl, [q("div", null, [q("h2", null, "Recording " + I(P.value.recording?.clip_id ?? P.value.id), 1), q("p", il, I(P.value.recording ? B(n).deviceLabel(P.value.recording.device_id) : P.value.source) + " · " + I(P.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + I(B(Ts)(P.value.recording?.timestamp ?? P.value.created_at)), 1)]), q("span", al, "Revision " + I(P.value.revision), 1)]),
					pa(nc, {
						ref_key: "player",
						ref: M,
						"sample-id": P.value.id,
						src: le.value,
						"autoplay-requested": ee.value,
						onReady: r[2] ||= (e) => {
							ee.value = !1, te.value = P.value.id;
						},
						onPlaybackError: r[3] ||= (e) => O.value = e
					}, null, 8, [
						"sample-id",
						"src",
						"autoplay-requested"
					]),
					te.value === P.value.id ? (G(), K("p", ol, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : Y("", !0),
					q("div", sl, [
						q("button", {
							type: "button",
							class: "studio-primary",
							disabled: D.value,
							onClick: r[4] ||= (e) => ye("positive")
						}, "Positive (P)", 8, cl),
						q("button", {
							type: "button",
							disabled: D.value,
							onClick: r[5] ||= (e) => ye("negative")
						}, "Negative (N)", 8, ll),
						q("button", {
							type: "button",
							disabled: D.value,
							onClick: be
						}, "Skip (S)", 8, ul),
						q("button", {
							type: "button",
							disabled: D.value,
							"data-action": "discard",
							onClick: r[6] ||= (e) => j.value = !0
						}, "Discard (D)", 8, dl),
						q("button", {
							type: "button",
							disabled: D.value || !B(Tl).length,
							onClick: xe
						}, "Undo (Z)", 8, fl)
					]),
					r[14] ||= q("p", {
						"data-shortcuts": "",
						class: "studio-muted text-xs"
					}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
					r[15] ||= q("input", {
						name: "search",
						type: "search",
						"aria-label": "Queue search",
						placeholder: "Shortcuts pause while editing"
					}, null, -1)
				], 8, nl)) : (G(), K("div", pl, [w.value === 0 ? (G(), K("span", ml, "No pending recordings for this workspace.")) : (G(), K("span", hl, "Pending recordings are skipped for this session or the local window needs reloading.")), w.value > 0 ? (G(), K("button", {
					key: 2,
					type: "button",
					onClick: he
				}, "Retry pending window")) : Y("", !0)]))
			], 512), [[ro, B(i) === "review"]]),
			B(i) === "collect" ? (G(), K("div", gl, [q("div", _l, [
				r[16] ||= q("h2", null, "Collect recordings", -1),
				r[17] ||= q("p", { class: "studio-muted" }, "Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.", -1),
				q("a", {
					href: B(t).routes.href("automate"),
					onClick: r[7] ||= Yo((e) => B(t).routes.navigate("automate"), ["prevent"])
				}, "Collection settings →", 8, vl)
			]), pa(Tc, {
				"refresh-key": a.value?.status,
				"active-run-id": l.value?.run_id
			}, null, 8, ["refresh-key", "active-run-id"])])) : Y("", !0),
			V(q("div", yl, [y.value ? (G(), K("p", bl, I(y.value), 1)) : Y("", !0), pa(Lc, {
				recordings: _.value,
				busy: D.value,
				refreshing: v.value,
				onRefresh: x,
				onAssign: Se,
				onChanged: r[8] ||= (e) => k.value = "Source mapping saved for future collections."
			}, null, 8, [
				"recordings",
				"busy",
				"refreshing"
			])], 512), [[ro, B(i) === "unmapped"]]),
			j.value ? (G(), K("div", xl, [q("section", Sl, [
				r[18] ||= q("h2", null, "Discard this recording?", -1),
				r[19] ||= q("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				q("div", Cl, [q("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: D.value,
					onClick: r[9] ||= (e) => {
						j.value = !1, ye("discarded");
					}
				}, "Discard recording", 8, wl), q("button", {
					type: "button",
					onClick: r[10] ||= (e) => j.value = !1
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
}), Dl = { class: "legacy-scope" }, Ol = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, kl = { class: "range-grid" }, Al = ["max"], jl = ["min"], Ml = /* @__PURE__ */ sr({
	__name: "AudioTrimModal",
	props: { studioTarget: {} },
	emits: ["save", "close"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ z(0), a = /* @__PURE__ */ z(1);
		H(() => n.studioTarget, (e) => {
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
		return (t, n) => (G(), ca($n, { to: "body" }, [q("div", Dl, [e.studioTarget ? (G(), K("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Yo(o, ["self"])
		}, [q("section", Ol, [
			q("header", { class: "modal-head" }, [n[2] ||= q("div", null, [q("span", { class: "eyebrow" }, "Studio audio editor"), q("h2", null, "Trim sample")], -1), q("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[5] ||= q("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			q("div", kl, [q("label", null, [n[3] ||= q("span", null, "Start seconds", -1), V(q("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Al), [[
				zo,
				i.value,
				void 0,
				{ number: !0 }
			]])]), q("label", null, [n[4] ||= q("span", null, "End seconds", -1), V(q("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, jl), [[
				zo,
				a.value,
				void 0,
				{ number: !0 }
			]])])]),
			q("div", { class: "row modal-actions" }, [q("button", {
				type: "button",
				class: "button primary",
				onClick: s
			}, "Save trim"), q("button", {
				type: "button",
				onClick: o
			}, "Cancel")])
		])])) : Y("", !0)])]));
	}
}), Nl = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Pl = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Fl = { class: "studio-card mb-4" }, Il = {
	"data-sample-filters": "",
	class: "grid gap-3 sm:grid-cols-3 lg:grid-cols-5"
}, Ll = ["aria-busy"], Rl = { key: 0 }, zl = {
	key: 1,
	class: "w-full text-sm"
}, Bl = ["data-row-id"], Vl = {
	key: 0,
	class: "block studio-muted"
}, Hl = {
	key: 0,
	class: "block studio-muted"
}, Ul = { class: "flex flex-wrap gap-1" }, Wl = [
	"disabled",
	"aria-pressed",
	"aria-label",
	"onClick"
], Gl = ["value", "onChange"], Kl = {
	key: 0,
	value: "pending",
	disabled: ""
}, ql = ["onClick"], Jl = ["onClick"], Yl = { key: 0 }, Xl = {
	key: 2,
	class: "studio-modal-backdrop"
}, Zl = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, Ql = /* @__PURE__ */ sr({
	__name: "SamplesPage",
	setup(e) {
		let t = ws(), n = lc();
		Cr(() => {
			n.load();
		});
		let r = /* @__PURE__ */ z([]), i = /* @__PURE__ */ z(0), a = /* @__PURE__ */ z(0), o = /* @__PURE__ */ z(25), s = /* @__PURE__ */ z(!1), c = /* @__PURE__ */ z(""), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: ""
		}), d = /* @__PURE__ */ z(null), f = /* @__PURE__ */ z(null), p = /* @__PURE__ */ z(), m = /* @__PURE__ */ z(null), h = /* @__PURE__ */ z(null), g, _, v, y, b = 0, x = X(() => ({
			offset: a.value,
			limit: Math.min(100, o.value),
			...u.value.label ? { label: u.value.label } : {},
			...u.value.source ? { source: u.value.source } : {},
			...u.value.kind ? { near_miss: u.value.kind === "true" } : {},
			...u.value.after ? { after: `${u.value.after}T00:00:00+00:00` } : {},
			...u.value.before ? { before: `${u.value.before}T23:59:59+00:00` } : {}
		}));
		function S() {
			v?.abort(), v = void 0;
			let e = p.value;
			e && (e.pause(), e.removeAttribute("src")), y && URL.revokeObjectURL(y), y = void 0, m.value = null, h.value = null;
		}
		async function C(e) {
			if (m.value === e.id) {
				S();
				return;
			}
			S();
			let t = new AbortController();
			v = t, h.value = e.id;
			try {
				let n = await fetch($.audioUrl(e.word_id, e.id), {
					credentials: "same-origin",
					signal: t.signal
				});
				if (!n.ok) throw Error("Audio could not be loaded.");
				let r = await n.blob();
				if (t.signal.aborted || !p.value) return;
				y = URL.createObjectURL(r), p.value.src = y, m.value = e.id, await p.value.play();
			} catch (e) {
				t.signal.aborted || (S(), c.value = e instanceof DOMException ? "Playback was blocked or unavailable. Use Play to try again." : e instanceof Error ? e.message : "Audio could not be loaded.");
			} finally {
				v === t && (h.value = null);
			}
		}
		function w() {
			d.value = null, f.value = null, S(), c.value = "";
		}
		async function T() {
			g?.abort();
			let e = new AbortController();
			g = e;
			let n = ++b, l = t.selectedId.value;
			if (r.value = [], i.value = 0, w(), l) {
				s.value = !0;
				try {
					let s = await $.samples(l, x.value, e.signal);
					!e.signal.aborted && n === b && t.selectedId.value === l && (r.value = Array.isArray(s.items) ? s.items : [], i.value = Number.isFinite(s.total) ? s.total : 0, a.value = Number.isInteger(s.offset) ? s.offset : 0, o.value = Number.isInteger(s.limit) && s.limit >= 1 && s.limit <= 100 ? s.limit : 25);
				} catch (t) {
					!e.signal.aborted && n === b && (c.value = t instanceof Error ? t.message : "Samples could not be loaded.");
				} finally {
					!e.signal.aborted && n === b && (s.value = !1);
				}
			}
		}
		function E(e) {
			r.value = r.value.map((t) => t.id === e.id ? e : t);
		}
		async function D(e) {
			_?.abort();
			let t = new AbortController();
			_ = t, c.value = "";
			try {
				return await e(t.signal);
			} catch (e) {
				return t.signal.aborted || (e instanceof hs && e.status === 409 ? (await T(), c.value = "This sample changed elsewhere. The current page was reloaded.") : c.value = "Sample changes were not saved. Try again."), null;
			}
		}
		async function O(e, t) {
			let n = t.target.value;
			if (n === e.label) return;
			let r = await D((t) => $.label(e.word_id, e.id, n, e.revision, t));
			r && (E(r), l.value = "Label saved.");
		}
		async function k(e) {
			let t = d.value;
			if (!t) return;
			let n = await D((n) => $.trim(t.word_id, t.id, e.start, e.end, t.revision, n));
			n && (E(n), d.value = null, l.value = "Non-destructive trim saved.");
		}
		async function A() {
			let e = f.value;
			e && await D((t) => $.deleteSample(e.word_id, e.id, e.revision, t)) !== null && (r.value = r.value.filter((t) => t.id !== e.id), i.value = Math.max(0, i.value - 1), f.value = null, l.value = "Sample removed from this visible library.");
		}
		function ee() {
			a.value = 0, T();
		}
		function te(e) {
			return e.recording?.near_miss ? "close miss" : "activation";
		}
		function j(e) {
			return e.source === "diagnostic" ? e.recording ? n.deviceLabel(e.recording.device_id) : "Kiosk" : {
				microphone: "Recorded",
				import: "Import",
				legacy: "Legacy"
			}[e.source] ?? e.source;
		}
		return H(t.selectedId, () => {
			a.value = 0, T();
		}, { immediate: !0 }), Er(() => {
			g?.abort(), _?.abort(), S();
		}), (e, t) => (G(), K("section", null, [
			t[25] ||= q("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [q("div", null, [q("h1", null, "Samples"), q("p", { class: "studio-muted" }, "Library of collected, recorded and imported audio with non-destructive trims.")])], -1),
			l.value ? (G(), K("p", Nl, I(l.value), 1)) : Y("", !0),
			c.value ? (G(), K("p", Pl, I(c.value), 1)) : Y("", !0),
			q("div", Fl, [q("div", Il, [
				q("label", null, [t[10] ||= J("Label", -1), V(q("select", {
					name: "label",
					"onUpdate:modelValue": t[0] ||= (e) => u.value.label = e,
					onChange: ee
				}, [...t[9] ||= [_a("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Ho, u.value.label]])]),
				q("label", null, [t[12] ||= J("Source", -1), V(q("select", {
					name: "source",
					"onUpdate:modelValue": t[1] ||= (e) => u.value.source = e,
					onChange: ee
				}, [...t[11] ||= [
					q("option", { value: "" }, "All sources", -1),
					q("option", { value: "diagnostic" }, "Kiosk", -1),
					q("option", { value: "microphone" }, "Recorded", -1),
					q("option", { value: "import" }, "Import", -1)
				]], 544), [[Ho, u.value.source]])]),
				q("label", null, [t[14] ||= J("Kind", -1), V(q("select", {
					name: "kind",
					"onUpdate:modelValue": t[2] ||= (e) => u.value.kind = e,
					onChange: ee
				}, [...t[13] ||= [
					q("option", { value: "" }, "All kinds", -1),
					q("option", { value: "true" }, "Close miss", -1),
					q("option", { value: "false" }, "Activation", -1)
				]], 544), [[Ho, u.value.kind]])]),
				q("label", null, [t[15] ||= J("After", -1), V(q("input", {
					name: "after",
					"onUpdate:modelValue": t[3] ||= (e) => u.value.after = e,
					type: "date",
					onInput: ee
				}, null, 544), [[zo, u.value.after]])]),
				q("label", null, [t[16] ||= J("Before", -1), V(q("input", {
					name: "before",
					"onUpdate:modelValue": t[4] ||= (e) => u.value.before = e,
					type: "date",
					onInput: ee
				}, null, 544), [[zo, u.value.before]])])
			])]),
			q("audio", {
				ref_key: "audio",
				ref: p,
				"data-audio-player": "",
				preload: "none",
				class: "hidden",
				onEnded: S
			}, null, 544),
			q("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": s.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [s.value ? (G(), K("p", Rl, "Loading samples…")) : (G(), K("table", zl, [t[22] ||= q("thead", null, [q("tr", null, [
				q("th", null, "Sample"),
				q("th", null, "Label"),
				q("th", null, "Source"),
				q("th", null, "Revision"),
				q("th", null, "Actions")
			])], -1), q("tbody", null, [(G(!0), K(W, null, U(r.value, (e) => (G(), K("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				q("td", null, [J(I(e.recording?.clip_id ?? e.id), 1), e.recording ? (G(), K("small", Vl, I(e.recording.phrase) + " · " + I(e.recording.engine) + " · " + I(te(e)), 1)) : Y("", !0)]),
				q("td", null, I(e.label), 1),
				q("td", null, [J(I(j(e)), 1), e.capture ? (G(), K("small", Hl, I(e.capture.trim_method === "silero" ? "VAD trim" : e.capture.trim_method === "manual" ? "Manual trim" : "Full recording") + " · " + I(e.capture.duration_s.toFixed(2)) + " s original", 1)) : Y("", !0)]),
				q("td", null, "rev " + I(e.revision), 1),
				q("td", null, [q("div", Ul, [
					q("button", {
						type: "button",
						"data-action": "play",
						disabled: h.value === e.id,
						"aria-pressed": m.value === e.id,
						"aria-label": m.value === e.id ? "Stop sample" : "Play sample",
						onClick: (t) => C(e)
					}, I(h.value === e.id ? "Loading…" : m.value === e.id ? "Stop" : "Play"), 9, Wl),
					q("label", null, [t[20] ||= q("span", { class: "sr-only" }, "Relabel", -1), q("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => O(e, t)
					}, [
						e.label === "pending" ? (G(), K("option", Kl, "Set label…")) : Y("", !0),
						t[17] ||= q("option", { value: "positive" }, "Positive", -1),
						t[18] ||= q("option", { value: "negative" }, "Negative", -1),
						t[19] ||= q("option", { value: "discarded" }, "Discarded", -1)
					], 40, Gl)]),
					q("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => d.value = e
					}, "Trim", 8, ql),
					q("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => f.value = e
					}, "Delete", 8, Jl)
				])])
			], 8, Bl))), 128)), r.value.length ? Y("", !0) : (G(), K("tr", Yl, [...t[21] ||= [q("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), pa(mc, {
				total: i.value,
				offset: a.value,
				limit: o.value,
				loading: s.value,
				noun: "samples",
				onPage: t[5] ||= (e) => {
					a.value = e, T();
				}
			}, null, 8, [
				"total",
				"offset",
				"limit",
				"loading"
			])], 8, Ll),
			pa(Ml, {
				"studio-target": d.value ? {
					wordId: d.value.word_id,
					sampleId: d.value.id,
					revision: d.value.revision,
					src: B($).audioUrl(d.value.word_id, d.value.id)
				} : null,
				onSave: t[6] ||= (e) => k(e),
				onClose: t[7] ||= (e) => d.value = null
			}, null, 8, ["studio-target"]),
			f.value ? (G(), K("div", Xl, [q("section", Zl, [
				t[23] ||= q("h2", null, "Remove sample?", -1),
				t[24] ||= q("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				q("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: A
				}, "Remove"),
				q("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[8] ||= (e) => f.value = null
				}, "Cancel")
			])])) : Y("", !0)
		]));
	}
});
//#endregion
//#region src/studio/capture.ts
function $l() {
	let e = /* @__PURE__ */ z("idle"), t = /* @__PURE__ */ Gt(null), n = /* @__PURE__ */ z(""), r = /* @__PURE__ */ z(0), i = 0, a, o, s;
	function c() {
		clearInterval(s), s = void 0, a?.getTracks().forEach((e) => e.stop()), a = void 0;
	}
	function l() {
		i++, o &&= (o.onstop = null, o.ondataavailable = null, o.onerror = null, o.state !== "inactive" && o.stop(), void 0), c(), t.value = null, r.value = 0, n.value = "", e.value = "idle";
	}
	function u(t) {
		l(), n.value = t, e.value = "error";
	}
	async function d() {
		if (!["idle", "error"].includes(e.value)) return;
		if (l(), !window.isSecureContext) {
			u("Microphone recording requires HTTPS or localhost. Open Studio using a secure connection.");
			return;
		}
		if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder > "u") {
			u("Microphone recording is not supported by this browser. You can still upload audio below.");
			return;
		}
		let n = i;
		e.value = "requesting";
		try {
			let l = await navigator.mediaDevices.getUserMedia({ audio: !0 });
			if (n !== i) {
				l.getTracks().forEach((e) => e.stop());
				return;
			}
			a = l;
			let d = [
				"audio/webm;codecs=opus",
				"audio/ogg;codecs=opus",
				"audio/mp4"
			].find((e) => MediaRecorder.isTypeSupported?.(e)), p = new MediaRecorder(l, d ? { mimeType: d } : void 0);
			o = p;
			let m = [], h = 0;
			p.ondataavailable = (e) => {
				n === i && (h += e.data.size, h > 67108864 ? u("Recording exceeded the 64 MB limit. Please record a shorter sample.") : e.data.size && m.push(e.data));
			}, p.onerror = () => {
				n === i && u("The microphone recording failed. Check your input device and try again.");
			}, p.onstop = () => {
				if (n !== i) return;
				c(), o = void 0;
				let r = p.mimeType || m[0]?.type || "application/octet-stream", a = new Blob(m, { type: r });
				if (!a.size) {
					u("The recording was empty. Check your microphone and try again.");
					return;
				}
				let s = r.includes("mp4") ? "mp4" : r.includes("ogg") ? "ogg" : "webm";
				t.value = new File([a], `microphone.${s}`, { type: r }), e.value = "review";
			}, p.start(1e3), e.value = "recording";
			let g = Date.now();
			s = setInterval(() => {
				r.value = Math.floor((Date.now() - g) / 1e3), r.value >= 600 && f();
			}, 250);
		} catch (e) {
			if (n !== i) return;
			u((e instanceof DOMException ? e.name : "") === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access in your browser and retry." : "Microphone unavailable. Check your input device and browser permissions.");
		}
	}
	function f() {
		e.value === "recording" && o && (e.value = "stopping", clearInterval(s), o.stop());
	}
	return {
		state: e,
		audio: t,
		error: n,
		elapsed: r,
		start: d,
		stop: f,
		reset: l,
		dispose: l
	};
}
//#endregion
//#region src/studio/components/CaptureReview.vue?vue&type=script&setup=true&lang.ts
var eu = { class: "studio-capture-review" }, tu = { class: "flex flex-wrap items-center justify-between gap-2" }, nu = { class: "studio-muted text-xs" }, ru = {
	key: 0,
	class: "studio-note",
	role: "status"
}, iu = {
	key: 1,
	class: "studio-note",
	role: "status"
}, au = {
	key: 2,
	class: "studio-muted",
	role: "status"
}, ou = {
	key: 3,
	class: "studio-capture-wave",
	viewBox: "0 0 640 80",
	preserveAspectRatio: "none",
	role: "img",
	"aria-label": "Recorded audio waveform with selected trim region"
}, su = [
	"x1",
	"x2",
	"y1",
	"y2"
], cu = ["width"], lu = ["x", "width"], uu = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, du = ["disabled"], fu = { class: "flex flex-wrap gap-2 mb-3" }, pu = ["disabled"], mu = ["disabled", "aria-expanded"], hu = ["disabled"], gu = ["max"], _u = ["max"], vu = {
	key: 6,
	class: "studio-note",
	role: "alert"
}, yu = /* @__PURE__ */ sr({
	__name: "CaptureReview",
	props: {
		audio: {},
		preview: {},
		disabled: { type: Boolean }
	},
	emits: ["selection"],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, a = /* @__PURE__ */ z(r.preview.start_s), o = /* @__PURE__ */ z(r.preview.end_s), s = /* @__PURE__ */ z(r.preview.trim_method), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(!0), u = /* @__PURE__ */ z(""), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ Gt(null), p = /* @__PURE__ */ z([]), m, h, g = 0, _ = X(() => Number.isFinite(a.value) && Number.isFinite(o.value) && a.value >= 0 && o.value <= r.preview.duration_s && o.value > a.value && Math.floor(o.value * 16e3) > Math.floor(a.value * 16e3));
		H([
			a,
			o,
			s
		], () => i("selection", _.value ? {
			start_s: a.value,
			end_s: o.value,
			trim_method: s.value
		} : null), { immediate: !0 });
		function v() {
			let e = h;
			h = void 0, e && (e.onended = null, e.stop(), e.disconnect()), d.value = !1;
		}
		function y() {
			v(), m?.close().catch(() => void 0), m = void 0;
		}
		async function b() {
			let e = ++g;
			y(), l.value = !0, u.value = "", f.value = null;
			try {
				let t = await new Promise((e, t) => {
					let n = new FileReader();
					n.onload = () => e(n.result), n.onerror = () => t(/* @__PURE__ */ Error("decode")), n.readAsArrayBuffer(r.audio);
				});
				if (e !== g) return;
				m = new AudioContext();
				let n = await m.decodeAudioData(t);
				if (e !== g) return;
				f.value = n;
				let i = n.getChannelData(0).subarray(0, Math.floor(r.preview.duration_s * n.sampleRate)), a = Math.max(1, Math.floor(i.length / 160));
				p.value = Array.from({ length: 160 }, (e, t) => {
					let n = 0;
					for (let e = t * a; e < Math.min((t + 1) * a, i.length); e++) n = Math.max(n, Math.abs(i[e]));
					return Math.max(1, n * 34);
				});
			} catch {
				e === g && (u.value = "Audio preview could not be decoded in this browser. Your original is retained; retry playback or save the selected bounds.");
			} finally {
				e === g && (l.value = !1);
			}
		}
		async function x() {
			if (d.value) {
				v();
				return;
			}
			if (!f.value || !m || !_.value) return;
			let e = g;
			try {
				if (await m.resume(), e !== g || !m || !f.value) return;
				let t = m.createBufferSource();
				t.buffer = f.value, t.connect(m.destination), h = t, d.value = !0, t.onended = () => {
					h === t && (h = void 0, d.value = !1, t.disconnect());
				}, t.start(0, a.value, Math.min(o.value, f.value.duration) - a.value);
			} catch {
				v(), u.value = "Playback failed. Try again, or save the sample and review it in Samples.";
			}
		}
		function S() {
			v(), s.value = "manual";
		}
		return t({
			play: x,
			canPlay: X(() => !!f.value && _.value && !r.disabled)
		}), H(() => r.audio, () => {
			b();
		}, { immediate: !0 }), H(() => r.preview, (e) => {
			a.value = e.start_s, o.value = e.end_s, s.value = e.trim_method, c.value = !1;
		}), H(() => r.disabled, (e) => {
			e && v();
		}), Er(() => {
			g++, y();
		}), (e, t) => (G(), K("div", eu, [
			q("div", tu, [t[3] ||= q("h2", null, "Review your sample", -1), q("span", nu, I(s.value === "silero" ? "Auto-trimmed" : s.value === "manual" ? "Manual trim" : "Full clip") + " · " + I(Math.max(0, o.value - a.value).toFixed(2)) + " s retained", 1)]),
			r.preview.duration_limited ? (G(), K("p", ru, "Training audio is limited to 10 minutes, including any delayed browser stop. Your full original recording is retained when saved.")) : Y("", !0),
			r.preview.warning ? (G(), K("p", iu, I(r.preview.warning === "no_speech" ? "No speech detected. The full clip is selected; background-noise negatives can still be saved." : "Automatic speech trimming is unavailable. The full clip is selected; adjust it manually if needed."), 1)) : Y("", !0),
			l.value ? (G(), K("p", au, "Preparing waveform…")) : f.value ? (G(), K("svg", ou, [
				(G(!0), K(W, null, U(p.value, (e, t) => (G(), K("line", {
					key: t,
					x1: t * 4 + 2,
					x2: t * 4 + 2,
					y1: 40 - e,
					y2: 40 + e,
					stroke: "currentColor",
					"stroke-width": "2"
				}, null, 8, su))), 128)),
				q("rect", {
					x: "0",
					y: "0",
					width: a.value / r.preview.duration_s * 640,
					height: "80",
					fill: "var(--studio-bg)",
					opacity: ".85"
				}, null, 8, cu),
				q("rect", {
					x: o.value / r.preview.duration_s * 640,
					y: "0",
					width: (1 - o.value / r.preview.duration_s) * 640,
					height: "80",
					fill: "var(--studio-bg)",
					opacity: ".85"
				}, null, 8, lu)
			])) : Y("", !0),
			u.value ? (G(), K("p", uu, [J(I(u.value) + " ", 1), q("button", {
				type: "button",
				disabled: l.value || r.disabled,
				onClick: b
			}, "Retry preview", 8, du)])) : Y("", !0),
			q("div", fu, [q("button", {
				type: "button",
				"data-action": "play-capture",
				"aria-keyshortcuts": "Space",
				disabled: !f.value || !_.value || r.disabled,
				onClick: x
			}, I(d.value ? "Stop preview" : "▶ Play trimmed sample"), 9, pu), q("button", {
				type: "button",
				"data-action": "adjust-trim",
				disabled: r.disabled,
				"aria-expanded": c.value,
				onClick: t[0] ||= (e) => c.value = !c.value
			}, "Adjust trim", 8, mu)]),
			c.value ? (G(), K("fieldset", {
				key: 5,
				class: "studio-capture-bounds",
				disabled: r.disabled
			}, [
				t[6] ||= q("legend", { class: "sr-only" }, "Trim selection in seconds", -1),
				q("label", null, [t[4] ||= J("Start (seconds)", -1), V(q("input", {
					"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
					name: "trim-start",
					type: "number",
					min: "0",
					max: r.preview.duration_s,
					step: "0.01",
					onInput: S
				}, null, 40, gu), [[
					zo,
					a.value,
					void 0,
					{ number: !0 }
				]])]),
				q("label", null, [t[5] ||= J("End (seconds)", -1), V(q("input", {
					"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
					name: "trim-end",
					type: "number",
					min: "0",
					max: r.preview.duration_s,
					step: "0.01",
					onInput: S
				}, null, 40, _u), [[
					zo,
					o.value,
					void 0,
					{ number: !0 }
				]])])
			], 8, hu)) : Y("", !0),
			_.value ? Y("", !0) : (G(), K("p", vu, "Choose a start before the end, within the recorded duration.")),
			t[7] ||= q("p", { class: "studio-muted text-xs" }, "Only the beginning and end are trimmed. Interior pauses stay intact. Original audio is retained.", -1)
		]));
	}
}), bu = { class: "flex flex-wrap items-start justify-between gap-3 mb-4" }, xu = ["href"], Su = {
	key: 0,
	class: "studio-note"
}, Cu = {
	key: 1,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, wu = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Tu = { class: "studio-card mb-4" }, Eu = { class: "flex-1" }, Du = ["disabled"], Ou = ["disabled"], ku = ["disabled"], Au = ["aria-busy"], ju = { class: "flex flex-wrap items-center justify-between gap-4" }, Mu = {
	class: "studio-capture-label",
	role: "group",
	"aria-label": "Recording sample label"
}, Nu = [
	"data-label",
	"aria-pressed",
	"disabled",
	"onClick"
], Pu = { class: "studio-capture-area" }, Fu = {
	class: "studio-muted",
	role: "status"
}, Iu = { class: "studio-capture-timer" }, Lu = ["disabled"], Ru = {
	key: 0,
	class: "studio-note mt-3",
	role: "status"
}, zu = {
	key: 1,
	class: "mt-4"
}, Bu = { class: "flex flex-wrap items-center justify-end gap-2 mt-3" }, Vu = ["disabled"], Hu = ["disabled"], Uu = /* @__PURE__ */ sr({
	__name: "RecordPage",
	setup(e) {
		let t = ws(), n = $l(), { state: r, audio: i, elapsed: a } = n, o = /* @__PURE__ */ z("positive"), s = /* @__PURE__ */ Gt(null), c = /* @__PURE__ */ z(null), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(""), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(!1), p = /* @__PURE__ */ z(!1), m = /* @__PURE__ */ Gt(null), h = /* @__PURE__ */ z("positive"), g = /* @__PURE__ */ z(), _ = 0, v, y, b, x = X(() => d.value || f.value || p.value || r.value === "requesting" || r.value === "stopping"), S = X(() => !!t.selectedId.value && !x.value && !i.value), C = X(() => !!i.value && !d.value && r.value !== "recording"), w = /* @__PURE__ */ z(), T = X(() => `${String(Math.floor(a.value / 60)).padStart(2, "0")}:${String(a.value % 60).padStart(2, "0")}`);
		function E() {
			_++, v?.abort(), y?.abort(), n.reset(), s.value = null, c.value = null, d.value = !1, f.value = !1, l.value = "";
		}
		async function D() {
			r.value === "recording" ? n.stop() : S.value && (u.value = "", l.value = "", await n.start());
		}
		async function O() {
			if (!i.value || d.value) return;
			v?.abort();
			let e = new AbortController();
			v = e;
			let n = _, r = t.selectedId.value;
			d.value = !0, l.value = "";
			try {
				let t = await $.previewCapture(r, i.value, e.signal);
				if (n !== _ || e.signal.aborted) return;
				s.value = t, c.value = {
					start_s: t.start_s,
					end_s: t.end_s,
					trim_method: t.trim_method
				};
			} catch (t) {
				n === _ && !e.signal.aborted && (l.value = t instanceof Error ? t.message : "Recording analysis failed. Retry without recording again.");
			} finally {
				n === _ && (d.value = !1);
			}
		}
		async function k() {
			if (!i.value || !c.value || x.value) return;
			let e = _, n = new AbortController();
			y = n, f.value = !0, l.value = "";
			try {
				if (await $.saveCapture(t.selectedId.value, i.value, o.value, { ...c.value }, n.signal), e !== _ || n.signal.aborted) return;
				E(), u.value = "Sample saved. Ready for the next recording.";
			} catch (t) {
				e === _ && !n.signal.aborted && (l.value = t instanceof Error ? t.message : "Sample was not saved. Try again.");
			} finally {
				e === _ && (f.value = !1);
			}
		}
		async function A() {
			if (!m.value || !t.selectedId.value || x.value || r.value === "recording") return;
			let e = _, n = new AbortController();
			b = n, p.value = !0, l.value = "", u.value = "";
			try {
				if (await $.importAudio(t.selectedId.value, m.value, h.value, n.signal), e !== _ || n.signal.aborted) return;
				m.value = null, g.value && (g.value.value = ""), u.value = "Imported audio.";
			} catch (t) {
				e === _ && !n.signal.aborted && (l.value = t instanceof Error ? t.message : "Audio was not uploaded. Try again.");
			} finally {
				e === _ && (p.value = !1);
			}
		}
		function ee(e) {
			return !!e?.closest("input,textarea,select,[contenteditable],[inert]");
		}
		function te(e) {
			if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
			let t = e.target instanceof Element ? e.target : null;
			if (ee(t) || document.querySelector("[role=\"dialog\"],[aria-modal=\"true\"],dialog[open]")) return;
			let n = !!t?.closest("button:not(:disabled),a,[role=\"button\"]"), i = e.key.toLowerCase();
			C.value ? e.code === "Space" && !n ? (e.preventDefault(), w.value?.canPlay && w.value.play()) : (i === "k" || i === "enter" && !n) && s.value && c.value && !x.value ? (e.preventDefault(), k()) : i === "d" && !x.value && (e.preventDefault(), E()) : e.code === "Space" && !n && (r.value === "recording" || S.value) && (e.preventDefault(), D());
		}
		return H(i, (e) => {
			e && O();
		}), H(t.selectedId, () => {
			E(), b?.abort(), p.value = !1, m.value = null, g.value && (g.value.value = ""), u.value = "";
		}), Cr(() => document.addEventListener("keydown", te)), Er(() => {
			document.removeEventListener("keydown", te), E(), b?.abort();
		}), (e, a) => (G(), K("section", null, [
			q("div", bu, [a[4] ||= q("div", null, [q("h1", null, "Manual"), q("p", { class: "studio-muted" }, "Upload audio or record from your browser to the selected wakeword.")], -1), q("a", {
				href: B(t).routes.href("samples"),
				onClick: a[0] ||= Yo((e) => B(t).routes.navigate("samples"), ["prevent"])
			}, "View samples →", 8, xu)]),
			B(t).selectedId.value ? Y("", !0) : (G(), K("p", Su, "Select or create a wakeword to record or upload samples.")),
			u.value ? (G(), K("p", Cu, I(u.value), 1)) : Y("", !0),
			l.value || B(n).error.value ? (G(), K("p", wu, I(l.value || B(n).error.value), 1)) : Y("", !0),
			q("section", Tu, [
				a[8] ||= q("h2", null, "Upload audio", -1),
				a[9] ||= q("p", { class: "studio-muted mb-3" }, "Uploads keep their own label and import provenance. Adjust trims later in Samples.", -1),
				q("form", {
					"data-form": "import",
					class: "flex flex-wrap gap-3 items-end",
					onSubmit: Yo(A, ["prevent"])
				}, [
					q("label", Eu, [a[5] ||= J("Audio", -1), q("input", {
						ref_key: "uploadInput",
						ref: g,
						name: "import-file",
						type: "file",
						accept: "audio/*",
						required: "",
						disabled: p.value,
						onChange: a[1] ||= (e) => m.value = e.target.files?.[0] ?? null
					}, null, 40, Du)]),
					q("label", null, [a[7] ||= J("Sample label", -1), V(q("select", {
						name: "import-label",
						"onUpdate:modelValue": a[2] ||= (e) => h.value = e,
						disabled: p.value
					}, [...a[6] ||= [q("option", { value: "positive" }, "Positive", -1), q("option", { value: "negative" }, "Negative", -1)]], 8, Ou), [[Ho, h.value]])]),
					q("button", {
						type: "submit",
						class: "studio-primary",
						disabled: !B(t).selectedId.value || !m.value || x.value || B(r) === "recording"
					}, I(p.value ? "Uploading…" : "Upload audio"), 9, ku)
				], 32)
			]),
			q("section", {
				class: "studio-card",
				"aria-busy": d.value || f.value
			}, [
				q("div", ju, [a[10] ||= q("div", null, [q("h2", null, "Microphone recording"), q("p", { class: "studio-muted" }, "One recording, one sample. You decide when to stop.")], -1), q("div", Mu, [(G(), K(W, null, U(["positive", "negative"], (e) => q("button", {
					key: e,
					type: "button",
					"data-label": e,
					"aria-pressed": o.value === e,
					class: F({ "studio-primary": o.value === e }),
					disabled: f.value,
					onClick: (t) => o.value = e
				}, I(e === "positive" ? "Positive" : "Negative"), 11, Nu)), 64))])]),
				q("div", Pu, [
					q("div", Fu, I(B(r) === "recording" ? "Recording…" : B(r) === "requesting" ? "Waiting for microphone permission…" : B(r) === "stopping" ? "Finishing recording…" : B(i) ? "Recording ready for review" : "Ready · browser’s current microphone"), 1),
					q("div", Iu, I(T.value), 1),
					q("button", {
						type: "button",
						"data-action": "record-toggle",
						class: F(B(r) === "recording" ? "studio-record-stop" : "studio-primary"),
						disabled: B(r) !== "recording" && !S.value,
						"aria-keyshortcuts": "Space",
						onClick: D
					}, I(B(r) === "recording" ? "■ Stop recording" : "● Start recording"), 11, Lu),
					a[11] ||= q("p", { class: "studio-muted text-xs mt-3" }, [q("kbd", null, "Space"), J(" to start / stop · shortcut pauses while typing or using another control")], -1),
					a[12] ||= q("p", { class: "studio-muted text-xs mt-2" }, "Microphone access requires HTTPS or localhost. Maximum recording length: 10 minutes.", -1)
				]),
				d.value ? (G(), K("p", Ru, "Finding speech and trimming silence…")) : Y("", !0),
				B(i) && !d.value ? (G(), K("div", zu, [
					s.value ? (G(), ca(yu, {
						key: 0,
						ref_key: "review",
						ref: w,
						audio: B(i),
						preview: s.value,
						disabled: f.value,
						onSelection: a[3] ||= (e) => c.value = e
					}, null, 8, [
						"audio",
						"preview",
						"disabled"
					])) : Y("", !0),
					q("div", Bu, [
						s.value ? Y("", !0) : (G(), K("button", {
							key: 0,
							type: "button",
							"data-action": "retry-analysis",
							onClick: O
						}, "Retry analysis")),
						q("button", {
							type: "button",
							"data-action": "retake",
							"aria-keyshortcuts": "D",
							disabled: x.value,
							onClick: E
						}, "Retake", 8, Vu),
						s.value ? (G(), K("button", {
							key: 1,
							type: "button",
							"data-action": "save-capture",
							class: "studio-primary",
							"aria-keyshortcuts": "K Enter",
							disabled: x.value || !c.value,
							onClick: k
						}, I(f.value ? "Saving…" : "Save sample"), 9, Hu)) : Y("", !0)
					]),
					a[13] ||= q("p", { class: "studio-muted text-xs mt-2 text-right" }, [
						q("kbd", null, "Space"),
						J(" play / stop · "),
						q("kbd", null, "K"),
						J(" or "),
						q("kbd", null, "Enter"),
						J(" keep · "),
						q("kbd", null, "D"),
						J(" discard")
					], -1)
				])) : Y("", !0),
				a[14] ||= q("p", { class: "studio-muted text-xs mt-4" }, "VAD trims leading and trailing silence with a small safety margin. No speech detected? Keep the full clip, especially for negative background-noise samples.", -1)
			], 8, Au),
			a[15] ||= q("p", { class: "studio-muted text-xs mt-3" }, "Recordings and uploads appear alongside collected data in Samples, with distinct source metadata.", -1)
		]));
	}
}), Wu = ["inert"], Gu = { class: "flex flex-wrap items-start justify-between gap-3" }, Ku = {
	key: 0,
	class: "studio-muted"
}, qu = ["disabled"], Ju = {
	key: 0,
	class: "mt-3"
}, Yu = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, Xu = {
	key: 1,
	class: "studio-note",
	role: "status"
}, Zu = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Qu = { key: 0 }, $u = ["disabled"], ed = {
	key: 3,
	class: "studio-muted mt-3"
}, td = {
	key: 4,
	class: "mt-4 grid gap-2"
}, nd = ["data-device-id"], rd = { class: "studio-muted text-xs" }, id = { class: "flex flex-wrap gap-2 items-center" }, ad = ["disabled", "onClick"], od = ["onSubmit"], sd = ["name"], cd = ["disabled"], ld = { class: "flex gap-2" }, ud = ["disabled", "onClick"], dd = ["disabled", "onClick"], fd = ["onSubmit"], pd = {
	key: 0,
	class: "studio-muted text-xs"
}, md = { class: "flex gap-2" }, hd = ["disabled"], gd = ["disabled"], _d = {
	key: 0,
	class: "studio-muted"
}, vd = { key: 0 }, yd = { key: 1 }, bd = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, xd = { class: "flex gap-2" }, Sd = ["disabled"], Cd = ["disabled"], wd = /* @__PURE__ */ sr({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = lc(), a = /* @__PURE__ */ z(""), o = /* @__PURE__ */ z("standalone"), s = /* @__PURE__ */ z(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(""), d = /* @__PURE__ */ z(""), f = /* @__PURE__ */ z(""), p = /* @__PURE__ */ z(""), m = /* @__PURE__ */ z(null), h = /* @__PURE__ */ z(), g = /* @__PURE__ */ z(), _ = null;
		function v(e) {
			f.value = e.id, p.value = e.url;
		}
		async function y(e) {
			l.value = `edit:${e.id}`, d.value = "";
			try {
				await i.update(e.id, p.value), f.value = "", u.value = "Connection address saved.", E();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Address was not saved.";
			} finally {
				l.value = "";
			}
		}
		async function b(e, t) {
			_ = t.currentTarget, m.value = e, await vn(), typeof h.value?.showModal == "function" ? h.value.showModal() : h.value?.setAttribute("open", ""), h.value?.querySelector("button")?.focus();
		}
		async function x() {
			m.value = null, await vn(), _?.isConnected ? _.focus() : g.value?.querySelector("[data-action=\"refresh-registry\"]")?.focus();
		}
		function S(e) {
			if (e.key !== "Tab") return;
			let t = h.value?.querySelectorAll("button:not(:disabled)");
			if (!t?.length) {
				e.preventDefault(), h.value?.focus();
				return;
			}
			let n = t?.[0], r = t?.[t.length - 1];
			e.shiftKey && document.activeElement === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
		async function C() {
			if (m.value && !l.value) {
				l.value = `delete:${m.value.id}`, d.value = "", await vn(), h.value?.focus();
				try {
					await i.remove(m.value.id), x(), u.value = "Kiosk removed from Studio. Saved recordings and models are kept.", E();
				} catch (e) {
					d.value = e instanceof Error ? e.message : "Kiosk was not removed.";
				} finally {
					l.value = "";
				}
			}
		}
		function w(e, t) {
			t instanceof HTMLInputElement ? c.set(e, t) : c.delete(e);
		}
		function T(e) {
			return e.leader_id ? `Parent ${i.deviceLabel(e.leader_id)}` : "Direct registry target";
		}
		function E() {
			r("changed", [...i.devices.value]);
		}
		async function D() {
			let e = s.value?.value ?? "";
			s.value && (s.value.value = ""), l.value = "add", d.value = "", u.value = "";
			try {
				await i.add(a.value, e, o.value), a.value = "", u.value = o.value === "leader" ? "Leader added; follower membership was refreshed." : "Standalone kiosk added.", E();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Device could not be added.";
			} finally {
				l.value = "";
			}
		}
		async function O(e) {
			l.value = `refresh:${e.id}`, d.value = "";
			try {
				await i.refresh(e.id), u.value = "Fleet membership refreshed.", E();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Fleet refresh failed.";
			} finally {
				l.value = "";
			}
		}
		async function k(e) {
			let t = c.get(e.id), n = t?.value ?? "";
			t && (t.value = ""), l.value = `credentials:${e.id}`, d.value = "";
			try {
				await i.credentials(e.id, n), u.value = "Kiosk authenticated; token saved server-side.", E();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Credentials were not saved.";
			} finally {
				l.value = "";
			}
		}
		return Cr(async () => {
			await i.load(), E();
		}), Er(() => i.abort()), (e, t) => (G(), K("section", {
			ref_key: "registryElement",
			ref: g,
			class: "studio-card",
			"data-device-registry": ""
		}, [q("div", {
			"data-device-registry-content": "",
			inert: m.value ? !0 : void 0
		}, [
			q("div", Gu, [q("div", null, [t[8] ||= q("h2", null, "Fleet setup", -1), n.surface === "kiosks" ? Y("", !0) : (G(), K("p", Ku, "Register a fleet leader or standalone kiosks."))]), q("button", {
				type: "button",
				"data-action": "refresh-registry",
				disabled: B(i).loading.value,
				onClick: t[0] ||= (e) => B(i).load(!0)
			}, "Refresh registry", 8, qu)]),
			n.surface === "kiosks" ? Y("", !0) : (G(), K("details", Ju, [
				t[9] ||= q("summary", null, "Fleet safety details", -1),
				t[10] ||= q("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (G(), K("p", Yu, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : Y("", !0)
			])),
			u.value ? (G(), K("p", Xu, I(u.value), 1)) : Y("", !0),
			d.value || B(i).error.value ? (G(), K("p", Zu, I(d.value || B(i).error.value), 1)) : Y("", !0),
			(G(), ca(Pr(n.surface === "kiosks" ? "div" : "details"), {
				"data-device-registration": "",
				class: "mt-3",
				open: n.surface !== "kiosks" && !B(i).devices.value.length || void 0
			}, {
				default: Mn(() => [
					n.surface === "kiosks" ? Y("", !0) : (G(), K("summary", Qu, "Add device")),
					q("form", {
						"data-device-add": "",
						class: "studio-registration-row",
						onSubmit: Yo(D, ["prevent"])
					}, [
						q("label", null, [t[11] ||= J("Address", -1), V(q("input", {
							"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
							required: "",
							name: "url",
							autocomplete: "url",
							placeholder: "http://kiosk.local:2324"
						}, null, 512), [[zo, a.value]])]),
						q("label", null, [t[13] ||= J("Role", -1), V(q("select", {
							"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
							name: "role"
						}, [...t[12] ||= [q("option", { value: "standalone" }, "Standalone", -1), q("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Ho, o.value]])]),
						q("label", null, [t[14] ||= J("Admin password", -1), q("input", {
							ref_key: "passwordInput",
							ref: s,
							required: "",
							name: "password",
							type: "password",
							autocomplete: "off"
						}, null, 512)]),
						q("button", {
							type: "submit",
							class: "studio-primary",
							disabled: l.value === "add"
						}, "Add device", 8, $u)
					], 32),
					t[15] ||= q("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
				]),
				_: 1
			}, 8, ["open"])),
			B(i).loading.value ? (G(), K("p", ed, "Loading registered devices…")) : (G(), K("div", td, [(G(!0), K(W, null, U(B(i).devices.value, (e) => (G(), K("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [
				q("div", null, [
					q("strong", null, I(B(i).deviceLabel(e.id)), 1),
					t[16] ||= J(),
					q("span", { class: F(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, I(e.role === "follower" ? "Follower" : e.role), 3),
					q("p", rd, I(T(e)) + " · " + I(e.url) + I(e.active ? "" : " · Inactive member"), 1)
				]),
				q("div", id, [
					q("span", { class: F(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, I(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
					q("span", { class: F(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, I(e.model_eligible ? "Profile covered" : "Not covered"), 3),
					e.role === "leader" ? (G(), K("button", {
						key: 0,
						type: "button",
						disabled: l.value === `refresh:${e.id}`,
						onClick: (t) => O(e)
					}, "Refresh followers", 8, ad)) : Y("", !0),
					e.role === "follower" && e.credentials_status !== "ready" ? (G(), K("form", {
						key: 1,
						class: "flex gap-2",
						onSubmit: Yo((t) => k(e), ["prevent"])
					}, [q("input", {
						ref_for: !0,
						ref: (t) => w(e.id, t),
						name: `credentials-${e.id}`,
						required: "",
						type: "password",
						autocomplete: "off",
						"aria-label": "Follower admin password"
					}, null, 8, sd), q("button", {
						type: "submit",
						disabled: l.value === `credentials:${e.id}`
					}, "Authenticate", 8, cd)], 40, od)) : Y("", !0)
				]),
				q("div", ld, [q("button", {
					type: "button",
					"data-action": "edit-device",
					disabled: !!l.value,
					onClick: (t) => v(e)
				}, "Edit", 8, ud), q("button", {
					type: "button",
					"data-action": "delete-device",
					disabled: !!l.value,
					onClick: (t) => b(e, t)
				}, "Delete", 8, dd)]),
				f.value === e.id ? (G(), K("form", {
					key: 0,
					"data-device-edit": "",
					class: "studio-card grid gap-3",
					style: {
						"grid-column": "1 / -1",
						width: "100%"
					},
					onSubmit: Yo((t) => y(e), ["prevent"])
				}, [
					q("label", null, [t[17] ||= J("Studio connection address", -1), V(q("input", {
						"onUpdate:modelValue": t[3] ||= (e) => p.value = e,
						name: "device-url",
						required: "",
						type: "url"
					}, null, 512), [[zo, p.value]])]),
					e.role === "follower" ? (G(), K("p", pd, "Local override: this address is retained when followers refresh. Fleet membership stays leader-managed.")) : Y("", !0),
					q("div", md, [q("button", {
						class: "studio-primary",
						disabled: !!l.value,
						type: "submit"
					}, "Save address", 8, hd), q("button", {
						type: "button",
						"data-action": "cancel-device-edit",
						disabled: !!l.value,
						onClick: t[4] ||= (e) => f.value = ""
					}, "Cancel", 8, gd)])
				], 40, fd)) : Y("", !0)
			], 8, nd))), 128)), B(i).devices.value.length ? Y("", !0) : (G(), K("p", _d, "No kiosks registered yet."))]))
		], 8, Wu), m.value ? (G(), K("dialog", {
			key: 0,
			ref_key: "confirmation",
			ref: h,
			tabindex: "-1",
			role: "alertdialog",
			"aria-modal": "true",
			"aria-label": "Remove kiosk from Studio?",
			class: "studio-card studio-device-dialog",
			onCancel: t[5] ||= Yo((e) => !l.value && x(), ["prevent"]),
			onKeydown: [t[6] ||= Zo((e) => !l.value && x(), ["esc"]), S],
			onClick: t[7] ||= Yo((e) => !l.value && x(), ["self"])
		}, [
			q("h2", null, "Remove " + I(B(i).deviceLabel(m.value.id)) + " from Studio?", 1),
			m.value.role === "leader" ? (G(), K("p", vd, "This also removes its discovered followers from the Studio registry.")) : m.value.role === "follower" ? (G(), K("p", yd, "This follower can be rediscovered on the next fleet refresh.")) : Y("", !0),
			t[18] ||= q("p", null, "Saved recordings and models are kept. This does not change the kiosk itself.", -1),
			d.value ? (G(), K("p", bd, I(d.value), 1)) : Y("", !0),
			q("div", xd, [q("button", {
				"data-action": "cancel-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: x
			}, "Keep kiosk", 8, Sd), q("button", {
				"data-action": "confirm-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: C
			}, "Remove from Studio", 8, Cd)])
		], 544)) : Y("", !0)], 512));
	}
}), Td = /* @__PURE__ */ sr({
	__name: "KiosksPage",
	setup(e) {
		return (e, t) => (G(), K("section", null, [t[0] ||= q("div", { class: "mb-4" }, [q("h1", null, "Kiosks"), q("p", { class: "studio-muted" }, "Connect and manage your kiosk fleet.")], -1), pa(wd, { surface: "kiosks" })]));
	}
}), Ed = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Dd = ["name"], Od = ["name"], kd = /* @__PURE__ */ sr({
	__name: "AutomationScheduleFields",
	props: /*@__PURE__*/ Hr({ prefix: {} }, {
		modelValue: { required: !0 },
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = ci(e, "modelValue");
		return (n, r) => (G(), K("div", Ed, [q("label", null, [r[2] ||= J("Schedule (five-field cron)", -1), V(q("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value.cron = e,
			name: `${e.prefix}-cron`,
			required: "",
			placeholder: "*/30 * * * *",
			maxlength: "256"
		}, null, 8, Dd), [[zo, t.value.cron]])]), q("label", null, [r[3] ||= J("Time zone", -1), V(q("input", {
			"onUpdate:modelValue": r[1] ||= (e) => t.value.timezone = e,
			name: `${e.prefix}-timezone`,
			required: "",
			placeholder: "UTC",
			maxlength: "100"
		}, null, 8, Od), [[zo, t.value.timezone]])])]));
	}
}), Ad = {
	key: 0,
	class: "studio-card"
}, jd = {
	key: 1,
	role: "status"
}, Md = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Nd = {
	key: 3,
	class: "studio-note",
	role: "status"
}, Pd = { class: "studio-card" }, Fd = { class: "flex flex-wrap items-center justify-between gap-3" }, Id = { class: "studio-checkbox-label" }, Ld = { class: "studio-muted" }, Rd = { class: "studio-muted text-xs mt-3" }, zd = { class: "studio-card" }, Bd = { class: "flex flex-wrap items-center justify-between gap-3" }, Vd = { class: "studio-checkbox-label" }, Hd = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Ud = { class: "mt-3" }, Wd = { class: "studio-checkbox-label my-3" }, Gd = { class: "studio-checkbox-label my-3" }, Kd = { class: "studio-muted text-xs mt-3" }, qd = { class: "grid gap-4 lg:grid-cols-2" }, Jd = { class: "studio-card" }, Yd = { class: "flex flex-wrap items-center justify-between gap-3" }, Xd = { class: "studio-checkbox-label" }, Zd = { class: "studio-checkbox-label my-3" }, Qd = { class: "studio-muted text-xs" }, $d = { class: "studio-card" }, ef = { class: "flex flex-wrap items-center justify-between gap-3" }, tf = { class: "studio-status studio-status-muted" }, nf = { class: "studio-checkbox-label my-3" }, rf = { class: "studio-checkbox-label my-3" }, af = { class: "studio-muted text-xs" }, of = ["disabled"], sf = /* @__PURE__ */ sr({
	__name: "AutomatePage",
	setup(e) {
		let t = ws(), n = X(() => t.selectedId.value), r = /* @__PURE__ */ z(null), i = /* @__PURE__ */ z(null), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(!1), s = /* @__PURE__ */ z(""), c = /* @__PURE__ */ z(""), l, u, d = 0, f = X(() => r.value?.deployment.enabled ? r.value.deployment_policy.after_training ? "Scheduled + after training" : "Scheduled" : r.value?.deployment_policy.after_training ? "After training" : "Manual only");
		function p(e) {
			let t = i.value?.schedules.find((t) => t.scope === `${e}:${n.value}`), r = i.value?.last_jobs[e], a = r && "skipped" in r.result && r.result.skipped;
			return `${r ? `Last run: ${a ? "skipped" : r.status}${r.finished_at ? ` · ${Ts(r.finished_at)}` : ""}` : "No runs yet"} · ${t?.enabled ? `Next: ${Ts(t.next_run_at)}` : "Not scheduled"}`;
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
		return H(n, () => {
			m();
		}, { immediate: !0 }), Er(() => {
			d++, l?.abort(), u?.abort();
		}), (e, i) => (G(), K("section", null, [
			i[40] ||= q("div", { class: "mb-4" }, [q("h1", null, "Automate"), q("p", { class: "studio-muted" }, "Collection, classification, training, and deployment for the selected workspace.")], -1),
			n.value ? Y("", !0) : (G(), K("p", Ad, "Choose a wakeword to configure automation.")),
			a.value ? (G(), K("p", jd, "Loading automation…")) : Y("", !0),
			s.value ? (G(), K("p", Md, [J(I(s.value) + " ", 1), r.value ? Y("", !0) : (G(), K("button", {
				key: 0,
				onClick: m
			}, "Retry"))])) : Y("", !0),
			c.value ? (G(), K("p", Nd, I(c.value), 1)) : Y("", !0),
			r.value ? (G(), K("form", {
				key: 4,
				class: "grid gap-4",
				onSubmit: Yo(h, ["prevent"])
			}, [
				q("section", Pd, [
					q("div", Fd, [i[15] ||= q("h2", null, "Automatic collection", -1), q("label", Id, [V(q("input", {
						"onUpdate:modelValue": i[0] ||= (e) => r.value.collection.enabled = e,
						name: "collection-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.collection.enabled]]), i[14] ||= J("Enabled", -1)])]),
					q("p", Ld, [
						i[16] ||= J("Collect recordings mapped to ", -1),
						q("strong", null, I(B(t).selected.value?.phrase ?? "this workspace"), 1),
						i[17] ||= J(" from registered kiosks. Existing recordings are preserved when disabled.", -1)
					]),
					pa(kd, {
						modelValue: r.value.collection,
						"onUpdate:modelValue": i[1] ||= (e) => r.value.collection = e,
						prefix: "collection"
					}, null, 8, ["modelValue"]),
					q("p", Rd, I(p("scrape")), 1)
				]),
				q("section", zd, [
					q("div", Bd, [i[19] ||= q("h2", null, "Automatic classification", -1), q("label", Vd, [V(q("input", {
						"onUpdate:modelValue": i[2] ||= (e) => r.value.classification.enabled = e,
						name: "classification-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.classification.enabled]]), i[18] ||= J("Enabled", -1)])]),
					i[28] ||= q("p", { class: "studio-muted" }, "Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.", -1),
					q("div", Hd, [q("label", null, [i[21] ||= J("Speech recognition engine", -1), V(q("select", {
						"onUpdate:modelValue": i[3] ||= (e) => r.value.classification.engine = e,
						name: "stt-engine"
					}, [...i[20] ||= [q("option", { value: "faster_whisper" }, "Faster Whisper · recommended", -1), q("option", { value: "parakeet_onnx" }, "Parakeet ONNX", -1)]], 512), [[Ho, r.value.classification.engine]])]), q("label", null, [i[23] ||= J("Run", -1), V(q("select", {
						"onUpdate:modelValue": i[4] ||= (e) => r.value.classification.trigger = e,
						name: "classification-trigger"
					}, [...i[22] ||= [q("option", { value: "after_collection" }, "After collection", -1), q("option", { value: "schedule" }, "On a schedule", -1)]], 512), [[Ho, r.value.classification.trigger]])])]),
					r.value.classification.trigger === "schedule" ? (G(), ca(kd, {
						key: 0,
						modelValue: r.value.classification_schedule,
						"onUpdate:modelValue": i[5] ||= (e) => r.value.classification_schedule = e,
						prefix: "classification"
					}, null, 8, ["modelValue"])) : Y("", !0),
					q("details", Ud, [
						i[26] ||= q("summary", null, "Classification rules", -1),
						q("label", Wd, [V(q("input", {
							"onUpdate:modelValue": i[6] ||= (e) => r.value.classification.auto_negatives = e,
							type: "checkbox"
						}, null, 512), [[Bo, r.value.classification.auto_negatives]]), i[24] ||= J("Label clear non-wake activations as negatives", -1)]),
						q("label", Gd, [V(q("input", {
							"onUpdate:modelValue": i[7] ||= (e) => r.value.classification.promote_close_misses = e,
							type: "checkbox"
						}, null, 512), [[Bo, r.value.classification.promote_close_misses]]), i[25] ||= J("Promote confirmed close misses to positives", -1)]),
						i[27] ||= q("p", { class: "studio-muted text-xs" }, "Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is automatically deleted.", -1)
					]),
					q("p", Kd, I(p("classify")), 1)
				]),
				q("div", qd, [q("section", Jd, [
					q("div", Yd, [i[30] ||= q("h2", null, "Automatic training", -1), q("label", Xd, [V(q("input", {
						"onUpdate:modelValue": i[8] ||= (e) => r.value.training.enabled = e,
						name: "training-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.training.enabled]]), i[29] ||= J("Enabled", -1)])]),
					i[32] ||= q("p", { class: "studio-muted" }, "Create an archived model from reviewed and selected inputs.", -1),
					pa(kd, {
						modelValue: r.value.training,
						"onUpdate:modelValue": i[9] ||= (e) => r.value.training = e,
						prefix: "training"
					}, null, 8, ["modelValue"]),
					q("label", Zd, [V(q("input", {
						"onUpdate:modelValue": i[10] ||= (e) => r.value.skip_unchanged = e,
						type: "checkbox"
					}, null, 512), [[Bo, r.value.skip_unchanged]]), i[31] ||= J("Skip when inputs are unchanged", -1)]),
					i[33] ||= q("p", { class: "studio-note text-xs" }, "Training and deployment are separate. Training alone does not publish a model.", -1),
					q("p", Qd, I(p("train")), 1)
				]), q("section", $d, [
					q("div", ef, [i[34] ||= q("h2", null, "Automatic deployment", -1), q("span", tf, I(f.value), 1)]),
					i[37] ||= q("p", { class: "studio-muted" }, "Publish eligible archives to your registered fleet targets.", -1),
					q("label", nf, [V(q("input", {
						"onUpdate:modelValue": i[11] ||= (e) => r.value.deployment_policy.after_training = e,
						name: "after-training",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.deployment_policy.after_training]]), i[35] ||= J("Deploy after successful training", -1)]),
					i[38] ||= q("p", { class: "studio-muted text-xs" }, "Optional. Failed, cancelled, or skipped runs do not trigger deployment.", -1),
					q("label", rf, [V(q("input", {
						"onUpdate:modelValue": i[12] ||= (e) => r.value.deployment.enabled = e,
						name: "deployment-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.deployment.enabled]]), i[36] ||= J("Enable scheduled deployment", -1)]),
					r.value.deployment.enabled ? (G(), ca(kd, {
						key: 0,
						modelValue: r.value.deployment,
						"onUpdate:modelValue": i[13] ||= (e) => r.value.deployment = e,
						prefix: "deployment"
					}, null, 8, ["modelValue"])) : Y("", !0),
					i[39] ||= q("p", { class: "studio-muted text-xs mt-3" }, "Publish the latest new eligible archive; skip if there is nothing new. Manual rollbacks are retained until a new archive is available.", -1),
					q("p", af, I(p("deploy")), 1)
				])]),
				q("button", {
					type: "submit",
					class: "studio-primary",
					disabled: o.value || a.value
				}, I(o.value ? "Saving…" : "Save automation settings"), 9, of)
			], 32)) : Y("", !0)
		]));
	}
}), cf = {
	key: 0,
	class: "studio-note",
	role: "status"
}, lf = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, uf = { class: "mb-4" }, df = ["href"], ff = { class: "studio-card mb-4" }, pf = {
	key: 0,
	class: "studio-muted"
}, mf = {
	key: 1,
	class: "grid gap-3"
}, hf = ["data-version-id"], gf = { class: "flex flex-wrap justify-between gap-3" }, _f = { class: "min-w-0 flex-1" }, vf = {
	key: 0,
	"data-run-number": "",
	class: "font-semibold"
}, yf = ["datetime", "title"], bf = {
	key: 1,
	class: "studio-note text-xs"
}, xf = { class: "flex flex-wrap items-center gap-2" }, Sf = ["href"], Cf = ["disabled", "onClick"], wf = {
	key: 0,
	class: "studio-muted text-xs"
}, Tf = {
	key: 2,
	class: "studio-muted"
}, Ef = { class: "studio-card" }, Df = ["data-device-status"], Of = {
	key: 0,
	class: "studio-status studio-status-muted"
}, kf = { class: "flex items-center gap-2" }, Af = {
	"data-run-number": "",
	class: "text-xs"
}, jf = {
	key: 0,
	class: "studio-muted text-xs"
}, Mf = { key: 0 }, Nf = {
	key: 0,
	class: "studio-muted"
}, Pf = /* @__PURE__ */ sr({
	__name: "DeployPage",
	setup(e) {
		let t = ws(), n = lc(), r = /* @__PURE__ */ z([]), i = /* @__PURE__ */ z([]), a = /* @__PURE__ */ z(!1), o = /* @__PURE__ */ z(""), s = /* @__PURE__ */ z(""), c = /* @__PURE__ */ z(""), l, u, d = 0, f = 0, p = !1, m = X(() => new Map(n.devices.value.map((e) => [e.id, e])));
		function h(e) {
			return (e.state === "published" || e.state === "synced") && e.manifest_state === "verified" && e.refresh_state === "acknowledged" && e.runtime_state === "verified";
		}
		function g(e) {
			return [
				"failed",
				"exhausted",
				"archive_invalid",
				"rejected",
				"hash_mismatch",
				"role_changed"
			].includes(e.state) ? "studio-status-failed" : h(e) ? "studio-status-success" : e.state === "offline" || e.state === "credentials_required" || e.state === "not_covered" || e.state === "pending" || e.state === "quarantined" || e.state === "staging_blocked" ? "studio-status-warning" : "studio-status-muted";
		}
		function _(e, n, r) {
			return !p && !e.signal.aborted && u === e && r === f && t.selectedId.value === n;
		}
		async function v() {
			let e = t.selectedId.value;
			l?.abort();
			let s = new AbortController();
			l = s;
			let c = ++d;
			if (r.value = [], i.value = [], a.value = !!e, o.value = "", e) try {
				let [a, o] = await Promise.all([
					$.models(e, { limit: 50 }, s.signal),
					$.deploymentStatus(e, s.signal),
					n.load()
				]);
				if (s.signal.aborted || c !== d || t.selectedId.value !== e) return;
				r.value = a.items, i.value = o;
			} catch (e) {
				!s.signal.aborted && c === d && (o.value = e instanceof Error ? e.message : "Deployment history could not be loaded.");
			} finally {
				!s.signal.aborted && c === d && (a.value = !1);
			}
		}
		async function y(e) {
			let n = t.selectedId.value;
			if (!n) return;
			u?.abort();
			let r = new AbortController();
			u = r;
			let a = ++f;
			c.value = e.id, o.value = "";
			try {
				let t = await $.publish(n, e.id, r.signal);
				_(r, n, a) && (i.value = t, s.value = "Publication requested for registered leader and standalone targets.");
			} catch (e) {
				_(r, n, a) && (o.value = e instanceof Error ? e.message : "Publication failed.");
			} finally {
				_(r, n, a) && (c.value = "");
			}
		}
		return H(() => t.selectedId.value, () => {
			u?.abort(), u = void 0, f += 1, c.value = "", s.value = "", v();
		}, { immediate: !0 }), Er(() => {
			p = !0, l?.abort(), u?.abort(), f += 1;
		}), (e, l) => (G(), K("section", null, [
			l[5] ||= q("div", { class: "mb-4" }, [q("h1", null, "Deploy"), q("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			s.value ? (G(), K("p", cf, I(s.value), 1)) : Y("", !0),
			o.value ? (G(), K("p", lf, I(o.value), 1)) : Y("", !0),
			q("p", uf, [q("a", {
				href: B(t).routes.href("kiosks"),
				onClick: l[0] ||= Yo((e) => B(t).routes.navigate("kiosks"), ["prevent"])
			}, "Manage kiosks →", 8, df)]),
			q("section", ff, [l[1] ||= q("h2", null, "Archived model versions", -1), a.value ? (G(), K("p", pf, "Loading archives…")) : r.value.length ? (G(), K("div", mf, [(G(!0), K(W, null, U(r.value, (e) => (G(), K("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [q("div", gf, [q("div", _f, [
				e.run_number ? (G(), K("p", vf, "Run #" + I(e.run_number), 1)) : Y("", !0),
				q("strong", null, [q("time", {
					datetime: e.trained_at,
					title: B(Ts)(e.trained_at)
				}, I(B(Ts)(e.trained_at)), 9, yf)]),
				e.origin === "legacy" ? (G(), K("p", bf, "Legacy import · " + I(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : Y("", !0)
			]), q("div", xf, [q("a", {
				class: "studio-button",
				href: B($).archiveUrl(e.word_id, e.id)
			}, "Download", 8, Sf), q("button", {
				type: "button",
				class: "studio-primary",
				disabled: c.value === e.id,
				onClick: (t) => y(e)
			}, I(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, Cf)])]), B(vs)(e.metrics).recall === null ? Y("", !0) : (G(), K("p", wf, "Recall " + I(B(vs)(e.metrics).recall), 1))], 8, hf))), 128))])) : (G(), K("p", Tf, "No archived model versions for this workspace."))]),
			q("section", Ef, [
				l[3] ||= q("h2", null, "Target delivery", -1),
				l[4] ||= q("p", { class: "studio-muted" }, "Delivery status for the requested training run. Delivery does not verify which model is active for detection.", -1),
				(G(!0), K(W, null, U(i.value, (e) => (G(), K("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [q("div", null, [
					q("strong", null, I(B(n).deviceLabel(e.device_id)), 1),
					l[2] ||= J(),
					m.value.get(e.device_id)?.role === "follower" ? (G(), K("span", Of, "Follower")) : Y("", !0)
				]), q("div", null, [q("div", kf, [q("span", { class: F(["studio-status", g(e)]) }, I(e.state), 3), q("span", Af, I(e.run_number ? `Run #${e.run_number}` : "Run unavailable"), 1)]), e.error_code ? (G(), K("p", jf, [J("Retry/error: " + I(e.error_code), 1), e.next_retry ? (G(), K("span", Mf, " · next " + I(B(Ts)(e.next_retry)), 1)) : Y("", !0)])) : Y("", !0)])], 8, Df))), 128)),
				i.value.length ? Y("", !0) : (G(), K("p", Nf, "No publication status yet."))
			])
		]));
	}
});
//#endregion
//#region src/studio/datasetFormat.ts
function Ff(e) {
	return e == null ? "Size unknown" : `${Number((e / 1e9).toPrecision(4))} GB`;
}
function If(e) {
	return e == null ? "Sample count unknown" : `${e.toLocaleString()} samples`;
}
//#endregion
//#region src/studio/components/AugmentationDatasets.vue?vue&type=script&setup=true&lang.ts
var Lf = {
	"data-augmentation-datasets": "",
	class: "studio-card mt-4"
}, Rf = { class: "studio-toolbar" }, zf = ["disabled"], Bf = ["disabled"], Vf = {
	key: 0,
	class: "studio-muted mt-3"
}, Hf = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, Uf = ["data-augmentation-id"], Wf = { class: "studio-dataset-row" }, Gf = { class: "studio-checkbox-label" }, Kf = [
	"disabled",
	"checked",
	"onChange"
], qf = { class: "studio-dataset-copy" }, Jf = { class: "studio-muted text-xs" }, Yf = { class: "studio-muted text-xs" }, Xf = { class: "studio-dataset-actions" }, Zf = [
	"aria-busy",
	"disabled",
	"onClick"
], Qf = ["onClick"], $f = {
	key: 0,
	class: "studio-note text-xs mt-3",
	role: "alert"
}, ep = /* @__PURE__ */ sr({
	__name: "AugmentationDatasets",
	emits: ["catalog"],
	setup(e, { emit: t }) {
		let n = t, r = ws(), i = X(() => r.selectedId.value), a = Vc(), o = /* @__PURE__ */ z(null), s = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(!1), d = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), f, p, m = /* @__PURE__ */ new Set(), h = !1;
		function g(e) {
			o.value = e, n("catalog", e);
		}
		async function _(e = !0) {
			f?.abort();
			let t = new AbortController();
			f = t, u.value = !0;
			let n = i.value;
			try {
				let r = await (n ? $.wakewordAugmentationDatasets(n, t.signal) : $.augmentationDatasets(t.signal));
				!t.signal.aborted && n === i.value && (g(r), e || (s.value = new Set(r.items.filter((e) => e.selected).map((e) => e.id))), l.value = "");
			} catch (e) {
				t.signal.aborted || (l.value = e instanceof Error ? e.message : "Unable to load augmentation datasets.");
			} finally {
				t.signal.aborted || (u.value = !1);
			}
		}
		function v(e, t) {
			let n = new Set(s.value);
			t ? n.add(e) : n.delete(e), s.value = n;
		}
		async function y() {
			let e = i.value;
			if (!e || c.value) return;
			p?.abort();
			let t = new AbortController();
			p = t, c.value = !0, l.value = "";
			try {
				let n = await $.selectAugmentationDatasets(e, [...s.value].sort(), t.signal);
				!t.signal.aborted && e === i.value && g(n);
			} catch (e) {
				t.signal.aborted || (l.value = e instanceof Error ? e.message : "Augmentation selection was not saved.");
			} finally {
				t.signal.aborted || (c.value = !1);
			}
		}
		function b(e) {
			let t = Object.values(a.jobs.value).filter((t) => t.kind === "download" && t.payload.augmentation_id === e.id).sort((e, t) => e.created_at.localeCompare(t.created_at)).at(-1);
			if (e.job_id && t?.id !== e.job_id && (!e.job_created_at || !t || t.created_at <= e.job_created_at)) {
				let t = a.jobs.value[e.job_id];
				return t?.kind === "download" ? t : void 0;
			}
			return t;
		}
		function x(e) {
			if (e.status === "installed") return "installed";
			let t = b(e);
			return t && t.status !== "complete" ? t.status : e.status;
		}
		function S(e) {
			if (e.status === "installed") return "";
			let t = b(e)?.result;
			return ls(t && "error_code" in t ? t.error_code : e.error_code);
		}
		function C(e) {
			return b(e)?.id ?? e.job_id;
		}
		function w(e) {
			return d.value.has(e.id) || [
				"queued",
				"running",
				"cancelling"
			].includes(x(e));
		}
		async function T(e) {
			if (w(e)) return;
			let t = new AbortController();
			m.add(t), d.value = /* @__PURE__ */ new Set([...d.value, e.id]), l.value = "";
			try {
				let n = await $.downloadAugmentation(e.id, t.signal);
				!h && !t.signal.aborted && (o.value && (o.value.items = o.value.items.map((t) => t.id === e.id ? {
					...t,
					status: n.status,
					job_id: n.id,
					job_created_at: n.created_at,
					error_code: null
				} : t)), a.track(n));
			} catch (e) {
				t.signal.aborted || (l.value = e instanceof Error ? e.message : "Unable to start augmentation download.");
			} finally {
				m.delete(t);
				let n = new Set(d.value);
				n.delete(e.id), d.value = n;
			}
		}
		return H(() => Object.values(a.jobs.value).filter((e) => e.kind === "download" && e.payload.augmentation_id).map((e) => ({
			id: e.id,
			active: Rc(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && _();
		}), H(i, () => {
			p?.abort(), c.value = !1, s.value = /* @__PURE__ */ new Set(), o.value = null, l.value = "", _(!1);
		}, { immediate: !0 }), Er(() => {
			h = !0, f?.abort(), p?.abort(), m.forEach((e) => e.abort());
		}), (e, t) => (G(), K("section", Lf, [
			q("div", Rf, [
				t[1] ||= q("h2", null, "Augmentation datasets", -1),
				q("button", {
					type: "button",
					disabled: u.value,
					onClick: t[0] ||= (e) => _()
				}, "Refresh status", 8, zf),
				q("button", {
					type: "button",
					"data-action": "save-augmentation",
					class: "studio-primary studio-selection-action",
					disabled: c.value || u.value || !i.value || !o.value,
					onClick: y
				}, I(c.value ? "Saving…" : "Save selection"), 9, Bf)
			]),
			t[2] ||= q("p", { class: "studio-muted mt-3" }, "Downloads are shared; select usage per wakeword. All are enabled by default. Training mixes selected backgrounds and room echoes into your samples before creating model features.", -1),
			u.value && !o.value ? (G(), K("p", Vf, "Checking augmentation datasets…")) : Y("", !0),
			l.value ? (G(), K("p", Hf, I(l.value), 1)) : Y("", !0),
			(G(!0), K(W, null, U(o.value?.items ?? [], (e) => (G(), K("article", {
				key: e.id,
				"data-augmentation-id": e.id,
				class: "studio-history mt-3"
			}, [q("div", Wf, [q("label", Gf, [q("input", {
				type: "checkbox",
				disabled: !i.value || c.value,
				checked: s.value.has(e.id),
				onChange: (t) => v(e.id, t.target.checked)
			}, null, 40, Kf), q("div", qf, [
				q("strong", null, I(e.name), 1),
				q("p", Jf, I(e.description) + " · " + I(e.source), 1),
				q("p", Yf, I(B(Ff)(e.installed_bytes ?? e.download_bytes)) + I(e.installed_bytes === null ? "" : " installed") + " · " + I(B(If)(e.file_count)), 1)
			])]), q("div", Xf, [
				q("span", { class: F(["studio-status", `studio-status-${x(e)}`]) }, I(x(e)), 3),
				x(e) === "installed" ? Y("", !0) : (G(), K("button", {
					key: 0,
					type: "button",
					"aria-busy": w(e),
					disabled: w(e),
					onClick: (t) => T(e)
				}, I(w(e) ? "Preparing…" : [
					"failed",
					"cancelled",
					"interrupted"
				].includes(x(e)) ? "Retry download" : "Download & prepare"), 9, Zf)),
				C(e) ? (G(), K("button", {
					key: 1,
					type: "button",
					onClick: (t) => B(a).show(C(e))
				}, "View in queue", 8, Qf)) : Y("", !0)
			])]), S(e) ? (G(), K("p", $f, I(S(e)), 1)) : Y("", !0)], 8, Uf))), 128))
		]));
	}
}), tp = {
	key: 0,
	"data-disk-warning": "",
	class: "studio-note mb-4",
	role: "status"
}, np = { class: "studio-card" }, rp = { class: "studio-toolbar" }, ip = ["disabled"], ap = {
	key: 0,
	class: "studio-muted mt-3"
}, op = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, sp = {
	key: 2,
	class: "studio-table mt-3 grid gap-3"
}, cp = { class: "studio-dataset-row" }, lp = { class: "studio-checkbox-label" }, up = [
	"data-dataset-id",
	"checked",
	"onChange"
], dp = { class: "studio-dataset-copy" }, fp = { class: "studio-muted text-xs" }, pp = { class: "studio-muted text-xs" }, mp = {
	key: 0,
	class: "studio-note block text-xs"
}, hp = { class: "studio-dataset-actions" }, gp = [
	"aria-busy",
	"disabled",
	"onClick"
], _p = ["onClick"], vp = {
	key: 3,
	class: "studio-muted mt-3"
}, yp = /* @__PURE__ */ sr({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = ws(), n = Vc(), r = /* @__PURE__ */ z([]), i = /* @__PURE__ */ z(0), a = /* @__PURE__ */ z(0), o = /* @__PURE__ */ z(null), s = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(!1), u = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), d = /* @__PURE__ */ z(""), f = /* @__PURE__ */ new Map(), p, m, h = 0, g = 0, _ = 0, v = X(() => t.selectedId.value), y = X(() => [...s.value].sort());
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
			m?.abort(), f.forEach((e) => e.abort()), f.clear(), m = void 0, g += 1, _ += 1, l.value = !1, u.value = /* @__PURE__ */ new Set();
		}
		function w(e) {
			return n.activeJobs.value.find((t) => t.kind === "download" && t.payload.dataset_id === e.id) ?? (e.job_id ? n.jobs.value[e.job_id] : void 0);
		}
		function T(e) {
			let t = w(e);
			return t?.status === "complete" ? "installed" : t?.status ?? e.status;
		}
		function E(e) {
			return u.value.has(e.id) || [
				"queued",
				"running",
				"cancelling"
			].includes(T(e));
		}
		async function D(e, t) {
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
		async function O(e = !1) {
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++h, o = v.value;
			if (r.value = [], i.value = 0, e || (s.value = /* @__PURE__ */ new Set()), d.value = "", o) {
				c.value = !0;
				try {
					let c = {
						offset: a.value,
						limit: 50
					}, [l, u] = await Promise.all([$.datasets(o, c, t.signal), D(o, t)]);
					if (!b(o, n, t)) return;
					r.value = l.items, i.value = l.total, e || (s.value = new Set(u.map((e) => e.id)));
				} catch (e) {
					b(o, n, t) && (d.value = e instanceof Error ? e.message : "Unable to load datasets.");
				} finally {
					b(o, n, t) && (c.value = !1);
				}
			}
		}
		function k(e, t) {
			let n = new Set(s.value);
			t ? n.add(e) : n.delete(e), s.value = n;
		}
		async function A() {
			let e = v.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++g, r = y.value;
			l.value = !0, d.value = "";
			try {
				await $.selectDatasets(e, r, t.signal), x(e, n, t) && await O();
			} catch (r) {
				x(e, n, t) && (d.value = r instanceof Error ? r.message : "Dataset selection was not saved.");
			} finally {
				x(e, n, t) && (l.value = !1);
			}
		}
		async function ee(e) {
			let t = v.value;
			if (!t || E(e)) return;
			let i = new AbortController();
			f.set(e.id, i);
			let a = _;
			u.value = /* @__PURE__ */ new Set([...u.value, e.id]), d.value = "";
			try {
				let o = await $.downloadDataset(e.id, i.signal);
				S(t, a, i) && (n.track(o), r.value = r.value.map((t) => t.id === e.id ? {
					...t,
					status: o.status,
					job_id: o.id
				} : t));
			} catch (e) {
				S(t, a, i) && (d.value = e instanceof Error ? e.message : "Dataset download was not started.");
			} finally {
				if (S(t, a, i)) {
					f.delete(e.id);
					let t = new Set(u.value);
					t.delete(e.id), u.value = t;
				}
			}
		}
		return H(() => Object.values(n.jobs.value).filter((e) => e.kind === "download").map((e) => ({
			id: e.id,
			active: Rc(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && O(!0);
		}), H(v, () => {
			C(), O();
		}, { immediate: !0 }), H(a, () => {
			O();
		}), Er(() => {
			p?.abort(), C();
		}), (e, t) => (G(), K("section", null, [
			t[4] ||= q("div", { class: "mb-4" }, [q("h1", null, "Downloaded"), q("p", { class: "studio-muted" }, "Download shared training resources. Choose negative, evaluation, and augmentation datasets per wakeword; all are enabled by default.")], -1),
			o.value && o.value.storage_total_bytes > 0 && o.value.storage_free_bytes / o.value.storage_total_bytes < .1 ? (G(), K("p", tp, "Disk space is low: " + I(B(Ff)(o.value.storage_free_bytes)) + " free of " + I(B(Ff)(o.value.storage_total_bytes)) + " on the data volume. Free space before downloading large datasets or starting training.", 1)) : Y("", !0),
			q("div", np, [
				t[2] ||= q("h2", null, "Negative & evaluation datasets", -1),
				t[3] ||= q("p", { class: "studio-muted mb-3" }, "Downloads are shared. Save a separate classifier selection for each wakeword.", -1),
				q("div", rp, [q("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary studio-selection-action",
					disabled: l.value || !v.value,
					onClick: A
				}, I(l.value ? "Saving…" : "Save selection"), 9, ip)]),
				c.value ? (G(), K("p", ap, "Loading catalog…")) : Y("", !0),
				d.value ? (G(), K("p", op, I(d.value), 1)) : Y("", !0),
				r.value.length ? (G(), K("div", sp, [(G(!0), K(W, null, U(r.value, (e) => (G(), K("article", {
					key: e.id,
					class: "studio-history"
				}, [q("div", cp, [q("label", lp, [q("input", {
					"data-dataset-id": e.id,
					type: "checkbox",
					checked: s.value.has(e.id),
					onChange: (t) => k(e.id, t.target.checked)
				}, null, 40, up), q("div", dp, [
					q("strong", null, I(e.name), 1),
					q("p", fp, I(e.description) + " · " + I(e.source), 1),
					q("p", pp, I(B(Ff)(e.installed_bytes ?? e.download_bytes)) + I(e.installed_bytes === null ? "" : " installed") + " · " + I(B(If)(e.sample_count)), 1),
					e.split === "evaluation" ? (G(), K("span", mp, "Evaluation-only: this dataset is not sampled as a training input.")) : Y("", !0)
				])]), q("div", hp, [
					q("span", { class: F(["studio-status", `studio-status-${T(e)}`]) }, I(T(e)), 3),
					T(e) === "installed" ? Y("", !0) : (G(), K("button", {
						key: 0,
						type: "button",
						"aria-busy": E(e),
						disabled: E(e),
						onClick: (t) => ee(e)
					}, I(E(e) ? "Downloading…" : "Download"), 9, gp)),
					w(e)?.id || e.job_id ? (G(), K("button", {
						key: 1,
						type: "button",
						"data-action": "view-dataset-job",
						onClick: (t) => B(n).show(w(e)?.id ?? e.job_id)
					}, "View in queue", 8, _p)) : Y("", !0)
				])])]))), 128))])) : c.value ? Y("", !0) : (G(), K("p", vp, "No catalog datasets are available.")),
				pa(mc, {
					total: i.value,
					offset: a.value,
					limit: 50,
					loading: c.value,
					onPage: t[0] ||= (e) => a.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			]),
			pa(ep, { onCatalog: t[1] ||= (e) => o.value = e })
		]));
	}
}), bp = { class: "studio-card" }, xp = {
	"data-generation-phrase": "",
	class: "studio-muted"
}, Sp = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, Cp = ["value"], wp = ["value"], Tp = ["disabled"], Ep = ["value"], Dp = {
	key: 1,
	value: "mixed"
}, Op = { class: "grid gap-3 sm:grid-cols-2" }, kp = { class: "flex items-center justify-between gap-3" }, Ap = { class: "studio-checkbox-label" }, jp = [
	"data-engine",
	"disabled",
	"checked",
	"onChange"
], Mp = [
	"data-preview",
	"aria-busy",
	"disabled",
	"onClick"
], Np = {
	key: 0,
	class: "studio-muted text-xs mt-2"
}, Pp = {
	key: 1,
	role: "alert",
	class: "studio-note mt-3"
}, Fp = ["onClick"], Ip = [
	"data-preview-audio",
	"src",
	"aria-label"
], Lp = {
	key: 0,
	class: "studio-history"
}, Rp = { class: "studio-checkbox-label" }, zp = ["checked"], Bp = {
	key: 0,
	class: "studio-muted"
}, Vp = {
	key: 1,
	"data-source-picker": ""
}, Hp = {
	key: 0,
	role: "alert"
}, Up = [
	"data-source",
	"checked",
	"disabled",
	"onChange"
], Wp = { key: 1 }, Gp = { class: "studio-muted text-xs" }, Kp = ["aria-busy", "disabled"], qp = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, Jp = { class: "studio-card mt-4" }, Yp = { class: "flex flex-wrap items-center justify-between gap-3" }, Xp = ["disabled"], Zp = {
	key: 0,
	class: "studio-muted mt-3"
}, Qp = { class: "studio-dataset-row" }, $p = { class: "studio-checkbox-label" }, em = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], tm = { class: "studio-muted block text-xs" }, nm = {
	key: 0,
	class: "studio-muted block text-xs"
}, rm = [
	"data-delete-batch",
	"disabled",
	"onClick"
], im = {
	key: 0,
	class: "studio-muted text-xs"
}, am = { class: "flex gap-2 mt-3" }, om = ["disabled"], sm = ["disabled"], cm = {
	key: 1,
	class: "studio-muted mt-3"
}, lm = /* @__PURE__ */ sr({
	__name: "ArtificialPage",
	setup(e) {
		let t = ws(), n = Vc(), r = X(() => n.activeJobs.value.some((e) => e.kind === "generation" && e.word_id === N.value));
		function i(e) {
			return !!g.value[e] || n.activeJobs.value.some((t) => t.kind === "preview" && t.word_id === N.value && t.payload.recipe.engines?.includes(e));
		}
		let a = /* @__PURE__ */ z([]), o = /* @__PURE__ */ z([]), s = /* @__PURE__ */ z(0), c = /* @__PURE__ */ z(0), l = /* @__PURE__ */ z({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), u = /* @__PURE__ */ z(/* @__PURE__ */ new Set()), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(!1), p = /* @__PURE__ */ z(""), m = /* @__PURE__ */ z(null), h = /* @__PURE__ */ z({}), g = /* @__PURE__ */ z({}), _ = /* @__PURE__ */ z({}), v = /* @__PURE__ */ z(null), y = /* @__PURE__ */ z({}), b = /* @__PURE__ */ z([]), x = /* @__PURE__ */ z(0), S = /* @__PURE__ */ z(0), C = /* @__PURE__ */ z(!1), w = /* @__PURE__ */ z(""), T, E = X(() => l.value.engines?.includes("moss")), D = X(() => l.value.engines?.filter((e) => e !== "moss").length ?? 0), O = X(() => D.value * l.value.samples + (E.value ? l.value.moss_samples ?? l.value.samples : 0));
		async function k() {
			T?.abort();
			let e = new AbortController();
			T = e;
			let t = N.value, n = l.value.language;
			b.value = [], x.value = 0, w.value = "", C.value = !0;
			try {
				if (!t) return;
				let r = await $.generationSources(t, {
					language: n,
					offset: S.value,
					limit: 50
				}, e.signal);
				if (e.signal.aborted || N.value !== t || l.value.language !== n) return;
				b.value = r.items, x.value = r.total;
			} catch (t) {
				e.signal.aborted || (w.value = t instanceof Error ? t.message : "Unable to load sources.");
			} finally {
				T === e && (C.value = !1);
			}
		}
		function A(e, t) {
			let n = new Set(l.value.moss_source_batch_ids ?? []);
			t ? n.add(e) : n.delete(e), l.value.moss_source_batch_ids = [...n];
		}
		function ee(e) {
			l.value.moss_after_current = e, l.value.moss_source_batch_ids = [];
		}
		let te = /* @__PURE__ */ new Map(), j = {
			omnivoice: "OmniVoice",
			qwen3: "Qwen3-TTS",
			moss: "MOSS-TTS",
			piper: "Piper"
		}, ne, M, re = 0, ie = 0, ae = !1, N = X(() => t.selectedId.value), oe = X(() => t.selected.value), se = X(() => a.value.find((e) => e.language === l.value.language) ?? null), ce = X(() => se.value?.engines.hybrid ?? []), P = X(() => se.value?.model_availability ?? ce.value.map((e) => ({
			engine: e,
			supported: !0,
			available: !0,
			reason: null
		}))), le = X(() => !!se.value?.accent_applies && l.value.engines?.some((e) => e !== "piper"));
		function ue(e, t, n) {
			return N.value === e && re === t && !n.signal.aborted;
		}
		function de(e, t, n) {
			return N.value === e && ie === t && !n.signal.aborted;
		}
		let fe = ["omnivoice", "qwen3"];
		function pe() {
			if (!se.value) return;
			let e = l.value.engines ?? fe;
			l.value.engines = e.filter((e) => ce.value.includes(e)), le.value || (l.value.english_accent = "mixed");
		}
		function me() {
			T?.abort(), y.value = {}, b.value = [], x.value = 0, M?.abort(), M = void 0, ie += 1, f.value = !1, m.value = null, v.value = null;
			for (let e of te.values()) e.abort();
			te.clear(), h.value = {}, g.value = {}, _.value = {};
		}
		async function he() {
			ne?.abort();
			let e = new AbortController();
			ne = e;
			let t = ++re, n = N.value;
			if (o.value = [], s.value = 0, p.value = "", n) {
				d.value = !0;
				try {
					let [r, i, d, f, p, m] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(n, e.signal).catch((e) => e instanceof hs && e.status === 404 ? null : Promise.reject(e)),
						$.batches(n, {
							offset: c.value,
							limit: 50
						}, e.signal),
						ae ? Promise.resolve(null) : $.batchSelection(n, e.signal),
						$.wakeword(n, e.signal),
						$.generationDefaults(e.signal)
					]);
					if (!ue(n, t, e)) return;
					a.value = r, ae || (l.value = i ?? {
						language: p.language,
						english_accent: "mixed",
						tts_mode: "hybrid",
						...m
					}, pe(), u.value = new Set(f ?? []), ae = !0, l.value.moss_samples ??= l.value.samples, l.value.moss_source_batch_ids ??= [], l.value.moss_after_current ??= D.value > 0, k()), o.value = d.items, s.value = d.total;
				} catch (r) {
					ue(n, t, e) && (p.value = r instanceof Error ? r.message : "Unable to load generation settings.");
				} finally {
					ue(n, t, e) && (d.value = !1);
				}
			}
		}
		function ge(e) {
			l.value.language = e, l.value.moss_source_batch_ids = [], S.value = 0, pe(), k();
		}
		function _e(e, t) {
			let n = new Set(l.value.engines);
			t ? n.add(e) : n.delete(e), l.value.engines = [...n], n.has("moss") || (l.value.moss_after_current = !1, l.value.moss_source_batch_ids = []);
		}
		function ve() {
			return !Number.isInteger(l.value.samples) || l.value.samples < 1 ? (p.value = "Sample count must be a positive integer.", !1) : l.value.engines?.length ? !0 : (p.value = "Select at least one generation model.", !1);
		}
		async function ye() {
			let e = N.value;
			if (!e || f.value || r.value || !ve()) return;
			if (E.value && (!Number.isInteger(l.value.moss_samples) || (l.value.moss_samples ?? 0) < 1)) {
				p.value = "MOSS sample count must be a positive integer.";
				return;
			}
			if (E.value && (l.value.moss_after_current ? !D.value : !l.value.moss_source_batch_ids?.length)) {
				p.value = "Select completed MOSS sources or generate after current direct providers.";
				return;
			}
			M?.abort();
			let t = new AbortController();
			M = t;
			let i = ++ie, a = {
				...l.value,
				engines: [...l.value.engines],
				english_accent: le.value ? l.value.english_accent : "mixed",
				tts_mode: "hybrid"
			};
			f.value = !0, p.value = "";
			try {
				let r = await $.submitGeneration(e, a, t.signal);
				if (de(e, i, t)) {
					l.value = a;
					for (let e of r.jobs) y.value[e.id] = e, n.track(e);
					m.value = r.jobs[0] ?? null;
				}
			} catch (n) {
				de(e, i, t) && (p.value = n instanceof Error ? n.message : "Generation job was not started.");
			} finally {
				de(e, i, t) && (f.value = !1);
			}
		}
		async function be(e) {
			let t = N.value;
			if (!t || i(e)) return;
			te.get(e)?.abort();
			let r = new AbortController();
			te.set(e, r), g.value[e] = !0, _.value[e] = "", delete h.value[e];
			try {
				let i = await $.preview(t, {
					...l.value,
					moss_after_current: !1,
					moss_source_batch_ids: e === "moss" ? [...l.value.moss_source_batch_ids ?? []] : [],
					tts_mode: "hybrid",
					engines: [e],
					samples: 1,
					batch_size: 1,
					english_accent: se.value?.accent_applies && e !== "piper" ? l.value.english_accent : "mixed"
				}, r.signal);
				!r.signal.aborted && N.value === t && (h.value[e] = i, n.track(i));
			} catch (n) {
				!r.signal.aborted && N.value === t && (_.value[e] = n instanceof Error ? n.message : "Preview could not start.");
			} finally {
				te.get(e) === r && (g.value[e] = !1, te.delete(e));
			}
		}
		function xe(e, t) {
			h.value[e]?.id === t.id && (h.value[e] = t);
		}
		H(n.jobs, (e) => {
			let t = !1;
			for (let n of Object.values(e)) if (n.kind === "generation" && n.word_id === N.value) {
				let e = y.value[n.id];
				n.status === "complete" && e?.status !== "complete" && (t = !0), y.value[n.id] = n, m.value?.id === n.id && (m.value = n);
			}
			t && (c.value = 0, he(), k());
			for (let [t, n] of Object.entries(h.value)) {
				let r = e[n.id];
				r && r.word_id === N.value && xe(t, r);
			}
		}, { deep: !0 });
		function Se(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(u.value);
			t ? n.add(e.id) : n.delete(e.id), u.value = n;
		}
		async function Ce() {
			let e = N.value, t = v.value;
			if (!e || !t || f.value) return;
			M?.abort();
			let n = new AbortController();
			M = n;
			let r = ++ie;
			f.value = !0, p.value = "";
			try {
				if (await $.deleteBatch(e, t.id, n.signal), !de(e, r, n)) return;
				let i = new Set(u.value);
				i.delete(t.id), u.value = i, v.value = null, l.value.moss_source_batch_ids = l.value.moss_source_batch_ids?.filter((e) => e !== t.id) ?? [], S.value = 0, k(), o.value.length === 1 && c.value > 0 ? c.value = Math.max(0, c.value - 50) : await he();
			} catch (t) {
				de(e, r, n) && (p.value = t instanceof hs && t.status === 409 ? "Cancel queued or active workspace jobs before deleting this dataset." : t instanceof Error ? t.message : "Dataset was not deleted.");
			} finally {
				de(e, r, n) && (f.value = !1);
			}
		}
		async function L() {
			let e = N.value;
			if (!e || !ae || d.value) return;
			M?.abort();
			let t = new AbortController();
			M = t;
			let n = ++ie, r = [...u.value];
			f.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), de(e, n, t) && await he();
			} catch (r) {
				de(e, n, t) && (p.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				de(e, n, t) && (f.value = !1);
			}
		}
		return H(N, () => {
			me(), S.value = 0, ae = !1, u.value = /* @__PURE__ */ new Set(), l.value = {
				language: oe.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, c.value = 0, he();
		}, { immediate: !0 }), H(S, () => {
			k();
		}), H(c, () => {
			he();
		}), Er(() => {
			ne?.abort(), me();
		}), (e, t) => (G(), K("section", null, [
			t[23] ||= q("div", { class: "mb-4" }, [q("h1", null, "Artificial"), q("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			q("div", bp, [
				t[19] ||= q("h2", null, "Generate data", -1),
				q("p", xp, [t[10] ||= J("Wake phrase: ", -1), q("strong", null, I(oe.value?.phrase ?? "No workspace selected"), 1)]),
				q("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Yo(ye, ["prevent"])
				}, [
					q("div", Sp, [
						q("label", null, [t[11] ||= J("Language", -1), q("select", {
							name: "language",
							value: l.value.language,
							onChange: t[0] ||= (e) => ge(e.target.value)
						}, [(G(!0), K(W, null, U(a.value, (e) => (G(), K("option", {
							key: e.language,
							value: e.language
						}, I(e.name), 9, wp))), 128))], 40, Cp)]),
						q("label", null, [t[12] ||= J("English accent", -1), V(q("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => l.value.english_accent = e,
							disabled: !le.value
						}, [le.value ? (G(!0), K(W, { key: 0 }, U(se.value?.english_accents ?? [], (e) => (G(), K("option", {
							key: e.code,
							value: e.code
						}, I(e.label), 9, Ep))), 128)) : (G(), K("option", Dp, "Not applicable"))], 8, Tp), [[Ho, l.value.english_accent]])]),
						q("label", null, [t[13] ||= J("Samples per provider", -1), V(q("input", {
							"onUpdate:modelValue": t[2] ||= (e) => l.value.samples = e,
							name: "samples",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							zo,
							l.value.samples,
							void 0,
							{ number: !0 }
						]])])
					]),
					q("fieldset", null, [t[14] ||= q("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), q("div", Op, [(G(!0), K(W, null, U(P.value, (e) => (G(), K("article", {
						key: e.engine,
						class: "studio-history"
					}, [
						q("div", kp, [q("label", Ap, [q("input", {
							type: "checkbox",
							"data-engine": e.engine,
							disabled: !e.available,
							checked: l.value.engines?.includes(e.engine),
							onChange: (t) => _e(e.engine, t.target.checked)
						}, null, 40, jp), q("strong", null, I(j[e.engine] ?? e.engine), 1)]), q("button", {
							type: "button",
							"data-preview": e.engine,
							"aria-busy": i(e.engine),
							disabled: !e.available || e.engine === "moss" && (l.value.moss_after_current || !l.value.moss_source_batch_ids?.length) || i(e.engine) || !N.value,
							onClick: (t) => be(e.engine)
						}, I(i(e.engine) ? "Preparing preview…" : "Preview"), 9, Mp)]),
						e.reason ? (G(), K("p", Np, I(e.reason), 1)) : Y("", !0),
						_.value[e.engine] ? (G(), K("p", Pp, I(_.value[e.engine]), 1)) : Y("", !0),
						h.value[e.engine] && h.value[e.engine].status !== "complete" ? (G(), K("button", {
							key: 2,
							type: "button",
							onClick: (t) => B(n).show(h.value[e.engine].id)
						}, "View preview in queue", 8, Fp)) : Y("", !0),
						h.value[e.engine]?.status === "complete" ? (G(), K("audio", {
							key: 3,
							"data-preview-audio": e.engine,
							class: "mt-3 max-w-full",
							src: B($).previewAudioUrl(N.value, h.value[e.engine].id),
							controls: "",
							autoplay: "",
							"aria-label": `${j[e.engine] ?? e.engine} wakeword preview`
						}, null, 8, Ip)) : Y("", !0)
					]))), 128))])]),
					E.value ? (G(), K("fieldset", Lp, [
						t[18] ||= q("legend", null, "MOSS references", -1),
						q("label", null, [t[15] ||= J("MOSS samples", -1), V(q("input", {
							name: "moss-samples",
							"onUpdate:modelValue": t[3] ||= (e) => l.value.moss_samples = e,
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							zo,
							l.value.moss_samples,
							void 0,
							{ number: !0 }
						]])]),
						q("label", Rp, [q("input", {
							name: "moss-after-current",
							type: "checkbox",
							checked: l.value.moss_after_current,
							onChange: t[4] ||= (e) => ee(e.target.checked)
						}, null, 40, zp), t[16] ||= J("Generate after current selection", -1)]),
						l.value.moss_after_current ? (G(), K("p", Bp, "Uses only this submission’s direct providers after all succeed. Select completed sources instead to preview MOSS.")) : (G(), K("div", Vp, [
							t[17] ||= q("p", { class: "studio-muted" }, "Select completed direct-provider datasets. Training selection is independent. MOSS needs at least one distinct reference clip per requested sample; duplicate clips count once.", -1),
							w.value ? (G(), K("p", Hp, I(w.value), 1)) : Y("", !0),
							(G(!0), K(W, null, U(b.value, (e) => (G(), K("label", {
								key: e.id,
								class: "studio-checkbox-label"
							}, [q("input", {
								type: "checkbox",
								"data-source": e.id,
								checked: l.value.moss_source_batch_ids?.includes(e.id),
								disabled: !l.value.moss_source_batch_ids?.includes(e.id) && (l.value.moss_source_batch_ids?.length ?? 0) >= 100,
								onChange: (t) => A(e.id, t.target.checked)
							}, null, 40, Up), J(I(e.providers.map((e) => j[e] ?? e).join(", ")) + " · " + I(e.sample_count) + " clips · " + I(e.id), 1)]))), 128)),
							!C.value && !b.value.length ? (G(), K("p", Wp, "No eligible completed sources for this language.")) : Y("", !0),
							q("p", null, I(l.value.moss_source_batch_ids?.length ?? 0) + " sources selected (maximum 100).", 1),
							pa(mc, {
								total: x.value,
								offset: S.value,
								limit: 50,
								loading: C.value,
								onPage: t[5] ||= (e) => S.value = e
							}, null, 8, [
								"total",
								"offset",
								"loading"
							])
						]))
					])) : Y("", !0),
					q("p", Gp, "Each direct provider generates the full samples per provider count into a separate dataset. Requested total: " + I(O.value) + ". MOSS has its own count. Preview generates one sample without adding training data.", 1),
					q("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						"aria-busy": f.value || r.value,
						disabled: f.value || r.value || d.value || !N.value
					}, I(f.value ? "Starting…" : r.value ? "Generating…" : "Generate dataset"), 9, Kp)
				], 32),
				p.value ? (G(), K("p", qp, I(p.value), 1)) : Y("", !0),
				m.value ? (G(), K("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[6] ||= (e) => B(n).show(m.value.id)
				}, "View generation in queue")) : Y("", !0)
			]),
			q("div", Jp, [
				q("div", Yp, [t[20] ||= q("h2", null, "Generated datasets", -1), q("button", {
					type: "button",
					"data-action": "save-batches",
					class: "studio-selection-action",
					disabled: f.value || d.value || !N.value,
					onClick: L
				}, "Save selection", 8, Xp)]),
				t[22] ||= q("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				d.value ? (G(), K("p", Zp, "Loading datasets…")) : Y("", !0),
				(G(!0), K(W, null, U(o.value, (e) => (G(), K("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					q("div", Qp, [q("label", $p, [
						q("input", {
							"data-batch-id": e.id,
							type: "checkbox",
							checked: u.value.has(e.id),
							disabled: e.status !== "complete",
							onChange: (t) => Se(e, t.target.checked)
						}, null, 40, em),
						q("span", null, [
							q("strong", null, I(e.phrase), 1),
							q("span", tm, I(e.audio.length) + " samples · " + I(e.recipe.engines?.map((e) => j[e] ?? e).join(", ") || "Saved generation models") + " · " + I(B(Ts)(e.created_at)), 1),
							e.status === "complete" ? Y("", !0) : (G(), K("span", nm, I(e.status) + " — only completed datasets can be selected.", 1))
						]),
						q("span", { class: F(["studio-status ml-auto", `studio-status-${e.status}`]) }, I(e.status), 3)
					]), q("button", {
						type: "button",
						"data-delete-batch": e.id,
						disabled: f.value || [
							"queued",
							"running",
							"cancelling"
						].includes(e.status),
						onClick: (t) => v.value = e
					}, "Delete dataset", 8, rm)]),
					e.recipe.moss_source_batch_ids?.length ? (G(), K("p", im, "MOSS sources: " + I(e.recipe.moss_source_batch_ids.join(", ")), 1)) : Y("", !0),
					v.value?.id === e.id ? (G(), K("section", {
						key: 1,
						role: "alertdialog",
						"aria-label": "Delete generated dataset?",
						class: "studio-note mt-3",
						onKeydown: t[8] ||= Zo((e) => !f.value && (v.value = null), ["esc"])
					}, [
						q("h3", null, "Delete " + I(e.phrase) + " dataset permanently?", 1),
						t[21] ||= q("p", null, "This removes the generated dataset and its training selection. Historical training inputs and shared audio are kept.", -1),
						q("div", am, [q("button", {
							type: "button",
							"data-action": "cancel-batch-delete",
							disabled: f.value,
							onClick: t[7] ||= (e) => v.value = null
						}, "Cancel", 8, om), q("button", {
							type: "button",
							"data-action": "confirm-batch-delete",
							disabled: f.value,
							onClick: Ce
						}, I(f.value ? "Deleting…" : "Delete permanently"), 9, sm)])
					], 32)) : Y("", !0)
				]))), 128)),
				!d.value && !o.value.length ? (G(), K("p", cm, "No generated datasets yet. Choose models above to create one.")) : Y("", !0),
				pa(mc, {
					total: s.value,
					offset: c.value,
					limit: 50,
					loading: d.value,
					onPage: t[9] ||= (e) => c.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			])
		]));
	}
}), um = { class: "studio-card" }, dm = {
	key: 0,
	class: "studio-muted"
}, fm = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 my-4"
}, pm = { class: "studio-muted" }, mm = { class: "text-2xl font-semibold" }, hm = { class: "studio-muted" }, gm = { class: "text-2xl font-semibold" }, _m = { class: "studio-muted" }, vm = { class: "text-2xl font-semibold" }, ym = {
	"data-negative-datasets-count": "",
	class: "studio-muted"
}, bm = { class: "text-2xl font-semibold" }, xm = {
	key: 2,
	class: "studio-muted text-xs"
}, Sm = { class: "studio-card mt-4" }, Cm = { class: "grid gap-3 mt-3" }, wm = { class: "flex gap-2" }, Tm = ["disabled"], Em = ["aria-busy", "disabled"], Dm = {
	key: 0,
	"data-training-blocked": "",
	class: "studio-note text-xs",
	role: "alert"
}, Om = ["href"], km = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, Am = { class: "studio-card mt-4" }, jm = ["data-run-id"], Mm = { class: "flex justify-between items-center gap-3" }, Nm = { "data-run-number": "" }, Pm = {
	"data-run-time": "",
	class: "studio-muted block text-xs"
}, Fm = ["onClick"], Im = {
	key: 0,
	class: "studio-note text-xs"
}, Lm = {
	key: 1,
	class: "studio-note text-xs",
	role: "alert"
}, Rm = {
	key: 0,
	class: "studio-muted"
}, zm = /* @__PURE__ */ sr({
	__name: "TrainPage",
	setup(e) {
		let t = ws(), n = Vc(), r = /* @__PURE__ */ z(null), i = /* @__PURE__ */ z(!1), a = /* @__PURE__ */ z(""), o;
		async function s() {
			o?.abort();
			let e = new AbortController();
			o = e, i.value = !0;
			let t = E.value;
			if (r.value = null, !t) i.value = !1;
			else try {
				let n = await $.wakewordAugmentationDatasets(t, e.signal);
				!e.signal.aborted && E.value === t && (r.value = n, a.value = "");
			} catch (t) {
				e.signal.aborted || (r.value = null, a.value = t instanceof Error ? t.message : "Unable to check training prerequisites.");
			} finally {
				e.signal.aborted || (i.value = !1);
			}
		}
		let c = X(() => `#/online-datasets${E.value ? "?word=" + encodeURIComponent(E.value) : ""}`), l = X(() => {
			if (i.value || h.value) return "";
			if (a.value) return a.value;
			let e = [...r.value?.items.filter((e) => e.selected && e.status !== "installed") ?? [], ...A.value];
			return e.length ? `Download or deselect ${e.map((e) => e.name).join(", ")} before training.` : "";
		});
		function u(e) {
			return e.started_at ?? e.created_at;
		}
		let d = /* @__PURE__ */ z(null), f = /* @__PURE__ */ z({ training_steps: 4e4 }), p = /* @__PURE__ */ z([]), m = /* @__PURE__ */ z([]), h = /* @__PURE__ */ z(!1), g = /* @__PURE__ */ z(!1), _ = /* @__PURE__ */ z(!1), v = /* @__PURE__ */ z(""), y = /* @__PURE__ */ z(null), b, x, S, C = 0, w = 0, T = 0, E = X(() => t.selectedId.value), D = X(() => _.value || n.activeJobs.value.some((e) => e.kind === "train" && e.word_id === E.value)), O = X(() => m.value.filter((e) => e.selected && e.split !== "evaluation").length), k = X(() => m.value.filter((e) => e.selected && e.split === "evaluation").length), A = X(() => m.value.filter((e) => e.selected && e.status !== "installed"));
		function ee(e, t, n) {
			return E.value === e && C === t && !n.signal.aborted;
		}
		function te(e, t, n) {
			return E.value === e && w === t && !n.signal.aborted;
		}
		function j(e, t, n) {
			return E.value === e && T === t && !n.signal.aborted;
		}
		function ne() {
			x?.abort(), S?.abort(), x = void 0, S = void 0, w += 1, T += 1, g.value = !1, _.value = !1, y.value = null;
		}
		async function M(e, t) {
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
		function re(e) {
			return e.map((e) => {
				let t = n.jobs.value[e.id], r = t?.word_id === E.value ? t : e;
				return Rc(r) && !t && n.track(r), r;
			});
		}
		async function ie() {
			b?.abort();
			let e = new AbortController();
			b = e;
			let t = ++C, n = E.value;
			if (d.value = null, p.value = [], m.value = [], y.value = null, v.value = "", n) {
				h.value = !0;
				try {
					let [r, i, a, o] = await Promise.all([
						$.trainingCounts(n, e.signal),
						$.trainingSettings(n, e.signal),
						$.trainingRuns(n, { limit: 50 }, e.signal),
						M(n, e)
					]);
					if (!ee(n, t, e)) return;
					d.value = r, f.value = i, p.value = re(a.items), m.value = o;
				} catch (r) {
					ee(n, t, e) && (v.value = r instanceof Error ? r.message : "Unable to load training configuration.");
				} finally {
					ee(n, t, e) && (h.value = !1);
				}
			}
		}
		function ae() {
			return !Number.isInteger(f.value.training_steps) || f.value.training_steps < 1 || f.value.training_steps > 1e7 ? (v.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function N() {
			let e = E.value;
			if (!e || !ae()) return;
			x?.abort();
			let t = new AbortController();
			x = t;
			let n = ++w, r = { training_steps: f.value.training_steps };
			g.value = !0, v.value = "";
			try {
				let i = await $.saveTrainingSettings(e, r, t.signal);
				te(e, n, t) && (f.value = i);
			} catch (r) {
				te(e, n, t) && (v.value = r instanceof Error ? r.message : "Training settings were not saved.");
			} finally {
				te(e, n, t) && (g.value = !1);
			}
		}
		async function oe() {
			let e = E.value;
			if (!e || D.value || !r.value?.ready || i.value) return;
			S?.abort();
			let t = new AbortController();
			S = t;
			let a = ++T;
			_.value = !0, v.value = "";
			try {
				let r = await $.train(e, t.signal);
				j(e, a, t) && (y.value = r, p.value = [r, ...p.value.filter((e) => e.id !== r.id)], n.track(r));
			} catch (n) {
				j(e, a, t) && (v.value = n instanceof Error ? n.message : "Training job was not started.");
			} finally {
				j(e, a, t) && (_.value = !1);
			}
		}
		function se(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return H(n.jobs, (e) => {
			p.value = p.value.map((t) => e[t.id]?.word_id === E.value ? e[t.id] : t);
		}, { deep: !0 }), H(() => Object.values(n.jobs.value).filter((e) => e.kind === "download" && e.payload.augmentation_id).map((e) => ({
			id: e.id,
			active: Rc(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && s();
		}), Er(() => {
			o?.abort();
		}), H(E, () => {
			ne(), ie(), s();
		}, { immediate: !0 }), Er(() => {
			b?.abort(), x?.abort(), S?.abort();
		}), (e, t) => (G(), K("section", null, [
			t[11] ||= q("div", { class: "mb-4" }, [q("h1", null, "Train"), q("p", { class: "studio-muted" }, "Configure inputs and start a manual training run. Progress and logs are available in the global job queue.")], -1),
			q("div", um, [
				t[6] ||= q("h2", null, "Effective inputs for the next snapshot", -1),
				h.value ? (G(), K("p", dm, "Loading effective inputs…")) : d.value ? (G(), K("div", fm, [
					q("p", pm, [q("strong", mm, I(d.value.positive), 1), t[2] ||= J(" reviewed positives", -1)]),
					q("p", hm, [q("strong", gm, I(d.value.negative), 1), t[3] ||= J(" reviewed negatives", -1)]),
					q("p", _m, [q("strong", vm, I(d.value.artificial), 1), t[4] ||= J(" selected artificial", -1)]),
					q("p", ym, [q("strong", bm, I(O.value), 1), t[5] ||= J(" selected negative datasets", -1)])
				])) : Y("", !0),
				!h.value && d.value && k.value ? (G(), K("p", xm, I(k.value) + " evaluation-only " + I(k.value === 1 ? "dataset" : "datasets") + " selected separately; not sampled for training.", 1)) : Y("", !0),
				t[7] ||= q("p", { class: "studio-muted text-xs" }, "Training uses reviewed positive/negative samples, completed selected artificial batches, and selected external negative datasets. Dataset totals count datasets, not individual audio samples. Pending and discarded recordings are not training inputs.", -1)
			]),
			q("div", Sm, [
				t[9] ||= q("h2", null, "Training parameters", -1),
				q("div", Cm, [
					q("label", null, [t[8] ||= J("Training steps", -1), V(q("input", {
						"onUpdate:modelValue": t[0] ||= (e) => f.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						zo,
						f.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					q("div", wm, [q("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: g.value,
						onClick: N
					}, I(g.value ? "Saving…" : "Save parameters"), 9, Tm), q("button", {
						type: "button",
						"data-action": "start-training",
						"aria-busy": D.value,
						disabled: !E.value || D.value || i.value || !r.value?.ready || h.value || A.value.length > 0,
						onClick: oe
					}, I(_.value ? "Starting…" : D.value ? "Training…" : "Start training"), 9, Em)]),
					l.value ? (G(), K("p", Dm, [J(I(l.value) + " ", 1), q("a", { href: c.value }, "Open Downloaded", 8, Om)])) : Y("", !0)
				]),
				v.value ? (G(), K("p", km, I(v.value), 1)) : Y("", !0),
				y.value ? (G(), K("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[1] ||= (e) => B(n).show(y.value.id)
				}, "View training in queue")) : Y("", !0)
			]),
			q("div", Am, [
				t[10] ||= q("h2", null, "Run history", -1),
				(G(!0), K(W, null, U(p.value, (e) => (G(), K("article", {
					key: e.id,
					class: "studio-history mt-3",
					"data-run-id": e.id
				}, [
					q("div", Mm, [
						q("span", null, [q("strong", Nm, I(e.run_number ? `Run #${e.run_number}` : "Run"), 1), q("span", Pm, I(B(Ts)(u(e))), 1)]),
						q("span", { class: F(["studio-status ml-auto", `studio-status-${e.status}`]) }, I(e.status), 3),
						q("button", {
							type: "button",
							onClick: (t) => B(n).show(e.id)
						}, "View in queue", 8, Fm)
					]),
					se(e) ? (G(), K("p", Im, "Skipped because inputs and configuration were unchanged.")) : Y("", !0),
					B(ds)(e) ? (G(), K("p", Lm, I(B(ds)(e)), 1)) : Y("", !0)
				], 8, jm))), 128)),
				!h.value && !p.value.length ? (G(), K("p", Rm, "No training runs for this workspace yet.")) : Y("", !0)
			])
		]));
	}
}), Bm = {
	viewBox: "0 0 780 260",
	role: "img",
	"aria-label": "Live detection probability over the last eight seconds, with a dashed threshold and red trace above threshold",
	class: "probability-graph"
}, Vm = ["height"], Hm = ["y1", "y2"], Um = ["y"], Wm = ["y1", "y2"], Gm = ["points"], Km = ["points", "clip-path"], qm = /*@__PURE__*/ sr({
	__name: "ProbabilityGraph",
	props: {
		samples: {},
		threshold: {}
	},
	setup(e) {
		let t = e, n = `probability-${cr().replace(/[^a-zA-Z0-9_-]/g, "")}`, r = (e) => Number((24 + (1 - e) * 180).toFixed(3)), i = X(() => t.samples.at(-1)?.seconds ?? 0), a = X(() => t.samples.filter((e) => e.seconds >= i.value - 8).map((e) => `${48 + (e.seconds - i.value + 8) / 8 * 700},${r(e.probability)}`).join(" "));
		return (t, i) => (G(), K("svg", Bm, [
			q("defs", null, [q("clipPath", { id: n }, [q("rect", {
				x: "48",
				y: "24",
				width: "700",
				height: Math.max(0, r(e.threshold) - 24)
			}, null, 8, Vm)])]),
			(G(), K(W, null, U([
				0,
				.25,
				.5,
				.75,
				1
			], (e) => q("g", { key: e }, [q("line", {
				x1: "48",
				x2: "748",
				y1: r(e),
				y2: r(e),
				class: "grid-line"
			}, null, 8, Hm), q("text", {
				x: "37",
				y: r(e) + 4,
				"text-anchor": "end"
			}, I(e.toFixed(2)), 9, Um)])), 64)),
			q("line", {
				"data-threshold-line": "",
				x1: "48",
				x2: "748",
				y1: r(e.threshold),
				y2: r(e.threshold),
				stroke: "#c18b26",
				"stroke-width": "2",
				"stroke-dasharray": "7 5"
			}, null, 8, Wm),
			q("polyline", {
				points: a.value,
				fill: "none",
				stroke: "#3898d5",
				"stroke-width": "2.5",
				"stroke-linejoin": "round"
			}, null, 8, Gm),
			q("polyline", {
				"data-red-trace": "",
				points: a.value,
				"clip-path": `url(#${n})`,
				fill: "none",
				stroke: "#e05260",
				"stroke-width": "2.5",
				"stroke-linejoin": "round"
			}, null, 8, Km),
			i[0] ||= _a("<text x=\"48\" y=\"226\" data-v-9402a05b>−8s</text><text x=\"398\" y=\"226\" text-anchor=\"middle\" data-v-9402a05b>−4s</text><text x=\"748\" y=\"226\" text-anchor=\"end\" data-v-9402a05b>now</text><text x=\"48\" y=\"250\" data-v-9402a05b>Y: probability</text><text x=\"748\" y=\"250\" text-anchor=\"end\" data-v-9402a05b>X: time → newest</text>", 5)
		]));
	}
}), Jm = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, Ym = /*#__PURE__*/ Jm(qm, [["__scopeId", "data-v-9402a05b"]]), Xm = [
	{
		id: "slight",
		label: "Slightly sensitive"
	},
	{
		id: "moderate",
		label: "Moderately sensitive"
	},
	{
		id: "very",
		label: "Very sensitive"
	}
];
function Zm(e, t) {
	return Math.max(.1, Math.min(.99, 1 - (1 - e) * {
		slight: .5,
		moderate: 1,
		very: 2
	}[t]));
}
function Qm(e) {
	let t = (e) => typeof e == "object" && !!e && !Array.isArray(e);
	if (!t(e) || "micro" in e && !t(e.micro)) throw Error("Invalid model manifest.");
	let n = t(e.micro) ? e.micro : {}, r = n.probability_cutoff ?? .9, i = n.sliding_window_size ?? 3, a = n.feature_step_size ?? 10;
	if (typeof r != "number" || !Number.isFinite(r) || r < 0 || r > 1 || typeof i != "number" || !Number.isInteger(i) || i < 1 || i > 100 || typeof a != "number" || !Number.isInteger(a) || a < 1 || a > 100) throw Error("Invalid model detection settings.");
	if (a !== 10) throw Error("This browser tester supports 10 ms microWakeWord feature steps only.");
	return {
		cutoff: r,
		slidingWindow: i,
		stepSize: a
	};
}
//#endregion
//#region src/studio/testing/capture.worklet.js?url
var $m = "data:text/javascript;base64,LyoqIENhcHR1cmUgbW9ubyBQQ00gb25seTsgdGhlIG91dHB1dCByZW1haW5zIHNpbGVudCAobm8gbWljcm9waG9uZSBmZWVkYmFjaykuICovCmNsYXNzIFRlc3RpbmdDYXB0dXJlIGV4dGVuZHMgQXVkaW9Xb3JrbGV0UHJvY2Vzc29yIHsKICBjb25zdHJ1Y3RvcigpIHsKICAgIHN1cGVyKCk7CiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoMjA0OCk7CiAgICB0aGlzLm9mZnNldCA9IDA7CiAgfQogIHByb2Nlc3MoaW5wdXRzKSB7CiAgICBjb25zdCBjaGFubmVscyA9IGlucHV0c1swXTsKICAgIGlmICghY2hhbm5lbHM/Lmxlbmd0aCkgcmV0dXJuIHRydWU7CiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5uZWxzWzBdLmxlbmd0aDsgaSsrKSB7CiAgICAgIGxldCBzYW1wbGUgPSAwOwogICAgICBmb3IgKGNvbnN0IGNoYW5uZWwgb2YgY2hhbm5lbHMpIHNhbXBsZSArPSBjaGFubmVsW2ldOwogICAgICB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsrXSA9IHNhbXBsZSAvIGNoYW5uZWxzLmxlbmd0aDsKICAgICAgaWYgKHRoaXMub2Zmc2V0ID09PSB0aGlzLmJ1ZmZlci5sZW5ndGgpIHsKICAgICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UodGhpcy5idWZmZXIsIFt0aGlzLmJ1ZmZlci5idWZmZXJdKTsKICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoMjA0OCk7CiAgICAgICAgdGhpcy5vZmZzZXQgPSAwOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKICB9Cn0KcmVnaXN0ZXJQcm9jZXNzb3IoJ3N0dWRpby10ZXN0aW5nLWNhcHR1cmUnLCBUZXN0aW5nQ2FwdHVyZSk7Cg==", eh = class {
	events;
	state = "idle";
	generation = 0;
	stream;
	context;
	source;
	capture;
	worker;
	abort;
	timer;
	cancelReady;
	pending = 0;
	constructor(e) {
		this.events = e;
	}
	setState(e) {
		this.state = e, this.events.state(e);
	}
	fail(e) {
		this.stop(), this.setState("error"), this.events.error(e);
	}
	stop() {
		this.generation++, clearTimeout(this.timer), this.abort?.abort(), this.abort = void 0, this.cancelReady?.(), this.cancelReady = void 0, this.worker?.terminate(), this.worker = void 0, this.capture &&= (this.capture.port.onmessage = null, this.capture.disconnect(), void 0), this.source?.disconnect(), this.source = void 0, this.stream?.getTracks().forEach((e) => {
			e.onended = null, e.stop();
		}), this.stream = void 0, this.context &&= (this.context.close().catch(() => {}), void 0), this.pending = 0, this.setState("idle");
	}
	async start(e, t) {
		this.stop();
		let n = this.generation, r = () => n === this.generation;
		if (!window.isSecureContext) this.fail("Microphone testing requires HTTPS or localhost.");
		else if (!navigator.mediaDevices?.getUserMedia) this.fail("This browser does not support microphone capture.");
		else {
			this.setState("starting"), this.timer = setTimeout(() => {
				r() && this.fail("Tester startup timed out. Check microphone permission and retry.");
			}, 6e4);
			try {
				let n = await navigator.mediaDevices.getUserMedia({ audio: {
					channelCount: 1,
					echoCancellation: !1,
					noiseSuppression: !1,
					autoGainControl: !1
				} });
				if (!r()) {
					n.getTracks().forEach((e) => e.stop());
					return;
				}
				this.stream = n;
				for (let e of n.getTracks()) e.onended = () => {
					r() && this.fail("The microphone disconnected. Reconnect it and retry.");
				};
				if (typeof AudioContext > "u" || typeof AudioWorkletNode > "u") throw Error("Live testing requires a browser with AudioWorklet support.");
				let i = new AudioContext({ sampleRate: 16e3 });
				if (this.context = i, await i.resume(), !r()) return;
				if (!i.audioWorklet) throw Error("This browser does not support live audio processing.");
				let a = new AbortController();
				this.abort = a;
				let [o] = await Promise.all([fetch(e, {
					signal: a.signal,
					credentials: "same-origin"
				}), i.audioWorklet.addModule($m)]);
				if (!r()) return;
				if (!o.ok) throw Error("Unable to load the archived model. Refresh the version list and retry.");
				let s = await o.arrayBuffer();
				if (!r()) return;
				let c = new Worker(new URL(
					/* @vite-ignore */
					new URL("assets/inference.worker-CmMPM1eg.js", import.meta.url).href,
					"" + import.meta.url
				), {
					type: "module",
					name: "studio-wakeword-test"
				});
				if (this.worker = c, await new Promise((e, n) => {
					this.cancelReady = () => n(/* @__PURE__ */ Error("Testing cancelled.")), c.onerror = () => {
						r() && n(/* @__PURE__ */ Error("Browser inference could not start."));
					}, c.onmessage = (t) => {
						r() && (t.data.type === "ready" ? e() : t.data.type === "error" && n(Error(t.data.message)));
					}, c.postMessage({
						type: "init",
						model: s,
						config: { ...t },
						rate: i.sampleRate
					}, [s]);
				}), this.cancelReady = void 0, !r()) return;
				let l = () => {
					clearTimeout(this.timer), this.timer = setTimeout(() => {
						r() && this.fail("Live audio processing stopped responding. Stop and retry.");
					}, 5e3);
				};
				c.onerror = () => {
					r() && this.fail("Browser inference failed. Stop and retry.");
				}, c.onmessage = (e) => {
					r() && (e.data.type === "error" ? this.fail(e.data.message) : e.data.type === "score" && (this.pending = Math.max(0, this.pending - 1), l(), this.events.score(e.data)));
				}, this.source = i.createMediaStreamSource(n), this.capture = new AudioWorkletNode(i, "studio-testing-capture", {
					numberOfInputs: 1,
					numberOfOutputs: 1,
					outputChannelCount: [1]
				}), this.capture.onprocessorerror = () => {
					r() && this.fail("Microphone audio processing failed. Stop and retry.");
				}, this.capture.port.onmessage = (e) => {
					if (!r()) return;
					if (++this.pending > 16) {
						this.fail("This device cannot process the model in real time. Try a faster browser or device.");
						return;
					}
					let t = e.data;
					c.postMessage({
						type: "audio",
						samples: t
					}, [t.buffer]);
				}, this.source.connect(this.capture), this.capture.connect(i.destination), l(), this.setState("listening");
			} catch (e) {
				if (!r()) return;
				this.fail(e instanceof DOMException && e.name === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access and retry." : e instanceof Error ? e.message : "Unable to start microphone testing.");
			}
		}
	}
}, th = { class: "testing-page" }, nh = { class: "studio-card testing-card" }, rh = { class: "studio-toolbar testing-controls" }, ih = { for: "testing-version" }, ah = ["disabled"], oh = {
	key: 0,
	value: ""
}, sh = ["value"], ch = { class: "testing-sensitivity" }, lh = ["disabled"], uh = {
	key: 0,
	class: "studio-note"
}, dh = {
	key: 1,
	class: "studio-note"
}, fh = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, ph = { class: "testing-mic" }, mh = ["value"], hh = { class: "testing-stats" }, gh = { "data-threshold": "" }, _h = { class: "testing-actions" }, vh = ["disabled"], yh = { class: "studio-muted" }, bh = { class: "sensitivity-options" }, xh = [
	"data-sensitivity",
	"aria-pressed",
	"onClick"
], Sh = /*#__PURE__*/ Jm(/* @__PURE__ */ sr({
	__name: "TestingPage",
	setup(e) {
		let t = ws(), n = /* @__PURE__ */ z([]), r = /* @__PURE__ */ z(""), i = /* @__PURE__ */ z(null), a = /* @__PURE__ */ z("moderate"), o = /* @__PURE__ */ z(), s = /* @__PURE__ */ z("idle"), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z([]), d = /* @__PURE__ */ z(null), f, p, m = !1, h = X(() => n.value.find((e) => e.id === r.value)), g = X(() => Zm(i.value?.cutoff ?? .9, a.value)), _ = X(() => Xm.find((e) => e.id === a.value).label), v = X(() => s.value === "starting" || s.value === "listening"), y = X(() => Math.max(0, ...u.value.map((e) => e.probability))), b = X(() => !d.value?.warming && (d.value?.probability ?? 0) > g.value), x = X(() => s.value === "starting" ? "Loading model and requesting microphone…" : s.value === "error" ? "Testing stopped" : s.value === "listening" ? d.value?.warming || !d.value ? "Warming up…" : b.value ? "Above threshold" : "Listening…" : "Ready to test"), S = new eh({
			state: (e) => {
				s.value = e;
			},
			error: (e) => {
				l.value = e;
			},
			score: (e) => {
				d.value = e, u.value = [...u.value.filter((t) => t.seconds >= e.seconds - 8), e].slice(-256);
			}
		});
		function C() {
			S.stop(), d.value = null, u.value = [];
		}
		function w(e) {
			a.value = e, o.value?.close();
		}
		async function T() {
			p?.abort(), C(), i.value = null, l.value = "";
			let e = h.value, n = t.selectedId.value;
			if (!e || !n) return;
			let r = new AbortController();
			p = r;
			try {
				let t = await $.testingManifest(n, e.id, e.model_id, r.signal);
				!m && !r.signal.aborted && (i.value = Qm(t));
			} catch (e) {
				!m && !r.signal.aborted && (l.value = e instanceof Error ? e.message : "Unable to load model settings.");
			}
		}
		async function E() {
			f?.abort(), p?.abort(), C(), o.value?.close(), n.value = [], r.value = "", i.value = null, l.value = "";
			let e = t.selectedId.value;
			if (c.value = !!e, !e) return;
			let a = new AbortController();
			f = a;
			try {
				let t = [], i = 0;
				for (;;) {
					let n = await $.models(e, {
						offset: i,
						limit: 100
					}, a.signal);
					if (m || a.signal.aborted) return;
					if (t.push(...n.items), i += n.items.length, i >= n.total || !n.items.length) break;
				}
				n.value = t, r.value = t[0]?.id ?? "";
			} catch (e) {
				!m && !a.signal.aborted && (l.value = e instanceof Error ? e.message : "Unable to load versions.");
			} finally {
				!m && !a.signal.aborted && (c.value = !1);
			}
		}
		function D() {
			let e = h.value;
			e && i.value && (l.value = "", d.value = null, u.value = [], S.start($.testingModelUrl(t.selectedId.value, e.id, e.model_id), i.value));
		}
		return H(r, () => {
			T();
		}, { flush: "sync" }), H(t.selectedId, () => {
			E();
		}, {
			immediate: !0,
			flush: "sync"
		}), Er(() => {
			m = !0, f?.abort(), p?.abort(), o.value?.close(), S.stop();
		}), (e, f) => (G(), K("section", th, [
			f[17] ||= q("h1", null, "Testing", -1),
			f[18] ||= q("p", { class: "studio-muted testing-intro" }, "Test a trained wakeword using your microphone. Inference runs in this browser; audio is never uploaded or saved.", -1),
			q("div", nh, [
				f[12] ||= q("h2", null, "Wake Word Tester", -1),
				f[13] ||= q("p", { class: "studio-muted" }, "Speak your wakeword from your usual distance and watch the detection probability in real time.", -1),
				q("div", rh, [q("label", ih, [f[4] ||= J("Wakeword version ", -1), V(q("select", {
					id: "testing-version",
					"onUpdate:modelValue": f[0] ||= (e) => r.value = e,
					disabled: c.value || !n.value.length
				}, [n.value.length ? Y("", !0) : (G(), K("option", oh, I(c.value ? "Loading versions…" : "No versions available"), 1)), (G(!0), K(W, null, U(n.value, (e) => (G(), K("option", {
					key: e.id,
					value: e.id
				}, I(B(Ts)(e.trained_at)) + " · " + I(e.id.slice(0, 8)), 9, sh))), 128))], 8, ah), [[Ho, r.value]])]), q("div", ch, [f[5] ||= q("span", { class: "studio-muted" }, "Sensitivity", -1), q("button", {
					type: "button",
					"data-action": "sensitivity",
					disabled: !i.value,
					"aria-haspopup": "dialog",
					onClick: f[1] ||= (e) => o.value?.showModal()
				}, I(_.value) + " ▾", 9, lh)])]),
				B(t).selectedId.value ? !c.value && !n.value.length && !l.value ? (G(), K("p", dh, "Train a model to start live testing.")) : Y("", !0) : (G(), K("p", uh, "Select or create a wakeword to test.")),
				l.value ? (G(), K("p", fh, [J(I(l.value) + " ", 1), v.value ? Y("", !0) : (G(), K("button", {
					key: 0,
					type: "button",
					onClick: E
				}, "Reload versions"))])) : Y("", !0),
				q("div", ph, [
					f[6] ||= q("span", null, "Mic level", -1),
					q("meter", {
						min: "0",
						max: ".2",
						value: d.value?.rms ?? 0,
						"aria-label": "Microphone level"
					}, null, 8, mh),
					q("span", null, I((d.value?.rms ?? 0).toFixed(3)), 1)
				]),
				q("div", hh, [f[11] ||= q("span", null, "Detection probability (smoothed)", -1), q("span", null, [
					f[8] ||= J("latest ", -1),
					q("b", null, I((d.value?.probability ?? 0).toFixed(3)), 1),
					f[9] ||= J(" · peak ", -1),
					q("b", null, I(y.value.toFixed(3)), 1),
					f[10] ||= J(" · ", -1),
					q("span", gh, [f[7] ||= J("threshold ", -1), q("b", null, I(g.value.toFixed(2)), 1)])
				])]),
				pa(Ym, {
					samples: u.value,
					threshold: g.value
				}, null, 8, ["samples", "threshold"]),
				q("div", _h, [v.value ? (G(), K("button", {
					key: 0,
					type: "button",
					class: "studio-record-stop",
					"data-action": "stop-testing",
					onClick: f[2] ||= (e) => B(S).stop()
				}, "Stop testing")) : (G(), K("button", {
					key: 1,
					type: "button",
					class: "studio-primary",
					"data-action": "start-testing",
					disabled: !i.value || c.value,
					onClick: D
				}, "Start testing", 8, vh)), q("span", {
					role: "status",
					class: F({ "testing-above": b.value && s.value === "listening" })
				}, I(x.value), 3)]),
				f[14] ||= q("p", { class: "studio-muted testing-footnote" }, "The dashed line is the selected sensitivity threshold. Red means the smoothed probability is above it. Browser microphone processing and device hardware may differ from your deployed satellite.", -1)
			]),
			q("dialog", {
				ref_key: "dialog",
				ref: o,
				class: "studio-card testing-dialog",
				"aria-labelledby": "testing-sensitivity-title"
			}, [
				f[15] ||= q("h2", { id: "testing-sensitivity-title" }, "Detection sensitivity", -1),
				q("p", yh, "Derived from this version’s saved cutoff (" + I((i.value?.cutoff ?? .9).toFixed(2)) + "), using Voice Satellite’s calculation.", 1),
				q("div", bh, [(G(!0), K(W, null, U(B(Xm), (e) => (G(), K("button", {
					key: e.id,
					type: "button",
					"data-sensitivity": e.id,
					"aria-pressed": a.value === e.id,
					class: F({ "studio-selected": a.value === e.id }),
					onClick: (t) => w(e.id)
				}, [q("span", null, I(e.label), 1), q("strong", null, I(B(Zm)(i.value?.cutoff ?? .9, e.id).toFixed(2)), 1)], 10, xh))), 128))]),
				f[16] ||= q("p", { class: "studio-muted" }, "Higher sensitivity lowers the threshold and may increase false detections.", -1),
				q("button", {
					type: "button",
					onClick: f[3] ||= (e) => o.value?.close()
				}, "Close")
			], 512)
		]));
	}
}), [["__scopeId", "data-v-fb617175"]]);
//#endregion
//#region src/studio/theme.ts
function Ch() {
	let e = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null, t = null;
	try {
		let e = localStorage.getItem("studio.theme");
		(e === "light" || e === "dark") && (t = e);
	} catch {}
	let n = /* @__PURE__ */ z(t ? t === "dark" : !!e?.matches);
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
var wh = ["aria-pressed"], Th = /* @__PURE__ */ sr({
	__name: "ThemeToggle",
	setup(e) {
		let { dark: t, toggle: n, dispose: r } = Ch();
		return Er(r), (e, r) => (G(), K("button", {
			type: "button",
			"aria-label": "Dark mode",
			"aria-pressed": B(t),
			onClick: r[0] ||= (...e) => B(n) && B(n)(...e)
		}, I(B(t) ? "☀ Light mode" : "☾ Dark mode"), 9, wh));
	}
}), Eh = ["data-job-id"], Dh = { class: "studio-job-heading" }, Oh = ["aria-label", "disabled"], kh = { class: "studio-job-meta" }, Ah = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, jh = { class: "studio-job-meta" }, Mh = {
	key: 0,
	class: "studio-job-meta"
}, Nh = {
	key: 1,
	class: "studio-log",
	"aria-label": "Job log tail"
}, Ph = {
	key: 2,
	class: "studio-job-meta"
}, Fh = {
	key: 3,
	class: "studio-note",
	role: "alert"
}, Ih = { class: "studio-job-meta" }, Lh = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Rh = /* @__PURE__ */ sr({
	__name: "JobQueueCard",
	props: { job: {} },
	setup(e) {
		let t = e, n = lc();
		Cr(() => {
			n.load();
		});
		let r = Vc(), i = ws(), a = {
			train: "Train wakeword",
			generation: "Generate artificial samples",
			preview: "Preview voice",
			scrape: "Collect recordings",
			download: "Download online dataset",
			classify: "Classify recordings",
			deploy: "Deploy model"
		}, o = X(() => t.job.word_id ? i.wakewords.value.find((e) => e.id === t.job.word_id)?.phrase ?? t.job.word_id : t.job.kind === "download" ? "Shared dataset" : "All wakewords"), s = X(() => t.job.kind === "scrape" ? t.job.payload.device_ids?.map(n.deviceLabel).join(", ") || "All registered kiosks and followers" : t.job.kind === "download" ? t.job.payload.augmentation_id ?? t.job.payload.dataset_id : "Trainer"), c = /* @__PURE__ */ z(!1), l = /* @__PURE__ */ z(""), u = /* @__PURE__ */ z(""), d = /* @__PURE__ */ z(!1), f, p;
		function m() {
			f?.abort(), p && clearTimeout(p), p = void 0;
		}
		async function h() {
			if (m(), !c.value) return;
			let e = new AbortController();
			f = e, d.value = !0;
			try {
				let n = await $.jobLogs(t.job.id, 8192, e.signal);
				e.signal.aborted || (l.value = n.text.slice(-8192), u.value = "");
			} catch (t) {
				e.signal.aborted || (u.value = t instanceof Error ? t.message : "Unable to load job logs.");
			} finally {
				e.signal.aborted || (d.value = !1, c.value && Rc(t.job) && (p = setTimeout(() => void h(), 2e3)));
			}
		}
		return H([c, () => t.job.status], () => {
			c.value ? h() : m();
		}), Er(m), (t, n) => (G(), K("article", {
			class: F(["studio-card studio-job-card", { "studio-selected": B(r).selectedJobId.value === e.job.id }]),
			"data-job-id": e.job.id
		}, [
			q("div", Dh, [
				q("h3", null, I(a[e.job.kind] ?? e.job.kind), 1),
				q("span", { class: F(["studio-status", `studio-status-${e.job.status}`]) }, I(e.job.status), 3),
				B(Rc)(e.job) ? (G(), K("button", {
					key: 0,
					type: "button",
					"data-action": "cancel-job",
					"aria-label": `Cancel ${a[e.job.kind] ?? e.job.kind}`,
					disabled: e.job.status === "cancelling" || B(r).cancelling.value.has(e.job.id),
					onClick: n[0] ||= (t) => B(r).cancel(e.job.id)
				}, "Cancel", 8, Oh)) : Y("", !0)
			]),
			q("p", kh, I(o.value) + " · " + I(s.value), 1),
			B(ds)(e.job) ? (G(), K("p", Ah, I(B(ds)(e.job)), 1)) : Y("", !0),
			q("p", jh, I(e.job.started_at ? "Started" : "Created") + " " + I(B(Ts)(e.job.started_at ?? e.job.created_at)), 1),
			q("details", { onToggle: n[1] ||= (e) => c.value = e.target.open }, [
				n[2] ||= q("summary", null, "View logs", -1),
				d.value && !l.value ? (G(), K("p", Mh, "Loading logs…")) : Y("", !0),
				l.value ? (G(), K("pre", Nh, I(l.value), 1)) : !d.value && !u.value ? (G(), K("p", Ph, "No retained log output.")) : Y("", !0),
				u.value ? (G(), K("p", Fh, [J(I(u.value) + " ", 1), q("button", {
					type: "button",
					onClick: h
				}, "Retry")])) : Y("", !0),
				q("p", Ih, "Job " + I(e.job.id), 1)
			], 32),
			B(r).cancelErrors.value[e.job.id] ? (G(), K("p", Lh, I(B(r).cancelErrors.value[e.job.id]), 1)) : Y("", !0)
		], 10, Eh));
	}
}), zh = { class: "studio-queue-header" }, Bh = { class: "flex items-center justify-between gap-3" }, Vh = { class: "studio-queue-badge" }, Hh = { class: "studio-queue-content" }, Uh = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Wh = { class: "studio-queue-group" }, Gh = { class: "studio-queue-group" }, Kh = {
	key: 5,
	class: "studio-muted text-sm mt-4"
}, qh = ["disabled"], Jh = /* @__PURE__ */ sr({
	__name: "JobQueueDrawer",
	setup(e) {
		let t = Vc(), n = /* @__PURE__ */ z(), r = /* @__PURE__ */ z(), i = X(() => t.activeJobs.value.filter((e) => e.status !== "queued")), a = X(() => t.activeJobs.value.filter((e) => e.status === "queued")), o = X(() => {
			let e = t.selectedJobId.value, n = t.jobs.value[e];
			return n && !t.activeJobs.value.some((t) => t.id === e) && !t.history.value.some((t) => t.id === e) ? n : null;
		}), s = null, c = "";
		function l() {
			t.open.value = !1;
		}
		function u(e) {
			if (e.key === "Escape") {
				e.preventDefault(), e.stopPropagation(), l();
				return;
			}
			if (e.key !== "Tab") return;
			let t = Array.from(n.value?.querySelectorAll("button:not(:disabled), summary, a[href], [tabindex=\"0\"]") ?? []).filter((e) => !e.closest("details:not([open])") || e.tagName === "SUMMARY"), r = t[0], i = t.at(-1);
			e.shiftKey && (document.activeElement === r || !n.value?.contains(document.activeElement)) ? (e.preventDefault(), i?.focus()) : !e.shiftKey && (document.activeElement === i || !n.value?.contains(document.activeElement)) && (e.preventDefault(), r?.focus());
		}
		function d() {
			document.removeEventListener("keydown", u, !0), document.body.style.overflow = c;
		}
		return H(t.open, async (e) => {
			e ? (s = document.activeElement instanceof HTMLElement ? document.activeElement : null, c = document.body.style.overflow, document.body.style.overflow = "hidden", document.addEventListener("keydown", u, !0), await vn(), r.value?.focus()) : (d(), await vn(), s?.isConnected ? s.focus() : document.querySelector("[data-action=\"open-job-queue\"]")?.focus());
		}, { flush: "sync" }), H([
			t.selectedJobId,
			t.history,
			t.loading
		], async () => {
			t.open.value && t.selectedJobId.value && (await vn(), Array.from(n.value?.querySelectorAll("[data-job-id]") ?? []).find((e) => e.dataset.jobId === t.selectedJobId.value)?.scrollIntoView?.({ block: "nearest" }));
		}), Er(() => {
			t.open.value && d();
		}), (e, s) => B(t).open.value ? (G(), K(W, { key: 0 }, [q("div", {
			class: "studio-queue-backdrop",
			"data-job-queue-backdrop": "",
			onClick: l
		}), q("aside", {
			id: "studio-job-queue",
			ref_key: "panel",
			ref: n,
			class: "studio-job-drawer",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Global job queue"
		}, [q("header", zh, [q("div", Bh, [q("h2", null, [s[2] ||= J("Job queue ", -1), q("span", Vh, I(B(t).activeCount.value) + " active", 1)]), q("button", {
			ref_key: "closeButton",
			ref: r,
			type: "button",
			"data-action": "close-job-queue",
			"aria-label": "Close job queue",
			onClick: l
		}, "✕", 512)]), s[3] ||= q("p", { class: "studio-muted text-xs" }, "All kiosks · All followers · All wakewords", -1)]), q("div", Hh, [
			B(t).error.value ? (G(), K("p", Uh, [J(I(B(t).error.value) + " ", 1), q("button", {
				type: "button",
				onClick: s[0] ||= (...e) => B(t).refresh && B(t).refresh(...e)
			}, "Retry")])) : Y("", !0),
			o.value ? (G(), K(W, { key: 1 }, [s[4] ||= q("h3", { class: "studio-queue-group" }, "Selected job", -1), pa(Rh, { job: o.value }, null, 8, ["job"])], 64)) : Y("", !0),
			i.value.length ? (G(), K(W, { key: 2 }, [q("h3", Wh, "Running · " + I(i.value.length), 1), (G(!0), K(W, null, U(i.value, (e) => (G(), ca(Rh, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			a.value.length ? (G(), K(W, { key: 3 }, [q("h3", Gh, "Queued · " + I(a.value.length), 1), (G(!0), K(W, null, U(a.value, (e) => (G(), ca(Rh, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			B(t).history.value.length ? (G(), K(W, { key: 4 }, [s[5] ||= q("h3", { class: "studio-queue-group" }, "Recent history", -1), (G(!0), K(W, null, U(B(t).history.value, (e) => (G(), ca(Rh, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			!B(t).activeCount.value && !B(t).history.value.length && !o.value && !B(t).loading.value && !B(t).error.value ? (G(), K("p", Kh, "No jobs yet.")) : Y("", !0),
			B(t).hasMore.value ? (G(), K("button", {
				key: 6,
				type: "button",
				class: "studio-queue-more",
				disabled: B(t).loading.value,
				onClick: s[1] ||= (...e) => B(t).loadMore && B(t).loadMore(...e)
			}, "Load older jobs", 8, qh)) : Y("", !0)
		])], 512)], 64)) : Y("", !0);
	}
}), Yh = ["inert"], Xh = { class: "studio-sidebar" }, Zh = { class: "flex items-center justify-between gap-3" }, Qh = ["aria-expanded"], $h = ["hidden"], eg = {
	key: 0,
	class: "studio-nav-label"
}, tg = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], ng = { class: "studio-main" }, rg = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, ig = { class: "studio-muted text-xs" }, ag = { class: "flex flex-wrap items-center gap-3" }, og = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, sg = ["value", "disabled"], cg = {
	key: 0,
	value: ""
}, lg = ["value"], ug = ["aria-expanded"], dg = {
	key: 0,
	class: "studio-queue-badge"
}, fg = {
	key: 1,
	title: "Job queue unavailable",
	"aria-label": "Job queue unavailable"
}, pg = {
	key: 0,
	role: "status",
	class: "studio-note"
}, mg = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, hg = {
	key: 2,
	role: "status"
}, gg = /* @__PURE__ */ sr({
	__name: "StudioShell",
	setup(e) {
		let t = ss(), n = Ss(t);
		Pn(Cs, n);
		let r = Bc();
		Pn(zc, r);
		let { wakewords: i, selectedId: a, selected: o, loading: s, error: c, notice: l } = n, u = /* @__PURE__ */ z(!1), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(), p = /* @__PURE__ */ z(), m = X(() => is.find((e) => e.id === t.page.value)), h = X(() => d.value && !u.value), g = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
		function _() {
			d.value = g?.matches ?? !1;
		}
		function v() {
			u.value = !1, f.value?.focus();
		}
		function y(e) {
			e.key === "Escape" && u.value && v();
		}
		function b(e) {
			t.navigate(e), u.value = !1, p.value?.focus();
		}
		return H(d, (e) => {
			e || (u.value = !1);
		}), _(), g?.addEventListener ? g.addEventListener("change", _) : g?.addListener(_), Cr(() => {
			document.addEventListener("keydown", y), n.load(), r.start();
		}), Er(() => {
			document.removeEventListener("keydown", y), r.stop(), g?.removeEventListener ? g.removeEventListener("change", _) : g?.removeListener(_);
		}), (e, o) => (G(), K("div", { class: F(["studio-app", { "is-narrow": d.value }]) }, [q("div", {
			class: "studio-layout",
			"data-studio-background": "",
			inert: B(r).open.value ? !0 : void 0
		}, [
			q("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: o[0] ||= Yo((e) => p.value?.focus(), ["prevent"])
			}, "Skip to content"),
			q("aside", Xh, [
				q("div", Zh, [o[4] ||= q("div", { class: "studio-brand" }, [J("◈ Wakeword Studio"), q("small", null, "LISTEN · REFINE · DEPLOY")], -1), d.value ? (G(), K("button", {
					key: 0,
					ref_key: "toggle",
					ref: f,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": u.value,
					onClick: o[1] ||= (e) => u.value = !u.value
				}, "Menu", 8, Qh)) : Y("", !0)]),
				q("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: h.value
				}, [(G(!0), K(W, null, U(B(is), (e, n) => (G(), K(W, { key: e.id }, [(e.group === "Data" || e.group === "Models") && B(is)[n - 1]?.group !== e.group ? (G(), K("div", eg, I(e.group), 1)) : Y("", !0), q("a", {
					href: B(t).href(e.id),
					"data-page": e.id,
					class: F({
						active: m.value.id === e.id,
						"studio-sub": e.group === "Data"
					}),
					"aria-current": m.value.id === e.id ? "page" : void 0,
					onClick: Yo((t) => b(e.id), ["prevent"])
				}, I(e.name), 11, tg)], 64))), 128))], 8, $h),
				o[5] ||= q("p", { class: "studio-sidebar-note" }, [
					J("Independent workspaces."),
					q("br"),
					J("Device selections stay unchanged.")
				], -1)
			]),
			q("div", ng, [q("header", rg, [q("div", ig, I(m.value.group) + " / " + I(m.value.name), 1), q("div", ag, [
				q("label", og, [o[6] ||= J("WAKEWORD ", -1), q("select", {
					id: "studio-word",
					value: B(a),
					disabled: !B(i).length,
					onChange: o[2] ||= (e) => B(n).select(e.target.value)
				}, [B(i).length ? Y("", !0) : (G(), K("option", cg, "No wakewords")), (G(!0), K(W, null, U(B(i), (e) => (G(), K("option", {
					key: e.id,
					value: e.id
				}, I(e.phrase), 9, lg))), 128))], 40, sg)]),
				pa(Th),
				q("button", {
					type: "button",
					class: "studio-queue-toggle",
					"data-action": "open-job-queue",
					"aria-label": "Open global job queue",
					"aria-controls": "studio-job-queue",
					"aria-expanded": B(r).open.value,
					onClick: o[3] ||= (e) => B(r).show()
				}, [
					o[7] ||= q("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "1.7",
						"aria-hidden": "true"
					}, [q("path", { d: "M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" })], -1),
					B(r).activeCount.value ? (G(), K("span", dg, I(B(r).activeCount.value), 1)) : Y("", !0),
					B(r).error.value ? (G(), K("span", fg, "!")) : Y("", !0)
				], 8, ug)
			])]), q("main", {
				id: "studio-content",
				ref_key: "content",
				ref: p,
				class: "studio-content",
				tabindex: "-1"
			}, [
				B(l) ? (G(), K("p", pg, I(B(l)), 1)) : Y("", !0),
				B(c) ? (G(), K("div", mg, I(B(c)), 1)) : Y("", !0),
				B(s) ? (G(), K("p", hg, "Loading workspaces…")) : Y("", !0),
				m.value.id === "wakewords" ? (G(), ca(Xs, { key: 3 })) : m.value.id === "classify" ? (G(), ca(El, { key: 4 })) : m.value.id === "samples" ? (G(), ca(Ql, { key: 5 })) : m.value.id === "manual" ? (G(), ca(Uu, { key: 6 })) : m.value.id === "kiosks" ? (G(), ca(Td, { key: 7 })) : m.value.id === "automate" ? (G(), ca(sf, { key: 8 })) : m.value.id === "deploy" ? (G(), ca(Pf, { key: 9 })) : m.value.id === "online-datasets" ? (G(), ca(yp, { key: 10 })) : m.value.id === "artificial" ? (G(), ca(lm, { key: 11 })) : m.value.id === "train" ? (G(), ca(zm, { key: 12 })) : m.value.id === "testing" ? (G(), ca(Sh, { key: 13 })) : Y("", !0)
			], 512)])
		], 8, Yh), pa(Jh)], 2));
	}
}), _g = document.getElementById("trainer-app");
if (!_g) throw Error("Missing #trainer-app mount point");
ts(gg).mount(_g);
//#endregion

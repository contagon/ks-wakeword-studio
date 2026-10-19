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
}, D = /-\w/g, O = E((e) => e.replace(D, (e) => e.slice(1).toUpperCase())), ee = /\B([A-Z])/g, k = E((e) => e.replace(ee, "-$1").toLowerCase()), te = E((e) => e.charAt(0).toUpperCase() + e.slice(1)), ne = E((e) => e ? `on${te(e)}` : ""), A = (e, t) => !Object.is(e, t), re = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, j = (e, t, n, r = !1) => {
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
			let r = e[n], i = g(r) ? ue(r) : se(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var ce = /;(?![^(]*\))/g, M = /:([^]+)/, le = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function ue(e) {
	let t = {};
	return e.replace(le, (e) => e.startsWith("/*") ? "" : e).split(ce).forEach((e) => {
		if (e) {
			let n = e.split(M);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function N(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = N(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var de = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function fe(e) {
	return !!e || e === "";
}
function pe(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = _e(e[i], t[i], n);
	return r;
}
function me(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && _e(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function he(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? me(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !_e(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function ge(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function _e(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? ge(e, t, n, pe) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : ge(e, t, n, he) : String(e) === String(t))));
}
function ve(e, t) {
	return e.findIndex((e) => _e(e, t));
}
var ye = (e) => !!(e && e.__v_isRef === !0), P = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? ye(e) ? P(e.value) : JSON.stringify(e, be, 2) : String(e), be = (e, t) => ye(t) ? be(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[xe(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => xe(e)) } : _(t) ? xe(t) : v(t) && !d(t) && !C(t) ? String(t) : t, xe = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, Se, Ce = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Se && (Se.active ? (this.parent = Se, this.index = (Se.scopes || (Se.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = Se;
			try {
				return Se = this, e();
			} finally {
				Se = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = Se, Se = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (Se === this) Se = this.prevScope;
			else {
				let e = Se;
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
function we() {
	return Se;
}
function Te(e, t = !1) {
	Se && Se.cleanups.push(e);
}
var F, Ee = /* @__PURE__ */ new WeakSet(), De = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Se && (Se.active ? Se.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Ee.has(this) && (Ee.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || je(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, We(this), Pe(this);
		let e = F, t = Be;
		F = this, Be = !0;
		try {
			return this.fn();
		} finally {
			Fe(this), F = e, Be = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Re(e);
			this.deps = this.depsTail = void 0, We(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Ee.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Ie(this) && this.run();
	}
	get dirty() {
		return Ie(this);
	}
}, Oe = 0, ke, Ae;
function je(e, t = !1) {
	e.flags |= 8, t ? (e.next = Ae, Ae = e) : (e.next = ke, ke = e);
}
function Me() {
	Oe++;
}
function Ne() {
	if (--Oe > 0) return;
	if (Ae) {
		let e = Ae;
		for (Ae = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; ke;) {
		let t = ke;
		for (ke = void 0; t;) {
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
function Pe(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Fe(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Re(r), ze(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Ie(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Le(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Le(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ge) || (e.globalVersion = Ge, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Ie(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = F, r = Be;
	F = e, Be = !0;
	try {
		Pe(e);
		let n = e.fn(e._value);
		(t.version === 0 || A(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		F = n, Be = r, Fe(e), e.flags &= -3;
	}
}
function Re(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Re(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function ze(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Be = !0, Ve = [];
function He() {
	Ve.push(Be), Be = !1;
}
function Ue() {
	let e = Ve.pop();
	Be = e === void 0 || e;
}
function We(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = F;
		F = void 0;
		try {
			t();
		} finally {
			F = e;
		}
	}
}
var Ge = 0, Ke = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, qe = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!F || !Be || F === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== F) t = this.activeLink = new Ke(F, this), F.deps ? (t.prevDep = F.depsTail, F.depsTail.nextDep = t, F.depsTail = t) : F.deps = F.depsTail = t, Je(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = F.depsTail, t.nextDep = void 0, F.depsTail.nextDep = t, F.depsTail = t, F.deps === t && (F.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Ge++, this.notify(e);
	}
	notify(e) {
		Me();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Ne();
		}
	}
};
function Je(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Je(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Ye = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ Symbol(""), Ze = /* @__PURE__ */ Symbol(""), Qe = /* @__PURE__ */ Symbol("");
function $e(e, t, n) {
	if (Be && F) {
		let t = Ye.get(e);
		t || Ye.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new qe()), r.map = t, r.key = n), r.track();
	}
}
function et(e, t, n, r, i, a) {
	let o = Ye.get(e);
	if (!o) {
		Ge++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Me(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Qe || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Qe)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Xe)), f(e) && s(o.get(Ze)));
				break;
			case "delete":
				i || (s(o.get(Xe)), f(e) && s(o.get(Ze)));
				break;
			case "set": f(e) && s(o.get(Xe));
		}
	}
	Ne();
}
function tt(e) {
	let t = /* @__PURE__ */ I(e);
	return t === e || ($e(t, "iterate", Qe), /* @__PURE__ */ Vt(e)) ? t : /* @__PURE__ */ Bt(e) ? /* @__PURE__ */ zt(e) ? t.map((e) => Gt(Wt(e))) : t.map(Gt) : t.map(Wt);
}
function nt(e) {
	return $e(e = /* @__PURE__ */ I(e), "iterate", Qe), e;
}
function rt(e, t) {
	return /* @__PURE__ */ Bt(e) ? Gt(/* @__PURE__ */ zt(e) ? Wt(t) : t) : Wt(t);
}
var it = {
	__proto__: null,
	[Symbol.iterator]() {
		return at(this, Symbol.iterator, (e) => rt(this, e));
	},
	concat(...e) {
		return tt(this).concat(...e.map((e) => d(e) ? tt(e) : e));
	},
	entries() {
		return at(this, "entries", (e) => (e[1] = rt(this, e[1]), e));
	},
	every(e, t) {
		return ct(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return ct(this, "filter", e, t, (e) => e.map((e) => rt(this, e)), arguments);
	},
	find(e, t) {
		return ct(this, "find", e, t, (e) => rt(this, e), arguments);
	},
	findIndex(e, t) {
		return ct(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return ct(this, "findLast", e, t, (e) => rt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return ct(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return ct(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return ut(this, "includes", e);
	},
	indexOf(...e) {
		return ut(this, "indexOf", e);
	},
	join(e) {
		return tt(this).join(e);
	},
	lastIndexOf(...e) {
		return ut(this, "lastIndexOf", e);
	},
	map(e, t) {
		return ct(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return dt(this, "pop");
	},
	push(...e) {
		return dt(this, "push", e);
	},
	reduce(e, ...t) {
		return lt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return lt(this, "reduceRight", e, t);
	},
	shift() {
		return dt(this, "shift");
	},
	some(e, t) {
		return ct(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return dt(this, "splice", e);
	},
	toReversed() {
		return tt(this).toReversed();
	},
	toSorted(e) {
		return tt(this).toSorted(e);
	},
	toSpliced(...e) {
		return tt(this).toSpliced(...e);
	},
	unshift(...e) {
		return dt(this, "unshift", e);
	},
	values() {
		return at(this, "values", (e) => rt(this, e));
	}
};
function at(e, t, n) {
	let r = nt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Vt(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => ot(a.next(), n), i !== st[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => ot(a._next(), n);
	}
	return a;
}
function ot(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var st = Array.prototype;
function ct(e, t, n, r, i, a) {
	let o = nt(e), s = o !== e && !/* @__PURE__ */ Vt(e), c = o[t];
	if (c !== st[t]) {
		let t = c.apply(e, a);
		return s ? Wt(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, rt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function lt(e, t, n, r) {
	let i = nt(e), a = i !== e && !/* @__PURE__ */ Vt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = rt(e, t)), n.call(this, t, rt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? rt(e, c) : c;
}
function ut(e, t, n) {
	let r = /* @__PURE__ */ I(e);
	$e(r, "iterate", Qe);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Ht(n[0]) ? (n[0] = /* @__PURE__ */ I(n[0]), r[t](...n)) : i;
}
function dt(e, t, n = []) {
	He(), Me();
	let r = (/* @__PURE__ */ I(e))[t].apply(e, n);
	return Ne(), Ue(), r;
}
var ft = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), pt = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function mt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ I(this);
	return $e(t, "has", e), t.hasOwnProperty(e);
}
var ht = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Nt : Mt : i ? jt : At).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = it[t])) return e;
			if (t === "hasOwnProperty") return mt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Kt(e) ? e : n);
		if ((_(t) ? pt.has(t) : ft(t)) || (r || $e(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Kt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ Lt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ Lt(o) : /* @__PURE__ */ Ft(o) : o;
	}
}, gt = class extends ht {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Bt(i);
			if (!/* @__PURE__ */ Vt(n) && !/* @__PURE__ */ Bt(n) && (i = /* @__PURE__ */ I(i), n = /* @__PURE__ */ I(n)), !a && /* @__PURE__ */ Kt(i) && !/* @__PURE__ */ Kt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Kt(e) ? e : r);
		return e === /* @__PURE__ */ I(r) && s && (o ? A(n, i) && et(e, "set", t, n, i) : et(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && et(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !pt.has(t)) && $e(e, "has", t), n;
	}
	ownKeys(e) {
		return $e(e, "iterate", d(e) ? "length" : Xe), Reflect.ownKeys(e);
	}
}, _t = class extends ht {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, vt = /* @__PURE__ */ new gt(), yt = /* @__PURE__ */ new _t(), bt = /* @__PURE__ */ new gt(!0), xt = (e) => e, St = (e) => Reflect.getPrototypeOf(e);
function Ct(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ I(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? xt : t ? Gt : Wt;
		return !t && $e(a, "iterate", l ? Ze : Xe), s(Object.create(u), { next() {
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
function wt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Tt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ I(r), a = /* @__PURE__ */ I(n);
			e || (A(n, a) && $e(i, "get", n), $e(i, "get", a));
			let { has: o } = St(i), s = t ? xt : e ? Gt : Wt;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && $e(/* @__PURE__ */ I(t), "iterate", Xe), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ I(n), i = /* @__PURE__ */ I(t);
			return e || (A(t, i) && $e(r, "has", t), $e(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ I(a), s = t ? xt : e ? Gt : Wt;
			return !e && $e(o, "iterate", Xe), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: wt("add"),
		set: wt("set"),
		delete: wt("delete"),
		clear: wt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ I(this), r = St(n), i = /* @__PURE__ */ I(e), a = !t && !/* @__PURE__ */ Vt(e) && !/* @__PURE__ */ Bt(e) ? i : e;
			return r.has.call(n, a) || A(e, a) && r.has.call(n, e) || A(i, a) && r.has.call(n, i) || (n.add(a), et(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Vt(n) && !/* @__PURE__ */ Bt(n) && (n = /* @__PURE__ */ I(n));
			let r = /* @__PURE__ */ I(this), { has: i, get: a } = St(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ I(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? A(n, s) && et(r, "set", e, n, s) : et(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ I(this), { has: n, get: r } = St(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ I(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && et(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ I(this), t = e.size !== 0, n = e.clear();
			return t && et(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Ct(r, e, t);
	}), n;
}
function Et(e, t) {
	let n = Tt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Dt = { get: /* @__PURE__ */ Et(!1, !1) }, Ot = { get: /* @__PURE__ */ Et(!1, !0) }, kt = { get: /* @__PURE__ */ Et(!0, !1) }, At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap();
function Pt(e) {
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
function Ft(e) {
	return /* @__PURE__ */ Bt(e) ? e : Rt(e, !1, vt, Dt, At);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
	return Rt(e, !1, bt, Ot, jt);
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
	return Rt(e, !0, yt, kt, Mt);
}
function Rt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Pt(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return /* @__PURE__ */ Bt(e) ? /* @__PURE__ */ zt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function I(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ I(t) : e;
}
function Ut(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && j(e, "__v_skip", !0), e;
}
var Wt = (e) => v(e) ? /* @__PURE__ */ Ft(e) : e, Gt = (e) => v(e) ? /* @__PURE__ */ Lt(e) : e;
// @__NO_SIDE_EFFECTS__
function Kt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	return Jt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
	return Jt(e, !0);
}
function Jt(e, t) {
	return /* @__PURE__ */ Kt(e) ? e : new Yt(e, t);
}
var Yt = class {
	constructor(e, t) {
		this.dep = new qe(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ I(e), this._value = t ? e : Wt(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Vt(e) || /* @__PURE__ */ Bt(e);
		e = n ? e : /* @__PURE__ */ I(e), A(e, t) && (this._rawValue = e, this._value = n ? e : Wt(e), this.dep.trigger());
	}
};
function R(e) {
	return /* @__PURE__ */ Kt(e) ? e.value : e;
}
var Xt = {
	get: (e, t, n) => t === "__v_raw" ? e : R(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Kt(i) && !/* @__PURE__ */ Kt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Zt(e) {
	return /* @__PURE__ */ zt(e) ? e : new Proxy(e, Xt);
}
var Qt = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new qe(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function $t(e) {
	return new Qt(e);
}
var en = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new qe(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ge - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && F !== this) return je(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Le(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function tn(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new en(r, i, n);
}
var nn = {}, rn = /* @__PURE__ */ new WeakMap(), an = void 0;
function on(e, t = !1, n = an) {
	if (n) {
		let t = rn.get(n);
		t || rn.set(n, t = []), t.push(e);
	}
}
function sn(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Vt(e) || o === !1 || o === 0 ? cn(e, 1) : cn(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Kt(e) ? (g = () => e.value, y = /* @__PURE__ */ Vt(e)) : /* @__PURE__ */ zt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ zt(e) || /* @__PURE__ */ Vt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Kt(e)) return e.value;
		if (/* @__PURE__ */ zt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			He();
			try {
				_();
			} finally {
				Ue();
			}
		}
		let t = an;
		an = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			an = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => cn(e(), t);
	}
	let x = we(), S = () => {
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
	let C = b ? Array(e.length).fill(nn) : nn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => A(e, C[t])) : A(t, C))) {
					let e = an;
					He();
					try {
						_ && _(), an = m;
						let e = [
							t,
							C === nn ? void 0 : b && C[0] === nn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						an = e, Ue();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new De(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => on(e, !1, m), _ = m.onStop = () => {
		let e = rn.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			rn.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function cn(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Kt(e)) cn(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) cn(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		cn(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) cn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && cn(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function ln(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		dn(e, t, n);
	}
}
function un(e, t, n, r) {
	if (h(e)) {
		let i = ln(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			dn(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(un(e[a], t, n, r));
		return i;
	}
}
function dn(e, n, r, i = !0) {
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
			He(), ln(o, null, 10, [
				e,
				i,
				a
			]), Ue();
			return;
		}
	}
	fn(e, r, a, i, s);
}
function fn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var pn = [], mn = -1, hn = [], gn = null, _n = 0, vn = /* @__PURE__ */ Promise.resolve(), yn = null;
function bn(e) {
	let t = yn || vn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function xn(e) {
	let t = mn + 1, n = pn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = pn[r], a = kn(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function Sn(e) {
	if (!(e.flags & 1)) {
		let t = kn(e), n = pn[pn.length - 1];
		!n || !(e.flags & 2) && t >= kn(n) ? pn.push(e) : pn.splice(xn(t), 0, e), e.flags |= 1, Cn();
	}
}
function Cn() {
	yn ||= vn.then(An);
}
function wn(e) {
	if (!d(e)) gn && e.id === -1 ? gn.splice(_n + 1, 0, e) : e.flags & 1 || (hn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) hn.push(e[t]);
	Cn();
}
function Tn(e, t, n, r = mn + 1) {
	for (; r < pn.length; r++) {
		let n = pn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			pn.splice(r, 1), r = e ? r - 1 : mn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function En(e, t, n = 0) {
	if (hn.length) {
		let e = hn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < hn.length; i++) {
				let a = hn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? hn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => kn(e) - kn(t));
		if (hn.length = r, gn) {
			for (let e = 0; e < i.length; e++) gn.push(i[e]);
			return;
		}
		for (gn = i, _n = 0; _n < gn.length; _n++) {
			let e = gn[_n];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		gn = null, _n = 0;
	}
}
var Dn = !1;
function On(e, t) {
	if (Dn) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(hn);
	e(), Dn = !0;
	try {
		Tn(void 0, t), En(void 0, n, t);
	} finally {
		Dn = !1;
	}
}
var kn = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function An(e) {
	try {
		for (mn = 0; mn < pn.length; mn++) {
			let e = pn[mn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), ln(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; mn < pn.length; mn++) {
			let e = pn[mn];
			e && (e.flags &= -2);
		}
		mn = -1, pn.length = 0, En(e), yn = null, (pn.length || hn.length) && An(e);
	}
}
var jn = null, Mn = null;
function Nn(e) {
	let t = jn;
	return jn = e, Mn = e && e.type.__scopeId || null, t;
}
function Pn(e, t = jn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && na(-1);
		let i = Nn(t), a = Qi.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Qi.length; e > a; e--) ea();
			Nn(i), r._d && na(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function z(e, n) {
	if (jn === null) return e;
	let r = Ia(jn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && cn(o), i.push({
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
function Fn(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (He(), un(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), Ue());
	}
}
function In(e, t) {
	if (Sa) {
		let n = Sa.provides, r = Sa.parent && Sa.parent.provides;
		r === n && (n = Sa.provides = Object.create(r)), n[e] = t;
	}
}
function Ln(e, t, n = !1) {
	let r = Ca();
	if (r || ri) {
		let i = ri ? ri._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Rn = /* @__PURE__ */ Symbol.for("v-scx"), zn = () => Ln(Rn);
function Bn(e, t) {
	return Vn(e, null, { flush: "sync" });
}
function B(e, t, n) {
	return Vn(e, t, n);
}
function Vn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (ka) {
		if (c === "sync") {
			let e = zn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Sa;
	u.call = (e, t, n) => un(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Ii(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Sn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = sn(e, n, u);
	return ka && (f ? f.push(h) : d && h()), h;
}
function Hn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Un(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Ea(this), s = Vn(i, a.bind(r), n);
	return o(), s;
}
function Un(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Wn = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ Symbol("_vte"), Kn = (e) => e.__isTeleport, qn = (e) => e && (e.disabled || e.disabled === ""), Jn = (e) => e && (e.defer || e.defer === ""), Yn = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Xn = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Zn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, Qn = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = qn(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = qn(e.props), r = e.target = Zn(e.props, m), a = rr(r, e, h, p);
			r && (o !== "svg" && Yn(r) ? o = "svg" : o !== "mathml" && Xn(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), nr(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Wn.get(e) === t) {
					if (Wn.delete(e), qn(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), nr(e, !0);
					}
					x(e);
				}
			};
			Wn.set(e, t), Ii(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Jn(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), nr(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Wn.get(e);
			if (u) {
				u.flags |= 8, Wn.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = qn(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Yn(p) ? o = "svg" : (o === "mathml" || Xn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Hi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : $n(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Zn(t.props, m);
				e && (t.target = e, $n(t, e, null, l, 0));
			} else g && $n(t, p, h, l, 1);
			nr(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = qn(f), m = a || !p, h = Wn.get(e);
		if (h && (h.flags |= 8, Wn.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: $n,
	hydrate: er
};
function $n(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Wn.has(e) && (!d || qn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function er(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Zn(t.props, c), h = qn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || rr(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || rr(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), nr(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var tr = Qn;
function nr(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function rr(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Gn] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var ir = /* @__PURE__ */ Symbol("_leaveCb");
function ar(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Xi) {
			t = n;
			break;
		}
	}
	return t;
}
function or(e) {
	if (!hr(e)) return Kn(e.type) && e.children ? ar(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function sr(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		sr(Kn(n.type) && or(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === U && d(e.children)) {
		let n = di(e.children, !1);
		n && sr(n, t);
	}
}
function cr(e) {
	if (e.component) return cr(e.component.subTree);
	if (e.type === U) {
		let t = d(e.children) && di(e.children, !1);
		return t ? cr(t) : void 0;
	}
	if (e.type !== Xi) return e;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
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
	let s = a.shapeFlag & 4 ? Ia(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ I(v), b = v === t ? i : (e) => !ur(_, e) && u(y, e), x = (e, t) => !(t && ur(_, t));
	if (m != null && m !== p) {
		if (pr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Kt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) ln(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Kt(p);
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
				t.id = -1, dr.set(e, t), Ii(t, r);
			} else pr(e), i();
		}
	}
}
function pr(e) {
	let t = dr.get(e);
	t && (t.flags |= 8, dr.delete(e));
}
oe().requestIdleCallback, oe().cancelIdleCallback;
var mr = (e) => !!e.type.__asyncLoader, hr = (e) => e.type.__isKeepAlive;
function gr(e, t) {
	vr(e, "a", t);
}
function _r(e, t) {
	vr(e, "da", t);
}
function vr(e, t, n = Sa) {
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
function br(e, t, n = Sa, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			He();
			let i = Ea(n), a = un(t, n, e, r);
			return i(), Ue(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var xr = (e) => (t, n = Sa) => {
	(!ka || e === "sp") && br(e, (...e) => t(...e), n);
}, Sr = xr("bm"), Cr = xr("m"), wr = xr("bu"), Tr = xr("u"), Er = xr("bum"), Dr = xr("um"), Or = xr("sp"), kr = xr("rtg"), Ar = xr("rtc");
function jr(e, t = Sa) {
	br("ec", e, t);
}
var Mr = /* @__PURE__ */ Symbol.for("v-ndc");
function H(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ zt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Vt(e), s = /* @__PURE__ */ Bt(e), e = nt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Gt(Wt(e[n])) : Wt(e[n]) : e[n], n, void 0, a && a[n]);
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
var Nr = (e) => e ? Oa(e) ? Ia(e) : Nr(e.parent) : null, Pr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Nr(e.parent),
	$root: (e) => Nr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Wr(e),
	$forceUpdate: (e) => e.f ||= () => {
		Sn(e.update);
	},
	$nextTick: (e) => e.n ||= bn.bind(e.proxy),
	$watch: (e) => Hn.bind(e)
}), Fr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Ir = {
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
			else if (Fr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else zr && (s[n] = 0);
		}
		let d = Pr[n], f, p;
		if (d) return n === "$attrs" && $e(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Fr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Fr(n, c) || u(o, c) || u(i, c) || u(Pr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Lr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Rr(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, Lr(e), Lr(t));
}
var zr = !0;
function Br(e) {
	let t = Wr(e), n = e.proxy, i = e.ctx;
	zr = !1, t.beforeCreate && Hr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: ee, expose: k, inheritAttrs: te, components: ne, directives: A, filters: re } = t;
	if (u && Vr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Ft(t));
	}
	if (zr = !0, o) for (let e in o) {
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
	if (c) for (let e in c) Ur(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			In(t, e[t]);
		});
	}
	f && Hr(f, e, "c");
	function j(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (j(Sr, p), j(Cr, m), j(wr, g), j(Tr, _), j(gr, y), j(_r, b), j(jr, O), j(Ar, E), j(kr, D), j(Er, S), j(Dr, w), j(Or, ee), d(k)) {
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
	T && e.render === r && (e.render = T), te != null && (e.inheritAttrs = te), ne && (e.components = ne), A && (e.directives = A), ee && lr(e);
}
function Vr(e, t, n = r) {
	d(e) && (e = Yr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Ln(r.from || n, r.default, !0) : Ln(r.from || n) : Ln(r), /* @__PURE__ */ Kt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Hr(e, t, n) {
	un(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Ur(e, t, n, r) {
	let i = r.includes(".") ? Un(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && B(i, n);
	} else if (h(e)) B(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Ur(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && B(i, r, e);
		}
	}
}
function Wr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Gr(c, e, o, !0)), Gr(c, t, o)), v(t) && a.set(t, c), c;
}
function Gr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Gr(e, a, n, !0), i && i.forEach((t) => Gr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Kr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Kr = {
	data: qr,
	props: Qr,
	emits: Qr,
	methods: Zr,
	computed: Zr,
	beforeCreate: Xr,
	created: Xr,
	beforeMount: Xr,
	mounted: Xr,
	beforeUpdate: Xr,
	updated: Xr,
	beforeDestroy: Xr,
	beforeUnmount: Xr,
	destroyed: Xr,
	unmounted: Xr,
	activated: Xr,
	deactivated: Xr,
	errorCaptured: Xr,
	serverPrefetch: Xr,
	components: Zr,
	directives: Zr,
	watch: $r,
	provide: qr,
	inject: Jr
};
function qr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Jr(e, t) {
	return Zr(Yr(e), Yr(t));
}
function Yr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Xr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Zr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Qr(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Lr(e), Lr(t ?? {})) : t;
}
function $r(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Xr(e[r], t[r]);
	return n;
}
function ei() {
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
var ti = 0;
function ni(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = ei(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ti++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Ra,
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
					let u = l._ceVNode || q(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Ia(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (un(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = ri;
				ri = l;
				try {
					return e();
				} finally {
					ri = t;
				}
			}
		};
		return l;
	};
}
var ri = null;
function ii(e, n, r = t) {
	let i = Ca(), a = O(n), o = k(n), s = ai(e, a), c = $t((s, c) => {
		let l, u = t, d;
		return Bn(() => {
			let t = e[a];
			A(l, t) && (l = t, c());
		}), {
			get() {
				return s(), r.get ? r.get(l) : l;
			},
			set(e) {
				let s = r.set ? r.set(e) : e;
				if (!A(s, l) && !(u !== t && A(e, u))) return;
				let f = i.vnode.props, p = !!(f && (n in f || a in f || o in f) && (`onUpdate:${n}` in f || `onUpdate:${a}` in f || `onUpdate:${o}` in f));
				p || (l = e, c()), i.emit(`update:${n}`, s), A(e, u) && (A(e, s) && !A(s, d) || p && u !== t && !A(s, l)) && c(), u = e, d = s;
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
var ai = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function oi(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ai(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(ie)));
	let c, l = i[c = ne(n)] || i[c = ne(O(n))];
	!l && o && (l = i[c = ne(k(n))]), l && un(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, un(u, e, 6, a);
	}
}
var si = /* @__PURE__ */ new WeakMap();
function ci(e, t, n = !1) {
	let r = n ? si : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ci(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function li(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function ui(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Nn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = pa(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = pa(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : fi(c);
		}
	} catch (t) {
		Qi.length = 0, dn(t, e, 1), v = q(Xi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = pi(y, a)), b = da(b, y, !1, !0));
	}
	return n.dirs && (b = da(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && sr(Kn(b.type) && or(b) || b, n.transition), v = b, Nn(_), v;
}
function di(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (aa(r)) {
			if (r.type !== Xi || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var fi = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, pi = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function mi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? hi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (gi(o, r, n) && !li(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || hi(r, o, l) : !!o;
	return !1;
}
function hi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || gi(t, e, a) && !li(n, a)) return !0;
	}
	return !1;
}
function gi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !_e(r, i) : r !== i;
}
function _i({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var vi = {}, yi = () => Object.create(vi), bi = (e) => Object.getPrototypeOf(e) === vi;
function xi(e, t, n, r = !1) {
	let i = {}, a = yi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Ci(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ It(i) : e.type.props ? i : a, e.attrs = a;
}
function Si(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ I(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (li(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = O(o);
						i[t] = wi(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		Ci(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = k(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = wi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && et(e.attrs, "set", "");
}
function Ci(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : li(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ I(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = wi(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function wi(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Ea(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var Ti = /* @__PURE__ */ new WeakMap();
function Ei(e, r, i = !1) {
	let a = i ? Ti : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Ei(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		Di(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (Di(t)) {
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
function Di(e) {
	return e[0] !== "$" && !T(e);
}
var Oi = (e) => e === "_" || e === "_ctx" || e === "$stable", ki = (e) => d(e) ? e.map(pa) : [pa(e)], Ai = (e, t, n) => {
	if (t._n) return t;
	let r = Pn((...e) => ki(t(...e)), n);
	return r._c = !1, r;
}, ji = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Oi(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Ai(n, i, r);
		else if (i != null) {
			let e = ki(i);
			t[n] = () => e;
		}
	}
}, Mi = (e, t) => {
	let n = ki(t);
	e.slots.default = () => n;
}, Ni = (e, t, n) => {
	for (let r in t) (n || !Oi(r)) && (e[r] = t[r]);
}, Pi = (e, t, n) => {
	let r = e.slots = yi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Ni(r, t, n), n && j(r, "_", e, !0)) : ji(t, r);
	} else t && Mi(e, t);
}, Fi = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Ni(a, n, r) : (o = !n.$stable, ji(n, a)), s = n;
	} else n && (Mi(e, n), s = { default: 1 });
	if (o) for (let e in a) !Oi(e) && s[e] == null && delete a[e];
}, Ii = Ji;
function Li(e) {
	return Ri(e);
}
function Ri(e, i) {
	let a = oe();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !oa(e, t) && (i = he(e), N(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case Yi:
				y(e, t, r, i);
				break;
			case Xi:
				b(e, t, r, i);
				break;
			case Zi:
				e ?? x(t, r, i, s);
				break;
			case U:
				ne(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? A(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, _e);
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
				n && n._beginPatch(), ee(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, E = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, zi(e, a), s, u), _ && Fn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && _a(f, r, e);
		}
		_ && Fn(e, null, r, "beforeMount");
		let v = Vi(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Ii(() => {
			try {
				f && _a(f, r, e), v && g.enter(d), _ && Fn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || qi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? ma(e[l]) : pa(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, ee = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Bi(r, !1), (g = h.onVnodeBeforeUpdate) && _a(g, r, n, e), f && Fn(n, e, r, "beforeUpdate"), r && Bi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, zi(n, a), o) : s || ce(e, n, l, null, r, i, zi(n, a), o, !1), u > 0) {
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
		((g = h.onVnodeUpdated) || f) && Ii(() => {
			g && _a(g, r, n, e), f && Fn(n, e, r, "updated");
		}, i);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Ki(c), d = u && (c.type === U || !oa(c, l) || c.shapeFlag & 198) ? m(u) : n;
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
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Hi(e, t, !0)) : ce(e, t, n, f, i, a, s, c, l);
	}, A = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : ie(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = xa(e, r, i);
		if (hr(e) && (s.ctx.renderer = _e), Aa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ae, o, a), !e.el) {
				let r = s.subTree = q(Xi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else ae(s, e, t, n, i, a, o);
	}, ie = (e, t, n) => {
		let r = t.component = e.component;
		if (mi(e, t, n)) {
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
					let n = Wi(e);
					if (n) {
						t && (t.el = c.el, se(e, t, o)), n.asyncDep.then(() => {
							Ii(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Bi(e, !1), t ? (t.el = c.el, se(e, t, o)) : t = c, n && re(n), (d = t.props && t.props.onVnodeBeforeUpdate) && _a(d, s, t, c), Bi(e, !0);
				let f = ui(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), he(p), e, i, a), t.el = f.el, u === null && _i(e, f.el), r && Ii(r, i), (d = t.props && t.props.onVnodeUpdated) && Ii(() => _a(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = mr(t);
				if (Bi(e, !1), l && re(l), !m && (o = c && c.onVnodeBeforeMount) && _a(o, d, t), Bi(e, !0), s && ye) {
					let t = () => {
						e.subTree = ui(e), ye(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = ui(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Ii(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Ii(() => _a(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && mr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Ii(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new De(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Sn(u), Bi(e, !0), l();
	}, se = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Si(e, t.props, r, n), Fi(e, t.children, n), He(), Tn(e), Ue();
	}, ce = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				le(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				M(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && me(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? le(l, d, n, r, i, a, o, s, c) : me(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, M = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? ma(t[p]) : pa(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? me(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, le = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? ma(t[u]) : pa(t[u]);
			if (oa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? ma(t[p]) : pa(t[p]);
			if (oa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? ma(t[u]) : pa(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) N(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? ma(t[u]) : pa(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					N(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && oa(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? N(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Ui(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Ki(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? ue(n, r, p, 2) : _--);
			}
		}
	}, ue = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) ue(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, _e);
		else if (c === U) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) ue(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === Zi) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[ir] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Ii(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[ir];
					a._isLeaving && a[ir](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, N = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (He(), fr(s, null, n, e, !0), Ue()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !mr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && _a(_, t, e), u & 6) pe(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Fn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, _e, r) : l && !l.hasOnce && (a !== U || d > 0 && d & 64) ? me(l, t, n, !1, !0) : (a === U && d & 384 || !i && u & 16) && me(c, t, n), r && de(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Ii(() => {
			_ && _a(_, t, e), h && Fn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, de = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === U;
		if (a && !i) {
			fe(n, r);
			return;
		}
		if (t === Zi) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? cr(e) : e, c = () => {
			a ? m(n) && fe(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, fe = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, pe = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Gi(c), Gi(l), r && re(r), i.stop(), a ? (a.flags |= 8, N(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, N(o, e, t, n)), s && Ii(s, t), Ii(() => {
			e.isUnmounted = !0;
		}, t);
	}, me = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) N(e[o], t, n, r, i);
	}, he = (e) => {
		if (e.shapeFlag & 6) return he(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Gn];
		return n ? h(n) : t;
	}, ge = (e, t, n) => {
		On(() => {
			e == null ? t._vnode && N(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : ba());
	}, _e = {
		p: v,
		um: N,
		m: ue,
		r: de,
		mt: j,
		mc: O,
		pc: ce,
		pbc: k,
		n: he,
		o: e
	}, ve, ye;
	return i && ([ve, ye] = i(_e)), {
		render: ge,
		hydrate: ve,
		createApp: ni(ge, ve)
	};
}
function zi({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Bi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Vi(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Hi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = ma(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Hi(t, a)), a.type === Yi && (a.patchFlag === -1 && (a = i[e] = ma(a)), a.el = t.el), a.type === Xi && !a.el && (a.el = t.el);
	}
}
function Ui(e) {
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
function Wi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Wi(t);
}
function Gi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Ki(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Ki(t.subTree) : null;
}
var qi = (e) => e.__isSuspense;
function Ji(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : wn(e);
}
var U = /* @__PURE__ */ Symbol.for("v-fgt"), Yi = /* @__PURE__ */ Symbol.for("v-txt"), Xi = /* @__PURE__ */ Symbol.for("v-cmt"), Zi = /* @__PURE__ */ Symbol.for("v-stc"), Qi = [], $i = null;
function W(e = !1) {
	Qi.push($i = e ? null : []);
}
function ea() {
	Qi.pop(), $i = Qi[Qi.length - 1] || null;
}
var ta = 1;
function na(e, t = !1) {
	ta += e, e < 0 && $i && t && ($i.hasOnce = !0);
}
function ra(e) {
	return e.dynamicChildren = ta > 0 ? $i || n : null, ea(), ta > 0 && $i && $i.push(e), e;
}
function G(e, t, n, r, i, a) {
	return ra(K(e, t, n, r, i, a, !0));
}
function ia(e, t, n, r, i) {
	return ra(q(e, t, n, r, i, !0));
}
function aa(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function oa(e, t) {
	return e.type === t.type && e.key === t.key;
}
var sa = ({ key: e }) => e ?? null, ca = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Kt(e) || h(e) ? {
	i: jn,
	r: e,
	k: t,
	f: !!n
} : e);
function K(e, t = null, n = null, r = 0, i = null, a = e === U ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && sa(t),
		ref: t && ca(t),
		scopeId: Mn,
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
		ctx: jn
	};
	return s ? (ha(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), ta > 0 && !o && $i && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && $i.push(c), c;
}
var q = la;
function la(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Mr) && (e = Xi), aa(e)) {
		let r = da(e, t, !0);
		return n && ha(r, n), ta > 0 && !a && $i && (r.shapeFlag & 6 ? $i[$i.indexOf(e)] = r : $i.push(r)), r.patchFlag = -2, r;
	}
	if (La(e) && (e = e.__vccOpts), t) {
		t = ua(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = N(e)), v(n) && (/* @__PURE__ */ Ht(n) && !d(n) && (n = s({}, n)), t.style = se(n));
	}
	let o = g(e) ? 1 : qi(e) ? 128 : Kn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return K(e, t, n, r, i, o, a, !0);
}
function ua(e) {
	return e ? /* @__PURE__ */ Ht(e) || bi(e) ? s({}, e) : e : null;
}
function da(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? ga(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && sa(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(ca(t)) : [a, ca(t)] : ca(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== U ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && da(e.ssContent),
		ssFallback: e.ssFallback && da(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && sr(u, c.clone(u)), u;
}
function J(e = " ", t = 0) {
	return q(Yi, null, e, t);
}
function fa(e, t) {
	let n = q(Zi, null, e);
	return n.staticCount = t, n;
}
function Y(e = "", t = !1) {
	return t ? (W(), ia(Xi, null, e)) : q(Xi, null, e);
}
function pa(e) {
	return e == null || typeof e == "boolean" ? q(Xi) : d(e) ? q(U, null, e.slice()) : aa(e) ? ma(e) : q(Yi, null, String(e));
}
function ma(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : da(e);
}
function ha(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), ha(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !bi(t) ? t._ctx = jn : r === 3 && jn && (jn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ha(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: jn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [J(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function ga(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = N([t.class, r.class]));
		else if (e === "style") t.style = se([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function _a(e, t, n, r = null) {
	un(e, t, 7, [n, r]);
}
var va = ei(), ya = 0;
function ba() {
	return ya;
}
function xa(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || va, o = {
		uid: ya++,
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
		scope: new Ce(!0),
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
		propsOptions: Ei(i, a),
		emitsOptions: ci(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = oi.bind(null, o), e.ce && e.ce(o), o;
}
var Sa = null, Ca = () => Sa || jn, wa, Ta;
{
	let e = oe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	wa = t("__VUE_INSTANCE_SETTERS__", (e) => Sa = e), Ta = t("__VUE_SSR_SETTERS__", (e) => ka = e);
}
var Ea = (e) => {
	let t = Sa;
	return wa(e), e.scope.on(), () => {
		e.scope.off(), wa(t);
	};
}, Da = () => {
	Sa && Sa.scope.off(), wa(null);
};
function Oa(e) {
	return e.vnode.shapeFlag & 4;
}
var ka = !1;
function Aa(e, t = !1, n = !1) {
	t && Ta(t);
	let { props: r, children: i } = e.vnode, a = Oa(e);
	xi(e, r, a, t), Pi(e, i, n || t);
	let o = a ? ja(e, t) : void 0;
	return t && Ta(!1), o;
}
function ja(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ir);
	let { setup: r } = n;
	if (r) {
		He();
		let n = e.setupContext = r.length > 1 ? Fa(e) : null, i = Ea(e), a = ln(r, e, 0, [e.props, n]), o = y(a);
		if (Ue(), i(), (o || e.sp) && !mr(e) && lr(e), o) {
			if (a.then(Da, Da), t) return a.then((n) => {
				Ta(!0);
				try {
					Ma(e, n, t);
				} finally {
					Ta(!1);
				}
			}).catch((t) => {
				dn(t, e, 0);
			});
			e.asyncDep = a;
		} else Ma(e, a, t);
	} else Na(e, t);
}
function Ma(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Zt(t)), Na(e, n);
}
function Na(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = Ea(e);
		He();
		try {
			Br(e);
		} finally {
			Ue(), t();
		}
	}
}
var Pa = { get(e, t) {
	return $e(e, "get", ""), e[t];
} };
function Fa(e) {
	return {
		attrs: new Proxy(e.attrs, Pa),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Ia(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Zt(Ut(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Pr) return Pr[n](e);
		},
		has(e, t) {
			return t in e || t in Pr;
		}
	}) : e.proxy;
}
function La(e) {
	return h(e) && "__vccOpts" in e;
}
var X = (e, t) => /* @__PURE__ */ tn(e, t, ka), Ra = "3.5.44", za = void 0, Ba = typeof window < "u" && window.trustedTypes;
if (Ba) try {
	za = /* @__PURE__ */ Ba.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Va = za ? (e) => za.createHTML(e) : (e) => e, Ha = "http://www.w3.org/2000/svg", Ua = "http://www.w3.org/1998/Math/MathML", Wa = typeof document < "u" ? document : null, Ga = Wa && /* @__PURE__ */ Wa.createElement("template"), Ka = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Wa.createElementNS(Ha, e) : t === "mathml" ? Wa.createElementNS(Ua, e) : n ? Wa.createElement(e, { is: n }) : Wa.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Wa.createTextNode(e),
	createComment: (e) => Wa.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Wa.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Ga.innerHTML = Va(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Ga.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, qa = /* @__PURE__ */ Symbol("_vtc");
function Ja(e, t, n) {
	let r = e[qa];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ya = /* @__PURE__ */ Symbol("_vod"), Xa = /* @__PURE__ */ Symbol("_vsh"), Za = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[Ya] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Qa(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), Qa(e, !0), r.enter(e)) : r.leave(e, () => {
			Qa(e, !1);
		}) : Qa(e, t));
	},
	beforeUnmount(e, { value: t }) {
		Qa(e, t);
	}
};
function Qa(e, t) {
	e.style.display = t ? e[Ya] : "none", e[Xa] = !t;
}
var $a = /* @__PURE__ */ Symbol(""), eo = /(?:^|;)\s*display\s*:/;
function to(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? ro(r, t, "");
			}
			else for (let e in t) n[e] ?? ro(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? ro(r, i, "") : so(e, i, !g(t) && t ? t[i] : void 0, o) || ro(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[$a];
			e && (n += ";" + e), r.cssText = n, a = eo.test(n);
		}
	} else t && e.removeAttribute("style");
	Ya in e && ((!i || t !== n) && (e[Ya] = a ? r.display : ""), e[Xa] && (r.display = "none"));
}
var no = /\s*!important$/;
function ro(e, t, n) {
	if (d(n)) n.forEach((n) => ro(e, t, n));
	else if (n ??= "", t.startsWith("--")) no.test(n) ? e.setProperty(t, n.replace(no, ""), "important") : e.setProperty(t, n);
	else {
		let r = oo(e, t);
		no.test(n) ? e.setProperty(k(r), n.replace(no, ""), "important") : e[r] = n;
	}
}
var io = [
	"Webkit",
	"Moz",
	"ms"
], ao = {};
function oo(e, t) {
	let n = ao[t];
	if (n) return n;
	let r = O(t);
	if (r !== "filter" && r in e) return ao[t] = r;
	r = te(r);
	for (let n = 0; n < io.length; n++) {
		let i = io[n] + r;
		if (i in e) return ao[t] = i;
	}
	return t;
}
function so(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var co = "http://www.w3.org/1999/xlink";
function lo(e, t, n, r, i, a = de(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(co, t.slice(6, t.length)) : e.setAttributeNS(co, t, n) : n == null || a && !fe(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function uo(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Va(n) : n);
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
		r === "boolean" ? n = fe(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function fo(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function po(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var mo = /* @__PURE__ */ Symbol("_vei");
function ho(e, t, n, r, i = null) {
	let a = e[mo] || (e[mo] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = vo(t);
		r ? fo(e, n, a[t] = So(r, i), s) : o && (po(e, n, o, s), a[t] = void 0);
	}
}
var go = /(Once|Passive|Capture)$/, _o = /^on:?(?:Once|Passive|Capture)$/;
function vo(e) {
	let t, n;
	for (; (n = e.match(go)) && !_o.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var yo = 0, bo = /* @__PURE__ */ Promise.resolve(), xo = () => yo ||= (bo.then(() => yo = 0), Date.now());
function So(e, t) {
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
				e && un(e, t, 5, a);
			}
		} else un(r, t, 5, [e]);
	};
	return n.value = e, n.attached = xo(), n;
}
var Co = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, wo = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Ja(e, r, c) : t === "style" ? to(e, n, r) : a(t) ? o(t) || ho(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : To(e, t, r, c)) ? (uo(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && lo(e, t, r, c, s, t !== "value")) : e._isVueCE && (Eo(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? uo(e, O(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), lo(e, t, r, c));
};
function To(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Co(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Co(t) && g(n) ? !1 : t in e;
}
function Eo(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = O(t);
	return Array.isArray(n) ? n.some((e) => O(e) === r) : Object.keys(n).some((e) => O(e) === r);
}
var Do = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => re(t, e) : t;
};
function Oo(e) {
	e.target.composing = !0;
}
function ko(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var Ao = /* @__PURE__ */ Symbol("_assign"), jo = /* @__PURE__ */ Symbol("_initialValue");
function Mo(e, t, n) {
	return t && (e = e.trim()), n && (e = ie(e)), e;
}
var No = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[jo] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[jo] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[Ao] = Do(i);
		let a = r || i.props && i.props.type === "number";
		fo(e, t ? "change" : "input", (t) => {
			t.target.composing || e[Ao](Mo(e.value, n, a));
		}), (n || a) && fo(e, "change", () => {
			e.value = Mo(e.value, n, a);
		}), t || (fo(e, "compositionstart", Oo), fo(e, "compositionend", ko), fo(e, "change", ko));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[jo];
		delete e[jo], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[Ao](Mo(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[Ao] = Do(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ie(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Po = {
	deep: !0,
	created(e, t, n) {
		e[Ao] = Do(n), fo(e, "change", () => {
			let t = e._modelValue, n = zo(e), r = e.checked, i = e[Ao];
			if (d(t)) {
				let e = ve(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Bo(e, r));
		});
	},
	mounted: Fo,
	beforeUpdate(e, t, n) {
		e[Ao] = Do(n), Fo(e, t, n);
	}
};
function Fo(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = ve(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = _e(t, Bo(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Io = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, fo(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ie(zo(e)) : zo(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[Ao](i);
			} finally {
				bn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[Ao] = Do(r);
	},
	mounted(e, { value: t }) {
		Ro(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[Ao] = Do(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !Lo(t, n[1], n[0])) && Ro(e, t);
	}
};
function Lo(e, t, n) {
	if (!n || d(e)) return _e(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function Ro(e, t) {
	let n = e.multiple, r = d(t);
	if (!n || r || p(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = zo(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : ve(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (_e(zo(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function zo(e) {
	return "_value" in e ? e._value : e.value;
}
function Bo(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Vo = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Ho = {
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
	exact: (e, t) => Vo.some((n) => e[`${n}Key`] && !t.includes(n))
}, Uo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Ho[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Wo = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, Go = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = k(n.key);
		if (t.some((e) => e === r || Wo[e] === r)) return e(n);
	}));
}, Ko = /* @__PURE__ */ s({ patchProp: wo }, Ka), qo;
function Jo() {
	return qo ||= Li(Ko);
}
var Yo = ((...e) => {
	let t = Jo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Zo(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Xo(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Xo(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Zo(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/studio/routes.ts
var Qo = [
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
], $o = "studio.selectedWordId";
function es() {
	try {
		return localStorage.getItem($o) ?? "";
	} catch {
		return "";
	}
}
function ts() {
	let e = /* @__PURE__ */ L("wakewords"), t = /* @__PURE__ */ L(""), n = /* @__PURE__ */ L("review");
	function r() {
		let [r, i = ""] = location.hash.replace(/^#\/?/, "").split("?");
		e.value = r === "scrape" ? "classify" : Qo.find((e) => e.id === r)?.id ?? "wakewords", t.value = new URLSearchParams(i).get("word") ?? es();
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
			t.value ? localStorage.setItem($o, t.value) : localStorage.removeItem($o);
		} catch {}
		history.replaceState(null, "", i(e.value));
	}
	let o = B(t, a, { flush: "sync" });
	function s(t) {
		e.value = t, location.hash !== i(t) && history.pushState(null, "", i(t));
	}
	function c(e) {
		n.value = e, s("classify");
	}
	return window.addEventListener("hashchange", r), window.addEventListener("popstate", r), Te(() => {
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
var ns = "/api/studio", rs = encodeURIComponent;
function is(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var as = class extends Error {
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
async function os(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${ns}${e}`, {
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
	if (!i.ok) throw new as(i.status);
	if (i.status !== 204) return i.json();
}
function ss(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function cs(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => ss(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var Z = (e) => `/wakewords/${rs(e)}`, ls = (e, t) => `${Z(e)}/samples/${rs(t)}`, Q = (e, t, n) => os(e + is(t), "GET", void 0, n), us = (e, t, n) => os(e, "POST", t, n), ds = (e, t, n) => os(e, "PUT", t, n), $ = {
	capabilities: (e) => Q("/capabilities", void 0, e),
	migration: (e) => Q("/migration", void 0, e),
	importLegacy: (e, t) => us("/migration/import", e, t),
	wakewords: (e, t) => Q("/wakewords", e, t),
	wakeword: (e, t) => Q(Z(e), void 0, t),
	createWakeword: (e, t) => us("/wakewords", e, t),
	updateWakeword: (e, t, n) => os(Z(e), "PATCH", t, n),
	deleteWakeword: (e, t) => os(Z(e), "DELETE", void 0, t),
	samples: (e, t, n) => Q(`${Z(e)}/samples`, t, n),
	queue: (e, t, n) => Q(`${Z(e)}/queue`, t, n),
	sample: (e, t, n) => Q(ls(e, t), void 0, n),
	unmapped: (e, t) => Q("/recordings/unmapped", e, t),
	assign: (e, t, n) => us(`/recordings/${rs(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), us(`${Z(e)}/samples/import`, i, r);
	},
	label: (e, t, n, r, i) => us(`${ls(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => us(`${ls(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => us(`${ls(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => os(`${ls(e, t)}${is({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${ns}${ls(e, t)}/audio${is({ original: n })}`,
	devices: (e) => Q("/devices", void 0, e),
	addDevice: (e, t, n, r) => us("/devices", {
		url: e,
		password: t,
		role: n
	}, r),
	updateDevice: (e, t, n) => os(`/devices/${rs(e)}`, "PATCH", { url: t }, n),
	deleteDevice: (e, t) => os(`/devices/${rs(e)}`, "DELETE", void 0, t),
	refreshDevices: (e, t) => us(`/devices/${rs(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => us(`/devices/${rs(e)}/credentials`, { password: t }, n),
	sourceMappings: (e, t) => Q(`/devices/${rs(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => ds(`/devices/${rs(e)}/source-mappings`, t, n),
	scrape: (e, t) => us("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Q("/scrape/runs", e, t),
	schedules: (e) => Q("/schedules", void 0, e),
	automation: (e, t) => Q(`${Z(e)}/automation`, void 0, t),
	saveAutomation: (e, t, n) => ds(`${Z(e)}/automation`, t, n),
	collect: (e, t, n) => us(`${Z(e)}/collection/jobs`, { device_ids: t }, n),
	saveSchedule: (e, t, n) => ds(`/schedules/${rs(e)}`, t, n),
	jobs: (e, t) => Q("/jobs", e, t),
	enqueueScrape: (e, t) => us("/jobs", e, t),
	health: (e) => Q("/jobs/health", void 0, e),
	job: (e, t) => Q(`/jobs/${rs(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Q(`/jobs/${rs(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => us(`/jobs/${rs(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Q(`${Z(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => ds(`${Z(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => us(`/datasets/${rs(e)}/download`, void 0, t),
	generationCatalog: (e) => Q("/generation/catalog", void 0, e),
	generationDefaults: (e) => Q("/generation/defaults", void 0, e),
	generationRecipe: (e, t) => Q(`${Z(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => ds(`${Z(e)}/generation/recipe`, t, n),
	generate: (e, t, n) => us(`${Z(e)}/generation/jobs`, t, n),
	preview: (e, t, n) => us(`${Z(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${ns}${Z(e)}/generation/previews/${rs(t)}/audio`,
	batches: (e, t, n) => Q(`${Z(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Q(`${Z(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Q(`${Z(e)}/generation/batches/${rs(t)}`, void 0, n),
	selectBatches: (e, t, n) => ds(`${Z(e)}/generation/batches`, { batch_ids: t }, n),
	trainingSettings: (e, t) => Q(`${Z(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => ds(`${Z(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Q(`${Z(e)}/training/counts`, void 0, t),
	train: (e, t) => us(`${Z(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Q(`${Z(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Q(`${Z(e)}/training/runs/${rs(t)}`, void 0, n),
	models: (e, t, n) => Q(`${Z(e)}/models`, t, n),
	model: (e, t, n) => Q(`${Z(e)}/models/${rs(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${ns}${Z(e)}/models/${rs(t)}/archive${n === void 0 ? "" : `/${rs(n)}`}`,
	deploymentCapabilities: (e) => Q("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Q(`${Z(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Q(`${Z(e)}/deployment/history`, t, n),
	publish: (e, t, n) => us(`${Z(e)}/deployment/publish`, { version_id: t }, n),
	rollback: (e, t, n) => us(`${Z(e)}/deployment/rollback`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function fs(e) {
	let t = /* @__PURE__ */ L([]), n = e.selectedId, r = /* @__PURE__ */ qt(null), i = /* @__PURE__ */ qt(null), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u, d, f = !1, p = "That wakeword is no longer available. Select another workspace.";
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
			e instanceof as && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
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
	return B(n, () => {
		g();
	}, { flush: "sync" }), Te(() => {
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
	let e = Ln(ps);
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
}, Rs = { id: "delete-heading" }, zs = { class: "flex flex-wrap gap-3 mt-3" }, Bs = ["disabled"], Vs = ["disabled"], Hs = /* @__PURE__ */ V({
	__name: "WakewordsPage",
	setup(e) {
		let t = ms(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ Ft({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ Ft({
			phrase: "",
			language: ""
		}), f = /* @__PURE__ */ L(!1), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(!1), g = /* @__PURE__ */ L(!1), _ = /* @__PURE__ */ L(), v = /* @__PURE__ */ L();
		async function y() {
			g.value = !0, await bn(), _.value?.focus();
		}
		function b() {
			g.value = !1, v.value?.focus();
		}
		function x(e) {
			if (e.key !== "Tab") return;
			let t = e.currentTarget, n = Array.from(t.querySelectorAll("input:not(:disabled), select:not(:disabled), button:not(:disabled), [tabindex=\"0\"]")), r = n[0], i = n.at(-1);
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i?.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
		let S;
		B(i, (e) => {
			d.phrase = e?.phrase ?? "", d.language = e?.language ?? "";
		}, { immediate: !0 }), B(r, () => {
			S?.abort(), f.value = !1, g.value = !1, h.value = !1, p.value = "", m.value = "";
		}), Te(() => {
			S?.abort();
		});
		async function C() {
			if (!h.value || f.value || !r.value) return;
			let e = r.value, n = new AbortController();
			S = n, f.value = !0, p.value = "", m.value = "";
			try {
				if (await $.deleteWakeword(e, n.signal), n.signal.aborted) return;
				t.remove(e);
			} catch (e) {
				n.signal.aborted || (p.value = e instanceof as && e.status === 409 ? "Cancel queued or active jobs before deleting this workspace, then try again." : e instanceof Error ? e.message : "Unable to delete workspace.");
			} finally {
				S === n && (f.value = !1);
			}
		}
		async function w(e) {
			if (f.value) return;
			let i = r.value, a = new AbortController();
			S = a, f.value = !0, m.value = "", p.value = "";
			try {
				let o = e === "create" ? await $.createWakeword({ ...u }, a.signal) : await $.updateWakeword(i, { ...d }, a.signal);
				if (a.signal.aborted || r.value !== i) return;
				t.wakewords.value = e === "create" ? [...n.value, o] : n.value.map((e) => e.id === o.id ? o : e), e === "create" && (u.phrase = ""), t.select(o.id), await t.refreshSelected(), a.signal.aborted || (m.value = "Workspace saved.", e === "edit" && b());
			} catch (e) {
				a.signal.aborted || (p.value = e instanceof Error ? e.message : "Unable to save workspace.");
			} finally {
				S === a && (f.value = !1);
			}
		}
		return (e, S) => (W(), G("section", null, [
			K("div", hs, [S[12] ||= K("div", null, [K("h1", null, "Wakewords"), K("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), K("button", {
				"data-action": "refresh",
				disabled: R(c),
				onClick: S[0] ||= (e) => R(t).load()
			}, "Refresh workspaces", 8, gs)]),
			!R(c) && !R(l) && !R(n).length ? (W(), G("p", _s, "No wakewords yet. Create your first workspace below.")) : Y("", !0),
			K("div", vs, [(W(!0), G(U, null, H(R(n), (e) => (W(), G("button", {
				key: e.id,
				class: N(["studio-card studio-word-card", { "studio-selected": e.id === R(r) }]),
				"aria-pressed": e.id === R(r),
				onClick: (n) => R(t).select(e.id)
			}, [K("span", bs, [K("strong", null, P(e.phrase), 1), K("span", xs, P(e.language), 1)])], 10, ys))), 128))]),
			R(o) ? (W(), G("p", Ss, "Loading selected workspace…")) : Y("", !0),
			R(s) ? (W(), G("div", Cs, [J(P(R(s)) + " ", 1), K("button", { onClick: S[1] ||= (e) => R(t).refreshSelected() }, "Retry workspace")])) : Y("", !0),
			R(a) && R(i) ? (W(), G("div", ws, [K("div", Ts, [K("h2", null, P(R(i).phrase) + " · Overview", 1), K("details", null, [
				S[13] ||= K("summary", null, "Actions", -1),
				K("button", {
					ref_key: "editTrigger",
					ref: v,
					"data-action": "edit-workspace",
					type: "button",
					disabled: f.value,
					onClick: y
				}, "Rename / change language", 8, Es),
				K("button", {
					"data-action": "delete-workspace",
					type: "button",
					disabled: f.value,
					onClick: S[2] ||= (e) => h.value = !0
				}, "Delete workspace", 8, Ds)
			])]), K("dl", Os, [
				K("div", null, [S[14] ||= K("dt", { class: "studio-muted" }, "Pending classification", -1), K("dd", null, P(R(a).pending) + " pending", 1)]),
				K("div", null, [
					S[15] ||= K("dt", { class: "studio-muted" }, "Archived models", -1),
					K("dd", null, P(R(a).modelCount) + " versions", 1),
					K("dd", ks, P(R(a).latestModel ? `Latest: ${R(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				K("div", null, [
					S[16] ||= K("dt", { class: "studio-muted" }, "Autotrain", -1),
					K("dd", null, P(R(a).schedule?.enabled ? `${R(a).schedule.cron} · ${R(a).schedule.timezone}` : "Not scheduled"), 1),
					R(a).schedule?.enabled ? (W(), G("dd", As, "Next: " + P(R(a).schedule.next_run_at), 1)) : Y("", !0)
				])
			])])) : Y("", !0),
			p.value ? (W(), G("p", js, P(p.value), 1)) : Y("", !0),
			m.value ? (W(), G("p", Ms, P(m.value), 1)) : Y("", !0),
			K("div", Ns, [K("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: S[5] ||= Uo((e) => w("create"), ["prevent"])
			}, [
				S[19] ||= K("h2", null, "New wakeword", -1),
				K("label", null, [S[17] ||= J("Display phrase", -1), z(K("input", {
					"onUpdate:modelValue": S[3] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[No, u.phrase]])]),
				K("label", null, [S[18] ||= J("Language", -1), z(K("input", {
					"onUpdate:modelValue": S[4] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[No, u.language]])]),
				K("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Create wakeword", 8, Ps)
			], 32)]),
			R(i) && g.value ? (W(), G("div", {
				key: 6,
				class: "studio-modal-backdrop",
				onKeydown: S[9] ||= Go((e) => !f.value && b(), ["esc"])
			}, [K("form", {
				"data-form": "edit",
				class: "studio-card grid gap-3",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Edit wakeword",
				onKeydown: x,
				onSubmit: S[8] ||= Uo((e) => w("edit"), ["prevent"])
			}, [
				K("h2", null, "Edit " + P(R(i).phrase), 1),
				K("label", null, [S[20] ||= J("Display phrase", -1), z(K("input", {
					ref_key: "editInput",
					ref: _,
					"onUpdate:modelValue": S[6] ||= (e) => d.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[No, d.phrase]])]),
				K("label", null, [S[21] ||= J("Language", -1), z(K("input", {
					"onUpdate:modelValue": S[7] ||= (e) => d.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[No, d.language]])]),
				S[22] ||= K("p", { class: "studio-muted text-xs" }, "Changing the display phrase never renames deployed models or changes a kiosk’s enabled wakewords.", -1),
				K("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Save changes", 8, Fs),
				K("button", {
					type: "button",
					disabled: f.value,
					onClick: b
				}, "Cancel", 8, Is),
				p.value ? (W(), G("p", Ls, P(p.value), 1)) : Y("", !0)
			], 32)], 32)) : Y("", !0),
			h.value && R(i) ? (W(), G("section", {
				key: 7,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: S[11] ||= Go((e) => !f.value && (h.value = !1), ["esc"])
			}, [
				K("h2", Rs, "Delete " + P(R(i).phrase) + " permanently?", 1),
				S[23] ||= K("p", { id: "delete-description" }, "This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.", -1),
				S[24] ||= K("p", { class: "studio-muted" }, "Deployed kiosk files and shared datasets are not deleted.", -1),
				K("div", zs, [K("button", {
					"data-action": "cancel-delete",
					type: "button",
					disabled: f.value,
					onClick: S[10] ||= (e) => h.value = !1
				}, "Cancel", 8, Bs), K("button", {
					"data-action": "confirm-delete",
					type: "button",
					disabled: f.value,
					onClick: C
				}, P(f.value ? "Deleting…" : "Permanently delete workspace"), 9, Vs)])
			], 32)) : Y("", !0)
		]));
	}
}), Us = ["aria-busy"], Ws = ["data-ready"], Gs = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Ks = ["disabled", "aria-label"], qs = ["disabled"], Js = /* @__PURE__ */ V({
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
		let r = e, i = n, a = /* @__PURE__ */ L(), o = /* @__PURE__ */ L(), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L("Waveform preview will appear when audio is ready."), d, f, p, m = 0, h = [], g = /* @__PURE__ */ new WeakSet();
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
					h = w(i), l.value = !0, u.value = "Waveform preview ready. The orange line shows playback progress.", await bn(), !n.signal.aborted && t === m && f === r && C();
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
		return B(() => [r.sampleId, r.src], () => {
			te();
		}, { immediate: !0 }), Er(() => {
			m += 1, d?.abort(), b(), S(), v(), x();
		}), t({
			play: D,
			pause: O,
			toggle: ee,
			replay: k,
			stop: S
		}), (t, n) => (W(), G("div", {
			class: "studio-audio",
			"aria-busy": s.value
		}, [
			K("audio", {
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
			K("canvas", {
				ref_key: "canvas",
				ref: o,
				"data-waveform": "",
				"data-ready": l.value,
				role: "img",
				"aria-label": "Audio waveform with playback progress",
				width: "240",
				height: "44"
			}, null, 8, Ws),
			K("p", Gs, P(u.value), 1),
			K("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, P(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Ks),
			K("button", {
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
}, Xs = { class: "flex gap-2" }, Zs = ["disabled"], Qs = ["disabled"], $s = /* @__PURE__ */ V({
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
		return (t, n) => e.total > e.limit || e.offset > 0 ? (W(), G("div", Ys, [K("span", null, P(i()) + "–" + P(a()) + " of " + P(e.total), 1), K("div", Xs, [K("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, Zs), K("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, Qs)])])) : Y("", !0);
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
}, oc = ["data-run-id"], sc = { class: "studio-muted text-xs" }, cc = { key: 0 }, lc = {
	key: 0,
	class: "studio-muted"
}, uc = /* @__PURE__ */ V({
	__name: "CollectionHistory",
	props: {
		refreshKey: {},
		activeRunId: {}
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(0), s;
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
		return B([() => t.refreshKey, o], () => {
			c();
		}, { immediate: !0 }), Er(() => s?.abort()), (t, s) => (W(), G("section", ec, [
			K("div", tc, [s[1] ||= K("h2", null, "Collection history · Fleet-wide", -1), K("button", {
				disabled: i.value,
				onClick: c
			}, "Refresh history", 8, nc)]),
			r.value ? (W(), G("p", rc, P(r.value), 1)) : Y("", !0),
			i.value ? (W(), G("p", ic, "Loading collection history…")) : (W(), G("div", ac, [(W(!0), G(U, null, H(n.value, (t) => (W(), G("article", {
				key: t.id,
				"data-run-id": t.id,
				class: N(["studio-history", { "studio-selected": t.id === e.activeRunId }])
			}, [
				K("strong", null, P(t.id), 1),
				J(" · " + P(t.status) + " · " + P(t.started_at), 1),
				K("p", sc, "New " + P(t.new) + " · Unmapped " + P(t.unmapped) + " · Failed " + P(t.failed), 1),
				K("ul", null, [(W(!0), G(U, null, H(t.devices, (e) => (W(), G("li", { key: e.device_id }, [J(P(e.device_id) + " · " + P(e.status) + " · new " + P(e.new) + " · failed " + P(e.failed), 1), e.errors.length ? (W(), G("span", cc, " · " + P(e.errors.join(", ")), 1)) : Y("", !0)]))), 128))])
			], 10, oc))), 128)), n.value.length ? Y("", !0) : (W(), G("p", lc, "No collection runs yet."))])),
			q($s, {
				total: a.value,
				offset: o.value,
				limit: 25,
				loading: i.value,
				onPage: s[0] ||= (e) => o.value = e
			}, null, 8, [
				"total",
				"offset",
				"loading"
			])
		]));
	}
}), dc = { class: "studio-card" }, fc = { class: "flex flex-wrap items-center justify-between gap-3" }, pc = ["disabled"], mc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, hc = ["data-unmapped-id"], gc = { class: "studio-muted text-xs" }, _c = ["disabled", "onClick"], vc = ["onUpdate:modelValue"], yc = ["value"], bc = ["disabled", "onClick"], xc = {
	key: 1,
	class: "studio-muted"
}, Sc = /* @__PURE__ */ V({
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
		let n = t, r = ms(), i = /* @__PURE__ */ L({}), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s;
		B(r.selectedId, () => {
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
		return Er(() => s?.abort()), (t, s) => (W(), G("section", dc, [
			K("div", fc, [s[1] ||= K("h2", null, "Unmapped recordings · Fleet-wide", -1), K("button", {
				"data-action": "refresh-unmapped",
				disabled: e.refreshing || e.busy,
				onClick: s[0] ||= (e) => n("refresh")
			}, P(e.refreshing ? "Refreshing…" : "Refresh inbox"), 9, pc)]),
			s[4] ||= K("p", { class: "studio-muted" }, "Unknown sources discovered during collection stay here, never assigned to the selected workspace automatically. Assign a recording now, or save an exact device + engine + source-phrase mapping for future collection.", -1),
			o.value ? (W(), G("p", mc, P(o.value), 1)) : Y("", !0),
			(W(!0), G(U, null, H(e.recordings, (t) => (W(), G("article", {
				key: t.id,
				"data-unmapped-id": t.id,
				class: "studio-mapping-row"
			}, [K("div", null, [
				K("strong", null, P(t.phrase), 1),
				K("p", gc, P(t.device_id) + " · " + P(t.engine), 1),
				K("button", {
					"data-action": "assign",
					disabled: e.busy || !R(r).selectedId.value,
					onClick: (e) => n("assign", t)
				}, "Assign to this wakeword", 8, _c)
			]), K("div", null, [K("label", null, [s[3] ||= J("Source phrase → wakeword", -1), z(K("select", {
				"onUpdate:modelValue": (e) => i.value[t.id] = e,
				name: "mapping-word"
			}, [s[2] ||= K("option", { value: "" }, "Choose wakeword", -1), (W(!0), G(U, null, H(R(r).wakewords.value, (e) => (W(), G("option", {
				key: e.id,
				value: e.id
			}, P(e.phrase), 9, yc))), 128))], 8, vc), [[Io, i.value[t.id]]])]), K("button", {
				class: "mt-2",
				"data-action": "save-mapping",
				disabled: !i.value[t.id] || !!a.value,
				onClick: (e) => c(t)
			}, "Save source mapping", 8, bc)])], 8, hc))), 128)),
			!e.recordings.length && !e.refreshing ? (W(), G("p", xc, "No unmapped recordings.")) : Y("", !0)
		]));
	}
}), Cc = (e) => [
	"queued",
	"running",
	"cancelling"
].includes(e.status), wc = Symbol("studio-job-queue");
function Tc() {
	let e = /* @__PURE__ */ L({}), t = /* @__PURE__ */ L([]), n = /* @__PURE__ */ L(0), r = /* @__PURE__ */ L(!1), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L({}), c = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), l = X(() => Object.values(e.value).filter(Cc).sort((e, t) => e.created_at.localeCompare(t.created_at))), u = X(() => l.value.length), d = X(() => t.value.map((t) => e.value[t]).filter((e) => !!e && !Cc(e))), f = X(() => t.value.length < n.value), p = !1, m, h, g, _ = 50, v = 0, y = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
	function x(t) {
		e.value = {
			...e.value,
			[t.id]: t
		}, y.set(t.id, ++v);
	}
	function S(t, n) {
		(y.get(t.id) ?? 0) <= n && (e.value[t.id] = t);
	}
	async function C(e, t, n = Infinity) {
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
	async function w() {
		let i = new AbortController();
		h = i;
		let s = v;
		o.value = !0;
		try {
			let o = await C("active", i);
			if (i.signal.aborted) return;
			let c = new Set(o.items.map((e) => e.id)), u = l.value.filter((e) => !c.has(e.id) && (y.get(e.id) ?? 0) <= s), d = await Promise.all(u.map((e) => $.job(e.id, i.signal).catch((e) => {
				if (e instanceof Error && "status" in e && e.status === 404) return null;
				throw e;
			}))), f = r.value ? await C("history", i, _) : null;
			if (i.signal.aborted) return;
			o.items.forEach((e) => S(e, s)), d.forEach((t, n) => {
				t ? S(t, s) : (y.get(u[n].id) ?? 0) <= s && delete e.value[u[n].id];
			}), f && (f.items.forEach((e) => S(e, s)), t.value = [...new Set(f.items.map((e) => e.id))], n.value = f.total), a.value = "";
		} catch (e) {
			i.signal.aborted || (a.value = e instanceof Error ? e.message : "Unable to load job queue.");
		} finally {
			h === i && (h = void 0, o.value = !1);
		}
	}
	function T() {
		m && clearTimeout(m), p && (m = setTimeout(() => {
			m = void 0, E();
		}, 2e3));
	}
	function E() {
		if (g) return g;
		m && clearTimeout(m), m = void 0;
		let e = w().finally(() => {
			g === e && (g = void 0, T());
		});
		return g = e, e;
	}
	function D() {
		p || (p = !0, E());
	}
	function O() {
		p = !1, m && clearTimeout(m), m = void 0, h?.abort(), b.forEach((e) => e.abort()), b.clear();
	}
	async function ee(t) {
		if (i.value = t ?? "", r.value = !0, g && await g, t && !e.value[t]) try {
			x(await $.job(t));
		} catch (e) {
			a.value = e instanceof Error ? e.message : "Unable to load job.";
		}
		await E();
	}
	async function k() {
		_ += 50, g && await g, await E();
	}
	async function te(t) {
		if (c.value.has(t) || !e.value[t] || !Cc(e.value[t])) return;
		let n = new AbortController();
		b.set(t, n), c.value = /* @__PURE__ */ new Set([...c.value, t]), delete s.value[t], y.set(t, ++v);
		try {
			let e = await $.cancelJob(t, n.signal);
			n.signal.aborted || x(e);
		} catch (e) {
			n.signal.aborted || (s.value[t] = e instanceof Error ? e.message : "Unable to cancel job.");
		} finally {
			b.delete(t), c.value = new Set([...c.value].filter((e) => e !== t));
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
		start: D,
		stop: O,
		refresh: E,
		track: x,
		show: ee,
		loadMore: k,
		cancel: te
	};
}
function Ec() {
	let e = Ln(wc, null);
	if (e) return e;
	let t = Tc();
	return Cr(t.start), Er(t.stop), t;
}
//#endregion
//#region src/studio/pages/ClassifyPage.vue?vue&type=script&setup=true&lang.ts
var Dc = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Oc = { class: "flex flex-wrap items-center gap-3" }, kc = {
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
}, Pc = ["role"], Fc = ["href"], Ic = {
	id: "classify-panel-review",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-review"
}, Lc = { class: "studio-card studio-toolbar mb-4" }, Rc = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, zc = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Bc = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, Vc = ["data-sample-id"], Hc = { class: "flex flex-wrap justify-between gap-3" }, Uc = { class: "studio-muted text-sm" }, Wc = { class: "studio-muted" }, Gc = {
	key: 0,
	class: "studio-muted text-xs"
}, Kc = { class: "flex flex-wrap gap-2" }, qc = ["disabled"], Jc = ["disabled"], Yc = ["disabled"], Xc = ["disabled"], Zc = ["disabled"], Qc = {
	key: 4,
	class: "studio-card"
}, $c = { key: 0 }, el = { key: 1 }, tl = {
	key: 3,
	id: "classify-panel-collect",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-collect"
}, nl = { class: "studio-card mb-4" }, rl = ["href"], il = {
	id: "classify-panel-unmapped",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-unmapped"
}, al = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, ol = {
	key: 4,
	class: "studio-modal-backdrop"
}, sl = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, cl = { class: "flex gap-2" }, ll = ["disabled"], ul = [], dl = /* @__PURE__ */ V({
	__name: "ClassifyPage",
	setup(e) {
		let t = ms(), n = Ec(), { classifyTab: r } = t.routes, i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = X(() => {
			let e = i.value;
			return e?.kind === "scrape" && e.status === "complete" && "status" in e.result ? e.result : null;
		}), c = X(() => !!(s.value && (s.value.status !== "complete" || (s.value.failed ?? 0) > 0 || (s.value.evicted ?? 0) > 0))), l = X(() => "#/classify?" + new URLSearchParams({
			word: t.selectedId.value,
			tab: "collect"
		})), u;
		async function d() {
			if (!t.selectedId.value || a.value || i.value && [
				"queued",
				"running",
				"cancelling"
			].includes(i.value.status)) return;
			let e = t.selectedId.value, r = new AbortController();
			u = r, a.value = !0, o.value = "";
			try {
				let a = await $.collect(e, void 0, r.signal);
				!r.signal.aborted && t.selectedId.value === e && (i.value = a, n.track(a), n.show(a.id));
			} catch (e) {
				r.signal.aborted || (o.value = e instanceof Error ? e.message : "Collection was not started.");
			} finally {
				u === r && (a.value = !1);
			}
		}
		async function f(e) {
			let n = i.value;
			if (!n || e.id !== n.id || e.word_id !== t.selectedId.value || (i.value = e, e.status !== "complete" || n.status === "complete")) return;
			y();
			let r = t.selectedId.value, a = C.value, s = new AbortController();
			u?.abort(), u = s;
			try {
				let e = await $.queue(r, pe(), s.signal);
				if (s.signal.aborted || r !== t.selectedId.value || T.value || C.value !== a) return;
				let n = new Set(m.value.map((e) => e.id));
				m.value.push(...e.items.filter((e) => !n.has(e.id))), S.value = e.total;
			} catch (e) {
				s.signal.aborted || (o.value = e instanceof Error ? e.message : "Collection completed; refresh the queue to see new recordings.");
			}
		}
		B(n.jobs, (e) => {
			let t = i.value && e[i.value.id];
			t && f(t);
		}, { deep: !0 });
		let p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ L([]), h = /* @__PURE__ */ L([]), g = /* @__PURE__ */ L(!1), _ = /* @__PURE__ */ L(""), v;
		async function y() {
			v?.abort();
			let e = new AbortController();
			v = e;
			let n = t.selectedId.value;
			g.value = !0, _.value = "";
			try {
				let r = await $.unmapped({ limit: 50 }, e.signal);
				!e.signal.aborted && v === e && t.selectedId.value === n && (h.value = r.items);
			} catch (r) {
				!e.signal.aborted && t.selectedId.value === n && (_.value = r instanceof Error ? r.message : "Unable to refresh the inbox.");
			} finally {
				v === e && (g.value = !1);
			}
		}
		let b = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), x = /* @__PURE__ */ L(0), S = /* @__PURE__ */ L(0), C = /* @__PURE__ */ L(0), w = /* @__PURE__ */ L(!1), T = /* @__PURE__ */ L(!1), E = /* @__PURE__ */ L(""), D = /* @__PURE__ */ L(""), O = /* @__PURE__ */ L(!1), ee = /* @__PURE__ */ L(!1), k = /* @__PURE__ */ L(null), te = /* @__PURE__ */ L(!1), ne = /* @__PURE__ */ L(""), A = /* @__PURE__ */ L(), re, j, ie = 0, ae, oe = 0, se = 0, ce = X(() => m.value.filter((e) => !b.value.has(e.id))), M = X(() => ce.value[x.value] ?? null), le = X(() => M.value ? $.audioUrl(M.value.word_id, M.value.id) : null), ue = X(() => C.value);
		function de() {
			A.value?.stop(), m.value = [], h.value = [], b.value = new Set(p.get(t.selectedId.value) ?? []), x.value = 0, S.value = 0, C.value = 0, ee.value = !1, te.value = !1, E.value = "", D.value = "";
		}
		function fe() {
			oe += 1, ae && (ae.abort(), ae = void 0, T.value = !1);
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
				let a = i.items.filter((e) => !b.value.has(e.id));
				if (r += i.items.length, a.length || !i.items.length || r >= i.total) return {
					...i,
					items: a
				};
			}
		}
		async function he() {
			if (ce.value.length || w.value) return;
			re?.abort();
			let e = new AbortController();
			re = e;
			let n = ++se, r = t.selectedId.value;
			if (r) {
				w.value = !0;
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					m.value = [...new Map(i.items.map((e) => [e.id, e])).values()], S.value = i.total, x.value = 0;
				} catch {
					!e.signal.aborted && n === se && (E.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === se && (w.value = !1);
				}
			}
		}
		async function ge() {
			j?.abort(), ie++, T.value = !1, fe(), re?.abort();
			let e = new AbortController();
			re = e;
			let n = ++se, r = t.selectedId.value;
			if (de(), v?.abort(), _.value = "", g.value = !1, r) {
				w.value = !0, y();
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					m.value = i.items, S.value = i.total;
				} catch (t) {
					!e.signal.aborted && n === se && (E.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === se && (w.value = !1);
				}
			}
		}
		function _e() {
			let e = M.value;
			e && (m.value = m.value.filter((t) => t.id !== e.id), S.value = Math.max(0, S.value - 1), x.value = Math.min(x.value, Math.max(0, ce.value.length - 1)), A.value?.stop(), ee.value = O.value, he());
		}
		async function ve(e, n, r) {
			let i = () => !n.signal.aborted && r === ie && t.selectedId.value === e.word_id && M.value?.id === e.id;
			if (i()) try {
				let t = await $.sample(e.word_id, e.id, n.signal);
				if (!i()) return;
				if (t.label !== "pending") {
					_e();
					return;
				}
				m.value = m.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function ye(e) {
			let n = M.value;
			if (!n || T.value || te.value) return;
			O.value = !0, T.value = !0, E.value = "";
			let r = new AbortController();
			j?.abort(), j = r;
			let i = ++ie, a = () => !r.signal.aborted && i === ie && t.selectedId.value === n.word_id;
			try {
				let t = await $.label(n.word_id, n.id, e, n.revision, r.signal);
				if (!a() || M.value?.id !== n.id) return;
				ul.push({
					word: n.word_id,
					sample: t
				}), C.value += 1, D.value = `Saved ${e} label.`, _e();
			} catch (e) {
				a() && (e instanceof Error && e.message.includes("conflict") ? (E.value = "This recording changed elsewhere. Review the latest version before saving.", await ve(n, r, i)) : E.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				a() && (T.value = !1);
			}
		}
		function be() {
			let e = M.value;
			!e || T.value || w.value || (O.value = !0, b.value = /* @__PURE__ */ new Set([...b.value, e.id]), p.set(e.word_id, b.value), x.value = Math.min(x.value, Math.max(0, ce.value.length - 1)), A.value?.stop(), ee.value = !1, D.value = "Skipped for this session; this recording remains pending.", he());
		}
		async function xe() {
			if (T.value || !ul.length) return;
			O.value = !0, T.value = !0, E.value = "";
			let e = ul[ul.length - 1], n = new AbortController();
			j?.abort(), j = n;
			let r = ++ie, i = t.selectedId.value, a = () => !n.signal.aborted && r === ie && t.selectedId.value === i;
			try {
				let r = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (!a()) return;
				ul.pop(), D.value = "Last label restored to pending.", t.selectedId.value === e.word && (m.value = [r, ...m.value.filter((e) => e.id !== r.id)], S.value += 1, C.value = Math.max(0, C.value - 1), x.value = 0, ee.value = !1);
			} catch {
				a() && (E.value = "Undo was not saved. Refresh and try again.");
			} finally {
				a() && (T.value = !1);
			}
		}
		async function Se(e) {
			let n = t.selectedId.value;
			if (T.value || !n) return;
			v?.abort();
			let r = se, i = ++oe, a = new AbortController();
			ae?.abort(), ae = a, T.value = !0, E.value = "";
			try {
				let o = await $.assign(e.id, n, a.signal);
				if (a.signal.aborted || ae !== a || i !== oe || r !== se || t.selectedId.value !== n) return;
				h.value = h.value.filter((t) => t.id !== e.id), m.value = [...m.value.filter((e) => e.id !== o.id), o], S.value += 1, D.value = "Recording assigned to this workspace and added to the pending queue.", y();
			} catch {
				!a.signal.aborted && ae === a && i === oe && t.selectedId.value === n && (E.value = "Recording could not be assigned.");
			} finally {
				ae === a && (ae = void 0, T.value = !1);
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
		function we(e) {
			if (r.value !== "review" || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || Ce(e)) return;
			let t = e.key.toLowerCase();
			te.value ? e.key === "Escape" && (e.preventDefault(), te.value = !1) : t === "d" ? (e.preventDefault(), M.value && !T.value && (te.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), O.value = !0, t === "p" ? ye("positive") : t === "n" ? ye("negative") : t === " " ? A.value?.toggle() : t === "r" ? A.value?.replay() : t === "s" ? be() : xe());
		}
		return B(t.selectedId, () => {
			u?.abort(), i.value = null, a.value = !1, o.value = "", ge();
		}, { immediate: !0 }), B(ne, () => {
			ge();
		}), B(() => M.value?.id, () => {
			k.value = null;
		}, { flush: "sync" }), Cr(() => document.addEventListener("keydown", we)), B(r, () => {
			A.value?.stop();
		}), Er(() => {
			document.removeEventListener("keydown", we), v?.abort(), u?.abort(), re?.abort(), j?.abort(), fe(), A.value?.stop();
		}), (e, u) => (W(), G("section", null, [
			K("div", Dc, [u[12] ||= K("div", null, [K("h1", null, "Classify"), K("p", { class: "studio-muted" }, "Collect recordings, resolve source mappings, and review labels.")], -1), K("div", Oc, [K("span", kc, P(S.value) + " pending · " + P(ue.value) + " reviewed · " + P(b.value.size) + " skipped", 1), K("button", {
				"data-action": "collect-now",
				class: "studio-primary",
				disabled: !R(t).selectedId.value || a.value || !!(i.value && [
					"queued",
					"running",
					"cancelling"
				].includes(i.value.status)),
				onClick: d
			}, P(a.value ? "Starting…" : "Collect"), 9, Ac)])]),
			K("div", jc, [(W(), G(U, null, H([
				"review",
				"collect",
				"unmapped"
			], (e) => K("button", {
				id: `classify-tab-${e}`,
				key: e,
				role: "tab",
				"aria-selected": R(r) === e,
				"aria-controls": `classify-panel-${e}`,
				class: N({ active: R(r) === e }),
				onClick: (n) => R(t).routes.selectClassifyTab(e)
			}, P(e === "review" ? "Review" : e === "collect" ? "Collect" : "Unmapped"), 11, Mc)), 64))]),
			o.value ? (W(), G("p", Nc, P(o.value), 1)) : Y("", !0),
			s.value ? (W(), G("p", {
				key: 1,
				"data-collection-outcome": "",
				class: N(["studio-note", { "studio-collection-warning": c.value }]),
				role: c.value ? "alert" : "status"
			}, [
				K("strong", null, P(c.value ? "Collection needs attention" : "Collection finished"), 1),
				J(" · " + P(s.value.status) + " · " + P(s.value.new ?? 0) + " imported · " + P(s.value.failed ?? 0) + " failed · " + P(s.value.unmapped ?? 0) + " unmapped · " + P(s.value.evicted ?? 0) + " evicted. ", 1),
				K("a", {
					href: l.value,
					onClick: u[0] ||= Uo((e) => R(t).routes.selectClassifyTab("collect"), ["prevent"])
				}, "View collection run →", 8, Fc)
			], 10, Pc)) : Y("", !0),
			i.value ? (W(), G("button", {
				key: 2,
				type: "button",
				class: "mt-3",
				onClick: u[1] ||= (e) => R(n).show(i.value.id)
			}, "View collection " + P(i.value.id) + " in queue", 1)) : Y("", !0),
			z(K("div", Ic, [
				K("div", Lc, [K("label", null, [u[14] ||= J("Recording type", -1), z(K("select", {
					name: "kind",
					"onUpdate:modelValue": u[2] ||= (e) => ne.value = e
				}, [...u[13] ||= [
					K("option", { value: "" }, "All pending", -1),
					K("option", { value: "true" }, "Near misses", -1),
					K("option", { value: "false" }, "Activations", -1)
				]], 512), [[Io, ne.value]])])]),
				D.value ? (W(), G("p", Rc, P(D.value), 1)) : Y("", !0),
				E.value ? (W(), G("p", zc, P(E.value), 1)) : Y("", !0),
				w.value ? (W(), G("div", Bc, "Loading review queue…")) : M.value ? (W(), G("div", {
					key: 3,
					"data-classify-current": "",
					"data-sample-id": M.value.id,
					class: "studio-card grid gap-4"
				}, [
					K("div", Hc, [K("div", null, [K("h2", null, "Recording " + P(M.value.recording?.clip_id ?? M.value.id), 1), K("p", Uc, P(M.value.recording?.device_id ?? M.value.source) + " · " + P(M.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + P(M.value.recording?.timestamp ?? M.value.created_at), 1)]), K("span", Wc, "Revision " + P(M.value.revision), 1)]),
					q(Js, {
						ref_key: "player",
						ref: A,
						"sample-id": M.value.id,
						src: le.value,
						"autoplay-requested": ee.value,
						onReady: u[3] ||= (e) => {
							ee.value = !1, k.value = M.value.id;
						},
						onPlaybackError: u[4] ||= (e) => E.value = e
					}, null, 8, [
						"sample-id",
						"src",
						"autoplay-requested"
					]),
					k.value === M.value.id ? (W(), G("p", Gc, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : Y("", !0),
					K("div", Kc, [
						K("button", {
							type: "button",
							class: "studio-primary",
							disabled: T.value,
							onClick: u[5] ||= (e) => ye("positive")
						}, "Positive (P)", 8, qc),
						K("button", {
							type: "button",
							disabled: T.value,
							onClick: u[6] ||= (e) => ye("negative")
						}, "Negative (N)", 8, Jc),
						K("button", {
							type: "button",
							disabled: T.value,
							onClick: be
						}, "Skip (S)", 8, Yc),
						K("button", {
							type: "button",
							disabled: T.value,
							"data-action": "discard",
							onClick: u[7] ||= (e) => te.value = !0
						}, "Discard (D)", 8, Xc),
						K("button", {
							type: "button",
							disabled: T.value || !R(ul).length,
							onClick: xe
						}, "Undo (Z)", 8, Zc)
					]),
					u[15] ||= K("p", {
						"data-shortcuts": "",
						class: "studio-muted text-xs"
					}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
					u[16] ||= K("input", {
						name: "search",
						type: "search",
						"aria-label": "Queue search",
						placeholder: "Shortcuts pause while editing"
					}, null, -1)
				], 8, Vc)) : (W(), G("div", Qc, [S.value === 0 ? (W(), G("span", $c, "No pending recordings for this workspace.")) : (W(), G("span", el, "Pending recordings are skipped for this session or the local window needs reloading.")), S.value > 0 ? (W(), G("button", {
					key: 2,
					type: "button",
					onClick: he
				}, "Retry pending window")) : Y("", !0)]))
			], 512), [[Za, R(r) === "review"]]),
			R(r) === "collect" ? (W(), G("div", tl, [K("div", nl, [
				u[17] ||= K("h2", null, "Collect recordings", -1),
				u[18] ||= K("p", { class: "studio-muted" }, "Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.", -1),
				K("a", {
					href: R(t).routes.href("automate"),
					onClick: u[8] ||= Uo((e) => R(t).routes.navigate("automate"), ["prevent"])
				}, "Collection settings →", 8, rl)
			]), q(uc, {
				"refresh-key": i.value?.status,
				"active-run-id": s.value?.run_id
			}, null, 8, ["refresh-key", "active-run-id"])])) : Y("", !0),
			z(K("div", il, [_.value ? (W(), G("p", al, P(_.value), 1)) : Y("", !0), q(Sc, {
				recordings: h.value,
				busy: T.value,
				refreshing: g.value,
				onRefresh: y,
				onAssign: Se,
				onChanged: u[9] ||= (e) => D.value = "Source mapping saved for future collections."
			}, null, 8, [
				"recordings",
				"busy",
				"refreshing"
			])], 512), [[Za, R(r) === "unmapped"]]),
			te.value ? (W(), G("div", ol, [K("section", sl, [
				u[19] ||= K("h2", null, "Discard this recording?", -1),
				u[20] ||= K("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				K("div", cl, [K("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: T.value,
					onClick: u[10] ||= (e) => {
						te.value = !1, ye("discarded");
					}
				}, "Discard recording", 8, ll), K("button", {
					type: "button",
					onClick: u[11] ||= (e) => te.value = !1
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function fl(e, t = {}) {
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
function pl(e) {
	return fl(e);
}
//#endregion
//#region src/trainerStore.ts
var ml = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), hl = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), gl = /* @__PURE__ */ Ft({
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
	samples: hl(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: ml(),
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
function _l(e, t) {
	t ? gl.busy.add(e) : gl.busy.delete(e);
}
function vl(e, t = "success") {
	gl.toast = {
		message: String(e || ""),
		tone: t,
		serial: gl.toast.serial + 1
	};
}
async function yl(e = !1) {
	e || _l("samples", !0);
	try {
		let e = await pl("/api/samples");
		gl.samples = {
			...hl(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((gl.samples[e]?.length || 0) / 50) - 1);
			gl.samplePage[e] = Math.min(gl.samplePage[e], t);
		}
		return e;
	} finally {
		e || _l("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var bl = { class: "legacy-scope" }, xl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Sl = { class: "range-grid" }, Cl = ["max"], wl = ["min"], Tl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, El = { class: "modal-head" }, Dl = {
	key: 0,
	class: "empty-state"
}, Ol = { class: "range-grid" }, kl = ["max"], Al = ["min", "max"], jl = { class: "row space" }, Ml = { class: "pill" }, Nl = {
	key: 0,
	class: "pill success"
}, Pl = { class: "row modal-actions" }, Fl = ["disabled"], Il = /* @__PURE__ */ V({
	__name: "AudioTrimModal",
	props: { studioTarget: {} },
	emits: ["save", "close"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(1);
		B(() => n.studioTarget, (e) => {
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
		let c = /* @__PURE__ */ L(null), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = /* @__PURE__ */ L(0), p = /* @__PURE__ */ L([]), m = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(!1);
		B(() => gl.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(gl.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await fl(`/api/samples/${encodeURIComponent(gl.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await bn(), v();
				} catch (e) {
					vl(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), B([d, f], () => v());
		function g() {
			gl.trimItem = null, l.value = null, p.value = [];
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
			let e = gl.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", gl.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await fl("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await yl(!0), vl(n.message || "Trimmed sample saved.");
				} catch (e) {
					vl(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			gl.trimItem && v();
		}
		return window.addEventListener("resize", S), Er(() => window.removeEventListener("resize", S)), (t, n) => (W(), ia(tr, { to: "body" }, [K("div", bl, [e.studioTarget ? (W(), G("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Uo(o, ["self"])
		}, [K("section", xl, [
			K("header", { class: "modal-head" }, [n[4] ||= K("div", null, [K("span", { class: "eyebrow" }, "Studio audio editor"), K("h2", null, "Trim sample")], -1), K("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= K("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			K("div", Sl, [K("label", null, [n[5] ||= K("span", null, "Start seconds", -1), z(K("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Cl), [[
				No,
				i.value,
				void 0,
				{ number: !0 }
			]])]), K("label", null, [n[6] ||= K("span", null, "End seconds", -1), z(K("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, wl), [[
				No,
				a.value,
				void 0,
				{ number: !0 }
			]])])]),
			K("div", { class: "row modal-actions" }, [K("button", {
				type: "button",
				class: "button primary",
				onClick: s
			}, "Save trim"), K("button", {
				type: "button",
				onClick: o
			}, "Cancel")])
		])])) : R(gl).trimItem ? (W(), G("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Uo(g, ["self"])
		}, [K("section", Tl, [
			K("header", El, [K("div", null, [n[8] ||= K("span", { class: "eyebrow" }, "Audio editor", -1), K("h2", null, "Trim " + P(R(gl).trimItem.saved_as), 1)]), K("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= K("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (W(), G("div", Dl, "Loading waveform…")) : (W(), G(U, { key: 1 }, [
				K("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				K("div", Ol, [K("label", null, [K("span", null, "Start · " + P(d.value.toFixed(2)) + "s", 1), z(K("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, kl), [[
					No,
					d.value,
					void 0,
					{ number: !0 }
				]])]), K("label", null, [K("span", null, "End · " + P(f.value.toFixed(2)) + "s", 1), z(K("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Al), [[
					No,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				K("div", jl, [K("span", Ml, "Selection " + P(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (W(), G("span", Nl, P(p.value.length) + " speech segment" + P(p.value.length === 1 ? "" : "s"), 1)) : Y("", !0)]),
				K("div", Pl, [
					K("button", {
						type: "button",
						onClick: y
					}, "Play selection"),
					p.value.length ? (W(), G("button", {
						key: 0,
						type: "button",
						onClick: _
					}, "Select first VAD")) : Y("", !0),
					K("button", {
						type: "button",
						class: "button primary",
						disabled: h.value,
						onClick: x
					}, P(h.value ? "Saving…" : "Save trim"), 9, Fl)
				])
			], 64))
		])])) : Y("", !0)])]));
	}
}), Ll = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Rl = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, zl = { class: "studio-card mb-4" }, Bl = { class: "studio-toolbar" }, Vl = {
	"data-more-filters": "",
	class: "mt-3"
}, Hl = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, Ul = ["aria-busy"], Wl = { key: 0 }, Gl = {
	key: 1,
	class: "w-full text-sm"
}, Kl = ["data-row-id"], ql = {
	key: 0,
	class: "block studio-muted"
}, Jl = {
	key: 0,
	class: "block studio-muted"
}, Yl = { class: "flex flex-wrap gap-1" }, Xl = ["onClick"], Zl = ["value", "onChange"], Ql = {
	key: 0,
	value: "pending",
	disabled: ""
}, $l = ["onClick"], eu = ["onClick"], tu = { key: 0 }, nu = {
	key: 2,
	class: "studio-modal-backdrop"
}, ru = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Play sample"
}, iu = {
	key: 3,
	class: "studio-modal-backdrop"
}, au = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, ou = /* @__PURE__ */ V({
	__name: "SamplesPage",
	setup(e) {
		let t = ms(), n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L(0), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(25), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: "",
			search: ""
		}), u = /* @__PURE__ */ L(null), d = /* @__PURE__ */ L(null), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L("positive"), h, g, _ = 0, v = X(() => ({
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
				return t.signal.aborted || (e instanceof as && e.status === 409 ? (await b(), s.value = "This sample changed elsewhere. The current page was reloaded.") : s.value = "Sample changes were not saved. Try again."), null;
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
		return B(t.selectedId, () => {
			i.value = 0, b();
		}, { immediate: !0 }), Er(() => {
			h?.abort(), g?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[36] ||= K("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [K("div", null, [K("h1", null, "Samples"), K("p", { class: "studio-muted" }, "Searchable library with retained provenance and non-destructive trims.")])], -1),
			c.value ? (W(), G("p", Ll, P(c.value), 1)) : Y("", !0),
			s.value ? (W(), G("p", Rl, P(s.value), 1)) : Y("", !0),
			K("div", zl, [K("div", Bl, [K("label", null, [t[14] ||= J("Phrase", -1), z(K("input", {
				name: "search",
				"onUpdate:modelValue": t[0] ||= (e) => l.value.search = e,
				type: "search",
				onInput: D
			}, null, 544), [[No, l.value.search]])]), K("label", null, [t[16] ||= J("Label", -1), z(K("select", {
				name: "label",
				"onUpdate:modelValue": t[1] ||= (e) => l.value.label = e,
				onChange: D
			}, [...t[15] ||= [fa("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Io, l.value.label]])])]), K("details", Vl, [t[23] ||= K("summary", null, "More filters", -1), K("div", Hl, [
				K("label", null, [t[18] ||= J("Source", -1), z(K("select", {
					name: "source",
					"onUpdate:modelValue": t[2] ||= (e) => l.value.source = e,
					onChange: D
				}, [...t[17] ||= [
					K("option", { value: "" }, "All sources", -1),
					K("option", { value: "diagnostic" }, "Diagnostic", -1),
					K("option", { value: "import" }, "Import", -1)
				]], 544), [[Io, l.value.source]])]),
				K("label", null, [t[20] ||= J("Kind", -1), z(K("select", {
					name: "kind",
					"onUpdate:modelValue": t[3] ||= (e) => l.value.kind = e,
					onChange: D
				}, [...t[19] ||= [
					K("option", { value: "" }, "All kinds", -1),
					K("option", { value: "true" }, "Close miss", -1),
					K("option", { value: "false" }, "Activation", -1)
				]], 544), [[Io, l.value.kind]])]),
				K("label", null, [t[21] ||= J("After", -1), z(K("input", {
					name: "after",
					"onUpdate:modelValue": t[4] ||= (e) => l.value.after = e,
					type: "date",
					onInput: D
				}, null, 544), [[No, l.value.after]])]),
				K("label", null, [t[22] ||= J("Before", -1), z(K("input", {
					name: "before",
					"onUpdate:modelValue": t[5] ||= (e) => l.value.before = e,
					type: "date",
					onInput: D
				}, null, 544), [[No, l.value.before]])])
			])])]),
			K("form", {
				"data-form": "import",
				class: "studio-card mb-4 flex flex-wrap gap-3 items-end",
				onSubmit: Uo(E, ["prevent"])
			}, [
				K("label", null, [t[24] ||= J("Audio", -1), K("input", {
					name: "import-file",
					type: "file",
					accept: "audio/*",
					required: "",
					onChange: t[6] ||= (e) => p.value = e.target.files?.[0] ?? null
				}, null, 32)]),
				K("label", null, [t[26] ||= J("Label", -1), z(K("select", {
					name: "import-label",
					"onUpdate:modelValue": t[7] ||= (e) => m.value = e
				}, [...t[25] ||= [K("option", { value: "positive" }, "Positive", -1), K("option", { value: "negative" }, "Negative", -1)]], 512), [[Io, m.value]])]),
				t[27] ||= K("button", {
					type: "submit",
					class: "studio-primary"
				}, "Import audio", -1)
			], 32),
			K("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": o.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [o.value ? (W(), G("p", Wl, "Loading samples…")) : (W(), G("table", Gl, [t[33] ||= K("thead", null, [K("tr", null, [
				K("th", null, "Sample"),
				K("th", null, "Label"),
				K("th", null, "Provenance"),
				K("th", null, "Revision"),
				K("th", null, "Actions")
			])], -1), K("tbody", null, [(W(!0), G(U, null, H(n.value, (e) => (W(), G("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				K("td", null, [J(P(e.recording?.clip_id ?? e.id), 1), e.recording ? (W(), G("small", ql, P(e.recording.phrase) + " · " + P(e.recording.engine) + " · " + P(O(e)), 1)) : Y("", !0)]),
				K("td", null, P(e.label), 1),
				K("td", null, [J(P(e.source), 1), e.recording ? (W(), G("small", Jl, P(e.recording.device_id), 1)) : Y("", !0)]),
				K("td", null, "rev " + P(e.revision), 1),
				K("td", null, [K("div", Yl, [
					K("button", {
						type: "button",
						"data-action": "play",
						onClick: (t) => f.value = e
					}, "Play", 8, Xl),
					K("label", null, [t[31] ||= K("span", { class: "sr-only" }, "Relabel", -1), K("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => C(e, t)
					}, [
						e.label === "pending" ? (W(), G("option", Ql, "Set label…")) : Y("", !0),
						t[28] ||= K("option", { value: "positive" }, "Positive", -1),
						t[29] ||= K("option", { value: "negative" }, "Negative", -1),
						t[30] ||= K("option", { value: "discarded" }, "Discarded", -1)
					], 40, Zl)]),
					K("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => u.value = e
					}, "Trim", 8, $l),
					K("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => d.value = e
					}, "Delete", 8, eu)
				])])
			], 8, Kl))), 128)), n.value.length ? Y("", !0) : (W(), G("tr", tu, [...t[32] ||= [K("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), q($s, {
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
			])], 8, Ul),
			f.value ? (W(), G("div", nu, [K("section", ru, [q(Js, {
				"sample-id": f.value.id,
				src: R($).audioUrl(f.value.word_id, f.value.id),
				"autoplay-requested": !0,
				onPlaybackError: t[9] ||= (e) => s.value = e
			}, null, 8, ["sample-id", "src"]), K("button", {
				type: "button",
				onClick: t[10] ||= (e) => f.value = null
			}, "Close player")])])) : Y("", !0),
			q(Il, {
				"studio-target": u.value ? {
					wordId: u.value.word_id,
					sampleId: u.value.id,
					revision: u.value.revision,
					src: R($).audioUrl(u.value.word_id, u.value.id)
				} : null,
				onSave: t[11] ||= (e) => w(e),
				onClose: t[12] ||= (e) => u.value = null
			}, null, 8, ["studio-target"]),
			d.value ? (W(), G("div", iu, [K("section", au, [
				t[34] ||= K("h2", null, "Remove sample?", -1),
				t[35] ||= K("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				K("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: T
				}, "Remove"),
				K("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[13] ||= (e) => d.value = null
				}, "Cancel")
			])])) : Y("", !0)
		]));
	}
}), su = /* @__PURE__ */ L([]), cu = /* @__PURE__ */ L(!1), lu = /* @__PURE__ */ L(""), uu = !1, du;
function fu(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function pu() {
	async function e(e = !1) {
		if (uu && !e) return;
		du?.abort();
		let t = new AbortController();
		du = t, cu.value = !0, lu.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && du === t && (su.value = e, uu = !0);
		} catch (e) {
			!t.signal.aborted && du === t && (lu.value = fu(e));
		} finally {
			du === t && (cu.value = !1);
		}
	}
	function t(e) {
		su.value = su.value.findIndex((t) => t.id === e.id) < 0 ? [...su.value, e] : su.value.map((t) => t.id === e.id ? e : t), uu = !0;
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
	async function a(n, r) {
		t(await $.updateDevice(n, r)), await e(!0);
	}
	async function o(t) {
		await $.deleteDevice(t), await e(!0);
	}
	function s() {
		du?.abort();
	}
	return {
		devices: /* @__PURE__ */ Lt(su),
		loading: /* @__PURE__ */ Lt(cu),
		error: /* @__PURE__ */ Lt(lu),
		load: e,
		add: n,
		refresh: r,
		credentials: i,
		update: a,
		remove: o,
		abort: s
	};
}
//#endregion
//#region src/studio/components/DeviceRegistry.vue?vue&type=script&setup=true&lang.ts
var mu = {
	class: "studio-card",
	"data-device-registry": ""
}, hu = { class: "flex flex-wrap items-start justify-between gap-3" }, gu = ["disabled"], _u = { class: "mt-3" }, vu = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, yu = {
	key: 0,
	class: "studio-note",
	role: "status"
}, bu = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, xu = ["open"], Su = ["disabled"], Cu = {
	key: 2,
	class: "studio-muted mt-3"
}, wu = {
	key: 3,
	class: "mt-4 grid gap-2"
}, Tu = ["data-device-id"], Eu = { class: "studio-muted text-xs" }, Du = { class: "flex flex-wrap gap-2 items-center" }, Ou = ["disabled", "onClick"], ku = ["onSubmit"], Au = ["name"], ju = ["disabled"], Mu = { class: "flex gap-2" }, Nu = ["disabled", "onClick"], Pu = ["disabled", "onClick"], Fu = ["onSubmit"], Iu = {
	key: 0,
	class: "studio-muted text-xs"
}, Lu = { class: "flex gap-2" }, Ru = ["disabled"], zu = ["disabled"], Bu = {
	key: 0,
	class: "studio-muted"
}, Vu = { key: 0 }, Hu = { key: 1 }, Uu = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, Wu = { class: "flex gap-2" }, Gu = ["disabled"], Ku = ["disabled"], qu = /* @__PURE__ */ V({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = pu(), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L("standalone"), s = /* @__PURE__ */ L(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(), g = null;
		function _(e) {
			f.value = e.id, p.value = e.url;
		}
		async function v(e) {
			l.value = `edit:${e.id}`, d.value = "";
			try {
				await i.update(e.id, p.value), f.value = "", u.value = "Connection address saved.", T();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Address was not saved.";
			} finally {
				l.value = "";
			}
		}
		async function y(e, t) {
			g = t.currentTarget, m.value = e, await bn(), h.value?.querySelector("button")?.focus();
		}
		function b() {
			m.value = null, g?.focus();
		}
		function x(e) {
			if (e.key !== "Tab") return;
			let t = h.value?.querySelectorAll("button:not(:disabled)"), n = t?.[0], r = t?.[t.length - 1];
			e.shiftKey && document.activeElement === n ? (e.preventDefault(), r?.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
		async function S() {
			if (m.value && !l.value) {
				l.value = `delete:${m.value.id}`, d.value = "";
				try {
					await i.remove(m.value.id), b(), u.value = "Kiosk removed from Studio. Saved recordings and models are kept.", T();
				} catch (e) {
					d.value = e instanceof Error ? e.message : "Kiosk was not removed.";
				} finally {
					l.value = "";
				}
			}
		}
		function C(e, t) {
			t instanceof HTMLInputElement ? c.set(e, t) : c.delete(e);
		}
		function w(e) {
			return e.leader_id ? `Parent ${e.leader_id}` : "Direct registry target";
		}
		function T() {
			r("changed", [...i.devices.value]);
		}
		async function E() {
			let e = s.value?.value ?? "";
			s.value && (s.value.value = ""), l.value = "add", d.value = "", u.value = "";
			try {
				await i.add(a.value, e, o.value), a.value = "", u.value = o.value === "leader" ? "Leader added; follower membership was refreshed." : "Standalone kiosk added.", T();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Device could not be added.";
			} finally {
				l.value = "";
			}
		}
		async function D(e) {
			l.value = `refresh:${e.id}`, d.value = "";
			try {
				await i.refresh(e.id), u.value = "Fleet membership refreshed.", T();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Fleet refresh failed.";
			} finally {
				l.value = "";
			}
		}
		async function O(e) {
			let t = c.get(e.id), n = t?.value ?? "";
			t && (t.value = ""), l.value = `credentials:${e.id}`, d.value = "";
			try {
				await i.credentials(e.id, n), u.value = "Kiosk authenticated; token saved server-side.", T();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Credentials were not saved.";
			} finally {
				l.value = "";
			}
		}
		return Cr(async () => {
			await i.load(), T();
		}), Er(() => i.abort()), (e, t) => (W(), G("section", mu, [
			K("div", hu, [t[7] ||= K("div", null, [K("h2", null, "Fleet setup"), K("p", { class: "studio-muted" }, "Register a fleet leader or standalone kiosks.")], -1), K("button", {
				type: "button",
				"data-action": "refresh-registry",
				disabled: R(i).loading.value,
				onClick: t[0] ||= (e) => R(i).load(!0)
			}, "Refresh registry", 8, gu)]),
			K("details", _u, [
				t[8] ||= K("summary", null, "Fleet safety details", -1),
				t[9] ||= K("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (W(), G("p", vu, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : Y("", !0)
			]),
			u.value ? (W(), G("p", yu, P(u.value), 1)) : Y("", !0),
			d.value || R(i).error.value ? (W(), G("p", bu, P(d.value || R(i).error.value), 1)) : Y("", !0),
			K("details", {
				"data-device-registration": "",
				class: "mt-3",
				open: !R(i).devices.value.length
			}, [
				t[14] ||= K("summary", null, "Add device", -1),
				K("form", {
					"data-device-add": "",
					class: "studio-registration-row",
					onSubmit: Uo(E, ["prevent"])
				}, [
					K("label", null, [t[10] ||= J("Address", -1), z(K("input", {
						"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
						required: "",
						name: "url",
						autocomplete: "url",
						placeholder: "http://kiosk.local:2324"
					}, null, 512), [[No, a.value]])]),
					K("label", null, [t[12] ||= J("Role", -1), z(K("select", {
						"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
						name: "role"
					}, [...t[11] ||= [K("option", { value: "standalone" }, "Standalone", -1), K("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Io, o.value]])]),
					K("label", null, [t[13] ||= J("Admin password", -1), K("input", {
						ref_key: "passwordInput",
						ref: s,
						required: "",
						name: "password",
						type: "password",
						autocomplete: "off"
					}, null, 512)]),
					K("button", {
						type: "submit",
						class: "studio-primary",
						disabled: l.value === "add"
					}, "Add device", 8, Su)
				], 32),
				t[15] ||= K("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
			], 8, xu),
			R(i).loading.value ? (W(), G("p", Cu, "Loading registered devices…")) : (W(), G("div", wu, [(W(!0), G(U, null, H(R(i).devices.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [
				K("div", null, [
					K("strong", null, P(e.id), 1),
					t[16] ||= J(),
					K("span", { class: N(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, P(e.role === "follower" ? "Follower" : e.role), 3),
					K("p", Eu, P(w(e)) + " · " + P(e.url) + P(e.active ? "" : " · Inactive member"), 1)
				]),
				K("div", Du, [
					K("span", { class: N(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, P(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
					K("span", { class: N(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, P(e.model_eligible ? "Profile covered" : "Not covered"), 3),
					e.role === "leader" ? (W(), G("button", {
						key: 0,
						type: "button",
						disabled: l.value === `refresh:${e.id}`,
						onClick: (t) => D(e)
					}, "Refresh followers", 8, Ou)) : Y("", !0),
					e.role === "follower" && e.credentials_status !== "ready" ? (W(), G("form", {
						key: 1,
						class: "flex gap-2",
						onSubmit: Uo((t) => O(e), ["prevent"])
					}, [K("input", {
						ref_for: !0,
						ref: (t) => C(e.id, t),
						name: `credentials-${e.id}`,
						required: "",
						type: "password",
						autocomplete: "off",
						"aria-label": "Follower admin password"
					}, null, 8, Au), K("button", {
						type: "submit",
						disabled: l.value === `credentials:${e.id}`
					}, "Authenticate", 8, ju)], 40, ku)) : Y("", !0)
				]),
				K("div", Mu, [K("button", {
					type: "button",
					"data-action": "edit-device",
					disabled: !!l.value,
					onClick: (t) => _(e)
				}, "Edit", 8, Nu), K("button", {
					type: "button",
					"data-action": "delete-device",
					disabled: !!l.value,
					onClick: (t) => y(e, t)
				}, "Delete", 8, Pu)]),
				f.value === e.id ? (W(), G("form", {
					key: 0,
					"data-device-edit": "",
					class: "studio-card grid gap-3",
					style: {
						"grid-column": "1 / -1",
						width: "100%"
					},
					onSubmit: Uo((t) => v(e), ["prevent"])
				}, [
					K("label", null, [t[17] ||= J("Studio connection address", -1), z(K("input", {
						"onUpdate:modelValue": t[3] ||= (e) => p.value = e,
						name: "device-url",
						required: "",
						type: "url"
					}, null, 512), [[No, p.value]])]),
					e.role === "follower" ? (W(), G("p", Iu, "Local override: this address is retained when followers refresh. Fleet membership stays leader-managed.")) : Y("", !0),
					K("div", Lu, [K("button", {
						class: "studio-primary",
						disabled: !!l.value,
						type: "submit"
					}, "Save address", 8, Ru), K("button", {
						type: "button",
						"data-action": "cancel-device-edit",
						disabled: !!l.value,
						onClick: t[4] ||= (e) => f.value = ""
					}, "Cancel", 8, zu)])
				], 40, Fu)) : Y("", !0)
			], 8, Tu))), 128)), R(i).devices.value.length ? Y("", !0) : (W(), G("p", Bu, "No kiosks registered yet."))])),
			m.value ? (W(), G("div", {
				key: 4,
				class: "studio-modal-backdrop",
				onClick: t[5] ||= Uo((e) => !l.value && b(), ["self"]),
				onKeydown: t[6] ||= Go((e) => !l.value && b(), ["esc"])
			}, [K("section", {
				ref_key: "confirmation",
				ref: h,
				role: "alertdialog",
				"aria-modal": "true",
				"aria-label": "Remove kiosk from Studio?",
				class: "studio-card grid gap-3",
				onKeydown: x
			}, [
				K("h2", null, "Remove " + P(m.value.id) + " from Studio?", 1),
				m.value.role === "leader" ? (W(), G("p", Vu, "This also removes its discovered followers from the Studio registry.")) : m.value.role === "follower" ? (W(), G("p", Hu, "This follower can be rediscovered on the next fleet refresh.")) : Y("", !0),
				t[18] ||= K("p", null, "Saved recordings and models are kept. This does not change the kiosk itself.", -1),
				d.value ? (W(), G("p", Uu, P(d.value), 1)) : Y("", !0),
				K("div", Wu, [K("button", {
					"data-action": "cancel-device-delete",
					type: "button",
					disabled: !!l.value,
					onClick: b
				}, "Keep kiosk", 8, Gu), K("button", {
					"data-action": "confirm-device-delete",
					type: "button",
					disabled: !!l.value,
					onClick: S
				}, "Remove from Studio", 8, Ku)])
			], 544)], 32)) : Y("", !0)
		]));
	}
}), Ju = /* @__PURE__ */ V({
	__name: "KiosksPage",
	setup(e) {
		return (e, t) => (W(), G("section", null, [t[0] ||= K("div", { class: "mb-4" }, [K("h1", null, "Kiosks"), K("p", { class: "studio-muted" }, "Connect and manage your kiosk fleet.")], -1), q(qu, { surface: "kiosks" })]));
	}
}), Yu = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Xu = ["name"], Zu = ["name"], Qu = /* @__PURE__ */ V({
	__name: "AutomationScheduleFields",
	props: /*@__PURE__*/ Rr({ prefix: {} }, {
		modelValue: { required: !0 },
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = ii(e, "modelValue");
		return (n, r) => (W(), G("div", Yu, [K("label", null, [r[2] ||= J("Schedule (five-field cron)", -1), z(K("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value.cron = e,
			name: `${e.prefix}-cron`,
			required: "",
			placeholder: "*/30 * * * *",
			maxlength: "256"
		}, null, 8, Xu), [[No, t.value.cron]])]), K("label", null, [r[3] ||= J("Time zone", -1), z(K("input", {
			"onUpdate:modelValue": r[1] ||= (e) => t.value.timezone = e,
			name: `${e.prefix}-timezone`,
			required: "",
			placeholder: "UTC",
			maxlength: "100"
		}, null, 8, Zu), [[No, t.value.timezone]])])]));
	}
}), $u = {
	key: 0,
	class: "studio-card"
}, ed = {
	key: 1,
	role: "status"
}, td = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, nd = {
	key: 3,
	class: "studio-note",
	role: "status"
}, rd = { class: "studio-card" }, id = { class: "flex flex-wrap items-center justify-between gap-3" }, ad = { class: "studio-checkbox-label" }, od = { class: "studio-muted" }, sd = { class: "studio-muted text-xs mt-3" }, cd = { class: "studio-card" }, ld = { class: "flex flex-wrap items-center justify-between gap-3" }, ud = { class: "studio-checkbox-label" }, dd = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, fd = { class: "mt-3" }, pd = { class: "studio-checkbox-label my-3" }, md = { class: "studio-checkbox-label my-3" }, hd = { class: "studio-muted text-xs mt-3" }, gd = { class: "grid gap-4 lg:grid-cols-2" }, _d = { class: "studio-card" }, vd = { class: "flex flex-wrap items-center justify-between gap-3" }, yd = { class: "studio-checkbox-label" }, bd = { class: "studio-checkbox-label my-3" }, xd = { class: "studio-muted text-xs" }, Sd = { class: "studio-card" }, Cd = { class: "flex flex-wrap items-center justify-between gap-3" }, wd = { class: "studio-status studio-status-muted" }, Td = { class: "studio-checkbox-label my-3" }, Ed = { class: "studio-checkbox-label my-3" }, Dd = { class: "studio-muted text-xs" }, Od = ["disabled"], kd = /* @__PURE__ */ V({
	__name: "AutomatePage",
	setup(e) {
		let t = ms(), n = X(() => t.selectedId.value), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l, u, d = 0, f = X(() => r.value?.deployment.enabled ? r.value.deployment_policy.after_training ? "Scheduled + after training" : "Scheduled" : r.value?.deployment_policy.after_training ? "After training" : "Manual only");
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
		return B(n, () => {
			m();
		}, { immediate: !0 }), Er(() => {
			d++, l?.abort(), u?.abort();
		}), (e, i) => (W(), G("section", null, [
			i[40] ||= K("div", { class: "mb-4" }, [K("h1", null, "Automate"), K("p", { class: "studio-muted" }, "Collection, classification, training, and deployment for the selected workspace.")], -1),
			n.value ? Y("", !0) : (W(), G("p", $u, "Choose a wakeword to configure automation.")),
			a.value ? (W(), G("p", ed, "Loading automation…")) : Y("", !0),
			s.value ? (W(), G("p", td, [J(P(s.value) + " ", 1), r.value ? Y("", !0) : (W(), G("button", {
				key: 0,
				onClick: m
			}, "Retry"))])) : Y("", !0),
			c.value ? (W(), G("p", nd, P(c.value), 1)) : Y("", !0),
			r.value ? (W(), G("form", {
				key: 4,
				class: "grid gap-4",
				onSubmit: Uo(h, ["prevent"])
			}, [
				K("section", rd, [
					K("div", id, [i[15] ||= K("h2", null, "Automatic collection", -1), K("label", ad, [z(K("input", {
						"onUpdate:modelValue": i[0] ||= (e) => r.value.collection.enabled = e,
						name: "collection-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.collection.enabled]]), i[14] ||= J("Enabled", -1)])]),
					K("p", od, [
						i[16] ||= J("Collect recordings mapped to ", -1),
						K("strong", null, P(R(t).selected.value?.phrase ?? "this workspace"), 1),
						i[17] ||= J(" from registered kiosks. Existing recordings are preserved when disabled.", -1)
					]),
					q(Qu, {
						modelValue: r.value.collection,
						"onUpdate:modelValue": i[1] ||= (e) => r.value.collection = e,
						prefix: "collection"
					}, null, 8, ["modelValue"]),
					K("p", sd, P(p("scrape")), 1)
				]),
				K("section", cd, [
					K("div", ld, [i[19] ||= K("h2", null, "Automatic classification", -1), K("label", ud, [z(K("input", {
						"onUpdate:modelValue": i[2] ||= (e) => r.value.classification.enabled = e,
						name: "classification-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.classification.enabled]]), i[18] ||= J("Enabled", -1)])]),
					i[28] ||= K("p", { class: "studio-muted" }, "Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.", -1),
					K("div", dd, [K("label", null, [i[21] ||= J("Speech recognition engine", -1), z(K("select", {
						"onUpdate:modelValue": i[3] ||= (e) => r.value.classification.engine = e,
						name: "stt-engine"
					}, [...i[20] ||= [K("option", { value: "faster_whisper" }, "Faster Whisper · recommended", -1), K("option", { value: "parakeet_onnx" }, "Parakeet ONNX", -1)]], 512), [[Io, r.value.classification.engine]])]), K("label", null, [i[23] ||= J("Run", -1), z(K("select", {
						"onUpdate:modelValue": i[4] ||= (e) => r.value.classification.trigger = e,
						name: "classification-trigger"
					}, [...i[22] ||= [K("option", { value: "after_collection" }, "After collection", -1), K("option", { value: "schedule" }, "On a schedule", -1)]], 512), [[Io, r.value.classification.trigger]])])]),
					r.value.classification.trigger === "schedule" ? (W(), ia(Qu, {
						key: 0,
						modelValue: r.value.classification_schedule,
						"onUpdate:modelValue": i[5] ||= (e) => r.value.classification_schedule = e,
						prefix: "classification"
					}, null, 8, ["modelValue"])) : Y("", !0),
					K("details", fd, [
						i[26] ||= K("summary", null, "Classification rules", -1),
						K("label", pd, [z(K("input", {
							"onUpdate:modelValue": i[6] ||= (e) => r.value.classification.auto_negatives = e,
							type: "checkbox"
						}, null, 512), [[Po, r.value.classification.auto_negatives]]), i[24] ||= J("Label clear non-wake activations as negatives", -1)]),
						K("label", md, [z(K("input", {
							"onUpdate:modelValue": i[7] ||= (e) => r.value.classification.promote_close_misses = e,
							type: "checkbox"
						}, null, 512), [[Po, r.value.classification.promote_close_misses]]), i[25] ||= J("Promote confirmed close misses to positives", -1)]),
						i[27] ||= K("p", { class: "studio-muted text-xs" }, "Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is automatically deleted.", -1)
					]),
					K("p", hd, P(p("classify")), 1)
				]),
				K("div", gd, [K("section", _d, [
					K("div", vd, [i[30] ||= K("h2", null, "Automatic training", -1), K("label", yd, [z(K("input", {
						"onUpdate:modelValue": i[8] ||= (e) => r.value.training.enabled = e,
						name: "training-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.training.enabled]]), i[29] ||= J("Enabled", -1)])]),
					i[32] ||= K("p", { class: "studio-muted" }, "Create an archived model from reviewed and selected inputs.", -1),
					q(Qu, {
						modelValue: r.value.training,
						"onUpdate:modelValue": i[9] ||= (e) => r.value.training = e,
						prefix: "training"
					}, null, 8, ["modelValue"]),
					K("label", bd, [z(K("input", {
						"onUpdate:modelValue": i[10] ||= (e) => r.value.skip_unchanged = e,
						type: "checkbox"
					}, null, 512), [[Po, r.value.skip_unchanged]]), i[31] ||= J("Skip when inputs are unchanged", -1)]),
					i[33] ||= K("p", { class: "studio-note text-xs" }, "Training and deployment are separate. Training alone does not publish a model.", -1),
					K("p", xd, P(p("train")), 1)
				]), K("section", Sd, [
					K("div", Cd, [i[34] ||= K("h2", null, "Automatic deployment", -1), K("span", wd, P(f.value), 1)]),
					i[37] ||= K("p", { class: "studio-muted" }, "Publish eligible archives to your registered fleet targets.", -1),
					K("label", Td, [z(K("input", {
						"onUpdate:modelValue": i[11] ||= (e) => r.value.deployment_policy.after_training = e,
						name: "after-training",
						type: "checkbox"
					}, null, 512), [[Po, r.value.deployment_policy.after_training]]), i[35] ||= J("Deploy after successful training", -1)]),
					i[38] ||= K("p", { class: "studio-muted text-xs" }, "Optional. Failed, cancelled, or skipped runs do not trigger deployment.", -1),
					K("label", Ed, [z(K("input", {
						"onUpdate:modelValue": i[12] ||= (e) => r.value.deployment.enabled = e,
						name: "deployment-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.deployment.enabled]]), i[36] ||= J("Enable scheduled deployment", -1)]),
					r.value.deployment.enabled ? (W(), ia(Qu, {
						key: 0,
						modelValue: r.value.deployment,
						"onUpdate:modelValue": i[13] ||= (e) => r.value.deployment = e,
						prefix: "deployment"
					}, null, 8, ["modelValue"])) : Y("", !0),
					i[39] ||= K("p", { class: "studio-muted text-xs mt-3" }, "Publish the latest new eligible archive; skip if there is nothing new. Manual rollbacks are retained until a new archive is available.", -1),
					K("p", Dd, P(p("deploy")), 1)
				])]),
				K("button", {
					type: "submit",
					class: "studio-primary",
					disabled: o.value || a.value
				}, P(o.value ? "Saving…" : "Save automation settings"), 9, Od)
			], 32)) : Y("", !0)
		]));
	}
}), Ad = {
	key: 0,
	class: "studio-note",
	role: "status"
}, jd = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Md = {
	key: 2,
	class: "studio-card studio-safety mb-4",
	"data-staging-notice": ""
}, Nd = {
	class: "studio-note",
	"data-quarantine-notice": "",
	role: "alert"
}, Pd = { class: "studio-muted" }, Fd = { class: "mb-4" }, Id = ["href"], Ld = ["href"], Rd = { class: "studio-card mb-4" }, zd = {
	key: 0,
	class: "studio-muted"
}, Bd = {
	key: 1,
	class: "grid gap-3"
}, Vd = ["data-version-id"], Hd = { class: "flex flex-wrap justify-between gap-3" }, Ud = { class: "min-w-0 flex-1" }, Wd = { class: "studio-muted text-xs" }, Gd = {
	key: 0,
	class: "studio-note text-xs"
}, Kd = { class: "flex flex-wrap items-center gap-2" }, qd = ["href"], Jd = ["disabled", "onClick"], Yd = [
	"data-action",
	"disabled",
	"onClick"
], Xd = {
	key: 0,
	class: "studio-muted text-xs"
}, Zd = {
	key: 2,
	class: "studio-muted"
}, Qd = { class: "studio-card" }, $d = ["data-device-status"], ef = {
	key: 0,
	class: "studio-status studio-status-muted"
}, tf = { class: "studio-muted text-xs" }, nf = { class: "text-xs" }, rf = {
	key: 0,
	class: "studio-muted text-xs"
}, af = { key: 0 }, of = {
	key: 0,
	class: "studio-muted"
}, sf = {
	key: 3,
	class: "studio-modal-backdrop"
}, cf = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm rollback"
}, lf = { class: "flex gap-2" }, uf = ["disabled"], df = /* @__PURE__ */ V({
	__name: "DeployPage",
	setup(e) {
		let t = ms(), n = pu(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(""), d, f, p = 0, m = 0, h = !1, g = X(() => new Map(n.devices.value.map((e) => [e.id, e])));
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
		return B(() => t.selectedId.value, () => {
			f?.abort(), f = void 0, m += 1, u.value = "", l.value = null, c.value = "", x();
		}, { immediate: !0 }), Er(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, n) => (W(), G("section", null, [
			n[14] ||= K("div", { class: "mb-4" }, [K("h1", null, "Deploy"), K("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (W(), G("p", Ad, P(c.value), 1)) : Y("", !0),
			s.value ? (W(), G("p", jd, P(s.value), 1)) : Y("", !0),
			a.value ? (W(), G("section", Md, [
				n[6] ||= K("h2", null, "Before publishing", -1),
				n[7] ||= K("p", null, [K("strong", null, "Clean, exclusive staging required."), J(" No concurrent manual uploads; staging cannot be checked automatically.")], -1),
				K("p", Nd, [n[3] ||= K("strong", null, "Quarantine warning:", -1), J(" " + P(a.value.quarantine_notice), 1)]),
				K("details", null, [
					n[4] ||= K("summary", null, "Publication safety details", -1),
					K("p", null, P(a.value.notice), 1),
					n[5] ||= K("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
					K("p", Pd, P(a.value.operator_action), 1)
				])
			])) : Y("", !0),
			K("p", Fd, [
				K("a", {
					href: R(t).routes.href("kiosks"),
					onClick: n[0] ||= Uo((e) => R(t).routes.navigate("kiosks"), ["prevent"])
				}, "Manage kiosks →", 8, Id),
				n[8] ||= J(" · ", -1),
				K("a", {
					href: R(t).routes.href("automate"),
					onClick: n[1] ||= Uo((e) => R(t).routes.navigate("automate"), ["prevent"])
				}, "Deployment automation →", 8, Ld)
			]),
			K("section", Rd, [n[9] ||= K("h2", null, "Archived model versions", -1), o.value ? (W(), G("p", zd, "Loading archives…")) : r.value.length ? (W(), G("div", Bd, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [K("div", Hd, [K("div", Ud, [
				K("strong", null, P(e.id), 1),
				K("p", Wd, P(e.trained_at) + " · Run " + P(e.run_id), 1),
				e.origin === "legacy" ? (W(), G("p", Gd, "Legacy import · " + P(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : Y("", !0)
			]), K("div", Kd, [
				K("a", { href: R($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, qd),
				K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, P(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, Jd),
				K("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Yd)
			])]), R(cs)(e.metrics).recall === null ? Y("", !0) : (W(), G("p", Xd, "Recall " + P(R(cs)(e.metrics).recall), 1))], 8, Vd))), 128))])) : (W(), G("p", Zd, "No archived model versions for this workspace."))]),
			K("section", Qd, [
				n[11] ||= K("h2", null, "Target delivery", -1),
				n[12] ||= K("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [K("div", null, [
					K("strong", null, P(e.device_id), 1),
					n[10] ||= J(),
					g.value.get(e.device_id)?.role === "follower" ? (W(), G("span", ef, "Follower")) : Y("", !0),
					K("p", tf, P(g.value.get(e.device_id)?.leader_id ? `Indirect via ${g.value.get(e.device_id)?.leader_id}` : "Direct leader/standalone target"), 1)
				]), K("div", null, [
					K("span", { class: N(["studio-status", v(e)]) }, P(e.state), 3),
					K("p", nf, "Desired " + P(e.desired_version) + " · Observed " + P(y(e)), 1),
					e.error_code ? (W(), G("p", rf, [J("Retry/error: " + P(e.error_code), 1), e.next_retry ? (W(), G("span", af, " · next " + P(e.next_retry), 1)) : Y("", !0)])) : Y("", !0)
				])], 8, $d))), 128)),
				i.value.length ? Y("", !0) : (W(), G("p", of, "No publication status yet."))
			]),
			l.value ? (W(), G("div", sf, [K("section", cf, [
				n[13] ||= K("h2", null, "Rollback archive?", -1),
				K("p", null, "Republish " + P(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				K("div", lf, [K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, uf), K("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: n[2] ||= (e) => l.value = null
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
}), ff = { class: "studio-card" }, pf = { class: "studio-toolbar" }, mf = ["disabled"], hf = {
	key: 0,
	class: "studio-muted mt-3"
}, gf = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, _f = {
	key: 2,
	class: "studio-table mt-3 grid gap-3"
}, vf = { class: "studio-dataset-row" }, yf = { class: "studio-checkbox-label" }, bf = [
	"data-dataset-id",
	"checked",
	"onChange"
], xf = { class: "studio-dataset-copy" }, Sf = { class: "studio-muted block text-xs" }, Cf = { class: "studio-muted block text-xs" }, wf = {
	key: 0,
	class: "studio-note block text-xs"
}, Tf = { class: "studio-dataset-actions" }, Ef = ["disabled", "onClick"], Df = ["onClick"], Of = {
	key: 3,
	class: "studio-muted mt-3"
}, kf = /* @__PURE__ */ V({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = ms(), n = Ec(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(""), p, m, h, g = 0, _ = 0, v = 0, y = X(() => t.selectedId.value), b = X(() => [...c.value].sort());
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
			m?.abort(), h?.abort(), m = void 0, h = void 0, _ += 1, v += 1, u.value = !1, d.value = !1;
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
		async function E(e = !1) {
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, u = y.value;
			if (r.value = [], i.value = 0, e || (c.value = /* @__PURE__ */ new Set()), f.value = "", u) {
				l.value = !0;
				try {
					let l = {
						search: o.value,
						status: s.value || void 0,
						offset: a.value,
						limit: 50
					}, [d, f] = await Promise.all([$.datasets(u, l, t.signal), T(u, t)]);
					if (!x(u, n, t)) return;
					r.value = d.items, i.value = d.total, e || (c.value = new Set(f.map((e) => e.id)));
				} catch (e) {
					x(u, n, t) && (f.value = e instanceof Error ? e.message : "Unable to load datasets.");
				} finally {
					x(u, n, t) && (l.value = !1);
				}
			}
		}
		function D(e, t) {
			let n = new Set(c.value);
			t ? n.add(e) : n.delete(e), c.value = n;
		}
		async function O() {
			let e = y.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++_, r = b.value;
			u.value = !0, f.value = "";
			try {
				await $.selectDatasets(e, r, t.signal), S(e, n, t) && await E();
			} catch (r) {
				S(e, n, t) && (f.value = r instanceof Error ? r.message : "Dataset selection was not saved.");
			} finally {
				S(e, n, t) && (u.value = !1);
			}
		}
		async function ee(e) {
			let t = y.value;
			if (!t) return;
			h?.abort();
			let i = new AbortController();
			h = i;
			let a = ++v;
			d.value = !0, f.value = "";
			try {
				let o = await $.downloadDataset(e.id, i.signal);
				C(t, a, i) && (n.track(o), n.show(o.id), r.value = r.value.map((t) => t.id === e.id ? {
					...t,
					status: o.status,
					job_id: o.id
				} : t));
			} catch (e) {
				C(t, a, i) && (f.value = e instanceof Error ? e.message : "Dataset download was not started.");
			} finally {
				C(t, a, i) && (d.value = !1);
			}
		}
		B(() => Object.values(n.jobs.value).filter((e) => e.kind === "download").map((e) => ({
			id: e.id,
			active: Cc(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && E(!0);
		}), B(y, () => {
			w(), E();
		}, { immediate: !0 }), B(a, () => {
			E();
		}), B(o, () => {
			a.value === 0 ? E() : a.value = 0;
		}), B(s, () => {
			a.value === 0 ? E() : a.value = 0;
		}), Er(() => {
			p?.abort(), m?.abort(), h?.abort();
		});
		function k(e) {
			return e === null ? "Size not published" : `${Math.ceil(e / 1024)} KiB`;
		}
		return (e, t) => (W(), G("section", null, [t[6] ||= K("div", { class: "mb-4" }, [K("h1", null, "Negative Datasets"), K("p", { class: "studio-muted" }, "Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.")], -1), K("div", ff, [
			K("div", pf, [
				K("label", null, [t[3] ||= J("Search", -1), z(K("input", {
					"onUpdate:modelValue": t[0] ||= (e) => o.value = e,
					name: "dataset-search",
					type: "search",
					placeholder: "Search catalog"
				}, null, 512), [[No, o.value]])]),
				K("label", null, [t[5] ||= J("Installation state", -1), z(K("select", {
					"onUpdate:modelValue": t[1] ||= (e) => s.value = e,
					name: "dataset-status"
				}, [...t[4] ||= [fa("<option value=\"\">All states</option><option value=\"available\">Available</option><option value=\"installed\">Installed</option><option value=\"queued\">Queued</option><option value=\"running\">Running</option><option value=\"failed\">Failed</option><option value=\"selected\">Selected</option>", 7)]], 512), [[Io, s.value]])]),
				K("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: u.value || !y.value,
					onClick: O
				}, P(u.value ? "Saving…" : "Save selection"), 9, mf)
			]),
			l.value ? (W(), G("p", hf, "Loading catalog…")) : Y("", !0),
			f.value ? (W(), G("p", gf, P(f.value), 1)) : Y("", !0),
			r.value.length ? (W(), G("div", _f, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-history"
			}, [K("div", vf, [K("label", yf, [K("input", {
				"data-dataset-id": e.id,
				type: "checkbox",
				checked: c.value.has(e.id),
				onChange: (t) => D(e.id, t.target.checked)
			}, null, 40, bf), K("span", xf, [
				K("strong", null, P(e.name), 1),
				K("span", Sf, P(e.description) + " · " + P(e.source) + " · " + P(e.license), 1),
				K("span", Cf, P(e.representation) + " / " + P(e.adapter) + " · " + P(e.split) + " · " + P(k(e.installed_bytes ?? e.download_bytes)), 1),
				e.split === "evaluation" ? (W(), G("span", wf, "Evaluation-only: this dataset is not sampled as a training input.")) : Y("", !0)
			])]), K("div", Tf, [
				K("span", { class: N(["studio-status", `studio-status-${e.status}`]) }, P(e.status), 3),
				e.status === "available" || e.status === "failed" ? (W(), G("button", {
					key: 0,
					type: "button",
					disabled: d.value,
					onClick: (t) => ee(e)
				}, "Download", 8, Ef)) : Y("", !0),
				e.job_id ? (W(), G("button", {
					key: 1,
					type: "button",
					"data-action": "view-dataset-job",
					onClick: (t) => R(n).show(e.job_id)
				}, "View in queue", 8, Df)) : Y("", !0)
			])])]))), 128))])) : l.value ? Y("", !0) : (W(), G("p", Of, "No catalog datasets match these filters.")),
			q($s, {
				total: i.value,
				offset: a.value,
				limit: 50,
				loading: l.value,
				onPage: t[2] ||= (e) => a.value = e
			}, null, 8, [
				"total",
				"offset",
				"loading"
			])
		])]));
	}
}), Af = { class: "studio-card" }, jf = {
	"data-generation-phrase": "",
	class: "studio-muted"
}, Mf = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, Nf = ["value"], Pf = ["value"], Ff = ["disabled"], If = ["value"], Lf = {
	key: 1,
	value: "mixed"
}, Rf = { class: "grid gap-3 sm:grid-cols-2" }, zf = { class: "flex items-center justify-between gap-3" }, Bf = { class: "studio-checkbox-label" }, Vf = [
	"data-engine",
	"disabled",
	"checked",
	"onChange"
], Hf = [
	"data-preview",
	"disabled",
	"onClick"
], Uf = {
	key: 0,
	class: "studio-muted text-xs mt-2"
}, Wf = {
	key: 1,
	role: "alert",
	class: "studio-note mt-3"
}, Gf = ["onClick"], Kf = [
	"data-preview-audio",
	"src",
	"aria-label"
], qf = ["disabled"], Jf = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, Yf = { class: "studio-card mt-4" }, Xf = { class: "flex flex-wrap items-center justify-between gap-3" }, Zf = ["disabled"], Qf = {
	key: 0,
	class: "studio-muted mt-3"
}, $f = { class: "studio-checkbox-label" }, ep = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], tp = { class: "studio-muted block text-xs" }, np = {
	key: 0,
	class: "studio-muted block text-xs"
}, rp = { class: "studio-status ml-auto" }, ip = {
	key: 1,
	class: "studio-muted mt-3"
}, ap = /* @__PURE__ */ V({
	__name: "ArtificialPage",
	setup(e) {
		let t = ms(), n = Ec(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(0), s = /* @__PURE__ */ L({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), c = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L({}), m = /* @__PURE__ */ L({}), h = /* @__PURE__ */ L({}), g = /* @__PURE__ */ new Map(), _ = {
			omnivoice: "OmniVoice",
			qwen3: "Qwen3-TTS",
			moss: "MOSS-TTS",
			piper: "Piper"
		}, v, y, b = 0, x = 0, S = !1, C = X(() => t.selectedId.value), w = X(() => t.selected.value), T = X(() => r.value.find((e) => e.language === s.value.language) ?? null), E = X(() => T.value?.engines.hybrid ?? []), D = X(() => T.value?.model_availability ?? E.value.map((e) => ({
			engine: e,
			supported: !0,
			available: !0,
			reason: null
		}))), O = X(() => !!T.value?.accent_applies && s.value.engines?.some((e) => e !== "piper"));
		function ee(e, t, n) {
			return C.value === e && b === t && !n.signal.aborted;
		}
		function k(e, t, n) {
			return C.value === e && x === t && !n.signal.aborted;
		}
		function te() {
			let e = T.value;
			if (!e) return;
			let t = s.value.engines ?? e.engines[s.value.tts_mode];
			s.value.engines = t.filter((e) => E.value.includes(e)), O.value || (s.value.english_accent = "mixed");
		}
		function ne() {
			y?.abort(), y = void 0, x += 1, u.value = !1, f.value = null;
			for (let e of g.values()) e.abort();
			g.clear(), p.value = {}, m.value = {}, h.value = {};
		}
		async function A() {
			v?.abort();
			let e = new AbortController();
			v = e;
			let t = ++b, n = C.value;
			if (i.value = [], a.value = 0, d.value = "", n) {
				l.value = !0;
				try {
					let [l, u, d, f, p, m] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(n, e.signal).catch((e) => e instanceof as && e.status === 404 ? null : Promise.reject(e)),
						$.batches(n, {
							offset: o.value,
							limit: 50
						}, e.signal),
						S ? Promise.resolve(null) : $.batchSelection(n, e.signal),
						$.wakeword(n, e.signal),
						$.generationDefaults(e.signal)
					]);
					if (!ee(n, t, e)) return;
					r.value = l, S ||= (s.value = u ?? {
						language: p.language,
						english_accent: "mixed",
						tts_mode: "hybrid",
						...m
					}, te(), c.value = new Set(f ?? []), !0), i.value = d.items, a.value = d.total;
				} catch (r) {
					ee(n, t, e) && (d.value = r instanceof Error ? r.message : "Unable to load generation settings.");
				} finally {
					ee(n, t, e) && (l.value = !1);
				}
			}
		}
		function re(e) {
			s.value.language = e, te();
		}
		function j(e, t) {
			let n = new Set(s.value.engines);
			t ? n.add(e) : n.delete(e), s.value.engines = [...n];
		}
		function ie() {
			return !Number.isInteger(s.value.samples) || s.value.samples < 1 || !Number.isInteger(s.value.batch_size) || s.value.batch_size < 1 ? (d.value = "Sample count and batch size must be positive integers.", !1) : s.value.engines?.length ? !0 : (d.value = "Select at least one generation model.", !1);
		}
		async function ae() {
			let e = C.value;
			if (!e || !ie()) return;
			y?.abort();
			let t = new AbortController();
			y = t;
			let r = ++x, i = {
				...s.value,
				engines: [...s.value.engines],
				english_accent: O.value ? s.value.english_accent : "mixed",
				tts_mode: "hybrid"
			};
			u.value = !0, d.value = "";
			try {
				let a = await $.generate(e, i, t.signal);
				k(e, r, t) && (s.value = i, f.value = a, n.track(a), n.show(a.id));
			} catch (n) {
				k(e, r, t) && (d.value = n instanceof Error ? n.message : "Generation job was not started.");
			} finally {
				k(e, r, t) && (u.value = !1);
			}
		}
		async function oe(e) {
			let t = C.value;
			if (!t || m.value[e]) return;
			g.get(e)?.abort();
			let r = new AbortController();
			g.set(e, r), m.value[e] = !0, h.value[e] = "", delete p.value[e];
			try {
				let i = await $.preview(t, {
					...s.value,
					tts_mode: "hybrid",
					engines: [e],
					samples: 1,
					batch_size: 1,
					english_accent: T.value?.accent_applies && e !== "piper" ? s.value.english_accent : "mixed"
				}, r.signal);
				!r.signal.aborted && C.value === t && (p.value[e] = i, n.track(i), n.show(i.id));
			} catch (n) {
				!r.signal.aborted && C.value === t && (h.value[e] = n instanceof Error ? n.message : "Preview could not start.");
			} finally {
				g.get(e) === r && (m.value[e] = !1, g.delete(e));
			}
		}
		function se(e, t) {
			p.value[e]?.id === t.id && (p.value[e] = t);
		}
		function ce(e) {
			let t = f.value;
			t?.id === e.id && (f.value = e, e.status === "complete" && t.status !== "complete" && (o.value = 0, A()));
		}
		B(n.jobs, (e) => {
			if (f.value) {
				let t = e[f.value.id];
				t && t.word_id === C.value && ce(t);
			}
			for (let [t, n] of Object.entries(p.value)) {
				let r = e[n.id];
				r && r.word_id === C.value && se(t, r);
			}
		}, { deep: !0 });
		function M(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(c.value);
			t ? n.add(e.id) : n.delete(e.id), c.value = n;
		}
		async function le() {
			let e = C.value;
			if (!e || !S || l.value) return;
			y?.abort();
			let t = new AbortController();
			y = t;
			let n = ++x, r = [...c.value];
			u.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), k(e, n, t) && await A();
			} catch (r) {
				k(e, n, t) && (d.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				k(e, n, t) && (u.value = !1);
			}
		}
		return B(C, () => {
			ne(), S = !1, c.value = /* @__PURE__ */ new Set(), s.value = {
				language: w.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, o.value = 0, A();
		}, { immediate: !0 }), B(o, () => {
			A();
		}), Er(() => {
			v?.abort(), ne();
		}), (e, t) => (W(), G("section", null, [
			t[16] ||= K("div", { class: "mb-4" }, [K("h1", null, "Artificial"), K("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			K("div", Af, [
				t[13] ||= K("h2", null, "Generate data", -1),
				K("p", jf, [t[6] ||= J("Wake phrase: ", -1), K("strong", null, P(w.value?.phrase ?? "No workspace selected"), 1)]),
				K("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Uo(ae, ["prevent"])
				}, [
					K("div", Mf, [
						K("label", null, [t[7] ||= J("Language", -1), K("select", {
							name: "language",
							value: s.value.language,
							onChange: t[0] ||= (e) => re(e.target.value)
						}, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("option", {
							key: e.language,
							value: e.language
						}, P(e.name), 9, Pf))), 128))], 40, Nf)]),
						K("label", null, [t[8] ||= J("English accent", -1), z(K("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => s.value.english_accent = e,
							disabled: !O.value
						}, [O.value ? (W(!0), G(U, { key: 0 }, H(T.value?.english_accents ?? [], (e) => (W(), G("option", {
							key: e.code,
							value: e.code
						}, P(e.label), 9, If))), 128)) : (W(), G("option", Lf, "Not applicable"))], 8, Ff), [[Io, s.value.english_accent]])]),
						K("label", null, [t[9] ||= J("Total samples", -1), z(K("input", {
							"onUpdate:modelValue": t[2] ||= (e) => s.value.samples = e,
							name: "samples",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							No,
							s.value.samples,
							void 0,
							{ number: !0 }
						]])]),
						K("label", null, [t[10] ||= J("Batch size", -1), z(K("input", {
							"onUpdate:modelValue": t[3] ||= (e) => s.value.batch_size = e,
							name: "batch-size",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							No,
							s.value.batch_size,
							void 0,
							{ number: !0 }
						]])])
					]),
					K("fieldset", null, [t[11] ||= K("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), K("div", Rf, [(W(!0), G(U, null, H(D.value, (e) => (W(), G("article", {
						key: e.engine,
						class: "studio-history"
					}, [
						K("div", zf, [K("label", Bf, [K("input", {
							type: "checkbox",
							"data-engine": e.engine,
							disabled: !e.available,
							checked: s.value.engines?.includes(e.engine),
							onChange: (t) => j(e.engine, t.target.checked)
						}, null, 40, Vf), K("strong", null, P(_[e.engine] ?? e.engine), 1)]), K("button", {
							type: "button",
							"data-preview": e.engine,
							disabled: !e.available || m.value[e.engine] || [
								"queued",
								"running",
								"cancelling"
							].includes(p.value[e.engine]?.status ?? "") || !C.value,
							onClick: (t) => oe(e.engine)
						}, P(m.value[e.engine] ? "Starting…" : "Preview"), 9, Hf)]),
						e.reason ? (W(), G("p", Uf, P(e.reason), 1)) : Y("", !0),
						h.value[e.engine] ? (W(), G("p", Wf, P(h.value[e.engine]), 1)) : Y("", !0),
						p.value[e.engine] && p.value[e.engine].status !== "complete" ? (W(), G("button", {
							key: 2,
							type: "button",
							onClick: (t) => R(n).show(p.value[e.engine].id)
						}, "View preview in queue", 8, Gf)) : Y("", !0),
						p.value[e.engine]?.status === "complete" ? (W(), G("audio", {
							key: 3,
							"data-preview-audio": e.engine,
							class: "mt-3 max-w-full",
							src: R($).previewAudioUrl(C.value, p.value[e.engine].id),
							controls: "",
							autoplay: "",
							"aria-label": `${_[e.engine] ?? e.engine} wakeword preview`
						}, null, 8, Kf)) : Y("", !0)
					]))), 128))])]),
					t[12] ||= K("p", { class: "studio-muted text-xs" }, "Samples are shared across the selected models. Preview generates one sample without adding it to your training data. Higher batch sizes use more memory; effective limits and accent support vary by model.", -1),
					K("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						disabled: u.value || l.value || !C.value
					}, P(u.value ? "Starting…" : "Generate dataset"), 9, qf)
				], 32),
				d.value ? (W(), G("p", Jf, P(d.value), 1)) : Y("", !0),
				f.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[4] ||= (e) => R(n).show(f.value.id)
				}, "View generation in queue")) : Y("", !0)
			]),
			K("div", Yf, [
				K("div", Xf, [t[14] ||= K("h2", null, "Generated datasets", -1), K("button", {
					type: "button",
					"data-action": "save-batches",
					disabled: u.value || l.value || !C.value,
					onClick: le
				}, "Save selection", 8, Zf)]),
				t[15] ||= K("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				l.value ? (W(), G("p", Qf, "Loading datasets…")) : Y("", !0),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [K("label", $f, [
					K("input", {
						"data-batch-id": e.id,
						type: "checkbox",
						checked: c.value.has(e.id),
						disabled: e.status !== "complete",
						onChange: (t) => M(e, t.target.checked)
					}, null, 40, ep),
					K("span", null, [
						K("strong", null, P(e.phrase), 1),
						K("span", tp, P(e.audio.length) + " samples · " + P(e.recipe.engines?.map((e) => _[e] ?? e).join(", ") || "Saved generation models") + " · " + P(e.created_at ? new Date(e.created_at).toLocaleString() : ""), 1),
						e.status === "complete" ? Y("", !0) : (W(), G("span", np, P(e.status) + " — only completed datasets can be selected.", 1))
					]),
					K("span", rp, P(e.status), 1)
				])]))), 128)),
				!l.value && !i.value.length ? (W(), G("p", ip, "No generated datasets yet. Choose models above to create one.")) : Y("", !0),
				q($s, {
					total: a.value,
					offset: o.value,
					limit: 50,
					loading: l.value,
					onPage: t[5] ||= (e) => o.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			])
		]));
	}
}), op = { class: "studio-card" }, sp = {
	key: 0,
	class: "studio-muted"
}, cp = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-3 my-4"
}, lp = { class: "studio-muted" }, up = { class: "text-2xl font-semibold" }, dp = { class: "studio-muted" }, fp = { class: "text-2xl font-semibold" }, pp = { class: "studio-muted" }, mp = { class: "text-2xl font-semibold" }, hp = { class: "studio-card mt-4" }, gp = { class: "grid gap-3 mt-3" }, _p = {
	"data-dataset-compatibility": "",
	class: "studio-note text-xs"
}, vp = { class: "flex gap-2" }, yp = ["disabled"], bp = ["disabled"], xp = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, Sp = { class: "studio-card mt-4" }, Cp = { class: "flex justify-between gap-3" }, wp = ["onClick"], Tp = {
	key: 0,
	class: "studio-note text-xs"
}, Ep = {
	key: 0,
	class: "studio-muted"
}, Dp = /* @__PURE__ */ V({
	__name: "TrainPage",
	setup(e) {
		let t = ms(), n = Ec(), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L({ training_steps: 4e4 }), a = /* @__PURE__ */ L([]), o = /* @__PURE__ */ L([]), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(null), f, p, m, h = 0, g = 0, _ = 0, v = X(() => t.selectedId.value), y = X(() => [...new Set(o.value.map((e) => `${e.representation}/${e.adapter}`))]);
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
			let t = ++h, n = v.value;
			if (r.value = null, a.value = [], o.value = [], d.value = null, u.value = "", n) {
				s.value = !0;
				try {
					let [s, c, l, u] = await Promise.all([
						$.trainingCounts(n, e.signal),
						$.trainingSettings(n, e.signal),
						$.trainingRuns(n, { limit: 50 }, e.signal),
						w(n, e)
					]);
					if (!b(n, t, e)) return;
					r.value = s, i.value = c, a.value = l.items, o.value = u;
				} catch (r) {
					b(n, t, e) && (u.value = r instanceof Error ? r.message : "Unable to load training configuration.");
				} finally {
					b(n, t, e) && (s.value = !1);
				}
			}
		}
		function E() {
			return !Number.isInteger(i.value.training_steps) || i.value.training_steps < 1 || i.value.training_steps > 1e7 ? (u.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function D() {
			let e = v.value;
			if (!e || !E()) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, r = { training_steps: i.value.training_steps };
			c.value = !0, u.value = "";
			try {
				let a = await $.saveTrainingSettings(e, r, t.signal);
				x(e, n, t) && (i.value = a);
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
			let r = ++_;
			l.value = !0, u.value = "";
			try {
				let i = await $.train(e, t.signal);
				S(e, r, t) && (d.value = i, a.value = [i, ...a.value.filter((e) => e.id !== i.id)], n.track(i), n.show(i.id));
			} catch (n) {
				S(e, r, t) && (u.value = n instanceof Error ? n.message : "Training job was not started.");
			} finally {
				S(e, r, t) && (l.value = !1);
			}
		}
		function ee(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return B(n.jobs, (e) => {
			a.value = a.value.map((t) => e[t.id]?.word_id === v.value ? e[t.id] : t);
		}, { deep: !0 }), B(v, () => {
			C(), T();
		}, { immediate: !0 }), Er(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[12] ||= K("div", { class: "mb-4" }, [K("h1", null, "Train"), K("p", { class: "studio-muted" }, "Configure inputs and start a manual training run. Progress and logs are available in the global job queue.")], -1),
			K("div", op, [
				t[5] ||= K("h2", null, "Effective inputs for the next snapshot", -1),
				s.value ? (W(), G("p", sp, "Loading effective inputs…")) : r.value ? (W(), G("div", cp, [
					K("p", lp, [K("strong", up, P(r.value.positive), 1), t[2] ||= J(" reviewed positives", -1)]),
					K("p", dp, [K("strong", fp, P(r.value.negative), 1), t[3] ||= J(" reviewed negatives", -1)]),
					K("p", pp, [K("strong", mp, P(r.value.artificial), 1), t[4] ||= J(" selected artificial", -1)])
				])) : Y("", !0),
				t[6] ||= K("p", { class: "studio-muted text-xs" }, "Only reviewed positive/negative samples and completed selected artificial batches are counted. Pending and discarded recordings are not training inputs.", -1)
			]),
			K("div", hp, [
				t[10] ||= K("h2", null, "Training parameters", -1),
				K("div", gp, [
					K("label", null, [t[7] ||= J("Training steps", -1), z(K("input", {
						"onUpdate:modelValue": t[0] ||= (e) => i.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						No,
						i.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					K("p", _p, [
						t[8] ||= J("Selected classifier representations: ", -1),
						K("strong", null, P(y.value.join(", ") || "none"), 1),
						t[9] ||= J(". microWakeWord uses mww_mmap feature tensors. dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					K("div", vp, [K("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: c.value,
						onClick: D
					}, P(c.value ? "Saving…" : "Save parameters"), 9, yp), K("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !v.value || l.value,
						onClick: O
					}, P(l.value ? "Starting…" : "Start training"), 9, bp)])
				]),
				u.value ? (W(), G("p", xp, P(u.value), 1)) : Y("", !0),
				d.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[1] ||= (e) => R(n).show(d.value.id)
				}, "View training in queue")) : Y("", !0)
			]),
			K("div", Sp, [
				t[11] ||= K("h2", null, "Run history", -1),
				(W(!0), G(U, null, H(a.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [K("div", Cp, [
					K("strong", null, P(e.id), 1),
					K("span", { class: N(["studio-status", `studio-status-${e.status}`]) }, P(e.status), 3),
					K("button", {
						type: "button",
						onClick: (t) => R(n).show(e.id)
					}, "View in queue", 8, wp)
				]), ee(e) ? (W(), G("p", Tp, "Skipped because inputs and configuration were unchanged.")) : Y("", !0)]))), 128)),
				!s.value && !a.value.length ? (W(), G("p", Ep, "No training runs for this workspace yet.")) : Y("", !0)
			])
		]));
	}
});
//#endregion
//#region src/studio/theme.ts
function Op() {
	let e = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null, t = null;
	try {
		let e = localStorage.getItem("studio.theme");
		(e === "light" || e === "dark") && (t = e);
	} catch {}
	let n = /* @__PURE__ */ L(t ? t === "dark" : !!e?.matches);
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
var kp = ["aria-pressed"], Ap = /* @__PURE__ */ V({
	__name: "ThemeToggle",
	setup(e) {
		let { dark: t, toggle: n, dispose: r } = Op();
		return Er(r), (e, r) => (W(), G("button", {
			type: "button",
			"aria-label": "Dark mode",
			"aria-pressed": R(t),
			onClick: r[0] ||= (...e) => R(n) && R(n)(...e)
		}, P(R(t) ? "☀ Light mode" : "☾ Dark mode"), 9, kp));
	}
}), jp = ["data-job-id"], Mp = { class: "studio-job-heading" }, Np = ["aria-label", "disabled"], Pp = { class: "studio-job-meta" }, Fp = { class: "studio-job-meta" }, Ip = {
	key: 0,
	class: "studio-job-meta"
}, Lp = {
	key: 1,
	class: "studio-log",
	"aria-label": "Job log tail"
}, Rp = {
	key: 2,
	class: "studio-job-meta"
}, zp = {
	key: 3,
	class: "studio-note",
	role: "alert"
}, Bp = { class: "studio-job-meta" }, Vp = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Hp = /* @__PURE__ */ V({
	__name: "JobQueueCard",
	props: { job: {} },
	setup(e) {
		let t = e, n = Ec(), r = ms(), i = {
			train: "Train wakeword",
			generation: "Generate artificial samples",
			preview: "Preview voice",
			scrape: "Collect recordings",
			download: "Download negative dataset",
			classify: "Classify recordings",
			deploy: "Deploy model"
		}, a = X(() => t.job.word_id ? r.wakewords.value.find((e) => e.id === t.job.word_id)?.phrase ?? t.job.word_id : t.job.kind === "download" ? "Shared dataset" : "All wakewords"), o = X(() => t.job.kind === "scrape" ? t.job.payload.device_ids?.join(", ") || "All registered kiosks and followers" : t.job.kind === "download" ? t.job.payload.dataset_id : "Trainer"), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d, f;
		function p() {
			d?.abort(), f && clearTimeout(f), f = void 0;
		}
		async function m() {
			if (p(), !s.value) return;
			let e = new AbortController();
			d = e, u.value = !0;
			try {
				let n = await $.jobLogs(t.job.id, 8192, e.signal);
				e.signal.aborted || (c.value = n.text.slice(-8192), l.value = "");
			} catch (t) {
				e.signal.aborted || (l.value = t instanceof Error ? t.message : "Unable to load job logs.");
			} finally {
				e.signal.aborted || (u.value = !1, s.value && Cc(t.job) && (f = setTimeout(() => void m(), 2e3)));
			}
		}
		return B([s, () => t.job.status], () => {
			s.value ? m() : p();
		}), Er(p), (t, r) => (W(), G("article", {
			class: N(["studio-card studio-job-card", { "studio-selected": R(n).selectedJobId.value === e.job.id }]),
			"data-job-id": e.job.id
		}, [
			K("div", Mp, [
				K("h3", null, P(i[e.job.kind] ?? e.job.kind), 1),
				K("span", { class: N(["studio-status", `studio-status-${e.job.status}`]) }, P(e.job.status), 3),
				R(Cc)(e.job) ? (W(), G("button", {
					key: 0,
					type: "button",
					"data-action": "cancel-job",
					"aria-label": `Cancel ${i[e.job.kind] ?? e.job.kind}`,
					disabled: e.job.status === "cancelling" || R(n).cancelling.value.has(e.job.id),
					onClick: r[0] ||= (t) => R(n).cancel(e.job.id)
				}, "Cancel", 8, Np)) : Y("", !0)
			]),
			K("p", Pp, P(a.value) + " · " + P(o.value), 1),
			K("p", Fp, P(e.job.started_at ? "Started" : "Created") + " " + P(new Date(e.job.started_at ?? e.job.created_at).toLocaleString()), 1),
			K("details", { onToggle: r[1] ||= (e) => s.value = e.target.open }, [
				r[2] ||= K("summary", null, "View logs", -1),
				u.value && !c.value ? (W(), G("p", Ip, "Loading logs…")) : Y("", !0),
				c.value ? (W(), G("pre", Lp, P(c.value), 1)) : !u.value && !l.value ? (W(), G("p", Rp, "No retained log output.")) : Y("", !0),
				l.value ? (W(), G("p", zp, [J(P(l.value) + " ", 1), K("button", {
					type: "button",
					onClick: m
				}, "Retry")])) : Y("", !0),
				K("p", Bp, "Job " + P(e.job.id), 1)
			], 32),
			R(n).cancelErrors.value[e.job.id] ? (W(), G("p", Vp, P(R(n).cancelErrors.value[e.job.id]), 1)) : Y("", !0)
		], 10, jp));
	}
}), Up = { class: "studio-queue-header" }, Wp = { class: "flex items-center justify-between gap-3" }, Gp = { class: "studio-queue-badge" }, Kp = { class: "studio-queue-content" }, qp = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Jp = {
	key: 1,
	class: "studio-muted text-xs",
	role: "status"
}, Yp = { class: "studio-queue-group" }, Xp = { class: "studio-queue-group" }, Zp = {
	key: 6,
	class: "studio-muted text-sm mt-4"
}, Qp = ["disabled"], $p = /* @__PURE__ */ V({
	__name: "JobQueueDrawer",
	setup(e) {
		let t = Ec(), n = /* @__PURE__ */ L(), r = /* @__PURE__ */ L(), i = X(() => t.activeJobs.value.filter((e) => e.status !== "queued")), a = X(() => t.activeJobs.value.filter((e) => e.status === "queued")), o = X(() => {
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
		return B(t.open, async (e) => {
			e ? (s = document.activeElement instanceof HTMLElement ? document.activeElement : null, c = document.body.style.overflow, document.body.style.overflow = "hidden", document.addEventListener("keydown", u, !0), await bn(), r.value?.focus()) : (d(), await bn(), s?.isConnected ? s.focus() : document.querySelector("[data-action=\"open-job-queue\"]")?.focus());
		}, { flush: "sync" }), B([
			t.selectedJobId,
			t.history,
			t.loading
		], async () => {
			t.open.value && t.selectedJobId.value && (await bn(), Array.from(n.value?.querySelectorAll("[data-job-id]") ?? []).find((e) => e.dataset.jobId === t.selectedJobId.value)?.scrollIntoView?.({ block: "nearest" }));
		}), Er(() => {
			t.open.value && d();
		}), (e, s) => R(t).open.value ? (W(), G(U, { key: 0 }, [K("div", {
			class: "studio-queue-backdrop",
			"data-job-queue-backdrop": "",
			onClick: l
		}), K("aside", {
			id: "studio-job-queue",
			ref_key: "panel",
			ref: n,
			class: "studio-job-drawer",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Global job queue"
		}, [K("header", Up, [K("div", Wp, [K("h2", null, [s[2] ||= J("Job queue ", -1), K("span", Gp, P(R(t).activeCount.value) + " active", 1)]), K("button", {
			ref_key: "closeButton",
			ref: r,
			type: "button",
			"data-action": "close-job-queue",
			"aria-label": "Close job queue",
			onClick: l
		}, "✕", 512)]), s[3] ||= K("p", { class: "studio-muted text-xs" }, "All kiosks · All followers · All wakewords", -1)]), K("div", Kp, [
			R(t).error.value ? (W(), G("p", qp, [J(P(R(t).error.value) + " ", 1), K("button", {
				type: "button",
				onClick: s[0] ||= (...e) => R(t).refresh && R(t).refresh(...e)
			}, "Retry")])) : Y("", !0),
			R(t).loading.value ? (W(), G("p", Jp, "Refreshing jobs…")) : Y("", !0),
			o.value ? (W(), G(U, { key: 2 }, [s[4] ||= K("h3", { class: "studio-queue-group" }, "Selected job", -1), q(Hp, { job: o.value }, null, 8, ["job"])], 64)) : Y("", !0),
			i.value.length ? (W(), G(U, { key: 3 }, [K("h3", Yp, "Running · " + P(i.value.length), 1), (W(!0), G(U, null, H(i.value, (e) => (W(), ia(Hp, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			a.value.length ? (W(), G(U, { key: 4 }, [K("h3", Xp, "Queued · " + P(a.value.length), 1), (W(!0), G(U, null, H(a.value, (e) => (W(), ia(Hp, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			R(t).history.value.length ? (W(), G(U, { key: 5 }, [s[5] ||= K("h3", { class: "studio-queue-group" }, "Recent history", -1), (W(!0), G(U, null, H(R(t).history.value, (e) => (W(), ia(Hp, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			!R(t).activeCount.value && !R(t).history.value.length && !o.value && !R(t).loading.value && !R(t).error.value ? (W(), G("p", Zp, "No jobs yet.")) : Y("", !0),
			R(t).hasMore.value ? (W(), G("button", {
				key: 7,
				type: "button",
				class: "studio-queue-more",
				disabled: R(t).loading.value,
				onClick: s[1] ||= (...e) => R(t).loadMore && R(t).loadMore(...e)
			}, "Load older jobs", 8, Qp)) : Y("", !0)
		])], 512)], 64)) : Y("", !0);
	}
}), em = ["inert"], tm = { class: "studio-sidebar" }, nm = { class: "flex items-center justify-between gap-3" }, rm = ["aria-expanded"], im = ["hidden"], am = {
	key: 0,
	class: "studio-nav-label"
}, om = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], sm = { class: "studio-main" }, cm = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, lm = { class: "studio-muted text-xs" }, um = { class: "flex flex-wrap items-center gap-3" }, dm = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, fm = ["value", "disabled"], pm = {
	key: 0,
	value: ""
}, mm = ["value"], hm = ["aria-expanded"], gm = {
	key: 0,
	class: "studio-queue-badge"
}, _m = {
	key: 1,
	title: "Job queue unavailable",
	"aria-label": "Job queue unavailable"
}, vm = {
	key: 0,
	role: "status",
	class: "studio-note"
}, ym = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, bm = {
	key: 2,
	role: "status"
}, xm = /* @__PURE__ */ V({
	__name: "StudioShell",
	setup(e) {
		let t = ts(), n = fs(t);
		In(ps, n);
		let r = Tc();
		In(wc, r);
		let { wakewords: i, selectedId: a, selected: o, loading: s, error: c, notice: l } = n, u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(), m = X(() => Qo.find((e) => e.id === t.page.value)), h = X(() => d.value && !u.value), g = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
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
		return B(d, (e) => {
			e || (u.value = !1);
		}), _(), g?.addEventListener ? g.addEventListener("change", _) : g?.addListener(_), Cr(() => {
			document.addEventListener("keydown", y), n.load(), r.start();
		}), Er(() => {
			document.removeEventListener("keydown", y), r.stop(), g?.removeEventListener ? g.removeEventListener("change", _) : g?.removeListener(_);
		}), (e, o) => (W(), G("div", { class: N(["studio-app", { "is-narrow": d.value }]) }, [K("div", {
			class: "studio-layout",
			"data-studio-background": "",
			inert: R(r).open.value ? !0 : void 0
		}, [
			K("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: o[0] ||= Uo((e) => p.value?.focus(), ["prevent"])
			}, "Skip to content"),
			K("aside", tm, [
				K("div", nm, [o[4] ||= K("div", { class: "studio-brand" }, [J("◈ Wakeword Studio"), K("small", null, "LISTEN · REFINE · DEPLOY")], -1), d.value ? (W(), G("button", {
					key: 0,
					ref_key: "toggle",
					ref: f,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": u.value,
					onClick: o[1] ||= (e) => u.value = !u.value
				}, "Menu", 8, rm)) : Y("", !0)]),
				K("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: h.value
				}, [(W(!0), G(U, null, H(R(Qo), (e, n) => (W(), G(U, { key: e.id }, [(e.group === "Data" || e.group === "Models") && R(Qo)[n - 1]?.group !== e.group ? (W(), G("div", am, P(e.group), 1)) : Y("", !0), K("a", {
					href: R(t).href(e.id),
					"data-page": e.id,
					class: N({
						active: m.value.id === e.id,
						"studio-sub": e.group === "Data"
					}),
					"aria-current": m.value.id === e.id ? "page" : void 0,
					onClick: Uo((t) => b(e.id), ["prevent"])
				}, P(e.name), 11, om)], 64))), 128))], 8, im),
				o[5] ||= K("p", { class: "studio-sidebar-note" }, [
					J("Independent workspaces."),
					K("br"),
					J("Device selections stay unchanged.")
				], -1)
			]),
			K("div", sm, [K("header", cm, [K("div", lm, P(m.value.group) + " / " + P(m.value.name), 1), K("div", um, [
				K("label", dm, [o[6] ||= J("WAKEWORD ", -1), K("select", {
					id: "studio-word",
					value: R(a),
					disabled: !R(i).length,
					onChange: o[2] ||= (e) => R(n).select(e.target.value)
				}, [R(i).length ? Y("", !0) : (W(), G("option", pm, "No wakewords")), (W(!0), G(U, null, H(R(i), (e) => (W(), G("option", {
					key: e.id,
					value: e.id
				}, P(e.phrase), 9, mm))), 128))], 40, fm)]),
				q(Ap),
				K("button", {
					type: "button",
					class: "studio-queue-toggle",
					"data-action": "open-job-queue",
					"aria-label": "Open global job queue",
					"aria-controls": "studio-job-queue",
					"aria-expanded": R(r).open.value,
					onClick: o[3] ||= (e) => R(r).show()
				}, [
					o[7] ||= K("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "1.7",
						"aria-hidden": "true"
					}, [K("path", { d: "M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" })], -1),
					R(r).activeCount.value ? (W(), G("span", gm, P(R(r).activeCount.value), 1)) : Y("", !0),
					R(r).error.value ? (W(), G("span", _m, "!")) : Y("", !0)
				], 8, hm)
			])]), K("main", {
				id: "studio-content",
				ref_key: "content",
				ref: p,
				class: "studio-content",
				tabindex: "-1"
			}, [
				R(l) ? (W(), G("p", vm, P(R(l)), 1)) : Y("", !0),
				R(c) ? (W(), G("div", ym, P(R(c)), 1)) : Y("", !0),
				R(s) ? (W(), G("p", bm, "Loading workspaces…")) : Y("", !0),
				m.value.id === "wakewords" ? (W(), ia(Hs, { key: 3 })) : m.value.id === "classify" ? (W(), ia(dl, { key: 4 })) : m.value.id === "samples" ? (W(), ia(ou, { key: 5 })) : m.value.id === "kiosks" ? (W(), ia(Ju, { key: 6 })) : m.value.id === "automate" ? (W(), ia(kd, { key: 7 })) : m.value.id === "deploy" ? (W(), ia(df, { key: 8 })) : m.value.id === "negative-datasets" ? (W(), ia(kf, { key: 9 })) : m.value.id === "artificial" ? (W(), ia(ap, { key: 10 })) : m.value.id === "train" ? (W(), ia(Dp, { key: 11 })) : Y("", !0)
			], 512)])
		], 8, em), q($p)], 2));
	}
}), Sm = /* @__PURE__ */ V({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (W(), ia(xm));
	}
}), Cm = document.getElementById("trainer-app");
if (!Cm) throw Error("Missing #trainer-app mount point");
Yo(Sm).mount(Cm);
//#endregion

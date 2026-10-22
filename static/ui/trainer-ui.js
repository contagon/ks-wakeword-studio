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
}, M, ae = () => M ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function oe(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? le(r) : oe(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var se = /;(?![^(]*\))/g, ce = /:([^]+)/, N = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function le(e) {
	let t = {};
	return e.replace(N, (e) => e.startsWith("/*") ? "" : e).split(se).forEach((e) => {
		if (e) {
			let n = e.split(ce);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function P(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = P(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var ue = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function de(e) {
	return !!e || e === "";
}
function fe(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = ge(e[i], t[i], n);
	return r;
}
function pe(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && ge(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function me(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? pe(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !ge(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function he(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function ge(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? he(e, t, n, fe) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : he(e, t, n, me) : String(e) === String(t))));
}
function _e(e, t) {
	return e.findIndex((e) => ge(e, t));
}
var ve = (e) => !!(e && e.__v_isRef === !0), F = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? ve(e) ? F(e.value) : JSON.stringify(e, ye, 2) : String(e), ye = (e, t) => ve(t) ? ye(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[be(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => be(e)) } : _(t) ? be(t) : v(t) && !d(t) && !C(t) ? String(t) : t, be = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, xe, Se = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && xe && (xe.active ? (this.parent = xe, this.index = (xe.scopes || (xe.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = xe;
			try {
				return xe = this, e();
			} finally {
				xe = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = xe, xe = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (xe === this) xe = this.prevScope;
			else {
				let e = xe;
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
function Ce() {
	return xe;
}
function we(e, t = !1) {
	xe && xe.cleanups.push(e);
}
var Te, Ee = /* @__PURE__ */ new WeakSet(), De = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, xe && (xe.active ? xe.effects.push(this) : this.flags &= -2);
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
		let e = Te, t = Be;
		Te = this, Be = !0;
		try {
			return this.fn();
		} finally {
			Fe(this), Te = e, Be = t, this.flags &= -3;
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
	let t = e.dep, n = Te, r = Be;
	Te = e, Be = !0;
	try {
		Pe(e);
		let n = e.fn(e._value);
		(t.version === 0 || A(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		Te = n, Be = r, Fe(e), e.flags &= -3;
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
		let e = Te;
		Te = void 0;
		try {
			t();
		} finally {
			Te = e;
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
		if (!Te || !Be || Te === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== Te) t = this.activeLink = new Ke(Te, this), Te.deps ? (t.prevDep = Te.depsTail, Te.depsTail.nextDep = t, Te.depsTail = t) : Te.deps = Te.depsTail = t, Je(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = Te.depsTail, t.nextDep = void 0, Te.depsTail.nextDep = t, Te.depsTail = t, Te.deps === t && (Te.deps = e);
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
	if (Be && Te) {
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
		if (this.flags |= 16, !(this.flags & 8) && Te !== this) return je(this, !0), !0;
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
	let x = Ce(), S = () => {
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
		r._d && sa(-1);
		let i = Nn(t), a = ra.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = ra.length; e > a; e--) aa();
			Nn(i), r._d && sa(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function z(e, n) {
	if (jn === null) return e;
	let r = Va(jn), i = e.dirs ||= [];
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
	if (Da) {
		let n = Da.provides, r = Da.parent && Da.parent.provides;
		r === n && (n = Da.provides = Object.create(r)), n[e] = t;
	}
}
function Ln(e, t, n = !1) {
	let r = Oa();
	if (r || ci) {
		let i = ci ? ci._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
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
	if (Pa) {
		if (c === "sync") {
			let e = zn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Da;
	u.call = (e, t, n) => un(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Vi(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Sn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = sn(e, n, u);
	return Pa && (f ? f.push(h) : d && h()), h;
}
function Hn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Un(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = ja(this), s = Vn(i, a.bind(r), n);
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
			Wn.set(e, t), Vi(t, a);
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
			if (o === "svg" || Yn(p) ? o = "svg" : (o === "mathml" || Xn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), qi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : $n(t, n, r, l, 1);
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
		for (let n of e) if (n.type !== ta) {
			t = n;
			break;
		}
	}
	return t;
}
function or(e) {
	if (!gr(e)) return Kn(e.type) && e.children ? ar(e.children) : e;
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
		let n = gi(e.children, !1);
		n && sr(n, t);
	}
}
function cr(e) {
	if (e.component) return cr(e.component.subTree);
	if (e.type === U) {
		let t = d(e.children) && gi(e.children, !1);
		return t ? cr(t) : void 0;
	}
	if (e.type !== ta) return e;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function lr() {
	let e = Oa();
	return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : "";
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
	let s = a.shapeFlag & 4 ? Va(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ I(v), b = v === t ? i : (e) => !dr(_, e) && u(y, e), x = (e, t) => !(t && dr(_, t));
	if (m != null && m !== p) {
		if (mr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
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
					i(), fr.delete(e);
				};
				t.id = -1, fr.set(e, t), Vi(t, r);
			} else mr(e), i();
		}
	}
}
function mr(e) {
	let t = fr.get(e);
	t && (t.flags |= 8, fr.delete(e));
}
ae().requestIdleCallback, ae().cancelIdleCallback;
var hr = (e) => !!e.type.__asyncLoader, gr = (e) => e.type.__isKeepAlive;
function _r(e, t) {
	yr(e, "a", t);
}
function vr(e, t) {
	yr(e, "da", t);
}
function yr(e, t, n = Da) {
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
function xr(e, t, n = Da, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			He();
			let i = ja(n), a = un(t, n, e, r);
			return i(), Ue(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var Sr = (e) => (t, n = Da) => {
	(!Pa || e === "sp") && xr(e, (...e) => t(...e), n);
}, Cr = Sr("bm"), wr = Sr("m"), Tr = Sr("bu"), Er = Sr("u"), Dr = Sr("bum"), Or = Sr("um"), kr = Sr("sp"), Ar = Sr("rtg"), jr = Sr("rtc");
function Mr(e, t = Da) {
	xr("ec", e, t);
}
var Nr = "components", Pr = /* @__PURE__ */ Symbol.for("v-ndc");
function Fr(e) {
	return g(e) ? Ir(Nr, e, !1) || e : e || Pr;
}
function Ir(e, t, n = !0, r = !1) {
	let i = jn || Da;
	if (i) {
		let n = i.type;
		if (e === Nr) {
			let e = Ha(n, !1);
			if (e && (e === t || e === O(t) || e === te(O(t)))) return n;
		}
		let a = Lr(i[e] || n[e], t) || Lr(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Lr(e, t) {
	return e && (e[t] || e[O(t)] || e[te(O(t))]);
}
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
var Rr = (e) => e ? Na(e) ? Va(e) : Rr(e.parent) : null, zr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Rr(e.parent),
	$root: (e) => Rr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Yr(e),
	$forceUpdate: (e) => e.f ||= () => {
		Sn(e.update);
	},
	$nextTick: (e) => e.n ||= bn.bind(e.proxy),
	$watch: (e) => Hn.bind(e)
}), Br = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Vr = {
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
			else if (Br(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Wr && (s[n] = 0);
		}
		let d = zr[n], f, p;
		if (d) return n === "$attrs" && $e(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Br(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Br(n, c) || u(o, c) || u(i, c) || u(zr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Hr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Ur(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, Hr(e), Hr(t));
}
var Wr = !0;
function Gr(e) {
	let t = Yr(e), n = e.proxy, i = e.ctx;
	Wr = !1, t.beforeCreate && qr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: ee, expose: k, inheritAttrs: te, components: ne, directives: A, filters: re } = t;
	if (u && Kr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Ft(t));
	}
	if (Wr = !0, o) for (let e in o) {
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
	if (c) for (let e in c) Jr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			In(t, e[t]);
		});
	}
	f && qr(f, e, "c");
	function j(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (j(Cr, p), j(wr, m), j(Tr, g), j(Er, _), j(_r, y), j(vr, b), j(Mr, O), j(jr, E), j(Ar, D), j(Dr, S), j(Or, w), j(kr, ee), d(k)) {
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
	T && e.render === r && (e.render = T), te != null && (e.inheritAttrs = te), ne && (e.components = ne), A && (e.directives = A), ee && ur(e);
}
function Kr(e, t, n = r) {
	d(e) && (e = ei(e));
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
function qr(e, t, n) {
	un(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Jr(e, t, n, r) {
	let i = r.includes(".") ? Un(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && B(i, n);
	} else if (h(e)) B(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Jr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && B(i, r, e);
		}
	}
}
function Yr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Xr(c, e, o, !0)), Xr(c, t, o)), v(t) && a.set(t, c), c;
}
function Xr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Xr(e, a, n, !0), i && i.forEach((t) => Xr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Zr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Zr = {
	data: Qr,
	props: ri,
	emits: ri,
	methods: ni,
	computed: ni,
	beforeCreate: ti,
	created: ti,
	beforeMount: ti,
	mounted: ti,
	beforeUpdate: ti,
	updated: ti,
	beforeDestroy: ti,
	beforeUnmount: ti,
	destroyed: ti,
	unmounted: ti,
	activated: ti,
	deactivated: ti,
	errorCaptured: ti,
	serverPrefetch: ti,
	components: ni,
	directives: ni,
	watch: ii,
	provide: Qr,
	inject: $r
};
function Qr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function $r(e, t) {
	return ni(ei(e), ei(t));
}
function ei(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function ti(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function ni(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ri(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Hr(e), Hr(t ?? {})) : t;
}
function ii(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = ti(e[r], t[r]);
	return n;
}
function ai() {
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
var oi = 0;
function si(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = ai(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: oi++,
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
					let u = l._ceVNode || q(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Va(u.component);
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
				let t = ci;
				ci = l;
				try {
					return e();
				} finally {
					ci = t;
				}
			}
		};
		return l;
	};
}
var ci = null;
function li(e, n, r = t) {
	let i = Oa(), a = O(n), o = k(n), s = ui(e, a), c = $t((s, c) => {
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
var ui = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function di(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ui(i, n.slice(7));
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
var fi = /* @__PURE__ */ new WeakMap();
function pi(e, t, n = !1) {
	let r = n ? fi : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = pi(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function mi(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function hi(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Nn(e), v, y;
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
			}) : e(f, null)), y = t.props ? c : _i(c);
		}
	} catch (t) {
		ra.length = 0, dn(t, e, 1), v = q(ta);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = vi(y, a)), b = ga(b, y, !1, !0));
	}
	return n.dirs && (b = ga(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && sr(Kn(b.type) && or(b) || b, n.transition), v = b, Nn(_), v;
}
function gi(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (ua(r)) {
			if (r.type !== ta || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var _i = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, vi = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function yi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? bi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (xi(o, r, n) && !mi(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || bi(r, o, l) : !!o;
	return !1;
}
function bi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || xi(t, e, a) && !mi(n, a)) return !0;
	}
	return !1;
}
function xi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !ge(r, i) : r !== i;
}
function Si({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Ci = {}, wi = () => Object.create(Ci), Ti = (e) => Object.getPrototypeOf(e) === Ci;
function Ei(e, t, n, r = !1) {
	let i = {}, a = wi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Oi(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ It(i) : e.type.props ? i : a, e.attrs = a;
}
function Di(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ I(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (mi(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = O(o);
						i[t] = ki(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		Oi(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = k(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = ki(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && et(e.attrs, "set", "");
}
function Oi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : mi(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ I(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = ki(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function ki(e, t, n, r, i, a) {
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
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var Ai = /* @__PURE__ */ new WeakMap();
function ji(e, r, i = !1) {
	let a = i ? Ai : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = ji(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		Mi(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (Mi(t)) {
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
function Mi(e) {
	return e[0] !== "$" && !T(e);
}
var Ni = (e) => e === "_" || e === "_ctx" || e === "$stable", Pi = (e) => d(e) ? e.map(va) : [va(e)], Fi = (e, t, n) => {
	if (t._n) return t;
	let r = Pn((...e) => Pi(t(...e)), n);
	return r._c = !1, r;
}, Ii = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ni(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Fi(n, i, r);
		else if (i != null) {
			let e = Pi(i);
			t[n] = () => e;
		}
	}
}, Li = (e, t) => {
	let n = Pi(t);
	e.slots.default = () => n;
}, Ri = (e, t, n) => {
	for (let r in t) (n || !Ni(r)) && (e[r] = t[r]);
}, zi = (e, t, n) => {
	let r = e.slots = wi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Ri(r, t, n), n && j(r, "_", e, !0)) : Ii(t, r);
	} else t && Li(e, t);
}, Bi = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Ri(a, n, r) : (o = !n.$stable, Ii(n, a)), s = n;
	} else n && (Li(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ni(e) && s[e] == null && delete a[e];
}, Vi = $i;
function Hi(e) {
	return Ui(e);
}
function Ui(e, i) {
	let a = ae();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !da(e, t) && (i = me(e), P(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case ea:
				y(e, t, r, i);
				break;
			case ta:
				b(e, t, r, i);
				break;
			case na:
				e ?? x(t, r, i, s);
				break;
			case U:
				ne(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? A(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ge);
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
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, Wi(e, a), s, u), _ && Fn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && Sa(f, r, e);
		}
		_ && Fn(e, null, r, "beforeMount");
		let v = Ki(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Vi(() => {
			try {
				f && Sa(f, r, e), v && g.enter(d), _ && Fn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Qi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? ya(e[l]) : va(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, ee = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Gi(r, !1), (g = h.onVnodeBeforeUpdate) && Sa(g, r, n, e), f && Fn(n, e, r, "beforeUpdate"), r && Gi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, Wi(n, a), o) : s || se(e, n, l, null, r, i, Wi(n, a), o, !1), u > 0) {
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
		((g = h.onVnodeUpdated) || f) && Vi(() => {
			g && Sa(g, r, n, e), f && Fn(n, e, r, "updated");
		}, i);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Zi(c), d = u && (c.type === U || !da(c, l) || c.shapeFlag & 198) ? m(u) : n;
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
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && qi(e, t, !0)) : se(e, t, n, f, i, a, s, c, l);
	}, A = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : ie(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = Ea(e, r, i);
		if (gr(e) && (s.ctx.renderer = ge), Fa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, M, o, a), !e.el) {
				let r = s.subTree = q(ta);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else M(s, e, t, n, i, a, o);
	}, ie = (e, t, n) => {
		let r = t.component = e.component;
		if (yi(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, oe(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, M = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Yi(e);
					if (n) {
						t && (t.el = c.el, oe(e, t, o)), n.asyncDep.then(() => {
							Vi(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Gi(e, !1), t ? (t.el = c.el, oe(e, t, o)) : t = c, n && re(n), (d = t.props && t.props.onVnodeBeforeUpdate) && Sa(d, s, t, c), Gi(e, !0);
				let f = hi(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), me(p), e, i, a), t.el = f.el, u === null && Si(e, f.el), r && Vi(r, i), (d = t.props && t.props.onVnodeUpdated) && Vi(() => Sa(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = hr(t);
				if (Gi(e, !1), l && re(l), !m && (o = c && c.onVnodeBeforeMount) && Sa(o, d, t), Gi(e, !0), s && ve) {
					let t = () => {
						e.subTree = hi(e), ve(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = hi(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Vi(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Vi(() => Sa(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && hr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Vi(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new De(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Sn(u), Gi(e, !0), l();
	}, oe = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Di(e, t.props, r, n), Bi(e, t.children, n), He(), Tn(e), Ue();
	}, se = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				N(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				ce(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && pe(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? N(l, d, n, r, i, a, o, s, c) : pe(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, ce = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? ya(t[p]) : va(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? pe(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, N = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? ya(t[u]) : va(t[u]);
			if (da(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? ya(t[p]) : va(t[p]);
			if (da(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? ya(t[u]) : va(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) P(e[u], a, o, !0), u++;
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
					P(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && da(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? P(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Ji(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Zi(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? le(n, r, p, 2) : _--);
			}
		}
	}, le = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) le(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, ge);
		else if (c === U) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) le(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === na) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[ir] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Vi(() => l.enter(a), i));
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
	}, P = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (He(), pr(s, null, n, e, !0), Ue()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !hr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Sa(_, t, e), u & 6) fe(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Fn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ge, r) : l && !l.hasOnce && (a !== U || d > 0 && d & 64) ? pe(l, t, n, !1, !0) : (a === U && d & 384 || !i && u & 16) && pe(c, t, n), r && ue(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Vi(() => {
			_ && Sa(_, t, e), h && Fn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, ue = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === U;
		if (a && !i) {
			de(n, r);
			return;
		}
		if (t === na) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? cr(e) : e, c = () => {
			a ? m(n) && de(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, de = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, fe = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Xi(c), Xi(l), r && re(r), i.stop(), a ? (a.flags |= 8, P(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, P(o, e, t, n)), s && Vi(s, t), Vi(() => {
			e.isUnmounted = !0;
		}, t);
	}, pe = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) P(e[o], t, n, r, i);
	}, me = (e) => {
		if (e.shapeFlag & 6) return me(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Gn];
		return n ? h(n) : t;
	}, he = (e, t, n) => {
		On(() => {
			e == null ? t._vnode && P(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : Ta());
	}, ge = {
		p: v,
		um: P,
		m: le,
		r: ue,
		mt: j,
		mc: O,
		pc: se,
		pbc: k,
		n: me,
		o: e
	}, _e, ve;
	return i && ([_e, ve] = i(ge)), {
		render: he,
		hydrate: _e,
		createApp: si(he, _e)
	};
}
function Wi({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Gi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ki(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function qi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = ya(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && qi(t, a)), a.type === ea && (a.patchFlag === -1 && (a = i[e] = ya(a)), a.el = t.el), a.type === ta && !a.el && (a.el = t.el);
	}
}
function Ji(e) {
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
function Yi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Yi(t);
}
function Xi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Zi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Zi(t.subTree) : null;
}
var Qi = (e) => e.__isSuspense;
function $i(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : wn(e);
}
var U = /* @__PURE__ */ Symbol.for("v-fgt"), ea = /* @__PURE__ */ Symbol.for("v-txt"), ta = /* @__PURE__ */ Symbol.for("v-cmt"), na = /* @__PURE__ */ Symbol.for("v-stc"), ra = [], ia = null;
function W(e = !1) {
	ra.push(ia = e ? null : []);
}
function aa() {
	ra.pop(), ia = ra[ra.length - 1] || null;
}
var oa = 1;
function sa(e, t = !1) {
	oa += e, e < 0 && ia && t && (ia.hasOnce = !0);
}
function ca(e) {
	return e.dynamicChildren = oa > 0 ? ia || n : null, aa(), oa > 0 && ia && ia.push(e), e;
}
function G(e, t, n, r, i, a) {
	return ca(K(e, t, n, r, i, a, !0));
}
function la(e, t, n, r, i) {
	return ca(q(e, t, n, r, i, !0));
}
function ua(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function da(e, t) {
	return e.type === t.type && e.key === t.key;
}
var fa = ({ key: e }) => e ?? null, pa = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Kt(e) || h(e) ? {
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
		key: t && fa(t),
		ref: t && pa(t),
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
	return s ? (ba(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), oa > 0 && !o && ia && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && ia.push(c), c;
}
var q = ma;
function ma(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Pr) && (e = ta), ua(e)) {
		let r = ga(e, t, !0);
		return n && ba(r, n), oa > 0 && !a && ia && (r.shapeFlag & 6 ? ia[ia.indexOf(e)] = r : ia.push(r)), r.patchFlag = -2, r;
	}
	if (Ua(e) && (e = e.__vccOpts), t) {
		t = ha(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = P(e)), v(n) && (/* @__PURE__ */ Ht(n) && !d(n) && (n = s({}, n)), t.style = oe(n));
	}
	let o = g(e) ? 1 : Qi(e) ? 128 : Kn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return K(e, t, n, r, i, o, a, !0);
}
function ha(e) {
	return e ? /* @__PURE__ */ Ht(e) || Ti(e) ? s({}, e) : e : null;
}
function ga(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? xa(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && fa(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(pa(t)) : [a, pa(t)] : pa(t) : a,
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
		ssContent: e.ssContent && ga(e.ssContent),
		ssFallback: e.ssFallback && ga(e.ssFallback),
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
	return q(ea, null, e, t);
}
function _a(e, t) {
	let n = q(na, null, e);
	return n.staticCount = t, n;
}
function Y(e = "", t = !1) {
	return t ? (W(), la(ta, null, e)) : q(ta, null, e);
}
function va(e) {
	return e == null || typeof e == "boolean" ? q(ta) : d(e) ? q(U, null, e.slice()) : ua(e) ? ya(e) : q(ea, null, String(e));
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
			!r && !Ti(t) ? t._ctx = jn : r === 3 && jn && (jn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ba(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: jn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [J(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function xa(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = P([t.class, r.class]));
		else if (e === "style") t.style = oe([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Sa(e, t, n, r = null) {
	un(e, t, 7, [n, r]);
}
var Ca = ai(), wa = 0;
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
		scope: new Se(!0),
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
		propsOptions: ji(i, a),
		emitsOptions: pi(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = di.bind(null, o), e.ce && e.ce(o), o;
}
var Da = null, Oa = () => Da || jn, ka, Aa;
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
	Ei(e, r, a, t), zi(e, i, n || t);
	let o = a ? Ia(e, t) : void 0;
	return t && Aa(!1), o;
}
function Ia(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Vr);
	let { setup: r } = n;
	if (r) {
		He();
		let n = e.setupContext = r.length > 1 ? Ba(e) : null, i = ja(e), a = ln(r, e, 0, [e.props, n]), o = y(a);
		if (Ue(), i(), (o || e.sp) && !hr(e) && ur(e), o) {
			if (a.then(Ma, Ma), t) return a.then((n) => {
				Aa(!0);
				try {
					La(e, n, t);
				} finally {
					Aa(!1);
				}
			}).catch((t) => {
				dn(t, e, 0);
			});
			e.asyncDep = a;
		} else La(e, a, t);
	} else Ra(e, t);
}
function La(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Zt(t)), Ra(e, n);
}
function Ra(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = ja(e);
		He();
		try {
			Gr(e);
		} finally {
			Ue(), t();
		}
	}
}
var za = { get(e, t) {
	return $e(e, "get", ""), e[t];
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
	return e.exposed ? e.exposeProxy ||= new Proxy(Zt(Ut(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in zr) return zr[n](e);
		},
		has(e, t) {
			return t in e || t in zr;
		}
	}) : e.proxy;
}
function Ha(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ua(e) {
	return h(e) && "__vccOpts" in e;
}
var X = (e, t) => /* @__PURE__ */ tn(e, t, Pa), Wa = "3.5.44", Ga = void 0, Ka = typeof window < "u" && window.trustedTypes;
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
		co.test(n) ? e.setProperty(k(r), n.replace(co, ""), "important") : e[r] = n;
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
	r = te(r);
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
function go(e, t, n, r, i, a = ue(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ho, t.slice(6, t.length)) : e.setAttributeNS(ho, t, n) : n == null || a && !de(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
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
		r === "boolean" ? n = de(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
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
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
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
				e && un(e, t, 5, a);
			}
		} else un(r, t, 5, [e]);
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
	return d(t) ? (e) => re(t, e) : t;
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
	return t && (e = e.trim()), n && (e = ie(e)), e;
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
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ie(e.value) : e.value, c = t ?? "";
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
				let e = _e(t, n), a = e !== -1;
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
	if (d(t)) i = _e(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ge(t, Ko(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Ho = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, vo(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ie(Go(e)) : Go(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[Io](i);
			} finally {
				bn(() => {
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
	if (!n || d(e)) return ge(e, t);
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
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : _e(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (ge(Go(a), t)) {
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
		let r = k(n.key);
		if (t.some((e) => e === r || Xo[e] === r)) return e(n);
	}));
}, Qo = /* @__PURE__ */ s({ patchProp: Ao }, Qa), $o;
function es() {
	return $o ||= Hi(Qo);
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
	let e = /* @__PURE__ */ L("wakewords"), t = /* @__PURE__ */ L(""), n = /* @__PURE__ */ L("review");
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
	let o = B(t, a, { flush: "sync" });
	function s(t) {
		e.value = t, location.hash !== i(t) && history.pushState(null, "", i(t));
	}
	function c(e) {
		n.value = e, s("classify");
	}
	return window.addEventListener("hashchange", r), window.addEventListener("popstate", r), we(() => {
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
function us(e) {
	return e.status !== "failed" && e.status !== "interrupted" ? "" : ls("error_code" in e.result ? e.result.error_code : void 0) || ls("handler_failed");
}
//#endregion
//#region src/studio/api.ts
var ds = "/api/studio", fs = encodeURIComponent;
function ps(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var ms = class extends Error {
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
async function hs(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${ds}${e}`, {
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
		throw new ms(i.status, e);
	}
	if (i.status !== 204) return i.json();
}
function gs(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function _s(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => gs(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var Z = (e) => `/wakewords/${fs(e)}`, vs = (e, t) => `${Z(e)}/samples/${fs(t)}`, Q = (e, t, n) => hs(e + ps(t), "GET", void 0, n), ys = (e, t, n) => hs(e, "POST", t, n), bs = (e, t, n) => hs(e, "PUT", t, n), $ = {
	augmentationDatasets: (e) => Q("/augmentation/datasets", void 0, e),
	wakewordAugmentationDatasets: (e, t) => Q(`${Z(e)}/augmentation/datasets`, void 0, t),
	selectAugmentationDatasets: (e, t, n) => bs(`${Z(e)}/augmentation/datasets`, { dataset_ids: t }, n),
	downloadAugmentation: (e, t) => ys(`/augmentation/datasets/${fs(e)}/download`, void 0, t),
	capabilities: (e) => Q("/capabilities", void 0, e),
	testingManifest: (e, t, n, r) => Q(`${Z(e)}/models/${fs(t)}/archive/${fs(n + ".json")}`, void 0, r),
	testingModelUrl: (e, t, n) => `${ds}${Z(e)}/models/${fs(t)}/archive/${fs(n + ".tflite")}`,
	migration: (e) => Q("/migration", void 0, e),
	importLegacy: (e, t) => ys("/migration/import", e, t),
	wakewords: (e, t) => Q("/wakewords", e, t),
	wakeword: (e, t) => Q(Z(e), void 0, t),
	createWakeword: (e, t) => ys("/wakewords", e, t),
	updateWakeword: (e, t, n) => hs(Z(e), "PATCH", t, n),
	deleteWakeword: (e, t) => hs(Z(e), "DELETE", void 0, t),
	samples: (e, t, n) => Q(`${Z(e)}/samples`, t, n),
	queue: (e, t, n) => Q(`${Z(e)}/queue`, t, n),
	sample: (e, t, n) => Q(vs(e, t), void 0, n),
	unmapped: (e, t) => Q("/recordings/unmapped", e, t),
	assign: (e, t, n) => ys(`/recordings/${fs(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), ys(`${Z(e)}/samples/import`, i, r);
	},
	previewCapture: (e, t, n) => {
		let r = new FormData();
		return r.set("audio", t), ys(`${Z(e)}/samples/capture/preview`, r, n);
	},
	saveCapture: (e, t, n, r, i) => {
		let a = new FormData();
		return a.set("audio", t), a.set("label", n), a.set("start_s", String(r.start_s)), a.set("end_s", String(r.end_s)), a.set("trim_method", r.trim_method), ys(`${Z(e)}/samples/capture`, a, i);
	},
	label: (e, t, n, r, i) => ys(`${vs(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => ys(`${vs(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => ys(`${vs(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => hs(`${vs(e, t)}${ps({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${ds}${vs(e, t)}/audio${ps({ original: n })}`,
	devices: (e) => Q("/devices", void 0, e),
	addDevice: (e, t, n, r) => ys("/devices", {
		url: e,
		password: t,
		role: n
	}, r),
	updateDevice: (e, t, n) => hs(`/devices/${fs(e)}`, "PATCH", { url: t }, n),
	deleteDevice: (e, t) => hs(`/devices/${fs(e)}`, "DELETE", void 0, t),
	refreshDevices: (e, t) => ys(`/devices/${fs(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => ys(`/devices/${fs(e)}/credentials`, { password: t }, n),
	sourceMappings: (e, t) => Q(`/devices/${fs(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => bs(`/devices/${fs(e)}/source-mappings`, t, n),
	scrape: (e, t) => ys("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Q("/scrape/runs", e, t),
	schedules: (e) => Q("/schedules", void 0, e),
	automation: (e, t) => Q(`${Z(e)}/automation`, void 0, t),
	saveAutomation: (e, t, n) => bs(`${Z(e)}/automation`, t, n),
	collect: (e, t, n) => ys(`${Z(e)}/collection/jobs`, { device_ids: t }, n),
	saveSchedule: (e, t, n) => bs(`/schedules/${fs(e)}`, t, n),
	jobs: (e, t) => Q("/jobs", e, t),
	enqueueScrape: (e, t) => ys("/jobs", e, t),
	health: (e) => Q("/jobs/health", void 0, e),
	job: (e, t) => Q(`/jobs/${fs(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Q(`/jobs/${fs(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => ys(`/jobs/${fs(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Q(`${Z(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => bs(`${Z(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => ys(`/datasets/${fs(e)}/download`, void 0, t),
	generationCatalog: (e) => Q("/generation/catalog", void 0, e),
	generationDefaults: (e) => Q("/generation/defaults", void 0, e),
	generationRecipe: (e, t) => Q(`${Z(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => bs(`${Z(e)}/generation/recipe`, t, n),
	generate: (e, t, n) => ys(`${Z(e)}/generation/jobs`, t, n),
	submitGeneration: (e, t, n) => ys(`${Z(e)}/generation/submissions`, t, n),
	generationSources: (e, t, n) => Q(`${Z(e)}/generation/sources`, t, n),
	preview: (e, t, n) => ys(`${Z(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${ds}${Z(e)}/generation/previews/${fs(t)}/audio`,
	batches: (e, t, n) => Q(`${Z(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Q(`${Z(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Q(`${Z(e)}/generation/batches/${fs(t)}`, void 0, n),
	selectBatches: (e, t, n) => bs(`${Z(e)}/generation/batches`, { batch_ids: t }, n),
	deleteBatch: (e, t, n) => hs(`${Z(e)}/generation/batches/${fs(t)}`, "DELETE", void 0, n),
	trainingSettings: (e, t) => Q(`${Z(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => bs(`${Z(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Q(`${Z(e)}/training/counts`, void 0, t),
	train: (e, t) => ys(`${Z(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Q(`${Z(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Q(`${Z(e)}/training/runs/${fs(t)}`, void 0, n),
	models: (e, t, n) => Q(`${Z(e)}/models`, t, n),
	model: (e, t, n) => Q(`${Z(e)}/models/${fs(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${ds}${Z(e)}/models/${fs(t)}/archive${n === void 0 ? "" : `/${fs(n)}`}`,
	deploymentCapabilities: (e) => Q("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Q(`${Z(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Q(`${Z(e)}/deployment/history`, t, n),
	publish: (e, t, n) => ys(`${Z(e)}/deployment/publish`, { version_id: t }, n),
	rollback: (e, t, n) => ys(`${Z(e)}/deployment/rollback`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function xs(e) {
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
			e instanceof ms && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
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
	}, { flush: "sync" }), we(() => {
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
var Ss = Symbol("studio-workspace");
function Cs() {
	let e = Ln(Ss);
	if (!e) throw Error("useWorkspace requires StudioShell");
	return e;
}
//#endregion
//#region src/studio/pages/WakewordsPage.vue?vue&type=script&setup=true&lang.ts
var ws = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Ts = ["disabled"], Es = {
	key: 0,
	class: "studio-card"
}, Ds = { class: "grid gap-3 sm:grid-cols-2 mb-4" }, Os = ["aria-pressed", "onClick"], ks = { class: "flex justify-between items-center gap-3" }, As = { class: "studio-muted text-xs ml-auto" }, js = {
	key: 1,
	role: "status"
}, Ms = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, Ns = {
	key: 3,
	class: "studio-card mb-4"
}, Ps = { class: "flex items-start justify-between gap-3" }, Fs = { class: "min-w-0 break-words" }, Is = ["disabled"], Ls = { class: "grid gap-3 sm:grid-cols-3 text-sm" }, Rs = { class: "text-xs" }, zs = {
	key: 0,
	class: "text-xs"
}, Bs = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, Vs = {
	key: 5,
	role: "status",
	class: "studio-note"
}, Hs = { class: "grid gap-4" }, Us = ["disabled"], Ws = { id: "delete-heading" }, Gs = { class: "flex flex-wrap gap-3 mt-3" }, Ks = ["disabled"], qs = ["disabled"], Js = /* @__PURE__ */ V({
	__name: "WakewordsPage",
	setup(e) {
		let t = Cs(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ Ft({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(!1), h;
		B(r, () => {
			h?.abort(), d.value = !1, m.value = !1, f.value = "", p.value = "";
		}), we(() => {
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
				n.signal.aborted || (f.value = e instanceof ms && e.status === 409 ? "Cancel queued or active jobs before deleting this workspace, then try again." : e instanceof Error ? e.message : "Unable to delete workspace.");
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
		return (e, h) => (W(), G("section", null, [
			K("div", ws, [h[8] ||= K("div", null, [K("h1", null, "Wakewords"), K("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), K("button", {
				"data-action": "refresh",
				disabled: R(c),
				onClick: h[0] ||= (e) => R(t).load()
			}, "Refresh workspaces", 8, Ts)]),
			!R(c) && !R(l) && !R(n).length ? (W(), G("p", Es, "No wakewords yet. Create your first workspace below.")) : Y("", !0),
			K("div", Ds, [(W(!0), G(U, null, H(R(n), (e) => (W(), G("button", {
				key: e.id,
				class: P(["studio-card studio-word-card", { "studio-selected": e.id === R(r) }]),
				"aria-pressed": e.id === R(r),
				onClick: (n) => R(t).select(e.id)
			}, [K("span", ks, [K("strong", null, F(e.phrase), 1), K("span", As, F(e.language), 1)])], 10, Os))), 128))]),
			R(o) ? (W(), G("p", js, "Loading selected workspace…")) : Y("", !0),
			R(s) ? (W(), G("div", Ms, [J(F(R(s)) + " ", 1), K("button", { onClick: h[1] ||= (e) => R(t).refreshSelected() }, "Retry workspace")])) : Y("", !0),
			R(a) && R(i) ? (W(), G("div", Ns, [K("div", Ps, [K("h2", Fs, F(R(i).phrase) + " · Overview", 1), K("button", {
				class: "shrink-0",
				"data-action": "delete-workspace",
				type: "button",
				disabled: d.value,
				onClick: h[2] ||= (e) => m.value = !0
			}, "Delete workspace", 8, Is)]), K("dl", Ls, [
				K("div", null, [h[9] ||= K("dt", { class: "studio-muted" }, "Pending classification", -1), K("dd", null, F(R(a).pending) + " pending", 1)]),
				K("div", null, [
					h[10] ||= K("dt", { class: "studio-muted" }, "Archived models", -1),
					K("dd", null, F(R(a).modelCount) + " versions", 1),
					K("dd", Rs, F(R(a).latestModel ? `Latest: ${R(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				K("div", null, [
					h[11] ||= K("dt", { class: "studio-muted" }, "Autotrain", -1),
					K("dd", null, F(R(a).schedule?.enabled ? `${R(a).schedule.cron} · ${R(a).schedule.timezone}` : "Not scheduled"), 1),
					R(a).schedule?.enabled ? (W(), G("dd", zs, "Next: " + F(R(a).schedule.next_run_at), 1)) : Y("", !0)
				])
			])])) : Y("", !0),
			f.value ? (W(), G("p", Bs, F(f.value), 1)) : Y("", !0),
			p.value ? (W(), G("p", Vs, F(p.value), 1)) : Y("", !0),
			K("div", Hs, [K("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: h[5] ||= Yo((e) => _(), ["prevent"])
			}, [
				h[14] ||= K("h2", null, "New wakeword", -1),
				K("label", null, [h[12] ||= J("Display phrase", -1), z(K("input", {
					"onUpdate:modelValue": h[3] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[zo, u.phrase]])]),
				K("label", null, [h[13] ||= J("Language", -1), z(K("input", {
					"onUpdate:modelValue": h[4] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[zo, u.language]])]),
				K("button", {
					class: "studio-primary justify-self-start",
					disabled: d.value,
					type: "submit"
				}, "Create wakeword", 8, Us)
			], 32)]),
			m.value && R(i) ? (W(), G("section", {
				key: 6,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: h[7] ||= Zo((e) => !d.value && (m.value = !1), ["esc"])
			}, [
				K("h2", Ws, "Delete " + F(R(i).phrase) + " permanently?", 1),
				h[15] ||= K("p", { id: "delete-description" }, "This permanently deletes this workspace’s recordings, generated datasets, settings, schedules, jobs, and local model archives. This cannot be undone. Cancel queued or active jobs first.", -1),
				h[16] ||= K("p", { class: "studio-muted" }, "Deployed kiosk files and shared datasets are not deleted.", -1),
				K("div", Gs, [K("button", {
					"data-action": "cancel-delete",
					type: "button",
					disabled: d.value,
					onClick: h[6] ||= (e) => m.value = !1
				}, "Cancel", 8, Ks), K("button", {
					"data-action": "confirm-delete",
					type: "button",
					disabled: d.value,
					onClick: g
				}, F(d.value ? "Deleting…" : "Permanently delete workspace"), 9, qs)])
			], 32)) : Y("", !0)
		]));
	}
}), Ys = ["aria-busy"], Xs = ["data-ready"], Zs = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Qs = ["disabled", "aria-label"], $s = ["disabled"], ec = /* @__PURE__ */ V({
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
		}, { immediate: !0 }), Dr(() => {
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
			}, null, 8, Xs),
			K("p", Zs, F(u.value), 1),
			K("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, F(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Qs),
			K("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: k
			}, "Replay", 8, $s)
		], 8, Ys));
	}
}), tc = /* @__PURE__ */ L([]), nc = /* @__PURE__ */ L(!1), rc = /* @__PURE__ */ L(""), ic = !1, ac;
function oc(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function sc() {
	function e(e) {
		let t = tc.value.find((t) => t.id === e);
		return t?.name?.trim() || t?.url || "Unknown kiosk";
	}
	async function t(e = !1) {
		if (ic && !e) return;
		ac?.abort();
		let t = new AbortController();
		ac = t, nc.value = !0, rc.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && ac === t && (tc.value = e, ic = !0);
		} catch (e) {
			!t.signal.aborted && ac === t && (rc.value = oc(e));
		} finally {
			ac === t && (nc.value = !1);
		}
	}
	function n(e) {
		tc.value = tc.value.findIndex((t) => t.id === e.id) < 0 ? [...tc.value, e] : tc.value.map((t) => t.id === e.id ? e : t), ic = !0;
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
		ac?.abort();
	}
	return {
		devices: /* @__PURE__ */ Lt(tc),
		loading: /* @__PURE__ */ Lt(nc),
		error: /* @__PURE__ */ Lt(rc),
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
var cc = {
	key: 0,
	class: "studio-pagination",
	"aria-live": "polite"
}, lc = { class: "flex gap-2" }, uc = ["disabled"], dc = ["disabled"], fc = /* @__PURE__ */ V({
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
		return (t, n) => e.total > e.limit || e.offset > 0 ? (W(), G("div", cc, [K("span", null, F(i()) + "–" + F(a()) + " of " + F(e.total), 1), K("div", lc, [K("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, uc), K("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, dc)])])) : Y("", !0);
	}
}), pc = { class: "studio-card" }, mc = { class: "flex justify-between gap-3" }, hc = ["disabled"], gc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, _c = {
	key: 1,
	role: "status"
}, vc = {
	key: 2,
	class: "grid gap-3"
}, yc = ["data-run-id"], bc = { class: "studio-muted text-xs" }, xc = { key: 0 }, Sc = {
	key: 0,
	class: "studio-muted"
}, Cc = /* @__PURE__ */ V({
	__name: "CollectionHistory",
	props: {
		refreshKey: {},
		activeRunId: {}
	},
	setup(e) {
		let t = sc();
		wr(() => {
			t.load();
		});
		let n = e, r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(0), s = /* @__PURE__ */ L(0), c;
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
		return B([() => n.refreshKey, s], () => {
			l();
		}, { immediate: !0 }), Dr(() => c?.abort()), (n, c) => (W(), G("section", pc, [
			K("div", mc, [c[1] ||= K("h2", null, "Collection history · Fleet-wide", -1), K("button", {
				disabled: a.value,
				onClick: l
			}, "Refresh history", 8, hc)]),
			i.value ? (W(), G("p", gc, F(i.value), 1)) : Y("", !0),
			a.value ? (W(), G("p", _c, "Loading collection history…")) : (W(), G("div", vc, [(W(!0), G(U, null, H(r.value, (n) => (W(), G("article", {
				key: n.id,
				"data-run-id": n.id,
				class: P(["studio-history", { "studio-selected": n.id === e.activeRunId }])
			}, [
				K("strong", null, F(n.id), 1),
				J(" · " + F(n.status) + " · " + F(n.started_at), 1),
				K("p", bc, "New " + F(n.new) + " · Unmapped " + F(n.unmapped) + " · Failed " + F(n.failed), 1),
				K("ul", null, [(W(!0), G(U, null, H(n.devices, (e) => (W(), G("li", { key: e.device_id }, [J(F(R(t).deviceLabel(e.device_id)) + " · " + F(e.status) + " · new " + F(e.new) + " · failed " + F(e.failed), 1), e.errors.length ? (W(), G("span", xc, " · " + F(e.errors.join(", ")), 1)) : Y("", !0)]))), 128))])
			], 10, yc))), 128)), r.value.length ? Y("", !0) : (W(), G("p", Sc, "No collection runs yet."))])),
			q(fc, {
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
}), wc = { class: "studio-card" }, Tc = { class: "flex flex-wrap items-center justify-between gap-3" }, Ec = ["disabled"], Dc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Oc = ["data-unmapped-id"], kc = { class: "studio-muted text-xs" }, Ac = ["disabled", "onClick"], jc = ["onUpdate:modelValue"], Mc = ["value"], Nc = ["disabled", "onClick"], Pc = {
	key: 1,
	class: "studio-muted"
}, Fc = /* @__PURE__ */ V({
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
		let n = sc();
		wr(() => {
			n.load();
		});
		let r = t, i = Cs(), a = /* @__PURE__ */ L({}), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c;
		B(i.selectedId, () => {
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
		return Dr(() => c?.abort()), (t, c) => (W(), G("section", wc, [
			K("div", Tc, [c[1] ||= K("h2", null, "Unmapped recordings · Fleet-wide", -1), K("button", {
				"data-action": "refresh-unmapped",
				disabled: e.refreshing || e.busy,
				onClick: c[0] ||= (e) => r("refresh")
			}, F(e.refreshing ? "Refreshing…" : "Refresh inbox"), 9, Ec)]),
			c[4] ||= K("p", { class: "studio-muted" }, "Collection automatically matches unique wake phrases and model identifiers. Unknown or ambiguous matches stay here, never assigned just because a workspace is selected. Assign a recording now, or save an exact kiosk + engine + source-phrase mapping to override future matching.", -1),
			s.value ? (W(), G("p", Dc, F(s.value), 1)) : Y("", !0),
			(W(!0), G(U, null, H(e.recordings, (t) => (W(), G("article", {
				key: t.id,
				"data-unmapped-id": t.id,
				class: "studio-mapping-row"
			}, [K("div", null, [
				K("strong", null, F(t.phrase), 1),
				K("p", kc, F(R(n).deviceLabel(t.device_id)) + " · " + F(t.engine), 1),
				K("button", {
					"data-action": "assign",
					disabled: e.busy || !R(i).selectedId.value,
					onClick: (e) => r("assign", t)
				}, "Assign to this wakeword", 8, Ac)
			]), K("div", null, [K("label", null, [c[3] ||= J("Source phrase → wakeword", -1), z(K("select", {
				"onUpdate:modelValue": (e) => a.value[t.id] = e,
				name: "mapping-word"
			}, [c[2] ||= K("option", { value: "" }, "Choose wakeword", -1), (W(!0), G(U, null, H(R(i).wakewords.value, (e) => (W(), G("option", {
				key: e.id,
				value: e.id
			}, F(e.phrase), 9, Mc))), 128))], 8, jc), [[Ho, a.value[t.id]]])]), K("button", {
				class: "mt-2",
				"data-action": "save-mapping",
				disabled: !a.value[t.id] || !!o.value,
				onClick: (e) => l(t)
			}, "Save source mapping", 8, Nc)])], 8, Oc))), 128)),
			!e.recordings.length && !e.refreshing ? (W(), G("p", Pc, "No unmapped recordings.")) : Y("", !0)
		]));
	}
}), Ic = (e) => [
	"queued",
	"running",
	"cancelling"
].includes(e.status), Lc = Symbol("studio-job-queue");
function Rc() {
	let e = /* @__PURE__ */ L({}), t = /* @__PURE__ */ L([]), n = /* @__PURE__ */ L(0), r = /* @__PURE__ */ L(!1), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L({}), c = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), l = X(() => Object.values(e.value).filter(Ic).sort((e, t) => e.created_at.localeCompare(t.created_at))), u = X(() => l.value.length), d = X(() => t.value.map((t) => e.value[t]).filter((e) => !!e && !Ic(e))), f = X(() => t.value.length < n.value), p = !1, m, h = !1, g = 0, _, v, y = 50, b = 0, x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Set();
	function w(t) {
		e.value[t.id] && !Ic(e.value[t.id]) && Ic(t) || (e.value = {
			...e.value,
			[t.id]: t
		}, x.set(t.id, ++b));
	}
	function T(t, n) {
		e.value[t.id] && !Ic(e.value[t.id]) && Ic(t) || (x.get(t.id) ?? 0) <= n && (e.value[t.id] = t);
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
			m = void 0, ee();
		}, 2e3));
	}
	function ee() {
		if (h) return Promise.resolve();
		if (v) return v;
		m && clearTimeout(m), m = void 0;
		let e = D().finally(() => {
			v === e && (v = void 0, O());
		});
		return v = e, e;
	}
	function k() {
		p || (h = !1, p = !0, ee());
	}
	function te() {
		h = !0, g += 1, p = !1, m && clearTimeout(m), m = void 0, _?.abort(), S.forEach((e) => e.abort()), S.clear(), C.forEach((e) => e.abort()), C.clear();
	}
	async function ne(t) {
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
			s() && await ee();
		} catch (e) {
			s() && (a.value = e instanceof Error ? e.message : "Unable to load job.");
		} finally {
			C.delete(n);
		}
	}
	async function A() {
		if (h) return;
		let e = g;
		y += 50, v && await v, !h && g === e && await ee();
	}
	async function re(t) {
		if (c.value.has(t) || !e.value[t] || !Ic(e.value[t])) return;
		let n = new AbortController();
		S.set(t, n), c.value = /* @__PURE__ */ new Set([...c.value, t]), delete s.value[t], x.set(t, ++b);
		try {
			let e = await $.cancelJob(t, n.signal);
			n.signal.aborted || w(e);
		} catch (e) {
			n.signal.aborted || (s.value[t] = e instanceof Error ? e.message : "Unable to cancel job.");
		} finally {
			S.delete(t), c.value = new Set([...c.value].filter((e) => e !== t)), n.signal.aborted || await ee();
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
		start: k,
		stop: te,
		refresh: ee,
		track: w,
		show: ne,
		loadMore: A,
		cancel: re
	};
}
function zc() {
	let e = Ln(Lc, null);
	if (e) return e;
	let t = Rc();
	return wr(t.start), Dr(t.stop), t;
}
//#endregion
//#region src/studio/pages/ClassifyPage.vue?vue&type=script&setup=true&lang.ts
var Bc = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Vc = { class: "flex flex-wrap items-center gap-3" }, Hc = {
	"data-progress": "",
	class: "studio-muted"
}, Uc = ["disabled"], Wc = {
	class: "studio-tabs",
	role: "tablist",
	"aria-label": "Classification sections"
}, Gc = [
	"id",
	"aria-selected",
	"aria-controls",
	"onClick"
], Kc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, qc = ["role"], Jc = ["href"], Yc = {
	id: "classify-panel-review",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-review"
}, Xc = { class: "studio-card studio-toolbar mb-4" }, Zc = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Qc = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, $c = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, el = ["data-sample-id"], tl = { class: "flex flex-wrap justify-between gap-3" }, nl = { class: "studio-muted text-sm" }, rl = { class: "studio-muted" }, il = {
	key: 0,
	class: "studio-muted text-xs"
}, al = { class: "flex flex-wrap gap-2" }, ol = ["disabled"], sl = ["disabled"], cl = ["disabled"], ll = ["disabled"], ul = ["disabled"], dl = {
	key: 4,
	class: "studio-card"
}, fl = { key: 0 }, pl = { key: 1 }, ml = {
	key: 2,
	id: "classify-panel-collect",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-collect"
}, hl = { class: "studio-card mb-4" }, gl = ["href"], _l = {
	id: "classify-panel-unmapped",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-unmapped"
}, vl = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, yl = {
	key: 3,
	class: "studio-modal-backdrop"
}, bl = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, xl = { class: "flex gap-2" }, Sl = ["disabled"], Cl = [], wl = /* @__PURE__ */ V({
	__name: "ClassifyPage",
	setup(e) {
		let t = Cs(), n = sc();
		wr(() => {
			n.load();
		});
		let r = zc(), { classifyTab: i } = t.routes, a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = X(() => {
			let e = a.value;
			return e?.kind === "scrape" && e.status === "complete" && "status" in e.result ? e.result : null;
		}), l = X(() => !!(c.value && (c.value.status !== "complete" || (c.value.failed ?? 0) > 0 || (c.value.evicted ?? 0) > 0))), u = X(() => "#/classify?" + new URLSearchParams({
			word: t.selectedId.value,
			tab: "collect"
		})), d;
		async function f() {
			if (!t.selectedId.value || o.value || a.value && [
				"queued",
				"running",
				"cancelling"
			].includes(a.value.status)) return;
			let e = t.selectedId.value, n = new AbortController();
			d = n, o.value = !0, s.value = "";
			try {
				let i = await $.collect(e, void 0, n.signal);
				!n.signal.aborted && t.selectedId.value === e && (a.value = i, r.track(i), r.show(i.id));
			} catch (e) {
				n.signal.aborted || (s.value = e instanceof Error ? e.message : "Collection was not started.");
			} finally {
				d === n && (o.value = !1);
			}
		}
		async function p(e) {
			let r = a.value;
			if (!r || e.id !== r.id || e.word_id !== t.selectedId.value || (a.value = e, e.status !== "complete" || r.status === "complete")) return;
			n.load(!0), b();
			let i = t.selectedId.value, o = w.value, c = new AbortController();
			d?.abort(), d = c;
			try {
				let e = await $.queue(i, pe(), c.signal);
				if (c.signal.aborted || i !== t.selectedId.value || E.value || w.value !== o) return;
				let n = new Set(h.value.map((e) => e.id));
				h.value.push(...e.items.filter((e) => !n.has(e.id))), C.value = e.total;
			} catch (e) {
				c.signal.aborted || (s.value = e instanceof Error ? e.message : "Collection completed; refresh the queue to see new recordings.");
			}
		}
		B(r.jobs, (e) => {
			let t = a.value && e[a.value.id];
			t && p(t);
		}, { deep: !0 });
		let m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ L([]), g = /* @__PURE__ */ L([]), _ = /* @__PURE__ */ L(!1), v = /* @__PURE__ */ L(""), y;
		async function b() {
			y?.abort();
			let e = new AbortController();
			y = e;
			let n = t.selectedId.value;
			_.value = !0, v.value = "";
			try {
				let r = await $.unmapped({ limit: 50 }, e.signal);
				!e.signal.aborted && y === e && t.selectedId.value === n && (g.value = r.items);
			} catch (r) {
				!e.signal.aborted && t.selectedId.value === n && (v.value = r instanceof Error ? r.message : "Unable to refresh the inbox.");
			} finally {
				y === e && (_.value = !1);
			}
		}
		let x = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), S = /* @__PURE__ */ L(0), C = /* @__PURE__ */ L(0), w = /* @__PURE__ */ L(0), T = /* @__PURE__ */ L(!1), E = /* @__PURE__ */ L(!1), D = /* @__PURE__ */ L(""), O = /* @__PURE__ */ L(""), ee = /* @__PURE__ */ L(!1), k = /* @__PURE__ */ L(!1), te = /* @__PURE__ */ L(null), ne = /* @__PURE__ */ L(!1), A = /* @__PURE__ */ L(""), re = /* @__PURE__ */ L(), j, ie, M = 0, ae, oe = 0, se = 0, ce = X(() => h.value.filter((e) => !x.value.has(e.id))), N = X(() => ce.value[S.value] ?? null), le = X(() => N.value ? $.audioUrl(N.value.word_id, N.value.id) : null), ue = X(() => w.value);
		function de() {
			re.value?.stop(), h.value = [], g.value = [], x.value = new Set(m.get(t.selectedId.value) ?? []), S.value = 0, C.value = 0, w.value = 0, k.value = !1, ne.value = !1, D.value = "", O.value = "";
		}
		function fe() {
			oe += 1, ae && (ae.abort(), ae = void 0, E.value = !1);
		}
		function pe() {
			return {
				limit: 100,
				...A.value ? { near_miss: A.value === "true" } : {}
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
				let a = i.items.filter((e) => !x.value.has(e.id));
				if (r += i.items.length, a.length || !i.items.length || r >= i.total) return {
					...i,
					items: a
				};
			}
		}
		async function he() {
			if (ce.value.length || T.value) return;
			j?.abort();
			let e = new AbortController();
			j = e;
			let n = ++se, r = t.selectedId.value;
			if (r) {
				T.value = !0;
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					h.value = [...new Map(i.items.map((e) => [e.id, e])).values()], C.value = i.total, S.value = 0;
				} catch {
					!e.signal.aborted && n === se && (D.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === se && (T.value = !1);
				}
			}
		}
		async function ge() {
			ie?.abort(), M++, E.value = !1, fe(), j?.abort();
			let e = new AbortController();
			j = e;
			let n = ++se, r = t.selectedId.value;
			if (de(), y?.abort(), v.value = "", _.value = !1, r) {
				T.value = !0, b();
				try {
					let i = await me(r, e);
					if (e.signal.aborted || n !== se || t.selectedId.value !== r) return;
					h.value = i.items, C.value = i.total;
				} catch (t) {
					!e.signal.aborted && n === se && (D.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === se && (T.value = !1);
				}
			}
		}
		function _e() {
			let e = N.value;
			e && (h.value = h.value.filter((t) => t.id !== e.id), C.value = Math.max(0, C.value - 1), S.value = Math.min(S.value, Math.max(0, ce.value.length - 1)), re.value?.stop(), k.value = ee.value, he());
		}
		async function ve(e, n, r) {
			let i = () => !n.signal.aborted && r === M && t.selectedId.value === e.word_id && N.value?.id === e.id;
			if (i()) try {
				let t = await $.sample(e.word_id, e.id, n.signal);
				if (!i()) return;
				if (t.label !== "pending") {
					_e();
					return;
				}
				h.value = h.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function ye(e) {
			let n = N.value;
			if (!n || E.value || ne.value) return;
			ee.value = !0, E.value = !0, D.value = "";
			let r = new AbortController();
			ie?.abort(), ie = r;
			let i = ++M, a = () => !r.signal.aborted && i === M && t.selectedId.value === n.word_id;
			try {
				let t = await $.label(n.word_id, n.id, e, n.revision, r.signal);
				if (!a() || N.value?.id !== n.id) return;
				Cl.push({
					word: n.word_id,
					sample: t
				}), w.value += 1, O.value = `Saved ${e} label.`, _e();
			} catch (e) {
				a() && (e instanceof Error && e.message.includes("conflict") ? (D.value = "This recording changed elsewhere. Review the latest version before saving.", await ve(n, r, i)) : D.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				a() && (E.value = !1);
			}
		}
		function be() {
			let e = N.value;
			!e || E.value || T.value || (ee.value = !0, x.value = /* @__PURE__ */ new Set([...x.value, e.id]), m.set(e.word_id, x.value), S.value = Math.min(S.value, Math.max(0, ce.value.length - 1)), re.value?.stop(), k.value = !1, O.value = "Skipped for this session; this recording remains pending.", he());
		}
		async function xe() {
			if (E.value || !Cl.length) return;
			ee.value = !0, E.value = !0, D.value = "";
			let e = Cl[Cl.length - 1], n = new AbortController();
			ie?.abort(), ie = n;
			let r = ++M, i = t.selectedId.value, a = () => !n.signal.aborted && r === M && t.selectedId.value === i;
			try {
				let r = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (!a()) return;
				Cl.pop(), O.value = "Last label restored to pending.", t.selectedId.value === e.word && (h.value = [r, ...h.value.filter((e) => e.id !== r.id)], C.value += 1, w.value = Math.max(0, w.value - 1), S.value = 0, k.value = !1);
			} catch {
				a() && (D.value = "Undo was not saved. Refresh and try again.");
			} finally {
				a() && (E.value = !1);
			}
		}
		async function Se(e) {
			let n = t.selectedId.value;
			if (E.value || !n) return;
			y?.abort();
			let r = se, i = ++oe, a = new AbortController();
			ae?.abort(), ae = a, E.value = !0, D.value = "";
			try {
				let o = await $.assign(e.id, n, a.signal);
				if (a.signal.aborted || ae !== a || i !== oe || r !== se || t.selectedId.value !== n) return;
				g.value = g.value.filter((t) => t.id !== e.id), h.value = [...h.value.filter((e) => e.id !== o.id), o], C.value += 1, O.value = "Recording assigned to this workspace and added to the pending queue.", b();
			} catch {
				!a.signal.aborted && ae === a && i === oe && t.selectedId.value === n && (D.value = "Recording could not be assigned.");
			} finally {
				ae === a && (ae = void 0, E.value = !1);
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
			if (r.open.value || i.value !== "review" || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || Ce(e)) return;
			let t = e.key.toLowerCase();
			ne.value ? e.key === "Escape" && (e.preventDefault(), ne.value = !1) : t === "d" ? (e.preventDefault(), N.value && !E.value && (ne.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), ee.value = !0, t === "p" ? ye("positive") : t === "n" ? ye("negative") : t === " " ? re.value?.toggle() : t === "r" ? re.value?.replay() : t === "s" ? be() : xe());
		}
		return B(t.selectedId, () => {
			d?.abort(), a.value = null, o.value = !1, s.value = "", ge();
		}, { immediate: !0 }), B(A, () => {
			ge();
		}), B(() => N.value?.id, () => {
			te.value = null;
		}, { flush: "sync" }), wr(() => document.addEventListener("keydown", we)), B(i, () => {
			re.value?.stop();
		}), Dr(() => {
			document.removeEventListener("keydown", we), y?.abort(), d?.abort(), j?.abort(), ie?.abort(), fe(), re.value?.stop();
		}), (e, r) => (W(), G("section", null, [
			K("div", Bc, [r[11] ||= K("div", null, [K("h1", null, "Classify"), K("p", { class: "studio-muted" }, "Collect recordings, resolve source mappings, and review labels.")], -1), K("div", Vc, [K("span", Hc, F(C.value) + " pending · " + F(ue.value) + " reviewed · " + F(x.value.size) + " skipped", 1), K("button", {
				"data-action": "collect-now",
				class: "studio-primary",
				disabled: !R(t).selectedId.value || o.value || !!(a.value && [
					"queued",
					"running",
					"cancelling"
				].includes(a.value.status)),
				onClick: f
			}, F(o.value ? "Starting…" : "Collect"), 9, Uc)])]),
			K("div", Wc, [(W(), G(U, null, H([
				"review",
				"collect",
				"unmapped"
			], (e) => K("button", {
				id: `classify-tab-${e}`,
				key: e,
				role: "tab",
				"aria-selected": R(i) === e,
				"aria-controls": `classify-panel-${e}`,
				class: P({ active: R(i) === e }),
				onClick: (n) => R(t).routes.selectClassifyTab(e)
			}, F(e === "review" ? "Review" : e === "collect" ? "Collect" : "Unmapped"), 11, Gc)), 64))]),
			s.value ? (W(), G("p", Kc, F(s.value), 1)) : Y("", !0),
			c.value ? (W(), G("p", {
				key: 1,
				"data-collection-outcome": "",
				class: P(["studio-note", { "studio-collection-warning": l.value }]),
				role: l.value ? "alert" : "status"
			}, [
				K("strong", null, F(l.value ? "Collection needs attention" : "Collection finished"), 1),
				J(" · " + F(c.value.status) + " · " + F(c.value.new ?? 0) + " imported · " + F(c.value.failed ?? 0) + " failed · " + F(c.value.unmapped ?? 0) + " unmapped · " + F(c.value.evicted ?? 0) + " evicted. ", 1),
				K("a", {
					href: u.value,
					onClick: r[0] ||= Yo((e) => R(t).routes.selectClassifyTab("collect"), ["prevent"])
				}, "View collection run →", 8, Jc)
			], 10, qc)) : Y("", !0),
			z(K("div", Yc, [
				K("div", Xc, [K("label", null, [r[13] ||= J("Recording type", -1), z(K("select", {
					name: "kind",
					"onUpdate:modelValue": r[1] ||= (e) => A.value = e
				}, [...r[12] ||= [
					K("option", { value: "" }, "All pending", -1),
					K("option", { value: "true" }, "Near misses", -1),
					K("option", { value: "false" }, "Activations", -1)
				]], 512), [[Ho, A.value]])])]),
				O.value ? (W(), G("p", Zc, F(O.value), 1)) : Y("", !0),
				D.value ? (W(), G("p", Qc, F(D.value), 1)) : Y("", !0),
				T.value ? (W(), G("div", $c, "Loading review queue…")) : N.value ? (W(), G("div", {
					key: 3,
					"data-classify-current": "",
					"data-sample-id": N.value.id,
					class: "studio-card grid gap-4"
				}, [
					K("div", tl, [K("div", null, [K("h2", null, "Recording " + F(N.value.recording?.clip_id ?? N.value.id), 1), K("p", nl, F(N.value.recording ? R(n).deviceLabel(N.value.recording.device_id) : N.value.source) + " · " + F(N.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + F(N.value.recording?.timestamp ?? N.value.created_at), 1)]), K("span", rl, "Revision " + F(N.value.revision), 1)]),
					q(ec, {
						ref_key: "player",
						ref: re,
						"sample-id": N.value.id,
						src: le.value,
						"autoplay-requested": k.value,
						onReady: r[2] ||= (e) => {
							k.value = !1, te.value = N.value.id;
						},
						onPlaybackError: r[3] ||= (e) => D.value = e
					}, null, 8, [
						"sample-id",
						"src",
						"autoplay-requested"
					]),
					te.value === N.value.id ? (W(), G("p", il, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : Y("", !0),
					K("div", al, [
						K("button", {
							type: "button",
							class: "studio-primary",
							disabled: E.value,
							onClick: r[4] ||= (e) => ye("positive")
						}, "Positive (P)", 8, ol),
						K("button", {
							type: "button",
							disabled: E.value,
							onClick: r[5] ||= (e) => ye("negative")
						}, "Negative (N)", 8, sl),
						K("button", {
							type: "button",
							disabled: E.value,
							onClick: be
						}, "Skip (S)", 8, cl),
						K("button", {
							type: "button",
							disabled: E.value,
							"data-action": "discard",
							onClick: r[6] ||= (e) => ne.value = !0
						}, "Discard (D)", 8, ll),
						K("button", {
							type: "button",
							disabled: E.value || !R(Cl).length,
							onClick: xe
						}, "Undo (Z)", 8, ul)
					]),
					r[14] ||= K("p", {
						"data-shortcuts": "",
						class: "studio-muted text-xs"
					}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
					r[15] ||= K("input", {
						name: "search",
						type: "search",
						"aria-label": "Queue search",
						placeholder: "Shortcuts pause while editing"
					}, null, -1)
				], 8, el)) : (W(), G("div", dl, [C.value === 0 ? (W(), G("span", fl, "No pending recordings for this workspace.")) : (W(), G("span", pl, "Pending recordings are skipped for this session or the local window needs reloading.")), C.value > 0 ? (W(), G("button", {
					key: 2,
					type: "button",
					onClick: he
				}, "Retry pending window")) : Y("", !0)]))
			], 512), [[ro, R(i) === "review"]]),
			R(i) === "collect" ? (W(), G("div", ml, [K("div", hl, [
				r[16] ||= K("h2", null, "Collect recordings", -1),
				r[17] ||= K("p", { class: "studio-muted" }, "Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.", -1),
				K("a", {
					href: R(t).routes.href("automate"),
					onClick: r[7] ||= Yo((e) => R(t).routes.navigate("automate"), ["prevent"])
				}, "Collection settings →", 8, gl)
			]), q(Cc, {
				"refresh-key": a.value?.status,
				"active-run-id": c.value?.run_id
			}, null, 8, ["refresh-key", "active-run-id"])])) : Y("", !0),
			z(K("div", _l, [v.value ? (W(), G("p", vl, F(v.value), 1)) : Y("", !0), q(Fc, {
				recordings: g.value,
				busy: E.value,
				refreshing: _.value,
				onRefresh: b,
				onAssign: Se,
				onChanged: r[8] ||= (e) => O.value = "Source mapping saved for future collections."
			}, null, 8, [
				"recordings",
				"busy",
				"refreshing"
			])], 512), [[ro, R(i) === "unmapped"]]),
			ne.value ? (W(), G("div", yl, [K("section", bl, [
				r[18] ||= K("h2", null, "Discard this recording?", -1),
				r[19] ||= K("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				K("div", xl, [K("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: E.value,
					onClick: r[9] ||= (e) => {
						ne.value = !1, ye("discarded");
					}
				}, "Discard recording", 8, Sl), K("button", {
					type: "button",
					onClick: r[10] ||= (e) => ne.value = !1
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function Tl(e, t = {}) {
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
function El(e) {
	return Tl(e);
}
//#endregion
//#region src/trainerStore.ts
var Dl = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), Ol = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), kl = /* @__PURE__ */ Ft({
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
	samples: Ol(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: Dl(),
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
function Al(e, t) {
	t ? kl.busy.add(e) : kl.busy.delete(e);
}
function jl(e, t = "success") {
	kl.toast = {
		message: String(e || ""),
		tone: t,
		serial: kl.toast.serial + 1
	};
}
async function Ml(e = !1) {
	e || Al("samples", !0);
	try {
		let e = await El("/api/samples");
		kl.samples = {
			...Ol(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((kl.samples[e]?.length || 0) / 50) - 1);
			kl.samplePage[e] = Math.min(kl.samplePage[e], t);
		}
		return e;
	} finally {
		e || Al("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var Nl = { class: "legacy-scope" }, Pl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Fl = { class: "range-grid" }, Il = ["max"], Ll = ["min"], Rl = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, zl = { class: "modal-head" }, Bl = {
	key: 0,
	class: "empty-state"
}, Vl = { class: "range-grid" }, Hl = ["max"], Ul = ["min", "max"], Wl = { class: "row space" }, Gl = { class: "pill" }, Kl = {
	key: 0,
	class: "pill success"
}, ql = { class: "row modal-actions" }, Jl = ["disabled"], Yl = /* @__PURE__ */ V({
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
		B(() => kl.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(kl.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await Tl(`/api/samples/${encodeURIComponent(kl.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await bn(), v();
				} catch (e) {
					jl(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), B([d, f], () => v());
		function g() {
			kl.trimItem = null, l.value = null, p.value = [];
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
			let e = kl.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", kl.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await Tl("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await Ml(!0), jl(n.message || "Trimmed sample saved.");
				} catch (e) {
					jl(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			kl.trimItem && v();
		}
		return window.addEventListener("resize", S), Dr(() => window.removeEventListener("resize", S)), (t, n) => (W(), la(tr, { to: "body" }, [K("div", Nl, [e.studioTarget ? (W(), G("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Yo(o, ["self"])
		}, [K("section", Pl, [
			K("header", { class: "modal-head" }, [n[4] ||= K("div", null, [K("span", { class: "eyebrow" }, "Studio audio editor"), K("h2", null, "Trim sample")], -1), K("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= K("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			K("div", Fl, [K("label", null, [n[5] ||= K("span", null, "Start seconds", -1), z(K("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Il), [[
				zo,
				i.value,
				void 0,
				{ number: !0 }
			]])]), K("label", null, [n[6] ||= K("span", null, "End seconds", -1), z(K("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, Ll), [[
				zo,
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
		])])) : R(kl).trimItem ? (W(), G("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Yo(g, ["self"])
		}, [K("section", Rl, [
			K("header", zl, [K("div", null, [n[8] ||= K("span", { class: "eyebrow" }, "Audio editor", -1), K("h2", null, "Trim " + F(R(kl).trimItem.saved_as), 1)]), K("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= K("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (W(), G("div", Bl, "Loading waveform…")) : (W(), G(U, { key: 1 }, [
				K("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				K("div", Vl, [K("label", null, [K("span", null, "Start · " + F(d.value.toFixed(2)) + "s", 1), z(K("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, Hl), [[
					zo,
					d.value,
					void 0,
					{ number: !0 }
				]])]), K("label", null, [K("span", null, "End · " + F(f.value.toFixed(2)) + "s", 1), z(K("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Ul), [[
					zo,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				K("div", Wl, [K("span", Gl, "Selection " + F(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (W(), G("span", Kl, F(p.value.length) + " speech segment" + F(p.value.length === 1 ? "" : "s"), 1)) : Y("", !0)]),
				K("div", ql, [
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
					}, F(h.value ? "Saving…" : "Save trim"), 9, Jl)
				])
			], 64))
		])])) : Y("", !0)])]));
	}
}), Xl = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Zl = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Ql = { class: "studio-card mb-4" }, $l = {
	"data-sample-filters": "",
	class: "grid gap-3 sm:grid-cols-3 lg:grid-cols-5"
}, eu = ["aria-busy"], tu = { key: 0 }, nu = {
	key: 1,
	class: "w-full text-sm"
}, ru = ["data-row-id"], iu = {
	key: 0,
	class: "block studio-muted"
}, au = {
	key: 0,
	class: "block studio-muted"
}, ou = { class: "flex flex-wrap gap-1" }, su = [
	"disabled",
	"aria-pressed",
	"aria-label",
	"onClick"
], cu = ["value", "onChange"], lu = {
	key: 0,
	value: "pending",
	disabled: ""
}, uu = ["onClick"], du = ["onClick"], fu = { key: 0 }, pu = {
	key: 2,
	class: "studio-modal-backdrop"
}, mu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, hu = /* @__PURE__ */ V({
	__name: "SamplesPage",
	setup(e) {
		let t = Cs(), n = sc();
		wr(() => {
			n.load();
		});
		let r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(25), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: ""
		}), d = /* @__PURE__ */ L(null), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(), m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(null), g, _, v, y, b = 0, x = X(() => ({
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
				return t.signal.aborted || (e instanceof ms && e.status === 409 ? (await T(), c.value = "This sample changed elsewhere. The current page was reloaded.") : c.value = "Sample changes were not saved. Try again."), null;
			}
		}
		async function O(e, t) {
			let n = t.target.value;
			if (n === e.label) return;
			let r = await D((t) => $.label(e.word_id, e.id, n, e.revision, t));
			r && (E(r), l.value = "Label saved.");
		}
		async function ee(e) {
			let t = d.value;
			if (!t) return;
			let n = await D((n) => $.trim(t.word_id, t.id, e.start, e.end, t.revision, n));
			n && (E(n), d.value = null, l.value = "Non-destructive trim saved.");
		}
		async function k() {
			let e = f.value;
			e && await D((t) => $.deleteSample(e.word_id, e.id, e.revision, t)) !== null && (r.value = r.value.filter((t) => t.id !== e.id), i.value = Math.max(0, i.value - 1), f.value = null, l.value = "Sample removed from this visible library.");
		}
		function te() {
			a.value = 0, T();
		}
		function ne(e) {
			return e.recording?.near_miss ? "close miss" : "activation";
		}
		function A(e) {
			return e.source === "diagnostic" ? e.recording ? n.deviceLabel(e.recording.device_id) : "Kiosk" : {
				microphone: "Recorded",
				import: "Import",
				legacy: "Legacy"
			}[e.source] ?? e.source;
		}
		return B(t.selectedId, () => {
			a.value = 0, T();
		}, { immediate: !0 }), Dr(() => {
			g?.abort(), _?.abort(), S();
		}), (e, t) => (W(), G("section", null, [
			t[25] ||= K("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [K("div", null, [K("h1", null, "Samples"), K("p", { class: "studio-muted" }, "Library of collected, recorded and imported audio with non-destructive trims.")])], -1),
			l.value ? (W(), G("p", Xl, F(l.value), 1)) : Y("", !0),
			c.value ? (W(), G("p", Zl, F(c.value), 1)) : Y("", !0),
			K("div", Ql, [K("div", $l, [
				K("label", null, [t[10] ||= J("Label", -1), z(K("select", {
					name: "label",
					"onUpdate:modelValue": t[0] ||= (e) => u.value.label = e,
					onChange: te
				}, [...t[9] ||= [_a("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Ho, u.value.label]])]),
				K("label", null, [t[12] ||= J("Source", -1), z(K("select", {
					name: "source",
					"onUpdate:modelValue": t[1] ||= (e) => u.value.source = e,
					onChange: te
				}, [...t[11] ||= [
					K("option", { value: "" }, "All sources", -1),
					K("option", { value: "diagnostic" }, "Kiosk", -1),
					K("option", { value: "microphone" }, "Recorded", -1),
					K("option", { value: "import" }, "Import", -1)
				]], 544), [[Ho, u.value.source]])]),
				K("label", null, [t[14] ||= J("Kind", -1), z(K("select", {
					name: "kind",
					"onUpdate:modelValue": t[2] ||= (e) => u.value.kind = e,
					onChange: te
				}, [...t[13] ||= [
					K("option", { value: "" }, "All kinds", -1),
					K("option", { value: "true" }, "Close miss", -1),
					K("option", { value: "false" }, "Activation", -1)
				]], 544), [[Ho, u.value.kind]])]),
				K("label", null, [t[15] ||= J("After", -1), z(K("input", {
					name: "after",
					"onUpdate:modelValue": t[3] ||= (e) => u.value.after = e,
					type: "date",
					onInput: te
				}, null, 544), [[zo, u.value.after]])]),
				K("label", null, [t[16] ||= J("Before", -1), z(K("input", {
					name: "before",
					"onUpdate:modelValue": t[4] ||= (e) => u.value.before = e,
					type: "date",
					onInput: te
				}, null, 544), [[zo, u.value.before]])])
			])]),
			K("audio", {
				ref_key: "audio",
				ref: p,
				"data-audio-player": "",
				preload: "none",
				class: "hidden",
				onEnded: S
			}, null, 544),
			K("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": s.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [s.value ? (W(), G("p", tu, "Loading samples…")) : (W(), G("table", nu, [t[22] ||= K("thead", null, [K("tr", null, [
				K("th", null, "Sample"),
				K("th", null, "Label"),
				K("th", null, "Source"),
				K("th", null, "Revision"),
				K("th", null, "Actions")
			])], -1), K("tbody", null, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				K("td", null, [J(F(e.recording?.clip_id ?? e.id), 1), e.recording ? (W(), G("small", iu, F(e.recording.phrase) + " · " + F(e.recording.engine) + " · " + F(ne(e)), 1)) : Y("", !0)]),
				K("td", null, F(e.label), 1),
				K("td", null, [J(F(A(e)), 1), e.capture ? (W(), G("small", au, F(e.capture.trim_method === "silero" ? "VAD trim" : e.capture.trim_method === "manual" ? "Manual trim" : "Full recording") + " · " + F(e.capture.duration_s.toFixed(2)) + " s original", 1)) : Y("", !0)]),
				K("td", null, "rev " + F(e.revision), 1),
				K("td", null, [K("div", ou, [
					K("button", {
						type: "button",
						"data-action": "play",
						disabled: h.value === e.id,
						"aria-pressed": m.value === e.id,
						"aria-label": m.value === e.id ? "Stop sample" : "Play sample",
						onClick: (t) => C(e)
					}, F(h.value === e.id ? "Loading…" : m.value === e.id ? "Stop" : "Play"), 9, su),
					K("label", null, [t[20] ||= K("span", { class: "sr-only" }, "Relabel", -1), K("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => O(e, t)
					}, [
						e.label === "pending" ? (W(), G("option", lu, "Set label…")) : Y("", !0),
						t[17] ||= K("option", { value: "positive" }, "Positive", -1),
						t[18] ||= K("option", { value: "negative" }, "Negative", -1),
						t[19] ||= K("option", { value: "discarded" }, "Discarded", -1)
					], 40, cu)]),
					K("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => d.value = e
					}, "Trim", 8, uu),
					K("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => f.value = e
					}, "Delete", 8, du)
				])])
			], 8, ru))), 128)), r.value.length ? Y("", !0) : (W(), G("tr", fu, [...t[21] ||= [K("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), q(fc, {
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
			])], 8, eu),
			q(Yl, {
				"studio-target": d.value ? {
					wordId: d.value.word_id,
					sampleId: d.value.id,
					revision: d.value.revision,
					src: R($).audioUrl(d.value.word_id, d.value.id)
				} : null,
				onSave: t[6] ||= (e) => ee(e),
				onClose: t[7] ||= (e) => d.value = null
			}, null, 8, ["studio-target"]),
			f.value ? (W(), G("div", pu, [K("section", mu, [
				t[23] ||= K("h2", null, "Remove sample?", -1),
				t[24] ||= K("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				K("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: k
				}, "Remove"),
				K("button", {
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
function gu() {
	let e = /* @__PURE__ */ L("idle"), t = /* @__PURE__ */ qt(null), n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(0), i = 0, a, o, s;
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
var _u = { class: "studio-capture-review" }, vu = { class: "flex flex-wrap items-center justify-between gap-2" }, yu = { class: "studio-muted text-xs" }, bu = {
	key: 0,
	class: "studio-note",
	role: "status"
}, xu = {
	key: 1,
	class: "studio-note",
	role: "status"
}, Su = {
	key: 2,
	class: "studio-muted",
	role: "status"
}, Cu = {
	key: 3,
	class: "studio-capture-wave",
	viewBox: "0 0 640 80",
	preserveAspectRatio: "none",
	role: "img",
	"aria-label": "Recorded audio waveform with selected trim region"
}, wu = [
	"x1",
	"x2",
	"y1",
	"y2"
], Tu = ["width"], Eu = ["x", "width"], Du = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, Ou = ["disabled"], ku = { class: "flex flex-wrap gap-2 mb-3" }, Au = ["disabled"], ju = ["disabled", "aria-expanded"], Mu = ["disabled"], Nu = ["max"], Pu = ["max"], Fu = {
	key: 6,
	class: "studio-note",
	role: "alert"
}, Iu = /* @__PURE__ */ V({
	__name: "CaptureReview",
	props: {
		audio: {},
		preview: {},
		disabled: { type: Boolean }
	},
	emits: ["selection"],
	setup(e, { expose: t, emit: n }) {
		let r = e, i = n, a = /* @__PURE__ */ L(r.preview.start_s), o = /* @__PURE__ */ L(r.preview.end_s), s = /* @__PURE__ */ L(r.preview.trim_method), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(!0), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ qt(null), p = /* @__PURE__ */ L([]), m, h, g = 0, _ = X(() => Number.isFinite(a.value) && Number.isFinite(o.value) && a.value >= 0 && o.value <= r.preview.duration_s && o.value > a.value && Math.floor(o.value * 16e3) > Math.floor(a.value * 16e3));
		B([
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
		}), B(() => r.audio, () => {
			b();
		}, { immediate: !0 }), B(() => r.preview, (e) => {
			a.value = e.start_s, o.value = e.end_s, s.value = e.trim_method, c.value = !1;
		}), B(() => r.disabled, (e) => {
			e && v();
		}), Dr(() => {
			g++, y();
		}), (e, t) => (W(), G("div", _u, [
			K("div", vu, [t[3] ||= K("h2", null, "Review your sample", -1), K("span", yu, F(s.value === "silero" ? "Auto-trimmed" : s.value === "manual" ? "Manual trim" : "Full clip") + " · " + F(Math.max(0, o.value - a.value).toFixed(2)) + " s retained", 1)]),
			r.preview.duration_limited ? (W(), G("p", bu, "Training audio is limited to 10 minutes, including any delayed browser stop. Your full original recording is retained when saved.")) : Y("", !0),
			r.preview.warning ? (W(), G("p", xu, F(r.preview.warning === "no_speech" ? "No speech detected. The full clip is selected; background-noise negatives can still be saved." : "Automatic speech trimming is unavailable. The full clip is selected; adjust it manually if needed."), 1)) : Y("", !0),
			l.value ? (W(), G("p", Su, "Preparing waveform…")) : f.value ? (W(), G("svg", Cu, [
				(W(!0), G(U, null, H(p.value, (e, t) => (W(), G("line", {
					key: t,
					x1: t * 4 + 2,
					x2: t * 4 + 2,
					y1: 40 - e,
					y2: 40 + e,
					stroke: "currentColor",
					"stroke-width": "2"
				}, null, 8, wu))), 128)),
				K("rect", {
					x: "0",
					y: "0",
					width: a.value / r.preview.duration_s * 640,
					height: "80",
					fill: "var(--studio-bg)",
					opacity: ".85"
				}, null, 8, Tu),
				K("rect", {
					x: o.value / r.preview.duration_s * 640,
					y: "0",
					width: (1 - o.value / r.preview.duration_s) * 640,
					height: "80",
					fill: "var(--studio-bg)",
					opacity: ".85"
				}, null, 8, Eu)
			])) : Y("", !0),
			u.value ? (W(), G("p", Du, [J(F(u.value) + " ", 1), K("button", {
				type: "button",
				disabled: l.value || r.disabled,
				onClick: b
			}, "Retry preview", 8, Ou)])) : Y("", !0),
			K("div", ku, [K("button", {
				type: "button",
				"data-action": "play-capture",
				"aria-keyshortcuts": "Space",
				disabled: !f.value || !_.value || r.disabled,
				onClick: x
			}, F(d.value ? "Stop preview" : "▶ Play trimmed sample"), 9, Au), K("button", {
				type: "button",
				"data-action": "adjust-trim",
				disabled: r.disabled,
				"aria-expanded": c.value,
				onClick: t[0] ||= (e) => c.value = !c.value
			}, "Adjust trim", 8, ju)]),
			c.value ? (W(), G("fieldset", {
				key: 5,
				class: "studio-capture-bounds",
				disabled: r.disabled
			}, [
				t[6] ||= K("legend", { class: "sr-only" }, "Trim selection in seconds", -1),
				K("label", null, [t[4] ||= J("Start (seconds)", -1), z(K("input", {
					"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
					name: "trim-start",
					type: "number",
					min: "0",
					max: r.preview.duration_s,
					step: "0.01",
					onInput: S
				}, null, 40, Nu), [[
					zo,
					a.value,
					void 0,
					{ number: !0 }
				]])]),
				K("label", null, [t[5] ||= J("End (seconds)", -1), z(K("input", {
					"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
					name: "trim-end",
					type: "number",
					min: "0",
					max: r.preview.duration_s,
					step: "0.01",
					onInput: S
				}, null, 40, Pu), [[
					zo,
					o.value,
					void 0,
					{ number: !0 }
				]])])
			], 8, Mu)) : Y("", !0),
			_.value ? Y("", !0) : (W(), G("p", Fu, "Choose a start before the end, within the recorded duration.")),
			t[7] ||= K("p", { class: "studio-muted text-xs" }, "Only the beginning and end are trimmed. Interior pauses stay intact. Original audio is retained.", -1)
		]));
	}
}), Lu = { class: "flex flex-wrap items-start justify-between gap-3 mb-4" }, Ru = ["href"], zu = {
	key: 0,
	class: "studio-note"
}, Bu = {
	key: 1,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Vu = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Hu = { class: "studio-card mb-4" }, Uu = { class: "flex-1" }, Wu = ["disabled"], Gu = ["disabled"], Ku = ["disabled"], qu = ["aria-busy"], Ju = { class: "flex flex-wrap items-center justify-between gap-4" }, Yu = {
	class: "studio-capture-label",
	role: "group",
	"aria-label": "Recording sample label"
}, Xu = [
	"data-label",
	"aria-pressed",
	"disabled",
	"onClick"
], Zu = { class: "studio-capture-area" }, Qu = {
	class: "studio-muted",
	role: "status"
}, $u = { class: "studio-capture-timer" }, ed = ["disabled"], td = {
	key: 0,
	class: "studio-note mt-3",
	role: "status"
}, nd = {
	key: 1,
	class: "mt-4"
}, rd = { class: "flex flex-wrap items-center justify-end gap-2 mt-3" }, id = ["disabled"], ad = ["disabled"], od = /* @__PURE__ */ V({
	__name: "RecordPage",
	setup(e) {
		let t = Cs(), n = gu(), { state: r, audio: i, elapsed: a } = n, o = /* @__PURE__ */ L("positive"), s = /* @__PURE__ */ qt(null), c = /* @__PURE__ */ L(null), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(!1), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ qt(null), h = /* @__PURE__ */ L("positive"), g = /* @__PURE__ */ L(), _ = 0, v, y, b, x = X(() => d.value || f.value || p.value || r.value === "requesting" || r.value === "stopping"), S = X(() => !!t.selectedId.value && !x.value && !i.value), C = X(() => !!i.value && !d.value && r.value !== "recording"), w = /* @__PURE__ */ L(), T = X(() => `${String(Math.floor(a.value / 60)).padStart(2, "0")}:${String(a.value % 60).padStart(2, "0")}`);
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
		async function ee() {
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
		async function k() {
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
		function te(e) {
			return !!e?.closest("input,textarea,select,[contenteditable],[inert]");
		}
		function ne(e) {
			if (e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
			let t = e.target instanceof Element ? e.target : null;
			if (te(t) || document.querySelector("[role=\"dialog\"],[aria-modal=\"true\"],dialog[open]")) return;
			let n = !!t?.closest("button:not(:disabled),a,[role=\"button\"]"), i = e.key.toLowerCase();
			C.value ? e.code === "Space" && !n ? (e.preventDefault(), w.value?.canPlay && w.value.play()) : (i === "k" || i === "enter" && !n) && s.value && c.value && !x.value ? (e.preventDefault(), ee()) : i === "d" && !x.value && (e.preventDefault(), E()) : e.code === "Space" && !n && (r.value === "recording" || S.value) && (e.preventDefault(), D());
		}
		return B(i, (e) => {
			e && O();
		}), B(t.selectedId, () => {
			E(), b?.abort(), p.value = !1, m.value = null, g.value && (g.value.value = ""), u.value = "";
		}), wr(() => document.addEventListener("keydown", ne)), Dr(() => {
			document.removeEventListener("keydown", ne), E(), b?.abort();
		}), (e, a) => (W(), G("section", null, [
			K("div", Lu, [a[4] ||= K("div", null, [K("h1", null, "Manual"), K("p", { class: "studio-muted" }, "Upload audio or record from your browser to the selected wakeword.")], -1), K("a", {
				href: R(t).routes.href("samples"),
				onClick: a[0] ||= Yo((e) => R(t).routes.navigate("samples"), ["prevent"])
			}, "View samples →", 8, Ru)]),
			R(t).selectedId.value ? Y("", !0) : (W(), G("p", zu, "Select or create a wakeword to record or upload samples.")),
			u.value ? (W(), G("p", Bu, F(u.value), 1)) : Y("", !0),
			l.value || R(n).error.value ? (W(), G("p", Vu, F(l.value || R(n).error.value), 1)) : Y("", !0),
			K("section", Hu, [
				a[8] ||= K("h2", null, "Upload audio", -1),
				a[9] ||= K("p", { class: "studio-muted mb-3" }, "Uploads keep their own label and import provenance. Adjust trims later in Samples.", -1),
				K("form", {
					"data-form": "import",
					class: "flex flex-wrap gap-3 items-end",
					onSubmit: Yo(k, ["prevent"])
				}, [
					K("label", Uu, [a[5] ||= J("Audio", -1), K("input", {
						ref_key: "uploadInput",
						ref: g,
						name: "import-file",
						type: "file",
						accept: "audio/*",
						required: "",
						disabled: p.value,
						onChange: a[1] ||= (e) => m.value = e.target.files?.[0] ?? null
					}, null, 40, Wu)]),
					K("label", null, [a[7] ||= J("Sample label", -1), z(K("select", {
						name: "import-label",
						"onUpdate:modelValue": a[2] ||= (e) => h.value = e,
						disabled: p.value
					}, [...a[6] ||= [K("option", { value: "positive" }, "Positive", -1), K("option", { value: "negative" }, "Negative", -1)]], 8, Gu), [[Ho, h.value]])]),
					K("button", {
						type: "submit",
						class: "studio-primary",
						disabled: !R(t).selectedId.value || !m.value || x.value || R(r) === "recording"
					}, F(p.value ? "Uploading…" : "Upload audio"), 9, Ku)
				], 32)
			]),
			K("section", {
				class: "studio-card",
				"aria-busy": d.value || f.value
			}, [
				K("div", Ju, [a[10] ||= K("div", null, [K("h2", null, "Microphone recording"), K("p", { class: "studio-muted" }, "One recording, one sample. You decide when to stop.")], -1), K("div", Yu, [(W(), G(U, null, H(["positive", "negative"], (e) => K("button", {
					key: e,
					type: "button",
					"data-label": e,
					"aria-pressed": o.value === e,
					class: P({ "studio-primary": o.value === e }),
					disabled: f.value,
					onClick: (t) => o.value = e
				}, F(e === "positive" ? "Positive" : "Negative"), 11, Xu)), 64))])]),
				K("div", Zu, [
					K("div", Qu, F(R(r) === "recording" ? "Recording…" : R(r) === "requesting" ? "Waiting for microphone permission…" : R(r) === "stopping" ? "Finishing recording…" : R(i) ? "Recording ready for review" : "Ready · browser’s current microphone"), 1),
					K("div", $u, F(T.value), 1),
					K("button", {
						type: "button",
						"data-action": "record-toggle",
						class: P(R(r) === "recording" ? "studio-record-stop" : "studio-primary"),
						disabled: R(r) !== "recording" && !S.value,
						"aria-keyshortcuts": "Space",
						onClick: D
					}, F(R(r) === "recording" ? "■ Stop recording" : "● Start recording"), 11, ed),
					a[11] ||= K("p", { class: "studio-muted text-xs mt-3" }, [K("kbd", null, "Space"), J(" to start / stop · shortcut pauses while typing or using another control")], -1),
					a[12] ||= K("p", { class: "studio-muted text-xs mt-2" }, "Microphone access requires HTTPS or localhost. Maximum recording length: 10 minutes.", -1)
				]),
				d.value ? (W(), G("p", td, "Finding speech and trimming silence…")) : Y("", !0),
				R(i) && !d.value ? (W(), G("div", nd, [
					s.value ? (W(), la(Iu, {
						key: 0,
						ref_key: "review",
						ref: w,
						audio: R(i),
						preview: s.value,
						disabled: f.value,
						onSelection: a[3] ||= (e) => c.value = e
					}, null, 8, [
						"audio",
						"preview",
						"disabled"
					])) : Y("", !0),
					K("div", rd, [
						s.value ? Y("", !0) : (W(), G("button", {
							key: 0,
							type: "button",
							"data-action": "retry-analysis",
							onClick: O
						}, "Retry analysis")),
						K("button", {
							type: "button",
							"data-action": "retake",
							"aria-keyshortcuts": "D",
							disabled: x.value,
							onClick: E
						}, "Retake", 8, id),
						s.value ? (W(), G("button", {
							key: 1,
							type: "button",
							"data-action": "save-capture",
							class: "studio-primary",
							"aria-keyshortcuts": "K Enter",
							disabled: x.value || !c.value,
							onClick: ee
						}, F(f.value ? "Saving…" : "Save sample"), 9, ad)) : Y("", !0)
					]),
					a[13] ||= K("p", { class: "studio-muted text-xs mt-2 text-right" }, [
						K("kbd", null, "Space"),
						J(" play / stop · "),
						K("kbd", null, "K"),
						J(" or "),
						K("kbd", null, "Enter"),
						J(" keep · "),
						K("kbd", null, "D"),
						J(" discard")
					], -1)
				])) : Y("", !0),
				a[14] ||= K("p", { class: "studio-muted text-xs mt-4" }, "VAD trims leading and trailing silence with a small safety margin. No speech detected? Keep the full clip, especially for negative background-noise samples.", -1)
			], 8, qu),
			a[15] ||= K("p", { class: "studio-muted text-xs mt-3" }, "Recordings and uploads appear alongside collected data in Samples, with distinct source metadata.", -1)
		]));
	}
}), sd = ["inert"], cd = { class: "flex flex-wrap items-start justify-between gap-3" }, ld = {
	key: 0,
	class: "studio-muted"
}, ud = ["disabled"], dd = {
	key: 0,
	class: "mt-3"
}, fd = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, pd = {
	key: 1,
	class: "studio-note",
	role: "status"
}, md = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, hd = { key: 0 }, gd = ["disabled"], _d = {
	key: 3,
	class: "studio-muted mt-3"
}, vd = {
	key: 4,
	class: "mt-4 grid gap-2"
}, yd = ["data-device-id"], bd = { class: "studio-muted text-xs" }, xd = { class: "flex flex-wrap gap-2 items-center" }, Sd = ["disabled", "onClick"], Cd = ["onSubmit"], wd = ["name"], Td = ["disabled"], Ed = { class: "flex gap-2" }, Dd = ["disabled", "onClick"], Od = ["disabled", "onClick"], kd = ["onSubmit"], Ad = {
	key: 0,
	class: "studio-muted text-xs"
}, jd = { class: "flex gap-2" }, Md = ["disabled"], Nd = ["disabled"], Pd = {
	key: 0,
	class: "studio-muted"
}, Fd = { key: 0 }, Id = { key: 1 }, Ld = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, Rd = { class: "flex gap-2" }, zd = ["disabled"], Bd = ["disabled"], Vd = /* @__PURE__ */ V({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = sc(), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L("standalone"), s = /* @__PURE__ */ L(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(), g = /* @__PURE__ */ L(), _ = null;
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
			_ = t.currentTarget, m.value = e, await bn(), typeof h.value?.showModal == "function" ? h.value.showModal() : h.value?.setAttribute("open", ""), h.value?.querySelector("button")?.focus();
		}
		async function x() {
			m.value = null, await bn(), _?.isConnected ? _.focus() : g.value?.querySelector("[data-action=\"refresh-registry\"]")?.focus();
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
				l.value = `delete:${m.value.id}`, d.value = "", await bn(), h.value?.focus();
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
		async function ee(e) {
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
		return wr(async () => {
			await i.load(), E();
		}), Dr(() => i.abort()), (e, t) => (W(), G("section", {
			ref_key: "registryElement",
			ref: g,
			class: "studio-card",
			"data-device-registry": ""
		}, [K("div", {
			"data-device-registry-content": "",
			inert: m.value ? !0 : void 0
		}, [
			K("div", cd, [K("div", null, [t[8] ||= K("h2", null, "Fleet setup", -1), n.surface === "kiosks" ? Y("", !0) : (W(), G("p", ld, "Register a fleet leader or standalone kiosks."))]), K("button", {
				type: "button",
				"data-action": "refresh-registry",
				disabled: R(i).loading.value,
				onClick: t[0] ||= (e) => R(i).load(!0)
			}, "Refresh registry", 8, ud)]),
			n.surface === "kiosks" ? Y("", !0) : (W(), G("details", dd, [
				t[9] ||= K("summary", null, "Fleet safety details", -1),
				t[10] ||= K("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (W(), G("p", fd, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : Y("", !0)
			])),
			u.value ? (W(), G("p", pd, F(u.value), 1)) : Y("", !0),
			d.value || R(i).error.value ? (W(), G("p", md, F(d.value || R(i).error.value), 1)) : Y("", !0),
			(W(), la(Fr(n.surface === "kiosks" ? "div" : "details"), {
				"data-device-registration": "",
				class: "mt-3",
				open: n.surface !== "kiosks" && !R(i).devices.value.length || void 0
			}, {
				default: Pn(() => [
					n.surface === "kiosks" ? Y("", !0) : (W(), G("summary", hd, "Add device")),
					K("form", {
						"data-device-add": "",
						class: "studio-registration-row",
						onSubmit: Yo(D, ["prevent"])
					}, [
						K("label", null, [t[11] ||= J("Address", -1), z(K("input", {
							"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
							required: "",
							name: "url",
							autocomplete: "url",
							placeholder: "http://kiosk.local:2324"
						}, null, 512), [[zo, a.value]])]),
						K("label", null, [t[13] ||= J("Role", -1), z(K("select", {
							"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
							name: "role"
						}, [...t[12] ||= [K("option", { value: "standalone" }, "Standalone", -1), K("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Ho, o.value]])]),
						K("label", null, [t[14] ||= J("Admin password", -1), K("input", {
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
						}, "Add device", 8, gd)
					], 32),
					t[15] ||= K("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
				]),
				_: 1
			}, 8, ["open"])),
			R(i).loading.value ? (W(), G("p", _d, "Loading registered devices…")) : (W(), G("div", vd, [(W(!0), G(U, null, H(R(i).devices.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [
				K("div", null, [
					K("strong", null, F(R(i).deviceLabel(e.id)), 1),
					t[16] ||= J(),
					K("span", { class: P(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, F(e.role === "follower" ? "Follower" : e.role), 3),
					K("p", bd, F(T(e)) + " · " + F(e.url) + F(e.active ? "" : " · Inactive member"), 1)
				]),
				K("div", xd, [
					K("span", { class: P(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, F(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
					K("span", { class: P(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, F(e.model_eligible ? "Profile covered" : "Not covered"), 3),
					e.role === "leader" ? (W(), G("button", {
						key: 0,
						type: "button",
						disabled: l.value === `refresh:${e.id}`,
						onClick: (t) => O(e)
					}, "Refresh followers", 8, Sd)) : Y("", !0),
					e.role === "follower" && e.credentials_status !== "ready" ? (W(), G("form", {
						key: 1,
						class: "flex gap-2",
						onSubmit: Yo((t) => ee(e), ["prevent"])
					}, [K("input", {
						ref_for: !0,
						ref: (t) => w(e.id, t),
						name: `credentials-${e.id}`,
						required: "",
						type: "password",
						autocomplete: "off",
						"aria-label": "Follower admin password"
					}, null, 8, wd), K("button", {
						type: "submit",
						disabled: l.value === `credentials:${e.id}`
					}, "Authenticate", 8, Td)], 40, Cd)) : Y("", !0)
				]),
				K("div", Ed, [K("button", {
					type: "button",
					"data-action": "edit-device",
					disabled: !!l.value,
					onClick: (t) => v(e)
				}, "Edit", 8, Dd), K("button", {
					type: "button",
					"data-action": "delete-device",
					disabled: !!l.value,
					onClick: (t) => b(e, t)
				}, "Delete", 8, Od)]),
				f.value === e.id ? (W(), G("form", {
					key: 0,
					"data-device-edit": "",
					class: "studio-card grid gap-3",
					style: {
						"grid-column": "1 / -1",
						width: "100%"
					},
					onSubmit: Yo((t) => y(e), ["prevent"])
				}, [
					K("label", null, [t[17] ||= J("Studio connection address", -1), z(K("input", {
						"onUpdate:modelValue": t[3] ||= (e) => p.value = e,
						name: "device-url",
						required: "",
						type: "url"
					}, null, 512), [[zo, p.value]])]),
					e.role === "follower" ? (W(), G("p", Ad, "Local override: this address is retained when followers refresh. Fleet membership stays leader-managed.")) : Y("", !0),
					K("div", jd, [K("button", {
						class: "studio-primary",
						disabled: !!l.value,
						type: "submit"
					}, "Save address", 8, Md), K("button", {
						type: "button",
						"data-action": "cancel-device-edit",
						disabled: !!l.value,
						onClick: t[4] ||= (e) => f.value = ""
					}, "Cancel", 8, Nd)])
				], 40, kd)) : Y("", !0)
			], 8, yd))), 128)), R(i).devices.value.length ? Y("", !0) : (W(), G("p", Pd, "No kiosks registered yet."))]))
		], 8, sd), m.value ? (W(), G("dialog", {
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
			K("h2", null, "Remove " + F(R(i).deviceLabel(m.value.id)) + " from Studio?", 1),
			m.value.role === "leader" ? (W(), G("p", Fd, "This also removes its discovered followers from the Studio registry.")) : m.value.role === "follower" ? (W(), G("p", Id, "This follower can be rediscovered on the next fleet refresh.")) : Y("", !0),
			t[18] ||= K("p", null, "Saved recordings and models are kept. This does not change the kiosk itself.", -1),
			d.value ? (W(), G("p", Ld, F(d.value), 1)) : Y("", !0),
			K("div", Rd, [K("button", {
				"data-action": "cancel-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: x
			}, "Keep kiosk", 8, zd), K("button", {
				"data-action": "confirm-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: C
			}, "Remove from Studio", 8, Bd)])
		], 544)) : Y("", !0)], 512));
	}
}), Hd = /* @__PURE__ */ V({
	__name: "KiosksPage",
	setup(e) {
		return (e, t) => (W(), G("section", null, [t[0] ||= K("div", { class: "mb-4" }, [K("h1", null, "Kiosks"), K("p", { class: "studio-muted" }, "Connect and manage your kiosk fleet.")], -1), q(Vd, { surface: "kiosks" })]));
	}
}), Ud = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Wd = ["name"], Gd = ["name"], Kd = /* @__PURE__ */ V({
	__name: "AutomationScheduleFields",
	props: /*@__PURE__*/ Ur({ prefix: {} }, {
		modelValue: { required: !0 },
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = li(e, "modelValue");
		return (n, r) => (W(), G("div", Ud, [K("label", null, [r[2] ||= J("Schedule (five-field cron)", -1), z(K("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value.cron = e,
			name: `${e.prefix}-cron`,
			required: "",
			placeholder: "*/30 * * * *",
			maxlength: "256"
		}, null, 8, Wd), [[zo, t.value.cron]])]), K("label", null, [r[3] ||= J("Time zone", -1), z(K("input", {
			"onUpdate:modelValue": r[1] ||= (e) => t.value.timezone = e,
			name: `${e.prefix}-timezone`,
			required: "",
			placeholder: "UTC",
			maxlength: "100"
		}, null, 8, Gd), [[zo, t.value.timezone]])])]));
	}
}), qd = {
	key: 0,
	class: "studio-card"
}, Jd = {
	key: 1,
	role: "status"
}, Yd = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Xd = {
	key: 3,
	class: "studio-note",
	role: "status"
}, Zd = { class: "studio-card" }, Qd = { class: "flex flex-wrap items-center justify-between gap-3" }, $d = { class: "studio-checkbox-label" }, ef = { class: "studio-muted" }, tf = { class: "studio-muted text-xs mt-3" }, nf = { class: "studio-card" }, rf = { class: "flex flex-wrap items-center justify-between gap-3" }, af = { class: "studio-checkbox-label" }, of = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, sf = { class: "mt-3" }, cf = { class: "studio-checkbox-label my-3" }, lf = { class: "studio-checkbox-label my-3" }, uf = { class: "studio-muted text-xs mt-3" }, df = { class: "grid gap-4 lg:grid-cols-2" }, ff = { class: "studio-card" }, pf = { class: "flex flex-wrap items-center justify-between gap-3" }, mf = { class: "studio-checkbox-label" }, hf = { class: "studio-checkbox-label my-3" }, gf = { class: "studio-muted text-xs" }, _f = { class: "studio-card" }, vf = { class: "flex flex-wrap items-center justify-between gap-3" }, yf = { class: "studio-status studio-status-muted" }, bf = { class: "studio-checkbox-label my-3" }, xf = { class: "studio-checkbox-label my-3" }, Sf = { class: "studio-muted text-xs" }, Cf = ["disabled"], wf = /* @__PURE__ */ V({
	__name: "AutomatePage",
	setup(e) {
		let t = Cs(), n = X(() => t.selectedId.value), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l, u, d = 0, f = X(() => r.value?.deployment.enabled ? r.value.deployment_policy.after_training ? "Scheduled + after training" : "Scheduled" : r.value?.deployment_policy.after_training ? "After training" : "Manual only");
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
		}, { immediate: !0 }), Dr(() => {
			d++, l?.abort(), u?.abort();
		}), (e, i) => (W(), G("section", null, [
			i[40] ||= K("div", { class: "mb-4" }, [K("h1", null, "Automate"), K("p", { class: "studio-muted" }, "Collection, classification, training, and deployment for the selected workspace.")], -1),
			n.value ? Y("", !0) : (W(), G("p", qd, "Choose a wakeword to configure automation.")),
			a.value ? (W(), G("p", Jd, "Loading automation…")) : Y("", !0),
			s.value ? (W(), G("p", Yd, [J(F(s.value) + " ", 1), r.value ? Y("", !0) : (W(), G("button", {
				key: 0,
				onClick: m
			}, "Retry"))])) : Y("", !0),
			c.value ? (W(), G("p", Xd, F(c.value), 1)) : Y("", !0),
			r.value ? (W(), G("form", {
				key: 4,
				class: "grid gap-4",
				onSubmit: Yo(h, ["prevent"])
			}, [
				K("section", Zd, [
					K("div", Qd, [i[15] ||= K("h2", null, "Automatic collection", -1), K("label", $d, [z(K("input", {
						"onUpdate:modelValue": i[0] ||= (e) => r.value.collection.enabled = e,
						name: "collection-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.collection.enabled]]), i[14] ||= J("Enabled", -1)])]),
					K("p", ef, [
						i[16] ||= J("Collect recordings mapped to ", -1),
						K("strong", null, F(R(t).selected.value?.phrase ?? "this workspace"), 1),
						i[17] ||= J(" from registered kiosks. Existing recordings are preserved when disabled.", -1)
					]),
					q(Kd, {
						modelValue: r.value.collection,
						"onUpdate:modelValue": i[1] ||= (e) => r.value.collection = e,
						prefix: "collection"
					}, null, 8, ["modelValue"]),
					K("p", tf, F(p("scrape")), 1)
				]),
				K("section", nf, [
					K("div", rf, [i[19] ||= K("h2", null, "Automatic classification", -1), K("label", af, [z(K("input", {
						"onUpdate:modelValue": i[2] ||= (e) => r.value.classification.enabled = e,
						name: "classification-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.classification.enabled]]), i[18] ||= J("Enabled", -1)])]),
					i[28] ||= K("p", { class: "studio-muted" }, "Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.", -1),
					K("div", of, [K("label", null, [i[21] ||= J("Speech recognition engine", -1), z(K("select", {
						"onUpdate:modelValue": i[3] ||= (e) => r.value.classification.engine = e,
						name: "stt-engine"
					}, [...i[20] ||= [K("option", { value: "faster_whisper" }, "Faster Whisper · recommended", -1), K("option", { value: "parakeet_onnx" }, "Parakeet ONNX", -1)]], 512), [[Ho, r.value.classification.engine]])]), K("label", null, [i[23] ||= J("Run", -1), z(K("select", {
						"onUpdate:modelValue": i[4] ||= (e) => r.value.classification.trigger = e,
						name: "classification-trigger"
					}, [...i[22] ||= [K("option", { value: "after_collection" }, "After collection", -1), K("option", { value: "schedule" }, "On a schedule", -1)]], 512), [[Ho, r.value.classification.trigger]])])]),
					r.value.classification.trigger === "schedule" ? (W(), la(Kd, {
						key: 0,
						modelValue: r.value.classification_schedule,
						"onUpdate:modelValue": i[5] ||= (e) => r.value.classification_schedule = e,
						prefix: "classification"
					}, null, 8, ["modelValue"])) : Y("", !0),
					K("details", sf, [
						i[26] ||= K("summary", null, "Classification rules", -1),
						K("label", cf, [z(K("input", {
							"onUpdate:modelValue": i[6] ||= (e) => r.value.classification.auto_negatives = e,
							type: "checkbox"
						}, null, 512), [[Bo, r.value.classification.auto_negatives]]), i[24] ||= J("Label clear non-wake activations as negatives", -1)]),
						K("label", lf, [z(K("input", {
							"onUpdate:modelValue": i[7] ||= (e) => r.value.classification.promote_close_misses = e,
							type: "checkbox"
						}, null, 512), [[Bo, r.value.classification.promote_close_misses]]), i[25] ||= J("Promote confirmed close misses to positives", -1)]),
						i[27] ||= K("p", { class: "studio-muted text-xs" }, "Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is automatically deleted.", -1)
					]),
					K("p", uf, F(p("classify")), 1)
				]),
				K("div", df, [K("section", ff, [
					K("div", pf, [i[30] ||= K("h2", null, "Automatic training", -1), K("label", mf, [z(K("input", {
						"onUpdate:modelValue": i[8] ||= (e) => r.value.training.enabled = e,
						name: "training-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.training.enabled]]), i[29] ||= J("Enabled", -1)])]),
					i[32] ||= K("p", { class: "studio-muted" }, "Create an archived model from reviewed and selected inputs.", -1),
					q(Kd, {
						modelValue: r.value.training,
						"onUpdate:modelValue": i[9] ||= (e) => r.value.training = e,
						prefix: "training"
					}, null, 8, ["modelValue"]),
					K("label", hf, [z(K("input", {
						"onUpdate:modelValue": i[10] ||= (e) => r.value.skip_unchanged = e,
						type: "checkbox"
					}, null, 512), [[Bo, r.value.skip_unchanged]]), i[31] ||= J("Skip when inputs are unchanged", -1)]),
					i[33] ||= K("p", { class: "studio-note text-xs" }, "Training and deployment are separate. Training alone does not publish a model.", -1),
					K("p", gf, F(p("train")), 1)
				]), K("section", _f, [
					K("div", vf, [i[34] ||= K("h2", null, "Automatic deployment", -1), K("span", yf, F(f.value), 1)]),
					i[37] ||= K("p", { class: "studio-muted" }, "Publish eligible archives to your registered fleet targets.", -1),
					K("label", bf, [z(K("input", {
						"onUpdate:modelValue": i[11] ||= (e) => r.value.deployment_policy.after_training = e,
						name: "after-training",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.deployment_policy.after_training]]), i[35] ||= J("Deploy after successful training", -1)]),
					i[38] ||= K("p", { class: "studio-muted text-xs" }, "Optional. Failed, cancelled, or skipped runs do not trigger deployment.", -1),
					K("label", xf, [z(K("input", {
						"onUpdate:modelValue": i[12] ||= (e) => r.value.deployment.enabled = e,
						name: "deployment-enabled",
						type: "checkbox"
					}, null, 512), [[Bo, r.value.deployment.enabled]]), i[36] ||= J("Enable scheduled deployment", -1)]),
					r.value.deployment.enabled ? (W(), la(Kd, {
						key: 0,
						modelValue: r.value.deployment,
						"onUpdate:modelValue": i[13] ||= (e) => r.value.deployment = e,
						prefix: "deployment"
					}, null, 8, ["modelValue"])) : Y("", !0),
					i[39] ||= K("p", { class: "studio-muted text-xs mt-3" }, "Publish the latest new eligible archive; skip if there is nothing new. Manual rollbacks are retained until a new archive is available.", -1),
					K("p", Sf, F(p("deploy")), 1)
				])]),
				K("button", {
					type: "submit",
					class: "studio-primary",
					disabled: o.value || a.value
				}, F(o.value ? "Saving…" : "Save automation settings"), 9, Cf)
			], 32)) : Y("", !0)
		]));
	}
}), Tf = {
	key: 0,
	class: "studio-note",
	role: "status"
}, Ef = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Df = {
	key: 2,
	class: "studio-card studio-safety mb-4",
	"data-staging-notice": ""
}, Of = {
	class: "studio-note",
	"data-quarantine-notice": "",
	role: "alert"
}, kf = { class: "studio-muted" }, Af = { class: "mb-4" }, jf = ["href"], Mf = ["href"], Nf = { class: "studio-card mb-4" }, Pf = {
	key: 0,
	class: "studio-muted"
}, Ff = {
	key: 1,
	class: "grid gap-3"
}, If = ["data-version-id"], Lf = { class: "flex flex-wrap justify-between gap-3" }, Rf = { class: "min-w-0 flex-1" }, zf = { class: "studio-muted text-xs" }, Bf = {
	key: 0,
	class: "studio-note text-xs"
}, Vf = { class: "flex flex-wrap items-center gap-2" }, Hf = ["href"], Uf = ["disabled", "onClick"], Wf = [
	"data-action",
	"disabled",
	"onClick"
], Gf = {
	key: 0,
	class: "studio-muted text-xs"
}, Kf = {
	key: 2,
	class: "studio-muted"
}, qf = { class: "studio-card" }, Jf = ["data-device-status"], Yf = {
	key: 0,
	class: "studio-status studio-status-muted"
}, Xf = { class: "studio-muted text-xs" }, Zf = { class: "text-xs" }, Qf = {
	key: 0,
	class: "studio-muted text-xs"
}, $f = { key: 0 }, ep = {
	key: 0,
	class: "studio-muted"
}, tp = {
	key: 3,
	class: "studio-modal-backdrop"
}, np = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm rollback"
}, rp = { class: "flex gap-2" }, ip = ["disabled"], ap = /* @__PURE__ */ V({
	__name: "DeployPage",
	setup(e) {
		let t = Cs(), n = sc(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(""), d, f, p = 0, m = 0, h = !1, g = X(() => new Map(n.devices.value.map((e) => [e.id, e])));
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
		}, { immediate: !0 }), Dr(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, d) => (W(), G("section", null, [
			d[14] ||= K("div", { class: "mb-4" }, [K("h1", null, "Deploy"), K("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (W(), G("p", Tf, F(c.value), 1)) : Y("", !0),
			s.value ? (W(), G("p", Ef, F(s.value), 1)) : Y("", !0),
			a.value ? (W(), G("section", Df, [
				d[6] ||= K("h2", null, "Before publishing", -1),
				d[7] ||= K("p", null, [K("strong", null, "Clean, exclusive staging required."), J(" No concurrent manual uploads; staging cannot be checked automatically.")], -1),
				K("p", Of, [d[3] ||= K("strong", null, "Quarantine warning:", -1), J(" " + F(a.value.quarantine_notice), 1)]),
				K("details", null, [
					d[4] ||= K("summary", null, "Publication safety details", -1),
					K("p", null, F(a.value.notice), 1),
					d[5] ||= K("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
					K("p", kf, F(a.value.operator_action), 1)
				])
			])) : Y("", !0),
			K("p", Af, [
				K("a", {
					href: R(t).routes.href("kiosks"),
					onClick: d[0] ||= Yo((e) => R(t).routes.navigate("kiosks"), ["prevent"])
				}, "Manage kiosks →", 8, jf),
				d[8] ||= J(" · ", -1),
				K("a", {
					href: R(t).routes.href("automate"),
					onClick: d[1] ||= Yo((e) => R(t).routes.navigate("automate"), ["prevent"])
				}, "Deployment automation →", 8, Mf)
			]),
			K("section", Nf, [d[9] ||= K("h2", null, "Archived model versions", -1), o.value ? (W(), G("p", Pf, "Loading archives…")) : r.value.length ? (W(), G("div", Ff, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [K("div", Lf, [K("div", Rf, [
				K("strong", null, F(e.id), 1),
				K("p", zf, F(e.trained_at) + " · Run " + F(e.run_id), 1),
				e.origin === "legacy" ? (W(), G("p", Bf, "Legacy import · " + F(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : Y("", !0)
			]), K("div", Vf, [
				K("a", { href: R($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, Hf),
				K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, F(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, Uf),
				K("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Wf)
			])]), R(_s)(e.metrics).recall === null ? Y("", !0) : (W(), G("p", Gf, "Recall " + F(R(_s)(e.metrics).recall), 1))], 8, If))), 128))])) : (W(), G("p", Kf, "No archived model versions for this workspace."))]),
			K("section", qf, [
				d[11] ||= K("h2", null, "Target delivery", -1),
				d[12] ||= K("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [K("div", null, [
					K("strong", null, F(R(n).deviceLabel(e.device_id)), 1),
					d[10] ||= J(),
					g.value.get(e.device_id)?.role === "follower" ? (W(), G("span", Yf, "Follower")) : Y("", !0),
					K("p", Xf, F(g.value.get(e.device_id)?.leader_id ? `Indirect via ${R(n).deviceLabel(g.value.get(e.device_id).leader_id)}` : "Direct leader/standalone target"), 1)
				]), K("div", null, [
					K("span", { class: P(["studio-status", v(e)]) }, F(e.state), 3),
					K("p", Zf, "Desired " + F(e.desired_version) + " · Observed " + F(y(e)), 1),
					e.error_code ? (W(), G("p", Qf, [J("Retry/error: " + F(e.error_code), 1), e.next_retry ? (W(), G("span", $f, " · next " + F(e.next_retry), 1)) : Y("", !0)])) : Y("", !0)
				])], 8, Jf))), 128)),
				i.value.length ? Y("", !0) : (W(), G("p", ep, "No publication status yet."))
			]),
			l.value ? (W(), G("div", tp, [K("section", np, [
				d[13] ||= K("h2", null, "Rollback archive?", -1),
				K("p", null, "Republish " + F(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				K("div", rp, [K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, ip), K("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: d[2] ||= (e) => l.value = null
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
});
//#endregion
//#region src/studio/datasetFormat.ts
function op(e) {
	return e == null ? "Size unknown" : `${Number((e / 1e9).toPrecision(4))} GB`;
}
function sp(e) {
	return e == null ? "Sample count unknown" : `${e.toLocaleString()} samples`;
}
//#endregion
//#region src/studio/components/AugmentationDatasets.vue?vue&type=script&setup=true&lang.ts
var cp = {
	"data-augmentation-datasets": "",
	class: "studio-card mt-4"
}, lp = { class: "studio-toolbar" }, up = ["disabled"], dp = ["disabled"], fp = {
	key: 0,
	class: "studio-muted mt-3"
}, pp = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, mp = ["data-augmentation-id"], hp = { class: "studio-dataset-row" }, gp = { class: "studio-checkbox-label" }, _p = [
	"disabled",
	"checked",
	"onChange"
], vp = { class: "studio-dataset-copy" }, yp = { class: "studio-muted text-xs" }, bp = { class: "studio-muted text-xs" }, xp = { class: "studio-dataset-actions" }, Sp = ["disabled", "onClick"], Cp = ["onClick"], wp = {
	key: 0,
	class: "studio-note text-xs mt-3",
	role: "alert"
}, Tp = /* @__PURE__ */ V({
	__name: "AugmentationDatasets",
	emits: ["catalog"],
	setup(e, { emit: t }) {
		let n = t, r = Cs(), i = X(() => r.selectedId.value), a = zc(), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), f, p, m = /* @__PURE__ */ new Set(), h = !1;
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
				} : t)), a.track(n), a.show(n.id));
			} catch (e) {
				t.signal.aborted || (l.value = e instanceof Error ? e.message : "Unable to start augmentation download.");
			} finally {
				m.delete(t);
				let n = new Set(d.value);
				n.delete(e.id), d.value = n;
			}
		}
		return B(() => Object.values(a.jobs.value).filter((e) => e.kind === "download" && e.payload.augmentation_id).map((e) => ({
			id: e.id,
			active: Ic(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && _();
		}), B(i, () => {
			p?.abort(), c.value = !1, s.value = /* @__PURE__ */ new Set(), o.value = null, l.value = "", _(!1);
		}, { immediate: !0 }), Dr(() => {
			h = !0, f?.abort(), p?.abort(), m.forEach((e) => e.abort());
		}), (e, t) => (W(), G("section", cp, [
			K("div", lp, [
				t[1] ||= K("h2", null, "Augmentation datasets", -1),
				K("button", {
					type: "button",
					disabled: u.value,
					onClick: t[0] ||= (e) => _()
				}, "Refresh status", 8, up),
				K("button", {
					type: "button",
					"data-action": "save-augmentation",
					class: "studio-primary",
					disabled: c.value || u.value || !i.value || !o.value,
					onClick: y
				}, F(c.value ? "Saving…" : "Save selection"), 9, dp)
			]),
			t[2] ||= K("p", { class: "studio-muted mt-3" }, "Downloads are shared; select usage per wakeword. All are enabled by default. Training mixes selected backgrounds and room echoes into your samples before creating model features.", -1),
			u.value && !o.value ? (W(), G("p", fp, "Checking augmentation datasets…")) : Y("", !0),
			l.value ? (W(), G("p", pp, F(l.value), 1)) : Y("", !0),
			(W(!0), G(U, null, H(o.value?.items ?? [], (e) => (W(), G("article", {
				key: e.id,
				"data-augmentation-id": e.id,
				class: "studio-history mt-3"
			}, [K("div", hp, [K("label", gp, [K("input", {
				type: "checkbox",
				disabled: !i.value || c.value,
				checked: s.value.has(e.id),
				onChange: (t) => v(e.id, t.target.checked)
			}, null, 40, _p), K("div", vp, [
				K("strong", null, F(e.name), 1),
				K("p", yp, F(e.description) + " · " + F(e.source), 1),
				K("p", bp, F(R(op)(e.installed_bytes ?? e.download_bytes)) + F(e.installed_bytes === null ? "" : " installed") + " · " + F(R(sp)(e.file_count)), 1)
			])]), K("div", xp, [
				K("span", { class: P(["studio-status", `studio-status-${x(e)}`]) }, F(x(e)), 3),
				x(e) === "installed" ? Y("", !0) : (W(), G("button", {
					key: 0,
					type: "button",
					disabled: w(e),
					onClick: (t) => T(e)
				}, F(w(e) ? "Preparing…" : [
					"failed",
					"cancelled",
					"interrupted"
				].includes(x(e)) ? "Retry download" : "Download & prepare"), 9, Sp)),
				C(e) ? (W(), G("button", {
					key: 1,
					type: "button",
					onClick: (t) => R(a).show(C(e))
				}, "View in queue", 8, Cp)) : Y("", !0)
			])]), S(e) ? (W(), G("p", wp, F(S(e)), 1)) : Y("", !0)], 8, mp))), 128))
		]));
	}
}), Ep = {
	key: 0,
	"data-disk-warning": "",
	class: "studio-note mb-4",
	role: "status"
}, Dp = { class: "studio-card" }, Op = { class: "studio-toolbar" }, kp = ["disabled"], Ap = {
	key: 0,
	class: "studio-muted mt-3"
}, jp = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, Mp = {
	key: 2,
	class: "studio-table mt-3 grid gap-3"
}, Np = { class: "studio-dataset-row" }, Pp = { class: "studio-checkbox-label" }, Fp = [
	"data-dataset-id",
	"checked",
	"onChange"
], Ip = { class: "studio-dataset-copy" }, Lp = { class: "studio-muted text-xs" }, Rp = { class: "studio-muted text-xs" }, zp = {
	key: 0,
	class: "studio-note block text-xs"
}, Bp = { class: "studio-dataset-actions" }, Vp = ["disabled", "onClick"], Hp = ["onClick"], Up = {
	key: 3,
	class: "studio-muted mt-3"
}, Wp = /* @__PURE__ */ V({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = Cs(), n = zc(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f, p, m, h = 0, g = 0, _ = 0, v = X(() => t.selectedId.value), y = X(() => [...s.value].sort());
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
			p?.abort(), m?.abort(), p = void 0, m = void 0, g += 1, _ += 1, l.value = !1, u.value = !1;
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
		async function T(e = !1) {
			f?.abort();
			let t = new AbortController();
			f = t;
			let n = ++h, o = v.value;
			if (r.value = [], i.value = 0, e || (s.value = /* @__PURE__ */ new Set()), d.value = "", o) {
				c.value = !0;
				try {
					let c = {
						offset: a.value,
						limit: 50
					}, [l, u] = await Promise.all([$.datasets(o, c, t.signal), w(o, t)]);
					if (!b(o, n, t)) return;
					r.value = l.items, i.value = l.total, e || (s.value = new Set(u.map((e) => e.id)));
				} catch (e) {
					b(o, n, t) && (d.value = e instanceof Error ? e.message : "Unable to load datasets.");
				} finally {
					b(o, n, t) && (c.value = !1);
				}
			}
		}
		function E(e, t) {
			let n = new Set(s.value);
			t ? n.add(e) : n.delete(e), s.value = n;
		}
		async function D() {
			let e = v.value;
			if (!e) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, r = y.value;
			l.value = !0, d.value = "";
			try {
				await $.selectDatasets(e, r, t.signal), x(e, n, t) && await T();
			} catch (r) {
				x(e, n, t) && (d.value = r instanceof Error ? r.message : "Dataset selection was not saved.");
			} finally {
				x(e, n, t) && (l.value = !1);
			}
		}
		async function O(e) {
			let t = v.value;
			if (!t) return;
			m?.abort();
			let i = new AbortController();
			m = i;
			let a = ++_;
			u.value = !0, d.value = "";
			try {
				let o = await $.downloadDataset(e.id, i.signal);
				S(t, a, i) && (n.track(o), n.show(o.id), r.value = r.value.map((t) => t.id === e.id ? {
					...t,
					status: o.status,
					job_id: o.id
				} : t));
			} catch (e) {
				S(t, a, i) && (d.value = e instanceof Error ? e.message : "Dataset download was not started.");
			} finally {
				S(t, a, i) && (u.value = !1);
			}
		}
		return B(() => Object.values(n.jobs.value).filter((e) => e.kind === "download").map((e) => ({
			id: e.id,
			active: Ic(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && T(!0);
		}), B(v, () => {
			C(), T();
		}, { immediate: !0 }), B(a, () => {
			T();
		}), Dr(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[4] ||= K("div", { class: "mb-4" }, [K("h1", null, "Downloaded"), K("p", { class: "studio-muted" }, "Download shared training resources. Choose negative, evaluation, and augmentation datasets per wakeword; all are enabled by default.")], -1),
			o.value && o.value.storage_total_bytes > 0 && o.value.storage_free_bytes / o.value.storage_total_bytes < .1 ? (W(), G("p", Ep, "Disk space is low: " + F(R(op)(o.value.storage_free_bytes)) + " free of " + F(R(op)(o.value.storage_total_bytes)) + " on the data volume. Free space before downloading large datasets or starting training.", 1)) : Y("", !0),
			K("div", Dp, [
				t[2] ||= K("h2", null, "Negative & evaluation datasets", -1),
				t[3] ||= K("p", { class: "studio-muted mb-3" }, "Downloads are shared. Save a separate classifier selection for each wakeword.", -1),
				K("div", Op, [K("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: l.value || !v.value,
					onClick: D
				}, F(l.value ? "Saving…" : "Save selection"), 9, kp)]),
				c.value ? (W(), G("p", Ap, "Loading catalog…")) : Y("", !0),
				d.value ? (W(), G("p", jp, F(d.value), 1)) : Y("", !0),
				r.value.length ? (W(), G("div", Mp, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history"
				}, [K("div", Np, [K("label", Pp, [K("input", {
					"data-dataset-id": e.id,
					type: "checkbox",
					checked: s.value.has(e.id),
					onChange: (t) => E(e.id, t.target.checked)
				}, null, 40, Fp), K("div", Ip, [
					K("strong", null, F(e.name), 1),
					K("p", Lp, F(e.description) + " · " + F(e.source), 1),
					K("p", Rp, F(R(op)(e.installed_bytes ?? e.download_bytes)) + F(e.installed_bytes === null ? "" : " installed") + " · " + F(R(sp)(e.sample_count)), 1),
					e.split === "evaluation" ? (W(), G("span", zp, "Evaluation-only: this dataset is not sampled as a training input.")) : Y("", !0)
				])]), K("div", Bp, [
					K("span", { class: P(["studio-status", `studio-status-${e.status}`]) }, F(e.status), 3),
					e.status === "available" || e.status === "failed" ? (W(), G("button", {
						key: 0,
						type: "button",
						disabled: u.value,
						onClick: (t) => O(e)
					}, "Download", 8, Vp)) : Y("", !0),
					e.job_id ? (W(), G("button", {
						key: 1,
						type: "button",
						"data-action": "view-dataset-job",
						onClick: (t) => R(n).show(e.job_id)
					}, "View in queue", 8, Hp)) : Y("", !0)
				])])]))), 128))])) : c.value ? Y("", !0) : (W(), G("p", Up, "No catalog datasets are available.")),
				q(fc, {
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
			q(Tp, { onCatalog: t[1] ||= (e) => o.value = e })
		]));
	}
}), Gp = { class: "studio-card" }, Kp = {
	"data-generation-phrase": "",
	class: "studio-muted"
}, qp = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, Jp = ["value"], Yp = ["value"], Xp = ["disabled"], Zp = ["value"], Qp = {
	key: 1,
	value: "mixed"
}, $p = { class: "grid gap-3 sm:grid-cols-2" }, em = { class: "flex items-center justify-between gap-3" }, tm = { class: "studio-checkbox-label" }, nm = [
	"data-engine",
	"disabled",
	"checked",
	"onChange"
], rm = [
	"data-preview",
	"disabled",
	"onClick"
], im = {
	key: 0,
	class: "studio-muted text-xs mt-2"
}, am = {
	key: 1,
	role: "alert",
	class: "studio-note mt-3"
}, om = ["onClick"], sm = [
	"data-preview-audio",
	"src",
	"aria-label"
], cm = {
	key: 0,
	class: "studio-history"
}, lm = { class: "studio-checkbox-label" }, um = ["checked"], dm = {
	key: 0,
	class: "studio-muted"
}, fm = {
	key: 1,
	"data-source-picker": ""
}, pm = {
	key: 0,
	role: "alert"
}, mm = [
	"data-source",
	"checked",
	"disabled",
	"onChange"
], hm = { key: 1 }, gm = { class: "studio-muted text-xs" }, _m = ["disabled"], vm = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, ym = { class: "studio-card mt-4" }, bm = { class: "flex flex-wrap items-center justify-between gap-3" }, xm = ["disabled"], Sm = {
	key: 0,
	class: "studio-muted mt-3"
}, Cm = { class: "studio-dataset-row" }, wm = { class: "studio-checkbox-label" }, Tm = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], Em = { class: "studio-muted block text-xs" }, Dm = {
	key: 0,
	class: "studio-muted block text-xs"
}, Om = { class: "studio-status ml-auto" }, km = [
	"data-delete-batch",
	"disabled",
	"onClick"
], Am = {
	key: 0,
	class: "studio-muted text-xs"
}, jm = { class: "flex gap-2 mt-3" }, Mm = ["disabled"], Nm = ["disabled"], Pm = {
	key: 1,
	class: "studio-muted mt-3"
}, Fm = /* @__PURE__ */ V({
	__name: "ArtificialPage",
	setup(e) {
		let t = Cs(), n = zc(), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L(0), o = /* @__PURE__ */ L(0), s = /* @__PURE__ */ L({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), c = /* @__PURE__ */ L(/* @__PURE__ */ new Set()), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L({}), m = /* @__PURE__ */ L({}), h = /* @__PURE__ */ L({}), g = /* @__PURE__ */ L(null), _ = /* @__PURE__ */ L({}), v = /* @__PURE__ */ L([]), y = /* @__PURE__ */ L(0), b = /* @__PURE__ */ L(0), x = /* @__PURE__ */ L(!1), S = /* @__PURE__ */ L(""), C, w = X(() => s.value.engines?.includes("moss")), T = X(() => s.value.engines?.filter((e) => e !== "moss").length ?? 0), E = X(() => T.value * s.value.samples + (w.value ? s.value.moss_samples ?? s.value.samples : 0));
		async function D() {
			C?.abort();
			let e = new AbortController();
			C = e;
			let t = M.value, n = s.value.language;
			v.value = [], y.value = 0, S.value = "", x.value = !0;
			try {
				if (!t) return;
				let r = await $.generationSources(t, {
					language: n,
					offset: b.value,
					limit: 50
				}, e.signal);
				if (e.signal.aborted || M.value !== t || s.value.language !== n) return;
				v.value = r.items, y.value = r.total;
			} catch (t) {
				e.signal.aborted || (S.value = t instanceof Error ? t.message : "Unable to load sources.");
			} finally {
				C === e && (x.value = !1);
			}
		}
		function O(e, t) {
			let n = new Set(s.value.moss_source_batch_ids ?? []);
			t ? n.add(e) : n.delete(e), s.value.moss_source_batch_ids = [...n];
		}
		function ee(e) {
			s.value.moss_after_current = e, s.value.moss_source_batch_ids = [];
		}
		let k = /* @__PURE__ */ new Map(), te = {
			omnivoice: "OmniVoice",
			qwen3: "Qwen3-TTS",
			moss: "MOSS-TTS",
			piper: "Piper"
		}, ne, A, re = 0, j = 0, ie = !1, M = X(() => t.selectedId.value), ae = X(() => t.selected.value), oe = X(() => r.value.find((e) => e.language === s.value.language) ?? null), se = X(() => oe.value?.engines.hybrid ?? []), ce = X(() => oe.value?.model_availability ?? se.value.map((e) => ({
			engine: e,
			supported: !0,
			available: !0,
			reason: null
		}))), N = X(() => !!oe.value?.accent_applies && s.value.engines?.some((e) => e !== "piper"));
		function le(e, t, n) {
			return M.value === e && re === t && !n.signal.aborted;
		}
		function P(e, t, n) {
			return M.value === e && j === t && !n.signal.aborted;
		}
		let ue = ["omnivoice", "qwen3"];
		function de() {
			if (!oe.value) return;
			let e = s.value.engines ?? ue;
			s.value.engines = e.filter((e) => se.value.includes(e)), N.value || (s.value.english_accent = "mixed");
		}
		function fe() {
			C?.abort(), _.value = {}, v.value = [], y.value = 0, A?.abort(), A = void 0, j += 1, u.value = !1, f.value = null, g.value = null;
			for (let e of k.values()) e.abort();
			k.clear(), p.value = {}, m.value = {}, h.value = {};
		}
		async function pe() {
			ne?.abort();
			let e = new AbortController();
			ne = e;
			let t = ++re, n = M.value;
			if (i.value = [], a.value = 0, d.value = "", n) {
				l.value = !0;
				try {
					let [l, u, d, f, p, m] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(n, e.signal).catch((e) => e instanceof ms && e.status === 404 ? null : Promise.reject(e)),
						$.batches(n, {
							offset: o.value,
							limit: 50
						}, e.signal),
						ie ? Promise.resolve(null) : $.batchSelection(n, e.signal),
						$.wakeword(n, e.signal),
						$.generationDefaults(e.signal)
					]);
					if (!le(n, t, e)) return;
					r.value = l, ie || (s.value = u ?? {
						language: p.language,
						english_accent: "mixed",
						tts_mode: "hybrid",
						...m
					}, de(), c.value = new Set(f ?? []), ie = !0, s.value.moss_samples ??= s.value.samples, s.value.moss_source_batch_ids ??= [], s.value.moss_after_current ??= T.value > 0, D()), i.value = d.items, a.value = d.total;
				} catch (r) {
					le(n, t, e) && (d.value = r instanceof Error ? r.message : "Unable to load generation settings.");
				} finally {
					le(n, t, e) && (l.value = !1);
				}
			}
		}
		function me(e) {
			s.value.language = e, s.value.moss_source_batch_ids = [], b.value = 0, de(), D();
		}
		function he(e, t) {
			let n = new Set(s.value.engines);
			t ? n.add(e) : n.delete(e), s.value.engines = [...n], n.has("moss") || (s.value.moss_after_current = !1, s.value.moss_source_batch_ids = []);
		}
		function ge() {
			return !Number.isInteger(s.value.samples) || s.value.samples < 1 ? (d.value = "Sample count must be a positive integer.", !1) : s.value.engines?.length ? !0 : (d.value = "Select at least one generation model.", !1);
		}
		async function _e() {
			let e = M.value;
			if (!e || !ge()) return;
			if (w.value && (!Number.isInteger(s.value.moss_samples) || (s.value.moss_samples ?? 0) < 1)) {
				d.value = "MOSS sample count must be a positive integer.";
				return;
			}
			if (w.value && (s.value.moss_after_current ? !T.value : !s.value.moss_source_batch_ids?.length)) {
				d.value = "Select completed MOSS sources or generate after current direct providers.";
				return;
			}
			A?.abort();
			let t = new AbortController();
			A = t;
			let r = ++j, i = {
				...s.value,
				engines: [...s.value.engines],
				english_accent: N.value ? s.value.english_accent : "mixed",
				tts_mode: "hybrid"
			};
			u.value = !0, d.value = "";
			try {
				let a = await $.submitGeneration(e, i, t.signal);
				if (P(e, r, t)) {
					s.value = i;
					for (let e of a.jobs) _.value[e.id] = e, n.track(e);
					f.value = a.jobs[0] ?? null, f.value && n.show(f.value.id);
				}
			} catch (n) {
				P(e, r, t) && (d.value = n instanceof Error ? n.message : "Generation job was not started.");
			} finally {
				P(e, r, t) && (u.value = !1);
			}
		}
		async function ve(e) {
			let t = M.value;
			if (!t || m.value[e]) return;
			k.get(e)?.abort();
			let r = new AbortController();
			k.set(e, r), m.value[e] = !0, h.value[e] = "", delete p.value[e];
			try {
				let i = await $.preview(t, {
					...s.value,
					moss_after_current: !1,
					moss_source_batch_ids: e === "moss" ? [...s.value.moss_source_batch_ids ?? []] : [],
					tts_mode: "hybrid",
					engines: [e],
					samples: 1,
					batch_size: 1,
					english_accent: oe.value?.accent_applies && e !== "piper" ? s.value.english_accent : "mixed"
				}, r.signal);
				!r.signal.aborted && M.value === t && (p.value[e] = i, n.track(i), n.show(i.id));
			} catch (n) {
				!r.signal.aborted && M.value === t && (h.value[e] = n instanceof Error ? n.message : "Preview could not start.");
			} finally {
				k.get(e) === r && (m.value[e] = !1, k.delete(e));
			}
		}
		function ye(e, t) {
			p.value[e]?.id === t.id && (p.value[e] = t);
		}
		B(n.jobs, (e) => {
			let t = !1;
			for (let n of Object.values(e)) if (n.kind === "generation" && n.word_id === M.value) {
				let e = _.value[n.id];
				n.status === "complete" && e?.status !== "complete" && (t = !0), _.value[n.id] = n, f.value?.id === n.id && (f.value = n);
			}
			t && (o.value = 0, pe(), D());
			for (let [t, n] of Object.entries(p.value)) {
				let r = e[n.id];
				r && r.word_id === M.value && ye(t, r);
			}
		}, { deep: !0 });
		function be(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(c.value);
			t ? n.add(e.id) : n.delete(e.id), c.value = n;
		}
		async function xe() {
			let e = M.value, t = g.value;
			if (!e || !t || u.value) return;
			A?.abort();
			let n = new AbortController();
			A = n;
			let r = ++j;
			u.value = !0, d.value = "";
			try {
				if (await $.deleteBatch(e, t.id, n.signal), !P(e, r, n)) return;
				let a = new Set(c.value);
				a.delete(t.id), c.value = a, g.value = null, s.value.moss_source_batch_ids = s.value.moss_source_batch_ids?.filter((e) => e !== t.id) ?? [], b.value = 0, D(), i.value.length === 1 && o.value > 0 ? o.value = Math.max(0, o.value - 50) : await pe();
			} catch (t) {
				P(e, r, n) && (d.value = t instanceof ms && t.status === 409 ? "Cancel queued or active workspace jobs before deleting this dataset." : t instanceof Error ? t.message : "Dataset was not deleted.");
			} finally {
				P(e, r, n) && (u.value = !1);
			}
		}
		async function Se() {
			let e = M.value;
			if (!e || !ie || l.value) return;
			A?.abort();
			let t = new AbortController();
			A = t;
			let n = ++j, r = [...c.value];
			u.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), P(e, n, t) && await pe();
			} catch (r) {
				P(e, n, t) && (d.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				P(e, n, t) && (u.value = !1);
			}
		}
		return B(M, () => {
			fe(), b.value = 0, ie = !1, c.value = /* @__PURE__ */ new Set(), s.value = {
				language: ae.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, o.value = 0, pe();
		}, { immediate: !0 }), B(b, () => {
			D();
		}), B(o, () => {
			pe();
		}), Dr(() => {
			ne?.abort(), fe();
		}), (e, t) => (W(), G("section", null, [
			t[23] ||= K("div", { class: "mb-4" }, [K("h1", null, "Artificial"), K("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			K("div", Gp, [
				t[19] ||= K("h2", null, "Generate data", -1),
				K("p", Kp, [t[10] ||= J("Wake phrase: ", -1), K("strong", null, F(ae.value?.phrase ?? "No workspace selected"), 1)]),
				K("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Yo(_e, ["prevent"])
				}, [
					K("div", qp, [
						K("label", null, [t[11] ||= J("Language", -1), K("select", {
							name: "language",
							value: s.value.language,
							onChange: t[0] ||= (e) => me(e.target.value)
						}, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("option", {
							key: e.language,
							value: e.language
						}, F(e.name), 9, Yp))), 128))], 40, Jp)]),
						K("label", null, [t[12] ||= J("English accent", -1), z(K("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => s.value.english_accent = e,
							disabled: !N.value
						}, [N.value ? (W(!0), G(U, { key: 0 }, H(oe.value?.english_accents ?? [], (e) => (W(), G("option", {
							key: e.code,
							value: e.code
						}, F(e.label), 9, Zp))), 128)) : (W(), G("option", Qp, "Not applicable"))], 8, Xp), [[Ho, s.value.english_accent]])]),
						K("label", null, [t[13] ||= J("Samples per provider", -1), z(K("input", {
							"onUpdate:modelValue": t[2] ||= (e) => s.value.samples = e,
							name: "samples",
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							zo,
							s.value.samples,
							void 0,
							{ number: !0 }
						]])])
					]),
					K("fieldset", null, [t[14] ||= K("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), K("div", $p, [(W(!0), G(U, null, H(ce.value, (e) => (W(), G("article", {
						key: e.engine,
						class: "studio-history"
					}, [
						K("div", em, [K("label", tm, [K("input", {
							type: "checkbox",
							"data-engine": e.engine,
							disabled: !e.available,
							checked: s.value.engines?.includes(e.engine),
							onChange: (t) => he(e.engine, t.target.checked)
						}, null, 40, nm), K("strong", null, F(te[e.engine] ?? e.engine), 1)]), K("button", {
							type: "button",
							"data-preview": e.engine,
							disabled: !e.available || e.engine === "moss" && (s.value.moss_after_current || !s.value.moss_source_batch_ids?.length) || m.value[e.engine] || [
								"queued",
								"running",
								"cancelling"
							].includes(p.value[e.engine]?.status ?? "") || !M.value,
							onClick: (t) => ve(e.engine)
						}, F(m.value[e.engine] ? "Starting…" : "Preview"), 9, rm)]),
						e.reason ? (W(), G("p", im, F(e.reason), 1)) : Y("", !0),
						h.value[e.engine] ? (W(), G("p", am, F(h.value[e.engine]), 1)) : Y("", !0),
						p.value[e.engine] && p.value[e.engine].status !== "complete" ? (W(), G("button", {
							key: 2,
							type: "button",
							onClick: (t) => R(n).show(p.value[e.engine].id)
						}, "View preview in queue", 8, om)) : Y("", !0),
						p.value[e.engine]?.status === "complete" ? (W(), G("audio", {
							key: 3,
							"data-preview-audio": e.engine,
							class: "mt-3 max-w-full",
							src: R($).previewAudioUrl(M.value, p.value[e.engine].id),
							controls: "",
							autoplay: "",
							"aria-label": `${te[e.engine] ?? e.engine} wakeword preview`
						}, null, 8, sm)) : Y("", !0)
					]))), 128))])]),
					w.value ? (W(), G("fieldset", cm, [
						t[18] ||= K("legend", null, "MOSS references", -1),
						K("label", null, [t[15] ||= J("MOSS samples", -1), z(K("input", {
							name: "moss-samples",
							"onUpdate:modelValue": t[3] ||= (e) => s.value.moss_samples = e,
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							zo,
							s.value.moss_samples,
							void 0,
							{ number: !0 }
						]])]),
						K("label", lm, [K("input", {
							name: "moss-after-current",
							type: "checkbox",
							checked: s.value.moss_after_current,
							onChange: t[4] ||= (e) => ee(e.target.checked)
						}, null, 40, um), t[16] ||= J("Generate after current selection", -1)]),
						s.value.moss_after_current ? (W(), G("p", dm, "Uses only this submission’s direct providers after all succeed. Select completed sources instead to preview MOSS.")) : (W(), G("div", fm, [
							t[17] ||= K("p", { class: "studio-muted" }, "Select completed direct-provider datasets. Training selection is independent. MOSS needs at least one distinct reference clip per requested sample; duplicate clips count once.", -1),
							S.value ? (W(), G("p", pm, F(S.value), 1)) : Y("", !0),
							(W(!0), G(U, null, H(v.value, (e) => (W(), G("label", {
								key: e.id,
								class: "studio-checkbox-label"
							}, [K("input", {
								type: "checkbox",
								"data-source": e.id,
								checked: s.value.moss_source_batch_ids?.includes(e.id),
								disabled: !s.value.moss_source_batch_ids?.includes(e.id) && (s.value.moss_source_batch_ids?.length ?? 0) >= 100,
								onChange: (t) => O(e.id, t.target.checked)
							}, null, 40, mm), J(F(e.providers.map((e) => te[e] ?? e).join(", ")) + " · " + F(e.sample_count) + " clips · " + F(e.id), 1)]))), 128)),
							!x.value && !v.value.length ? (W(), G("p", hm, "No eligible completed sources for this language.")) : Y("", !0),
							K("p", null, F(s.value.moss_source_batch_ids?.length ?? 0) + " sources selected (maximum 100).", 1),
							q(fc, {
								total: y.value,
								offset: b.value,
								limit: 50,
								loading: x.value,
								onPage: t[5] ||= (e) => b.value = e
							}, null, 8, [
								"total",
								"offset",
								"loading"
							])
						]))
					])) : Y("", !0),
					K("p", gm, "Each direct provider generates the full samples per provider count into a separate dataset. Requested total: " + F(E.value) + ". MOSS has its own count. Preview generates one sample without adding training data.", 1),
					K("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						disabled: u.value || l.value || !M.value
					}, F(u.value ? "Starting…" : "Generate dataset"), 9, _m)
				], 32),
				d.value ? (W(), G("p", vm, F(d.value), 1)) : Y("", !0),
				f.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[6] ||= (e) => R(n).show(f.value.id)
				}, "View generation in queue")) : Y("", !0)
			]),
			K("div", ym, [
				K("div", bm, [t[20] ||= K("h2", null, "Generated datasets", -1), K("button", {
					type: "button",
					"data-action": "save-batches",
					disabled: u.value || l.value || !M.value,
					onClick: Se
				}, "Save selection", 8, xm)]),
				t[22] ||= K("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				l.value ? (W(), G("p", Sm, "Loading datasets…")) : Y("", !0),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					K("div", Cm, [K("label", wm, [
						K("input", {
							"data-batch-id": e.id,
							type: "checkbox",
							checked: c.value.has(e.id),
							disabled: e.status !== "complete",
							onChange: (t) => be(e, t.target.checked)
						}, null, 40, Tm),
						K("span", null, [
							K("strong", null, F(e.phrase), 1),
							K("span", Em, F(e.audio.length) + " samples · " + F(e.recipe.engines?.map((e) => te[e] ?? e).join(", ") || "Saved generation models") + " · " + F(e.created_at ? new Date(e.created_at).toLocaleString() : ""), 1),
							e.status === "complete" ? Y("", !0) : (W(), G("span", Dm, F(e.status) + " — only completed datasets can be selected.", 1))
						]),
						K("span", Om, F(e.status), 1)
					]), K("button", {
						type: "button",
						"data-delete-batch": e.id,
						disabled: u.value || [
							"queued",
							"running",
							"cancelling"
						].includes(e.status),
						onClick: (t) => g.value = e
					}, "Delete dataset", 8, km)]),
					e.recipe.moss_source_batch_ids?.length ? (W(), G("p", Am, "MOSS sources: " + F(e.recipe.moss_source_batch_ids.join(", ")), 1)) : Y("", !0),
					g.value?.id === e.id ? (W(), G("section", {
						key: 1,
						role: "alertdialog",
						"aria-label": "Delete generated dataset?",
						class: "studio-note mt-3",
						onKeydown: t[8] ||= Zo((e) => !u.value && (g.value = null), ["esc"])
					}, [
						K("h3", null, "Delete " + F(e.phrase) + " dataset permanently?", 1),
						t[21] ||= K("p", null, "This removes the generated dataset and its training selection. Historical training inputs and shared audio are kept.", -1),
						K("div", jm, [K("button", {
							type: "button",
							"data-action": "cancel-batch-delete",
							disabled: u.value,
							onClick: t[7] ||= (e) => g.value = null
						}, "Cancel", 8, Mm), K("button", {
							type: "button",
							"data-action": "confirm-batch-delete",
							disabled: u.value,
							onClick: xe
						}, F(u.value ? "Deleting…" : "Delete permanently"), 9, Nm)])
					], 32)) : Y("", !0)
				]))), 128)),
				!l.value && !i.value.length ? (W(), G("p", Pm, "No generated datasets yet. Choose models above to create one.")) : Y("", !0),
				q(fc, {
					total: a.value,
					offset: o.value,
					limit: 50,
					loading: l.value,
					onPage: t[9] ||= (e) => o.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			])
		]));
	}
}), Im = {
	"data-training-prerequisites": "",
	class: "studio-card mb-4"
}, Lm = { class: "studio-toolbar" }, Rm = ["disabled"], zm = {
	key: 0,
	class: "studio-muted mt-3"
}, Bm = {
	key: 1,
	class: "studio-muted mt-3"
}, Vm = { class: "studio-muted mt-3" }, Hm = {
	key: 3,
	class: "studio-note mt-3",
	role: "alert"
}, Um = { class: "studio-muted mt-3" }, Wm = ["href"], Gm = { class: "studio-card" }, Km = {
	key: 0,
	class: "studio-muted"
}, qm = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 my-4"
}, Jm = { class: "studio-muted" }, Ym = { class: "text-2xl font-semibold" }, Xm = { class: "studio-muted" }, Zm = { class: "text-2xl font-semibold" }, Qm = { class: "studio-muted" }, $m = { class: "text-2xl font-semibold" }, eh = {
	"data-negative-datasets-count": "",
	class: "studio-muted"
}, th = { class: "text-2xl font-semibold" }, nh = {
	key: 2,
	class: "studio-muted text-xs"
}, rh = { class: "studio-card mt-4" }, ih = { class: "grid gap-3 mt-3" }, ah = {
	"data-dataset-compatibility": "",
	class: "studio-note text-xs"
}, oh = { class: "flex gap-2" }, sh = ["disabled"], ch = ["disabled"], lh = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, uh = { class: "studio-card mt-4" }, dh = { class: "flex justify-between gap-3" }, fh = ["onClick"], ph = {
	key: 0,
	class: "studio-note text-xs"
}, mh = {
	key: 1,
	class: "studio-note text-xs",
	role: "alert"
}, hh = {
	key: 0,
	class: "studio-muted"
}, gh = /* @__PURE__ */ V({
	__name: "TrainPage",
	setup(e) {
		let t = Cs(), n = zc(), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L(!1), a = /* @__PURE__ */ L(""), o;
		async function s() {
			o?.abort();
			let e = new AbortController();
			o = e, i.value = !0;
			let t = w.value;
			if (r.value = null, !t) i.value = !1;
			else try {
				let n = await $.wakewordAugmentationDatasets(t, e.signal);
				!e.signal.aborted && w.value === t && (r.value = n, a.value = "");
			} catch (t) {
				e.signal.aborted || (r.value = null, a.value = t instanceof Error ? t.message : "Unable to check training prerequisites.");
			} finally {
				e.signal.aborted || (i.value = !1);
			}
		}
		let c = X(() => `#/online-datasets${w.value ? "?word=" + encodeURIComponent(w.value) : ""}`), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L({ training_steps: 4e4 }), d = /* @__PURE__ */ L([]), f = /* @__PURE__ */ L([]), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L(!1), g = /* @__PURE__ */ L(""), _ = /* @__PURE__ */ L(null), v, y, b, x = 0, S = 0, C = 0, w = X(() => t.selectedId.value), T = X(() => [...new Set(f.value.map((e) => `${e.representation}/${e.adapter}`))]), E = X(() => f.value.filter((e) => e.selected && e.split !== "evaluation").length), D = X(() => f.value.filter((e) => e.selected && e.split === "evaluation").length), O = X(() => f.value.filter((e) => e.selected && e.status !== "installed"));
		function ee(e, t, n) {
			return w.value === e && x === t && !n.signal.aborted;
		}
		function k(e, t, n) {
			return w.value === e && S === t && !n.signal.aborted;
		}
		function te(e, t, n) {
			return w.value === e && C === t && !n.signal.aborted;
		}
		function ne() {
			y?.abort(), b?.abort(), y = void 0, b = void 0, S += 1, C += 1, m.value = !1, h.value = !1, _.value = null;
		}
		async function A(e, t) {
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
				let t = n.jobs.value[e.id], r = t?.word_id === w.value ? t : e;
				return Ic(r) && !t && n.track(r), r;
			});
		}
		async function j() {
			v?.abort();
			let e = new AbortController();
			v = e;
			let t = ++x, n = w.value;
			if (l.value = null, d.value = [], f.value = [], _.value = null, g.value = "", n) {
				p.value = !0;
				try {
					let [r, i, a, o] = await Promise.all([
						$.trainingCounts(n, e.signal),
						$.trainingSettings(n, e.signal),
						$.trainingRuns(n, { limit: 50 }, e.signal),
						A(n, e)
					]);
					if (!ee(n, t, e)) return;
					l.value = r, u.value = i, d.value = re(a.items), f.value = o;
				} catch (r) {
					ee(n, t, e) && (g.value = r instanceof Error ? r.message : "Unable to load training configuration.");
				} finally {
					ee(n, t, e) && (p.value = !1);
				}
			}
		}
		function ie() {
			return !Number.isInteger(u.value.training_steps) || u.value.training_steps < 1 || u.value.training_steps > 1e7 ? (g.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function M() {
			let e = w.value;
			if (!e || !ie()) return;
			y?.abort();
			let t = new AbortController();
			y = t;
			let n = ++S, r = { training_steps: u.value.training_steps };
			m.value = !0, g.value = "";
			try {
				let i = await $.saveTrainingSettings(e, r, t.signal);
				k(e, n, t) && (u.value = i);
			} catch (r) {
				k(e, n, t) && (g.value = r instanceof Error ? r.message : "Training settings were not saved.");
			} finally {
				k(e, n, t) && (m.value = !1);
			}
		}
		async function ae() {
			let e = w.value;
			if (!e || !r.value?.ready || i.value) return;
			b?.abort();
			let t = new AbortController();
			b = t;
			let a = ++C;
			h.value = !0, g.value = "";
			try {
				let r = await $.train(e, t.signal);
				te(e, a, t) && (_.value = r, d.value = [r, ...d.value.filter((e) => e.id !== r.id)], n.track(r), n.show(r.id));
			} catch (n) {
				te(e, a, t) && (g.value = n instanceof Error ? n.message : "Training job was not started.");
			} finally {
				te(e, a, t) && (h.value = !1);
			}
		}
		function oe(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return B(n.jobs, (e) => {
			d.value = d.value.map((t) => e[t.id]?.word_id === w.value ? e[t.id] : t);
		}, { deep: !0 }), B(() => Object.values(n.jobs.value).filter((e) => e.kind === "download" && e.payload.augmentation_id).map((e) => ({
			id: e.id,
			active: Ic(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && s();
		}), Dr(() => o?.abort()), B(w, () => {
			ne(), j(), s();
		}, { immediate: !0 }), Dr(() => {
			v?.abort(), y?.abort(), b?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[16] ||= K("div", { class: "mb-4" }, [K("h1", null, "Train"), K("p", { class: "studio-muted" }, "Configure inputs and start a manual training run. Progress and logs are available in the global job queue.")], -1),
			K("div", Im, [
				K("div", Lm, [t[2] ||= K("h2", null, "Training prerequisites", -1), K("button", {
					type: "button",
					disabled: i.value,
					onClick: s
				}, "Refresh status", 8, Rm)]),
				i.value ? (W(), G("p", zm, "Checking augmentation datasets…")) : r.value?.ready ? (W(), G("p", Bm, "All selected augmentation datasets are installed. Selected augmentation runs automatically before model training.")) : (W(), G(U, { key: 2 }, [t[3] ||= K("p", {
					class: "studio-note mt-3",
					role: "alert"
				}, "Download and prepare the selected augmentation datasets before starting training.", -1), K("ul", Vm, [(W(!0), G(U, null, H(r.value?.items.filter((e) => e.selected && e.status !== "installed") ?? [], (e) => (W(), G("li", { key: e.id }, F(e.name) + " — " + F(e.status), 1))), 128))])], 64)),
				a.value ? (W(), G("p", Hm, F(a.value), 1)) : Y("", !0),
				!p.value && O.value.length ? (W(), G(U, { key: 4 }, [t[4] ||= K("p", {
					"data-missing-negative-datasets": "",
					class: "studio-note mt-3",
					role: "alert"
				}, "Download the selected negative datasets, or deselect them, before starting training.", -1), K("ul", Um, [(W(!0), G(U, null, H(O.value, (e) => (W(), G("li", { key: e.id }, F(e.name) + " — " + F(e.status), 1))), 128))])], 64)) : Y("", !0),
				K("a", {
					href: c.value,
					class: "mt-3 inline-block"
				}, "Open Downloaded", 8, Wm)
			]),
			K("div", Gm, [
				t[9] ||= K("h2", null, "Effective inputs for the next snapshot", -1),
				p.value ? (W(), G("p", Km, "Loading effective inputs…")) : l.value ? (W(), G("div", qm, [
					K("p", Jm, [K("strong", Ym, F(l.value.positive), 1), t[5] ||= J(" reviewed positives", -1)]),
					K("p", Xm, [K("strong", Zm, F(l.value.negative), 1), t[6] ||= J(" reviewed negatives", -1)]),
					K("p", Qm, [K("strong", $m, F(l.value.artificial), 1), t[7] ||= J(" selected artificial", -1)]),
					K("p", eh, [K("strong", th, F(E.value), 1), t[8] ||= J(" selected negative datasets", -1)])
				])) : Y("", !0),
				!p.value && l.value && D.value ? (W(), G("p", nh, F(D.value) + " evaluation-only " + F(D.value === 1 ? "dataset" : "datasets") + " selected separately; not sampled for training.", 1)) : Y("", !0),
				t[10] ||= K("p", { class: "studio-muted text-xs" }, "Training uses reviewed positive/negative samples, completed selected artificial batches, and selected external negative datasets. Dataset totals count datasets, not individual audio samples. Pending and discarded recordings are not training inputs.", -1)
			]),
			K("div", rh, [
				t[14] ||= K("h2", null, "Training parameters", -1),
				K("div", ih, [
					K("label", null, [t[11] ||= J("Training steps", -1), z(K("input", {
						"onUpdate:modelValue": t[0] ||= (e) => u.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						zo,
						u.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					K("p", ah, [
						t[12] ||= J("Selected classifier representations: ", -1),
						K("strong", null, F(T.value.join(", ") || "none"), 1),
						t[13] ||= J(". microWakeWord uses mww_mmap feature tensors. dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					K("div", oh, [K("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: m.value,
						onClick: M
					}, F(m.value ? "Saving…" : "Save parameters"), 9, sh), K("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !w.value || h.value || i.value || !r.value?.ready || p.value || O.value.length > 0,
						onClick: ae
					}, F(h.value ? "Starting…" : "Start training"), 9, ch)])
				]),
				g.value ? (W(), G("p", lh, F(g.value), 1)) : Y("", !0),
				_.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[1] ||= (e) => R(n).show(_.value.id)
				}, "View training in queue")) : Y("", !0)
			]),
			K("div", uh, [
				t[15] ||= K("h2", null, "Run history", -1),
				(W(!0), G(U, null, H(d.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					K("div", dh, [
						K("strong", null, F(e.id), 1),
						K("span", { class: P(["studio-status", `studio-status-${e.status}`]) }, F(e.status), 3),
						K("button", {
							type: "button",
							onClick: (t) => R(n).show(e.id)
						}, "View in queue", 8, fh)
					]),
					oe(e) ? (W(), G("p", ph, "Skipped because inputs and configuration were unchanged.")) : Y("", !0),
					R(us)(e) ? (W(), G("p", mh, F(R(us)(e)), 1)) : Y("", !0)
				]))), 128)),
				!p.value && !d.value.length ? (W(), G("p", hh, "No training runs for this workspace yet.")) : Y("", !0)
			])
		]));
	}
}), _h = {
	viewBox: "0 0 780 260",
	role: "img",
	"aria-label": "Live detection probability over the last eight seconds, with a dashed threshold and red trace above threshold",
	class: "probability-graph"
}, vh = ["height"], yh = ["y1", "y2"], bh = ["y"], xh = ["y1", "y2"], Sh = ["points"], Ch = ["points", "clip-path"], wh = /*@__PURE__*/ V({
	__name: "ProbabilityGraph",
	props: {
		samples: {},
		threshold: {}
	},
	setup(e) {
		let t = e, n = `probability-${lr().replace(/[^a-zA-Z0-9_-]/g, "")}`, r = (e) => Number((24 + (1 - e) * 180).toFixed(3)), i = X(() => t.samples.at(-1)?.seconds ?? 0), a = X(() => t.samples.filter((e) => e.seconds >= i.value - 8).map((e) => `${48 + (e.seconds - i.value + 8) / 8 * 700},${r(e.probability)}`).join(" "));
		return (t, i) => (W(), G("svg", _h, [
			K("defs", null, [K("clipPath", { id: n }, [K("rect", {
				x: "48",
				y: "24",
				width: "700",
				height: Math.max(0, r(e.threshold) - 24)
			}, null, 8, vh)])]),
			(W(), G(U, null, H([
				0,
				.25,
				.5,
				.75,
				1
			], (e) => K("g", { key: e }, [K("line", {
				x1: "48",
				x2: "748",
				y1: r(e),
				y2: r(e),
				class: "grid-line"
			}, null, 8, yh), K("text", {
				x: "37",
				y: r(e) + 4,
				"text-anchor": "end"
			}, F(e.toFixed(2)), 9, bh)])), 64)),
			K("line", {
				"data-threshold-line": "",
				x1: "48",
				x2: "748",
				y1: r(e.threshold),
				y2: r(e.threshold),
				stroke: "#c18b26",
				"stroke-width": "2",
				"stroke-dasharray": "7 5"
			}, null, 8, xh),
			K("polyline", {
				points: a.value,
				fill: "none",
				stroke: "#3898d5",
				"stroke-width": "2.5",
				"stroke-linejoin": "round"
			}, null, 8, Sh),
			K("polyline", {
				"data-red-trace": "",
				points: a.value,
				"clip-path": `url(#${n})`,
				fill: "none",
				stroke: "#e05260",
				"stroke-width": "2.5",
				"stroke-linejoin": "round"
			}, null, 8, Ch),
			i[0] ||= _a("<text x=\"48\" y=\"226\" data-v-9402a05b>−8s</text><text x=\"398\" y=\"226\" text-anchor=\"middle\" data-v-9402a05b>−4s</text><text x=\"748\" y=\"226\" text-anchor=\"end\" data-v-9402a05b>now</text><text x=\"48\" y=\"250\" data-v-9402a05b>Y: probability</text><text x=\"748\" y=\"250\" text-anchor=\"end\" data-v-9402a05b>X: time → newest</text>", 5)
		]));
	}
}), Th = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, Eh = /*#__PURE__*/ Th(wh, [["__scopeId", "data-v-9402a05b"]]), Dh = [
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
function Oh(e, t) {
	return Math.max(.1, Math.min(.99, 1 - (1 - e) * {
		slight: .5,
		moderate: 1,
		very: 2
	}[t]));
}
function kh(e) {
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
var Ah = "data:text/javascript;base64,LyoqIENhcHR1cmUgbW9ubyBQQ00gb25seTsgdGhlIG91dHB1dCByZW1haW5zIHNpbGVudCAobm8gbWljcm9waG9uZSBmZWVkYmFjaykuICovCmNsYXNzIFRlc3RpbmdDYXB0dXJlIGV4dGVuZHMgQXVkaW9Xb3JrbGV0UHJvY2Vzc29yIHsKICBjb25zdHJ1Y3RvcigpIHsKICAgIHN1cGVyKCk7CiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoMjA0OCk7CiAgICB0aGlzLm9mZnNldCA9IDA7CiAgfQogIHByb2Nlc3MoaW5wdXRzKSB7CiAgICBjb25zdCBjaGFubmVscyA9IGlucHV0c1swXTsKICAgIGlmICghY2hhbm5lbHM/Lmxlbmd0aCkgcmV0dXJuIHRydWU7CiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5uZWxzWzBdLmxlbmd0aDsgaSsrKSB7CiAgICAgIGxldCBzYW1wbGUgPSAwOwogICAgICBmb3IgKGNvbnN0IGNoYW5uZWwgb2YgY2hhbm5lbHMpIHNhbXBsZSArPSBjaGFubmVsW2ldOwogICAgICB0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsrXSA9IHNhbXBsZSAvIGNoYW5uZWxzLmxlbmd0aDsKICAgICAgaWYgKHRoaXMub2Zmc2V0ID09PSB0aGlzLmJ1ZmZlci5sZW5ndGgpIHsKICAgICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UodGhpcy5idWZmZXIsIFt0aGlzLmJ1ZmZlci5idWZmZXJdKTsKICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoMjA0OCk7CiAgICAgICAgdGhpcy5vZmZzZXQgPSAwOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKICB9Cn0KcmVnaXN0ZXJQcm9jZXNzb3IoJ3N0dWRpby10ZXN0aW5nLWNhcHR1cmUnLCBUZXN0aW5nQ2FwdHVyZSk7Cg==", jh = class {
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
				}), i.audioWorklet.addModule(Ah)]);
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
}, Mh = { class: "testing-page" }, Nh = { class: "studio-card testing-card" }, Ph = { class: "studio-toolbar testing-controls" }, Fh = { for: "testing-version" }, Ih = ["disabled"], Lh = {
	key: 0,
	value: ""
}, Rh = ["value"], zh = { class: "testing-sensitivity" }, Bh = ["disabled"], Vh = {
	key: 0,
	class: "studio-note"
}, Hh = {
	key: 1,
	class: "studio-note"
}, Uh = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, Wh = { class: "testing-mic" }, Gh = ["value"], Kh = { class: "testing-stats" }, qh = { "data-threshold": "" }, Jh = { class: "testing-actions" }, Yh = ["disabled"], Xh = { class: "studio-muted" }, Zh = { class: "sensitivity-options" }, Qh = [
	"data-sensitivity",
	"aria-pressed",
	"onClick"
], $h = /*#__PURE__*/ Th(/* @__PURE__ */ V({
	__name: "TestingPage",
	setup(e) {
		let t = Cs(), n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L("moderate"), o = /* @__PURE__ */ L(), s = /* @__PURE__ */ L("idle"), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L([]), d = /* @__PURE__ */ L(null), f, p, m = !1, h = X(() => n.value.find((e) => e.id === r.value)), g = X(() => Oh(i.value?.cutoff ?? .9, a.value)), _ = X(() => Dh.find((e) => e.id === a.value).label), v = X(() => s.value === "starting" || s.value === "listening"), y = X(() => Math.max(0, ...u.value.map((e) => e.probability))), b = X(() => !d.value?.warming && (d.value?.probability ?? 0) > g.value), x = X(() => s.value === "starting" ? "Loading model and requesting microphone…" : s.value === "error" ? "Testing stopped" : s.value === "listening" ? d.value?.warming || !d.value ? "Warming up…" : b.value ? "Above threshold" : "Listening…" : "Ready to test"), S = new jh({
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
				!m && !r.signal.aborted && (i.value = kh(t));
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
		return B(r, () => {
			T();
		}, { flush: "sync" }), B(t.selectedId, () => {
			E();
		}, {
			immediate: !0,
			flush: "sync"
		}), Dr(() => {
			m = !0, f?.abort(), p?.abort(), o.value?.close(), S.stop();
		}), (e, f) => (W(), G("section", Mh, [
			f[17] ||= K("h1", null, "Testing", -1),
			f[18] ||= K("p", { class: "studio-muted testing-intro" }, "Test a trained wakeword using your microphone. Inference runs in this browser; audio is never uploaded or saved.", -1),
			K("div", Nh, [
				f[12] ||= K("h2", null, "Wake Word Tester", -1),
				f[13] ||= K("p", { class: "studio-muted" }, "Speak your wakeword from your usual distance and watch the detection probability in real time.", -1),
				K("div", Ph, [K("label", Fh, [f[4] ||= J("Wakeword version ", -1), z(K("select", {
					id: "testing-version",
					"onUpdate:modelValue": f[0] ||= (e) => r.value = e,
					disabled: c.value || !n.value.length
				}, [n.value.length ? Y("", !0) : (W(), G("option", Lh, F(c.value ? "Loading versions…" : "No versions available"), 1)), (W(!0), G(U, null, H(n.value, (e) => (W(), G("option", {
					key: e.id,
					value: e.id
				}, F(e.trained_at) + " · " + F(e.id.slice(0, 8)), 9, Rh))), 128))], 8, Ih), [[Ho, r.value]])]), K("div", zh, [f[5] ||= K("span", { class: "studio-muted" }, "Sensitivity", -1), K("button", {
					type: "button",
					"data-action": "sensitivity",
					disabled: !i.value,
					"aria-haspopup": "dialog",
					onClick: f[1] ||= (e) => o.value?.showModal()
				}, F(_.value) + " ▾", 9, Bh)])]),
				R(t).selectedId.value ? !c.value && !n.value.length && !l.value ? (W(), G("p", Hh, "Train a model to start live testing.")) : Y("", !0) : (W(), G("p", Vh, "Select or create a wakeword to test.")),
				l.value ? (W(), G("p", Uh, [J(F(l.value) + " ", 1), v.value ? Y("", !0) : (W(), G("button", {
					key: 0,
					type: "button",
					onClick: E
				}, "Reload versions"))])) : Y("", !0),
				K("div", Wh, [
					f[6] ||= K("span", null, "Mic level", -1),
					K("meter", {
						min: "0",
						max: ".2",
						value: d.value?.rms ?? 0,
						"aria-label": "Microphone level"
					}, null, 8, Gh),
					K("span", null, F((d.value?.rms ?? 0).toFixed(3)), 1)
				]),
				K("div", Kh, [f[11] ||= K("span", null, "Detection probability (smoothed)", -1), K("span", null, [
					f[8] ||= J("latest ", -1),
					K("b", null, F((d.value?.probability ?? 0).toFixed(3)), 1),
					f[9] ||= J(" · peak ", -1),
					K("b", null, F(y.value.toFixed(3)), 1),
					f[10] ||= J(" · ", -1),
					K("span", qh, [f[7] ||= J("threshold ", -1), K("b", null, F(g.value.toFixed(2)), 1)])
				])]),
				q(Eh, {
					samples: u.value,
					threshold: g.value
				}, null, 8, ["samples", "threshold"]),
				K("div", Jh, [v.value ? (W(), G("button", {
					key: 0,
					type: "button",
					class: "studio-record-stop",
					"data-action": "stop-testing",
					onClick: f[2] ||= (e) => R(S).stop()
				}, "Stop testing")) : (W(), G("button", {
					key: 1,
					type: "button",
					class: "studio-primary",
					"data-action": "start-testing",
					disabled: !i.value || c.value,
					onClick: D
				}, "Start testing", 8, Yh)), K("span", {
					role: "status",
					class: P({ "testing-above": b.value && s.value === "listening" })
				}, F(x.value), 3)]),
				f[14] ||= K("p", { class: "studio-muted testing-footnote" }, "The dashed line is the selected sensitivity threshold. Red means the smoothed probability is above it. Browser microphone processing and device hardware may differ from your deployed satellite.", -1)
			]),
			K("dialog", {
				ref_key: "dialog",
				ref: o,
				class: "studio-card testing-dialog",
				"aria-labelledby": "testing-sensitivity-title"
			}, [
				f[15] ||= K("h2", { id: "testing-sensitivity-title" }, "Detection sensitivity", -1),
				K("p", Xh, "Derived from this version’s saved cutoff (" + F((i.value?.cutoff ?? .9).toFixed(2)) + "), using Voice Satellite’s calculation.", 1),
				K("div", Zh, [(W(!0), G(U, null, H(R(Dh), (e) => (W(), G("button", {
					key: e.id,
					type: "button",
					"data-sensitivity": e.id,
					"aria-pressed": a.value === e.id,
					class: P({ "studio-selected": a.value === e.id }),
					onClick: (t) => w(e.id)
				}, [K("span", null, F(e.label), 1), K("strong", null, F(R(Oh)(i.value?.cutoff ?? .9, e.id).toFixed(2)), 1)], 10, Qh))), 128))]),
				f[16] ||= K("p", { class: "studio-muted" }, "Higher sensitivity lowers the threshold and may increase false detections.", -1),
				K("button", {
					type: "button",
					onClick: f[3] ||= (e) => o.value?.close()
				}, "Close")
			], 512)
		]));
	}
}), [["__scopeId", "data-v-186f7e4e"]]);
//#endregion
//#region src/studio/theme.ts
function eg() {
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
var tg = ["aria-pressed"], ng = /* @__PURE__ */ V({
	__name: "ThemeToggle",
	setup(e) {
		let { dark: t, toggle: n, dispose: r } = eg();
		return Dr(r), (e, r) => (W(), G("button", {
			type: "button",
			"aria-label": "Dark mode",
			"aria-pressed": R(t),
			onClick: r[0] ||= (...e) => R(n) && R(n)(...e)
		}, F(R(t) ? "☀ Light mode" : "☾ Dark mode"), 9, tg));
	}
}), rg = ["data-job-id"], ig = { class: "studio-job-heading" }, ag = ["aria-label", "disabled"], og = { class: "studio-job-meta" }, sg = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, cg = { class: "block text-xs" }, lg = { class: "studio-job-meta" }, ug = {
	key: 0,
	class: "studio-job-meta"
}, dg = {
	key: 1,
	class: "studio-log",
	"aria-label": "Job log tail"
}, fg = {
	key: 2,
	class: "studio-job-meta"
}, pg = {
	key: 3,
	class: "studio-note",
	role: "alert"
}, mg = { class: "studio-job-meta" }, hg = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, gg = /* @__PURE__ */ V({
	__name: "JobQueueCard",
	props: { job: {} },
	setup(e) {
		let t = e, n = sc();
		wr(() => {
			n.load();
		});
		let r = zc(), i = Cs(), a = {
			train: "Train wakeword",
			generation: "Generate artificial samples",
			preview: "Preview voice",
			scrape: "Collect recordings",
			download: "Download online dataset",
			classify: "Classify recordings",
			deploy: "Deploy model"
		}, o = X(() => t.job.word_id ? i.wakewords.value.find((e) => e.id === t.job.word_id)?.phrase ?? t.job.word_id : t.job.kind === "download" ? "Shared dataset" : "All wakewords"), s = X(() => t.job.kind === "scrape" ? t.job.payload.device_ids?.map(n.deviceLabel).join(", ") || "All registered kiosks and followers" : t.job.kind === "download" ? t.job.payload.augmentation_id ?? t.job.payload.dataset_id : "Trainer"), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(!1), f, p;
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
				e.signal.aborted || (d.value = !1, c.value && Ic(t.job) && (p = setTimeout(() => void h(), 2e3)));
			}
		}
		return B([c, () => t.job.status], () => {
			c.value ? h() : m();
		}), Dr(m), (t, n) => (W(), G("article", {
			class: P(["studio-card studio-job-card", { "studio-selected": R(r).selectedJobId.value === e.job.id }]),
			"data-job-id": e.job.id
		}, [
			K("div", ig, [
				K("h3", null, F(a[e.job.kind] ?? e.job.kind), 1),
				K("span", { class: P(["studio-status", `studio-status-${e.job.status}`]) }, F(e.job.status), 3),
				R(Ic)(e.job) ? (W(), G("button", {
					key: 0,
					type: "button",
					"data-action": "cancel-job",
					"aria-label": `Cancel ${a[e.job.kind] ?? e.job.kind}`,
					disabled: e.job.status === "cancelling" || R(r).cancelling.value.has(e.job.id),
					onClick: n[0] ||= (t) => R(r).cancel(e.job.id)
				}, "Cancel", 8, ag)) : Y("", !0)
			]),
			K("p", og, F(o.value) + " · " + F(s.value), 1),
			R(us)(e.job) ? (W(), G("p", sg, [J(F(R(us)(e.job)), 1), K("span", cg, "Private diagnostics: studio/jobs/" + F(e.job.id) + "/diagnostics.log (server only).", 1)])) : Y("", !0),
			K("p", lg, F(e.job.started_at ? "Started" : "Created") + " " + F(new Date(e.job.started_at ?? e.job.created_at).toLocaleString()), 1),
			K("details", { onToggle: n[1] ||= (e) => c.value = e.target.open }, [
				n[2] ||= K("summary", null, "View logs", -1),
				d.value && !l.value ? (W(), G("p", ug, "Loading logs…")) : Y("", !0),
				l.value ? (W(), G("pre", dg, F(l.value), 1)) : !d.value && !u.value ? (W(), G("p", fg, "No retained log output.")) : Y("", !0),
				u.value ? (W(), G("p", pg, [J(F(u.value) + " ", 1), K("button", {
					type: "button",
					onClick: h
				}, "Retry")])) : Y("", !0),
				K("p", mg, "Job " + F(e.job.id), 1)
			], 32),
			R(r).cancelErrors.value[e.job.id] ? (W(), G("p", hg, F(R(r).cancelErrors.value[e.job.id]), 1)) : Y("", !0)
		], 10, rg));
	}
}), _g = { class: "studio-queue-header" }, vg = { class: "flex items-center justify-between gap-3" }, yg = { class: "studio-queue-badge" }, bg = { class: "studio-queue-content" }, xg = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Sg = { class: "studio-queue-group" }, Cg = { class: "studio-queue-group" }, wg = {
	key: 5,
	class: "studio-muted text-sm mt-4"
}, Tg = ["disabled"], Eg = /* @__PURE__ */ V({
	__name: "JobQueueDrawer",
	setup(e) {
		let t = zc(), n = /* @__PURE__ */ L(), r = /* @__PURE__ */ L(), i = X(() => t.activeJobs.value.filter((e) => e.status !== "queued")), a = X(() => t.activeJobs.value.filter((e) => e.status === "queued")), o = X(() => {
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
		}), Dr(() => {
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
		}, [K("header", _g, [K("div", vg, [K("h2", null, [s[2] ||= J("Job queue ", -1), K("span", yg, F(R(t).activeCount.value) + " active", 1)]), K("button", {
			ref_key: "closeButton",
			ref: r,
			type: "button",
			"data-action": "close-job-queue",
			"aria-label": "Close job queue",
			onClick: l
		}, "✕", 512)]), s[3] ||= K("p", { class: "studio-muted text-xs" }, "All kiosks · All followers · All wakewords", -1)]), K("div", bg, [
			R(t).error.value ? (W(), G("p", xg, [J(F(R(t).error.value) + " ", 1), K("button", {
				type: "button",
				onClick: s[0] ||= (...e) => R(t).refresh && R(t).refresh(...e)
			}, "Retry")])) : Y("", !0),
			o.value ? (W(), G(U, { key: 1 }, [s[4] ||= K("h3", { class: "studio-queue-group" }, "Selected job", -1), q(gg, { job: o.value }, null, 8, ["job"])], 64)) : Y("", !0),
			i.value.length ? (W(), G(U, { key: 2 }, [K("h3", Sg, "Running · " + F(i.value.length), 1), (W(!0), G(U, null, H(i.value, (e) => (W(), la(gg, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			a.value.length ? (W(), G(U, { key: 3 }, [K("h3", Cg, "Queued · " + F(a.value.length), 1), (W(!0), G(U, null, H(a.value, (e) => (W(), la(gg, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			R(t).history.value.length ? (W(), G(U, { key: 4 }, [s[5] ||= K("h3", { class: "studio-queue-group" }, "Recent history", -1), (W(!0), G(U, null, H(R(t).history.value, (e) => (W(), la(gg, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			!R(t).activeCount.value && !R(t).history.value.length && !o.value && !R(t).loading.value && !R(t).error.value ? (W(), G("p", wg, "No jobs yet.")) : Y("", !0),
			R(t).hasMore.value ? (W(), G("button", {
				key: 6,
				type: "button",
				class: "studio-queue-more",
				disabled: R(t).loading.value,
				onClick: s[1] ||= (...e) => R(t).loadMore && R(t).loadMore(...e)
			}, "Load older jobs", 8, Tg)) : Y("", !0)
		])], 512)], 64)) : Y("", !0);
	}
}), Dg = ["inert"], Og = { class: "studio-sidebar" }, kg = { class: "flex items-center justify-between gap-3" }, Ag = ["aria-expanded"], jg = ["hidden"], Mg = {
	key: 0,
	class: "studio-nav-label"
}, Ng = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], Pg = { class: "studio-main" }, Fg = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, Ig = { class: "studio-muted text-xs" }, Lg = { class: "flex flex-wrap items-center gap-3" }, Rg = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, zg = ["value", "disabled"], Bg = {
	key: 0,
	value: ""
}, Vg = ["value"], Hg = ["aria-expanded"], Ug = {
	key: 0,
	class: "studio-queue-badge"
}, Wg = {
	key: 1,
	title: "Job queue unavailable",
	"aria-label": "Job queue unavailable"
}, Gg = {
	key: 0,
	role: "status",
	class: "studio-note"
}, Kg = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, qg = {
	key: 2,
	role: "status"
}, Jg = /* @__PURE__ */ V({
	__name: "StudioShell",
	setup(e) {
		let t = ss(), n = xs(t);
		In(Ss, n);
		let r = Rc();
		In(Lc, r);
		let { wakewords: i, selectedId: a, selected: o, loading: s, error: c, notice: l } = n, u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(!1), f = /* @__PURE__ */ L(), p = /* @__PURE__ */ L(), m = X(() => is.find((e) => e.id === t.page.value)), h = X(() => d.value && !u.value), g = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
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
		}), _(), g?.addEventListener ? g.addEventListener("change", _) : g?.addListener(_), wr(() => {
			document.addEventListener("keydown", y), n.load(), r.start();
		}), Dr(() => {
			document.removeEventListener("keydown", y), r.stop(), g?.removeEventListener ? g.removeEventListener("change", _) : g?.removeListener(_);
		}), (e, o) => (W(), G("div", { class: P(["studio-app", { "is-narrow": d.value }]) }, [K("div", {
			class: "studio-layout",
			"data-studio-background": "",
			inert: R(r).open.value ? !0 : void 0
		}, [
			K("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: o[0] ||= Yo((e) => p.value?.focus(), ["prevent"])
			}, "Skip to content"),
			K("aside", Og, [
				K("div", kg, [o[4] ||= K("div", { class: "studio-brand" }, [J("◈ Wakeword Studio"), K("small", null, "LISTEN · REFINE · DEPLOY")], -1), d.value ? (W(), G("button", {
					key: 0,
					ref_key: "toggle",
					ref: f,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": u.value,
					onClick: o[1] ||= (e) => u.value = !u.value
				}, "Menu", 8, Ag)) : Y("", !0)]),
				K("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: h.value
				}, [(W(!0), G(U, null, H(R(is), (e, n) => (W(), G(U, { key: e.id }, [(e.group === "Data" || e.group === "Models") && R(is)[n - 1]?.group !== e.group ? (W(), G("div", Mg, F(e.group), 1)) : Y("", !0), K("a", {
					href: R(t).href(e.id),
					"data-page": e.id,
					class: P({
						active: m.value.id === e.id,
						"studio-sub": e.group === "Data"
					}),
					"aria-current": m.value.id === e.id ? "page" : void 0,
					onClick: Yo((t) => b(e.id), ["prevent"])
				}, F(e.name), 11, Ng)], 64))), 128))], 8, jg),
				o[5] ||= K("p", { class: "studio-sidebar-note" }, [
					J("Independent workspaces."),
					K("br"),
					J("Device selections stay unchanged.")
				], -1)
			]),
			K("div", Pg, [K("header", Fg, [K("div", Ig, F(m.value.group) + " / " + F(m.value.name), 1), K("div", Lg, [
				K("label", Rg, [o[6] ||= J("WAKEWORD ", -1), K("select", {
					id: "studio-word",
					value: R(a),
					disabled: !R(i).length,
					onChange: o[2] ||= (e) => R(n).select(e.target.value)
				}, [R(i).length ? Y("", !0) : (W(), G("option", Bg, "No wakewords")), (W(!0), G(U, null, H(R(i), (e) => (W(), G("option", {
					key: e.id,
					value: e.id
				}, F(e.phrase), 9, Vg))), 128))], 40, zg)]),
				q(ng),
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
					R(r).activeCount.value ? (W(), G("span", Ug, F(R(r).activeCount.value), 1)) : Y("", !0),
					R(r).error.value ? (W(), G("span", Wg, "!")) : Y("", !0)
				], 8, Hg)
			])]), K("main", {
				id: "studio-content",
				ref_key: "content",
				ref: p,
				class: "studio-content",
				tabindex: "-1"
			}, [
				R(l) ? (W(), G("p", Gg, F(R(l)), 1)) : Y("", !0),
				R(c) ? (W(), G("div", Kg, F(R(c)), 1)) : Y("", !0),
				R(s) ? (W(), G("p", qg, "Loading workspaces…")) : Y("", !0),
				m.value.id === "wakewords" ? (W(), la(Js, { key: 3 })) : m.value.id === "classify" ? (W(), la(wl, { key: 4 })) : m.value.id === "samples" ? (W(), la(hu, { key: 5 })) : m.value.id === "manual" ? (W(), la(od, { key: 6 })) : m.value.id === "kiosks" ? (W(), la(Hd, { key: 7 })) : m.value.id === "automate" ? (W(), la(wf, { key: 8 })) : m.value.id === "deploy" ? (W(), la(ap, { key: 9 })) : m.value.id === "online-datasets" ? (W(), la(Wp, { key: 10 })) : m.value.id === "artificial" ? (W(), la(Fm, { key: 11 })) : m.value.id === "train" ? (W(), la(gh, { key: 12 })) : m.value.id === "testing" ? (W(), la($h, { key: 13 })) : Y("", !0)
			], 512)])
		], 8, Dg), q(Eg)], 2));
	}
}), Yg = /* @__PURE__ */ V({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (W(), la(Jg));
	}
}), Xg = document.getElementById("trainer-app");
if (!Xg) throw Error("Missing #trainer-app mount point");
ts(Yg).mount(Xg);
//#endregion

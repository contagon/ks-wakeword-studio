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
var I, Te = /* @__PURE__ */ new WeakSet(), Ee = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, xe && (xe.active ? xe.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Te.has(this) && (Te.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ae(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ue(this), Ne(this);
		let e = I, t = ze;
		I = this, ze = !0;
		try {
			return this.fn();
		} finally {
			Pe(this), I = e, ze = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Le(e);
			this.deps = this.depsTail = void 0, Ue(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Te.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Fe(this) && this.run();
	}
	get dirty() {
		return Fe(this);
	}
}, De = 0, Oe, ke;
function Ae(e, t = !1) {
	e.flags |= 8, t ? (e.next = ke, ke = e) : (e.next = Oe, Oe = e);
}
function je() {
	De++;
}
function Me() {
	if (--De > 0) return;
	if (ke) {
		let e = ke;
		for (ke = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Oe;) {
		let t = Oe;
		for (Oe = void 0; t;) {
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
function Ne(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Pe(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Le(r), Re(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Fe(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Ie(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Ie(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === We) || (e.globalVersion = We, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Fe(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = I, r = ze;
	I = e, ze = !0;
	try {
		Ne(e);
		let n = e.fn(e._value);
		(t.version === 0 || A(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		I = n, ze = r, Pe(e), e.flags &= -3;
	}
}
function Le(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Le(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Re(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var ze = !0, Be = [];
function Ve() {
	Be.push(ze), ze = !1;
}
function He() {
	let e = Be.pop();
	ze = e === void 0 || e;
}
function Ue(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = I;
		I = void 0;
		try {
			t();
		} finally {
			I = e;
		}
	}
}
var We = 0, Ge = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Ke = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!I || !ze || I === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== I) t = this.activeLink = new Ge(I, this), I.deps ? (t.prevDep = I.depsTail, I.depsTail.nextDep = t, I.depsTail = t) : I.deps = I.depsTail = t, qe(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = I.depsTail, t.nextDep = void 0, I.depsTail.nextDep = t, I.depsTail = t, I.deps === t && (I.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, We++, this.notify(e);
	}
	notify(e) {
		je();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Me();
		}
	}
};
function qe(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) qe(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Je = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ Symbol(""), Xe = /* @__PURE__ */ Symbol(""), Ze = /* @__PURE__ */ Symbol("");
function Qe(e, t, n) {
	if (ze && I) {
		let t = Je.get(e);
		t || Je.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Ke()), r.map = t, r.key = n), r.track();
	}
}
function $e(e, t, n, r, i, a) {
	let o = Je.get(e);
	if (!o) {
		We++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (je(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === Ze || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(Ze)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Ye)), f(e) && s(o.get(Xe)));
				break;
			case "delete":
				i || (s(o.get(Ye)), f(e) && s(o.get(Xe)));
				break;
			case "set": f(e) && s(o.get(Ye));
		}
	}
	Me();
}
function et(e) {
	let t = /* @__PURE__ */ L(e);
	return t === e || (Qe(t, "iterate", Ze), /* @__PURE__ */ Bt(e)) ? t : /* @__PURE__ */ zt(e) ? /* @__PURE__ */ Rt(e) ? t.map((e) => Wt(Ut(e))) : t.map(Wt) : t.map(Ut);
}
function tt(e) {
	return Qe(e = /* @__PURE__ */ L(e), "iterate", Ze), e;
}
function nt(e, t) {
	return /* @__PURE__ */ zt(e) ? Wt(/* @__PURE__ */ Rt(e) ? Ut(t) : t) : Ut(t);
}
var rt = {
	__proto__: null,
	[Symbol.iterator]() {
		return it(this, Symbol.iterator, (e) => nt(this, e));
	},
	concat(...e) {
		return et(this).concat(...e.map((e) => d(e) ? et(e) : e));
	},
	entries() {
		return it(this, "entries", (e) => (e[1] = nt(this, e[1]), e));
	},
	every(e, t) {
		return st(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return st(this, "filter", e, t, (e) => e.map((e) => nt(this, e)), arguments);
	},
	find(e, t) {
		return st(this, "find", e, t, (e) => nt(this, e), arguments);
	},
	findIndex(e, t) {
		return st(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return st(this, "findLast", e, t, (e) => nt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return st(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return st(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return lt(this, "includes", e);
	},
	indexOf(...e) {
		return lt(this, "indexOf", e);
	},
	join(e) {
		return et(this).join(e);
	},
	lastIndexOf(...e) {
		return lt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return st(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return ut(this, "pop");
	},
	push(...e) {
		return ut(this, "push", e);
	},
	reduce(e, ...t) {
		return ct(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return ct(this, "reduceRight", e, t);
	},
	shift() {
		return ut(this, "shift");
	},
	some(e, t) {
		return st(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return ut(this, "splice", e);
	},
	toReversed() {
		return et(this).toReversed();
	},
	toSorted(e) {
		return et(this).toSorted(e);
	},
	toSpliced(...e) {
		return et(this).toSpliced(...e);
	},
	unshift(...e) {
		return ut(this, "unshift", e);
	},
	values() {
		return it(this, "values", (e) => nt(this, e));
	}
};
function it(e, t, n) {
	let r = tt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Bt(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => at(a.next(), n), i !== ot[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => at(a._next(), n);
	}
	return a;
}
function at(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var ot = Array.prototype;
function st(e, t, n, r, i, a) {
	let o = tt(e), s = o !== e && !/* @__PURE__ */ Bt(e), c = o[t];
	if (c !== ot[t]) {
		let t = c.apply(e, a);
		return s ? Ut(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, nt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function ct(e, t, n, r) {
	let i = tt(e), a = i !== e && !/* @__PURE__ */ Bt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = nt(e, t)), n.call(this, t, nt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? nt(e, c) : c;
}
function lt(e, t, n) {
	let r = /* @__PURE__ */ L(e);
	Qe(r, "iterate", Ze);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Vt(n[0]) ? (n[0] = /* @__PURE__ */ L(n[0]), r[t](...n)) : i;
}
function ut(e, t, n = []) {
	Ve(), je();
	let r = (/* @__PURE__ */ L(e))[t].apply(e, n);
	return Me(), He(), r;
}
var dt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), ft = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function pt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ L(this);
	return Qe(t, "has", e), t.hasOwnProperty(e);
}
var mt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Mt : jt : i ? At : kt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = rt[t])) return e;
			if (t === "hasOwnProperty") return pt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Gt(e) ? e : n);
		if ((_(t) ? ft.has(t) : dt(t)) || (r || Qe(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Gt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ It(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ It(o) : /* @__PURE__ */ Pt(o) : o;
	}
}, ht = class extends mt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ zt(i);
			if (!/* @__PURE__ */ Bt(n) && !/* @__PURE__ */ zt(n) && (i = /* @__PURE__ */ L(i), n = /* @__PURE__ */ L(n)), !a && /* @__PURE__ */ Gt(i) && !/* @__PURE__ */ Gt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Gt(e) ? e : r);
		return e === /* @__PURE__ */ L(r) && s && (o ? A(n, i) && $e(e, "set", t, n, i) : $e(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && $e(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !ft.has(t)) && Qe(e, "has", t), n;
	}
	ownKeys(e) {
		return Qe(e, "iterate", d(e) ? "length" : Ye), Reflect.ownKeys(e);
	}
}, gt = class extends mt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, _t = /* @__PURE__ */ new ht(), vt = /* @__PURE__ */ new gt(), yt = /* @__PURE__ */ new ht(!0), bt = (e) => e, xt = (e) => Reflect.getPrototypeOf(e);
function St(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ L(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? bt : t ? Wt : Ut;
		return !t && Qe(a, "iterate", l ? Xe : Ye), s(Object.create(u), { next() {
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
function Ct(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function wt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ L(r), a = /* @__PURE__ */ L(n);
			e || (A(n, a) && Qe(i, "get", n), Qe(i, "get", a));
			let { has: o } = xt(i), s = t ? bt : e ? Wt : Ut;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Qe(/* @__PURE__ */ L(t), "iterate", Ye), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ L(n), i = /* @__PURE__ */ L(t);
			return e || (A(t, i) && Qe(r, "has", t), Qe(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ L(a), s = t ? bt : e ? Wt : Ut;
			return !e && Qe(o, "iterate", Ye), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: Ct("add"),
		set: Ct("set"),
		delete: Ct("delete"),
		clear: Ct("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ L(this), r = xt(n), i = /* @__PURE__ */ L(e), a = !t && !/* @__PURE__ */ Bt(e) && !/* @__PURE__ */ zt(e) ? i : e;
			return r.has.call(n, a) || A(e, a) && r.has.call(n, e) || A(i, a) && r.has.call(n, i) || (n.add(a), $e(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Bt(n) && !/* @__PURE__ */ zt(n) && (n = /* @__PURE__ */ L(n));
			let r = /* @__PURE__ */ L(this), { has: i, get: a } = xt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ L(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? A(n, s) && $e(r, "set", e, n, s) : $e(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ L(this), { has: n, get: r } = xt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ L(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && $e(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ L(this), t = e.size !== 0, n = e.clear();
			return t && $e(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = St(r, e, t);
	}), n;
}
function Tt(e, t) {
	let n = wt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Et = { get: /* @__PURE__ */ Tt(!1, !1) }, Dt = { get: /* @__PURE__ */ Tt(!1, !0) }, Ot = { get: /* @__PURE__ */ Tt(!0, !1) }, kt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap();
function Nt(e) {
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
function Pt(e) {
	return /* @__PURE__ */ zt(e) ? e : Lt(e, !1, _t, Et, kt);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
	return Lt(e, !1, yt, Dt, At);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
	return Lt(e, !0, vt, Ot, jt);
}
function Lt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Nt(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
	return /* @__PURE__ */ zt(e) ? /* @__PURE__ */ Rt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ L(t) : e;
}
function Ht(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && j(e, "__v_skip", !0), e;
}
var Ut = (e) => v(e) ? /* @__PURE__ */ Pt(e) : e, Wt = (e) => v(e) ? /* @__PURE__ */ It(e) : e;
// @__NO_SIDE_EFFECTS__
function Gt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function R(e) {
	return qt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Kt(e) {
	return qt(e, !0);
}
function qt(e, t) {
	return /* @__PURE__ */ Gt(e) ? e : new Jt(e, t);
}
var Jt = class {
	constructor(e, t) {
		this.dep = new Ke(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ L(e), this._value = t ? e : Ut(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Bt(e) || /* @__PURE__ */ zt(e);
		e = n ? e : /* @__PURE__ */ L(e), A(e, t) && (this._rawValue = e, this._value = n ? e : Ut(e), this.dep.trigger());
	}
};
function z(e) {
	return /* @__PURE__ */ Gt(e) ? e.value : e;
}
var Yt = {
	get: (e, t, n) => t === "__v_raw" ? e : z(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Gt(i) && !/* @__PURE__ */ Gt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Xt(e) {
	return /* @__PURE__ */ Rt(e) ? e : new Proxy(e, Yt);
}
var Zt = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Ke(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function Qt(e) {
	return new Zt(e);
}
var $t = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Ke(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = We - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && I !== this) return Ae(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Ie(this), e && (e.version = this.dep.version), this._value;
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
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Bt(e) || o === !1 || o === 0 ? sn(e, 1) : sn(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Gt(e) ? (g = () => e.value, y = /* @__PURE__ */ Bt(e)) : /* @__PURE__ */ Rt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ Rt(e) || /* @__PURE__ */ Bt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Gt(e)) return e.value;
		if (/* @__PURE__ */ Rt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Ve();
			try {
				_();
			} finally {
				He();
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
	let C = b ? Array(e.length).fill(tn) : tn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => A(e, C[t])) : A(t, C))) {
					let e = rn;
					Ve();
					try {
						_ && _(), rn = m;
						let e = [
							t,
							C === tn ? void 0 : b && C[0] === tn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						rn = e, He();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Ee(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => an(e, !1, m), _ = m.onStop = () => {
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
	if (n.set(e, t), t--, /* @__PURE__ */ Gt(e)) sn(e.value, t, n);
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
			Ve(), cn(o, null, 10, [
				e,
				i,
				a
			]), He();
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
		r._d && na(-1);
		let i = Mn(t), a = Qi.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Qi.length; e > a; e--) ea();
			Mn(i), r._d && na(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function B(e, n) {
	if (An === null) return e;
	let r = Ia(An), i = e.dirs ||= [];
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
		c && (Ve(), ln(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), He());
	}
}
function Fn(e, t) {
	if (Sa) {
		let n = Sa.provides, r = Sa.parent && Sa.parent.provides;
		r === n && (n = Sa.provides = Object.create(r)), n[e] = t;
	}
}
function In(e, t, n = !1) {
	let r = Ca();
	if (r || ri) {
		let i = ri ? ri._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Ln = /* @__PURE__ */ Symbol.for("v-scx"), Rn = () => In(Ln);
function zn(e, t) {
	return Bn(e, null, { flush: "sync" });
}
function V(e, t, n) {
	return Bn(e, t, n);
}
function Bn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (ka) {
		if (c === "sync") {
			let e = Rn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Sa;
	u.call = (e, t, n) => ln(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Ii(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : xn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = on(e, n, u);
	return ka && (f ? f.push(h) : d && h()), h;
}
function Vn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Hn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Ea(this), s = Bn(i, a.bind(r), n);
	return o(), s;
}
function Hn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Un = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ Symbol("_vte"), Gn = (e) => e.__isTeleport, Kn = (e) => e && (e.disabled || e.disabled === ""), qn = (e) => e && (e.defer || e.defer === ""), Jn = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Yn = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Xn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, Zn = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Kn(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Kn(e.props), r = e.target = Xn(e.props, m), a = nr(r, e, h, p);
			r && (o !== "svg" && Jn(r) ? o = "svg" : o !== "mathml" && Yn(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), tr(e, !1)));
		}, S = (e) => {
			let t = () => {
				if (Un.get(e) === t) {
					if (Un.delete(e), Kn(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), tr(e, !0);
					}
					x(e);
				}
			};
			Un.set(e, t), Ii(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), qn(t.props) || a && a.pendingBranch) {
				S(t);
				return;
			}
			v && (b(t, n, i), tr(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Un.get(e);
			if (u) {
				u.flags |= 8, Un.delete(e), S(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Kn(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Jn(p) ? o = "svg" : (o === "mathml" || Yn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Hi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Qn(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Xn(t.props, m);
				e && (t.target = e, Qn(t, e, null, l, 0));
			} else g && Qn(t, p, h, l, 1);
			tr(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Kn(f), m = a || !p, h = Un.get(e);
		if (h && (h.flags |= 8, Un.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: Qn,
	hydrate: $n
};
function Qn(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && (e.targetStart && r(e.targetStart, t, n), r(e.targetAnchor, t, n), n = e.targetAnchor);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Un.has(e) && (!d || Kn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function $n(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
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
	let m = t.target = Xn(t.props, c), h = Kn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || nr(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || nr(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), tr(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var er = Zn;
function tr(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function nr(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Wn] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var rr = /* @__PURE__ */ Symbol("_leaveCb");
function ir(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Xi) {
			t = n;
			break;
		}
	}
	return t;
}
function ar(e) {
	if (!hr(e)) return Gn(e.type) && e.children ? ir(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function or(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		or(Gn(n.type) && ar(n) || n, t);
	} else if (e.shapeFlag & 128) e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	else if (e.transition = t, e.type === U && d(e.children)) {
		let n = di(e.children, !1);
		n && or(n, t);
	}
}
function sr(e) {
	if (e.component) return sr(e.component.subTree);
	if (e.type === U) {
		let t = d(e.children) && di(e.children, !1);
		return t ? sr(t) : void 0;
	}
	if (e.type !== Xi) return e;
}
// @__NO_SIDE_EFFECTS__
function cr(e, t) {
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
	let s = a.shapeFlag & 4 ? Ia(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ L(v), b = v === t ? i : (e) => !ur(_, e) && u(y, e), x = (e, t) => !(t && ur(_, t));
	if (m != null && m !== p) {
		if (pr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Gt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) cn(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Gt(p);
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
ae().requestIdleCallback, ae().cancelIdleCallback;
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
			Ve();
			let i = Ea(n), a = ln(t, n, e, r);
			return i(), He(), a;
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
		let n = o && /* @__PURE__ */ Rt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Bt(e), s = /* @__PURE__ */ zt(e), e = tt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Wt(Ut(e[n])) : Ut(e[n]) : e[n], n, void 0, a && a[n]);
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
		xn(e.update);
	},
	$nextTick: (e) => e.n ||= yn.bind(e.proxy),
	$watch: (e) => Vn.bind(e)
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
		if (d) return n === "$attrs" && Qe(e.attrs, "get", ""), d(e);
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
		v(t) && (e.data = /* @__PURE__ */ Pt(t));
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
			Fn(t, e[t]);
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
		i = v(r) ? "default" in r ? In(r.from || n, r.default, !0) : In(r.from || n) : In(r), /* @__PURE__ */ Gt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Hr(e, t, n) {
	ln(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Ur(e, t, n, r) {
	let i = r.includes(".") ? Hn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && V(i, n);
	} else if (h(e)) V(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Ur(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && V(i, r, e);
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
				c && (ln(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
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
	let i = Ca(), a = O(n), o = k(n), s = ai(e, a), c = Qt((s, c) => {
		let l, u = t, d;
		return zn(() => {
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
	!l && o && (l = i[c = ne(k(n))]), l && ln(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, ln(u, e, 6, a);
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
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Mn(e), v, y;
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
		Qi.length = 0, un(t, e, 1), v = q(Xi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = pi(y, a)), b = da(b, y, !1, !0));
	}
	return n.dirs && (b = da(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && or(Gn(b.type) && ar(b) || b, n.transition), v = b, Mn(_), v;
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
	return n === "style" && v(r) && v(i) ? !ge(r, i) : r !== i;
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
	e.props = n ? r ? i : /* @__PURE__ */ Ft(i) : e.type.props ? i : a, e.attrs = a;
}
function Si(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ L(i), [c] = e.propsOptions, l = !1;
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
	l && $e(e.attrs, "set", "");
}
function Ci(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : li(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ L(r), i = c || t;
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
	let r = Nn((...e) => ki(t(...e)), n);
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
	let a = ae();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !oa(e, t) && (i = me(e), P(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
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
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? A(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ge);
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
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, zi(e, a), s, u), _ && Pn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && _a(f, r, e);
		}
		_ && Pn(e, null, r, "beforeMount");
		let v = Vi(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Ii(() => {
			try {
				f && _a(f, r, e), v && g.enter(d), _ && Pn(e, null, r, "mounted");
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
		if (r && Bi(r, !1), (g = h.onVnodeBeforeUpdate) && _a(g, r, n, e), f && Pn(n, e, r, "beforeUpdate"), r && Bi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, zi(n, a), o) : s || se(e, n, l, null, r, i, zi(n, a), o, !1), u > 0) {
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
			g && _a(g, r, n, e), f && Pn(n, e, r, "updated");
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
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Hi(e, t, !0)) : se(e, t, n, f, i, a, s, c, l);
	}, A = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : ie(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = xa(e, r, i);
		if (hr(e) && (s.ctx.renderer = ge), Aa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, M, o, a), !e.el) {
				let r = s.subTree = q(Xi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else M(s, e, t, n, i, a, o);
	}, ie = (e, t, n) => {
		let r = t.component = e.component;
		if (mi(e, t, n)) {
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
					let n = Wi(e);
					if (n) {
						t && (t.el = c.el, oe(e, t, o)), n.asyncDep.then(() => {
							Ii(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Bi(e, !1), t ? (t.el = c.el, oe(e, t, o)) : t = c, n && re(n), (d = t.props && t.props.onVnodeBeforeUpdate) && _a(d, s, t, c), Bi(e, !0);
				let f = ui(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), me(p), e, i, a), t.el = f.el, u === null && _i(e, f.el), r && Ii(r, i), (d = t.props && t.props.onVnodeUpdated) && Ii(() => _a(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = mr(t);
				if (Bi(e, !1), l && re(l), !m && (o = c && c.onVnodeBeforeMount) && _a(o, d, t), Bi(e, !0), s && ve) {
					let t = () => {
						e.subTree = ui(e), ve(s, e.subTree, e, i, null);
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
		let c = e.effect = new Ee(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => xn(u), Bi(e, !0), l();
	}, oe = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Si(e, t.props, r, n), Fi(e, t.children, n), Ve(), wn(e), He();
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
			let n = t[p] = l ? ma(t[p]) : pa(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? pe(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, N = (e, t, r, i, a, o, s, c, l) => {
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
		} else if (u > p) for (; u <= f;) P(e[u], a, o, !0), u++;
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
					P(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && oa(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? P(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Ui(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Ki(f) : i;
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
		} else if (c === Zi) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[rr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Ii(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[rr];
					a._isLeaving && a[rr](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, P = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ve(), fr(s, null, n, e, !0), He()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !mr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && _a(_, t, e), u & 6) fe(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Pn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ge, r) : l && !l.hasOnce && (a !== U || d > 0 && d & 64) ? pe(l, t, n, !1, !0) : (a === U && d & 384 || !i && u & 16) && pe(c, t, n), r && ue(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Ii(() => {
			_ && _a(_, t, e), h && Pn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, ue = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === U;
		if (a && !i) {
			de(n, r);
			return;
		}
		if (t === Zi) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? sr(e) : e, c = () => {
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
		Gi(c), Gi(l), r && re(r), i.stop(), a ? (a.flags |= 8, P(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, P(o, e, t, n)), s && Ii(s, t), Ii(() => {
			e.isUnmounted = !0;
		}, t);
	}, pe = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) P(e[o], t, n, r, i);
	}, me = (e) => {
		if (e.shapeFlag & 6) return me(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Wn];
		return n ? h(n) : t;
	}, he = (e, t, n) => {
		Dn(() => {
			e == null ? t._vnode && P(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : ba());
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
		createApp: ni(he, _e)
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
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Cn(e);
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
var sa = ({ key: e }) => e ?? null, ca = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Gt(e) || h(e) ? {
	i: An,
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
		e && !g(e) && (t.class = P(e)), v(n) && (/* @__PURE__ */ Vt(n) && !d(n) && (n = s({}, n)), t.style = oe(n));
	}
	let o = g(e) ? 1 : qi(e) ? 128 : Gn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return K(e, t, n, r, i, o, a, !0);
}
function ua(e) {
	return e ? /* @__PURE__ */ Vt(e) || bi(e) ? s({}, e) : e : null;
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
	return c && r && or(u, c.clone(u)), u;
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
			!r && !bi(t) ? t._ctx = An : r === 3 && An && (An.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ha(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: An
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [J(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function ga(...e) {
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
function _a(e, t, n, r = null) {
	ln(e, t, 7, [n, r]);
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
var Sa = null, Ca = () => Sa || An, wa, Ta;
{
	let e = ae(), t = (t, n) => {
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
		Ve();
		let n = e.setupContext = r.length > 1 ? Fa(e) : null, i = Ea(e), a = cn(r, e, 0, [e.props, n]), o = y(a);
		if (He(), i(), (o || e.sp) && !mr(e) && lr(e), o) {
			if (a.then(Da, Da), t) return a.then((n) => {
				Ta(!0);
				try {
					Ma(e, n, t);
				} finally {
					Ta(!1);
				}
			}).catch((t) => {
				un(t, e, 0);
			});
			e.asyncDep = a;
		} else Ma(e, a, t);
	} else Na(e, t);
}
function Ma(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Xt(t)), Na(e, n);
}
function Na(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = Ea(e);
		Ve();
		try {
			Br(e);
		} finally {
			He(), t();
		}
	}
}
var Pa = { get(e, t) {
	return Qe(e, "get", ""), e[t];
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
	return e.exposed ? e.exposeProxy ||= new Proxy(Xt(Ht(e.exposed)), {
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
var X = (e, t) => /* @__PURE__ */ en(e, t, ka), Ra = "3.5.44", za = void 0, Ba = typeof window < "u" && window.trustedTypes;
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
function lo(e, t, n, r, i, a = ue(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(co, t.slice(6, t.length)) : e.setAttributeNS(co, t, n) : n == null || a && !de(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
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
		r === "boolean" ? n = de(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
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
				e && ln(e, t, 5, a);
			}
		} else ln(r, t, 5, [e]);
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
				let e = _e(t, n), a = e !== -1;
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
	if (d(t)) i = _e(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ge(t, Bo(e, !0));
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
				yn(() => {
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
	if (!n || d(e)) return ge(e, t);
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
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : _e(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (ge(zo(a), t)) {
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
	let e = /* @__PURE__ */ R("wakewords"), t = /* @__PURE__ */ R(""), n = /* @__PURE__ */ R("review");
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
	let o = V(t, a, { flush: "sync" });
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
	submitGeneration: (e, t, n) => us(`${Z(e)}/generation/submissions`, t, n),
	generationSources: (e, t, n) => Q(`${Z(e)}/generation/sources`, t, n),
	preview: (e, t, n) => us(`${Z(e)}/generation/previews`, t, n),
	previewAudioUrl: (e, t) => `${ns}${Z(e)}/generation/previews/${rs(t)}/audio`,
	batches: (e, t, n) => Q(`${Z(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Q(`${Z(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Q(`${Z(e)}/generation/batches/${rs(t)}`, void 0, n),
	selectBatches: (e, t, n) => ds(`${Z(e)}/generation/batches`, { batch_ids: t }, n),
	deleteBatch: (e, t, n) => os(`${Z(e)}/generation/batches/${rs(t)}`, "DELETE", void 0, n),
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
	let t = /* @__PURE__ */ R([]), n = e.selectedId, r = /* @__PURE__ */ Kt(null), i = /* @__PURE__ */ Kt(null), a = /* @__PURE__ */ R(!1), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(""), u, d, f = !1, p = "That wakeword is no longer available. Select another workspace.";
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
	return V(n, () => {
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
var ps = Symbol("studio-workspace");
function ms() {
	let e = In(ps);
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
}, Rs = { id: "delete-heading" }, zs = { class: "flex flex-wrap gap-3 mt-3" }, Bs = ["disabled"], Vs = ["disabled"], Hs = /* @__PURE__ */ cr({
	__name: "WakewordsPage",
	setup(e) {
		let t = ms(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ Pt({
			phrase: "",
			language: "en"
		}), d = /* @__PURE__ */ Pt({
			phrase: "",
			language: ""
		}), f = /* @__PURE__ */ R(!1), p = /* @__PURE__ */ R(""), m = /* @__PURE__ */ R(""), h = /* @__PURE__ */ R(!1), g = /* @__PURE__ */ R(!1), _ = /* @__PURE__ */ R(), v = /* @__PURE__ */ R();
		async function y() {
			g.value = !0, await yn(), _.value?.focus();
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
		V(i, (e) => {
			d.phrase = e?.phrase ?? "", d.language = e?.language ?? "";
		}, { immediate: !0 }), V(r, () => {
			S?.abort(), f.value = !1, g.value = !1, h.value = !1, p.value = "", m.value = "";
		}), we(() => {
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
				disabled: z(c),
				onClick: S[0] ||= (e) => z(t).load()
			}, "Refresh workspaces", 8, gs)]),
			!z(c) && !z(l) && !z(n).length ? (W(), G("p", _s, "No wakewords yet. Create your first workspace below.")) : Y("", !0),
			K("div", vs, [(W(!0), G(U, null, H(z(n), (e) => (W(), G("button", {
				key: e.id,
				class: P(["studio-card studio-word-card", { "studio-selected": e.id === z(r) }]),
				"aria-pressed": e.id === z(r),
				onClick: (n) => z(t).select(e.id)
			}, [K("span", bs, [K("strong", null, F(e.phrase), 1), K("span", xs, F(e.language), 1)])], 10, ys))), 128))]),
			z(o) ? (W(), G("p", Ss, "Loading selected workspace…")) : Y("", !0),
			z(s) ? (W(), G("div", Cs, [J(F(z(s)) + " ", 1), K("button", { onClick: S[1] ||= (e) => z(t).refreshSelected() }, "Retry workspace")])) : Y("", !0),
			z(a) && z(i) ? (W(), G("div", ws, [K("div", Ts, [K("h2", null, F(z(i).phrase) + " · Overview", 1), K("details", null, [
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
				K("div", null, [S[14] ||= K("dt", { class: "studio-muted" }, "Pending classification", -1), K("dd", null, F(z(a).pending) + " pending", 1)]),
				K("div", null, [
					S[15] ||= K("dt", { class: "studio-muted" }, "Archived models", -1),
					K("dd", null, F(z(a).modelCount) + " versions", 1),
					K("dd", ks, F(z(a).latestModel ? `Latest: ${z(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				K("div", null, [
					S[16] ||= K("dt", { class: "studio-muted" }, "Autotrain", -1),
					K("dd", null, F(z(a).schedule?.enabled ? `${z(a).schedule.cron} · ${z(a).schedule.timezone}` : "Not scheduled"), 1),
					z(a).schedule?.enabled ? (W(), G("dd", As, "Next: " + F(z(a).schedule.next_run_at), 1)) : Y("", !0)
				])
			])])) : Y("", !0),
			p.value ? (W(), G("p", js, F(p.value), 1)) : Y("", !0),
			m.value ? (W(), G("p", Ms, F(m.value), 1)) : Y("", !0),
			K("div", Ns, [K("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: S[5] ||= Uo((e) => w("create"), ["prevent"])
			}, [
				S[19] ||= K("h2", null, "New wakeword", -1),
				K("label", null, [S[17] ||= J("Display phrase", -1), B(K("input", {
					"onUpdate:modelValue": S[3] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[No, u.phrase]])]),
				K("label", null, [S[18] ||= J("Language", -1), B(K("input", {
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
			z(i) && g.value ? (W(), G("div", {
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
				K("h2", null, "Edit " + F(z(i).phrase), 1),
				K("label", null, [S[20] ||= J("Display phrase", -1), B(K("input", {
					ref_key: "editInput",
					ref: _,
					"onUpdate:modelValue": S[6] ||= (e) => d.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[No, d.phrase]])]),
				K("label", null, [S[21] ||= J("Language", -1), B(K("input", {
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
				p.value ? (W(), G("p", Ls, F(p.value), 1)) : Y("", !0)
			], 32)], 32)) : Y("", !0),
			h.value && z(i) ? (W(), G("section", {
				key: 7,
				role: "alertdialog",
				"aria-labelledby": "delete-heading",
				"aria-describedby": "delete-description",
				class: "studio-card mt-4",
				onKeydown: S[11] ||= Go((e) => !f.value && (h.value = !1), ["esc"])
			}, [
				K("h2", Rs, "Delete " + F(z(i).phrase) + " permanently?", 1),
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
				}, F(f.value ? "Deleting…" : "Permanently delete workspace"), 9, Vs)])
			], 32)) : Y("", !0)
		]));
	}
}), Us = ["aria-busy"], Ws = ["data-ready"], Gs = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Ks = ["disabled", "aria-label"], qs = ["disabled"], Js = /* @__PURE__ */ cr({
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
		let r = e, i = n, a = /* @__PURE__ */ R(), o = /* @__PURE__ */ R(), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(!1), u = /* @__PURE__ */ R("Waveform preview will appear when audio is ready."), d, f, p, m = 0, h = [], g = /* @__PURE__ */ new WeakSet();
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
		return V(() => [r.sampleId, r.src], () => {
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
			K("p", Gs, F(u.value), 1),
			K("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? O() : D()
			}, F(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Ks),
			K("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: k
			}, "Replay", 8, qs)
		], 8, Us));
	}
}), Ys = /* @__PURE__ */ R([]), Xs = /* @__PURE__ */ R(!1), Zs = /* @__PURE__ */ R(""), Qs = !1, $s;
function ec(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function tc() {
	function e(e) {
		let t = Ys.value.find((t) => t.id === e);
		return t?.name?.trim() || t?.url || "Unknown kiosk";
	}
	async function t(e = !1) {
		if (Qs && !e) return;
		$s?.abort();
		let t = new AbortController();
		$s = t, Xs.value = !0, Zs.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && $s === t && (Ys.value = e, Qs = !0);
		} catch (e) {
			!t.signal.aborted && $s === t && (Zs.value = ec(e));
		} finally {
			$s === t && (Xs.value = !1);
		}
	}
	function n(e) {
		Ys.value = Ys.value.findIndex((t) => t.id === e.id) < 0 ? [...Ys.value, e] : Ys.value.map((t) => t.id === e.id ? e : t), Qs = !0;
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
		$s?.abort();
	}
	return {
		devices: /* @__PURE__ */ It(Ys),
		loading: /* @__PURE__ */ It(Xs),
		error: /* @__PURE__ */ It(Zs),
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
var nc = {
	key: 0,
	class: "studio-pagination",
	"aria-live": "polite"
}, rc = { class: "flex gap-2" }, ic = ["disabled"], ac = ["disabled"], oc = /* @__PURE__ */ cr({
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
		return (t, n) => e.total > e.limit || e.offset > 0 ? (W(), G("div", nc, [K("span", null, F(i()) + "–" + F(a()) + " of " + F(e.total), 1), K("div", rc, [K("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, ic), K("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, ac)])])) : Y("", !0);
	}
}), sc = { class: "studio-card" }, cc = { class: "flex justify-between gap-3" }, lc = ["disabled"], uc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, dc = {
	key: 1,
	role: "status"
}, fc = {
	key: 2,
	class: "grid gap-3"
}, pc = ["data-run-id"], mc = { class: "studio-muted text-xs" }, hc = { key: 0 }, gc = {
	key: 0,
	class: "studio-muted"
}, _c = /* @__PURE__ */ cr({
	__name: "CollectionHistory",
	props: {
		refreshKey: {},
		activeRunId: {}
	},
	setup(e) {
		let t = tc();
		Cr(() => {
			t.load();
		});
		let n = e, r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(!1), o = /* @__PURE__ */ R(0), s = /* @__PURE__ */ R(0), c;
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
		return V([() => n.refreshKey, s], () => {
			l();
		}, { immediate: !0 }), Er(() => c?.abort()), (n, c) => (W(), G("section", sc, [
			K("div", cc, [c[1] ||= K("h2", null, "Collection history · Fleet-wide", -1), K("button", {
				disabled: a.value,
				onClick: l
			}, "Refresh history", 8, lc)]),
			i.value ? (W(), G("p", uc, F(i.value), 1)) : Y("", !0),
			a.value ? (W(), G("p", dc, "Loading collection history…")) : (W(), G("div", fc, [(W(!0), G(U, null, H(r.value, (n) => (W(), G("article", {
				key: n.id,
				"data-run-id": n.id,
				class: P(["studio-history", { "studio-selected": n.id === e.activeRunId }])
			}, [
				K("strong", null, F(n.id), 1),
				J(" · " + F(n.status) + " · " + F(n.started_at), 1),
				K("p", mc, "New " + F(n.new) + " · Unmapped " + F(n.unmapped) + " · Failed " + F(n.failed), 1),
				K("ul", null, [(W(!0), G(U, null, H(n.devices, (e) => (W(), G("li", { key: e.device_id }, [J(F(z(t).deviceLabel(e.device_id)) + " · " + F(e.status) + " · new " + F(e.new) + " · failed " + F(e.failed), 1), e.errors.length ? (W(), G("span", hc, " · " + F(e.errors.join(", ")), 1)) : Y("", !0)]))), 128))])
			], 10, pc))), 128)), r.value.length ? Y("", !0) : (W(), G("p", gc, "No collection runs yet."))])),
			q(oc, {
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
}), vc = { class: "studio-card" }, yc = { class: "flex flex-wrap items-center justify-between gap-3" }, bc = ["disabled"], xc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Sc = ["data-unmapped-id"], Cc = { class: "studio-muted text-xs" }, wc = ["disabled", "onClick"], Tc = ["onUpdate:modelValue"], Ec = ["value"], Dc = ["disabled", "onClick"], Oc = {
	key: 1,
	class: "studio-muted"
}, kc = /* @__PURE__ */ cr({
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
		let n = tc();
		Cr(() => {
			n.load();
		});
		let r = t, i = ms(), a = /* @__PURE__ */ R({}), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(""), c;
		V(i.selectedId, () => {
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
		return Er(() => c?.abort()), (t, c) => (W(), G("section", vc, [
			K("div", yc, [c[1] ||= K("h2", null, "Unmapped recordings · Fleet-wide", -1), K("button", {
				"data-action": "refresh-unmapped",
				disabled: e.refreshing || e.busy,
				onClick: c[0] ||= (e) => r("refresh")
			}, F(e.refreshing ? "Refreshing…" : "Refresh inbox"), 9, bc)]),
			c[4] ||= K("p", { class: "studio-muted" }, "Collection automatically matches unique wake phrases and model identifiers. Unknown or ambiguous matches stay here, never assigned just because a workspace is selected. Assign a recording now, or save an exact kiosk + engine + source-phrase mapping to override future matching.", -1),
			s.value ? (W(), G("p", xc, F(s.value), 1)) : Y("", !0),
			(W(!0), G(U, null, H(e.recordings, (t) => (W(), G("article", {
				key: t.id,
				"data-unmapped-id": t.id,
				class: "studio-mapping-row"
			}, [K("div", null, [
				K("strong", null, F(t.phrase), 1),
				K("p", Cc, F(z(n).deviceLabel(t.device_id)) + " · " + F(t.engine), 1),
				K("button", {
					"data-action": "assign",
					disabled: e.busy || !z(i).selectedId.value,
					onClick: (e) => r("assign", t)
				}, "Assign to this wakeword", 8, wc)
			]), K("div", null, [K("label", null, [c[3] ||= J("Source phrase → wakeword", -1), B(K("select", {
				"onUpdate:modelValue": (e) => a.value[t.id] = e,
				name: "mapping-word"
			}, [c[2] ||= K("option", { value: "" }, "Choose wakeword", -1), (W(!0), G(U, null, H(z(i).wakewords.value, (e) => (W(), G("option", {
				key: e.id,
				value: e.id
			}, F(e.phrase), 9, Ec))), 128))], 8, Tc), [[Io, a.value[t.id]]])]), K("button", {
				class: "mt-2",
				"data-action": "save-mapping",
				disabled: !a.value[t.id] || !!o.value,
				onClick: (e) => l(t)
			}, "Save source mapping", 8, Dc)])], 8, Sc))), 128)),
			!e.recordings.length && !e.refreshing ? (W(), G("p", Oc, "No unmapped recordings.")) : Y("", !0)
		]));
	}
}), Ac = (e) => [
	"queued",
	"running",
	"cancelling"
].includes(e.status), jc = Symbol("studio-job-queue");
function Mc() {
	let e = /* @__PURE__ */ R({}), t = /* @__PURE__ */ R([]), n = /* @__PURE__ */ R(0), r = /* @__PURE__ */ R(!1), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R({}), c = /* @__PURE__ */ R(/* @__PURE__ */ new Set()), l = X(() => Object.values(e.value).filter(Ac).sort((e, t) => e.created_at.localeCompare(t.created_at))), u = X(() => l.value.length), d = X(() => t.value.map((t) => e.value[t]).filter((e) => !!e && !Ac(e))), f = X(() => t.value.length < n.value), p = !1, m, h = !1, g = 0, _, v, y = 50, b = 0, x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Set();
	function w(t) {
		e.value[t.id] && !Ac(e.value[t.id]) && Ac(t) || (e.value = {
			...e.value,
			[t.id]: t
		}, x.set(t.id, ++b));
	}
	function T(t, n) {
		e.value[t.id] && !Ac(e.value[t.id]) && Ac(t) || (x.get(t.id) ?? 0) <= n && (e.value[t.id] = t);
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
		if (c.value.has(t) || !e.value[t] || !Ac(e.value[t])) return;
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
function Nc() {
	let e = In(jc, null);
	if (e) return e;
	let t = Mc();
	return Cr(t.start), Er(t.stop), t;
}
//#endregion
//#region src/studio/pages/ClassifyPage.vue?vue&type=script&setup=true&lang.ts
var Pc = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Fc = { class: "flex flex-wrap items-center gap-3" }, Ic = {
	"data-progress": "",
	class: "studio-muted"
}, Lc = ["disabled"], Rc = {
	class: "studio-tabs",
	role: "tablist",
	"aria-label": "Classification sections"
}, zc = [
	"id",
	"aria-selected",
	"aria-controls",
	"onClick"
], Bc = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, Vc = ["role"], Hc = ["href"], Uc = {
	id: "classify-panel-review",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-review"
}, Wc = { class: "studio-card studio-toolbar mb-4" }, Gc = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Kc = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, qc = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, Jc = ["data-sample-id"], Yc = { class: "flex flex-wrap justify-between gap-3" }, Xc = { class: "studio-muted text-sm" }, Zc = { class: "studio-muted" }, Qc = {
	key: 0,
	class: "studio-muted text-xs"
}, $c = { class: "flex flex-wrap gap-2" }, el = ["disabled"], tl = ["disabled"], nl = ["disabled"], rl = ["disabled"], il = ["disabled"], al = {
	key: 4,
	class: "studio-card"
}, ol = { key: 0 }, sl = { key: 1 }, cl = {
	key: 2,
	id: "classify-panel-collect",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-collect"
}, ll = { class: "studio-card mb-4" }, ul = ["href"], dl = {
	id: "classify-panel-unmapped",
	role: "tabpanel",
	"aria-labelledby": "classify-tab-unmapped"
}, fl = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, pl = {
	key: 3,
	class: "studio-modal-backdrop"
}, ml = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, hl = { class: "flex gap-2" }, gl = ["disabled"], _l = [], vl = /* @__PURE__ */ cr({
	__name: "ClassifyPage",
	setup(e) {
		let t = ms(), n = tc();
		Cr(() => {
			n.load();
		});
		let r = Nc(), { classifyTab: i } = t.routes, a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R(""), c = X(() => {
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
		V(r.jobs, (e) => {
			let t = a.value && e[a.value.id];
			t && p(t);
		}, { deep: !0 });
		let m = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ R([]), g = /* @__PURE__ */ R([]), _ = /* @__PURE__ */ R(!1), v = /* @__PURE__ */ R(""), y;
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
		let x = /* @__PURE__ */ R(/* @__PURE__ */ new Set()), S = /* @__PURE__ */ R(0), C = /* @__PURE__ */ R(0), w = /* @__PURE__ */ R(0), T = /* @__PURE__ */ R(!1), E = /* @__PURE__ */ R(!1), D = /* @__PURE__ */ R(""), O = /* @__PURE__ */ R(""), ee = /* @__PURE__ */ R(!1), k = /* @__PURE__ */ R(!1), te = /* @__PURE__ */ R(null), ne = /* @__PURE__ */ R(!1), A = /* @__PURE__ */ R(""), re = /* @__PURE__ */ R(), j, ie, M = 0, ae, oe = 0, se = 0, ce = X(() => h.value.filter((e) => !x.value.has(e.id))), N = X(() => ce.value[S.value] ?? null), le = X(() => N.value ? $.audioUrl(N.value.word_id, N.value.id) : null), ue = X(() => w.value);
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
				_l.push({
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
			if (E.value || !_l.length) return;
			ee.value = !0, E.value = !0, D.value = "";
			let e = _l[_l.length - 1], n = new AbortController();
			ie?.abort(), ie = n;
			let r = ++M, i = t.selectedId.value, a = () => !n.signal.aborted && r === M && t.selectedId.value === i;
			try {
				let r = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (!a()) return;
				_l.pop(), O.value = "Last label restored to pending.", t.selectedId.value === e.word && (h.value = [r, ...h.value.filter((e) => e.id !== r.id)], C.value += 1, w.value = Math.max(0, w.value - 1), S.value = 0, k.value = !1);
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
		return V(t.selectedId, () => {
			d?.abort(), a.value = null, o.value = !1, s.value = "", ge();
		}, { immediate: !0 }), V(A, () => {
			ge();
		}), V(() => N.value?.id, () => {
			te.value = null;
		}, { flush: "sync" }), Cr(() => document.addEventListener("keydown", we)), V(i, () => {
			re.value?.stop();
		}), Er(() => {
			document.removeEventListener("keydown", we), y?.abort(), d?.abort(), j?.abort(), ie?.abort(), fe(), re.value?.stop();
		}), (e, r) => (W(), G("section", null, [
			K("div", Pc, [r[11] ||= K("div", null, [K("h1", null, "Classify"), K("p", { class: "studio-muted" }, "Collect recordings, resolve source mappings, and review labels.")], -1), K("div", Fc, [K("span", Ic, F(C.value) + " pending · " + F(ue.value) + " reviewed · " + F(x.value.size) + " skipped", 1), K("button", {
				"data-action": "collect-now",
				class: "studio-primary",
				disabled: !z(t).selectedId.value || o.value || !!(a.value && [
					"queued",
					"running",
					"cancelling"
				].includes(a.value.status)),
				onClick: f
			}, F(o.value ? "Starting…" : "Collect"), 9, Lc)])]),
			K("div", Rc, [(W(), G(U, null, H([
				"review",
				"collect",
				"unmapped"
			], (e) => K("button", {
				id: `classify-tab-${e}`,
				key: e,
				role: "tab",
				"aria-selected": z(i) === e,
				"aria-controls": `classify-panel-${e}`,
				class: P({ active: z(i) === e }),
				onClick: (n) => z(t).routes.selectClassifyTab(e)
			}, F(e === "review" ? "Review" : e === "collect" ? "Collect" : "Unmapped"), 11, zc)), 64))]),
			s.value ? (W(), G("p", Bc, F(s.value), 1)) : Y("", !0),
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
					onClick: r[0] ||= Uo((e) => z(t).routes.selectClassifyTab("collect"), ["prevent"])
				}, "View collection run →", 8, Hc)
			], 10, Vc)) : Y("", !0),
			B(K("div", Uc, [
				K("div", Wc, [K("label", null, [r[13] ||= J("Recording type", -1), B(K("select", {
					name: "kind",
					"onUpdate:modelValue": r[1] ||= (e) => A.value = e
				}, [...r[12] ||= [
					K("option", { value: "" }, "All pending", -1),
					K("option", { value: "true" }, "Near misses", -1),
					K("option", { value: "false" }, "Activations", -1)
				]], 512), [[Io, A.value]])])]),
				O.value ? (W(), G("p", Gc, F(O.value), 1)) : Y("", !0),
				D.value ? (W(), G("p", Kc, F(D.value), 1)) : Y("", !0),
				T.value ? (W(), G("div", qc, "Loading review queue…")) : N.value ? (W(), G("div", {
					key: 3,
					"data-classify-current": "",
					"data-sample-id": N.value.id,
					class: "studio-card grid gap-4"
				}, [
					K("div", Yc, [K("div", null, [K("h2", null, "Recording " + F(N.value.recording?.clip_id ?? N.value.id), 1), K("p", Xc, F(N.value.recording ? z(n).deviceLabel(N.value.recording.device_id) : N.value.source) + " · " + F(N.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + F(N.value.recording?.timestamp ?? N.value.created_at), 1)]), K("span", Zc, "Revision " + F(N.value.revision), 1)]),
					q(Js, {
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
					te.value === N.value.id ? (W(), G("p", Qc, "Press Space once to enable playback; then acknowledged labels play the next clip.")) : Y("", !0),
					K("div", $c, [
						K("button", {
							type: "button",
							class: "studio-primary",
							disabled: E.value,
							onClick: r[4] ||= (e) => ye("positive")
						}, "Positive (P)", 8, el),
						K("button", {
							type: "button",
							disabled: E.value,
							onClick: r[5] ||= (e) => ye("negative")
						}, "Negative (N)", 8, tl),
						K("button", {
							type: "button",
							disabled: E.value,
							onClick: be
						}, "Skip (S)", 8, nl),
						K("button", {
							type: "button",
							disabled: E.value,
							"data-action": "discard",
							onClick: r[6] ||= (e) => ne.value = !0
						}, "Discard (D)", 8, rl),
						K("button", {
							type: "button",
							disabled: E.value || !z(_l).length,
							onClick: xe
						}, "Undo (Z)", 8, il)
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
				], 8, Jc)) : (W(), G("div", al, [C.value === 0 ? (W(), G("span", ol, "No pending recordings for this workspace.")) : (W(), G("span", sl, "Pending recordings are skipped for this session or the local window needs reloading.")), C.value > 0 ? (W(), G("button", {
					key: 2,
					type: "button",
					onClick: he
				}, "Retry pending window")) : Y("", !0)]))
			], 512), [[Za, z(i) === "review"]]),
			z(i) === "collect" ? (W(), G("div", cl, [K("div", ll, [
				r[16] ||= K("h2", null, "Collect recordings", -1),
				r[17] ||= K("p", { class: "studio-muted" }, "Use Collect above to fetch recordings for the selected workspace now, even when its schedule is off. Unknown sources are retained in the shared Unmapped inbox.", -1),
				K("a", {
					href: z(t).routes.href("automate"),
					onClick: r[7] ||= Uo((e) => z(t).routes.navigate("automate"), ["prevent"])
				}, "Collection settings →", 8, ul)
			]), q(_c, {
				"refresh-key": a.value?.status,
				"active-run-id": c.value?.run_id
			}, null, 8, ["refresh-key", "active-run-id"])])) : Y("", !0),
			B(K("div", dl, [v.value ? (W(), G("p", fl, F(v.value), 1)) : Y("", !0), q(kc, {
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
			])], 512), [[Za, z(i) === "unmapped"]]),
			ne.value ? (W(), G("div", pl, [K("section", ml, [
				r[18] ||= K("h2", null, "Discard this recording?", -1),
				r[19] ||= K("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				K("div", hl, [K("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: E.value,
					onClick: r[9] ||= (e) => {
						ne.value = !1, ye("discarded");
					}
				}, "Discard recording", 8, gl), K("button", {
					type: "button",
					onClick: r[10] ||= (e) => ne.value = !1
				}, "Cancel")])
			])])) : Y("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function yl(e, t = {}) {
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
function bl(e) {
	return yl(e);
}
//#endregion
//#region src/trainerStore.ts
var xl = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), Sl = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), Cl = /* @__PURE__ */ Pt({
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
	samples: Sl(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: xl(),
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
function wl(e, t) {
	t ? Cl.busy.add(e) : Cl.busy.delete(e);
}
function Tl(e, t = "success") {
	Cl.toast = {
		message: String(e || ""),
		tone: t,
		serial: Cl.toast.serial + 1
	};
}
async function El(e = !1) {
	e || wl("samples", !0);
	try {
		let e = await bl("/api/samples");
		Cl.samples = {
			...Sl(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((Cl.samples[e]?.length || 0) / 50) - 1);
			Cl.samplePage[e] = Math.min(Cl.samplePage[e], t);
		}
		return e;
	} finally {
		e || wl("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var Dl = { class: "legacy-scope" }, Ol = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, kl = { class: "range-grid" }, Al = ["max"], jl = ["min"], Ml = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Nl = { class: "modal-head" }, Pl = {
	key: 0,
	class: "empty-state"
}, Fl = { class: "range-grid" }, Il = ["max"], Ll = ["min", "max"], Rl = { class: "row space" }, zl = { class: "pill" }, Bl = {
	key: 0,
	class: "pill success"
}, Vl = { class: "row modal-actions" }, Hl = ["disabled"], Ul = /* @__PURE__ */ cr({
	__name: "AudioTrimModal",
	props: { studioTarget: {} },
	emits: ["save", "close"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ R(0), a = /* @__PURE__ */ R(1);
		V(() => n.studioTarget, (e) => {
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
		let c = /* @__PURE__ */ R(null), l = /* @__PURE__ */ R(null), u = /* @__PURE__ */ R(0), d = /* @__PURE__ */ R(0), f = /* @__PURE__ */ R(0), p = /* @__PURE__ */ R([]), m = /* @__PURE__ */ R(!1), h = /* @__PURE__ */ R(!1);
		V(() => Cl.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(Cl.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await yl(`/api/samples/${encodeURIComponent(Cl.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await yn(), v();
				} catch (e) {
					Tl(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), V([d, f], () => v());
		function g() {
			Cl.trimItem = null, l.value = null, p.value = [];
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
			let e = Cl.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", Cl.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await yl("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await El(!0), Tl(n.message || "Trimmed sample saved.");
				} catch (e) {
					Tl(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			Cl.trimItem && v();
		}
		return window.addEventListener("resize", S), Er(() => window.removeEventListener("resize", S)), (t, n) => (W(), ia(er, { to: "body" }, [K("div", Dl, [e.studioTarget ? (W(), G("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Uo(o, ["self"])
		}, [K("section", Ol, [
			K("header", { class: "modal-head" }, [n[4] ||= K("div", null, [K("span", { class: "eyebrow" }, "Studio audio editor"), K("h2", null, "Trim sample")], -1), K("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= K("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			K("div", kl, [K("label", null, [n[5] ||= K("span", null, "Start seconds", -1), B(K("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Al), [[
				No,
				i.value,
				void 0,
				{ number: !0 }
			]])]), K("label", null, [n[6] ||= K("span", null, "End seconds", -1), B(K("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, jl), [[
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
		])])) : z(Cl).trimItem ? (W(), G("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Uo(g, ["self"])
		}, [K("section", Ml, [
			K("header", Nl, [K("div", null, [n[8] ||= K("span", { class: "eyebrow" }, "Audio editor", -1), K("h2", null, "Trim " + F(z(Cl).trimItem.saved_as), 1)]), K("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= K("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (W(), G("div", Pl, "Loading waveform…")) : (W(), G(U, { key: 1 }, [
				K("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				K("div", Fl, [K("label", null, [K("span", null, "Start · " + F(d.value.toFixed(2)) + "s", 1), B(K("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, Il), [[
					No,
					d.value,
					void 0,
					{ number: !0 }
				]])]), K("label", null, [K("span", null, "End · " + F(f.value.toFixed(2)) + "s", 1), B(K("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Ll), [[
					No,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				K("div", Rl, [K("span", zl, "Selection " + F(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (W(), G("span", Bl, F(p.value.length) + " speech segment" + F(p.value.length === 1 ? "" : "s"), 1)) : Y("", !0)]),
				K("div", Vl, [
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
					}, F(h.value ? "Saving…" : "Save trim"), 9, Hl)
				])
			], 64))
		])])) : Y("", !0)])]));
	}
}), Wl = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Gl = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Kl = { class: "studio-card mb-4" }, ql = { class: "studio-toolbar" }, Jl = {
	"data-more-filters": "",
	class: "mt-3"
}, Yl = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" }, Xl = ["aria-busy"], Zl = { key: 0 }, Ql = {
	key: 1,
	class: "w-full text-sm"
}, $l = ["data-row-id"], eu = {
	key: 0,
	class: "block studio-muted"
}, tu = {
	key: 0,
	class: "block studio-muted"
}, nu = { class: "flex flex-wrap gap-1" }, ru = ["onClick"], iu = ["value", "onChange"], au = {
	key: 0,
	value: "pending",
	disabled: ""
}, ou = ["onClick"], su = ["onClick"], cu = { key: 0 }, lu = {
	key: 2,
	class: "studio-modal-backdrop"
}, uu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Play sample"
}, du = {
	key: 3,
	class: "studio-modal-backdrop"
}, fu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, pu = /* @__PURE__ */ cr({
	__name: "SamplesPage",
	setup(e) {
		let t = ms(), n = tc();
		Cr(() => {
			n.load();
		});
		let r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R(0), a = /* @__PURE__ */ R(0), o = /* @__PURE__ */ R(25), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: "",
			search: ""
		}), d = /* @__PURE__ */ R(null), f = /* @__PURE__ */ R(null), p = /* @__PURE__ */ R(null), m = /* @__PURE__ */ R(null), h = /* @__PURE__ */ R("positive"), g, _, v = 0, y = X(() => ({
			offset: a.value,
			limit: Math.min(100, o.value),
			...u.value.label ? { label: u.value.label } : {},
			...u.value.source ? { source: u.value.source } : {},
			...u.value.kind ? { near_miss: u.value.kind === "true" } : {},
			...u.value.search ? { search: u.value.search } : {},
			...u.value.after ? { after: `${u.value.after}T00:00:00+00:00` } : {},
			...u.value.before ? { before: `${u.value.before}T23:59:59+00:00` } : {}
		}));
		function b() {
			d.value = null, f.value = null, p.value = null, c.value = "";
		}
		async function x() {
			g?.abort();
			let e = new AbortController();
			g = e;
			let n = ++v, l = t.selectedId.value;
			if (r.value = [], i.value = 0, b(), l) {
				s.value = !0;
				try {
					let s = await $.samples(l, y.value, e.signal);
					!e.signal.aborted && n === v && t.selectedId.value === l && (r.value = Array.isArray(s.items) ? s.items : [], i.value = Number.isFinite(s.total) ? s.total : 0, a.value = Number.isInteger(s.offset) ? s.offset : 0, o.value = Number.isInteger(s.limit) && s.limit >= 1 && s.limit <= 100 ? s.limit : 25);
				} catch (t) {
					!e.signal.aborted && n === v && (c.value = t instanceof Error ? t.message : "Samples could not be loaded.");
				} finally {
					!e.signal.aborted && n === v && (s.value = !1);
				}
			}
		}
		function S(e) {
			r.value = r.value.map((t) => t.id === e.id ? e : t);
		}
		async function C(e) {
			_?.abort();
			let t = new AbortController();
			_ = t, c.value = "";
			try {
				return await e(t.signal);
			} catch (e) {
				return t.signal.aborted || (e instanceof as && e.status === 409 ? (await x(), c.value = "This sample changed elsewhere. The current page was reloaded.") : c.value = "Sample changes were not saved. Try again."), null;
			}
		}
		async function w(e, t) {
			let n = t.target.value;
			if (n === e.label) return;
			let r = await C((t) => $.label(e.word_id, e.id, n, e.revision, t));
			r && (S(r), l.value = "Label saved.");
		}
		async function T(e) {
			let t = d.value;
			if (!t) return;
			let n = await C((n) => $.trim(t.word_id, t.id, e.start, e.end, t.revision, n));
			n && (S(n), d.value = null, l.value = "Non-destructive trim saved.");
		}
		async function E() {
			let e = f.value;
			e && await C((t) => $.deleteSample(e.word_id, e.id, e.revision, t)) !== null && (r.value = r.value.filter((t) => t.id !== e.id), i.value = Math.max(0, i.value - 1), f.value = null, l.value = "Sample removed from this visible library.");
		}
		async function D() {
			m.value ? await C((e) => $.importAudio(t.selectedId.value, m.value, h.value, e)) && (m.value = null, l.value = "Imported audio.", await x()) : c.value = "Choose an audio file to import.";
		}
		function O() {
			a.value = 0, x();
		}
		function ee(e) {
			return e.recording?.near_miss ? "close miss" : "activation";
		}
		return V(t.selectedId, () => {
			a.value = 0, x();
		}, { immediate: !0 }), Er(() => {
			g?.abort(), _?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[36] ||= K("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [K("div", null, [K("h1", null, "Samples"), K("p", { class: "studio-muted" }, "Searchable library with retained provenance and non-destructive trims.")])], -1),
			l.value ? (W(), G("p", Wl, F(l.value), 1)) : Y("", !0),
			c.value ? (W(), G("p", Gl, F(c.value), 1)) : Y("", !0),
			K("div", Kl, [K("div", ql, [K("label", null, [t[14] ||= J("Phrase", -1), B(K("input", {
				name: "search",
				"onUpdate:modelValue": t[0] ||= (e) => u.value.search = e,
				type: "search",
				onInput: O
			}, null, 544), [[No, u.value.search]])]), K("label", null, [t[16] ||= J("Label", -1), B(K("select", {
				name: "label",
				"onUpdate:modelValue": t[1] ||= (e) => u.value.label = e,
				onChange: O
			}, [...t[15] ||= [fa("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[Io, u.value.label]])])]), K("details", Jl, [t[23] ||= K("summary", null, "More filters", -1), K("div", Yl, [
				K("label", null, [t[18] ||= J("Source", -1), B(K("select", {
					name: "source",
					"onUpdate:modelValue": t[2] ||= (e) => u.value.source = e,
					onChange: O
				}, [...t[17] ||= [
					K("option", { value: "" }, "All sources", -1),
					K("option", { value: "diagnostic" }, "Diagnostic", -1),
					K("option", { value: "import" }, "Import", -1)
				]], 544), [[Io, u.value.source]])]),
				K("label", null, [t[20] ||= J("Kind", -1), B(K("select", {
					name: "kind",
					"onUpdate:modelValue": t[3] ||= (e) => u.value.kind = e,
					onChange: O
				}, [...t[19] ||= [
					K("option", { value: "" }, "All kinds", -1),
					K("option", { value: "true" }, "Close miss", -1),
					K("option", { value: "false" }, "Activation", -1)
				]], 544), [[Io, u.value.kind]])]),
				K("label", null, [t[21] ||= J("After", -1), B(K("input", {
					name: "after",
					"onUpdate:modelValue": t[4] ||= (e) => u.value.after = e,
					type: "date",
					onInput: O
				}, null, 544), [[No, u.value.after]])]),
				K("label", null, [t[22] ||= J("Before", -1), B(K("input", {
					name: "before",
					"onUpdate:modelValue": t[5] ||= (e) => u.value.before = e,
					type: "date",
					onInput: O
				}, null, 544), [[No, u.value.before]])])
			])])]),
			K("form", {
				"data-form": "import",
				class: "studio-card mb-4 flex flex-wrap gap-3 items-end",
				onSubmit: Uo(D, ["prevent"])
			}, [
				K("label", null, [t[24] ||= J("Audio", -1), K("input", {
					name: "import-file",
					type: "file",
					accept: "audio/*",
					required: "",
					onChange: t[6] ||= (e) => m.value = e.target.files?.[0] ?? null
				}, null, 32)]),
				K("label", null, [t[26] ||= J("Label", -1), B(K("select", {
					name: "import-label",
					"onUpdate:modelValue": t[7] ||= (e) => h.value = e
				}, [...t[25] ||= [K("option", { value: "positive" }, "Positive", -1), K("option", { value: "negative" }, "Negative", -1)]], 512), [[Io, h.value]])]),
				t[27] ||= K("button", {
					type: "submit",
					class: "studio-primary"
				}, "Import audio", -1)
			], 32),
			K("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": s.value,
				role: "region",
				"aria-label": "Samples table; scroll horizontally to view all actions",
				tabindex: "0"
			}, [s.value ? (W(), G("p", Zl, "Loading samples…")) : (W(), G("table", Ql, [t[33] ||= K("thead", null, [K("tr", null, [
				K("th", null, "Sample"),
				K("th", null, "Label"),
				K("th", null, "Provenance"),
				K("th", null, "Revision"),
				K("th", null, "Actions")
			])], -1), K("tbody", null, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				K("td", null, [J(F(e.recording?.clip_id ?? e.id), 1), e.recording ? (W(), G("small", eu, F(e.recording.phrase) + " · " + F(e.recording.engine) + " · " + F(ee(e)), 1)) : Y("", !0)]),
				K("td", null, F(e.label), 1),
				K("td", null, [J(F(e.source), 1), e.recording ? (W(), G("small", tu, F(z(n).deviceLabel(e.recording.device_id)), 1)) : Y("", !0)]),
				K("td", null, "rev " + F(e.revision), 1),
				K("td", null, [K("div", nu, [
					K("button", {
						type: "button",
						"data-action": "play",
						onClick: (t) => p.value = e
					}, "Play", 8, ru),
					K("label", null, [t[31] ||= K("span", { class: "sr-only" }, "Relabel", -1), K("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => w(e, t)
					}, [
						e.label === "pending" ? (W(), G("option", au, "Set label…")) : Y("", !0),
						t[28] ||= K("option", { value: "positive" }, "Positive", -1),
						t[29] ||= K("option", { value: "negative" }, "Negative", -1),
						t[30] ||= K("option", { value: "discarded" }, "Discarded", -1)
					], 40, iu)]),
					K("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => d.value = e
					}, "Trim", 8, ou),
					K("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => f.value = e
					}, "Delete", 8, su)
				])])
			], 8, $l))), 128)), r.value.length ? Y("", !0) : (W(), G("tr", cu, [...t[32] ||= [K("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), q(oc, {
				total: i.value,
				offset: a.value,
				limit: o.value,
				loading: s.value,
				noun: "samples",
				onPage: t[8] ||= (e) => {
					a.value = e, x();
				}
			}, null, 8, [
				"total",
				"offset",
				"limit",
				"loading"
			])], 8, Xl),
			p.value ? (W(), G("div", lu, [K("section", uu, [q(Js, {
				"sample-id": p.value.id,
				src: z($).audioUrl(p.value.word_id, p.value.id),
				"autoplay-requested": !0,
				onPlaybackError: t[9] ||= (e) => c.value = e
			}, null, 8, ["sample-id", "src"]), K("button", {
				type: "button",
				onClick: t[10] ||= (e) => p.value = null
			}, "Close player")])])) : Y("", !0),
			q(Ul, {
				"studio-target": d.value ? {
					wordId: d.value.word_id,
					sampleId: d.value.id,
					revision: d.value.revision,
					src: z($).audioUrl(d.value.word_id, d.value.id)
				} : null,
				onSave: t[11] ||= (e) => T(e),
				onClose: t[12] ||= (e) => d.value = null
			}, null, 8, ["studio-target"]),
			f.value ? (W(), G("div", du, [K("section", fu, [
				t[34] ||= K("h2", null, "Remove sample?", -1),
				t[35] ||= K("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				K("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: E
				}, "Remove"),
				K("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[13] ||= (e) => f.value = null
				}, "Cancel")
			])])) : Y("", !0)
		]));
	}
}), mu = ["inert"], hu = { class: "flex flex-wrap items-start justify-between gap-3" }, gu = ["disabled"], _u = { class: "mt-3" }, vu = {
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
}, Wu = { class: "flex gap-2" }, Gu = ["disabled"], Ku = ["disabled"], qu = /* @__PURE__ */ cr({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = tc(), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R("standalone"), s = /* @__PURE__ */ R(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(""), d = /* @__PURE__ */ R(""), f = /* @__PURE__ */ R(""), p = /* @__PURE__ */ R(""), m = /* @__PURE__ */ R(null), h = /* @__PURE__ */ R(), g = /* @__PURE__ */ R(), _ = null;
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
			_ = t.currentTarget, m.value = e, await yn(), typeof h.value?.showModal == "function" ? h.value.showModal() : h.value?.setAttribute("open", ""), h.value?.querySelector("button")?.focus();
		}
		async function x() {
			m.value = null, await yn(), _?.isConnected ? _.focus() : g.value?.querySelector("[data-action=\"refresh-registry\"]")?.focus();
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
				l.value = `delete:${m.value.id}`, d.value = "", await yn(), h.value?.focus();
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
		return Cr(async () => {
			await i.load(), E();
		}), Er(() => i.abort()), (e, t) => (W(), G("section", {
			ref_key: "registryElement",
			ref: g,
			class: "studio-card",
			"data-device-registry": ""
		}, [K("div", {
			"data-device-registry-content": "",
			inert: m.value ? !0 : void 0
		}, [
			K("div", hu, [t[8] ||= K("div", null, [K("h2", null, "Fleet setup"), K("p", { class: "studio-muted" }, "Register a fleet leader or standalone kiosks.")], -1), K("button", {
				type: "button",
				"data-action": "refresh-registry",
				disabled: z(i).loading.value,
				onClick: t[0] ||= (e) => z(i).load(!0)
			}, "Refresh registry", 8, gu)]),
			K("details", _u, [
				t[9] ||= K("summary", null, "Fleet safety details", -1),
				t[10] ||= K("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.", -1),
				n.surface === "deploy" ? (W(), G("p", vu, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : Y("", !0)
			]),
			u.value ? (W(), G("p", yu, F(u.value), 1)) : Y("", !0),
			d.value || z(i).error.value ? (W(), G("p", bu, F(d.value || z(i).error.value), 1)) : Y("", !0),
			K("details", {
				"data-device-registration": "",
				class: "mt-3",
				open: !z(i).devices.value.length
			}, [
				t[15] ||= K("summary", null, "Add device", -1),
				K("form", {
					"data-device-add": "",
					class: "studio-registration-row",
					onSubmit: Uo(D, ["prevent"])
				}, [
					K("label", null, [t[11] ||= J("Address", -1), B(K("input", {
						"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
						required: "",
						name: "url",
						autocomplete: "url",
						placeholder: "http://kiosk.local:2324"
					}, null, 512), [[No, a.value]])]),
					K("label", null, [t[13] ||= J("Role", -1), B(K("select", {
						"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
						name: "role"
					}, [...t[12] ||= [K("option", { value: "standalone" }, "Standalone", -1), K("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[Io, o.value]])]),
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
					}, "Add device", 8, Su)
				], 32),
				t[16] ||= K("p", { class: "studio-muted text-xs mt-2" }, "Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.", -1)
			], 8, xu),
			z(i).loading.value ? (W(), G("p", Cu, "Loading registered devices…")) : (W(), G("div", wu, [(W(!0), G(U, null, H(z(i).devices.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [
				K("div", null, [
					K("strong", null, F(z(i).deviceLabel(e.id)), 1),
					t[17] ||= J(),
					K("span", { class: P(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, F(e.role === "follower" ? "Follower" : e.role), 3),
					K("p", Eu, F(T(e)) + " · " + F(e.url) + F(e.active ? "" : " · Inactive member"), 1)
				]),
				K("div", Du, [
					K("span", { class: P(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, F(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
					K("span", { class: P(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, F(e.model_eligible ? "Profile covered" : "Not covered"), 3),
					e.role === "leader" ? (W(), G("button", {
						key: 0,
						type: "button",
						disabled: l.value === `refresh:${e.id}`,
						onClick: (t) => O(e)
					}, "Refresh followers", 8, Ou)) : Y("", !0),
					e.role === "follower" && e.credentials_status !== "ready" ? (W(), G("form", {
						key: 1,
						class: "flex gap-2",
						onSubmit: Uo((t) => ee(e), ["prevent"])
					}, [K("input", {
						ref_for: !0,
						ref: (t) => w(e.id, t),
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
					onClick: (t) => v(e)
				}, "Edit", 8, Nu), K("button", {
					type: "button",
					"data-action": "delete-device",
					disabled: !!l.value,
					onClick: (t) => b(e, t)
				}, "Delete", 8, Pu)]),
				f.value === e.id ? (W(), G("form", {
					key: 0,
					"data-device-edit": "",
					class: "studio-card grid gap-3",
					style: {
						"grid-column": "1 / -1",
						width: "100%"
					},
					onSubmit: Uo((t) => y(e), ["prevent"])
				}, [
					K("label", null, [t[18] ||= J("Studio connection address", -1), B(K("input", {
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
			], 8, Tu))), 128)), z(i).devices.value.length ? Y("", !0) : (W(), G("p", Bu, "No kiosks registered yet."))]))
		], 8, mu), m.value ? (W(), G("dialog", {
			key: 0,
			ref_key: "confirmation",
			ref: h,
			tabindex: "-1",
			role: "alertdialog",
			"aria-modal": "true",
			"aria-label": "Remove kiosk from Studio?",
			class: "studio-card studio-device-dialog",
			onCancel: t[5] ||= Uo((e) => !l.value && x(), ["prevent"]),
			onKeydown: [t[6] ||= Go((e) => !l.value && x(), ["esc"]), S],
			onClick: t[7] ||= Uo((e) => !l.value && x(), ["self"])
		}, [
			K("h2", null, "Remove " + F(z(i).deviceLabel(m.value.id)) + " from Studio?", 1),
			m.value.role === "leader" ? (W(), G("p", Vu, "This also removes its discovered followers from the Studio registry.")) : m.value.role === "follower" ? (W(), G("p", Hu, "This follower can be rediscovered on the next fleet refresh.")) : Y("", !0),
			t[19] ||= K("p", null, "Saved recordings and models are kept. This does not change the kiosk itself.", -1),
			d.value ? (W(), G("p", Uu, F(d.value), 1)) : Y("", !0),
			K("div", Wu, [K("button", {
				"data-action": "cancel-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: x
			}, "Keep kiosk", 8, Gu), K("button", {
				"data-action": "confirm-device-delete",
				type: "button",
				disabled: !!l.value,
				onClick: C
			}, "Remove from Studio", 8, Ku)])
		], 544)) : Y("", !0)], 512));
	}
}), Ju = /* @__PURE__ */ cr({
	__name: "KiosksPage",
	setup(e) {
		return (e, t) => (W(), G("section", null, [t[0] ||= K("div", { class: "mb-4" }, [K("h1", null, "Kiosks"), K("p", { class: "studio-muted" }, "Connect and manage your kiosk fleet.")], -1), q(qu, { surface: "kiosks" })]));
	}
}), Yu = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, Xu = ["name"], Zu = ["name"], Qu = /* @__PURE__ */ cr({
	__name: "AutomationScheduleFields",
	props: /*@__PURE__*/ Rr({ prefix: {} }, {
		modelValue: { required: !0 },
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = ii(e, "modelValue");
		return (n, r) => (W(), G("div", Yu, [K("label", null, [r[2] ||= J("Schedule (five-field cron)", -1), B(K("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value.cron = e,
			name: `${e.prefix}-cron`,
			required: "",
			placeholder: "*/30 * * * *",
			maxlength: "256"
		}, null, 8, Xu), [[No, t.value.cron]])]), K("label", null, [r[3] ||= J("Time zone", -1), B(K("input", {
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
}, rd = { class: "studio-card" }, id = { class: "flex flex-wrap items-center justify-between gap-3" }, ad = { class: "studio-checkbox-label" }, od = { class: "studio-muted" }, sd = { class: "studio-muted text-xs mt-3" }, cd = { class: "studio-card" }, ld = { class: "flex flex-wrap items-center justify-between gap-3" }, ud = { class: "studio-checkbox-label" }, dd = { class: "grid gap-3 sm:grid-cols-2 mt-3" }, fd = { class: "mt-3" }, pd = { class: "studio-checkbox-label my-3" }, md = { class: "studio-checkbox-label my-3" }, hd = { class: "studio-muted text-xs mt-3" }, gd = { class: "grid gap-4 lg:grid-cols-2" }, _d = { class: "studio-card" }, vd = { class: "flex flex-wrap items-center justify-between gap-3" }, yd = { class: "studio-checkbox-label" }, bd = { class: "studio-checkbox-label my-3" }, xd = { class: "studio-muted text-xs" }, Sd = { class: "studio-card" }, Cd = { class: "flex flex-wrap items-center justify-between gap-3" }, wd = { class: "studio-status studio-status-muted" }, Td = { class: "studio-checkbox-label my-3" }, Ed = { class: "studio-checkbox-label my-3" }, Dd = { class: "studio-muted text-xs" }, Od = ["disabled"], kd = /* @__PURE__ */ cr({
	__name: "AutomatePage",
	setup(e) {
		let t = ms(), n = X(() => t.selectedId.value), r = /* @__PURE__ */ R(null), i = /* @__PURE__ */ R(null), a = /* @__PURE__ */ R(!1), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(""), l, u, d = 0, f = X(() => r.value?.deployment.enabled ? r.value.deployment_policy.after_training ? "Scheduled + after training" : "Scheduled" : r.value?.deployment_policy.after_training ? "After training" : "Manual only");
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
		return V(n, () => {
			m();
		}, { immediate: !0 }), Er(() => {
			d++, l?.abort(), u?.abort();
		}), (e, i) => (W(), G("section", null, [
			i[40] ||= K("div", { class: "mb-4" }, [K("h1", null, "Automate"), K("p", { class: "studio-muted" }, "Collection, classification, training, and deployment for the selected workspace.")], -1),
			n.value ? Y("", !0) : (W(), G("p", $u, "Choose a wakeword to configure automation.")),
			a.value ? (W(), G("p", ed, "Loading automation…")) : Y("", !0),
			s.value ? (W(), G("p", td, [J(F(s.value) + " ", 1), r.value ? Y("", !0) : (W(), G("button", {
				key: 0,
				onClick: m
			}, "Retry"))])) : Y("", !0),
			c.value ? (W(), G("p", nd, F(c.value), 1)) : Y("", !0),
			r.value ? (W(), G("form", {
				key: 4,
				class: "grid gap-4",
				onSubmit: Uo(h, ["prevent"])
			}, [
				K("section", rd, [
					K("div", id, [i[15] ||= K("h2", null, "Automatic collection", -1), K("label", ad, [B(K("input", {
						"onUpdate:modelValue": i[0] ||= (e) => r.value.collection.enabled = e,
						name: "collection-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.collection.enabled]]), i[14] ||= J("Enabled", -1)])]),
					K("p", od, [
						i[16] ||= J("Collect recordings mapped to ", -1),
						K("strong", null, F(z(t).selected.value?.phrase ?? "this workspace"), 1),
						i[17] ||= J(" from registered kiosks. Existing recordings are preserved when disabled.", -1)
					]),
					q(Qu, {
						modelValue: r.value.collection,
						"onUpdate:modelValue": i[1] ||= (e) => r.value.collection = e,
						prefix: "collection"
					}, null, 8, ["modelValue"]),
					K("p", sd, F(p("scrape")), 1)
				]),
				K("section", cd, [
					K("div", ld, [i[19] ||= K("h2", null, "Automatic classification", -1), K("label", ud, [B(K("input", {
						"onUpdate:modelValue": i[2] ||= (e) => r.value.classification.enabled = e,
						name: "classification-enabled",
						type: "checkbox"
					}, null, 512), [[Po, r.value.classification.enabled]]), i[18] ||= J("Enabled", -1)])]),
					i[28] ||= K("p", { class: "studio-muted" }, "Review pending diagnostic audio conservatively. Uncertain clips remain for manual review.", -1),
					K("div", dd, [K("label", null, [i[21] ||= J("Speech recognition engine", -1), B(K("select", {
						"onUpdate:modelValue": i[3] ||= (e) => r.value.classification.engine = e,
						name: "stt-engine"
					}, [...i[20] ||= [K("option", { value: "faster_whisper" }, "Faster Whisper · recommended", -1), K("option", { value: "parakeet_onnx" }, "Parakeet ONNX", -1)]], 512), [[Io, r.value.classification.engine]])]), K("label", null, [i[23] ||= J("Run", -1), B(K("select", {
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
						K("label", pd, [B(K("input", {
							"onUpdate:modelValue": i[6] ||= (e) => r.value.classification.auto_negatives = e,
							type: "checkbox"
						}, null, 512), [[Po, r.value.classification.auto_negatives]]), i[24] ||= J("Label clear non-wake activations as negatives", -1)]),
						K("label", md, [B(K("input", {
							"onUpdate:modelValue": i[7] ||= (e) => r.value.classification.promote_close_misses = e,
							type: "checkbox"
						}, null, 512), [[Po, r.value.classification.promote_close_misses]]), i[25] ||= J("Promote confirmed close misses to positives", -1)]),
						i[27] ||= K("p", { class: "studio-muted text-xs" }, "Empty or ambiguous transcripts stay pending. Close misses are never automatic negatives. No audio is automatically deleted.", -1)
					]),
					K("p", hd, F(p("classify")), 1)
				]),
				K("div", gd, [K("section", _d, [
					K("div", vd, [i[30] ||= K("h2", null, "Automatic training", -1), K("label", yd, [B(K("input", {
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
					K("label", bd, [B(K("input", {
						"onUpdate:modelValue": i[10] ||= (e) => r.value.skip_unchanged = e,
						type: "checkbox"
					}, null, 512), [[Po, r.value.skip_unchanged]]), i[31] ||= J("Skip when inputs are unchanged", -1)]),
					i[33] ||= K("p", { class: "studio-note text-xs" }, "Training and deployment are separate. Training alone does not publish a model.", -1),
					K("p", xd, F(p("train")), 1)
				]), K("section", Sd, [
					K("div", Cd, [i[34] ||= K("h2", null, "Automatic deployment", -1), K("span", wd, F(f.value), 1)]),
					i[37] ||= K("p", { class: "studio-muted" }, "Publish eligible archives to your registered fleet targets.", -1),
					K("label", Td, [B(K("input", {
						"onUpdate:modelValue": i[11] ||= (e) => r.value.deployment_policy.after_training = e,
						name: "after-training",
						type: "checkbox"
					}, null, 512), [[Po, r.value.deployment_policy.after_training]]), i[35] ||= J("Deploy after successful training", -1)]),
					i[38] ||= K("p", { class: "studio-muted text-xs" }, "Optional. Failed, cancelled, or skipped runs do not trigger deployment.", -1),
					K("label", Ed, [B(K("input", {
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
					K("p", Dd, F(p("deploy")), 1)
				])]),
				K("button", {
					type: "submit",
					class: "studio-primary",
					disabled: o.value || a.value
				}, F(o.value ? "Saving…" : "Save automation settings"), 9, Od)
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
}, lf = { class: "flex gap-2" }, uf = ["disabled"], df = /* @__PURE__ */ cr({
	__name: "DeployPage",
	setup(e) {
		let t = ms(), n = tc(), r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R([]), a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(null), u = /* @__PURE__ */ R(""), d, f, p = 0, m = 0, h = !1, g = X(() => new Map(n.devices.value.map((e) => [e.id, e])));
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
		return V(() => t.selectedId.value, () => {
			f?.abort(), f = void 0, m += 1, u.value = "", l.value = null, c.value = "", x();
		}, { immediate: !0 }), Er(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, d) => (W(), G("section", null, [
			d[14] ||= K("div", { class: "mb-4" }, [K("h1", null, "Deploy"), K("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (W(), G("p", Ad, F(c.value), 1)) : Y("", !0),
			s.value ? (W(), G("p", jd, F(s.value), 1)) : Y("", !0),
			a.value ? (W(), G("section", Md, [
				d[6] ||= K("h2", null, "Before publishing", -1),
				d[7] ||= K("p", null, [K("strong", null, "Clean, exclusive staging required."), J(" No concurrent manual uploads; staging cannot be checked automatically.")], -1),
				K("p", Nd, [d[3] ||= K("strong", null, "Quarantine warning:", -1), J(" " + F(a.value.quarantine_notice), 1)]),
				K("details", null, [
					d[4] ||= K("summary", null, "Publication safety details", -1),
					K("p", null, F(a.value.notice), 1),
					d[5] ||= K("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
					K("p", Pd, F(a.value.operator_action), 1)
				])
			])) : Y("", !0),
			K("p", Fd, [
				K("a", {
					href: z(t).routes.href("kiosks"),
					onClick: d[0] ||= Uo((e) => z(t).routes.navigate("kiosks"), ["prevent"])
				}, "Manage kiosks →", 8, Id),
				d[8] ||= J(" · ", -1),
				K("a", {
					href: z(t).routes.href("automate"),
					onClick: d[1] ||= Uo((e) => z(t).routes.navigate("automate"), ["prevent"])
				}, "Deployment automation →", 8, Ld)
			]),
			K("section", Rd, [d[9] ||= K("h2", null, "Archived model versions", -1), o.value ? (W(), G("p", zd, "Loading archives…")) : r.value.length ? (W(), G("div", Bd, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [K("div", Hd, [K("div", Ud, [
				K("strong", null, F(e.id), 1),
				K("p", Wd, F(e.trained_at) + " · Run " + F(e.run_id), 1),
				e.origin === "legacy" ? (W(), G("p", Gd, "Legacy import · " + F(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : Y("", !0)
			]), K("div", Kd, [
				K("a", { href: z($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, qd),
				K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, F(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, Jd),
				K("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Yd)
			])]), z(cs)(e.metrics).recall === null ? Y("", !0) : (W(), G("p", Xd, "Recall " + F(z(cs)(e.metrics).recall), 1))], 8, Vd))), 128))])) : (W(), G("p", Zd, "No archived model versions for this workspace."))]),
			K("section", Qd, [
				d[11] ||= K("h2", null, "Target delivery", -1),
				d[12] ||= K("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [K("div", null, [
					K("strong", null, F(z(n).deviceLabel(e.device_id)), 1),
					d[10] ||= J(),
					g.value.get(e.device_id)?.role === "follower" ? (W(), G("span", ef, "Follower")) : Y("", !0),
					K("p", tf, F(g.value.get(e.device_id)?.leader_id ? `Indirect via ${z(n).deviceLabel(g.value.get(e.device_id).leader_id)}` : "Direct leader/standalone target"), 1)
				]), K("div", null, [
					K("span", { class: P(["studio-status", v(e)]) }, F(e.state), 3),
					K("p", nf, "Desired " + F(e.desired_version) + " · Observed " + F(y(e)), 1),
					e.error_code ? (W(), G("p", rf, [J("Retry/error: " + F(e.error_code), 1), e.next_retry ? (W(), G("span", af, " · next " + F(e.next_retry), 1)) : Y("", !0)])) : Y("", !0)
				])], 8, $d))), 128)),
				i.value.length ? Y("", !0) : (W(), G("p", of, "No publication status yet."))
			]),
			l.value ? (W(), G("div", sf, [K("section", cf, [
				d[13] ||= K("h2", null, "Rollback archive?", -1),
				K("p", null, "Republish " + F(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				K("div", lf, [K("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, uf), K("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: d[2] ||= (e) => l.value = null
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
}, kf = /* @__PURE__ */ cr({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = ms(), n = Nc(), r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R(0), a = /* @__PURE__ */ R(0), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(/* @__PURE__ */ new Set()), l = /* @__PURE__ */ R(!1), u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(!1), f = /* @__PURE__ */ R(""), p, m, h, g = 0, _ = 0, v = 0, y = X(() => t.selectedId.value), b = X(() => [...c.value].sort());
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
		V(() => Object.values(n.jobs.value).filter((e) => e.kind === "download").map((e) => ({
			id: e.id,
			active: Ac(e)
		})), (e, t) => {
			e.some((e) => !e.active && t.some((t) => t.id === e.id && t.active)) && E(!0);
		}), V(y, () => {
			w(), E();
		}, { immediate: !0 }), V(a, () => {
			E();
		}), V(o, () => {
			a.value === 0 ? E() : a.value = 0;
		}), V(s, () => {
			a.value === 0 ? E() : a.value = 0;
		}), Er(() => {
			p?.abort(), m?.abort(), h?.abort();
		});
		function k(e) {
			return e === null ? "Size not published" : `${Math.ceil(e / 1024)} KiB`;
		}
		return (e, t) => (W(), G("section", null, [t[6] ||= K("div", { class: "mb-4" }, [K("h1", null, "Negative Datasets"), K("p", { class: "studio-muted" }, "Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.")], -1), K("div", ff, [
			K("div", pf, [
				K("label", null, [t[3] ||= J("Search", -1), B(K("input", {
					"onUpdate:modelValue": t[0] ||= (e) => o.value = e,
					name: "dataset-search",
					type: "search",
					placeholder: "Search catalog"
				}, null, 512), [[No, o.value]])]),
				K("label", null, [t[5] ||= J("Installation state", -1), B(K("select", {
					"onUpdate:modelValue": t[1] ||= (e) => s.value = e,
					name: "dataset-status"
				}, [...t[4] ||= [fa("<option value=\"\">All states</option><option value=\"available\">Available</option><option value=\"installed\">Installed</option><option value=\"queued\">Queued</option><option value=\"running\">Running</option><option value=\"failed\">Failed</option><option value=\"selected\">Selected</option>", 7)]], 512), [[Io, s.value]])]),
				K("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: u.value || !y.value,
					onClick: O
				}, F(u.value ? "Saving…" : "Save selection"), 9, mf)
			]),
			l.value ? (W(), G("p", hf, "Loading catalog…")) : Y("", !0),
			f.value ? (W(), G("p", gf, F(f.value), 1)) : Y("", !0),
			r.value.length ? (W(), G("div", _f, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("article", {
				key: e.id,
				class: "studio-history"
			}, [K("div", vf, [K("label", yf, [K("input", {
				"data-dataset-id": e.id,
				type: "checkbox",
				checked: c.value.has(e.id),
				onChange: (t) => D(e.id, t.target.checked)
			}, null, 40, bf), K("span", xf, [
				K("strong", null, F(e.name), 1),
				K("span", Sf, F(e.description) + " · " + F(e.source) + " · " + F(e.license), 1),
				K("span", Cf, F(e.representation) + " / " + F(e.adapter) + " · " + F(e.split) + " · " + F(k(e.installed_bytes ?? e.download_bytes)), 1),
				e.split === "evaluation" ? (W(), G("span", wf, "Evaluation-only: this dataset is not sampled as a training input.")) : Y("", !0)
			])]), K("div", Tf, [
				K("span", { class: P(["studio-status", `studio-status-${e.status}`]) }, F(e.status), 3),
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
					onClick: (t) => z(n).show(e.job_id)
				}, "View in queue", 8, Df)) : Y("", !0)
			])])]))), 128))])) : l.value ? Y("", !0) : (W(), G("p", Of, "No catalog datasets match these filters.")),
			q(oc, {
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
}, Mf = { class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" }, Nf = ["value"], Pf = ["value"], Ff = ["disabled"], If = ["value"], Lf = {
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
], qf = {
	key: 0,
	class: "studio-history"
}, Jf = { class: "studio-checkbox-label" }, Yf = ["checked"], Xf = {
	key: 0,
	class: "studio-muted"
}, Zf = {
	key: 1,
	"data-source-picker": ""
}, Qf = {
	key: 0,
	role: "alert"
}, $f = [
	"data-source",
	"checked",
	"disabled",
	"onChange"
], ep = { key: 1 }, tp = { class: "studio-muted text-xs" }, np = ["disabled"], rp = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, ip = { class: "studio-card mt-4" }, ap = { class: "flex flex-wrap items-center justify-between gap-3" }, op = ["disabled"], sp = {
	key: 0,
	class: "studio-muted mt-3"
}, cp = { class: "studio-checkbox-label" }, lp = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], up = { class: "studio-muted block text-xs" }, dp = {
	key: 0,
	class: "studio-muted block text-xs"
}, fp = { class: "studio-status ml-auto" }, pp = [
	"data-delete-batch",
	"disabled",
	"onClick"
], mp = {
	key: 0,
	class: "studio-muted text-xs"
}, hp = { class: "flex gap-2 mt-3" }, gp = ["disabled"], _p = ["disabled"], vp = {
	key: 1,
	class: "studio-muted mt-3"
}, yp = /* @__PURE__ */ cr({
	__name: "ArtificialPage",
	setup(e) {
		let t = ms(), n = Nc(), r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R([]), a = /* @__PURE__ */ R(0), o = /* @__PURE__ */ R(0), s = /* @__PURE__ */ R({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), c = /* @__PURE__ */ R(/* @__PURE__ */ new Set()), l = /* @__PURE__ */ R(!1), u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(""), f = /* @__PURE__ */ R(null), p = /* @__PURE__ */ R({}), m = /* @__PURE__ */ R({}), h = /* @__PURE__ */ R({}), g = /* @__PURE__ */ R(null), _ = /* @__PURE__ */ R({}), v = /* @__PURE__ */ R([]), y = /* @__PURE__ */ R(0), b = /* @__PURE__ */ R(0), x = /* @__PURE__ */ R(!1), S = /* @__PURE__ */ R(""), C, w = X(() => s.value.engines?.includes("moss")), T = X(() => s.value.engines?.filter((e) => e !== "moss").length ?? 0), E = X(() => T.value * s.value.samples + (w.value ? s.value.moss_samples ?? s.value.samples : 0));
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
		function ue() {
			let e = oe.value;
			if (!e) return;
			let t = s.value.engines ?? e.engines[s.value.tts_mode];
			s.value.engines = t.filter((e) => se.value.includes(e)), N.value || (s.value.english_accent = "mixed");
		}
		function de() {
			C?.abort(), _.value = {}, v.value = [], y.value = 0, A?.abort(), A = void 0, j += 1, u.value = !1, f.value = null, g.value = null;
			for (let e of k.values()) e.abort();
			k.clear(), p.value = {}, m.value = {}, h.value = {};
		}
		async function fe() {
			ne?.abort();
			let e = new AbortController();
			ne = e;
			let t = ++re, n = M.value;
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
					}, ue(), c.value = new Set(f ?? []), ie = !0, s.value.moss_samples ??= s.value.samples, s.value.moss_source_batch_ids ??= [], s.value.moss_after_current ??= T.value > 0, D()), i.value = d.items, a.value = d.total;
				} catch (r) {
					le(n, t, e) && (d.value = r instanceof Error ? r.message : "Unable to load generation settings.");
				} finally {
					le(n, t, e) && (l.value = !1);
				}
			}
		}
		function pe(e) {
			s.value.language = e, s.value.moss_source_batch_ids = [], b.value = 0, ue(), D();
		}
		function me(e, t) {
			let n = new Set(s.value.engines);
			t ? n.add(e) : n.delete(e), s.value.engines = [...n], n.has("moss") || (s.value.moss_after_current = !1, s.value.moss_source_batch_ids = []);
		}
		function he() {
			return !Number.isInteger(s.value.samples) || s.value.samples < 1 ? (d.value = "Sample count must be a positive integer.", !1) : s.value.engines?.length ? !0 : (d.value = "Select at least one generation model.", !1);
		}
		async function ge() {
			let e = M.value;
			if (!e || !he()) return;
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
		async function _e(e) {
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
		function ve(e, t) {
			p.value[e]?.id === t.id && (p.value[e] = t);
		}
		V(n.jobs, (e) => {
			let t = !1;
			for (let n of Object.values(e)) if (n.kind === "generation" && n.word_id === M.value) {
				let e = _.value[n.id];
				n.status === "complete" && e?.status !== "complete" && (t = !0), _.value[n.id] = n, f.value?.id === n.id && (f.value = n);
			}
			t && (o.value = 0, fe(), D());
			for (let [t, n] of Object.entries(p.value)) {
				let r = e[n.id];
				r && r.word_id === M.value && ve(t, r);
			}
		}, { deep: !0 });
		function ye(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(c.value);
			t ? n.add(e.id) : n.delete(e.id), c.value = n;
		}
		async function be() {
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
				a.delete(t.id), c.value = a, g.value = null, s.value.moss_source_batch_ids = s.value.moss_source_batch_ids?.filter((e) => e !== t.id) ?? [], b.value = 0, D(), i.value.length === 1 && o.value > 0 ? o.value = Math.max(0, o.value - 50) : await fe();
			} catch (t) {
				P(e, r, n) && (d.value = t instanceof as && t.status === 409 ? "Cancel queued or active workspace jobs before deleting this dataset." : t instanceof Error ? t.message : "Dataset was not deleted.");
			} finally {
				P(e, r, n) && (u.value = !1);
			}
		}
		async function xe() {
			let e = M.value;
			if (!e || !ie || l.value) return;
			A?.abort();
			let t = new AbortController();
			A = t;
			let n = ++j, r = [...c.value];
			u.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), P(e, n, t) && await fe();
			} catch (r) {
				P(e, n, t) && (d.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				P(e, n, t) && (u.value = !1);
			}
		}
		return V(M, () => {
			de(), b.value = 0, ie = !1, c.value = /* @__PURE__ */ new Set(), s.value = {
				language: ae.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, o.value = 0, fe();
		}, { immediate: !0 }), V(b, () => {
			D();
		}), V(o, () => {
			fe();
		}), Er(() => {
			ne?.abort(), de();
		}), (e, t) => (W(), G("section", null, [
			t[23] ||= K("div", { class: "mb-4" }, [K("h1", null, "Artificial"), K("p", { class: "studio-muted" }, "Generate wakeword audio, then choose which datasets to use for training.")], -1),
			K("div", Af, [
				t[19] ||= K("h2", null, "Generate data", -1),
				K("p", jf, [t[10] ||= J("Wake phrase: ", -1), K("strong", null, F(ae.value?.phrase ?? "No workspace selected"), 1)]),
				K("form", {
					class: "grid gap-4 mt-3",
					onSubmit: Uo(ge, ["prevent"])
				}, [
					K("div", Mf, [
						K("label", null, [t[11] ||= J("Language", -1), K("select", {
							name: "language",
							value: s.value.language,
							onChange: t[0] ||= (e) => pe(e.target.value)
						}, [(W(!0), G(U, null, H(r.value, (e) => (W(), G("option", {
							key: e.language,
							value: e.language
						}, F(e.name), 9, Pf))), 128))], 40, Nf)]),
						K("label", null, [t[12] ||= J("English accent", -1), B(K("select", {
							name: "english-accent",
							"onUpdate:modelValue": t[1] ||= (e) => s.value.english_accent = e,
							disabled: !N.value
						}, [N.value ? (W(!0), G(U, { key: 0 }, H(oe.value?.english_accents ?? [], (e) => (W(), G("option", {
							key: e.code,
							value: e.code
						}, F(e.label), 9, If))), 128)) : (W(), G("option", Lf, "Not applicable"))], 8, Ff), [[Io, s.value.english_accent]])]),
						K("label", null, [t[13] ||= J("Samples per provider", -1), B(K("input", {
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
						]])])
					]),
					K("fieldset", null, [t[14] ||= K("legend", { class: "mb-2 font-semibold" }, "Generation models", -1), K("div", Rf, [(W(!0), G(U, null, H(ce.value, (e) => (W(), G("article", {
						key: e.engine,
						class: "studio-history"
					}, [
						K("div", zf, [K("label", Bf, [K("input", {
							type: "checkbox",
							"data-engine": e.engine,
							disabled: !e.available,
							checked: s.value.engines?.includes(e.engine),
							onChange: (t) => me(e.engine, t.target.checked)
						}, null, 40, Vf), K("strong", null, F(te[e.engine] ?? e.engine), 1)]), K("button", {
							type: "button",
							"data-preview": e.engine,
							disabled: !e.available || e.engine === "moss" && (s.value.moss_after_current || !s.value.moss_source_batch_ids?.length) || m.value[e.engine] || [
								"queued",
								"running",
								"cancelling"
							].includes(p.value[e.engine]?.status ?? "") || !M.value,
							onClick: (t) => _e(e.engine)
						}, F(m.value[e.engine] ? "Starting…" : "Preview"), 9, Hf)]),
						e.reason ? (W(), G("p", Uf, F(e.reason), 1)) : Y("", !0),
						h.value[e.engine] ? (W(), G("p", Wf, F(h.value[e.engine]), 1)) : Y("", !0),
						p.value[e.engine] && p.value[e.engine].status !== "complete" ? (W(), G("button", {
							key: 2,
							type: "button",
							onClick: (t) => z(n).show(p.value[e.engine].id)
						}, "View preview in queue", 8, Gf)) : Y("", !0),
						p.value[e.engine]?.status === "complete" ? (W(), G("audio", {
							key: 3,
							"data-preview-audio": e.engine,
							class: "mt-3 max-w-full",
							src: z($).previewAudioUrl(M.value, p.value[e.engine].id),
							controls: "",
							autoplay: "",
							"aria-label": `${te[e.engine] ?? e.engine} wakeword preview`
						}, null, 8, Kf)) : Y("", !0)
					]))), 128))])]),
					w.value ? (W(), G("fieldset", qf, [
						t[18] ||= K("legend", null, "MOSS references", -1),
						K("label", null, [t[15] ||= J("MOSS samples", -1), B(K("input", {
							name: "moss-samples",
							"onUpdate:modelValue": t[3] ||= (e) => s.value.moss_samples = e,
							type: "number",
							min: "1",
							required: ""
						}, null, 512), [[
							No,
							s.value.moss_samples,
							void 0,
							{ number: !0 }
						]])]),
						K("label", Jf, [K("input", {
							name: "moss-after-current",
							type: "checkbox",
							checked: s.value.moss_after_current,
							onChange: t[4] ||= (e) => ee(e.target.checked)
						}, null, 40, Yf), t[16] ||= J("Generate after current selection", -1)]),
						s.value.moss_after_current ? (W(), G("p", Xf, "Uses only this submission’s direct providers after all succeed. Select completed sources instead to preview MOSS.")) : (W(), G("div", Zf, [
							t[17] ||= K("p", { class: "studio-muted" }, "Select completed direct-provider datasets. Training selection is independent. MOSS needs at least one distinct reference clip per requested sample; duplicate clips count once.", -1),
							S.value ? (W(), G("p", Qf, F(S.value), 1)) : Y("", !0),
							(W(!0), G(U, null, H(v.value, (e) => (W(), G("label", {
								key: e.id,
								class: "studio-checkbox-label"
							}, [K("input", {
								type: "checkbox",
								"data-source": e.id,
								checked: s.value.moss_source_batch_ids?.includes(e.id),
								disabled: !s.value.moss_source_batch_ids?.includes(e.id) && (s.value.moss_source_batch_ids?.length ?? 0) >= 100,
								onChange: (t) => O(e.id, t.target.checked)
							}, null, 40, $f), J(F(e.providers.map((e) => te[e] ?? e).join(", ")) + " · " + F(e.sample_count) + " clips · " + F(e.id), 1)]))), 128)),
							!x.value && !v.value.length ? (W(), G("p", ep, "No eligible completed sources for this language.")) : Y("", !0),
							K("p", null, F(s.value.moss_source_batch_ids?.length ?? 0) + " sources selected (maximum 100).", 1),
							q(oc, {
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
					K("p", tp, "Each direct provider generates the full samples per provider count into a separate dataset. Requested total: " + F(E.value) + ". MOSS has its own count. Preview generates one sample without adding training data.", 1),
					K("button", {
						type: "submit",
						"data-action": "generate",
						class: "studio-primary justify-self-start",
						disabled: u.value || l.value || !M.value
					}, F(u.value ? "Starting…" : "Generate dataset"), 9, np)
				], 32),
				d.value ? (W(), G("p", rp, F(d.value), 1)) : Y("", !0),
				f.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[6] ||= (e) => z(n).show(f.value.id)
				}, "View generation in queue")) : Y("", !0)
			]),
			K("div", ip, [
				K("div", ap, [t[20] ||= K("h2", null, "Generated datasets", -1), K("button", {
					type: "button",
					"data-action": "save-batches",
					disabled: u.value || l.value || !M.value,
					onClick: xe
				}, "Save selection", 8, op)]),
				t[22] ||= K("p", { class: "studio-muted text-xs" }, "Select completed datasets to include in this wakeword’s training.", -1),
				l.value ? (W(), G("p", sp, "Loading datasets…")) : Y("", !0),
				(W(!0), G(U, null, H(i.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					K("label", cp, [
						K("input", {
							"data-batch-id": e.id,
							type: "checkbox",
							checked: c.value.has(e.id),
							disabled: e.status !== "complete",
							onChange: (t) => ye(e, t.target.checked)
						}, null, 40, lp),
						K("span", null, [
							K("strong", null, F(e.phrase), 1),
							K("span", up, F(e.audio.length) + " samples · " + F(e.recipe.engines?.map((e) => te[e] ?? e).join(", ") || "Saved generation models") + " · " + F(e.created_at ? new Date(e.created_at).toLocaleString() : ""), 1),
							e.status === "complete" ? Y("", !0) : (W(), G("span", dp, F(e.status) + " — only completed datasets can be selected.", 1))
						]),
						K("span", fp, F(e.status), 1)
					]),
					K("button", {
						type: "button",
						"data-delete-batch": e.id,
						disabled: u.value || [
							"queued",
							"running",
							"cancelling"
						].includes(e.status),
						onClick: (t) => g.value = e
					}, "Delete dataset", 8, pp),
					e.recipe.moss_source_batch_ids?.length ? (W(), G("p", mp, "MOSS sources: " + F(e.recipe.moss_source_batch_ids.join(", ")), 1)) : Y("", !0),
					g.value?.id === e.id ? (W(), G("section", {
						key: 1,
						role: "alertdialog",
						"aria-label": "Delete generated dataset?",
						class: "studio-note mt-3",
						onKeydown: t[8] ||= Go((e) => !u.value && (g.value = null), ["esc"])
					}, [
						K("h3", null, "Delete " + F(e.phrase) + " dataset permanently?", 1),
						t[21] ||= K("p", null, "This removes the generated dataset and its training selection. Historical training inputs and shared audio are kept.", -1),
						K("div", hp, [K("button", {
							type: "button",
							"data-action": "cancel-batch-delete",
							disabled: u.value,
							onClick: t[7] ||= (e) => g.value = null
						}, "Cancel", 8, gp), K("button", {
							type: "button",
							"data-action": "confirm-batch-delete",
							disabled: u.value,
							onClick: be
						}, F(u.value ? "Deleting…" : "Delete permanently"), 9, _p)])
					], 32)) : Y("", !0)
				]))), 128)),
				!l.value && !i.value.length ? (W(), G("p", vp, "No generated datasets yet. Choose models above to create one.")) : Y("", !0),
				q(oc, {
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
}), bp = { class: "studio-card" }, xp = {
	key: 0,
	class: "studio-muted"
}, Sp = {
	key: 1,
	"data-effective-counts": "",
	class: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 my-4"
}, Cp = { class: "studio-muted" }, wp = { class: "text-2xl font-semibold" }, Tp = { class: "studio-muted" }, Ep = { class: "text-2xl font-semibold" }, Dp = { class: "studio-muted" }, Op = { class: "text-2xl font-semibold" }, kp = {
	"data-negative-datasets-count": "",
	class: "studio-muted"
}, Ap = { class: "text-2xl font-semibold" }, jp = {
	key: 2,
	class: "studio-muted text-xs"
}, Mp = { class: "studio-card mt-4" }, Np = { class: "grid gap-3 mt-3" }, Pp = {
	"data-dataset-compatibility": "",
	class: "studio-note text-xs"
}, Fp = { class: "flex gap-2" }, Ip = ["disabled"], Lp = ["disabled"], Rp = {
	key: 0,
	class: "studio-note mt-3",
	role: "alert"
}, zp = { class: "studio-card mt-4" }, Bp = { class: "flex justify-between gap-3" }, Vp = ["onClick"], Hp = {
	key: 0,
	class: "studio-note text-xs"
}, Up = {
	key: 0,
	class: "studio-muted"
}, Wp = /* @__PURE__ */ cr({
	__name: "TrainPage",
	setup(e) {
		let t = ms(), n = Nc(), r = /* @__PURE__ */ R(null), i = /* @__PURE__ */ R({ training_steps: 4e4 }), a = /* @__PURE__ */ R([]), o = /* @__PURE__ */ R([]), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(!1), u = /* @__PURE__ */ R(""), d = /* @__PURE__ */ R(null), f, p, m, h = 0, g = 0, _ = 0, v = X(() => t.selectedId.value), y = X(() => [...new Set(o.value.map((e) => `${e.representation}/${e.adapter}`))]), b = X(() => o.value.filter((e) => e.selected && e.split !== "evaluation").length), x = X(() => o.value.filter((e) => e.selected && e.split === "evaluation").length);
		function S(e, t, n) {
			return v.value === e && h === t && !n.signal.aborted;
		}
		function C(e, t, n) {
			return v.value === e && g === t && !n.signal.aborted;
		}
		function w(e, t, n) {
			return v.value === e && _ === t && !n.signal.aborted;
		}
		function T() {
			p?.abort(), m?.abort(), p = void 0, m = void 0, g += 1, _ += 1, c.value = !1, l.value = !1, d.value = null;
		}
		async function E(e, t) {
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
		function D(e) {
			return e.map((e) => {
				let t = n.jobs.value[e.id], r = t?.word_id === v.value ? t : e;
				return Ac(r) && !t && n.track(r), r;
			});
		}
		async function O() {
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
						E(n, e)
					]);
					if (!S(n, t, e)) return;
					r.value = s, i.value = c, a.value = D(l.items), o.value = u;
				} catch (r) {
					S(n, t, e) && (u.value = r instanceof Error ? r.message : "Unable to load training configuration.");
				} finally {
					S(n, t, e) && (s.value = !1);
				}
			}
		}
		function ee() {
			return !Number.isInteger(i.value.training_steps) || i.value.training_steps < 1 || i.value.training_steps > 1e7 ? (u.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function k() {
			let e = v.value;
			if (!e || !ee()) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, r = { training_steps: i.value.training_steps };
			c.value = !0, u.value = "";
			try {
				let a = await $.saveTrainingSettings(e, r, t.signal);
				C(e, n, t) && (i.value = a);
			} catch (r) {
				C(e, n, t) && (u.value = r instanceof Error ? r.message : "Training settings were not saved.");
			} finally {
				C(e, n, t) && (c.value = !1);
			}
		}
		async function te() {
			let e = v.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let r = ++_;
			l.value = !0, u.value = "";
			try {
				let i = await $.train(e, t.signal);
				w(e, r, t) && (d.value = i, a.value = [i, ...a.value.filter((e) => e.id !== i.id)], n.track(i), n.show(i.id));
			} catch (n) {
				w(e, r, t) && (u.value = n instanceof Error ? n.message : "Training job was not started.");
			} finally {
				w(e, r, t) && (l.value = !1);
			}
		}
		function ne(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return V(n.jobs, (e) => {
			a.value = a.value.map((t) => e[t.id]?.word_id === v.value ? e[t.id] : t);
		}, { deep: !0 }), V(v, () => {
			T(), O();
		}, { immediate: !0 }), Er(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, t) => (W(), G("section", null, [
			t[13] ||= K("div", { class: "mb-4" }, [K("h1", null, "Train"), K("p", { class: "studio-muted" }, "Configure inputs and start a manual training run. Progress and logs are available in the global job queue.")], -1),
			K("div", bp, [
				t[6] ||= K("h2", null, "Effective inputs for the next snapshot", -1),
				s.value ? (W(), G("p", xp, "Loading effective inputs…")) : r.value ? (W(), G("div", Sp, [
					K("p", Cp, [K("strong", wp, F(r.value.positive), 1), t[2] ||= J(" reviewed positives", -1)]),
					K("p", Tp, [K("strong", Ep, F(r.value.negative), 1), t[3] ||= J(" reviewed negatives", -1)]),
					K("p", Dp, [K("strong", Op, F(r.value.artificial), 1), t[4] ||= J(" selected artificial", -1)]),
					K("p", kp, [K("strong", Ap, F(b.value), 1), t[5] ||= J(" selected negative datasets", -1)])
				])) : Y("", !0),
				!s.value && r.value && x.value ? (W(), G("p", jp, F(x.value) + " evaluation-only " + F(x.value === 1 ? "dataset" : "datasets") + " selected separately; not sampled for training.", 1)) : Y("", !0),
				t[7] ||= K("p", { class: "studio-muted text-xs" }, "Training uses reviewed positive/negative samples, completed selected artificial batches, and selected external negative datasets. Dataset totals count datasets, not individual audio samples. Pending and discarded recordings are not training inputs.", -1)
			]),
			K("div", Mp, [
				t[11] ||= K("h2", null, "Training parameters", -1),
				K("div", Np, [
					K("label", null, [t[8] ||= J("Training steps", -1), B(K("input", {
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
					K("p", Pp, [
						t[9] ||= J("Selected classifier representations: ", -1),
						K("strong", null, F(y.value.join(", ") || "none"), 1),
						t[10] ||= J(". microWakeWord uses mww_mmap feature tensors. dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					K("div", Fp, [K("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: c.value,
						onClick: k
					}, F(c.value ? "Saving…" : "Save parameters"), 9, Ip), K("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !v.value || l.value,
						onClick: te
					}, F(l.value ? "Starting…" : "Start training"), 9, Lp)])
				]),
				u.value ? (W(), G("p", Rp, F(u.value), 1)) : Y("", !0),
				d.value ? (W(), G("button", {
					key: 1,
					type: "button",
					class: "mt-3",
					onClick: t[1] ||= (e) => z(n).show(d.value.id)
				}, "View training in queue")) : Y("", !0)
			]),
			K("div", zp, [
				t[12] ||= K("h2", null, "Run history", -1),
				(W(!0), G(U, null, H(a.value, (e) => (W(), G("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [K("div", Bp, [
					K("strong", null, F(e.id), 1),
					K("span", { class: P(["studio-status", `studio-status-${e.status}`]) }, F(e.status), 3),
					K("button", {
						type: "button",
						onClick: (t) => z(n).show(e.id)
					}, "View in queue", 8, Vp)
				]), ne(e) ? (W(), G("p", Hp, "Skipped because inputs and configuration were unchanged.")) : Y("", !0)]))), 128)),
				!s.value && !a.value.length ? (W(), G("p", Up, "No training runs for this workspace yet.")) : Y("", !0)
			])
		]));
	}
});
//#endregion
//#region src/studio/theme.ts
function Gp() {
	let e = typeof window.matchMedia == "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null, t = null;
	try {
		let e = localStorage.getItem("studio.theme");
		(e === "light" || e === "dark") && (t = e);
	} catch {}
	let n = /* @__PURE__ */ R(t ? t === "dark" : !!e?.matches);
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
var Kp = ["aria-pressed"], qp = /* @__PURE__ */ cr({
	__name: "ThemeToggle",
	setup(e) {
		let { dark: t, toggle: n, dispose: r } = Gp();
		return Er(r), (e, r) => (W(), G("button", {
			type: "button",
			"aria-label": "Dark mode",
			"aria-pressed": z(t),
			onClick: r[0] ||= (...e) => z(n) && z(n)(...e)
		}, F(z(t) ? "☀ Light mode" : "☾ Dark mode"), 9, Kp));
	}
}), Jp = ["data-job-id"], Yp = { class: "studio-job-heading" }, Xp = ["aria-label", "disabled"], Zp = { class: "studio-job-meta" }, Qp = { class: "studio-job-meta" }, $p = {
	key: 0,
	class: "studio-job-meta"
}, em = {
	key: 1,
	class: "studio-log",
	"aria-label": "Job log tail"
}, tm = {
	key: 2,
	class: "studio-job-meta"
}, nm = {
	key: 3,
	class: "studio-note",
	role: "alert"
}, rm = { class: "studio-job-meta" }, im = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, am = /* @__PURE__ */ cr({
	__name: "JobQueueCard",
	props: { job: {} },
	setup(e) {
		let t = e, n = tc();
		Cr(() => {
			n.load();
		});
		let r = Nc(), i = ms(), a = {
			train: "Train wakeword",
			generation: "Generate artificial samples",
			preview: "Preview voice",
			scrape: "Collect recordings",
			download: "Download negative dataset",
			classify: "Classify recordings",
			deploy: "Deploy model"
		}, o = X(() => t.job.word_id ? i.wakewords.value.find((e) => e.id === t.job.word_id)?.phrase ?? t.job.word_id : t.job.kind === "download" ? "Shared dataset" : "All wakewords"), s = X(() => t.job.kind === "scrape" ? t.job.payload.device_ids?.map(n.deviceLabel).join(", ") || "All registered kiosks and followers" : t.job.kind === "download" ? t.job.payload.dataset_id : "Trainer"), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(""), d = /* @__PURE__ */ R(!1), f, p;
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
				e.signal.aborted || (d.value = !1, c.value && Ac(t.job) && (p = setTimeout(() => void h(), 2e3)));
			}
		}
		return V([c, () => t.job.status], () => {
			c.value ? h() : m();
		}), Er(m), (t, n) => (W(), G("article", {
			class: P(["studio-card studio-job-card", { "studio-selected": z(r).selectedJobId.value === e.job.id }]),
			"data-job-id": e.job.id
		}, [
			K("div", Yp, [
				K("h3", null, F(a[e.job.kind] ?? e.job.kind), 1),
				K("span", { class: P(["studio-status", `studio-status-${e.job.status}`]) }, F(e.job.status), 3),
				z(Ac)(e.job) ? (W(), G("button", {
					key: 0,
					type: "button",
					"data-action": "cancel-job",
					"aria-label": `Cancel ${a[e.job.kind] ?? e.job.kind}`,
					disabled: e.job.status === "cancelling" || z(r).cancelling.value.has(e.job.id),
					onClick: n[0] ||= (t) => z(r).cancel(e.job.id)
				}, "Cancel", 8, Xp)) : Y("", !0)
			]),
			K("p", Zp, F(o.value) + " · " + F(s.value), 1),
			K("p", Qp, F(e.job.started_at ? "Started" : "Created") + " " + F(new Date(e.job.started_at ?? e.job.created_at).toLocaleString()), 1),
			K("details", { onToggle: n[1] ||= (e) => c.value = e.target.open }, [
				n[2] ||= K("summary", null, "View logs", -1),
				d.value && !l.value ? (W(), G("p", $p, "Loading logs…")) : Y("", !0),
				l.value ? (W(), G("pre", em, F(l.value), 1)) : !d.value && !u.value ? (W(), G("p", tm, "No retained log output.")) : Y("", !0),
				u.value ? (W(), G("p", nm, [J(F(u.value) + " ", 1), K("button", {
					type: "button",
					onClick: h
				}, "Retry")])) : Y("", !0),
				K("p", rm, "Job " + F(e.job.id), 1)
			], 32),
			z(r).cancelErrors.value[e.job.id] ? (W(), G("p", im, F(z(r).cancelErrors.value[e.job.id]), 1)) : Y("", !0)
		], 10, Jp));
	}
}), om = { class: "studio-queue-header" }, sm = { class: "flex items-center justify-between gap-3" }, cm = { class: "studio-queue-badge" }, lm = { class: "studio-queue-content" }, um = {
	key: 0,
	class: "studio-note",
	role: "alert"
}, dm = { class: "studio-queue-group" }, fm = { class: "studio-queue-group" }, pm = {
	key: 5,
	class: "studio-muted text-sm mt-4"
}, mm = ["disabled"], hm = /* @__PURE__ */ cr({
	__name: "JobQueueDrawer",
	setup(e) {
		let t = Nc(), n = /* @__PURE__ */ R(), r = /* @__PURE__ */ R(), i = X(() => t.activeJobs.value.filter((e) => e.status !== "queued")), a = X(() => t.activeJobs.value.filter((e) => e.status === "queued")), o = X(() => {
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
		return V(t.open, async (e) => {
			e ? (s = document.activeElement instanceof HTMLElement ? document.activeElement : null, c = document.body.style.overflow, document.body.style.overflow = "hidden", document.addEventListener("keydown", u, !0), await yn(), r.value?.focus()) : (d(), await yn(), s?.isConnected ? s.focus() : document.querySelector("[data-action=\"open-job-queue\"]")?.focus());
		}, { flush: "sync" }), V([
			t.selectedJobId,
			t.history,
			t.loading
		], async () => {
			t.open.value && t.selectedJobId.value && (await yn(), Array.from(n.value?.querySelectorAll("[data-job-id]") ?? []).find((e) => e.dataset.jobId === t.selectedJobId.value)?.scrollIntoView?.({ block: "nearest" }));
		}), Er(() => {
			t.open.value && d();
		}), (e, s) => z(t).open.value ? (W(), G(U, { key: 0 }, [K("div", {
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
		}, [K("header", om, [K("div", sm, [K("h2", null, [s[2] ||= J("Job queue ", -1), K("span", cm, F(z(t).activeCount.value) + " active", 1)]), K("button", {
			ref_key: "closeButton",
			ref: r,
			type: "button",
			"data-action": "close-job-queue",
			"aria-label": "Close job queue",
			onClick: l
		}, "✕", 512)]), s[3] ||= K("p", { class: "studio-muted text-xs" }, "All kiosks · All followers · All wakewords", -1)]), K("div", lm, [
			z(t).error.value ? (W(), G("p", um, [J(F(z(t).error.value) + " ", 1), K("button", {
				type: "button",
				onClick: s[0] ||= (...e) => z(t).refresh && z(t).refresh(...e)
			}, "Retry")])) : Y("", !0),
			o.value ? (W(), G(U, { key: 1 }, [s[4] ||= K("h3", { class: "studio-queue-group" }, "Selected job", -1), q(am, { job: o.value }, null, 8, ["job"])], 64)) : Y("", !0),
			i.value.length ? (W(), G(U, { key: 2 }, [K("h3", dm, "Running · " + F(i.value.length), 1), (W(!0), G(U, null, H(i.value, (e) => (W(), ia(am, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			a.value.length ? (W(), G(U, { key: 3 }, [K("h3", fm, "Queued · " + F(a.value.length), 1), (W(!0), G(U, null, H(a.value, (e) => (W(), ia(am, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			z(t).history.value.length ? (W(), G(U, { key: 4 }, [s[5] ||= K("h3", { class: "studio-queue-group" }, "Recent history", -1), (W(!0), G(U, null, H(z(t).history.value, (e) => (W(), ia(am, {
				key: e.id,
				job: e
			}, null, 8, ["job"]))), 128))], 64)) : Y("", !0),
			!z(t).activeCount.value && !z(t).history.value.length && !o.value && !z(t).loading.value && !z(t).error.value ? (W(), G("p", pm, "No jobs yet.")) : Y("", !0),
			z(t).hasMore.value ? (W(), G("button", {
				key: 6,
				type: "button",
				class: "studio-queue-more",
				disabled: z(t).loading.value,
				onClick: s[1] ||= (...e) => z(t).loadMore && z(t).loadMore(...e)
			}, "Load older jobs", 8, mm)) : Y("", !0)
		])], 512)], 64)) : Y("", !0);
	}
}), gm = ["inert"], _m = { class: "studio-sidebar" }, vm = { class: "flex items-center justify-between gap-3" }, ym = ["aria-expanded"], bm = ["hidden"], xm = {
	key: 0,
	class: "studio-nav-label"
}, Sm = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], Cm = { class: "studio-main" }, wm = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, Tm = { class: "studio-muted text-xs" }, Em = { class: "flex flex-wrap items-center gap-3" }, Dm = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, Om = ["value", "disabled"], km = {
	key: 0,
	value: ""
}, Am = ["value"], jm = ["aria-expanded"], Mm = {
	key: 0,
	class: "studio-queue-badge"
}, Nm = {
	key: 1,
	title: "Job queue unavailable",
	"aria-label": "Job queue unavailable"
}, Pm = {
	key: 0,
	role: "status",
	class: "studio-note"
}, Fm = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Im = {
	key: 2,
	role: "status"
}, Lm = /* @__PURE__ */ cr({
	__name: "StudioShell",
	setup(e) {
		let t = ts(), n = fs(t);
		Fn(ps, n);
		let r = Mc();
		Fn(jc, r);
		let { wakewords: i, selectedId: a, selected: o, loading: s, error: c, notice: l } = n, u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(!1), f = /* @__PURE__ */ R(), p = /* @__PURE__ */ R(), m = X(() => Qo.find((e) => e.id === t.page.value)), h = X(() => d.value && !u.value), g = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
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
		return V(d, (e) => {
			e || (u.value = !1);
		}), _(), g?.addEventListener ? g.addEventListener("change", _) : g?.addListener(_), Cr(() => {
			document.addEventListener("keydown", y), n.load(), r.start();
		}), Er(() => {
			document.removeEventListener("keydown", y), r.stop(), g?.removeEventListener ? g.removeEventListener("change", _) : g?.removeListener(_);
		}), (e, o) => (W(), G("div", { class: P(["studio-app", { "is-narrow": d.value }]) }, [K("div", {
			class: "studio-layout",
			"data-studio-background": "",
			inert: z(r).open.value ? !0 : void 0
		}, [
			K("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: o[0] ||= Uo((e) => p.value?.focus(), ["prevent"])
			}, "Skip to content"),
			K("aside", _m, [
				K("div", vm, [o[4] ||= K("div", { class: "studio-brand" }, [J("◈ Wakeword Studio"), K("small", null, "LISTEN · REFINE · DEPLOY")], -1), d.value ? (W(), G("button", {
					key: 0,
					ref_key: "toggle",
					ref: f,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": u.value,
					onClick: o[1] ||= (e) => u.value = !u.value
				}, "Menu", 8, ym)) : Y("", !0)]),
				K("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: h.value
				}, [(W(!0), G(U, null, H(z(Qo), (e, n) => (W(), G(U, { key: e.id }, [(e.group === "Data" || e.group === "Models") && z(Qo)[n - 1]?.group !== e.group ? (W(), G("div", xm, F(e.group), 1)) : Y("", !0), K("a", {
					href: z(t).href(e.id),
					"data-page": e.id,
					class: P({
						active: m.value.id === e.id,
						"studio-sub": e.group === "Data"
					}),
					"aria-current": m.value.id === e.id ? "page" : void 0,
					onClick: Uo((t) => b(e.id), ["prevent"])
				}, F(e.name), 11, Sm)], 64))), 128))], 8, bm),
				o[5] ||= K("p", { class: "studio-sidebar-note" }, [
					J("Independent workspaces."),
					K("br"),
					J("Device selections stay unchanged.")
				], -1)
			]),
			K("div", Cm, [K("header", wm, [K("div", Tm, F(m.value.group) + " / " + F(m.value.name), 1), K("div", Em, [
				K("label", Dm, [o[6] ||= J("WAKEWORD ", -1), K("select", {
					id: "studio-word",
					value: z(a),
					disabled: !z(i).length,
					onChange: o[2] ||= (e) => z(n).select(e.target.value)
				}, [z(i).length ? Y("", !0) : (W(), G("option", km, "No wakewords")), (W(!0), G(U, null, H(z(i), (e) => (W(), G("option", {
					key: e.id,
					value: e.id
				}, F(e.phrase), 9, Am))), 128))], 40, Om)]),
				q(qp),
				K("button", {
					type: "button",
					class: "studio-queue-toggle",
					"data-action": "open-job-queue",
					"aria-label": "Open global job queue",
					"aria-controls": "studio-job-queue",
					"aria-expanded": z(r).open.value,
					onClick: o[3] ||= (e) => z(r).show()
				}, [
					o[7] ||= K("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "1.7",
						"aria-hidden": "true"
					}, [K("path", { d: "M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" })], -1),
					z(r).activeCount.value ? (W(), G("span", Mm, F(z(r).activeCount.value), 1)) : Y("", !0),
					z(r).error.value ? (W(), G("span", Nm, "!")) : Y("", !0)
				], 8, jm)
			])]), K("main", {
				id: "studio-content",
				ref_key: "content",
				ref: p,
				class: "studio-content",
				tabindex: "-1"
			}, [
				z(l) ? (W(), G("p", Pm, F(z(l)), 1)) : Y("", !0),
				z(c) ? (W(), G("div", Fm, F(z(c)), 1)) : Y("", !0),
				z(s) ? (W(), G("p", Im, "Loading workspaces…")) : Y("", !0),
				m.value.id === "wakewords" ? (W(), ia(Hs, { key: 3 })) : m.value.id === "classify" ? (W(), ia(vl, { key: 4 })) : m.value.id === "samples" ? (W(), ia(pu, { key: 5 })) : m.value.id === "kiosks" ? (W(), ia(Ju, { key: 6 })) : m.value.id === "automate" ? (W(), ia(kd, { key: 7 })) : m.value.id === "deploy" ? (W(), ia(df, { key: 8 })) : m.value.id === "negative-datasets" ? (W(), ia(kf, { key: 9 })) : m.value.id === "artificial" ? (W(), ia(yp, { key: 10 })) : m.value.id === "train" ? (W(), ia(Wp, { key: 11 })) : Y("", !0)
			], 512)])
		], 8, gm), q(hm)], 2));
	}
}), Rm = /* @__PURE__ */ cr({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (W(), ia(Lm));
	}
}), zm = document.getElementById("trainer-app");
if (!zm) throw Error("Missing #trainer-app mount point");
Yo(Rm).mount(zm);
//#endregion

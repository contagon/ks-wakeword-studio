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
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", w = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ee = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), T = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, E = /-\w/g, D = T((e) => e.replace(E, (e) => e.slice(1).toUpperCase())), te = /\B([A-Z])/g, O = T((e) => e.replace(te, "-$1").toLowerCase()), ne = T((e) => e.charAt(0).toUpperCase() + e.slice(1)), re = T((e) => e ? `on${ne(e)}` : ""), ie = (e, t) => !Object.is(e, t), ae = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, k = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, oe = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, se, ce = () => se ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function le(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? pe(r) : le(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var ue = /;(?![^(]*\))/g, de = /:([^]+)/, fe = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function pe(e) {
	let t = {};
	return e.replace(fe, (e) => e.startsWith("/*") ? "" : e).split(ue).forEach((e) => {
		if (e) {
			let n = e.split(de);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function A(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = A(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var me = /* @__PURE__ */ e("itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function he(e) {
	return !!e || e === "";
}
function ge(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = be(e[i], t[i], n);
	return r;
}
function _e(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && be(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function ve(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? _e(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = e.hasOwnProperty(r), a = t.hasOwnProperty(r);
		if (i && !a || !i && a || !be(e[r], t[r], n)) return !1;
	}
	return String(e) === String(t);
}
function ye(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function be(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? ye(e, t, n, ge) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : ye(e, t, n, ve) : String(e) === String(t))));
}
function xe(e, t) {
	return e.findIndex((e) => be(e, t));
}
var Se = (e) => !!(e && e.__v_isRef === !0), j = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? Se(e) ? j(e.value) : JSON.stringify(e, Ce, 2) : String(e), Ce = (e, t) => Se(t) ? Ce(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[we(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => we(e)) } : _(t) ? we(t) : v(t) && !d(t) && !C(t) ? String(t) : t, we = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, M, Te = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && M && (M.active ? (this.parent = M, this.index = (M.scopes || (M.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = M;
			try {
				return M = this, e();
			} finally {
				M = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = M, M = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (M === this) M = this.prevScope;
			else {
				let e = M;
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
function Ee() {
	return M;
}
function De(e, t = !1) {
	M && M.cleanups.push(e);
}
var N, Oe = /* @__PURE__ */ new WeakSet(), ke = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, M && (M.active ? M.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Oe.has(this) && (Oe.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ne(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ke(this), Ie(this);
		let e = N, t = He;
		N = this, He = !0;
		try {
			return this.fn();
		} finally {
			Le(this), N = e, He = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Be(e);
			this.deps = this.depsTail = void 0, Ke(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Oe.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Re(this) && this.run();
	}
	get dirty() {
		return Re(this);
	}
}, Ae = 0, je, Me;
function Ne(e, t = !1) {
	e.flags |= 8, t ? (e.next = Me, Me = e) : (e.next = je, je = e);
}
function Pe() {
	Ae++;
}
function Fe() {
	if (--Ae > 0) return;
	if (Me) {
		let e = Me;
		for (Me = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; je;) {
		let t = je;
		for (je = void 0; t;) {
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
function Ie(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Le(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Be(r), Ve(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Re(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (ze(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function ze(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === qe) || (e.globalVersion = qe, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Re(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = N, r = He;
	N = e, He = !0;
	try {
		Ie(e);
		let n = e.fn(e._value);
		(t.version === 0 || ie(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		N = n, He = r, Le(e), e.flags &= -3;
	}
}
function Be(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Be(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Ve(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var He = !0, Ue = [];
function We() {
	Ue.push(He), He = !1;
}
function Ge() {
	let e = Ue.pop();
	He = e === void 0 || e;
}
function Ke(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = N;
		N = void 0;
		try {
			t();
		} finally {
			N = e;
		}
	}
}
var qe = 0, Je = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Ye = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!N || !He || N === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== N) t = this.activeLink = new Je(N, this), N.deps ? (t.prevDep = N.depsTail, N.depsTail.nextDep = t, N.depsTail = t) : N.deps = N.depsTail = t, Xe(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = N.depsTail, t.nextDep = void 0, N.depsTail.nextDep = t, N.depsTail = t, N.deps === t && (N.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, qe++, this.notify(e);
	}
	notify(e) {
		Pe();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Fe();
		}
	}
};
function Xe(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Xe(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Ze = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ Symbol(""), $e = /* @__PURE__ */ Symbol(""), et = /* @__PURE__ */ Symbol("");
function tt(e, t, n) {
	if (He && N) {
		let t = Ze.get(e);
		t || Ze.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Ye()), r.map = t, r.key = n), r.track();
	}
}
function nt(e, t, n, r, i, a) {
	let o = Ze.get(e);
	if (!o) {
		qe++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Pe(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === et || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(et)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Qe)), f(e) && s(o.get($e)));
				break;
			case "delete":
				i || (s(o.get(Qe)), f(e) && s(o.get($e)));
				break;
			case "set": f(e) && s(o.get(Qe));
		}
	}
	Fe();
}
function rt(e) {
	let t = /* @__PURE__ */ P(e);
	return t === e || (tt(t, "iterate", et), /* @__PURE__ */ Ut(e)) ? t : /* @__PURE__ */ Ht(e) ? /* @__PURE__ */ Vt(e) ? t.map((e) => qt(Kt(e))) : t.map(qt) : t.map(Kt);
}
function it(e) {
	return tt(e = /* @__PURE__ */ P(e), "iterate", et), e;
}
function at(e, t) {
	return /* @__PURE__ */ Ht(e) ? qt(/* @__PURE__ */ Vt(e) ? Kt(t) : t) : Kt(t);
}
var ot = {
	__proto__: null,
	[Symbol.iterator]() {
		return st(this, Symbol.iterator, (e) => at(this, e));
	},
	concat(...e) {
		return rt(this).concat(...e.map((e) => d(e) ? rt(e) : e));
	},
	entries() {
		return st(this, "entries", (e) => (e[1] = at(this, e[1]), e));
	},
	every(e, t) {
		return ut(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return ut(this, "filter", e, t, (e) => e.map((e) => at(this, e)), arguments);
	},
	find(e, t) {
		return ut(this, "find", e, t, (e) => at(this, e), arguments);
	},
	findIndex(e, t) {
		return ut(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return ut(this, "findLast", e, t, (e) => at(this, e), arguments);
	},
	findLastIndex(e, t) {
		return ut(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return ut(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return ft(this, "includes", e);
	},
	indexOf(...e) {
		return ft(this, "indexOf", e);
	},
	join(e) {
		return rt(this).join(e);
	},
	lastIndexOf(...e) {
		return ft(this, "lastIndexOf", e);
	},
	map(e, t) {
		return ut(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return pt(this, "pop");
	},
	push(...e) {
		return pt(this, "push", e);
	},
	reduce(e, ...t) {
		return dt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return dt(this, "reduceRight", e, t);
	},
	shift() {
		return pt(this, "shift");
	},
	some(e, t) {
		return ut(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return pt(this, "splice", e);
	},
	toReversed() {
		return rt(this).toReversed();
	},
	toSorted(e) {
		return rt(this).toSorted(e);
	},
	toSpliced(...e) {
		return rt(this).toSpliced(...e);
	},
	unshift(...e) {
		return pt(this, "unshift", e);
	},
	values() {
		return st(this, "values", (e) => at(this, e));
	}
};
function st(e, t, n) {
	let r = it(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Ut(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => ct(a.next(), n), i !== lt[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => ct(a._next(), n);
	}
	return a;
}
function ct(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var lt = Array.prototype;
function ut(e, t, n, r, i, a) {
	let o = it(e), s = o !== e && !/* @__PURE__ */ Ut(e), c = o[t];
	if (c !== lt[t]) {
		let t = c.apply(e, a);
		return s ? Kt(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, at(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function dt(e, t, n, r) {
	let i = it(e), a = i !== e && !/* @__PURE__ */ Ut(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = at(e, t)), n.call(this, t, at(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? at(e, c) : c;
}
function ft(e, t, n) {
	let r = /* @__PURE__ */ P(e);
	tt(r, "iterate", et);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Wt(n[0]) ? (n[0] = /* @__PURE__ */ P(n[0]), r[t](...n)) : i;
}
function pt(e, t, n = []) {
	We(), Pe();
	let r = (/* @__PURE__ */ P(e))[t].apply(e, n);
	return Fe(), Ge(), r;
}
var mt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), ht = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function gt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ P(this);
	return tt(t, "has", e), t.hasOwnProperty(e);
}
var _t = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Ft : Pt : i ? Nt : Mt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = ot[t])) return e;
			if (t === "hasOwnProperty") return gt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Jt(e) ? e : n);
		if ((_(t) ? ht.has(t) : mt(t)) || (r || tt(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Jt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ zt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ zt(o) : /* @__PURE__ */ Lt(o) : o;
	}
}, vt = class extends _t {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Ht(i);
			if (!/* @__PURE__ */ Ut(n) && !/* @__PURE__ */ Ht(n) && (i = /* @__PURE__ */ P(i), n = /* @__PURE__ */ P(n)), !a && /* @__PURE__ */ Jt(i) && !/* @__PURE__ */ Jt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Jt(e) ? e : r);
		return e === /* @__PURE__ */ P(r) && s && (o ? ie(n, i) && nt(e, "set", t, n, i) : nt(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && nt(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !ht.has(t)) && tt(e, "has", t), n;
	}
	ownKeys(e) {
		return tt(e, "iterate", d(e) ? "length" : Qe), Reflect.ownKeys(e);
	}
}, yt = class extends _t {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, bt = /* @__PURE__ */ new vt(), xt = /* @__PURE__ */ new yt(), St = /* @__PURE__ */ new vt(!0), Ct = (e) => e, wt = (e) => Reflect.getPrototypeOf(e);
function Tt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ P(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? Ct : t ? qt : Kt;
		return !t && tt(a, "iterate", l ? $e : Qe), s(Object.create(u), { next() {
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
function Et(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Dt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ P(r), a = /* @__PURE__ */ P(n);
			e || (ie(n, a) && tt(i, "get", n), tt(i, "get", a));
			let { has: o } = wt(i), s = t ? Ct : e ? qt : Kt;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && tt(/* @__PURE__ */ P(t), "iterate", Qe), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ P(n), i = /* @__PURE__ */ P(t);
			return e || (ie(t, i) && tt(r, "has", t), tt(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ P(a), s = t ? Ct : e ? qt : Kt;
			return !e && tt(o, "iterate", Qe), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: Et("add"),
		set: Et("set"),
		delete: Et("delete"),
		clear: Et("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ P(this), r = wt(n), i = /* @__PURE__ */ P(e), a = !t && !/* @__PURE__ */ Ut(e) && !/* @__PURE__ */ Ht(e) ? i : e;
			return r.has.call(n, a) || ie(e, a) && r.has.call(n, e) || ie(i, a) && r.has.call(n, i) || (n.add(a), nt(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Ut(n) && !/* @__PURE__ */ Ht(n) && (n = /* @__PURE__ */ P(n));
			let r = /* @__PURE__ */ P(this), { has: i, get: a } = wt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ P(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? ie(n, s) && nt(r, "set", e, n, s) : nt(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ P(this), { has: n, get: r } = wt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ P(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && nt(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ P(this), t = e.size !== 0, n = e.clear();
			return t && nt(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Tt(r, e, t);
	}), n;
}
function Ot(e, t) {
	let n = Dt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var kt = { get: /* @__PURE__ */ Ot(!1, !1) }, At = { get: /* @__PURE__ */ Ot(!1, !0) }, jt = { get: /* @__PURE__ */ Ot(!0, !1) }, Mt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap();
function It(e) {
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
function Lt(e) {
	return /* @__PURE__ */ Ht(e) ? e : Bt(e, !1, bt, kt, Mt);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
	return Bt(e, !1, St, At, Nt);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return Bt(e, !0, xt, jt, Pt);
}
function Bt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = It(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return /* @__PURE__ */ Ht(e) ? /* @__PURE__ */ Vt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Ut(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Wt(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function P(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ P(t) : e;
}
function Gt(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && k(e, "__v_skip", !0), e;
}
var Kt = (e) => v(e) ? /* @__PURE__ */ Lt(e) : e, qt = (e) => v(e) ? /* @__PURE__ */ zt(e) : e;
// @__NO_SIDE_EFFECTS__
function Jt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
	return Xt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
	return Xt(e, !0);
}
function Xt(e, t) {
	return /* @__PURE__ */ Jt(e) ? e : new Zt(e, t);
}
var Zt = class {
	constructor(e, t) {
		this.dep = new Ye(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ P(e), this._value = t ? e : Kt(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Ut(e) || /* @__PURE__ */ Ht(e);
		e = n ? e : /* @__PURE__ */ P(e), ie(e, t) && (this._rawValue = e, this._value = n ? e : Kt(e), this.dep.trigger());
	}
};
function I(e) {
	return /* @__PURE__ */ Jt(e) ? e.value : e;
}
var Qt = {
	get: (e, t, n) => t === "__v_raw" ? e : I(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Jt(i) && !/* @__PURE__ */ Jt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function $t(e) {
	return /* @__PURE__ */ Vt(e) ? e : new Proxy(e, Qt);
}
var en = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Ye(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = qe - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && N !== this) return Ne(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return ze(this), e && (e.version = this.dep.version), this._value;
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
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Ut(e) || o === !1 || o === 0 ? cn(e, 1) : cn(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Jt(e) ? (g = () => e.value, y = /* @__PURE__ */ Ut(e)) : /* @__PURE__ */ Vt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ Vt(e) || /* @__PURE__ */ Ut(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Jt(e)) return e.value;
		if (/* @__PURE__ */ Vt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			We();
			try {
				_();
			} finally {
				Ge();
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
	let x = Ee(), S = () => {
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
				if (e || o || y || (b ? t.some((e, t) => ie(e, C[t])) : ie(t, C))) {
					let e = an;
					We();
					try {
						_ && _(), an = m;
						let e = [
							t,
							C === nn ? void 0 : b && C[0] === nn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						an = e, Ge();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new ke(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => on(e, !1, m), _ = m.onStop = () => {
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
	if (n.set(e, t), t--, /* @__PURE__ */ Jt(e)) cn(e.value, t, n);
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
			We(), ln(o, null, 10, [
				e,
				i,
				a
			]), Ge();
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
		r._d && ea(-1);
		let i = Nn(t), a = Xi.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Xi.length; e > a; e--) Qi();
			Nn(i), r._d && ea(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function L(e, n) {
	if (jn === null) return e;
	let r = Pa(jn), i = e.dirs ||= [];
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
		c && (We(), un(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), Ge());
	}
}
function In(e, t) {
	if (ba) {
		let n = ba.provides, r = ba.parent && ba.parent.provides;
		r === n && (n = ba.provides = Object.create(r)), n[e] = t;
	}
}
function Ln(e, t, n = !1) {
	let r = xa();
	if (r || ni) {
		let i = ni ? ni._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Rn = /* @__PURE__ */ Symbol.for("v-scx"), zn = () => Ln(Rn);
function R(e, t, n) {
	return Bn(e, t, n);
}
function Bn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Da) {
		if (c === "sync") {
			let e = zn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = ba;
	u.call = (e, t, n) => un(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, Pi(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Sn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = sn(e, n, u);
	return Da && (f ? f.push(h) : d && h()), h;
}
function Vn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Hn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = wa(this), s = Bn(i, a.bind(r), n);
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
			Un.set(e, t), Pi(t, a);
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
			if (o === "svg" || Jn(p) ? o = "svg" : (o === "mathml" || Yn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Bi(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Qn(t, n, r, l, 1);
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
		for (let n of e) if (n.type !== Ji) {
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
	else if (e.transition = t, e.type === B && d(e.children)) {
		let n = li(e.children, !1);
		n && or(n, t);
	}
}
function sr(e) {
	if (e.component) return sr(e.component.subTree);
	if (e.type === B) {
		let t = d(e.children) && li(e.children, !1);
		return t ? sr(t) : void 0;
	}
	if (e.type !== Ji) return e;
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
	let s = a.shapeFlag & 4 ? Pa(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ P(v), b = v === t ? i : (e) => !ur(_, e) && u(y, e), x = (e, t) => !(t && ur(_, t));
	if (m != null && m !== p) {
		if (pr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Jt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) ln(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Jt(p);
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
				t.id = -1, dr.set(e, t), Pi(t, r);
			} else pr(e), i();
		}
	}
}
function pr(e) {
	let t = dr.get(e);
	t && (t.flags |= 8, dr.delete(e));
}
ce().requestIdleCallback, ce().cancelIdleCallback;
var mr = (e) => !!e.type.__asyncLoader, hr = (e) => e.type.__isKeepAlive;
function gr(e, t) {
	vr(e, "a", t);
}
function _r(e, t) {
	vr(e, "da", t);
}
function vr(e, t, n = ba) {
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
function br(e, t, n = ba, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			We();
			let i = wa(n), a = un(t, n, e, r);
			return i(), Ge(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var xr = (e) => (t, n = ba) => {
	(!Da || e === "sp") && br(e, (...e) => t(...e), n);
}, Sr = xr("bm"), Cr = xr("m"), wr = xr("bu"), Tr = xr("u"), Er = xr("bum"), Dr = xr("um"), Or = xr("sp"), kr = xr("rtg"), Ar = xr("rtc");
function jr(e, t = ba) {
	br("ec", e, t);
}
var Mr = /* @__PURE__ */ Symbol.for("v-ndc");
function z(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ Vt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Ut(e), s = /* @__PURE__ */ Ht(e), e = it(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? qt(Kt(e[n])) : Kt(e[n]) : e[n], n, void 0, a && a[n]);
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
var Nr = (e) => e ? Ea(e) ? Pa(e) : Nr(e.parent) : null, Pr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
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
	$options: (e) => Ur(e),
	$forceUpdate: (e) => e.f ||= () => {
		Sn(e.update);
	},
	$nextTick: (e) => e.n ||= bn.bind(e.proxy),
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
			else Rr && (s[n] = 0);
		}
		let d = Pr[n], f, p;
		if (d) return n === "$attrs" && tt(e.attrs, "get", ""), d(e);
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
var Rr = !0;
function zr(e) {
	let t = Ur(e), n = e.proxy, i = e.ctx;
	Rr = !1, t.beforeCreate && Vr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: ee, renderTracked: T, renderTriggered: E, errorCaptured: D, serverPrefetch: te, expose: O, inheritAttrs: ne, components: re, directives: ie, filters: ae } = t;
	if (u && Br(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Lt(t));
	}
	if (Rr = !0, o) for (let e in o) {
		let t = o[e], a = q({
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
	if (c) for (let e in c) Hr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			In(t, e[t]);
		});
	}
	f && Vr(f, e, "c");
	function k(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (k(Sr, p), k(Cr, m), k(wr, g), k(Tr, _), k(gr, y), k(_r, b), k(jr, D), k(Ar, T), k(kr, E), k(Er, S), k(Dr, w), k(Or, te), d(O)) {
		if (O.length) {
			let t = e.exposed ||= {};
			O.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	ee && e.render === r && (e.render = ee), ne != null && (e.inheritAttrs = ne), re && (e.components = re), ie && (e.directives = ie), te && lr(e);
}
function Br(e, t, n = r) {
	d(e) && (e = Jr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Ln(r.from || n, r.default, !0) : Ln(r.from || n) : Ln(r), /* @__PURE__ */ Jt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Vr(e, t, n) {
	un(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Hr(e, t, n, r) {
	let i = r.includes(".") ? Hn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && R(i, n);
	} else if (h(e)) R(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Hr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && R(i, r, e);
		}
	}
}
function Ur(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Wr(c, e, o, !0)), Wr(c, t, o)), v(t) && a.set(t, c), c;
}
function Wr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Wr(e, a, n, !0), i && i.forEach((t) => Wr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Gr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Gr = {
	data: Kr,
	props: Zr,
	emits: Zr,
	methods: Xr,
	computed: Xr,
	beforeCreate: Yr,
	created: Yr,
	beforeMount: Yr,
	mounted: Yr,
	beforeUpdate: Yr,
	updated: Yr,
	beforeDestroy: Yr,
	beforeUnmount: Yr,
	destroyed: Yr,
	unmounted: Yr,
	activated: Yr,
	deactivated: Yr,
	errorCaptured: Yr,
	serverPrefetch: Yr,
	components: Xr,
	directives: Xr,
	watch: Qr,
	provide: Kr,
	inject: qr
};
function Kr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function qr(e, t) {
	return Xr(Jr(e), Jr(t));
}
function Jr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Yr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Xr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Zr(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Lr(e), Lr(t ?? {})) : t;
}
function Qr(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Yr(e[r], t[r]);
	return n;
}
function $r() {
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
var ei = 0;
function ti(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = $r(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ei++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Ia,
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
					let u = l._ceVNode || W(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Pa(u.component);
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
				let t = ni;
				ni = l;
				try {
					return e();
				} finally {
					ni = t;
				}
			}
		};
		return l;
	};
}
var ni = null, ri = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${D(t)}Modifiers`] || e[`${O(t)}Modifiers`];
function ii(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ri(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(oe)));
	let c, l = i[c = re(n)] || i[c = re(D(n))];
	!l && o && (l = i[c = re(O(n))]), l && un(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, un(u, e, 6, a);
	}
}
var ai = /* @__PURE__ */ new WeakMap();
function oi(e, t, n = !1) {
	let r = n ? ai : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = oi(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function si(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, O(t)) || u(e, t));
}
function ci(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Nn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = da(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = da(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : ui(c);
		}
	} catch (t) {
		Xi.length = 0, dn(t, e, 1), v = W(Ji);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = di(y, a)), b = la(b, y, !1, !0));
	}
	return n.dirs && (b = la(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && or(Gn(b.type) && ar(b) || b, n.transition), v = b, Nn(_), v;
}
function li(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (ra(r)) {
			if (r.type !== Ji || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var ui = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, di = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function fi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? pi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (mi(o, r, n) && !si(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || pi(r, o, l) : !!o;
	return !1;
}
function pi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || mi(t, e, a) && !si(n, a)) return !0;
	}
	return !1;
}
function mi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !be(r, i) : r !== i;
}
function hi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var gi = {}, _i = () => Object.create(gi), vi = (e) => Object.getPrototypeOf(e) === gi;
function yi(e, t, n, r = !1) {
	let i = {}, a = _i();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), xi(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ Rt(i) : e.type.props ? i : a, e.attrs = a;
}
function bi(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ P(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (si(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = D(o);
						i[t] = Si(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		xi(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = O(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Si(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && nt(e.attrs, "set", "");
}
function xi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (ee(t)) continue;
		let l = n[t], d;
		a && u(a, d = D(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : si(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ P(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = Si(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function Si(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = wa(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === O(n)) && (r = !0));
	}
	return r;
}
var Ci = /* @__PURE__ */ new WeakMap();
function wi(e, r, i = !1) {
	let a = i ? Ci : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = wi(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = D(c[e]);
		Ti(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = D(e);
		if (Ti(t)) {
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
function Ti(e) {
	return e[0] !== "$" && !ee(e);
}
var Ei = (e) => e === "_" || e === "_ctx" || e === "$stable", Di = (e) => d(e) ? e.map(da) : [da(e)], Oi = (e, t, n) => {
	if (t._n) return t;
	let r = Pn((...e) => Di(t(...e)), n);
	return r._c = !1, r;
}, ki = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ei(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Oi(n, i, r);
		else if (i != null) {
			let e = Di(i);
			t[n] = () => e;
		}
	}
}, Ai = (e, t) => {
	let n = Di(t);
	e.slots.default = () => n;
}, ji = (e, t, n) => {
	for (let r in t) (n || !Ei(r)) && (e[r] = t[r]);
}, Mi = (e, t, n) => {
	let r = e.slots = _i();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (ji(r, t, n), n && k(r, "_", e, !0)) : ki(t, r);
	} else t && Ai(e, t);
}, Ni = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : ji(a, n, r) : (o = !n.$stable, ki(n, a)), s = n;
	} else n && (Ai(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ei(e) && s[e] == null && delete a[e];
}, Pi = Ki;
function Fi(e) {
	return Ii(e);
}
function Ii(e, i) {
	let a = ce();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !ia(e, t) && (i = ve(e), A(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case qi:
				y(e, t, r, i);
				break;
			case Ji:
				b(e, t, r, i);
				break;
			case Yi:
				e ?? x(t, r, i, s);
				break;
			case B:
				re(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? ie(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, be);
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
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) T(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), te(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, T = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && D(e.children, d, null, r, i, Li(e, a), s, u), _ && Fn(e, null, r, "created"), E(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !ee(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && ha(f, r, e);
		}
		_ && Fn(e, null, r, "beforeMount");
		let v = zi(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Pi(() => {
			try {
				f && ha(f, r, e), v && g.enter(d), _ && Fn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, E = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Gi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				E(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, D = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? fa(e[l]) : da(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, te = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Ri(r, !1), (g = h.onVnodeBeforeUpdate) && ha(g, r, n, e), f && Fn(n, e, r, "beforeUpdate"), r && Ri(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? O(e.dynamicChildren, d, l, r, i, Li(n, a), o) : s || ue(e, n, l, null, r, i, Li(n, a), o, !1), u > 0) {
			if (u & 16) ne(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && ne(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && Pi(() => {
			g && ha(g, r, n, e), f && Fn(n, e, r, "updated");
		}, i);
	}, O = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Wi(c), d = u && (c.type === B || !ia(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, ne = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !ee(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (ee(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, re = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), D(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (O(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Bi(e, t, !0)) : ue(e, t, n, f, i, a, s, c, l);
	}, ie = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : k(t, n, r, i, a, o, c) : oe(e, t, c);
	}, k = (e, t, n, r, i, a, o) => {
		let s = e.component = ya(e, r, i);
		if (hr(e) && (s.ctx.renderer = be), Oa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, se, o, a), !e.el) {
				let r = s.subTree = W(Ji);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else se(s, e, t, n, i, a, o);
	}, oe = (e, t, n) => {
		let r = t.component = e.component;
		if (fi(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, le(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, se = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Hi(e);
					if (n) {
						t && (t.el = c.el, le(e, t, o)), n.asyncDep.then(() => {
							Pi(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Ri(e, !1), t ? (t.el = c.el, le(e, t, o)) : t = c, n && ae(n), (d = t.props && t.props.onVnodeBeforeUpdate) && ha(d, s, t, c), Ri(e, !0);
				let f = ci(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), ve(p), e, i, a), t.el = f.el, u === null && hi(e, f.el), r && Pi(r, i), (d = t.props && t.props.onVnodeUpdated) && Pi(() => ha(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = mr(t);
				if (Ri(e, !1), l && ae(l), !m && (o = c && c.onVnodeBeforeMount) && ha(o, d, t), Ri(e, !0), s && Se) {
					let t = () => {
						e.subTree = ci(e), Se(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = ci(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Pi(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Pi(() => ha(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && mr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Pi(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new ke(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Sn(u), Ri(e, !0), l();
	}, le = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, bi(e, t.props, r, n), Ni(e, t.children, n), We(), Tn(e), Ge();
	}, ue = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				fe(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				de(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && _e(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? fe(l, d, n, r, i, a, o, s, c) : _e(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && D(d, n, r, i, a, o, s, c));
	}, de = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? fa(t[p]) : da(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? _e(e, a, o, !0, !1, f) : D(t, r, i, a, o, s, c, l, f);
	}, fe = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? fa(t[u]) : da(t[u]);
			if (ia(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? fa(t[p]) : da(t[p]);
			if (ia(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? fa(t[u]) : da(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) A(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? fa(t[u]) : da(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					A(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && ia(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? A(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Vi(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Wi(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? pe(n, r, p, 2) : _--);
			}
		}
	}, pe = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) pe(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, be);
		else if (c === B) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) pe(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === Yi) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[rr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), Pi(() => l.enter(a), i));
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
	}, A = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (We(), fr(s, null, n, e, !0), Ge()), p != null && (!e.ctx || e.ctx === t) && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !mr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && ha(_, t, e), u & 6) ge(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Fn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, be, r) : l && !l.hasOnce && (a !== B || d > 0 && d & 64) ? _e(l, t, n, !1, !0) : (a === B && d & 384 || !i && u & 16) && _e(c, t, n), r && me(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Pi(() => {
			_ && ha(_, t, e), h && Fn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, me = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === B;
		if (a && !i) {
			he(n, r);
			return;
		}
		if (t === Yi) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? sr(e) : e, c = () => {
			a ? m(n) && he(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, he = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, ge = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Ui(c), Ui(l), r && ae(r), i.stop(), a ? (a.flags |= 8, A(o, e, t, n)) : e.vnode.el && o && (o.transition = e.vnode.transition, A(o, e, t, n)), s && Pi(s, t), Pi(() => {
			e.isUnmounted = !0;
		}, t);
	}, _e = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) A(e[o], t, n, r, i);
	}, ve = (e) => {
		if (e.shapeFlag & 6) return ve(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Wn];
		return n ? h(n) : t;
	}, ye = (e, t, n) => {
		On(() => {
			e == null ? t._vnode && A(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : va());
	}, be = {
		p: v,
		um: A,
		m: pe,
		r: me,
		mt: k,
		mc: D,
		pc: ue,
		pbc: O,
		n: ve,
		o: e
	}, xe, Se;
	return i && ([xe, Se] = i(be)), {
		render: ye,
		hydrate: xe,
		createApp: ti(ye, xe)
	};
}
function Li({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Ri({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function zi(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Bi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = fa(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Bi(t, a)), a.type === qi && (a.patchFlag === -1 && (a = i[e] = fa(a)), a.el = t.el), a.type === Ji && !a.el && (a.el = t.el);
	}
}
function Vi(e) {
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
function Hi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Hi(t);
}
function Ui(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Wi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Wi(t.subTree) : null;
}
var Gi = (e) => e.__isSuspense;
function Ki(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : wn(e);
}
var B = /* @__PURE__ */ Symbol.for("v-fgt"), qi = /* @__PURE__ */ Symbol.for("v-txt"), Ji = /* @__PURE__ */ Symbol.for("v-cmt"), Yi = /* @__PURE__ */ Symbol.for("v-stc"), Xi = [], Zi = null;
function V(e = !1) {
	Xi.push(Zi = e ? null : []);
}
function Qi() {
	Xi.pop(), Zi = Xi[Xi.length - 1] || null;
}
var $i = 1;
function ea(e, t = !1) {
	$i += e, e < 0 && Zi && t && (Zi.hasOnce = !0);
}
function ta(e) {
	return e.dynamicChildren = $i > 0 ? Zi || n : null, Qi(), $i > 0 && Zi && Zi.push(e), e;
}
function H(e, t, n, r, i, a) {
	return ta(U(e, t, n, r, i, a, !0));
}
function na(e, t, n, r, i) {
	return ta(W(e, t, n, r, i, !0));
}
function ra(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function ia(e, t) {
	return e.type === t.type && e.key === t.key;
}
var aa = ({ key: e }) => e ?? null, oa = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Jt(e) || h(e) ? {
	i: jn,
	r: e,
	k: t,
	f: !!n
} : e);
function U(e, t = null, n = null, r = 0, i = null, a = e === B ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && aa(t),
		ref: t && oa(t),
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
	return s ? (pa(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), $i > 0 && !o && Zi && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Zi.push(c), c;
}
var W = sa;
function sa(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Mr) && (e = Ji), ra(e)) {
		let r = la(e, t, !0);
		return n && pa(r, n), $i > 0 && !a && Zi && (r.shapeFlag & 6 ? Zi[Zi.indexOf(e)] = r : Zi.push(r)), r.patchFlag = -2, r;
	}
	if (Fa(e) && (e = e.__vccOpts), t) {
		t = ca(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = A(e)), v(n) && (/* @__PURE__ */ Wt(n) && !d(n) && (n = s({}, n)), t.style = le(n));
	}
	let o = g(e) ? 1 : Gi(e) ? 128 : Gn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return U(e, t, n, r, i, o, a, !0);
}
function ca(e) {
	return e ? /* @__PURE__ */ Wt(e) || vi(e) ? s({}, e) : e : null;
}
function la(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? ma(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && aa(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(oa(t)) : [a, oa(t)] : oa(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== B ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && la(e.ssContent),
		ssFallback: e.ssFallback && la(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && or(u, c.clone(u)), u;
}
function G(e = " ", t = 0) {
	return W(qi, null, e, t);
}
function ua(e, t) {
	let n = W(Yi, null, e);
	return n.staticCount = t, n;
}
function K(e = "", t = !1) {
	return t ? (V(), na(Ji, null, e)) : W(Ji, null, e);
}
function da(e) {
	return e == null || typeof e == "boolean" ? W(Ji) : d(e) ? W(B, null, e.slice()) : ra(e) ? fa(e) : W(qi, null, String(e));
}
function fa(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : la(e);
}
function pa(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), pa(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !vi(t) ? t._ctx = jn : r === 3 && jn && (jn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			pa(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: jn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [G(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function ma(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = A([t.class, r.class]));
		else if (e === "style") t.style = le([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function ha(e, t, n, r = null) {
	un(e, t, 7, [n, r]);
}
var ga = $r(), _a = 0;
function va() {
	return _a;
}
function ya(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || ga, o = {
		uid: _a++,
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
		scope: new Te(!0),
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
		propsOptions: wi(i, a),
		emitsOptions: oi(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ii.bind(null, o), e.ce && e.ce(o), o;
}
var ba = null, xa = () => ba || jn, Sa, Ca;
{
	let e = ce(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Sa = t("__VUE_INSTANCE_SETTERS__", (e) => ba = e), Ca = t("__VUE_SSR_SETTERS__", (e) => Da = e);
}
var wa = (e) => {
	let t = ba;
	return Sa(e), e.scope.on(), () => {
		e.scope.off(), Sa(t);
	};
}, Ta = () => {
	ba && ba.scope.off(), Sa(null);
};
function Ea(e) {
	return e.vnode.shapeFlag & 4;
}
var Da = !1;
function Oa(e, t = !1, n = !1) {
	t && Ca(t);
	let { props: r, children: i } = e.vnode, a = Ea(e);
	yi(e, r, a, t), Mi(e, i, n || t);
	let o = a ? ka(e, t) : void 0;
	return t && Ca(!1), o;
}
function ka(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Ir);
	let { setup: r } = n;
	if (r) {
		We();
		let n = e.setupContext = r.length > 1 ? Na(e) : null, i = wa(e), a = ln(r, e, 0, [e.props, n]), o = y(a);
		if (Ge(), i(), (o || e.sp) && !mr(e) && lr(e), o) {
			if (a.then(Ta, Ta), t) return a.then((n) => {
				Ca(!0);
				try {
					Aa(e, n, t);
				} finally {
					Ca(!1);
				}
			}).catch((t) => {
				dn(t, e, 0);
			});
			e.asyncDep = a;
		} else Aa(e, a, t);
	} else ja(e, t);
}
function Aa(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = $t(t)), ja(e, n);
}
function ja(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = wa(e);
		We();
		try {
			zr(e);
		} finally {
			Ge(), t();
		}
	}
}
var Ma = { get(e, t) {
	return tt(e, "get", ""), e[t];
} };
function Na(e) {
	return {
		attrs: new Proxy(e.attrs, Ma),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Pa(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy($t(Gt(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Pr) return Pr[n](e);
		},
		has(e, t) {
			return t in e || t in Pr;
		}
	}) : e.proxy;
}
function Fa(e) {
	return h(e) && "__vccOpts" in e;
}
var q = (e, t) => /* @__PURE__ */ tn(e, t, Da), Ia = "3.5.44", La = void 0, Ra = typeof window < "u" && window.trustedTypes;
if (Ra) try {
	La = /* @__PURE__ */ Ra.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var za = La ? (e) => La.createHTML(e) : (e) => e, Ba = "http://www.w3.org/2000/svg", Va = "http://www.w3.org/1998/Math/MathML", Ha = typeof document < "u" ? document : null, Ua = Ha && /* @__PURE__ */ Ha.createElement("template"), Wa = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ha.createElementNS(Ba, e) : t === "mathml" ? Ha.createElementNS(Va, e) : n ? Ha.createElement(e, { is: n }) : Ha.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ha.createTextNode(e),
	createComment: (e) => Ha.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ha.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Ua.innerHTML = za(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Ua.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ga = /* @__PURE__ */ Symbol("_vtc");
function Ka(e, t, n) {
	let r = e[Ga];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var qa = /* @__PURE__ */ Symbol("_vod"), Ja = /* @__PURE__ */ Symbol("_vsh"), Ya = /* @__PURE__ */ Symbol(""), Xa = /(?:^|;)\s*display\s*:/;
function Za(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? $a(r, t, "");
			}
			else for (let e in t) n[e] ?? $a(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? $a(r, i, "") : ro(e, i, !g(t) && t ? t[i] : void 0, o) || $a(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Ya];
			e && (n += ";" + e), r.cssText = n, a = Xa.test(n);
		}
	} else t && e.removeAttribute("style");
	qa in e && ((!i || t !== n) && (e[qa] = a ? r.display : ""), e[Ja] && (r.display = "none"));
}
var Qa = /\s*!important$/;
function $a(e, t, n) {
	if (d(n)) n.forEach((n) => $a(e, t, n));
	else if (n ??= "", t.startsWith("--")) Qa.test(n) ? e.setProperty(t, n.replace(Qa, ""), "important") : e.setProperty(t, n);
	else {
		let r = no(e, t);
		Qa.test(n) ? e.setProperty(O(r), n.replace(Qa, ""), "important") : e[r] = n;
	}
}
var eo = [
	"Webkit",
	"Moz",
	"ms"
], to = {};
function no(e, t) {
	let n = to[t];
	if (n) return n;
	let r = D(t);
	if (r !== "filter" && r in e) return to[t] = r;
	r = ne(r);
	for (let n = 0; n < eo.length; n++) {
		let i = eo[n] + r;
		if (i in e) return to[t] = i;
	}
	return t;
}
function ro(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var io = "http://www.w3.org/1999/xlink";
function ao(e, t, n, r, i, a = me(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(io, t.slice(6, t.length)) : e.setAttributeNS(io, t, n) : n == null || a && !he(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function oo(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? za(n) : n);
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
		r === "boolean" ? n = he(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function so(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function co(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var lo = /* @__PURE__ */ Symbol("_vei");
function uo(e, t, n, r, i = null) {
	let a = e[lo] || (e[lo] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = mo(t);
		r ? so(e, n, a[t] = vo(r, i), s) : o && (co(e, n, o, s), a[t] = void 0);
	}
}
var fo = /(Once|Passive|Capture)$/, po = /^on:?(?:Once|Passive|Capture)$/;
function mo(e) {
	let t, n;
	for (; (n = e.match(fo)) && !po.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : O(e.slice(2)), t];
}
var ho = 0, go = /* @__PURE__ */ Promise.resolve(), _o = () => ho ||= (go.then(() => ho = 0), Date.now());
function vo(e, t) {
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
	return n.value = e, n.attached = _o(), n;
}
var yo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, bo = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Ka(e, r, c) : t === "style" ? Za(e, n, r) : a(t) ? o(t) || uo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : xo(e, t, r, c)) ? (oo(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ao(e, t, r, c, s, t !== "value")) : e._isVueCE && (So(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? oo(e, D(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), ao(e, t, r, c));
};
function xo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && yo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return yo(t) && g(n) ? !1 : t in e;
}
function So(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = D(t);
	return Array.isArray(n) ? n.some((e) => D(e) === r) : Object.keys(n).some((e) => D(e) === r);
}
var Co = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => ae(t, e) : t;
};
function wo(e) {
	e.target.composing = !0;
}
function To(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var Eo = /* @__PURE__ */ Symbol("_assign"), Do = /* @__PURE__ */ Symbol("_initialValue");
function Oo(e, t, n) {
	return t && (e = e.trim()), n && (e = oe(e)), e;
}
var J = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Do] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Do] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[Eo] = Co(i);
		let a = r || i.props && i.props.type === "number";
		so(e, t ? "change" : "input", (t) => {
			t.target.composing || e[Eo](Oo(e.value, n, a));
		}), (n || a) && so(e, "change", () => {
			e.value = Oo(e.value, n, a);
		}), t || (so(e, "compositionstart", wo), so(e, "compositionend", To), so(e, "change", To));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Do];
		delete e[Do], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[Eo](Oo(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[Eo] = Co(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? oe(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, ko = {
	deep: !0,
	created(e, t, n) {
		e[Eo] = Co(n), so(e, "change", () => {
			let t = e._modelValue, n = Po(e), r = e.checked, i = e[Eo];
			if (d(t)) {
				let e = xe(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Fo(e, r));
		});
	},
	mounted: Ao,
	beforeUpdate(e, t, n) {
		e[Eo] = Co(n), Ao(e, t, n);
	}
};
function Ao(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = xe(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = be(t, Fo(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var jo = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, so(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? oe(Po(e)) : Po(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[Eo](i);
			} finally {
				bn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[Eo] = Co(r);
	},
	mounted(e, { value: t }) {
		No(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[Eo] = Co(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !Mo(t, n[1], n[0])) && No(e, t);
	}
};
function Mo(e, t, n) {
	if (!n || d(e)) return be(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function No(e, t) {
	let n = e.multiple, r = d(t);
	if (!n || r || p(t)) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = Po(a);
			if (n) {
				if (r) {
					let e = typeof o;
					a.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(o)) : xe(t, o) > -1;
				} else a.selected = t.has(o);
			} else if (be(Po(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function Po(e) {
	return "_value" in e ? e._value : e.value;
}
function Fo(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Io = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Lo = {
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
	exact: (e, t) => Io.some((n) => e[`${n}Key`] && !t.includes(n))
}, Ro = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Lo[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, zo = /* @__PURE__ */ s({ patchProp: bo }, Wa), Bo;
function Vo() {
	return Bo ||= Fi(zo);
}
var Ho = ((...e) => {
	let t = Vo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Wo(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Uo(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Uo(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Wo(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/studio/routes.ts
var Go = [
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
], Ko = "studio.selectedWordId";
function qo() {
	try {
		return localStorage.getItem(Ko) ?? "";
	} catch {
		return "";
	}
}
function Jo() {
	let e = /* @__PURE__ */ F("wakewords"), t = /* @__PURE__ */ F("");
	function n() {
		let [n, r = ""] = location.hash.replace(/^#\/?/, "").split("?");
		e.value = Go.find((e) => e.id === n)?.id ?? "wakewords", t.value = new URLSearchParams(r).get("word") ?? qo();
	}
	n();
	function r(e) {
		return `#/${e}${t.value ? `?${new URLSearchParams({ word: t.value })}` : ""}`;
	}
	function i() {
		try {
			t.value ? localStorage.setItem(Ko, t.value) : localStorage.removeItem(Ko);
		} catch {}
		history.replaceState(null, "", r(e.value));
	}
	let a = R(t, i, { flush: "sync" });
	function o(t) {
		e.value = t, location.hash !== r(t) && history.pushState(null, "", r(t));
	}
	return window.addEventListener("hashchange", n), window.addEventListener("popstate", n), De(() => {
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
var Yo = "/api/studio", Y = encodeURIComponent;
function Xo(e = {}) {
	let t = new URLSearchParams();
	for (let [n, r] of Object.entries(e)) r != null && t.set(n, String(r));
	return t.size ? `?${t}` : "";
}
var Zo = class extends Error {
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
async function Qo(e, t = "GET", n, r) {
	let i;
	try {
		i = await fetch(`${Yo}${e}`, {
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
	if (!i.ok) throw new Zo(i.status);
	if (i.status !== 204) return i.json();
}
function $o(e) {
	return typeof e == "number" && Number.isFinite(e) ? e : null;
}
function es(e) {
	let t = new Map(typeof e == "object" && e && !Array.isArray(e) ? Object.entries(e) : []), n = (e) => $o(t.get(e));
	return {
		recall: n("recall"),
		false_accepts_per_hour: n("false_accepts_per_hour"),
		target_false_accepts_per_hour: n("target_false_accepts_per_hour")
	};
}
var X = (e) => `/wakewords/${Y(e)}`, ts = (e, t) => `${X(e)}/samples/${Y(t)}`, Z = (e, t, n) => Qo(e + Xo(t), "GET", void 0, n), Q = (e, t, n) => Qo(e, "POST", t, n), ns = (e, t, n) => Qo(e, "PUT", t, n), $ = {
	capabilities: (e) => Z("/capabilities", void 0, e),
	migration: (e) => Z("/migration", void 0, e),
	importLegacy: (e, t) => Q("/migration/import", e, t),
	wakewords: (e, t) => Z("/wakewords", e, t),
	wakeword: (e, t) => Z(X(e), void 0, t),
	createWakeword: (e, t) => Q("/wakewords", e, t),
	updateWakeword: (e, t, n) => Qo(X(e), "PATCH", t, n),
	samples: (e, t, n) => Z(`${X(e)}/samples`, t, n),
	queue: (e, t, n) => Z(`${X(e)}/queue`, t, n),
	sample: (e, t, n) => Z(ts(e, t), void 0, n),
	unmapped: (e, t) => Z("/recordings/unmapped", e, t),
	assign: (e, t, n) => Q(`/recordings/${Y(e)}/assign`, { word_id: t }, n),
	importAudio: (e, t, n, r) => {
		let i = new FormData();
		return i.set("audio", t), i.set("label", n), Q(`${X(e)}/samples/import`, i, r);
	},
	label: (e, t, n, r, i) => Q(`${ts(e, t)}/label`, {
		label: n,
		expected_revision: r
	}, i),
	undo: (e, t, n, r) => Q(`${ts(e, t)}/undo`, { expected_revision: n }, r),
	trim: (e, t, n, r, i, a) => Q(`${ts(e, t)}/trim`, {
		start_s: n,
		end_s: r,
		expected_revision: i
	}, a),
	deleteSample: (e, t, n, r) => Qo(`${ts(e, t)}${Xo({ expected_revision: n })}`, "DELETE", void 0, r),
	audioUrl: (e, t, n = !1) => `${Yo}${ts(e, t)}/audio${Xo({ original: n })}`,
	devices: (e) => Z("/devices", void 0, e),
	addDevice: (e, t, n, r) => Q("/devices", {
		url: e,
		token: t,
		role: n
	}, r),
	refreshDevices: (e, t) => Q(`/devices/${Y(e)}/refresh`, void 0, t),
	setCredentials: (e, t, n) => Q(`/devices/${Y(e)}/credentials`, { token: t }, n),
	sourceMappings: (e, t) => Z(`/devices/${Y(e)}/source-mappings`, void 0, t),
	setSourceMapping: (e, t, n) => ns(`/devices/${Y(e)}/source-mappings`, t, n),
	scrape: (e, t) => Q("/scrape", { device_ids: e }, t),
	scrapeRuns: (e, t) => Z("/scrape/runs", e, t),
	schedules: (e) => Z("/schedules", void 0, e),
	saveSchedule: (e, t, n) => ns(`/schedules/${Y(e)}`, t, n),
	jobs: (e, t) => Z("/jobs", e, t),
	enqueueScrape: (e, t) => Q("/jobs", e, t),
	health: (e) => Z("/jobs/health", void 0, e),
	job: (e, t) => Z(`/jobs/${Y(e)}`, void 0, t),
	jobLogs: (e, t = 8192, n) => Z(`/jobs/${Y(e)}/logs`, { limit: t }, n),
	cancelJob: (e, t) => Q(`/jobs/${Y(e)}/cancel`, void 0, t),
	datasets: (e, t, n) => Z(`${X(e)}/datasets`, t, n),
	selectDatasets: (e, t, n) => ns(`${X(e)}/datasets`, { dataset_ids: t }, n),
	downloadDataset: (e, t) => Q(`/datasets/${Y(e)}/download`, void 0, t),
	generationCatalog: (e) => Z("/generation/catalog", void 0, e),
	generationRecipe: (e, t) => Z(`${X(e)}/generation/recipe`, void 0, t),
	saveGenerationRecipe: (e, t, n) => ns(`${X(e)}/generation/recipe`, t, n),
	generate: (e, t) => Q(`${X(e)}/generation/jobs`, void 0, t),
	batches: (e, t, n) => Z(`${X(e)}/generation/batches`, t, n),
	batchSelection: (e, t) => Z(`${X(e)}/generation/selection`, void 0, t),
	batch: (e, t, n) => Z(`${X(e)}/generation/batches/${Y(t)}`, void 0, n),
	selectBatches: (e, t, n) => ns(`${X(e)}/generation/batches`, { batch_ids: t }, n),
	trainingSettings: (e, t) => Z(`${X(e)}/training/settings`, void 0, t),
	saveTrainingSettings: (e, t, n) => ns(`${X(e)}/training/settings`, t, n),
	trainingCounts: (e, t) => Z(`${X(e)}/training/counts`, void 0, t),
	train: (e, t) => Q(`${X(e)}/training/jobs`, void 0, t),
	trainingRuns: (e, t, n) => Z(`${X(e)}/training/runs`, t, n),
	trainingManifest: (e, t, n) => Z(`${X(e)}/training/runs/${Y(t)}`, void 0, n),
	models: (e, t, n) => Z(`${X(e)}/models`, t, n),
	model: (e, t, n) => Z(`${X(e)}/models/${Y(t)}`, void 0, n),
	archiveUrl: (e, t, n) => `${Yo}${X(e)}/models/${Y(t)}/archive${n === void 0 ? "" : `/${Y(n)}`}`,
	deploymentCapabilities: (e) => Z("/deployment/capabilities", void 0, e),
	deploymentStatus: (e, t) => Z(`${X(e)}/deployment/status`, void 0, t),
	deploymentHistory: (e, t, n) => Z(`${X(e)}/deployment/history`, t, n),
	publish: (e, t, n) => Q(`${X(e)}/deployment/publish`, { version_id: t }, n),
	rollback: (e, t, n) => Q(`${X(e)}/deployment/rollback`, { version_id: t }, n)
};
//#endregion
//#region src/studio/workspace.ts
function rs(e) {
	let t = /* @__PURE__ */ F([]), n = e.selectedId, r = /* @__PURE__ */ Yt(null), i = /* @__PURE__ */ Yt(null), a = /* @__PURE__ */ F(!1), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u, d, f = !1, p = "That wakeword is no longer available. Select another workspace.";
	function m(e) {
		let r = t.value.some((t) => t.id === e);
		l.value = r || !e ? "" : p, n.value = r ? e : t.value[0]?.id ?? "";
	}
	async function h() {
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
			e instanceof Zo && e.status === 404 ? (t.value = t.value.filter((e) => e.id !== a), m(t.value[0]?.id ?? ""), l.value = p) : c.value = e instanceof Error ? e.message : "Unable to load this workspace.";
		} finally {
			s() && (o.value = !1);
		}
	}
	async function g() {
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
			m(a || r[0]?.id || ""), a === n.value && await h();
		} catch (t) {
			!f && !e.signal.aborted && (s.value = t instanceof Error ? t.message : "Unable to load workspaces.");
		} finally {
			!f && !e.signal.aborted && (a.value = !1);
		}
	}
	return R(n, () => {
		h();
	}, { flush: "sync" }), De(() => {
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
		load: g,
		select: m,
		refreshSelected: h
	};
}
var is = Symbol("studio-workspace");
function as() {
	let e = Ln(is);
	if (!e) throw Error("useWorkspace requires StudioShell");
	return e;
}
//#endregion
//#region src/studio/pages/WakewordsPage.vue?vue&type=script&setup=true&lang.ts
var os = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, ss = ["disabled"], cs = {
	key: 0,
	class: "studio-card"
}, ls = { class: "grid gap-3 sm:grid-cols-2 mb-4" }, us = { class: "studio-muted text-xs mb-3" }, ds = ["aria-pressed", "onClick"], fs = {
	key: 1,
	role: "status"
}, ps = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, ms = {
	key: 3,
	class: "studio-card mb-4"
}, hs = { class: "grid gap-3 sm:grid-cols-3 text-sm" }, gs = { class: "text-xs" }, _s = {
	key: 0,
	class: "text-xs"
}, vs = {
	key: 4,
	role: "alert",
	class: "studio-note"
}, ys = {
	key: 5,
	role: "status",
	class: "studio-note"
}, bs = {
	class: "studio-card mb-4",
	"aria-labelledby": "legacy-import-heading"
}, xs = {
	key: 0,
	role: "status"
}, Ss = {
	key: 1,
	role: "alert",
	class: "studio-note"
}, Cs = {
	key: 0,
	class: "grid gap-3 mt-3"
}, ws = [
	"name",
	"value",
	"onInput"
], Ts = [
	"name",
	"value",
	"onInput"
], Es = { id: "legacy-workspaces" }, Ds = ["value"], Os = ["disabled"], ks = {
	key: 1,
	role: "status",
	class: "studio-note"
}, As = { class: "grid gap-4 lg:grid-cols-2" }, js = ["disabled"], Ms = ["value"], Ns = ["disabled"], Ps = /* @__PURE__ */ cr({
	__name: "WakewordsPage",
	setup(e) {
		let t = as(), { wakewords: n, selectedId: r, selected: i, summary: a, selectedLoading: o, selectedError: s, loading: c, error: l } = t, u = /* @__PURE__ */ Lt({
			phrase: "",
			language: "en",
			model_id: ""
		}), d = /* @__PURE__ */ Lt({
			phrase: "",
			language: ""
		}), f = /* @__PURE__ */ F(!1), p = /* @__PURE__ */ F(""), m = /* @__PURE__ */ F(""), h = /* @__PURE__ */ F(null), g = /* @__PURE__ */ F(null), _ = /* @__PURE__ */ F(!1), v = /* @__PURE__ */ F(!1), y = /* @__PURE__ */ F(""), b = /* @__PURE__ */ Lt({}), x = /* @__PURE__ */ Lt({}), S, C;
		R(i, (e) => {
			d.phrase = e?.phrase ?? "", d.language = e?.language ?? "";
		}), R(r, () => {
			S?.abort(), f.value = !1, p.value = "", m.value = "";
		});
		async function w() {
			C?.abort();
			let e = new AbortController();
			C = e, _.value = !0, y.value = "";
			try {
				let t = await $.migration(e.signal);
				if (e.signal.aborted) return;
				h.value = t;
				for (let e of t.phrases) b[e] ??= "";
				for (let e of t.models) x[e] ??= "";
			} catch (t) {
				!e.signal.aborted && t instanceof Zo && t.status === 404 ? h.value = null : e.signal.aborted || (y.value = t instanceof Error ? t.message : "Unable to inspect legacy files.");
			} finally {
				C === e && (_.value = !1);
			}
		}
		function ee() {
			let e = h.value;
			return !!(r.value && e && e.phrases.every((e) => b[e] === r.value) && e.models.every((t) => !e.requires_model_assignment || x[t] === r.value));
		}
		async function T() {
			if (!ee() || v.value) return;
			let e = new AbortController();
			C?.abort(), C = e, v.value = !0, y.value = "";
			try {
				let n = await $.importLegacy({
					word_id: r.value,
					phrase_assignments: { ...b },
					model_assignments: { ...x }
				}, e.signal);
				e.signal.aborted || (g.value = n, await t.refreshSelected());
			} catch (t) {
				e.signal.aborted || (y.value = t instanceof Error ? t.message : "Unable to import legacy files.");
			} finally {
				C === e && (v.value = !1);
			}
		}
		w(), De(() => {
			S?.abort(), C?.abort();
		});
		async function E(e) {
			if (f.value) return;
			let i = r.value, a = new AbortController();
			S = a, f.value = !0, m.value = "", p.value = "";
			try {
				let o = e === "create" ? await $.createWakeword({ ...u }, a.signal) : await $.updateWakeword(i, { ...d }, a.signal);
				if (a.signal.aborted || r.value !== i) return;
				t.wakewords.value = e === "create" ? [...n.value, o] : n.value.map((e) => e.id === o.id ? o : e), e === "create" && (u.phrase = "", u.model_id = ""), t.select(o.id), await t.refreshSelected(), a.signal.aborted || (m.value = "Workspace saved.");
			} catch (e) {
				a.signal.aborted || (p.value = e instanceof Error ? e.message : "Unable to save workspace.");
			} finally {
				S === a && (f.value = !1);
			}
		}
		return (e, S) => (V(), H("section", null, [
			U("div", os, [S[9] ||= U("div", null, [U("h1", null, "Wakewords"), U("p", { class: "studio-muted" }, "One workspace. Multiple wakewords. Separate recordings, schedules, and model versions.")], -1), U("button", {
				"data-action": "refresh",
				disabled: I(c),
				onClick: S[0] ||= (e) => I(t).load()
			}, "Refresh workspaces", 8, ss)]),
			!I(c) && !I(l) && !I(n).length ? (V(), H("p", cs, "No wakewords yet. Create your first workspace below.")) : K("", !0),
			U("div", ls, [(V(!0), H(B, null, z(I(n), (e) => (V(), H("article", {
				key: e.id,
				class: A(["studio-card", { "studio-selected": e.id === I(r) }])
			}, [
				U("h2", null, j(e.phrase), 1),
				U("p", us, [G(j(e.language) + " · Model ID: ", 1), U("code", null, j(e.model_id), 1)]),
				U("button", {
					"aria-pressed": e.id === I(r),
					onClick: (n) => I(t).select(e.id)
				}, j(e.id === I(r) ? "Selected workspace" : "Open workspace"), 9, ds)
			], 2))), 128))]),
			I(o) ? (V(), H("p", fs, "Loading selected workspace…")) : K("", !0),
			I(s) ? (V(), H("div", ps, [G(j(I(s)) + " ", 1), U("button", { onClick: S[1] ||= (e) => I(t).refreshSelected() }, "Retry workspace")])) : K("", !0),
			I(a) && I(i) ? (V(), H("div", ms, [U("h2", null, j(I(i).phrase) + " · Overview", 1), U("dl", hs, [
				U("div", null, [S[10] ||= U("dt", { class: "studio-muted" }, "Pending classification", -1), U("dd", null, j(I(a).pending) + " pending", 1)]),
				U("div", null, [
					S[11] ||= U("dt", { class: "studio-muted" }, "Archived models", -1),
					U("dd", null, j(I(a).modelCount) + " versions", 1),
					U("dd", gs, j(I(a).latestModel ? `Latest: ${I(a).latestModel.trained_at}` : "No trained models yet"), 1)
				]),
				U("div", null, [
					S[12] ||= U("dt", { class: "studio-muted" }, "Autotrain", -1),
					U("dd", null, j(I(a).schedule?.enabled ? `${I(a).schedule.cron} · ${I(a).schedule.timezone}` : "Not scheduled"), 1),
					I(a).schedule?.enabled ? (V(), H("dd", _s, "Next: " + j(I(a).schedule.next_run_at), 1)) : K("", !0)
				])
			])])) : K("", !0),
			p.value ? (V(), H("p", vs, j(p.value), 1)) : K("", !0),
			m.value ? (V(), H("p", ys, j(m.value), 1)) : K("", !0),
			U("section", bs, [
				S[13] ||= U("h2", { id: "legacy-import-heading" }, "Legacy import", -1),
				S[14] ||= U("p", { class: "studio-muted text-sm" }, "Inspect former singleton files without changing them, then copy selected content into the chosen workspace with legacy provenance.", -1),
				_.value ? (V(), H("p", xs, "Inspecting legacy inventory…")) : y.value ? (V(), H("p", Ss, [G(j(y.value) + " ", 1), U("button", {
					type: "button",
					onClick: w
				}, "Retry")])) : h.value ? (V(), H(B, { key: 2 }, [
					U("p", null, j(h.value.counts.personal + h.value.counts.negative + h.value.counts.captured) + " audio files · " + j(h.value.counts.models) + " model archives", 1),
					h.value.phrases.length || h.value.models.length ? (V(), H("div", Cs, [
						(V(!0), H(B, null, z(h.value.phrases, (e) => (V(), H("label", { key: e }, [G("Assign legacy phrase “" + j(e) + "” ", 1), U("input", {
							name: `legacy-phrase-${e}`,
							value: b[e],
							list: "legacy-workspaces",
							autocomplete: "off",
							onInput: (t) => b[e] = t.target.value
						}, null, 40, ws)]))), 128)),
						(V(!0), H(B, null, z(h.value.models, (e) => (V(), H("label", { key: e }, [G("Assign legacy model “" + j(e) + "” ", 1), U("input", {
							name: `legacy-model-${e}`,
							value: x[e],
							list: "legacy-workspaces",
							autocomplete: "off",
							onInput: (t) => x[e] = t.target.value
						}, null, 40, Ts)]))), 128)),
						U("datalist", Es, [(V(!0), H(B, null, z(I(n), (e) => (V(), H("option", {
							key: e.id,
							value: e.id
						}, j(e.phrase), 9, Ds))), 128))])
					])) : K("", !0),
					U("button", {
						"data-action": "legacy-import",
						class: "studio-primary mt-3",
						type: "button",
						disabled: !ee() || v.value,
						onClick: T
					}, j(v.value ? "Importing…" : "Import into selected workspace"), 9, Os),
					g.value ? (V(), H("p", ks, "Imported " + j(g.value.imported_samples) + " samples and " + j(g.value.imported_models) + " archived model" + j(g.value.imported_models === 1 ? "" : "s") + ". Originals remain preserved.", 1)) : K("", !0)
				], 64)) : K("", !0)
			]),
			U("div", As, [U("form", {
				"data-form": "create",
				class: "studio-card grid gap-3",
				onSubmit: S[5] ||= Ro((e) => E("create"), ["prevent"])
			}, [
				S[18] ||= U("h2", null, "New wakeword", -1),
				U("label", null, [S[15] ||= G("Display phrase", -1), L(U("input", {
					"onUpdate:modelValue": S[2] ||= (e) => u.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[J, u.phrase]])]),
				U("label", null, [S[16] ||= G("Language", -1), L(U("input", {
					"onUpdate:modelValue": S[3] ||= (e) => u.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[J, u.language]])]),
				U("label", null, [S[17] ||= G("Stable model ID", -1), L(U("input", {
					"onUpdate:modelValue": S[4] ||= (e) => u.model_id = e,
					name: "model_id",
					required: "",
					autocomplete: "off",
					"aria-describedby": "model-id-help"
				}, null, 512), [[J, u.model_id]])]),
				S[19] ||= U("p", {
					id: "model-id-help",
					class: "studio-muted text-xs"
				}, "Set once at creation. Editing the display phrase never renames a deployed model.", -1),
				U("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Create wakeword", 8, js)
			], 32), I(i) ? (V(), H("form", {
				key: 0,
				"data-form": "edit",
				class: "studio-card grid gap-3",
				onSubmit: S[8] ||= Ro((e) => E("edit"), ["prevent"])
			}, [
				U("h2", null, "Edit " + j(I(i).phrase), 1),
				U("label", null, [S[20] ||= G("Display phrase", -1), L(U("input", {
					"onUpdate:modelValue": S[6] ||= (e) => d.phrase = e,
					name: "phrase",
					required: "",
					maxlength: "200",
					autocomplete: "off"
				}, null, 512), [[J, d.phrase]])]),
				U("label", null, [S[21] ||= G("Language", -1), L(U("input", {
					"onUpdate:modelValue": S[7] ||= (e) => d.language = e,
					name: "language",
					required: "",
					autocomplete: "off"
				}, null, 512), [[J, d.language]])]),
				U("label", null, [S[22] ||= G("Stable model ID", -1), U("input", {
					value: I(i).model_id,
					name: "model_id",
					readonly: ""
				}, null, 8, Ms)]),
				S[23] ||= U("p", { class: "studio-muted text-xs" }, "The model ID is immutable. Source mappings are managed separately; changing context never changes a kiosk’s enabled wakewords.", -1),
				U("button", {
					class: "studio-primary justify-self-start",
					disabled: f.value,
					type: "submit"
				}, "Save changes", 8, Ns)
			], 32)) : K("", !0)])
		]));
	}
}), Fs = ["aria-busy"], Is = ["data-ready"], Ls = {
	"data-waveform-status": "",
	class: "studio-muted text-xs",
	"aria-live": "polite"
}, Rs = ["disabled", "aria-label"], zs = ["disabled"], Bs = /* @__PURE__ */ cr({
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
		let r = e, i = n, a = /* @__PURE__ */ F(), o = /* @__PURE__ */ F(), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F("Waveform preview will appear when audio is ready."), d, f, p, m = 0, h = [], g = /* @__PURE__ */ new WeakSet();
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
		function ee() {
			let e = window.AudioContext ?? window.webkitAudioContext;
			if (!e) return null;
			try {
				return new e();
			} catch {
				return null;
			}
		}
		async function T(e, t, n) {
			let r = ee();
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
		async function E() {
			let e = a.value;
			if (e && e.src) try {
				await e.play(), c.value = !0;
			} catch {
				c.value = !1, i("playbackError", "Playback was blocked or unavailable. Use Play to try again.");
			}
		}
		function D() {
			a.value?.pause(), c.value = !1, C();
		}
		function te() {
			c.value ? D() : E();
		}
		function O() {
			a.value && (a.value.currentTime = 0), E();
		}
		async function ne() {
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
				p = URL.createObjectURL(o), a.value && (a.value.src = p), o.arrayBuffer().then((n) => T(n, e, t)).catch(() => {
					!t.signal.aborted && e === m && (u.value = "Waveform preview could not be decoded.");
				}), i("ready"), r.autoplayRequested && await E();
			} catch (n) {
				!t.signal.aborted && e === m && i("playbackError", n instanceof Error ? n.message : "Audio could not be loaded.");
			} finally {
				e === m && (s.value = !1);
			}
		}
		return R(() => [r.sampleId, r.src], () => {
			ne();
		}, { immediate: !0 }), Er(() => {
			m += 1, d?.abort(), b(), S(), v(), x();
		}), t({
			play: E,
			pause: D,
			toggle: te,
			replay: O,
			stop: S
		}), (t, n) => (V(), H("div", {
			class: "studio-audio",
			"aria-busy": s.value
		}, [
			U("audio", {
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
			U("canvas", {
				ref_key: "canvas",
				ref: o,
				"data-waveform": "",
				"data-ready": l.value,
				role: "img",
				"aria-label": "Audio waveform with playback progress",
				width: "240",
				height: "44"
			}, null, 8, Is),
			U("p", Ls, j(u.value), 1),
			U("button", {
				type: "button",
				class: "studio-primary",
				disabled: !e.sampleId || s.value,
				"aria-label": c.value ? "Pause audio" : "Play audio",
				onClick: n[3] ||= (e) => c.value ? D() : E()
			}, j(s.value ? "Loading audio…" : c.value ? "Pause" : "Play"), 9, Rs),
			U("button", {
				type: "button",
				"data-action": "replay",
				disabled: !e.sampleId || s.value,
				"aria-label": "Replay audio",
				onClick: O
			}, "Replay", 8, zs)
		], 8, Fs));
	}
}), Vs = { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, Hs = {
	"data-progress": "",
	class: "studio-muted"
}, Us = { class: "studio-card flex flex-wrap gap-3 mb-4" }, Ws = {
	key: 0,
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Gs = {
	key: 1,
	"data-classify-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, Ks = {
	key: 2,
	class: "studio-card",
	"aria-busy": "true"
}, qs = ["data-sample-id"], Js = { class: "flex flex-wrap justify-between gap-3" }, Ys = { class: "studio-muted text-sm" }, Xs = { class: "studio-muted" }, Zs = { class: "flex flex-wrap gap-2" }, Qs = ["disabled"], $s = ["disabled"], ec = ["disabled"], tc = ["disabled"], nc = ["disabled"], rc = {
	key: 4,
	class: "studio-card"
}, ic = { key: 0 }, ac = { key: 1 }, oc = {
	key: 5,
	class: "studio-card mt-4"
}, sc = ["data-unmapped-id"], cc = ["disabled", "onClick"], lc = {
	key: 6,
	class: "studio-modal-backdrop"
}, uc = {
	"data-dialog": "discard",
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm discard"
}, dc = { class: "flex gap-2" }, fc = ["disabled"], pc = [], mc = /* @__PURE__ */ cr({
	__name: "ClassifyPage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F(/* @__PURE__ */ new Set()), o = /* @__PURE__ */ F(0), s = /* @__PURE__ */ F(0), c = /* @__PURE__ */ F(0), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(!1), d = /* @__PURE__ */ F(""), f = /* @__PURE__ */ F(""), p = /* @__PURE__ */ F(!1), m = /* @__PURE__ */ F(!1), h = /* @__PURE__ */ F(!1), g = /* @__PURE__ */ F(""), _ = /* @__PURE__ */ F(), v, y, b, x = 0, S = 0, C = q(() => r.value.filter((e) => !a.value.has(e.id))), w = q(() => C.value[o.value] ?? null), ee = q(() => w.value ? $.audioUrl(w.value.word_id, w.value.id) : null), T = q(() => c.value);
		function E() {
			_.value?.stop(), r.value = [], i.value = [], a.value = new Set(n.get(t.selectedId.value) ?? []), o.value = 0, s.value = 0, c.value = 0, m.value = !1, h.value = !1, d.value = "", f.value = "";
		}
		function D() {
			x += 1, b && (b.abort(), b = void 0, u.value = !1);
		}
		function te() {
			return {
				limit: 100,
				...g.value ? { near_miss: g.value === "true" } : {}
			};
		}
		async function O(e, n) {
			let r = 0;
			for (;;) {
				let i = await $.queue(e, {
					...te(),
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
			if (C.value.length || l.value) return;
			v?.abort();
			let e = new AbortController();
			v = e;
			let n = ++S, i = t.selectedId.value;
			if (i) {
				l.value = !0;
				try {
					let a = await O(i, e);
					if (e.signal.aborted || n !== S || t.selectedId.value !== i) return;
					r.value = [...new Map(a.items.map((e) => [e.id, e])).values()], s.value = a.total, o.value = 0;
				} catch {
					!e.signal.aborted && n === S && (d.value = "Queue could not be refilled. Retry loading the pending window.");
				} finally {
					!e.signal.aborted && n === S && (l.value = !1);
				}
			}
		}
		async function re() {
			D(), v?.abort();
			let e = new AbortController();
			v = e;
			let n = ++S, a = t.selectedId.value;
			if (E(), a) {
				l.value = !0;
				try {
					let [o, c] = await Promise.all([O(a, e), $.unmapped({ limit: 20 }, e.signal)]);
					if (e.signal.aborted || n !== S || t.selectedId.value !== a) return;
					r.value = o.items, s.value = o.total, i.value = c.items;
				} catch (t) {
					!e.signal.aborted && n === S && (d.value = t instanceof Error ? t.message : "Queue could not be loaded.");
				} finally {
					!e.signal.aborted && n === S && (l.value = !1);
				}
			}
		}
		function ie() {
			let e = w.value;
			e && (r.value = r.value.filter((t) => t.id !== e.id), s.value = Math.max(0, s.value - 1), o.value = Math.min(o.value, Math.max(0, C.value.length - 1)), _.value?.stop(), m.value = p.value, ne());
		}
		async function ae(e) {
			try {
				let t = await $.sample(e.word_id, e.id);
				if (t.label !== "pending") {
					ie();
					return;
				}
				r.value = r.value.map((n) => n.id === e.id ? t : n);
			} catch {}
		}
		async function k(e) {
			let t = w.value;
			if (!t || u.value || h.value) return;
			p.value = !0, u.value = !0, d.value = "";
			let n = new AbortController();
			y?.abort(), y = n;
			try {
				let r = await $.label(t.word_id, t.id, e, t.revision, n.signal);
				if (n.signal.aborted || w.value?.id !== t.id) return;
				pc.push({
					word: t.word_id,
					sample: r
				}), c.value += 1, f.value = `Saved ${e} label.`, ie();
			} catch (e) {
				n.signal.aborted || (e instanceof Error && e.message.includes("conflict") ? (d.value = "This recording changed elsewhere. Review the latest version before saving.", await ae(t)) : d.value = "Label was not saved. Try again; this recording remains in the queue.");
			} finally {
				y === n && (u.value = !1);
			}
		}
		function oe() {
			let e = w.value;
			!e || u.value || l.value || (p.value = !0, a.value = /* @__PURE__ */ new Set([...a.value, e.id]), n.set(e.word_id, a.value), o.value = Math.min(o.value, Math.max(0, C.value.length - 1)), _.value?.stop(), m.value = !1, f.value = "Skipped for this session; this recording remains pending.", ne());
		}
		async function se() {
			if (u.value || !pc.length) return;
			p.value = !0, u.value = !0, d.value = "";
			let e = pc[pc.length - 1], n = new AbortController();
			y?.abort(), y = n;
			try {
				let i = await $.undo(e.word, e.sample.id, e.sample.revision, n.signal);
				if (n.signal.aborted) return;
				pc.pop(), f.value = "Last label restored to pending.", t.selectedId.value === e.word && (r.value = [i, ...r.value.filter((e) => e.id !== i.id)], s.value += 1, c.value = Math.max(0, c.value - 1), o.value = 0, m.value = !1);
			} catch {
				n.signal.aborted || (d.value = "Undo was not saved. Refresh and try again.");
			} finally {
				y === n && (u.value = !1);
			}
		}
		async function ce(e) {
			let n = t.selectedId.value;
			if (u.value || !n) return;
			let a = S, o = ++x, c = new AbortController();
			b?.abort(), b = c, u.value = !0, d.value = "";
			try {
				let l = await $.assign(e.id, n, c.signal);
				if (c.signal.aborted || b !== c || o !== x || a !== S || t.selectedId.value !== n) return;
				i.value = i.value.filter((t) => t.id !== e.id), r.value = [...r.value.filter((e) => e.id !== l.id), l], s.value += 1, f.value = "Recording assigned to this workspace and added to the pending queue.";
			} catch {
				!c.signal.aborted && b === c && o === x && t.selectedId.value === n && (d.value = "Recording could not be assigned.");
			} finally {
				b === c && (b = void 0, u.value = !1);
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
			h.value ? e.key === "Escape" && (e.preventDefault(), h.value = !1) : t === "d" ? (e.preventDefault(), w.value && !u.value && (h.value = !0)) : [
				"p",
				"n",
				" ",
				"r",
				"s",
				"z"
			].includes(t) && (e.preventDefault(), p.value = !0, t === "p" ? k("positive") : t === "n" ? k("negative") : t === " " ? _.value?.toggle() : t === "r" ? _.value?.replay() : t === "s" ? oe() : se());
		}
		return R(t.selectedId, () => {
			re();
		}, { immediate: !0 }), R(g, () => {
			re();
		}), Cr(() => document.addEventListener("keydown", ue)), Er(() => {
			document.removeEventListener("keydown", ue), v?.abort(), y?.abort(), D(), _.value?.stop();
		}), (e, t) => (V(), H("section", null, [
			U("div", Vs, [t[8] ||= U("div", null, [U("h1", null, "Classify"), U("p", { class: "studio-muted" }, "Rapid review stays pending until the server acknowledges each label.")], -1), U("span", Hs, j(s.value) + " pending · " + j(T.value) + " reviewed · " + j(a.value.size) + " skipped", 1)]),
			U("div", Us, [U("label", null, [t[10] ||= G("Recording type", -1), L(U("select", {
				name: "kind",
				"onUpdate:modelValue": t[0] ||= (e) => g.value = e
			}, [...t[9] ||= [
				U("option", { value: "" }, "All pending", -1),
				U("option", { value: "true" }, "Near misses", -1),
				U("option", { value: "false" }, "Activations", -1)
			]], 512), [[jo, g.value]])]), t[11] ||= U("span", { class: "studio-muted text-xs" }, "Press Space once to enable playback; then acknowledged labels play the next clip.", -1)]),
			f.value ? (V(), H("p", Ws, j(f.value), 1)) : K("", !0),
			d.value ? (V(), H("p", Gs, j(d.value), 1)) : K("", !0),
			l.value ? (V(), H("div", Ks, "Loading review queue…")) : w.value ? (V(), H("div", {
				key: 3,
				"data-classify-current": "",
				"data-sample-id": w.value.id,
				class: "studio-card grid gap-4"
			}, [
				U("div", Js, [U("div", null, [U("h2", null, "Recording " + j(w.value.recording?.clip_id ?? w.value.id), 1), U("p", Ys, j(w.value.recording?.device_id ?? w.value.source) + " · " + j(w.value.recording?.near_miss ? "Near miss" : "Activation") + " · " + j(w.value.recording?.timestamp ?? w.value.created_at), 1)]), U("span", Xs, "Revision " + j(w.value.revision), 1)]),
				W(Bs, {
					ref_key: "player",
					ref: _,
					"sample-id": w.value.id,
					src: ee.value,
					"autoplay-requested": m.value,
					onReady: t[1] ||= (e) => m.value = !1,
					onPlaybackError: t[2] ||= (e) => d.value = e
				}, null, 8, [
					"sample-id",
					"src",
					"autoplay-requested"
				]),
				U("div", Zs, [
					U("button", {
						type: "button",
						class: "studio-primary",
						disabled: u.value,
						onClick: t[3] ||= (e) => k("positive")
					}, "Positive (P)", 8, Qs),
					U("button", {
						type: "button",
						disabled: u.value,
						onClick: t[4] ||= (e) => k("negative")
					}, "Negative (N)", 8, $s),
					U("button", {
						type: "button",
						disabled: u.value,
						onClick: oe
					}, "Skip (S)", 8, ec),
					U("button", {
						type: "button",
						disabled: u.value,
						"data-action": "discard",
						onClick: t[5] ||= (e) => h.value = !0
					}, "Discard (D)", 8, tc),
					U("button", {
						type: "button",
						disabled: u.value || !I(pc).length,
						onClick: se
					}, "Undo (Z)", 8, nc)
				]),
				t[12] ||= U("p", {
					"data-shortcuts": "",
					class: "studio-muted text-xs"
				}, "P positive · N negative · Space play/pause · R replay · S skip for this session · Z undo.", -1),
				t[13] ||= U("input", {
					name: "search",
					type: "search",
					"aria-label": "Queue search",
					placeholder: "Shortcuts pause while editing"
				}, null, -1)
			], 8, qs)) : (V(), H("div", rc, [s.value === 0 ? (V(), H("span", ic, "No pending recordings for this workspace.")) : (V(), H("span", ac, "Pending recordings are skipped for this session or the local window needs reloading.")), s.value > 0 ? (V(), H("button", {
				key: 2,
				type: "button",
				onClick: ne
			}, "Retry pending window")) : K("", !0)])),
			i.value.length ? (V(), H("section", oc, [
				t[14] ||= U("h2", null, "Unmapped recordings", -1),
				t[15] ||= U("p", { class: "studio-muted" }, "Assign each recording explicitly; nothing is guessed or dropped.", -1),
				(V(!0), H(B, null, z(i.value, (e) => (V(), H("article", {
					key: e.id,
					"data-unmapped-id": e.id,
					class: "flex flex-wrap justify-between gap-3 py-2"
				}, [U("span", null, j(e.phrase) + " · " + j(e.device_id), 1), U("button", {
					type: "button",
					"data-action": "assign",
					disabled: u.value,
					onClick: (t) => ce(e)
				}, "Assign to this wakeword", 8, cc)], 8, sc))), 128))
			])) : K("", !0),
			h.value ? (V(), H("div", lc, [U("section", uc, [
				t[16] ||= U("h2", null, "Discard this recording?", -1),
				t[17] ||= U("p", null, "Discarding preserves its source tombstone so future collection does not reintroduce it.", -1),
				U("div", dc, [U("button", {
					type: "button",
					"data-action": "confirm-discard",
					class: "studio-primary",
					disabled: u.value,
					onClick: t[6] ||= (e) => {
						h.value = !1, k("discarded");
					}
				}, "Discard recording", 8, fc), U("button", {
					type: "button",
					onClick: t[7] ||= (e) => h.value = !1
				}, "Cancel")])
			])])) : K("", !0)
		]));
	}
});
//#endregion
//#region src/api.ts
async function hc(e, t = {}) {
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
function gc(e) {
	return hc(e);
}
//#endregion
//#region src/trainerStore.ts
var _c = () => ({
	running: !1,
	exit_code: null,
	log_lines: []
}), vc = () => ({
	personal: [],
	negative: [],
	personal_count: 0,
	negative_count: 0
}), yc = /* @__PURE__ */ Lt({
	activeView: "trainer",
	initialized: !1,
	busy: /* @__PURE__ */ new Set(),
	phrase: "",
	language: "en",
	englishAccent: "mixed",
	ttsMode: "hybrid",
	trainOpenWakeWord: !0,
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
	samples: vc(),
	captured: {
		items: [],
		captured_count: 0,
		personal_count: 0,
		negative_count: 0
	},
	training: _c(),
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
		notify_satellites: !0,
		train_openwakeword: !0
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
function bc(e, t) {
	t ? yc.busy.add(e) : yc.busy.delete(e);
}
function xc(e, t = "success") {
	yc.toast = {
		message: String(e || ""),
		tone: t,
		serial: yc.toast.serial + 1
	};
}
async function Sc(e = !1) {
	e || bc("samples", !0);
	try {
		let e = await gc("/api/samples");
		yc.samples = {
			...vc(),
			...e
		};
		for (let e of ["personal", "negative"]) {
			let t = Math.max(0, Math.ceil((yc.samples[e]?.length || 0) / 50) - 1);
			yc.samplePage[e] = Math.min(yc.samplePage[e], t);
		}
		return e;
	} finally {
		e || bc("samples", !1);
	}
}
//#endregion
//#region src/components/AudioTrimModal.vue?vue&type=script&setup=true&lang.ts
var Cc = { class: "legacy-scope" }, wc = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, Tc = { class: "range-grid" }, Ec = ["max"], Dc = ["min"], Oc = {
	class: "modal trim-modal",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Trim audio"
}, kc = { class: "modal-head" }, Ac = {
	key: 0,
	class: "empty-state"
}, jc = { class: "range-grid" }, Mc = ["max"], Nc = ["min", "max"], Pc = { class: "row space" }, Fc = { class: "pill" }, Ic = {
	key: 0,
	class: "pill success"
}, Lc = { class: "row modal-actions" }, Rc = ["disabled"], zc = /* @__PURE__ */ cr({
	__name: "AudioTrimModal",
	props: { studioTarget: {} },
	emits: ["save", "close"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ F(0), a = /* @__PURE__ */ F(1);
		R(() => n.studioTarget, (e) => {
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
		let c = /* @__PURE__ */ F(null), l = /* @__PURE__ */ F(null), u = /* @__PURE__ */ F(0), d = /* @__PURE__ */ F(0), f = /* @__PURE__ */ F(0), p = /* @__PURE__ */ F([]), m = /* @__PURE__ */ F(!1), h = /* @__PURE__ */ F(!1);
		R(() => yc.trimItem, async (e) => {
			if (!e) l.value = null;
			else {
				m.value = !0;
				try {
					let t = `/api/audio/${encodeURIComponent(yc.trimBucket)}/${encodeURIComponent(e.saved_as)}`, n = await fetch(t);
					if (!n.ok) throw Error("Audio could not be loaded.");
					let r = new (window.AudioContext || window.webkitAudioContext)();
					l.value = await r.decodeAudioData(await n.arrayBuffer()), u.value = l.value.duration, d.value = 0, f.value = u.value, await r.close();
					try {
						let t = await hc(`/api/samples/${encodeURIComponent(yc.trimBucket)}/${encodeURIComponent(e.saved_as)}/vad`, { method: "POST" });
						p.value = Array.isArray(t.segments) ? t.segments : [], p.value.length && (d.value = Math.max(0, Number(p.value[0].start || 0)), f.value = Math.min(u.value, Number(p.value[0].end || u.value)));
					} catch {
						p.value = [];
					}
					await bn(), v();
				} catch (e) {
					xc(e instanceof Error ? e.message : "Audio could not be loaded.", "error"), g();
				} finally {
					m.value = !1;
				}
			}
		}, { immediate: !0 }), R([d, f], () => v());
		function g() {
			yc.trimItem = null, l.value = null, p.value = [];
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
			let e = yc.trimItem;
			if (e) {
				h.value = !0;
				try {
					let t = new FormData();
					t.append("file", await b(), "trimmed.wav"), t.append("bucket", yc.trimBucket), t.append("source_file", e.saved_as), t.append("start_time", d.value.toFixed(3)), t.append("end_time", f.value.toFixed(3));
					let n = await hc("/api/samples/trim", {
						method: "POST",
						body: t
					});
					g(), await Sc(!0), xc(n.message || "Trimmed sample saved.");
				} catch (e) {
					xc(e instanceof Error ? e.message : "Trim failed.", "error");
				} finally {
					h.value = !1;
				}
			}
		}
		function S() {
			yc.trimItem && v();
		}
		return window.addEventListener("resize", S), Er(() => window.removeEventListener("resize", S)), (t, n) => (V(), na(er, { to: "body" }, [U("div", Cc, [e.studioTarget ? (V(), H("div", {
			key: 0,
			class: "modal-backdrop",
			onClick: Ro(o, ["self"])
		}, [U("section", wc, [
			U("header", { class: "modal-head" }, [n[4] ||= U("div", null, [U("span", { class: "eyebrow" }, "Studio audio editor"), U("h2", null, "Trim sample")], -1), U("button", {
				type: "button",
				class: "button ghost",
				onClick: o
			}, "Close")]),
			n[7] ||= U("p", { class: "muted" }, "Trimming is non-destructive: the original audio and provenance remain available.", -1),
			U("div", Tc, [U("label", null, [n[5] ||= U("span", null, "Start seconds", -1), L(U("input", {
				"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
				type: "range",
				min: "0",
				max: Math.max(0, a.value - .01),
				step: ".01"
			}, null, 8, Ec), [[
				J,
				i.value,
				void 0,
				{ number: !0 }
			]])]), U("label", null, [n[6] ||= U("span", null, "End seconds", -1), L(U("input", {
				"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
				type: "range",
				min: i.value + .01,
				max: "60",
				step: ".01"
			}, null, 8, Dc), [[
				J,
				a.value,
				void 0,
				{ number: !0 }
			]])])]),
			U("div", { class: "row modal-actions" }, [U("button", {
				type: "button",
				class: "button primary",
				onClick: s
			}, "Save trim"), U("button", {
				type: "button",
				onClick: o
			}, "Cancel")])
		])])) : I(yc).trimItem ? (V(), H("div", {
			key: 1,
			class: "modal-backdrop",
			onClick: Ro(g, ["self"])
		}, [U("section", Oc, [
			U("header", kc, [U("div", null, [n[8] ||= U("span", { class: "eyebrow" }, "Audio editor", -1), U("h2", null, "Trim " + j(I(yc).trimItem.saved_as), 1)]), U("button", {
				type: "button",
				class: "button ghost",
				onClick: g
			}, "Close")]),
			n[9] ||= U("p", { class: "muted" }, "Keep the spoken wake phrase and remove excess silence or noise. VAD markers appear in green.", -1),
			m.value ? (V(), H("div", Ac, "Loading waveform…")) : (V(), H(B, { key: 1 }, [
				U("canvas", {
					ref_key: "canvas",
					ref: c,
					class: "waveform"
				}, null, 512),
				U("div", jc, [U("label", null, [U("span", null, "Start · " + j(d.value.toFixed(2)) + "s", 1), L(U("input", {
					"onUpdate:modelValue": n[2] ||= (e) => d.value = e,
					type: "range",
					min: "0",
					max: Math.max(0, f.value - .01),
					step: ".01"
				}, null, 8, Mc), [[
					J,
					d.value,
					void 0,
					{ number: !0 }
				]])]), U("label", null, [U("span", null, "End · " + j(f.value.toFixed(2)) + "s", 1), L(U("input", {
					"onUpdate:modelValue": n[3] ||= (e) => f.value = e,
					type: "range",
					min: Math.min(u.value, d.value + .01),
					max: u.value,
					step: ".01"
				}, null, 8, Nc), [[
					J,
					f.value,
					void 0,
					{ number: !0 }
				]])])]),
				U("div", Pc, [U("span", Fc, "Selection " + j(Math.max(0, f.value - d.value).toFixed(2)) + "s", 1), p.value.length ? (V(), H("span", Ic, j(p.value.length) + " speech segment" + j(p.value.length === 1 ? "" : "s"), 1)) : K("", !0)]),
				U("div", Lc, [
					U("button", {
						type: "button",
						onClick: y
					}, "Play selection"),
					p.value.length ? (V(), H("button", {
						key: 0,
						type: "button",
						onClick: _
					}, "Select first VAD")) : K("", !0),
					U("button", {
						type: "button",
						class: "button primary",
						disabled: h.value,
						onClick: x
					}, j(h.value ? "Saving…" : "Save trim"), 9, Rc)
				])
			], 64))
		])])) : K("", !0)])]));
	}
}), Bc = {
	class: "studio-pagination",
	"aria-live": "polite"
}, Vc = { class: "flex gap-2" }, Hc = ["disabled"], Uc = ["disabled"], Wc = /* @__PURE__ */ cr({
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
		let n = e, r = t, i = () => n.total === 0 ? 0 : n.offset + 1, a = () => Math.min(n.offset + n.limit, n.total);
		return (t, n) => (V(), H("div", Bc, [U("span", null, j(i()) + "–" + j(a()) + " of " + j(e.total), 1), U("div", Vc, [U("button", {
			type: "button",
			"data-action": "previous-page",
			disabled: e.loading || e.offset === 0,
			onClick: n[0] ||= (t) => r("page", Math.max(0, e.offset - e.limit))
		}, "Previous", 8, Hc), U("button", {
			type: "button",
			"data-action": "next-page",
			disabled: e.loading || e.offset + e.limit >= e.total,
			onClick: n[1] ||= (t) => r("page", e.offset + e.limit)
		}, "Next", 8, Uc)])]));
	}
}), Gc = {
	key: 0,
	"data-samples-status": "",
	class: "studio-note",
	role: "status",
	"aria-live": "polite"
}, Kc = {
	key: 1,
	"data-samples-error": "",
	class: "studio-note",
	role: "alert",
	"aria-live": "assertive"
}, qc = { class: "studio-card grid gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3" }, Jc = ["aria-busy"], Yc = { key: 0 }, Xc = {
	key: 1,
	class: "w-full text-sm"
}, Zc = ["data-row-id"], Qc = {
	key: 0,
	class: "block studio-muted"
}, $c = {
	key: 0,
	class: "block studio-muted"
}, el = { class: "flex flex-wrap gap-1" }, tl = ["onClick"], nl = ["value", "onChange"], rl = ["onClick"], il = ["onClick"], al = { key: 0 }, ol = {
	key: 2,
	class: "studio-modal-backdrop"
}, sl = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Play sample"
}, cl = {
	key: 3,
	class: "studio-modal-backdrop"
}, ll = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm sample deletion"
}, ul = /* @__PURE__ */ cr({
	__name: "SamplesPage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ F([]), r = /* @__PURE__ */ F(0), i = /* @__PURE__ */ F(0), a = /* @__PURE__ */ F(25), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F({
			label: "",
			source: "",
			kind: "",
			after: "",
			before: "",
			search: ""
		}), u = /* @__PURE__ */ F(null), d = /* @__PURE__ */ F(null), f = /* @__PURE__ */ F(null), p = /* @__PURE__ */ F(null), m = /* @__PURE__ */ F("positive"), h, g, _ = 0, v = q(() => ({
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
				return t.signal.aborted || (e instanceof Zo && e.status === 409 ? (await b(), s.value = "This sample changed elsewhere. The current page was reloaded.") : s.value = "Sample changes were not saved. Try again."), null;
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
		async function ee() {
			let e = d.value;
			e && await S((t) => $.deleteSample(e.word_id, e.id, e.revision, t)) !== null && (n.value = n.value.filter((t) => t.id !== e.id), r.value = Math.max(0, r.value - 1), d.value = null, c.value = "Sample removed from this visible library.");
		}
		async function T() {
			p.value ? await S((e) => $.importAudio(t.selectedId.value, p.value, m.value, e)) && (p.value = null, c.value = "Imported audio.", await b()) : s.value = "Choose an audio file to import.";
		}
		function E() {
			i.value = 0, b();
		}
		function D(e) {
			return e.recording?.near_miss ? "close miss" : "activation";
		}
		return R(t.selectedId, () => {
			i.value = 0, b();
		}, { immediate: !0 }), Er(() => {
			h?.abort(), g?.abort();
		}), (e, t) => (V(), H("section", null, [
			t[33] ||= U("div", { class: "flex flex-wrap items-center justify-between gap-3 mb-4" }, [U("div", null, [U("h1", null, "Samples"), U("p", { class: "studio-muted" }, "Searchable library with retained provenance and non-destructive trims.")])], -1),
			c.value ? (V(), H("p", Gc, j(c.value), 1)) : K("", !0),
			s.value ? (V(), H("p", Kc, j(s.value), 1)) : K("", !0),
			U("div", qc, [
				U("label", null, [t[15] ||= G("Label", -1), L(U("select", {
					name: "label",
					"onUpdate:modelValue": t[0] ||= (e) => l.value.label = e,
					onChange: E
				}, [...t[14] ||= [ua("<option value=\"\">All labels</option><option value=\"pending\">Pending</option><option value=\"positive\">Positive</option><option value=\"negative\">Negative</option><option value=\"discarded\">Discarded</option>", 5)]], 544), [[jo, l.value.label]])]),
				U("label", null, [t[17] ||= G("Source", -1), L(U("select", {
					name: "source",
					"onUpdate:modelValue": t[1] ||= (e) => l.value.source = e,
					onChange: E
				}, [...t[16] ||= [
					U("option", { value: "" }, "All sources", -1),
					U("option", { value: "diagnostic" }, "Diagnostic", -1),
					U("option", { value: "import" }, "Import", -1)
				]], 544), [[jo, l.value.source]])]),
				U("label", null, [t[19] ||= G("Kind", -1), L(U("select", {
					name: "kind",
					"onUpdate:modelValue": t[2] ||= (e) => l.value.kind = e,
					onChange: E
				}, [...t[18] ||= [
					U("option", { value: "" }, "All kinds", -1),
					U("option", { value: "true" }, "Close miss", -1),
					U("option", { value: "false" }, "Activation", -1)
				]], 544), [[jo, l.value.kind]])]),
				U("label", null, [t[20] ||= G("After", -1), L(U("input", {
					name: "after",
					"onUpdate:modelValue": t[3] ||= (e) => l.value.after = e,
					type: "date",
					onInput: E
				}, null, 544), [[J, l.value.after]])]),
				U("label", null, [t[21] ||= G("Before", -1), L(U("input", {
					name: "before",
					"onUpdate:modelValue": t[4] ||= (e) => l.value.before = e,
					type: "date",
					onInput: E
				}, null, 544), [[J, l.value.before]])]),
				U("label", null, [t[22] ||= G("Phrase", -1), L(U("input", {
					name: "search",
					"onUpdate:modelValue": t[5] ||= (e) => l.value.search = e,
					type: "search",
					onInput: E
				}, null, 544), [[J, l.value.search]])])
			]),
			U("form", {
				"data-form": "import",
				class: "studio-card mb-4 flex flex-wrap gap-3 items-end",
				onSubmit: Ro(T, ["prevent"])
			}, [
				U("label", null, [t[23] ||= G("Audio", -1), U("input", {
					name: "import-file",
					type: "file",
					accept: "audio/*",
					required: "",
					onChange: t[6] ||= (e) => p.value = e.target.files?.[0] ?? null
				}, null, 32)]),
				U("label", null, [t[25] ||= G("Label", -1), L(U("select", {
					name: "import-label",
					"onUpdate:modelValue": t[7] ||= (e) => m.value = e
				}, [...t[24] ||= [U("option", { value: "positive" }, "Positive", -1), U("option", { value: "negative" }, "Negative", -1)]], 512), [[jo, m.value]])]),
				t[26] ||= U("button", {
					type: "submit",
					class: "studio-primary"
				}, "Import audio", -1)
			], 32),
			U("div", {
				class: "studio-card overflow-x-auto",
				"aria-busy": o.value
			}, [o.value ? (V(), H("p", Yc, "Loading samples…")) : (V(), H("table", Xc, [t[30] ||= U("thead", null, [U("tr", null, [
				U("th", null, "Sample"),
				U("th", null, "Label"),
				U("th", null, "Provenance"),
				U("th", null, "Revision"),
				U("th", null, "Actions")
			])], -1), U("tbody", null, [(V(!0), H(B, null, z(n.value, (e) => (V(), H("tr", {
				key: e.id,
				"data-row-id": e.id
			}, [
				U("td", null, [G(j(e.recording?.clip_id ?? e.id), 1), e.recording ? (V(), H("small", Qc, j(e.recording.phrase) + " · " + j(e.recording.engine) + " · " + j(D(e)), 1)) : K("", !0)]),
				U("td", null, j(e.label), 1),
				U("td", null, [G(j(e.source), 1), e.recording ? (V(), H("small", $c, j(e.recording.device_id), 1)) : K("", !0)]),
				U("td", null, "rev " + j(e.revision), 1),
				U("td", null, [U("div", el, [
					U("button", {
						type: "button",
						"data-action": "play",
						onClick: (t) => f.value = e
					}, "Play", 8, tl),
					U("label", null, [t[28] ||= U("span", { class: "sr-only" }, "Relabel", -1), U("select", {
						"data-action": "relabel",
						value: e.label,
						onChange: (t) => C(e, t)
					}, [...t[27] ||= [
						U("option", { value: "positive" }, "Positive", -1),
						U("option", { value: "negative" }, "Negative", -1),
						U("option", { value: "discarded" }, "Discarded", -1)
					]], 40, nl)]),
					U("button", {
						type: "button",
						"data-action": "trim",
						onClick: (t) => u.value = e
					}, "Trim", 8, rl),
					U("button", {
						type: "button",
						"data-action": "delete",
						onClick: (t) => d.value = e
					}, "Delete", 8, il)
				])])
			], 8, Zc))), 128)), n.value.length ? K("", !0) : (V(), H("tr", al, [...t[29] ||= [U("td", { colspan: "5" }, "No samples match these filters.", -1)]]))])])), W(Wc, {
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
			f.value ? (V(), H("div", ol, [U("section", sl, [W(Bs, {
				"sample-id": f.value.id,
				src: I($).audioUrl(f.value.word_id, f.value.id),
				"autoplay-requested": !0,
				onPlaybackError: t[9] ||= (e) => s.value = e
			}, null, 8, ["sample-id", "src"]), U("button", {
				type: "button",
				onClick: t[10] ||= (e) => f.value = null
			}, "Close player")])])) : K("", !0),
			W(zc, {
				"studio-target": u.value ? {
					wordId: u.value.word_id,
					sampleId: u.value.id,
					revision: u.value.revision,
					src: I($).audioUrl(u.value.word_id, u.value.id)
				} : null,
				onSave: t[11] ||= (e) => w(e),
				onClose: t[12] ||= (e) => u.value = null
			}, null, 8, ["studio-target"]),
			d.value ? (V(), H("div", cl, [U("section", ll, [
				t[31] ||= U("h2", null, "Remove sample?", -1),
				t[32] ||= U("p", null, "This hides the sample but retains provenance and completed-run inputs.", -1),
				U("button", {
					type: "button",
					"data-action": "confirm-delete",
					class: "studio-primary",
					onClick: ee
				}, "Remove"),
				U("button", {
					type: "button",
					"data-action": "cancel-delete",
					onClick: t[13] ||= (e) => d.value = null
				}, "Cancel")
			])])) : K("", !0)
		]));
	}
}), dl = ["data-scope"], fl = { class: "flex items-center gap-2" }, pl = ["disabled"], ml = {
	key: 0,
	class: "studio-muted mt-3"
}, hl = {
	key: 1,
	class: "studio-muted mt-3"
}, gl = {
	key: 2,
	role: "alert",
	class: "studio-note"
}, _l = /* @__PURE__ */ cr({
	__name: "CronEditor",
	props: {
		scope: {},
		schedule: {}
	},
	emits: ["saved"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F("UTC"), o = /* @__PURE__ */ F(!0), s = /* @__PURE__ */ F(null), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(""), u, d = q(() => n.scope === "scrape" ? "Global scrape schedule" : "Training schedule for this wakeword");
		function f(e) {
			s.value = e, i.value = e?.cron ?? "0 2 * * *", a.value = e?.timezone ?? "UTC", o.value = e?.enabled ?? !1;
		}
		R(() => n.schedule, f, { immediate: !0 });
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
		return Er(() => u?.abort()), (t, n) => (V(), H("section", {
			class: "studio-card",
			"data-cron-editor": "",
			"data-scope": e.scope
		}, [
			U("h2", null, j(d.value), 1),
			n[6] ||= U("p", { class: "studio-muted" }, "Standard five-field cron with explicit IANA timezone. The next run below is calculated and validated by the server.", -1),
			U("form", {
				class: "grid gap-3 mt-3",
				onSubmit: Ro(p, ["prevent"])
			}, [
				U("label", null, [n[3] ||= G("Cron", -1), L(U("input", {
					"onUpdate:modelValue": n[0] ||= (e) => i.value = e,
					name: "cron",
					required: "",
					pattern: "\\S+(\\s+\\S+){4}"
				}, null, 512), [[J, i.value]])]),
				U("label", null, [n[4] ||= G("IANA timezone", -1), L(U("input", {
					"onUpdate:modelValue": n[1] ||= (e) => a.value = e,
					name: "timezone",
					required: ""
				}, null, 512), [[J, a.value]])]),
				U("label", fl, [L(U("input", {
					"onUpdate:modelValue": n[2] ||= (e) => o.value = e,
					name: "enabled",
					type: "checkbox"
				}, null, 512), [[ko, o.value]]), n[5] ||= G(" Enabled", -1)]),
				U("button", {
					type: "submit",
					class: "studio-primary",
					disabled: c.value
				}, j(c.value ? "Validating…" : "Save schedule"), 9, pl)
			], 32),
			s.value ? (V(), H("p", ml, [G("Timezone: " + j(s.value.timezone) + " · Server-computed next run: ", 1), U("strong", null, j(s.value.next_run_at), 1)])) : (V(), H("p", hl, "No schedule saved. UTC is the default timezone.")),
			l.value ? (V(), H("p", gl, j(l.value), 1)) : K("", !0)
		], 8, dl));
	}
}), vl = /* @__PURE__ */ F([]), yl = /* @__PURE__ */ F(!1), bl = /* @__PURE__ */ F(""), xl = !1, Sl;
function Cl(e) {
	return e instanceof Error ? e.message : "Unable to load fleet devices.";
}
function wl() {
	async function e(e = !1) {
		if (xl && !e) return;
		Sl?.abort();
		let t = new AbortController();
		Sl = t, yl.value = !0, bl.value = "";
		try {
			let e = await $.devices(t.signal);
			!t.signal.aborted && Sl === t && (vl.value = e, xl = !0);
		} catch (e) {
			!t.signal.aborted && Sl === t && (bl.value = Cl(e));
		} finally {
			Sl === t && (yl.value = !1);
		}
	}
	function t(e) {
		vl.value = vl.value.findIndex((t) => t.id === e.id) < 0 ? [...vl.value, e] : vl.value.map((t) => t.id === e.id ? e : t), xl = !0;
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
		Sl?.abort();
	}
	return {
		devices: /* @__PURE__ */ zt(vl),
		loading: /* @__PURE__ */ zt(yl),
		error: /* @__PURE__ */ zt(bl),
		load: e,
		add: n,
		refresh: r,
		credentials: i,
		abort: a
	};
}
//#endregion
//#region src/studio/components/DeviceRegistry.vue?vue&type=script&setup=true&lang.ts
var Tl = {
	class: "studio-card",
	"data-device-registry": ""
}, El = { class: "flex flex-wrap items-start justify-between gap-3" }, Dl = ["disabled"], Ol = {
	key: 0,
	class: "studio-note",
	role: "status"
}, kl = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, Al = ["disabled"], jl = {
	key: 2,
	class: "studio-muted mt-3"
}, Ml = {
	key: 3,
	class: "mt-4 grid gap-2"
}, Nl = ["data-device-id"], Pl = { class: "studio-muted text-xs" }, Fl = { class: "flex flex-wrap gap-2 items-center" }, Il = ["disabled", "onClick"], Ll = ["onSubmit"], Rl = ["name"], zl = ["disabled"], Bl = {
	key: 0,
	class: "studio-muted"
}, Vl = {
	key: 4,
	class: "studio-muted text-xs mt-3"
}, Hl = /* @__PURE__ */ cr({
	__name: "DeviceRegistry",
	props: { surface: {} },
	emits: ["changed"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = wl(), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F("standalone"), s = /* @__PURE__ */ F(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(""), d = /* @__PURE__ */ F("");
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
				await i.credentials(e.id, n), u.value = "Credentials saved server-side.", m();
			} catch (e) {
				d.value = e instanceof Error ? e.message : "Credentials were not saved.";
			} finally {
				l.value = "";
			}
		}
		return Cr(async () => {
			await i.load(), m();
		}), Er(() => i.abort()), (e, t) => (V(), H("section", Tl, [
			U("div", El, [t[3] ||= U("div", null, [U("h2", null, "Fleet setup"), U("p", { class: "studio-muted" }, "Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.")], -1), U("button", {
				type: "button",
				disabled: I(i).loading.value,
				onClick: t[0] ||= (e) => I(i).load(!0)
			}, "Refresh registry", 8, Dl)]),
			u.value ? (V(), H("p", Ol, j(u.value), 1)) : K("", !0),
			d.value || I(i).error.value ? (V(), H("p", kl, j(d.value || I(i).error.value), 1)) : K("", !0),
			U("form", {
				"data-device-add": "",
				class: "grid gap-3 mt-3",
				onSubmit: Ro(h, ["prevent"])
			}, [
				U("label", null, [t[4] ||= G("Address", -1), L(U("input", {
					"onUpdate:modelValue": t[1] ||= (e) => a.value = e,
					required: "",
					name: "url",
					autocomplete: "url",
					placeholder: "http://kiosk.local:8789"
				}, null, 512), [[J, a.value]])]),
				U("label", null, [t[6] ||= G("Role", -1), L(U("select", {
					"onUpdate:modelValue": t[2] ||= (e) => o.value = e,
					name: "role"
				}, [...t[5] ||= [U("option", { value: "standalone" }, "Standalone", -1), U("option", { value: "leader" }, "Fleet leader", -1)]], 512), [[jo, o.value]])]),
				U("label", null, [t[7] ||= G("Admin token", -1), U("input", {
					ref_key: "tokenInput",
					ref: s,
					required: "",
					name: "token",
					type: "password",
					autocomplete: "new-password"
				}, null, 512)]),
				U("button", {
					type: "submit",
					class: "studio-primary",
					disabled: l.value === "add"
				}, "Add device", 8, Al)
			], 32),
			I(i).loading.value ? (V(), H("p", jl, "Loading registered devices…")) : (V(), H("div", Ml, [(V(!0), H(B, null, z(I(i).devices.value, (e) => (V(), H("article", {
				key: e.id,
				class: "studio-device-row",
				"data-device-id": e.id
			}, [U("div", null, [
				U("strong", null, j(e.id), 1),
				t[8] ||= G(),
				U("span", { class: A(["studio-status", e.role === "follower" ? "studio-status-muted" : "studio-status-neutral"]) }, j(e.role === "follower" ? "Follower" : e.role), 3),
				U("p", Pl, j(p(e)) + " · " + j(e.active ? e.url : "Inactive member"), 1)
			]), U("div", Fl, [
				U("span", { class: A(["studio-status", e.credentials_status === "ready" ? "studio-status-neutral" : "studio-status-warning"]) }, j(e.credentials_status === "ready" ? "Credentials ready" : "Credentials required"), 3),
				U("span", { class: A(["studio-status", e.model_eligible ? "studio-status-neutral" : "studio-status-warning"]) }, j(e.model_eligible ? "Profile covered" : "Not covered"), 3),
				e.role === "leader" ? (V(), H("button", {
					key: 0,
					type: "button",
					disabled: l.value === `refresh:${e.id}`,
					onClick: (t) => g(e)
				}, "Refresh followers", 8, Il)) : K("", !0),
				e.role === "follower" && e.credentials_status !== "ready" ? (V(), H("form", {
					key: 1,
					class: "flex gap-2",
					onSubmit: Ro((t) => _(e), ["prevent"])
				}, [U("input", {
					ref_for: !0,
					ref: (t) => f(e.id, t),
					name: `credentials-${e.id}`,
					type: "password",
					autocomplete: "new-password",
					"aria-label": "Follower admin token"
				}, null, 8, Rl), U("button", {
					type: "submit",
					disabled: l.value === `credentials:${e.id}`
				}, "Save credentials", 8, zl)], 40, Ll)) : K("", !0)
			])], 8, Nl))), 128)), I(i).devices.value.length ? K("", !0) : (V(), H("p", Bl, "No kiosks registered yet."))])),
			n.surface === "deploy" ? (V(), H("p", Vl, "Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.")) : K("", !0)
		]));
	}
}), Ul = { class: "flex flex-wrap items-start justify-between gap-3 mb-4" }, Wl = ["disabled"], Gl = {
	key: 0,
	class: "studio-note",
	role: "status"
}, Kl = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, ql = { class: "studio-card mb-4" }, Jl = {
	key: 0,
	class: "studio-muted"
}, Yl = {
	key: 1,
	class: "grid gap-3"
}, Xl = { class: "studio-muted text-xs" }, Zl = { key: 0 }, Ql = {
	key: 2,
	class: "studio-muted"
}, $l = { class: "studio-card" }, eu = ["data-recording-id"], tu = { class: "studio-muted text-xs" }, nu = ["onUpdate:modelValue"], ru = ["value"], iu = ["disabled", "onClick"], au = {
	key: 0,
	class: "studio-muted"
}, ou = /* @__PURE__ */ cr({
	__name: "ScrapePage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F({}), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(""), d, f, p = 0;
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
		return R(() => t.selectedId.value, () => {
			m();
		}, { immediate: !0 }), Er(() => {
			d?.abort(), f?.abort();
		}), (e, d) => (V(), H("section", null, [
			U("div", Ul, [d[2] ||= U("div", null, [U("h1", null, "Scrape"), U("p", { class: "studio-muted" }, "Collection is global across the fleet. Source phrases are routed only by explicit mappings, never by the selected wakeword.")], -1), U("button", {
				"data-action": "scrape-now",
				type: "button",
				class: "studio-primary",
				disabled: s.value,
				onClick: h
			}, j(s.value ? "Scraping…" : "Scrape now"), 9, Wl)]),
			u.value ? (V(), H("p", Gl, j(u.value), 1)) : K("", !0),
			l.value ? (V(), H("p", Kl, j(l.value), 1)) : K("", !0),
			W(_l, {
				scope: "scrape",
				schedule: n.value,
				class: "mb-4",
				onSaved: d[0] ||= (e) => n.value = e
			}, null, 8, ["schedule"]),
			W(Hl, {
				surface: "scrape",
				class: "mb-4",
				onChanged: d[1] ||= (e) => void m()
			}),
			U("section", ql, [d[4] ||= U("h2", null, "Collection history", -1), o.value ? (V(), H("p", Jl, "Loading scrape history…")) : r.value.length ? (V(), H("div", Yl, [(V(!0), H(B, null, z(r.value, (e) => (V(), H("article", {
				key: e.id,
				class: "studio-history"
			}, [
				U("div", null, [U("strong", null, j(e.id), 1), G(" · " + j(e.status) + " · " + j(e.started_at), 1)]),
				U("p", Xl, "Listed " + j(e.listed) + " · New " + j(e.new) + " · Unmapped " + j(e.unmapped) + " · Failed " + j(e.failed), 1),
				U("ul", null, [(V(!0), H(B, null, z(e.devices, (e) => (V(), H("li", { key: e.device_id }, [
					U("strong", null, j(e.device_id), 1),
					d[3] ||= G(": ", -1),
					U("span", { class: A(["studio-status", e.status === "complete" && e.failed === 0 ? "studio-status-success" : "studio-status-warning"]) }, j(e.status), 3),
					G(" · new " + j(e.new) + " · failed " + j(e.failed), 1),
					e.errors.length ? (V(), H("span", Zl, " · " + j(e.errors.join(", ")), 1)) : K("", !0)
				]))), 128))])
			]))), 128))])) : (V(), H("p", Ql, "No collection runs yet."))]),
			U("section", $l, [
				d[7] ||= U("h2", null, "Unmapped source inbox", -1),
				d[8] ||= U("p", { class: "studio-muted" }, "Map each device + engine source phrase explicitly to a wakeword. Unknown recordings remain here until assigned.", -1),
				(V(!0), H(B, null, z(i.value, (e) => (V(), H("article", {
					key: e.id,
					class: "studio-mapping-row",
					"data-recording-id": e.id
				}, [
					U("div", null, [U("strong", null, j(e.phrase), 1), U("p", tu, j(e.device_id) + " · " + j(e.engine) + " · " + j(e.near_miss ? "Near miss" : "Activation"), 1)]),
					U("label", null, [d[6] ||= G("Source phrase → wakeword", -1), L(U("select", {
						"onUpdate:modelValue": (t) => a.value[e.id] = t,
						name: "mapping-word"
					}, [d[5] ||= U("option", { value: "" }, "Choose wakeword", -1), (V(!0), H(B, null, z(I(t).wakewords.value, (e) => (V(), H("option", {
						key: e.id,
						value: e.id
					}, j(e.phrase), 9, ru))), 128))], 8, nu), [[jo, a.value[e.id]]])]),
					U("button", {
						"data-action": "save-mapping",
						type: "button",
						disabled: !a.value[e.id] || c.value === e.id,
						onClick: (t) => g(e)
					}, "Save mapping", 8, iu)
				], 8, eu))), 128)),
				i.value.length ? K("", !0) : (V(), H("p", au, "No unmapped recordings."))
			])
		]));
	}
}), su = {
	key: 0,
	class: "studio-note",
	role: "status"
}, cu = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, lu = {
	key: 2,
	class: "studio-card mb-4",
	"data-staging-notice": ""
}, uu = {
	class: "studio-note",
	"data-quarantine-notice": "",
	role: "alert"
}, du = { class: "studio-muted" }, fu = { class: "studio-card mb-4" }, pu = {
	key: 0,
	class: "studio-muted"
}, mu = {
	key: 1,
	class: "grid gap-3"
}, hu = ["data-version-id"], gu = { class: "flex flex-wrap justify-between gap-2" }, _u = { class: "studio-muted text-xs" }, vu = {
	key: 0,
	class: "studio-note text-xs"
}, yu = { class: "flex gap-2" }, bu = ["href"], xu = ["disabled", "onClick"], Su = [
	"data-action",
	"disabled",
	"onClick"
], Cu = {
	key: 0,
	class: "studio-muted text-xs"
}, wu = {
	key: 2,
	class: "studio-muted"
}, Tu = { class: "studio-card" }, Eu = ["data-device-status"], Du = {
	key: 0,
	class: "studio-status studio-status-muted"
}, Ou = { class: "studio-muted text-xs" }, ku = { class: "text-xs" }, Au = {
	key: 0,
	class: "studio-muted text-xs"
}, ju = { key: 0 }, Mu = {
	key: 0,
	class: "studio-muted"
}, Nu = {
	key: 3,
	class: "studio-modal-backdrop"
}, Pu = {
	class: "studio-card",
	role: "dialog",
	"aria-modal": "true",
	"aria-label": "Confirm rollback"
}, Fu = { class: "flex gap-2" }, Iu = ["disabled"], Lu = /* @__PURE__ */ cr({
	__name: "DeployPage",
	setup(e) {
		let t = as(), n = wl(), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F(null), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(null), u = /* @__PURE__ */ F(""), d, f, p = 0, m = 0, h = !1, g = q(() => new Map(n.devices.value.map((e) => [e.id, e])));
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
		return R(() => t.selectedId.value, () => {
			f?.abort(), f = void 0, m += 1, u.value = "", l.value = null, c.value = "", x();
		}, { immediate: !0 }), Er(() => {
			h = !0, d?.abort(), f?.abort(), m += 1;
		}), (e, t) => (V(), H("section", null, [
			t[10] ||= U("div", { class: "mb-4" }, [U("h1", null, "Deploy"), U("p", { class: "studio-muted" }, "Archives are immutable dated training outputs. Publication makes files available; it never changes engines, enabled slots, thresholds, or wakeword selections.")], -1),
			c.value ? (V(), H("p", su, j(c.value), 1)) : K("", !0),
			s.value ? (V(), H("p", cu, j(s.value), 1)) : K("", !0),
			a.value ? (V(), H("section", lu, [
				t[3] ||= U("h2", null, "Fleet publication prerequisites", -1),
				U("p", null, j(a.value.notice), 1),
				U("p", uu, [t[2] ||= U("strong", null, "Quarantine warning:", -1), G(" " + j(a.value.quarantine_notice), 1)]),
				t[4] ||= U("p", { class: "studio-muted" }, "Leader-authoritative mirroring and its existing selection propagation apply to eligible followers. Followers are indirect recipients only; the trainer never uploads to them.", -1),
				U("p", du, j(a.value.operator_action), 1)
			])) : K("", !0),
			W(Hl, {
				surface: "deploy",
				class: "mb-4",
				onChanged: t[0] ||= (e) => void x()
			}),
			U("section", fu, [t[5] ||= U("h2", null, "Archived model versions", -1), o.value ? (V(), H("p", pu, "Loading archives…")) : r.value.length ? (V(), H("div", mu, [(V(!0), H(B, null, z(r.value, (e) => (V(), H("article", {
				key: e.id,
				class: "studio-history",
				"data-version-id": e.id
			}, [U("div", gu, [U("div", null, [
				U("strong", null, j(e.id), 1),
				U("p", _u, j(e.trained_at) + " · Run " + j(e.run_id), 1),
				e.origin === "legacy" ? (V(), H("p", vu, "Legacy import · " + j(e.validation_state) + ". Never automatically published. Explicit publication first requires structural TensorFlow validation in the prepared training environment (cli/setup_python_venv); validation failure leaves the archive available without changing the desired version.", 1)) : K("", !0)
			]), U("div", yu, [
				U("a", { href: I($).archiveUrl(e.word_id, e.id) }, "Download archive", 8, bu),
				U("button", {
					type: "button",
					disabled: u.value === e.id,
					onClick: (t) => S(e)
				}, j(e.origin === "legacy" ? "Validate and publish" : "Publish"), 9, xu),
				U("button", {
					type: "button",
					"data-action": `rollback-${e.id}`,
					disabled: u.value === e.id,
					onClick: (t) => l.value = e
				}, "Rollback", 8, Su)
			])]), I(es)(e.metrics).recall === null ? K("", !0) : (V(), H("p", Cu, "Recall " + j(I(es)(e.metrics).recall), 1))], 8, hu))), 128))])) : (V(), H("p", wu, "No archived model versions for this workspace."))]),
			U("section", Tu, [
				t[7] ||= U("h2", null, "Target delivery", -1),
				t[8] ||= U("p", { class: "studio-muted" }, "Desired is the current authoritative archive. Observed distinguishes verified remote files from unverified runtime use.", -1),
				(V(!0), H(B, null, z(i.value, (e) => (V(), H("article", {
					key: e.device_id,
					class: "studio-target-row",
					"data-device-status": e.device_id
				}, [U("div", null, [
					U("strong", null, j(e.device_id), 1),
					t[6] ||= G(),
					g.value.get(e.device_id)?.role === "follower" ? (V(), H("span", Du, "Follower")) : K("", !0),
					U("p", Ou, j(g.value.get(e.device_id)?.leader_id ? `Indirect via ${g.value.get(e.device_id)?.leader_id}` : "Direct leader/standalone target"), 1)
				]), U("div", null, [
					U("span", { class: A(["studio-status", v(e)]) }, j(e.state), 3),
					U("p", ku, "Desired " + j(e.desired_version) + " · Observed " + j(y(e)), 1),
					e.error_code ? (V(), H("p", Au, [G("Retry/error: " + j(e.error_code), 1), e.next_retry ? (V(), H("span", ju, " · next " + j(e.next_retry), 1)) : K("", !0)])) : K("", !0)
				])], 8, Eu))), 128)),
				i.value.length ? K("", !0) : (V(), H("p", Mu, "No publication status yet."))
			]),
			l.value ? (V(), H("div", Nu, [U("section", Pu, [
				t[9] ||= U("h2", null, "Rollback archive?", -1),
				U("p", null, "Republish " + j(l.value.id) + " under the stable model identity. Newer archive entries remain available and no device selection changes.", 1),
				U("div", Fu, [U("button", {
					type: "button",
					class: "studio-primary",
					disabled: u.value === l.value.id,
					onClick: C
				}, "Confirm rollback", 8, Iu), U("button", {
					type: "button",
					"data-action": "cancel-rollback",
					onClick: t[1] ||= (e) => l.value = null
				}, "Cancel")])
			])])) : K("", !0)
		]));
	}
}), Ru = ["data-job-id"], zu = { class: "flex flex-wrap items-center justify-between gap-3" }, Bu = {
	key: 0,
	class: "studio-muted text-xs"
}, Vu = {
	key: 0,
	class: "studio-log",
	"aria-label": "Job log tail"
}, Hu = {
	key: 1,
	class: "studio-muted text-xs"
}, Uu = {
	key: 2,
	class: "studio-note",
	role: "alert"
}, Wu = /* @__PURE__ */ cr({
	__name: "JobConsole",
	props: {
		jobId: {},
		intervalMs: { default: 2e3 },
		logLimit: { default: 8192 }
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(!1), o, s, c = 0, l = q(() => n.value !== null && [
			"complete",
			"failed",
			"cancelled",
			"interrupted"
		].includes(n.value.status)), u = q(() => n.value !== null && [
			"queued",
			"running",
			"cancelling"
		].includes(n.value.status)), d = q(() => r.value.length > t.logLimit ? `…${r.value.slice(-t.logLimit)}` : r.value);
		function f() {
			o?.abort(), o = void 0, s && clearTimeout(s), s = void 0;
		}
		function p(e) {
			!l.value && e === c && (s = setTimeout(() => void m(e), t.intervalMs));
		}
		async function m(e = ++c) {
			f();
			let s = new AbortController();
			o = s, a.value = n.value === null, i.value = "";
			try {
				let [i, a] = await Promise.all([$.job(t.jobId, s.signal), $.jobLogs(t.jobId, t.logLimit, s.signal)]);
				if (s.signal.aborted || e !== c || t.jobId !== i.id) return;
				n.value = i, r.value = a.text, p(e);
			} catch (t) {
				!s.signal.aborted && e === c && (i.value = t instanceof Error ? t.message : "Unable to load job status.");
			} finally {
				!s.signal.aborted && e === c && (a.value = !1);
			}
		}
		async function h() {
			if (!u.value) return;
			o?.abort(), s && clearTimeout(s), s = void 0;
			let e = ++c, r = new AbortController();
			o = r, i.value = "";
			try {
				let i = await $.cancelJob(t.jobId, r.signal);
				!r.signal.aborted && e === c && (n.value = i, l.value || await m(e));
			} catch (t) {
				!r.signal.aborted && e === c && (i.value = t instanceof Error ? t.message : "Unable to cancel job.");
			}
		}
		return R(() => t.jobId, () => {
			f(), n.value = null, r.value = "", m();
		}, { immediate: !0 }), Er(f), (t, r) => (V(), H("section", {
			class: "studio-card mt-3",
			"data-job-id": e.jobId,
			"aria-live": "polite"
		}, [
			U("div", zu, [U("div", null, [U("h3", null, "Job " + j(e.jobId), 1), a.value ? (V(), H("p", Bu, "Loading job state…")) : n.value ? (V(), H("span", {
				key: 1,
				class: A(["studio-status", `studio-status-${n.value.status}`])
			}, j(n.value.status), 3)) : K("", !0)]), u.value ? (V(), H("button", {
				key: 0,
				type: "button",
				"data-action": "cancel-job",
				onClick: h
			}, "Cancel job")) : K("", !0)]),
			d.value ? (V(), H("pre", Vu, j(d.value), 1)) : l.value ? (V(), H("p", Hu, "No retained log output.")) : K("", !0),
			i.value ? (V(), H("p", Uu, j(i.value), 1)) : K("", !0)
		], 8, Ru));
	}
}), Gu = { class: "studio-card" }, Ku = { class: "flex flex-wrap gap-3" }, qu = ["disabled"], Ju = {
	key: 0,
	class: "studio-muted mt-3"
}, Yu = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, Xu = {
	key: 2,
	class: "studio-table mt-3"
}, Zu = { class: "flex flex-wrap justify-between gap-3" }, Qu = { class: "flex items-start gap-2" }, $u = [
	"data-dataset-id",
	"checked",
	"onChange"
], ed = { class: "studio-muted block text-xs" }, td = { class: "studio-muted block text-xs" }, nd = {
	key: 0,
	class: "studio-note block text-xs"
}, rd = ["disabled", "onClick"], id = {
	key: 3,
	class: "studio-muted mt-3"
}, ad = /* @__PURE__ */ cr({
	__name: "NegativeDatasetsPage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ F([]), r = /* @__PURE__ */ F(0), i = /* @__PURE__ */ F(0), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(!1), d = /* @__PURE__ */ F(""), f = /* @__PURE__ */ F([]), p, m, h, g = 0, _ = 0, v = 0, y = q(() => t.selectedId.value), b = q(() => [...s.value].sort());
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
		async function ee(e, t) {
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
					}, [u, d] = await Promise.all([$.datasets(l, c, e.signal), ee(l, e)]);
					if (!x(l, t, e)) return;
					n.value = u.items, r.value = u.total, s.value = new Set(d.map((e) => e.id));
				} catch (n) {
					x(l, t, e) && (d.value = n instanceof Error ? n.message : "Unable to load datasets.");
				} finally {
					x(l, t, e) && (c.value = !1);
				}
			}
		}
		function E(e, t) {
			let n = new Set(s.value);
			t ? n.add(e) : n.delete(e), s.value = n;
		}
		async function D() {
			let e = y.value;
			if (!e) return;
			m?.abort();
			let t = new AbortController();
			m = t;
			let n = ++_, r = b.value;
			l.value = !0, d.value = "";
			try {
				await $.selectDatasets(e, r, t.signal), S(e, n, t) && await T();
			} catch (r) {
				S(e, n, t) && (d.value = r instanceof Error ? r.message : "Dataset selection was not saved.");
			} finally {
				S(e, n, t) && (l.value = !1);
			}
		}
		async function te(e) {
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
		R(y, () => {
			w(), T();
		}, { immediate: !0 }), R(i, () => {
			T();
		}), R(a, () => {
			i.value === 0 ? T() : i.value = 0;
		}), R(o, () => {
			i.value === 0 ? T() : i.value = 0;
		}), Er(() => {
			p?.abort(), m?.abort(), h?.abort();
		});
		function O(e) {
			return e === null ? "Size not published" : `${Math.ceil(e / 1024)} KiB`;
		}
		return (e, t) => (V(), H("section", null, [t[7] ||= U("div", { class: "mb-4" }, [U("h1", null, "Negative Datasets"), U("p", { class: "studio-muted" }, "Classifier-negative inputs are selected per wakeword. Augmentation backgrounds are configured separately and are not classifier datasets.")], -1), U("div", Gu, [
			U("div", Ku, [
				U("label", null, [t[3] ||= G("Search", -1), L(U("input", {
					"onUpdate:modelValue": t[0] ||= (e) => a.value = e,
					name: "dataset-search",
					type: "search",
					placeholder: "Search catalog"
				}, null, 512), [[J, a.value]])]),
				U("label", null, [t[5] ||= G("Installation state", -1), L(U("select", {
					"onUpdate:modelValue": t[1] ||= (e) => o.value = e,
					name: "dataset-status"
				}, [...t[4] ||= [ua("<option value=\"\">All states</option><option value=\"available\">Available</option><option value=\"installed\">Installed</option><option value=\"queued\">Queued</option><option value=\"running\">Running</option><option value=\"failed\">Failed</option><option value=\"selected\">Selected</option>", 7)]], 512), [[jo, o.value]])]),
				U("button", {
					type: "button",
					"data-action": "save-datasets",
					class: "studio-primary",
					disabled: l.value || !y.value,
					onClick: D
				}, j(l.value ? "Saving…" : "Save selection"), 9, qu)
			]),
			t[6] ||= U("p", {
				"data-oww-compatibility": "",
				class: "studio-note mt-3"
			}, [
				G("Current catalog compatibility: "),
				U("strong", null, "mww_mmap"),
				G(" feature tensors are MWW-only and cannot train openWakeWord. OWW requires compatible OWW embeddings plus an evaluation embedding; "),
				U("strong", null, "dinner_party_eval"),
				G(" is evaluation-only, never a training-sampled input.")
			], -1),
			c.value ? (V(), H("p", Ju, "Loading catalog…")) : K("", !0),
			d.value ? (V(), H("p", Yu, j(d.value), 1)) : K("", !0),
			n.value.length ? (V(), H("div", Xu, [(V(!0), H(B, null, z(n.value, (e) => (V(), H("article", {
				key: e.id,
				class: "studio-history"
			}, [U("div", Zu, [U("label", Qu, [U("input", {
				"data-dataset-id": e.id,
				type: "checkbox",
				checked: s.value.has(e.id),
				onChange: (t) => E(e.id, t.target.checked)
			}, null, 40, $u), U("span", null, [
				U("strong", null, j(e.name), 1),
				U("span", ed, j(e.description) + " · " + j(e.source) + " · " + j(e.license), 1),
				U("span", td, j(e.representation) + " / " + j(e.adapter) + " · " + j(e.split) + " · " + j(O(e.installed_bytes ?? e.download_bytes)), 1),
				e.split === "evaluation" ? (V(), H("span", nd, "Evaluation-only: this dataset is not sampled as a training input.")) : K("", !0)
			])]), U("div", null, [U("span", { class: A(["studio-status", `studio-status-${e.status}`]) }, j(e.status), 3), e.status === "available" || e.status === "failed" ? (V(), H("button", {
				key: 0,
				class: "ml-2",
				type: "button",
				disabled: u.value,
				onClick: (t) => te(e)
			}, "Download", 8, rd)) : K("", !0)])]), e.job_id && [
				"queued",
				"running",
				"cancelling"
			].includes(e.status) ? (V(), na(Wu, {
				key: 0,
				"job-id": e.job_id
			}, null, 8, ["job-id"])) : K("", !0)]))), 128))])) : c.value ? K("", !0) : (V(), H("p", id, "No catalog datasets match these filters.")),
			W(Wc, {
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
			(V(!0), H(B, null, z(f.value, (e) => (V(), na(Wu, {
				key: e.id,
				"job-id": e.id
			}, null, 8, ["job-id"]))), 128))
		])]));
	}
}), od = { class: "studio-card" }, sd = {
	"data-generation-phrase": "",
	class: "studio-note"
}, cd = ["value"], ld = ["value"], ud = ["value"], dd = ["value"], fd = ["disabled"], pd = ["value"], md = {
	key: 0,
	value: "mixed"
}, hd = { class: "flex gap-2" }, gd = ["disabled"], _d = ["disabled"], vd = {
	key: 0,
	class: "studio-muted text-xs mt-3"
}, yd = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, bd = { class: "studio-card mt-4" }, xd = { class: "flex justify-between gap-3" }, Sd = ["disabled"], Cd = {
	key: 0,
	class: "studio-muted"
}, wd = { class: "flex items-start gap-2" }, Td = [
	"data-batch-id",
	"checked",
	"disabled",
	"onChange"
], Ed = { class: "studio-muted block text-xs" }, Dd = {
	key: 0,
	class: "studio-note block text-xs"
}, Od = {
	key: 1,
	class: "studio-muted mt-3"
}, kd = /* @__PURE__ */ cr({
	__name: "ArtificialPage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ F([]), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F(0), a = /* @__PURE__ */ F(0), o = /* @__PURE__ */ F({
			language: "en",
			english_accent: "mixed",
			tts_mode: "hybrid",
			samples: 1,
			batch_size: 1
		}), s = /* @__PURE__ */ F(/* @__PURE__ */ new Set()), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(""), d = /* @__PURE__ */ F(null), f, p, m = 0, h = 0, g = !1, _ = q(() => t.selectedId.value), v = q(() => t.selected.value), y = q(() => n.value.find((e) => e.language === o.value.language) ?? null), b = q(() => y.value ? Object.entries(y.value.engines).filter(([, e]) => e.length) : []), x = q(() => !!y.value?.accent_applies && o.value.tts_mode !== "piper");
		function S(e, t, n) {
			return _.value === e && m === t && !n.signal.aborted;
		}
		function C(e, t, n) {
			return _.value === e && h === t && !n.signal.aborted;
		}
		function w() {
			let e = y.value;
			e && (e.engines[o.value.tts_mode].length || (o.value.tts_mode = b.value[0]?.[0] ?? "hybrid"), x.value || (o.value.english_accent = "mixed"));
		}
		function ee() {
			p?.abort(), p = void 0, h += 1, l.value = !1, d.value = null;
		}
		async function T() {
			f?.abort();
			let e = new AbortController();
			f = e;
			let l = ++m, d = _.value;
			if (r.value = [], i.value = 0, u.value = "", d) {
				c.value = !0;
				try {
					let [c, u, f, p] = await Promise.all([
						$.generationCatalog(e.signal),
						$.generationRecipe(d, e.signal).catch((e) => e instanceof Zo && e.status === 404 ? null : Promise.reject(e)),
						$.batches(d, {
							offset: a.value,
							limit: 50
						}, e.signal),
						g ? Promise.resolve(null) : $.batchSelection(d, e.signal)
					]);
					if (!S(d, l, e)) return;
					if (n.value = c, !g) {
						if (u) o.value = u;
						else {
							let e = t.selected.value?.language ?? c[0]?.language ?? "en";
							o.value = {
								language: e,
								english_accent: "mixed",
								tts_mode: "hybrid",
								samples: 1,
								batch_size: 1
							};
						}
						w(), s.value = new Set(p ?? []), g = !0;
					}
					r.value = f.items, i.value = f.total;
				} catch (t) {
					S(d, l, e) && (u.value = t instanceof Error ? t.message : "Unable to load generation settings.");
				} finally {
					S(d, l, e) && (c.value = !1);
				}
			}
		}
		function E(e) {
			o.value.tts_mode = e, w();
		}
		function D(e) {
			o.value.language = e, w();
		}
		function te() {
			return !Number.isInteger(o.value.samples) || o.value.samples < 1 || !Number.isInteger(o.value.batch_size) || o.value.batch_size < 1 ? (u.value = "Sample count and batch size must be positive integers.", !1) : !0;
		}
		async function O(e = !1) {
			let t = _.value;
			if (!t || !te()) return;
			p?.abort();
			let n = new AbortController();
			p = n;
			let r = ++h, i = { ...o.value };
			l.value = !0, u.value = "";
			try {
				let a = await $.saveGenerationRecipe(t, i, n.signal);
				if (!C(t, r, n) || (o.value = a, !e)) return;
				let s = await $.generate(t, n.signal);
				C(t, r, n) && (d.value = s);
			} catch (i) {
				C(t, r, n) && (u.value = i instanceof Error ? i.message : e ? "Generation job was not started." : "Recipe was not saved.");
			} finally {
				C(t, r, n) && (l.value = !1);
			}
		}
		function ne(e, t) {
			if (e.status !== "complete") return;
			let n = new Set(s.value);
			t ? n.add(e.id) : n.delete(e.id), s.value = n;
		}
		async function re() {
			let e = _.value;
			if (!e || !g || c.value) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++h, r = [...s.value];
			l.value = !0;
			try {
				await $.selectBatches(e, r, t.signal), C(e, n, t) && await T();
			} catch (r) {
				C(e, n, t) && (u.value = r instanceof Error ? r.message : "Batch selection was not saved.");
			} finally {
				C(e, n, t) && (l.value = !1);
			}
		}
		return R(_, () => {
			ee(), g = !1, s.value = /* @__PURE__ */ new Set(), o.value = {
				language: v.value?.language ?? "en",
				english_accent: "mixed",
				tts_mode: "hybrid",
				samples: 1,
				batch_size: 1
			}, a.value = 0, T();
		}, { immediate: !0 }), R(a, () => {
			T();
		}), Er(() => {
			f?.abort(), p?.abort();
		}), (e, t) => (V(), H("section", null, [
			t[16] ||= U("div", { class: "mb-4" }, [U("h1", null, "Artificial"), U("p", { class: "studio-muted" }, "Saved generation recipes and retained synthetic batches are separate from human review.")], -1),
			U("div", od, [
				t[14] ||= U("h2", null, "Generation recipe", -1),
				U("p", sd, [t[8] ||= G("Phrase from selected workspace: ", -1), U("strong", null, j(v.value?.phrase ?? "No workspace selected"), 1)]),
				U("form", {
					class: "grid gap-3 mt-3",
					onSubmit: t[6] ||= Ro((e) => O(!1), ["prevent"])
				}, [
					U("label", null, [t[9] ||= G("Language", -1), U("select", {
						name: "language",
						value: o.value.language,
						onChange: t[0] ||= (e) => D(e.target.value)
					}, [(V(!0), H(B, null, z(n.value, (e) => (V(), H("option", {
						key: e.language,
						value: e.language
					}, j(e.name), 9, ld))), 128))], 40, cd)]),
					U("label", null, [t[10] ||= G("Route", -1), U("select", {
						name: "tts-mode",
						value: o.value.tts_mode,
						onChange: t[1] ||= (e) => E(e.target.value)
					}, [(V(!0), H(B, null, z(b.value, ([e, t]) => (V(), H("option", {
						key: e,
						value: e
					}, j(e) + " (" + j(t.join(", ")) + ")", 9, dd))), 128))], 40, ud)]),
					U("label", null, [t[11] ||= G("English accent", -1), L(U("select", {
						name: "english-accent",
						"onUpdate:modelValue": t[2] ||= (e) => o.value.english_accent = e,
						disabled: !x.value
					}, [(V(!0), H(B, null, z(y.value?.english_accents ?? [], (e) => (V(), H("option", {
						key: e.code,
						value: e.code
					}, j(e.label), 9, pd))), 128)), x.value ? K("", !0) : (V(), H("option", md, "Not applicable"))], 8, fd), [[jo, o.value.english_accent]])]),
					U("label", null, [t[12] ||= G("Samples", -1), L(U("input", {
						"onUpdate:modelValue": t[3] ||= (e) => o.value.samples = e,
						name: "samples",
						type: "number",
						min: "1",
						required: ""
					}, null, 512), [[
						J,
						o.value.samples,
						void 0,
						{ number: !0 }
					]])]),
					U("label", null, [t[13] ||= G("Batch size", -1), L(U("input", {
						"onUpdate:modelValue": t[4] ||= (e) => o.value.batch_size = e,
						name: "batch-size",
						type: "number",
						min: "1",
						required: ""
					}, null, 512), [[
						J,
						o.value.batch_size,
						void 0,
						{ number: !0 }
					]])]),
					U("div", hd, [U("button", {
						type: "submit",
						class: "studio-primary",
						disabled: l.value
					}, "Save recipe", 8, gd), U("button", {
						type: "button",
						"data-action": "generate",
						disabled: l.value || !_.value,
						onClick: t[5] ||= (e) => O(!0)
					}, "Generate batch", 8, _d)])
				], 32),
				y.value ? (V(), H("p", vd, "Participating engines are shown from the server capability catalog. Accent applies only where supported; no pronunciation preview is offered.")) : K("", !0),
				u.value ? (V(), H("p", yd, j(u.value), 1)) : K("", !0),
				d.value ? (V(), na(Wu, {
					key: 2,
					"job-id": d.value.id
				}, null, 8, ["job-id"])) : K("", !0)
			]),
			U("div", bd, [
				U("div", xd, [t[15] ||= U("h2", null, "Retained batches", -1), U("button", {
					type: "button",
					disabled: l.value,
					onClick: re
				}, "Save batch selection", 8, Sd)]),
				c.value ? (V(), H("p", Cd, "Loading batches…")) : K("", !0),
				(V(!0), H(B, null, z(r.value, (e) => (V(), H("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [U("label", wd, [U("input", {
					"data-batch-id": e.id,
					type: "checkbox",
					checked: s.value.has(e.id),
					disabled: e.status !== "complete",
					onChange: (t) => ne(e, t.target.checked)
				}, null, 40, Td), U("span", null, [
					U("strong", null, j(e.phrase), 1),
					U("span", Ed, j(e.status) + " · " + j(e.audio.length) + " validated samples · " + j(e.created_at), 1),
					e.status === "complete" ? K("", !0) : (V(), H("span", Dd, "Only complete, atomically committed batches can be selected."))
				])])]))), 128)),
				!c.value && !r.value.length ? (V(), H("p", Od, "No generated batches for this workspace yet.")) : K("", !0),
				W(Wc, {
					total: i.value,
					offset: a.value,
					limit: 50,
					loading: c.value,
					onPage: t[7] ||= (e) => a.value = e
				}, null, 8, [
					"total",
					"offset",
					"loading"
				])
			])
		]));
	}
}), Ad = { class: "studio-card" }, jd = {
	key: 0,
	class: "studio-muted"
}, Md = {
	key: 1,
	class: "studio-summary"
}, Nd = { class: "studio-card mt-4" }, Pd = { class: "grid gap-3 mt-3" }, Fd = { class: "flex items-center gap-2" }, Id = {
	"data-oww-compatibility": "",
	class: "studio-note text-xs"
}, Ld = { class: "flex gap-2" }, Rd = ["disabled"], zd = ["disabled"], Bd = {
	key: 0,
	class: "studio-note mt-3"
}, Vd = {
	key: 1,
	class: "studio-note mt-3",
	role: "alert"
}, Hd = { class: "studio-card mt-4" }, Ud = { class: "flex justify-between gap-3" }, Wd = {
	key: 0,
	class: "studio-note text-xs"
}, Gd = {
	key: 0,
	class: "studio-muted"
}, Kd = /* @__PURE__ */ cr({
	__name: "TrainPage",
	setup(e) {
		let t = as(), n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F({
			training_steps: 4e4,
			train_openwakeword: !1
		}), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F(null), o = /* @__PURE__ */ F([]), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(""), d = /* @__PURE__ */ F(null), f, p, m, h = 0, g = 0, _ = 0, v = q(() => t.selectedId.value), y = q(() => v.value ? `train:${v.value}` : "train:"), b = q(() => [...new Set(o.value.map((e) => `${e.representation}/${e.adapter}`))]);
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
		async function ee(e, t) {
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
						ee(c, e)
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
		function E() {
			return !Number.isInteger(r.value.training_steps) || r.value.training_steps < 1 || r.value.training_steps > 1e7 ? (u.value = "Training steps must be an integer between 1 and 10000000.", !1) : !0;
		}
		async function D() {
			let e = v.value;
			if (!e || !E()) return;
			p?.abort();
			let t = new AbortController();
			p = t;
			let n = ++g, i = { ...r.value };
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
		async function te() {
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
		function O(e) {
			return e.kind === "train" && "skipped" in e.result && e.result.skipped === !0;
		}
		return R(v, () => {
			w(), T();
		}, { immediate: !0 }), Er(() => {
			f?.abort(), p?.abort(), m?.abort();
		}), (e, t) => (V(), H("section", null, [
			t[14] ||= U("div", { class: "mb-4" }, [U("h1", null, "Train"), U("p", { class: "studio-muted" }, "Manual runs always execute. Scheduled runs snapshot inputs when they begin and can skip unchanged fingerprints.")], -1),
			U("div", Ad, [
				t[6] ||= U("h2", null, "Effective inputs for the next snapshot", -1),
				s.value ? (V(), H("p", jd, "Loading effective inputs…")) : n.value ? (V(), H("dl", Md, [
					U("div", null, [t[3] ||= U("dt", null, "Reviewed positives", -1), U("dd", null, j(n.value.positive) + " reviewed positives", 1)]),
					U("div", null, [t[4] ||= U("dt", null, "Reviewed negatives", -1), U("dd", null, j(n.value.negative) + " reviewed negatives", 1)]),
					U("div", null, [t[5] ||= U("dt", null, "Selected artificial", -1), U("dd", null, j(n.value.artificial) + " selected artificial", 1)])
				])) : K("", !0),
				t[7] ||= U("p", { class: "studio-muted text-xs" }, "Only reviewed positive/negative samples and completed selected artificial batches are counted. Pending and discarded recordings are not training inputs.", -1)
			]),
			U("div", Nd, [
				t[12] ||= U("h2", null, "Training parameters", -1),
				U("div", Pd, [
					U("label", null, [t[8] ||= G("Training steps", -1), L(U("input", {
						"onUpdate:modelValue": t[0] ||= (e) => r.value.training_steps = e,
						name: "training-steps",
						type: "number",
						min: "1",
						max: "10000000",
						required: ""
					}, null, 512), [[
						J,
						r.value.training_steps,
						void 0,
						{ number: !0 }
					]])]),
					U("label", Fd, [L(U("input", {
						"onUpdate:modelValue": t[1] ||= (e) => r.value.train_openwakeword = e,
						name: "train-openwakeword",
						type: "checkbox"
					}, null, 512), [[ko, r.value.train_openwakeword]]), t[9] ||= G(" Train optional openWakeWord companion", -1)]),
					U("p", Id, [
						t[10] ||= G("Selected classifier representations: ", -1),
						U("strong", null, j(b.value.join(", ") || "none"), 1),
						t[11] ||= G(". mww_mmap feature tensors are MWW-only and cannot train openWakeWord. OWW needs compatible OWW embeddings plus an evaluation embedding; dinner_party_eval is evaluation-only and is never a training-sampled input. Server preflight remains authoritative.", -1)
					]),
					U("div", Ld, [U("button", {
						type: "button",
						"data-action": "save-training-settings",
						class: "studio-primary",
						disabled: c.value,
						onClick: D
					}, j(c.value ? "Saving…" : "Save parameters"), 9, Rd), U("button", {
						type: "button",
						"data-action": "start-training",
						disabled: !v.value || l.value,
						onClick: te
					}, j(l.value ? "Starting…" : "Start training"), 9, zd)])
				]),
				r.value.train_openwakeword ? (V(), H("p", Bd, "openWakeWord companion requested for this run.")) : K("", !0),
				u.value ? (V(), H("p", Vd, j(u.value), 1)) : K("", !0),
				d.value ? (V(), na(Wu, {
					key: 2,
					"job-id": d.value.id
				}, null, 8, ["job-id"])) : K("", !0)
			]),
			W(_l, {
				scope: y.value,
				schedule: a.value,
				onSaved: t[2] ||= (e) => a.value = e
			}, null, 8, ["scope", "schedule"]),
			U("div", Hd, [
				t[13] ||= U("h2", null, "Run history", -1),
				(V(!0), H(B, null, z(i.value, (e) => (V(), H("article", {
					key: e.id,
					class: "studio-history mt-3"
				}, [
					U("div", Ud, [U("strong", null, j(e.id), 1), U("span", { class: A(["studio-status", `studio-status-${e.status}`]) }, j(e.status), 3)]),
					O(e) ? (V(), H("p", Wd, "Skipped because inputs and configuration were unchanged.")) : K("", !0),
					W(Wu, { "job-id": e.id }, null, 8, ["job-id"])
				]))), 128)),
				!s.value && !i.value.length ? (V(), H("p", Gd, "No training runs for this workspace yet.")) : K("", !0)
			])
		]));
	}
}), qd = { class: "studio-sidebar" }, Jd = { class: "flex items-center justify-between gap-3" }, Yd = ["aria-expanded"], Xd = ["hidden"], Zd = {
	key: 0,
	class: "studio-nav-label"
}, Qd = {
	key: 1,
	class: "studio-nav-label"
}, $d = [
	"href",
	"data-page",
	"aria-current",
	"onClick"
], ef = { class: "studio-main" }, tf = { class: "studio-header flex flex-wrap items-center justify-between gap-3" }, nf = { class: "studio-muted text-xs" }, rf = {
	class: "flex items-center gap-3 text-xs",
	for: "studio-word"
}, af = ["value", "disabled"], of = {
	key: 0,
	value: ""
}, sf = ["value"], cf = {
	key: 0,
	role: "status",
	class: "studio-note"
}, lf = {
	key: 1,
	class: "studio-note",
	role: "alert"
}, uf = {
	key: 2,
	role: "status"
}, df = /* @__PURE__ */ cr({
	__name: "StudioShell",
	setup(e) {
		let t = Jo(), n = rs(t);
		In(is, n);
		let { wakewords: r, selectedId: i, selected: a, loading: o, error: s, notice: c } = n, l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(!1), d = /* @__PURE__ */ F(), f = /* @__PURE__ */ F(), p = q(() => Go.find((e) => e.id === t.page.value)), m = q(() => u.value && !l.value), h = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 650px)") : null;
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
		return R(u, (e) => {
			e || (l.value = !1);
		}), g(), h?.addEventListener ? h.addEventListener("change", g) : h?.addListener(g), Cr(() => {
			document.addEventListener("keydown", v), n.load();
		}), Er(() => {
			document.removeEventListener("keydown", v), h?.removeEventListener ? h.removeEventListener("change", g) : h?.removeListener(g);
		}), (e, a) => (V(), H("div", { class: A(["studio-app", { "is-narrow": u.value }]) }, [
			U("a", {
				class: "studio-skip",
				href: "#studio-content",
				onClick: a[0] ||= Ro((e) => f.value?.focus(), ["prevent"])
			}, "Skip to content"),
			U("aside", qd, [
				U("div", Jd, [a[3] ||= U("div", { class: "studio-brand" }, [G("◈ Wakeword Studio"), U("small", null, "LISTEN · REFINE · DEPLOY")], -1), u.value ? (V(), H("button", {
					key: 0,
					ref_key: "toggle",
					ref: d,
					type: "button",
					class: "studio-menu",
					"aria-controls": "studio-navigation",
					"aria-expanded": l.value,
					onClick: a[1] ||= (e) => l.value = !l.value
				}, "Menu", 8, Yd)) : K("", !0)]),
				U("nav", {
					id: "studio-navigation",
					"aria-label": "Main navigation",
					hidden: m.value
				}, [(V(!0), H(B, null, z(I(Go), (e, n) => (V(), H(B, { key: e.id }, [
					n === 1 ? (V(), H("div", Zd, "Data")) : K("", !0),
					n === 6 ? (V(), H("div", Qd, "Models")) : K("", !0),
					U("a", {
						href: I(t).href(e.id),
						"data-page": e.id,
						class: A({
							active: p.value.id === e.id,
							"studio-sub": e.group === "Data"
						}),
						"aria-current": p.value.id === e.id ? "page" : void 0,
						onClick: Ro((t) => y(e.id), ["prevent"])
					}, j(e.name), 11, $d)
				], 64))), 128))], 8, Xd),
				a[4] ||= U("p", { class: "studio-sidebar-note" }, [
					G("Independent workspaces."),
					U("br"),
					G("Device selections stay unchanged.")
				], -1)
			]),
			U("div", ef, [U("header", tf, [U("div", nf, j(p.value.group) + " / " + j(p.value.name), 1), U("label", rf, [a[5] ||= G("WAKEWORD ", -1), U("select", {
				id: "studio-word",
				value: I(i),
				disabled: !I(r).length,
				onChange: a[2] ||= (e) => I(n).select(e.target.value)
			}, [I(r).length ? K("", !0) : (V(), H("option", of, "No wakewords")), (V(!0), H(B, null, z(I(r), (e) => (V(), H("option", {
				key: e.id,
				value: e.id
			}, j(e.phrase), 9, sf))), 128))], 40, af)])]), U("main", {
				id: "studio-content",
				ref_key: "content",
				ref: f,
				class: "studio-content",
				tabindex: "-1"
			}, [
				I(c) ? (V(), H("p", cf, j(I(c)), 1)) : K("", !0),
				I(s) ? (V(), H("div", lf, j(I(s)), 1)) : K("", !0),
				I(o) ? (V(), H("p", uf, "Loading workspaces…")) : K("", !0),
				p.value.id === "wakewords" ? (V(), na(Ps, { key: 3 })) : p.value.id === "classify" ? (V(), na(mc, { key: 4 })) : p.value.id === "samples" ? (V(), na(ul, { key: 5 })) : p.value.id === "scrape" ? (V(), na(ou, { key: 6 })) : p.value.id === "deploy" ? (V(), na(Lu, { key: 7 })) : p.value.id === "negative-datasets" ? (V(), na(ad, { key: 8 })) : p.value.id === "artificial" ? (V(), na(kd, { key: 9 })) : p.value.id === "train" ? (V(), na(Kd, { key: 10 })) : K("", !0)
			], 512)])
		], 2));
	}
}), ff = /* @__PURE__ */ cr({
	__name: "TrainerApp",
	setup(e) {
		return (e, t) => (V(), na(df));
	}
}), pf = document.getElementById("trainer-app");
if (!pf) throw Error("Missing #trainer-app mount point");
Ho(ff).mount(pf);
//#endregion

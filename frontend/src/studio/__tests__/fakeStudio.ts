import { vi } from "vitest";
import type { Device, Job, Recording, Sample } from "../types";

export const words = [
  {
    id: "a",
    phrase: "Hey Cedar",
    language: "en",
    model_id: "cedar",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "b",
    phrase: "Okay Maple",
    language: "en",
    model_id: "maple",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];
export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const page = <T>(items: T[], offset: number, limit: number) => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
  offset,
  limit,
});

export function recording(id: string, extra: Partial<Recording> = {}): Recording {
  return {
    id,
    device_id: "kiosk-1",
    clip_id: `clip-${id}`,
    timestamp: "2026-03-01T10:00:00Z",
    phrase: "hey cedar",
    engine: "mww",
    near_miss: false,
    scores: { probability: 0.91 },
    metadata: { duration_s: 1 },
    audio_id: `audio-${id}`,
    original_hash: `o-${id}`,
    normalized_hash: `n-${id}`,
    family_id: `f-${id}`,
    word_id: null,
    quarantined: false,
    created_at: "2026-03-01T10:00:00Z",
    ...extra,
  };
}
export function sample(id: string, word: string, label = "pending", extra: Partial<Sample> = {}): Sample {
  return {
    id,
    word_id: word,
    recording_id: `r-${id}`,
    audio_id: `audio-${id}`,
    original_hash: `o-${id}`,
    normalized_hash: `n-${id}`,
    family_id: `f-${id}`,
    label,
    revision: 0,
    source: "diagnostic",
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-01T10:00:00Z",
    recording: recording(`r-${id}`, { word_id: word }),
    ...extra,
  };
}
/** 16 kHz mono PCM16 WAV of the given duration. */
/** Text as rendered: templates keep their formatting whitespace, which the browser collapses. */
export function visibleText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function wav(seconds: number): Uint8Array {
  const frames = Math.round(seconds * 16000);
  const out = new DataView(new ArrayBuffer(44 + frames * 2));
  const text = (offset: number, value: string) =>
    [...value].forEach((c, i) => out.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  out.setUint32(4, 36 + frames * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, 16000, true);
  out.setUint32(28, 32000, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  text(36, "data");
  out.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) out.setInt16(44 + i * 2, Math.round(Math.sin(i / 8) * 8000), true);
  return new Uint8Array(out.buffer);
}

export interface Req {
  method: string;
  path: string;
  url: URL;
  body: unknown;
  signal?: AbortSignal | null;
}
interface Hold {
  match: (r: Req) => boolean;
  gate: Promise<void>;
  used: boolean;
  respond?: () => Response;
}

export function fakeStudio() {
  const db = {
    devices: [] as Device[],
    samples: [] as Sample[],
    unmapped: [] as Recording[],
    jobs: [] as Job[],
    history: new Map<string, { label: string; audio_id: string }[]>(),
    audio: (id: string): Response => new Response(`audio:${id}`, { headers: { "Content-Type": "audio/wav" } }),
  };
  const requests: Req[] = [];
  const holds: Hold[] = [];
  const failures: { match: (r: Req) => boolean; status: number }[] = [];
  let created = 0;

  /** Defer a matching request until `release()`; the transport ignores abort, like a real slow network. */
  function hold(match: (r: Req) => boolean, respond?: () => Response) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    holds.push({ match, gate, used: false, respond });
    return { release, request: () => requests.find(match) };
  }
  function failNext(match: (r: Req) => boolean, status: number) {
    failures.push({ match, status });
  }
  const find = (word: string, id: string) => db.samples.find((s) => s.id === id && s.word_id === word);
  function filtered(word: string, q: URLSearchParams) {
    return db.samples.filter(
      (s) =>
        s.word_id === word &&
        (!q.get("label") || s.label === q.get("label")) &&
        (!q.get("source") || s.source === q.get("source")) &&
        (!q.get("near_miss") || String(s.recording?.near_miss ?? false) === q.get("near_miss")) &&
        (!q.get("search") || (s.recording?.phrase ?? "").includes(q.get("search")!)),
    );
  }
  function revisionError(s: Sample | undefined, expected: unknown) {
    if (!s) return json({ detail: "Studio record not found" }, 404);
    if (s.revision !== expected) return json({ detail: "Stale sample revision" }, 409);
    return undefined;
  }
  function route(r: Req): Response {
    const p = r.url.pathname.replace(/^\/api\/studio/, "");
    const q = r.url.searchParams;
    const off = Number(q.get("offset") ?? 0),
      lim = Number(q.get("limit") ?? 50);
    let m: RegExpMatchArray | null;
    if (p === "/devices") return json(db.devices);
    if (p === "/wakewords") return json(page(words, 0, 100));
    if (p === "/schedules") return json([]);
    if (p === "/jobs") {
      const active = (job: Job) => ["queued", "running", "cancelling"].includes(job.status);
      const items =
        q.get("state") === "active"
          ? db.jobs.filter(active)
          : q.get("state") === "history"
            ? db.jobs
                .filter((j) => !active(j))
                .slice()
                .reverse()
            : db.jobs;
      return json(page(items, off, lim));
    }
    if ((m = p.match(/^\/jobs\/([^/]+)(?:\/(logs|cancel))?$/))) {
      const job = db.jobs.find((j) => j.id === m![1]);
      if (!job) return json({}, 404);
      if (m[2] === "logs") return json({ text: "Training in progress" });
      if (m[2] === "cancel") job.status = "cancelled";
      return json(job);
    }
    if (p === "/recordings/unmapped") return json(page(db.unmapped, off, lim));
    if ((m = p.match(/^\/recordings\/([^/]+)\/assign$/))) {
      const rec = db.unmapped.find((x) => x.id === m![1]);
      if (!rec) return json({}, 404);
      db.unmapped = db.unmapped.filter((x) => x !== rec);
      const word = (r.body as { word_id: string }).word_id;
      const s = sample(`from-${rec.id}`, word, "pending", {
        recording_id: rec.id,
        recording: { ...rec, word_id: word },
      });
      db.samples.push(s);
      return json(s);
    }
    if ((m = p.match(/^\/wakewords\/([^/]+)$/))) {
      const w = words.find((x) => x.id === m![1]);
      return w ? json(w) : json({}, 404);
    }
    if ((m = p.match(/^\/wakewords\/([^/]+)\/models$/))) return json(page([], 0, 1));
    if ((m = p.match(/^\/wakewords\/([^/]+)\/queue$/))) {
      q.set("label", "pending");
      return json(page(filtered(m[1], q), off, lim));
    }
    if ((m = p.match(/^\/wakewords\/([^/]+)\/samples$/))) return json(page(filtered(m[1], q), off, lim));
    if ((m = p.match(/^\/wakewords\/([^/]+)\/samples\/capture(?:\/(preview))?$/))) {
      if (m[2]) return json({ duration_s: 3, start_s: 0.2, end_s: 2.8, trim_method: "silero", warning: null });
      const form = r.body as FormData;
      const s = sample(`capture-${++created}`, m[1], String(form.get("label")), {
        source: "microphone",
        recording_id: null,
        recording: null,
      });
      db.samples.push(s);
      return json(s, 201);
    }
    if ((m = p.match(/^\/wakewords\/([^/]+)\/samples\/import$/))) {
      const form = r.body as FormData;
      const s = sample(`import-${++created}`, m[1], String(form.get("label")), {
        source: "import",
        recording_id: null,
        recording: null,
      });
      db.samples.push(s);
      return json(s, 201);
    }
    if ((m = p.match(/^\/wakewords\/([^/]+)\/samples\/([^/]+)(?:\/(label|undo|trim|audio))?$/))) {
      const [, word, id, action] = m;
      const s = find(word, id);
      const body = r.body as Record<string, unknown> | undefined;
      if (action === "audio") return s ? db.audio(id) : json({}, 404);
      if (!action && r.method === "GET") return s ? json(s) : json({}, 404);
      if (!action && r.method === "DELETE") {
        const error = revisionError(s, Number(q.get("expected_revision")));
        if (error) return error;
        db.samples = db.samples.filter((x) => x !== s);
        return new Response(null, { status: 204 });
      }
      const error = revisionError(s, body?.expected_revision);
      if (error || !s) return error!;
      const history = db.history.get(id) ?? [];
      if (action === "undo") {
        const previous = history.pop();
        if (!previous) return json({}, 409);
        Object.assign(s, previous, { revision: s.revision + 1 });
      } else {
        history.push({ label: s.label, audio_id: s.audio_id });
        if (action === "label") s.label = String(body!.label);
        else s.audio_id = `${s.audio_id}-trim`;
        s.revision += 1;
      }
      db.history.set(id, history);
      return json(structuredClone(s));
    }
    return json({ detail: `unhandled ${r.method} ${p}` }, 500);
  }
  const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(String(input), "http://localhost");
    const method = init?.method ?? "GET";
    const body = init?.body instanceof FormData ? init.body : init?.body ? JSON.parse(String(init.body)) : undefined;
    const r: Req = { method, path: url.pathname + url.search, url, body, signal: init?.signal };
    requests.push(r);
    const held = holds.find((h) => !h.used && h.match(r));
    if (held) {
      held.used = true;
      await held.gate;
      if (held.respond) return held.respond();
    }
    const failure = failures.findIndex((f) => f.match(r));
    if (failure >= 0) {
      const [f] = failures.splice(failure, 1);
      return json({ detail: "secret upstream body" }, f.status);
    }
    return route(r);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { db, requests, hold, failNext, mutations: () => requests.filter((r) => r.method !== "GET") };
}

/** jsdom has no media playback or object URLs; record calls and resolve `play()` unless told otherwise. */
export function fakeMedia() {
  const blobs = new Map<string, Blob>();
  const revoked: string[] = [];
  const plays: string[] = [];
  const pauses: string[] = [];
  let next: () => Promise<void> = () => Promise.resolve();
  let count = 0;
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn((blob: Blob) => {
      const url = `blob:test/${++count}`;
      blobs.set(url, blob);
      return url;
    }),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn((url: string) => {
      revoked.push(url);
    }),
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    plays.push(this.getAttribute("src") ?? "");
    return next();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    pauses.push(this.getAttribute("src") ?? "");
  });
  return {
    blobs,
    revoked,
    plays,
    pauses,
    /** Text content of each created object URL, in creation order. */
    async contents() {
      return Promise.all([...blobs].map(async ([url, blob]) => [url, await blob.text()] as const));
    },
    rejectPlay(name = "NotAllowedError") {
      next = () => Promise.reject(new DOMException("blocked", name));
    },
    resolvePlay() {
      next = () => Promise.resolve();
    },
  };
}

export function press(key: string, options: KeyboardEventInit = {}, target: EventTarget = document.body) {
  const event = new KeyboardEvent("keydown", {
    key,
    code: key === " " ? "Space" : `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  target.dispatchEvent(event);
  return event;
}

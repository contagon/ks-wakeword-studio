import type { EnqueueScrapeJob, ModelMetrics, ScrapeJob, Page, Wakeword, CreateWakeword, UpdateWakeword, Device, SourceMapping, Recording, Sample, SampleQuery, Pagination, CollectionRun, Schedule, ScheduleInput, Job, WorkerHealth, Dataset, GenerationRecipe, GenerationCapability, Batch, TrainingSettings, TrainingCounts, RunManifest, ModelVersion, Publication, DeploymentCapabilities } from "./types";

const base = "/api/studio";
const segment = encodeURIComponent;
type Query = object;
function query(values: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== null) params.set(key, String(value));
  return params.size ? `?${params}` : "";
}
export class StudioApiError extends Error {
  constructor(public readonly status: number) {
    super(({ 401: "Kiosk admin credentials required.", 403: "Kiosk admin credentials required.", 404: "Studio record no longer available.", 409: "Studio record conflict. Refresh and try again.", 422: "Invalid studio request. Check the supplied values.", 502: "Kiosk rejected the request.", 503: "Kiosk unavailable." } as Record<number, string>)[status] ?? "Studio request failed. Try again.");
  }
}
/** Do not surface raw remote error bodies (which may contain secrets). */
async function request<T>(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method, signal, credentials: "same-origin",
      ...(body instanceof FormData ? { body } : body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Unable to reach the studio. Check your connection and retry.");
  }
  if (!response.ok) throw new StudioApiError(response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
function finiteOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
/** Narrow opaque archived calibration metrics; never trust shape or render unknown keys. */
export function readModelMetrics(metrics: unknown): ModelMetrics {
  const values = new Map<string, unknown>(typeof metrics === "object" && metrics !== null && !Array.isArray(metrics) ? Object.entries(metrics) : []);
  const field = (key: keyof ModelMetrics) => finiteOrNull(values.get(key));
  return { recall: field("recall"), false_accepts_per_hour: field("false_accepts_per_hour"), target_false_accepts_per_hour: field("target_false_accepts_per_hour") };
}
const wordPath = (id: string) => `/wakewords/${segment(id)}`;
const samplePath = (word: string, id: string) => `${wordPath(word)}/samples/${segment(id)}`;
const get = <T>(path: string, params?: Query, signal?: AbortSignal) => request<T>(path + query(params), "GET", undefined, signal);
const post = <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, "POST", body, signal);
const put = <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>(path, "PUT", body, signal);

export const studioApi = {
  wakewords: (params?: Pagination, signal?: AbortSignal) => get<Page<Wakeword>>("/wakewords", params, signal),
  wakeword: (id: string, signal?: AbortSignal) => get<Wakeword>(wordPath(id), undefined, signal),
  createWakeword: (body: CreateWakeword, signal?: AbortSignal) => post<Wakeword>("/wakewords", body, signal),
  updateWakeword: (id: string, body: UpdateWakeword, signal?: AbortSignal) => request<Wakeword>(wordPath(id), "PATCH", body, signal),
  samples: (word: string, params?: SampleQuery, signal?: AbortSignal) => get<Page<Sample>>(`${wordPath(word)}/samples`, params, signal),
  queue: (word: string, params?: SampleQuery, signal?: AbortSignal) => get<Page<Sample>>(`${wordPath(word)}/queue`, params, signal),
  sample: (word: string, id: string, signal?: AbortSignal) => get<Sample>(samplePath(word, id), undefined, signal),
  unmapped: (params?: SampleQuery, signal?: AbortSignal) => get<Page<Recording>>("/recordings/unmapped", params, signal),
  assign: (id: string, word: string, signal?: AbortSignal) => post<Sample>(`/recordings/${segment(id)}/assign`, { word_id: word }, signal),
  importAudio: (word: string, audio: File, label: "positive" | "negative", signal?: AbortSignal) => { const body = new FormData(); body.set("audio", audio); body.set("label", label); return post<Sample>(`${wordPath(word)}/samples/import`, body, signal); },
  label: (word: string, id: string, label: "positive" | "negative" | "discarded", revision: number, signal?: AbortSignal) => post<Sample>(`${samplePath(word, id)}/label`, { label, expected_revision: revision }, signal),
  undo: (word: string, id: string, revision: number, signal?: AbortSignal) => post<Sample>(`${samplePath(word, id)}/undo`, { expected_revision: revision }, signal),
  trim: (word: string, id: string, start: number, end: number, revision: number, signal?: AbortSignal) => post<Sample>(`${samplePath(word, id)}/trim`, { start_s: start, end_s: end, expected_revision: revision }, signal),
  deleteSample: (word: string, id: string, revision: number, signal?: AbortSignal) => request<void>(`${samplePath(word, id)}${query({ expected_revision: revision })}`, "DELETE", undefined, signal),
  audioUrl: (word: string, id: string, original = false) => `${base}${samplePath(word, id)}/audio${query({ original })}`,
  devices: (signal?: AbortSignal) => get<Device[]>("/devices", undefined, signal),
  addDevice: (url: string, token: string, role: "standalone" | "leader", signal?: AbortSignal) => post<Device>("/devices", { url, token, role }, signal),
  refreshDevices: (id: string, signal?: AbortSignal) => post<Device[]>(`/devices/${segment(id)}/refresh`, undefined, signal),
  setCredentials: (id: string, token: string, signal?: AbortSignal) => post<Device>(`/devices/${segment(id)}/credentials`, { token }, signal),
  sourceMappings: (id: string, signal?: AbortSignal) => get<SourceMapping[]>(`/devices/${segment(id)}/source-mappings`, undefined, signal),
  setSourceMapping: (id: string, body: Omit<SourceMapping, "device_id">, signal?: AbortSignal) => put<SourceMapping>(`/devices/${segment(id)}/source-mappings`, body, signal),
  scrape: (device_ids?: string[], signal?: AbortSignal) => post<CollectionRun>("/scrape", { device_ids }, signal),
  scrapeRuns: (params?: Pagination, signal?: AbortSignal) => get<Page<CollectionRun>>("/scrape/runs", params, signal),
  schedules: (signal?: AbortSignal) => get<Schedule[]>("/schedules", undefined, signal),
  saveSchedule: (scope: string, body: ScheduleInput, signal?: AbortSignal) => put<Schedule>(`/schedules/${segment(scope)}`, body, signal),
  jobs: (params?: Pagination, signal?: AbortSignal) => get<Page<Job>>("/jobs", params, signal),
  enqueueScrape: (body: EnqueueScrapeJob, signal?: AbortSignal) => post<ScrapeJob>("/jobs", body, signal),
  health: (signal?: AbortSignal) => get<WorkerHealth>("/jobs/health", undefined, signal),
  job: (id: string, signal?: AbortSignal) => get<Job>(`/jobs/${segment(id)}`, undefined, signal),
  jobLogs: (id: string, limit = 8192, signal?: AbortSignal) => get<{ text: string }>(`/jobs/${segment(id)}/logs`, { limit }, signal),
  cancelJob: (id: string, signal?: AbortSignal) => post<Job>(`/jobs/${segment(id)}/cancel`, undefined, signal),
  datasets: (word: string, params?: Pagination & { search?: string; status?: string }, signal?: AbortSignal) => get<Page<Dataset>>(`${wordPath(word)}/datasets`, params, signal),
  selectDatasets: (word: string, dataset_ids: string[], signal?: AbortSignal) => put<Page<Dataset>>(`${wordPath(word)}/datasets`, { dataset_ids }, signal),
  downloadDataset: (id: string, signal?: AbortSignal) => post<Job>(`/datasets/${segment(id)}/download`, undefined, signal),
  generationCatalog: (signal?: AbortSignal) => get<GenerationCapability[]>("/generation/catalog", undefined, signal),
  generationRecipe: (word: string, signal?: AbortSignal) => get<GenerationRecipe>(`${wordPath(word)}/generation/recipe`, undefined, signal),
  saveGenerationRecipe: (word: string, body: GenerationRecipe, signal?: AbortSignal) => put<GenerationRecipe>(`${wordPath(word)}/generation/recipe`, body, signal),
  generate: (word: string, signal?: AbortSignal) => post<Job>(`${wordPath(word)}/generation/jobs`, undefined, signal),
  batches: (word: string, params?: Pagination, signal?: AbortSignal) => get<Page<Batch>>(`${wordPath(word)}/generation/batches`, params, signal),
  batch: (word: string, id: string, signal?: AbortSignal) => get<Batch>(`${wordPath(word)}/generation/batches/${segment(id)}`, undefined, signal),
  selectBatches: (word: string, batch_ids: string[], signal?: AbortSignal) => put<Page<Batch>>(`${wordPath(word)}/generation/batches`, { batch_ids }, signal),
  trainingSettings: (word: string, signal?: AbortSignal) => get<TrainingSettings>(`${wordPath(word)}/training/settings`, undefined, signal),
  saveTrainingSettings: (word: string, body: TrainingSettings, signal?: AbortSignal) => put<TrainingSettings>(`${wordPath(word)}/training/settings`, body, signal),
  trainingCounts: (word: string, signal?: AbortSignal) => get<TrainingCounts>(`${wordPath(word)}/training/counts`, undefined, signal),
  train: (word: string, signal?: AbortSignal) => post<Job>(`${wordPath(word)}/training/jobs`, undefined, signal),
  trainingRuns: (word: string, params?: Pagination, signal?: AbortSignal) => get<Page<Job>>(`${wordPath(word)}/training/runs`, params, signal),
  trainingManifest: (word: string, id: string, signal?: AbortSignal) => get<RunManifest>(`${wordPath(word)}/training/runs/${segment(id)}`, undefined, signal),
  models: (word: string, params?: Pagination, signal?: AbortSignal) => get<Page<ModelVersion>>(`${wordPath(word)}/models`, params, signal),
  model: (word: string, id: string, signal?: AbortSignal) => get<ModelVersion>(`${wordPath(word)}/models/${segment(id)}`, undefined, signal),
  archiveUrl: (word: string, id: string, name?: string) => `${base}${wordPath(word)}/models/${segment(id)}/archive${name === undefined ? "" : `/${segment(name)}`}`,
  deploymentCapabilities: (signal?: AbortSignal) => get<DeploymentCapabilities>("/deployment/capabilities", undefined, signal),
  deploymentStatus: (word: string, signal?: AbortSignal) => get<Publication[]>(`${wordPath(word)}/deployment/status`, undefined, signal),
  deploymentHistory: (word: string, params?: Pagination, signal?: AbortSignal) => get<Page<Publication>>(`${wordPath(word)}/deployment/history`, params, signal),
  publish: (word: string, version_id: string, signal?: AbortSignal) => post<Publication[]>(`${wordPath(word)}/deployment/publish`, { version_id }, signal),
  rollback: (word: string, version_id: string, signal?: AbortSignal) => post<Publication[]>(`${wordPath(word)}/deployment/rollback`, { version_id }, signal),
};

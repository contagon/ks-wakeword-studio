import type {
  ModelMetrics,
  ScrapeJob,
  Page,
  Wakeword,
  CreateWakeword,
  Device,
  SourceMapping,
  Recording,
  Sample,
  SampleQuery,
  Pagination,
  CollectionRun,
  Schedule,
  Job,
  Dataset,
  GenerationRecipe,
  GenerationCapability,
  Batch,
  TrainingSettings,
  TrainingCounts,
  ModelVersion,
  Publication,
} from "./types";

import type { GenerationSubmission, GenerationSource } from "./types";
import type { AutomationSettings, AutomationStatus } from "./types";
import type { CapturePreview, CaptureSelection } from "./types";
import type { AugmentationCatalog } from "./types";
import { publicError } from "./errors";

const base = "/api/studio";
const segment = encodeURIComponent;
type Query = object;
export type JobQuery = Pagination & { state?: "active" | "history" };
function query(values: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== null) params.set(key, String(value));
  return params.size ? `?${params}` : "";
}
export class StudioApiError extends Error {
  constructor(
    public readonly status: number,
    code?: unknown,
  ) {
    super(
      (
        {
          401: "Kiosk admin credentials required.",
          403: "Kiosk admin credentials required.",
          404: "Studio record no longer available.",
          409: "Studio record conflict. Refresh and try again.",
          422: "Invalid studio request. Check the supplied values.",
          502: "Kiosk rejected the request.",
          503: "Kiosk unavailable.",
        } as Record<number, string>
      )[status] ?? "Studio request failed. Try again.",
    );
    this.message = publicError(code) || this.message;
  }
}
/** Do not surface raw remote error bodies (which may contain secrets). */
async function request<T>(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      credentials: "same-origin",
      ...(body instanceof FormData
        ? { body }
        : body === undefined
          ? {}
          : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Unable to reach the studio. Check your connection and retry.");
  }
  if (!response.ok) {
    let code: unknown;
    try {
      code = (await response.json())?.code;
    } catch {
      /* Non-JSON proxy errors remain generic. */
    }
    throw new StudioApiError(response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
function finiteOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
/** Every item of a paginated endpoint, 100 per request; stops early (with what it has) once aborted. */
export async function fetchAll<T>(
  page: (window: { offset: number; limit: number }) => Promise<Page<T>>,
  signal?: AbortSignal,
): Promise<T[]> {
  const items: T[] = [];
  while (!signal?.aborted) {
    const next = await page({ offset: items.length, limit: 100 });
    items.push(...next.items);
    if (items.length >= next.total || !next.items.length) break;
  }
  return items;
}
/** Narrow opaque archived calibration metrics; never trust shape or render unknown keys. */
export function readModelMetrics(metrics: unknown): ModelMetrics {
  const values = new Map<string, unknown>(
    typeof metrics === "object" && metrics !== null && !Array.isArray(metrics) ? Object.entries(metrics) : [],
  );
  const field = (key: keyof ModelMetrics) => finiteOrNull(values.get(key));
  return {
    recall: field("recall"),
    false_accepts_per_hour: field("false_accepts_per_hour"),
    target_false_accepts_per_hour: field("target_false_accepts_per_hour"),
  };
}
const wordPath = (id: string) => `/wakewords/${segment(id)}`;
const samplePath = (word: string, id: string) => `${wordPath(word)}/samples/${segment(id)}`;
const get = <T>(path: string, params?: Query, signal?: AbortSignal) =>
  request<T>(path + query(params), "GET", undefined, signal);
const post = <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, "POST", body, signal);
const put = <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>(path, "PUT", body, signal);

export const studioApi = {
  augmentationDatasets: (signal?: AbortSignal) => get<AugmentationCatalog>("/augmentation/datasets", undefined, signal),
  wakewordAugmentationDatasets: (word: string, signal?: AbortSignal) =>
    get<AugmentationCatalog>(`${wordPath(word)}/augmentation/datasets`, undefined, signal),
  selectAugmentationDatasets: (word: string, dataset_ids: string[], signal?: AbortSignal) =>
    put<AugmentationCatalog>(`${wordPath(word)}/augmentation/datasets`, { dataset_ids }, signal),
  downloadAugmentation: (id: string, signal?: AbortSignal) =>
    post<Job>(`/augmentation/datasets/${segment(id)}/download`, undefined, signal),
  testingManifest: (word: string, version: string, model: string, signal?: AbortSignal) =>
    get<unknown>(`${wordPath(word)}/models/${segment(version)}/archive/${segment(model + ".json")}`, undefined, signal),
  testingModelUrl: (word: string, version: string, model: string) =>
    `${base}${wordPath(word)}/models/${segment(version)}/archive/${segment(model + ".tflite")}`,
  wakewords: (params?: Pagination, signal?: AbortSignal) => get<Page<Wakeword>>("/wakewords", params, signal),
  wakeword: (id: string, signal?: AbortSignal) => get<Wakeword>(wordPath(id), undefined, signal),
  createWakeword: (body: CreateWakeword, signal?: AbortSignal) => post<Wakeword>("/wakewords", body, signal),
  deleteWakeword: (id: string, signal?: AbortSignal) => request<void>(wordPath(id), "DELETE", undefined, signal),
  samples: (word: string, params?: SampleQuery, signal?: AbortSignal) =>
    get<Page<Sample>>(`${wordPath(word)}/samples`, params, signal),
  queue: (word: string, params?: SampleQuery, signal?: AbortSignal) =>
    get<Page<Sample>>(`${wordPath(word)}/queue`, params, signal),
  sample: (word: string, id: string, signal?: AbortSignal) => get<Sample>(samplePath(word, id), undefined, signal),
  unmapped: (params?: SampleQuery, signal?: AbortSignal) =>
    get<Page<Recording>>("/recordings/unmapped", params, signal),
  assign: (id: string, word: string, signal?: AbortSignal) =>
    post<Sample>(`/recordings/${segment(id)}/assign`, { word_id: word }, signal),
  importAudio: (word: string, audio: File, label: "positive" | "negative", signal?: AbortSignal) => {
    const body = new FormData();
    body.set("audio", audio);
    body.set("label", label);
    return post<Sample>(`${wordPath(word)}/samples/import`, body, signal);
  },
  previewCapture: (word: string, audio: File, signal?: AbortSignal) => {
    const body = new FormData();
    body.set("audio", audio);
    return post<CapturePreview>(`${wordPath(word)}/samples/capture/preview`, body, signal);
  },
  saveCapture: (
    word: string,
    audio: File,
    label: "positive" | "negative",
    selection: CaptureSelection,
    signal?: AbortSignal,
  ) => {
    const body = new FormData();
    body.set("audio", audio);
    body.set("label", label);
    body.set("start_s", String(selection.start_s));
    body.set("end_s", String(selection.end_s));
    body.set("trim_method", selection.trim_method);
    return post<Sample>(`${wordPath(word)}/samples/capture`, body, signal);
  },
  label: (
    word: string,
    id: string,
    label: "positive" | "negative" | "discarded",
    revision: number,
    signal?: AbortSignal,
  ) => post<Sample>(`${samplePath(word, id)}/label`, { label, expected_revision: revision }, signal),
  undo: (word: string, id: string, revision: number, signal?: AbortSignal) =>
    post<Sample>(`${samplePath(word, id)}/undo`, { expected_revision: revision }, signal),
  trim: (word: string, id: string, start: number, end: number, revision: number, signal?: AbortSignal) =>
    post<Sample>(`${samplePath(word, id)}/trim`, { start_s: start, end_s: end, expected_revision: revision }, signal),
  deleteSample: (word: string, id: string, revision: number, signal?: AbortSignal) =>
    request<void>(`${samplePath(word, id)}${query({ expected_revision: revision })}`, "DELETE", undefined, signal),
  audioUrl: (word: string, id: string, original = false) =>
    `${base}${samplePath(word, id)}/audio${query({ original })}`,
  devices: (signal?: AbortSignal) => get<Device[]>("/devices", undefined, signal),
  addDevice: (url: string, password: string, role: "standalone" | "leader", signal?: AbortSignal) =>
    post<Device>("/devices", { url, password, role }, signal),
  updateDevice: (id: string, url: string, signal?: AbortSignal) =>
    request<Device>(`/devices/${segment(id)}`, "PATCH", { url }, signal),
  deleteDevice: (id: string, signal?: AbortSignal) =>
    request<void>(`/devices/${segment(id)}`, "DELETE", undefined, signal),
  refreshDevices: (id: string, signal?: AbortSignal) =>
    post<Device[]>(`/devices/${segment(id)}/refresh`, undefined, signal),
  setCredentials: (id: string, password: string, signal?: AbortSignal) =>
    post<Device>(`/devices/${segment(id)}/credentials`, { password }, signal),
  setSourceMapping: (id: string, body: Omit<SourceMapping, "device_id">, signal?: AbortSignal) =>
    put<SourceMapping>(`/devices/${segment(id)}/source-mappings`, body, signal),
  scrapeRuns: (params?: Pagination, signal?: AbortSignal) => get<Page<CollectionRun>>("/scrape/runs", params, signal),
  schedules: (signal?: AbortSignal) => get<Schedule[]>("/schedules", undefined, signal),
  automation: (word: string, signal?: AbortSignal) =>
    get<AutomationStatus>(`${wordPath(word)}/automation`, undefined, signal),
  saveAutomation: (word: string, settings: AutomationSettings, signal?: AbortSignal) =>
    put<AutomationStatus>(`${wordPath(word)}/automation`, settings, signal),
  collect: (word: string, device_ids?: string[], signal?: AbortSignal) =>
    post<ScrapeJob>(`${wordPath(word)}/collection/jobs`, { device_ids }, signal),
  jobs: (params?: JobQuery, signal?: AbortSignal) => get<Page<Job>>("/jobs", params, signal),
  job: (id: string, signal?: AbortSignal) => get<Job>(`/jobs/${segment(id)}`, undefined, signal),
  jobLogs: (id: string, limit = 8192, signal?: AbortSignal) =>
    get<{ text: string }>(`/jobs/${segment(id)}/logs`, { limit }, signal),
  cancelJob: (id: string, signal?: AbortSignal) => post<Job>(`/jobs/${segment(id)}/cancel`, undefined, signal),
  datasets: (word: string, params?: Pagination & { search?: string; status?: string }, signal?: AbortSignal) =>
    get<Page<Dataset>>(`${wordPath(word)}/datasets`, params, signal),
  selectDatasets: (word: string, dataset_ids: string[], signal?: AbortSignal) =>
    put<Page<Dataset>>(`${wordPath(word)}/datasets`, { dataset_ids }, signal),
  downloadDataset: (id: string, signal?: AbortSignal) =>
    post<Job>(`/datasets/${segment(id)}/download`, undefined, signal),
  generationCatalog: (signal?: AbortSignal) => get<GenerationCapability[]>("/generation/catalog", undefined, signal),
  generationDefaults: (signal?: AbortSignal) =>
    get<{ samples: number; batch_size: number }>("/generation/defaults", undefined, signal),
  generationRecipe: (word: string, signal?: AbortSignal) =>
    get<GenerationRecipe>(`${wordPath(word)}/generation/recipe`, undefined, signal),
  submitGeneration: (word: string, body: GenerationRecipe, signal?: AbortSignal) =>
    post<GenerationSubmission>(`${wordPath(word)}/generation/submissions`, body, signal),
  generationSources: (word: string, params?: Pagination & { language?: string }, signal?: AbortSignal) =>
    get<Page<GenerationSource>>(`${wordPath(word)}/generation/sources`, params, signal),
  preview: (word: string, body: GenerationRecipe, signal?: AbortSignal) =>
    post<Job>(`${wordPath(word)}/generation/previews`, body, signal),
  previewAudioUrl: (word: string, id: string) => `${base}${wordPath(word)}/generation/previews/${segment(id)}/audio`,
  batches: (word: string, params?: Pagination, signal?: AbortSignal) =>
    get<Page<Batch>>(`${wordPath(word)}/generation/batches`, params, signal),
  batchSelection: (word: string, signal?: AbortSignal) =>
    get<string[]>(`${wordPath(word)}/generation/selection`, undefined, signal),
  selectBatches: (word: string, batch_ids: string[], signal?: AbortSignal) =>
    put<Page<Batch>>(`${wordPath(word)}/generation/batches`, { batch_ids }, signal),
  deleteBatch: (word: string, batch: string, signal?: AbortSignal) =>
    request<void>(`${wordPath(word)}/generation/batches/${segment(batch)}`, "DELETE", undefined, signal),
  trainingSettings: (word: string, signal?: AbortSignal) =>
    get<TrainingSettings>(`${wordPath(word)}/training/settings`, undefined, signal),
  saveTrainingSettings: (word: string, body: TrainingSettings, signal?: AbortSignal) =>
    put<TrainingSettings>(`${wordPath(word)}/training/settings`, body, signal),
  trainingCounts: (word: string, signal?: AbortSignal) =>
    get<TrainingCounts>(`${wordPath(word)}/training/counts`, undefined, signal),
  classify: (word: string, signal?: AbortSignal) =>
    post<Job>(`${wordPath(word)}/classification/jobs`, undefined, signal),
  train: (word: string, signal?: AbortSignal) => post<Job>(`${wordPath(word)}/training/jobs`, undefined, signal),
  trainingRuns: (word: string, params?: Pagination, signal?: AbortSignal) =>
    get<Page<Job>>(`${wordPath(word)}/training/runs`, params, signal),
  models: (word: string, params?: Pagination, signal?: AbortSignal) =>
    get<Page<ModelVersion>>(`${wordPath(word)}/models`, params, signal),
  archiveUrl: (word: string, id: string, name?: string) =>
    `${base}${wordPath(word)}/models/${segment(id)}/archive${name === undefined ? "" : `/${segment(name)}`}`,
  deploymentStatus: (word: string, signal?: AbortSignal) =>
    get<Publication[]>(`${wordPath(word)}/deployment/status`, undefined, signal),
  publish: (word: string, version_id: string, signal?: AbortSignal) =>
    post<Publication[]>(`${wordPath(word)}/deployment/publish`, { version_id }, signal),
};

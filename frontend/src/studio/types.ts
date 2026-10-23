/** Public records from studio/models.py. IDs are opaque; timestamps are UTC ISO strings. */
export interface Page<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
export interface Wakeword {
  id: string;
  phrase: string;
  language: string;
  readonly model_id: string;
  created_at: string;
  updated_at: string;
}
export type CreateWakeword = Pick<Wakeword, "phrase" | "language"> & { model_id?: string };
export interface Schedule {
  scope: string;
  cron: string;
  timezone: string;
  enabled: boolean;
  next_run_at: string;
}
export type ScheduleInput = Pick<Schedule, "cron" | "timezone" | "enabled">;
export interface ClassificationPolicy {
  enabled: boolean;
  trigger: "after_collection" | "schedule";
  confirm_activations: boolean;
  auto_negatives: boolean;
  promote_close_misses: boolean;
  near_miss_negatives: boolean;
}
export interface AutomationSettings {
  collection: ScheduleInput;
  classification: ClassificationPolicy;
  classification_schedule: ScheduleInput;
  training: ScheduleInput;
  skip_unchanged: boolean;
  deployment: ScheduleInput;
  deployment_policy: { after_training: boolean };
}
export interface AutomationStatus {
  settings: AutomationSettings;
  schedules: Schedule[];
  last_jobs: Partial<Record<"scrape" | "classify" | "train" | "deploy", Job | null>>;
}
export type JobStatus = "queued" | "running" | "cancelling" | "complete" | "failed" | "cancelled" | "interrupted";
export type JobResource = "gpu" | "collection" | "download";
/** Cancelled/interrupted jobs may finish with no result; handler crashes record only a code. */
export type EmptyJobResult = { [key: string]: never };
export interface JobFailure {
  error: "handler_failed";
  error_code?: string;
  message?: string;
}
export interface TrainPayload {
  trigger?: "manual" | "scheduled";
}
export type TrainResult = { run_id: string; version_id: string } | { run_id: string; skipped: true };
export interface GenerationPayload {
  phrase: string;
  recipe: GenerationRecipe;
}
export interface GenerationResult {
  batch_id: string;
}
export interface ScrapePayload {
  device_ids?: string[] | null;
}
export interface ScrapeResult {
  run_id: string;
  status: string;
  new?: number;
  new_mapped?: number;
  failed?: number;
  unmapped?: number;
  evicted?: number;
}
export type DownloadPayload =
  { dataset_id: string; augmentation_id?: never } | { augmentation_id: string; dataset_id?: never };
export type DownloadResult =
  | { dataset_id: string; fingerprint: string }
  | { augmentation_id: string; fingerprint: string; installed_bytes: number; file_count: number };
interface JobRecord<K extends string, R extends JobResource, P, T> {
  id: string;
  kind: K;
  word_id: string | null;
  resource: R;
  payload: P;
  status: JobStatus;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  result: T | JobFailure | EmptyJobResult;
  run_number?: number | null;
}
export type TrainJob = JobRecord<"train", "gpu", TrainPayload, TrainResult> & { word_id: string };
export type GenerationJob = JobRecord<"generation", "gpu", GenerationPayload, GenerationResult> & { word_id: string };
export type PreviewJob = JobRecord<"preview", "gpu", GenerationPayload, { preview: boolean }> & { word_id: string };
export type ScrapeJob = JobRecord<"scrape", "collection", ScrapePayload, ScrapeResult>;
export type DownloadJob = JobRecord<"download", "download", DownloadPayload, DownloadResult>;
/** Discriminated on `kind`; the server only admits these four kinds. */
export type Job =
  | TrainJob
  | GenerationJob
  | PreviewJob
  | ScrapeJob
  | DownloadJob
  | JobRecord<"classify", "gpu", Record<string, never>, Record<string, number | string | boolean>>
  | JobRecord<"deploy", "collection", Record<string, never>, Record<string, string | boolean>>;
/** The generic queue endpoint is used only for collection; other kinds have dedicated, validated endpoints. */
export interface Device {
  id: string;
  name?: string | null;
  url: string;
  role: string;
  active: boolean;
  leader_id: string | null;
  credentials_status: string;
  profile_id: string | null;
  model_eligible: boolean;
}
export interface SourceMapping {
  device_id: string;
  engine: string;
  source_phrase: string;
  word_id: string;
}
/** Server projects recording provenance onto these bounded numeric diagnostics only. */
export interface RecordingMetadata {
  duration?: number;
  duration_s?: number;
  duration_ms?: number;
  sample_rate?: number;
  channels?: number;
  frames?: number;
}
export interface Recording {
  id: string;
  device_id: string;
  clip_id: string;
  timestamp: string | null;
  phrase: string;
  engine: string;
  near_miss: boolean;
  scores: Record<string, number>;
  metadata: RecordingMetadata;
  audio_id: string;
  original_hash: string;
  normalized_hash: string;
  family_id: string;
  word_id: string | null;
  quarantined: boolean;
  created_at: string;
}
export interface CaptureSelection {
  start_s: number;
  end_s: number;
  trim_method: "silero" | "manual" | "none";
}
export interface CapturePreview extends CaptureSelection {
  duration_s: number;
  warning: "no_speech" | "vad_unavailable" | null;
  duration_limited?: boolean;
}
export interface Sample {
  id: string;
  word_id: string;
  recording_id: string | null;
  audio_id: string;
  original_hash: string;
  normalized_hash: string;
  family_id: string;
  label: string;
  revision: number;
  source: string;
  created_at: string;
  updated_at: string;
  recording: Recording | null;
  capture?: (CaptureSelection & { duration_s: number }) | null;
}
export interface CollectionCounters {
  listed: number;
  new: number;
  already_seen: number;
  unmapped: number;
  evicted: number;
  failed: number;
}
export interface CollectionRun extends CollectionCounters {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  devices: (CollectionCounters & { device_id: string; status: string; errors: string[] })[];
}
export interface Dataset {
  id: string;
  name: string;
  description: string;
  source: string;
  license: string;
  representation: string;
  split: string;
  adapter: string;
  purpose: string;
  download_bytes: number | null;
  installed_bytes: number | null;
  sample_count: number | null;
  fingerprint: string | null;
  selected: boolean;
  status: string;
  job_id: string | null;
  error_code: string | null;
}
export interface AugmentationDataset {
  id: string;
  name: string;
  description: string;
  source: string;
  license: string;
  selected: boolean;
  status: string;
  download_bytes: number | null;
  installed_bytes: number | null;
  file_count: number | null;
  job_id: string | null;
  job_created_at?: string | null;
  error_code: string | null;
}
export interface AugmentationCatalog {
  items: AugmentationDataset[];
  ready: boolean;
  storage_free_bytes: number;
  storage_total_bytes: number;
}
export type TtsMode = "hybrid" | "modern" | "piper";
export interface GenerationRecipe {
  language: string;
  english_accent: string;
  tts_mode: TtsMode;
  samples: number;
  batch_size: number;
  engines?: string[] | null;
  moss_source_batch_ids?: string[];
  moss_after_current?: boolean;
  moss_samples?: number | null;
}
export interface GenerationSubmission {
  id: string;
  jobs: Job[];
  batch_ids: string[];
}
export interface GenerationSource {
  id: string;
  phrase: string;
  language: string;
  providers: string[];
  sample_count: number;
  created_at: string;
}
export interface GenerationModelAvailability {
  engine: string;
  supported: boolean;
  available: boolean;
  reason: string | null;
}
export interface GenerationCapability {
  language: string;
  name: string;
  accent_applies: boolean;
  english_accents: { code: string; label: string }[];
  engines: Record<TtsMode, string[]>;
  model_availability?: GenerationModelAvailability[];
}
export interface Batch {
  id: string;
  word_id: string;
  phrase: string;
  recipe: GenerationRecipe;
  status: string;
  created_at: string;
  finished_at: string | null;
  audio: { audio_id: string; original_hash: string; normalized_hash: string; family_id: string }[];
  selected: boolean;
}
export interface TrainingSettings {
  training_steps: number;
}
export interface TrainingCounts {
  positive: number;
  negative: number;
  artificial: number;
}
/** Calibration metrics narrowed from opaque `ModelVersion.metrics`; absent or malformed values are null. */
export interface ModelMetrics {
  recall: number | null;
  false_accepts_per_hour: number | null;
  target_false_accepts_per_hour: number | null;
}
export interface ModelVersion {
  id: string;
  word_id: string;
  model_id: string;
  run_id: string;
  run_number?: number | null;
  trained_at: string;
  path: string;
  fingerprint: string;
  checksums: Record<string, string>;
  metrics: unknown;
  origin?: "training" | "legacy";
  validation_state?: "unvalidated" | "validated";
}
export interface Publication {
  word_id: string;
  device_id: string;
  desired_version: string;
  run_number?: number | null;
  revision: number;
  state: string;
  attempts: number;
  next_retry: string | null;
  manifest_state: string;
  refresh_state: string;
  runtime_state: string;
  error_code: string | null;
  updated_at: string;
  published_at?: string | null;
  cache_effect: string;
}
export interface Pagination {
  offset?: number;
  limit?: number;
}
export interface SampleQuery extends Pagination {
  label?: string;
  device_id?: string;
  near_miss?: boolean;
  source?: string;
  search?: string;
  after?: string;
  before?: string;
  labelled_by?: "auto" | "manual";
}
export interface WorkspaceSummary {
  pending: number;
  modelCount: number;
  latestModel: ModelVersion | null;
  schedule: Schedule | null;
}

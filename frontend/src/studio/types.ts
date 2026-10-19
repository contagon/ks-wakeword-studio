/** Public records from studio/models.py. IDs are opaque; timestamps are UTC ISO strings. */
export interface Page<T> { items: T[]; total: number; offset: number; limit: number }
export interface Wakeword { id: string; phrase: string; language: string; readonly model_id: string; created_at: string; updated_at: string }
export type CreateWakeword = Pick<Wakeword, "phrase" | "language"> & { model_id?: string };
export type UpdateWakeword = Partial<Pick<Wakeword, "phrase" | "language">>;
export interface Schedule { scope: string; cron: string; timezone: string; enabled: boolean; next_run_at: string }
export type ScheduleInput = Pick<Schedule, "cron" | "timezone" | "enabled">;
export type JobStatus = "queued" | "running" | "cancelling" | "complete" | "failed" | "cancelled" | "interrupted";
export type JobResource = "gpu" | "collection" | "download";
/** Cancelled/interrupted jobs may finish with no result; handler crashes record only a code. */
export type EmptyJobResult = { [key: string]: never };
export interface JobFailure { error: "handler_failed" }
export interface TrainPayload { trigger?: "manual" | "scheduled" }
export type TrainResult = { run_id: string; version_id: string } | { run_id: string; skipped: true };
export interface GenerationPayload { phrase: string; recipe: GenerationRecipe }
export interface GenerationResult { batch_id: string }
export interface ScrapePayload { device_ids?: string[] | null }
export interface ScrapeResult { run_id: string; status: string }
export interface DownloadPayload { dataset_id: string }
export interface DownloadResult { dataset_id: string; fingerprint: string }
interface JobRecord<K extends string, R extends JobResource, P, T> { id: string; kind: K; word_id: string | null; resource: R; payload: P; status: JobStatus; created_at: string; started_at: string | null; finished_at: string | null; result: T | JobFailure | EmptyJobResult }
export type TrainJob = JobRecord<"train", "gpu", TrainPayload, TrainResult> & { word_id: string };
export type GenerationJob = JobRecord<"generation", "gpu", GenerationPayload, GenerationResult> & { word_id: string };
export type ScrapeJob = JobRecord<"scrape", "collection", ScrapePayload, ScrapeResult>;
export type DownloadJob = JobRecord<"download", "download", DownloadPayload, DownloadResult>;
/** Discriminated on `kind`; the server only admits these four kinds. */
export type Job = TrainJob | GenerationJob | ScrapeJob | DownloadJob;
/** The generic queue endpoint is used only for collection; other kinds have dedicated, validated endpoints. */
export interface EnqueueScrapeJob { kind: "scrape"; payload?: ScrapePayload; dedupe_key?: string }
export interface WorkerHealth { workers_started: boolean; degraded: boolean; loops: { component: string; status: string; failure_count: number; consecutive_failures: number; last_error_code: string | null; last_failure_at: string | null; last_success_at: string | null }[] }
export interface Device { id: string; url: string; role: string; active: boolean; leader_id: string | null; credentials_status: string; profile_id: string | null; model_eligible: boolean }
export interface SourceMapping { device_id: string; engine: string; source_phrase: string; word_id: string }
/** Server projects recording provenance onto these bounded numeric diagnostics only. */
export interface RecordingMetadata { duration?: number; duration_s?: number; duration_ms?: number; sample_rate?: number; channels?: number; frames?: number }
export interface Recording { id: string; device_id: string; clip_id: string; timestamp: string | null; phrase: string; engine: string; near_miss: boolean; scores: Record<string, number>; metadata: RecordingMetadata; audio_id: string; original_hash: string; normalized_hash: string; family_id: string; word_id: string | null; quarantined: boolean; created_at: string }
export interface Sample { id: string; word_id: string; recording_id: string | null; audio_id: string; original_hash: string; normalized_hash: string; family_id: string; label: string; revision: number; source: string; created_at: string; updated_at: string; recording: Recording | null }
export interface CollectionCounters { listed: number; new: number; already_seen: number; unmapped: number; evicted: number; failed: number }
export interface CollectionRun extends CollectionCounters { id: string; started_at: string; finished_at: string | null; status: string; devices: (CollectionCounters & { device_id: string; status: string; errors: string[] })[] }
export interface Dataset { id: string; name: string; description: string; source: string; license: string; representation: string; split: string; adapter: string; purpose: string; download_bytes: number | null; installed_bytes: number | null; fingerprint: string | null; selected: boolean; status: string; job_id: string | null; error_code: string | null }
export type TtsMode = "hybrid" | "modern" | "piper";
export interface GenerationRecipe { language: string; english_accent: string; tts_mode: TtsMode; samples: number; batch_size: number; engines?: string[] | null }
export interface GenerationModelAvailability { engine: string; supported: boolean; available: boolean; reason: string | null }
export interface GenerationCapability { language: string; name: string; accent_applies: boolean; english_accents: { code: string; label: string }[]; engines: Record<TtsMode, string[]>; model_availability?: GenerationModelAvailability[] }
export interface Batch { id: string; word_id: string; phrase: string; recipe: GenerationRecipe; status: string; created_at: string; finished_at: string | null; audio: { audio_id: string; original_hash: string; normalized_hash: string; family_id: string }[]; selected: boolean }
export interface TrainingSettings { training_steps: number }
export interface TrainingCounts { positive: number; negative: number; artificial: number }
export interface RunManifest { schema_version: number; run_id: string; word_id: string; model_id: string; phrase: string; language: string; config: TrainingSettings; seed: number; audio: { audio_id: string; original_hash: string; normalized_hash: string; family_id: string; path: string; label: string; split: string; sample_id: string | null; revision: number | null; batch_id: string | null }[]; datasets: { id: string; path: string; representation: string; split: string; adapter: string; fingerprint: string }[]; augmentation?: AugmentationInput[]; selected_batches: string[]; fingerprint: string; created_at: string }
export interface AugmentationInput { id: string; path: string; fingerprint: string }
export interface LegacyRun { kind: 'legacy'; schema_version: number; run_id: string; word_id: string; model_id: string; phrase: string; language: string; fingerprint: string; created_at: string; legacy_identity: string }
/** Calibration metrics narrowed from opaque `ModelVersion.metrics`; absent or malformed values are null. */
export interface ModelMetrics { recall: number | null; false_accepts_per_hour: number | null; target_false_accepts_per_hour: number | null }
export interface ModelVersion { id: string; word_id: string; model_id: string; run_id: string; trained_at: string; path: string; fingerprint: string; checksums: Record<string, string>; metrics: unknown; origin?: 'training' | 'legacy'; validation_state?: 'unvalidated' | 'validated' }
export interface Publication { word_id: string; device_id: string; desired_version: string; revision: number; state: string; attempts: number; next_retry: string | null; manifest_state: string; refresh_state: string; runtime_state: string; error_code: string | null; updated_at: string; cache_effect: string }
export interface DeploymentCapabilities { requires_initially_clean_staging: boolean; requires_exclusive_staging: boolean; automatic_clean_check: boolean; remote_staging_inspection: boolean; remote_staging_discard: boolean; remote_staging_lock: boolean; notice: string; quarantine_notice: string; operator_action: string }
export interface Pagination { offset?: number; limit?: number }
export interface SampleQuery extends Pagination { label?: string; device_id?: string; near_miss?: boolean; source?: string; search?: string; after?: string; before?: string }
export interface WorkspaceSummary { pending: number; modelCount: number; latestModel: ModelVersion | null; schedule: Schedule | null }

export interface LegacyInventory { fingerprint: string; counts: { personal: number; negative: number; captured: number; models: number }; phrases: string[]; models: string[]; requires_phrase_assignment: boolean; requires_model_assignment: boolean }
export interface LegacyImportSelection { word_id: string; phrase_assignments: Record<string, string>; model_assignments: Record<string, string> }
export interface MigrationReport { fingerprint: string; word_id: string; imported_samples: number; imported_models: number; skipped_samples: number; skipped_models: number }
export interface StudioCapabilities { legacy_mode: boolean; legacy_automation_enabled: boolean }

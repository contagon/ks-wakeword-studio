import type { Job } from './types';

/** Never display arbitrary exception strings, remote error bodies, or result prose. */
const messages: Record<string, string> = {
  augmentation_missing: 'Required augmentation datasets are missing. Open Online Datasets and download all four augmentation datasets before training.',
  augmentation_busy: 'Augmentation datasets are still being prepared. Wait for their downloads to complete before training.',
  augmentation_invalid: 'Augmentation audio is empty, incomplete, or unsafe. Retry the download in Online Datasets; inspect private diagnostics if it persists.',
  augmentation_repair_required: 'An existing augmentation corpus folder is incomplete or unsafe. Move that corpus folder out of training_datasets, then retry in Online Datasets. No existing files were removed.',
  gpu_memory: 'Not enough GPU memory. Stop other GPU workloads or reduce the generation batch size, then retry.',
  disk_full: 'Not enough disk space. Free space on the data volume before retrying; downloads and training snapshots need extra space.',
  permission_denied: 'The server cannot access a required file or directory. Check ownership and permissions on the data volume before retrying.',
  dependency_missing: 'A required Python dependency is missing. Inspect private diagnostics and repair the affected environment before retrying.',
  network_failed: 'A dataset or model download could not reach its source. Check connectivity and retry.',
  child_command_failed: 'A child command failed. Inspect this job’s private diagnostics.log on the server for the traceback.',
  handler_failed: 'The operation failed. Inspect this job’s private diagnostics.log on the server for details.',
};

export function publicError(code: unknown): string {
  return typeof code === 'string' && Object.hasOwn(messages, code) ? messages[code]! : '';
}

export function jobError(job: Job): string {
  if (job.status !== 'failed' && job.status !== 'interrupted') return '';
  return publicError('error_code' in job.result ? job.result.error_code : undefined) || publicError('handler_failed');
}

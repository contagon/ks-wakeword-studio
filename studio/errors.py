"""Allowlisted public errors; never derive a public message from exception prose."""
import errno
from studio.models import Conflict

MESSAGES = {
    'augmentation_missing': 'Selected augmentation datasets are missing. Open Downloaded and download the selected augmentation datasets before training.',
    'augmentation_invalid': 'Augmentation audio is empty, incomplete, or unsafe. Retry the download in Downloaded; inspect private diagnostics if it persists.',
    'augmentation_repair_required': 'An existing augmentation corpus folder is incomplete or unsafe. Move that corpus folder out of training_datasets, then retry in Downloaded. No existing files were removed.',
    'augmentation_busy': 'Augmentation datasets are still being prepared. Wait for their downloads to complete before training.',
    'negative_datasets_missing': 'Selected negative datasets are not installed. Open Downloaded and download them, or deselect them and save, before training.',
    'gpu_memory': 'Not enough GPU memory. Stop other GPU workloads or reduce the generation batch size, then retry.',
    'disk_full': 'Not enough disk space. Free space on the data volume before retrying; downloads and training snapshots need extra space.',
    'permission_denied': 'The server cannot access a required file or directory. Check ownership and permissions on the data volume before retrying.',
    'dependency_missing': 'A required Python dependency is missing. Inspect private diagnostics and repair the affected environment before retrying.',
    'network_failed': 'A dataset or model download could not reach its source. Check connectivity and retry.',
    'child_command_failed': 'A child command failed. Inspect this job’s private diagnostics.log on the server for the traceback and retry after correcting the cause.',
    'handler_failed': 'The operation failed. Inspect this job’s private diagnostics.log on the server for details.',
}


class OperationError(Conflict):
    def __init__(self, code):
        self.code = code if code in MESSAGES else 'handler_failed'
        super().__init__(MESSAGES[self.code])


def failure_code(exc):
    if isinstance(exc, OperationError):
        return exc.code
    if isinstance(exc, OSError):
        if exc.errno in (errno.ENOSPC, errno.EDQUOT):
            return 'disk_full'
        if exc.errno in (errno.EACCES, errno.EPERM):
            return 'permission_denied'
    return 'handler_failed'


def child_error(output):
    text = output.lower()
    for pattern, code in (('out of memory', 'gpu_memory'), ('no space left on device', 'disk_full'),
                          ('modulenotfounderror', 'dependency_missing'), ('could not resolve host', 'network_failed'),
                          ('connectionerror', 'network_failed'), ('connection timed out', 'network_failed')):
        if pattern in text:
            return OperationError(code)
    return OperationError('child_command_failed')

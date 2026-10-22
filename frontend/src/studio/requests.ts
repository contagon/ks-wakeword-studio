import { onScopeDispose } from "vue";

/**
 * The newest request of one kind. Starting another aborts the previous one, so a result
 * applies only while `isCurrent(controller)`. Aborted when the owning component unmounts.
 */
export function latestRequest() {
  let current: AbortController | undefined;
  onScopeDispose(() => current?.abort());
  return {
    next(): AbortController {
      current?.abort();
      current = new AbortController();
      return current;
    },
    abort(): void {
      current?.abort();
      current = undefined;
    },
    isCurrent(controller: AbortController): boolean {
      return controller === current && !controller.signal.aborted;
    },
  };
}

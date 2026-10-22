import { readonly, ref } from "vue";
import { studioApi } from "./api";
import type { Device } from "./types";

const deviceItems = ref<Device[]>([]);
const loading = ref(false);
const error = ref("");
let initialized = false;
let request: AbortController | undefined;

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Unable to load fleet devices.";
}

/** One registry cache for collection and publication surfaces. No credential values live here. */
export function useDeviceRegistry() {
  function deviceLabel(id: string): string {
    const device = deviceItems.value.find((item) => item.id === id);
    return device?.name?.trim() || device?.url || "Unknown kiosk";
  }
  async function load(force = false): Promise<void> {
    if (initialized && !force) return;
    request?.abort();
    const controller = new AbortController();
    request = controller;
    loading.value = true;
    error.value = "";
    try {
      const result = await studioApi.devices(controller.signal);
      if (!controller.signal.aborted && request === controller) {
        deviceItems.value = result;
        initialized = true;
      }
    } catch (cause) {
      if (!controller.signal.aborted && request === controller) error.value = message(cause);
    } finally {
      if (request === controller) loading.value = false;
    }
  }
  function replace(device: Device): void {
    const index = deviceItems.value.findIndex((item) => item.id === device.id);
    deviceItems.value =
      index < 0
        ? [...deviceItems.value, device]
        : deviceItems.value.map((item) => (item.id === device.id ? device : item));
    initialized = true;
  }
  async function add(url: string, password: string, role: "leader" | "standalone"): Promise<Device> {
    const device = await studioApi.addDevice(url, password, role);
    replace(device);
    // Adding a leader causes server-side discovery; reload the sole shared cache.
    await load(true);
    return device;
  }
  async function refresh(id: string): Promise<void> {
    await studioApi.refreshDevices(id);
    await load(true);
  }
  async function credentials(id: string, password: string): Promise<Device> {
    const device = await studioApi.setCredentials(id, password);
    replace(device);
    return device;
  }
  async function update(id: string, url: string): Promise<void> {
    replace(await studioApi.updateDevice(id, url));
    await load(true);
  }
  async function remove(id: string): Promise<void> {
    await studioApi.deleteDevice(id);
    await load(true);
  }
  function abort(): void {
    request?.abort();
  }
  return {
    devices: readonly(deviceItems),
    loading: readonly(loading),
    error: readonly(error),
    deviceLabel,
    load,
    add,
    refresh,
    credentials,
    update,
    remove,
    abort,
  };
}

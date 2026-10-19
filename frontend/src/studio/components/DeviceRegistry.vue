<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from "vue";
import { useDeviceRegistry } from "../devices";
import type { Device } from "../types";

const props = defineProps<{ surface: "scrape" | "deploy" }>();
const emit = defineEmits<{ changed: [Device[]] }>();
const registry = useDeviceRegistry();
const url = ref("");
const role = ref<"leader" | "standalone">("standalone");
const passwordInput = ref<HTMLInputElement>();
const credentialInputs = new Map<string, HTMLInputElement>();
const busy = ref("");
const notice = ref("");
const error = ref("");

function recordInput(id: string, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLInputElement) credentialInputs.set(id, element);
  else credentialInputs.delete(id);
}
function parent(device: Device): string { return device.leader_id ? `Parent ${device.leader_id}` : "Direct registry target"; }
function sync(): void { emit("changed", [...registry.devices.value]); }
async function add(): Promise<void> {
  const password = passwordInput.value?.value ?? "";
  // Clear the DOM field before awaiting so a slow network request never retains a submitted secret.
  if (passwordInput.value) passwordInput.value.value = "";
  busy.value = "add"; error.value = ""; notice.value = "";
  try {
    await registry.add(url.value, password, role.value);
    url.value = "";
    notice.value = role.value === "leader" ? "Leader added; follower membership was refreshed." : "Standalone kiosk added.";
    sync();
  } catch (cause) { error.value = cause instanceof Error ? cause.message : "Device could not be added."; }
  finally { busy.value = ""; }
}
async function refresh(device: Device): Promise<void> {
  busy.value = `refresh:${device.id}`; error.value = "";
  try { await registry.refresh(device.id); notice.value = "Fleet membership refreshed."; sync(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : "Fleet refresh failed."; }
  finally { busy.value = ""; }
}
async function setCredentials(device: Device): Promise<void> {
  const input = credentialInputs.get(device.id);
  const password = input?.value ?? "";
  // Clear the DOM field before awaiting so a slow network request never retains a submitted secret.
  if (input) input.value = "";
  busy.value = `credentials:${device.id}`; error.value = "";
  try { await registry.credentials(device.id, password); notice.value = "Kiosk authenticated; token saved server-side."; sync(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : "Credentials were not saved."; }
  finally { busy.value = ""; }
}
onMounted(async () => { await registry.load(); sync(); });
onBeforeUnmount(() => registry.abort());
</script>

<template>
  <section class="studio-card" data-device-registry>
    <div class="flex flex-wrap items-start justify-between gap-3"><div><h2>Fleet setup</h2><p class="studio-muted">Register a fleet leader or standalone kiosks.</p></div><button type="button" :disabled="registry.loading.value" @click="registry.load(true)">Refresh registry</button></div>
    <details class="mt-3"><summary>Fleet safety details</summary><p class="studio-muted">Register one fleet leader or standalone kiosks. A leader is authoritative: its existing mirror can propagate selections and remove follower-only models. This studio never edits enabled selections or uploads directly to followers.</p><p v-if="props.surface === 'deploy'" class="studio-muted text-xs mt-3">Publication staging prerequisite: upload staging must start clean and no concurrent manual uploads may occur while the trainer owns a publication. This condition cannot be checked automatically.</p></details>
    <p v-if="notice" class="studio-note" role="status">{{ notice }}</p><p v-if="error || registry.error.value" class="studio-note" role="alert">{{ error || registry.error.value }}</p>
    <details data-device-registration class="mt-3" :open="!registry.devices.value.length"><summary>Add device</summary>
    <form data-device-add class="studio-registration-row" @submit.prevent="add">
      <label>Address<input v-model="url" required name="url" autocomplete="url" placeholder="http://kiosk.local:2324"></label>
      <label>Role<select v-model="role" name="role"><option value="standalone">Standalone</option><option value="leader">Fleet leader</option></select></label>
      <label>Admin password<input ref="passwordInput" required name="password" type="password" autocomplete="off"></label>
      <button type="submit" class="studio-primary" :disabled="busy === 'add'">Add device</button>
    </form>
    <p class="studio-muted text-xs mt-2">Use the kiosk's Remote Administration password. Studio saves only the resulting 10-year token, not your password. Submit only over a trusted connection.</p>
    </details>
    <p v-if="registry.loading.value" class="studio-muted mt-3">Loading registered devices…</p>
    <div v-else class="mt-4 grid gap-2">
      <article v-for="device in registry.devices.value" :key="device.id" class="studio-device-row" :data-device-id="device.id">
        <div><strong>{{ device.id }}</strong> <span class="studio-status" :class="device.role === 'follower' ? 'studio-status-muted' : 'studio-status-neutral'">{{ device.role === 'follower' ? 'Follower' : device.role }}</span><p class="studio-muted text-xs">{{ parent(device) }} · {{ device.active ? device.url : 'Inactive member' }}</p></div>
        <div class="flex flex-wrap gap-2 items-center"><span class="studio-status" :class="device.credentials_status === 'ready' ? 'studio-status-neutral' : 'studio-status-warning'">{{ device.credentials_status === 'ready' ? 'Credentials ready' : 'Credentials required' }}</span><span class="studio-status" :class="device.model_eligible ? 'studio-status-neutral' : 'studio-status-warning'">{{ device.model_eligible ? 'Profile covered' : 'Not covered' }}</span><button v-if="device.role === 'leader'" type="button" :disabled="busy === `refresh:${device.id}`" @click="refresh(device)">Refresh followers</button><form v-if="device.role === 'follower' && device.credentials_status !== 'ready'" class="flex gap-2" @submit.prevent="setCredentials(device)"><input :ref="element => recordInput(device.id, element)" :name="`credentials-${device.id}`" required type="password" autocomplete="off" aria-label="Follower admin password"><button type="submit" :disabled="busy === `credentials:${device.id}`">Authenticate</button></form></div>
      </article>
      <p v-if="!registry.devices.value.length" class="studio-muted">No kiosks registered yet.</p>
    </div>
  </section>
</template>

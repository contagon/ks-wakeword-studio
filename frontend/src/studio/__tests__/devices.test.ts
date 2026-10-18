import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DeviceRegistry from "../components/DeviceRegistry.vue";
import type { Device } from "../types";

const leader: Device = { id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true };
const follower: Device = { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "credentials_required", profile_id: "voice", model_eligible: true };
let devices: Device[];
let resolveCredentials: ((response: Response) => void) | undefined;
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  devices = [];
  resolveCredentials = undefined;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/devices" && (init?.method ?? "GET") === "GET") return response(devices);
    if (path === "/api/studio/devices" && init?.method === "POST") { devices = [leader, follower]; return response(leader, 201); }
    if (path.endsWith("/refresh")) return response([follower]);
    if (path.endsWith("/credentials")) return new Promise<Response>(resolve => { resolveCredentials = resolve; });
    return response({});
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("shared fleet registry", () => {
  it.each(["scrape", "deploy"] as const)("shares a leader added from the %s surface with the other surface and never offers follower deploy", async surface => {
    const other = surface === "scrape" ? "deploy" : "scrape";
    const first = mount(DeviceRegistry, { props: { surface } });
    await flushPromises();
    await first.get('input[name="url"]').setValue("http://leader");
    await first.get('input[name="token"]').setValue("super-secret-token");
    await first.get('form[data-device-add]').trigger("submit");
    await flushPromises();

    expect((first.get('input[name="token"]').element as HTMLInputElement).value).toBe("");
    expect(first.text()).toContain("Follower");
    const second = mount(DeviceRegistry, { props: { surface: other } });
    await flushPromises();
    expect(second.text()).toContain("Follower");
    expect(second.text()).toContain("Parent leader");
    expect(second.find('[data-action="upload-follower"]').exists()).toBe(false);
    expect(second.text()).not.toContain("super-secret-token");
    first.unmount();
    second.unmount();
  });

  it("clears a submitted follower credential synchronously while its request is pending", async () => {
    devices = [leader, follower];
    const ui = mount(DeviceRegistry, { props: { surface: "scrape" } });
    await flushPromises();
    const credential = ui.get('input[name="credentials-follower"]');
    await credential.setValue("pending-secret");
    await credential.trigger("submit");

    expect(resolveCredentials).toBeTypeOf("function");
    expect((credential.element as HTMLInputElement).value).toBe("");
    resolveCredentials?.(response(follower));
    await flushPromises();
    ui.unmount();
  });
});

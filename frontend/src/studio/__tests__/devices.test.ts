import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DeviceRegistry from "../components/DeviceRegistry.vue";
import type { Device } from "../types";

const leader: Device = { id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true };
const follower: Device = { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "credentials_required", profile_id: "voice", model_eligible: true };
let devices: Device[];
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  devices = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/devices" && (init?.method ?? "GET") === "GET") return response(devices);
    if (path === "/api/studio/devices" && init?.method === "POST") { devices = [leader, follower]; return response(leader, 201); }
    if (path.endsWith("/refresh")) return response([follower]);
    if (path.endsWith("/credentials")) return response(follower);
    return response({});
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("shared fleet registry", () => {
  it("shares a leader added from one registry, marks its discovered follower, clears credentials, and never offers follower upload", async () => {
    const scrape = mount(DeviceRegistry, { props: { surface: "scrape" } });
    await flushPromises();
    await scrape.get('input[name="url"]').setValue("http://leader");
    await scrape.get('input[name="token"]').setValue("super-secret-token");
    await scrape.get('form[data-device-add]').trigger("submit"); await flushPromises();
    expect((scrape.get('input[name="token"]').element as HTMLInputElement).value).toBe("");
    expect(scrape.text()).toContain("Follower");
    expect(scrape.text()).toContain("Credentials required");
    const deploy = mount(DeviceRegistry, { props: { surface: "deploy" } });
    await flushPromises();
    expect(deploy.text()).toContain("Follower");
    expect(deploy.text()).toContain("Parent leader");
    expect(deploy.find('[data-action="upload-follower"]').exists()).toBe(false);
    expect(deploy.text()).not.toContain("super-secret-token");
  });
});

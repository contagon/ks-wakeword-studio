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
  it("opens registration for an empty fleet and collapses it once configured", async () => {
    const ui = mount(DeviceRegistry, { props: { surface: "scrape" } });
    await flushPromises();
    expect(ui.get('details[data-device-registration]').attributes('open')).toBeDefined();
    await ui.get('input[name="url"]').setValue('http://leader');
    await ui.get('input[name="password"]').setValue('admin-password');
    await ui.get('form[data-device-add]').trigger('submit');
    await flushPromises();
    expect(ui.get('details[data-device-registration]').attributes('open')).toBeUndefined();
    expect(ui.get('[data-device-registration] summary').text()).toContain('Add device');
    ui.unmount();
  });
  it.each(["scrape", "deploy"] as const)("shares a leader added from the %s surface with the other surface and never offers follower deploy", async surface => {
    const other = surface === "scrape" ? "deploy" : "scrape";
    const first = mount(DeviceRegistry, { props: { surface } });
    await flushPromises();
    await first.get('input[name="url"]').setValue("http://leader");
    await first.get('input[name="password"]').setValue("super-secret-password");
    await first.get('form[data-device-add]').trigger("submit");
    await flushPromises();

    expect((first.get('input[name="password"]').element as HTMLInputElement).value).toBe("");
    const sent = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(sent?.[1]?.body as string)).toEqual({ url: "http://leader", password: "super-secret-password", role: "standalone" });
    expect(first.text()).toContain("Follower");
    const second = mount(DeviceRegistry, { props: { surface: other } });
    await flushPromises();
    expect(second.text()).toContain("Follower");
    expect(second.text()).toContain("Parent leader");
    expect(second.find('[data-action="upload-follower"]').exists()).toBe(false);
    expect(second.text()).not.toContain("super-secret-password");
    first.unmount();
    second.unmount();
  });

  it.each([200, 403])("clears a follower password while pending and after status %s", async status => {
    devices = [leader, follower];
    const ui = mount(DeviceRegistry, { props: { surface: "scrape" } });
    await flushPromises();
    const credential = ui.get('input[name="credentials-follower"]');
    await credential.setValue("pending-secret");
    await credential.trigger("submit");

    expect(resolveCredentials).toBeTypeOf("function");
    expect((credential.element as HTMLInputElement).value).toBe("");
    expect(credential.attributes("aria-label")).toBe("Follower admin password");
    const sent = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith("/credentials"));
    expect(JSON.parse(sent?.[1]?.body as string)).toEqual({ password: "pending-secret" });
    resolveCredentials?.(response(status === 200 ? follower : { detail: "Kiosk admin credentials required" }, status));
    await flushPromises();
    expect((credential.element as HTMLInputElement).value).toBe("");
    expect(ui.text()).not.toContain("pending-secret");
    ui.unmount();
  });

  it.each([201, 403])("clears registration password before the login finishes with status %s", async status => {
    const ui = mount(DeviceRegistry, { props: { surface: "scrape" } });
    await flushPromises();
    let finish: ((response: Response) => void) | undefined;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    await ui.get('input[name="url"]').setValue("http://leader");
    const password = ui.get('input[name="password"]');
    await password.setValue("registration-secret");
    await ui.get('form[data-device-add]').trigger("submit");
    expect((password.element as HTMLInputElement).value).toBe("");
    finish?.(response(status === 201 ? leader : { detail: "Kiosk admin credentials required" }, status));
    await flushPromises();
    expect((password.element as HTMLInputElement).value).toBe("");
    expect(ui.text()).not.toContain("registration-secret");
    const other = mount(DeviceRegistry, { props: { surface: "deploy" } });
    await flushPromises();
    expect(other.text()).not.toContain("registration-secret");
    ui.unmount(); other.unmount();
  });
});

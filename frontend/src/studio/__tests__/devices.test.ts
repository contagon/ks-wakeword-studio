import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DeviceRegistry from "../components/DeviceRegistry.vue";
import type { Device } from "../types";
import { useDeviceRegistry } from '../devices';

const leader: Device = { id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true };
const follower: Device = { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "credentials_required", profile_id: "voice", model_eligible: true };
let devices: Device[];
let resolveCredentials: ((response: Response) => void) | undefined;
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(async () => {
  devices = [];
  resolveCredentials = undefined;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/devices" && (init?.method ?? "GET") === "GET") return response(devices);
    if (path === "/api/studio/devices" && init?.method === "POST") { devices = [leader, follower]; return response(leader, 201); }
    if (path.endsWith("/refresh")) return response([follower]);
    if (path.endsWith("/credentials")) return new Promise<Response>(resolve => { resolveCredentials = resolve; });
    if (init?.method === 'PATCH') { const id = path.split('/').at(-1); devices = devices.map(d => d.id === id ? { ...d, ...JSON.parse(String(init.body)) } : d); return response(devices.find(d => d.id === id)); }
    if (init?.method === 'DELETE') { const id = path.split('/').at(-1); devices = devices.filter(d => d.id !== id && d.leader_id !== id); return new Response(null, { status: 204 }); }
    return response({});
  }));
  await useDeviceRegistry().load(true);
});
afterEach(() => vi.unstubAllGlobals());

describe("shared fleet registry", () => {
  it('shows satellite names, updates reactive labels, and falls back without opaque IDs', async () => {
    devices = [{ ...leader, name: 'Main kiosk' }, { ...follower, name: 'Kitchen satellite' }];
    await useDeviceRegistry().load(true);
    const ui = mount(DeviceRegistry, { props: { surface: 'kiosks' } }); await flushPromises();
    const row = () => ui.get('[data-device-id="follower"]');
    expect(row().get('strong').text()).toBe('Kitchen satellite');
    expect(row().text()).toContain('Parent Main kiosk');
    await row().get('[data-action="delete-device"]').trigger('click'); await flushPromises();
    expect(ui.get('[role="alertdialog"]').text()).toContain('Kitchen satellite');
    await ui.get('[data-action="cancel-device-delete"]').trigger('click');
    devices = [{ ...leader, name: 'Main kiosk' }, { ...follower, name: 'Main kiosk' }];
    await useDeviceRegistry().load(true); await flushPromises();
    expect(row().get('strong').text()).toBe('Main kiosk');
    devices = [leader, follower]; await useDeviceRegistry().load(true); await flushPromises();
    expect(row().get('strong').text()).toBe('http://follower');
    expect(useDeviceRegistry().deviceLabel('deleted-id')).toBe('Unknown kiosk');
    ui.unmount();
  });
  it('isolates removal confirmation and retains focus while busy, then restores a surviving control', async () => {
    devices = [leader, follower]; await useDeviceRegistry().load(true);
    const ui = mount(DeviceRegistry, { attachTo: document.body, props: { surface: 'kiosks' } }); await flushPromises();
    await ui.get('[data-device-id="follower"] [data-action="delete-device"]').trigger('click'); await flushPromises();
    expect(ui.get('[data-device-registry-content]').attributes('inert')).toBeDefined();
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    await ui.get('[data-action="confirm-device-delete"]').trigger('click'); await flushPromises();
    const dialog = ui.get('[role="alertdialog"]');
    expect(document.activeElement).toBe(dialog.element);
    await dialog.trigger('keydown', { key: 'Tab' }); expect(document.activeElement).toBe(dialog.element);
    devices = [leader]; finish(new Response(null, { status: 204 })); await flushPromises();
    expect(ui.find('[role="alertdialog"]').exists()).toBe(false);
    expect(ui.get('[data-device-registry-content]').attributes('inert')).toBeUndefined();
    expect(document.activeElement).toBe(ui.get('[data-action="refresh-registry"]').element);
    ui.unmount();
  });
  it('edits follower addresses, cancels edits, and confirms local removal', async () => {
    devices = [leader, follower];
    const ui = mount(DeviceRegistry, { props: { surface: 'kiosks' } });
    await flushPromises();
    await ui.get('button[data-action="refresh-registry"]').trigger('click'); await flushPromises();
    const row = () => ui.get('[data-device-id="follower"]');
    await row().get('[data-action="edit-device"]').trigger('click');
    expect(row().text()).toContain('retained when followers refresh');
    await row().get('input[name="device-url"]').setValue('http://10.8.0.9:2324');
    await row().get('form[data-device-edit]').trigger('submit'); await flushPromises();
    expect(row().text()).toContain('http://10.8.0.9:2324');
    await row().get('[data-action="edit-device"]').trigger('click');
    await row().get('input[name="device-url"]').setValue('http://discard');
    await row().get('[data-action="cancel-device-edit"]').trigger('click');
    expect(row().text()).not.toContain('http://discard');
    await row().get('[data-action="delete-device"]').trigger('click');
    expect(ui.get('[role="alertdialog"]').text()).toContain('rediscovered');
    await ui.get('[data-action="cancel-device-delete"]').trigger('click');
    expect(ui.find('[data-device-id="follower"]').exists()).toBe(true);
    await row().get('[data-action="delete-device"]').trigger('click');
    await ui.get('[data-action="confirm-device-delete"]').trigger('click'); await flushPromises();
    expect(ui.find('[data-device-id="follower"]').exists()).toBe(false);
    expect(ui.find('[data-device-id="leader"]').exists()).toBe(true);
    ui.unmount();
  });

  it('retains an edit and reports rejected saves without showing upstream secrets', async () => {
    devices = [leader];
    const ui = mount(DeviceRegistry, { props: { surface: 'kiosks' } }); await flushPromises();
    await ui.get('[data-action="refresh-registry"]').trigger('click'); await flushPromises();
    await ui.get('[data-action="edit-device"]').trigger('click');
    await ui.get('input[name="device-url"]').setValue('http://new-address');
    vi.mocked(fetch).mockResolvedValueOnce(response({ detail: 'upstream-secret' }, 422));
    await ui.get('form[data-device-edit]').trigger('submit'); await flushPromises();
    expect(ui.find('form[data-device-edit]').exists()).toBe(true);
    expect(ui.get('[role="alert"]').text()).toContain('Invalid studio request');
    expect(ui.text()).not.toContain('upstream-secret');
    await ui.get('[data-action="delete-device"]').trigger('click');
    expect(ui.get('[role="alertdialog"]').text()).toContain('discovered followers');
    ui.unmount();
  });
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
    expect(second.text()).toContain("Parent http://leader");
    expect(second.find('[data-action="upload-follower"]').exists()).toBe(false);
    expect(second.text()).not.toContain("super-secret-password");
    first.unmount();
    second.unmount();
  });

  it.each([200, 403])("clears a follower password while pending and after status %s", async status => {
    devices = [leader, follower];
    await useDeviceRegistry().load(true);
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

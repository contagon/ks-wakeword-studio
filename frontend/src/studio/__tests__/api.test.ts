import { afterEach, describe, expect, it, vi } from "vitest";
import { readModelMetrics, studioApi } from "../api";
afterEach(() => vi.unstubAllGlobals());

it("maps allowlisted operation codes without exposing arbitrary server error prose", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ code: "augmentation_missing", detail: "Authorization: Bearer private-secret" }), {
          status: 409,
        }),
    ),
  );
  await expect(studioApi.train("word")).rejects.toThrow("Downloaded");
  await expect(studioApi.train("word")).rejects.not.toThrow("private-secret");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () => new Response(JSON.stringify({ code: "unknown-secret", detail: "private-secret" }), { status: 409 }),
    ),
  );
  await expect(studioApi.train("word")).rejects.toThrow("Refresh");
});

describe("opaque model metrics", () => {
  it("narrows only known finite calibration numbers", () => {
    expect(
      readModelMetrics({ recall: 0.93, false_accepts_per_hour: 0.1, target_false_accepts_per_hour: null, secret: "x" }),
    ).toEqual({ recall: 0.93, false_accepts_per_hour: 0.1, target_false_accepts_per_hour: null });
    expect(readModelMetrics({ recall: "0.9", false_accepts_per_hour: Number.NaN })).toEqual({
      recall: null,
      false_accepts_per_hour: null,
      target_false_accepts_per_hour: null,
    });
    for (const value of [null, undefined, "x", 3, [0.9]]) {
      expect(readModelMetrics(value)).toEqual({
        recall: null,
        false_accepts_per_hour: null,
        target_false_accepts_per_hour: null,
      });
    }
  });
});

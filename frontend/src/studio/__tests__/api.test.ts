import { describe, expect, it } from "vitest";
import { readModelMetrics } from "../api";

describe("opaque model metrics", () => {
  it("narrows only known finite calibration numbers", () => {
    expect(readModelMetrics({ recall: 0.93, false_accepts_per_hour: 0.1, target_false_accepts_per_hour: null, secret: "x" }))
      .toEqual({ recall: 0.93, false_accepts_per_hour: 0.1, target_false_accepts_per_hour: null });
    expect(readModelMetrics({ recall: "0.9", false_accepts_per_hour: Number.NaN })).toEqual({ recall: null, false_accepts_per_hour: null, target_false_accepts_per_hour: null });
    for (const value of [null, undefined, "x", 3, [0.9]]) {
      expect(readModelMetrics(value)).toEqual({ recall: null, false_accepts_per_hour: null, target_false_accepts_per_hour: null });
    }
  });
});

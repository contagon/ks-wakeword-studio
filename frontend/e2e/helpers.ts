import { expect, type APIRequestContext } from "@playwright/test";

/** Create a wakeword through the real API. The model id defaults to the phrase; null lets the server derive one. */
export async function createWord(request: APIRequestContext, phrase: string, modelId: string | null = phrase) {
  const response = await request.post("/api/studio/wakewords", {
    data: { phrase, language: "en", ...(modelId === null ? {} : { model_id: modelId }) },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

import { ref, shallowRef } from "vue";

/** Owns every microphone resource, including permission grants arriving after reset. */
export function useMicrophoneCapture() {
  const state = ref<"idle" | "requesting" | "recording" | "stopping" | "review" | "error">("idle");
  const audio = shallowRef<File | null>(null);
  const error = ref("");
  const elapsed = ref(0);
  let generation = 0;
  let stream: MediaStream | undefined;
  let recorder: MediaRecorder | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  function release() {
    clearInterval(timer);
    timer = undefined;
    stream?.getTracks().forEach((track) => track.stop());
    stream = undefined;
  }
  function reset() {
    generation++;
    if (recorder) {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      recorder.onerror = null;
      if (recorder.state !== "inactive") recorder.stop();
      recorder = undefined;
    }
    release();
    audio.value = null;
    elapsed.value = 0;
    error.value = "";
    state.value = "idle";
  }
  function fail(message: string) {
    reset();
    error.value = message;
    state.value = "error";
  }
  async function start() {
    if (!["idle", "error"].includes(state.value)) return;
    reset();
    if (!window.isSecureContext) {
      fail("Microphone recording requires HTTPS or localhost. Open Studio using a secure connection.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      fail("Microphone recording is not supported by this browser. You can still upload audio below.");
      return;
    }
    const current = generation;
    state.value = "requesting";
    try {
      const granted = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (current !== generation) {
        granted.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = granted;
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find((type) =>
        MediaRecorder.isTypeSupported?.(type),
      );
      const next = new MediaRecorder(granted, mimeType ? { mimeType } : undefined);
      recorder = next;
      const chunks: Blob[] = [];
      let bytes = 0;
      next.ondataavailable = (event) => {
        if (current !== generation) return;
        bytes += event.data.size;
        if (bytes > 64 * 1024 * 1024) {
          fail("Recording exceeded the 64 MB limit. Please record a shorter sample.");
          return;
        }
        if (event.data.size) chunks.push(event.data);
      };
      next.onerror = () => {
        if (current === generation) fail("The microphone recording failed. Check your input device and try again.");
      };
      next.onstop = () => {
        if (current !== generation) return;
        release();
        recorder = undefined;
        const type = next.mimeType || chunks[0]?.type || "application/octet-stream";
        const blob = new Blob(chunks, { type });
        if (!blob.size) {
          fail("The recording was empty. Check your microphone and try again.");
          return;
        }
        const extension = type.includes("mp4") ? "mp4" : type.includes("ogg") ? "ogg" : "webm";
        audio.value = new File([blob], `microphone.${extension}`, { type });
        state.value = "review";
      };
      next.start(1000);
      state.value = "recording";
      const started = Date.now();
      timer = setInterval(() => {
        elapsed.value = Math.floor((Date.now() - started) / 1000);
        // Match the server's bounded audio limit; never auto-stop on silence.
        if (elapsed.value >= 600) stop();
      }, 250);
    } catch (cause) {
      if (current !== generation) return;
      const name = cause instanceof DOMException ? cause.name : "";
      fail(
        name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access in your browser and retry."
          : "Microphone unavailable. Check your input device and browser permissions.",
      );
    }
  }
  function stop() {
    if (state.value !== "recording" || !recorder) return;
    state.value = "stopping";
    clearInterval(timer);
    recorder.stop();
  }
  return { state, audio, error, elapsed, start, stop, reset, dispose: reset };
}

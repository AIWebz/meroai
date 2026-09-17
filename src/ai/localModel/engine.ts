import type { MLCEngine, InitProgressReport } from "@mlc-ai/web-llm";

// ---------------------------------------------------------------------------
// Singleton manager for the in-browser model engine (WebLLM / WebGPU).
//
// The model — Llama-3.2-1B-Instruct, quantized to ~0.9GB — is downloaded
// once from WebLLM's public model CDN directly by the browser (never
// through any server of ours) and cached by the browser itself, so
// subsequent loads are fast. Inference runs entirely on-device via WebGPU;
// no network call is made once the model is loaded.
// ---------------------------------------------------------------------------

export const LOCAL_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
export const LOCAL_MODEL_LABEL = "Llama 3.2 1B Instruct";
export const LOCAL_MODEL_APPROX_SIZE = "~900 MB";

let enginePromise: Promise<MLCEngine> | null = null;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function isModelCached(): Promise<boolean> {
  const { hasModelInCache } = await import("@mlc-ai/web-llm");
  return hasModelInCache(LOCAL_MODEL_ID);
}

/**
 * Returns the shared engine, loading (and downloading, if not cached) the
 * model on first call. Safe to call repeatedly — later calls reuse the same
 * in-flight or completed load rather than starting a second one.
 */
export function getOrCreateEngine(onProgress?: (report: InitProgressReport) => void): Promise<MLCEngine> {
  if (!isWebGPUSupported()) {
    return Promise.reject(new Error("This browser doesn't support WebGPU, which the in-browser model requires. Try a recent Chrome or Edge on desktop."));
  }

  if (!enginePromise) {
    enginePromise = import("@mlc-ai/web-llm")
      .then(({ CreateMLCEngine }) =>
        CreateMLCEngine(LOCAL_MODEL_ID, {
          initProgressCallback: onProgress,
        })
      )
      .catch((err) => {
        // Allow a retry on the next call instead of permanently caching a failure.
        enginePromise = null;
        throw err;
      });
  } else if (onProgress) {
    // A second caller arriving while a load is already in flight won't get
    // progress callbacks from CreateMLCEngine (it only takes one). Report a
    // generic "in progress" state so its UI doesn't look stuck.
    onProgress({ progress: 0, timeElapsed: 0, text: "Loading local model…" });
  }

  return enginePromise;
}

export function resetEngine(): void {
  enginePromise = null;
}

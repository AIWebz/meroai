import { create } from "zustand";

// ---------------------------------------------------------------------------
// Live loading status for the in-browser model (see ai/localModel/engine.ts).
// Intentionally NOT persisted — the engine itself lives only in this tab's
// memory and must be reloaded (quickly, from the browser's own cache) on
// every fresh page load, so there's nothing meaningful to restore here.
// ---------------------------------------------------------------------------

export type LocalModelStatus = "idle" | "loading" | "ready" | "error";

interface LocalModelState {
  status: LocalModelStatus;
  progress: number; // 0-1
  progressText: string;
  error: string | null;
  setLoading: (progress: number, text: string) => void;
  setReady: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useLocalModelStore = create<LocalModelState>()((set) => ({
  status: "idle",
  progress: 0,
  progressText: "",
  error: null,
  setLoading: (progress, progressText) => set({ status: "loading", progress, progressText, error: null }),
  setReady: () => set({ status: "ready", progress: 1, error: null }),
  setError: (error) => set({ status: "error", error }),
  reset: () => set({ status: "idle", progress: 0, progressText: "", error: null }),
}));

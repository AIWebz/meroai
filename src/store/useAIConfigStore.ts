import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Live AI connection settings — two independent ways to go live, both
// configured entirely client-side (never committed to the repo, never sent
// to us):
//
//   - localModelEnabled: run a small open-weight model entirely in this
//     browser via WebGPU (see ai/localModelProvider.ts). No key, no
//     backend, no network call once the model is loaded. Downloads ~900MB
//     once, cached by the browser afterward.
//   - backendUrl/backendSecret: point at a secure backend the user deployed
//     themselves (see server/mero-ai-backend). The key never enters the
//     browser at all in this mode.
//
// Kept separate from company/workspace data since it's a per-browser app
// setting, not business data.
// ---------------------------------------------------------------------------

interface AIConfigState {
  localModelEnabled: boolean;
  backendUrl: string;
  backendSecret: string;
  setLocalModelEnabled: (enabled: boolean) => void;
  setBackendUrl: (url: string) => void;
  setBackendSecret: (secret: string) => void;
  clear: () => void;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set) => ({
      localModelEnabled: false,
      backendUrl: "",
      backendSecret: "",
      setLocalModelEnabled: (localModelEnabled) => set({ localModelEnabled }),
      setBackendUrl: (backendUrl) => set({ backendUrl }),
      setBackendSecret: (backendSecret) => set({ backendSecret }),
      clear: () => set({ backendUrl: "", backendSecret: "" }),
    }),
    { name: "mero-ai-config" }
  )
);

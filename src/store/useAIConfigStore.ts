import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Live AI connection settings — two independent ways to go live, both
// configured entirely client-side (never committed to the repo, never sent
// to us):
//
//   - localApiKey: an Anthropic key the user pastes directly into Settings.
//     Stored only in this browser's localStorage; the browser calls Claude
//     directly (see ai/directBrowserProvider.ts). Zero deploy, but the key
//     is only as safe as this browser/device.
//   - backendUrl/backendSecret: point at a secure backend the user deployed
//     themselves (see server/mero-ai-backend). The key never enters the
//     browser at all in this mode.
//
// Kept separate from company/workspace data since it's a per-browser app
// setting, not business data.
// ---------------------------------------------------------------------------

interface AIConfigState {
  localApiKey: string;
  backendUrl: string;
  backendSecret: string;
  setLocalApiKey: (key: string) => void;
  setBackendUrl: (url: string) => void;
  setBackendSecret: (secret: string) => void;
  clearLocalApiKey: () => void;
  clear: () => void;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set) => ({
      localApiKey: "",
      backendUrl: "",
      backendSecret: "",
      setLocalApiKey: (localApiKey) => set({ localApiKey }),
      setBackendUrl: (backendUrl) => set({ backendUrl }),
      setBackendSecret: (backendSecret) => set({ backendSecret }),
      clearLocalApiKey: () => set({ localApiKey: "" }),
      clear: () => set({ backendUrl: "", backendSecret: "" }),
    }),
    { name: "mero-ai-config" }
  )
);

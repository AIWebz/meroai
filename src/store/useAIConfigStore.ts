import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Live AI connection settings. This never stores an AI provider's API key —
// only the URL of a secure backend the user deployed themselves (see
// server/mero-ai-backend) and an optional shared secret for that backend.
// Kept separate from company/workspace data since it's a per-browser app
// setting, not business data.
// ---------------------------------------------------------------------------

interface AIConfigState {
  backendUrl: string;
  backendSecret: string;
  setBackendUrl: (url: string) => void;
  setBackendSecret: (secret: string) => void;
  clear: () => void;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set) => ({
      backendUrl: "",
      backendSecret: "",
      setBackendUrl: (backendUrl) => set({ backendUrl }),
      setBackendSecret: (backendSecret) => set({ backendSecret }),
      clear: () => set({ backendUrl: "", backendSecret: "" }),
    }),
    { name: "mero-ai-config" }
  )
);

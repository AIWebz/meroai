import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// GitHub publish settings — a Personal Access Token the user generates in
// their own GitHub account and pastes in here, same "bring your own
// credential" pattern as the Stripe payment links and the AI backend URL:
// stored only in this browser's localStorage, sent only to api.github.com,
// never to any server of ours, never committed anywhere.
// ---------------------------------------------------------------------------

interface GithubState {
  token: string;
  repoName: string;
  setToken: (token: string) => void;
  setRepoName: (repoName: string) => void;
  clear: () => void;
}

export const useGithubStore = create<GithubState>()(
  persist(
    (set) => ({
      token: "",
      repoName: "",
      setToken: (token) => set({ token }),
      setRepoName: (repoName) => set({ repoName }),
      clear: () => set({ token: "" }),
    }),
    { name: "mero-github-config" }
  )
);

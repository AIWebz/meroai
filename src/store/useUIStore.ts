import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  commandBarOpen: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setCommandBarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandBarOpen: false,
      theme: "light",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandBarOpen: (open) => set({ commandBarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "mero-ui" }
  )
);

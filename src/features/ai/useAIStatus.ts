import { useAIConfigStore } from "../../store/useAIConfigStore";
import { LOCAL_MODEL_LABEL } from "../../ai/localModel/engine";

/** Reactive version of ai/resolveProvider.ts's isAIEnabled(), for rendering. */
export function useAIStatus() {
  const localModelEnabled = useAIConfigStore((s) => s.localModelEnabled);
  const backendUrl = useAIConfigStore((s) => s.backendUrl);

  const isLive = localModelEnabled || backendUrl.trim().length > 0;
  const activeMode = localModelEnabled
    ? `an AI model running in this browser (${LOCAL_MODEL_LABEL})`
    : backendUrl.trim()
      ? "your connected backend"
      : null;

  return { isLive, activeMode };
}

import type { AIProvider } from "./provider";
import { demoProvider } from "./demoProvider";
import { BackendAIProvider } from "./backendProvider";
import { LocalModelAIProvider } from "./localModelProvider";
import { useAIConfigStore } from "../store/useAIConfigStore";

/**
 * Picks the active AIProvider based on the user's Settings > AI configuration.
 * Priority: an enabled in-browser model (no key, ever) > a configured
 * backend URL > demo. Called fresh on every chat send so a config change
 * takes effect immediately.
 */
export function resolveAIProvider(): AIProvider {
  const { localModelEnabled, backendUrl, backendSecret } = useAIConfigStore.getState();

  if (localModelEnabled) return new LocalModelAIProvider();

  const url = backendUrl.trim();
  if (url) return new BackendAIProvider(url, backendSecret.trim());

  return demoProvider;
}

/** True when a real (non-demo) AI provider is currently configured. */
export function isAIEnabled(): boolean {
  const { localModelEnabled, backendUrl } = useAIConfigStore.getState();
  return localModelEnabled || backendUrl.trim().length > 0;
}

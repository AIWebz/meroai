import type { AIProvider } from "./provider";
import { demoProvider } from "./demoProvider";
import { BackendAIProvider } from "./backendProvider";
import { useAIConfigStore } from "../store/useAIConfigStore";

/**
 * Picks the active AIProvider based on the user's Settings > AI configuration.
 * Live (BackendAIProvider) when a backend URL is configured, demo otherwise.
 * Called fresh on every chat send so a config change takes effect immediately.
 */
export function resolveAIProvider(): AIProvider {
  const { backendUrl, backendSecret } = useAIConfigStore.getState();
  const url = backendUrl.trim();
  if (url) return new BackendAIProvider(url, backendSecret.trim());
  return demoProvider;
}

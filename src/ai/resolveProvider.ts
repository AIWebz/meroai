import type { AIProvider } from "./provider";
import { demoProvider } from "./demoProvider";
import { BackendAIProvider } from "./backendProvider";
import { DirectBrowserAIProvider } from "./directBrowserProvider";
import { useAIConfigStore } from "../store/useAIConfigStore";

/**
 * Picks the active AIProvider based on the user's Settings > AI configuration.
 * Priority: a locally-entered API key (direct browser calls, zero setup) >
 * a configured backend URL (server-side key, needs a deploy) > demo.
 * Called fresh on every chat send so a config change takes effect immediately.
 */
export function resolveAIProvider(): AIProvider {
  const { localApiKey, backendUrl, backendSecret } = useAIConfigStore.getState();

  const key = localApiKey.trim();
  if (key) return new DirectBrowserAIProvider(key);

  const url = backendUrl.trim();
  if (url) return new BackendAIProvider(url, backendSecret.trim());

  return demoProvider;
}

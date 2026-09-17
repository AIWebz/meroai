import type { AIProvider } from "./provider";
import { demoProvider } from "./demoProvider";
import { BackendAIProvider } from "./backendProvider";
import { DirectBrowserAIProvider } from "./directBrowserProvider";
import { LocalModelAIProvider } from "./localModelProvider";
import { useAIConfigStore } from "../store/useAIConfigStore";

/**
 * Picks the active AIProvider based on the user's Settings > AI configuration.
 * Priority: an enabled in-browser model (no key, ever) > a locally-entered
 * API key (direct browser calls) > a configured backend URL > demo.
 * Called fresh on every chat send so a config change takes effect immediately.
 */
export function resolveAIProvider(): AIProvider {
  const { localModelEnabled, localApiKey, backendUrl, backendSecret } = useAIConfigStore.getState();

  if (localModelEnabled) return new LocalModelAIProvider();

  const key = localApiKey.trim();
  if (key) return new DirectBrowserAIProvider(key);

  const url = backendUrl.trim();
  if (url) return new BackendAIProvider(url, backendSecret.trim());

  return demoProvider;
}

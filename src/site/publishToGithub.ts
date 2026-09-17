import type { StaticFile } from "./renderStaticSite";

// ---------------------------------------------------------------------------
// Pushes the generated static site straight to the user's own GitHub account
// and turns on GitHub Pages for it, using a Personal Access Token they paste
// into Mero (see useGithubStore.ts) — no backend, no OAuth flow, nothing of
// ours in between. Calls the GitHub REST API directly from the browser.
// ---------------------------------------------------------------------------

const API = "https://api.github.com";

export interface PublishResult {
  repoUrl: string;
  pagesUrl: string;
}

export interface PublishProgress {
  step: string;
  fileIndex?: number;
  fileCount?: number;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubError(res: Response, action: string): Promise<Error> {
  let detail = "";
  try {
    const body = await res.json();
    detail = body?.message ? `: ${body.message}` : "";
  } catch {
    // ignore — some error responses aren't JSON
  }
  if (res.status === 401) return new Error("GitHub rejected the token — check it's correct and hasn't expired.");
  if (res.status === 403) return new Error(`GitHub denied this request${detail || " — the token may be missing the 'repo' scope"}.`);
  return new Error(`Failed to ${action} (${res.status})${detail}`);
}

export function slugifyRepoName(companyName: string): string {
  return (
    companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-mero-site"
  );
}

export async function publishToGithub(
  token: string,
  repoName: string,
  files: StaticFile[],
  description: string,
  onProgress?: (p: PublishProgress) => void
): Promise<PublishResult> {
  if (!token.trim()) throw new Error("Paste a GitHub personal access token first.");
  const repo = repoName.trim();
  if (!repo) throw new Error("Choose a repository name first.");
  const h = headers(token.trim());

  onProgress?.({ step: "Verifying token…" });
  const meRes = await fetch(`${API}/user`, { headers: h });
  if (!meRes.ok) throw await githubError(meRes, "verify the token");
  const me = await meRes.json();
  const owner = me.login as string;

  onProgress?.({ step: "Preparing repository…" });
  let defaultBranch = "main";
  let repoUrl = `https://github.com/${owner}/${repo}`;
  const existingRes = await fetch(`${API}/repos/${owner}/${repo}`, { headers: h });
  if (existingRes.ok) {
    const existing = await existingRes.json();
    defaultBranch = existing.default_branch || "main";
    repoUrl = existing.html_url;
  } else if (existingRes.status === 404) {
    const createRes = await fetch(`${API}/user/repos`, {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ name: repo, description, private: false, has_issues: false, has_projects: false, has_wiki: false }),
    });
    if (!createRes.ok) throw await githubError(createRes, "create the repository");
    const created = await createRes.json();
    defaultBranch = created.default_branch || "main";
    repoUrl = created.html_url;
  } else {
    throw await githubError(existingRes, "look up the repository");
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({ step: `Uploading ${file.path}…`, fileIndex: i + 1, fileCount: files.length });
    const path = encodeURIComponent(file.path).replace(/%2F/g, "/");
    let sha: string | undefined;
    const getRes = await fetch(`${API}/repos/${owner}/${repo}/contents/${path}`, { headers: h });
    if (getRes.ok) {
      const existingFile = await getRes.json();
      sha = existingFile.sha;
    } else if (getRes.status !== 404) {
      throw await githubError(getRes, `check ${file.path}`);
    }
    const putRes = await fetch(`${API}/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: sha ? `Update ${file.path} via Mero` : `Add ${file.path} via Mero`,
        content: toBase64(file.content),
        sha,
      }),
    });
    if (!putRes.ok) throw await githubError(putRes, `upload ${file.path}`);
  }

  onProgress?.({ step: "Enabling GitHub Pages…" });
  let pagesUrl = `https://${owner}.github.io/${repo}/`;
  const pagesRes = await fetch(`${API}/repos/${owner}/${repo}/pages`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ source: { branch: defaultBranch, path: "/" } }),
  });
  if (pagesRes.ok) {
    const pages = await pagesRes.json();
    pagesUrl = pages.html_url || pagesUrl;
  } else if (pagesRes.status === 409) {
    const existingPagesRes = await fetch(`${API}/repos/${owner}/${repo}/pages`, { headers: h });
    if (existingPagesRes.ok) {
      const pages = await existingPagesRes.json();
      pagesUrl = pages.html_url || pagesUrl;
    }
  } else {
    throw await githubError(pagesRes, "enable GitHub Pages");
  }

  return { repoUrl, pagesUrl };
}

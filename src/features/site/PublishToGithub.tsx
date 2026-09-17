import { useState } from "react";
import { GitBranch, ExternalLink, RefreshCw } from "lucide-react";
import { Badge, Button, Card, Field, Input } from "../../components/ui";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useGithubStore } from "../../store/useGithubStore";
import { renderStaticSite } from "../../site/renderStaticSite";
import { publishToGithub, slugifyRepoName } from "../../site/publishToGithub";

export function PublishToGithub() {
  const company = useWorkspaceStore((s) => s.company)!;
  const website = useWorkspaceStore((s) => s.website)!;
  const markPublished = useWorkspaceStore((s) => s.markPublished);
  const { token, repoName, setToken, setRepoName } = useGithubStore();
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveRepoName = repoName || slugifyRepoName(company.name);

  async function publish() {
    setError(null);
    setPublishing(true);
    try {
      const files = renderStaticSite(company, website);
      const result = await publishToGithub(token, effectiveRepoName, files, company.tagline, (p) => setStep(p.step));
      markPublished(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed.");
    } finally {
      setPublishing(false);
      setStep("");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-ink-soft" />
        <p className="text-[13px] font-semibold text-ink">Publish to GitHub</p>
        {company.github && <Badge tone="moss">Published</Badge>}
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-ink-faint">
        Pushes the site above as real static files to a repository in your own GitHub account and turns on GitHub
        Pages. Needs a{" "}
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=Mero"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-moss-600 hover:text-moss-700"
        >
          personal access token
        </a>{" "}
        with "repo" scope. Stored only in this browser, sent only to api.github.com.
      </p>

      <div className="space-y-3">
        <Field label="GitHub personal access token">
          <Input type="password" placeholder="ghp_..." value={token} onChange={(e) => setToken(e.target.value)} />
        </Field>
        <Field label="Repository name">
          <Input placeholder={slugifyRepoName(company.name)} value={repoName} onChange={(e) => setRepoName(e.target.value)} />
        </Field>
      </div>

      {error && <p className="mt-3 text-[12.5px] text-rose-500">{error}</p>}

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={publish} disabled={publishing || !token.trim()}>
          {publishing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
          {publishing ? step || "Publishing…" : company.github ? "Re-publish" : "Publish to GitHub"}
        </Button>
      </div>

      {company.github && (
        <div className="mt-4 space-y-1.5 border-t border-line pt-4">
          <a href={company.github.pagesUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[13px] font-medium text-moss-600 hover:text-moss-700">
            {company.github.pagesUrl} <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href={company.github.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink">
            {company.github.repoUrl} <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-[11.5px] text-ink-faint/80">GitHub Pages can take a minute to go live after the first publish.</p>
        </div>
      )}
    </Card>
  );
}

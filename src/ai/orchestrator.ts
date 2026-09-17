import type { AIProvider, AIRequestContext } from "./provider";
import { demoProvider } from "./demoProvider";
import type { Activity, Approval, Company, Opportunity, Task } from "../types";

// ---------------------------------------------------------------------------
// AIOrchestrator
//
//   AIProvider -> AIOrchestrator -> Mero's assistant chat
//
// The orchestrator is the only thing the UI talks to for conversational
// replies. It's a thin wrapper — which provider it holds (demo or a live
// backend) is decided by the caller via src/ai/resolveProvider.ts, so this
// class stays provider-agnostic and easy to reason about.
// ---------------------------------------------------------------------------

export class AIOrchestrator {
  private provider: AIProvider;

  constructor(provider: AIProvider = demoProvider) {
    this.provider = provider;
  }

  get isLive() {
    return this.provider.isLive;
  }

  async chat(personaId: string, message: string, context: Omit<AIRequestContext, "personaId">) {
    return this.provider.chat(message, { personaId, ...context });
  }
}

// ---------------------------------------------------------------------------
// Daily briefing. This is deliberately NOT a model call — it's a direct
// summary of real local workspace state, so it's always labeled as
// demo/template content regardless of whether live AI is connected. It never
// fabricates a number that isn't present in the data passed to it.
// ---------------------------------------------------------------------------

export interface BriefingSection {
  heading: string;
  items: string[];
}

export interface Briefing {
  generatedAt: string;
  isDemo: boolean;
  sections: BriefingSection[];
}

export function generateBriefing(input: {
  company: Company;
  tasks: Task[];
  approvals: Approval[];
  activity: Activity[];
  opportunities: Opportunity[];
}): Briefing {
  const { tasks, approvals, activity, opportunities } = input;

  const completed = tasks.filter((t) => t.status === "completed");
  const failed = tasks.filter((t) => t.status === "failed");
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const activeOpportunities = opportunities.filter((o) => !o.dismissed);
  const recentActivity = [...activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const sections: BriefingSection[] = [
    {
      heading: "What happened",
      items: recentActivity.length > 0 ? recentActivity.map((a) => a.title) : ["No activity yet."],
    },
    {
      heading: "Completed",
      items: completed.length > 0 ? completed.slice(0, 5).map((t) => t.title) : ["Nothing completed yet."],
    },
    {
      heading: "Problems detected",
      items: failed.length > 0 ? failed.map((t) => t.title) : ["No problems detected."],
    },
    {
      heading: "Opportunities detected",
      items:
        activeOpportunities.length > 0
          ? activeOpportunities.map((o) => o.title)
          : ["No opportunities yet — connect data to unlock opportunity detection."],
    },
    {
      heading: "Approvals needed",
      items: pendingApprovals.length > 0 ? pendingApprovals.map((a) => a.title) : ["Nothing waiting on you right now."],
    },
    {
      heading: "Recommended next actions",
      items: buildRecommendations(input),
    },
  ];

  // Always a template summary of real local data, never model-generated —
  // so it's always labeled as such, independent of whether live AI chat is connected.
  return { generatedAt: new Date().toISOString(), isDemo: true, sections };
}

function buildRecommendations(input: { company: Company; tasks: Task[]; approvals: Approval[]; opportunities: Opportunity[] }): string[] {
  const recs: string[] = [];
  if (!input.company.github) recs.push("Publish your site to GitHub when you're ready to go live.");
  if (input.approvals.some((a) => a.status === "pending")) recs.push("Review pending approvals.");
  if (input.opportunities.some((o) => !o.dismissed)) recs.push("Review detected opportunities.");
  if (input.tasks.length === 0) recs.push("Add your first task to start tracking what's next.");
  if (recs.length === 0) recs.push("Everything looks on track.");
  return recs;
}

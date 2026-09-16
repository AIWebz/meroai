import type { AIProvider, AIRequestContext } from "./provider";
import { demoProvider } from "./demoProvider";
import type { Activity, Approval, Company, Employee, Opportunity, Task } from "../types";

// ---------------------------------------------------------------------------
// AIOrchestrator
//
//   AIProvider -> AIOrchestrator -> AI CEO / AI Employees -> Tasks
//
// The orchestrator is the only thing the UI talks to. It currently wraps the
// local DemoAIProvider; swapping in a live provider (see provider.ts) does
// not require touching any page or component.
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

  /**
   * Builds the daily AI CEO briefing from current workspace state. Entirely
   * derived from local data — never fabricates numbers that aren't present.
   */
  generateBriefing(input: {
    company: Company;
    employees: Employee[];
    tasks: Task[];
    approvals: Approval[];
    activity: Activity[];
    opportunities: Opportunity[];
  }): Briefing {
    const { employees, tasks, approvals, activity, opportunities } = input;
    const hired = employees.filter((e) => e.isHired);

    const completedToday = tasks.filter((t) => t.status === "completed");
    const failed = tasks.filter((t) => t.status === "failed");
    const pendingApprovals = approvals.filter((a) => a.status === "pending");
    const activeOpportunities = opportunities.filter((o) => !o.dismissed);
    const recentActivity = [...activity]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);

    const sections: BriefingSection[] = [
      {
        heading: "What happened",
        items:
          recentActivity.length > 0
            ? recentActivity.map((a) => a.title)
            : ["No activity yet — your AI workforce hasn't started working."],
      },
      {
        heading: "What the workforce completed",
        items:
          completedToday.length > 0
            ? completedToday.slice(0, 5).map((t) => `${t.title} (${hired.find((e) => e.id === t.employeeId)?.name ?? "Employee"})`)
            : ["Nothing completed yet."],
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
        items:
          pendingApprovals.length > 0
            ? pendingApprovals.map((a) => a.title)
            : ["Nothing waiting on you right now."],
      },
      {
        heading: "Recommended next actions",
        items: buildRecommendations(input),
      },
    ];

    return { generatedAt: new Date().toISOString(), isDemo: !this.isLive, sections };
  }
}

function buildRecommendations(input: {
  employees: Employee[];
  tasks: Task[];
  approvals: Approval[];
  opportunities: Opportunity[];
}): string[] {
  const recs: string[] = [];
  const hired = input.employees.filter((e) => e.isHired);
  if (hired.length === 0) recs.push("Hire your first AI employee to start operating.");
  if (input.approvals.some((a) => a.status === "pending")) recs.push("Review pending approvals.");
  if (input.opportunities.some((o) => !o.dismissed)) recs.push("Review detected opportunities.");
  if (input.tasks.length === 0) recs.push("Assign your workforce their first task.");
  if (recs.length === 0) recs.push("Everything looks on track — check back after your team completes more work.");
  return recs;
}

export const orchestrator = new AIOrchestrator();

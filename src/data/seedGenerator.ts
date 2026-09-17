import type { Activity, Goal, KnowledgeDocument, Opportunity, Task } from "../types";
import type { CompanyBlueprint } from "./companyGenerator";
import { id, now } from "../utils/id";

export function seedGoals(companyId: string, blueprint: CompanyBlueprint): Goal[] {
  const entries: { title: string; targetValue: string }[] = [
    { title: blueprint.goalSummary.launch, targetValue: "Site live" },
    { title: blueprint.goalSummary.customer, targetValue: "10 customers" },
    { title: blueprint.goalSummary.revenue, targetValue: "$1,000 / month" },
  ];
  return entries.map((e) => ({
    id: id("goal"),
    companyId,
    title: e.title,
    targetValue: e.targetValue,
    currentValue: null,
    deadline: null,
    status: "not_started",
    strategy: "Connect data sources so Mero can propose a concrete strategy for this goal.",
    relatedTaskIds: [],
    createdAt: now(),
  }));
}

export function seedTasks(companyId: string, blueprint: CompanyBlueprint): Task[] {
  const templates =
    blueprint.productType === "tool"
      ? [
          { title: "Try your tool end to end", description: "Walk through the generated site as a new user would." },
          { title: "Publish to GitHub", description: "Push the generated site live and share the link." },
        ]
      : [
          { title: "Connect a Stripe payment link", description: "Add a real checkout link to your first product." },
          { title: "Publish to GitHub", description: "Push the generated site live and share the link." },
        ];
  return templates.map((t, i) => ({
    id: id("task"),
    companyId,
    title: t.title,
    description: t.description,
    status: "pending",
    priority: i === 0 ? "high" : "medium",
    createdAt: now(),
    updatedAt: now(),
    result: null,
    requiresApproval: false,
    approvalId: null,
  }));
}

export function seedActivity(companyId: string, companyName: string, tasks: Task[]): Activity[] {
  const activity: Activity[] = [
    {
      id: id("act"),
      companyId,
      kind: "company_created",
      title: `${companyName} was created`,
      description: "Mero generated the company's brand, offerings, goals, and site.",
      createdAt: now(),
      isDemo: true,
    },
  ];

  tasks.forEach((t) => {
    activity.push({
      id: id("act"),
      companyId,
      kind: "task_created",
      title: `Created task: ${t.title}`,
      description: t.description,
      createdAt: now(),
      isDemo: true,
    });
  });

  return activity;
}

export function seedOpportunities(companyId: string): Opportunity[] {
  return [
    {
      id: id("opp"),
      companyId,
      title: "Connect a data source to unlock opportunity detection",
      description: "Mero looks for patterns in connected sales, analytics, or CRM data to surface real opportunities. None are connected yet.",
      recommendedAction: "Connect a real data source (like Stripe) to unlock this.",
      requiresIntegration: true,
      isDemo: true,
      createdAt: now(),
      dismissed: false,
    },
  ];
}

export function seedKnowledge(companyId: string, blueprint: CompanyBlueprint): KnowledgeDocument[] {
  const docs: { category: KnowledgeDocument["category"]; title: string; content: string }[] = [
    { category: "description", title: "Company Description", content: blueprint.description },
    { category: "brand_voice", title: "Brand Voice", content: `${blueprint.brand.voice} Personality: ${blueprint.brand.personality.join(", ")}.` },
    { category: "products", title: blueprint.productType === "tool" ? "Plans" : "Products", content: blueprint.offerings.map((o) => `${o.name} — ${o.description} (${o.pricingConcept})`).join("\n") },
    { category: "customers", title: "Target Customers", content: blueprint.targetAudience },
    { category: "goals", title: "Company Goals", content: Object.values(blueprint.goalSummary).join("\n") },
    { category: "policies", title: "Policies", content: "No policies documented yet. Add refund, shipping, or service policies here." },
    { category: "decisions", title: "Important Decisions", content: "No decisions logged yet." },
  ];
  return docs.map((d) => ({ id: id("kdoc"), companyId, ...d, updatedAt: now() }));
}

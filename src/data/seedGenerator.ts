import type {
  Activity,
  Approval,
  Employee,
  EmployeeRoleKey,
  Goal,
  KnowledgeDocument,
  Opportunity,
  Task,
} from "../types";
import type { CompanyBlueprint } from "./companyGenerator";
import { EMPLOYEE_CATALOG, catalogFor } from "./employeeCatalog";
import { id, now } from "../utils/id";

/**
 * Instantiates one Employee record per catalog role. Only the roles the user
 * kept in `hiredKeys` are marked `isHired` — the rest exist as "recommended
 * but not hired" so the Workforce page can offer them without the company
 * generator having silently created a full staff.
 */
export function seedEmployees(companyId: string, hiredKeys: EmployeeRoleKey[]): Employee[] {
  return EMPLOYEE_CATALOG.map((entry) => {
    const isHired = entry.roleKey === "ceo" || hiredKeys.includes(entry.roleKey);
    return {
      id: id("emp"),
      companyId,
      roleKey: entry.roleKey,
      name: entry.name,
      title: entry.title,
      avatarGlyph: entry.avatarGlyph,
      status: isHired ? "active" : "idle",
      goal: entry.defaultGoal,
      currentTask: null,
      permissions: entry.defaultPermissions,
      tasksCompleted: 0,
      hiredAt: now(),
      isHired,
      memory: [],
    } satisfies Employee;
  });
}

export function seedGoals(companyId: string, blueprint: CompanyBlueprint): Goal[] {
  const entries: { title: string; targetValue: string }[] = [
    { title: blueprint.goalSummary.launch, targetValue: "Website live" },
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

export function seedTasks(companyId: string, employees: Employee[]): Task[] {
  const hired = employees.filter((e) => e.isHired && e.roleKey !== "ceo");
  const tasks: Task[] = [];

  hired.slice(0, 3).forEach((emp, i) => {
    const templates = taskTemplatesFor(emp.roleKey);
    const template = templates[i % templates.length];
    tasks.push({
      id: id("task"),
      companyId,
      title: template.title,
      description: template.description,
      employeeId: emp.id,
      status: i === 0 ? "working" : "pending",
      priority: i === 0 ? "high" : "medium",
      createdAt: now(),
      updatedAt: now(),
      result: null,
      requiresApproval: template.requiresApproval,
      approvalId: null,
      runs: [],
    });
  });

  return tasks;
}

function taskTemplatesFor(roleKey: EmployeeRoleKey): { title: string; description: string; requiresApproval: boolean }[] {
  switch (roleKey) {
    case "marketing":
      return [
        { title: "Draft launch campaign concept", description: "Put together a first campaign concept aligned with the brand voice.", requiresApproval: false },
        { title: "Outline social media content plan", description: "Plan the first two weeks of content.", requiresApproval: false },
      ];
    case "sales":
      return [{ title: "Build initial outreach list", description: "Identify early prospects that match the target audience.", requiresApproval: false }];
    case "support":
      return [{ title: "Draft support FAQ", description: "Prepare answers to likely early customer questions.", requiresApproval: false }];
    case "developer":
      return [{ title: "Review generated website structure", description: "Check the generated site for consistency before publish.", requiresApproval: false }];
    case "research":
      return [{ title: "Research top 3 competitors", description: "Summarize positioning and pricing of comparable companies.", requiresApproval: false }];
    case "analyst":
      return [{ title: "Set up baseline reporting structure", description: "Prepare a reporting template for once data is connected.", requiresApproval: false }];
    case "operations":
      return [{ title: "Map initial operating workflow", description: "Document the core repeatable workflow for this business.", requiresApproval: false }];
    default:
      return [{ title: "Get oriented", description: "Review company goals and brand.", requiresApproval: false }];
  }
}

export function seedActivity(companyId: string, companyName: string, employees: Employee[], tasks: Task[]): Activity[] {
  const activity: Activity[] = [
    {
      id: id("act"),
      companyId,
      employeeId: null,
      kind: "company_created",
      title: `${companyName} was created`,
      description: "Mero generated the company structure, brand, and initial AI workforce.",
      createdAt: now(),
      isDemo: true,
    },
  ];

  employees
    .filter((e) => e.isHired)
    .forEach((e) => {
      activity.push({
        id: id("act"),
        companyId,
        employeeId: e.id,
        kind: "employee_hired",
        title: `${e.name} joined the company`,
        description: catalogFor(e.roleKey).description,
        createdAt: now(),
        isDemo: true,
      });
    });

  tasks.forEach((t) => {
    activity.push({
      id: id("act"),
      companyId,
      employeeId: t.employeeId,
      kind: "task_created",
      title: `Created task: ${t.title}`,
      description: t.description,
      createdAt: now(),
      isDemo: true,
    });
  });

  return activity;
}

export function seedApprovals(companyId: string, employees: Employee[]): Approval[] {
  const ceo = employees.find((e) => e.roleKey === "ceo");
  if (!ceo) return [];
  return [
    {
      id: id("appr"),
      companyId,
      taskId: null,
      employeeId: ceo.id,
      kind: "publish_website",
      title: "Publish generated website",
      reason: "Mero has prepared an initial website draft. Publishing makes it publicly visible.",
      details: "Review the Website Builder before publishing — every page and section can still be edited.",
      status: "pending",
      createdAt: now(),
      resolvedAt: null,
    },
  ];
}

export function seedOpportunities(companyId: string): Opportunity[] {
  return [
    {
      id: id("opp"),
      companyId,
      title: "Connect a data source to unlock opportunity detection",
      description: "Mero looks for patterns in connected sales, analytics, or CRM data to surface real opportunities. None are connected yet.",
      recommendedAction: "Connect a real data source (like Stripe) to unlock this.",
      relatedEmployeeId: null,
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
    { category: "products", title: "Products & Services", content: blueprint.offerings.map((o) => `${o.name} — ${o.description} (${o.pricingConcept})`).join("\n") },
    { category: "customers", title: "Target Customers", content: blueprint.targetAudience },
    { category: "goals", title: "Company Goals", content: Object.values(blueprint.goalSummary).join("\n") },
    { category: "policies", title: "Policies", content: "No policies documented yet. Add refund, shipping, or service policies here." },
    { category: "decisions", title: "Important Decisions", content: "No decisions logged yet." },
  ];
  return docs.map((d) => ({ id: id("kdoc"), companyId, ...d, updatedAt: now() }));
}

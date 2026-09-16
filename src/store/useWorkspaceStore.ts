import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Activity,
  Approval,
  ApprovalKind,
  ChatMessage,
  Company,
  CompanySettings,
  Employee,
  EmployeeRoleKey,
  Goal,
  KnowledgeDocument,
  Opportunity,
  Task,
  TaskPriority,
  User,
  Website,
  WebsiteComponent,
} from "../types";
import { id, now } from "../utils/id";
import { generateBlueprint, type CompanyBlueprint } from "../data/companyGenerator";
import { generateWebsite } from "../data/websiteGenerator";
import {
  seedActivity,
  seedApprovals,
  seedEmployees,
  seedGoals,
  seedKnowledge,
  seedOpportunities,
  seedTasks,
} from "../data/seedGenerator";
import { catalogFor } from "../data/employeeCatalog";

const APPROVAL_KIND_LABEL: Record<ApprovalKind, string> = {
  publish_campaign: "Publish campaign",
  send_campaign: "Send campaign",
  change_pricing: "Change pricing",
  publish_website: "Publish website",
  send_bulk_email: "Send bulk email",
  spend_budget: "Spend advertising budget",
  delete_content: "Delete content",
  other: "Approval needed",
};

interface WorkspaceState {
  user: User;
  company: Company | null;
  settings: CompanySettings | null;
  employees: Employee[];
  tasks: Task[];
  approvals: Approval[];
  activity: Activity[];
  goals: Goal[];
  opportunities: Opportunity[];
  knowledge: KnowledgeDocument[];
  website: Website | null;
  chatMessages: ChatMessage[];

  // company lifecycle
  createCompany: (blueprint: CompanyBlueprint, originalIdea: string, hiredKeys: EmployeeRoleKey[]) => void;
  resetWorkspace: () => void;
  updateCompany: (patch: Partial<Company>) => void;
  updateSettings: (patch: Partial<CompanySettings>) => void;
  updateUser: (patch: Partial<User>) => void;

  // workforce
  hireEmployee: (roleKey: EmployeeRoleKey) => void;
  pauseEmployee: (employeeId: string) => void;
  activateEmployee: (employeeId: string) => void;

  // tasks
  createTask: (input: { title: string; description: string; employeeId: string; priority?: TaskPriority; requiresApproval?: boolean; approvalKind?: ApprovalKind; approvalReason?: string }) => Task;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string, result: string) => void;
  failTask: (taskId: string, reason: string) => void;
  cancelTask: (taskId: string) => void;

  // approvals
  approveApproval: (approvalId: string) => void;
  rejectApproval: (approvalId: string) => void;

  // activity
  logActivity: (input: Omit<Activity, "id" | "companyId" | "createdAt">) => void;

  // goals
  addGoal: (input: { title: string; targetValue: string; deadline: string | null }) => void;
  updateGoal: (goalId: string, patch: Partial<Goal>) => void;
  removeGoal: (goalId: string) => void;

  // opportunities
  dismissOpportunity: (opportunityId: string) => void;

  // knowledge
  updateKnowledge: (docId: string, content: string) => void;

  // website
  updateWebsite: (patch: Partial<Website>) => void;
  updateWebsiteComponent: (pageId: string, componentId: string, patch: Partial<WebsiteComponent>) => void;
  publishWebsite: () => void;

  // chat
  addChatMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      user: { id: "user_local", name: "You", email: "you@example.com", role: "owner", createdAt: now() },
      company: null,
      settings: null,
      employees: [],
      tasks: [],
      approvals: [],
      activity: [],
      goals: [],
      opportunities: [],
      knowledge: [],
      website: null,
      chatMessages: [],

      createCompany: (blueprint, originalIdea, hiredKeys) => {
        const companyId = id("company");
        const company: Company = {
          id: companyId,
          name: blueprint.name,
          tagline: blueprint.tagline,
          description: blueprint.description,
          industry: blueprint.industry,
          businessModel: blueprint.businessModel,
          targetAudience: blueprint.targetAudience,
          originalIdea,
          brand: blueprint.brand,
          offerings: blueprint.offerings,
          goalSummary: blueprint.goalSummary,
          createdAt: now(),
          isDemo: true,
        };
        const settings: CompanySettings = {
          companyId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
          currency: "USD",
          autoApproveUnderRisk: "none",
          notifyOnApprovalNeeded: true,
          notifyOnTaskFailed: true,
          notifyOnDailyBriefing: true,
        };
        const employees = seedEmployees(companyId, hiredKeys);
        const tasks = seedTasks(companyId, employees);
        const goals = seedGoals(companyId, blueprint);
        const activity = seedActivity(companyId, company.name, employees, tasks);
        const opportunities = seedOpportunities(companyId);
        const knowledge = seedKnowledge(companyId, blueprint);
        const website = generateWebsite(companyId, blueprint);
        const approvals = seedApprovals(companyId, employees);

        set({
          company,
          settings,
          employees,
          tasks,
          goals,
          activity,
          opportunities,
          knowledge,
          website,
          approvals,
          chatMessages: [],
        });
      },

      resetWorkspace: () =>
        set({
          company: null,
          settings: null,
          employees: [],
          tasks: [],
          approvals: [],
          activity: [],
          goals: [],
          opportunities: [],
          knowledge: [],
          website: null,
          chatMessages: [],
        }),

      updateCompany: (patch) => set((s) => (s.company ? { company: { ...s.company, ...patch } } : s)),
      updateSettings: (patch) => set((s) => (s.settings ? { settings: { ...s.settings, ...patch } } : s)),
      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      hireEmployee: (roleKey) => {
        const company = get().company;
        if (!company) return;
        set((s) => ({
          employees: s.employees.map((e) =>
            e.roleKey === roleKey ? { ...e, isHired: true, status: "active", hiredAt: now() } : e
          ),
        }));
        const emp = get().employees.find((e) => e.roleKey === roleKey);
        if (emp) {
          get().logActivity({
            employeeId: emp.id,
            kind: "employee_hired",
            title: `${emp.name} joined the company`,
            description: catalogFor(roleKey).description,
            isDemo: true,
          });
        }
      },

      pauseEmployee: (employeeId) =>
        set((s) => ({ employees: s.employees.map((e) => (e.id === employeeId ? { ...e, status: "paused" } : e)) })),
      activateEmployee: (employeeId) =>
        set((s) => ({ employees: s.employees.map((e) => (e.id === employeeId ? { ...e, status: "active" } : e)) })),

      createTask: (input) => {
        const company = get().company;
        if (!company) throw new Error("No company");
        const task: Task = {
          id: id("task"),
          companyId: company.id,
          title: input.title,
          description: input.description,
          employeeId: input.employeeId,
          status: "pending",
          priority: input.priority ?? "medium",
          createdAt: now(),
          updatedAt: now(),
          result: null,
          requiresApproval: !!input.requiresApproval,
          approvalId: null,
          runs: [],
        };

        let approval: Approval | null = null;
        if (input.requiresApproval) {
          approval = {
            id: id("appr"),
            companyId: company.id,
            taskId: task.id,
            employeeId: input.employeeId,
            kind: input.approvalKind ?? "other",
            title: APPROVAL_KIND_LABEL[input.approvalKind ?? "other"],
            reason: input.approvalReason ?? "This action needs your approval before it goes live.",
            details: input.description,
            status: "pending",
            createdAt: now(),
            resolvedAt: null,
          };
          task.status = "awaiting_approval";
          task.approvalId = approval.id;
        }

        set((s) => ({
          tasks: [task, ...s.tasks],
          approvals: approval ? [approval, ...s.approvals] : s.approvals,
        }));

        get().logActivity({
          employeeId: input.employeeId,
          kind: "task_created",
          title: `Created task: ${task.title}`,
          description: task.description,
          isDemo: true,
        });
        if (approval) {
          get().logActivity({
            employeeId: input.employeeId,
            kind: "approval_requested",
            title: `Requested approval: ${approval.title}`,
            description: approval.reason,
            isDemo: true,
          });
        }
        return task;
      },

      startTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: "working", updatedAt: now() } : t)),
          employees: s.employees.map((e) => {
            const task = s.tasks.find((t) => t.id === taskId);
            return task && e.id === task.employeeId ? { ...e, status: "working", currentTask: task.title } : e;
          }),
        })),

      completeTask: (taskId, result) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: "completed", result, updatedAt: now() } : t)),
          employees: s.employees.map((e) =>
            e.id === task.employeeId ? { ...e, status: "active", currentTask: null, tasksCompleted: e.tasksCompleted + 1 } : e
          ),
        }));
        get().logActivity({
          employeeId: task.employeeId,
          kind: "task_completed",
          title: `Completed: ${task.title}`,
          description: result,
          isDemo: true,
        });
      },

      failTask: (taskId, reason) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: "failed", result: reason, updatedAt: now() } : t)),
          employees: s.employees.map((e) => (e.id === task.employeeId ? { ...e, status: "active", currentTask: null } : e)),
        }));
        get().logActivity({
          employeeId: task.employeeId,
          kind: "task_failed",
          title: `Failed: ${task.title}`,
          description: reason,
          isDemo: true,
        });
      },

      cancelTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: "cancelled", updatedAt: now() } : t)) })),

      approveApproval: (approvalId) => {
        const approval = get().approvals.find((a) => a.id === approvalId);
        if (!approval) return;
        set((s) => ({
          approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: "approved", resolvedAt: now() } : a)),
        }));
        if (approval.taskId) {
          get().completeTask(approval.taskId, `Approved and completed: ${approval.title}.`);
        }
        if (approval.kind === "publish_website") {
          get().publishWebsite();
        }
        get().logActivity({
          employeeId: approval.employeeId,
          kind: "approval_approved",
          title: `Approved: ${approval.title}`,
          description: approval.reason,
          isDemo: true,
        });
      },

      rejectApproval: (approvalId) => {
        const approval = get().approvals.find((a) => a.id === approvalId);
        if (!approval) return;
        set((s) => ({
          approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: "rejected", resolvedAt: now() } : a)),
        }));
        if (approval.taskId) get().cancelTask(approval.taskId);
        get().logActivity({
          employeeId: approval.employeeId,
          kind: "approval_rejected",
          title: `Rejected: ${approval.title}`,
          description: approval.reason,
          isDemo: true,
        });
      },

      logActivity: (input) => {
        const company = get().company;
        if (!company) return;
        const entry: Activity = { id: id("act"), companyId: company.id, createdAt: now(), ...input };
        set((s) => ({ activity: [entry, ...s.activity] }));
      },

      addGoal: (input) => {
        const company = get().company;
        if (!company) return;
        const goal: Goal = {
          id: id("goal"),
          companyId: company.id,
          title: input.title,
          targetValue: input.targetValue,
          currentValue: null,
          deadline: input.deadline,
          status: "not_started",
          strategy: "Connect data sources so Mero can propose a concrete strategy for this goal.",
          relatedTaskIds: [],
          createdAt: now(),
        };
        set((s) => ({ goals: [goal, ...s.goals] }));
        get().logActivity({ employeeId: null, kind: "goal_created", title: `New goal: ${goal.title}`, description: goal.targetValue, isDemo: true });
      },
      updateGoal: (goalId, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)) })),
      removeGoal: (goalId) => set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) })),

      dismissOpportunity: (opportunityId) =>
        set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === opportunityId ? { ...o, dismissed: true } : o)) })),

      updateKnowledge: (docId, content) =>
        set((s) => ({ knowledge: s.knowledge.map((k) => (k.id === docId ? { ...k, content, updatedAt: now() } : k)) })),

      updateWebsite: (patch) =>
        set((s) => (s.website ? { website: { ...s.website, ...patch, lastEditedAt: now() } } : s)),
      updateWebsiteComponent: (pageId, componentId, patch) =>
        set((s) => {
          if (!s.website) return s;
          return {
            website: {
              ...s.website,
              lastEditedAt: now(),
              pages: s.website.pages.map((p) =>
                p.id !== pageId
                  ? p
                  : { ...p, components: p.components.map((c) => (c.id === componentId ? { ...c, ...patch } : c)) }
              ),
            },
          };
        }),
      publishWebsite: () => {
        set((s) => (s.website ? { website: { ...s.website, isPublished: true, lastEditedAt: now() } } : s));
        get().logActivity({ employeeId: null, kind: "website_edited", title: "Website published", description: "The company website was published.", isDemo: true });
      },

      addChatMessage: (message) => set((s) => ({ chatMessages: [...s.chatMessages, { id: id("msg"), createdAt: now(), ...message }] })),
    }),
    {
      name: "mero-workspace",
      version: 1,
    }
  )
);

export function buildBlueprintFromIdea(idea: string): CompanyBlueprint {
  return generateBlueprint(idea);
}

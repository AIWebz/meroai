// ---------------------------------------------------------------------------
// Mero data models
//
// These types describe the full product surface (company, workforce, tasks,
// approvals, goals, website, knowledge...) independent of how
// they are persisted. Today they are stored in the browser (see src/store).
// A future backend can serialize/deserialize the same shapes over an API
// without requiring a frontend rewrite.
// ---------------------------------------------------------------------------

export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

// --- Company -----------------------------------------------------------

export type BusinessModel =
  | "ecommerce"
  | "subscription"
  | "marketplace"
  | "saas"
  | "services"
  | "content"
  | "other";

export interface BrandIdentity {
  personality: string[]; // e.g. ["Premium", "Warm", "Confident"]
  voice: string; // short description of tone/voice
  colors: { name: string; hex: string }[];
  logoConcept: string; // text description of the logo mark
}

export interface Offering {
  id: ID;
  name: string;
  description: string;
  pricingConcept: string;
  positioning: string;
  /** A real Stripe Payment Link (buy.stripe.com/...) the user created in their own Stripe Dashboard. Undefined until connected. */
  stripePaymentLinkUrl?: string;
}

export interface CompanyGoalSummary {
  launch: string;
  customer: string;
  revenue: string;
  growth: string;
}

export interface Company {
  id: ID;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  businessModel: BusinessModel;
  targetAudience: string;
  originalIdea: string;
  brand: BrandIdentity;
  offerings: Offering[];
  goalSummary: CompanyGoalSummary;
  createdAt: string;
  isDemo: boolean;
}

export interface CompanySettings {
  companyId: ID;
  timezone: string;
  currency: string;
  autoApproveUnderRisk: "none" | "low" | "medium"; // how much Mero can do without asking
  notifyOnApprovalNeeded: boolean;
  notifyOnTaskFailed: boolean;
  notifyOnDailyBriefing: boolean;
}

// --- Workforce -----------------------------------------------------------

export type EmployeeRoleKey =
  | "ceo"
  | "sales"
  | "marketing"
  | "support"
  | "research"
  | "analyst"
  | "developer"
  | "operations";

export type EmployeeStatus = "active" | "idle" | "working" | "paused";

export type EmployeePermission =
  | "view_company_data"
  | "edit_website"
  | "publish_website"
  | "send_email"
  | "send_bulk_email"
  | "manage_campaigns"
  | "spend_budget"
  | "change_pricing"
  | "manage_tasks"
  | "respond_to_customers"
  | "access_integrations";

export interface EmployeeMemoryEntry {
  id: ID;
  createdAt: string;
  summary: string;
}

export type EmployeeMemory = EmployeeMemoryEntry[];

export interface Employee {
  id: ID;
  companyId: ID;
  roleKey: EmployeeRoleKey;
  name: string;
  title: string;
  avatarGlyph: string; // single letter / icon key used for the avatar
  status: EmployeeStatus;
  goal: string;
  currentTask: string | null;
  permissions: EmployeePermission[];
  tasksCompleted: number;
  hiredAt: string;
  isHired: boolean; // recommended employees exist as "not yet hired"
  memory: EmployeeMemory;
}

export interface ChatMessage {
  id: ID;
  threadId: ID; // 'ceo' or an employee id
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isDemo: boolean;
}

// --- Tasks -----------------------------------------------------------

export type TaskStatus =
  | "pending"
  | "working"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskRun {
  id: ID;
  taskId: ID;
  startedAt: string;
  finishedAt: string | null;
  outcome: "success" | "failure" | null;
  log: string[];
}

export interface Task {
  id: ID;
  companyId: ID;
  title: string;
  description: string;
  employeeId: ID;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  result: string | null;
  requiresApproval: boolean;
  approvalId: ID | null;
  runs: TaskRun[];
}

// --- Approvals -----------------------------------------------------------

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalKind =
  | "publish_campaign"
  | "send_campaign"
  | "change_pricing"
  | "publish_website"
  | "send_bulk_email"
  | "spend_budget"
  | "delete_content"
  | "other";

export interface Approval {
  id: ID;
  companyId: ID;
  taskId: ID | null;
  employeeId: ID;
  kind: ApprovalKind;
  title: string;
  reason: string;
  details: string;
  status: ApprovalStatus;
  createdAt: string;
  resolvedAt: string | null;
}

// --- Activity -----------------------------------------------------------

export type ActivityKind =
  | "task_created"
  | "task_completed"
  | "task_failed"
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "employee_hired"
  | "goal_created"
  | "goal_updated"
  | "website_edited"
  | "company_created"
  | "opportunity_detected"
  | "payment_connected";

export interface Activity {
  id: ID;
  companyId: ID;
  employeeId: ID | null; // null = system/Mero-level event
  kind: ActivityKind;
  title: string;
  description: string;
  createdAt: string;
  isDemo: boolean;
}

// --- Goals -----------------------------------------------------------

export type GoalStatus = "not_started" | "in_progress" | "at_risk" | "achieved";

export interface Goal {
  id: ID;
  companyId: ID;
  title: string;
  targetValue: string;
  currentValue: string | null; // null = no connected data yet
  deadline: string | null;
  status: GoalStatus;
  strategy: string;
  relatedTaskIds: ID[];
  createdAt: string;
}

// --- Opportunities -----------------------------------------------------------

export interface Opportunity {
  id: ID;
  companyId: ID;
  title: string;
  description: string;
  recommendedAction: string;
  relatedEmployeeId: ID | null;
  requiresIntegration: boolean;
  isDemo: boolean;
  createdAt: string;
  dismissed: boolean;
}

// --- Knowledge -----------------------------------------------------------

export type KnowledgeCategory =
  | "description"
  | "brand_voice"
  | "products"
  | "services"
  | "customers"
  | "policies"
  | "goals"
  | "decisions";

export interface KnowledgeDocument {
  id: ID;
  companyId: ID;
  category: KnowledgeCategory;
  title: string;
  content: string;
  updatedAt: string;
}

// --- Website -----------------------------------------------------------

export type WebsiteComponentType =
  | "hero"
  | "text"
  | "features"
  | "testimonials"
  | "cta"
  | "faq"
  | "gallery"
  | "pricing"
  | "contact";

export interface WebsiteComponent {
  id: ID;
  type: WebsiteComponentType;
  heading?: string;
  subheading?: string;
  body?: string;
  items?: { title: string; description: string; meta?: string; url?: string }[];
  buttonLabel?: string;
}

export interface WebsitePage {
  id: ID;
  slug: string;
  title: string;
  components: WebsiteComponent[];
}

export interface Website {
  companyId: ID;
  pages: WebsitePage[];
  navigation: { label: string; pageSlug: string }[];
  theme: {
    primaryColor: string;
    style: "premium" | "minimal" | "bold" | "playful";
  };
  isPublished: boolean;
  lastEditedAt: string;
}

// --- Analytics -----------------------------------------------------------

export type AnalyticsEventKind =
  | "page_view"
  | "signup"
  | "purchase"
  | "task_metric";

export interface AnalyticsEvent {
  id: ID;
  companyId: ID;
  kind: AnalyticsEventKind;
  value: number;
  label: string;
  createdAt: string;
}

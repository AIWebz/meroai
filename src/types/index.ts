// ---------------------------------------------------------------------------
// Mero data models
//
// These types describe the full product surface (company, tasks,
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

/** What the user is building. Determines how the generated site presents itself and its offerings. */
export type ProductType = "tool" | "shop";

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

export interface GithubPublishInfo {
  repoUrl: string;
  pagesUrl: string;
  publishedAt: string;
}

export interface Company {
  id: ID;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  businessModel: BusinessModel;
  productType: ProductType;
  targetAudience: string;
  originalIdea: string;
  brand: BrandIdentity;
  offerings: Offering[];
  goalSummary: CompanyGoalSummary;
  createdAt: string;
  isDemo: boolean;
  github: GithubPublishInfo | null;
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

// --- Chat -----------------------------------------------------------

export interface ChatMessage {
  id: ID;
  threadId: ID; // always "assistant" — a single AI helper, not per-employee threads
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

export interface Task {
  id: ID;
  companyId: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  result: string | null;
  requiresApproval: boolean;
  approvalId: ID | null;
}

// --- Approvals -----------------------------------------------------------

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalKind =
  | "publish_campaign"
  | "send_campaign"
  | "change_pricing"
  | "send_bulk_email"
  | "spend_budget"
  | "delete_content"
  | "other";

export interface Approval {
  id: ID;
  companyId: ID;
  taskId: ID | null;
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
  | "goal_created"
  | "goal_updated"
  | "website_edited"
  | "company_created"
  | "company_published"
  | "opportunity_detected"
  | "payment_connected";

export interface Activity {
  id: ID;
  companyId: ID;
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

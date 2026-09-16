import type { EmployeePermission, EmployeeRoleKey } from "../types";

export interface EmployeeCatalogEntry {
  roleKey: EmployeeRoleKey;
  name: string;
  title: string;
  avatarGlyph: string;
  description: string;
  defaultGoal: string;
  defaultPermissions: EmployeePermission[];
  /** Business models / keywords that make this role especially relevant. */
  relevanceKeywords: string[];
  alwaysRecommend?: boolean;
}

export const EMPLOYEE_CATALOG: EmployeeCatalogEntry[] = [
  {
    roleKey: "ceo",
    name: "Mero",
    title: "AI CEO",
    avatarGlyph: "M",
    description: "Coordinates the company and the rest of the AI workforce.",
    defaultGoal: "Keep the company moving toward its goals.",
    defaultPermissions: ["view_company_data", "manage_tasks"],
    relevanceKeywords: [],
    alwaysRecommend: true,
  },
  {
    roleKey: "sales",
    name: "AI Sales",
    title: "AI Sales Manager",
    avatarGlyph: "S",
    description: "Handles sales workflows — pipeline, outreach, follow-ups.",
    defaultGoal: "Grow qualified pipeline and close rate.",
    defaultPermissions: ["view_company_data", "manage_tasks", "send_email"],
    relevanceKeywords: ["b2b", "sales", "enterprise", "clients", "deals", "services", "saas"],
  },
  {
    roleKey: "marketing",
    name: "AI Marketing",
    title: "AI Marketing Manager",
    avatarGlyph: "K",
    description: "Creates marketing strategies and campaigns.",
    defaultGoal: "Increase qualified customer acquisition.",
    defaultPermissions: ["view_company_data", "manage_tasks", "manage_campaigns"],
    relevanceKeywords: ["brand", "customers", "audience", "market", "consumer", "ecommerce", "content"],
    alwaysRecommend: true,
  },
  {
    roleKey: "support",
    name: "AI Support",
    title: "AI Support Lead",
    avatarGlyph: "U",
    description: "Handles customer questions and support workflows.",
    defaultGoal: "Keep response time low and satisfaction high.",
    defaultPermissions: ["view_company_data", "respond_to_customers"],
    relevanceKeywords: ["customer", "support", "service", "subscription", "members", "users"],
  },
  {
    roleKey: "research",
    name: "AI Research",
    title: "AI Research Analyst",
    avatarGlyph: "R",
    description: "Researches competitors, markets, and customers.",
    defaultGoal: "Keep the company informed about its market.",
    defaultPermissions: ["view_company_data", "access_integrations"],
    relevanceKeywords: ["market", "industry", "competitor", "trend", "niche"],
  },
  {
    roleKey: "analyst",
    name: "AI Analyst",
    title: "AI Data Analyst",
    avatarGlyph: "A",
    description: "Analyzes company data and reports what it finds.",
    defaultGoal: "Turn company data into clear, actionable insight.",
    defaultPermissions: ["view_company_data", "access_integrations"],
    relevanceKeywords: ["data", "metrics", "analytics", "revenue", "growth"],
  },
  {
    roleKey: "developer",
    name: "AI Developer",
    title: "AI Developer",
    avatarGlyph: "D",
    description: "Maintains the company's website and digital products.",
    defaultGoal: "Keep the website fast, accurate, and on-brand.",
    defaultPermissions: ["view_company_data", "edit_website"],
    relevanceKeywords: ["app", "software", "platform", "product", "website", "tech", "saas"],
    alwaysRecommend: true,
  },
  {
    roleKey: "operations",
    name: "AI Operations",
    title: "AI Operations Manager",
    avatarGlyph: "O",
    description: "Handles repetitive operational workflows.",
    defaultGoal: "Reduce manual operational overhead.",
    defaultPermissions: ["view_company_data", "manage_tasks"],
    relevanceKeywords: ["logistics", "inventory", "fulfillment", "shipping", "operations", "supply"],
  },
];

export function catalogFor(roleKey: EmployeeRoleKey): EmployeeCatalogEntry {
  const entry = EMPLOYEE_CATALOG.find((e) => e.roleKey === roleKey);
  if (!entry) throw new Error(`Unknown role: ${roleKey}`);
  return entry;
}

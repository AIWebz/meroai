import type { Integration } from "../types";

export const INTEGRATIONS_CATALOG: Integration[] = [
  { id: "gmail", name: "Gmail", category: "communication", description: "Send and receive company email through Gmail.", status: "available" },
  { id: "outlook", name: "Outlook", category: "communication", description: "Connect Outlook for email and calendar sync.", status: "coming_soon" },
  { id: "sms", name: "SMS", category: "communication", description: "Send text updates and campaigns to customers.", status: "coming_soon" },
  { id: "shopify", name: "Shopify", category: "commerce", description: "Sync orders, products, and customers from Shopify.", status: "available" },
  { id: "stripe", name: "Stripe", category: "commerce", description: "Connect payments and revenue data from Stripe.", status: "available" },
  { id: "google_analytics", name: "Google Analytics", category: "analytics", description: "Bring in website traffic and visitor behavior.", status: "available" },
  { id: "search_console", name: "Search Console", category: "analytics", description: "Track search performance and indexing.", status: "coming_soon" },
  { id: "slack", name: "Slack", category: "productivity", description: "Get AI workforce updates in your Slack workspace.", status: "coming_soon" },
  { id: "calendar", name: "Calendar", category: "productivity", description: "Sync meetings and deadlines with your calendar.", status: "coming_soon" },
];

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    issueId: v.string(),
    issueLabel: v.string(),
    language: v.string(),
    region: v.string(),
    submittedAt: v.number(),
  })
    .index("by_issueId", ["issueId"])
    .index("by_language", ["language"])
    .index("by_region", ["region"])
    .index("by_submittedAt", ["submittedAt"]),
  guides: defineTable({
    slug: v.string(),
    order: v.number(),
    title: v.string(),
    summary: v.string(),
    icon: v.string(),
    accent: v.string(),
    immediateActions: v.array(v.string()),
    contacts: v.array(
      v.object({
        name: v.string(),
        detail: v.string(),
        url: v.optional(v.string()),
      }),
    ),
    checklist: v.array(
      v.object({
        label: v.string(),
        detail: v.string(),
        required: v.boolean(),
      }),
    ),
    sourceNote: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),
});

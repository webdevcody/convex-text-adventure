import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  entries: defineTable({
    input: v.string(),
    response: v.string(),
    adventureId: v.id("adventures"),
  }),
  adventures: defineTable({
    characterClass: v.string(),
  }),
});

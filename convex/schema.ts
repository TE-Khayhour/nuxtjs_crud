import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    password: v.string(),
    role: v.string(),
  }).index("by_username", ["username"]),
  expenses: defineTable({
    userId: v.id("users"),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    paymentMethod: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  incomes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    paymentMethod: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});

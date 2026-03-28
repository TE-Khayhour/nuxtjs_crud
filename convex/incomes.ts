import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    paymentMethod: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("incomes", args);
  },
});

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("incomes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("incomes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("incomes").collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("incomes"),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    paymentMethod: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id("incomes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

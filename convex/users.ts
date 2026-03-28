import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }
    if (user.password !== args.password) {
      throw new Error("Incorrect password");
    }
    return user;
  },
});

export const register = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (existing) throw new Error("Username already taken");

    const userId = await ctx.db.insert("users", {
      username: args.username,
      password: args.password,
      role: "user",
    });
    return userId;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

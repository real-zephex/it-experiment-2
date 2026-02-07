import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserByClerkId = query({
  args: {
    clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    return user;
  },
});

export const listUsers = query({
  args: {
    page: v.optional(v.number()),
    page_size: v.optional(v.number()),
    status_filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const pageSize = args.page_size ?? 100;
    
    // Apply status filter if provided
    let users;
    if (args.status_filter && args.status_filter !== "all") {
      users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => 
          q.eq("status", args.status_filter as "pending" | "confirmed" | "disabled")
        )
        .order("desc")
        .collect();
    } else {
      users = await ctx.db
        .query("users")
        .order("desc")
        .collect();
    }

    // Simple pagination
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedUsers = users.slice(start, end);

    return {
      users: paginatedUsers,
      total: users.length,
      page,
      page_size: pageSize,
      has_more: end < users.length,
    };
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const pendingUsers = allUsers.filter((u) => u.status === "pending").length;
    const confirmedUsers = allUsers.filter((u) => u.status === "confirmed").length;
    const adminUsers = allUsers.filter((u) => u.role === "admin").length;

    const recentActions = await ctx.db
      .query("admin_actions")
      .withIndex("by_created_at")
      .order("desc")
      .take(5);

    return {
      totalUsers: allUsers.length,
      pendingUsers,
      confirmedUsers,
      adminUsers,
      recentActions,
    };
  },
});

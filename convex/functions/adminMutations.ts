import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";

// Helper to verify caller is admin
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const callerClerkId = identity.subject;
  const caller = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q: any) => q.eq("clerk_user_id", callerClerkId))
    .first();

  if (!caller || caller.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return { caller, callerClerkId };
}

// Log admin action
async function logAdminAction(
  ctx: any,
  callerClerkId: string,
  actionType: string,
  targetClerkUserId: string,
  details?: any
) {
  await ctx.db.insert("admin_actions", {
    by_clerk_user_id: callerClerkId,
    action_type: actionType,
    target_clerk_user_id: targetClerkUserId,
    details,
    created_at: Date.now(),
  });
}

export const confirmUser = mutation({
  args: {
    target_clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin
    const { callerClerkId } = await requireAdmin(ctx);

    // Find target user
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Update status to confirmed
    await ctx.db.patch(targetUser._id, {
      status: "confirmed",
      confirmed_at: Date.now(),
    });

    // Log action
    await logAdminAction(
      ctx,
      callerClerkId,
      "confirm_user",
      args.target_clerk_user_id
    );

    return { success: true };
  },
});

export const deleteUser = mutation({
  args: {
    target_clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin
    const { callerClerkId } = await requireAdmin(ctx);

    // Find target user in Convex
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Delete from Clerk using SDK
    const clerkApiKey = process.env.CLERK_SECRET_KEY;
    if (!clerkApiKey) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }

    try {
      const clerkClient = createClerkClient({ secretKey: clerkApiKey });
      await clerkClient.users.deleteUser(args.target_clerk_user_id);
    } catch (error) {
      console.error("Failed to delete user from Clerk:", error);
      throw new Error("Failed to delete user from Clerk");
    }

    // Delete from Convex
    await ctx.db.delete(targetUser._id);

    // Log action
    await logAdminAction(
      ctx,
      callerClerkId,
      "delete_user",
      args.target_clerk_user_id
    );

    return { success: true };
  },
});

export const disableUser = mutation({
  args: {
    target_clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin
    const { callerClerkId } = await requireAdmin(ctx);

    // Find target user
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Update status to disabled
    await ctx.db.patch(targetUser._id, {
      status: "disabled",
    });

    // Log action
    await logAdminAction(
      ctx,
      callerClerkId,
      "disable_user",
      args.target_clerk_user_id
    );

    return { success: true };
  },
});

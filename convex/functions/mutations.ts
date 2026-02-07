import { UserObject } from "../types";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

type CreateUserReturnProps = {
  status: boolean;
  id: string | null;
};

export const createUser = mutation({
  args: UserObject,
  handler: async (ctx, args): Promise<CreateUserReturnProps> => {
    try {
      // Check if user already exists (webhook idempotency)
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
        .first();

      if (existing) {
        // Update existing user's email/name if changed
        await ctx.db.patch(existing._id, {
          email: args.email,
          name: args.name,
        });
        return {
          status: true,
          id: existing._id,
        };
      }

      const id = await ctx.db.insert("users", args);
      return {
        status: true,
        id,
      };
    } catch (error) {
      console.error(`Error while adding user: ${error} `);
      return {
        status: false,
        id: null,
      };
    }
  },
});

export const deleteUserByClerkId = mutation({
  args: {
    clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }

    return { success: true };
  },
});

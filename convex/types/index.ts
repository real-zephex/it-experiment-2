import { v } from "convex/values";

export const UserObject = v.object({
  clerk_user_id: v.string(),
  role: v.union(v.literal("user"), v.literal("admin")),
  email: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("disabled")
  ),
  name: v.string(),
  created_at: v.number(),
  confirmed_at: v.optional(v.number()),
});

export const AdminActionObject = v.object({
  by_clerk_user_id: v.string(),
  action_type: v.string(),
  target_clerk_user_id: v.string(),
  details: v.optional(v.any()),
  created_at: v.number(),
});
import { defineTable, defineSchema } from "convex/server";
import { UserObject, AdminActionObject } from "./types";

export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk", ["clerk_user_id"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),
  admin_actions: defineTable(AdminActionObject)
    .index("by_admin", ["by_clerk_user_id"])
    .index("by_target", ["target_clerk_user_id"])
    .index("by_created_at", ["created_at"]),
});

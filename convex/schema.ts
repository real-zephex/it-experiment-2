import { defineTable, defineSchema } from "convex/server";
import {
  AdminActionObject,
  CartItemObject,
  CollectionObject,
  OrderEventObject,
  OrderObject,
  ProductObject,
  UserObject,
} from "./types";

export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk", ["clerk_user_id"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),
  admin_actions: defineTable(AdminActionObject)
    .index("by_created_at", ["created_at"])
    .index("by_actor", ["by_clerk_user_id"]),
  products: defineTable(ProductObject)
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"]),
  collections: defineTable(CollectionObject).index("by_slug", ["slug"]),
  cart_items: defineTable(CartItemObject)
    .index("by_user", ["clerk_user_id"])
    .index("by_user_and_product", ["clerk_user_id", "product_id"]),
  orders: defineTable(OrderObject)
    .index("by_user", ["clerk_user_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),
  order_events: defineTable(OrderEventObject)
    .index("by_order", ["order_id"])
    .index("by_created_at", ["created_at"]),
});

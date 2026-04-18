import { query } from "../_generated/server";
import { v } from "convex/values";

const userStatusFilter = v.union(
  v.literal("all"),
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("disabled"),
);

export const getUserByClerkId = query({
  args: {
    clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();
  },
});

export const listUsers = query({
  args: {
    page: v.optional(v.number()),
    page_size: v.optional(v.number()),
    status_filter: v.optional(userStatusFilter),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const pageSize = args.page_size ?? 100;
    const statusFilter = args.status_filter ?? "all";

    const users =
      statusFilter !== "all"
        ? await ctx.db
            .query("users")
            .withIndex("by_status", (q) => q.eq("status", statusFilter))
            .order("desc")
            .collect()
        : await ctx.db.query("users").order("desc").collect();

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
      .take(8);

    const productCount = await ctx.db.query("products").collect();
    const orderCount = await ctx.db.query("orders").collect();

    return {
      totalUsers: allUsers.length,
      pendingUsers,
      confirmedUsers,
      adminUsers,
      productCount: productCount.length,
      orderCount: orderCount.length,
      recentActions,
    };
  },
});

export const listPublishedProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

export const listAllProductsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listFeaturedProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .take(6);
  },
});

export const listCollections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("collections").order("desc").collect();
  },
});

export const getCollectionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!collection) {
      return null;
    }

    const products = await Promise.all(
      collection.product_ids.map(async (productId) => await ctx.db.get(productId)),
    );

    return {
      collection,
      products: products.filter((product) => product !== null),
    };
  },
});

export const getCart = query({
  args: { clerk_user_id: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .collect();

    const detailedItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        return {
          ...item,
          product,
        };
      }),
    );

    const validItems = detailedItems.filter(
      (
        item,
      ): item is typeof item & {
        product: NonNullable<typeof item.product>;
      } => item.product !== null,
    );
    const subtotal_cents = validItems.reduce(
      (total, item) => total + item.product.price_cents * item.quantity,
      0,
    );

    return {
      items: validItems,
      subtotal_cents,
      item_count: validItems.reduce((total, item) => total + item.quantity, 0),
    };
  },
});

export const getOrderById = query({
  args: {
    order_id: v.id("orders"),
    clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.order_id);
    if (!order || order.clerk_user_id !== args.clerk_user_id) {
      return null;
    }

    const events = await ctx.db
      .query("order_events")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id))
      .order("asc")
      .collect();

    return {
      order,
      events,
    };
  },
});

export const listOrdersForAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);
  },
});

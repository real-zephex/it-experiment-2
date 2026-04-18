import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import { mutation, type MutationCtx } from "../_generated/server";

async function requireAdmin(ctx: MutationCtx): Promise<{ callerClerkId: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const callerClerkId = identity.subject;
  const caller = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q) => q.eq("clerk_user_id", callerClerkId))
    .first();

  if (!caller || caller.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return { callerClerkId };
}

async function logAdminAction(
  ctx: MutationCtx,
  callerClerkId: string,
  actionType: string,
  targetClerkUserId?: string,
  details?: string,
): Promise<void> {
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
    const { callerClerkId } = await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetUser._id, {
      status: "confirmed",
      confirmed_at: Date.now(),
    });

    await logAdminAction(ctx, callerClerkId, "confirm_user", args.target_clerk_user_id);
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: {
    target_clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

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

    await ctx.db.delete(targetUser._id);
    await logAdminAction(ctx, callerClerkId, "delete_user", args.target_clerk_user_id);

    return { success: true };
  },
});

export const disableUser = mutation({
  args: {
    target_clerk_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.target_clerk_user_id))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetUser._id, {
      status: "disabled",
    });

    await logAdminAction(ctx, callerClerkId, "disable_user", args.target_clerk_user_id);

    return { success: true };
  },
});

export const createProduct = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    price_cents: v.number(),
    compare_at_price_cents: v.optional(v.number()),
    stock_count: v.number(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    tags: v.array(v.string()),
    image_url: v.string(),
    gallery_urls: v.array(v.string()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Product slug already exists");
    }

    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      ...args,
      created_at: now,
      updated_at: now,
    });

    await logAdminAction(ctx, callerClerkId, "create_product", undefined, args.slug);
    return { success: true, product_id: productId };
  },
});

export const updateProduct = mutation({
  args: {
    product_id: v.id("products"),
    name: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    price_cents: v.number(),
    compare_at_price_cents: v.optional(v.number()),
    stock_count: v.number(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    tags: v.array(v.string()),
    image_url: v.string(),
    gallery_urls: v.array(v.string()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const { product_id, ...data } = args;

    await ctx.db.patch(product_id, {
      ...data,
      updated_at: Date.now(),
    });

    await logAdminAction(ctx, callerClerkId, "update_product", undefined, String(product_id));
    return { success: true };
  },
});

export const deleteProduct = mutation({
  args: {
    product_id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    await ctx.db.delete(args.product_id);
    await logAdminAction(ctx, callerClerkId, "delete_product", undefined, String(args.product_id));
    return { success: true };
  },
});

export const createCollection = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    hero_image_url: v.string(),
    product_ids: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new Error("Collection slug already exists");
    }

    const now = Date.now();
    const collectionId = await ctx.db.insert("collections", {
      ...args,
      created_at: now,
      updated_at: now,
    });

    await logAdminAction(ctx, callerClerkId, "create_collection", undefined, args.slug);
    return { success: true, collection_id: collectionId };
  },
});

export const updateCollection = mutation({
  args: {
    collection_id: v.id("collections"),
    name: v.string(),
    description: v.string(),
    hero_image_url: v.string(),
    product_ids: v.array(v.id("products")),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const { collection_id, ...data } = args;

    await ctx.db.patch(collection_id, {
      ...data,
      updated_at: Date.now(),
    });

    await logAdminAction(ctx, callerClerkId, "update_collection", undefined, String(collection_id));
    return { success: true };
  },
});

export const deleteCollection = mutation({
  args: {
    collection_id: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    await ctx.db.delete(args.collection_id);
    await logAdminAction(ctx, callerClerkId, "delete_collection", undefined, String(args.collection_id));
    return { success: true };
  },
});

export const updateOrderStatus = mutation({
  args: {
    order_id: v.id("orders"),
    status: v.union(v.literal("processing"), v.literal("confirmed"), v.literal("ready"), v.literal("complete")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const { callerClerkId } = await requireAdmin(ctx);
    await ctx.db.patch(args.order_id, {
      status: args.status,
      updated_at: Date.now(),
    });
    await ctx.db.insert("order_events", {
      order_id: args.order_id,
      status: args.status,
      message: args.message,
      created_at: Date.now(),
    });

    await logAdminAction(ctx, callerClerkId, "update_order_status", undefined, `${args.order_id}:${args.status}`);
    return { success: true };
  },
});

export const seedDemoCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const { callerClerkId } = await requireAdmin(ctx);
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) {
      throw new Error("Catalog already has products");
    }

    const now = Date.now();
    const demoProducts = [
      {
        slug: "aero-strike-v1",
        name: "Aero Strike V1",
        subtitle: "Street Tempo Runner",
        description:
          "Breathable knit upper with high-rebound foam tuned for city speed sessions.",
        price_cents: 15900,
        compare_at_price_cents: 18900,
        stock_count: 24,
        status: "published" as const,
        tags: ["new", "performance", "running"],
        image_url:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        gallery_urls: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
        ],
        featured: true,
      },
      {
        slug: "court-velocity-88",
        name: "Court Velocity 88",
        subtitle: "Hybrid Trainer",
        description:
          "Stable sidewall chassis with responsive forefoot snap for all-court drills.",
        price_cents: 14200,
        compare_at_price_cents: 17200,
        stock_count: 40,
        status: "published" as const,
        tags: ["court", "training"],
        image_url:
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
        gallery_urls: [
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
        ],
        featured: true,
      },
      {
        slug: "metro-flyknit-pro",
        name: "Metro Flyknit Pro",
        subtitle: "Lifestyle Performance",
        description:
          "Adaptive knit silhouette with sculpted outsole for all-day movement.",
        price_cents: 17600,
        compare_at_price_cents: undefined,
        stock_count: 17,
        status: "published" as const,
        tags: ["lifestyle", "drop"],
        image_url:
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
        gallery_urls: [
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1200&q=80",
        ],
        featured: true,
      },
      {
        slug: "vector-grit-low",
        name: "Vector Grit Low",
        subtitle: "Streetwear Essential",
        description:
          "Low-profile suede layers with durable cupsole grip for daily wear.",
        price_cents: 12800,
        compare_at_price_cents: undefined,
        stock_count: 55,
        status: "published" as const,
        tags: ["streetwear", "core"],
        image_url:
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
        gallery_urls: [
          "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
        ],
        featured: false,
      },
    ];

    const productIds: string[] = [];
    for (const product of demoProducts) {
      const id = await ctx.db.insert("products", {
        ...product,
        created_at: now,
        updated_at: now,
      });
      productIds.push(String(id));
    }

    const allProducts = await ctx.db.query("products").collect();
    await ctx.db.insert("collections", {
      slug: "street-performance-edit",
      name: "Street Performance Edit",
      description: "Curated silhouettes engineered for pace and style.",
      hero_image_url:
        "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1400&q=80",
      product_ids: allProducts.map((product) => product._id),
      created_at: now,
      updated_at: now,
    });

    await logAdminAction(
      ctx,
      callerClerkId,
      "seed_demo_catalog",
      undefined,
      `${productIds.length} products`,
    );

    return { success: true, seeded_products: productIds.length };
  },
});

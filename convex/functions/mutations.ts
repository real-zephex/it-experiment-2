import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { UserObject } from "../types";

type CreateUserReturnProps = {
  status: boolean;
  id: string | null;
};

export const createUser = mutation({
  args: UserObject,
  handler: async (ctx, args): Promise<CreateUserReturnProps> => {
    try {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk", (q) => q.eq("clerk_user_id", args.clerk_user_id))
        .first();

      if (existing) {
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

export const addToCart = mutation({
  args: {
    clerk_user_id: v.string(),
    product_id: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.product_id);
    if (!product || product.status !== "published") {
      throw new Error("Product unavailable");
    }

    if (args.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const current = await ctx.db
      .query("cart_items")
      .withIndex("by_user_and_product", (q) =>
        q.eq("clerk_user_id", args.clerk_user_id).eq("product_id", args.product_id),
      )
      .first();

    const now = Date.now();
    if (current) {
      const nextQuantity = Math.min(current.quantity + args.quantity, product.stock_count);
      await ctx.db.patch(current._id, {
        quantity: nextQuantity,
        updated_at: now,
      });
      return { success: true, quantity: nextQuantity };
    }

    const quantity = Math.min(args.quantity, product.stock_count);
    await ctx.db.insert("cart_items", {
      clerk_user_id: args.clerk_user_id,
      product_id: args.product_id,
      quantity,
      created_at: now,
      updated_at: now,
    });

    return { success: true, quantity };
  },
});

export const updateCartQuantity = mutation({
  args: {
    clerk_user_id: v.string(),
    cart_item_id: v.id("cart_items"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cart_item_id);
    if (!cartItem || cartItem.clerk_user_id !== args.clerk_user_id) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(cartItem._id);
      return { success: true };
    }

    const product = await ctx.db.get(cartItem.product_id);
    if (!product) {
      throw new Error("Product no longer exists");
    }

    await ctx.db.patch(cartItem._id, {
      quantity: Math.min(args.quantity, product.stock_count),
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

export const removeCartItem = mutation({
  args: {
    clerk_user_id: v.string(),
    cart_item_id: v.id("cart_items"),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cart_item_id);
    if (!cartItem || cartItem.clerk_user_id !== args.clerk_user_id) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(cartItem._id);
    return { success: true };
  },
});

export const createDemoOrder = mutation({
  args: {
    clerk_user_id: v.string(),
    shipping_name: v.string(),
    shipping_email: v.string(),
    shipping_address: v.string(),
    payment_method: v.union(v.literal("card"), v.literal("paypal"), v.literal("apple_pay")),
  },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Your cart is empty");
    }

    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        if (!product) {
          throw new Error("A product in your cart no longer exists");
        }
        if (product.stock_count < item.quantity) {
          throw new Error(`${product.name} is low on stock`);
        }

        return {
          cartItem: item,
          product,
        };
      }),
    );

    const orderItems = items.map(({ cartItem, product }) => ({
      product_id: product._id,
      name: product.name,
      unit_price_cents: product.price_cents,
      quantity: cartItem.quantity,
    }));

    const subtotal_cents = orderItems.reduce(
      (total, item) => total + item.unit_price_cents * item.quantity,
      0,
    );
    const tax_cents = Math.round(subtotal_cents * 0.08);
    const total_cents = subtotal_cents + tax_cents;
    const now = Date.now();

    const orderId = await ctx.db.insert("orders", {
      clerk_user_id: args.clerk_user_id,
      status: "processing",
      subtotal_cents,
      tax_cents,
      total_cents,
      shipping_name: args.shipping_name,
      shipping_email: args.shipping_email,
      shipping_address: args.shipping_address,
      payment_method: args.payment_method,
      items: orderItems,
      created_at: now,
      updated_at: now,
    });

    await ctx.db.insert("order_events", {
      order_id: orderId,
      status: "processing",
      message: "Order received and queued for verification.",
      created_at: now,
    });

    await ctx.db.insert("order_events", {
      order_id: orderId,
      status: "confirmed",
      message: "Demo payment approved and inventory reserved.",
      created_at: now + 1000,
    });

    await ctx.db.insert("order_events", {
      order_id: orderId,
      status: "ready",
      message: "Warehouse packed your pair and marked it ready.",
      created_at: now + 2000,
    });

    for (const { cartItem, product } of items) {
      await ctx.db.patch(product._id, {
        stock_count: Math.max(product.stock_count - cartItem.quantity, 0),
        updated_at: now,
      });
      await ctx.db.delete(cartItem._id);
    }

    return { success: true, order_id: orderId };
  },
});

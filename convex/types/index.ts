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
  target_clerk_user_id: v.optional(v.string()),
  details: v.optional(v.string()),
  created_at: v.number(),
});

export const ProductStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const ProductObject = v.object({
  slug: v.string(),
  name: v.string(),
  subtitle: v.optional(v.string()),
  description: v.string(),
  price_cents: v.number(),
  compare_at_price_cents: v.optional(v.number()),
  stock_count: v.number(),
  status: ProductStatus,
  tags: v.array(v.string()),
  image_url: v.string(),
  gallery_urls: v.array(v.string()),
  featured: v.boolean(),
  created_at: v.number(),
  updated_at: v.number(),
});

export const CollectionObject = v.object({
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  hero_image_url: v.string(),
  product_ids: v.array(v.id("products")),
  created_at: v.number(),
  updated_at: v.number(),
});

export const CartItemObject = v.object({
  clerk_user_id: v.string(),
  product_id: v.id("products"),
  quantity: v.number(),
  created_at: v.number(),
  updated_at: v.number(),
});

export const OrderStatus = v.union(
  v.literal("processing"),
  v.literal("confirmed"),
  v.literal("ready"),
  v.literal("complete"),
);

export const OrderItemObject = v.object({
  product_id: v.id("products"),
  name: v.string(),
  unit_price_cents: v.number(),
  quantity: v.number(),
});

export const OrderObject = v.object({
  clerk_user_id: v.string(),
  status: OrderStatus,
  subtotal_cents: v.number(),
  tax_cents: v.number(),
  total_cents: v.number(),
  shipping_name: v.string(),
  shipping_email: v.string(),
  shipping_address: v.string(),
  payment_method: v.union(v.literal("card"), v.literal("paypal"), v.literal("apple_pay")),
  items: v.array(OrderItemObject),
  created_at: v.number(),
  updated_at: v.number(),
});

export const OrderEventObject = v.object({
  order_id: v.id("orders"),
  status: OrderStatus,
  message: v.string(),
  created_at: v.number(),
});

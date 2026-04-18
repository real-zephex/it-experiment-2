"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

import { ConfirmedUserWrapper } from "@/components/wrappers/ConfirmedUserWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CartPage() {
  const { user } = useUser();
  const cart = useQuery(api.functions.queries.getCart, user?.id ? { clerk_user_id: user.id } : "skip");
  const updateCartQuantity = useMutation(api.functions.mutations.updateCartQuantity);
  const removeCartItem = useMutation(api.functions.mutations.removeCartItem);

  const increment = async (cartItemId: Id<"cart_items">, quantity: number): Promise<void> => {
    if (!user?.id) {
      return;
    }
    try {
      await updateCartQuantity({
        clerk_user_id: user.id,
        cart_item_id: cartItemId,
        quantity: quantity + 1,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quantity");
    }
  };

  const decrement = async (cartItemId: Id<"cart_items">, quantity: number): Promise<void> => {
    if (!user?.id) {
      return;
    }
    try {
      await updateCartQuantity({
        clerk_user_id: user.id,
        cart_item_id: cartItemId,
        quantity: quantity - 1,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quantity");
    }
  };

  const remove = async (cartItemId: Id<"cart_items">): Promise<void> => {
    if (!user?.id) {
      return;
    }
    try {
      await removeCartItem({
        clerk_user_id: user.id,
        cart_item_id: cartItemId,
      });
      toast.success("Removed from cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove item");
    }
  };

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <h1 className="display-title text-5xl">Your Cart</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review items and proceed to demo checkout.</p>
        </section>

        {!cart ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : cart.items.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/70 p-8 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/shop">Browse Sneakers</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <Card
                  key={item._id}
                  className="grid gap-4 rounded-2xl border-border/60 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center"
                >
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    width={200}
                    height={96}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                  <div>
                    <p className="display-title text-2xl">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.product.price_cents)}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-2 py-1">
                      <button type="button" className="px-1 text-sm" onClick={() => decrement(item._id, item.quantity)}>
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button type="button" className="px-1 text-sm" onClick={() => increment(item._id, item.quantity)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="font-bold">{formatPrice(item.product.price_cents * item.quantity)}</p>
                    <Button variant="outline" size="sm" onClick={() => remove(item._id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="h-fit rounded-2xl border-border/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Summary</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{cart.item_count}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal_cents)}</span>
                </div>
              </div>
              <Button asChild className="mt-4 w-full rounded-full">
                <Link href="/checkout">Proceed to Demo Checkout</Link>
              </Button>
            </Card>
          </div>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

import { ConfirmedUserWrapper } from "@/components/wrappers/ConfirmedUserWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type DemoPaymentMethod = "card" | "paypal" | "apple_pay";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const cart = useQuery(api.functions.queries.getCart, user?.id ? { clerk_user_id: user.id } : "skip");
  const createDemoOrder = useMutation(api.functions.mutations.createDemoOrder);

  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }
    if (!shippingName || !shippingEmail || !shippingAddress) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      setSubmitting(true);
      const result = await createDemoOrder({
        clerk_user_id: user.id,
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      toast.success("Demo order placed");
      router.push(`/order/${result.order_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const tax = cart ? Math.round(cart.subtotal_cents * 0.08) : 0;
  const total = cart ? cart.subtotal_cents + tax : 0;

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <h1 className="display-title text-5xl">Demo Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Simulated checkout flow for the storefront demo. No real payment processing.
          </p>
        </section>

        {!cart ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : cart.items.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/70 p-8 text-center text-muted-foreground">
            Add items to your cart before checking out.
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="rounded-2xl border-border/70 p-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="shipping-name">Full Name</Label>
                  <Input
                    id="shipping-name"
                    value={shippingName}
                    onChange={(event) => setShippingName(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shipping-email">Email</Label>
                  <Input
                    id="shipping-email"
                    type="email"
                    value={shippingEmail}
                    onChange={(event) => setShippingEmail(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shipping-address">Address</Label>
                  <Input
                    id="shipping-address"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Demo Payment Method</Label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { label: "Card", value: "card" },
                      { label: "PayPal", value: "paypal" },
                      { label: "Apple Pay", value: "apple_pay" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPaymentMethod(option.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                          paymentMethod === option.value
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                  {submitting ? "Placing Demo Order..." : "Place Demo Order"}
                </Button>
              </form>
            </Card>

            <Card className="h-fit rounded-2xl border-border/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Order Summary</p>
              <div className="mt-3 space-y-2 text-sm">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between gap-2">
                    <span className="line-clamp-1">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span>{formatPrice(item.product.price_cents * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border/60 pt-2" />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

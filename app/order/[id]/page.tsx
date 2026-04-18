"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, CircleDashed, Truck } from "lucide-react";

import { ConfirmedUserWrapper } from "@/components/wrappers/ConfirmedUserWrapper";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const statusOrder = ["processing", "confirmed", "ready", "complete"] as const;

export default function OrderStatusPage() {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const orderId = params.id as Id<"orders">;

  const data = useQuery(
    api.functions.queries.getOrderById,
    user?.id
      ? {
          order_id: orderId,
          clerk_user_id: user.id,
        }
      : "skip",
  );

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <h1 className="display-title text-5xl">Order Status</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track your demo order progress in real time.</p>
        </section>

        {data === undefined ? (
          <div className="flex min-h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : data === null ? (
          <Card className="rounded-2xl border-dashed border-border/70 p-8 text-center text-muted-foreground">
            Order not found.
          </Card>
        ) : (
          <>
            <Card className="rounded-2xl border-border/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Order</p>
                  <p className="display-title text-3xl">#{String(data.order._id).slice(-8).toUpperCase()}</p>
                </div>
                <p className="text-2xl font-black">{formatPrice(data.order.total_cents)}</p>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {statusOrder.map((status) => {
                  const isCompleted =
                    statusOrder.indexOf(status) <= statusOrder.indexOf(data.order.status);
                  return (
                    <div
                      key={status}
                      className={`rounded-xl border p-3 ${
                        isCompleted ? "border-primary bg-primary/20" : "border-border/60 bg-background/60"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{status}</p>
                      <div className="mt-2 text-lg">
                        {isCompleted ? <CheckCircle2 className="size-5" /> : <CircleDashed className="size-5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-2xl border-border/70 p-5">
              <p className="display-title text-2xl">Timeline</p>
              <div className="mt-4 space-y-3">
                {data.events.map((event) => (
                  <div key={event._id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                    <Truck className="mt-0.5 size-4" />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.12em]">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/cart">Back to Cart</Link>
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

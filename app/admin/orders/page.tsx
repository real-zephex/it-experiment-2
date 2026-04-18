"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type OrderStatus = "processing" | "confirmed" | "ready" | "complete";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function AdminOrdersPage() {
  const orders = useQuery(api.functions.queries.listOrdersForAdmin);
  const updateOrderStatus = useMutation(api.functions.adminMutations.updateOrderStatus);
  const [updating, setUpdating] = useState<Id<"orders"> | null>(null);

  const setStatus = async (orderId: Id<"orders">, status: OrderStatus): Promise<void> => {
    const messageMap: Record<OrderStatus, string> = {
      processing: "Order moved to processing queue.",
      confirmed: "Order confirmed by demo operations.",
      ready: "Order packed and ready to dispatch.",
      complete: "Order completed for showcase.",
    };

    try {
      setUpdating(orderId);
      await updateOrderStatus({
        order_id: orderId,
        status,
        message: messageMap[status],
      });
      toast.success("Order status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update order");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="display-title text-5xl text-[#daebe3]">Order Lifecycle</h2>
        <p className="mt-2 text-sm text-[#daebe3]/40 tracking-[0.1em] uppercase font-bold">Manage demo checkout orders and visibility.</p>
      </div>

      <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
        <h3 className="display-title text-2xl mb-8 text-[#daebe3]">Pending & Active Orders</h3>
        {!orders ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner className="text-[#99cdd8]" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-[#daebe3]/40 italic">No orders recorded in system.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-white/5 bg-[#25302d]/60 p-6 transition-all hover:bg-[#25302d]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="display-title text-lg text-[#daebe3]">Order {String(order._id).slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40">
                      <span>{order.shipping_name}</span>
                      <span className="size-1 rounded-full bg-white/10" />
                      <span>{order.shipping_email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="display-title text-xl text-[#99cdd8]">{formatPrice(order.total_cents)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#daebe3]/20">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-2">
                  {(["processing", "confirmed", "ready", "complete"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={order.status === status ? "luxury" : "outline"}
                      className={cn(
                        "rounded-full px-6 py-2 h-10 text-[10px] font-bold uppercase tracking-[0.2em]",
                        order.status === status 
                          ? "bg-[#99cdd8] text-[#25302d]" 
                          : "border-white/5 bg-transparent text-[#daebe3]/40 hover:bg-white/5 hover:text-[#daebe3]"
                      )}
                      disabled={updating === order._id}
                      onClick={() => setStatus(order._id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

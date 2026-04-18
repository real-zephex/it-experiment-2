"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  ArrowRight,
  Boxes,
  ShoppingCart,
  Database,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function AdminOverviewPage() {
  const stats = useQuery(api.functions.queries.getAdminStats);
  const seedCatalog = useMutation(api.functions.adminMutations.seedDemoCatalog);

  const handleSeed = async (): Promise<void> => {
    try {
      const result = await seedCatalog({});
      toast.success(`Seeded ${result.seeded_products} products for demo`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed catalog");
    }
  };

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#2e3935] p-10 md:p-16">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-[#99cdd8]/10 blur-3xl" />
        
        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
             <div className="size-2 rounded-full bg-[#99cdd8] animate-pulse" />
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#99cdd8]">System Operational</p>
          </div>
          <h2 className="display-title text-6xl leading-none text-[#daebe3]">Command<br />Center</h2>
          <p className="max-w-xl text-base text-[#daebe3]/60 leading-relaxed">
            Manage catalog, monitor demo orders, and control the complete storefront narrative from a single, high-fidelity dashboard.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button onClick={handleSeed} variant="luxury" className="rounded-full bg-[#99cdd8] text-[#25302d] hover:bg-[#99cdd8]/90">
              <Database className="size-4" />
              Seed Demo Catalog
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-[#daebe3]">
              <Link href="/admin/products">Product Registry</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-[#daebe3]">
              <Link href="/admin/collections">Curated Edits</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "#99cdd8" },
          { label: "Pending Approval", value: stats.pendingUsers, icon: Clock, color: "#f3c3b2" },
          { label: "Catalog Products", value: stats.productCount, icon: Boxes, color: "#cfd6c4" },
          { label: "Demo Orders", value: stats.orderCount, icon: ShoppingCart, color: "#99cdd8" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-3xl border border-white/5 bg-[#2e3935]/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40">{item.label}</p>
              <item.icon className="size-4" style={{ color: item.color }} />
            </div>
            <p className="display-title text-4xl text-[#daebe3]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-3xl border border-white/5 bg-[#2e3935]/40 p-8">
           <h3 className="display-title text-xl mb-8 text-[#daebe3]">System Logs</h3>
           <div className="space-y-6">
              {stats.recentActions.length === 0 ? (
                <p className="text-sm text-[#daebe3]/40 italic">No recent logs recorded.</p>
              ) : (
                stats.recentActions.map((action) => (
                  <div key={action._id} className="flex items-start gap-4 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="size-2 rounded-full mt-1.5 bg-[#99cdd8]" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]">
                        {action.action_type.replaceAll("_", " ")}
                      </p>
                      {action.details ? (
                        <p className="text-sm text-[#daebe3]/60 leading-relaxed">{action.details}</p>
                      ) : null}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#daebe3]/30">
                      {new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>

        <div className="col-span-3 space-y-4">
           <div className="rounded-3xl border border-white/5 bg-[#2e3935]/40 p-8">
              <h3 className="display-title text-xl mb-6 text-[#daebe3]">Quick Links</h3>
              <div className="grid gap-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-white/5 hover:bg-white/5 text-[#daebe3]">
                    User Directory
                    <UserCheck className="size-4 text-[#99cdd8]" />
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-white/5 hover:bg-white/5 text-[#daebe3]">
                    Product Registry
                    <ArrowRight className="size-4 text-[#99cdd8]" />
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-white/5 hover:bg-white/5 text-[#daebe3]">
                    Order Lifecycle
                    <ShieldCheck className="size-4 text-[#99cdd8]" />
                  </Button>
                </Link>
              </div>
           </div>
           
           <div className="rounded-3xl border border-[#99cdd8]/20 bg-[#99cdd8]/5 p-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#99cdd8] mb-2">Live Storefront</p>
              <p className="text-xs text-[#daebe3]/60 mb-6">View your changes in real-time on the public store.</p>
              <Button asChild variant="luxury" className="w-full rounded-2xl bg-[#99cdd8] text-[#25302d]">
                <Link href="/">Open Storefront</Link>
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

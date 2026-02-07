"use client";

import { ReactNode } from "react";
import { AdminWrapper } from "@/components/wrappers/AdminWrapper";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminWrapper>
      <div className="min-h-screen bg-background">
        {/*<header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
        </header>*/}
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AdminWrapper>
  );
}

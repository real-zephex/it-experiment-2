"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { AdminWrapper } from "@/components/wrappers/AdminWrapper";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-[#25302d] text-[#daebe3]">
        <header className="border-b border-white/5 bg-[#2e3935]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-8">
              <h1 className="display-title text-xl tracking-[0.2em] text-[#99cdd8]">Command Center</h1>
              <nav className="hidden md:flex items-center gap-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                      pathname === link.href 
                        ? "bg-[#99cdd8] text-[#25302d]" 
                        : "text-[#daebe3]/60 hover:text-[#daebe3] hover:bg-white/5",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#99cdd8]/60 hover:text-[#99cdd8]">
              Exit to Store →
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-12">{children}</main>
      </div>
    </AdminWrapper>
  );
}

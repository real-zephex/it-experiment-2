"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag, ShoppingCart, ShieldCheck, Menu, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/admin", label: "CMS", adminOnly: true },
];

const publicRoutes = ["/auth", "/pending", "/403", "/account-not-found"];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dbUser = useQuery(
    api.functions.queries.getUserByClerkId,
    user?.id ? { clerk_user_id: user.id } : "skip",
  );

  const isAdmin = dbUser?.role === "admin";
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route));

  if (isPublicRoute) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(153,205,216,0.45)]">
            <ShoppingBag className="size-5" />
          </div>
          <div className="leading-none">
            <p className="display-title text-xl">Velocity Kicks</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Street + Sport
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            if (link.adminOnly && !isAdmin) {
              return null;
            }

            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SignedIn>
            <Link href="/cart" className="hidden sm:block">
              <Button variant="outline" size="sm" className="rounded-full">
                <ShoppingCart className="size-4" />
                Cart
              </Button>
            </Link>
            <div className="hidden sm:block">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "size-9 border border-border bg-background shadow-[0_0_0_4px_rgba(153,205,216,0.25)]",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <Button asChild className="rounded-full px-5">
              <Link href="/auth">Sign In</Link>
            </Button>
          </SignedOut>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs border-l border-border/80 bg-card">
              <SheetHeader>
                <SheetTitle className="display-title text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-3">
                {links.map((link) => {
                  if (link.adminOnly && !isAdmin) {
                    return null;
                  }

                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 font-semibold",
                        active ? "bg-primary/35" : "bg-background/70",
                      )}
                    >
                      {link.label}
                      {link.adminOnly ? <ShieldCheck className="size-4" /> : <Sparkles className="size-4" />}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

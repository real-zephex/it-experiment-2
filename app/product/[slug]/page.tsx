"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

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

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useUser();
  const addToCart = useMutation(api.functions.mutations.addToCart);
  const product = useQuery(api.functions.queries.getProductBySlug, { slug: params.slug });
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (productId: Id<"products">): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      setAdding(true);
      await addToCart({
        clerk_user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {product === undefined ? (
          <div className="flex min-h-screen items-center justify-center">
            <Spinner className="size-12 text-primary" />
          </div>
        ) : product === null ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <h1 className="display-title text-4xl opacity-20">Silhouette Not Found</h1>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/shop">Return to Shop</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            {/* Sticky Image Gallery */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="aspect-[4/5] overflow-hidden rounded-[3rem] bg-muted/30 border border-white/10">
                <Image
                  src={product.gallery_urls[activeImage] ?? product.image_url}
                  alt={product.name}
                  width={1200}
                  height={1500}
                  className="h-full w-full object-cover transition-all duration-700"
                  priority
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(product.gallery_urls.length > 0 ? product.gallery_urls : [product.image_url]).map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                      activeImage === index ? "border-primary scale-95" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col space-y-10 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    {product.tags[0] ?? "Performance"}
                  </p>
                  <div className="h-px w-8 bg-foreground/10" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                    ID: {product.slug.toUpperCase()}
                  </p>
                </div>
                <h1 className="display-title text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">{product.name}</h1>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {product.subtitle ?? "Street-performance silhouette"}
                </p>
              </div>

              <div className="h-px w-full bg-foreground/5" />

              <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                  <p className="text-4xl font-black tracking-tighter">{formatPrice(product.price_cents)}</p>
                  {product.compare_at_price_cents ? (
                    <p className="text-lg font-bold text-muted-foreground/40 line-through decoration-primary/50">
                      {formatPrice(product.compare_at_price_cents)}
                    </p>
                  ) : null}
                </div>
                
                <p className="max-w-md text-base leading-relaxed text-muted-foreground/90">
                  {product.description}
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select Size (US)</p>
                  <div className="grid grid-cols-4 gap-3">
                    {["8", "8.5", "9", "9.5", "10", "10.5", "11", "12"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        className="flex h-12 items-center justify-center rounded-xl border border-foreground/10 text-sm font-bold transition-all hover:border-primary hover:text-primary active:scale-95"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    size="lg"
                    variant="luxury"
                    className="h-16 flex-1 rounded-full text-lg"
                    disabled={product.stock_count === 0 || adding}
                    onClick={() => handleAddToCart(product._id)}
                  >
                    {product.stock_count === 0 ? "Unavailable" : adding ? "Processing..." : "Secure Pair"}
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-16 size-16 rounded-full p-0 flex items-center justify-center">
                    <Link href="/cart">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag opacity-70"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                       <span className="sr-only">Cart</span>
                    </Link>
                  </Button>
                </div>

                <div className="rounded-2xl bg-muted/20 p-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <div className={`size-1.5 rounded-full ${product.stock_count > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      {product.stock_count > 10 ? "Available for Dispatch" : product.stock_count > 0 ? `Limited Drop: ${product.stock_count} Pairs Left` : "Allocation Exhausted"}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-foreground/5">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Material</p>
                  <p className="text-xs text-muted-foreground">Premium Mesh & TPU Overlays</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Traction</p>
                  <p className="text-xs text-muted-foreground">Aggressive Multi-surface Grip</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

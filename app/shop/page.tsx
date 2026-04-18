"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { ConfirmedUserWrapper } from "@/components/wrappers/ConfirmedUserWrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function ShopPage() {
  const products = useQuery(api.functions.queries.listPublishedProducts);
  const addToCart = useMutation(api.functions.mutations.addToCart);
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!products) {
      return [];
    }

    if (!query.trim()) {
      return products;
    }

    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [products, query]);

  const handleAddToCart = async (productId: Id<"products">): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      setAddingId(productId);
      await addToCart({
        clerk_user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add product");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-border/70 bg-card p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Storefront</p>
          <h1 className="display-title mt-2 text-5xl">All Sneakers</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Discover high-energy silhouettes built for fast transitions between pavement and performance.
          </p>
          <div className="mt-4 max-w-sm">
            <Input
              placeholder="Search by name or tag"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        {!products ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/70 p-8 text-center text-muted-foreground">
            No products found for this filter.
          </Card>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product._id}
                className="group overflow-hidden rounded-2xl border-border/60 bg-card/90 transition-transform duration-300 hover:-translate-y-1"
              >
                <Link href={`/product/${product.slug}`} className="block aspect-[4/3] overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="display-title text-2xl leading-none">{product.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.13em] text-muted-foreground">
                      {product.subtitle ?? "Signature model"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-extrabold">{formatPrice(product.price_cents)}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Stock {product.stock_count}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 rounded-full">
                      <Link href={`/product/${product.slug}`}>Details</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-full"
                      disabled={product.stock_count === 0 || addingId === product._id}
                      onClick={() => handleAddToCart(product._id)}
                    >
                      {product.stock_count === 0 ? "Sold Out" : addingId === product._id ? "Adding" : "Add"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

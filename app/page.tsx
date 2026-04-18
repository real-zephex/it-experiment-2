"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Sparkles, Flame, Waves } from "lucide-react";

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

export default function HomePage() {
  const featured = useQuery(api.functions.queries.listFeaturedProducts);
  const collections = useQuery(api.functions.queries.listCollections);

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-7xl space-y-20 px-4 py-12 sm:px-6 lg:px-8">
        <section className="grain-overlay silk-bg relative overflow-hidden rounded-[3rem] border border-white/20 p-8 md:p-20">
          <div className="absolute -right-20 -top-20 size-[30rem] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 size-[30rem] rounded-full bg-secondary/20 blur-[100px]" />
          
          <div className="relative flex flex-col items-center text-center space-y-8">
            <div className="overflow-hidden">
              <p className="text-reveal inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/40 backdrop-blur-md px-6 py-2 text-[10px] font-bold uppercase tracking-[0.3em]">
                <Sparkles className="size-3.5" />
                New Season Drop
              </p>
            </div>
            
            <h1 className="display-title max-w-4xl text-6xl leading-[1.1] sm:text-7xl md:text-8xl lg:text-9xl">
              <span className="block overflow-hidden">
                <span className="text-reveal block">Run The</span>
              </span>
              <span className="block overflow-hidden">
                <span className="text-reveal block [animation-delay:0.1s]">Streets.</span>
              </span>
            </h1>

            <p className="max-w-2xl text-lg font-medium text-muted-foreground/80 leading-relaxed [animation-delay:0.3s]">
              A curated sneaker storefront blending streetwear identity with performance engineering.
              Explore the latest silhouettes, shape your cart, and complete a full demo checkout flow.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Button asChild size="lg" variant="luxury" className="rounded-full px-12 h-14">
                <Link href="/shop">
                  Shop Catalog
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-12 h-14">
                <Link href="/admin">Control Center</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Marquee Ticker */}
        <div className="w-full overflow-hidden border-y border-foreground/5 py-6">
          <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="display-title text-sm opacity-30 tracking-[0.4em]">
                PERFORMANCE • IDENTITY • STREETWEAR • LUXURY • VELOCITY •
              </span>
            ))}
          </div>
        </div>

        <section className="space-y-12">
          <div className="flex items-end justify-between border-b border-foreground/5 pb-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Curated Selection</p>
              <h2 className="display-title text-4xl">Featured Heat</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors">
              Explore All →
            </Link>
          </div>

          {!featured ? (
            <div className="flex min-h-60 items-center justify-center">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : featured.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-border/70 p-12 text-center text-muted-foreground">
              Add products from the CMS to populate the storefront.
            </Card>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <Card
                  key={product._id}
                  className="group relative overflow-hidden bg-transparent border-none p-0 shadow-none hover:shadow-none"
                >
                  <Link href={`/product/${product.slug}`} className="block space-y-6">
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted/30 relative">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button className="w-full rounded-full bg-white text-black hover:bg-white/90">
                          View Silhouette
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3 px-2 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                          {product.tags[0] ?? "Featured Drop"}
                        </p>
                        <h3 className="display-title text-2xl tracking-wide">{product.name}</h3>
                      </div>
                      <p className="text-xl font-light tracking-tight">{formatPrice(product.price_cents)}</p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-border/60 bg-primary/30 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/70">Performance Notes</p>
            <p className="display-title mt-2 text-4xl">Lightweight Build. Aggressive Grip.</p>
          </Card>
          <Card className="rounded-2xl border-border/60 bg-secondary/35 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/70">Street Language</p>
            <p className="display-title mt-2 text-4xl">Clean Lines. Bold Attitude.</p>
          </Card>
        </section>

        <section className="space-y-4 pb-8">
          <div className="flex items-center gap-2">
            <Waves className="size-5" />
            <h2 className="display-title text-3xl">Collections</h2>
          </div>
          {!collections ? (
            <div className="flex min-h-24 items-center justify-center">
              <Spinner />
            </div>
          ) : collections.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border/70 p-6 text-muted-foreground">
              No collections yet. Create one in the CMS to showcase curated drops.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {collections.map((collection) => (
                <Link key={collection._id} href={`/collections/${collection.slug}`}>
                  <Card className="group overflow-hidden rounded-2xl border-border/60 transition-all hover:border-foreground/30">
                    <div className="aspect-[16/9] overflow-hidden">
                      <Image
                        src={collection.hero_image_url}
                        alt={collection.name}
                        width={1400}
                        height={788}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="display-title text-2xl">{collection.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </ConfirmedUserWrapper>
  );
}

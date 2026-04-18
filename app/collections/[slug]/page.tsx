"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { ConfirmedUserWrapper } from "@/components/wrappers/ConfirmedUserWrapper";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const data = useQuery(api.functions.queries.getCollectionBySlug, {
    slug: params.slug,
  });

  return (
    <ConfirmedUserWrapper>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {data === undefined ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner />
          </div>
        ) : data === null ? (
          <Card className="rounded-2xl border-dashed border-border/70 p-8 text-center text-muted-foreground">
            Collection not found.
          </Card>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-border/70">
              <div className="relative aspect-[21/8]">
                <Image
                  src={data.collection.hero_image_url}
                  alt={data.collection.name}
                  width={1600}
                  height={610}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Curated Edit</p>
                  <h1 className="display-title text-5xl">{data.collection.name}</h1>
                  <p className="max-w-xl text-sm text-white/85">{data.collection.description}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.products.map((product) => (
                <Card key={product._id} className="overflow-hidden rounded-2xl border-border/60 bg-card/90">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={1200}
                      height={900}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <h2 className="display-title text-2xl">{product.name}</h2>
                    <p className="text-sm text-muted-foreground">{product.subtitle ?? "Signature build"}</p>
                    <p className="mt-2 text-lg font-bold">{formatPrice(product.price_cents)}</p>
                  </div>
                </Card>
              ))}
            </section>
          </>
        )}
      </main>
    </ConfirmedUserWrapper>
  );
}

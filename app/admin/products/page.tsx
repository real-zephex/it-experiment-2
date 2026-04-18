"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

type ProductStatus = "draft" | "published" | "archived";

type ProductFormState = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  status: ProductStatus;
  tags: string;
  imageUrl: string;
  galleryUrls: string;
  featured: boolean;
};

const emptyProductForm: ProductFormState = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  status: "draft",
  tags: "",
  imageUrl: "",
  galleryUrls: "",
  featured: false,
};

function dollarsToCents(value: string): number {
  return Math.round(Number(value) * 100);
}

function centsToDollars(value: number): string {
  return (value / 100).toFixed(2);
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export default function AdminProductsPage() {
  const products = useQuery(api.functions.queries.listAllProductsForAdmin);
  const createProduct = useMutation(api.functions.adminMutations.createProduct);
  const updateProduct = useMutation(api.functions.adminMutations.updateProduct);
  const deleteProduct = useMutation(api.functions.adminMutations.deleteProduct);

  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitLabel = useMemo(() => (editingId ? "Update Product" : "Create Product"), [editingId]);

  const startEdit = (product: Doc<"products">): void => {
    setEditingId(product._id);
    setForm({
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle ?? "",
      description: product.description,
      price: centsToDollars(product.price_cents),
      compareAtPrice:
        product.compare_at_price_cents !== undefined ? centsToDollars(product.compare_at_price_cents) : "",
      stock: String(product.stock_count),
      status: product.status,
      tags: product.tags.join(", "),
      imageUrl: product.image_url,
      galleryUrls: product.gallery_urls.join(", "),
      featured: product.featured,
    });
  };

  const resetForm = (): void => {
    setEditingId(null);
    setForm(emptyProductForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!form.slug || !form.name || !form.description || !form.price || !form.stock || !form.imageUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      slug: form.slug,
      name: form.name,
      subtitle: form.subtitle || undefined,
      description: form.description,
      price_cents: dollarsToCents(form.price),
      compare_at_price_cents: form.compareAtPrice ? dollarsToCents(form.compareAtPrice) : undefined,
      stock_count: Number(form.stock),
      status: form.status,
      tags: parseList(form.tags),
      image_url: form.imageUrl,
      gallery_urls: parseList(form.galleryUrls),
      featured: form.featured,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await updateProduct({ product_id: editingId, ...payload });
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: Id<"products">): Promise<void> => {
    try {
      await deleteProduct({ product_id: productId });
      toast.success("Product deleted");
      if (editingId === productId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="display-title text-5xl text-[#daebe3]">Product Registry</h2>
        <p className="mt-2 text-sm text-[#daebe3]/40 tracking-[0.1em] uppercase font-bold">Build and control the sneaker catalog for the storefront.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
          <h3 className="display-title text-2xl mb-8 text-[#daebe3]">{submitLabel}</h3>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Slug*</Label>
              <Input
                id="slug"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="aero-strike-v1"
                disabled={editingId !== null}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Name*</Label>
              <Input
                id="name"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Subtitle</Label>
              <Input
                id="subtitle"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.subtitle}
                onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Description*</Label>
              <Textarea
                id="description"
                className="rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50 min-h-[120px]"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Price ($)*</Label>
                <Input
                  id="price"
                  className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="compare-price" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Compare At ($)</Label>
                <Input
                  id="compare-price"
                  className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                  value={form.compareAtPrice}
                  onChange={(event) => setForm((prev) => ({ ...prev, compareAtPrice: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Stock*</Label>
                <Input
                  id="stock"
                  type="number"
                  className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Status*</Label>
                <select
                  id="status"
                  className="h-12 rounded-2xl border border-white/5 bg-[#25302d] px-4 text-[#daebe3] text-sm focus:border-[#99cdd8]/50 outline-none"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as ProductStatus }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image-url" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Main Image URL*</Label>
              <Input
                id="image-url"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gallery-urls" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Gallery URLs (comma separated)</Label>
              <Textarea
                id="gallery-urls"
                className="rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.galleryUrls}
                onChange={(event) => setForm((prev) => ({ ...prev, galleryUrls: event.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Tags (comma separated)</Label>
              <Input
                id="tags"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              />
            </div>
            <label className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/80 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-white/10 bg-[#25302d] checked:bg-[#99cdd8]"
                checked={form.featured}
                onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
              />
              Featured Product
            </label>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting} variant="luxury" className="rounded-2xl bg-[#99cdd8] text-[#25302d] h-14 flex-1">
                {submitting ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                {submitLabel}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-2xl border-white/10 h-14 px-8 text-[#daebe3] hover:bg-white/5">
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
          <h3 className="display-title text-2xl mb-8 text-[#daebe3]">Catalog Products</h3>
          {!products ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner className="text-[#99cdd8]" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-[#daebe3]/40 italic">No products recorded in registry.</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#25302d]/60 p-5 transition-all hover:bg-[#25302d]"
                >
                  <div className="space-y-1">
                    <p className="display-title text-lg text-[#daebe3]">{product.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/30">{product.slug}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={cn(
                        "rounded-full px-3 py-1",
                        product.status === "published" ? "bg-[#99cdd8]/10 text-[#99cdd8] border-[#99cdd8]/20" : "bg-white/5 text-[#daebe3]/40 border-white/10"
                      )}>
                        {product.status}
                      </Badge>
                      <Badge className="rounded-full bg-white/5 text-[#daebe3]/60 border-white/10 px-3 py-1">Stock {product.stock_count}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon-sm" variant="outline" onClick={() => startEdit(product)} className="rounded-xl border-white/5 bg-[#2e3935] hover:bg-white/5 text-[#daebe3]">
                      <Edit3 className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(product._id)} className="rounded-xl border-none bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

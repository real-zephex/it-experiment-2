"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

type CollectionFormState = {
  id?: Id<"collections">;
  slug: string;
  name: string;
  description: string;
  heroImageUrl: string;
  selectedProductIds: Id<"products">[];
};

const emptyState: CollectionFormState = {
  slug: "",
  name: "",
  description: "",
  heroImageUrl: "",
  selectedProductIds: [],
};

export default function AdminCollectionsPage() {
  const products = useQuery(api.functions.queries.listAllProductsForAdmin);
  const collections = useQuery(api.functions.queries.listCollections);
  const createCollection = useMutation(api.functions.adminMutations.createCollection);
  const updateCollection = useMutation(api.functions.adminMutations.updateCollection);
  const deleteCollection = useMutation(api.functions.adminMutations.deleteCollection);

  const [form, setForm] = useState<CollectionFormState>(emptyState);
  const [submitting, setSubmitting] = useState(false);

  const toggleProduct = (productId: Id<"products">): void => {
    setForm((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(productId)
        ? prev.selectedProductIds.filter((id) => id !== productId)
        : [...prev.selectedProductIds, productId],
    }));
  };

  const handleEdit = (collection: any) => {
    setForm({
      id: collection._id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      heroImageUrl: collection.hero_image_url,
      selectedProductIds: collection.product_ids,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!form.slug || !form.name || !form.description || !form.heroImageUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      if (form.id) {
        await updateCollection({
          collection_id: form.id,
          name: form.name,
          description: form.description,
          hero_image_url: form.heroImageUrl,
          product_ids: form.selectedProductIds,
        });
        toast.success("Collection updated");
      } else {
        await createCollection({
          slug: form.slug,
          name: form.name,
          description: form.description,
          hero_image_url: form.heroImageUrl,
          product_ids: form.selectedProductIds,
        });
        toast.success("Collection created");
      }
      setForm(emptyState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (collectionId: Id<"collections">): Promise<void> => {
    try {
      await deleteCollection({ collection_id: collectionId });
      toast.success("Collection deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="display-title text-5xl text-[#daebe3]">Curated Edits</h2>
        <p className="mt-2 text-sm text-[#daebe3]/40 tracking-[0.1em] uppercase font-bold">Curate product narratives and featured edits.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
          <h3 className="display-title text-2xl mb-8 text-[#daebe3]">{form.id ? "Edit Collection" : "Create Collection"}</h3>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Slug*</Label>
              <Input
                id="slug"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                disabled={!!form.id}
                placeholder={form.id ? "Slug cannot be changed" : ""}
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
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
              <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Description*</Label>
              <Textarea
                id="description"
                className="rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50 min-h-[100px]"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Hero Image URL*</Label>
              <Input
                id="hero"
                className="h-12 rounded-2xl border-white/5 bg-[#25302d] text-[#daebe3] focus:border-[#99cdd8]/50"
                value={form.heroImageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, heroImageUrl: event.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/60">Choose Products</Label>
              {!products ? (
                <div className="flex h-20 items-center justify-center">
                  <Spinner className="text-[#99cdd8]" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-sm text-[#daebe3]/40 italic text-center p-4 border border-dashed border-white/5 rounded-2xl">Add products first.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-white/5 bg-[#25302d]/40 p-4 scrollbar-hide">
                  {products.map((product) => (
                    <label key={product._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-white/10 bg-[#25302d] checked:bg-[#99cdd8]"
                        checked={form.selectedProductIds.includes(product._id)}
                        onChange={() => toggleProduct(product._id)}
                      />
                      <span className="text-sm text-[#daebe3]/80">{product.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting} variant="luxury" className="rounded-2xl bg-[#99cdd8] text-[#25302d] h-14 flex-1">
                {submitting ? <Spinner className="size-4" /> : null}
                {form.id ? "Update Collection" : "Create Collection"}
              </Button>
              {form.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-white/10 h-14 px-8 text-[#daebe3] hover:bg-white/5"
                  onClick={() => setForm(emptyState)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
          <h3 className="display-title text-2xl mb-8 text-[#daebe3]">Existing Collections</h3>
          {!collections ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner className="text-[#99cdd8]" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-[#daebe3]/40 italic">No collections recorded.</p>
          ) : (
            <div className="space-y-4">
              {collections.map((collection) => (
                <div
                  key={collection._id}
                  className="flex items-center justify-between rounded-3xl border border-white/5 bg-[#25302d]/60 p-5 transition-all hover:bg-[#25302d]"
                >
                  <div className="space-y-1">
                    <p className="display-title text-lg text-[#daebe3]">{collection.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/30">{collection.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(collection)} className="rounded-xl border-white/5 bg-[#2e3935] hover:bg-white/5 text-[#daebe3] px-5">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(collection._id)} className="rounded-xl border-none bg-red-500/10 text-red-400 hover:bg-red-500/20 px-5">
                      Delete
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

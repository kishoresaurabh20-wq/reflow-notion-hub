import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, UNITS } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/listings/new")({
  head: () => ({ meta: [{ title: "List a by-product — Reflow" }] }),
  component: NewListing,
});

function NewListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const [form, setForm] = useState({
    title: "", description: "", category: "plastics",
    quantity: "", unit: "kg", price_per_unit: "", is_free: false,
    location: "", image_url: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase.from("listings").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category as never,
      quantity: Number(form.quantity),
      unit: form.unit as never,
      price_per_unit: form.is_free ? null : form.price_per_unit ? Number(form.price_per_unit) : null,
      is_free: form.is_free,
      location: form.location,
      image_url: form.image_url || null,
    }).select().single();
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Listing published!"); navigate({ to: "/listings/$id", params: { id: data.id } }); }
  };

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" />Back</Link></Button>
        <h1 className="font-display text-4xl mb-2">List a by-product</h1>
        <p className="text-muted-foreground mb-8">Help another business turn your waste stream into their input.</p>

        <Card className="p-6 md:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. HDPE plastic regrind, food-grade" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Location *</Label>
                <Input id="loc" required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity *</Label>
                <Input id="qty" type="number" min="0" step="0.01" required value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per unit</Label>
                <Input id="price" type="number" min="0" step="0.01" disabled={form.is_free}
                  value={form.price_per_unit} onChange={(e) => set("price_per_unit", e.target.value)} placeholder="USD" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-secondary/30">
              <div>
                <Label htmlFor="free" className="text-sm font-medium">Offer for free</Label>
                <p className="text-xs text-muted-foreground">Better than landfill — give it away.</p>
              </div>
              <Switch id="free" checked={form.is_free} onCheckedChange={(v) => set("is_free", v)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="img">Image URL (optional)</Label>
              <Input id="img" type="url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description *</Label>
              <Textarea id="desc" required rows={6} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Composition, condition, available pickup terms, certifications…" />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Publishing…" : "Publish listing"}</Button>
          </form>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
}

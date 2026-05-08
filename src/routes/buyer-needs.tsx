import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, UNITS, categoryEmoji, categoryLabel } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/buyer-needs")({
  head: () => ({ meta: [{ title: "Buyer needs — Reflow" }] }),
  component: BuyerNeedsPage,
});

interface Need {
  id: string;
  categories: string[];
  locations: string[];
  min_quantity: number | null;
  max_quantity: number | null;
  unit: string | null;
  notes: string | null;
  verified: boolean;
  created_at: string;
}

function BuyerNeedsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase.from("buyer_needs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setNeeds((data as Need[]) ?? []);
  };
  useEffect(() => { if (user) reload(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Remove this need?")) return;
    const { error } = await supabase.from("buyer_needs").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); reload(); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 flex-1 max-w-5xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-display text-5xl">Buyer Network</h1>
            <p className="text-muted-foreground mt-1">Tell us what inputs you need. We&apos;ll match you to incoming by-product listings.</p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" />{showForm ? "Cancel" : "Add need"}</Button>
        </div>

        {showForm && <NeedForm onSaved={() => { setShowForm(false); reload(); }} />}

        <div className="space-y-3 mt-6">
          {needs.length === 0 && !showForm && (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center text-muted-foreground">
              No buyer needs yet. Add one to enter the matching pool.
            </div>
          )}
          {needs.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[240px] space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {n.categories.map((c) => (
                      <Badge key={c} variant="secondary">{categoryEmoji(c)} {categoryLabel(c)}</Badge>
                    ))}
                  </div>
                  {n.locations.length > 0 && (
                    <div className="text-sm text-muted-foreground">Locations: {n.locations.join(", ")}</div>
                  )}
                  {(n.min_quantity || n.max_quantity) && (
                    <div className="text-sm text-muted-foreground">
                      Qty: {n.min_quantity ?? "—"} – {n.max_quantity ?? "—"} {n.unit ?? ""}
                    </div>
                  )}
                  {n.notes && <p className="text-sm">{n.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {n.verified ? (
                    <Badge className="gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending review</Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function NeedForm({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [cats, setCats] = useState<string[]>([]);
  const [locations, setLocations] = useState("");
  const [minQ, setMinQ] = useState("");
  const [maxQ, setMaxQ] = useState("");
  const [unit, setUnit] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleCat = (v: string) => setCats((c) => c.includes(v) ? c.filter((x) => x !== v) : [...c, v]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (cats.length === 0) { toast.error("Pick at least one category"); return; }
    setBusy(true);
    const { error } = await supabase.from("buyer_needs").insert({
      user_id: user.id,
      categories: cats as never,
      locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
      min_quantity: minQ ? Number(minQ) : null,
      max_quantity: maxQ ? Number(maxQ) : null,
      unit: (unit || null) as never,
      notes: notes || null,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Submitted for verification"); onSaved(); }
  };

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label className="mb-2 block">Categories you accept</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" onClick={() => toggleCat(c.value)}
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${cats.includes(c.value) ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary"}`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loc">Locations (comma-separated)</Label>
            <Input id="loc" value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Berlin, Rotterdam" />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min">Min qty</Label>
            <Input id="min" type="number" value={minQ} onChange={(e) => setMinQ(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Max qty</Label>
            <Input id="max" type="number" value={maxQ} onChange={(e) => setMaxQ(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quality specs, certifications, etc." />
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Submit for verification"}</Button>
      </form>
    </Card>
  );
}

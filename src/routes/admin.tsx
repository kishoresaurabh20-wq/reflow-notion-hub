import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Reflow" }] }),
  component: AdminPage,
});

interface PendingNeed {
  id: string; user_id: string; categories: string[]; locations: string[];
  min_quantity: number | null; max_quantity: number | null; unit: string | null;
  notes: string | null; verified: boolean; created_at: string;
  profile?: { company_name: string; contact_name: string | null } | null;
}
interface Invoice {
  id: string; match_id: string; seller_id: string; buyer_id: string;
  deal_value: number; fee_pct: number; fee_amount: number; status: string; created_at: string;
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [needs, setNeeds] = useState<PendingNeed[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const reload = async () => {
    const [n, i] = await Promise.all([
      supabase.from("buyer_needs").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    ]);
    const rows = (n.data as PendingNeed[]) ?? [];
    // fetch related profiles
    const ids = [...new Set(rows.map((r) => r.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,company_name,contact_name").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rows.forEach((r) => { r.profile = map.get(r.user_id) as never; });
    }
    setNeeds(rows);
    setInvoices((i.data as Invoice[]) ?? []);
  };
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  const verify = async (id: string, verified: boolean) => {
    const { error } = await supabase.from("buyer_needs").update({
      verified, verified_at: verified ? new Date().toISOString() : null, verified_by: verified ? user!.id : null,
    }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(verified ? "Verified" : "Unverified"); reload(); }
  };

  const setInvoiceStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); reload(); }
  };

  if (authLoading || adminLoading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center p-10">
          <Card className="p-8 max-w-md text-center">
            <h1 className="font-display text-3xl">Admin only</h1>
            <p className="text-muted-foreground mt-2">You don&apos;t have access to this page.</p>
          </Card>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="font-display text-5xl mb-2">Admin console</h1>
        <p className="text-muted-foreground mb-8">Verify buyers and manage transaction invoices.</p>

        <Tabs defaultValue="buyers">
          <TabsList>
            <TabsTrigger value="buyers">Buyer verification ({needs.filter((n) => !n.verified).length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="buyers" className="mt-6 space-y-3">
            {needs.length === 0 && <p className="text-muted-foreground">No buyer needs submitted yet.</p>}
            {needs.map((n) => (
              <Card key={n.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-[240px] space-y-2">
                    <div className="font-semibold">{n.profile?.company_name ?? "Unknown company"}</div>
                    <div className="text-xs text-muted-foreground">{n.profile?.contact_name} · {new Date(n.created_at).toLocaleDateString()}</div>
                    <div className="flex flex-wrap gap-2">
                      {n.categories.map((c) => <Badge key={c} variant="secondary">{categoryEmoji(c)} {categoryLabel(c)}</Badge>)}
                    </div>
                    {n.locations.length > 0 && <div className="text-sm text-muted-foreground">Locations: {n.locations.join(", ")}</div>}
                    {(n.min_quantity || n.max_quantity) && <div className="text-sm text-muted-foreground">Qty: {n.min_quantity ?? "—"} – {n.max_quantity ?? "—"} {n.unit ?? ""}</div>}
                    {n.notes && <p className="text-sm mt-2">{n.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {n.verified ? (
                      <>
                        <Badge className="gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>
                        <Button size="sm" variant="outline" onClick={() => verify(n.id, false)}>Unverify</Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => verify(n.id, true)}><ShieldCheck className="h-4 w-4" />Verify</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="invoices" className="mt-6 space-y-3">
            {invoices.length === 0 && <p className="text-muted-foreground">No invoices yet. They generate when a match is closed-won.</p>}
            {invoices.map((inv) => (
              <Card key={inv.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Invoice {inv.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(inv.created_at).toLocaleString()}</div>
                    <div className="text-sm mt-2">Deal value: <span className="font-medium">${inv.deal_value.toLocaleString()}</span></div>
                    <div className="text-sm">Fee ({inv.fee_pct}%): <span className="font-medium">${inv.fee_amount.toLocaleString()}</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={inv.status === "paid" ? "default" : "outline"}>{inv.status}</Badge>
                    {inv.status !== "paid" ? (
                      <Button size="sm" onClick={() => setInvoiceStatus(inv.id, "paid")}>Mark paid</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setInvoiceStatus(inv.id, "pending")}>Mark pending</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <SiteFooter />
    </div>
  );
}

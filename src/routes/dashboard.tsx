import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Inbox, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categoryEmoji, categoryLabel, unitLabel } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Reflow" }] }),
  component: Dashboard,
});

interface MyListing {
  id: string; title: string; category: string; quantity: number; unit: string;
  status: string; price_per_unit: number | null; is_free: boolean; created_at: string;
}
interface Inquiry {
  id: string; listing_id: string; message: string; quantity_requested: number | null;
  status: string; created_at: string; buyer_id: string; seller_id: string;
  listing: { title: string } | null;
}

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [received, setReceived] = useState<Inquiry[]>([]);
  const [sent, setSent] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const reload = async () => {
    if (!user) return;
    const [l, r, s] = await Promise.all([
      supabase.from("listings").select("id,title,category,quantity,unit,status,price_per_unit,is_free,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*, listing:listings(title)").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*, listing:listings(title)").eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);
    setListings((l.data as MyListing[]) ?? []);
    setReceived((r.data as Inquiry[]) ?? []);
    setSent((s.data as Inquiry[]) ?? []);
  };

  useEffect(() => { if (user) reload(); }, [user]);

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); reload(); }
  };

  const updateInquiry = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status: status as never }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); reload(); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-display text-5xl">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your listings and inquiries.</p>
          </div>
          <Button asChild><Link to="/listings/new"><Plus className="h-4 w-4" />New listing</Link></Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Package} label="Active listings" value={listings.filter(l => l.status === "available").length} />
          <StatCard icon={Inbox} label="Inquiries received" value={received.length} />
          <StatCard icon={Inbox} label="Inquiries sent" value={sent.length} />
        </div>

        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings">My listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {listings.length === 0 ? (
              <EmptyState message="No listings yet." cta={{ to: "/listings/new", label: "Create one" }} />
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <Card key={l.id} className="p-4 flex items-center gap-4 flex-wrap">
                    <div className="text-3xl">{categoryEmoji(l.category)}</div>
                    <div className="flex-1 min-w-[200px]">
                      <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:underline">{l.title}</Link>
                      <div className="text-sm text-muted-foreground">{categoryLabel(l.category)} · {l.quantity} {unitLabel(l.unit)} · {l.is_free ? "Free" : l.price_per_unit ? `$${l.price_per_unit}/${unitLabel(l.unit)}` : "On request"}</div>
                    </div>
                    <Badge variant="outline">{l.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteListing(l.id)}><Trash2 className="h-4 w-4" /></Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            {received.length === 0 ? <EmptyState message="No inquiries yet." /> : (
              <div className="space-y-3">
                {received.map((i) => (
                  <Card key={i.id} className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <Link to="/listings/$id" params={{ id: i.listing_id }} className="font-semibold hover:underline">{i.listing?.title ?? "Listing"}</Link>
                        <div className="text-xs text-muted-foreground mt-0.5">{new Date(i.created_at).toLocaleString()}</div>
                        <p className="mt-3 text-sm">{i.message}</p>
                        {i.quantity_requested && <p className="mt-2 text-sm font-medium">Requested: {i.quantity_requested}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">{i.status}</Badge>
                        {i.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateInquiry(i.id, "declined")}>Decline</Button>
                            <Button size="sm" onClick={() => updateInquiry(i.id, "accepted")}>Accept</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            {sent.length === 0 ? <EmptyState message="You haven't sent any inquiries yet." /> : (
              <div className="space-y-3">
                {sent.map((i) => (
                  <Card key={i.id} className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <Link to="/listings/$id" params={{ id: i.listing_id }} className="font-semibold hover:underline">{i.listing?.title ?? "Listing"}</Link>
                        <div className="text-xs text-muted-foreground mt-0.5">{new Date(i.created_at).toLocaleString()}</div>
                        <p className="mt-3 text-sm">{i.message}</p>
                      </div>
                      <Badge variant="outline">{i.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon className="h-6 w-6" /></div>
      <div>
        <div className="font-display text-3xl">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: { to: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      {cta && <Button asChild className="mt-4"><Link to={cta.to}>{cta.label}</Link></Button>}
    </div>
  );
}

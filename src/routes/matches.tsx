import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches — Reflow" }] }),
  component: MatchesPage,
});

const PIPELINE = [
  { value: "suggested", label: "Suggested" },
  { value: "contacted", label: "Contacted" },
  { value: "in_talks", label: "In Talks" },
  { value: "closed_won", label: "Closed (Won)" },
  { value: "closed_lost", label: "Closed (Lost)" },
] as const;

interface Match {
  id: string; listing_id: string; seller_id: string; buyer_id: string;
  status: string; deal_value: number | null; created_at: string;
  listing: { title: string; category: string } | null;
}

function MatchesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("matches")
      .select("*, listing:listings(title,category)")
      .order("created_at", { ascending: false });
    setMatches((data as Match[]) ?? []);
  };
  useEffect(() => { if (user) reload(); }, [user]);

  const advance = async (id: string, status: string, deal_value?: number) => {
    const patch: Record<string, unknown> = { status };
    if (deal_value !== undefined) patch.deal_value = deal_value;
    const { error } = await supabase.from("matches").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); reload(); }
  };

  if (!user) return null;

  const grouped = PIPELINE.map((p) => ({
    ...p,
    items: matches.filter((m) => m.status === p.value),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="font-display text-5xl mb-2">Matches</h1>
        <p className="text-muted-foreground mb-8">Your deal pipeline — every match generated for your listings or your buyer needs.</p>

        <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-2">
          {grouped.map((col) => (
            <div key={col.value} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{col.label}</h3>
                <Badge variant="outline">{col.items.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {col.items.map((m) => (
                  <MatchCard key={m.id} match={m} userId={user.id} onAdvance={advance} />
                ))}
                {col.items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground text-center">Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function MatchCard({ match, userId, onAdvance }: { match: Match; userId: string; onAdvance: (id: string, status: string, dv?: number) => void }) {
  const role = match.seller_id === userId ? "Seller" : "Buyer";
  const [dealOpen, setDealOpen] = useState(false);
  const [dealValue, setDealValue] = useState("");

  const next = (() => {
    if (match.status === "suggested") return "contacted";
    if (match.status === "contacted") return "in_talks";
    return null;
  })();

  return (
    <Card className="p-3 space-y-2">
      <Link to="/listings/$id" params={{ id: match.listing_id }} className="font-medium text-sm hover:underline line-clamp-2">
        {match.listing?.title ?? "Listing"}
      </Link>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{role}</span>
        {match.deal_value && <span className="font-medium text-foreground">${match.deal_value.toLocaleString()}</span>}
      </div>
      <div className="flex flex-col gap-1">
        {next && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdvance(match.id, next)}>
            Move to {PIPELINE.find(p => p.value === next)?.label} <ArrowRight className="h-3 w-3" />
          </Button>
        )}
        {match.status === "in_talks" && (
          <Dialog open={dealOpen} onOpenChange={setDealOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs">Close won</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Close deal</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="dv">Deal value (USD)</Label>
                <Input id="dv" type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
                <p className="text-xs text-muted-foreground">A 2.5% transaction fee invoice is generated automatically.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => { onAdvance(match.id, "closed_won", Number(dealValue)); setDealOpen(false); }}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {(match.status === "contacted" || match.status === "in_talks" || match.status === "suggested") && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onAdvance(match.id, "closed_lost")}>Close lost</Button>
        )}
      </div>
    </Card>
  );
}

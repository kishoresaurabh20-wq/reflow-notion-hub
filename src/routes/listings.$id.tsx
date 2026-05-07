import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Package, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categoryEmoji, categoryLabel, unitLabel } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
});

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number | null;
  is_free: boolean;
  location: string;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface Profile {
  company_name: string;
  contact_name: string | null;
  industry: string | null;
  location: string | null;
}

function ListingDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (data) {
        setListing(data as Listing);
        const { data: p } = await supabase.from("profiles").select("company_name,contact_name,industry,location").eq("id", data.user_id).maybeSingle();
        setSeller(p as Profile);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!listing) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20 text-center flex-1">
        <h1 className="font-display text-4xl">Listing not found</h1>
        <Button asChild className="mt-6"><Link to="/browse">Back to browse</Link></Button>
      </div>
    </div>
  );

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 flex-1">
        <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/browse"><ArrowLeft className="h-4 w-4" />Back</Link></Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-muted shadow-soft">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl bg-[image:var(--gradient-warm)]">
                  {categoryEmoji(listing.category)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{categoryEmoji(listing.category)} {categoryLabel(listing.category)}</Badge>
                {listing.is_free && <Badge className="bg-success text-success-foreground">Free</Badge>}
                <Badge variant="outline">{listing.status}</Badge>
              </div>
              <h1 className="font-display text-4xl md:text-5xl">{listing.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" />{listing.quantity} {unitLabel(listing.unit)}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-[image:var(--gradient-card)] border-border/60 shadow-soft">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-display text-4xl mt-1">
                {listing.is_free ? "Free" : listing.price_per_unit ? `$${listing.price_per_unit}` : "On request"}
                {listing.price_per_unit && !listing.is_free && (
                  <span className="text-base text-muted-foreground font-sans"> /{unitLabel(listing.unit)}</span>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Available: {listing.quantity} {unitLabel(listing.unit)}</div>
            </Card>

            {seller && (
              <Card className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Building2 className="h-4 w-4" />Seller</div>
                <div className="font-semibold text-lg">{seller.company_name}</div>
                {seller.industry && <div className="text-sm text-muted-foreground">{seller.industry}</div>}
                {seller.location && <div className="text-sm text-muted-foreground mt-1">{seller.location}</div>}
              </Card>
            )}

            {!isOwner && <InquiryBox listing={listing} disabled={!user} />}
            {isOwner && (
              <Card className="p-6 bg-secondary/40">
                <p className="text-sm text-muted-foreground">This is your listing.</p>
                <Button asChild variant="outline" className="mt-3 w-full"><Link to="/dashboard">Manage in dashboard</Link></Button>
              </Card>
            )}
            {!user && (
              <Card className="p-6 bg-accent/10 border-accent/30">
                <p className="text-sm">Sign in to send an inquiry.</p>
                <Button asChild className="mt-3 w-full" onClick={() => navigate({ to: "/auth" })}><Link to="/auth">Sign in</Link></Button>
              </Card>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function InquiryBox({ listing, disabled }: { listing: Listing; disabled: boolean }) {
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();

  const send = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      message,
      quantity_requested: qty ? Number(qty) : null,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Inquiry sent!"); setMessage(""); setQty(""); }
  };

  if (disabled) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-3">Send inquiry</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="qty" className="text-xs">Quantity needed ({unitLabel(listing.unit)})</Label>
          <Input id="qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 500" />
        </div>
        <div>
          <Label htmlFor="msg" className="text-xs">Message</Label>
          <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell the seller what you need…" />
        </div>
        <Button onClick={send} disabled={busy || !message} className="w-full">{busy ? "Sending…" : "Send inquiry"}</Button>
      </div>
    </Card>
  );
}

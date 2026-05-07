import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Recycle, TrendingDown, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard, type ListingCardData } from "@/components/listing-card";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-warehouse.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reflow — Turn industrial by-products into resources" },
      { name: "description", content: "Reflow is the B2B marketplace where industries trade waste and by-products as raw materials. Join the circular economy." },
      { property: "og:title", content: "Reflow — Circular Marketplace" },
      { property: "og:description", content: "Connect with businesses to source and sell industrial by-products." },
    ],
  }),
  component: Index,
});

function Index() {
  const [recent, setRecent] = useState<ListingCardData[]>([]);

  useEffect(() => {
    supabase
      .from("listings")
      .select("id,title,category,quantity,unit,price_per_unit,is_free,location,image_url,status")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setRecent((data as ListingCardData[]) ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-25" width={1920} height={1080} />
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-90" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-36 text-primary-foreground">
          <Badge className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" /> Circular economy, industrial scale
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl">
            One factory's waste, another's <em className="text-primary-glow">raw material</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
            Reflow connects manufacturers, processors, and recyclers to trade by-products — turning waste streams into supply chains.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-elegant">
              <Link to="/browse">Browse materials <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/listings/new">List a by-product</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl">
            {[
              { value: "12+", label: "Material categories" },
              { value: "B2B", label: "Verified businesses" },
              { value: "0", label: "To landfill" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl text-primary-glow">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Trade across every stream</h2>
            <p className="text-muted-foreground mt-2">From plastics to organics — find buyers and suppliers in your industry.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/browse">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.value} to="/browse" search={{ category: c.value }}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-card p-5 transition-smooth hover:border-primary hover:shadow-soft hover:-translate-y-0.5">
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-xs font-medium text-center">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      {recent.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="font-display text-4xl md:text-5xl">Fresh on the marketplace</h2>
            <Button asChild variant="ghost"><Link to="/browse">All listings <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Why */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: TrendingDown, title: "Cut disposal costs", body: "Turn waste-management line items into revenue streams." },
            { icon: Recycle, title: "Source cheaper inputs", body: "Buy quality by-products directly from producers." },
            { icon: Globe2, title: "Hit ESG targets", body: "Track diverted volume and prove circularity to stakeholders." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-[image:var(--gradient-card)] p-8 shadow-soft">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-[image:var(--gradient-hero)] p-12 md:p-16 text-primary-foreground text-center shadow-elegant">
          <h2 className="font-display text-4xl md:text-6xl max-w-2xl mx-auto">Ready to close the loop?</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">Join Reflow free and start trading your first by-product today.</p>
          <Button asChild size="lg" className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link to="/auth">Create your account <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

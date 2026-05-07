import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard, type ListingCardData } from "@/components/listing-card";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Browse by-products — Reflow" }] }),
  component: BrowsePage,
});

function BrowsePage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => {
    let req = supabase
      .from("listings")
      .select("id,title,category,quantity,unit,price_per_unit,is_free,location,image_url,status")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(60);
    if (category) req = req.eq("category", category as never);
    req.then(({ data }) => setListings((data as ListingCardData[]) ?? []));
  }, [category]);

  const filtered = useMemo(() => {
    if (!query) return listings;
    const ql = query.toLowerCase();
    return listings.filter((l) => l.title.toLowerCase().includes(ql) || l.location.toLowerCase().includes(ql));
  }, [listings, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 flex-1">
        <div className="mb-8">
          <h1 className="font-display text-5xl">Browse by-products</h1>
          <p className="text-muted-foreground mt-2">Source materials directly from industries near you.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials, locations…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/browse" search={{}}>
              <Badge variant={!category ? "default" : "outline"} className="cursor-pointer">All</Badge>
            </Link>
            {CATEGORIES.map((c) => (
              <Link key={c.value} to="/browse" search={{ category: c.value }}>
                <Badge variant={category === c.value ? "default" : "outline"} className="cursor-pointer">
                  {c.emoji} {c.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-16 text-center">
            <p className="text-muted-foreground">No listings yet in this category. Be the first to list a by-product.</p>
            <Link to="/listings/new" className="mt-4 inline-flex text-primary font-medium underline">Create a listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

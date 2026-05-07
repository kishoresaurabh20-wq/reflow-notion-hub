import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package } from "lucide-react";
import { categoryEmoji, categoryLabel, unitLabel } from "@/lib/categories";

export interface ListingCardData {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number | null;
  is_free: boolean;
  location: string;
  image_url: string | null;
  status: string;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link to="/listings/$id" params={{ id: listing.id }}>
      <Card className="group h-full overflow-hidden p-0 transition-smooth hover:shadow-elegant hover:-translate-y-1 border-border/60">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-smooth group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl bg-[image:var(--gradient-warm)]">
              {categoryEmoji(listing.category)}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
              {categoryEmoji(listing.category)} {categoryLabel(listing.category)}
            </Badge>
          </div>
          {listing.is_free && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-success text-success-foreground">Free</Badge>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{listing.title}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              {listing.quantity} {unitLabel(listing.unit)}
            </span>
            <span className="font-semibold text-foreground">
              {listing.is_free
                ? "Free"
                : listing.price_per_unit
                ? `$${listing.price_per_unit}/${unitLabel(listing.unit)}`
                : "On request"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </div>
        </div>
      </Card>
    </Link>
  );
}

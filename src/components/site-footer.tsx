import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Recycle className="h-4 w-4" />
            </div>
            <span className="font-display text-xl">Reflow</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            The B2B marketplace turning industrial by-products into raw materials.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/browse" className="hover:text-foreground">Browse materials</Link></li>
            <li><Link to="/listings/new" className="hover:text-foreground">List by-products</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Impact</h4>
          <p className="text-sm text-muted-foreground">Every transaction reduces landfill waste and lowers your supply chain footprint.</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Reflow. Building the circular economy.
      </div>
    </footer>
  );
}

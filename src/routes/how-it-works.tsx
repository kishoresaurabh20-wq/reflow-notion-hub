import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MessageSquare, Handshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "How it works — Reflow" }, { name: "description", content: "Learn how Reflow connects industries to trade by-products in three simple steps." }] }),
  component: HowItWorks,
});

const steps = [
  { icon: Search, title: "Discover materials", body: "Browse thousands of industrial by-products, filter by category and location, and find what fits your supply chain." },
  { icon: MessageSquare, title: "Connect directly", body: "Send inquiries to verified businesses, negotiate quantities and pricing, and arrange logistics." },
  { icon: Handshake, title: "Close the loop", body: "Complete the transaction, track your circular impact, and divert materials from landfill." },
];

function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16 flex-1 max-w-5xl">
        <h1 className="font-display text-5xl md:text-6xl">How Reflow works</h1>
        <p className="text-muted-foreground text-lg mt-3 max-w-2xl">Three steps from waste to resource — built for industrial scale.</p>

        <div className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-6 items-start rounded-2xl border border-border/60 bg-[image:var(--gradient-card)] p-8 shadow-soft">
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-soft"><s.icon className="h-6 w-6" /></div>
                <div className="font-display text-2xl text-muted-foreground mt-2">0{i + 1}</div>
              </div>
              <div>
                <h2 className="font-display text-3xl">{s.title}</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg"><Link to="/auth">Get started free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

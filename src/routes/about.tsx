import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Reflow" }, { name: "description", content: "Reflow is on a mission to make industrial waste a thing of the past." }] }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20 flex-1 max-w-3xl">
        <h1 className="font-display text-6xl">A circular economy, at industrial scale.</h1>
        <div className="mt-8 space-y-6 text-lg text-foreground/85 leading-relaxed">
          <p>Every year, industries discard billions of tonnes of materials that other industries need. Reflow exists to fix that asymmetry.</p>
          <p>We're a B2B super-platform connecting manufacturers, processors, and recyclers — turning waste streams into supply chains. No middlemen, no landfill, no waste.</p>
          <p>From plastic regrind to spent grain, from offcut metal to scrap textiles — if it can be reused, it belongs on Reflow.</p>
        </div>
        <Button asChild size="lg" className="mt-10"><Link to="/auth">Join the platform</Link></Button>
      </div>
      <SiteFooter />
    </div>
  );
}

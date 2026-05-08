import { Link } from "@tanstack/react-router";
import { Recycle, Plus, LogOut, LayoutDashboard, User as UserIcon, Target, Workflow, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-admin";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft group-hover:shadow-glow transition-smooth">
            <Recycle className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl text-foreground">Reflow</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Circular Marketplace</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/browse" className="text-foreground/70 hover:text-foreground transition-smooth" activeProps={{ className: "text-foreground" }}>Browse</Link>
          <Link to="/how-it-works" className="text-foreground/70 hover:text-foreground transition-smooth" activeProps={{ className: "text-foreground" }}>How it works</Link>
          <Link to="/about" className="text-foreground/70 hover:text-foreground transition-smooth" activeProps={{ className: "text-foreground" }}>About</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="default" className="hidden sm:inline-flex">
                <Link to="/listings/new"><Plus className="h-4 w-4" />List by-product</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/matches"><Workflow className="h-4 w-4" />Matches</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/buyer-needs"><Target className="h-4 w-4" />Buyer needs</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/listings/new"><Plus className="h-4 w-4" />New listing</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/admin"><ShieldCheck className="h-4 w-4" />Admin</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4" />Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

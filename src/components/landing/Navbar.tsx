import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import brandcampLogo from "@/assets/BC Full Logo Transparent.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border" style={{ background: 'linear-gradient(to bottom, hsl(145, 40%, 92%), hsl(0, 0%, 100%, 0.9))' }}>
      <div className="container flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center shrink-0"
          onClick={() => document.documentElement.classList.remove("dark")}
          aria-label="BrandCamp"
        >
          <img
            src={brandcampLogo}
            alt="BrandCamp"
            className="h-auto w-auto max-h-12 max-w-full"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/tour" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/brand/login">
            <Button variant="outline" size="sm">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <Link to="/pricing" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Pricing</Link>
          <Link to="/tour" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</Link>
          <Link to="/brand/login" onClick={() => setOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">Log In</Button>
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            <Button variant="hero" size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { Link } from "react-router-dom";
import { Tent } from "lucide-react";

const Footer = () => (
  <footer className="py-12 border-t border-border bg-muted/30">
    <div className="container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Tent className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">BrandCamp</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/tour" className="hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} BrandCamp. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

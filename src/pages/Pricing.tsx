import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const freeFeatures = [
  "3 active campaigns",
  "Customizable creator intake process",
  "Analytics dashboard",
  "Custom affiliate links & codes",
  "Creator view",
];

const proExtras = [
  "Unlimited active campaigns",
  "Creator search, recommendations & invitations",
  "Eligible creators filtering",
  "Priority campaign placements",
  "Priority support",
  "Extended creator attribution window",
  '"Top brand" badge visible to creators',
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-24" style={{ background: 'linear-gradient(180deg, hsl(145, 30%, 92%) 0%, hsl(150, 20%, 95%) 50%, hsl(0, 0%, 98%) 100%)' }}>
      <div className="container">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-foreground">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">Creators join for free. Brands, pick the plan that fits your scale.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic */}
          <motion.div
            className="relative p-8 rounded-2xl border border-border shadow-card bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-5xl font-bold text-foreground">Free</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup?role=brand&plan=basic">
              <Button variant="outline" className="w-full rounded-xl" size="lg">Get Started</Button>
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            className="relative p-8 rounded-2xl border border-border shadow-card bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-5xl font-bold text-foreground">$49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-3">Everything in Basic, plus:</p>
            <ul className="space-y-3 mb-8">
              {proExtras.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup?role=brand&plan=pro">
              <Button variant="outline" className="w-full rounded-xl" size="lg">Get Started</Button>
            </Link>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Creators don't pay sign-up fees. 10% of creator earnings go to BrandCamp.
          </p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Pricing;

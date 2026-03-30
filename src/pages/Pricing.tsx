import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    features: [
      { text: "3 active campaigns", included: true },
      { text: "Customizable creator intake process", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom affiliate links & codes", included: true },
      { text: "Creator view", included: true },
      { text: "Unlimited active campaigns", included: false },
      { text: "Creator search & recommendations", included: false },
      { text: "Eligible creators filtering", included: false },
      { text: "Priority campaign placements", included: false },
      { text: "Priority support", included: false },
      { text: "Extended attribution window", included: false },
      { text: "Top brand badge", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    features: [
      { text: "Everything in Basic, plus:", included: true },
      { text: "Unlimited active campaigns", included: true },
      { text: "Creator search, recommendations & invitations", included: true },
      { text: "Eligible creators filtering", included: true },
      { text: "Priority campaign placements", included: true },
      { text: "Priority support", included: true },
      { text: "Extended creator attribution window", included: true },
      { text: '"Top brand" badge visible to creators', included: true },
    ],
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-24">
      <div className="container">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-foreground">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">Creators join for free. Brands, pick the plan that fits your scale.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border border-border shadow-card bg-card`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-5xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Link to={`/signup?role=brand&plan=${plan.name.toLowerCase()}`}>
                <Button variant={plan.name === "Pro" ? "hero" : "outline"} className="w-full rounded-xl" size="lg">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Creators don't pay sign-up fees. 10% of creator earnings go to AllCall.
          </p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Pricing;

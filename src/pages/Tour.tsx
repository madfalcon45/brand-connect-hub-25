import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Link2, Users, DollarSign, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Brands Create Campaigns",
    description: "Set your product, payment method, and creator requirements in minutes.",
    icon: Sparkles,
  },
  {
    title: "Creators Apply",
    description: "Creators browse campaigns and apply to the ones that fit their audience.",
    icon: UserCheck,
  },
  {
    title: "Affiliate Code Generation",
    description: "Approved creators get unique tracking links and discount codes automatically.",
    icon: Link2,
  },
  {
    title: "Track Performance",
    description: "Every click and sale is tracked per creator in real time.",
    icon: BarChart3,
  },
  {
    title: "Creator Payout",
    description: "Creators get paid via commission, flat rate, or sign-on pay.",
    icon: DollarSign,
  },
  {
    title: "Grow Together",
    description: "Brands and creators build long-term partnerships and scale together.",
    icon: Users,
  },
];

const Tour = () => (
  <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(152, 69%, 37%) 0%, hsl(160, 60%, 31%) 30%, hsl(145, 40%, 46%) 60%, hsl(140, 30%, 80%) 100%)' }}>
    <Navbar />
    <section className="pt-32 pb-24">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-primary-foreground">How AllCall Works</h1>
          <p className="text-lg text-primary-foreground/80">A quick tour of the platform from both sides.</p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border shadow-card"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Step {i + 1}</span>
                  <h3 className="font-display text-xl font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/signup">
            <Button variant="hero" size="lg" className="rounded-xl px-10">
              Get Started Now <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Tour;

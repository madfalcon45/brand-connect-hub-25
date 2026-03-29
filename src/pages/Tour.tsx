import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Link2, Users, DollarSign, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Brands Create Campaigns",
    description: "Set product details, payment methods (commission, flat rate, or hybrid), creator filters, and whether creators need to apply or can join instantly.",
    icon: Sparkles,
  },
  {
    title: "Creators Discover & Apply",
    description: "Creators browse a social-media style feed of campaigns, sorted by AI based on matching categories, platforms, and brand tier. Top picks get badges.",
    icon: Eye,
  },
  {
    title: "Affiliate Links & Codes",
    description: "Approved creators get unique tracking links and discount codes. They can add all their campaigns to a single master link page for their bio.",
    icon: Link2,
  },
  {
    title: "Track Sales & Attribution",
    description: "Every click and sale is tracked per creator. Brands can also manually attribute offline sales to creators.",
    icon: BarChart3,
  },
  {
    title: "Automatic Payments",
    description: "Brands pay creators via sign-on pay, commission, or flat rate. Payments are processed through connected bank info.",
    icon: DollarSign,
  },
  {
    title: "Grow Together",
    description: "Brands see active creator counts and performance. Creators build a portfolio of campaigns and earnings across multiple brands.",
    icon: Users,
  },
];

const Tour = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-24">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-foreground">How AllCall Works</h1>
          <p className="text-lg text-muted-foreground">A quick tour of the platform from both sides.</p>
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

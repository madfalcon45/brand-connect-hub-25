import { Link2, DollarSign, BarChart3, Shield, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Link2,
    title: "Affiliate Links & Codes",
    description: "Auto-generate unique tracking links and discount codes for every creator-campaign pair.",
  },
  {
    icon: DollarSign,
    title: "Sign-On Pay",
    description: "Brands can set sign-on bonuses that creators receive upon campaign approval.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track clicks, sales, and revenue per creator with customizable dashboards.",
  },
  {
    icon: Shield,
    title: "Sales Attribution",
    description: "Attribute offline and referral sales to creators with manual or automated tracking.",
  },
  {
    icon: Zap,
    title: "AI Recommendations",
    description: "Smart matching pairs brands with the best creators based on category, audience, and platform.",
  },
  {
    icon: Users,
    title: "Master Link Pages",
    description: "Creators can share one link containing all their active campaign links and codes.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Everything you need to grow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From campaign creation to payment processing, AllCall handles the entire creator-brand workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

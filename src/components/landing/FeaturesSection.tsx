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
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(152, 69%, 37%) 0%, hsl(160, 60%, 31%) 30%, hsl(145, 40%, 46%) 60%, hsl(140, 30%, 80%) 100%)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-primary-foreground">
            Everything you need to grow
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            From campaign creation to payment processing, BrandCamp handles the entire creator-brand workflow.
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

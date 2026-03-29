import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Building2, Palette, ArrowRight, ArrowLeft } from "lucide-react";

const brandCategories = [
  "Fashion & Apparel", "Beauty & Skincare", "Health & Wellness", "Food & Beverage",
  "Tech & Electronics", "Home & Living", "Sports & Fitness", "Travel & Hospitality",
  "Education", "Finance", "Entertainment", "Automotive", "Pet Products", "Other",
];

const creatorCategories = [
  "Beauty & Makeup", "Fashion & Style", "Fitness & Health", "Food & Cooking",
  "Tech & Gadgets", "Gaming", "Travel", "Lifestyle", "Comedy & Entertainment",
  "Education & How-to", "Finance & Business", "DIY & Crafts", "Parenting", "General / Any",
];

const Signup = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = params.get("role") as "brand" | "creator" | null;

  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [role, setRole] = useState<"brand" | "creator" | null>(initialRole);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", companyName: "", country: "" });
  const [socials, setSocials] = useState([{ platform: "", url: "" }]);

  const totalSteps = role === "brand" ? 4 : 4;
  const progress = (step / totalSteps) * 100;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addSocial = () => setSocials([...socials, { platform: "", url: "" }]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      // Complete signup -> redirect to dashboard
      navigate(role === "brand" ? "/brand/dashboard" : "/creator/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-xl">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-card"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join AllCall</h1>
                  <p className="text-muted-foreground">How would you like to use AllCall?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setRole("brand"); setStep(1); }}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground">I'm a Brand</p>
                    <p className="text-xs text-muted-foreground mt-1">Launch campaigns & find creators</p>
                  </button>
                  <button
                    onClick={() => { setRole("creator"); setStep(1); }}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <Palette className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground">I'm a Creator</p>
                    <p className="text-xs text-muted-foreground mt-1">Discover campaigns & earn</p>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                  </div>
                  {role === "brand" && (
                    <div>
                      <Label>Company Name</Label>
                      <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Your brand" />
                    </div>
                  )}
                  <div>
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="United States" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {role === "brand" ? "What describes your brand?" : "What content do you create?"}
                </h2>
                <p className="text-sm text-muted-foreground">Select one or more categories.</p>
                <div className="flex flex-wrap gap-2">
                  {(role === "brand" ? brandCategories : creatorCategories).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        selectedCategories.includes(cat)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && role === "creator" && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Social Accounts</h2>
                <p className="text-sm text-muted-foreground">Add your platforms so brands can find you. Followers are tracked automatically from your profile URL.</p>
                {socials.map((s, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <select
                      className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={s.platform}
                      onChange={(e) => {
                        const updated = [...socials];
                        updated[i].platform = e.target.value;
                        setSocials(updated);
                      }}
                    >
                      <option value="">Platform</option>
                      <option>TikTok</option>
                      <option>Instagram</option>
                      <option>YouTube</option>
                      <option>Twitter/X</option>
                      <option>Facebook</option>
                    </select>
                    <Input
                      className="col-span-2"
                      placeholder="Profile URL"
                      value={s.url}
                      onChange={(e) => {
                        const updated = [...socials];
                        updated[i].url = e.target.value;
                        setSocials(updated);
                      }}
                    />
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addSocial}>+ Add another platform</Button>
              </div>
            )}

            {step === 3 && role === "brand" && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Payment Information</h2>
                <p className="text-sm text-muted-foreground">Set up how you'll pay creators.</p>
                <div className="space-y-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input placeholder="Your bank" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input placeholder="••••••••" />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && role === "brand" && (
              <div className="space-y-5 text-center">
                <h2 className="font-display text-2xl font-bold text-foreground">Choose Your Plan</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Basic", price: "$39/mo", desc: "3 campaigns, analytics, affiliate links" },
                    { name: "Pro", price: "$149/mo", desc: "Unlimited campaigns, AI recommendations, priority" },
                  ].map((plan) => (
                    <button key={plan.name} className="p-5 rounded-xl border-2 border-border hover:border-primary transition-all text-left">
                      <p className="font-display font-bold text-foreground text-lg">{plan.name}</p>
                      <p className="font-display text-2xl font-bold text-primary">{plan.price}</p>
                      <p className="text-xs text-muted-foreground mt-2">{plan.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && role === "creator" && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Payment Info</h2>
                <p className="text-sm text-muted-foreground">Where should we send your earnings?</p>
                <div className="space-y-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input placeholder="Your bank" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input placeholder="••••••••" />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input placeholder="••••••••" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">10% of earnings go to AllCall. No upfront fees.</p>
              </div>
            )}

            {step > 0 && (
              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="hero" onClick={handleNext}>
                  {step === totalSteps ? "Complete Setup" : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </motion.div>

          {/* Progress bar */}
          {step > 0 && (
            <div className="mt-6">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-brand rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Step {step} of {totalSteps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

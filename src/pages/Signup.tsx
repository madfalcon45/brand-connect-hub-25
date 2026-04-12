import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Building2, Palette, ArrowRight, ArrowLeft, Check, AlertCircle, CreditCard, Plus, X as XIcon, Upload } from "lucide-react";

const countries = ["United States", "United Kingdom", "Canada"];

const brandCategories = [
  "Fashion & Apparel", "Beauty & Skincare", "Health & Wellness", "Food & Beverage",
  "Tech & Electronics", "Home & Living", "Sports & Fitness", "Travel & Hospitality",
  "Education", "Finance", "Entertainment", "Automotive", "Pet Products",
];

const creatorCategories = [
  "Beauty & Makeup", "Fashion & Style", "Fitness & Health", "Food & Cooking",
  "Tech & Gadgets", "Gaming", "Travel", "Lifestyle", "Comedy & Entertainment",
  "Education & How-to", "Finance & Business", "DIY & Crafts", "Parenting", "General / Any",
];

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

const Signup = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = params.get("role") as "brand" | "creator" | null;
  const planParam = params.get("plan");
  const initialPlan = planParam === "basic" || planParam === "pro" ? planParam : null;

  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [role, setRole] = useState<"brand" | "creator" | null>(initialRole);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [productType, setProductType] = useState<"physical" | "digital" | "">(""); 
  const [formData, setFormData] = useState({ name: "", email: "", password: "", companyName: "", country: "", address: "" });
  const [socials, setSocials] = useState([{ platform: "", url: "" }]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(initialPlan);
  const [errors, setErrors] = useState<string[]>([]);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed && !selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
      setCustomCategory("");
    }
  };

  const addSocial = () => setSocials([...socials, { platform: "", url: "" }]);

  const getUsedPlatforms = () => socials.map((s) => s.platform).filter(Boolean);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBrandLogo(URL.createObjectURL(file));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (step === 1) {
      if (role === "brand" && !formData.companyName.trim()) errs.push("Company Name is required");
      if (role === "creator" && !formData.name.trim()) errs.push("Full Name is required");
      if (!formData.email.trim()) errs.push("Email is required");
      if (!formData.password.trim()) errs.push("Password is required");
      if (!formData.country) errs.push("Country is required");
    }
    if (step === 2) {
      if (selectedCategories.length === 0) errs.push("Select at least one category");
      if (role === "brand" && !productType) errs.push("Select whether your product is physical or digital");
    }
    if (step === 3 && role === "creator") {
      if (socials.every((s) => !s.platform || !s.url.trim())) errs.push("Add at least one social account");
    }
    if (step === 3 && role === "brand") {
      if (!selectedPlan) errs.push("Choose a plan before continuing");
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    if (step < totalSteps) setStep(step + 1);
    else {
      if (selectedPlan) localStorage.setItem("allcall_plan", selectedPlan);
      if (role === "brand") {
        localStorage.setItem("allcall_brand_name", formData.companyName);
        localStorage.setItem("allcall_categories", JSON.stringify(selectedCategories));
        if (brandLogo) localStorage.setItem("allcall_brand_logo", brandLogo);
        if (productType) localStorage.setItem("allcall_product_type", productType);
      }
      if (role === "creator") {
        localStorage.setItem("allcall_creator_name", formData.name);
        if (formData.address.trim()) localStorage.setItem("allcall_creator_address", formData.address);
        // Persist signup socials so they show in the creator portfolio.
        const normalizedSocials = socials
          .map((s) => ({ platform: s.platform.trim(), url: s.url.trim() }))
          .filter((s) => s.platform && s.url);
        if (normalizedSocials.length > 0) {
          localStorage.setItem("allcall_creator_social_links", JSON.stringify(normalizedSocials));
        }
      }
      localStorage.setItem("allcall_email", formData.email);
      localStorage.setItem("allcall_country", formData.country);
      navigate(role === "brand" ? "/brand/dashboard" : "/creator/dashboard");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(152, 69%, 37%) 0%, hsl(160, 60%, 31%) 30%, hsl(145, 40%, 46%) 60%, hsl(140, 30%, 80%) 100%)' }}>
      <div className="absolute inset-0 bg-gradient-brand opacity-15" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-xl relative z-10">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-card"
          >
            {errors.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {errors.map((e) => (
                    <p key={e} className="text-sm text-destructive">{e}</p>
                  ))}
                </div>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join BrandCamp</h1>
                  <p className="text-muted-foreground">How would you like to use BrandCamp?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setRole("creator"); setStep(1); setErrors([]); }}
                    className="p-6 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all text-center group"
                  >
                    <Palette className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground">I'm a Creator</p>
                    <p className="text-xs text-muted-foreground mt-1">Discover campaigns & earn</p>
                  </button>
                  <button
                    onClick={() => { setRole("brand"); setStep(1); setErrors([]); }}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <Building2 className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                    <p className="font-display font-semibold text-foreground">I'm a Brand</p>
                    <p className="text-xs text-muted-foreground mt-1">Launch campaigns & find creators</p>
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
                <div className="space-y-4">
                  {role === "brand" ? (
                    <>
                      <div>
                        <Label>Company Name</Label>
                        <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Your brand" />
                      </div>
                      <div>
                        <Label>Brand Logo (optional)</Label>
                        <div className="flex items-center gap-4 mt-1">
                          {brandLogo ? (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                              <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" />
                              <button onClick={() => setBrandLogo(null)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                          )}
                          <p className="text-xs text-muted-foreground">Upload your brand logo</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label>Full Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" />
                    </div>
                  )}
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      <option value="">Select your country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">More country support coming soon.</p>
                  </div>
                  {role === "creator" && (
                    <div>
                      <Label>Address (optional)</Label>
                      <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Your address for product delivery" />
                      <p className="text-xs text-muted-foreground mt-1">You can add or change this later in settings.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {role === "brand" ? "What describes your brand?" : "What content do you create?"}
                </h2>
                {role === "brand" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Is your product physical or digital?</p>
                    <div className="flex gap-3">
                      <button onClick={() => setProductType("physical")} className={`px-4 py-2 rounded-lg border text-sm ${productType === "physical" ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/50"}`}>Physical Product</button>
                      <button onClick={() => setProductType("digital")} className={`px-4 py-2 rounded-lg border text-sm ${productType === "digital" ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/50"}`}>Digital Product</button>
                    </div>
                  </div>
                )}
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
                  {/* Custom categories added */}
                  {selectedCategories.filter((c) => !(role === "brand" ? brandCategories : creatorCategories).includes(c)).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="px-4 py-2 rounded-full text-sm border bg-primary text-primary-foreground border-primary transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Add your own category..." className="flex-1" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomCategory(); } }} />
                  <Button variant="outline" size="sm" onClick={handleAddCustomCategory}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && role === "creator" && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Social Accounts</h2>
                <p className="text-sm text-muted-foreground">Add your platforms so brands can find you. Followers are tracked automatically from your profile URL.</p>
                {socials.map((s, i) => {
                  const usedPlatforms = getUsedPlatforms();
                  return (
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
                        {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook"].map((p) => (
                          <option key={p} disabled={usedPlatforms.includes(p) && s.platform !== p}>{p}</option>
                        ))}
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
                  );
                })}
                <Button variant="ghost" size="sm" onClick={addSocial}>+ Add another platform</Button>
              </div>
            )}

            {step === 3 && role === "brand" && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground text-center">Choose Your Plan</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "basic", name: "Basic", price: "Free", period: "" },
                    { key: "pro", name: "Pro", price: "$49", period: "/month" },
                  ].map((plan) => (
                    <button
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key)}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === plan.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-display font-bold text-foreground text-lg">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="font-display text-2xl font-bold text-primary">{plan.price}</span>
                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bg-muted/30 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Basic (Free)</p>
                    <ul className="space-y-1.5">
                      {freeFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-primary mb-2">Pro ($49/mo) — Everything in Basic, plus:</p>
                    <ul className="space-y-1.5">
                      {proExtras.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl font-bold text-foreground">Connect Payment</h2>
                <p className="text-sm text-muted-foreground">
                  {role === "brand" ? "Connect a payment service to pay creators." : "Connect a payment service to receive your earnings."}
                </p>
                <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Payment Integration</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Third-party payment service integration coming soon. You'll be able to connect Stripe, PayPal, or your bank account here.
                  </p>
                  <Button variant="outline" disabled className="rounded-xl">
                    Connect Payment Service
                  </Button>
                </div>
                {role === "creator" && (
                  <p className="text-xs text-muted-foreground">10% of earnings go to BrandCamp. No upfront fees.</p>
                )}
              </div>
            )}

            {step > 0 && (
              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={() => { setStep(step - 1); setErrors([]); }}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="hero" onClick={handleNext}>
                  {step === totalSteps ? "Complete Setup" : "Continue"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </motion.div>

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
              <p className="text-xs text-primary-foreground/70 mt-2 text-center">Step {step} of {totalSteps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

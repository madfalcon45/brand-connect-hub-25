import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Building2, Palette, ArrowRight, ArrowLeft, Check, X, AlertCircle } from "lucide-react";

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Brazil", "Mexico", "Argentina", "Colombia", "India", "Japan", "South Korea",
  "China", "Singapore", "Philippines", "Nigeria", "South Africa", "Kenya",
  "Egypt", "UAE", "Saudi Arabia", "Israel", "Turkey", "Poland", "Ireland",
  "New Zealand", "Portugal", "Belgium", "Switzerland", "Austria", "Other",
];

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

const planFeatures = [
  { text: "3 active campaigns", basic: true, pro: true },
  { text: "Customizable creator intake process", basic: true, pro: true },
  { text: "Analytics dashboard", basic: true, pro: true },
  { text: "Custom affiliate links & codes", basic: true, pro: true },
  { text: "Creator view", basic: true, pro: true },
  { text: "Unlimited active campaigns", basic: false, pro: true },
  { text: "Creator search, recommendations & invitations", basic: false, pro: true },
  { text: "Eligible creators filtering", basic: false, pro: true },
  { text: "Priority campaign placements", basic: false, pro: true },
  { text: "Priority support", basic: false, pro: true },
  { text: "Extended creator attribution window", basic: false, pro: true },
  { text: '"Top brand" badge visible to creators', basic: false, pro: true },
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
  const [bankInfo, setBankInfo] = useState({ bankName: "", accountNumber: "", routingNumber: "" });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const totalSteps = role === "brand" ? 4 : 4;
  const progress = (step / totalSteps) * 100;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addSocial = () => setSocials([...socials, { platform: "", url: "" }]);

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
    }
    if (step === 3 && role === "creator") {
      if (socials.every((s) => !s.platform || !s.url.trim())) errs.push("Add at least one social account");
    }
    if (step === 3 && role === "brand") {
      if (!bankInfo.bankName.trim()) errs.push("Bank Name is required");
      if (!bankInfo.accountNumber.trim()) errs.push("Account Number is required");
      if (!bankInfo.routingNumber.trim()) errs.push("Routing Number is required");
    }
    if (step === 4 && role === "brand") {
      if (!selectedPlan) errs.push("Choose a plan before continuing");
    }
    if (step === 4 && role === "creator") {
      if (!bankInfo.bankName.trim()) errs.push("Bank Name is required");
      if (!bankInfo.accountNumber.trim()) errs.push("Account Number is required");
      if (!bankInfo.routingNumber.trim()) errs.push("Routing Number is required");
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
      localStorage.setItem("allcall_bank", JSON.stringify(bankInfo));
      if (selectedPlan) localStorage.setItem("allcall_plan", selectedPlan);
      if (role === "brand") localStorage.setItem("allcall_brand_name", formData.companyName);
      if (role === "creator") localStorage.setItem("allcall_creator_name", formData.name);
      localStorage.setItem("allcall_email", formData.email);
      localStorage.setItem("allcall_country", formData.country);
      navigate(role === "brand" ? "/brand/dashboard" : "/creator/dashboard");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(152, 69%, 41%) 0%, hsl(160, 60%, 35%) 30%, hsl(145, 40%, 50%) 60%, hsl(140, 30%, 85%) 100%)' }}>
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
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Join AllCall</h1>
                  <p className="text-muted-foreground">How would you like to use AllCall?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setRole("brand"); setStep(1); setErrors([]); }}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-display font-semibold text-foreground">I'm a Brand</p>
                    <p className="text-xs text-muted-foreground mt-1">Launch campaigns & find creators</p>
                  </button>
                  <button
                    onClick={() => { setRole("creator"); setStep(1); setErrors([]); }}
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
                  {role === "brand" ? (
                    <div>
                      <Label>Company Name</Label>
                      <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Your brand" />
                    </div>
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
                    <Input value={bankInfo.bankName} onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })} placeholder="Your bank" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={bankInfo.accountNumber} onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input value={bankInfo.routingNumber} onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && role === "brand" && (
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
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground mb-3">Feature Comparison</p>
                  <div className="grid grid-cols-[1fr_60px_60px] gap-1 text-xs">
                    <div />
                    <div className="text-center font-semibold text-foreground">Basic</div>
                    <div className="text-center font-semibold text-primary">Pro</div>
                  </div>
                  {planFeatures.map((f) => (
                    <div key={f.text} className="grid grid-cols-[1fr_60px_60px] gap-1 items-center text-xs py-1 border-t border-border/50">
                      <span className="text-foreground">{f.text}</span>
                      <div className="flex justify-center">
                        {f.basic ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/40" />}
                      </div>
                      <div className="flex justify-center">
                        {f.pro ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/40" />}
                      </div>
                    </div>
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
                    <Input value={bankInfo.bankName} onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })} placeholder="Your bank" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={bankInfo.accountNumber} onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input value={bankInfo.routingNumber} onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">10% of earnings go to AllCall. No upfront fees.</p>
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
              <p className="text-xs text-muted-foreground text-center mt-2">Step {step} of {totalSteps}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

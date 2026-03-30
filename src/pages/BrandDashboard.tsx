import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Plus, Users, DollarSign, Settings, Eye, LogOut, Search,
  Bell, Lock, TrendingUp, Filter, Send, Check, X as XIcon,
  Package, Link2, MoreHorizontal, Star, Info, Moon, Sun, User, KeyRound, Crown, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const brandCategories = [
  "Fashion & Apparel", "Beauty & Skincare", "Health & Wellness", "Food & Beverage",
  "Tech & Electronics", "Home & Living", "Sports & Fitness", "Travel & Hospitality",
  "Education", "Finance", "Entertainment", "Automotive", "Pet Products", "Other",
];

// Map brand categories to campaign categories
const categoryMap: Record<string, string> = {
  "Fashion & Apparel": "Fashion",
  "Beauty & Skincare": "Beauty",
  "Health & Wellness": "Health",
  "Food & Beverage": "Food",
  "Tech & Electronics": "Tech",
  "Home & Living": "Home",
  "Sports & Fitness": "Sports",
  "Travel & Hospitality": "Travel",
};

const campaignCategories = ["Beauty", "Health", "Tech", "Fashion", "Food", "Sports", "Travel", "Home", "Education", "Finance", "Entertainment", "Automotive", "Pet Products", "Other"];

type Campaign = {
  id: number;
  name: string;
  category: string;
  status: "active" | "completed" | "deactivated";
  signOnPay: number;
  description: string;
  link: string;
  payMethod: string;
  platforms: string[];
  requireApply: boolean;
  activeCreators: { name: string; platform: string; followers: string; clicks: number; sales: number; earnings: number }[];
  images?: string[];
};

type Application = {
  id: number;
  creator: string;
  platform: string;
  followers: string;
  category: string;
  campaignId: number;
  campaignName: string;
  status: "pending" | "accepted" | "denied";
};

type Tab = "dashboard" | "campaigns" | "new-campaign" | "applications" | "creators" | "analytics" | "creator-view" | "settings";

const BrandDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [plan, setPlan] = useState<"basic" | "pro">(() => {
    const saved = localStorage.getItem("allcall_plan");
    return (saved === "pro" ? "pro" : "basic");
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [showLaunchSuccess, setShowLaunchSuccess] = useState(false);
  const [launchedCampaignName, setLaunchedCampaignName] = useState("");
  const [showProGate, setShowProGate] = useState(false);

  // 3-dot menu
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Creator list filters
  const [creatorSearch, setCreatorSearch] = useState("");
  const [showCreatorFilters, setShowCreatorFilters] = useState(false);
  const [creatorFilterPlatform, setCreatorFilterPlatform] = useState<string[]>([]);
  const [creatorFilterMinFollowers, setCreatorFilterMinFollowers] = useState(0);
  const [invitedCreators, setInvitedCreators] = useState<string[]>([]);

  // Settings state from signup
  const [settingsName, setSettingsName] = useState(() => localStorage.getItem("allcall_brand_name") || "");
  const [settingsEmail, setSettingsEmail] = useState(() => localStorage.getItem("allcall_email") || "");
  const [settingsCountry, setSettingsCountry] = useState(() => localStorage.getItem("allcall_country") || "");
  const [settingsPassword, setSettingsPassword] = useState({ current: "", new: "", confirm: "" });

  // Saved brand categories
  const savedCategories: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("allcall_categories") || "[]"); } catch { return []; }
  })();
  const defaultCampaignCategory = savedCategories.length > 0 ? (categoryMap[savedCategories[0]] || "Other") : "";

  const [campaignForm, setCampaignForm] = useState({
    name: "", category: defaultCampaignCategory, description: "", link: "", notes: "",
    creatorCode: true, discount: "10",
    payMethod: "hybrid" as "commission" | "flat" | "hybrid",
    commissionRate: "5", flatRate: "5", flatPer: "100",
    requireApply: true, paidProduct: false, productType: "physical" as "physical" | "digital",
    photos: [] as string[],
    platforms: [] as string[],
    filterFollowers: false, minFollowers: 1000,
    followerFilterType: [] as string[],
    filterCategories: [] as string[],
    signOnPay: "",
  });

  // Invite confirmation
  const [inviteConfirmation, setInviteConfirmation] = useState<string | null>(null);

  // Recommended creators (mock AI)
  const allCreators = [
    { name: "Emily Chen", platform: "TikTok", followers: "89K", followersNum: 89000, category: "Beauty", match: 95 },
    { name: "Jake Torres", platform: "Instagram", followers: "62K", followersNum: 62000, category: "Health", match: 88 },
    { name: "Priya Sharma", platform: "YouTube", followers: "145K", followersNum: 145000, category: "Tech", match: 82 },
    { name: "Maya Lee", platform: "TikTok", followers: "34K", followersNum: 34000, category: "Fashion", match: 78 },
    { name: "Carlos R.", platform: "Instagram", followers: "21K", followersNum: 21000, category: "Fitness", match: 72 },
  ];

  const filteredCreators = allCreators.filter((cr) => {
    if (creatorSearch && !cr.name.toLowerCase().includes(creatorSearch.toLowerCase())) return false;
    if (creatorFilterPlatform.length > 0 && !creatorFilterPlatform.includes(cr.platform)) return false;
    if (creatorFilterMinFollowers > 0 && cr.followersNum < creatorFilterMinFollowers) return false;
    return true;
  });

  const sidebarItems: { key: Tab; label: string; icon: any; pro?: boolean }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "campaigns", label: "Campaigns", icon: Package },
    { key: "new-campaign", label: "New Campaign", icon: Plus },
    { key: "applications", label: "Applications", icon: Bell },
    { key: "creators", label: "Creator List", icon: Users, pro: true },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "creator-view", label: "Creator View", icon: Eye },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const followerStep = (val: number, direction: "up" | "down") => {
    if (val < 1000) return direction === "up" ? val + 100 : Math.max(0, val - 100);
    if (val < 10000) return direction === "up" ? val + 1000 : val - 1000;
    if (val < 100000) return direction === "up" ? val + 10000 : val - 10000;
    if (val < 1000000) return direction === "up" ? val + 100000 : val - 100000;
    return direction === "up" ? val + 1000000 : val - 1000000;
  };

  const toggleFollowerType = (type: string) => {
    if (type === "total") {
      setCampaignForm({ ...campaignForm, followerFilterType: ["total"] });
    } else {
      const without = campaignForm.followerFilterType.filter((t) => t !== "total");
      if (without.includes(type)) {
        setCampaignForm({ ...campaignForm, followerFilterType: without.filter((t) => t !== type) });
      } else {
        setCampaignForm({ ...campaignForm, followerFilterType: [...without, type] });
      }
    }
  };

  const handleAcceptApplication = (appId: number) => {
    setApplications((prev) => {
      const app = prev.find((a) => a.id === appId);
      if (!app) return prev;
      setCampaigns((cPrev) => cPrev.map((c) => {
        if (c.id === app.campaignId) {
          return {
            ...c,
            activeCreators: [
              ...c.activeCreators,
              { name: app.creator, platform: app.platform, followers: app.followers, clicks: 0, sales: 0, earnings: 0 },
            ],
          };
        }
        return c;
      }));
      return prev.map((a) => a.id === appId ? { ...a, status: "accepted" as const } : a);
    });
  };

  const handleDenyApplication = (appId: number) => {
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: "denied" as const } : a));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - campaignForm.photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newUrls = toAdd.map((f) => URL.createObjectURL(f));
    setCampaignForm({ ...campaignForm, photos: [...campaignForm.photos, ...newUrls] });
  };

  const removePhoto = (index: number) => {
    setCampaignForm({ ...campaignForm, photos: campaignForm.photos.filter((_, i) => i !== index) });
  };

  const handleLaunchCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now(),
      name: campaignForm.name || "Untitled Campaign",
      category: campaignForm.category || "General",
      status: "active",
      signOnPay: campaignForm.requireApply ? (Number(campaignForm.signOnPay) || 0) : 0,
      description: campaignForm.description,
      link: campaignForm.link,
      payMethod: campaignForm.payMethod === "hybrid"
        ? `Hybrid: ${campaignForm.commissionRate}% + $${campaignForm.flatRate}/${campaignForm.flatPer} clicks`
        : campaignForm.payMethod === "commission"
          ? `Commission: ${campaignForm.commissionRate}%`
          : `Flat: $${campaignForm.flatRate}/${campaignForm.flatPer} clicks`,
      platforms: campaignForm.platforms,
      requireApply: campaignForm.requireApply,
      activeCreators: [],
      images: campaignForm.photos,
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    setLaunchedCampaignName(newCampaign.name);
    setShowLaunchSuccess(true);
    setCampaignForm({
      name: "", category: defaultCampaignCategory, description: "", link: "", notes: "",
      creatorCode: true, discount: "10",
      payMethod: "hybrid",
      commissionRate: "5", flatRate: "5", flatPer: "100",
      requireApply: true, paidProduct: false, productType: "physical",
      photos: [], platforms: [],
      filterFollowers: false, minFollowers: 1000,
      followerFilterType: [],
      filterCategories: [],
      signOnPay: "",
    });
  };

  const handleInviteCreator = (name: string) => {
    setInvitedCreators((prev) => [...prev, name]);
    setInviteConfirmation(name);
    setTimeout(() => setInviteConfirmation(null), 3000);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("allcall_brand_name", settingsName);
    localStorage.setItem("allcall_email", settingsEmail);
    localStorage.setItem("allcall_country", settingsCountry);
  };

  const handleLogout = () => {
    document.documentElement.classList.remove("dark");
    navigate("/");
  };

  const handleSidebarClick = (key: Tab, isPro?: boolean) => {
    if (isPro && plan !== "pro") {
      setShowProGate(true);
      return;
    }
    setTab(key);
    setShowLaunchSuccess(false);
    setMenuOpenId(null);
  };

  const handleDeleteCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setMenuOpenId(null);
  };

  const handleDeactivateCampaign = (id: number) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "deactivated" } : c));
    setMenuOpenId(null);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Example campaigns for creator view
  const exampleCreatorCampaigns = [
    { name: "Hydra Glow Moisturizer", brand: "GlowSkin Co.", category: "Beauty", platform: "TikTok", payMethod: "Hybrid: 6% + $8/100 clicks", signOnPay: 30, isPro: true, requireApply: true },
    { name: "ProFit Protein Shake", brand: "FitLife Labs", category: "Health", platform: "Instagram", payMethod: "Commission: 10%", signOnPay: 0, isPro: false, requireApply: false },
    { name: "AirPod Max Clone", brand: "TechBuddy", category: "Tech", platform: "YouTube", payMethod: "Flat: $15/100 clicks", signOnPay: 50, isPro: true, requireApply: true },
    { name: "Cozy Candle Set", brand: "HomeNest", category: "Home", platform: "TikTok", payMethod: "Commission: 5%", signOnPay: 0, isPro: false, requireApply: false },
    { name: "Bamboo Water Bottle", brand: "EcoLife", category: "Health", platform: "Instagram", payMethod: "Hybrid: 4% + $5/100 clicks", signOnPay: 15, isPro: true, requireApply: true },
    { name: "Wireless Charger Pad", brand: "ChargePro", category: "Tech", platform: "YouTube", payMethod: "Flat: $12/100 clicks", signOnPay: 0, isPro: false, requireApply: true },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Pro gate modal */}
      {showProGate && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowProGate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Pro Feature</h3>
            <p className="text-sm text-muted-foreground mb-6">This feature is available for Pro users. Upgrade to unlock creator search, filtering, and more.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => { setShowProGate(false); setTab("settings"); }}>Upgrade Subscription</Button>
              <Button variant="outline" onClick={() => setShowProGate(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col shrink-0">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">A</span>
          </div>
          <span className="font-display font-bold text-foreground">AllCall</span>
          <Badge variant="outline" className="ml-auto text-xs">{plan === "pro" ? "Pro" : "Basic"}</Badge>
        </Link>

        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleSidebarClick(item.key, item.pro)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                tab === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              } ${item.pro && plan !== "pro" ? "opacity-50" : ""}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.pro && plan !== "pro" && <Lock className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Invite confirmation toast */}
        {inviteConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Invitation sent to {inviteConfirmation}!</span>
          </motion.div>
        )}

        {tab === "dashboard" && (
          <div className="space-y-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Campaigns", value: String(campaigns.filter((c) => c.status === "active").length), icon: Package },
                { label: "Active Creators", value: String(campaigns.reduce((sum, c) => sum + c.activeCreators.length, 0)), icon: Users },
                { label: "Total Revenue", value: "$0", icon: TrendingUp },
                { label: "Spent on Creators", value: "$0", icon: DollarSign },
              ].map((stat) => (
                <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Campaigns</h2>
                <Button variant="hero" size="sm" onClick={() => setTab("new-campaign")}>
                  <Plus className="w-4 h-4 mr-1" /> New Campaign
                </Button>
              </div>
              {campaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No campaigns yet. Create your first campaign to get started!</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => { setSelectedCampaignId(c.id); }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold">
                          {c.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{c.name}</p>
                            {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{c.category} · {c.activeCreators.length} creators</p>
                        </div>
                      </div>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "campaigns" && !selectedCampaignId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Campaigns</h1>
              <Button variant="hero" onClick={() => setTab("new-campaign")}><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No campaigns yet.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow relative">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedCampaignId(c.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{c.name[0]}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-lg text-foreground">{c.name}</h3>
                            {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0">Sign-On ${c.signOnPay}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{c.category} · {c.activeCreators.length} active creators · {c.payMethod}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {menuOpenId === c.id && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-44 overflow-hidden">
                              <button onClick={() => { setSelectedCampaignId(c.id); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">Edit Campaign</button>
                              <button onClick={() => handleDeactivateCampaign(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">{c.status === "active" ? "Deactivate" : "Activate"}</button>
                              <button onClick={() => handleDeleteCampaign(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Delete Campaign</button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaign detail with active creators */}
        {(tab === "campaigns" || tab === "dashboard") && selectedCampaignId && (() => {
          const campaign = campaigns.find((c) => c.id === selectedCampaignId);
          if (!campaign) return null;
          return (
            <div className="space-y-6">
              <button onClick={() => setSelectedCampaignId(null)} className="text-sm text-primary hover:underline">← Back</button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">{campaign.name[0]}</div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{campaign.name}</h1>
                  <p className="text-muted-foreground">{campaign.category} · {campaign.payMethod}</p>
                </div>
                <Badge className="ml-auto" variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Active Creators ({campaign.activeCreators.length})</h2>
                {campaign.activeCreators.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">No creators yet. Accept applications or invite creators to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {campaign.activeCreators.map((cr, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{cr.name[0]}</div>
                          <div>
                            <p className="font-semibold text-foreground">{cr.name}</p>
                            <p className="text-xs text-muted-foreground">{cr.platform} · {cr.followers}</p>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center"><p className="font-semibold text-foreground">{cr.clicks}</p><p className="text-xs text-muted-foreground">clicks</p></div>
                          <div className="text-center"><p className="font-semibold text-foreground">{cr.sales}</p><p className="text-xs text-muted-foreground">sales</p></div>
                          <div className="text-center"><p className="font-semibold text-primary">${cr.earnings}</p><p className="text-xs text-muted-foreground">earned</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {tab === "new-campaign" && !showLaunchSuccess && (
          <div className="max-w-2xl space-y-8" style={{ background: 'linear-gradient(180deg, hsl(145, 30%, 95%) 0%, transparent 100%)', margin: '-2rem', padding: '2rem' }}>
            <h1 className="font-display text-3xl font-bold text-foreground">Create Campaign</h1>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Product Information</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Basic details about the product you want creators to promote</TooltipContent></Tooltip>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-foreground">Product Name</label><Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Summer Glow Serum" /></div>
                <div><label className="text-sm font-medium text-foreground">Category</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={campaignForm.category} onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}>
                    <option value="">Select category</option>
                    {campaignCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-foreground">Description</label><textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} placeholder="Brief product description..." /></div>
                <div><label className="text-sm font-medium text-foreground">Product Link</label><Input value={campaignForm.link} onChange={(e) => setCampaignForm({ ...campaignForm, link: e.target.value })} placeholder="https://yourstore.com/product" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">Campaign Notes</label>
                    <Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Include hashtags, talking points, or anything you want creators to know</TooltipContent></Tooltip>
                  </div>
                  <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={campaignForm.notes} onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })} placeholder="Hashtags, talking points, etc." />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Campaign Images</h2>
              <p className="text-xs text-muted-foreground">Upload up to 3 images (logo, product photos, etc.)</p>
              <div className="flex gap-4 flex-wrap">
                {campaignForm.photos.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl border border-border overflow-hidden group">
                    <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {campaignForm.photos.length < 3 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Application Settings</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Choose whether creators need your approval or can join instantly</TooltipContent></Tooltip>
              </div>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: true })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.requireApply ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                      Creators must apply
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Creators submit an application and you review & accept or deny each one</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: false, signOnPay: "" })} className={`px-4 py-2 rounded-lg border text-sm ${!campaignForm.requireApply ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                      Instant join
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Creators get immediate access to affiliate links and codes without approval</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {campaignForm.requireApply && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-foreground">Sign-On Pay</h2>
                  <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Optional bonus paid to creators when their application is approved. Only available with creator approval mode.</TooltipContent></Tooltip>
                </div>
                <div className="flex items-center gap-1 max-w-[140px]">
                  <span className="text-sm font-medium text-foreground">$</span>
                  <Input value={campaignForm.signOnPay} onChange={(e) => setCampaignForm({ ...campaignForm, signOnPay: e.target.value })} placeholder="0" />
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Creator Code</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Discount codes help track sales more accurately than links alone</TooltipContent></Tooltip>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={campaignForm.creatorCode} onChange={(e) => setCampaignForm({ ...campaignForm, creatorCode: e.target.checked })} className="rounded" />
                <span className="text-sm text-foreground">Enable creator discount codes (recommended for accurate tracking)</span>
              </label>
              {campaignForm.creatorCode && (
                <div>
                  <label className="text-sm font-medium text-foreground">Discount %</label>
                  <Input value={campaignForm.discount} onChange={(e) => setCampaignForm({ ...campaignForm, discount: e.target.value })} placeholder="10" className="max-w-[100px]" />
                  <p className="text-xs text-muted-foreground mt-2">Creators will receive a unique code like <span className="font-mono font-semibold text-primary">dylanfinds{campaignForm.discount || "10"}</span> or <span className="font-mono font-semibold text-primary">sarah{campaignForm.discount || "10"}</span></p>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Method</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Choose how creators will earn from this campaign</TooltipContent></Tooltip>
              </div>
              <div className="flex gap-3">
                {(["commission", "flat", "hybrid"] as const).map((m) => (
                  <Tooltip key={m}>
                    <TooltipTrigger asChild>
                      <button onClick={() => setCampaignForm({ ...campaignForm, payMethod: m })} className={`px-4 py-2 rounded-lg border text-sm capitalize ${campaignForm.payMethod === m ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-muted-foreground"}`}>
                        {m === "hybrid" ? "Hybrid (recommended)" : m === "commission" ? "Commission" : "Flat Rate"}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {m === "commission" && "Creator earns a percentage of each sale they generate"}
                      {m === "flat" && "Creator earns a fixed amount per number of clicks"}
                      {m === "hybrid" && "Best of both: commission per sale plus a flat rate per clicks"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {(campaignForm.payMethod === "commission" || campaignForm.payMethod === "hybrid") && (
                  <div className="flex items-center gap-2">
                    <Input value={campaignForm.commissionRate} onChange={(e) => setCampaignForm({ ...campaignForm, commissionRate: e.target.value })} className="w-20" placeholder="5" />
                    <span className="text-sm text-muted-foreground">% per sale</span>
                  </div>
                )}
                {campaignForm.payMethod === "hybrid" && <span className="text-lg font-bold text-primary">+</span>}
                {(campaignForm.payMethod === "flat" || campaignForm.payMethod === "hybrid") && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input value={campaignForm.flatRate} onChange={(e) => setCampaignForm({ ...campaignForm, flatRate: e.target.value })} className="w-20" placeholder="5" />
                    <span className="text-sm text-muted-foreground">per</span>
                    <Input value={campaignForm.flatPer} onChange={(e) => setCampaignForm({ ...campaignForm, flatPer: e.target.value })} className="w-20" placeholder="100" />
                    <span className="text-sm text-muted-foreground">clicks</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Advertising Platforms</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Only creators active on these platforms will see this campaign</TooltipContent></Tooltip>
              </div>
              <div className="flex flex-wrap gap-2">
                {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook"].map((p) => (
                  <button key={p} onClick={() => setCampaignForm({
                    ...campaignForm,
                    platforms: campaignForm.platforms.includes(p) ? campaignForm.platforms.filter((x) => x !== p) : [...campaignForm.platforms, p],
                  })} className={`px-4 py-2 rounded-full text-sm border ${campaignForm.platforms.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Creator Filters</h2>
                {plan !== "pro" && <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => setShowProGate(true)}><Lock className="w-3 h-3 mr-1" /> Pro</Badge>}
              </div>
              {plan === "pro" ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={campaignForm.filterFollowers} onChange={(e) => setCampaignForm({ ...campaignForm, filterFollowers: e.target.checked })} className="rounded" />
                    <span className="text-sm text-foreground">Minimum followers</span>
                  </label>
                  {campaignForm.filterFollowers && (
                    <div className="space-y-3 ml-6">
                      <p className="text-xs font-medium text-muted-foreground">Count followers from:</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => toggleFollowerType("total")} className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.followerFilterType.includes("total") ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>Total</button>
                        {campaignForm.platforms.filter((p) => ["TikTok", "Instagram", "YouTube"].includes(p)).map((p) => (
                          <button key={p} onClick={() => toggleFollowerType(p)} className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.followerFilterType.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-accent" onClick={() => setCampaignForm({ ...campaignForm, minFollowers: followerStep(campaignForm.minFollowers, "down") })}>−</button>
                        <Input value={campaignForm.minFollowers.toLocaleString()} readOnly className="w-32 text-center" />
                        <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-accent" onClick={() => setCampaignForm({ ...campaignForm, minFollowers: followerStep(campaignForm.minFollowers, "up") })}>+</button>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Creator categories</p>
                    <div className="flex flex-wrap gap-2">
                      {campaignCategories.map((cat) => (
                        <button key={cat} onClick={() => setCampaignForm({
                          ...campaignForm,
                          filterCategories: campaignForm.filterCategories.includes(cat) ? campaignForm.filterCategories.filter((c) => c !== cat) : [...campaignForm.filterCategories, cat],
                        })} className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.filterCategories.includes(cat) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground cursor-pointer" onClick={() => setShowProGate(true)}>
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upgrade to Pro to filter creators by followers, categories, and platforms.</p>
                  <Button variant="outline" size="sm" className="mt-3">Upgrade to Pro</Button>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Paid Product</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Enable if you need to ship or deliver a product to the creator before they promote it</TooltipContent></Tooltip>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={campaignForm.paidProduct} onChange={(e) => setCampaignForm({ ...campaignForm, paidProduct: e.target.checked })} className="rounded" />
                <span className="text-sm text-foreground">Product needs to be delivered to creator</span>
              </label>
              {campaignForm.paidProduct && (
                <div className="flex gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setCampaignForm({ ...campaignForm, productType: "physical" })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.productType === "physical" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                        Physical (creator enters address)
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Creator will provide their shipping address when they apply</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setCampaignForm({ ...campaignForm, productType: "digital" })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.productType === "digital" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                        Digital (creator enters email)
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Creator will provide their email to receive the digital product</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full rounded-xl" onClick={handleLaunchCampaign}>Launch Campaign</Button>
          </div>
        )}

        {tab === "new-campaign" && showLaunchSuccess && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center space-y-6 p-10 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, hsl(152, 69%, 41%) 0%, hsl(160, 60%, 35%) 30%, hsl(145, 40%, 50%) 60%, hsl(140, 30%, 85%) 100%)' }}
            >
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground">Campaign Launched!</h1>
              <p className="text-primary-foreground/80">"{launchedCampaignName}" is now live and visible to creators.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => { setTab("creator-view"); setShowLaunchSuccess(false); }}>
                  <Eye className="w-4 h-4 mr-2" /> View as Creator
                </Button>
                <Button className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0" onClick={() => { setTab("campaigns"); setShowLaunchSuccess(false); }}>
                  Go to Campaigns
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Applications</h1>
            {applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No applications yet. Creators will appear here when they apply to your campaigns.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{app.creator[0]}</div>
                      <div>
                        <p className="font-semibold text-foreground">{app.creator}</p>
                        <p className="text-sm text-muted-foreground">{app.platform} · {app.followers} followers · {app.category}</p>
                        <p className="text-xs text-muted-foreground">Campaign: {app.campaignName}</p>
                      </div>
                    </div>
                    {app.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button variant="hero" size="sm" onClick={() => handleAcceptApplication(app.id)}><Check className="w-4 h-4 mr-1" /> Accept</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDenyApplication(app.id)}><XIcon className="w-4 h-4 mr-1" /> Deny</Button>
                      </div>
                    ) : app.status === "accepted" ? (
                      <Badge className="bg-success/10 text-primary border-0">Accepted</Badge>
                    ) : (
                      <Badge variant="secondary">Denied</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "creators" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Creator List & Invites</h1>
            <p className="text-sm text-muted-foreground">AI-recommended creators based on your campaigns. Invite them directly.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search creators..." className="pl-10" value={creatorSearch} onChange={(e) => setCreatorSearch(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => setShowCreatorFilters(!showCreatorFilters)}>
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>

            {showCreatorFilters && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Filter Creators</h3>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Platform</p>
                  <div className="flex flex-wrap gap-2">
                    {["TikTok", "Instagram", "YouTube"].map((p) => (
                      <button key={p} onClick={() => setCreatorFilterPlatform((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])} className={`px-3 py-1.5 rounded-full text-xs border ${creatorFilterPlatform.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Minimum Followers</p>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-accent" onClick={() => setCreatorFilterMinFollowers(followerStep(creatorFilterMinFollowers, "down"))}>−</button>
                    <Input value={creatorFilterMinFollowers.toLocaleString()} readOnly className="w-32 text-center" />
                    <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-accent" onClick={() => setCreatorFilterMinFollowers(followerStep(creatorFilterMinFollowers, "up"))}>+</button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCreatorFilterPlatform([]); setCreatorFilterMinFollowers(0); }}>Clear Filters</Button>
              </motion.div>
            )}

            <div className="space-y-3">
              {filteredCreators.map((cr) => (
                <div key={cr.name} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{cr.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cr.name}</p>
                        <Badge className="bg-success/10 text-primary border-0 text-xs">{cr.match}% match</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cr.platform} · {cr.followers} · {cr.category}</p>
                    </div>
                  </div>
                  {invitedCreators.includes(cr.name) ? (
                    <Button variant="secondary" size="sm" disabled>
                      <Check className="w-4 h-4 mr-1" /> Invited
                    </Button>
                  ) : (
                    <Button variant="hero" size="sm" onClick={() => handleInviteCreator(cr.name)}>
                      <Send className="w-4 h-4 mr-1" /> Invite
                    </Button>
                  )}
                </div>
              ))}
              {filteredCreators.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No creators match your filters.</p>
              )}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Customize which metrics you want to see.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: "$0" },
                { label: "Spent on Creators", value: "$0" },
                { label: "Active Campaigns", value: String(campaigns.filter((c) => c.status === "active").length) },
                { label: "Total Creators", value: String(campaigns.reduce((s, c) => s + c.activeCreators.length, 0)) },
                { label: "Plan", value: plan === "pro" ? "Pro" : "Basic" },
              ].map((s) => (
                <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Sales Attribution</h2>
              <p className="text-sm text-muted-foreground mb-4">Manually attribute offline sales to a creator.</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Creator</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select creator</option>
                    {campaigns.flatMap((c) => c.activeCreators).map((cr, i) => (
                      <option key={i}>{cr.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-sm font-medium text-foreground">Sales</label>
                  <Input placeholder="5" type="number" />
                </div>
                <Button variant="hero" size="default">Attribute</Button>
              </div>
            </div>
          </div>
        )}

        {tab === "creator-view" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Creator View Preview</h1>
            <p className="text-sm text-muted-foreground">See your campaigns from a creator's perspective, alongside other example campaigns.</p>

            <div className="space-y-4">
              {campaigns.filter((c) => c.status === "active").map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{c.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                        <Badge className="bg-accent text-accent-foreground border-0 text-xs">Your Campaign</Badge>
                        {plan === "pro" && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="w-5 h-5 text-warning" />
                            </TooltipTrigger>
                            <TooltipContent>Top Brand — This brand has a Pro subscription with extended attribution and priority placement</TooltipContent>
                          </Tooltip>
                        )}
                        {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{settingsName || "Your Brand"} · {c.category} · {c.payMethod}</p>
                    </div>
                  </div>
                  <Button variant="hero" size="sm">{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              ))}

              {exampleCreatorCampaigns.map((c, i) => (
                <div key={i} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{c.brand[0]}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                        {c.isPro && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown className="w-5 h-5 text-warning" />
                            </TooltipTrigger>
                            <TooltipContent>Top Brand — This brand has a Pro subscription with extended attribution and priority placement</TooltipContent>
                          </Tooltip>
                        )}
                        {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.brand} · {c.category} · {c.platform}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.payMethod}</p>
                    </div>
                  </div>
                  <Button variant="hero" size="sm">{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Account Details</h2>
              </div>
              <div><label className="text-sm font-medium text-foreground">Company Name</label><Input value={settingsName} onChange={(e) => setSettingsName(e.target.value)} /></div>
              <div><label className="text-sm font-medium text-foreground">Email</label><Input value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} /></div>
              <div>
                <label className="text-sm font-medium text-foreground">Country</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={settingsCountry} onChange={(e) => setSettingsCountry(e.target.value)}>
                  <option value="">Select country</option>
                  {["United States", "United Kingdom", "Canada"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">More country support coming soon.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Change Password</h2>
              </div>
              <div><label className="text-sm font-medium text-foreground">Current Password</label><Input type="password" value={settingsPassword.current} onChange={(e) => setSettingsPassword({ ...settingsPassword, current: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground">New Password</label><Input type="password" value={settingsPassword.new} onChange={(e) => setSettingsPassword({ ...settingsPassword, new: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground">Confirm New Password</label><Input type="password" value={settingsPassword.confirm} onChange={(e) => setSettingsPassword({ ...settingsPassword, confirm: e.target.value })} /></div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Information</h2>
              </div>
              <div className="p-6 rounded-xl border-2 border-dashed border-border text-center space-y-3">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Third-party payment service integration coming soon.</p>
                <Button variant="outline" size="sm" disabled>Connect Payment Service</Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <h2 className="font-display text-lg font-semibold text-foreground">Appearance</h2>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Dark Mode</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted"} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground">Current plan: <span className="font-semibold text-foreground">{plan === "pro" ? "Pro ($49/mo)" : "Basic (Free)"}</span></p>
              {plan !== "pro" && <Button variant="outline" size="sm" onClick={() => setShowProGate(true)}>Upgrade to Pro</Button>}
            </div>

            <Button variant="hero" onClick={handleSaveSettings}>Save All Changes</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandDashboard;

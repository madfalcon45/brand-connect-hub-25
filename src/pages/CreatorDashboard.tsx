import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, DollarSign, Settings, LogOut, Search, Filter,
  Star, TrendingUp, Link2, ExternalLink, ClipboardCopy, FileText, Eye, Check
} from "lucide-react";

const mockCampaigns = [
  { id: 1, brand: "GlowBeauty", product: "Summer Glow Serum", category: "Beauty", platform: "TikTok", payMethod: "Hybrid: 5% + $5/100 clicks", signOnPay: 25, isPro: true, topPick: true, needsProduct: true, requireApply: true, status: "available" },
  { id: 2, brand: "FitPro", product: "ProFit Blender", category: "Health", platform: "Instagram", payMethod: "Commission: 8%", signOnPay: 0, isPro: false, topPick: true, needsProduct: false, requireApply: false, status: "available" },
  { id: 3, brand: "TechBite", product: "CodeMaster Keyboard", category: "Tech", platform: "YouTube", payMethod: "Flat: $10/100 clicks", signOnPay: 50, isPro: true, topPick: false, needsProduct: true, requireApply: true, status: "available" },
  { id: 4, brand: "HomeNest", product: "Smart Diffuser", category: "Home", platform: "TikTok", payMethod: "Commission: 6%", signOnPay: 0, isPro: false, topPick: false, needsProduct: false, requireApply: false, status: "available" },
];

const mockActiveList = [
  { id: 1, brand: "GlowBeauty", product: "Summer Glow Serum", link: "https://allcall.link/sarah/glow", code: "SARAH10", earnings: 245 },
  { id: 2, brand: "FitPro", product: "ProFit Blender", link: "https://allcall.link/sarah/fitpro", code: "SARAHFIT", earnings: 120 },
];

const mockApplications = [
  { id: 3, brand: "TechBite", product: "CodeMaster Keyboard", status: "pending" as const },
];

type Tab = "feed" | "active" | "applications" | "master-link" | "analytics" | "settings";

const CreatorDashboard = () => {
  const [tab, setTab] = useState<Tab>("feed");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([3]); // mock: already applied to 3
  const [masterLinkCampaigns, setMasterLinkCampaigns] = useState<number[]>([1, 2]);
  const [address, setAddress] = useState("");
  const savedAddress = "123 Creator St, Los Angeles, CA 90001";

  const sidebarItems: { key: Tab; label: string; icon: any }[] = [
    { key: "feed", label: "Campaigns", icon: Search },
    { key: "active", label: "Active Campaigns", icon: Link2 },
    { key: "applications", label: "Applications", icon: FileText },
    { key: "master-link", label: "Master Link", icon: ExternalLink },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const filteredCampaigns = mockCampaigns.filter((c) => {
    if (filterCategory && c.category !== filterCategory) return false;
    if (searchQuery && !c.product.toLowerCase().includes(searchQuery.toLowerCase()) && !c.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    // Sort: top picks first, then pro brands, then rest
    if (a.topPick !== b.topPick) return a.topPick ? -1 : 1;
    if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
    return 0;
  });

  const handleJoinOrApply = (campaign: typeof mockCampaigns[0]) => {
    if (campaign.requireApply) {
      setAppliedIds([...appliedIds, campaign.id]);
    } else {
      setJoinedIds([...joinedIds, campaign.id]);
    }
  };

  const getButtonState = (campaign: typeof mockCampaigns[0]) => {
    if (joinedIds.includes(campaign.id) || mockActiveList.some((a) => a.id === campaign.id)) return "joined";
    if (appliedIds.includes(campaign.id)) return "pending";
    return "available";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col shrink-0">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">A</span>
          </div>
          <span className="font-display font-bold text-foreground">AllCall</span>
          <Badge variant="outline" className="ml-auto text-xs">Creator</Badge>
        </Link>

        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSelectedCampaign(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                tab === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Log out
        </Link>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {tab === "feed" && !selectedCampaign && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Discover Campaigns</h1>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search campaigns..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                {["Beauty", "Health", "Tech", "Fashion", "Home", "Food"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {filteredCampaigns.map((c) => {
                const btnState = getButtonState(c);
                return (
                  <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => setSelectedCampaign(c.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">
                          {c.brand[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                            {c.topPick && <Badge className="bg-warning/10 text-warning border-0 text-xs"><Star className="w-3 h-3 mr-1" /> Top Pick</Badge>}
                            {c.isPro && (
                              <Badge className="bg-primary/10 text-primary border-0 text-xs cursor-help" title="Top brands track data longer for more creator attribution">
                                <Star className="w-3 h-3 mr-1" /> Top Brand
                              </Badge>
                            )}
                            {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{c.brand} · {c.category} · {c.platform}</p>
                          <p className="text-xs text-muted-foreground mt-1">{c.payMethod}</p>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {btnState === "joined" ? (
                          <Badge className="bg-success/10 text-primary border-0"><Check className="w-3 h-3 mr-1" /> Joined</Badge>
                        ) : btnState === "pending" ? (
                          <Button variant="secondary" size="sm" disabled>Pending Application</Button>
                        ) : (
                          <Button variant="hero" size="sm" onClick={() => handleJoinOrApply(c)}>
                            {c.requireApply ? "Apply" : "Join Campaign"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "feed" && selectedCampaign && (() => {
          const c = mockCampaigns.find((x) => x.id === selectedCampaign)!;
          const btnState = getButtonState(c);
          return (
            <div className="max-w-2xl space-y-6">
              <button onClick={() => setSelectedCampaign(null)} className="text-sm text-primary hover:underline">← Back to campaigns</button>
              <div className="bg-card border border-border rounded-2xl p-8 shadow-card space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl">{c.brand[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display text-2xl font-bold text-foreground">{c.product}</h1>
                      {c.isPro && <Badge className="bg-primary/10 text-primary border-0 text-xs"><Star className="w-3 h-3 mr-1" /> Top Brand</Badge>}
                    </div>
                    <p className="text-muted-foreground">{c.brand} · {c.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Platform</p>
                    <p className="font-semibold text-foreground">{c.platform}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="font-semibold text-foreground">{c.payMethod}</p>
                  </div>
                  {c.signOnPay > 0 && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">Sign-On Pay</p>
                      <p className="font-semibold text-primary">${c.signOnPay}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">Product Required</p>
                    <p className="font-semibold text-foreground">{c.needsProduct ? "Yes" : "No"}</p>
                  </div>
                </div>

                {c.needsProduct && btnState === "available" && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Delivery Address</p>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address for product delivery" />
                    <Button variant="ghost" size="sm" onClick={() => setAddress(savedAddress)}>Autofill from profile</Button>
                  </div>
                )}

                {btnState === "joined" ? (
                  <Badge className="bg-success/10 text-primary border-0 text-base py-2 px-4"><Check className="w-4 h-4 mr-2" /> Joined</Badge>
                ) : btnState === "pending" ? (
                  <Button variant="secondary" size="lg" className="w-full rounded-xl" disabled>Pending Application</Button>
                ) : (
                  <Button variant="hero" size="lg" className="w-full rounded-xl" onClick={() => handleJoinOrApply(c)}>
                    {c.requireApply ? "Apply to Campaign" : "Join Campaign"}
                  </Button>
                )}
              </div>
            </div>
          );
        })()}

        {tab === "active" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Active Campaigns</h1>
            <div className="space-y-4">
              {mockActiveList.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                      <p className="text-sm text-muted-foreground">{c.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-primary">${c.earnings}</p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Affiliate Link</p>
                        <p className="text-sm text-foreground truncate">{c.link}</p>
                      </div>
                      <button className="text-primary hover:text-primary/80"><ClipboardCopy className="w-4 h-4" /></button>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Code</p>
                      <p className="text-sm font-mono font-bold text-primary">{c.code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">My Applications</h1>
            <div className="space-y-3">
              {mockApplications.map((app) => (
                <div key={app.id} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{app.product}</h3>
                    <p className="text-sm text-muted-foreground">{app.brand}</p>
                  </div>
                  <Badge variant={app.status === "pending" ? "secondary" : "default"} className={app.status === "pending" ? "" : "bg-success/10 text-primary border-0"}>
                    {app.status === "pending" ? "Pending" : "Accepted"}
                  </Badge>
                </div>
              ))}
              {mockApplications.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No applications yet. Browse campaigns to get started!</p>
              )}
            </div>
          </div>
        )}

        {tab === "master-link" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Master Link Page</h1>
            <p className="text-sm text-muted-foreground">One link for all your campaigns. Perfect for your bio.</p>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm text-foreground">allcall.link/sarah</span>
                </div>
                <Button variant="outline" size="sm"><ClipboardCopy className="w-4 h-4 mr-1" /> Copy</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Campaigns on Master Link</h2>
              {mockActiveList.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.product}</p>
                    <p className="text-xs text-muted-foreground">{c.brand}</p>
                  </div>
                  <Badge className="bg-success/10 text-primary border-0 text-xs">Added</Badge>
                </div>
              ))}
              {/* Option to add more */}
              <div className="p-4 rounded-xl border-2 border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">Join more campaigns to add them here</p>
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Customize which metrics you want to see.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Earnings", value: "$365" },
                { label: "Active Campaigns", value: "2" },
                { label: "Total Clicks", value: "1,240" },
                { label: "Total Sales", value: "48" },
                { label: "Pending Earnings", value: "$89" },
                { label: "AllCall Fee (10%)", value: "$36.50" },
              ].map((s) => (
                <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
              <div><label className="text-sm font-medium text-foreground">Address (for product delivery)</label><Input defaultValue={savedAddress} /></div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Payment Info</h2>
              <div><label className="text-sm font-medium text-foreground">Bank Name</label><Input placeholder="Your bank" /></div>
              <div><label className="text-sm font-medium text-foreground">Account Number</label><Input placeholder="••••••••" /></div>
              <div><label className="text-sm font-medium text-foreground">Routing Number</label><Input placeholder="••••••••" /></div>
              <Button variant="hero">Save Changes</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;

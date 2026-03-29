import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Plus, Users, DollarSign, Settings, Eye, LogOut, Search,
  Bell, Lock, TrendingUp, ChevronRight, Filter, Send, Check, X as XIcon,
  Package, Link2, MoreHorizontal, Star
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data
const mockCampaigns = [
  { id: 1, name: "Summer Glow Serum", category: "Beauty", status: "active", creators: 12, revenue: 4520, spent: 890, signOnPay: 25, image: null },
  { id: 2, name: "ProFit Blender", category: "Health", status: "active", creators: 8, revenue: 2100, spent: 420, signOnPay: 0, image: null },
  { id: 3, name: "CodeMaster Keyboard", category: "Tech", status: "completed", creators: 5, revenue: 1800, spent: 360, signOnPay: 50, image: null },
];

const mockApplications = [
  { id: 1, creator: "Sarah J.", platform: "TikTok", followers: "52K", category: "Beauty", campaign: "Summer Glow Serum", status: "pending" },
  { id: 2, creator: "Mike R.", platform: "Instagram", followers: "28K", category: "Fitness", campaign: "ProFit Blender", status: "pending" },
  { id: 3, creator: "Lisa K.", platform: "YouTube", followers: "105K", category: "Tech", campaign: "CodeMaster Keyboard", status: "accepted" },
];

const mockRecommendedCreators = [
  { name: "Emily Chen", platform: "TikTok", followers: "89K", category: "Beauty", match: 95 },
  { name: "Jake Torres", platform: "Instagram", followers: "62K", category: "Health", match: 88 },
  { name: "Priya Sharma", platform: "YouTube", followers: "145K", category: "Tech", match: 82 },
];

type Tab = "dashboard" | "campaigns" | "new-campaign" | "applications" | "creators" | "analytics" | "creator-view" | "settings";

const BrandDashboard = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [plan] = useState<"basic" | "pro">("pro");
  const [campaignForm, setCampaignForm] = useState({
    name: "", category: "", description: "", link: "", notes: "",
    creatorCode: true, discount: "10",
    payMethod: "hybrid" as "commission" | "flat" | "hybrid",
    commissionRate: "5", flatRate: "5", flatPer: "100",
    requireApply: true, paidProduct: false, productType: "physical" as "physical" | "digital",
    photo: null as File | null,
    platforms: [] as string[],
    filterFollowers: false, minFollowers: 1000, followerFilterType: "total" as "total" | "per-platform",
    filterCategories: [] as string[],
    signOnPay: "",
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

  return (
    <div className="min-h-screen bg-muted/30 flex">
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
              onClick={() => {
                if (item.pro && plan !== "pro") return;
                setTab(item.key);
              }}
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

        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Log out
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {tab === "dashboard" && (
          <div className="space-y-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Campaigns", value: "2", icon: Package },
                { label: "Active Creators", value: "20", icon: Users },
                { label: "Total Revenue", value: "$8,420", icon: TrendingUp },
                { label: "Spent on Creators", value: "$1,670", icon: DollarSign },
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

            {/* Recent campaigns */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Campaigns</h2>
                <Button variant="hero" size="sm" onClick={() => setTab("new-campaign")}>
                  <Plus className="w-4 h-4 mr-1" /> New Campaign
                </Button>
              </div>
              <div className="space-y-3">
                {mockCampaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{c.name}</p>
                          {c.signOnPay > 0 && (
                            <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.category} · {c.creators} creators</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">${c.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Campaigns</h1>
              <Button variant="hero" onClick={() => setTab("new-campaign")}><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
            </div>
            <div className="space-y-3">
              {mockCampaigns.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-foreground">{c.name}</h3>
                          {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0">Sign-On ${c.signOnPay}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{c.category} · {c.creators} active creators · ${c.revenue.toLocaleString()} revenue · ${c.spent} spent</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "new-campaign" && (
          <div className="max-w-2xl space-y-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Create Campaign</h1>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Product Information</h2>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-foreground">Product Name</label><Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Summer Glow Serum" /></div>
                <div><label className="text-sm font-medium text-foreground">Category</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={campaignForm.category} onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}>
                    <option value="">Select category</option>
                    {["Beauty", "Health", "Tech", "Fashion", "Food", "Sports", "Travel", "Home", "Other"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-foreground">Description</label><textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} placeholder="Brief product description..." /></div>
                <div><label className="text-sm font-medium text-foreground">Product Link</label><Input value={campaignForm.link} onChange={(e) => setCampaignForm({ ...campaignForm, link: e.target.value })} placeholder="https://yourstore.com/product" /></div>
                <div><label className="text-sm font-medium text-foreground">Campaign Notes</label><textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={campaignForm.notes} onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })} placeholder="Hashtags, talking points, etc." /></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Campaign Image</h2>
              <div className="flex gap-4">
                <button onClick={() => setCampaignForm({ ...campaignForm, photo: null })} className={`p-4 rounded-xl border-2 text-sm ${!campaignForm.photo ? "border-primary bg-primary/5" : "border-border"}`}>
                  No Photo
                </button>
                <label className={`p-4 rounded-xl border-2 text-sm cursor-pointer ${campaignForm.photo ? "border-primary bg-primary/5" : "border-border"}`}>
                  Upload Photo
                  <p className="text-xs text-muted-foreground mt-1">Logo or product photo</p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setCampaignForm({ ...campaignForm, photo: e.target.files?.[0] || null })} />
                </label>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Sign-On Pay</h2>
              <p className="text-sm text-muted-foreground">Optional bonus paid to creators upon approval.</p>
              <Input value={campaignForm.signOnPay} onChange={(e) => setCampaignForm({ ...campaignForm, signOnPay: e.target.value })} placeholder="$0" className="max-w-[120px]" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Creator Code</h2>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={campaignForm.creatorCode} onChange={(e) => setCampaignForm({ ...campaignForm, creatorCode: e.target.checked })} className="rounded" />
                <span className="text-sm text-foreground">Enable creator discount codes (recommended for accurate tracking)</span>
              </label>
              {campaignForm.creatorCode && (
                <div><label className="text-sm font-medium text-foreground">Discount %</label><Input value={campaignForm.discount} onChange={(e) => setCampaignForm({ ...campaignForm, discount: e.target.value })} placeholder="10" className="max-w-[100px]" /></div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Payment Method</h2>
              <div className="flex gap-3">
                {(["commission", "flat", "hybrid"] as const).map((m) => (
                  <button key={m} onClick={() => setCampaignForm({ ...campaignForm, payMethod: m })} className={`px-4 py-2 rounded-lg border text-sm capitalize ${campaignForm.payMethod === m ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-muted-foreground"}`}>
                    {m === "hybrid" ? "Hybrid (recommended)" : m === "commission" ? "Commission" : "Flat Rate"}
                  </button>
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
              <h2 className="font-display text-lg font-semibold text-foreground">Advertising Platforms</h2>
              <p className="text-sm text-muted-foreground">Which platforms do you want creators to advertise on? Only creators active on these platforms will see this campaign.</p>
              <div className="flex flex-wrap gap-2">
                {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setCampaignForm({
                      ...campaignForm,
                      platforms: campaignForm.platforms.includes(p)
                        ? campaignForm.platforms.filter((x) => x !== p)
                        : [...campaignForm.platforms, p],
                    })}
                    className={`px-4 py-2 rounded-full text-sm border ${campaignForm.platforms.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Creator Filters</h2>
                {plan !== "pro" && <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" /> Pro</Badge>}
              </div>
              {plan === "pro" ? (
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={campaignForm.filterFollowers} onChange={(e) => setCampaignForm({ ...campaignForm, filterFollowers: e.target.checked })} className="rounded" />
                    <span className="text-sm text-foreground">Minimum followers</span>
                  </label>
                  {campaignForm.filterFollowers && (
                    <div className="space-y-3 ml-6">
                      <div className="flex items-center gap-2">
                        <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={campaignForm.followerFilterType} onChange={(e) => setCampaignForm({ ...campaignForm, followerFilterType: e.target.value as any })}>
                          <option value="total">Total followers</option>
                          {campaignForm.platforms.map((p) => <option key={p} value={p}>{p} followers</option>)}
                          {campaignForm.platforms.length > 1 && <option value="across">Across {campaignForm.platforms.join(" & ")}</option>}
                        </select>
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
                      {["Beauty", "Health", "Tech", "Fashion", "Food", "Fitness", "Travel", "Lifestyle", "Gaming", "Comedy"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCampaignForm({
                            ...campaignForm,
                            filterCategories: campaignForm.filterCategories.includes(cat)
                              ? campaignForm.filterCategories.filter((c) => c !== cat)
                              : [...campaignForm.filterCategories, cat],
                          })}
                          className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.filterCategories.includes(cat) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upgrade to Pro to filter creators by followers, categories, and platforms.</p>
                  <Link to="/pricing"><Button variant="outline" size="sm" className="mt-3">Upgrade to Pro</Button></Link>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Application Settings</h2>
              <div className="flex gap-3">
                <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: true })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.requireApply ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                  Creators must apply
                </button>
                <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: false })} className={`px-4 py-2 rounded-lg border text-sm ${!campaignForm.requireApply ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                  Instant join
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Paid Product</h2>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={campaignForm.paidProduct} onChange={(e) => setCampaignForm({ ...campaignForm, paidProduct: e.target.checked })} className="rounded" />
                <span className="text-sm text-foreground">Product needs to be delivered to creator</span>
              </label>
              {campaignForm.paidProduct && (
                <div className="flex gap-3">
                  <button onClick={() => setCampaignForm({ ...campaignForm, productType: "physical" })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.productType === "physical" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                    Physical (creator enters address)
                  </button>
                  <button onClick={() => setCampaignForm({ ...campaignForm, productType: "digital" })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.productType === "digital" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                    Digital (creator enters email)
                  </button>
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full rounded-xl">Launch Campaign</Button>
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Applications</h1>
            <div className="space-y-3">
              {mockApplications.map((app) => (
                <div key={app.id} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {app.creator[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{app.creator}</p>
                      <p className="text-sm text-muted-foreground">{app.platform} · {app.followers} followers · {app.category}</p>
                      <p className="text-xs text-muted-foreground">Campaign: {app.campaign}</p>
                    </div>
                  </div>
                  {app.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button variant="hero" size="sm"><Check className="w-4 h-4 mr-1" /> Accept</Button>
                      <Button variant="outline" size="sm"><XIcon className="w-4 h-4 mr-1" /> Deny</Button>
                    </div>
                  ) : (
                    <Badge className="bg-success/10 text-primary border-0">Accepted</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "creators" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Creator List & Invites</h1>
            </div>
            <p className="text-sm text-muted-foreground">AI-recommended creators based on your campaigns. Invite them directly.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search creators..." className="pl-10" />
              </div>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
            <div className="space-y-3">
              {mockRecommendedCreators.map((cr) => (
                <div key={cr.name} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {cr.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cr.name}</p>
                        <Badge className="bg-success/10 text-primary border-0 text-xs">{cr.match}% match</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cr.platform} · {cr.followers} · {cr.category}</p>
                    </div>
                  </div>
                  <Button variant="hero" size="sm"><Send className="w-4 h-4 mr-1" /> Invite</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Customize which metrics you want to see.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: "$8,420" },
                { label: "Spent on Creators", value: "$1,670" },
                { label: "Active Campaigns", value: "2" },
                { label: "Total Creators", value: "20" },
                { label: "Avg Revenue / Creator", value: "$421" },
                { label: "Plan", value: "Pro" },
              ].map((s) => (
                <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Attribution section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Sales Attribution</h2>
              <p className="text-sm text-muted-foreground mb-4">Manually attribute offline sales to a creator.</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Creator</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option>Sarah J.</option>
                    <option>Mike R.</option>
                    <option>Lisa K.</option>
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
            <p className="text-sm text-muted-foreground">See your campaigns from a creator's perspective.</p>
            <div className="space-y-4">
              {mockCampaigns.filter((c) => c.status === "active").map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{c.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs"><Star className="w-3 h-3 mr-1" /> Top Brand</Badge>
                        {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">Sign-On ${c.signOnPay}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.category}</p>
                    </div>
                  </div>
                  <Button variant="hero" size="sm">Apply</Button>
                </div>
              ))}
              {/* Sample placeholder campaigns */}
              {["TechBite Headphones", "GlowFit Vitamins"].map((name) => (
                <div key={name} className="p-5 rounded-2xl bg-card border border-border shadow-card opacity-60">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-display font-bold text-xl">{name[0]}</div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">{name}</h3>
                      <p className="text-sm text-muted-foreground">Sample campaign</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>Apply</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Payment Information</h2>
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

export default BrandDashboard;

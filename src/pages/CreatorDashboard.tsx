import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, DollarSign, Settings, LogOut, Search, Filter,
  Star, TrendingUp, Link2, ExternalLink, ClipboardCopy, FileText, Eye, Check,
  User, KeyRound, Moon, Sun, Crown, Info, Plus, CreditCard, MoreHorizontal,
  ChevronLeft, ChevronRight, Upload, Video, XCircle, AlertCircle, X as XIcon, MapPin, Truck, Package, Globe, Image as ImageIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Tab = "feed" | "my-campaigns" | "master-link" | "portfolio" | "analytics" | "settings" | "shipping";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("feed");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPayType, setFilterPayType] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string[]>([]);
  const [filterSignOnPay, setFilterSignOnPay] = useState(false);
  const [filterMinSignOnPay, setFilterMinSignOnPay] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [joinedCampaigns, setJoinedCampaigns] = useState<{ id: number; brand: string; product: string; link: string; code: string; earnings: number; clicks: number; sales: number; revenue: number }[]>([]);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [masterLinkIds, setMasterLinkIds] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [masterLinkCopied, setMasterLinkCopied] = useState(false);
  const [showAddToMasterLink, setShowAddToMasterLink] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinDialogData, setJoinDialogData] = useState<{ product: string; link: string; code: string; needsProduct?: boolean; productType?: string } | null>(null);
  const [productLightbox, setProductLightbox] = useState<{ campaignId: number; imageIndex: number } | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [portfolioLinks, setPortfolioLinks] = useState<{ url: string; description: string }[]>([]);
  const [newPortfolioLink, setNewPortfolioLink] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState<{ id: number; type: "campaign" | "application" } | null>(null);
  const [viewingBrand, setViewingBrand] = useState<string | null>(null);
  const [analyticsDetail, setAnalyticsDetail] = useState<string | null>(null);
  const [selectedMyCampaign, setSelectedMyCampaign] = useState<number | null>(null);
  const [analyticsLines, setAnalyticsLines] = useState<string[]>(["earnings"]);
  const [simulatedAnalytics, setSimulatedAnalytics] = useState(false);

  const [showProductApply, setShowProductApply] = useState(false);
  const [productApplyAddress, setProductApplyAddress] = useState("");
  const [productApplyEmail, setProductApplyEmail] = useState("");
  const [productApplyCampaignId, setProductApplyCampaignId] = useState<number | null>(null);
  const [productAppliedIds, setProductAppliedIds] = useState<number[]>([]);

  // Portfolio social links & bio
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>(() => {
    try {
      const raw = localStorage.getItem("allcall_creator_social_links");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x: any) => ({ platform: String(x?.platform ?? ""), url: String(x?.url ?? "") }))
        .map((x) => ({ platform: x.platform.trim(), url: x.url.trim() }))
        .filter((x) => x.platform && x.url);
    } catch {
      return [];
    }
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState("TikTok");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [bio, setBio] = useState("");

  const [settingsName, setSettingsName] = useState(() => localStorage.getItem("allcall_creator_name") || "");
  const [settingsEmail, setSettingsEmail] = useState(() => localStorage.getItem("allcall_email") || "");
  const [settingsCountry, setSettingsCountry] = useState(() => localStorage.getItem("allcall_country") || "");
  const [settingsAddress, setSettingsAddress] = useState(() => localStorage.getItem("allcall_creator_address") || "");
  const [settingsPassword, setSettingsPassword] = useState({ current: "", new: "", confirm: "" });

  // Simulated analytics data
  const [simEarnings, setSimEarnings] = useState(0);
  const [simClicks, setSimClicks] = useState(0);
  const [simSales, setSimSales] = useState(0);
  const [simRevenue, setSimRevenue] = useState(0);
  const [simGraphData, setSimGraphData] = useState<{ month: string; earnings: number; clicks: number; sales: number; revenue: number }[]>([]);

  // Shipping
  const incomingShipments = [
    ...(simulatedAnalytics ? [
      { id: 1, brand: "GlowBeauty", product: "Summer Glow Serum", campaign: "Summer Glow Serum", units: 2, address: settingsAddress || "123 Main St, New York, NY", dateShipped: "3/28/2026", expectedDelivery: "4/5/2026", trackingLink: "https://tracking.example.com/abc123" },
      { id: 2, brand: "TechBite", product: "CodeMaster Keyboard", campaign: "CodeMaster Keyboard", units: 1, address: settingsAddress || "123 Main St, New York, NY", dateShipped: "3/30/2026", expectedDelivery: "4/8/2026", trackingLink: "" },
    ] : []),
  ];

  const availableCampaigns = [
    { id: 1, brand: "GlowBeauty", product: "Summer Glow Serum", category: "Beauty", platform: "TikTok", adPlatforms: ["TikTok", "Instagram"], payMethod: "Hybrid: 5% + $5/100 clicks", signOnPay: 25, isPro: true, topPick: true, needsProduct: true, requireApply: true, productImageCount: 3, activeCreatorsCount: 18, description: "Promote our bestselling serum with honest skincare reviews.", notes: "Use #GlowBeauty and #SummerGlow", productType: "physical" as const, websiteUrl: "https://glowbeauty.com", productLink: "https://glowbeauty.com/serum" },
    { id: 2, brand: "FitPro", product: "ProFit Blender", category: "Health", platform: "Instagram", adPlatforms: ["Instagram", "YouTube"], payMethod: "Commission: 8%", signOnPay: 0, isPro: false, topPick: true, needsProduct: false, requireApply: false, productImageCount: 2, activeCreatorsCount: 9, description: "Share your favorite smoothie recipes using our blender.", notes: "", productType: "physical" as const, websiteUrl: "https://fitpro.com", productLink: "https://fitpro.com/blender" },
    { id: 3, brand: "TechBite", product: "CodeMaster Keyboard", category: "Tech", platform: "YouTube", adPlatforms: ["YouTube", "TikTok", "Instagram"], payMethod: "Flat: $10/100 clicks", signOnPay: 50, isPro: true, topPick: false, needsProduct: true, requireApply: true, productImageCount: 4, activeCreatorsCount: 24, description: "Review our mechanical keyboard for developers and gamers.", notes: "Focus on typing feel and build quality", productType: "physical" as const, websiteUrl: "https://techbite.io", productLink: "https://techbite.io/keyboard" },
    { id: 4, brand: "HomeNest", product: "Smart Diffuser", category: "Home", platform: "TikTok", adPlatforms: ["TikTok"], payMethod: "Commission: 6%", signOnPay: 0, isPro: false, topPick: false, needsProduct: false, requireApply: false, productImageCount: 1, activeCreatorsCount: 6, description: "Feature our smart aroma diffuser in your home setup content.", notes: "", productType: "digital" as const, websiteUrl: "", productLink: "" },
    { id: 5, brand: "EcoLife", product: "Bamboo Water Bottle", category: "Health", platform: "Instagram", adPlatforms: ["Instagram", "TikTok"], payMethod: "Hybrid: 4% + $5/100 clicks", signOnPay: 15, isPro: true, topPick: true, needsProduct: true, requireApply: true, productImageCount: 3, activeCreatorsCount: 14, description: "Eco-friendly hydration for conscious consumers.", notes: "Highlight sustainability", productType: "physical" as const, websiteUrl: "https://ecolife.com", productLink: "https://ecolife.com/bottle" },
    { id: 6, brand: "ChargePro", product: "Wireless Charger Pad", category: "Tech", platform: "YouTube", adPlatforms: ["YouTube"], payMethod: "Flat: $12/100 clicks", signOnPay: 0, isPro: false, topPick: false, needsProduct: false, requireApply: true, productImageCount: 2, activeCreatorsCount: 11, description: "Showcase fast wireless charging technology.", notes: "", productType: "digital" as const, websiteUrl: "", productLink: "" },
    { id: 7, brand: "StyleVault", product: "Oversized Vintage Tee", category: "Fashion", platform: "TikTok", adPlatforms: ["TikTok", "Instagram"], payMethod: "Commission: 12%", signOnPay: 20, isPro: true, topPick: true, needsProduct: true, requireApply: true, productImageCount: 4, activeCreatorsCount: 21, description: "Style our vintage tees in your outfit-of-the-day content.", notes: "Tag @StyleVault", productType: "physical" as const, websiteUrl: "https://stylevault.co", productLink: "https://stylevault.co/tee" },
    { id: 8, brand: "PetPals", product: "Organic Dog Treats", category: "Home", platform: "Instagram", adPlatforms: ["Instagram", "YouTube", "TikTok"], payMethod: "Hybrid: 7% + $3/100 clicks", signOnPay: 0, isPro: false, topPick: false, needsProduct: true, requireApply: false, productImageCount: 2, activeCreatorsCount: 5, description: "Share your pet's reaction to our organic treats.", notes: "", productType: "physical" as const, websiteUrl: "", productLink: "" },
    { id: 9, brand: "BrewCraft", product: "Cold Brew Maker Kit", category: "Food", platform: "YouTube", adPlatforms: ["YouTube", "Instagram"], payMethod: "Commission: 9%", signOnPay: 30, isPro: true, topPick: false, needsProduct: true, requireApply: true, productImageCount: 3, activeCreatorsCount: 12, description: "Make cold brew at home with our kit.", notes: "Show the brewing process", productType: "physical" as const, websiteUrl: "https://brewcraft.com", productLink: "https://brewcraft.com/kit" },
    { id: 10, brand: "ZenSkin", product: "Retinol Night Cream", category: "Beauty", platform: "TikTok", adPlatforms: ["TikTok"], payMethod: "Flat: $8/100 clicks", signOnPay: 0, isPro: false, topPick: true, needsProduct: false, requireApply: false, productImageCount: 1, activeCreatorsCount: 16, description: "Night skincare routine featuring our retinol cream.", notes: "", productType: "digital" as const, websiteUrl: "https://zenskin.com", productLink: "https://zenskin.com/retinol" },
  ];

  const brandAnalytics: Record<string, { totalPaid: number; campaigns: number; creators: number; websiteUrl?: string }> = {
    "GlowBeauty": { totalPaid: 12500, campaigns: 4, creators: 28, websiteUrl: "https://glowbeauty.com" },
    "FitPro": { totalPaid: 8200, campaigns: 2, creators: 15, websiteUrl: "https://fitpro.com" },
    "TechBite": { totalPaid: 18000, campaigns: 5, creators: 42, websiteUrl: "https://techbite.io" },
    "HomeNest": { totalPaid: 3400, campaigns: 1, creators: 8 },
    "EcoLife": { totalPaid: 6700, campaigns: 3, creators: 19, websiteUrl: "https://ecolife.com" },
    "ChargePro": { totalPaid: 4100, campaigns: 2, creators: 12 },
    "StyleVault": { totalPaid: 9800, campaigns: 3, creators: 31, websiteUrl: "https://stylevault.co" },
    "PetPals": { totalPaid: 2200, campaigns: 1, creators: 6 },
    "BrewCraft": { totalPaid: 5600, campaigns: 2, creators: 14, websiteUrl: "https://brewcraft.com" },
    "ZenSkin": { totalPaid: 7300, campaigns: 3, creators: 22, websiteUrl: "https://zenskin.com" },
  };

  const sidebarItems: { key: Tab; label: string; icon: any }[] = [
    { key: "feed", label: "Campaigns", icon: Search },
    { key: "my-campaigns", label: "My Campaigns", icon: Link2 },
    { key: "master-link", label: "Master Link", icon: ExternalLink },
    { key: "portfolio", label: "Portfolio", icon: Video },
    { key: "shipping", label: "Shipping", icon: Truck },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const getPayType = (method: string) => {
    if (method.startsWith("Hybrid")) return "hybrid";
    if (method.startsWith("Commission")) return "commission";
    return "flat";
  };

  const filteredCampaigns = availableCampaigns.filter((c) => {
    if (filterCategory && c.category !== filterCategory) return false;
    if (searchQuery && !c.product.toLowerCase().includes(searchQuery.toLowerCase()) && !c.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPayType && getPayType(c.payMethod) !== filterPayType) return false;
    if (filterPlatform.length > 0 && !filterPlatform.includes(c.platform) && !(c.adPlatforms && c.adPlatforms.some((p: string) => filterPlatform.includes(p)))) return false;
    if (filterSignOnPay && c.signOnPay <= 0) return false;
    if (filterSignOnPay && filterMinSignOnPay && c.signOnPay < Number(filterMinSignOnPay)) return false;
    if (viewingBrand && c.brand !== viewingBrand) return false;
    return true;
  }).sort((a, b) => {
    if (a.topPick !== b.topPick) return a.topPick ? -1 : 1;
    if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
    return 0;
  });

  const handleJoinOrApply = (campaign: typeof availableCampaigns[0]) => {
    if (campaign.requireApply) {
      setAppliedIds([...appliedIds, campaign.id]);
    } else {
      const firstName = settingsName.split(" ")[0]?.toLowerCase() || "creator";
      const link = `https://allcall.link/${settingsName.toLowerCase().replace(/\s/g, "")}/${campaign.brand.toLowerCase()}`;
      const code = `${firstName}${Math.floor(Math.random() * 100)}`;
      const newJoined = {
        id: campaign.id, brand: campaign.brand, product: campaign.product, link, code,
        earnings: 0, clicks: 0, sales: 0, revenue: 0,
      };
      setJoinedCampaigns([...joinedCampaigns, newJoined]);
      setJoinDialogData({ product: campaign.product, link, code, needsProduct: campaign.needsProduct, productType: campaign.productType });
      setShowJoinDialog(true);
    }
  };

  const handleProductApply = (campaignId: number) => {
    const campaign = availableCampaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    setProductApplyCampaignId(campaignId);
    if (campaign.productType === "physical" && settingsAddress) setProductApplyAddress(settingsAddress);
    if (campaign.productType === "digital" && settingsEmail) setProductApplyEmail(settingsEmail);
    setShowProductApply(true);
  };

  const submitProductApplication = () => {
    if (productApplyCampaignId) {
      setProductAppliedIds((prev) => [...prev, productApplyCampaignId]);
    }
    setShowProductApply(false);
    setProductApplyAddress("");
    setProductApplyEmail("");
    setProductApplyCampaignId(null);
  };

  const getButtonState = (campaign: typeof availableCampaigns[0]) => {
    if (joinedCampaigns.some((j) => j.id === campaign.id)) return "joined";
    if (appliedIds.includes(campaign.id)) return "pending";
    return "available";
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCopyMasterLink = () => {
    const masterUrl = `https://allcall.link/${settingsName.toLowerCase().replace(/\s/g, "") || "you"}`;
    navigator.clipboard.writeText(masterUrl);
    setMasterLinkCopied(true);
    setTimeout(() => setMasterLinkCopied(false), 2000);
  };

  const handleWithdraw = (id: number) => {
    setShowWithdrawConfirm({ id, type: "campaign" });
    setMenuOpenId(null);
  };

  const confirmWithdraw = () => {
    if (!showWithdrawConfirm) return;
    if (showWithdrawConfirm.type === "campaign") {
      setJoinedCampaigns((prev) => prev.filter((c) => c.id !== showWithdrawConfirm.id));
      setMasterLinkIds((prev) => prev.filter((x) => x !== showWithdrawConfirm.id));
    } else {
      setAppliedIds((prev) => prev.filter((x) => x !== showWithdrawConfirm.id));
    }
    setShowWithdrawConfirm(null);
  };

  const handleWithdrawApplication = (id: number) => {
    setShowWithdrawConfirm({ id, type: "application" });
    setMenuOpenId(null);
  };

  const handleRemoveFromMasterLink = (id: number) => {
    setMasterLinkIds((prev) => prev.filter((x) => x !== id));
    setMenuOpenId(null);
  };

  const handleAddPortfolioLink = () => {
    if (newPortfolioLink.trim()) {
      setPortfolioLinks([...portfolioLinks, { url: newPortfolioLink.trim(), description: newPortfolioDesc.trim() }]);
      setNewPortfolioLink("");
      setNewPortfolioDesc("");
    }
  };

  const handleAddSocialLink = () => {
    if (newSocialUrl.trim()) {
      const updated = [...socialLinks, { platform: newSocialPlatform, url: newSocialUrl.trim() }];
      setSocialLinks(updated);
      localStorage.setItem("allcall_creator_social_links", JSON.stringify(updated));
      setNewSocialUrl("");
    }
  };

  const updateSocialLink = (idx: number, patch: Partial<{ platform: string; url: string }>) => {
    setSocialLinks((prev) => {
      const next = prev.map((sl, i) => (i === idx ? { ...sl, ...patch } : sl));
      localStorage.setItem("allcall_creator_social_links", JSON.stringify(next));
      return next;
    });
  };

  const removeSocialLink = (idx: number) => {
    setSocialLinks((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem("allcall_creator_social_links", JSON.stringify(next));
      return next;
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("allcall_creator_name", settingsName);
    localStorage.setItem("allcall_email", settingsEmail);
    localStorage.setItem("allcall_country", settingsCountry);
    localStorage.setItem("allcall_creator_address", settingsAddress);
  };

  const handleLogout = () => {
    document.documentElement.classList.remove("dark");
    navigate("/");
  };

  const handleSimulateAnalytics = () => {
    const earnings = Math.floor(Math.random() * 5000 + 500);
    const clicks = Math.floor(Math.random() * 10000 + 1000);
    const sales = Math.floor(Math.random() * 200 + 20);
    const revenue = Math.floor(Math.random() * 20000 + 2000);
    setSimEarnings(earnings);
    setSimClicks(clicks);
    setSimSales(sales);
    setSimRevenue(revenue);
    setSimulatedAnalytics(true);

    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const graphData = months.map((month) => ({
      month,
      earnings: Math.floor(Math.random() * (earnings / 3)),
      clicks: Math.floor(Math.random() * (clicks / 3)),
      sales: Math.floor(Math.random() * (sales / 3)),
      revenue: Math.floor(Math.random() * (revenue / 3)),
    }));
    setSimGraphData(graphData);

    setJoinedCampaigns((prev) => prev.map((c) => ({
      ...c,
      earnings: Math.floor(Math.random() * 800 + 50),
      clicks: Math.floor(Math.random() * 2000 + 100),
      sales: Math.floor(Math.random() * 50 + 5),
      revenue: Math.floor(Math.random() * 3000 + 200),
    })));
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    if (!productLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProductLightbox(null);
        return;
      }
      setProductLightbox((prev) => {
        if (!prev) return null;
        const camp = availableCampaigns.find((x) => x.id === prev.campaignId);
        const n = Math.max(1, camp?.productImageCount ?? 1);
        if (e.key === "ArrowRight") return { ...prev, imageIndex: (prev.imageIndex + 1) % n };
        if (e.key === "ArrowLeft") return { ...prev, imageIndex: (prev.imageIndex - 1 + n) % n };
        return prev;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productLightbox]);

  const masterLinkName = settingsName.toLowerCase().replace(/\s/g, "") || "you";
  const cardClass = "p-5 rounded-2xl bg-card border border-border shadow-card dark-green-outline";
  const sectionCardClass = "bg-card border border-border rounded-2xl p-6 shadow-card dark-green-outline";

  const totalEarnings = simulatedAnalytics ? simEarnings : joinedCampaigns.reduce((s, c) => s + c.earnings, 0);
  const totalClicks = simulatedAnalytics ? simClicks : joinedCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSales = simulatedAnalytics ? simSales : joinedCampaigns.reduce((s, c) => s + c.sales, 0);
  const totalRevenue = simulatedAnalytics ? simRevenue : joinedCampaigns.reduce((s, c) => s + c.revenue, 0);

  const toggleAnalyticsLine = (line: string) => {
    setAnalyticsLines((prev) => prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]);
  };

  const BrandLogoMark = ({ brand, size = "w-14 h-14", textClassName = "text-lg" }: { brand: string; size?: string; textClassName?: string }) => (
    <div className={`${size} rounded-xl bg-primary/10 border border-border flex items-center justify-center shrink-0`} aria-hidden>
      <span className={`font-display font-bold text-primary select-none ${textClassName}`}>{brand[0]?.toUpperCase() ?? "?"}</span>
    </div>
  );

  const CampaignProductGallery = ({ campaign }: { campaign: (typeof availableCampaigns)[0] }) => {
    const n = Math.max(1, campaign.productImageCount);
    return (
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Product</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sample placeholders show where brand photos will appear. Tap an image to enlarge; swipe or use arrows to browse.
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
          {Array.from({ length: n }, (_, i) => (
            <button
              type="button"
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setProductLightbox({ campaignId: campaign.id, imageIndex: i });
              }}
              className="snap-start shrink-0 w-[min(100%,280px)] aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Image {i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  type AnalyticsMetricKey = "earnings" | "clicks" | "sales" | "revenue";
  type GraphType = "bar" | "line" | "pie";

  const [analyticsMetric, setAnalyticsMetric] = useState<AnalyticsMetricKey>("earnings");
  const [analyticsGraphType, setAnalyticsGraphType] = useState<GraphType>("bar");

  const formatMetricValue = (metricKey: AnalyticsMetricKey, v: number) => {
    if (metricKey === "earnings" || metricKey === "revenue") return `$${Math.round(v).toLocaleString()}`;
    return `${Math.round(v).toLocaleString()}`;
  };

  const niceMax = (max: number) => {
    if (!isFinite(max) || max <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / pow;
    const mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return mult * pow;
  };

  const renderAnalyticsGraph = (metricKey: AnalyticsMetricKey, data: typeof simGraphData, graphType: GraphType) => {
    if (!simulatedAnalytics || data.length === 0) {
      return (
        <div className="h-64 rounded-xl bg-muted/30 flex items-center justify-center border border-border dark-green-outline">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click "Simulate Analytics" to see sample data</p>
          </div>
        </div>
      );
    }

    const metricColorMap: Record<AnalyticsMetricKey, { bar: string; stroke: string }> = {
      earnings: { bar: "bg-primary/70", stroke: "stroke-primary" },
      clicks: { bar: "bg-blue-500/70", stroke: "stroke-blue-500" },
      sales: { bar: "bg-orange-500/70", stroke: "stroke-orange-500" },
      revenue: { bar: "bg-purple-500/70", stroke: "stroke-purple-500" },
    };

    const values = data.map((x) => x[metricKey] ?? 0);
    const maxVal = niceMax(Math.max(...values, 1));
    const yTicks = 5;
    const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal * (yTicks - i)) / yTicks);

    const chartHeight = 208; // inner plot height
    const chartWidth = 640; // svg viewbox width
    const padLeft = 54; // room for y-axis labels
    const padRight = 18;
    const padTop = 12;
    const padBottom = 28;
    const plotW = chartWidth - padLeft - padRight;
    const plotH = chartHeight - padTop - padBottom;

    const xFor = (i: number) => padLeft + (values.length === 1 ? plotW / 2 : (i * plotW) / (values.length - 1));
    const yFor = (v: number) => padTop + (1 - v / maxVal) * plotH;

    const linePoints = values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");

    if (graphType === "pie") {
      const total = values.reduce((s, v) => s + v, 0);
      const segments = data.map((d, i) => {
        const v = d[metricKey] ?? 0;
        const label = d.month;
        return { v, label, i, pct: total > 0 ? v / total : 0 };
      });
      const palette = ["#16a34a", "#3b82f6", "#a855f7", "#f97316", "#ef4444", "#14b8a6"];
      let acc = 0;
      const radius = 78;
      const cx = 120;
      const cy = 92;
      const paths = segments.map((s, idx) => {
        const start = acc * Math.PI * 2;
        acc += s.pct;
        const end = acc * Math.PI * 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = cx + radius * Math.cos(start - Math.PI / 2);
        const y1 = cy + radius * Math.sin(start - Math.PI / 2);
        const x2 = cx + radius * Math.cos(end - Math.PI / 2);
        const y2 = cy + radius * Math.sin(end - Math.PI / 2);
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
        return { d, fill: palette[idx % palette.length], key: `${s.label}-${idx}` };
      });

      return (
        <div className="h-64 rounded-xl bg-muted/30 border border-border dark-green-outline p-4 flex gap-6 items-center">
          <svg viewBox="0 0 240 184" className="w-60 h-44 shrink-0">
            {paths.map((p) => (
              <path key={p.key} d={p.d} fill={p.fill} stroke="rgba(0,0,0,0.08)" />
            ))}
          </svg>
          <div className="flex-1 space-y-2 overflow-auto">
            {segments.map((s, idx) => (
              <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: palette[idx % palette.length] }} />
                  <span className="text-foreground">{s.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-foreground font-medium">{formatMetricValue(metricKey, s.v)}</div>
                  <div className="text-xs text-muted-foreground">{Math.round((s.pct || 0) * 100)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 rounded-xl bg-muted/30 border border-border dark-green-outline p-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          {/* Grid + Y axis labels */}
          {tickVals.map((tv, idx) => {
            const y = padTop + (idx * plotH) / yTicks;
            return (
              <g key={idx}>
                <line x1={padLeft} x2={chartWidth - padRight} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="12" fill="rgba(0,0,0,0.55)">
                  {formatMetricValue(metricKey, tv)}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {data.map((d, i) => (
            <text
              key={d.month}
              x={xFor(i)}
              y={padTop + plotH + 22}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(0,0,0,0.55)"
            >
              {d.month}
            </text>
          ))}

          {/* Bars */}
          {graphType === "bar" &&
            data.map((d, i) => {
              const v = d[metricKey] ?? 0;
              const x = xFor(i);
              const barW = Math.max(10, plotW / Math.max(values.length * 2.2, 1));
              const y = yFor(v);
              const h = padTop + plotH - y;
              return (
                <rect
                  key={d.month}
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={Math.max(2, h)}
                  rx="6"
                  className={metricColorMap[metricKey].bar}
                />
              );
            })}

          {/* Line */}
          {graphType === "line" && (
            <>
              <polyline fill="none" strokeWidth="3" className={metricColorMap[metricKey].stroke} points={linePoints} />
              {values.map((v, i) => (
                <circle key={i} cx={xFor(i)} cy={yFor(v)} r="4.5" fill="white" strokeWidth="3" className={metricColorMap[metricKey].stroke} />
              ))}
            </>
          )}
        </svg>
      </div>
    );
  };

  const dashboardFooter = (
    <footer className="mt-12 pt-6 border-t border-border">
      <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
        <a href="https://allcall.carrd.co/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1"><ExternalLink className="w-3 h-3" /> AllCall Landing Page</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSf4mmoWe2y9mcKaj-0i6C1tRDZZGBq_87YjUeOu5HHyjonxhw/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Feedback Survey</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSeBZn0VKe1V23746Lby7U5zyqc1a9R7EZ7uyWLru-Z9jenFPQ/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Join Waitlist / Early Access</a>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex" style={{ background: darkMode ? 'hsl(150, 10%, 5%)' : 'linear-gradient(180deg, hsl(148, 50%, 84%) 0%, hsl(145, 35%, 88%) 40%, hsl(140, 20%, 93%) 100%)', backgroundAttachment: 'fixed' }}>
      {/* Withdraw confirmation */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowWithdrawConfirm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <AlertCircle className="w-10 h-10 text-warning mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              {showWithdrawConfirm.type === "campaign" ? "Withdraw from Campaign?" : "Withdraw Application?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {showWithdrawConfirm.type === "campaign"
                ? "You will lose access to your affiliate link and code for this campaign. Any pending earnings may be forfeited."
                : "Your application will be withdrawn and you will need to reapply if you change your mind."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="destructive" onClick={confirmWithdraw}>Withdraw</Button>
              <Button variant="outline" onClick={() => setShowWithdrawConfirm(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product image lightbox (sample placeholders) */}
      {productLightbox && (() => {
        const c = availableCampaigns.find((x) => x.id === productLightbox.campaignId);
        if (!c) return null;
        const n = Math.max(1, c.productImageCount);
        const idx = ((productLightbox.imageIndex % n) + n) % n;
        const go = (dir: -1 | 1) => setProductLightbox({ campaignId: c.id, imageIndex: (idx + dir + n) % n });
        return (
          <div
            className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Product images"
            onClick={() => setProductLightbox(null)}
          >
            <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="absolute -top-1 right-0 z-10 rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
                onClick={() => setProductLightbox(null)}
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
              <div
                className="relative rounded-2xl bg-muted aspect-[4/3] max-h-[min(70vh,520px)] flex flex-col items-center justify-center border border-white/10 touch-pan-y"
                onTouchStart={(e) => { lightboxTouchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (lightboxTouchStartX.current == null) return;
                  const dx = e.changedTouches[0].clientX - lightboxTouchStartX.current;
                  lightboxTouchStartX.current = null;
                  if (dx > 50) go(-1);
                  else if (dx < -50) go(1);
                }}
              >
                <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-2xl font-display font-semibold text-muted-foreground">Image {idx + 1}</p>
                <p className="text-sm text-muted-foreground mt-2 text-center px-6">{c.product}</p>
                {n > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent"
                      onClick={() => go(-1)}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent"
                      onClick={() => go(1)}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {n > 1 && (
                <p className="text-center text-white/85 text-sm mt-3">{idx + 1} / {n}</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Join confirmation dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-sm border-0 shadow-xl bg-gradient-to-br from-emerald-50/80 via-background to-sky-50/60 dark:from-emerald-950/20 dark:via-background dark:to-slate-950/35">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              Campaign Joined!
            </DialogTitle>
            <DialogDescription>
              You've successfully joined {joinDialogData?.product}. Here's your info:
            </DialogDescription>
          </DialogHeader>
          {joinDialogData && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <p className="text-xs text-muted-foreground">Your Affiliate Link</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground truncate flex-1 font-mono">{joinDialogData.link}</p>
                  <button onClick={() => handleCopyLink(joinDialogData.link)} className="text-primary hover:text-primary/80 shrink-0">
                    {copiedLink === joinDialogData.link ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs text-muted-foreground">Your Creator Code</p>
                <p className="text-lg font-mono font-bold text-primary">{joinDialogData.code}</p>
              </div>
              {joinDialogData.needsProduct && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-2">
                  <p className="text-sm font-medium text-foreground">📦 This campaign involves a {joinDialogData.productType === "digital" ? "digital" : "physical"} product</p>
                  <p className="text-xs text-muted-foreground">Apply for the product to receive it from the brand.</p>
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowJoinDialog(false);
                    const campaign = availableCampaigns.find((c) => c.product === joinDialogData.product);
                    if (campaign) handleProductApply(campaign.id);
                  }}>Apply for Product</Button>
                </div>
              )}
              <Button variant="hero" className="w-full" onClick={() => { setShowJoinDialog(false); setTab("my-campaigns"); }}>
                View My Campaigns
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product application dialog */}
      <Dialog open={showProductApply} onOpenChange={setShowProductApply}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Apply for Product</DialogTitle>
            <DialogDescription>
              {(() => {
                const c = availableCampaigns.find((x) => x.id === productApplyCampaignId);
                return c?.productType === "physical"
                  ? "Enter your shipping address to receive this product."
                  : "Enter your email to receive this digital product.";
              })()}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const c = availableCampaigns.find((x) => x.id === productApplyCampaignId);
            return c?.productType === "physical" ? (
              <div className="space-y-3">
                <Input value={productApplyAddress} onChange={(e) => setProductApplyAddress(e.target.value)} placeholder="Your shipping address" />
                <Button variant="hero" className="w-full" onClick={submitProductApplication} disabled={!productApplyAddress.trim()}>Submit Application</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input value={productApplyEmail} onChange={(e) => setProductApplyEmail(e.target.value)} placeholder="your@email.com" type="email" />
                <Button variant="hero" className="w-full" onClick={submitProductApplication} disabled={!productApplyEmail.trim()}>Submit Application</Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 mb-8" onClick={() => document.documentElement.classList.remove("dark")}>
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
              onClick={() => { setTab(item.key); setSelectedCampaign(null); setMenuOpenId(null); setViewingBrand(null); setAnalyticsDetail(null); setSelectedMyCampaign(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                tab === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Brand profile view */}
        {tab === "feed" && viewingBrand && !selectedCampaign && (() => {
          const ba = brandAnalytics[viewingBrand] || { totalPaid: 0, campaigns: 0, creators: 0 };
          const brandCampaigns = availableCampaigns.filter((c) => c.brand === viewingBrand);
          return (
            <div className="space-y-6">
              <button onClick={() => setViewingBrand(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to campaigns</button>
              <div className={sectionCardClass + " space-y-4"}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">{viewingBrand[0]}</div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">{viewingBrand}</h1>
                    <p className="text-sm text-muted-foreground">{brandCampaigns.length} campaigns · {ba.creators} creators</p>
                  </div>
                </div>
                {(ba as any).websiteUrl && (
                  <a href={(ba as any).websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {(ba as any).websiteUrl}</a>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Total Paid to Creators</p><p className="font-display text-xl font-bold text-primary">${ba.totalPaid.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Active Campaigns</p><p className="font-display text-xl font-bold text-foreground">{ba.campaigns}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Total Creators</p><p className="font-display text-xl font-bold text-foreground">{ba.creators}</p></div>
                </div>
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground">Campaigns by {viewingBrand}</h2>
              <div className="space-y-3">
                {brandCampaigns.map((c) => {
                  const btnState = getButtonState(c);
                  return (
                    <div key={c.id} className={cardClass + " hover:shadow-card-hover transition-shadow cursor-pointer"} onClick={() => setSelectedCampaign(c.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <BrandLogoMark brand={c.brand} />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                              {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{c.category} · {c.adPlatforms && c.adPlatforms.length > 1 ? "Multiple Platforms" : c.platform}</p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          {btnState === "joined" ? (
                            <Badge className="bg-success/10 text-primary border-0"><Check className="w-3 h-3 mr-1" /> Joined</Badge>
                          ) : btnState === "pending" ? (
                            <Button variant="secondary" size="sm" disabled>Pending</Button>
                          ) : (
                            <Button variant="hero" size="sm" onClick={() => handleJoinOrApply(c)}>{c.requireApply ? "Apply" : "Join"}</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {tab === "feed" && !selectedCampaign && !viewingBrand && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Discover Campaigns</h1>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search campaigns..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>

            {showFilters && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={sectionCardClass + " space-y-4"}>
                <h3 className="text-sm font-semibold text-foreground">Filter Campaigns</h3>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
                  <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-full" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {["Beauty", "Health", "Tech", "Fashion", "Home", "Food", "Sports", "Travel", "Education", "Finance", "Entertainment", "Automotive", "Pet Products"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pay Type</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ key: "commission", label: "Commission" }, { key: "flat", label: "Flat Rate" }, { key: "hybrid", label: "Hybrid" }].map((p) => (
                      <button key={p.key} onClick={() => setFilterPayType(filterPayType === p.key ? "" : p.key)} className={`px-3 py-1.5 rounded-full text-xs border ${filterPayType === p.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Platform</p>
                  <div className="flex flex-wrap gap-2">
                    {["TikTok", "Instagram", "YouTube"].map((p) => (
                      <button key={p} onClick={() => setFilterPlatform((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])} className={`px-3 py-1.5 rounded-full text-xs border ${filterPlatform.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={filterSignOnPay} onChange={(e) => { setFilterSignOnPay(e.target.checked); if (!e.target.checked) setFilterMinSignOnPay(""); }} className="rounded" />
                    <span className="text-sm text-foreground">Sign-on pay only</span>
                  </label>
                  {filterSignOnPay && (
                    <div className="flex items-center gap-2 mt-2 ml-7">
                      <span className="text-sm text-muted-foreground">Min $</span>
                      <Input value={filterMinSignOnPay} onChange={(e) => setFilterMinSignOnPay(e.target.value)} placeholder="0" type="number" className="w-24" />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(""); setFilterPayType(""); setFilterPlatform([]); setFilterSignOnPay(false); setFilterMinSignOnPay(""); }}>Clear Filters</Button>
              </motion.div>
            )}

            <div className="space-y-4">
              {filteredCampaigns.map((c) => {
                const btnState = getButtonState(c);
                return (
                  <div key={c.id} className={cardClass + " hover:shadow-card-hover transition-shadow cursor-pointer"} onClick={() => setSelectedCampaign(c.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BrandLogoMark brand={c.brand} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                            {c.isPro && (
                              <Tooltip>
                                <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                                <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                              </Tooltip>
                            )}
                            {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); setViewingBrand(c.brand); }}>{c.brand}</button>
                            {" · "}{c.category} · {c.adPlatforms && c.adPlatforms.length > 1 ? "Multiple Platforms" : c.platform}
                          </p>
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
          const c = availableCampaigns.find((x) => x.id === selectedCampaign)!;
          const btnState = getButtonState(c);
          return (
            <div className="max-w-2xl space-y-6">
              <button onClick={() => setSelectedCampaign(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to campaigns</button>
              <div className={sectionCardClass + " space-y-6"}>
                <div className="flex items-center gap-4">
                  <BrandLogoMark brand={c.brand} size="w-20 h-20" textClassName="text-2xl" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display text-2xl font-bold text-foreground">{c.product}</h1>
                      {c.isPro && (
                        <Tooltip>
                          <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                          <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      <button className="text-primary hover:underline" onClick={() => { setSelectedCampaign(null); setViewingBrand(c.brand); }}>{c.brand}</button>
                      {" · "}{c.category}
                    </p>
                  </div>
                </div>

                <CampaignProductGallery campaign={c} />

                {c.description && <p className="text-sm text-foreground">{c.description}</p>}
                {c.notes && <p className="text-sm text-muted-foreground italic">📌 {c.notes}</p>}
                {c.productLink && <a href={c.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Product Link</a>}
                {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platform</p><p className="font-semibold text-foreground">{c.adPlatforms ? c.adPlatforms.join(", ") : c.platform}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Payment</p><p className="font-semibold text-foreground">{c.payMethod}</p></div>
                  {c.signOnPay > 0 && <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sign-On Pay</p><p className="font-semibold text-primary">${c.signOnPay}</p></div>}
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Product Required</p><p className="font-semibold text-foreground">{c.needsProduct ? "Yes" : "No"}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline col-span-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Active creators</p>
                    <p className="font-semibold text-foreground">{c.activeCreatorsCount} working on this campaign</p>
                  </div>
                </div>

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

        {tab === "my-campaigns" && !selectedMyCampaign && (
          <div className="space-y-8">
            <h1 className="font-display text-3xl font-bold text-foreground">My Campaigns</h1>

            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">Active Campaigns</h2>
              {joinedCampaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active campaigns yet. Join campaigns to get started!</p>
              ) : (
                <div className="space-y-3">
                  {joinedCampaigns.map((c) => (
                    <div key={c.id} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => setSelectedMyCampaign(c.id)}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <BrandLogoMark brand={c.brand} />
                          <div>
                            <h3 className="font-display font-bold text-foreground hover:text-primary transition-colors">{c.product}</h3>
                            <p className="text-sm text-muted-foreground">{c.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-display text-lg font-bold text-primary">${c.earnings}</p>
                            <p className="text-xs text-muted-foreground">earned</p>
                          </div>
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {menuOpenId === c.id && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                                <button onClick={() => handleWithdraw(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Withdraw from Campaign</button>
                                {masterLinkIds.includes(c.id) && (
                                  <button onClick={() => handleRemoveFromMasterLink(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">Remove from Master Link</button>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 p-3 rounded-lg bg-muted/50 flex items-center justify-between dark-green-outline">
                          <div>
                            <p className="text-xs text-muted-foreground">Affiliate Link</p>
                            <p className="text-sm text-foreground truncate">{c.link}</p>
                          </div>
                          <button className="text-primary hover:text-primary/80" onClick={(e) => { e.stopPropagation(); handleCopyLink(c.link); }}>
                            {copiedLink === c.link ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 dark-green-outline">
                          <p className="text-xs text-muted-foreground">Code</p>
                          <p className="text-sm font-mono font-bold text-primary">{c.code}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Applications */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-foreground">Pending Applications</h2>
              {appliedIds.length === 0 && productAppliedIds.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending applications.</p>
              ) : (
                <div className="space-y-3">
                  {appliedIds.map((id) => {
                    const c = availableCampaigns.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} className={cardClass + " flex items-center justify-between"}>
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setTab("feed"); setSelectedCampaign(id); }}>
                          <BrandLogoMark brand={c.brand} size="w-12 h-12" textClassName="text-base" />
                          <div>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{c.product}</h3>
                            <p className="text-sm text-muted-foreground">{c.brand} · {c.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Pending</Badge>
                          <div className="relative">
                            <button onClick={() => setMenuOpenId(menuOpenId === id + 1000 ? null : id + 1000)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {menuOpenId === id + 1000 && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                                <button onClick={() => handleWithdrawApplication(id)} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Withdraw Application</button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Product applications */}
                  {productAppliedIds.filter((id) => !appliedIds.includes(id)).map((id) => {
                    const c = availableCampaigns.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={`product-${id}`} className={cardClass + " flex items-center justify-between"}>
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setTab("feed"); setSelectedCampaign(id); }}>
                          <BrandLogoMark brand={c.brand} size="w-12 h-12" textClassName="text-base" />
                          <div>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{c.product}</h3>
                            <p className="text-sm text-muted-foreground">{c.brand} · Product Application</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Product Pending</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My campaign detail */}
        {tab === "my-campaigns" && selectedMyCampaign && (() => {
          const joined = joinedCampaigns.find((c) => c.id === selectedMyCampaign);
          const campaign = availableCampaigns.find((c) => c.id === selectedMyCampaign);
          if (!joined || !campaign) return null;
          const hasAppliedForProduct = productAppliedIds.includes(campaign.id);
          return (
            <div className="max-w-2xl space-y-6">
              <button onClick={() => setSelectedMyCampaign(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to my campaigns</button>
              <div className={sectionCardClass + " space-y-6"}>
                <div className="flex items-center gap-4">
                  <BrandLogoMark brand={campaign.brand} size="w-16 h-16" textClassName="text-xl" />
                  <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">{campaign.product}</h1>
                    <p className="text-muted-foreground">{campaign.brand} · {campaign.category}</p>
                  </div>
                </div>
                <CampaignProductGallery campaign={campaign} />
                {campaign.description && <p className="text-sm text-foreground">{campaign.description}</p>}
                {campaign.notes && <p className="text-sm text-muted-foreground italic">📌 {campaign.notes}</p>}
                {campaign.productLink && <a href={campaign.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Product Link</a>}
                {campaign.websiteUrl && <a href={campaign.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platform</p><p className="font-semibold text-foreground">{campaign.adPlatforms ? campaign.adPlatforms.join(", ") : campaign.platform}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Payment</p><p className="font-semibold text-foreground">{campaign.payMethod}</p></div>
                  {campaign.signOnPay > 0 && <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sign-On Pay</p><p className="font-semibold text-primary">${campaign.signOnPay}</p></div>}
                </div>
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between dark-green-outline">
                  <div>
                    <p className="text-xs text-muted-foreground">Your Affiliate Link</p>
                    <p className="text-sm text-foreground truncate font-mono">{joined.link}</p>
                  </div>
                  <button className="text-primary hover:text-primary/80" onClick={() => handleCopyLink(joined.link)}>
                    {copiedLink === joined.link ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 dark-green-outline">
                  <p className="text-xs text-muted-foreground">Your Creator Code</p>
                  <p className="text-lg font-mono font-bold text-primary">{joined.code}</p>
                </div>

                {/* Apply for product option if campaign needs product and creator hasn't applied */}
                {campaign.needsProduct && !hasAppliedForProduct && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-2">
                    <p className="text-sm font-medium text-foreground">📦 This campaign involves a {campaign.productType === "digital" ? "digital" : "physical"} product</p>
                    <p className="text-xs text-muted-foreground">Apply to receive the product from the brand.</p>
                    <Button variant="outline" size="sm" onClick={() => handleProductApply(campaign.id)}>Apply for Product</Button>
                  </div>
                )}
                {campaign.needsProduct && hasAppliedForProduct && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Product application submitted — awaiting brand approval.</p>
                  </div>
                )}
              </div>
              <div className={sectionCardClass}>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Your Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Earnings</p><p className="font-display text-xl font-bold text-primary">${joined.earnings}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Clicks</p><p className="font-display text-xl font-bold text-foreground">{joined.clicks}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sales</p><p className="font-display text-xl font-bold text-foreground">{joined.sales}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Revenue for Brand</p><p className="font-display text-xl font-bold text-foreground">${joined.revenue}</p></div>
                </div>
              </div>
            </div>
          );
        })()}

        {tab === "master-link" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">Master Link Page</h1>
              <Tooltip>
                <TooltipTrigger><Info className="w-5 h-5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent className="max-w-xs">A master link is a single page that contains all your active campaign affiliate links and discount codes. Share one link in your bio instead of multiple.</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">One link for all your campaigns. Perfect for your bio.</p>

            <div className={sectionCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link2 className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm text-foreground">allcall.link/{masterLinkName}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyMasterLink}>
                  {masterLinkCopied ? <><Check className="w-4 h-4 mr-1" /> Copied!</> : <><ClipboardCopy className="w-4 h-4 mr-1" /> Copy</>}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">Campaigns on Master Link</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAddToMasterLink(!showAddToMasterLink)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Campaign
                </Button>
              </div>

              {showAddToMasterLink && (
                <div className={sectionCardClass + " space-y-2"}>
                  <p className="text-sm font-medium text-foreground">Select campaigns to add:</p>
                  {joinedCampaigns.filter((c) => !masterLinkIds.includes(c.id)).length === 0 ? (
                    <p className="text-sm text-muted-foreground">All campaigns are already on your master link, or you haven't joined any yet.</p>
                  ) : (
                    joinedCampaigns.filter((c) => !masterLinkIds.includes(c.id)).map((c) => (
                      <button key={c.id} onClick={() => { setMasterLinkIds([...masterLinkIds, c.id]); setShowAddToMasterLink(false); }} className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent text-sm transition-colors">
                        {c.product} ({c.brand})
                      </button>
                    ))
                  )}
                </div>
              )}

              {joinedCampaigns.filter((c) => masterLinkIds.includes(c.id)).map((c) => (
                <div key={c.id} className={cardClass + " space-y-2"}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{c.product}</h3>
                      <p className="text-xs text-muted-foreground">{c.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button onClick={() => setMenuOpenId(menuOpenId === c.id + 2000 ? null : c.id + 2000)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {menuOpenId === c.id + 2000 && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                            <button onClick={() => handleWithdraw(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Withdraw from Campaign</button>
                            <button onClick={() => handleRemoveFromMasterLink(c.id)} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">Remove from Master Link</button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground truncate flex-1 font-mono">{c.link}</p>
                    <button className="text-primary hover:text-primary/80" onClick={() => handleCopyLink(c.link)}>
                      {copiedLink === c.link ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Code:</span>
                    <span className="font-mono font-bold text-primary text-sm">{c.code}</span>
                  </div>
                </div>
              ))}
              {joinedCampaigns.filter((c) => masterLinkIds.includes(c.id)).length === 0 && (
                <div className="p-4 rounded-xl border-2 border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground">No campaigns on your master link yet. Click "Add Campaign" above to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "portfolio" && (
          <div className="space-y-6 max-w-2xl">
            <h1 className="font-display text-3xl font-bold text-foreground">Portfolio</h1>
            <p className="text-sm text-muted-foreground">Showcase your best work. Brands can see this when they view your profile.</p>

            {/* Bio / Description */}
            <div className={sectionCardClass + " space-y-4"}>
              <h2 className="font-display text-lg font-semibold text-foreground">Bio / Description</h2>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
              />
            </div>

            {/* Social Links */}
            <div className={sectionCardClass + " space-y-4"}>
              <h2 className="font-display text-lg font-semibold text-foreground">Social Links</h2>
              <div className="flex gap-2 items-end">
                <div className="w-32">
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={newSocialPlatform} onChange={(e) => setNewSocialPlatform(e.target.value)}>
                    {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook", "LinkedIn", "Website"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <Input value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} placeholder="https://tiktok.com/@you" />
                </div>
                <Button variant="hero" size="sm" onClick={handleAddSocialLink} disabled={!newSocialUrl.trim()}>Add</Button>
              </div>
              {socialLinks.length > 0 && (
                <div className="space-y-2">
                  {socialLinks.map((sl, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border dark-green-outline">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-primary" />
                        <div className="space-y-2">
                          <div className="flex gap-2 items-center">
                            <select
                              className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                              value={sl.platform}
                              onChange={(e) => updateSocialLink(i, { platform: e.target.value })}
                            >
                              {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook", "LinkedIn", "Website"].map((p) => (
                                <option key={p}>{p}</option>
                              ))}
                            </select>
                            <Input
                              value={sl.url}
                              onChange={(e) => updateSocialLink(i, { url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          {sl.url.trim() && (
                            <a href={sl.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                              {sl.url}
                            </a>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeSocialLink(i)} className="text-muted-foreground hover:text-destructive">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Videos/Links */}
            <div className={sectionCardClass + " space-y-4"}>
              <h2 className="font-display text-lg font-semibold text-foreground">Add Video / Link</h2>
              <div className="space-y-3">
                <Input value={newPortfolioLink} onChange={(e) => setNewPortfolioLink(e.target.value)} placeholder="https://tiktok.com/@you/video123 or YouTube link" />
                <Input value={newPortfolioDesc} onChange={(e) => setNewPortfolioDesc(e.target.value)} placeholder="Brief description of this content (optional)" />
                <Button variant="hero" onClick={handleAddPortfolioLink}>Add</Button>
              </div>
            </div>

            {portfolioLinks.length > 0 ? (
              <div className="space-y-3">
                {portfolioLinks.map((item, i) => (
                  <div key={i} className={cardClass + " space-y-2"}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-primary" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-md">{item.url}</a>
                      </div>
                      <button onClick={() => setPortfolioLinks(portfolioLinks.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground ml-8">{item.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-border text-center space-y-3">
                <Video className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No portfolio items yet. Add links to your best content above.</p>
              </div>
            )}
          </div>
        )}

        {/* Shipping page */}
        {tab === "shipping" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Shipping & Deliveries</h1>
            <p className="text-sm text-muted-foreground">Track products being shipped or emailed to you by brands.</p>

            {incomingShipments.length === 0 ? (
              <div className={sectionCardClass + " text-center py-12"}>
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shipments yet. Products will appear here when brands mark them as shipped to you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingShipments.map((sp) => (
                  <div key={sp.id} className={cardClass + " space-y-3"}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{sp.product}</h3>
                        <p className="text-sm text-muted-foreground">From: {sp.brand} · Campaign: {sp.campaign}</p>
                      </div>
                      <Badge variant="secondary"><Truck className="w-3 h-3 mr-1" /> Shipped</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Units</p><p className="font-medium text-foreground">{sp.units}</p></div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Your Address</p><p className="font-medium text-foreground text-xs">{sp.address}</p></div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Date Shipped</p><p className="font-medium text-foreground">{sp.dateShipped}</p></div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Expected Delivery</p><p className="font-medium text-foreground">{sp.expectedDelivery || "Not set"}</p></div>
                    </div>
                    {sp.trackingLink && (
                      <a href={sp.trackingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Track Package</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && !analyticsDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
              <Button variant="outline" onClick={handleSimulateAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" /> Simulate Analytics
              </Button>
            </div>
            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex flex-wrap gap-3 items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Performance Graph</p>
                  <p className="text-xs text-muted-foreground">Choose a metric and graph type to update the chart.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Metric</p>
                    <select
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={analyticsMetric}
                      onChange={(e) => setAnalyticsMetric(e.target.value as AnalyticsMetricKey)}
                    >
                      <option value="earnings">Earnings</option>
                      <option value="clicks">Clicks</option>
                      <option value="sales">Sales</option>
                      <option value="revenue">Revenue</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Graph Type</p>
                    <select
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={analyticsGraphType}
                      onChange={(e) => setAnalyticsGraphType(e.target.value as GraphType)}
                    >
                      <option value="bar">Bar</option>
                      <option value="line">Line</option>
                      <option value="pie">Pie</option>
                    </select>
                  </div>
                </div>
              </div>
              {renderAnalyticsGraph(analyticsMetric, simGraphData, analyticsGraphType)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, key: "earnings" },
                { label: "Active Campaigns", value: String(joinedCampaigns.length), key: "campaigns" },
                { label: "Total Clicks", value: totalClicks.toLocaleString(), key: "clicks" },
                { label: "Total Sales", value: String(totalSales), key: "sales" },
                { label: "Revenue for Brands", value: `$${totalRevenue.toLocaleString()}`, key: "revenue" },
              ].map((s) => (
                <div key={s.label} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => setAnalyticsDetail(s.key)}>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  {s.key === "earnings" && <p className="text-xs text-muted-foreground mt-1">A 10% platform fee applies to all creator earnings to support AllCall's services and infrastructure.</p>}
                  <p className="text-xs text-primary mt-1">Click for details →</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "analytics" && analyticsDetail && (
          <div className="space-y-6">
            <button onClick={() => setAnalyticsDetail(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to analytics</button>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {analyticsDetail === "earnings" && "Earnings Breakdown"}
              {analyticsDetail === "campaigns" && "Campaign Details"}
              {analyticsDetail === "clicks" && "Clicks Breakdown"}
              {analyticsDetail === "sales" && "Sales Breakdown"}
              {analyticsDetail === "revenue" && "Revenue Breakdown"}
            </h1>

            {/* Graph is shown on the main analytics page */}

            <div className={sectionCardClass}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">By Campaign</h2>
              {joinedCampaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No campaign data yet.</p>
              ) : (
                <div className="space-y-3">
                  {joinedCampaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border dark-green-outline">
                      <div>
                        <p className="font-semibold text-foreground">{c.product}</p>
                        <p className="text-xs text-muted-foreground">{c.brand}</p>
                      </div>
                      <div className="text-right">
                        {analyticsDetail === "earnings" && <p className="font-display font-bold text-primary">${c.earnings}</p>}
                        {analyticsDetail === "clicks" && <p className="font-display font-bold text-foreground">{c.clicks}</p>}
                        {analyticsDetail === "sales" && <p className="font-display font-bold text-foreground">{c.sales}</p>}
                        {analyticsDetail === "campaigns" && <Badge className="bg-success/10 text-primary border-0">Active</Badge>}
                        {analyticsDetail === "revenue" && <p className="font-display font-bold text-foreground">${c.revenue}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>

            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Account Details</h2>
              </div>
              <div><label className="text-sm font-medium text-foreground">Full Name</label><Input value={settingsName} onChange={(e) => setSettingsName(e.target.value)} /></div>
              <div><label className="text-sm font-medium text-foreground">Email</label><Input value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} /></div>
              <div>
                <label className="text-sm font-medium text-foreground">Country</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={settingsCountry} onChange={(e) => setSettingsCountry(e.target.value)}>
                  <option value="">Select country</option>
                  {["United States", "United Kingdom", "Canada"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-1">More country support coming soon.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Address (for product delivery)</label>
                <Input value={settingsAddress} onChange={(e) => setSettingsAddress(e.target.value)} placeholder="Your address for product delivery" />
              </div>
            </div>

            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Change Password</h2>
              </div>
              <div><label className="text-sm font-medium text-foreground">Current Password</label><Input type="password" value={settingsPassword.current} onChange={(e) => setSettingsPassword({ ...settingsPassword, current: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground">New Password</label><Input type="password" value={settingsPassword.new} onChange={(e) => setSettingsPassword({ ...settingsPassword, new: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-foreground">Confirm New Password</label><Input type="password" value={settingsPassword.confirm} onChange={(e) => setSettingsPassword({ ...settingsPassword, confirm: e.target.value })} /></div>
            </div>

            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Info</h2>
              </div>
              <div className="p-6 rounded-xl border-2 border-dashed border-border text-center space-y-3">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Third-party payment service integration coming soon.</p>
                <Button variant="outline" size="sm" disabled>Connect Payment Service</Button>
              </div>
            </div>

            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <h2 className="font-display text-lg font-semibold text-foreground">Appearance</h2>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Dark Mode</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-colors border shadow-sm relative ${darkMode ? "bg-primary border-primary/40" : "bg-muted/60 border-border"}`}>
                  <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform border ${darkMode ? "translate-x-6 border-primary/40" : "translate-x-0.5 border-border"}`} />
                </button>
              </div>
            </div>

            <Button variant="hero" onClick={handleSaveSettings}>Save All Changes</Button>
          </div>
        )}

        {dashboardFooter}
      </main>
    </div>
  );
};

export default CreatorDashboard;

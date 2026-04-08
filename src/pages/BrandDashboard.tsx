import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Plus, Users, DollarSign, Settings, Eye, LogOut, Search,
  Lock, TrendingUp, Filter, Send, Check, X as XIcon,
  Package, Link2, MoreHorizontal, Star, Info, Moon, Sun, User, KeyRound, Crown, CreditCard,
  ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, UserX, Ban, Upload, MapPin, Truck, Calendar, ExternalLink, History,
  Pencil, Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const brandCategories = [
  "Fashion & Apparel", "Beauty & Skincare", "Health & Wellness", "Food & Beverage",
  "Tech & Electronics", "Home & Living", "Sports & Fitness", "Travel & Hospitality",
  "Education", "Finance", "Entertainment", "Automotive", "Pet Products",
];

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

const campaignCategories = ["Beauty", "Health", "Tech", "Fashion", "Food", "Sports", "Travel", "Home", "Education", "Finance", "Entertainment", "Automotive", "Pet Products", "All"];

const BRAND_ANALYTICS_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const BRAND_MONTH_WEIGHTS = [0.12, 0.13, 0.15, 0.18, 0.2, 0.22];

type BrandAnalyticsMetricKey = "earnings" | "clicks" | "sales" | "revenue";
type BrandGraphType = "bar" | "line" | "pie";

type BrandGraphRow = { month: string; earnings: number; clicks: number; sales: number; revenue: number };

const distributeBrandTotals = (t: { earnings: number; clicks: number; sales: number; revenue: number }): BrandGraphRow[] =>
  BRAND_ANALYTICS_MONTHS.map((month, i) => ({
    month,
    earnings: Math.max(0, Math.round(t.earnings * BRAND_MONTH_WEIGHTS[i])),
    clicks: Math.max(0, Math.round(t.clicks * BRAND_MONTH_WEIGHTS[i])),
    sales: Math.max(0, Math.round(t.sales * BRAND_MONTH_WEIGHTS[i])),
    revenue: Math.max(0, Math.round(t.revenue * BRAND_MONTH_WEIGHTS[i])),
  }));

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
  activeCreators: { name: string; platform: string; followers: string; clicks: number; sales: number; earnings: number; isTestCreator?: boolean }[];
  images?: string[];
  notes?: string;
  discount?: string;
  creatorCode?: boolean;
  paidProduct?: boolean;
  productType?: "physical" | "digital";
  adPlatforms?: string[];
  filterFollowers?: boolean;
  minFollowers?: number;
  followerFilterType?: string[];
  filterCategories?: string[];
  websiteUrl?: string;
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
  address?: string;
  email?: string;
  isSimulated?: boolean;
};

type AttributionEntry = {
  id: number;
  campaignId: number;
  campaignName: string;
  creatorName: string;
  type: "sales" | "clicks" | "dollars";
  amount: number;
  createdAt: string;
  /** Only manual entries can be edited or removed; omit treated as manual */
  source?: "manual";
};

type ShippedProduct = {
  id: number;
  campaignId: number;
  campaignName: string;
  creatorName: string;
  address?: string;
  email?: string;
  productType: "physical" | "digital";
  units: number;
  dateShipped: string;
  trackingLink: string;
  expectedDelivery: string;
};

type Tab = "dashboard" | "campaigns" | "new-campaign" | "creators" | "analytics" | "creator-view" | "settings" | "shipping";

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
  const [showLaunchPreview, setShowLaunchPreview] = useState(false);
  const [launchedCampaignName, setLaunchedCampaignName] = useState("");
  const [showProGate, setShowProGate] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedCreatorDetail, setSelectedCreatorDetail] = useState<string | null>(null);
  const [creatorListTab, setCreatorListTab] = useState<"all" | "my" | "invited" | "applications">("all");
  const [creatorDetailContext, setCreatorDetailContext] = useState<"creators-list" | "campaign" | "standalone" | null>(null);
  const [standaloneProfileReturnTab, setStandaloneProfileReturnTab] = useState<Tab | null>(null);
  const [withdrawInviteConfirm, setWithdrawInviteConfirm] = useState<{ name: string; campaignId: number } | null>(null);
  const [attributionHistory, setAttributionHistory] = useState<AttributionEntry[]>([]);
  const [attributionRemoveConfirm, setAttributionRemoveConfirm] = useState<AttributionEntry | null>(null);
  const [attributionEdit, setAttributionEdit] = useState<{ id: number; type: "sales" | "clicks" | "dollars"; amount: string } | null>(null);
  const [showCampaignAttributionHistory, setShowCampaignAttributionHistory] = useState(false);
  const [campaignGalleryLightbox, setCampaignGalleryLightbox] = useState<{ campaignId: number; imageIndex: number } | null>(null);
  const campaignGalleryTouchStart = useRef<number | null>(null);
  const [attributeError, setAttributeError] = useState(false);
  const [attributeCreator, setAttributeCreator] = useState("");
  const [attributeType, setAttributeType] = useState<"sales" | "clicks" | "dollars">("sales");
  const [attributeValue, setAttributeValue] = useState("");
  const [analyticsDetail, setAnalyticsDetail] = useState<string | null>(null);
  const [subscriptionDetail, setSubscriptionDetail] = useState(false);
  const [brandSimulatedAnalytics, setBrandSimulatedAnalytics] = useState(false);
  const [brandSimGraphData, setBrandSimGraphData] = useState<BrandGraphRow[]>([]);
  const [brandSimEarnings, setBrandSimEarnings] = useState(0);
  const [brandSimClicks, setBrandSimClicks] = useState(0);
  const [brandSimSales, setBrandSimSales] = useState(0);
  const [brandSimRevenue, setBrandSimRevenue] = useState(0);
  const [brandAnalyticsMetric, setBrandAnalyticsMetric] = useState<BrandAnalyticsMetricKey>("earnings");
  const [brandAnalyticsGraphType, setBrandAnalyticsGraphType] = useState<BrandGraphType>("bar");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [showCreatorFilters, setShowCreatorFilters] = useState(false);
  const [creatorFilterPlatform, setCreatorFilterPlatform] = useState<string[]>([]);
  const [creatorFilterMinFollowers, setCreatorFilterMinFollowers] = useState(0);
  const [creatorFilterFollowersInput, setCreatorFilterFollowersInput] = useState("0");
  const [creatorFilterCountry, setCreatorFilterCountry] = useState("");
  const [invitedCreators, setInvitedCreators] = useState<{ name: string; campaignId: number }[]>([]);
  const [inviteCampaignSelect, setInviteCampaignSelect] = useState<string | null>(null);
  const [inviteCampaignId, setInviteCampaignId] = useState<number | null>(null);
  const [blockedCreators, setBlockedCreators] = useState<string[]>([]);
  const [showRemoveCreator, setShowRemoveCreator] = useState<{ name: string; campaignId: number } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState<string | null>(null);
  const [showSimulate, setShowSimulate] = useState(false);
  const [simulateCampaignId, setSimulateCampaignId] = useState<number | null>(null);
  const [showFakeCreator, setShowFakeCreator] = useState(false);
  const [fakeCreatorCampaignId, setFakeCreatorCampaignId] = useState<number | null>(null);
  const [showProductApproval, setShowProductApproval] = useState<Application | null>(null);

  // Shipping
  const [shippedProducts, setShippedProducts] = useState<ShippedProduct[]>([]);
  const [showMarkShipped, setShowMarkShipped] = useState<Application | null>(null);
  const [shippingTrackingLink, setShippingTrackingLink] = useState("");
  const [shippingDeliveryDate, setShippingDeliveryDate] = useState("");
  const [editingShipmentId, setEditingShipmentId] = useState<number | null>(null);

  // Creator view
  const [creatorViewSelected, setCreatorViewSelected] = useState<number | null>(null);

  // Creator View (campaign browsing preview) — mirrors CreatorDashboard feed UI
  type CreatorViewCampaign = {
    id: string;
    brand: string;
    product: string;
    category: string;
    platform: string;
    adPlatforms: string[];
    payMethod: string;
    signOnPay: number;
    isPro: boolean;
    topPick: boolean;
    requireApply: boolean;
    needsProduct: boolean;
    productType: "physical" | "digital";
    websiteUrl?: string;
    productLink?: string;
    description?: string;
    notes?: string;
    productImageCount: number;
    isYours?: boolean;
    imageSrcs?: string[];
    activeCreatorsOnCampaign?: number;
  };

  const [cvFilterCategory, setCvFilterCategory] = useState("");
  const [cvFilterPayType, setCvFilterPayType] = useState("");
  const [cvFilterPlatform, setCvFilterPlatform] = useState<string[]>([]);
  const [cvFilterSignOnPay, setCvFilterSignOnPay] = useState(false);
  const [cvFilterMinSignOnPay, setCvFilterMinSignOnPay] = useState("");
  const [cvShowFilters, setCvShowFilters] = useState(false);
  const [cvSearchQuery, setCvSearchQuery] = useState("");
  const [cvSelectedCampaignId, setCvSelectedCampaignId] = useState<string | null>(null);
  const [cvViewingBrand, setCvViewingBrand] = useState<string | null>(null);
  const [cvLightbox, setCvLightbox] = useState<{ campaignId: string; imageIndex: number } | null>(null);
  const cvTouchStartX = useRef<number | null>(null);

  const [settingsName, setSettingsName] = useState(() => localStorage.getItem("allcall_brand_name") || "");
  const [settingsEmail, setSettingsEmail] = useState(() => localStorage.getItem("allcall_email") || "");
  const [settingsCountry, setSettingsCountry] = useState(() => localStorage.getItem("allcall_country") || "");
  const [settingsPassword, setSettingsPassword] = useState({ current: "", new: "", confirm: "" });
  const [settingsLogo, setSettingsLogo] = useState<string | null>(() => localStorage.getItem("allcall_brand_logo"));

  const savedCategories: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("allcall_categories") || "[]"); } catch { return []; }
  })();
  const defaultCampaignCategory = savedCategories.length > 0 ? (categoryMap[savedCategories[0]] || savedCategories[0]) : "";

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
    adPlatforms: [] as string[],
    websiteUrl: "",
  });

  const [inviteConfirmation, setInviteConfirmation] = useState<string | null>(null);

  const allCreators = [
    { name: "Emily Chen", platform: "TikTok", followers: "89K", followersNum: 89000, category: "Beauty", match: 95, bio: "Beauty and skincare content creator sharing honest reviews and tutorials.", portfolio: [{ url: "https://tiktok.com/@emilychen/video1", description: "Summer skincare routine review" }], platforms: [{ name: "TikTok", followers: "89K" }, { name: "Instagram", followers: "23K" }], totalFollowers: 112000, revenue: 2400, campaigns: 5, sales: 142, clicks: 3200, country: "United States" },
    { name: "Jake Torres", platform: "Instagram", followers: "62K", followersNum: 62000, category: "Health", match: 88, bio: "Fitness enthusiast and wellness advocate. Sharing healthy lifestyle tips.", portfolio: [{ url: "https://instagram.com/jaketorres/reel1", description: "Morning workout routine" }], platforms: [{ name: "Instagram", followers: "62K" }, { name: "YouTube", followers: "18K" }], totalFollowers: 80000, revenue: 1800, campaigns: 3, sales: 95, clicks: 2100, country: "United States" },
    { name: "Priya Sharma", platform: "YouTube", followers: "145K", followersNum: 145000, category: "Tech", match: 82, bio: "Tech reviewer covering the latest gadgets and software.", portfolio: [{ url: "https://youtube.com/priyatech/review1", description: "Latest flagship phone comparison" }], platforms: [{ name: "YouTube", followers: "145K" }, { name: "TikTok", followers: "34K" }], totalFollowers: 179000, revenue: 5200, campaigns: 8, sales: 310, clicks: 7800, country: "United Kingdom" },
    { name: "Maya Lee", platform: "TikTok", followers: "34K", followersNum: 34000, category: "Fashion", match: 78, bio: "Fashion and style creator focusing on affordable outfits and trends.", portfolio: [{ url: "https://tiktok.com/@mayalee/styling", description: "Summer outfit haul" }], platforms: [{ name: "TikTok", followers: "34K" }], totalFollowers: 34000, revenue: 900, campaigns: 2, sales: 48, clicks: 1200, country: "Canada" },
    { name: "Carlos R.", platform: "Instagram", followers: "21K", followersNum: 21000, category: "Fitness", match: 72, bio: "Personal trainer and nutrition coach creating workout content.", portfolio: [], platforms: [{ name: "Instagram", followers: "21K" }, { name: "TikTok", followers: "8K" }], totalFollowers: 29000, revenue: 650, campaigns: 1, sales: 32, clicks: 800, country: "United States" },
  ];

  const getCreatorRelation = (creatorName: string): "active" | "past" | null => {
    for (const c of campaigns) {
      if (c.activeCreators.some((cr) => cr.name === creatorName)) {
        return c.status === "active" ? "active" : "past";
      }
    }
    // Also check accepted applications
    if (applications.some((a) => a.creator === creatorName && a.status === "accepted")) {
      return "active";
    }
    return null;
  };

  // Build a combined list of creators for "my creators" including accepted applicants
  const getMyCreators = () => {
    const myCreatorNames = new Set<string>();
    for (const c of campaigns) {
      for (const cr of c.activeCreators) {
        myCreatorNames.add(cr.name);
      }
    }
    // Also add accepted applications
    for (const a of applications) {
      if (a.status === "accepted") myCreatorNames.add(a.creator);
    }
    return myCreatorNames;
  };

  const parseFollowersNum = (followers: string) => {
    const v = (followers || "").trim().toUpperCase();
    const m = v.match(/^(\d+(\.\d+)?)([KM])?$/);
    if (!m) return 0;
    const n = Number(m[1]);
    const unit = m[3];
    if (unit === "M") return Math.round(n * 1_000_000);
    if (unit === "K") return Math.round(n * 1_000);
    return Math.round(n);
  };

  const myCreatorNames = creatorListTab === "my" ? getMyCreators() : new Set<string>();
  const extraMyCreators = creatorListTab !== "my"
    ? []
    : Array.from(myCreatorNames)
      .filter((name) => !allCreators.some((c) => c.name === name))
      .map((name) => {
        const app = applications.find((a) => a.creator === name) || null;
        const active = campaigns.flatMap((c) => c.activeCreators).find((ac) => ac.name === name) || null;
        const platform = app?.platform || active?.platform || "TikTok";
        const followers = app?.followers || active?.followers || "0";
        const category = app?.category || "General";
        return {
          name,
          platform,
          followers,
          followersNum: parseFollowersNum(followers),
          category,
          match: undefined as number | undefined,
          bio: app?.isSimulated ? "Simulated creator profile." : "Creator profile.",
          portfolio: [] as { url: string; description: string }[],
          platforms: [{ name: platform, followers }],
          totalFollowers: parseFollowersNum(followers),
          revenue: 0,
          campaigns: 0,
          sales: 0,
          clicks: 0,
          country: app?.isSimulated ? "Simulated" : "—",
        };
      });

  const creatorPool =
    creatorListTab === "my"
      ? [...allCreators.filter((c) => myCreatorNames.has(c.name)), ...extraMyCreators]
      : creatorListTab === "all"
        ? allCreators
        : [];

  const filteredCreators = creatorPool.filter((cr) => {
    if (blockedCreators.includes(cr.name)) return false;
    if (creatorSearch && !cr.name.toLowerCase().includes(creatorSearch.toLowerCase())) return false;
    if (creatorFilterPlatform.length > 0 && !creatorFilterPlatform.includes(cr.platform)) return false;
    if (creatorFilterMinFollowers > 0 && (cr.followersNum || 0) < creatorFilterMinFollowers) return false;
    if (creatorFilterCountry && cr.country !== creatorFilterCountry) return false;
    return true;
  });

  const getActiveCampaignNamesForCreator = (creatorName: string) =>
    campaigns.filter((c) => c.activeCreators.some((ac) => ac.name === creatorName)).map((c) => c.name);

  const sidebarItems: { key: Tab; label: string; icon: any; pro?: boolean }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "campaigns", label: "Campaigns", icon: Package },
    { key: "new-campaign", label: "New Campaign", icon: Plus },
    { key: "creators", label: "Creators", icon: Users, pro: true },
    { key: "shipping", label: "Shipping", icon: Truck },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "creator-view", label: "Creator View", icon: Eye },
    { key: "settings", label: "Settings", icon: Settings },
  ];

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
      const campaign = campaigns.find((c) => c.id === app.campaignId);
      if (campaign?.paidProduct) {
        setShowProductApproval(app);
        return prev;
      }
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

  const confirmProductApproval = () => {
    if (!showProductApproval) return;
    const app = showProductApproval;
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
    setApplications((prev) => prev.map((a) => a.id === app.id ? { ...a, status: "accepted" as const } : a));
    setShowProductApproval(null);
    // Show mark as shipped dialog
    setShowMarkShipped(app);
  };

  const handleMarkAsShipped = () => {
    if (!showMarkShipped) return;
    const campaign = campaigns.find((c) => c.id === showMarkShipped.campaignId);
    const newShipment: ShippedProduct = {
      id: Date.now(),
      campaignId: showMarkShipped.campaignId,
      campaignName: campaign?.name || showMarkShipped.campaignName,
      creatorName: showMarkShipped.creator,
      address: showMarkShipped.address,
      email: showMarkShipped.email,
      productType: campaign?.productType || "physical",
      units: 1,
      dateShipped: new Date().toLocaleDateString(),
      trackingLink: shippingTrackingLink,
      expectedDelivery: shippingDeliveryDate,
    };
    setShippedProducts((prev) => [...prev, newShipment]);
    setShowMarkShipped(null);
    setShippingTrackingLink("");
    setShippingDeliveryDate("");
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

  const buildCampaignFromForm = (): Campaign => ({
    id: editingCampaignId || Date.now(),
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
    notes: campaignForm.notes,
    discount: campaignForm.discount,
    creatorCode: campaignForm.creatorCode,
    paidProduct: campaignForm.paidProduct,
    productType: campaignForm.productType,
    adPlatforms: campaignForm.adPlatforms,
    filterFollowers: campaignForm.filterFollowers,
    minFollowers: campaignForm.minFollowers,
    followerFilterType: campaignForm.followerFilterType,
    filterCategories: campaignForm.filterCategories,
    websiteUrl: campaignForm.websiteUrl,
  });

  const handleShowLaunchPreview = () => {
    setShowLaunchPreview(true);
  };

  const handleConfirmLaunch = () => {
    const newCampaign = buildCampaignFromForm();
    if (editingCampaignId) {
      setCampaigns((prev) => prev.map((c) => c.id === editingCampaignId ? { ...newCampaign, activeCreators: c.activeCreators } : c));
      setEditingCampaignId(null);
    } else {
      setCampaigns((prev) => [...prev, newCampaign]);
    }
    setLaunchedCampaignName(newCampaign.name);
    setShowLaunchPreview(false);
    setShowLaunchSuccess(true);
    resetCampaignForm();
  };

  const resetCampaignForm = () => {
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
      adPlatforms: [],
      websiteUrl: "",
    });
  };

  const handleLaunchCampaign = () => {
    handleShowLaunchPreview();
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaignId(campaign.id);
    let payMethod: "commission" | "flat" | "hybrid" = "hybrid";
    let commissionRate = "5", flatRate = "5", flatPer = "100";
    if (campaign.payMethod.startsWith("Hybrid")) {
      payMethod = "hybrid";
      const match = campaign.payMethod.match(/(\d+)%.*\$(\d+)\/(\d+)/);
      if (match) { commissionRate = match[1]; flatRate = match[2]; flatPer = match[3]; }
    } else if (campaign.payMethod.startsWith("Commission")) {
      payMethod = "commission";
      const match = campaign.payMethod.match(/(\d+)%/);
      if (match) commissionRate = match[1];
    } else {
      payMethod = "flat";
      const match = campaign.payMethod.match(/\$(\d+)\/(\d+)/);
      if (match) { flatRate = match[1]; flatPer = match[2]; }
    }
    setCampaignForm({
      name: campaign.name,
      category: campaign.category,
      description: campaign.description,
      link: campaign.link,
      notes: campaign.notes || "",
      creatorCode: campaign.creatorCode ?? true,
      discount: campaign.discount || "10",
      payMethod,
      commissionRate, flatRate, flatPer,
      requireApply: campaign.requireApply,
      paidProduct: campaign.paidProduct || false,
      productType: campaign.productType || "physical",
      photos: campaign.images || [],
      platforms: campaign.platforms,
      filterFollowers: campaign.filterFollowers || false,
      minFollowers: campaign.minFollowers || 1000,
      followerFilterType: campaign.followerFilterType || [],
      filterCategories: campaign.filterCategories || [],
      signOnPay: campaign.signOnPay > 0 ? String(campaign.signOnPay) : "",
      adPlatforms: campaign.adPlatforms || [],
      websiteUrl: campaign.websiteUrl || "",
    });
    setTab("new-campaign");
    setMenuOpenId(null);
  };

  const handleInviteCreator = (name: string) => {
    setInviteCampaignId(null);
    setInviteCampaignSelect(name);
  };

  const getInviteEligibleCampaigns = (creatorName: string) => {
    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    return activeCampaigns.filter((c) => {
      const alreadyInCampaign = c.activeCreators.some((cr) => cr.name === creatorName);
      if (alreadyInCampaign) return false;
      const alreadyInvitedToCampaign = invitedCreators.some((ic) => ic.name === creatorName && ic.campaignId === c.id);
      if (alreadyInvitedToCampaign) return false;
      return true;
    });
  };

  const buildSampleSimulatedProfile = (name: string, primaryPlatform: string, followers: string, category: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const first = name.split(" ")[0] || name;
    const platformKey = primaryPlatform.toLowerCase().includes("insta")
      ? "instagram"
      : primaryPlatform.toLowerCase().includes("you")
        ? "youtube"
        : primaryPlatform.toLowerCase().includes("twitter") || primaryPlatform.toLowerCase().includes("x")
          ? "x"
          : "tiktok";

    const bio = `Hi! I’m ${first} — a ${category.toLowerCase()} creator focused on clean storytelling, product-first demos, and high-retention hooks. I love working with brands that care about quality and long-term partnerships.`;

    const socials = [
      { platform: primaryPlatform, url: `https://${platformKey}.com/@${slug || "creator"}` },
      { platform: "Instagram", url: `https://instagram.com/${slug || "creator"}` },
      { platform: "YouTube", url: `https://youtube.com/@${slug || "creator"}` },
    ];

    const portfolio = [
      { url: `https://${platformKey}.com/@${slug || "creator"}/video1`, description: "UGC product demo with hook + benefits + CTA" },
      { url: `https://${platformKey}.com/@${slug || "creator"}/video2`, description: "Before/after style content with results + testimonial" },
      { url: `https://${platformKey}.com/@${slug || "creator"}/video3`, description: "Unboxing + first impressions + brand mentions" },
    ];

    return {
      bio,
      socials,
      portfolio,
      platforms: [
        { name: primaryPlatform, followers },
        { name: "Instagram", followers: "18K" },
        { name: "YouTube", followers: "7K" },
      ],
      stats: {
        avgViews: "22K",
        avgEngagement: "4.8%",
        turnaround: "3-5 days",
      },
    };
  };

  const confirmInvite = () => {
    if (!inviteCampaignSelect || !inviteCampaignId) return;
    setInvitedCreators((prev) => [...prev, { name: inviteCampaignSelect, campaignId: inviteCampaignId }]);
    setInviteConfirmation(inviteCampaignSelect);
    setInviteCampaignSelect(null);
    setInviteCampaignId(null);
    setTimeout(() => setInviteConfirmation(null), 3000);
  };

  const commitWithdrawInvite = () => {
    if (!withdrawInviteConfirm) return;
    const { name, campaignId } = withdrawInviteConfirm;
    setInvitedCreators((prev) => prev.filter((ic) => !(ic.name === name && ic.campaignId === campaignId)));
    setWithdrawInviteConfirm(null);
  };

  const renderInvitedCreatorsSectionForProfile = (creatorName: string) => {
    const rows = invitedCreators.filter((ic) => ic.name === creatorName);
    if (rows.length === 0) return null;
    return (
      <div>
        <h3 className="font-display font-semibold text-foreground mb-2">Invited creators</h3>
        <p className="text-xs text-muted-foreground mb-3">Campaigns you invited this creator to (same as your Invited Creators tab).</p>
        <div className="space-y-2">
          {rows.map((ic) => {
            const camp = campaigns.find((x) => x.id === ic.campaignId);
            const joined = camp?.activeCreators.some((a) => a.name === creatorName);
            return (
              <div key={`${ic.name}-${ic.campaignId}`} className="p-3 rounded-xl border border-border dark-green-outline flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground text-sm">{camp?.name || "Campaign"}</p>
                  <p className="text-xs text-muted-foreground">{joined ? "Joined this campaign" : "Waiting to join"}</p>
                </div>
                <Badge variant={joined ? "default" : "outline"}>{joined ? "Active" : "Pending"}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleRemoveCreatorFromCampaign = (creatorName: string, campaignId: number) => {
    setCampaigns((prev) => prev.map((c) =>
      c.id === campaignId ? { ...c, activeCreators: c.activeCreators.filter((cr) => cr.name !== creatorName) } : c
    ));
    setShowRemoveCreator(null);
  };

  const handleBlockCreator = (name: string) => {
    setBlockedCreators((prev) => [...prev, name]);
    setCampaigns((prev) => prev.map((c) => ({
      ...c,
      activeCreators: c.activeCreators.filter((cr) => cr.name !== name),
    })));
    setShowBlockConfirm(null);
    setSelectedCreatorDetail(null);
  };

  const handleSimulateApplication = () => {
    if (!simulateCampaignId) return;
    const campaign = campaigns.find((c) => c.id === simulateCampaignId);
    if (!campaign) return;
    const fakeNames = ["Alex Johnson", "Sam Williams", "Jordan Lee", "Taylor Brown", "Morgan Davis", "Casey Park", "Drew Nguyen", "Skyler Adams"];
    const fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const fakePlatforms = ["TikTok", "Instagram", "YouTube", "Twitter/X"];
    const fakeCategories = ["Beauty", "Health", "Tech", "Fashion", "Food", "Sports", "Travel", "Home"];
    const fakePlatform = fakePlatforms[Math.floor(Math.random() * fakePlatforms.length)];
    const fakeCategory = fakeCategories[Math.floor(Math.random() * fakeCategories.length)];
    const newApp: Application = {
      id: Date.now(),
      creator: fakeName,
      platform: fakePlatform,
      followers: `${Math.floor(Math.random() * 100 + 10)}K`,
      category: fakeCategory,
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: "pending",
      address: campaign.paidProduct && campaign.productType === "physical" ? `${Math.floor(Math.random() * 9000 + 1000)} Oak St, ${["Los Angeles", "New York", "Chicago", "Austin"][Math.floor(Math.random() * 4)]}, ${["CA", "NY", "IL", "TX"][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 90000 + 10000)}` : undefined,
      email: campaign.paidProduct && campaign.productType === "digital" ? `${fakeName.toLowerCase().replace(" ", ".")}@email.com` : undefined,
      isSimulated: true,
    };
    setApplications((prev) => [...prev, newApp]);
    setShowSimulate(false);
    setSimulateCampaignId(null);
  };

  const handleCreateFakeCreator = () => {
    if (!fakeCreatorCampaignId) return;
    const fakeFirstNames = ["Riley", "Avery", "Quinn", "Harper", "Sage", "River", "Blake", "Jamie", "Rowan", "Finley", "Dakota", "Reese"];
    const fakeLastNames = ["Martinez", "Clark", "Thompson", "Wilson", "Chen", "Patel", "Kim", "Santos", "Nakamura", "Okafor"];
    const fakeName = `${fakeFirstNames[Math.floor(Math.random() * fakeFirstNames.length)]} ${fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)]}`;
    const allPlatforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook"];
    const fakePlatform = allPlatforms[Math.floor(Math.random() * 3)]; // primary
    const fakeFollowersNum = Math.floor(Math.random() * 200 + 5);
    const fakeClicks = Math.floor(Math.random() * 5000 + 100);
    const fakeSales = Math.floor(Math.random() * 200 + 5);
    const fakeEarnings = Math.floor(Math.random() * 2000 + 50);

    // Add to campaign
    setCampaigns((prev) => prev.map((c) => {
      if (c.id === fakeCreatorCampaignId) {
        return {
          ...c,
          activeCreators: [
            ...c.activeCreators,
            { name: fakeName, platform: fakePlatform, followers: `${fakeFollowersNum}K`, clicks: fakeClicks, sales: fakeSales, earnings: fakeEarnings, isTestCreator: true },
          ],
        };
      }
      return c;
    }));

    setShowFakeCreator(false);
    setFakeCreatorCampaignId(null);
  };

  const handleClearSimulatedApplications = () => {
    setApplications((prev) => prev.filter((a) => !a.isSimulated));
  };

  const handleClearSimulatedCreators = () => {
    const simulatedAcceptedNames = new Set(applications.filter((a) => a.isSimulated && a.status === "accepted").map((a) => a.creator));
    setCampaigns((prev) => prev.map((c) => ({
      ...c,
      activeCreators: c.activeCreators.filter((cr) => !cr.isTestCreator && !simulatedAcceptedNames.has(cr.name)),
    })));
    setApplications((prev) => prev.filter((a) => !(a.isSimulated && a.status === "accepted")));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("allcall_brand_name", settingsName);
    localStorage.setItem("allcall_email", settingsEmail);
    localStorage.setItem("allcall_country", settingsCountry);
    if (settingsLogo) localStorage.setItem("allcall_brand_logo", settingsLogo);
    else localStorage.removeItem("allcall_brand_logo");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSettingsLogo(URL.createObjectURL(file));
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
    setShowLaunchPreview(false);
    setMenuOpenId(null);
    setSelectedCampaignId(null);
    setSelectedCreatorDetail(null);
    setEditingCampaignId(null);
    setAnalyticsDetail(null);
    setSubscriptionDetail(false);
    setCreatorViewSelected(null);
    setStandaloneProfileReturnTab(null);
    setCreatorDetailContext(null);
    setShowCampaignAttributionHistory(false);
  };

  const handleDeleteCampaign = (id: number) => {
    setShowDeleteConfirm(id);
    setMenuOpenId(null);
  };

  const confirmDelete = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setShowDeleteConfirm(null);
    setSelectedCampaignId(null);
  };

  const handleDeactivateCampaign = (id: number) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "deactivated" : "active" } : c));
    setMenuOpenId(null);
  };

  const handleAttributeSales = () => {
    if (!attributeCreator || !selectedCampaignId) {
      setAttributeError(true);
      return;
    }
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign || !campaign.activeCreators.some((cr) => cr.name === attributeCreator)) {
      setAttributeError(true);
      return;
    }
    const raw = attributeValue.trim();
    const n = Number(raw);
    if (!raw || !Number.isFinite(n) || n <= 0) {
      setAttributeError(true);
      return;
    }
    const delta = attributeType === "dollars" ? Math.round(n * 100) / 100 : Math.round(n);

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCampaignId) return c;
        return {
          ...c,
          activeCreators: c.activeCreators.map((cr) => {
            if (cr.name !== attributeCreator) return cr;
            if (attributeType === "clicks") return { ...cr, clicks: cr.clicks + delta };
            if (attributeType === "sales") return { ...cr, sales: cr.sales + delta };
            return { ...cr, earnings: cr.earnings + delta };
          }),
        };
      }),
    );

    setAttributionHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        campaignId: selectedCampaignId,
        campaignName: campaign.name,
        creatorName: attributeCreator,
        type: attributeType,
        amount: delta,
        createdAt: new Date().toISOString(),
        source: "manual",
      },
    ]);

    setAttributeError(false);
    setAttributeCreator("");
    setAttributeValue("");
  };

  const isManualAttribution = (e: AttributionEntry) => !e.source || e.source === "manual";

  const applyCreatorAttributionDelta = (
    cr: Campaign["activeCreators"][number],
    type: "sales" | "clicks" | "dollars",
    delta: number,
    sign: 1 | -1,
  ) => {
    const d = sign * delta;
    if (type === "clicks") return { ...cr, clicks: Math.max(0, cr.clicks + d) };
    if (type === "sales") return { ...cr, sales: Math.max(0, cr.sales + d) };
    return { ...cr, earnings: Math.max(0, cr.earnings + d) };
  };

  const removeAttributionEntry = (entry: AttributionEntry) => {
    if (!isManualAttribution(entry)) return;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== entry.campaignId) return c;
        if (!c.activeCreators.some((cr) => cr.name === entry.creatorName)) return c;
        return {
          ...c,
          activeCreators: c.activeCreators.map((cr) =>
            cr.name !== entry.creatorName ? cr : applyCreatorAttributionDelta(cr, entry.type, entry.amount, -1),
          ),
        };
      }),
    );
    setAttributionHistory((prev) => prev.filter((x) => x.id !== entry.id));
  };

  const saveAttributionEdit = () => {
    if (!attributionEdit) return;
    const entry = attributionHistory.find((x) => x.id === attributionEdit.id);
    if (!entry || !isManualAttribution(entry)) return;
    const camp = campaigns.find((c) => c.id === entry.campaignId);
    if (!camp?.activeCreators.some((cr) => cr.name === entry.creatorName)) return;
    const raw = attributionEdit.amount.trim();
    const n = Number(raw);
    if (!raw || !Number.isFinite(n) || n <= 0) return;
    const rounded = attributionEdit.type === "dollars" ? Math.round(n * 100) / 100 : Math.round(n);

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== entry.campaignId) return c;
        return {
          ...c,
          activeCreators: c.activeCreators.map((cr) => {
            if (cr.name !== entry.creatorName) return cr;
            let next = applyCreatorAttributionDelta(cr, entry.type, entry.amount, -1);
            next = applyCreatorAttributionDelta(next, attributionEdit.type, rounded, 1);
            return next;
          }),
        };
      }),
    );

    setAttributionHistory((prev) =>
      prev.map((x) =>
        x.id === entry.id ? { ...x, type: attributionEdit.type, amount: rounded, source: "manual" as const } : x,
      ),
    );
    setAttributionEdit(null);
  };

  const closeCreatorProfile = () => {
    setSelectedCreatorDetail(null);
    setCreatorDetailContext(null);
    if (standaloneProfileReturnTab !== null) {
      setTab(standaloneProfileReturnTab);
      setStandaloneProfileReturnTab(null);
    }
  };

  const openCreatorStandaloneProfile = (creatorName: string, returnTab: Tab) => {
    setSelectedCreatorDetail(creatorName);
    setCreatorDetailContext("standalone");
    setStandaloneProfileReturnTab(returnTab);
    setTab("creators");
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    if (!cvLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCvLightbox(null);
        return;
      }
      setCvLightbox((prev) => {
        if (!prev) return null;
        const camp = creatorViewCampaigns.find((x) => x.id === prev.campaignId);
        const n = Math.max(1, camp?.productImageCount ?? 1);
        if (e.key === "ArrowRight") return { ...prev, imageIndex: (prev.imageIndex + 1) % n };
        if (e.key === "ArrowLeft") return { ...prev, imageIndex: (prev.imageIndex - 1 + n) % n };
        return prev;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvLightbox]);

  useEffect(() => {
    if (!campaignGalleryLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCampaignGalleryLightbox(null);
        return;
      }
      setCampaignGalleryLightbox((prev) => {
        if (!prev) return null;
        const camp = campaigns.find((x) => x.id === prev.campaignId);
        const imgs = camp?.images?.length ? camp.images : [];
        const n = Math.max(1, imgs.length);
        if (e.key === "ArrowRight") return { ...prev, imageIndex: (prev.imageIndex + 1) % n };
        if (e.key === "ArrowLeft") return { ...prev, imageIndex: (prev.imageIndex - 1 + n) % n };
        return prev;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [campaignGalleryLightbox, campaigns]);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const todayStr = new Date().toISOString().split("T")[0];

  const exampleCreatorCampaigns = [
    { name: "Hydra Glow Moisturizer", brand: "GlowSkin Co.", category: "Beauty", adPlatforms: ["TikTok", "Instagram"], payMethod: "Hybrid: 6% + $8/100 clicks", signOnPay: 30, isPro: true, requireApply: true, description: "Promote our bestselling moisturizer to your audience with honest reviews.", notes: "Use #GlowSkin and #HydraGlow in your posts", websiteUrl: "https://glowskin.co" },
    { name: "ProFit Protein Shake", brand: "FitLife Labs", category: "Health", adPlatforms: ["Instagram"], payMethod: "Commission: 10%", signOnPay: 0, isPro: false, requireApply: false, description: "Share your fitness journey with our protein shake.", notes: "", websiteUrl: "https://fitlifelabs.com" },
    { name: "AirPod Max Clone", brand: "TechBuddy", category: "Tech", adPlatforms: ["YouTube", "TikTok", "Instagram"], payMethod: "Flat: $15/100 clicks", signOnPay: 50, isPro: true, requireApply: true, description: "Review our premium wireless headphones.", notes: "Focus on sound quality and comfort", websiteUrl: "https://techbuddy.io" },
    { name: "Cozy Candle Set", brand: "HomeNest", category: "Home", adPlatforms: ["TikTok"], payMethod: "Commission: 5%", signOnPay: 0, isPro: false, requireApply: false, description: "Feature our artisan candle collection in your lifestyle content.", notes: "", websiteUrl: "" },
    { name: "Bamboo Water Bottle", brand: "EcoLife", category: "Health", adPlatforms: ["Instagram", "YouTube"], payMethod: "Hybrid: 4% + $5/100 clicks", signOnPay: 15, isPro: true, requireApply: true, description: "Eco-friendly hydration for the conscious consumer.", notes: "Highlight sustainability angle", websiteUrl: "https://ecolife.com" },
    { name: "Wireless Charger Pad", brand: "ChargePro", category: "Tech", adPlatforms: ["YouTube"], payMethod: "Flat: $12/100 clicks", signOnPay: 0, isPro: false, requireApply: true, description: "Showcase our fast wireless charging technology.", notes: "", websiteUrl: "" },
  ];

  const cardClass = "p-5 rounded-2xl bg-card border border-border shadow-card dark-green-outline";
  const sectionCardClass = "bg-card border border-border rounded-2xl p-6 shadow-card dark-green-outline";

  const getBrandTotalsFromCampaigns = () => {
    let earnings = 0;
    let clicks = 0;
    let sales = 0;
    for (const c of campaigns) {
      for (const cr of c.activeCreators) {
        earnings += cr.earnings;
        clicks += cr.clicks;
        sales += cr.sales;
      }
    }
    const revenue = Math.round(sales * 38 + earnings * 2);
    return { earnings, clicks, sales, revenue };
  };

  const brandGraphData = useMemo(() => {
    if (brandSimulatedAnalytics && brandSimGraphData.length > 0) return brandSimGraphData;
    return distributeBrandTotals(getBrandTotalsFromCampaigns());
  }, [campaigns, brandSimulatedAnalytics, brandSimGraphData]);

  const brandDisplayTotals = useMemo(() => {
    if (brandSimulatedAnalytics) {
      return {
        earnings: brandSimEarnings,
        clicks: brandSimClicks,
        sales: brandSimSales,
        revenue: brandSimRevenue,
      };
    }
    return getBrandTotalsFromCampaigns();
  }, [campaigns, brandSimulatedAnalytics, brandSimEarnings, brandSimClicks, brandSimSales, brandSimRevenue]);

  const handleSimulateBrandAnalytics = () => {
    const earnings = Math.floor(Math.random() * 8000 + 800);
    const clicks = Math.floor(Math.random() * 12000 + 1200);
    const sales = Math.floor(Math.random() * 240 + 24);
    const revenue = Math.floor(Math.random() * 24000 + 2400);
    setBrandSimEarnings(earnings);
    setBrandSimClicks(clicks);
    setBrandSimSales(sales);
    setBrandSimRevenue(revenue);
    setBrandSimulatedAnalytics(true);
    const graphData = BRAND_ANALYTICS_MONTHS.map((month) => ({
      month,
      earnings: Math.floor(Math.random() * (earnings / 3)),
      clicks: Math.floor(Math.random() * (clicks / 3)),
      sales: Math.floor(Math.random() * Math.max(sales / 3, 1)),
      revenue: Math.floor(Math.random() * (revenue / 3)),
    }));
    setBrandSimGraphData(graphData);
  };

  const formatBrandMetricValue = (metricKey: BrandAnalyticsMetricKey, v: number) => {
    if (metricKey === "earnings" || metricKey === "revenue") return `$${Math.round(v).toLocaleString()}`;
    return `${Math.round(v).toLocaleString()}`;
  };

  const niceMaxBrand = (max: number) => {
    if (!isFinite(max) || max <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / pow;
    const mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return mult * pow;
  };

  const brandChartHasData = brandSimulatedAnalytics || campaigns.length > 0;

  const renderBrandAnalyticsGraph = (metricKey: BrandAnalyticsMetricKey, data: BrandGraphRow[], graphType: BrandGraphType) => {
    if (!brandChartHasData) {
      return (
        <div className="h-64 rounded-xl bg-muted/30 flex items-center justify-center border border-border dark-green-outline">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Launch a campaign or use Simulate Analytics to see sample data</p>
          </div>
        </div>
      );
    }

    const metricColorMap: Record<BrandAnalyticsMetricKey, { bar: string; stroke: string }> = {
      earnings: { bar: "bg-primary/80 dark:bg-primary", stroke: "stroke-primary" },
      clicks: { bar: "bg-blue-500/80 dark:bg-blue-400", stroke: "stroke-blue-500 dark:stroke-blue-400" },
      sales: { bar: "bg-orange-500/80 dark:bg-orange-400", stroke: "stroke-orange-500 dark:stroke-orange-400" },
      revenue: { bar: "bg-purple-500/80 dark:bg-purple-400", stroke: "stroke-purple-500 dark:stroke-purple-400" },
    };

    const values = data.map((x) => x[metricKey] ?? 0);
    const maxVal = niceMaxBrand(Math.max(...values, 1));
    const yTicks = 5;
    const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal * (yTicks - i)) / yTicks);

    const chartHeight = 208;
    const chartWidth = 640;
    const padLeft = 54;
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
              <path key={p.key} d={p.d} fill={p.fill} className="stroke-border" strokeWidth={1} vectorEffect="non-scaling-stroke" />
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
                  <div className="text-foreground font-medium">{formatBrandMetricValue(metricKey, s.v)}</div>
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
          {tickVals.map((tv, idx) => {
            const y = padTop + (idx * plotH) / yTicks;
            return (
              <g key={idx}>
                <line x1={padLeft} x2={chartWidth - padRight} y1={y} y2={y} className="stroke-border/70" strokeWidth={1} />
                <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="12" className="fill-muted-foreground">
                  {formatBrandMetricValue(metricKey, tv)}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => (
            <text
              key={d.month}
              x={xFor(i)}
              y={padTop + plotH + 22}
              textAnchor="middle"
              fontSize="12"
              className="fill-muted-foreground"
            >
              {d.month}
            </text>
          ))}

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

          {graphType === "line" && (
            <>
              <polyline fill="none" strokeWidth="3" className={metricColorMap[metricKey].stroke} points={linePoints} />
              {values.map((v, i) => (
                <circle
                  key={i}
                  cx={xFor(i)}
                  cy={yFor(v)}
                  r="4.5"
                  strokeWidth="3"
                  className={`fill-background ${metricColorMap[metricKey].stroke}`}
                />
              ))}
            </>
          )}
        </svg>
      </div>
    );
  };

  const creatorViewCampaigns: CreatorViewCampaign[] = [
    ...activeCampaigns.map((c) => {
      const hasImages = !!(c.images && c.images.length > 0);
      const imgCount = Math.max(1, hasImages ? c.images!.length : ((c.images?.length || 0) || 2));
      return {
        id: `brand:${c.id}`,
        brand: settingsName || "Your Brand",
        product: c.name,
        category: c.category,
        platform: (c.adPlatforms?.[0] || c.platforms?.[0] || "TikTok"),
        adPlatforms: (c.adPlatforms && c.adPlatforms.length > 0 ? c.adPlatforms : (c.platforms || ["TikTok"])),
        payMethod: c.payMethod,
        signOnPay: c.signOnPay || 0,
        isPro: plan === "pro",
        topPick: true,
        requireApply: !!c.requireApply,
        needsProduct: !!c.paidProduct,
        productType: (c.productType || "physical"),
        websiteUrl: c.websiteUrl,
        productLink: c.link,
        description: c.description,
        notes: c.notes,
        productImageCount: imgCount,
        isYours: true,
        imageSrcs: hasImages ? c.images : undefined,
        activeCreatorsOnCampaign: c.activeCreators.length,
      };
    }),
    ...exampleCreatorCampaigns.map((c, i) => ({
      id: `example:${i}`,
      brand: c.brand,
      product: c.name,
      category: c.category,
      platform: (c.adPlatforms?.[0] || "TikTok"),
      adPlatforms: c.adPlatforms || ["TikTok"],
      payMethod: c.payMethod,
      signOnPay: c.signOnPay || 0,
      isPro: !!c.isPro,
      topPick: false,
      requireApply: !!c.requireApply,
      needsProduct: true,
      productType: "physical" as const,
      websiteUrl: c.websiteUrl,
      productLink: "",
      description: c.description,
      notes: c.notes,
      productImageCount: 3,
      activeCreatorsOnCampaign: [14, 9, 22, 6, 18, 11, 20, 5, 12, 15, 8][i % 11],
    })),
  ];

  const cvGetPayType = (method: string) => {
    if (method.startsWith("Hybrid")) return "hybrid";
    if (method.startsWith("Commission")) return "commission";
    return "flat";
  };

  const cvFilteredCampaigns = creatorViewCampaigns.filter((c) => {
    if (cvFilterCategory && c.category !== cvFilterCategory) return false;
    if (cvSearchQuery && !c.product.toLowerCase().includes(cvSearchQuery.toLowerCase()) && !c.brand.toLowerCase().includes(cvSearchQuery.toLowerCase())) return false;
    if (cvFilterPayType && cvGetPayType(c.payMethod) !== cvFilterPayType) return false;
    if (cvFilterPlatform.length > 0 && !cvFilterPlatform.includes(c.platform) && !(c.adPlatforms && c.adPlatforms.some((p: string) => cvFilterPlatform.includes(p)))) return false;
    if (cvFilterSignOnPay && c.signOnPay <= 0) return false;
    if (cvFilterSignOnPay && cvFilterMinSignOnPay && c.signOnPay < Number(cvFilterMinSignOnPay)) return false;
    if (cvViewingBrand && c.brand !== cvViewingBrand) return false;
    return true;
  }).sort((a, b) => {
    if (a.topPick !== b.topPick) return a.topPick ? -1 : 1;
    if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
    return 0;
  });

  const CvBrandLogoMark = ({ brand, size = "w-14 h-14", textClassName = "text-lg", logoUrl }: { brand: string; size?: string; textClassName?: string; logoUrl?: string | null }) =>
    logoUrl ? (
      <div className={`${size} rounded-xl overflow-hidden border border-border shrink-0`} aria-hidden>
        <img src={logoUrl} alt="" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className={`${size} rounded-xl bg-primary/10 border border-border flex items-center justify-center shrink-0`} aria-hidden>
        <span className={`font-display font-bold text-primary select-none ${textClassName}`}>{brand[0]?.toUpperCase() ?? "?"}</span>
      </div>
    );

  const CvCampaignThumb = ({ campaign }: { campaign: CreatorViewCampaign }) => {
    const first = campaign.imageSrcs?.[0];
    if (first) {
      return (
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0">
          <img src={first} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    return <CvBrandLogoMark brand={campaign.brand} logoUrl={campaign.isYours ? brandLogo : undefined} />;
  };

  const CvCampaignProductGallery = ({ campaign }: { campaign: CreatorViewCampaign }) => {
    const n = Math.max(1, campaign.productImageCount);
    const hasReal = !!(campaign.imageSrcs && campaign.imageSrcs.length > 0);
    return (
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Product</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {hasReal
              ? "Your campaign photos as creators see them. Tap an image to enlarge; swipe or use arrows to browse."
              : "Sample placeholders show where brand photos will appear. Tap an image to enlarge; swipe or use arrows to browse."}
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
          {Array.from({ length: n }, (_, i) => {
            const src = campaign.imageSrcs?.[i];
            return (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCvLightbox({ campaignId: campaign.id, imageIndex: i });
                }}
                className={`snap-start shrink-0 w-[min(100%,280px)] aspect-[4/3] rounded-xl border border-border bg-background overflow-hidden hover:opacity-95 transition-opacity ${src ? "" : "border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted/50"}`}
              >
                {src ? (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Image {i + 1}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const availableFollowerPlatforms = campaignForm.adPlatforms.length > 0 ? [...campaignForm.adPlatforms, "total"] : ["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook", "total"];

  const brandLogo = settingsLogo;
  const brandWebsite = localStorage.getItem("allcall_brand_website") || "";

  const renderCampaignMenu = (campaign: Campaign, menuKey: number) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setMenuOpenId(menuOpenId === menuKey ? null : menuKey)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
      {menuOpenId === menuKey && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-44 overflow-hidden">
          <button onClick={() => handleEditCampaign(campaign)} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">Edit Campaign</button>
          <button onClick={() => handleDeactivateCampaign(campaign.id)} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">{campaign.status === "active" ? "Deactivate" : "Activate"}</button>
          <button onClick={() => handleDeleteCampaign(campaign.id)} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Delete Campaign</button>
        </motion.div>
      )}
    </div>
  );

  const renderCampaignCard = (c: Campaign, showBrandLogo = true) => (
    <div className="flex items-center gap-4">
      {c.images && c.images.length > 0 ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={c.images[0]} alt="" className="w-full h-full object-cover" /></div>
      ) : showBrandLogo && brandLogo ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
      ) : (
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{(settingsName || "B")[0]}</div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-lg text-foreground">{c.name}</h3>
          {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0">${c.signOnPay} sign-on pay</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{c.category} · {c.activeCreators.length} active creators · {c.adPlatforms && c.adPlatforms.length > 1 ? "Multiple Platforms" : c.adPlatforms?.[0] || c.platforms?.[0] || "All"} · {c.payMethod}</p>
      </div>
    </div>
  );

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
      {/* Delete confirmation */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Delete Campaign?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. The campaign and all its data will be permanently deleted.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="destructive" onClick={() => confirmDelete(showDeleteConfirm)}>Delete Permanently</Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showRemoveCreator && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowRemoveCreator(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <UserX className="w-10 h-10 text-warning mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Remove Creator?</h3>
            <p className="text-sm text-muted-foreground mb-6">Remove {showRemoveCreator.name} from this campaign?</p>
            <div className="flex gap-3 justify-center">
              <Button variant="destructive" onClick={() => handleRemoveCreatorFromCampaign(showRemoveCreator.name, showRemoveCreator.campaignId)}>Remove</Button>
              <Button variant="outline" onClick={() => setShowRemoveCreator(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowBlockConfirm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <Ban className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Block Creator?</h3>
            <p className="text-sm text-muted-foreground mb-6">{showBlockConfirm} will be removed from all your campaigns and won't be able to view your campaigns anymore.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="destructive" onClick={() => handleBlockCreator(showBlockConfirm)}>Block</Button>
              <Button variant="outline" onClick={() => setShowBlockConfirm(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      <AlertDialog open={!!withdrawInviteConfirm} onOpenChange={(open) => !open && setWithdrawInviteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Withdraw invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              {withdrawInviteConfirm && (
                <>
                  Remove the invitation for <span className="font-medium text-foreground">{withdrawInviteConfirm.name}</span> to join{" "}
                  <span className="font-medium text-foreground">{campaigns.find((c) => c.id === withdrawInviteConfirm.campaignId)?.name || "this campaign"}</span>? They will no longer see this invite.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={commitWithdrawInvite}>
              Withdraw invite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {inviteCampaignSelect && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => { setInviteCampaignSelect(null); setInviteCampaignId(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Invite {inviteCampaignSelect}</h3>
            {(() => {
              const eligible = getInviteEligibleCampaigns(inviteCampaignSelect);
              const activeCampaigns = campaigns.filter((c) => c.status === "active");
              if (activeCampaigns.length === 0) {
                return (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Create a campaign to start inviting creators.</p>
                    <Button variant="hero" onClick={() => { setInviteCampaignSelect(null); setTab("new-campaign"); }}>
                      <Plus className="w-4 h-4 mr-1" /> Create Campaign
                    </Button>
                  </div>
                );
              }
              if (eligible.length === 0) {
                return (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      They’re already part of all your active campaigns (or already invited). Create another campaign to invite them again.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => { setInviteCampaignSelect(null); setInviteCampaignId(null); }}>Close</Button>
                      <Button variant="hero" onClick={() => { setInviteCampaignSelect(null); setTab("new-campaign"); }}>
                        <Plus className="w-4 h-4 mr-1" /> Create Campaign
                      </Button>
                    </div>
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose which campaign to invite them to:</p>
                  <div className="space-y-2">
                    {eligible.map((c) => (
                      <button key={c.id} onClick={() => setInviteCampaignId(c.id)} className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${inviteCampaignId === c.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-accent"}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="hero" disabled={!inviteCampaignId} onClick={confirmInvite}>Send Invite</Button>
                    <Button variant="outline" onClick={() => { setInviteCampaignSelect(null); setInviteCampaignId(null); }}>Cancel</Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {attributeError && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setAttributeError(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <AlertCircle className="w-10 h-10 text-warning mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Select a Creator</h3>
            <p className="text-sm text-muted-foreground mb-6">Please select a creator before attributing.</p>
            <Button variant="hero" onClick={() => setAttributeError(false)}>OK</Button>
          </motion.div>
        </div>
      )}

      {showProGate && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => setShowProGate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Pro Feature</h3>
            <p className="text-sm text-muted-foreground mb-6">This feature is available for Pro users. Upgrade to unlock creator search, filtering, and more.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => { setShowProGate(false); setTab("settings"); setSubscriptionDetail(true); }}>Upgrade Subscription</Button>
              <Button variant="outline" onClick={() => setShowProGate(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product approval confirmation */}
      {showProductApproval && (() => {
        const campaign = campaigns.find((c) => c.id === showProductApproval.campaignId);
        return (
          <Dialog open={!!showProductApproval} onOpenChange={() => setShowProductApproval(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-foreground">Confirm Product Delivery</DialogTitle>
                <DialogDescription asChild>
                  <div className="text-sm text-muted-foreground">
                    Do you want to send <span className="font-semibold text-foreground">{campaign?.name || "product"}</span> to{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => {
                        const c = showProductApproval?.creator;
                        if (!c) return;
                        setShowProductApproval(null);
                        openCreatorStandaloneProfile(c, tab);
                      }}
                    >
                      {showProductApproval.creator}
                    </button>
                    {" "}at {campaign?.productType === "physical" ? showProductApproval.address || "their address" : showProductApproval.email || "their email"}?
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="hero" onClick={confirmProductApproval}>Confirm & Accept</Button>
                <Button variant="outline" onClick={() => setShowProductApproval(null)}>Cancel</Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Mark as shipped dialog */}
      <Dialog open={!!showMarkShipped} onOpenChange={() => setShowMarkShipped(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {showMarkShipped && campaigns.find((c) => c.id === showMarkShipped.campaignId)?.productType === "digital" ? "Mark as Emailed" : "Mark as Shipped"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                {showMarkShipped && campaigns.find((c) => c.id === showMarkShipped.campaignId)?.productType === "digital" ? (
                  <>
                    Confirm you&apos;ve emailed the product to{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => {
                        const c = showMarkShipped?.creator;
                        if (!c) return;
                        setShowMarkShipped(null);
                        openCreatorStandaloneProfile(c, tab);
                      }}
                    >
                      {showMarkShipped.creator}
                    </button>
                    .
                  </>
                ) : (
                  <>
                    Confirm you&apos;ve shipped the product to{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => {
                        const c = showMarkShipped?.creator;
                        if (!c) return;
                        setShowMarkShipped(null);
                        openCreatorStandaloneProfile(c, tab);
                      }}
                    >
                      {showMarkShipped?.creator}
                    </button>
                    .
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Tracking Link (optional)</label>
              <Input value={shippingTrackingLink} onChange={(e) => setShippingTrackingLink(e.target.value)} placeholder="https://tracking.example.com/..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Expected Delivery Date (optional)</label>
              <Input type="date" value={shippingDeliveryDate} onChange={(e) => setShippingDeliveryDate(e.target.value)} min={todayStr} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleMarkAsShipped}>
              {showMarkShipped && campaigns.find((c) => c.id === showMarkShipped.campaignId)?.productType === "digital" ? "Mark as Emailed" : "Mark as Shipped"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCampaignAttributionHistory}
        onOpenChange={(open) => {
          setShowCampaignAttributionHistory(open);
          if (!open) setAttributionEdit(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Attribution history</DialogTitle>
            <DialogDescription>
              Manual entries you added with Attribute Sales for{" "}
              {selectedCampaignId ? (campaigns.find((c) => c.id === selectedCampaignId)?.name || "this campaign") : "this campaign"}. You can edit or remove only these manual entries.
            </DialogDescription>
          </DialogHeader>
          {selectedCampaignId ? (() => {
            const rows = attributionHistory.filter((e) => e.campaignId === selectedCampaignId).slice().reverse();
            if (rows.length === 0) {
              return <p className="text-sm text-muted-foreground py-4">No manual attributions yet. Add clicks, sales, or dollar amounts from the campaign page.</p>;
            }
            return (
              <ul className="space-y-2">
                {rows.map((e) => {
                  const editable = isManualAttribution(e);
                  const isEditing = attributionEdit?.id === e.id;
                  return (
                    <li key={e.id} className="rounded-xl border border-border p-3 text-sm dark-green-outline">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-2">
                          {isEditing ? (
                            <>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Type</label>
                                <select
                                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                  value={attributionEdit.type}
                                  onChange={(ev) =>
                                    setAttributionEdit((prev) =>
                                      prev && prev.id === e.id ? { ...prev, type: ev.target.value as "sales" | "clicks" | "dollars" } : prev,
                                    )
                                  }
                                >
                                  <option value="sales">Sales</option>
                                  <option value="clicks">Clicks</option>
                                  <option value="dollars">Dollar amount ($)</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  {attributionEdit.type === "dollars" ? "Amount ($)" : "Count"}
                                </label>
                                <Input
                                  type="number"
                                  value={attributionEdit.amount}
                                  onChange={(ev) =>
                                    setAttributionEdit((prev) =>
                                      prev && prev.id === e.id ? { ...prev, amount: ev.target.value } : prev,
                                    )
                                  }
                                  min={0}
                                  step={attributionEdit.type === "dollars" ? "0.01" : "1"}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button type="button" size="sm" variant="hero" onClick={saveAttributionEdit}>
                                  Save
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => setAttributionEdit(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="font-medium text-foreground hover:text-primary text-left"
                                onClick={() => {
                                  setShowCampaignAttributionHistory(false);
                                  openCreatorStandaloneProfile(e.creatorName, tab);
                                }}
                              >
                                {e.creatorName}
                              </button>
                              <p className="text-muted-foreground text-xs">
                                {new Date(e.createdAt).toLocaleString()}
                                {" · "}
                                {e.type === "clicks" ? `+${e.amount} clicks` : e.type === "sales" ? `+${e.amount} sales` : `+$${e.amount} earned`}
                              </p>
                            </>
                          )}
                        </div>
                        {editable && !isEditing && (
                          <div className="flex gap-1 shrink-0 self-end sm:self-start">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              aria-label="Edit attribution"
                              onClick={() => setAttributionEdit({ id: e.id, type: e.type, amount: String(e.amount) })}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              aria-label="Remove attribution"
                              onClick={() => setAttributionRemoveConfirm(e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          })() : (
            <p className="text-sm text-muted-foreground">Open a campaign to view its history.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!attributionRemoveConfirm} onOpenChange={(open) => !open && setAttributionRemoveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remove this attribution?</AlertDialogTitle>
            <AlertDialogDescription>
              {attributionRemoveConfirm && (
                <>
                  This removes the manual{" "}
                  {attributionRemoveConfirm.type === "clicks"
                    ? `${attributionRemoveConfirm.amount} clicks`
                    : attributionRemoveConfirm.type === "sales"
                      ? `${attributionRemoveConfirm.amount} sales`
                      : `$${attributionRemoveConfirm.amount} earned`}{" "}
                  for <span className="font-medium text-foreground">{attributionRemoveConfirm.creatorName}</span>. Creator totals on the campaign will be updated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (attributionRemoveConfirm) removeAttributionEntry(attributionRemoveConfirm);
                setAttributionRemoveConfirm(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Simulate application dialog */}
      <Dialog open={showSimulate} onOpenChange={setShowSimulate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Simulate Creator Application</DialogTitle>
            <DialogDescription>Choose which campaign to simulate an application for.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {campaigns.filter((c) => c.status === "active" && c.requireApply).map((c) => (
              <button key={c.id} onClick={() => setSimulateCampaignId(c.id)} className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${simulateCampaignId === c.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-accent"}`}>
                {c.name}
              </button>
            ))}
            {campaigns.filter((c) => c.status === "active" && c.requireApply).length === 0 && (
              <p className="text-sm text-muted-foreground">No active apply-only campaigns. Create one with Creator Approval first.</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="hero" disabled={!simulateCampaignId} onClick={handleSimulateApplication}>Simulate</Button>
            <Button variant="outline" onClick={() => setShowSimulate(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fake creator dialog */}
      <Dialog open={showFakeCreator} onOpenChange={setShowFakeCreator}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Test Creator</DialogTitle>
            <DialogDescription>Choose which instant-join campaign this test creator should join. They'll come with a sample portfolio and analytics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {campaigns.filter((c) => c.status === "active" && !c.requireApply).map((c) => (
              <button key={c.id} onClick={() => setFakeCreatorCampaignId(c.id)} className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${fakeCreatorCampaignId === c.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-accent"}`}>
                {c.name}
              </button>
            ))}
            {campaigns.filter((c) => c.status === "active" && !c.requireApply).length === 0 && (
              <p className="text-sm text-muted-foreground">No active instant-join campaigns. Create one with Instant Join first.</p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="hero" disabled={!fakeCreatorCampaignId} onClick={handleCreateFakeCreator}>Create</Button>
            <Button variant="outline" onClick={() => setShowFakeCreator(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 mb-8" onClick={() => document.documentElement.classList.remove("dark")}>
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
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={darkMode ? "secondary" : "outline"} size="icon" onClick={() => setDarkMode(!darkMode)}>
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{darkMode ? "Light mode" : "Dark mode"}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Active Campaigns", value: String(campaigns.filter((c) => c.status === "active").length), icon: Package, key: "campaigns" },
                { label: "Total Creators", value: String(campaigns.reduce((s, c) => s + c.activeCreators.length, 0)), icon: Users, key: "creators" },
                { label: "Revenue", value: `$${brandDisplayTotals.revenue.toLocaleString()}`, icon: DollarSign, key: "revenue" },
                { label: "Spent on Creators", value: `$${brandDisplayTotals.earnings.toLocaleString()}`, icon: TrendingUp, key: "spent" },
              ].map((stat) => (
                <div key={stat.label} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => {
                  setTab("analytics");
                  setAnalyticsDetail(stat.key);
                  if (stat.key === "revenue") setBrandAnalyticsMetric("revenue");
                  else if (stat.key === "spent") setBrandAnalyticsMetric("earnings");
                  else if (stat.key === "creators") setBrandAnalyticsMetric("earnings");
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-primary mt-1">Click for details →</p>
                </div>
              ))}
            </div>

            <div className={sectionCardClass}>
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
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors cursor-pointer dark-green-outline" onClick={() => { setSelectedCampaignId(c.id); setTab("campaigns"); }}>
                      <div className="flex items-center gap-4">
                        {c.images && c.images.length > 0 ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-border"><img src={c.images[0]} alt="" className="w-full h-full object-cover" /></div>
                        ) : brandLogo ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold">{(settingsName || "B")[0]}</div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{c.name}</p>
                            {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
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
                  <div key={c.id} className={`${cardClass} hover:shadow-card-hover transition-shadow relative`}>
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedCampaignId(c.id)}>
                      {renderCampaignCard(c)}
                      <div className="flex items-center gap-3">
                        <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                        {renderCampaignMenu(c, c.id)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaign detail */}
        {(tab === "campaigns" || tab === "dashboard") && selectedCampaignId && (() => {
          const campaign = campaigns.find((c) => c.id === selectedCampaignId);
          if (!campaign) return null;
          if (selectedCreatorDetail && (creatorDetailContext === "campaign" || creatorDetailContext === "standalone")) return null;
          const galleryImages = campaign.images && campaign.images.length > 0 ? campaign.images : [];
          return (
            <div className="space-y-6">
              {campaignGalleryLightbox && campaignGalleryLightbox.campaignId === campaign.id && galleryImages.length > 0 && (() => {
                const n = galleryImages.length;
                const idx = ((campaignGalleryLightbox.imageIndex % n) + n) % n;
                const go = (dir: -1 | 1) => setCampaignGalleryLightbox({ campaignId: campaign.id, imageIndex: (idx + dir + n) % n });
                return (
                  <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setCampaignGalleryLightbox(null)}>
                    <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="absolute -top-1 right-0 z-10 rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white" onClick={() => setCampaignGalleryLightbox(null)} aria-label="Close">
                        <XIcon className="w-5 h-5" />
                      </button>
                      <div
                        className="relative rounded-2xl bg-black/50 aspect-[4/3] max-h-[min(70vh,520px)] overflow-hidden touch-pan-y"
                        onTouchStart={(e) => { campaignGalleryTouchStart.current = e.touches[0].clientX; }}
                        onTouchEnd={(e) => {
                          if (campaignGalleryTouchStart.current == null) return;
                          const dx = e.changedTouches[0].clientX - campaignGalleryTouchStart.current;
                          campaignGalleryTouchStart.current = null;
                          if (dx > 50) go(-1);
                          else if (dx < -50) go(1);
                        }}
                      >
                        <img src={galleryImages[idx]} alt="" className="absolute inset-0 w-full h-full object-contain" />
                        {n > 1 && (
                          <>
                            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent" onClick={() => go(-1)} aria-label="Previous image">
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent" onClick={() => go(1)} aria-label="Next image">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-center text-white/90 text-sm mt-2 px-4">{campaign.name}</p>
                      {n > 1 && <p className="text-center text-white/85 text-sm mt-1">{idx + 1} / {n}</p>}
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between">
                <button onClick={() => { setCampaignGalleryLightbox(null); setSelectedCampaignId(null); }} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                {renderCampaignMenu(campaign, campaign.id + 9000)}
              </div>
              <div className="flex items-center gap-4 mb-4">
                {brandLogo ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">{(settingsName || "B")[0]}</div>
                )}
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{campaign.name}</h1>
                  <p className="text-muted-foreground">{campaign.category} · {campaign.payMethod}</p>
                </div>
                <Badge className="ml-auto" variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
              </div>

              <div className={sectionCardClass + " space-y-4"}>
                <h2 className="font-display text-lg font-semibold text-foreground">Campaign Details</h2>
                {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
                {campaign.link && <a href={campaign.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary break-all hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {campaign.link}</a>}
                {campaign.websiteUrl && <a href={campaign.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary break-all hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}
                {campaign.signOnPay > 0 && <p className="text-sm text-foreground">Sign-on Pay: <span className="font-semibold text-primary">${campaign.signOnPay}</span></p>}
                {campaign.notes && <p className="text-sm text-muted-foreground italic">{campaign.notes}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Application</p><p className="font-semibold text-foreground">{campaign.requireApply ? "Creator Approval" : "Instant Join"}</p></div>
                  {campaign.paidProduct && <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Product</p><p className="font-semibold text-foreground">{campaign.productType === "physical" ? "Physical" : "Digital"}</p></div>}
                  {campaign.adPlatforms && campaign.adPlatforms.length > 0 && <div className="p-3 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platforms</p><p className="font-semibold text-foreground">{campaign.adPlatforms.join(", ")}</p></div>}
                </div>
                {(campaign.filterCategories && campaign.filterCategories.length > 0) || (campaign.followerFilterType && campaign.followerFilterType.length > 0) ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Creator Filters</h3>
                    {campaign.followerFilterType && campaign.followerFilterType.length > 0 && (
                      <p className="text-xs text-muted-foreground">Min followers ({campaign.followerFilterType.join(", ")}): {campaign.minFollowers?.toLocaleString()}</p>
                    )}
                    {campaign.filterCategories && campaign.filterCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {campaign.filterCategories.map((cat) => <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>)}
                      </div>
                    )}
                  </div>
                ) : null}
                {galleryImages.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <h3 className="font-display text-sm font-semibold text-foreground">Product photos</h3>
                    <p className="text-xs text-muted-foreground">Click an image to view full size. Use arrows or swipe to browse.</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                      {galleryImages.map((img, i) => (
                        <button
                          type="button"
                          key={i}
                          className="snap-start shrink-0 w-28 h-28 rounded-xl border border-border overflow-hidden hover:opacity-90 transition-opacity"
                          onClick={() => setCampaignGalleryLightbox({ campaignId: campaign.id, imageIndex: i })}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={sectionCardClass}>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Active Creators ({campaign.activeCreators.length})</h2>
                {campaign.activeCreators.length === 0 ? (
                  <div className="space-y-3">
                    <Button
                      variant="hero"
                      onClick={() => {
                        setSelectedCreatorDetail(null);
                        setCreatorDetailContext(null);
                        setStandaloneProfileReturnTab(null);
                        setSelectedCampaignId(null);
                        setCreatorListTab("all");
                        setTab("creators");
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" /> Invite creators
                    </Button>
                    <p className="text-sm text-muted-foreground">No creators yet. Open Creators to browse and invite people to this campaign.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaign.activeCreators.map((cr, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border dark-green-outline">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCreatorDetail(cr.name); setCreatorDetailContext("campaign"); }}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{cr.name[0]}</div>
                          <div>
                            <p className="font-semibold text-foreground hover:text-primary transition-colors">{cr.name}</p>
                            <p className="text-xs text-muted-foreground">{cr.platform} · {cr.followers}</p>
                            <p className="text-xs text-primary/90 mt-0.5">Campaign: {campaign.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-6 text-sm">
                            <div className="text-center"><p className="font-semibold text-foreground">{cr.clicks}</p><p className="text-xs text-muted-foreground">clicks</p></div>
                            <div className="text-center"><p className="font-semibold text-foreground">{cr.sales}</p><p className="text-xs text-muted-foreground">sales</p></div>
                            <div className="text-center"><p className="font-semibold text-primary">${cr.earnings}</p><p className="text-xs text-muted-foreground">earned</p></div>
                          </div>
                          <div className="relative">
                            <button onClick={() => setMenuOpenId(menuOpenId === i + 5000 ? null : i + 5000)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {menuOpenId === i + 5000 && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg z-20 w-48 overflow-hidden">
                                <button onClick={() => { setShowRemoveCreator({ name: cr.name, campaignId: campaign.id }); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Remove from Campaign</button>
                                <button onClick={() => { setShowBlockConfirm(cr.name); setMenuOpenId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">Block Creator</button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={sectionCardClass}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">Attribute Sales</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manually attribute offline sales, clicks, or revenue to a creator in this campaign. Totals update in Active Creators above.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setShowCampaignAttributionHistory(true)}>
                    <History className="w-4 h-4 mr-2" /> Attribution history
                  </Button>
                </div>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-sm font-medium text-foreground">Creator</label>
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={attributeCreator} onChange={(e) => setAttributeCreator(e.target.value)}>
                      <option value="">Select creator</option>
                      {campaign.activeCreators.map((cr, i) => (
                        <option key={i} value={cr.name}>{cr.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={attributeType} onChange={(e) => setAttributeType(e.target.value as "sales" | "clicks" | "dollars")}>
                      <option value="sales">Sales</option>
                      <option value="clicks">Clicks</option>
                      <option value="dollars">Dollar Amount ($)</option>
                    </select>
                  </div>
                  <div className="w-28">
                    <label className="text-sm font-medium text-foreground">{attributeType === "dollars" ? "Amount ($)" : "Count"}</label>
                    <Input placeholder={attributeType === "dollars" ? "50" : "5"} type="number" value={attributeValue} onChange={(e) => setAttributeValue(e.target.value)} />
                  </div>
                  <Button variant="hero" size="default" onClick={handleAttributeSales}>Attribute</Button>
                </div>
              </div>
            </div>
          );
        })()}

        {tab === "new-campaign" && !showLaunchSuccess && !showLaunchPreview && (
          <div className="max-w-2xl space-y-8">
            <h1 className="font-display text-3xl font-bold text-foreground">{editingCampaignId ? "Edit Campaign" : "Create Campaign"}</h1>

            <div className={sectionCardClass + " space-y-6"}>
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
                    {savedCategories.filter((c) => !campaignCategories.includes(c) && !campaignCategories.includes(categoryMap[c] || "")).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-foreground">Description</label><textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} placeholder="Brief product description..." /></div>
                <div><label className="text-sm font-medium text-foreground">Product Link</label><Input value={campaignForm.link} onChange={(e) => setCampaignForm({ ...campaignForm, link: e.target.value })} placeholder="https://yourstore.com/product" /></div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">Campaign Notes</label>
                    <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Optional instructions or hashtags for creators</TooltipContent></Tooltip>
                  </div>
                  <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={campaignForm.notes} onChange={(e) => setCampaignForm({ ...campaignForm, notes: e.target.value })} placeholder="Use #YourBrand, tag @yourbrand..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Campaign Photos (up to 3)</label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {campaignForm.photos.map((photo, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl border border-border overflow-hidden">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {campaignForm.photos.length < 3 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={sectionCardClass + " space-y-6"}>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Creator Approval</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Choose whether creators can instantly join or need your approval first</TooltipContent></Tooltip>
              </div>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: true })} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.requireApply ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-muted-foreground"}`}>
                      Creator Approval
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Review and approve each creator before they join your campaign</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setCampaignForm({ ...campaignForm, requireApply: false, signOnPay: "" })} className={`px-4 py-2 rounded-lg border text-sm ${!campaignForm.requireApply ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-muted-foreground"}`}>
                      Instant Join
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Creators can join immediately without your approval</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {campaignForm.requireApply && (
              <div className={sectionCardClass + " space-y-4"}>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-foreground">Sign-On Pay</h2>
                  <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Optional bonus paid to creators when their application is approved. Only available with creator approval mode.</TooltipContent></Tooltip>
                </div>
                <div className="flex items-center gap-1 max-w-[140px]">
                  <span className="text-sm font-medium text-foreground">$</span>
                  <Input value={campaignForm.signOnPay} onChange={(e) => setCampaignForm({ ...campaignForm, signOnPay: e.target.value })} placeholder="0" type="number" />
                </div>
              </div>
            )}

            <div className={sectionCardClass + " space-y-6"}>
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
                  <Input
                    value={campaignForm.discount}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, "");
                      if (Number(val) > 99) val = "99";
                      setCampaignForm({ ...campaignForm, discount: val });
                    }}
                    placeholder="10"
                    className="max-w-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Creators will receive a unique code like <span className="font-mono font-semibold text-primary">dylanfinds{campaignForm.discount || "10"}</span> or <span className="font-mono font-semibold text-primary">sarah15</span></p>
                </div>
              )}
            </div>

            <div className={sectionCardClass + " space-y-6"}>
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
                      {m === "hybrid" && "Combines commission per sale with a flat rate per clicks"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {(campaignForm.payMethod === "commission" || campaignForm.payMethod === "hybrid") && (
                <div><label className="text-sm font-medium text-foreground">Commission Rate (%)</label><Input value={campaignForm.commissionRate} onChange={(e) => setCampaignForm({ ...campaignForm, commissionRate: e.target.value })} placeholder="5" className="max-w-[100px]" type="number" /></div>
              )}
              {(campaignForm.payMethod === "flat" || campaignForm.payMethod === "hybrid") && (
                <div className="flex gap-3 items-end">
                  <div><label className="text-sm font-medium text-foreground">Flat Rate ($)</label><Input value={campaignForm.flatRate} onChange={(e) => setCampaignForm({ ...campaignForm, flatRate: e.target.value })} placeholder="5" className="max-w-[100px]" type="number" /></div>
                  <div><label className="text-sm font-medium text-foreground">Per (clicks)</label><Input value={campaignForm.flatPer} onChange={(e) => setCampaignForm({ ...campaignForm, flatPer: e.target.value })} placeholder="100" className="max-w-[100px]" type="number" /></div>
                </div>
              )}
            </div>

            <div className={sectionCardClass + " space-y-6"}>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Advertising Platforms</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>Select which platforms creators should promote on</TooltipContent></Tooltip>
              </div>
              <div className="flex flex-wrap gap-2">
                {["TikTok", "Instagram", "YouTube", "Twitter/X", "Facebook"].map((p) => (
                  <button key={p} onClick={() => {
                    const newPlatforms = campaignForm.adPlatforms.includes(p) ? campaignForm.adPlatforms.filter((x) => x !== p) : [...campaignForm.adPlatforms, p];
                    const newFollowerTypes = campaignForm.followerFilterType.filter((t) => t === "total" || newPlatforms.includes(t));
                    setCampaignForm({ ...campaignForm, adPlatforms: newPlatforms, platforms: newPlatforms, followerFilterType: newFollowerTypes });
                  }} className={`px-4 py-2 rounded-lg border text-sm ${campaignForm.adPlatforms.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={sectionCardClass + " space-y-6"}>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">Creator Filters</h2>
                <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent>This campaign will only show to creators who fit the follower count or category requirements you set here</TooltipContent></Tooltip>
              </div>
              {plan === "pro" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Minimum followers</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {availableFollowerPlatforms.map((t) => (
                        <button key={t} onClick={() => toggleFollowerType(t)} className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.followerFilterType.includes(t) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{t === "total" ? "Total" : t}</button>
                      ))}
                    </div>
                    {campaignForm.followerFilterType.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          value={campaignForm.minFollowers}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setCampaignForm({ ...campaignForm, minFollowers: val });
                          }}
                          placeholder="1000"
                          type="number"
                          className="w-40"
                        />
                        <span className="text-xs text-muted-foreground">followers</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Creator categories</p>
                    <div className="flex flex-wrap gap-2">
                      {campaignCategories.map((cat) => (
                        <button key={cat} onClick={() => {
                          if (cat === "All") {
                            setCampaignForm({ ...campaignForm, filterCategories: ["All"] });
                          } else {
                            const withoutAll = campaignForm.filterCategories.filter((c) => c !== "All");
                            const newCats = withoutAll.includes(cat) ? withoutAll.filter((c) => c !== cat) : [...withoutAll, cat];
                            setCampaignForm({ ...campaignForm, filterCategories: newCats });
                          }
                        }} className={`px-3 py-1.5 rounded-full text-xs border ${campaignForm.filterCategories.includes(cat) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
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

            <div className={sectionCardClass + " space-y-4"}>
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

            <Button variant="hero" size="lg" className="w-full rounded-xl" onClick={handleLaunchCampaign}>
              {editingCampaignId ? "Save Changes" : "Next"}
            </Button>
          </div>
        )}

        {/* Launch preview */}
        {tab === "new-campaign" && showLaunchPreview && !showLaunchSuccess && (() => {
          const preview = buildCampaignFromForm();
          return (
            <div className="max-w-lg mx-auto space-y-6">
              <h1 className="font-display text-2xl font-bold text-foreground text-center">Campaign Preview</h1>
              <p className="text-sm text-muted-foreground text-center">This is how your campaign will look to creators.</p>
              <div className={cardClass + " space-y-4"}>
                <div className="flex items-center gap-4">
                  {preview.images && preview.images.length > 0 ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={preview.images[0]} alt="" className="w-full h-full object-cover" /></div>
                  ) : brandLogo ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{(settingsName || "B")[0]}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-foreground">{preview.name}</h3>
                      {plan === "pro" && <Crown className="w-5 h-5 text-warning" />}
                      {preview.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${preview.signOnPay} sign-on pay</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{settingsName || "Your Brand"} · {preview.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">{preview.payMethod}</p>
                  </div>
                </div>
                {preview.images && preview.images.length > 0 && (
                  <div className="flex gap-2">
                    {preview.images.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg border border-border overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {preview.description && <p className="text-sm text-muted-foreground">{preview.description}</p>}
                <Button variant="hero" size="sm" disabled>{preview.requireApply ? "Apply" : "Join Campaign"}</Button>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowLaunchPreview(false)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="hero" onClick={handleConfirmLaunch}>
                  {editingCampaignId ? "Save Changes" : "Launch Campaign"}
                </Button>
              </div>
            </div>
          );
        })()}

        {tab === "new-campaign" && showLaunchSuccess && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center space-y-6 p-10 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, hsl(150, 50%, 72%) 0%, hsl(152, 45%, 66%) 35%, hsl(154, 42%, 60%) 70%, hsl(145, 38%, 74%) 100%)' }}
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
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0" onClick={() => { setTab("campaigns"); setShowLaunchSuccess(false); }}>
                  Go to Campaigns
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {tab === "creators" && !selectedCreatorDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Creators</h1>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button type="button" onClick={() => { setCreatorListTab("all"); setSelectedCreatorDetail(null); setCreatorDetailContext(null); setStandaloneProfileReturnTab(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>All Creators</button>
              <button type="button" onClick={() => { setCreatorListTab("my"); setSelectedCreatorDetail(null); setCreatorDetailContext(null); setStandaloneProfileReturnTab(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "my" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>My Creators</button>
              <button type="button" onClick={() => { setCreatorListTab("invited"); setSelectedCreatorDetail(null); setCreatorDetailContext(null); setStandaloneProfileReturnTab(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "invited" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>Invited Creators</button>
              <button type="button" onClick={() => { setCreatorListTab("applications"); setSelectedCreatorDetail(null); setCreatorDetailContext(null); setStandaloneProfileReturnTab(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "applications" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>Applications</button>
            </div>

            {creatorListTab === "applications" ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Review applicants and manage acceptances. Test creators added from My Creators do not appear here.</p>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {applications.some((a) => a.isSimulated) && (
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={handleClearSimulatedApplications}>Clear Simulated</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShowSimulate(true)}>Simulate Application</Button>
                  </div>
                </div>
                {applications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No applications yet. Creators will appear here when they apply to your campaigns.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div key={app.id} className={cardClass + " space-y-3"}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button type="button" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer shrink-0" onClick={() => { setCreatorListTab("applications"); openCreatorStandaloneProfile(app.creator, "creators"); }}>{app.creator[0]}</button>
                            <div>
                              <div className="flex items-center gap-2">
                                <button type="button" className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors text-left" onClick={() => { setCreatorListTab("applications"); openCreatorStandaloneProfile(app.creator, "creators"); }}>{app.creator}</button>
                                {app.isSimulated && <Badge variant="secondary" className="text-xs">Simulated</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{app.platform} · {app.followers} followers · {app.category}</p>
                              <p className="text-xs text-muted-foreground">Campaign: {app.campaignName}</p>
                            </div>
                          </div>
                          {app.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button variant="hero" size="sm" onClick={() => handleAcceptApplication(app.id)}><Check className="w-4 h-4 mr-1" /> Accept</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDenyApplication(app.id)}><XIcon className="w-4 h-4 mr-1" /> Deny</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant={app.status === "accepted" ? "default" : "secondary"}>{app.status}</Badge>
                              {app.status === "accepted" && (() => {
                                const appCampaign = campaigns.find((c) => c.id === app.campaignId);
                                const alreadyShipped = shippedProducts.some((s) => s.creatorName === app.creator && s.campaignId === app.campaignId);
                                if (appCampaign?.paidProduct && !alreadyShipped) {
                                  return (
                                    <Button variant="outline" size="sm" onClick={() => setShowMarkShipped(app)}>
                                      <Truck className="w-4 h-4 mr-1" /> {appCampaign.productType === "digital" ? "Mark Emailed" : "Mark Shipped"}
                                    </Button>
                                  );
                                }
                                if (alreadyShipped) {
                                  return <Badge variant="secondary" className="text-xs"><Check className="w-3 h-3 mr-1" /> Shipped</Badge>;
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                        {app.address && <p className="text-xs text-muted-foreground ml-16"><MapPin className="w-3 h-3 inline mr-1" />{app.address}</p>}
                        {app.email && <p className="text-xs text-muted-foreground ml-16">📧 {app.email}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
            <>
            {creatorListTab === "my" && (
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setShowFakeCreator(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Test Creator
                </Button>
                {(campaigns.some((c) => c.activeCreators.some((cr) => cr.isTestCreator)) || applications.some((a) => a.isSimulated && a.status === "accepted")) && (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={handleClearSimulatedCreators}>Clear Simulated</Button>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {creatorListTab === "all" && "AI-recommended creators based on your campaigns. Click a creator to see more details."}
              {creatorListTab === "my" && "Creators actively working with you. Each row shows which of your campaigns they are in."}
              {creatorListTab === "invited" && "Creators you invited to another campaign. Withdraw an invite if your plans change."}
            </p>

            {creatorListTab === "invited" && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by creator or campaign..." className="pl-10" value={creatorSearch} onChange={(e) => setCreatorSearch(e.target.value)} />
                </div>
                <div className="space-y-3">
                {invitedCreators.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No invitations yet. Use “Invite to another campaign” from a creator profile.</p>
                ) : (
                  (() => {
                    const rows = invitedCreators.filter((ic) => !creatorSearch || ic.name.toLowerCase().includes(creatorSearch.toLowerCase()) || (campaigns.find((c) => c.id === ic.campaignId)?.name || "").toLowerCase().includes(creatorSearch.toLowerCase()));
                    if (rows.length === 0) {
                      return <p className="text-center text-muted-foreground py-8">No invitations match your search.</p>;
                    }
                    return rows.map((ic, i) => {
                      const camp = campaigns.find((c) => c.id === ic.campaignId);
                      const joinedThis = camp?.activeCreators.some((a) => a.name === ic.name);
                      return (
                        <div key={`${ic.name}-${ic.campaignId}-${i}`} className={cardClass + " flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                          <div>
                            <button
                              type="button"
                              className="font-semibold text-foreground hover:text-primary text-left"
                              onClick={() => {
                                setCreatorListTab("invited");
                                openCreatorStandaloneProfile(ic.name, "creators");
                              }}
                            >
                              {ic.name}
                            </button>
                            <p className="text-sm text-muted-foreground">Invited to: {camp?.name || "Campaign"}</p>
                            {joinedThis && <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs">Joined this campaign</Badge>}
                          </div>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0" onClick={() => setWithdrawInviteConfirm({ name: ic.name, campaignId: ic.campaignId })}>
                            Withdraw invite
                          </Button>
                        </div>
                      );
                    });
                  })()
                )}
                </div>
              </div>
            )}

            {(creatorListTab === "all" || creatorListTab === "my") && (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search creators..." className="pl-10" value={creatorSearch} onChange={(e) => setCreatorSearch(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => setShowCreatorFilters(!showCreatorFilters)}>
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
            )}

            {(creatorListTab === "all" || creatorListTab === "my") && showCreatorFilters && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={sectionCardClass + " space-y-4"}>
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
                  <p className="text-xs font-medium text-muted-foreground mb-2">Country</p>
                  <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-full" value={creatorFilterCountry} onChange={(e) => setCreatorFilterCountry(e.target.value)}>
                    <option value="">All Countries</option>
                    {["United States", "United Kingdom", "Canada"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Minimum Followers</p>
                  <Input
                    value={creatorFilterFollowersInput}
                    onChange={(e) => {
                      setCreatorFilterFollowersInput(e.target.value);
                      const val = parseInt(e.target.value) || 0;
                      setCreatorFilterMinFollowers(val);
                    }}
                    placeholder="0"
                    type="number"
                    className="w-40"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCreatorFilterPlatform([]); setCreatorFilterMinFollowers(0); setCreatorFilterFollowersInput("0"); setCreatorFilterCountry(""); }}>Clear Filters</Button>
              </motion.div>
            )}

            {(creatorListTab === "all" || creatorListTab === "my") && (
            <div className="space-y-3">
              {creatorListTab === "my" && <h3 className="font-display text-lg font-semibold text-foreground">Active</h3>}
              {filteredCreators.map((cr) => {
                const relation = getCreatorRelation(cr.name);
                const eligibleInviteCampaigns = getInviteEligibleCampaigns(cr.name);
                const canInvite = campaigns.filter((c) => c.status === "active").length === 0 || eligibleInviteCampaigns.length > 0;
                const inviteLabel = relation === "active" ? "Invite to another campaign" : "Invite to Campaign";
                const campaignLabels = getActiveCampaignNamesForCreator(cr.name);
                return (
                  <div key={cr.name} className={cardClass + " flex items-center justify-between cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => { setSelectedCreatorDetail(cr.name); setCreatorDetailContext("creators-list"); }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{cr.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{cr.name}</p>
                          {typeof (cr as any).match === "number" && (
                            <Badge className="bg-success/10 text-primary border-0 text-xs">{(cr as any).match}% match</Badge>
                          )}
                          {relation === "active" && <Badge className="bg-primary/10 text-primary border-0 text-xs">Works with you</Badge>}
                          {relation === "past" && <Badge variant="secondary" className="text-xs">Worked with you</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{cr.platform} · {cr.followers} · {cr.category} · {(cr as any).country || "—"}</p>
                        {creatorListTab === "my" && campaignLabels.length > 0 && (
                          <p className="text-xs text-primary/90 mt-1">
                            {campaignLabels.length === 1
                              ? `Campaign: ${campaignLabels[0]}`
                              : `Campaigns: ${campaignLabels.join(", ")}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {canInvite && (
                        <Button variant="hero" size="sm" onClick={() => handleInviteCreator(cr.name)}>
                          <Send className="w-4 h-4 mr-1" /> {inviteLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCreators.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No creators match your filters.</p>
              )}
            </div>
            )}
            </>
            )}
          </div>
        )}

        {/* Creator detail view (from Creators tab or from a campaign’s active creators) */}
        {selectedCreatorDetail && (
          (tab === "creators" && (creatorDetailContext === "creators-list" || creatorDetailContext === "standalone")) ||
          (creatorDetailContext === "campaign" && (tab === "campaigns" || tab === "dashboard") && selectedCampaignId)
        ) && (() => {
          const onBack = closeCreatorProfile;
          const backLabel =
            creatorDetailContext === "campaign"
              ? "Back to campaign"
              : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "shipping"
                ? "Back to shipping"
                : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "analytics"
                  ? "Back to analytics"
                  : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "dashboard"
                    ? "Back to dashboard"
                    : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "settings"
                      ? "Back to settings"
                      : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "creator-view"
                        ? "Back to creator view"
                        : creatorDetailContext === "standalone" && standaloneProfileReturnTab === "campaigns"
                          ? "Back to campaigns"
                          : creatorDetailContext === "standalone" && creatorListTab === "applications"
                            ? "Back to applications"
                            : "Back to creators";
          const cr = allCreators.find((c) => c.name === selectedCreatorDetail);
          if (!cr) {
            const app = applications.find((a) => a.creator === selectedCreatorDetail) || null;
            const active = campaigns.flatMap((c) => c.activeCreators).find((ac) => ac.name === selectedCreatorDetail) || null;
            const hasInviteOnly = invitedCreators.some((ic) => ic.name === selectedCreatorDetail);
            if (!app && !active && !hasInviteOnly) return null;
            const name = selectedCreatorDetail;
            const platform = app?.platform || active?.platform || "TikTok";
            const followers = app?.followers || active?.followers || "0";
            const category = app?.category || "General";
            const sample = buildSampleSimulatedProfile(name, platform, followers, category);
            const relation = getCreatorRelation(name);
            const creatorCampaigns = campaigns.filter((c) => c.activeCreators.some((ac) => ac.name === name));
            const creatorApps = applications.filter((a) => a.creator === name);
            return (
              <div className="max-w-2xl space-y-6">
                <button type="button" onClick={onBack} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> {backLabel}</button>
                <div className={sectionCardClass + " space-y-6"}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl">{name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="font-display text-2xl font-bold text-foreground">{name}</h1>
                        {relation === "active" && <Badge className="bg-primary/10 text-primary border-0">Works with you</Badge>}
                        {relation === "past" && <Badge variant="secondary">Worked with you</Badge>}
                        {app?.isSimulated && <Badge variant="secondary">Simulated</Badge>}
                      </div>
                      <p className="text-muted-foreground">{category} · {platform} · {followers} followers</p>
                    </div>
                  </div>

                  <p className="text-sm text-foreground">{sample.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline">
                      <p className="text-xs text-muted-foreground">Avg Views</p>
                      <p className="font-semibold text-foreground">{sample.stats.avgViews}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline">
                      <p className="text-xs text-muted-foreground">Avg Engagement</p>
                      <p className="font-semibold text-foreground">{sample.stats.avgEngagement}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline">
                      <p className="text-xs text-muted-foreground">Turnaround</p>
                      <p className="font-semibold text-foreground">{sample.stats.turnaround}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Social Links</h3>
                    <div className="space-y-2">
                      {sample.socials.map((s: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-border dark-green-outline flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{s.platform}</p>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{s.url}</a>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Portfolio</h3>
                    <div className="space-y-2">
                      {sample.portfolio.map((item: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-border dark-green-outline">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.url}</a>
                          {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Platforms</h3>
                    <div className="flex flex-wrap gap-3">
                      {sample.platforms.map((p: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                          <p className="text-xs text-muted-foreground">{p.name}</p>
                          <p className="font-semibold text-foreground">{p.followers}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {creatorCampaigns.length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">Your Campaigns Together</h3>
                      <div className="space-y-2">
                        {creatorCampaigns.map((c) => (
                          <div key={c.id} className="p-3 rounded-xl border border-border flex items-center justify-between dark-green-outline">
                            <div>
                              <p className="font-semibold text-foreground text-sm">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.category} · {c.status}</p>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-0 text-xs">Active</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {renderInvitedCreatorsSectionForProfile(name)}

                  {creatorApps.length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">Applications</h3>
                      {creatorApps.map((a) => (
                        <div key={a.id} className="p-3 rounded-xl border border-border flex items-center justify-between dark-green-outline mb-2">
                          <div><p className="font-semibold text-foreground text-sm">{a.campaignName}</p></div>
                          <Badge variant={a.status === "accepted" ? "default" : a.status === "denied" ? "secondary" : "outline"}>{a.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          const relation = getCreatorRelation(cr.name);
          const creatorCampaigns = campaigns.filter((c) => c.activeCreators.some((ac) => ac.name === cr.name));
          return (
            <div className="max-w-2xl space-y-6">
              <button type="button" onClick={onBack} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> {backLabel}</button>
              <div className={sectionCardClass + " space-y-6"}>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-3xl">{cr.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display text-2xl font-bold text-foreground">{cr.name}</h1>
                      <Badge className="bg-success/10 text-primary border-0">{cr.match}% match</Badge>
                      {relation === "active" && <Badge className="bg-primary/10 text-primary border-0">Works with you</Badge>}
                      {relation === "past" && <Badge variant="secondary">Worked with you</Badge>}
                    </div>
                    <p className="text-muted-foreground">{cr.category} · {cr.country}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground">{cr.bio}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Total Followers</p><p className="font-semibold text-foreground">{(cr.totalFollowers / 1000).toFixed(0)}K</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Revenue Earned</p><p className="font-semibold text-primary">${cr.revenue.toLocaleString()}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Total Sales</p><p className="font-semibold text-foreground">{cr.sales}</p></div>
                  <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Total Clicks</p><p className="font-semibold text-foreground">{cr.clicks.toLocaleString()}</p></div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-foreground mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-3">
                    {cr.platforms.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                        <p className="font-semibold text-foreground">{p.followers}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {creatorCampaigns.length > 0 && (
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Your Campaigns Together</h3>
                    <div className="space-y-2">
                      {creatorCampaigns.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl border border-border flex items-center justify-between dark-green-outline">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.category}</p>
                          </div>
                          <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {renderInvitedCreatorsSectionForProfile(cr.name)}

                {cr.portfolio.length > 0 && (
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Portfolio</h3>
                    <div className="space-y-2">
                      {cr.portfolio.map((item, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border dark-green-outline">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{item.url}</a>
                          {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {(() => {
                    const eligibleInviteCampaigns = getInviteEligibleCampaigns(cr.name);
                    const canInvite = campaigns.filter((c) => c.status === "active").length === 0 || eligibleInviteCampaigns.length > 0;
                    const inviteLabel = relation === "active" ? "Invite to another campaign" : "Invite to Campaign";
                    return canInvite ? (
                      <Button variant="hero" onClick={() => handleInviteCreator(cr.name)}>
                        <Send className="w-4 h-4 mr-1" /> {inviteLabel}
                      </Button>
                    ) : null;
                  })()}
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowBlockConfirm(cr.name)}>
                    <Ban className="w-4 h-4 mr-1" /> Block
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Shipping page */}
        {tab === "shipping" && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Shipping & Fulfillment</h1>
            <p className="text-sm text-muted-foreground">Track all products shipped or emailed to creators.</p>

            {shippedProducts.length === 0 ? (
              <div className={sectionCardClass + " text-center py-12"}>
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shipments yet. Products will appear here when you mark them as shipped.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shippedProducts.map((sp) => (
                  <div key={sp.id} className={cardClass + " space-y-3"}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{sp.campaignName}</h3>
                        <p className="text-sm text-muted-foreground">
                          To:{" "}
                          <button type="button" className="text-primary hover:underline font-medium" onClick={() => openCreatorStandaloneProfile(sp.creatorName, "shipping")}>
                            {sp.creatorName}
                          </button>
                        </p>
                      </div>
                      <Badge variant="secondary">{sp.productType === "digital" ? "Emailed" : "Shipped"}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                        <p className="text-xs text-muted-foreground">{sp.productType === "digital" ? "Email" : "Address"}</p>
                        <p className="font-medium text-foreground text-xs">{sp.productType === "digital" ? sp.email : sp.address}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                        <p className="text-xs text-muted-foreground">Units</p>
                        <p className="font-medium text-foreground">{sp.units}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                        <p className="text-xs text-muted-foreground">Date Shipped</p>
                        <p className="font-medium text-foreground">{sp.dateShipped}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50 dark-green-outline">
                        <p className="text-xs text-muted-foreground">Expected Delivery</p>
                        <p className="font-medium text-foreground">{sp.expectedDelivery || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {sp.trackingLink ? (
                        <a href={sp.trackingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Tracking Link</a>
                      ) : (
                        <p className="text-xs text-muted-foreground">No tracking link</p>
                      )}
                      {editingShipmentId === sp.id ? (
                        <div className="flex gap-2 items-end flex-1">
                          <Input
                            placeholder="Tracking link"
                            value={shippingTrackingLink}
                            onChange={(e) => setShippingTrackingLink(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="date"
                            value={shippingDeliveryDate}
                            onChange={(e) => setShippingDeliveryDate(e.target.value)}
                            className="w-40"
                            min={todayStr}
                          />
                          <Button variant="hero" size="sm" onClick={() => {
                            setShippedProducts((prev) => prev.map((s) =>
                              s.id === sp.id ? { ...s, trackingLink: shippingTrackingLink || s.trackingLink, expectedDelivery: shippingDeliveryDate || s.expectedDelivery } : s
                            ));
                            setEditingShipmentId(null);
                            setShippingTrackingLink("");
                            setShippingDeliveryDate("");
                          }}>Save</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => { setEditingShipmentId(sp.id); setShippingTrackingLink(sp.trackingLink); setShippingDeliveryDate(sp.expectedDelivery); }}>
                          {sp.trackingLink ? "Update" : "Add"} Tracking
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && !analyticsDetail && !subscriptionDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
              <Button variant="outline" onClick={handleSimulateBrandAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" /> Simulate Analytics
              </Button>
            </div>
            <div className={sectionCardClass + " space-y-4"}>
              <div className="flex flex-wrap gap-3 items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Performance Graph</p>
                  <p className="text-xs text-muted-foreground">Choose a metric and graph type. Earnings reflects total paid to creators (their recorded earnings).</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Metric</p>
                    <select
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      value={brandAnalyticsMetric}
                      onChange={(e) => setBrandAnalyticsMetric(e.target.value as BrandAnalyticsMetricKey)}
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
                      value={brandAnalyticsGraphType}
                      onChange={(e) => setBrandAnalyticsGraphType(e.target.value as BrandGraphType)}
                    >
                      <option value="bar">Bar</option>
                      <option value="line">Line</option>
                      <option value="pie">Pie</option>
                    </select>
                  </div>
                </div>
              </div>
              {renderBrandAnalyticsGraph(brandAnalyticsMetric, brandGraphData, brandAnalyticsGraphType)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: `$${brandDisplayTotals.revenue.toLocaleString()}`, key: "revenue" },
                { label: "Spent on Creators", value: `$${brandDisplayTotals.earnings.toLocaleString()}`, key: "spent" },
                { label: "Active Campaigns", value: String(campaigns.filter((c) => c.status === "active").length), key: "campaigns" },
                { label: "Total Creators", value: String(campaigns.reduce((s, c) => s + c.activeCreators.length, 0)), key: "creators" },
                { label: "Total Clicks", value: brandDisplayTotals.clicks.toLocaleString(), key: "clicks" },
                { label: "Total Sales", value: String(brandDisplayTotals.sales), key: "sales" },
                { label: "Subscription", value: plan === "pro" ? "Pro ($49/mo)" : "Basic (Free)", key: "subscription" },
              ].map((s) => (
                <div key={s.label} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => {
                  if (s.key === "subscription") {
                    setSubscriptionDetail(true);
                  } else {
                    setAnalyticsDetail(s.key);
                    if (s.key === "revenue") setBrandAnalyticsMetric("revenue");
                    else if (s.key === "spent") setBrandAnalyticsMetric("earnings");
                    else if (s.key === "clicks") setBrandAnalyticsMetric("clicks");
                    else if (s.key === "sales") setBrandAnalyticsMetric("sales");
                    else if (s.key === "creators") setBrandAnalyticsMetric("earnings");
                  }
                }}>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
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
              {analyticsDetail === "revenue" && "Revenue Breakdown"}
              {analyticsDetail === "spent" && "Creator Spending Breakdown"}
              {analyticsDetail === "campaigns" && "Campaign Details"}
              {analyticsDetail === "creators" && "Creator Details"}
              {analyticsDetail === "clicks" && "Clicks Breakdown"}
              {analyticsDetail === "sales" && "Sales Breakdown"}
            </h1>

            {analyticsDetail !== "campaigns" && (
              <div className={sectionCardClass + " space-y-4"}>
                <div className="flex flex-wrap gap-3 items-end justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Performance Graph</p>
                    <p className="text-xs text-muted-foreground">Same metrics and chart types as the main Analytics page.</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Metric</p>
                      <select
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={brandAnalyticsMetric}
                        onChange={(e) => setBrandAnalyticsMetric(e.target.value as BrandAnalyticsMetricKey)}
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
                        value={brandAnalyticsGraphType}
                        onChange={(e) => setBrandAnalyticsGraphType(e.target.value as BrandGraphType)}
                      >
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                        <option value="pie">Pie</option>
                      </select>
                    </div>
                  </div>
                </div>
                {renderBrandAnalyticsGraph(brandAnalyticsMetric, brandGraphData, brandAnalyticsGraphType)}
              </div>
            )}

            <div className={sectionCardClass}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">By Campaign</h2>
              {campaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data yet. Launch campaigns to see analytics.</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => {
                    const campEarnings = c.activeCreators.reduce((s, cr) => s + cr.earnings, 0);
                    const campClicks = c.activeCreators.reduce((s, cr) => s + cr.clicks, 0);
                    const campSales = c.activeCreators.reduce((s, cr) => s + cr.sales, 0);
                    const campRevenue = c.activeCreators.reduce((s, cr) => s + Math.round(cr.sales * 38 + cr.earnings * 2), 0);
                    return (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border dark-green-outline">
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.category} · {c.activeCreators.length} creators</p>
                      </div>
                      <div className="text-right">
                        {analyticsDetail === "revenue" && <p className="font-display font-bold text-primary">${campRevenue.toLocaleString()}</p>}
                        {analyticsDetail === "spent" && <p className="font-display font-bold text-foreground">${campEarnings.toLocaleString()}</p>}
                        {analyticsDetail === "campaigns" && <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>}
                        {analyticsDetail === "creators" && <p className="font-display font-bold text-foreground">{c.activeCreators.length}</p>}
                        {analyticsDetail === "clicks" && <p className="font-display font-bold text-foreground">{campClicks.toLocaleString()}</p>}
                        {analyticsDetail === "sales" && <p className="font-display font-bold text-foreground">{campSales}</p>}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "analytics" && subscriptionDetail && (
          <div className="space-y-6">
            <button onClick={() => setSubscriptionDetail(false)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to analytics</button>
            <h1 className="font-display text-2xl font-bold text-foreground">Subscription Details</h1>
            <div className={sectionCardClass + " space-y-4"}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Current Plan</p><p className="font-semibold text-foreground">{plan === "pro" ? "Pro" : "Basic"}</p></div>
                <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Price</p><p className="font-semibold text-foreground">{plan === "pro" ? "$49/month" : "Free"}</p></div>
                <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Member Since</p><p className="font-semibold text-foreground">April 2026</p></div>
                <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Next Renewal</p><p className="font-semibold text-foreground">{plan === "pro" ? "May 2, 2026" : "N/A"}</p></div>
              </div>
              {plan === "pro" ? (
                <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => { setPlan("basic"); localStorage.setItem("allcall_plan", "basic"); }}>Cancel Pro Subscription</Button>
              ) : (
                <Button variant="hero" onClick={() => { setPlan("pro"); localStorage.setItem("allcall_plan", "pro"); }}>Upgrade to Pro ($49/month)</Button>
              )}
            </div>
          </div>
        )}

        {tab === "creator-view" && (
          <div className="space-y-6">
            {/* Lightbox */}
            {cvLightbox && (() => {
              const c = creatorViewCampaigns.find((x) => x.id === cvLightbox.campaignId);
              if (!c) return null;
              const n = Math.max(1, c.productImageCount);
              const idx = ((cvLightbox.imageIndex % n) + n) % n;
              const go = (dir: -1 | 1) => setCvLightbox({ campaignId: c.id, imageIndex: (idx + dir + n) % n });
              const imgSrc = c.imageSrcs?.[idx];
              return (
                <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setCvLightbox(null)}>
                  <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="absolute -top-1 right-0 z-10 rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white" onClick={() => setCvLightbox(null)} aria-label="Close">
                      <XIcon className="w-5 h-5" />
                    </button>
                    <div
                      className="relative rounded-2xl bg-muted aspect-[4/3] max-h-[min(70vh,520px)] flex flex-col items-center justify-center border border-white/10 touch-pan-y overflow-hidden"
                      onTouchStart={(e) => { cvTouchStartX.current = e.touches[0].clientX; }}
                      onTouchEnd={(e) => {
                        if (cvTouchStartX.current == null) return;
                        const dx = e.changedTouches[0].clientX - cvTouchStartX.current;
                        cvTouchStartX.current = null;
                        if (dx > 50) go(-1);
                        else if (dx < -50) go(1);
                      }}
                    >
                      {imgSrc ? (
                        <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-contain bg-black/50" />
                      ) : (
                        <>
                          <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                          <p className="text-2xl font-display font-semibold text-muted-foreground">Image {idx + 1}</p>
                          <p className="text-sm text-muted-foreground mt-2 text-center px-6">{c.product}</p>
                        </>
                      )}
                      {n > 1 && (
                        <>
                          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent" onClick={() => go(-1)} aria-label="Previous image">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 z-[2] w-10 h-10 rounded-full bg-background/95 border border-border shadow-sm flex items-center justify-center hover:bg-accent" onClick={() => go(1)} aria-label="Next image">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    {imgSrc && <p className="text-center text-white/90 text-sm mt-2 px-4">{c.product}</p>}
                    {n > 1 && <p className="text-center text-white/85 text-sm mt-3">{idx + 1} / {n}</p>}
                  </div>
                </div>
              );
            })()}

            <h1 className="font-display text-3xl font-bold text-foreground">Creator View Preview</h1>
            <p className="text-sm text-muted-foreground">This mirrors the creator campaign browsing experience. Apply/Join buttons are disabled in preview mode.</p>

            {/* If viewing a brand page */}
            {!cvSelectedCampaignId && cvViewingBrand && (() => {
              const brandCampaigns = creatorViewCampaigns.filter((c) => c.brand === cvViewingBrand);
              return (
                <div className="space-y-6">
                  <button onClick={() => setCvViewingBrand(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to campaigns</button>
                  <div className={sectionCardClass + " space-y-4"}>
                    <div className="flex items-center gap-4">
                      {cvViewingBrand === (settingsName || "Your Brand") && brandLogo ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                          <img src={brandLogo} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl shrink-0">{cvViewingBrand[0]}</div>
                      )}
                      <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">{cvViewingBrand}</h1>
                        <p className="text-sm text-muted-foreground">{brandCampaigns.length} campaigns</p>
                      </div>
                    </div>
                    {brandCampaigns[0]?.websiteUrl && (
                      <a href={brandCampaigns[0].websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {brandCampaigns[0].websiteUrl}</a>
                    )}
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">Invited creators</h3>
                      <p className="text-xs text-muted-foreground mb-3">Approximate active creators per campaign for this brand (creators join or are invited per campaign).</p>
                      <div className="space-y-2">
                        {brandCampaigns.map((bc) => (
                          <div key={bc.id} className="p-3 rounded-xl border border-border dark-green-outline flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{bc.product}</span>
                            <span className="text-sm text-muted-foreground tabular-nums">~{bc.activeCreatorsOnCampaign ?? "—"} creators</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Campaigns by {cvViewingBrand}</h2>
                  <div className="space-y-3">
                    {brandCampaigns.map((c) => (
                      <div key={c.id} className={cardClass + " hover:shadow-card-hover transition-shadow cursor-pointer"} onClick={() => setCvSelectedCampaignId(c.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CvCampaignThumb campaign={c} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                                {c.isYours && <Badge className="bg-accent text-accent-foreground border-0 text-xs">Your Campaign</Badge>}
                                {c.isPro && (
                                  <Tooltip>
                                    <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                                    <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                                  </Tooltip>
                                )}
                                {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{c.category} · {c.adPlatforms.length > 1 ? "Multiple Platforms" : c.platform}</p>
                              <p className="text-xs text-muted-foreground mt-1">{c.payMethod}</p>
                            </div>
                          </div>
                          <Button variant="hero" size="sm" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Campaign list */}
            {!cvSelectedCampaignId && !cvViewingBrand && (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search campaigns..." className="pl-10" value={cvSearchQuery} onChange={(e) => setCvSearchQuery(e.target.value)} />
                  </div>
                  <Button variant="outline" onClick={() => setCvShowFilters(!cvShowFilters)}>
                    <Filter className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </div>

                {cvShowFilters && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={sectionCardClass + " space-y-4"}>
                    <h3 className="text-sm font-semibold text-foreground">Filter Campaigns</h3>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
                      <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-full" value={cvFilterCategory} onChange={(e) => setCvFilterCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {campaignCategories.filter((x) => x !== "All").map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Pay Type</p>
                      <div className="flex flex-wrap gap-2">
                        {[{ key: "commission", label: "Commission" }, { key: "flat", label: "Flat Rate" }, { key: "hybrid", label: "Hybrid" }].map((p) => (
                          <button key={p.key} onClick={() => setCvFilterPayType(cvFilterPayType === p.key ? "" : p.key)} className={`px-3 py-1.5 rounded-full text-xs border ${cvFilterPayType === p.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Platform</p>
                      <div className="flex flex-wrap gap-2">
                        {["TikTok", "Instagram", "YouTube"].map((p) => (
                          <button key={p} onClick={() => setCvFilterPlatform((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])} className={`px-3 py-1.5 rounded-full text-xs border ${cvFilterPlatform.includes(p) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={cvFilterSignOnPay} onChange={(e) => { setCvFilterSignOnPay(e.target.checked); if (!e.target.checked) setCvFilterMinSignOnPay(""); }} className="rounded" />
                        <span className="text-sm text-foreground">Sign-on pay only</span>
                      </label>
                      {cvFilterSignOnPay && (
                        <div className="flex items-center gap-2 mt-2 ml-7">
                          <span className="text-sm text-muted-foreground">Min $</span>
                          <Input value={cvFilterMinSignOnPay} onChange={(e) => setCvFilterMinSignOnPay(e.target.value)} placeholder="0" type="number" className="w-24" />
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setCvFilterCategory(""); setCvFilterPayType(""); setCvFilterPlatform([]); setCvFilterSignOnPay(false); setCvFilterMinSignOnPay(""); }}>Clear Filters</Button>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {cvFilteredCampaigns.map((c) => (
                    <div key={c.id} className={cardClass + " hover:shadow-card-hover transition-shadow cursor-pointer"} onClick={() => setCvSelectedCampaignId(c.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CvCampaignThumb campaign={c} />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-bold text-foreground">{c.product}</h3>
                              {c.isYours && <Badge className="bg-accent text-accent-foreground border-0 text-xs">Your Campaign</Badge>}
                              {c.isPro && (
                                <Tooltip>
                                  <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                                  <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                                </Tooltip>
                              )}
                              {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); setCvViewingBrand(c.brand); }}>{c.brand}</button>
                              {" · "}{c.category} · {c.adPlatforms.length > 1 ? "Multiple Platforms" : c.platform}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{c.payMethod}</p>
                          </div>
                        </div>
                        <Button variant="hero" size="sm" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign detail */}
            {cvSelectedCampaignId && (() => {
              const c = creatorViewCampaigns.find((x) => x.id === cvSelectedCampaignId);
              if (!c) return null;
              return (
                <div className="max-w-2xl space-y-6">
                  <button onClick={() => setCvSelectedCampaignId(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to campaigns</button>
                  <div className={sectionCardClass + " space-y-6"}>
                    <div className="flex items-center gap-4">
                      <CvBrandLogoMark brand={c.brand} size="w-20 h-20" textClassName="text-2xl" logoUrl={c.isYours ? brandLogo : undefined} />
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
                          <button className="text-primary hover:underline" onClick={() => { setCvSelectedCampaignId(null); setCvViewingBrand(c.brand); }}>{c.brand}</button>
                          {" · "}{c.category}
                        </p>
                      </div>
                    </div>

                    <CvCampaignProductGallery campaign={c} />

                    {c.description && <p className="text-sm text-foreground">{c.description}</p>}
                    {c.notes && <p className="text-sm text-muted-foreground italic">📌 {c.notes}</p>}
                    {c.productLink && <a href={c.productLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Product Link</a>}
                    {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platform</p><p className="font-semibold text-foreground">{c.adPlatforms.join(", ")}</p></div>
                      <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Payment</p><p className="font-semibold text-foreground">{c.payMethod}</p></div>
                      {c.signOnPay > 0 && <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sign-On Pay</p><p className="font-semibold text-primary">${c.signOnPay}</p></div>}
                      <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Product Required</p><p className="font-semibold text-foreground">{c.needsProduct ? "Yes" : "No"}</p></div>
                    </div>

                    <Button variant="hero" size="lg" className="w-full rounded-xl" disabled>{c.requireApply ? "Apply to Campaign" : "Join Campaign"}</Button>
                  </div>
                </div>
              );
            })()}
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
              <div>
                <label className="text-sm font-medium text-foreground">Brand Logo</label>
                <div className="flex items-center gap-4 mt-1">
                  {settingsLogo ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                      <img src={settingsLogo} alt="Logo" className="w-full h-full object-cover" />
                      <button onClick={() => setSettingsLogo(null)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">Upload or change your brand logo</p>
                </div>
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
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Information</h2>
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

            <div className={sectionCardClass + " space-y-4"}>
              <h2 className="font-display text-lg font-semibold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground">Current plan: <span className="font-semibold text-foreground">{plan === "pro" ? "Pro ($49/mo)" : "Basic (Free)"}</span></p>
              <div className="flex gap-3">
                {plan !== "pro" ? (
                  <Button variant="hero" size="sm" onClick={() => { setPlan("pro"); localStorage.setItem("allcall_plan", "pro"); }}>Upgrade to Pro</Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => { setPlan("basic"); localStorage.setItem("allcall_plan", "basic"); }}>Cancel Pro</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => { setTab("analytics"); setSubscriptionDetail(true); }}>View Details</Button>
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

export default BrandDashboard;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Plus, Users, DollarSign, Settings, Eye, LogOut, Search,
  Bell, Lock, TrendingUp, Filter, Send, Check, X as XIcon,
  Package, Link2, MoreHorizontal, Star, Info, Moon, Sun, User, KeyRound, Crown, CreditCard,
  ChevronLeft, Image as ImageIcon, AlertCircle, UserX, Ban, Upload, MapPin, Truck, Calendar, ExternalLink
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

type Tab = "dashboard" | "campaigns" | "new-campaign" | "applications" | "creators" | "analytics" | "creator-view" | "settings" | "shipping";

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
  const [creatorListTab, setCreatorListTab] = useState<"all" | "my">("all");
  const [attributeError, setAttributeError] = useState(false);
  const [attributeCreator, setAttributeCreator] = useState("");
  const [attributeType, setAttributeType] = useState<"sales" | "clicks" | "dollars">("sales");
  const [attributeValue, setAttributeValue] = useState("");
  const [analyticsDetail, setAnalyticsDetail] = useState<string | null>(null);
  const [subscriptionDetail, setSubscriptionDetail] = useState(false);
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
    return null;
  };

  const filteredCreators = allCreators.filter((cr) => {
    if (blockedCreators.includes(cr.name)) return false;
    if (creatorListTab === "my") {
      const relation = getCreatorRelation(cr.name);
      if (relation !== "active") return false;
    }
    if (creatorSearch && !cr.name.toLowerCase().includes(creatorSearch.toLowerCase())) return false;
    if (creatorFilterPlatform.length > 0 && !creatorFilterPlatform.includes(cr.platform)) return false;
    if (creatorFilterMinFollowers > 0 && cr.followersNum < creatorFilterMinFollowers) return false;
    if (creatorFilterCountry && cr.country !== creatorFilterCountry) return false;
    return true;
  });

  const invitedNotJoined = invitedCreators.filter((ic) => {
    const relation = getCreatorRelation(ic.name);
    return relation !== "active";
  });

  const sidebarItems: { key: Tab; label: string; icon: any; pro?: boolean }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "campaigns", label: "Campaigns", icon: Package },
    { key: "new-campaign", label: "New Campaign", icon: Plus },
    { key: "applications", label: "Applications", icon: Bell },
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
    if (campaigns.filter((c) => c.status === "active").length === 0) {
      setInviteCampaignSelect(name);
      return;
    }
    setInviteCampaignSelect(name);
  };

  const confirmInvite = () => {
    if (!inviteCampaignSelect || !inviteCampaignId) return;
    setInvitedCreators((prev) => [...prev, { name: inviteCampaignSelect, campaignId: inviteCampaignId }]);
    setInviteConfirmation(inviteCampaignSelect);
    setInviteCampaignSelect(null);
    setInviteCampaignId(null);
    setTimeout(() => setInviteConfirmation(null), 3000);
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
    const fakeCategories = ["Beauty", "Health", "Tech", "Fashion", "Food", "Sports", "Travel", "Home", "Education", "Entertainment"];
    const fakePlatform = allPlatforms[Math.floor(Math.random() * 3)]; // primary
    const fakeFollowersNum = Math.floor(Math.random() * 200 + 5);
    const fakeCategory = fakeCategories[Math.floor(Math.random() * fakeCategories.length)];
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
            { name: fakeName, platform: fakePlatform, followers: `${fakeFollowersNum}K`, clicks: fakeClicks, sales: fakeSales, earnings: fakeEarnings },
          ],
        };
      }
      return c;
    }));

    // Also add to allCreators-like data by adding a simulated application as accepted
    const campaign = campaigns.find((c) => c.id === fakeCreatorCampaignId);
    if (campaign) {
      const newApp: Application = {
        id: Date.now(),
        creator: fakeName,
        platform: fakePlatform,
        followers: `${fakeFollowersNum}K`,
        category: fakeCategory,
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: "accepted",
        isSimulated: true,
      };
      setApplications((prev) => [...prev, newApp]);
    }

    setShowFakeCreator(false);
    setFakeCreatorCampaignId(null);
  };

  const handleClearSimulatedApplications = () => {
    setApplications((prev) => prev.filter((a) => !a.isSimulated));
  };

  const handleClearSimulatedCreators = () => {
    // Remove simulated creators from campaigns
    const simulatedNames = applications.filter((a) => a.isSimulated && a.status === "accepted").map((a) => a.creator);
    setCampaigns((prev) => prev.map((c) => ({
      ...c,
      activeCreators: c.activeCreators.filter((cr) => !simulatedNames.includes(cr.name)),
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
    if (!attributeCreator) {
      setAttributeError(true);
      return;
    }
    setAttributeError(false);
    setAttributeCreator("");
    setAttributeValue("");
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");

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
    <div className="min-h-screen flex" style={{ background: darkMode ? 'hsl(150, 10%, 5%)' : 'linear-gradient(180deg, hsl(148, 50%, 88%) 0%, hsl(145, 35%, 92%) 40%, hsl(140, 20%, 96%) 100%)', backgroundAttachment: 'fixed' }}>
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

      {inviteCampaignSelect && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center" onClick={() => { setInviteCampaignSelect(null); setInviteCampaignId(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 max-w-sm shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Invite {inviteCampaignSelect}</h3>
            {activeCampaigns.length === 0 ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Create a campaign to start inviting creators.</p>
                <Button variant="hero" onClick={() => { setInviteCampaignSelect(null); setTab("new-campaign"); }}>
                  <Plus className="w-4 h-4 mr-1" /> Create Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose which campaign to invite them to:</p>
                <div className="space-y-2">
                  {activeCampaigns.map((c) => (
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
            )}
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
                <DialogDescription>
                  Do you want to send <span className="font-semibold">{campaign?.name || "product"}</span> to <span className="font-semibold">{showProductApproval.creator}</span> at {campaign?.productType === "physical" ? showProductApproval.address || "their address" : showProductApproval.email || "their email"}?
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
            <DialogDescription>
              {showMarkShipped && campaigns.find((c) => c.id === showMarkShipped.campaignId)?.productType === "digital"
                ? `Confirm you've emailed the product to ${showMarkShipped?.creator}.`
                : `Confirm you've shipped the product to ${showMarkShipped?.creator}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Tracking Link (optional)</label>
              <Input value={shippingTrackingLink} onChange={(e) => setShippingTrackingLink(e.target.value)} placeholder="https://tracking.example.com/..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Expected Delivery Date (optional)</label>
              <Input type="date" value={shippingDeliveryDate} onChange={(e) => setShippingDeliveryDate(e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleMarkAsShipped}>
              {showMarkShipped && campaigns.find((c) => c.id === showMarkShipped.campaignId)?.productType === "digital" ? "Mark as Emailed" : "Mark as Shipped"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                { label: "Revenue", value: "$0", icon: DollarSign, key: "revenue" },
                { label: "Spent on Creators", value: "$0", icon: TrendingUp, key: "spent" },
              ].map((stat) => (
                <div key={stat.label} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => { setTab("analytics"); setAnalyticsDetail(stat.key); }}>
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
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedCampaignId(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
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
                {campaign.images && campaign.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {campaign.images.map((img, i) => (
                      <div key={i} className="w-24 h-24 rounded-xl border border-border overflow-hidden">
                        <img src={img} alt={`Campaign ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={sectionCardClass}>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Active Creators ({campaign.activeCreators.length})</h2>
                {campaign.activeCreators.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">No creators yet.</p>
                ) : (
                  <div className="space-y-3">
                    {campaign.activeCreators.map((cr, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border dark-green-outline">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCreatorDetail(cr.name)}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{cr.name[0]}</div>
                          <div>
                            <p className="font-semibold text-foreground hover:text-primary transition-colors">{cr.name}</p>
                            <p className="text-xs text-muted-foreground">{cr.platform} · {cr.followers}</p>
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
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Attribute Sales</h2>
                <p className="text-sm text-muted-foreground mb-4">Manually attribute offline sales, clicks, or revenue to a creator in this campaign.</p>
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
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={attributeType} onChange={(e) => setAttributeType(e.target.value as any)}>
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
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0" onClick={() => { setTab("campaigns"); setShowLaunchSuccess(false); }}>
                  Go to Campaigns
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Applications</h1>
              <div className="flex gap-2">
                {applications.some((a) => a.isSimulated) && (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={handleClearSimulatedApplications}>Clear Simulated</Button>
                )}
                <Button variant="outline" onClick={() => setShowSimulate(true)}>Simulate Creator Application</Button>
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
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer" onClick={() => { setTab("creators"); setSelectedCreatorDetail(app.creator); }}>{app.creator[0]}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => { setTab("creators"); setSelectedCreatorDetail(app.creator); }}>{app.creator}</p>
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
                            const campaign = campaigns.find((c) => c.id === app.campaignId);
                            const alreadyShipped = shippedProducts.some((s) => s.creatorName === app.creator && s.campaignId === app.campaignId);
                            if (campaign?.paidProduct && !alreadyShipped) {
                              return (
                                <Button variant="outline" size="sm" onClick={() => setShowMarkShipped(app)}>
                                  <Truck className="w-4 h-4 mr-1" /> {campaign.productType === "digital" ? "Mark Emailed" : "Mark Shipped"}
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
        )}

        {tab === "creators" && !selectedCreatorDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold text-foreground">Creators</h1>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setCreatorListTab("all")} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>All Creators</button>
              <button onClick={() => setCreatorListTab("my")} className={`px-4 py-2 rounded-lg text-sm font-medium ${creatorListTab === "my" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>My Creators</button>
            </div>

            {creatorListTab === "my" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFakeCreator(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Test Creator
                </Button>
                {applications.some((a) => a.isSimulated && a.status === "accepted") && (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={handleClearSimulatedCreators}>Clear Simulated</Button>
                )}
              </div>
            )}
            </div>

            <p className="text-sm text-muted-foreground">
              {creatorListTab === "all" ? "AI-recommended creators based on your campaigns. Click a creator to see more details." : "Creators actively working with you."}
            </p>
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

            {creatorListTab === "my" && invitedNotJoined.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold text-foreground">Invited</h3>
                {invitedNotJoined.map((ic, i) => {
                  const cr = allCreators.find((c) => c.name === ic.name);
                  const camp = campaigns.find((c) => c.id === ic.campaignId);
                  if (!cr) return null;
                  return (
                    <div key={i} className={cardClass + " flex items-center justify-between"}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{cr.name[0]}</div>
                        <div>
                          <p className="font-semibold text-foreground">{cr.name}</p>
                          <p className="text-sm text-muted-foreground">{cr.platform} · {cr.followers} · Invited to: {camp?.name || "Campaign"}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Invited</Badge>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {creatorListTab === "my" && <h3 className="font-display text-lg font-semibold text-foreground">Active</h3>}
              {filteredCreators.map((cr) => {
                const relation = getCreatorRelation(cr.name);
                const isInvited = invitedCreators.some((ic) => ic.name === cr.name);
                return (
                  <div key={cr.name} className={cardClass + " flex items-center justify-between cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => setSelectedCreatorDetail(cr.name)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{cr.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{cr.name}</p>
                          <Badge className="bg-success/10 text-primary border-0 text-xs">{cr.match}% match</Badge>
                          {relation === "active" && <Badge className="bg-primary/10 text-primary border-0 text-xs">Works with you</Badge>}
                          {relation === "past" && <Badge variant="secondary" className="text-xs">Worked with you</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{cr.platform} · {cr.followers} · {cr.category} · {cr.country}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {isInvited ? (
                        <Button variant="secondary" size="sm" disabled>
                          <Check className="w-4 h-4 mr-1" /> Invited
                        </Button>
                      ) : (
                        <Button variant="hero" size="sm" onClick={() => handleInviteCreator(cr.name)}>
                          <Send className="w-4 h-4 mr-1" /> Invite
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
          </div>
        )}

        {/* Creator detail view */}
        {tab === "creators" && selectedCreatorDetail && (() => {
          const cr = allCreators.find((c) => c.name === selectedCreatorDetail);
          if (!cr) return null;
          const relation = getCreatorRelation(cr.name);
          const isInvited = invitedCreators.some((ic) => ic.name === cr.name);
          const creatorCampaigns = campaigns.filter((c) => c.activeCreators.some((ac) => ac.name === cr.name));
          return (
            <div className="max-w-2xl space-y-6">
              <button onClick={() => setSelectedCreatorDetail(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to creators</button>
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
                  {isInvited ? (
                    <Button variant="secondary" disabled><Check className="w-4 h-4 mr-1" /> Invited</Button>
                  ) : (
                    <Button variant="hero" onClick={() => handleInviteCreator(cr.name)}><Send className="w-4 h-4 mr-1" /> Invite to Campaign</Button>
                  )}
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
                        <p className="text-sm text-muted-foreground">To: {sp.creatorName}</p>
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
            <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: "$0", key: "revenue" },
                { label: "Spent on Creators", value: "$0", key: "spent" },
                { label: "Active Campaigns", value: String(campaigns.filter((c) => c.status === "active").length), key: "campaigns" },
                { label: "Total Creators", value: String(campaigns.reduce((s, c) => s + c.activeCreators.length, 0)), key: "creators" },
                { label: "Subscription", value: plan === "pro" ? "Pro ($49/mo)" : "Basic (Free)", key: "subscription" },
              ].map((s) => (
                <div key={s.label} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => {
                  if (s.key === "subscription") { setSubscriptionDetail(true); } else { setAnalyticsDetail(s.key); }
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
            </h1>
            <div className={sectionCardClass}>
              {campaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data yet. Launch campaigns to see analytics.</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border dark-green-outline">
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.category} · {c.activeCreators.length} creators</p>
                      </div>
                      <div className="text-right">
                        {analyticsDetail === "revenue" && <p className="font-display font-bold text-primary">$0</p>}
                        {analyticsDetail === "spent" && <p className="font-display font-bold text-foreground">${c.activeCreators.reduce((s, cr) => s + cr.earnings, 0)}</p>}
                        {analyticsDetail === "campaigns" && <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>}
                        {analyticsDetail === "creators" && <p className="font-display font-bold text-foreground">{c.activeCreators.length}</p>}
                      </div>
                    </div>
                  ))}
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

        {tab === "creator-view" && !creatorViewSelected && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold text-foreground">Creator View Preview</h1>
            <p className="text-sm text-muted-foreground">See your campaigns from a creator's perspective, alongside other example campaigns.</p>

            <div className="space-y-4">
              {campaigns.filter((c) => c.status === "active").map((c) => (
                <div key={c.id} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => setCreatorViewSelected(c.id)}>
                  <div className="flex items-center gap-4 mb-3">
                    {c.images && c.images.length > 0 ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={c.images[0]} alt="" className="w-full h-full object-cover" /></div>
                    ) : brandLogo ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{(settingsName || "B")[0]}</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                        <Badge className="bg-accent text-accent-foreground border-0 text-xs">Your Campaign</Badge>
                        {plan === "pro" && (
                          <Tooltip>
                            <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                            <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                          </Tooltip>
                        )}
                        {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{settingsName || "Your Brand"} · {c.category} · {c.payMethod}</p>
                      {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                    </div>
                  </div>
                  <Button variant="hero" size="sm" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              ))}

              {exampleCreatorCampaigns.map((c, i) => (
                <div key={i} className={cardClass + " cursor-pointer hover:shadow-card-hover transition-shadow"} onClick={() => setCreatorViewSelected(-(i + 1))}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl">{c.brand[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-foreground">{c.name}</h3>
                        {c.isPro && (
                          <Tooltip>
                            <TooltipTrigger><Crown className="w-5 h-5 text-warning" /></TooltipTrigger>
                            <TooltipContent>Top Brand — Pro subscription with extended creator attribution windows and priority placement</TooltipContent>
                          </Tooltip>
                        )}
                        {c.signOnPay > 0 && <Badge className="bg-success/10 text-primary border-0 text-xs">${c.signOnPay} sign-on pay</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.brand} · {c.category} · {c.adPlatforms.length > 1 ? "Multiple Platforms" : c.adPlatforms[0] || "All"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.payMethod}</p>
                      {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                    </div>
                  </div>
                  <Button variant="hero" size="sm" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creator view campaign detail */}
        {tab === "creator-view" && creatorViewSelected !== null && (() => {
          if (creatorViewSelected > 0) {
            // Brand's own campaign
            const c = campaigns.find((x) => x.id === creatorViewSelected);
            if (!c) return null;
            return (
              <div className="max-w-2xl space-y-6">
                <button onClick={() => setCreatorViewSelected(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div className={sectionCardClass + " space-y-6"}>
                  <div className="flex items-center gap-4">
                    {brandLogo ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border"><img src={brandLogo} alt="" className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">{(settingsName || "B")[0]}</div>
                    )}
                    <div>
                      <h1 className="font-display text-2xl font-bold text-foreground">{c.name}</h1>
                      <p className="text-muted-foreground">{settingsName || "Your Brand"} · {c.category}</p>
                    </div>
                  </div>
                  {c.description && <p className="text-sm text-foreground">{c.description}</p>}
                  {c.notes && <p className="text-sm text-muted-foreground italic">📌 {c.notes}</p>}
                  {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Product Link</a>}
                  {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platform</p><p className="font-semibold text-foreground">{c.platforms?.join(", ") || "All"}</p></div>
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Payment</p><p className="font-semibold text-foreground">{c.payMethod}</p></div>
                    {c.signOnPay > 0 && <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sign-On Pay</p><p className="font-semibold text-primary">${c.signOnPay}</p></div>}
                  </div>
                  {c.images && c.images.length > 0 && (
                    <div className="flex gap-3">
                      {c.images.map((img, i) => (
                        <div key={i} className="w-24 h-24 rounded-xl border border-border overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="hero" size="lg" className="w-full rounded-xl" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              </div>
            );
          } else {
            // Example campaign
            const idx = Math.abs(creatorViewSelected) - 1;
            const c = exampleCreatorCampaigns[idx];
            if (!c) return null;
            return (
              <div className="max-w-2xl space-y-6">
                <button onClick={() => setCreatorViewSelected(null)} className="text-sm text-primary hover:underline flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                <div className={sectionCardClass + " space-y-6"}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl">{c.brand[0]}</div>
                    <div>
                      <h1 className="font-display text-2xl font-bold text-foreground">{c.name}</h1>
                      <p className="text-muted-foreground">{c.brand} · {c.category}</p>
                    </div>
                  </div>
                  {c.description && <p className="text-sm text-foreground">{c.description}</p>}
                  {c.notes && <p className="text-sm text-muted-foreground italic">📌 {c.notes}</p>}
                  {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Brand Website</a>}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Platform</p><p className="font-semibold text-foreground">{c.adPlatforms.length > 1 ? c.adPlatforms.join(", ") : c.adPlatforms[0] || "All"}</p></div>
                    <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Payment</p><p className="font-semibold text-foreground">{c.payMethod}</p></div>
                    {c.signOnPay > 0 && <div className="p-4 rounded-xl bg-muted/50 dark-green-outline"><p className="text-xs text-muted-foreground">Sign-On Pay</p><p className="font-semibold text-primary">${c.signOnPay}</p></div>}
                  </div>
                  <Button variant="hero" size="lg" className="w-full rounded-xl" disabled>{c.requireApply ? "Apply" : "Join Campaign"}</Button>
                </div>
              </div>
            );
          }
        })()}

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
                <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted"} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
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
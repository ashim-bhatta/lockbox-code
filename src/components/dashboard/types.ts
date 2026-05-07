export type DashboardLockbox = {
  id: string;
  title: string;
  fileSize: string;
  priceLabel: string;
  priceCents: number;
  createdLabel: string;
  createdAt: string;
  status: "paid" | "pending" | "disabled";
  icon: "lock" | "image" | "bar_chart";
  previewText: string;
  previewUrl: string;
  secureLink: string;
  platformFeePercent: number;
  requiresPassword: boolean;
  isListed: boolean;
};

export type DashboardStats = {
  totalRevenueLabel: string;
  activeLinksLabel: string;
  totalTipsLabel: string;
};

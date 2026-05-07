"use client"

import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Bold,
  CalendarDays,
  CheckCircle2,
  Code,
  CreditCard,
  X,
  ChevronDown,
  ChevronRight,
  Coffee,
  Copy,
  Download,
  Eye,
  Filter,
  FolderArchive,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  Italic,
  KeyRound,
  Link as LinkIcon,
  Layers3,
  List,
  ListOrdered,
  Lock,
  Mail,
  Maximize2,
  Menu,
  MoreVertical,
  Moon,
  Minimize2,
  PanelLeft,
  Plus,
  ShieldCheck,
  Shield,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Unlock,
  Users,
  UserRoundCheck,
  Wallet,
  Zap,
  LogOut,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"

const ICONS = {
  more_horiz: MoreHorizontal,
  lock: Lock,
  folder_zip: FolderArchive,
  unlock: Unlock,
  key: KeyRound,
  vpn_key: KeyRound,
  mail: Mail,
  add: Plus,
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  arrow_upward: ArrowUp,
  trending_up: TrendingUp,
  dashboard: BarChart3,
  layers: Layers3,
  bar_chart: BarChart3,
  link: LinkIcon,
  payments: Wallet,
  account_balance_wallet: Wallet,
  visibility: Eye,
  download: Download,
  credit_card: CreditCard,
  filter_list: Filter,
  content_copy: Copy,
  more_vert: MoreVertical,
  expand_more: ChevronDown,
  chevron_right: ChevronRight,
  calendar_today: CalendarDays,
  favorite: Star,
  check_circle: CheckCircle2,
  auto_awesome: Sparkles,
  notifications: Bell,
  menu: Menu,
  close: X,
  settings: Settings,
  dark_mode: Moon,
  shield_check: ShieldCheck,
  coffee: Coffee,
  image: ImageIcon,
  group: Users,
  shield: Shield,
  verified_user: UserRoundCheck,
  bolt: Zap,
  alert_triangle: AlertTriangle,
  logout: LogOut,
  refresh: RefreshCw,

  view_sidebar: PanelLeft,
  tune: SlidersHorizontal,
  fullscreen: Maximize2,
  fullscreen_exit: Minimize2,
  open_in_full: Maximize2,
  close_fullscreen: Minimize2,
  drag_indicator: GripVertical,

  title: Heading2,
  format_bold: Bold,
  format_italic: Italic,
  code: Code,
  format_list_bulleted: List,
  format_list_numbered: ListOrdered,
} satisfies Record<string, LucideIcon>

export function AppIcon({
  name,
  className,
  size = 18,
  strokeWidth = 2,
}: {
  name: keyof typeof ICONS
  className?: string
  size?: number
  strokeWidth?: number
}) {
  const Icon = ICONS[name]
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden='true'
    />
  )
}

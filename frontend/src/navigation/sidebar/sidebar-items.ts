import { Boxes, LayoutDashboard, Map as MapIcon, ShoppingCart, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavBadge = "new" | "updated" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Mi finca",
    items: [
      { id: "inicio", title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
      { id: "lotes", title: "Lotes", url: "/dashboard/lotes", icon: MapIcon },
      { id: "cosechas", title: "Cosechas", url: "/dashboard/cosechas", icon: Sprout },
      { id: "inventario", title: "Inventario", url: "/dashboard/inventario", icon: Boxes },
      { id: "ventas", title: "Ventas", url: "/dashboard/ventas", icon: ShoppingCart },
    ],
  },
];

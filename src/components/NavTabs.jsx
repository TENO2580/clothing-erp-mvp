import React from "react";
import {
  LayoutDashboard, Shirt, ShoppingCart, Truck, Users, Store, BarChart3, ReceiptText
} from "lucide-react";
import { ACCENT } from "../data/seedData";

export const NAV_CONFIG = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "inventory", label: "Inventory", icon: Shirt, badgeKey: "products" },
  { key: "sales", label: "Sales & POS", icon: ShoppingCart, badgeKey: "sales" },
  { key: "purchases", label: "Purchases", icon: Truck, badgeKey: "purchases" },
  { key: "customers", label: "Customers", icon: Users, badgeKey: "customers" },
  { key: "suppliers", label: "Suppliers", icon: Store, badgeKey: "suppliers" },
  { key: "reports", label: "Sales Report", icon: ReceiptText },
];

export function NavTabs({ active, onChange, counts = {} }) {
  return (
    <nav className="border-b border-stone-200 bg-white sticky z-20 top-[61px] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto no-scrollbar">
        {NAV_CONFIG.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          const count = item.badgeKey ? counts[item.badgeKey] : null;

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? "border-amber-800 text-amber-900 bg-amber-50/50"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              <Icon size={16} className={isActive ? "text-amber-800" : "text-stone-400"} />
              <span>{item.label}</span>
              {count !== undefined && count !== null && (
                <span 
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? "bg-amber-800 text-white" 
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

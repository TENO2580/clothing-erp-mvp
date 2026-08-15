import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Shirt, ShoppingCart, Truck, Users, Store, BarChart3,
  Plus, Search, Pencil, Trash2, X, Minus, AlertTriangle, IndianRupee, Calendar, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

/* ------------------------------- Constants ------------------------------- */

const ACCENT = "#8B5E34";
const NAVY = "#1E2233";
const DANGER = "#B3261E";
const CATEGORY_COLORS = { Gents: "#2F4B7C", Kids: "#2E7D4F", Women: "#A6446E" };

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "inventory", label: "Inventory", icon: Shirt },
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "purchases", label: "Purchases", icon: Truck },
  { key: "customers", label: "Customers", icon: Users },
  { key: "suppliers", label: "Suppliers", icon: Store },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

const STORAGE_KEYS = {
  products: "erp_products",
  customers: "erp_customers",
  suppliers: "erp_suppliers",
  sales: "erp_sales",
  purchases: "erp_purchases",
};

/* --------------------------------- Seed data -------------------------------- */

const SEED_PRODUCTS = [
  { id: "p1", name: "Cotton Formal Shirt", category: "Gents", subcategory: "Shirts", size: "L", color: "White", sku: "GEN-SH-001", cost: 450, price: 799, stock: 24, reorder: 10 },
  { id: "p2", name: "Slim Fit Casual Shirt", category: "Gents", subcategory: "Shirts", size: "M", color: "Sky Blue", sku: "GEN-SH-002", cost: 420, price: 749, stock: 18, reorder: 10 },
  { id: "p3", name: "Round Neck T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "XL", color: "Black", sku: "GEN-TS-003", cost: 180, price: 349, stock: 40, reorder: 15 },
  { id: "p4", name: "Polo T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "L", color: "Navy", sku: "GEN-TS-004", cost: 220, price: 449, stock: 30, reorder: 15 },
  { id: "p5", name: "Formal Trousers", category: "Gents", subcategory: "Trousers", size: "34", color: "Grey", sku: "GEN-TR-005", cost: 500, price: 899, stock: 20, reorder: 8 },
  { id: "p6", name: "Denim Jeans", category: "Gents", subcategory: "Jeans", size: "32", color: "Dark Blue", sku: "GEN-JN-006", cost: 650, price: 1199, stock: 22, reorder: 8 },
  { id: "p7", name: "Cotton Kurta", category: "Gents", subcategory: "Ethnic", size: "L", color: "White", sku: "GEN-KU-007", cost: 380, price: 699, stock: 15, reorder: 6 },
  { id: "p8", name: "Blazer", category: "Gents", subcategory: "Formal", size: "40", color: "Charcoal", sku: "GEN-BL-008", cost: 1400, price: 2499, stock: 6, reorder: 3 },
  { id: "p9", name: "Mundu (Kerala Dhoti)", category: "Gents", subcategory: "Ethnic", size: "Free", color: "Cream", sku: "GEN-MU-009", cost: 250, price: 449, stock: 35, reorder: 12 },
  { id: "p10", name: "Sports Track Pant", category: "Gents", subcategory: "Sportswear", size: "L", color: "Black", sku: "GEN-TP-010", cost: 300, price: 549, stock: 25, reorder: 10 },
  { id: "p11", name: "Boys Printed T-Shirt", category: "Kids", subcategory: "T-Shirts", size: "6-7Y", color: "Red", sku: "KID-TS-001", cost: 150, price: 299, stock: 28, reorder: 10 },
  { id: "p12", name: "Girls Cotton Frock", category: "Kids", subcategory: "Dresses", size: "4-5Y", color: "Pink", sku: "KID-FR-002", cost: 280, price: 549, stock: 20, reorder: 8 },
  { id: "p13", name: "Kids Denim Shorts", category: "Kids", subcategory: "Shorts", size: "8-9Y", color: "Blue", sku: "KID-SH-003", cost: 200, price: 399, stock: 18, reorder: 8 },
  { id: "p14", name: "School Uniform Shirt", category: "Kids", subcategory: "Uniform", size: "10-11Y", color: "White", sku: "KID-UN-004", cost: 220, price: 399, stock: 30, reorder: 12 },
  { id: "p15", name: "Boys Cargo Pants", category: "Kids", subcategory: "Pants", size: "8-9Y", color: "Olive", sku: "KID-CP-005", cost: 260, price: 499, stock: 16, reorder: 6 },
  { id: "p16", name: "Girls Party Dress", category: "Kids", subcategory: "Dresses", size: "6-7Y", color: "Lavender", sku: "KID-PD-006", cost: 450, price: 899, stock: 10, reorder: 4 },
  { id: "p17", name: "Infant Romper Set", category: "Kids", subcategory: "Infant", size: "0-1Y", color: "Yellow", sku: "KID-RM-007", cost: 180, price: 349, stock: 22, reorder: 8 },
  { id: "p18", name: "Kids Ethnic Kurta Set", category: "Kids", subcategory: "Ethnic", size: "4-5Y", color: "Maroon", sku: "KID-ES-008", cost: 380, price: 699, stock: 12, reorder: 5 },
  { id: "p19", name: "Boys Track Suit", category: "Kids", subcategory: "Sportswear", size: "10-11Y", color: "Navy", sku: "KID-TR-009", cost: 320, price: 599, stock: 14, reorder: 6 },
  { id: "p20", name: "Girls Leggings", category: "Kids", subcategory: "Leggings", size: "6-7Y", color: "Pink", sku: "KID-LG-010", cost: 120, price: 249, stock: 26, reorder: 10 },
  { id: "p21", name: "Cotton Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Teal", sku: "WOM-SR-001", cost: 650, price: 1299, stock: 15, reorder: 5 },
  { id: "p22", name: "Anarkali Salwar Suit", category: "Women", subcategory: "Salwar Suits", size: "L", color: "Maroon", sku: "WOM-SK-002", cost: 800, price: 1599, stock: 12, reorder: 5 },
  { id: "p23", name: "Printed Kurti", category: "Women", subcategory: "Kurtis", size: "M", color: "Mustard", sku: "WOM-KU-003", cost: 350, price: 649, stock: 25, reorder: 10 },
  { id: "p24", name: "Western Top", category: "Women", subcategory: "Tops", size: "S", color: "White", sku: "WOM-TP-004", cost: 280, price: 549, stock: 22, reorder: 8 },
  { id: "p25", name: "Palazzo Pants", category: "Women", subcategory: "Bottoms", size: "M", color: "Black", sku: "WOM-PL-005", cost: 300, price: 599, stock: 20, reorder: 8 },
  { id: "p26", name: "Leggings", category: "Women", subcategory: "Bottoms", size: "L", color: "Beige", sku: "WOM-LG-006", cost: 150, price: 299, stock: 30, reorder: 12 },
  { id: "p27", name: "Silk Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Golden", sku: "WOM-SS-007", cost: 1800, price: 3499, stock: 8, reorder: 3 },
  { id: "p28", name: "Denim Jacket", category: "Women", subcategory: "Jackets", size: "M", color: "Blue", sku: "WOM-DJ-008", cost: 550, price: 999, stock: 10, reorder: 4 },
  { id: "p29", name: "Nightwear Set", category: "Women", subcategory: "Nightwear", size: "L", color: "Pink", sku: "WOM-NW-009", cost: 320, price: 599, stock: 18, reorder: 6 },
  { id: "p30", name: "Designer Blouse", category: "Women", subcategory: "Blouses", size: "M", color: "Red", sku: "WOM-BL-010", cost: 250, price: 449, stock: 16, reorder: 6 },
];

const SEED_CUSTOMERS = [
  { id: "c1", name: "Anitha Nair", phone: "9846012345", email: "anitha.nair@example.com" },
  { id: "c2", name: "Ravi Kumar", phone: "9847023456", email: "ravi.kumar@example.com" },
  { id: "c3", name: "Sneha Thomas", phone: "9895034567", email: "sneha.thomas@example.com" },
  { id: "c4", name: "Mohammed Rafi", phone: "9744045678", email: "m.rafi@example.com" },
  { id: "c5", name: "Divya Menon", phone: "9633056789", email: "divya.menon@example.com" },
  { id: "c6", name: "Arjun Pillai", phone: "9744067890", email: "arjun.pillai@example.com" },
  { id: "c7", name: "Fathima Beevi", phone: "9895078901", email: "fathima.beevi@example.com" },
  { id: "c8", name: "Sunil Varma", phone: "9847089012", email: "sunil.varma@example.com" },
];

const SEED_SUPPLIERS = [
  { id: "s1", name: "Kochi Textiles Pvt Ltd", category: "Gents & Kids", location: "Kochi", phone: "9847011111" },
  { id: "s2", name: "Trivandrum Garments Co", category: "Women", location: "Trivandrum", phone: "9847022222" },
  { id: "s3", name: "Coimbatore Fabric House", category: "All Categories", location: "Coimbatore", phone: "9847033333" },
  { id: "s4", name: "Little Stars Kidswear", category: "Kids", location: "Kollam", phone: "9847044444" },
  { id: "s5", name: "Silk Route Sarees", category: "Women", location: "Kannur", phone: "9847055555" },
  { id: "s6", name: "Metro Menswear Suppliers", category: "Gents", location: "Kochi", phone: "9847066666" },
];

const SEED_SALES = [
  { id: "sl1", date: "2026-07-18", customerId: "c1", paymentMode: "UPI", items: [{ productId: "p1", qty: 1, price: 799 }, { productId: "p5", qty: 1, price: 899 }] },
  { id: "sl2", date: "2026-07-19", customerId: null, paymentMode: "Cash", items: [{ productId: "p23", qty: 2, price: 649 }] },
  { id: "sl3", date: "2026-07-20", customerId: "c2", paymentMode: "Card", items: [{ productId: "p11", qty: 3, price: 299 }, { productId: "p20", qty: 1, price: 249 }] },
  { id: "sl4", date: "2026-07-22", customerId: "c3", paymentMode: "UPI", items: [{ productId: "p21", qty: 1, price: 1299 }] },
  { id: "sl5", date: "2026-07-24", customerId: "c4", paymentMode: "Cash", items: [{ productId: "p6", qty: 1, price: 1199 }, { productId: "p4", qty: 1, price: 449 }] },
  { id: "sl6", date: "2026-07-26", customerId: null, paymentMode: "UPI", items: [{ productId: "p12", qty: 1, price: 549 }, { productId: "p16", qty: 1, price: 899 }] },
  { id: "sl7", date: "2026-07-28", customerId: "c5", paymentMode: "Card", items: [{ productId: "p25", qty: 1, price: 599 }, { productId: "p24", qty: 1, price: 549 }] },
  { id: "sl8", date: "2026-07-30", customerId: "c6", paymentMode: "Cash", items: [{ productId: "p7", qty: 2, price: 699 }] },
  { id: "sl9", date: "2026-08-01", customerId: "c7", paymentMode: "UPI", items: [{ productId: "p27", qty: 1, price: 3499 }] },
  { id: "sl10", date: "2026-08-02", customerId: null, paymentMode: "Cash", items: [{ productId: "p14", qty: 4, price: 399 }] },
  { id: "sl11", date: "2026-08-04", customerId: "c8", paymentMode: "Card", items: [{ productId: "p8", qty: 1, price: 2499 }] },
  { id: "sl12", date: "2026-08-06", customerId: "c1", paymentMode: "UPI", items: [{ productId: "p26", qty: 2, price: 299 }, { productId: "p30", qty: 1, price: 449 }] },
  { id: "sl13", date: "2026-08-08", customerId: null, paymentMode: "Cash", items: [{ productId: "p19", qty: 1, price: 599 }, { productId: "p15", qty: 1, price: 499 }] },
  { id: "sl14", date: "2026-08-10", customerId: "c2", paymentMode: "Cash", items: [{ productId: "p9", qty: 2, price: 449 }] },
  { id: "sl15", date: "2026-08-12", customerId: "c3", paymentMode: "UPI", items: [{ productId: "p22", qty: 1, price: 1599 }] },
  { id: "sl16", date: "2026-08-14", customerId: null, paymentMode: "Card", items: [{ productId: "p3", qty: 2, price: 349 }, { productId: "p11", qty: 2, price: 299 }] },
];

const SEED_PURCHASES = [
  { id: "pu1", date: "2026-07-15", supplierId: "s1", status: "Received", items: [{ productId: "p1", qty: 20, cost: 450 }, { productId: "p5", qty: 15, cost: 500 }] },
  { id: "pu2", date: "2026-07-17", supplierId: "s4", status: "Received", items: [{ productId: "p11", qty: 30, cost: 150 }, { productId: "p20", qty: 25, cost: 120 }] },
  { id: "pu3", date: "2026-07-20", supplierId: "s5", status: "Received", items: [{ productId: "p21", qty: 10, cost: 650 }, { productId: "p27", qty: 6, cost: 1800 }] },
  { id: "pu4", date: "2026-07-25", supplierId: "s6", status: "Received", items: [{ productId: "p6", qty: 15, cost: 650 }, { productId: "p8", qty: 5, cost: 1400 }] },
  { id: "pu5", date: "2026-07-29", supplierId: "s3", status: "Received", items: [{ productId: "p23", qty: 20, cost: 350 }, { productId: "p3", qty: 25, cost: 180 }] },
  { id: "pu6", date: "2026-08-02", supplierId: "s2", status: "Received", items: [{ productId: "p25", qty: 15, cost: 300 }, { productId: "p24", qty: 15, cost: 280 }] },
  { id: "pu7", date: "2026-08-06", supplierId: "s4", status: "Received", items: [{ productId: "p12", qty: 12, cost: 280 }, { productId: "p16", qty: 8, cost: 450 }] },
  { id: "pu8", date: "2026-08-11", supplierId: "s6", status: "Pending", items: [{ productId: "p9", qty: 20, cost: 250 }] },
];

/* -------------------------------- Helpers -------------------------------- */

function genId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}
function fmtINR(n) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function saleTotal(sale) {
  return sale.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}
function purchaseTotal(po) {
  return po.items.reduce((sum, it) => sum + it.qty * it.cost, 0);
}
function customerName(customers, id) {
  if (!id) return "Walk-in Customer";
  const found = customers.find((c) => c.id === id);
  return found ? found.name : "Walk-in Customer";
}
function supplierName(suppliers, id) {
  const found = suppliers.find((s) => s.id === id);
  return found ? found.name : "Unknown Supplier";
}
function categoryRevenue(salesList, products) {
  const revenue = { Gents: 0, Kids: 0, Women: 0 };
  const qty = { Gents: 0, Kids: 0, Women: 0 };
  salesList.forEach((s) => s.items.forEach((it) => {
    const p = products.find((pp) => pp.id === it.productId);
    if (!p) return;
    revenue[p.category] = (revenue[p.category] || 0) + it.qty * it.price;
    qty[p.category] = (qty[p.category] || 0) + it.qty;
  }));
  return ["Gents", "Kids", "Women"].map((cat) => ({ category: cat, revenue: revenue[cat], qty: qty[cat] }));
}
function topProducts(salesList, products, n) {
  const map = {};
  salesList.forEach((s) => s.items.forEach((it) => {
    if (!map[it.productId]) map[it.productId] = { qty: 0, revenue: 0 };
    map[it.productId].qty += it.qty;
    map[it.productId].revenue += it.qty * it.price;
  }));
  return Object.keys(map)
    .map((pid) => ({ product: products.find((p) => p.id === pid), qty: map[pid].qty, revenue: map[pid].revenue }))
    .filter((x) => x.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, n);
}
function paymentModeSplit(salesList) {
  const map = {};
  salesList.forEach((s) => { map[s.paymentMode] = (map[s.paymentMode] || 0) + saleTotal(s); });
  return Object.keys(map).map((mode) => ({ name: mode, value: map[mode] }));
}
function emptyProduct() {
  return { name: "", category: "Gents", subcategory: "", size: "", color: "", sku: "", cost: 0, price: 0, stock: 0, reorder: 5 };
}
function emptyCustomer() {
  return { name: "", phone: "", email: "" };
}
function emptySupplier() {
  return { name: "", category: "", location: "", phone: "" };
}

/* ----------------------------- Small components ---------------------------- */

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2 bg-white border border-stone-200">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-stone-500">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tint + "1A" }}>
          <Icon size={16} color={tint} />
        </div>
      </div>
      <div className="text-2xl font-serif font-semibold text-stone-900">{value}</div>
      {sub ? <div className="text-xs text-stone-400">{sub}</div> : null}
    </div>
  );
}

function CategoryTag({ category }) {
  const color = CATEGORY_COLORS[category] || ACCENT;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: color + "1A", color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
      {category}
    </span>
  );
}

function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(30,34,51,0.55)" }} onClick={onClose}>
      <div
        className={(wide ? "max-w-2xl" : "max-w-md") + " w-full rounded-2xl p-5"}
        style={{ background: "#FFFFFF", maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100">
            <X size={18} color="#78716C" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: NAVY }}>
          <Shirt size={18} color="#F2EEE6" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold leading-tight text-stone-900">Vastra Fashion House</h1>
          <p className="text-xs text-stone-400 leading-tight">Gents · Kids · Women — Operations</p>
        </div>
      </div>
    </header>
  );
}

function NavTabs({ active, onChange }) {
  return (
    <nav className="border-b border-stone-200 bg-white sticky z-20" style={{ top: "57px" }}>
      <div className="max-w-6xl mx-auto px-2 flex overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 flex-shrink-0"
              style={{ borderColor: isActive ? ACCENT : "transparent", color: isActive ? ACCENT : "#8A8377" }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* -------------------------------- Dashboard -------------------------------- */

function DashboardView({ products, sales, customers }) {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const last30Iso = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const monthPrefix = todayIso.slice(0, 7);

  const last30Sales = sales.filter((s) => s.date >= last30Iso);
  const monthSales = sales.filter((s) => s.date.startsWith(monthPrefix));
  const last30Revenue = last30Sales.reduce((sum, s) => sum + saleTotal(s), 0);
  const monthRevenue = monthSales.reduce((sum, s) => sum + saleTotal(s), 0);
  const invValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorder);
  const catData = categoryRevenue(last30Sales, products);
  const recent = [...sales].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={IndianRupee} label="Sales (30 Days)" value={fmtINR(last30Revenue)} tint={ACCENT} />
        <StatCard icon={Calendar} label="Sales (This Month)" value={fmtINR(monthRevenue)} tint={CATEGORY_COLORS.Gents} sub={monthPrefix} />
        <StatCard icon={Package} label="Inventory Value" value={fmtINR(invValue)} tint={CATEGORY_COLORS.Kids} sub={products.length + " products"} />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={lowStock.length} tint={DANGER} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-serif font-semibold text-stone-900 mb-3">Category Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#A8A29E" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#A8A29E" }} />
              <Tooltip cursor={{ fill: "#F5F5F4" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {catData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || ACCENT} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <h3 className="font-serif font-semibold text-stone-900 mb-3">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-stone-500">All products are sufficiently stocked.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStock.slice(0, 5).map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-stone-800">{p.name}</div>
                    <div className="text-xs text-stone-400">SKU: {p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-medium">{p.stock} left</div>
                    <div className="text-xs text-stone-400">Reorder at {p.reorder}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products] = useState(SEED_PRODUCTS);
  const [sales] = useState(SEED_SALES);
  const [customers] = useState(SEED_CUSTOMERS);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-stone-800 font-sans">
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <DashboardView products={products} sales={sales} customers={customers} />}
        {activeTab !== "dashboard" && (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <h2 className="text-lg font-medium mb-2 capitalize">{activeTab} View</h2>
            <p className="text-sm">This module is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
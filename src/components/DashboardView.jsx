import React from "react";
import {
  IndianRupee, Calendar, Package, AlertTriangle, ArrowRight,
  TrendingUp, CreditCard, ShoppingBag, PlusCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  fmtINR, fmtDate, saleTotal, customerName,
  ACCENT, NAVY, DANGER, SUCCESS, CATEGORY_COLORS
} from "../data/seedData";
import { StatCard, CategoryTag, Badge } from "./UIComponents";

export function DashboardView({ products, sales, customers, suppliers, purchases, onNavigate }) {
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

  // Category revenue
  const categoryData = ["Gents", "Kids", "Women"].map((cat) => {
    let rev = 0;
    let qty = 0;
    last30Sales.forEach((s) => {
      s.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        if (prod && prod.category === cat) {
          rev += it.qty * it.price;
          qty += it.qty;
        }
      });
    });
    return { category: cat, revenue: rev, units: qty };
  });

  // Payment mode data
  const paymentModeMap = {};
  sales.forEach((s) => {
    paymentModeMap[s.paymentMode] = (paymentModeMap[s.paymentMode] || 0) + saleTotal(s);
  });
  const paymentData = Object.keys(paymentModeMap).map((mode) => ({
    name: mode,
    value: paymentModeMap[mode],
  }));

  const PAYMENT_COLORS = {
    UPI: "#7C3AED",
    Cash: "#059669",
    Card: "#2563EB",
  };

  const recentSales = [...sales].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif tracking-tight">
            Welcome back to Vastra Fashion ERP
          </h2>
          <p className="text-stone-300 text-xs mt-1">
            Store Status: <span className="text-emerald-400 font-semibold">Online & Operating</span> · {products.length} Active SKUs · {customers.length} Registered Clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("sales")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle size={15} /> New POS Sale
          </button>
          <button
            onClick={() => onNavigate("purchases")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all"
          >
            <Package size={15} /> New Stock In
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={IndianRupee}
          label="Sales (Last 30 Days)"
          value={fmtINR(last30Revenue)}
          sub={`${last30Sales.length} Completed Invoices`}
          tint={ACCENT}
        />
        <StatCard
          icon={Calendar}
          label="Sales (This Month)"
          value={fmtINR(monthRevenue)}
          sub={`Period: ${monthPrefix}`}
          tint={CATEGORY_COLORS.Gents}
        />
        <StatCard
          icon={Package}
          label="Inventory Valuation"
          value={fmtINR(invValue)}
          sub={`${products.reduce((acc, p) => acc + p.stock, 0)} Total Garments`}
          tint={CATEGORY_COLORS.Kids}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={lowStock.length}
          sub={lowStock.length > 0 ? "Requires Reordering" : "All stocks healthy"}
          tint={lowStock.length > 0 ? DANGER : SUCCESS}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Category Revenue Breakdown
              </h3>
              <p className="text-xs text-stone-400">Past 30 days performance across segments</p>
            </div>
            <button 
              onClick={() => onNavigate("sales-report")} 
              className="text-xs text-amber-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Full Report <ArrowRight size={13} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#78716C", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#78716C", fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [fmtINR(val), "Revenue"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E7E5E4", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || ACCENT} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Modes Pie Chart */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
              Payment Methods
            </h3>
            <p className="text-xs text-stone-400 mb-2">Revenue split by payment channel</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || "#A8A29E"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [fmtINR(val), "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-center">
            {paymentData.map((p) => (
              <div key={p.name} className="p-2 rounded-xl bg-stone-50">
                <div className="text-[11px] font-bold text-stone-500">{p.name}</div>
                <div className="text-xs font-bold text-stone-900 mt-0.5">{fmtINR(p.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Tables: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">Recent Sales</h3>
              <p className="text-xs text-stone-400">Latest customer transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate("sales-report")} 
                className="text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border border-amber-200"
              >
                📊 Full Sales Report
              </button>
              <button 
                onClick={() => onNavigate("sales")} 
                className="text-xs text-stone-500 font-semibold flex items-center gap-1 hover:underline"
              >
                POS Counter <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {recentSales.map((s) => {
              const cust = customers.find((c) => c.id === s.customerId);
              const total = saleTotal(s);
              return (
                <div key={s.id} className="py-3 flex items-center justify-between hover:bg-stone-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {s.paymentMode.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900">
                        {cust ? cust.name : "Walk-in Customer"}
                      </div>
                      <div className="text-xs text-stone-400">
                        {s.id} · {fmtDate(s.date)} · {s.items.length} items
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-stone-900">{fmtINR(total)}</div>
                    <Badge variant={s.paymentMode === "UPI" ? "info" : s.paymentMode === "Cash" ? "success" : "default"}>
                      {s.paymentMode}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Low Stock Warnings</h3>
                <p className="text-xs text-stone-400">Products at or below reorder threshold</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate("inventory")} 
              className="text-xs text-amber-800 font-semibold flex items-center gap-1 hover:underline"
            >
              Manage Inventory <ArrowRight size={13} />
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">
              ✨ All products are currently sufficiently stocked!
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-stone-50/50 px-2 rounded-xl transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      {p.name}
                      <CategoryTag category={p.category} />
                    </div>
                    <div className="text-xs text-stone-400">
                      SKU: {p.sku} · Size: {p.size} · Color: {p.color}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-600">
                      {p.stock} units left
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Reorder level: {p.reorder}
                    </div>
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

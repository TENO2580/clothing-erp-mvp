import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, IndianRupee, PieChart as PieIcon, BarChart3,
  Award, ArrowUpRight, CheckCircle, Percent, Download,
  Receipt, ShoppingCart, Calendar, User, Search, Filter,
  Layers, ArrowDownUp, CreditCard, Banknote, QrCode
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  fmtINR, fmtDate, CATEGORY_COLORS, ACCENT, saleTotal, customerName
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, CategoryTag, Badge, SearchInput, TablePagination } from "./UIComponents";

export function ReportsView({ sales, products, customers }) {
  const [reportTab, setReportTab] = useState("sales-pos"); // "sales-pos" (default) or "analytics"
  
  // Search & Filters for Sales & POS Report
  const [salesSearch, setSalesSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); // All, 7days, 30days

  // Pagination states for Sales & POS Report Table
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);

  // Pagination states for Leaderboard Table
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardPageSize, setLeaderboardPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setSalesPage(1);
  }, [salesSearch, paymentFilter, dateFilter]);

  // Financial metrics calculation from Sales & POS
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalUnitsSold = 0;
    let paymentSplit = { UPI: 0, Cash: 0, Card: 0 };

    sales.forEach((s) => {
      const invTotal = saleTotal(s);
      if (paymentSplit[s.paymentMode] !== undefined) {
        paymentSplit[s.paymentMode] += invTotal;
      }

      s.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const costPerUnit = prod ? prod.cost : 0;
        totalRevenue += it.qty * it.price;
        totalCostOfGoods += it.qty * costPerUnit;
        totalUnitsSold += it.qty;
      });
    });

    const grossProfit = totalRevenue - totalCostOfGoods;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCostOfGoods,
      grossProfit,
      grossMargin: Math.round(grossMargin),
      totalUnitsSold,
      paymentSplit,
      avgOrderValue: sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0,
    };
  }, [sales, products]);

  // Filtered Sales & POS list
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const custName = cust ? cust.name : "Walk-in Customer";
      const custPhone = cust ? cust.phone : "";

      // Match item names in invoice
      const itemNames = s.items
        .map((it) => {
          const p = products.find((prod) => prod.id === it.productId);
          return p ? `${p.name} ${p.sku}` : "";
        })
        .join(" ");

      const matchesSearch =
        s.id.toLowerCase().includes(salesSearch.toLowerCase()) ||
        custName.toLowerCase().includes(salesSearch.toLowerCase()) ||
        custPhone.includes(salesSearch) ||
        itemNames.toLowerCase().includes(salesSearch.toLowerCase());

      const matchesPayment = paymentFilter === "All" || s.paymentMode === paymentFilter;

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== "All") {
        const saleDate = new Date(s.date);
        const now = new Date();
        const daysDiff = (now - saleDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === "7days") matchesDate = daysDiff <= 7;
        if (dateFilter === "30days") matchesDate = daysDiff <= 30;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [sales, products, customers, salesSearch, paymentFilter, dateFilter]);

  const paginatedSales = useMemo(() => {
    return filteredSales.slice(
      (salesPage - 1) * salesPageSize,
      salesPage * salesPageSize
    );
  }, [filteredSales, salesPage, salesPageSize]);

  // Top Selling Products Leaderboard
  const topSelling = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { qty: 0, revenue: 0, cost: 0 };
        }
        const prod = products.find((p) => p.id === it.productId);
        map[it.productId].qty += it.qty;
        map[it.productId].revenue += it.qty * it.price;
        map[it.productId].cost += it.qty * (prod ? prod.cost : 0);
      });
    });

    return Object.keys(map)
      .map((pid) => {
        const prod = products.find((p) => p.id === pid);
        const data = map[pid];
        return {
          product: prod,
          qty: data.qty,
          revenue: data.revenue,
          profit: data.revenue - data.cost,
        };
      })
      .filter((x) => x.product)
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, products]);

  const paginatedTopSelling = useMemo(() => {
    return topSelling.slice(
      (leaderboardPage - 1) * leaderboardPageSize,
      leaderboardPage * leaderboardPageSize
    );
  }, [topSelling, leaderboardPage, leaderboardPageSize]);

  // Category analytics
  const categoryAnalytics = useMemo(() => {
    const cats = { Gents: { rev: 0, qty: 0 }, Kids: { rev: 0, qty: 0 }, Women: { rev: 0, qty: 0 } };
    sales.forEach((s) => {
      s.items.forEach((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        if (p && cats[p.category]) {
          cats[p.category].rev += it.qty * it.price;
          cats[p.category].qty += it.qty;
        }
      });
    });

    return ["Gents", "Kids", "Women"].map((cat) => ({
      category: cat,
      revenue: cats[cat].rev,
      units: cats[cat].qty,
      share: financialSummary.totalRevenue > 0
        ? Math.round((cats[cat].rev / financialSummary.totalRevenue) * 100)
        : 0,
    }));
  }, [sales, products, financialSummary]);

  // Export Detailed Itemized Sales Report CSV
  const handleExportDetailedSalesCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Payment Mode",
      "Garment Name",
      "SKU",
      "Category",
      "Quantity Sold",
      "Unit Price (INR)",
      "Unit Cost (INR)",
      "Line Revenue (INR)",
      "Line Profit (INR)",
      "Invoice Grand Total (INR)",
    ];

    const rows = [];
    filteredSales.forEach((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const invTotal = saleTotal(s);
      s.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const unitCost = prod ? prod.cost : 0;
        const lineRev = it.qty * it.price;
        const lineProfit = lineRev - it.qty * unitCost;

        rows.push([
          s.id,
          s.date,
          cust ? cust.name : "Walk-in Customer",
          cust ? cust.phone : "N/A",
          s.paymentMode,
          prod ? prod.name : "Garment Item",
          prod ? prod.sku : "N/A",
          prod ? prod.category : "N/A",
          it.qty,
          it.price,
          unitCost,
          lineRev,
          lineProfit,
          invTotal,
        ]);
      });
    });

    exportToCSV(`vastra_detailed_sales_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleExportPerformanceCSV = () => {
    const headers = [
      "Garment Name",
      "SKU",
      "Category",
      "Units Sold",
      "Selling Price (INR)",
      "Total Sales Revenue (INR)",
      "Gross Profit (INR)",
    ];

    const rows = topSelling.map((it) => [
      it.product.name,
      it.product.sku,
      it.product.category,
      it.qty,
      it.product.price,
      it.revenue,
      it.profit,
    ]);

    exportToCSV(`vastra_sales_performance_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial KPIs from POS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={IndianRupee}
          label="Total Gross Sales"
          value={fmtINR(financialSummary.totalRevenue)}
          sub={`${sales.length} customer invoices`}
          tint={ACCENT}
        />
        <StatCard
          icon={TrendingUp}
          label="Gross Profit"
          value={fmtINR(financialSummary.grossProfit)}
          sub={`${financialSummary.grossMargin}% Net Margin`}
          tint="#059669"
        />
        <StatCard
          icon={ShoppingCart}
          label="Average Order Value"
          value={fmtINR(financialSummary.avgOrderValue)}
          sub="Per POS retail transaction"
          tint="#D97706"
        />
        <StatCard
          icon={Award}
          label="Total Units Dispatched"
          value={`${financialSummary.totalUnitsSold} Pcs`}
          sub="Garments billed across all categories"
          tint={CATEGORY_COLORS.Women}
        />
      </div>

      {/* Report Section Navigation Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setReportTab("sales-pos")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "sales-pos"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Receipt size={14} /> Itemized Sales & POS Report
          </button>
          <button
            onClick={() => setReportTab("analytics")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "analytics"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <BarChart3 size={14} /> Analytics & Performance
          </button>
        </div>

        {reportTab === "sales-pos" ? (
          <button
            onClick={handleExportDetailedSalesCSV}
            title="Download detailed itemized sales report as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download size={14} /> Export Detailed Sales CSV
          </button>
        ) : (
          <button
            onClick={handleExportPerformanceCSV}
            title="Download leaderboard performance report as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200"
          >
            <Download size={14} /> Export Performance CSV
          </button>
        )}
      </div>

      {/* ----------------- TAB 1: ITEMIZED SALES & POS REPORT ----------------- */}
      {reportTab === "sales-pos" && (
        <div className="space-y-5">
          {/* Payment Method Breakdown Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <QrCode size={16} />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-semibold">UPI Collections</div>
                  <div className="text-sm font-bold text-stone-900 font-mono">
                    {fmtINR(financialSummary.paymentSplit.UPI || 0)}
                  </div>
                </div>
              </div>
              <Badge variant="info">Digital</Badge>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Banknote size={16} />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-semibold">Cash at Counter</div>
                  <div className="text-sm font-bold text-stone-900 font-mono">
                    {fmtINR(financialSummary.paymentSplit.Cash || 0)}
                  </div>
                </div>
              </div>
              <Badge variant="success">Cash</Badge>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="text-xs text-stone-500 font-semibold">Card POS Terminals</div>
                  <div className="text-sm font-bold text-stone-900 font-mono">
                    {fmtINR(financialSummary.paymentSplit.Card || 0)}
                  </div>
                </div>
              </div>
              <Badge variant="default">POS Card</Badge>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <SearchInput
                value={salesSearch}
                onChange={setSalesSearch}
                placeholder="Search invoice, client, phone, garment..."
              />

              {/* Payment Filter */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                {["All", "UPI", "Cash", "Card"].map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPaymentFilter(pm)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      paymentFilter === pm
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
              >
                <option value="All">All Invoices</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Detailed Sales & POS Report Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3.5">Invoice & Date</th>
                    <th className="px-4 py-3.5">Client Details</th>
                    <th className="px-4 py-3.5">Itemized Garments & Line Breakdowns</th>
                    <th className="px-4 py-3.5 text-center">Items Qty</th>
                    <th className="px-4 py-3.5 text-center">Payment</th>
                    <th className="px-4 py-3.5 text-right">Invoice Total</th>
                    <th className="px-4 py-3.5 text-right">Estimated Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No sales transactions match your search filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map((s) => {
                      const cust = customers.find((c) => c.id === s.customerId);
                      const invTotal = saleTotal(s);
                      const totalUnits = s.items.reduce((acc, it) => acc + it.qty, 0);

                      let invCost = 0;
                      s.items.forEach((it) => {
                        const prod = products.find((p) => p.id === it.productId);
                        invCost += it.qty * (prod ? prod.cost : 0);
                      });
                      const invProfit = invTotal - invCost;

                      return (
                        <tr key={s.id} className="hover:bg-stone-50/70 transition-colors align-top">
                          {/* Invoice ID & Date */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-amber-900 text-sm">{s.id}</div>
                            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                              <Calendar size={11} className="text-stone-400" />
                              {fmtDate(s.date)}
                            </div>
                          </td>

                          {/* Client */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-stone-900">
                              {cust ? cust.name : "Walk-in Customer"}
                            </div>
                            <div className="text-xs text-stone-400 font-mono">
                              {cust ? cust.phone : "Counter Guest"}
                            </div>
                            {cust?.city && (
                              <div className="text-[11px] text-stone-400">{cust.city}</div>
                            )}
                          </td>

                          {/* Itemized Garment List */}
                          <td className="px-4 py-3.5 max-w-md">
                            <div className="space-y-1.5">
                              {s.items.map((it, idx) => {
                                const prod = products.find((p) => p.id === it.productId);
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs bg-stone-50/90 px-2.5 py-1 rounded-lg border border-stone-100"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      {prod && <CategoryTag category={prod.category} />}
                                      <span className="font-medium text-stone-800 truncate">
                                        {prod ? prod.name : "Garment Item"}
                                      </span>
                                      <span className="text-stone-400 font-mono text-[11px]">
                                        ({prod?.size || "M"}·{prod?.color || ""})
                                      </span>
                                    </div>
                                    <div className="text-stone-700 font-mono font-semibold pl-2 flex-shrink-0">
                                      {it.qty} × {fmtINR(it.price)} = {fmtINR(it.qty * it.price)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Total Units */}
                          <td className="px-4 py-3.5 text-center font-bold text-stone-800">
                            {totalUnits} pcs
                          </td>

                          {/* Payment */}
                          <td className="px-4 py-3.5 text-center">
                            <Badge
                              variant={
                                s.paymentMode === "UPI"
                                  ? "info"
                                  : s.paymentMode === "Cash"
                                  ? "success"
                                  : "default"
                              }
                            >
                              {s.paymentMode}
                            </Badge>
                          </td>

                          {/* Invoice Total */}
                          <td className="px-4 py-3.5 text-right font-bold text-stone-900 font-mono text-sm">
                            {fmtINR(invTotal)}
                          </td>

                          {/* Estimated Profit */}
                          <td className="px-4 py-3.5 text-right font-bold text-emerald-700 font-mono text-sm">
                            +{fmtINR(invProfit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Toolbar */}
            <TablePagination
              currentPage={salesPage}
              pageSize={salesPageSize}
              totalItems={filteredSales.length}
              onPageChange={setSalesPage}
              onPageSizeChange={setSalesPageSize}
              pageSizeOptions={[10, 30, 50, 100]}
            />
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: ANALYTICS & PERFORMANCE ----------------- */}
      {reportTab === "analytics" && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Share Bar Chart */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Category Contribution & Revenue
                </h3>
              </div>
              <p className="text-xs text-stone-400 mb-4">Total revenue generated by apparel division</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#78716C", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#78716C", fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip formatter={(val) => [fmtINR(val), "Revenue"]} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {categoryAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || ACCENT} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Share Summary Cards */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
                  Category Segment Analysis
                </h3>
                <p className="text-xs text-stone-400 mb-4">Detailed breakdown per target demographic</p>

                <div className="space-y-3">
                  {categoryAnalytics.map((cat) => (
                    <div key={cat.category} className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3.5 h-3.5 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category] }} 
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{cat.category} Department</div>
                          <div className="text-xs text-stone-400">{cat.units} garments sold</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-stone-900 font-mono text-sm">{fmtINR(cat.revenue)}</div>
                        <div className="text-xs font-semibold text-amber-800">{cat.share}% of total sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-600">
                <span>Overall Inventory Health</span>
                <span className="text-emerald-700 font-semibold">98.4% Fulfillment Rate</span>
              </div>
            </div>
          </div>

          {/* Top Selling Products Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Top Selling Garments (Leaderboard)
                </h3>
                <p className="text-xs text-stone-400">Ranked by total revenue & sales velocity</p>
              </div>

              <button
                onClick={handleExportPerformanceCSV}
                title="Download leaderboard report as CSV"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200"
              >
                <Download size={14} /> Export Report CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Garment & SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-center">Units Sold</th>
                    <th className="px-4 py-3 text-right">Selling Price</th>
                    <th className="px-4 py-3 text-right">Total Revenue</th>
                    <th className="px-4 py-3 text-right">Gross Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedTopSelling.map((item, idx) => {
                    const rank = (leaderboardPage - 1) * leaderboardPageSize + idx + 1;
                    return (
                      <tr key={item.product.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-stone-400 font-mono text-xs">
                          #{rank}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-stone-900">{item.product.name}</div>
                          <div className="text-xs text-stone-400 font-mono">{item.product.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <CategoryTag category={item.product.category} />
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-stone-800">
                          {item.qty} pcs
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-stone-600 text-xs">
                          {fmtINR(item.product.price)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                          {fmtINR(item.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono">
                          +{fmtINR(item.profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Toolbar */}
            <TablePagination
              currentPage={leaderboardPage}
              pageSize={leaderboardPageSize}
              totalItems={topSelling.length}
              onPageChange={setLeaderboardPage}
              onPageSizeChange={setLeaderboardPageSize}
              pageSizeOptions={[10, 30, 50, 100]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

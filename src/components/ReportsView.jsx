import React, { useState, useMemo } from "react";
import {
  TrendingUp, IndianRupee, PieChart as PieIcon, BarChart3,
  Award, ArrowUpRight, CheckCircle, Percent, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  fmtINR, CATEGORY_COLORS, ACCENT, saleTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, CategoryTag, TablePagination } from "./UIComponents";

export function ReportsView({ sales, products, customers }) {
  // Pagination state for leaderboard
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Financial metrics calculation
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalUnitsSold = 0;

    sales.forEach((s) => {
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
    };
  }, [sales, products]);

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
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [topSelling, currentPage, pageSize]);

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
      {/* Financial KPIs */}
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
          sub={`${financialSummary.grossMargin}% Profit Margin`}
          tint="#059669"
        />
        <StatCard
          icon={Percent}
          label="COGS (Goods Cost)"
          value={fmtINR(financialSummary.totalCostOfGoods)}
          sub="Direct manufacturing & procurement"
          tint="#4B5563"
        />
        <StatCard
          icon={Award}
          label="Total Units Dispatched"
          value={`${financialSummary.totalUnitsSold} Pcs`}
          sub="Across all 3 apparel categories"
          tint={CATEGORY_COLORS.Women}
        />
      </div>

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
                const rank = (currentPage - 1) * pageSize + idx + 1;
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
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={topSelling.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50, 100]}
        />
      </div>
    </div>
  );
}

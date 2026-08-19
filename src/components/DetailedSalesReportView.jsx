import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Download, Calendar, User, Phone, Tag, Shirt,
  ShoppingBag, IndianRupee, Filter, ArrowUpDown, Receipt,
  CheckCircle2, RefreshCw, FileSpreadsheet, QrCode, Banknote, CreditCard,
  X, CalendarRange
} from "lucide-react";
import {
  fmtINR, fmtDate, CATEGORY_COLORS, ACCENT, saleTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, CategoryTag, Badge, SearchInput, TablePagination } from "./UIComponents";

export function DetailedSalesReportView({ sales, products, customers }) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All"); // All, UPI, Cash, Card
  const [datePreset, setDatePreset] = useState("All"); // All, today, yesterday, 7days, thismonth, 30days, custom
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentFilter, datePreset, fromDate, toDate]);

  // Filtered Sales & POS list
  const filteredSales = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const thisMonthPrefix = todayStr.slice(0, 7);

    return sales.filter((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const custName = cust ? cust.name : "Walk-in Customer";
      const custPhone = cust ? cust.phone : "";

      // Match item names in invoice
      const itemNames = s.items
        .map((it) => {
          const p = products.find((prod) => prod.id === it.productId);
          return p ? `${p.name} ${p.sku} ${p.category}` : "";
        })
        .join(" ");

      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        custName.toLowerCase().includes(search.toLowerCase()) ||
        custPhone.includes(search) ||
        itemNames.toLowerCase().includes(search.toLowerCase());

      const matchesPayment = paymentFilter === "All" || s.paymentMode === paymentFilter;

      // Date filtering logic
      let matchesDate = true;
      if (datePreset === "today") {
        matchesDate = s.date === todayStr;
      } else if (datePreset === "yesterday") {
        matchesDate = s.date === yesterday;
      } else if (datePreset === "7days") {
        const saleDate = new Date(s.date);
        const daysDiff = (new Date() - saleDate) / (1000 * 60 * 60 * 24);
        matchesDate = daysDiff >= 0 && daysDiff <= 7;
      } else if (datePreset === "thismonth") {
        matchesDate = s.date.startsWith(thisMonthPrefix);
      } else if (datePreset === "30days") {
        const saleDate = new Date(s.date);
        const daysDiff = (new Date() - saleDate) / (1000 * 60 * 60 * 24);
        matchesDate = daysDiff >= 0 && daysDiff <= 30;
      } else if (datePreset === "custom") {
        if (fromDate && s.date < fromDate) matchesDate = false;
        if (toDate && s.date > toDate) matchesDate = false;
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [sales, products, customers, search, paymentFilter, datePreset, fromDate, toDate]);

  // Financial metrics from filtered Sales & POS
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalUnitsSold = 0;
    let paymentSplit = { UPI: 0, Cash: 0, Card: 0 };

    filteredSales.forEach((s) => {
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
      avgOrderValue: filteredSales.length > 0 ? Math.round(totalRevenue / filteredSales.length) : 0,
    };
  }, [filteredSales, products]);

  const paginatedSales = useMemo(() => {
    return filteredSales.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredSales, currentPage, pageSize]);

  // Clear all date filters
  const handleClearDateFilter = () => {
    setDatePreset("All");
    setFromDate("");
    setToDate("");
  };

  // Export Detailed Sales CSV
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Customer City",
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
          cust ? cust.city || "Kerala" : "N/A",
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

    exportToCSV(`vastra_sales_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Filtered Sales Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{fmtINR(financialSummary.totalRevenue)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Across {filteredSales.length} invoices</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Gross Profit Margin</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{fmtINR(financialSummary.grossProfit)}</div>
          <div className="text-xs text-emerald-600 mt-0.5">{financialSummary.grossMargin}% Net Margin</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Units Sold</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{financialSummary.totalUnitsSold} Pcs</div>
          <div className="text-xs text-stone-400 mt-0.5">Apparel garments billed</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Order Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-800 mt-1">
            {fmtINR(financialSummary.avgOrderValue)}
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Per retail invoice</div>
        </div>
      </div>

      {/* Payment Collections Breakdown Badges */}
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
          <Badge variant="info">Digital UPI</Badge>
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
          <Badge variant="success">Counter Cash</Badge>
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
          <Badge variant="default">Card POS</Badge>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
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
                      ? "bg-white text-stone-900 shadow-xs font-bold"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>

            {/* Date Preset Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/60">
              <Calendar size={14} className="text-amber-800" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="text-xs font-bold bg-transparent border-none text-stone-800 cursor-pointer focus:ring-0 outline-none pr-2"
              >
                <option value="All">All Invoices (All Time)</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="thismonth">This Month</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date Range 📅</option>
              </select>
            </div>

            {/* Clear Date Filter Button if active */}
            {datePreset !== "All" && (
              <button
                onClick={handleClearDateFilter}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-all"
                title="Clear date filter"
              >
                <X size={12} /> Clear Date
              </button>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            title="Download detailed itemized sales report as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Download size={15} /> Export Detailed Sales CSV
          </button>
        </div>

        {/* Custom Date Range Pickers (Visible when 'custom' is selected) */}
        {datePreset === "custom" && (
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-200 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2">
              <CalendarRange size={15} className="text-amber-800" />
              <span className="text-xs font-bold text-amber-900">Custom Date Range:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-36 font-mono bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-36 font-mono bg-white"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); }}
                className="text-xs text-amber-900 hover:underline font-semibold"
              >
                Reset Range
              </button>
            )}
          </div>
        )}
      </div>

      {/* ITEMIZED SALES & POS REPORT TABLE */}
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
                    No sales transactions match your date & search filters.
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
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredSales.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50, 100]}
        />
      </div>
    </div>
  );
}

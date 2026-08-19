import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Download, Calendar, User, Phone, Tag, Shirt,
  ShoppingBag, IndianRupee, Filter, ArrowUpDown, Receipt,
  CheckCircle2, RefreshCw, FileSpreadsheet, QrCode, Banknote, CreditCard
} from "lucide-react";
import {
  fmtINR, fmtDate, CATEGORY_COLORS, ACCENT, saleTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, CategoryTag, Badge, SearchInput, TablePagination } from "./UIComponents";

export function DetailedSalesReportView({ sales, products, customers }) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All"); // All, UPI, Cash, Card
  const [dateFilter, setDateFilter] = useState("All"); // All, 7days, 30days

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentFilter, dateFilter]);

  // Financial metrics from Sales & POS
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
          return p ? `${p.name} ${p.sku} ${p.category}` : "";
        })
        .join(" ");

      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        custName.toLowerCase().includes(search.toLowerCase()) ||
        custPhone.includes(search) ||
        itemNames.toLowerCase().includes(search.toLowerCase());

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
  }, [sales, products, customers, search, paymentFilter, dateFilter]);

  const paginatedSales = useMemo(() => {
    return filteredSales.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredSales, currentPage, pageSize]);

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
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Sales Generated</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{fmtINR(financialSummary.totalRevenue)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Across {sales.length} customer bills</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Gross Profit Margin</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{fmtINR(financialSummary.grossProfit)}</div>
          <div className="text-xs text-emerald-600 mt-0.5">{financialSummary.grossMargin}% Net Margin</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Units Dispatched</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{financialSummary.totalUnitsSold} Pcs</div>
          <div className="text-xs text-stone-400 mt-0.5">Apparel garments billed</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Order Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-800 mt-1">
            {fmtINR(financialSummary.avgOrderValue)}
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Per retail transaction</div>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
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

        <button
          onClick={handleExportCSV}
          title="Download detailed itemized sales report as CSV"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <Download size={15} /> Export Detailed Sales CSV
        </button>
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

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Download, Calendar, User, Phone, Tag, Shirt,
  ShoppingBag, IndianRupee, Filter, ArrowUpDown, Receipt,
  CheckCircle2, RefreshCw, FileSpreadsheet
} from "lucide-react";
import {
  fmtINR, fmtDate, CATEGORY_COLORS, ACCENT, saleTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, CategoryTag, Badge, SearchInput, TablePagination } from "./UIComponents";

export function DetailedSalesReportView({ sales, products, customers }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All"); // All, Gents, Kids, Women
  const [paymentFilter, setPaymentFilter] = useState("All"); // All, UPI, Cash, Card
  const [dateFilter, setDateFilter] = useState("All"); // All, 7days, 30days

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Flatten every sale into individual itemized product sale rows
  const allDetailedSalesRows = useMemo(() => {
    const rows = [];

    sales.forEach((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const custName = cust ? cust.name : "Walk-in Customer";
      const custPhone = cust ? cust.phone : "Walk-in";
      const custCity = cust ? cust.city : "Kerala";

      s.items.forEach((it, itemIdx) => {
        const prod = products.find((p) => p.id === it.productId);
        const prodName = prod ? prod.name : "Garment Product";
        const prodSku = prod ? prod.sku : "SKU-N/A";
        const prodCategory = prod ? prod.category : "Gents";
        const prodSubcategory = prod ? prod.subcategory : "Apparel";
        const prodSize = prod ? prod.size : "M";
        const prodColor = prod ? prod.color : "";
        const unitCost = prod ? prod.cost : 0;
        const lineTotal = it.qty * it.price;
        const lineProfit = lineTotal - (it.qty * unitCost);

        rows.push({
          rowId: `${s.id}_${itemIdx}`,
          invoiceId: s.id,
          date: s.date,
          customerName: custName,
          customerPhone: custPhone,
          customerCity: custCity,
          category: prodCategory,
          subcategory: prodSubcategory,
          productName: prodName,
          sku: prodSku,
          size: prodSize,
          color: prodColor,
          qty: it.qty,
          unitPrice: it.price,
          unitCost: unitCost,
          lineTotal: lineTotal,
          lineProfit: lineProfit,
          paymentMode: s.paymentMode,
        });
      });
    });

    // Sort by most recent date first
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [sales, products, customers]);

  // Filter rows based on search and selected filters
  const filteredRows = useMemo(() => {
    return allDetailedSalesRows.filter((r) => {
      const matchSearch =
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.customerPhone.includes(search) ||
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase()) ||
        r.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === "All" || r.category === categoryFilter;
      const matchPayment = paymentFilter === "All" || r.paymentMode === paymentFilter;

      let matchDate = true;
      if (dateFilter !== "All") {
        const saleDate = new Date(r.date);
        const now = new Date();
        const daysDiff = (now - saleDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === "7days") matchDate = daysDiff <= 7;
        if (dateFilter === "30days") matchDate = daysDiff <= 30;
      }

      return matchSearch && matchCategory && matchPayment && matchDate;
    });
  }, [allDetailedSalesRows, search, categoryFilter, paymentFilter, dateFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, paymentFilter, dateFilter]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    return filteredRows.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredRows, currentPage, pageSize]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalRev = filteredRows.reduce((sum, r) => sum + r.lineTotal, 0);
    const totalQty = filteredRows.reduce((sum, r) => sum + r.qty, 0);
    const totalProfit = filteredRows.reduce((sum, r) => sum + r.lineProfit, 0);
    const distinctInvoices = new Set(filteredRows.map((r) => r.invoiceId)).size;

    return {
      totalRev,
      totalQty,
      totalProfit,
      distinctInvoices,
    };
  }, [filteredRows]);

  const handleExportCSV = () => {
    const headers = [
      "Purchase / Sale Date",
      "Customer Name",
      "Customer Phone Number",
      "Garment Category",
      "Product Item Name",
      "SKU",
      "Size",
      "Color",
      "Quantity Sold (Pcs)",
      "Unit Price (INR)",
      "Total Line Value (INR)",
      "Profit (INR)",
      "Payment Mode",
      "Invoice ID",
    ];

    const rows = filteredRows.map((r) => [
      r.date,
      r.customerName,
      r.customerPhone,
      r.category,
      r.productName,
      r.sku,
      r.size,
      r.color,
      r.qty,
      r.unitPrice,
      r.lineTotal,
      r.lineProfit,
      r.paymentMode,
      r.invoiceId,
    ]);

    exportToCSV(`vastra_detailed_sales_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Sales Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{fmtINR(summary.totalRev)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Across {summary.distinctInvoices} POS bills</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Quantity Sold</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{summary.totalQty} Pcs</div>
          <div className="text-xs text-stone-400 mt-0.5">{filteredRows.length} itemized line items</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Gross Profit Earned</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{fmtINR(summary.totalProfit)}</div>
          <div className="text-xs text-emerald-600 mt-0.5">
            {summary.totalRev > 0 ? Math.round((summary.totalProfit / summary.totalRev) * 100) : 0}% net margin
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Line Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-800 mt-1">
            {fmtINR(filteredRows.length > 0 ? Math.round(summary.totalRev / filteredRows.length) : 0)}
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Per itemized garment sold</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by customer, phone, product name, SKU..."
          />

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {["All", "Gents", "Kids", "Women"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  categoryFilter === cat
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Payment Mode Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
          >
            <option value="All">All Payment Modes</option>
            <option value="UPI">UPI Digital</option>
            <option value="Cash">Cash at Counter</option>
            <option value="Card">Card POS</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
          >
            <option value="All">All Purchase Dates</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          title="Download full detailed sales report as CSV"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <Download size={15} /> Export Detailed Sales CSV
        </button>
      </div>

      {/* DETAILED SALES REPORT TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Purchase Date</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Customer Phone</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Product Item</th>
                <th className="px-4 py-3.5 text-center">Qty Sold</th>
                <th className="px-4 py-3.5 text-right">Unit Rate</th>
                <th className="px-4 py-3.5 text-right">Total Value</th>
                <th className="px-4 py-3.5 text-center">Payment / Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No detailed sales records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => (
                  <tr key={r.rowId} className="hover:bg-stone-50/70 transition-colors">
                    {/* Purchase Date */}
                    <td className="px-4 py-3 text-stone-600 text-xs whitespace-nowrap">
                      <div className="font-semibold text-stone-800">{fmtDate(r.date)}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{r.date}</div>
                    </td>

                    {/* Customer Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{r.customerName}</div>
                      <div className="text-[11px] text-stone-400">{r.customerCity}</div>
                    </td>

                    {/* Customer Phone */}
                    <td className="px-4 py-3 font-mono text-xs text-stone-700 whitespace-nowrap">
                      {r.customerPhone}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <CategoryTag category={r.category} />
                    </td>

                    {/* Product Item */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{r.productName}</div>
                      <div className="text-xs text-stone-400 font-mono">
                        {r.sku} · Size: {r.size} · {r.color}
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="px-4 py-3 text-center font-bold text-stone-900">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs">
                        {r.qty} pcs
                      </span>
                    </td>

                    {/* Unit Rate */}
                    <td className="px-4 py-3 text-right font-mono text-stone-600 text-xs">
                      {fmtINR(r.unitPrice)}
                    </td>

                    {/* Value / Total Line Amount */}
                    <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono text-sm">
                      {fmtINR(r.lineTotal)}
                      <div className="text-[10px] text-emerald-600 font-semibold font-sans">
                        +{fmtINR(r.lineProfit)} profit
                      </div>
                    </td>

                    {/* Payment / Invoice */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          r.paymentMode === "UPI"
                            ? "info"
                            : r.paymentMode === "Cash"
                            ? "success"
                            : "default"
                        }
                      >
                        {r.paymentMode}
                      </Badge>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {r.invoiceId}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Toolbar */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredRows.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50, 100]}
        />
      </div>
    </div>
  );
}

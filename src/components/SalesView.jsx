import React, { useState, useEffect } from "react";
import {
  Plus, Search, ShoppingCart, Receipt, Printer, User,
  CheckCircle2, AlertCircle, Trash2, Calendar, Download, BarChart3,
  UserPlus, Check
} from "lucide-react";
import {
  fmtINR, fmtDate, saleTotal, customerName, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field, TablePagination } from "./UIComponents";

export function SalesView({ sales, products, customers, onAddSale, onNavigate }) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New Sale Form State
  const [customerMode, setCustomerMode] = useState("existing"); // "existing" or "new"
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    city: "Kochi",
    email: "",
  });

  const [paymentMode, setPaymentMode] = useState("UPI");
  const [cartItems, setCartItems] = useState([
    { productId: products[0]?.id || "", qty: 1, price: products[0]?.price || 0 },
  ]);

  const [datePreset, setDatePreset] = useState("All");

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, paymentFilter, datePreset]);

  const filteredSales = sales.filter((s) => {
    const cust = customerName(customers, s.customerId);
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase());
    const matchPay = paymentFilter === "All" || s.paymentMode === paymentFilter;

    let matchDate = true;
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const thisMonthPrefix = todayStr.slice(0, 7);

    if (datePreset === "today") {
      matchDate = s.date === todayStr;
    } else if (datePreset === "yesterday") {
      matchDate = s.date === yesterday;
    } else if (datePreset === "7days") {
      const saleDate = new Date(s.date);
      const daysDiff = (new Date() - saleDate) / (1000 * 60 * 60 * 24);
      matchDate = daysDiff >= 0 && daysDiff <= 7;
    } else if (datePreset === "thismonth") {
      matchDate = s.date.startsWith(thisMonthPrefix);
    } else if (datePreset === "30days") {
      const saleDate = new Date(s.date);
      const daysDiff = (new Date() - saleDate) / (1000 * 60 * 60 * 24);
      matchDate = daysDiff >= 0 && daysDiff <= 30;
    }

    return matchSearch && matchPay && matchDate;
  });

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalSalesRevenue = sales.reduce((sum, s) => sum + saleTotal(s), 0);

  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Payment Mode",
      "Items Count",
      "Total Amount (INR)",
    ];

    const rows = filteredSales.map((s) => {
      const cust = customers.find((c) => c.id === s.customerId);
      const totalUnits = s.items.reduce((acc, it) => acc + it.qty, 0);
      return [
        s.id,
        s.date,
        cust ? cust.name : "Walk-in Customer",
        cust ? cust.phone : "N/A",
        s.paymentMode,
        totalUnits,
        saleTotal(s),
      ];
    });

    exportToCSV(`vastra_sales_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    if (firstProd) {
      setCartItems([...cartItems, { productId: firstProd.id, qty: 1, price: firstProd.price }]);
    }
  };

  const handleRemoveItem = (index) => {
    if (cartItems.length > 1) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...cartItems];
    newItems[index][field] = value;

    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        newItems[index].price = prod.price;
      }
    }
    setCartItems(newItems);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleCreateSale = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Check stock availability
    for (const it of cartItems) {
      const p = products.find((prod) => prod.id === it.productId);
      if (p && p.stock < it.qty) {
        alert(`Insufficient stock for "${p.name}". Available: ${p.stock}, Requested: ${it.qty}`);
        return;
      }
    }

    let customerIdForSale = selectedCustomer || null;
    let newlyCreatedCustomer = null;

    if (customerMode === "new" && newCustForm.name.trim() && newCustForm.phone.trim()) {
      // Check if already in customers list
      const existingMatch = customers.find((c) => c.phone === newCustForm.phone.trim());
      if (existingMatch) {
        customerIdForSale = existingMatch.id;
      } else {
        newlyCreatedCustomer = {
          id: "c_" + Date.now(),
          name: newCustForm.name.trim(),
          phone: newCustForm.phone.trim(),
          city: newCustForm.city.trim() || "Kochi",
          email: newCustForm.email.trim() || "",
          address: "",
        };
        customerIdForSale = newlyCreatedCustomer.id;
      }
    }

    const newSale = {
      id: genId("INV-2026-", 100 + sales.length + 1),
      date: new Date().toISOString().slice(0, 10),
      customerId: customerIdForSale,
      items: cartItems.map((it) => ({
        productId: it.productId,
        qty: Number(it.qty),
        price: Number(it.price),
      })),
      paymentMode,
    };

    onAddSale(newSale, newlyCreatedCustomer);
    setIsNewSaleOpen(false);
    setCartItems([{ productId: products[0]?.id || "", qty: 1, price: products[0]?.price || 0 }]);
    setSelectedCustomer("");
    setNewCustForm({ name: "", phone: "", city: "Kochi", email: "" });
    setSelectedInvoice(newSale); // Open receipt preview immediately!
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Sales Completed</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{sales.length} Invoices</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Invoiced Revenue</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{fmtINR(totalSalesRevenue)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Order Value</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {fmtINR(sales.length ? totalSalesRevenue / sales.length : 0)}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search invoice number or client..."
          />

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {["All", "UPI", "Cash", "Card"].map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentFilter(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  paymentFilter === mode
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/60">
            <Calendar size={14} className="text-amber-800" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="text-xs font-bold bg-transparent border-none text-stone-800 cursor-pointer focus:ring-0 outline-none pr-2"
            >
              <option value="All">All Invoices</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="thismonth">This Month</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate("sales-report")}
            title="View detailed Sales & POS Report"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all border border-amber-200 flex-shrink-0"
          >
            <BarChart3 size={15} /> View Sales Report
          </button>

          <button
            onClick={handleExportCSV}
            title="Download sales invoices as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={() => {
              setCustomerMode("existing");
              setSelectedCustomer("");
              setNewCustForm({ name: "", phone: "", city: "Kochi", email: "" });
              setIsNewSaleOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> New POS Invoice
          </button>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Invoice ID</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer Profile</th>
                <th className="px-4 py-3.5">Items Summary</th>
                <th className="px-4 py-3.5 text-center">Payment</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((s) => {
                  const cust = customers.find((c) => c.id === s.customerId);
                  const total = saleTotal(s);
                  const totalItemsCount = s.items.reduce((acc, it) => acc + it.qty, 0);

                  return (
                    <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-900">
                        {s.id}
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">
                        {fmtDate(s.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">
                          {cust ? cust.name : "Walk-in Customer"}
                        </div>
                        {cust && <div className="text-xs text-stone-400 font-mono">{cust.phone} · {cust.city || "Kerala"}</div>}
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-xs">
                        {totalItemsCount} garment{totalItemsCount > 1 ? "s" : ""} across {s.items.length} line item{s.items.length > 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={s.paymentMode === "UPI" ? "info" : s.paymentMode === "Cash" ? "success" : "default"}>
                          {s.paymentMode}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                        {fmtINR(total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedInvoice(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <Receipt size={14} /> View Bill
                        </button>
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

      {/* New POS Sale Modal */}
      <Modal
        open={isNewSaleOpen}
        title="Create New POS Invoice"
        onClose={() => setIsNewSaleOpen(false)}
        wide
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          {/* Customer Selection / New Customer Options */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Customer Details</span>
              <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    customerMode === "existing" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600"
                  }`}
                >
                  Select Existing Client
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("new")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    customerMode === "new" ? "bg-white text-amber-900 shadow-2xs font-bold" : "text-stone-600"
                  }`}
                >
                  + Add New Client
                </button>
              </div>
            </div>

            {customerMode === "existing" ? (
              <Field label="Choose Registered Client">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="input-field"
                >
                  <option value="">Walk-in Customer (Guest)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} ({c.city || "Kerala"})
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Field label="Customer Full Name" required>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meera Nambiar"
                    value={newCustForm.name}
                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    className="input-field"
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9846012345"
                    value={newCustForm.phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    className="input-field font-mono"
                  />
                </Field>
                <Field label="City / Region">
                  <input
                    type="text"
                    placeholder="e.g. Kochi"
                    value={newCustForm.city}
                    onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    className="input-field"
                  />
                </Field>
              </div>
            )}
          </div>

          <Field label="Payment Mode">
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="input-field"
            >
              <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="Cash">Cash at Counter</option>
              <option value="Card">Debit / Credit Card POS</option>
            </select>
          </Field>

          <div className="border-t border-stone-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Bill Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus size={14} /> Add Item Line
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cartItems.map((item, idx) => {
                const selectedProd = products.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        className="input-field text-xs py-1.5"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.category}] {p.name} ({p.size}/{p.color}) — {fmtINR(p.price)} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={selectedProd ? selectedProd.stock : 999}
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", Math.max(1, Number(e.target.value)))}
                        className="input-field text-xs py-1.5 text-center font-mono"
                      />
                    </div>

                    <div className="w-24 text-right font-bold text-stone-900 font-mono text-xs">
                      {fmtINR(item.qty * item.price)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={cartItems.length === 1}
                      className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
            <span className="font-semibold text-stone-700 text-sm">Invoice Grand Total</span>
            <span className="text-xl font-bold text-amber-900 font-mono">{fmtINR(cartTotal)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsNewSaleOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
            >
              Complete Sale & Record Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal
        open={Boolean(selectedInvoice)}
        title="POS Sales Receipt"
        onClose={() => setSelectedInvoice(null)}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-stone-200">
              <h2 className="font-serif text-lg font-bold text-stone-900">Vastra Fashion House</h2>
              <p className="text-xs text-stone-500">Retail Invoice · GST Compliant</p>
              <div className="font-mono text-xs font-bold text-stone-700 mt-1">{selectedInvoice.id}</div>
              <div className="text-xs text-stone-400">{fmtDate(selectedInvoice.date)}</div>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div>
                <strong>Client: </strong>
                {customerName(customers, selectedInvoice.customerId)}
              </div>
              <div>
                <strong>Payment Mode: </strong>
                {selectedInvoice.paymentMode}
              </div>
            </div>

            <div className="divide-y divide-stone-100 text-xs border-y border-stone-100 py-2 my-2">
              {selectedInvoice.items.map((it, idx) => {
                const prod = products.find((p) => p.id === it.productId);
                return (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-900">{prod ? prod.name : "Garment Item"}</div>
                      <div className="text-stone-400 text-[11px]">
                        {prod ? `${prod.size} · ${prod.color} · ` : ""}
                        Qty: {it.qty} × {fmtINR(it.price)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-stone-800">{fmtINR(it.qty * it.price)}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-base font-bold text-stone-900 pt-1">
              <span>Grand Total</span>
              <span className="font-mono text-emerald-800">{fmtINR(saleTotal(selectedInvoice))}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={13} /> Print Bill
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

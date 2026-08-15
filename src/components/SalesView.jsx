import React, { useState } from "react";
import {
  Plus, Search, ShoppingCart, Receipt, Printer, User,
  CheckCircle2, AlertCircle, Trash2, Calendar, Download
} from "lucide-react";
import {
  fmtINR, fmtDate, saleTotal, customerName, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field } from "./UIComponents";

export function SalesView({ sales, products, customers, onAddSale }) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // New Sale Form State
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [cartItems, setCartItems] = useState([
    { productId: products[0]?.id || "", qty: 1, price: products[0]?.price || 0 },
  ]);

  const filteredSales = sales.filter((s) => {
    const cust = customerName(customers, s.customerId);
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase());
    const matchPay = paymentFilter === "All" || s.paymentMode === paymentFilter;
    return matchSearch && matchPay;
  });

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

  const handleItemProductChange = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newItems = [...cartItems];
    newItems[index] = {
      productId: prodId,
      qty: 1,
      price: prod.price,
    };
    setCartItems(newItems);
  };

  const handleItemQtyChange = (index, qty) => {
    const prod = products.find((p) => p.id === cartItems[index].productId);
    const validQty = Math.max(1, Math.min(Number(qty) || 1, prod ? prod.stock : 999));
    const newItems = [...cartItems];
    newItems[index].qty = validQty;
    setCartItems(newItems);
  };

  const currentCartTotal = cartItems.reduce((sum, it) => sum + it.qty * it.price, 0);

  const handleCreateSale = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const newSale = {
      id: genId("INV"),
      date: new Date().toISOString().slice(0, 10),
      customerId: selectedCustomer || null,
      paymentMode,
      items: cartItems.map((it) => ({
        productId: it.productId,
        qty: Number(it.qty),
        price: Number(it.price),
      })),
    };

    onAddSale(newSale);
    setIsNewSaleOpen(false);
    setSelectedInvoice(newSale); // open receipt preview
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Revenue Billed</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalSalesRevenue)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Completed Invoices</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{sales.length} Invoices</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Order Value (AOV)</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {fmtINR(sales.length ? totalSalesRevenue / sales.length : 0)}
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by Invoice # or Customer..."
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
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download sales invoices as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={() => {
              setSelectedCustomer("");
              setPaymentMode("UPI");
              setCartItems([
                { productId: products[0]?.id || "", qty: 1, price: products[0]?.price || 0 },
              ]);
              setIsNewSaleOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> New POS Bill
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer</th>
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
                filteredSales.map((s) => {
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
                        {cust && <div className="text-xs text-stone-400">{cust.phone}</div>}
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
      </div>

      {/* New POS Sale Modal */}
      <Modal
        open={isNewSaleOpen}
        title="Create New POS Invoice"
        onClose={() => setIsNewSaleOpen(false)}
        wide
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer (Select Client)">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="input-field"
              >
                <option value="">Walk-in Customer (Guest)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Payment Method" required>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="input-field"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash Counter</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </Field>
          </div>

          {/* Cart Items List */}
          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase">
              <span>Items to Bill</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-amber-800 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Another Item
              </button>
            </div>

            <div className="space-y-2">
              {cartItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const maxStock = prod ? prod.stock : 0;

                return (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        className="w-full text-xs font-medium bg-transparent focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.category}] - {p.size}/{p.color} (Stock: {p.stock}) - {fmtINR(p.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={maxStock}
                        value={item.qty}
                        onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                        className="w-full text-xs font-bold text-center border border-stone-200 rounded-lg p-1"
                      />
                    </div>

                    <div className="w-24 text-right font-mono font-bold text-xs text-stone-900">
                      {fmtINR(item.qty * item.price)}
                    </div>

                    {cartItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Calculation */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200 font-bold text-base">
              <span>Grand Total</span>
              <span className="font-mono text-amber-900">{fmtINR(currentCartTotal)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
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
              Generate Bill ({fmtINR(currentCartTotal)})
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal
        open={Boolean(selectedInvoice)}
        title="Tax Invoice / Receipt"
        onClose={() => setSelectedInvoice(null)}
      >
        {selectedInvoice && (
          <div className="space-y-4 text-stone-800">
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-stone-300">
              <div className="font-serif font-bold text-lg text-stone-900">Vastra Fashion House</div>
              <div className="text-xs text-stone-500">Retail & Operations · Kerala, India</div>
              <div className="text-xs font-mono text-stone-400 mt-1">Invoice: {selectedInvoice.id}</div>
            </div>

            {/* Meta */}
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Date:</span>
                <span className="font-medium">{fmtDate(selectedInvoice.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Customer:</span>
                <span className="font-semibold text-stone-900">
                  {customerName(customers, selectedInvoice.customerId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment:</span>
                <span className="font-semibold text-emerald-700">{selectedInvoice.paymentMode}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-b border-stone-100 py-3 space-y-2">
              {selectedInvoice.items.map((it, i) => {
                const p = products.find((prod) => prod.id === it.productId);
                return (
                  <div key={i} className="flex justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-900">{p ? p.name : "Product Item"}</div>
                      <div className="text-[11px] text-stone-400">{it.qty} x {fmtINR(it.price)}</div>
                    </div>
                    <div className="font-mono font-bold">{fmtINR(it.qty * it.price)}</div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-sm font-bold pt-1">
              <span>Total Paid</span>
              <span className="text-lg font-mono text-amber-900">
                {fmtINR(saleTotal(selectedInvoice))}
              </span>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 hover:bg-stone-50"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
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

import React, { useState } from "react";
import {
  Plus, Search, Truck, CheckCircle2, Clock, PackageCheck,
  AlertTriangle, Trash2, Download
} from "lucide-react";
import {
  fmtINR, fmtDate, purchaseTotal, supplierName, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field } from "./UIComponents";

export function PurchasesView({ purchases, suppliers, products, onAddPurchase, onMarkReceived }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PO Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [status, setStatus] = useState("Received");
  const [items, setItems] = useState([
    { productId: products[0]?.id || "", qty: 10, cost: products[0]?.cost || 0 },
  ]);

  const filteredPurchases = purchases.filter((p) => {
    const sName = supplierName(suppliers, p.supplierId);
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      sName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPurchasesCost = purchases.reduce((sum, p) => sum + purchaseTotal(p), 0);
  const pendingPurchases = purchases.filter((p) => p.status === "Pending");

  const handleExportCSV = () => {
    const headers = [
      "Purchase Order ID",
      "Date",
      "Supplier Name",
      "Delivery Status",
      "Total Garments Count",
      "Total Inward Cost (INR)",
    ];

    const rows = filteredPurchases.map((po) => {
      const sup = suppliers.find((s) => s.id === po.supplierId);
      const totalUnits = po.items.reduce((acc, it) => acc + it.qty, 0);
      return [
        po.id,
        po.date,
        sup ? sup.name : "Unknown Supplier",
        po.status,
        totalUnits,
        purchaseTotal(po),
      ];
    });

    exportToCSV(`vastra_purchases_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleAddItem = () => {
    const p = products[0];
    if (p) {
      setItems([...items, { productId: p.id, qty: 10, cost: p.cost }]);
    }
  };

  const handleRemoveItem = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleItemProductChange = (idx, prodId) => {
    const p = products.find((prod) => prod.id === prodId);
    if (!p) return;
    const newItems = [...items];
    newItems[idx] = { productId: prodId, qty: 10, cost: p.cost };
    setItems(newItems);
  };

  const handleItemCostQtyChange = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = Math.max(0, Number(val) || 0);
    setItems(newItems);
  };

  const currentPoTotal = items.reduce((sum, it) => sum + it.qty * it.cost, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    const newPO = {
      id: genId("PO"),
      date: new Date().toISOString().slice(0, 10),
      supplierId,
      status,
      items: items.map((it) => ({
        productId: it.productId,
        qty: Number(it.qty),
        cost: Number(it.cost),
      })),
    };

    onAddPurchase(newPO);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Procurements</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalPurchasesCost)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Completed Deliveries</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {purchases.filter((p) => p.status === "Received").length} Inward POs
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Pending In-Transit</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {pendingPurchases.length} Orders Pending
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search PO # or Vendor..."
          />

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {["All", "Received", "Pending"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download purchase orders as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={() => {
              setSupplierId(suppliers[0]?.id || "");
              setStatus("Received");
              setItems([
                { productId: products[0]?.id || "", qty: 10, cost: products[0]?.cost || 0 },
              ]);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Garments Inward</th>
                <th className="px-4 py-3.5 text-right">Total Cost</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const s = suppliers.find((sup) => sup.id === po.supplierId);
                  const total = purchaseTotal(po);
                  const totalUnits = po.items.reduce((acc, it) => acc + it.qty, 0);

                  return (
                    <tr key={po.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-900">
                        {po.id}
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">
                        {fmtDate(po.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">
                          {s ? s.name : "Unknown Vendor"}
                        </div>
                        {s && <div className="text-xs text-stone-400">{s.location} · {s.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-xs">
                        {totalUnits} units across {po.items.length} items
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                        {fmtINR(total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={po.status === "Received" ? "success" : "warning"}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {po.status === "Pending" ? (
                          <button
                            onClick={() => onMarkReceived(po.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                          >
                            <PackageCheck size={14} /> Receive Stock
                          </button>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium">Stock Added</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        open={isModalOpen}
        title="Create Purchase Order (Stock Inward)"
        onClose={() => setIsModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Supplier / Vendor" required>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="input-field"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Order Delivery Status" required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="Received">Received (Add to Stock Now)</option>
                <option value="Pending">Pending Delivery</option>
              </select>
            </Field>
          </div>

          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase">
              <span>Ordered Garment Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-amber-800 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      className="w-full text-xs font-medium bg-transparent focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.category}] - {p.size}/{p.color} (Current: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemCostQtyChange(idx, "qty", e.target.value)}
                      className="w-full text-xs font-bold text-center border border-stone-200 rounded-lg p-1"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      placeholder="Cost"
                      value={item.cost}
                      onChange={(e) => handleItemCostQtyChange(idx, "cost", e.target.value)}
                      className="w-full text-xs font-mono text-right border border-stone-200 rounded-lg p-1"
                    />
                  </div>

                  <div className="w-24 text-right font-mono font-bold text-xs text-stone-900">
                    {fmtINR(item.qty * item.cost)}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 font-bold text-base">
              <span>Total Procurement Cost</span>
              <span className="font-mono text-amber-900">{fmtINR(currentPoTotal)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
            >
              Submit Order ({fmtINR(currentPoTotal)})
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

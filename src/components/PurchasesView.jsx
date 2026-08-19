import React, { useState, useEffect } from "react";
import {
  Plus, Search, Truck, CheckCircle2, Clock, PackageCheck,
  AlertTriangle, Trash2, Download
} from "lucide-react";
import {
  fmtINR, fmtDate, purchaseTotal, supplierName, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field, TablePagination } from "./UIComponents";

export function PurchasesView({ purchases, suppliers, products, onAddPurchase, onMarkReceived }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // New PO Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [status, setStatus] = useState("Received");
  const [items, setItems] = useState([
    { productId: products[0]?.id || "", qty: 10, cost: products[0]?.cost || 0 },
  ]);

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredPurchases = purchases.filter((p) => {
    const sName = supplierName(suppliers, p.supplierId);
    const matchSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      sName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
    const firstProd = products[0];
    if (firstProd) {
      setItems([...items, { productId: firstProd.id, qty: 10, cost: firstProd.cost }]);
    }
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        newItems[index].cost = prod.cost;
      }
    }
    setItems(newItems);
  };

  const totalOrderCost = items.reduce((sum, it) => sum + it.qty * it.cost, 0);

  const handleCreatePO = (e) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    const newPO = {
      id: genId("PO-2026-", 100 + purchases.length + 1),
      date: new Date().toISOString().slice(0, 10),
      supplierId,
      items: items.map((it) => ({
        productId: it.productId,
        qty: Number(it.qty),
        cost: Number(it.cost),
      })),
      status,
    };

    onAddPurchase(newPO);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Purchase Orders</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{purchases.length} POs Raised</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Inward Inventory Cost</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalPurchasesCost)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Pending Inward Deliveries</div>
          <div className={`text-2xl font-bold mt-1 ${pendingPurchases.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>
            {pendingPurchases.length} Shipments
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search PO number or supplier..."
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
                paginatedPurchases.map((po) => {
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

        {/* Table Pagination Toolbar */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredPurchases.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50, 100]}
        />
      </div>

      {/* New Purchase Modal */}
      <Modal
        open={isModalOpen}
        title="Create New Purchase Order (Stock Inward)"
        onClose={() => setIsModalOpen(false)}
        wide
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Supplier / Vendor" required>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="input-field"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location} — {s.category})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Delivery Status" required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="Received">Received (Instantly Add to Inventory Stock)</option>
                <option value="Pending">Pending Delivery (In-Transit)</option>
              </select>
            </Field>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Inward Garment Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus size={14} /> Add Garment Line
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, idx) => {
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
                            [{p.category}] {p.name} ({p.size}/{p.color}) — Cost: {fmtINR(p.cost)}
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
                        onChange={(e) => handleItemChange(idx, "qty", Math.max(1, Number(e.target.value)))}
                        className="input-field text-xs py-1.5 text-center font-mono"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        placeholder="Cost"
                        value={item.cost}
                        onChange={(e) => handleItemChange(idx, "cost", Math.max(0, Number(e.target.value)))}
                        className="input-field text-xs py-1.5 text-right font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-stone-700 text-sm">Estimated Inward PO Value</span>
            <span className="text-xl font-bold text-stone-900 font-mono">{fmtINR(totalOrderCost)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              {status === "Received" ? "Create PO & Increase Stock" : "Create Pending PO"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

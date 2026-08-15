import React, { useState } from "react";
import {
  Plus, Search, Store, Phone, Mail, MapPin, Truck,
  Pencil, Trash2, PackageCheck
} from "lucide-react";
import {
  fmtINR, fmtDate, purchaseTotal
} from "../data/seedData";
import { Modal, Badge, SearchInput, Field } from "./UIComponents";

export function SuppliersView({ suppliers, purchases, products, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedHistorySupplier, setSelectedHistorySupplier] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Gents & Kids",
    location: "Kochi",
    phone: "",
    email: "",
  });

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
    );
  });

  // Calculate metrics per supplier
  const supplierStats = suppliers.map((s) => {
    const sPurchases = purchases.filter((p) => p.supplierId === s.id);
    const totalVolume = sPurchases.reduce((sum, p) => sum + purchaseTotal(p), 0);
    return {
      ...s,
      ordersCount: sPurchases.length,
      totalVolume,
    };
  });

  const totalProcuredOverall = purchases.reduce((sum, p) => sum + purchaseTotal(p), 0);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm({
      name: "",
      category: "Gents",
      location: "Kochi",
      phone: "",
      email: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      category: s.category,
      location: s.location,
      phone: s.phone,
      email: s.email || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    if (editingSupplier) {
      onUpdateSupplier({ ...editingSupplier, ...form });
    } else {
      onAddSupplier({ id: "s_" + Date.now(), ...form });
    }
    setIsModalOpen(false);
  };

  const activeSupplierPurchases = selectedHistorySupplier
    ? purchases.filter((p) => p.supplierId === selectedHistorySupplier.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Registered Vendors</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{suppliers.length} Partners</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Supply Value</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalProcuredOverall)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Active Purchase Orders</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{purchases.length} POs Placed</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by vendor name, category, or city..."
        />

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <Plus size={16} /> Register New Supplier
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            No suppliers found matching your query.
          </div>
        ) : (
          filteredSuppliers.map((s) => {
            const stats = supplierStats.find((st) => st.id === s.id) || { ordersCount: 0, totalVolume: 0 };

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-sm font-serif border border-stone-200">
                        <Store size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-base">{s.name}</h4>
                        <div className="text-xs text-stone-400 flex items-center gap-1">
                          <MapPin size={11} /> {s.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                        title="Edit Supplier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSupplier(s.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Supplier"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                      Category: {s.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-stone-600 mb-4 bg-stone-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-stone-400" />
                      <span className="font-mono">{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={12} className="text-stone-400 flex-shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-stone-400">Total POs: </span>
                      <span className="font-bold text-stone-800">{stats.ordersCount}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">Total Procured: </span>
                      <span className="font-bold text-stone-900 font-mono">
                        {fmtINR(stats.totalVolume)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedHistorySupplier(s)}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Truck size={13} /> View PO Orders ({stats.ordersCount})
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal
        open={isModalOpen}
        title={editingSupplier ? "Edit Supplier Details" : "Register New Vendor"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Supplier / Company Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Malabar Textile Mills"
              className="input-field"
            />
          </Field>

          <Field label="Garment Categories Supplied">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Gents & Kids, Sarees, Denim"
              className="input-field"
            />
          </Field>

          <Field label="City / Location" required>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Coimbatore, Kochi"
              className="input-field"
            />
          </Field>

          <Field label="Contact Phone" required>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9847012345"
              className="input-field font-mono"
            />
          </Field>

          <Field label="Email Address">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. sales@vendor.com"
              className="input-field"
            />
          </Field>

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
              {editingSupplier ? "Save Changes" : "Register Vendor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier PO History Modal */}
      <Modal
        open={Boolean(selectedHistorySupplier)}
        title={`Purchase Orders — ${selectedHistorySupplier?.name || ""}`}
        onClose={() => setSelectedHistorySupplier(null)}
        wide
      >
        {selectedHistorySupplier && (
          <div className="space-y-4">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500">Location: </span>
                <span className="font-bold text-stone-800">{selectedHistorySupplier.location}</span>
              </div>
              <div>
                <span className="text-stone-500">Total POs: </span>
                <span className="font-bold text-stone-800">{activeSupplierPurchases.length}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Billed: </span>
                <span className="font-bold text-stone-900 font-mono">
                  {fmtINR(activeSupplierPurchases.reduce((acc, p) => acc + purchaseTotal(p), 0))}
                </span>
              </div>
            </div>

            {activeSupplierPurchases.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                No purchase orders recorded for this supplier.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                {activeSupplierPurchases.map((po) => (
                  <div key={po.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-amber-900 text-sm">{po.id}</div>
                      <div className="text-xs text-stone-400">
                        {fmtDate(po.date)} · Status: {po.status}
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        {po.items.map((it) => {
                          const p = products.find((prod) => prod.id === it.productId);
                          return p ? `${p.name} (${it.qty} pcs)` : `Garment (${it.qty} pcs)`;
                        }).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900">{fmtINR(purchaseTotal(po))}</div>
                      <Badge variant={po.status === "Received" ? "success" : "warning"}>
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

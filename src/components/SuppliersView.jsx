import React, { useState, useEffect } from "react";
import {
  Plus, Search, Store, Phone, Mail, MapPin, Truck,
  Pencil, Trash2, IndianRupee, Download, Table as TableIcon, LayoutGrid
} from "lucide-react";
import {
  fmtINR, fmtDate, purchaseTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field, TablePagination } from "./UIComponents";

export function SuppliersView({ suppliers, purchases, products, onAddSupplier, onUpdateSupplier, onDeleteSupplier }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" (default) or "cards"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedHistorySupplier, setSelectedHistorySupplier] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    name: "",
    category: "Gents, Kids",
    phone: "",
    email: "",
    location: "Tirupur",
  });

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
    );
  });

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate supplier purchase statistics
  const supplierStats = suppliers.map((sup) => {
    const supPOs = purchases.filter((po) => po.supplierId === sup.id);
    const totalVolume = supPOs.reduce((sum, po) => sum + purchaseTotal(po), 0);
    return {
      ...sup,
      ordersCount: supPOs.length,
      totalVolume,
    };
  });

  const totalProcurementVolume = purchases.reduce((sum, po) => sum + purchaseTotal(po), 0);

  const handleExportCSV = () => {
    const headers = [
      "Supplier ID",
      "Supplier Name",
      "Supplied Categories",
      "Location",
      "Phone",
      "Email",
      "Total POs",
      "Total Procurement Volume (INR)",
    ];

    const rows = filteredSuppliers.map((s) => {
      const stats = supplierStats.find((st) => st.id === s.id) || { ordersCount: 0, totalVolume: 0 };
      return [
        s.id,
        s.name,
        s.category,
        s.location,
        s.phone,
        s.email || "N/A",
        stats.ordersCount,
        stats.totalVolume,
      ];
    });

    exportToCSV(`vastra_suppliers_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm({
      name: "",
      category: "Gents, Kids",
      phone: "",
      email: "",
      location: "Tirupur",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      category: s.category,
      phone: s.phone,
      email: s.email || "",
      location: s.location || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    if (editingSupplier) {
      onUpdateSupplier({ ...editingSupplier, ...form });
    } else {
      onAddSupplier({ id: "sup_" + Date.now(), ...form });
    }
    setIsModalOpen(false);
  };

  const activeSupplierPOs = selectedHistorySupplier
    ? purchases.filter((po) => po.supplierId === selectedHistorySupplier.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Vendor Network</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{suppliers.length} Suppliers</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Sourcing Volume</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalProcurementVolume)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Active Hubs</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">Tirupur, Surat, Jaipur</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by vendor name, category, or city..."
          />

          {/* View Mode Switcher (Table / Cards) */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Table View"
            >
              <TableIcon size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download supplier directory as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> Register New Supplier
          </button>
        </div>
      </div>

      {/* TABLE DATA FORMAT VIEW (Default) */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5">Vendor Profile</th>
                  <th className="px-4 py-3.5">Categories Supplied</th>
                  <th className="px-4 py-3.5">Manufacturing Hub</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5 text-center">Purchase Orders</th>
                  <th className="px-4 py-3.5 text-right">Total Procurement</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No suppliers found matching your query.
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((s) => {
                    const stats = supplierStats.find((st) => st.id === s.id) || { ordersCount: 0, totalVolume: 0 };

                    return (
                      <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Vendor Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 font-bold flex items-center justify-center text-xs border border-stone-200 flex-shrink-0">
                              <Store size={15} />
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900">{s.name}</div>
                              <div className="text-[11px] text-stone-400 font-mono">{s.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Categories */}
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                            {s.category}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                            <MapPin size={11} className="text-stone-400" />
                            {s.location}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-stone-700 font-mono text-xs">
                          {s.phone}
                        </td>

                        {/* POs */}
                        <td className="px-4 py-3 text-center">
                          <Badge variant={stats.ordersCount > 0 ? "info" : "default"}>
                            {stats.ordersCount} PO{stats.ordersCount === 1 ? "" : "s"}
                          </Badge>
                        </td>

                        {/* Total Procured */}
                        <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                          {fmtINR(stats.totalVolume)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedHistorySupplier(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors border border-stone-200"
                              title="View Purchase Orders"
                            >
                              <Truck size={13} />
                              <span className="hidden xl:inline">POs</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Edit Supplier"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => onDeleteSupplier(s.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
            totalItems={filteredSuppliers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 30, 50, 100]}
          />
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                No suppliers found matching your query.
              </div>
            ) : (
              paginatedSuppliers.map((s) => {
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

          <div className="mt-4 bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredSuppliers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 30, 50, 100]}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        open={isModalOpen}
        title={editingSupplier ? "Edit Supplier Details" : "Register New Supplier"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Supplier / Mill Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tirupur Knit Fabrics Ltd"
              className="input-field"
            />
          </Field>

          <Field label="Supplied Garment Categories" required>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              <option value="Gents">Gents Only</option>
              <option value="Kids">Kids Only</option>
              <option value="Women">Women Only</option>
              <option value="Gents, Kids">Gents, Kids</option>
              <option value="Kids, Women">Kids, Women</option>
              <option value="Gents, Women">Gents, Women</option>
              <option value="Gents, Kids, Women">All Categories (Multi-Specialist)</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone Number" required>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 9842100001"
                className="input-field font-mono"
              />
            </Field>

            <Field label="Manufacturing City / Hub">
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Tirupur"
                className="input-field"
              />
            </Field>
          </div>

          <Field label="Email Address">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. sales@mill.com"
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
              {editingSupplier ? "Save Changes" : "Register Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier PO History Modal */}
      <Modal
        open={Boolean(selectedHistorySupplier)}
        title={`Procurement POs — ${selectedHistorySupplier?.name || ""}`}
        onClose={() => setSelectedHistorySupplier(null)}
        wide
      >
        {selectedHistorySupplier && (
          <div className="space-y-4">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500">Contact: </span>
                <span className="font-bold text-stone-800">{selectedHistorySupplier.phone}</span>
              </div>
              <div>
                <span className="text-stone-500">Total POs: </span>
                <span className="font-bold text-stone-800">{activeSupplierPOs.length}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Procurement: </span>
                <span className="font-bold text-stone-900 font-mono">
                  {fmtINR(activeSupplierPOs.reduce((acc, po) => acc + purchaseTotal(po), 0))}
                </span>
              </div>
            </div>

            {activeSupplierPOs.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                No purchase orders raised for this supplier yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                {activeSupplierPOs.map((po) => (
                  <div key={po.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-stone-900 text-sm">{po.id}</div>
                      <div className="text-xs text-stone-400">{fmtDate(po.date)}</div>
                      <div className="text-xs text-stone-600 mt-1">
                        {po.items.map((it) => {
                          const p = products.find((prod) => prod.id === it.productId);
                          return p ? `${p.name} (x${it.qty})` : `Item (x${it.qty})`;
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

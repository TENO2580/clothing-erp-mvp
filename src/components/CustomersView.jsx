import React, { useState, useMemo, useEffect } from "react";
import {
  Users, UserPlus, Phone, Mail, MapPin, ShoppingBag,
  IndianRupee, Search, Download, Trash2, Pencil, ExternalLink,
  Tag, Calendar, LayoutGrid, Table as TableIcon, Shirt
} from "lucide-react";
import {
  fmtINR, fmtDate, saleTotal, CATEGORY_COLORS
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { StatCard, Badge, Modal, Field, SearchInput, TablePagination, CategoryTag } from "./UIComponents";

export function CustomersView({
  customers,
  sales,
  products = [],
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Kochi",
    address: "",
  });

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate customer metrics connected to Sales & POS
  const customerStats = useMemo(() => {
    return customers.map((c) => {
      const custSales = sales.filter((s) => s.customerId === c.id);
      const totalSpent = custSales.reduce((sum, s) => sum + saleTotal(s), 0);
      const lastSale = [...custSales].sort((a, b) => (a.date < b.date ? 1 : -1))[0];

      // Extract all unique garments purchased from POS bills
      const purchasedGarments = [];
      const categoryCounts = { Gents: 0, Kids: 0, Women: 0 };

      custSales.forEach((s) => {
        s.items.forEach((it) => {
          const prod = products.find((p) => p.id === it.productId);
          if (prod) {
            categoryCounts[prod.category] = (categoryCounts[prod.category] || 0) + it.qty;
            const existing = purchasedGarments.find((g) => g.productId === prod.id);
            if (existing) {
              existing.totalQty += it.qty;
            } else {
              purchasedGarments.push({
                productId: prod.id,
                name: prod.name,
                category: prod.category,
                sku: prod.sku,
                size: prod.size,
                color: prod.color,
                totalQty: it.qty,
                price: it.price,
              });
            }
          }
        });
      });

      return {
        ...c,
        ordersCount: custSales.length,
        totalSpent,
        lastActive: lastSale ? lastSale.date : null,
        purchasedGarments,
        categoryCounts,
      };
    });
  }, [customers, sales, products]);

  const filteredCustomers = customerStats.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      c.purchasedGarments.some((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalClientsSpent = sales.reduce((sum, s) => sum + saleTotal(s), 0);

  const handleExportCSV = () => {
    const headers = [
      "Customer ID",
      "Customer Name",
      "Phone Number",
      "Email Address",
      "City / Location",
      "Total POS Orders",
      "Lifetime Spend (INR)",
      "Purchased Garments (From Sales & POS)",
      "Last Purchase Date",
    ];

    const rows = filteredCustomers.map((c) => {
      const garmentsStr = c.purchasedGarments.map((g) => `${g.name} (x${g.totalQty})`).join("; ");
      return [
        c.id,
        c.name,
        c.phone,
        c.email || "N/A",
        c.city || "N/A",
        c.ordersCount,
        c.totalSpent,
        garmentsStr || "No purchases yet",
        c.lastActive || "None",
      ];
    });

    exportToCSV(`vastra_customers_detailed_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      city: "Kochi",
      address: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      city: c.city || "",
      address: c.address || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        ...form,
      });
    } else {
      const newCust = {
        id: "c" + (customers.length + 1),
        ...form,
      };
      onAddCustomer(newCust);
    }
    setIsModalOpen(false);
  };

  const activeCustomerSales = selectedHistoryCustomer
    ? sales.filter((s) => s.customerId === selectedHistoryCustomer.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Registered Clients</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{customers.length} Customers</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Sales Generated</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{fmtINR(totalClientsSpent)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Lifetime Value</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            {fmtINR(customers.length ? totalClientsSpent / customers.length : 0)}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by client name, phone, city, garment..."
          />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <TableIcon size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "cards"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <LayoutGrid size={13} /> Cards
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download clients list as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <UserPlus size={16} /> Register New Client
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5">Client Profile</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5">City / Region</th>
                  <th className="px-4 py-3.5">Purchased Garments (Sales & POS)</th>
                  <th className="px-4 py-3.5 text-center">POS Orders</th>
                  <th className="px-4 py-3.5 text-right">Lifetime Spend</th>
                  <th className="px-4 py-3.5 text-center">Last Active</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      No clients found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/70 transition-colors align-top">
                      {/* Client Profile */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs font-serif flex-shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">{c.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{c.id}</div>
                            {c.email && (
                              <div className="text-[11px] text-stone-500">{c.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-stone-800 font-mono text-xs whitespace-nowrap">
                        {c.phone}
                      </td>

                      {/* City */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                          <MapPin size={11} className="text-stone-400" />
                          {c.city || "Kerala"}
                        </span>
                      </td>

                      {/* Purchased Garments (From Sales & POS) */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {c.purchasedGarments.length === 0 ? (
                          <span className="text-xs text-stone-400 italic">No POS purchases yet</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {c.purchasedGarments.slice(0, 2).map((g, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700 truncate max-w-[180px]"
                                  title={`${g.name} (${g.category}) · Total Qty: ${g.totalQty}`}
                                >
                                  <CategoryTag category={g.category} />
                                  <span className="truncate">{g.name}</span>
                                  <strong className="text-amber-900">x{g.totalQty}</strong>
                                </span>
                              ))}
                            </div>
                            {c.purchasedGarments.length > 2 && (
                              <div className="text-[11px] text-stone-400 font-semibold">
                                +{c.purchasedGarments.length - 2} more styles
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={c.ordersCount > 0 ? "info" : "default"}>
                          {c.ordersCount} bill{c.ordersCount === 1 ? "" : "s"}
                        </Badge>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="px-4 py-3.5 text-right font-bold text-stone-900 font-mono">
                        {fmtINR(c.totalSpent)}
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-3.5 text-center text-stone-500 text-xs whitespace-nowrap">
                        {c.lastActive ? fmtDate(c.lastActive) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedHistoryCustomer(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors border border-amber-200"
                            title="View POS Order History"
                          >
                            <ShoppingBag size={13} />
                            <span>Orders</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Client"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(c.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 size={14} />
                          </button>
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
            totalItems={filteredCustomers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 30, 50, 100]}
          />
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === "cards" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                No clients found matching your search.
              </div>
            ) : (
              paginatedCustomers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-700/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm font-serif">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-stone-900 text-base">{c.name}</h3>
                          <span className="text-xs text-stone-400 font-mono">{c.id}</span>
                        </div>
                      </div>

                      <Badge variant={c.ordersCount > 0 ? "info" : "default"}>
                        {c.ordersCount} POS orders
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-stone-400" />
                        <span className="font-mono">{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-stone-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-stone-400" />
                        <span>{c.city || "Kerala"} {c.address ? `· ${c.address}` : ""}</span>
                      </div>
                    </div>

                    {/* Garments bought */}
                    {c.purchasedGarments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <div className="text-[11px] font-semibold text-stone-400 uppercase mb-1">
                          Garments Purchased ({c.purchasedGarments.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.purchasedGarments.slice(0, 3).map((g, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700"
                            >
                              {g.name} <strong className="text-amber-900">(x{g.totalQty})</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-400">Lifetime Spend</div>
                      <div className="text-sm font-bold text-stone-900 font-mono">{fmtINR(c.totalSpent)}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedHistoryCustomer(c)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-200"
                      >
                        <ShoppingBag size={13} /> History
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(c.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cards Pagination Toolbar */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <TablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredCustomers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 30, 50, 100]}
            />
          </div>
        </div>
      )}

      {/* Customer Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        title={editingCustomer ? "Edit Client Profile" : "Register New Client"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Meera Nambiar"
              className="input-field"
            />
          </Field>

          <Field label="Phone Number" required>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9846012345"
              className="input-field font-mono"
            />
          </Field>

          <Field label="Email Address">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. client@example.com"
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City / Region">
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Kochi"
                className="input-field"
              />
            </Field>
            <Field label="Address / Street">
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. MG Road"
                className="input-field"
              />
            </Field>
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
              {editingCustomer ? "Save Changes" : "Register Client"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Purchase History Modal */}
      <Modal
        open={Boolean(selectedHistoryCustomer)}
        title={`POS Order History & Garments — ${selectedHistoryCustomer?.name || ""}`}
        onClose={() => setSelectedHistoryCustomer(null)}
        wide
      >
        {selectedHistoryCustomer && (
          <div className="space-y-4">
            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-500">Phone: </span>
                <span className="font-bold text-stone-800 font-mono">{selectedHistoryCustomer.phone}</span>
              </div>
              <div>
                <span className="text-stone-500">City: </span>
                <span className="font-bold text-stone-800">{selectedHistoryCustomer.city || "Kerala"}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Invoices: </span>
                <span className="font-bold text-stone-800">{activeCustomerSales.length} bills</span>
              </div>
              <div>
                <span className="text-stone-500">Lifetime Spend: </span>
                <span className="font-bold text-emerald-800 font-mono text-sm">
                  {fmtINR(activeCustomerSales.reduce((acc, s) => acc + saleTotal(s), 0))}
                </span>
              </div>
            </div>

            {activeCustomerSales.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                No POS transactions recorded for this client yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto space-y-2">
                {activeCustomerSales.map((s) => (
                  <div key={s.id} className="pt-3 pb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-900 text-sm">{s.id}</span>
                        <span className="text-xs text-stone-400">{fmtDate(s.date)}</span>
                        <Badge variant={s.paymentMode === "UPI" ? "info" : s.paymentMode === "Cash" ? "success" : "default"}>
                          {s.paymentMode}
                        </Badge>
                      </div>
                      <div className="font-mono font-bold text-stone-900 text-sm">
                        {fmtINR(saleTotal(s))}
                      </div>
                    </div>

                    {/* Itemized Garments in this invoice */}
                    <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 space-y-1">
                      {s.items.map((it, idx) => {
                        const p = products.find((prod) => prod.id === it.productId);
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs text-stone-700">
                            <div className="flex items-center gap-1.5">
                              {p && <CategoryTag category={p.category} />}
                              <span className="font-medium">{p ? p.name : "Garment Item"}</span>
                              <span className="text-stone-400 font-mono text-[11px]">
                                ({p?.size || "M"}·{p?.color || ""})
                              </span>
                            </div>
                            <div className="font-mono">
                              {it.qty} pcs × {fmtINR(it.price)} = <strong>{fmtINR(it.qty * it.price)}</strong>
                            </div>
                          </div>
                        );
                      })}
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

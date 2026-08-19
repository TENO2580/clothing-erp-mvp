import React, { useState } from "react";
import {
  Plus, Search, Users, Phone, Mail, MapPin, ShoppingBag,
  Pencil, Trash2, Receipt, ArrowRight, IndianRupee, Download,
  Table as TableIcon, LayoutGrid, Calendar
} from "lucide-react";
import {
  fmtINR, fmtDate, saleTotal
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, Badge, SearchInput, Field } from "./UIComponents";

export function CustomersView({ customers, sales, products, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" (default) or "cards"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Kochi",
    address: "",
  });

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Calculate customer metrics
  const customerStats = customers.map((c) => {
    const custSales = sales.filter((s) => s.customerId === c.id);
    const totalSpent = custSales.reduce((sum, s) => sum + saleTotal(s), 0);
    const lastSale = [...custSales].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return {
      ...c,
      ordersCount: custSales.length,
      totalSpent,
      lastActive: lastSale ? lastSale.date : null,
    };
  });

  const totalClientsSpent = sales.reduce((sum, s) => sum + saleTotal(s), 0);

  const handleExportCSV = () => {
    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Email",
      "City",
      "Address",
      "Total Orders",
      "Lifetime Spend (INR)",
      "Last Purchase Date",
    ];

    const rows = filteredCustomers.map((c) => {
      const stats = customerStats.find((s) => s.id === c.id) || { ordersCount: 0, totalSpent: 0, lastActive: null };
      return [
        c.id,
        c.name,
        c.phone,
        c.email || "N/A",
        c.city || "N/A",
        c.address || "N/A",
        stats.ordersCount,
        stats.totalSpent,
        stats.lastActive || "None",
      ];
    });

    exportToCSV(`vastra_customers_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
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
    if (!form.name || !form.phone) return;

    if (editingCustomer) {
      onUpdateCustomer({ ...editingCustomer, ...form });
    } else {
      onAddCustomer({ id: "c_" + Date.now(), ...form });
    }
    setIsModalOpen(false);
  };

  const activeCustomerSales = selectedHistoryCustomer
    ? sales.filter((s) => s.customerId === selectedHistoryCustomer.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
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

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by client name, phone, or city..."
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
            title="Download client directory as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> Register New Client
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
                  <th className="px-4 py-3.5">Client Profile</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">City / Location</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5 text-right">Lifetime Spend</th>
                  <th className="px-4 py-3.5 text-center">Last Active</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      No customers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const stats = customerStats.find((s) => s.id === c.id) || {
                      ordersCount: 0,
                      totalSpent: 0,
                      lastActive: null,
                    };

                    return (
                      <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Client Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs font-serif flex-shrink-0">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900">{c.name}</div>
                              <div className="text-[11px] text-stone-400 font-mono">{c.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-stone-700 font-mono text-xs">
                          {c.phone}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-stone-500 text-xs">
                          {c.email || "—"}
                        </td>

                        {/* City */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                            <MapPin size={11} className="text-stone-400" />
                            {c.city || "Kerala"}
                          </span>
                        </td>

                        {/* Orders Count */}
                        <td className="px-4 py-3 text-center">
                          <Badge variant={stats.ordersCount > 0 ? "info" : "default"}>
                            {stats.ordersCount} order{stats.ordersCount === 1 ? "" : "s"}
                          </Badge>
                        </td>

                        {/* Lifetime Spend */}
                        <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                          {fmtINR(stats.totalSpent)}
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-3 text-center text-stone-500 text-xs">
                          {stats.lastActive ? fmtDate(stats.lastActive) : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedHistoryCustomer(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors border border-amber-200"
                              title="View Order History"
                            >
                              <ShoppingBag size={13} />
                              <span className="hidden xl:inline">Orders</span>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
              No customers found matching your search.
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const stats = customerStats.find((s) => s.id === c.id) || {
                ordersCount: 0,
                totalSpent: 0,
                lastActive: null,
              };

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm font-serif">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-base">{c.name}</h4>
                          <div className="text-xs text-stone-400 flex items-center gap-1">
                            <MapPin size={11} /> {c.city || "Kerala"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                          title="Edit Details"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(c.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Client"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 mb-4 bg-stone-50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-stone-400" />
                        <span className="font-mono">{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail size={12} className="text-stone-400 flex-shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-3">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div>
                        <span className="text-stone-400">Total Orders: </span>
                        <span className="font-bold text-stone-800">{stats.ordersCount}</span>
                      </div>
                      <div>
                        <span className="text-stone-400">Lifetime Spent: </span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {fmtINR(stats.totalSpent)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHistoryCustomer(c)}
                      className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingBag size={13} /> Order History ({stats.ordersCount})
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
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
              placeholder="e.g. Rahul Sharma"
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
        title={`Purchase History — ${selectedHistoryCustomer?.name || ""}`}
        onClose={() => setSelectedHistoryCustomer(null)}
        wide
      >
        {selectedHistoryCustomer && (
          <div className="space-y-4">
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500">Contact: </span>
                <span className="font-bold text-stone-800">{selectedHistoryCustomer.phone}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Orders: </span>
                <span className="font-bold text-stone-800">{activeCustomerSales.length}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Spend: </span>
                <span className="font-bold text-emerald-800 font-mono">
                  {fmtINR(activeCustomerSales.reduce((acc, s) => acc + saleTotal(s), 0))}
                </span>
              </div>
            </div>

            {activeCustomerSales.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                No purchases recorded for this customer yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                {activeCustomerSales.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-amber-900 text-sm">{s.id}</div>
                      <div className="text-xs text-stone-400">
                        {fmtDate(s.date)} · Paid via {s.paymentMode}
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        {s.items.map((it) => {
                          const p = products.find((prod) => prod.id === it.productId);
                          return p ? `${p.name} (x${it.qty})` : `Item (x${it.qty})`;
                        }).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900">{fmtINR(saleTotal(s))}</div>
                      <Badge variant="success">Completed</Badge>
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

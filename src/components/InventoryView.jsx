import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Pencil, Trash2, AlertTriangle, ArrowUpDown,
  Filter, Package, Check, RefreshCw, Download, Calendar,
  Clock, History, ShieldAlert
} from "lucide-react";
import {
  fmtINR, fmtDate, calcAgeingDays, CATEGORY_COLORS, ACCENT, DANGER, SUCCESS, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, CategoryTag, Badge, SearchInput, Field, TablePagination } from "./UIComponents";

export function InventoryView({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onAdjustStock }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // All, Low, Out, Healthy
  const [ageingFilter, setAgeingFilter] = useState("All"); // All, fresh30, mid60, slow90
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "Gents",
    subcategory: "",
    size: "M",
    color: "",
    sku: "",
    cost: "",
    price: "",
    stock: "",
    reorder: "5",
    addedDate: new Date().toISOString().slice(0, 10),
  });

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter, ageingFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(search.toLowerCase())) ||
        (p.color && p.color.toLowerCase().includes(search.toLowerCase()));
      
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      
      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "Low" && p.stock <= p.reorder && p.stock > 0) ||
        (stockFilter === "Out" && p.stock === 0) ||
        (stockFilter === "Healthy" && p.stock > p.reorder);

      const ageingDays = calcAgeingDays(p.addedDate);
      let matchAgeing = true;
      if (ageingFilter === "fresh30") matchAgeing = ageingDays <= 30;
      if (ageingFilter === "mid60") matchAgeing = ageingDays > 30 && ageingDays <= 60;
      if (ageingFilter === "slow90") matchAgeing = ageingDays > 60;

      return matchSearch && matchCat && matchStock && matchAgeing;
    });
  }, [products, search, categoryFilter, stockFilter, ageingFilter]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredProducts, currentPage, pageSize]);

  // Inventory Totals
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCost = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const totalRetail = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.reorder && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Average Ageing calculation
  const avgAgeingDays = useMemo(() => {
    if (products.length === 0) return 0;
    const totalDays = products.reduce((sum, p) => sum + calcAgeingDays(p.addedDate), 0);
    return Math.round(totalDays / products.length);
  }, [products]);

  const handleExportCSV = () => {
    const headers = [
      "SKU",
      "Product Name",
      "Department / Category",
      "Subcategory",
      "Size",
      "Color",
      "Unit Cost (INR)",
      "Selling Price (INR)",
      "Stock Quantity",
      "Stock Added Date",
      "Ageing (Days)",
      "Stock Status",
      "Total Cost Value (INR)",
      "Total Retail Value (INR)",
    ];

    const rows = filteredProducts.map((p) => {
      const ageing = calcAgeingDays(p.addedDate);
      const statusStr = p.stock === 0 ? "Out of Stock" : p.stock <= p.reorder ? "Low Stock" : "In Stock";
      return [
        p.sku,
        p.name,
        p.category,
        p.subcategory || "N/A",
        p.size,
        p.color,
        p.cost,
        p.price,
        p.stock,
        p.addedDate || "N/A",
        `${ageing} days`,
        statusStr,
        p.stock * p.cost,
        p.stock * p.price,
      ];
    });

    exportToCSV(`vastra_inventory_ageing_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      category: "Gents",
      subcategory: "Shirts",
      size: "M",
      color: "White",
      sku: "GEN-NEW-" + String(products.length + 1).padStart(3, "0"),
      cost: "",
      price: "",
      stock: "20",
      reorder: "5",
      addedDate: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || "",
      size: p.size,
      color: p.color,
      sku: p.sku,
      cost: String(p.cost),
      price: String(p.price),
      stock: String(p.stock),
      reorder: String(p.reorder),
      addedDate: p.addedDate || new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productPayload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      size: form.size,
      color: form.color,
      sku: form.sku,
      cost: Number(form.cost),
      price: Number(form.price),
      stock: Number(form.stock),
      reorder: Number(form.reorder),
      addedDate: form.addedDate || new Date().toISOString().slice(0, 10),
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...productPayload,
      });
    } else {
      const newId = "p" + (products.length + 1);
      onAddProduct({
        id: newId,
        ...productPayload,
      });
    }
    setIsModalOpen(false);
  };

  // Helper for Ageing Badge styling
  const renderAgeingBadge = (addedDate) => {
    const days = calcAgeingDays(addedDate);
    if (!addedDate) return <span className="text-stone-400 text-xs">—</span>;

    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Clock size={11} /> {days}d (Fresh)
        </span>
      );
    } else if (days <= 60) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
          <Clock size={11} /> {days}d (Normal)
        </span>
      );
    } else if (days <= 90) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200">
          <Clock size={11} /> {days}d (Moderate)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle size={11} /> {days}d (Slow Moving)
        </span>
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Inventory Value</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalRetail)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Cost value: {fmtINR(totalCost)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Garments Stocked</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{totalItems} Pcs</div>
          <div className="text-xs text-stone-400 mt-0.5">Across {products.length} SKU styles</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Average Stock Ageing</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-800 mt-1">~{avgAgeingDays} Days</div>
          <div className="text-xs text-emerald-600 mt-0.5">Healthy turnover velocity</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Stock Alerts</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            {lowStockCount + outOfStockCount} Items
          </div>
          <div className="text-xs text-stone-400 mt-0.5">
            {outOfStockCount} out of stock · {lowStockCount} low stock
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by garment name, SKU, color..."
          />

          {/* Department Category Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {["All", "Gents", "Kids", "Women"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  categoryFilter === cat
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="Healthy">Healthy Stock</option>
            <option value="Low">Low Stock Warning</option>
            <option value="Out">Out of Stock (0)</option>
          </select>

          {/* Ageing Filter */}
          <select
            value={ageingFilter}
            onChange={(e) => setAgeingFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
          >
            <option value="All">All Ageing</option>
            <option value="fresh30">Fresh Stock (&lt; 30 Days)</option>
            <option value="mid60">Normal Ageing (30–60 Days)</option>
            <option value="slow90">Slow Moving (&gt; 60 Days)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download inventory report with ageing as CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex-shrink-0"
          >
            <Download size={15} /> Export CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Inventory Table with Stock Added Date & Ageing */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Size & Color</th>
                <th className="px-4 py-3.5">Stock Added Date</th>
                <th className="px-4 py-3.5 text-center">Ageing (Days)</th>
                <th className="px-4 py-3.5 text-right">Unit Cost</th>
                <th className="px-4 py-3.5 text-right">Selling Price</th>
                <th className="px-4 py-3.5 text-center">Stock Level</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    No garment products found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.stock <= p.reorder && p.stock > 0;
                  const isOutOfStock = p.stock === 0;
                  const margin = Math.round(((p.price - p.cost) / p.price) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Product & SKU */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-400 font-mono">{p.sku}</div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <CategoryTag category={p.category} />
                        <div className="text-xs text-stone-400 mt-0.5">{p.subcategory}</div>
                      </td>

                      {/* Size & Color */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded font-medium mr-1.5">
                          {p.size}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">{p.color}</span>
                      </td>

                      {/* Stock Added Date */}
                      <td className="px-4 py-3 text-stone-600 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-stone-800">
                          <Calendar size={12} className="text-stone-400" />
                          {fmtDate(p.addedDate)}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">{p.addedDate}</div>
                      </td>

                      {/* Ageing Date / Days in Stock */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {renderAgeingBadge(p.addedDate)}
                      </td>

                      {/* Unit Cost */}
                      <td className="px-4 py-3 text-right text-stone-600 font-mono text-xs">
                        {fmtINR(p.cost)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                        {fmtINR(p.price)}
                        <div className="text-[10px] text-emerald-600 font-semibold font-sans">{margin}% margin</div>
                      </td>

                      {/* Stock Level Adjustment */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onAdjustStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-bold font-mono ${isOutOfStock ? "text-rose-600" : isLow ? "text-amber-700" : "text-stone-900"}`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => onAdjustStock(p.id, 1)}
                            className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
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
          totalItems={filteredProducts.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 30, 50, 100]}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        open={isModalOpen}
        title={editingProduct ? "Edit Garment Style" : "Add New Garment Product"}
        onClose={() => setIsModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Garment Product Name" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Slim Fit Cotton Shirt"
                className="input-field"
              />
            </Field>

            <Field label="Department Category" required>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                <option value="Gents">Gents</option>
                <option value="Kids">Kids</option>
                <option value="Women">Women</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Subcategory">
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                placeholder="e.g. Shirts, Kurtis, Trousers"
                className="input-field"
              />
            </Field>

            <Field label="Size (e.g. S, M, L, XL, 32, Free)" required>
              <input
                type="text"
                required
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="input-field"
              />
            </Field>

            <Field label="Color (e.g. White, Sky Blue, Maroon)" required>
              <input
                type="text"
                required
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="input-field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="SKU Code" required>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <Field label="Cost Price (₹ INR)" required>
              <input
                type="number"
                required
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <Field label="Selling Price (₹ INR)" required>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field font-mono"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Initial Stock Quantity (Pcs)" required>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <Field label="Reorder Threshold Alert">
              <input
                type="number"
                min="1"
                value={form.reorder}
                onChange={(e) => setForm({ ...form, reorder: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <Field label="Stock Added Date / Inward Date" required>
              <input
                type="date"
                required
                value={form.addedDate}
                onChange={(e) => setForm({ ...form, addedDate: e.target.value })}
                className="input-field font-mono"
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
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
              {editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

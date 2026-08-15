import React, { useState, useMemo } from "react";
import {
  Plus, Search, Pencil, Trash2, AlertTriangle, ArrowUpDown,
  Filter, Package, Check, RefreshCw, Download
} from "lucide-react";
import {
  fmtINR, CATEGORY_COLORS, ACCENT, DANGER, SUCCESS, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, CategoryTag, Badge, SearchInput, Field } from "./UIComponents";

export function InventoryView({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onAdjustStock }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // All, Low, Healthy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(search.toLowerCase()) ||
        p.color.toLowerCase().includes(search.toLowerCase());
      
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "Low" && p.stock <= p.reorder) ||
        (stockFilter === "Healthy" && p.stock > p.reorder);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  // Inventory Totals
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCost = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const totalRetail = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.reorder).length;

  const handleExportCSV = () => {
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Subcategory",
      "Size",
      "Color",
      "Cost Price (INR)",
      "Selling Price (INR)",
      "Stock Qty",
      "Reorder Level",
      "Total Cost Value (INR)",
      "Total Retail Value (INR)",
    ];

    const rows = filteredProducts.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.subcategory,
      p.size,
      p.color,
      p.cost,
      p.price,
      p.stock,
      p.reorder,
      p.stock * p.cost,
      p.stock * p.price,
    ]);

    exportToCSV(`vastra_inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      category: "Gents",
      subcategory: "Shirts",
      size: "L",
      color: "Blue",
      sku: "GEN-NEW-" + Math.floor(100 + Math.random() * 900),
      cost: 300,
      price: 599,
      stock: 20,
      reorder: 5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      size: p.size,
      color: p.color,
      sku: p.sku,
      cost: p.cost,
      price: p.price,
      stock: p.stock,
      reorder: p.reorder,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const productData = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory || "General",
      size: form.size,
      color: form.color,
      sku: form.sku || `${form.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      reorder: Number(form.reorder) || 5,
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productData });
    } else {
      onAddProduct({ id: "p_" + Date.now(), ...productData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="border-r border-stone-100 last:border-0 pr-2">
          <div className="text-xs font-semibold text-stone-400 uppercase">Total SKUs</div>
          <div className="text-xl font-bold text-stone-900 mt-1">{products.length}</div>
        </div>
        <div className="border-r border-stone-100 last:border-0 pr-2">
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Garments</div>
          <div className="text-xl font-bold text-stone-900 mt-1">{totalItems} units</div>
        </div>
        <div className="border-r border-stone-100 last:border-0 pr-2">
          <div className="text-xs font-semibold text-stone-400 uppercase">Inventory Cost</div>
          <div className="text-xl font-bold text-stone-900 mt-1">{fmtINR(totalCost)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Retail Valuation</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{fmtINR(totalRetail)}</div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by SKU, Name, Color..."
          />

          {/* Category Filter Pills */}
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

          {/* Stock Health Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-100 border-none rounded-xl px-3 py-2 text-stone-700 focus:ring-2 focus:ring-amber-800/20"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock ({lowStockCount})</option>
            <option value="Healthy">Healthy Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download inventory list as CSV spreadsheet"
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

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Size / Color</th>
                <th className="px-4 py-3.5 text-right">Cost</th>
                <th className="px-4 py-3.5 text-right">Price</th>
                <th className="px-4 py-3.5 text-center">Stock Level</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.reorder;
                  const isOutOfStock = p.stock === 0;
                  const margin = Math.round(((p.price - p.cost) / p.price) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-400 font-mono">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryTag category={p.category} />
                        <div className="text-xs text-stone-400 mt-0.5">{p.subcategory}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded font-medium mr-1.5">
                          {p.size}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">{p.color}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-600 font-mono text-xs">
                        {fmtINR(p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900 font-mono">
                        {fmtINR(p.price)}
                        <div className="text-[10px] text-emerald-600 font-semibold font-sans">{margin}% margin</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onAdjustStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-bold text-sm ${isLow ? "text-rose-600" : "text-stone-800"}`}>
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
                      <td className="px-4 py-3 text-center">
                        {isOutOfStock ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLow ? (
                          <Badge variant="warning">Low ({p.reorder} min)</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
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

      {/* Add/Edit Product Modal */}
      <Modal
        open={isModalOpen}
        title={editingProduct ? "Edit Product" : "Add New Garment Product"}
        onClose={() => setIsModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Slim Fit Linen Shirt"
                className="input-field"
              />
            </Field>

            <Field label="Category" required>
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

            <Field label="Subcategory">
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                placeholder="e.g. Shirts, Sarees, T-Shirts"
                className="input-field"
              />
            </Field>

            <Field label="SKU Code">
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. GEN-SH-102"
                className="input-field font-mono"
              />
            </Field>

            <Field label="Size">
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="e.g. M, L, XL, 32, Free"
                className="input-field"
              />
            </Field>

            <Field label="Color">
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g. Maroon, Teal, White"
                className="input-field"
              />
            </Field>

            <Field label="Cost Price (₹)">
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="e.g. 450"
                className="input-field font-mono"
              />
            </Field>

            <Field label="Selling Price (₹)" required>
              <input
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 899"
                className="input-field font-mono"
              />
            </Field>

            <Field label="Initial Stock Quantity">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="e.g. 25"
                className="input-field font-mono"
              />
            </Field>

            <Field label="Reorder Alert Threshold">
              <input
                type="number"
                min="1"
                value={form.reorder}
                onChange={(e) => setForm({ ...form, reorder: e.target.value })}
                placeholder="e.g. 5"
                className="input-field font-mono"
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
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

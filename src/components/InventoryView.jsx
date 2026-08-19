import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Pencil, Trash2, AlertTriangle, ArrowUpDown,
  Filter, Package, Check, RefreshCw, Download
} from "lucide-react";
import {
  fmtINR, CATEGORY_COLORS, ACCENT, DANGER, SUCCESS, genId
} from "../data/seedData";
import { exportToCSV } from "../utils/exportUtils";
import { Modal, CategoryTag, Badge, SearchInput, Field, TablePagination } from "./UIComponents";

export function InventoryView({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onAdjustStock }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // All, Low, Healthy
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
  });

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter]);

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
      price: 699,
      stock: 15,
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

  const handleCategoryChange = (newCat) => {
    const defaultSub = newCat === "Gents" ? "Shirts" : newCat === "Kids" ? "Sets" : "Kurtis";
    const prefix = newCat === "Gents" ? "GEN" : newCat === "Kids" ? "KID" : "WOM";
    setForm({
      ...form,
      category: newCat,
      subcategory: defaultSub,
      sku: `${prefix}-NEW-${Math.floor(100 + Math.random() * 900)}`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.cost) return;

    const prodData = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      size: form.size,
      color: form.color,
      sku: form.sku || "SKU-" + Date.now(),
      cost: Number(form.cost),
      price: Number(form.price),
      stock: Number(form.stock),
      reorder: Number(form.reorder),
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...prodData });
    } else {
      onAddProduct({ id: "prod_" + Date.now(), ...prodData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Total Garments Stock</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{totalItems} Pcs</div>
          <div className="text-xs text-stone-400 mt-0.5">{products.length} distinct styles</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Stock Valuation (Cost)</div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">{fmtINR(totalCost)}</div>
          <div className="text-xs text-emerald-600 mt-0.5">Procurement asset</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Retail Potential (MRP)</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{fmtINR(totalRetail)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Estimated gross revenue</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase">Low Stock Alerts</div>
          <div className={`text-xl sm:text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
            {lowStockCount} Items
          </div>
          <div className="text-xs text-stone-400 mt-0.5">Below reorder threshold</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search SKU, name, color..."
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
            className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 border-none rounded-xl px-3 py-2 text-stone-700 cursor-pointer focus:ring-0 outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">⚠️ Low Stock (≤ Reorder)</option>
            <option value="Healthy">✅ Healthy Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download inventory report as CSV"
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
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Size & Color</th>
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
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No garment products found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
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
                placeholder="e.g. Linen Slim Fit Shirt"
                className="input-field"
              />
            </Field>

            <Field label="Category / Division" required>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-field"
              >
                <option value="Gents">Gents (Men's Apparel)</option>
                <option value="Kids">Kids (Children's Apparel)</option>
                <option value="Women">Women (Ladies' Apparel)</option>
              </select>
            </Field>

            <Field label="Subcategory / Style">
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                placeholder="e.g. Formal Shirts, Kurtis, Frocks"
                className="input-field"
              />
            </Field>

            <Field label="SKU Code" required>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field font-mono"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Size">
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="input-field"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="Free">Free Size</option>
                  <option value="2-3Y">2-3 Yrs</option>
                  <option value="4-5Y">4-5 Yrs</option>
                  <option value="6-7Y">6-7 Yrs</option>
                  <option value="8-9Y">8-9 Yrs</option>
                </select>
              </Field>

              <Field label="Color">
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g. Navy Blue"
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost Price (₹)" required>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
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
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Stock (Pcs)" required>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Reorder Threshold" required>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.reorder}
                  onChange={(e) => setForm({ ...form, reorder: e.target.value })}
                  className="input-field font-mono"
                />
              </Field>
            </div>
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
              {editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

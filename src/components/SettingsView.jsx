import React, { useState } from "react";
import {
  Settings, Plus, Trash2, Check, RefreshCw, Store, Tag,
  Layers, Palette, Ruler, Save, RotateCcw, AlertCircle
} from "lucide-react";
import { DEFAULT_SETTINGS, CATEGORY_COLORS } from "../data/seedData";
import { Badge, Field } from "./UIComponents";

export function SettingsView({ settings, onUpdateSettings, onResetSettings }) {
  const [activeTab, setActiveTab] = useState("dropdowns"); // "dropdowns" or "store"

  // Dropdown inputs
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  // Store form state
  const [storeForm, setStoreForm] = useState({
    storeName: settings?.storeName || DEFAULT_SETTINGS.storeName,
    tagline: settings?.tagline || DEFAULT_SETTINGS.tagline,
    gstin: settings?.gstin || DEFAULT_SETTINGS.gstin,
    contactPhone: settings?.contactPhone || DEFAULT_SETTINGS.contactPhone,
    storeLocation: settings?.storeLocation || DEFAULT_SETTINGS.storeLocation,
  });

  const sizes = settings?.sizes || DEFAULT_SETTINGS.sizes;
  const colors = settings?.colors || DEFAULT_SETTINGS.colors;
  const subcategories = settings?.subcategories || DEFAULT_SETTINGS.subcategories;
  const departments = settings?.departments || DEFAULT_SETTINGS.departments;

  /* ------------------- Handlers for Sizes ------------------- */
  const handleAddSize = (e) => {
    e.preventDefault();
    const val = newSize.trim();
    if (!val) return;
    if (sizes.includes(val)) {
      alert(`Size "${val}" already exists!`);
      return;
    }
    onUpdateSettings({ ...settings, sizes: [...sizes, val] });
    setNewSize("");
  };

  const handleDeleteSize = (sizeToDelete) => {
    if (sizes.length <= 1) {
      alert("You must maintain at least 1 size option.");
      return;
    }
    onUpdateSettings({ ...settings, sizes: sizes.filter((s) => s !== sizeToDelete) });
  };

  /* ------------------- Handlers for Colors ------------------- */
  const handleAddColor = (e) => {
    e.preventDefault();
    const val = newColor.trim();
    if (!val) return;
    if (colors.includes(val)) {
      alert(`Color "${val}" already exists!`);
      return;
    }
    onUpdateSettings({ ...settings, colors: [...colors, val] });
    setNewColor("");
  };

  const handleDeleteColor = (colorToDelete) => {
    if (colors.length <= 1) {
      alert("You must maintain at least 1 color option.");
      return;
    }
    onUpdateSettings({ ...settings, colors: colors.filter((c) => c !== colorToDelete) });
  };

  /* ------------------- Handlers for Subcategories ------------------- */
  const handleAddSubcategory = (e) => {
    e.preventDefault();
    const val = newSubcategory.trim();
    if (!val) return;
    if (subcategories.includes(val)) {
      alert(`Subcategory "${val}" already exists!`);
      return;
    }
    onUpdateSettings({ ...settings, subcategories: [...subcategories, val] });
    setNewSubcategory("");
  };

  const handleDeleteSubcategory = (subcatToDelete) => {
    if (subcategories.length <= 1) {
      alert("You must maintain at least 1 subcategory option.");
      return;
    }
    onUpdateSettings({ ...settings, subcategories: subcategories.filter((s) => s !== subcatToDelete) });
  };

  /* ------------------- Handlers for Departments ------------------- */
  const handleAddDepartment = (e) => {
    e.preventDefault();
    const val = newDepartment.trim();
    if (!val) return;
    if (departments.includes(val)) {
      alert(`Department "${val}" already exists!`);
      return;
    }
    onUpdateSettings({ ...settings, departments: [...departments, val] });
    setNewDepartment("");
  };

  const handleDeleteDepartment = (deptToDelete) => {
    if (departments.length <= 1) {
      alert("You must maintain at least 1 department.");
      return;
    }
    onUpdateSettings({ ...settings, departments: departments.filter((d) => d !== deptToDelete) });
  };

  /* ------------------- Store Details Form ------------------- */
  const handleSaveStore = (e) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      ...storeForm,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
            <Settings size={22} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg">System Master Settings & Dropdowns</h2>
            <p className="text-xs text-stone-400">Configure custom dropdown options for Sizes, Colors, Subcategories, and Store Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetSettings}
            title="Reset dropdown masters to initial defaults"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all border border-stone-200"
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("dropdowns")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "dropdowns"
              ? "bg-amber-800 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Layers size={14} /> Dropdown Masters (Size, Color, Category)
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "store"
              ? "bg-amber-800 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Store size={14} /> Store Profile & Bill Header
        </button>
      </div>

      {/* ----------------- TAB 1: DROPDOWN MASTERS ----------------- */}
      {activeTab === "dropdowns" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. SIZES MASTER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Ruler size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Garment Sizes Master</h3>
                    <p className="text-xs text-stone-400">{sizes.length} active size options for product selection</p>
                  </div>
                </div>
              </div>

              {/* Add Size Input */}
              <form onSubmit={handleAddSize} className="flex items-center gap-2 my-3.5">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="e.g. 44, 14-15Y, XXL..."
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={14} /> Add Size
                </button>
              </form>

              {/* Chips List */}
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200/80 group"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(s)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title={`Remove size ${s}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 mt-4 pt-2 border-t border-stone-100">
              * Sizes added here appear in Inventory creation and POS item selectors.
            </div>
          </div>

          {/* 2. COLORS MASTER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Palette size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Garment Colors Master</h3>
                    <p className="text-xs text-stone-400">{colors.length} active color shades</p>
                  </div>
                </div>
              </div>

              {/* Add Color Input */}
              <form onSubmit={handleAddColor} className="flex items-center gap-2 my-3.5">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="e.g. Royal Blue, Emerald, Beige..."
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={14} /> Add Color
                </button>
              </form>

              {/* Chips List */}
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200/80 group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-stone-300 bg-amber-900/30" />
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(c)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title={`Remove color ${c}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 mt-4 pt-2 border-t border-stone-100">
              * Colors added here are available in product creation and variant filters.
            </div>
          </div>

          {/* 3. SUBCATEGORIES MASTER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Apparel Subcategories</h3>
                    <p className="text-xs text-stone-400">{subcategories.length} garment types (Shirts, Kurtis, Sarees...)</p>
                  </div>
                </div>
              </div>

              {/* Add Subcategory Input */}
              <form onSubmit={handleAddSubcategory} className="flex items-center gap-2 my-3.5">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="e.g. Hoodies, Dhoti, Gowns..."
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={14} /> Add Type
                </button>
              </form>

              {/* Chips List */}
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                {subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200/80 group"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubcategory(sub)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title={`Remove ${sub}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 mt-4 pt-2 border-t border-stone-100">
              * Subcategories organize apparel types across all three retail departments.
            </div>
          </div>

          {/* 4. DEPARTMENTS MASTER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Store Departments</h3>
                    <p className="text-xs text-stone-400">Primary merchandising divisions</p>
                  </div>
                </div>
              </div>

              {/* Add Department Input */}
              <form onSubmit={handleAddDepartment} className="flex items-center gap-2 my-3.5">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Footwear, Accessories..."
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={14} /> Add Dept
                </button>
              </form>

              {/* Chips List */}
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                {departments.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200"
                  >
                    <span>{dept}</span>
                    {departments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(dept)}
                        className="text-amber-700/60 hover:text-rose-600 transition-colors ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 mt-4 pt-2 border-t border-stone-100">
              * Top-level divisions for garments, sales categorization, and financial reporting.
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: STORE PROFILE ----------------- */}
      {activeTab === "store" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-3xl">
          <form onSubmit={handleSaveStore} className="space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
              Store & Retail Invoice Profile
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              These details appear on POS receipt headers, PDF prints, and system exports.
            </p>

            <Field label="Store Name" required>
              <input
                type="text"
                required
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                className="input-field"
              />
            </Field>

            <Field label="Tagline / Description">
              <input
                type="text"
                value={storeForm.tagline}
                onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="GSTIN / Tax ID">
                <input
                  type="text"
                  value={storeForm.gstin}
                  onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                  placeholder="e.g. 32AAAAA0000A1Z5"
                  className="input-field font-mono"
                />
              </Field>

              <Field label="Store Phone Number">
                <input
                  type="text"
                  value={storeForm.contactPhone}
                  onChange={(e) => setStoreForm({ ...storeForm, contactPhone: e.target.value })}
                  placeholder="e.g. +91 98460 12345"
                  className="input-field font-mono"
                />
              </Field>
            </div>

            <Field label="Store Address & City">
              <input
                type="text"
                value={storeForm.storeLocation}
                onChange={(e) => setStoreForm({ ...storeForm, storeLocation: e.target.value })}
                placeholder="e.g. MG Road, Kochi, Kerala"
                className="input-field"
              />
            </Field>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Save size={14} /> Save Store Details
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

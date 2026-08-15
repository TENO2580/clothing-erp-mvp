import React from "react";
import { X, Search } from "lucide-react";
import { CATEGORY_COLORS, ACCENT } from "../data/seedData";

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={onClose}>
      <div
        className={`${wide ? "max-w-2xl" : "max-w-md"} w-full rounded-2xl p-6 bg-white shadow-2xl transition-all border border-stone-200`}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-900 tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tint = ACCENT }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col justify-between bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</span>
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-105" 
          style={{ backgroundColor: `${tint}1A` }}
        >
          <Icon size={16} color={tint} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-stone-900 tracking-tight">{value}</div>
        {sub && <div className="text-xs text-stone-400 mt-0.5 font-medium">{sub}</div>}
      </div>
    </div>
  );
}

export function CategoryTag({ category }) {
  const color = CATEGORY_COLORS[category] || ACCENT;
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

export function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-stone-100 text-stone-700 border-stone-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all placeholder:text-stone-400"
      />
    </div>
  );
}

export function Field({ label, required, children, error }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </label>
  );
}

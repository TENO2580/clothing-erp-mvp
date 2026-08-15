export const ACCENT = "#8B5E34";
export const NAVY = "#1E2233";
export const DANGER = "#B3261E";
export const SUCCESS = "#2E7D4F";
export const WARNING = "#D97706";

export const CATEGORY_COLORS = { 
  Gents: "#2F4B7C", 
  Kids: "#2E7D4F", 
  Women: "#A6446E" 
};

export const STORAGE_KEYS = {
  products: "vastra_erp_products_v2",
  customers: "vastra_erp_customers_v2",
  suppliers: "vastra_erp_suppliers_v2",
  sales: "vastra_erp_sales_v2",
  purchases: "vastra_erp_purchases_v2",
};

export const SEED_PRODUCTS = [
  { id: "p1", name: "Cotton Formal Shirt", category: "Gents", subcategory: "Shirts", size: "L", color: "White", sku: "GEN-SH-001", cost: 450, price: 799, stock: 24, reorder: 10 },
  { id: "p2", name: "Slim Fit Casual Shirt", category: "Gents", subcategory: "Shirts", size: "M", color: "Sky Blue", sku: "GEN-SH-002", cost: 420, price: 749, stock: 18, reorder: 10 },
  { id: "p3", name: "Round Neck T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "XL", color: "Black", sku: "GEN-TS-003", cost: 180, price: 349, stock: 40, reorder: 15 },
  { id: "p4", name: "Polo T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "L", color: "Navy", sku: "GEN-TS-004", cost: 220, price: 449, stock: 30, reorder: 15 },
  { id: "p5", name: "Formal Trousers", category: "Gents", subcategory: "Trousers", size: "34", color: "Grey", sku: "GEN-TR-005", cost: 500, price: 899, stock: 20, reorder: 8 },
  { id: "p6", name: "Denim Jeans", category: "Gents", subcategory: "Jeans", size: "32", color: "Dark Blue", sku: "GEN-JN-006", cost: 650, price: 1199, stock: 22, reorder: 8 },
  { id: "p7", name: "Cotton Kurta", category: "Gents", subcategory: "Ethnic", size: "L", color: "White", sku: "GEN-KU-007", cost: 380, price: 699, stock: 15, reorder: 6 },
  { id: "p8", name: "Blazer", category: "Gents", subcategory: "Formal", size: "40", color: "Charcoal", sku: "GEN-BL-008", cost: 1400, price: 2499, stock: 6, reorder: 3 },
  { id: "p9", name: "Mundu (Kerala Dhoti)", category: "Gents", subcategory: "Ethnic", size: "Free", color: "Cream", sku: "GEN-MU-009", cost: 250, price: 449, stock: 35, reorder: 12 },
  { id: "p10", name: "Sports Track Pant", category: "Gents", subcategory: "Sportswear", size: "L", color: "Black", sku: "GEN-TP-010", cost: 300, price: 549, stock: 25, reorder: 10 },
  
  { id: "p11", name: "Boys Printed T-Shirt", category: "Kids", subcategory: "T-Shirts", size: "6-7Y", color: "Red", sku: "KID-TS-001", cost: 150, price: 299, stock: 28, reorder: 10 },
  { id: "p12", name: "Girls Cotton Frock", category: "Kids", subcategory: "Dresses", size: "4-5Y", color: "Pink", sku: "KID-FR-002", cost: 280, price: 549, stock: 20, reorder: 8 },
  { id: "p13", name: "Kids Denim Shorts", category: "Kids", subcategory: "Shorts", size: "8-9Y", color: "Blue", sku: "KID-SH-003", cost: 200, price: 399, stock: 18, reorder: 8 },
  { id: "p14", name: "School Uniform Shirt", category: "Kids", subcategory: "Uniform", size: "10-11Y", color: "White", sku: "KID-UN-004", cost: 220, price: 399, stock: 30, reorder: 12 },
  { id: "p15", name: "Boys Cargo Pants", category: "Kids", subcategory: "Pants", size: "8-9Y", color: "Olive", sku: "KID-CP-005", cost: 260, price: 499, stock: 16, reorder: 6 },
  { id: "p16", name: "Girls Party Dress", category: "Kids", subcategory: "Dresses", size: "6-7Y", color: "Lavender", sku: "KID-PD-006", cost: 450, price: 899, stock: 10, reorder: 4 },
  { id: "p17", name: "Infant Romper Set", category: "Kids", subcategory: "Infant", size: "0-1Y", color: "Yellow", sku: "KID-RM-007", cost: 180, price: 349, stock: 22, reorder: 8 },
  { id: "p18", name: "Kids Ethnic Kurta Set", category: "Kids", subcategory: "Ethnic", size: "4-5Y", color: "Maroon", sku: "KID-ES-008", cost: 380, price: 699, stock: 12, reorder: 5 },
  { id: "p19", name: "Boys Track Suit", category: "Kids", subcategory: "Sportswear", size: "10-11Y", color: "Navy", sku: "KID-TR-009", cost: 320, price: 599, stock: 14, reorder: 6 },
  { id: "p20", name: "Girls Leggings", category: "Kids", subcategory: "Leggings", size: "6-7Y", color: "Pink", sku: "KID-LG-010", cost: 120, price: 249, stock: 26, reorder: 10 },
  
  { id: "p21", name: "Cotton Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Teal", sku: "WOM-SR-001", cost: 650, price: 1299, stock: 15, reorder: 5 },
  { id: "p22", name: "Anarkali Salwar Suit", category: "Women", subcategory: "Salwar Suits", size: "L", color: "Maroon", sku: "WOM-SK-002", cost: 800, price: 1599, stock: 12, reorder: 5 },
  { id: "p23", name: "Printed Kurti", category: "Women", subcategory: "Kurtis", size: "M", color: "Mustard", sku: "WOM-KU-003", cost: 350, price: 649, stock: 25, reorder: 10 },
  { id: "p24", name: "Western Top", category: "Women", subcategory: "Tops", size: "S", color: "White", sku: "WOM-TP-004", cost: 280, price: 549, stock: 22, reorder: 8 },
  { id: "p25", name: "Palazzo Pants", category: "Women", subcategory: "Bottoms", size: "M", color: "Black", sku: "WOM-PL-005", cost: 300, price: 599, stock: 20, reorder: 8 },
  { id: "p26", name: "Leggings", category: "Women", subcategory: "Bottoms", size: "L", color: "Beige", sku: "WOM-LG-006", cost: 150, price: 299, stock: 30, reorder: 12 },
  { id: "p27", name: "Silk Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Golden", sku: "WOM-SS-007", cost: 1800, price: 3499, stock: 8, reorder: 3 },
  { id: "p28", name: "Denim Jacket", category: "Women", subcategory: "Jackets", size: "M", color: "Blue", sku: "WOM-DJ-008", cost: 550, price: 999, stock: 10, reorder: 4 },
  { id: "p29", name: "Nightwear Set", category: "Women", subcategory: "Nightwear", size: "L", color: "Pink", sku: "WOM-NW-009", cost: 320, price: 599, stock: 18, reorder: 6 },
  { id: "p30", name: "Designer Blouse", category: "Women", subcategory: "Blouses", size: "M", color: "Red", sku: "WOM-BL-010", cost: 250, price: 449, stock: 16, reorder: 6 },
];

export const SEED_CUSTOMERS = [
  { id: "c1", name: "Anitha Nair", phone: "9846012345", email: "anitha.nair@example.com", city: "Kochi", address: "MG Road, Ernakulam" },
  { id: "c2", name: "Ravi Kumar", phone: "9847023456", email: "ravi.kumar@example.com", city: "Trivandrum", address: "Statue Junction" },
  { id: "c3", name: "Sneha Thomas", phone: "9895034567", email: "sneha.thomas@example.com", city: "Kottayam", address: "Baker Junction" },
  { id: "c4", name: "Mohammed Rafi", phone: "9744045678", email: "m.rafi@example.com", city: "Calicut", address: "SM Street" },
  { id: "c5", name: "Divya Menon", phone: "9633056789", email: "divya.menon@example.com", city: "Thrissur", address: "Swaraj Round" },
  { id: "c6", name: "Arjun Pillai", phone: "9744067890", email: "arjun.pillai@example.com", city: "Kollam", address: "Beach Road" },
  { id: "c7", name: "Fathima Beevi", phone: "9895078901", email: "fathima.beevi@example.com", city: "Kannur", address: "Fort Road" },
  { id: "c8", name: "Sunil Varma", phone: "9847089012", email: "sunil.varma@example.com", city: "Alappuzha", address: "Boat Jetty" },
];

export const SEED_SUPPLIERS = [
  { id: "s1", name: "Kochi Textiles Pvt Ltd", category: "Gents & Kids", location: "Kochi", phone: "9847011111", email: "contact@kochitextiles.in" },
  { id: "s2", name: "Trivandrum Garments Co", category: "Women", location: "Trivandrum", phone: "9847022222", email: "orders@tvmgarments.com" },
  { id: "s3", name: "Coimbatore Fabric House", category: "All Categories", location: "Coimbatore", phone: "9847033333", email: "sales@coimbatorefabrics.com" },
  { id: "s4", name: "Little Stars Kidswear", category: "Kids", location: "Kollam", phone: "9847044444", email: "info@littlestars.in" },
  { id: "s5", name: "Silk Route Sarees", category: "Women", location: "Kannur", phone: "9847055555", email: "care@silkroutesarees.com" },
  { id: "s6", name: "Metro Menswear Suppliers", category: "Gents", location: "Kochi", phone: "9847066666", email: "supply@metromenswear.com" },
];

export const SEED_SALES = [
  { id: "INV-1001", date: "2026-07-18", customerId: "c1", paymentMode: "UPI", items: [{ productId: "p1", qty: 1, price: 799 }, { productId: "p5", qty: 1, price: 899 }] },
  { id: "INV-1002", date: "2026-07-19", customerId: null, paymentMode: "Cash", items: [{ productId: "p23", qty: 2, price: 649 }] },
  { id: "INV-1003", date: "2026-07-20", customerId: "c2", paymentMode: "Card", items: [{ productId: "p11", qty: 3, price: 299 }, { productId: "p20", qty: 1, price: 249 }] },
  { id: "INV-1004", date: "2026-07-22", customerId: "c3", paymentMode: "UPI", items: [{ productId: "p21", qty: 1, price: 1299 }] },
  { id: "INV-1005", date: "2026-07-24", customerId: "c4", paymentMode: "Cash", items: [{ productId: "p6", qty: 1, price: 1199 }, { productId: "p4", qty: 1, price: 449 }] },
  { id: "INV-1006", date: "2026-07-26", customerId: null, paymentMode: "UPI", items: [{ productId: "p12", qty: 1, price: 549 }, { productId: "p16", qty: 1, price: 899 }] },
  { id: "INV-1007", date: "2026-07-28", customerId: "c5", paymentMode: "Card", items: [{ productId: "p25", qty: 1, price: 599 }, { productId: "p24", qty: 1, price: 549 }] },
  { id: "INV-1008", date: "2026-07-30", customerId: "c6", paymentMode: "Cash", items: [{ productId: "p7", qty: 2, price: 699 }] },
  { id: "INV-1009", date: "2026-08-01", customerId: "c7", paymentMode: "UPI", items: [{ productId: "p27", qty: 1, price: 3499 }] },
  { id: "INV-1010", date: "2026-08-02", customerId: null, paymentMode: "Cash", items: [{ productId: "p14", qty: 4, price: 399 }] },
  { id: "INV-1011", date: "2026-08-04", customerId: "c8", paymentMode: "Card", items: [{ productId: "p8", qty: 1, price: 2499 }] },
  { id: "INV-1012", date: "2026-08-06", customerId: "c1", paymentMode: "UPI", items: [{ productId: "p26", qty: 2, price: 299 }, { productId: "p30", qty: 1, price: 449 }] },
  { id: "INV-1013", date: "2026-08-08", customerId: null, paymentMode: "Cash", items: [{ productId: "p19", qty: 1, price: 599 }, { productId: "p15", qty: 1, price: 499 }] },
  { id: "INV-1014", date: "2026-08-10", customerId: "c2", paymentMode: "Cash", items: [{ productId: "p9", qty: 2, price: 449 }] },
  { id: "INV-1015", date: "2026-08-12", customerId: "c3", paymentMode: "UPI", items: [{ productId: "p22", qty: 1, price: 1599 }] },
  { id: "INV-1016", date: "2026-08-14", customerId: null, paymentMode: "Card", items: [{ productId: "p3", qty: 2, price: 349 }, { productId: "p11", qty: 2, price: 299 }] },
];

export const SEED_PURCHASES = [
  { id: "PO-501", date: "2026-07-15", supplierId: "s1", status: "Received", items: [{ productId: "p1", qty: 20, cost: 450 }, { productId: "p5", qty: 15, cost: 500 }] },
  { id: "PO-502", date: "2026-07-17", supplierId: "s4", status: "Received", items: [{ productId: "p11", qty: 30, cost: 150 }, { productId: "p20", qty: 25, cost: 120 }] },
  { id: "PO-503", date: "2026-07-20", supplierId: "s5", status: "Received", items: [{ productId: "p21", qty: 10, cost: 650 }, { productId: "p27", qty: 6, cost: 1800 }] },
  { id: "PO-504", date: "2026-07-25", supplierId: "s6", status: "Received", items: [{ productId: "p6", qty: 15, cost: 650 }, { productId: "p8", qty: 5, cost: 1400 }] },
  { id: "PO-505", date: "2026-07-29", supplierId: "s3", status: "Received", items: [{ productId: "p23", qty: 20, cost: 350 }, { productId: "p3", qty: 25, cost: 180 }] },
  { id: "PO-506", date: "2026-08-02", supplierId: "s2", status: "Received", items: [{ productId: "p25", qty: 15, cost: 300 }, { productId: "p24", qty: 15, cost: 280 }] },
  { id: "PO-507", date: "2026-08-06", supplierId: "s4", status: "Received", items: [{ productId: "p12", qty: 12, cost: 280 }, { productId: "p16", qty: 8, cost: 450 }] },
  { id: "PO-508", date: "2026-08-11", supplierId: "s6", status: "Pending", items: [{ productId: "p9", qty: 20, cost: 250 }] },
];

/* -------------------------------- Helpers -------------------------------- */

export function genId(prefix) {
  return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
}

export function fmtINR(n) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}

export function fmtDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function saleTotal(sale) {
  if (!sale || !sale.items) return 0;
  return sale.items.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0);
}

export function purchaseTotal(po) {
  if (!po || !po.items) return 0;
  return po.items.reduce((sum, it) => sum + (it.qty || 0) * (it.cost || 0), 0);
}

export function customerName(customers, id) {
  if (!id) return "Walk-in Customer";
  const found = customers.find((c) => c.id === id);
  return found ? found.name : "Walk-in Customer";
}

export function supplierName(suppliers, id) {
  const found = suppliers.find((s) => s.id === id);
  return found ? found.name : "Unknown Supplier";
}

export function loadStoredData(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load from storage", e);
  }
  return defaultData;
}

export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
}

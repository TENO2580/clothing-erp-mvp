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
  products: "vastra_erp_products_v3",
  customers: "vastra_erp_customers_v3",
  suppliers: "vastra_erp_suppliers_v3",
  sales: "vastra_erp_sales_v3",
  purchases: "vastra_erp_purchases_v3",
};

export const SEED_PRODUCTS = [
  { id: "p1", name: "Cotton Formal Shirt", category: "Gents", subcategory: "Shirts", size: "L", color: "White", sku: "GEN-SH-001", cost: 450, price: 799, stock: 24, reorder: 10, addedDate: "2026-01-10" },
  { id: "p2", name: "Slim Fit Casual Shirt", category: "Gents", subcategory: "Shirts", size: "M", color: "Sky Blue", sku: "GEN-SH-002", cost: 420, price: 749, stock: 18, reorder: 10, addedDate: "2026-01-18" },
  { id: "p3", name: "Round Neck T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "XL", color: "Black", sku: "GEN-TS-003", cost: 180, price: 349, stock: 40, reorder: 15, addedDate: "2026-02-01" },
  { id: "p4", name: "Polo T-Shirt", category: "Gents", subcategory: "T-Shirts", size: "L", color: "Navy", sku: "GEN-TS-004", cost: 220, price: 449, stock: 30, reorder: 15, addedDate: "2026-01-25" },
  { id: "p5", name: "Formal Trousers", category: "Gents", subcategory: "Trousers", size: "34", color: "Grey", sku: "GEN-TR-005", cost: 500, price: 899, stock: 20, reorder: 8, addedDate: "2025-12-15" },
  { id: "p6", name: "Denim Jeans", category: "Gents", subcategory: "Jeans", size: "32", color: "Dark Blue", sku: "GEN-JN-006", cost: 650, price: 1199, stock: 22, reorder: 8, addedDate: "2026-01-05" },
  { id: "p7", name: "Cotton Kurta", category: "Gents", subcategory: "Ethnic", size: "L", color: "White", sku: "GEN-KU-007", cost: 380, price: 699, stock: 15, reorder: 6, addedDate: "2025-11-20" },
  { id: "p8", name: "Blazer", category: "Gents", subcategory: "Formal", size: "40", color: "Charcoal", sku: "GEN-BL-008", cost: 1400, price: 2499, stock: 6, reorder: 3, addedDate: "2025-10-10" },
  { id: "p9", name: "Mundu (Kerala Dhoti)", category: "Gents", subcategory: "Ethnic", size: "Free", color: "Cream", sku: "GEN-MU-009", cost: 250, price: 449, stock: 35, reorder: 12, addedDate: "2026-02-08" },
  { id: "p10", name: "Sports Track Pant", category: "Gents", subcategory: "Sportswear", size: "L", color: "Black", sku: "GEN-TP-010", cost: 300, price: 549, stock: 25, reorder: 10, addedDate: "2026-01-28" },
  
  { id: "p11", name: "Boys Printed T-Shirt", category: "Kids", subcategory: "T-Shirts", size: "6-7Y", color: "Red", sku: "KID-TS-001", cost: 150, price: 299, stock: 28, reorder: 10, addedDate: "2026-02-12" },
  { id: "p12", name: "Girls Cotton Frock", category: "Kids", subcategory: "Dresses", size: "4-5Y", color: "Pink", sku: "KID-FR-002", cost: 280, price: 549, stock: 20, reorder: 8, addedDate: "2026-01-20" },
  { id: "p13", name: "Kids Denim Shorts", category: "Kids", subcategory: "Shorts", size: "8-9Y", color: "Blue", sku: "KID-SH-003", cost: 200, price: 399, stock: 18, reorder: 8, addedDate: "2026-01-14" },
  { id: "p14", name: "School Uniform Shirt", category: "Kids", subcategory: "Uniform", size: "10-11Y", color: "White", sku: "KID-UN-004", cost: 220, price: 399, stock: 30, reorder: 12, addedDate: "2025-12-05" },
  { id: "p15", name: "Boys Cargo Pants", category: "Kids", subcategory: "Pants", size: "8-9Y", color: "Olive", sku: "KID-CP-005", cost: 260, price: 499, stock: 16, reorder: 6, addedDate: "2026-01-08" },
  { id: "p16", name: "Girls Party Dress", category: "Kids", subcategory: "Dresses", size: "6-7Y", color: "Lavender", sku: "KID-PD-006", cost: 450, price: 899, stock: 10, reorder: 4, addedDate: "2025-11-15" },
  { id: "p17", name: "Infant Romper Set", category: "Kids", subcategory: "Infant", size: "0-1Y", color: "Yellow", sku: "KID-RM-007", cost: 180, price: 349, stock: 22, reorder: 8, addedDate: "2026-02-14" },
  { id: "p18", name: "Kids Ethnic Kurta Set", category: "Kids", subcategory: "Ethnic", size: "4-5Y", color: "Maroon", sku: "KID-ES-008", cost: 380, price: 699, stock: 12, reorder: 5, addedDate: "2025-12-28" },
  { id: "p19", name: "Boys Track Suit", category: "Kids", subcategory: "Sportswear", size: "10-11Y", color: "Navy", sku: "KID-TR-009", cost: 320, price: 599, stock: 14, reorder: 6, addedDate: "2026-01-22" },
  { id: "p20", name: "Girls Leggings", category: "Kids", subcategory: "Leggings", size: "6-7Y", color: "Pink", sku: "KID-LG-010", cost: 120, price: 249, stock: 26, reorder: 10, addedDate: "2026-02-05" },
  
  { id: "p21", name: "Cotton Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Teal", sku: "WOM-SR-001", cost: 650, price: 1299, stock: 15, reorder: 5, addedDate: "2026-01-12" },
  { id: "p22", name: "Anarkali Salwar Suit", category: "Women", subcategory: "Salwar Suits", size: "L", color: "Maroon", sku: "WOM-SK-002", cost: 800, price: 1599, stock: 12, reorder: 5, addedDate: "2026-01-02" },
  { id: "p23", name: "Printed Kurti", category: "Women", subcategory: "Kurtis", size: "M", color: "Mustard", sku: "WOM-KU-003", cost: 350, price: 649, stock: 25, reorder: 10, addedDate: "2026-02-10" },
  { id: "p24", name: "Western Top", category: "Women", subcategory: "Tops", size: "S", color: "White", sku: "WOM-TP-004", cost: 280, price: 549, stock: 22, reorder: 8, addedDate: "2026-01-30" },
  { id: "p25", name: "Palazzo Pants", category: "Women", subcategory: "Bottoms", size: "M", color: "Black", sku: "WOM-PL-005", cost: 300, price: 599, stock: 20, reorder: 8, addedDate: "2026-01-16" },
  { id: "p26", name: "Leggings", category: "Women", subcategory: "Bottoms", size: "L", color: "Beige", sku: "WOM-LG-006", cost: 150, price: 299, stock: 30, reorder: 12, addedDate: "2026-02-15" },
  { id: "p27", name: "Silk Saree", category: "Women", subcategory: "Sarees", size: "Free", color: "Golden", sku: "WOM-SS-007", cost: 1800, price: 3499, stock: 8, reorder: 3, addedDate: "2025-11-01" },
  { id: "p28", name: "Denim Jacket", category: "Women", subcategory: "Jackets", size: "M", color: "Blue", sku: "WOM-DJ-008", cost: 550, price: 999, stock: 10, reorder: 4, addedDate: "2025-12-18" },
  { id: "p29", name: "Nightwear Set", category: "Women", subcategory: "Nightwear", size: "L", color: "Pink", sku: "WOM-NW-009", cost: 320, price: 599, stock: 18, reorder: 6, addedDate: "2026-01-26" },
  { id: "p30", name: "Designer Blouse", category: "Women", subcategory: "Blouses", size: "M", color: "Red", sku: "WOM-BL-010", cost: 250, price: 449, stock: 16, reorder: 6, addedDate: "2025-10-25" },
];

export const SEED_CUSTOMERS = [
  { id: "c1", name: "Anitha Nair", phone: "9846012345", email: "anitha.nair@example.com", city: "Kochi", address: "MG Road, Ernakulam" },
  { id: "c2", name: "Ravi Kumar", phone: "9847023456", email: "ravi.kumar@example.com", city: "Trivandrum", address: "Statue Junction" },
  { id: "c3", name: "Sneha Thomas", phone: "9895034567", email: "sneha.thomas@example.com", city: "Kottayam", address: "Baker Junction" },
  { id: "c4", name: "Mohammed Rafi", phone: "9744045678", email: "m.rafi@example.com", city: "Calicut", address: "SM Street" },
  { id: "c5", name: "Divya Menon", phone: "9633056789", email: "divya.menon@example.com", city: "Thrissur", address: "Round South" },
  { id: "c6", name: "Arjun Pillai", phone: "9447067890", email: "arjun.pillai@example.com", city: "Kollam", address: "Beach Road" },
  { id: "c7", name: "Fathima Beevi", phone: "9562078901", email: "fathima.b@example.com", city: "Malappuram", address: "Down Hill" },
  { id: "c8", name: "Suresh G", phone: "9846089012", email: "suresh.g@example.com", city: "Palakkad", address: "Fort Road" },
];

export const SEED_SUPPLIERS = [
  { id: "s1", name: "Kerala Handlooms Ltd", phone: "0471-2345678", email: "orders@keralahandlooms.com", city: "Balaramapuram", category: "Ethnic & Handloom" },
  { id: "s2", name: "Tirupur Knitwear Hub", phone: "0421-9876543", email: "sales@tirupurknitwear.com", city: "Tirupur", category: "T-Shirts & Casuals" },
  { id: "s3", name: "Surat Silk Mills", phone: "0261-5554321", email: "contact@suratsilks.com", city: "Surat", category: "Sarees & Ethnic" },
  { id: "s4", name: "Ludhiana Woollens", phone: "0161-4443322", email: "info@ludhianawoollens.com", city: "Ludhiana", category: "Winterwear" },
  { id: "s5", name: "Mumbai Apparel Co", phone: "022-67891234", email: "mumbai@apparelco.com", city: "Mumbai", category: "Denim & Western" },
  { id: "s6", name: "Bangalore Garment Works", phone: "080-22334455", email: "contact@bgw.com", city: "Bangalore", category: "Formals & Blouses" },
];

export const SEED_SALES = [
  {
    id: "INV-1001",
    date: "2026-07-18",
    customerId: "c1",
    items: [
      { productId: "p1", qty: 1, price: 799 },
      { productId: "p5", qty: 1, price: 899 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1002",
    date: "2026-07-19",
    customerId: null,
    items: [
      { productId: "p23", qty: 2, price: 649 },
    ],
    paymentMode: "Cash",
  },
  {
    id: "INV-1003",
    date: "2026-07-20",
    customerId: "c2",
    items: [
      { productId: "p11", qty: 3, price: 299 },
      { productId: "p20", qty: 1, price: 249 },
    ],
    paymentMode: "Card",
  },
  {
    id: "INV-1004",
    date: "2026-07-22",
    customerId: "c3",
    items: [
      { productId: "p21", qty: 1, price: 1299 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1005",
    date: "2026-07-24",
    customerId: "c4",
    items: [
      { productId: "p6", qty: 1, price: 1199 },
      { productId: "p4", qty: 1, price: 449 },
    ],
    paymentMode: "Cash",
  },
  {
    id: "INV-1006",
    date: "2026-07-28",
    customerId: "c5",
    items: [
      { productId: "p24", qty: 1, price: 549 },
      { productId: "p25", qty: 1, price: 599 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1007",
    date: "2026-08-01",
    customerId: null,
    items: [
      { productId: "p3", qty: 2, price: 349 },
    ],
    paymentMode: "Cash",
  },
  {
    id: "INV-1008",
    date: "2026-08-03",
    customerId: "c6",
    items: [
      { productId: "p9", qty: 2, price: 449 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1009",
    date: "2026-08-06",
    customerId: "c1",
    items: [
      { productId: "p22", qty: 1, price: 1599 },
    ],
    paymentMode: "Card",
  },
  {
    id: "INV-1010",
    date: "2026-08-08",
    customerId: "c7",
    items: [
      { productId: "p17", qty: 2, price: 349 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1011",
    date: "2026-08-10",
    customerId: "c2",
    items: [
      { productId: "p2", qty: 1, price: 749 },
    ],
    paymentMode: "Cash",
  },
  {
    id: "INV-1012",
    date: "2026-08-12",
    customerId: "c3",
    items: [
      { productId: "p22", qty: 1, price: 1599 },
    ],
    paymentMode: "UPI",
  },
  {
    id: "INV-1013",
    date: "2026-08-14",
    customerId: null,
    items: [
      { productId: "p13", qty: 1, price: 399 },
      { productId: "p11", qty: 1, price: 299 },
    ],
    paymentMode: "Cash",
  },
  {
    id: "INV-1014",
    date: "2026-08-15",
    customerId: "c8",
    items: [
      { productId: "p7", qty: 1, price: 699 },
    ],
    paymentMode: "UPI",
  },
];

export const SEED_PURCHASES = [
  {
    id: "PO-2026-001",
    date: "2026-07-01",
    supplierId: "s1",
    status: "Received",
    items: [
      { productId: "p9", qty: 50, cost: 250 },
      { productId: "p7", qty: 25, cost: 380 },
    ],
  },
  {
    id: "PO-2026-002",
    date: "2026-07-05",
    supplierId: "s2",
    status: "Received",
    items: [
      { productId: "p3", qty: 60, cost: 180 },
      { productId: "p4", qty: 45, cost: 220 },
      { productId: "p11", qty: 40, cost: 150 },
    ],
  },
  {
    id: "PO-2026-003",
    date: "2026-07-10",
    supplierId: "s3",
    status: "Received",
    items: [
      { productId: "p21", qty: 25, cost: 650 },
      { productId: "p27", qty: 12, cost: 1800 },
    ],
  },
  {
    id: "PO-2026-004",
    date: "2026-07-15",
    supplierId: "s5",
    status: "Received",
    items: [
      { productId: "p6", qty: 35, cost: 650 },
      { productId: "p28", qty: 15, cost: 550 },
    ],
  },
  {
    id: "PO-2026-005",
    date: "2026-07-20",
    supplierId: "s6",
    status: "Received",
    items: [
      { productId: "p1", qty: 35, cost: 450 },
      { productId: "p2", qty: 30, cost: 420 },
      { productId: "p5", qty: 30, cost: 500 },
    ],
  },
  {
    id: "PO-2026-006",
    date: "2026-07-25",
    supplierId: "s2",
    status: "Received",
    items: [
      { productId: "p14", qty: 45, cost: 220 },
      { productId: "p20", qty: 35, cost: 120 },
      { productId: "p26", qty: 45, cost: 150 },
    ],
  },
  {
    id: "PO-2026-007",
    date: "2026-08-01",
    supplierId: "s3",
    status: "Received",
    items: [
      { productId: "p22", qty: 20, cost: 800 },
      { productId: "p23", qty: 35, cost: 350 },
    ],
  },
  {
    id: "PO-2026-008",
    date: "2026-08-10",
    supplierId: "s1",
    status: "Pending",
    items: [
      { productId: "p9", qty: 30, cost: 250 },
      { productId: "p8", qty: 10, cost: 1400 },
    ],
  },
];

export function fmtINR(n) {
  if (n === undefined || n === null) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
}

export function fmtDate(isoStr) {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return isoStr;
  }
}

export function calcAgeingDays(dateStr) {
  if (!dateStr) return 0;
  const now = new Date();
  const added = new Date(dateStr);
  const diffTime = now - added;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function genId(prefix, num) {
  return `${prefix}${num}`;
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

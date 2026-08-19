import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { NavTabs } from "./components/NavTabs";
import { DashboardView } from "./components/DashboardView";
import { InventoryView } from "./components/InventoryView";
import { SalesView } from "./components/SalesView";
import { PurchasesView } from "./components/PurchasesView";
import { CustomersView } from "./components/CustomersView";
import { SuppliersView } from "./components/SuppliersView";
import { ReportsView } from "./components/ReportsView";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PWAUpdateToast } from "./components/PWAUpdateToast";
import { usePWA } from "./hooks/usePWA";
import {
  STORAGE_KEYS,
  SEED_PRODUCTS,
  SEED_CUSTOMERS,
  SEED_SUPPLIERS,
  SEED_SALES,
  SEED_PURCHASES,
  loadStoredData,
  saveStoredData
} from "./data/seedData";
import { exportToJSON } from "./utils/exportUtils";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function App() {
  // Read initial tab from URL shortcuts if present (?tab=sales etc.)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["dashboard", "inventory", "sales", "purchases", "customers", "suppliers", "reports"].includes(tabParam)) {
        return tabParam;
      }
    } catch (e) {}
    return "dashboard";
  });

  // PWA Hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isOffline,
    justReconnected,
    needRefresh,
    installApp,
    updateApp,
    setNeedRefresh,
  } = usePWA();

  // Persistent States
  const [products, setProducts] = useState(() =>
    loadStoredData(STORAGE_KEYS.products, SEED_PRODUCTS)
  );
  const [customers, setCustomers] = useState(() =>
    loadStoredData(STORAGE_KEYS.customers, SEED_CUSTOMERS)
  );
  const [suppliers, setSuppliers] = useState(() =>
    loadStoredData(STORAGE_KEYS.suppliers, SEED_SUPPLIERS)
  );
  const [sales, setSales] = useState(() =>
    loadStoredData(STORAGE_KEYS.sales, SEED_SALES)
  );
  const [purchases, setPurchases] = useState(() =>
    loadStoredData(STORAGE_KEYS.purchases, SEED_PURCHASES)
  );

  // Toast message state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync with LocalStorage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.customers, customers);
  }, [customers]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.suppliers, suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.sales, sales);
  }, [sales]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.purchases, purchases);
  }, [purchases]);

  /* ------------------- Inventory Handlers ------------------- */

  const handleAddProduct = (newProd) => {
    setProducts([newProd, ...products]);
    showToast(`Added product "${newProd.name}"`);
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts(products.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    showToast(`Updated "${updatedProd.name}"`);
  };

  const handleDeleteProduct = (id) => {
    const p = products.find((prod) => prod.id === id);
    if (window.confirm(`Are you sure you want to delete ${p?.name || "this product"}?`)) {
      setProducts(products.filter((prod) => prod.id !== id));
      showToast("Product deleted");
    }
  };

  const handleAdjustStock = (id, delta) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  /* ------------------- Sales Handlers ------------------- */

  const handleAddSale = (newSale) => {
    // 1. Add to sales list
    setSales([newSale, ...sales]);

    // 2. Automatically deduct stock in inventory!
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const itemSold = newSale.items.find((it) => it.productId === p.id);
        if (itemSold) {
          return { ...p, stock: Math.max(0, p.stock - itemSold.qty) };
        }
        return p;
      });
    });

    showToast(`Invoice ${newSale.id} generated & inventory stock updated!`);
  };

  /* ------------------- Purchases Handlers ------------------- */

  const handleAddPurchase = (newPO) => {
    setPurchases([newPO, ...purchases]);

    // If marked as Received, auto-increment stock!
    if (newPO.status === "Received") {
      setProducts((prevProducts) => {
        return prevProducts.map((p) => {
          const itemBought = newPO.items.find((it) => it.productId === p.id);
          if (itemBought) {
            return { ...p, stock: p.stock + itemBought.qty };
          }
          return p;
        });
      });
      showToast(`Purchase order ${newPO.id} received & inventory stock added!`);
    } else {
      showToast(`Purchase order ${newPO.id} created (Pending delivery)`);
    }
  };

  const handleMarkReceived = (poId) => {
    const po = purchases.find((p) => p.id === poId);
    if (!po) return;

    // Update PO status
    setPurchases(
      purchases.map((p) => (p.id === poId ? { ...p, status: "Received" } : p))
    );

    // Increment inventory stock
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const itemBought = po.items.find((it) => it.productId === p.id);
        if (itemBought) {
          return { ...p, stock: p.stock + itemBought.qty };
        }
        return p;
      });
    });

    showToast(`PO ${poId} marked as Received. Inventory updated!`);
  };

  /* ------------------- Customers Handlers ------------------- */

  const handleAddCustomer = (newCust) => {
    setCustomers([newCust, ...customers]);
    showToast(`Registered client "${newCust.name}"`);
  };

  const handleUpdateCustomer = (updatedCust) => {
    setCustomers(customers.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    showToast(`Updated profile for "${updatedCust.name}"`);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm("Are you sure you want to remove this client?")) {
      setCustomers(customers.filter((c) => c.id !== id));
      showToast("Client removed");
    }
  };

  /* ------------------- Suppliers Handlers ------------------- */

  const handleAddSupplier = (newSup) => {
    setSuppliers([newSup, ...suppliers]);
    showToast(`Registered vendor "${newSup.name}"`);
  };

  const handleUpdateSupplier = (updatedSup) => {
    setSuppliers(suppliers.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
    showToast(`Updated vendor "${updatedSup.name}"`);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to remove this supplier?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      showToast("Supplier removed");
    }
  };

  /* ------------------- Full Backup Export ------------------- */

  const handleExportAll = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      storeName: "Vastra Fashion House",
      products,
      customers,
      suppliers,
      sales,
      purchases,
    };
    exportToJSON(`vastra_erp_full_backup_${new Date().toISOString().slice(0, 10)}.json`, fullBackup);
    showToast("Full database backup downloaded!");
  };

  /* ------------------- Reset Demo Data ------------------- */

  const handleResetDemo = () => {
    if (window.confirm("Reset all data back to initial seed state? This will restore original sample records.")) {
      setProducts(SEED_PRODUCTS);
      setCustomers(SEED_CUSTOMERS);
      setSuppliers(SEED_SUPPLIERS);
      setSales(SEED_SALES);
      setPurchases(SEED_PURCHASES);
      localStorage.clear();
      showToast("Demo data restored to initial state!");
    }
  };

  const moduleCounts = {
    products: products.length,
    sales: sales.length,
    purchases: purchases.length,
    customers: customers.length,
    suppliers: suppliers.length,
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-stone-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900 pb-safe">
      {/* Offline Status Bar */}
      <OfflineIndicator isOffline={isOffline} justReconnected={justReconnected} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* PWA Update Waiting Toast */}
      <PWAUpdateToast
        needRefresh={needRefresh}
        onUpdate={updateApp}
        onDismiss={() => setNeedRefresh(false)}
      />

      {/* Header */}
      <Header
        onResetDemo={handleResetDemo}
        onExportAll={handleExportAll}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={installApp}
      />

      {/* Navigation Bar */}
      <NavTabs active={activeTab} onChange={setActiveTab} counts={moduleCounts} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 pl-safe pr-safe">
        {activeTab === "dashboard" && (
          <DashboardView
            products={products}
            sales={sales}
            customers={customers}
            suppliers={suppliers}
            purchases={purchases}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activeTab === "sales" && (
          <SalesView
            sales={sales}
            products={products}
            customers={customers}
            onAddSale={handleAddSale}
          />
        )}

        {activeTab === "purchases" && (
          <PurchasesView
            purchases={purchases}
            suppliers={suppliers}
            products={products}
            onAddPurchase={handleAddPurchase}
            onMarkReceived={handleMarkReceived}
          />
        )}

        {activeTab === "customers" && (
          <CustomersView
            customers={customers}
            sales={sales}
            products={products}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeTab === "suppliers" && (
          <SuppliersView
            suppliers={suppliers}
            purchases={purchases}
            products={products}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}

        {activeTab === "reports" && (
          <ReportsView
            sales={sales}
            products={products}
            customers={customers}
          />
        )}
      </main>
    </div>
  );
}
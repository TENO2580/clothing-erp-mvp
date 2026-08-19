import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { NavTabs } from "./components/NavTabs";
import { DashboardView } from "./components/DashboardView";
import { InventoryView } from "./components/InventoryView";
import { SalesView } from "./components/SalesView";
import { DetailedSalesReportView } from "./components/DetailedSalesReportView";
import { PurchasesView } from "./components/PurchasesView";
import { CustomersView } from "./components/CustomersView";
import { SuppliersView } from "./components/SuppliersView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
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
  DEFAULT_SETTINGS,
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
      if (tabParam && ["dashboard", "inventory", "sales", "sales-report", "purchases", "customers", "suppliers", "reports", "settings"].includes(tabParam)) {
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
  const [settings, setSettings] = useState(() =>
    loadStoredData(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
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

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.settings, settings);
  }, [settings]);

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

  const handleAddSale = (newSale, newCustomer = null) => {
    // If a new customer was entered at POS counter, save them to customers database!
    if (newCustomer) {
      setCustomers((prevCusts) => {
        const exists = prevCusts.find(
          (c) => c.phone === newCustomer.phone || c.id === newCustomer.id
        );
        if (!exists) {
          return [newCustomer, ...prevCusts];
        }
        return prevCusts;
      });
    }

    // 1. Add to sales list
    setSales([newSale, ...sales]);

    // 2. Automatically deduct stock in inventory matching exact product, department, size & color!
    setProducts((prevProducts) => {
      const soldQuantities = {};
      newSale.items.forEach((it) => {
        soldQuantities[it.productId] = (soldQuantities[it.productId] || 0) + Number(it.qty);
      });

      return prevProducts.map((p) => {
        const qtyToDeduct = soldQuantities[p.id];
        if (qtyToDeduct) {
          const newStock = Math.max(0, p.stock - qtyToDeduct);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    const totalQtyBilled = newSale.items.reduce((sum, it) => sum + Number(it.qty), 0);
    showToast(`Invoice ${newSale.id} generated · ${totalQtyBilled} garment pcs deducted from stock!`);
  };

  /* ------------------- Purchases Handlers ------------------- */

  const handleAddPurchase = (newPO) => {
    setPurchases([newPO, ...purchases]);

    // If marked as Received, auto-increment stock!
    if (newPO.status === "Received") {
      setProducts((prev) => {
        const receivedMap = {};
        newPO.items.forEach((it) => {
          receivedMap[it.productId] = (receivedMap[it.productId] || 0) + Number(it.qty);
        });

        return prev.map((p) => {
          const added = receivedMap[p.id];
          return added ? { ...p, stock: p.stock + added } : p;
        });
      });
    }

    showToast(`Purchase Order ${newPO.id} recorded!`);
  };

  const handleMarkReceived = (poId) => {
    const po = purchases.find((p) => p.id === poId);
    if (!po || po.status === "Received") return;

    // Update PO status
    setPurchases(
      purchases.map((p) => (p.id === poId ? { ...p, status: "Received" } : p))
    );

    // Auto-increment product stocks
    setProducts((prev) => {
      const receivedMap = {};
      po.items.forEach((it) => {
        receivedMap[it.productId] = (receivedMap[it.productId] || 0) + Number(it.qty);
      });

      return prev.map((p) => {
        const added = receivedMap[p.id];
        return added ? { ...p, stock: p.stock + added } : p;
      });
    });

    showToast(`PO ${poId} marked as Received & Stock Updated!`);
  };

  /* ------------------- Customers Handlers ------------------- */

  const handleAddCustomer = (newCust) => {
    setCustomers([newCust, ...customers]);
    showToast(`Customer "${newCust.name}" added`);
  };

  const handleUpdateCustomer = (updatedCust) => {
    setCustomers(customers.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    showToast(`Updated customer "${updatedCust.name}"`);
  };

  const handleDeleteCustomer = (id) => {
    const c = customers.find((cust) => cust.id === id);
    if (window.confirm(`Are you sure you want to delete ${c?.name || "this customer"}?`)) {
      setCustomers(customers.filter((cust) => cust.id !== id));
      showToast("Customer deleted");
    }
  };

  /* ------------------- Suppliers Handlers ------------------- */

  const handleAddSupplier = (newSup) => {
    setSuppliers([newSup, ...suppliers]);
    showToast(`Supplier "${newSup.name}" added`);
  };

  const handleUpdateSupplier = (updatedSup) => {
    setSuppliers(suppliers.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
    showToast(`Updated supplier "${updatedSup.name}"`);
  };

  const handleDeleteSupplier = (id) => {
    const s = suppliers.find((sup) => sup.id === id);
    if (window.confirm(`Are you sure you want to delete ${s?.name || "this supplier"}?`)) {
      setSuppliers(suppliers.filter((sup) => sup.id !== id));
      showToast("Supplier deleted");
    }
  };

  /* ------------------- Settings Handlers ------------------- */

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    showToast("System master settings updated!");
  };

  const handleResetSettings = () => {
    if (window.confirm("Reset all dropdown options and master settings to default values?")) {
      setSettings(DEFAULT_SETTINGS);
      showToast("Dropdown options reset to default!");
    }
  };

  /* ------------------- System Actions ------------------- */

  const handleResetDemo = () => {
    if (window.confirm("Reset entire ERP database to fresh demo dataset?")) {
      localStorage.clear();
      setProducts(SEED_PRODUCTS);
      setCustomers(SEED_CUSTOMERS);
      setSuppliers(SEED_SUPPLIERS);
      setSales(SEED_SALES);
      setPurchases(SEED_PURCHASES);
      setSettings(DEFAULT_SETTINGS);
      showToast("Database reset to demo state");
    }
  };

  const handleExportAll = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      system: "Vastra Fashion ERP v3.0",
      settings,
      products,
      customers,
      suppliers,
      sales,
      purchases,
    };
    exportToJSON(`vastra_erp_full_backup_${new Date().toISOString().slice(0, 10)}.json`, allData);
    showToast("Full database backup exported!");
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
            settings={settings}
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
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "sales-report" && (
          <DetailedSalesReportView
            sales={sales}
            products={products}
            customers={customers}
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
            products={products}
            sales={sales}
            purchases={purchases}
            customers={customers}
            suppliers={suppliers}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettings={handleResetSettings}
          />
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import PurchasesManager from '../PurchasesManager';
import Sales from '../Sales';
import Waste from '../Waste';
import Expenses from '../Expenses';
import Suppliers from '../Suppliers';
import Financials from '../Financials';
import Reports from '../Reports';
import Customers from '../Customers';
import Inventory from '../Inventory';
import ProductionManager from '../ProductionManager';

const LegacyModules = ({ activePage, onBack }) => {
  const loadSavedData = (key, initialValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      return initialValue;
    }
  };

  const [inventory, setInventory] = useState(() => loadSavedData('inventory', []));
  const [stock, setStock] = useState(() => loadSavedData('stock', []));
  const [salesData, setSalesData] = useState(() => loadSavedData('salesData', []));
  const [expenses, setExpenses] = useState(() => loadSavedData('expenses', []));
  const [waste, setWaste] = useState(() => loadSavedData('waste', []));
  const [suppliers, setSuppliers] = useState(() => loadSavedData('suppliers', []));
  const [customers, setCustomers] = useState(() => loadSavedData('customers', []));
  const [productionData, setProductionData] = useState(() => loadSavedData('productionData', []));
  const [supplierWaitingList, setSupplierWaitingList] = useState(() => loadSavedData('waitingList', []));

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stock', JSON.stringify(stock));
    localStorage.setItem('salesData', JSON.stringify(salesData));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('waste', JSON.stringify(waste));
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('productionData', JSON.stringify(productionData));
    localStorage.setItem('waitingList', JSON.stringify(supplierWaitingList));
  }, [inventory, stock, salesData, expenses, waste, suppliers, customers, productionData, supplierWaitingList]);

  const handleSavePurchase = (newPurchase) => {
    setInventory(prev => [...prev, newPurchase]);
    setStock(prevStock => {
      const existing = prevStock.findIndex(s => s.name === newPurchase.item);
      const qty = parseFloat(newPurchase.quantity || 0);
      if (existing > -1) {
        const updated = [...prevStock];
        updated[existing].balance += qty;
        return updated;
      }
      return [...prevStock, {
        id: Date.now(), name: newPurchase.item, balance: qty, price: parseFloat(newPurchase.price || 0)
      }];
    });
    onBack();
  };

  const handleGeneralUpdate = (type, data) => {
    if (type === 'sales') setSalesData(prev => [...prev, data]);
    if (type === 'waste') setWaste(prev => [...prev, data]);
    if (data.itemName) {
      setStock(prev => prev.map(item =>
        item.name === data.itemName ? { ...item, balance: item.balance - (data.quantity || 0) } : item
      ));
    }
  };

  const commonProps = { onBack };

  const renderModule = () => {
    switch (activePage) {
      case 'purchases':
        return <PurchasesManager {...commonProps} stock={stock} onPurchaseComplete={handleSavePurchase} onOrderTrigger={(d) => setSupplierWaitingList(prev => [d, ...prev])} />;
      case 'suppliers':
        return <Suppliers {...commonProps} suppliers={suppliers} waitingList={supplierWaitingList} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onUpdateWaitingList={setSupplierWaitingList} />;
      case 'inventory':
        return <Inventory {...commonProps} categories={stock} onDelete={(id) => setStock(stock.filter(s => s.id !== id))} />;
      case 'sales':
        return <Sales {...commonProps} onSaveSale={(s) => handleGeneralUpdate('sales', s)} customers={customers} />;
      case 'production':
        return <ProductionManager {...commonProps} stock={stock} setStock={setStock} onSaveProduction={(p) => setProductionData([...productionData, p])} onSaveWaste={(w) => handleGeneralUpdate('waste', w)} />;
      case 'waste':
        return <Waste {...commonProps} inventory={stock} onSaveWaste={(w) => handleGeneralUpdate('waste', w)} />;
      case 'expenses':
        return <Expenses {...commonProps} onSaveExpense={(e) => setExpenses([...expenses, e])} />;
      case 'customers':
        return <Customers {...commonProps} customers={customers} onAddCustomer={(c) => setCustomers([...customers, c])} />;
      case 'financials':
        return <Financials {...commonProps} salesData={salesData} expenses={expenses} />;
      case 'reports':
        return <Reports {...commonProps} inventory={inventory} stock={stock} salesData={salesData} expenses={expenses} />;
      default:
        return (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-slate-400">الصفحة غير موجودة</p>
            <button onClick={onBack} className="btn-primary mt-4 inline-flex items-center gap-2">
              <ArrowRight size={18} /> العودة للرئيسية
            </button>
          </div>
        );
    }
  };

  return <div className="animate-fade-in">{renderModule()}</div>;
};

export default LegacyModules;

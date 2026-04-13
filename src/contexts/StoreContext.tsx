import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Product, SalesTransaction, GeneratedReport, Employee, Expense, mockProducts, mockSales, mockReports, mockEmployees, mockExpenses } from '@/data/mockData';
import { useSync } from './SyncContext';

interface StoreContextType {
  products: Product[];
  sales: SalesTransaction[];
  reports: GeneratedReport[];
  employees: Employee[];
  expenses: Expense[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addSale: (sale: SalesTransaction) => void;
  updateSale: (id: string, updates: Partial<SalesTransaction>, oldItems?: { productId: string; qty: number }[]) => void;
  deleteSale: (id: string) => void;
  setSales: React.Dispatch<React.SetStateAction<SalesTransaction[]>>;
  addReport: (report: GeneratedReport) => void;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  resetStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('smartsuite_products');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockProducts;
  });

  const [sales, setSales] = useState<SalesTransaction[]>(() => {
    const saved = localStorage.getItem('smartsuite_sales');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockSales;
  });

  const [reports, setReports] = useState<GeneratedReport[]>(() => {
    const saved = localStorage.getItem('smartsuite_reports');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockReports;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('smartsuite_employees');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockEmployees;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('smartsuite_expenses');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return mockExpenses;
  });

  // Sync and Migrate
  useEffect(() => { 
    // Data Migration: Ensure all products have at least a base unit array
    let needsUpdate = false;
    const migrated = products.map(p => {
      if (!p.units || p.units.length === 0) {
        needsUpdate = true;
        return { 
          ...p, 
          units: [{ id: `u-${p.id}-base`, name: 'Piece', conversionRate: 1, price: p.price, cost: p.cost, isBase: true }] 
        };
      }
      return p;
    });

    if (needsUpdate) {
      setProducts(migrated);
    } else {
      localStorage.setItem('smartsuite_products', JSON.stringify(products)); 
    }
  }, [products]);
  useEffect(() => { localStorage.setItem('smartsuite_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('smartsuite_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('smartsuite_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('smartsuite_expenses', JSON.stringify(expenses)); }, [expenses]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartsuite_products' && e.newValue) { try { setProducts(JSON.parse(e.newValue)); } catch (err) {} }
      if (e.key === 'smartsuite_sales' && e.newValue) { try { setSales(JSON.parse(e.newValue)); } catch (err) {} }
      if (e.key === 'smartsuite_reports' && e.newValue) { try { setReports(JSON.parse(e.newValue)); } catch (err) {} }
      if (e.key === 'smartsuite_employees' && e.newValue) { try { setEmployees(JSON.parse(e.newValue)); } catch (err) {} }
      if (e.key === 'smartsuite_expenses' && e.newValue) { try { setExpenses(JSON.parse(e.newValue)); } catch (err) {} }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sync = useSync();

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
    sync.enqueue('ADD_PRODUCT', product);
  }, [sync]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    sync.enqueue('UPDATE_PRODUCT', { id, updates });
  }, [sync]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    sync.enqueue('DELETE_PRODUCT', { id });
  }, [sync]);

  const addSale = useCallback((sale: SalesTransaction) => {
    setSales(prev => [sale, ...prev]);
    sync.enqueue('ADD_SALE', sale);
  }, [sync]);

  const updateSale = useCallback((id: string, updates: Partial<SalesTransaction>, oldItems?: { productId: string; qty: number }[]) => {
    // Handling inventory sync if items changed
    if (oldItems) {
      setProducts(prev => prev.map(p => {
        const oldItem = oldItems.find(i => i.productId === p.id);
        const newItem = updates.items?.find(i => i.productId === p.id);
        
        if (oldItem && newItem) {
          const diff = newItem.qty - oldItem.qty;
          return { ...p, stock: Math.max(0, p.stock - diff) };
        } else if (oldItem) {
          // Item removed completely
          return { ...p, stock: p.stock + oldItem.qty };
        } else if (newItem) {
          // New item added
          return { ...p, stock: Math.max(0, p.stock - newItem.qty) };
        }
        return p;
      }));
    }

    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    sync.enqueue('UPDATE_SALE', { id, updates });
  }, [sync]);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => {
      const saleToDelete = prev.find(s => s.id === id);
      if (saleToDelete) {
        // Return items to stock
        setProducts(currProducts => currProducts.map(p => {
          const item = saleToDelete.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: p.stock + item.qty };
          return p;
        }));
      }
      return prev.filter(s => s.id !== id);
    });
    sync.enqueue('DELETE_SALE', { id });
  }, [sync]);

  const addReport = useCallback((report: GeneratedReport) => {
    setReports(prev => [report, ...prev]);
    sync.enqueue('ADD_REPORT', report);
  }, [sync]);

  const resetStoreData = useCallback(() => {
    setProducts([]);
    setSales([]);
    setReports([]);
    setEmployees([]);
    setExpenses([]);
  }, []);

  return (
    <StoreContext.Provider value={{
      products, sales, reports, employees, expenses,
      addProduct, updateProduct, deleteProduct, setProducts,
      addSale, updateSale, deleteSale, setSales, addReport,
      setEmployees, setExpenses, resetStoreData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

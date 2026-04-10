import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, SalesTransaction, mockProducts, mockSales } from '@/data/mockData';

interface StoreContextType {
  products: Product[];
  sales: SalesTransaction[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addSale: (sale: SalesTransaction) => void;
  deleteSale: (id: string) => void;
  setSales: React.Dispatch<React.SetStateAction<SalesTransaction[]>>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<SalesTransaction[]>(mockSales);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSale = useCallback((sale: SalesTransaction) => {
    setSales(prev => [sale, ...prev]);
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <StoreContext.Provider value={{ products, sales, addProduct, updateProduct, deleteProduct, setProducts, addSale, deleteSale, setSales }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

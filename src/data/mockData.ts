export type UserRole = 'owner' | 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const mockUsers: User[] = [
  { id: '1', name: 'Vesmenda', email: 'owner@vesmenda.com', role: 'owner' },
  { id: '2', name: 'Maria Santos', email: 'admin@vesmenda.com', role: 'admin' },
  { id: '3', name: 'Juan Dela Cruz', email: 'cashier@vesmenda.com', role: 'cashier' },
];

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export const mockProducts: Product[] = [
  { id: '1', barcode: '8901234567890', name: 'Premium Rice 5kg', category: 'Grains', price: 280, cost: 220, stock: 45, minStock: 10 },
  { id: '2', barcode: '8901234567891', name: 'Cooking Oil 1L', category: 'Cooking', price: 95, cost: 72, stock: 30, minStock: 15 },
  { id: '3', barcode: '8901234567892', name: 'Canned Sardines', category: 'Canned Goods', price: 28, cost: 18, stock: 120, minStock: 30 },
  { id: '4', barcode: '8901234567893', name: 'Instant Noodles Pack', category: 'Noodles', price: 12, cost: 8, stock: 200, minStock: 50 },
  { id: '5', barcode: '8901234567894', name: 'Coffee 3-in-1 (10pcs)', category: 'Beverages', price: 85, cost: 62, stock: 60, minStock: 20 },
  { id: '6', barcode: '8901234567895', name: 'Laundry Detergent 1kg', category: 'Household', price: 145, cost: 105, stock: 25, minStock: 10 },
  { id: '7', barcode: '8901234567896', name: 'Shampoo 200ml', category: 'Personal Care', price: 120, cost: 85, stock: 35, minStock: 10 },
  { id: '8', barcode: '8901234567897', name: 'Milk 1L', category: 'Dairy', price: 78, cost: 58, stock: 40, minStock: 15 },
  { id: '9', barcode: '8901234567898', name: 'White Bread', category: 'Bakery', price: 55, cost: 38, stock: 20, minStock: 8 },
  { id: '10', barcode: '8901234567899', name: 'Eggs (12pcs)', category: 'Dairy', price: 96, cost: 72, stock: 50, minStock: 15 },
];

export interface SalesTransaction {
  id: string;
  date: string;
  items: { productId: string; productName: string; qty: number; price: number }[];
  total: number;
  cashier: string;
  paymentMethod: string;
}

export const mockSales: SalesTransaction[] = [
  { id: 'TXN-001', date: '2026-02-17 09:15', items: [{ productId: '1', productName: 'Premium Rice 5kg', qty: 2, price: 280 }, { productId: '2', productName: 'Cooking Oil 1L', qty: 1, price: 95 }], total: 655, cashier: 'Juan Dela Cruz', paymentMethod: 'Cash' },
  { id: 'TXN-002', date: '2026-02-17 10:30', items: [{ productId: '3', productName: 'Canned Sardines', qty: 5, price: 28 }, { productId: '4', productName: 'Instant Noodles Pack', qty: 10, price: 12 }], total: 260, cashier: 'Juan Dela Cruz', paymentMethod: 'GCash' },
  { id: 'TXN-003', date: '2026-02-16 14:00', items: [{ productId: '5', productName: 'Coffee 3-in-1 (10pcs)', qty: 3, price: 85 }], total: 255, cashier: 'Juan Dela Cruz', paymentMethod: 'Cash' },
  { id: 'TXN-004', date: '2026-02-16 11:45', items: [{ productId: '8', productName: 'Milk 1L', qty: 2, price: 78 }, { productId: '9', productName: 'White Bread', qty: 1, price: 55 }], total: 211, cashier: 'Juan Dela Cruz', paymentMethod: 'Cash' },
  { id: 'TXN-005', date: '2026-02-15 16:20', items: [{ productId: '10', productName: 'Eggs (12pcs)', qty: 2, price: 96 }, { productId: '6', productName: 'Laundry Detergent 1kg', qty: 1, price: 145 }], total: 337, cashier: 'Juan Dela Cruz', paymentMethod: 'Maya' },
];

export const monthlySalesData = [
  { month: 'Sep', sales: 42500, profit: 12800 },
  { month: 'Oct', sales: 48200, profit: 15100 },
  { month: 'Nov', sales: 51000, profit: 16200 },
  { month: 'Dec', sales: 68500, profit: 22400 },
  { month: 'Jan', sales: 45800, profit: 14200 },
  { month: 'Feb', sales: 38200, profit: 11500 },
];

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  phone: string;
}

export const mockEmployees: Employee[] = [
  { id: 'EMP-001', name: 'Maria Santos', position: 'Store Manager', department: 'Management', salary: 25000, startDate: '2023-01-15', status: 'Active', phone: '0917-123-4567' },
  { id: 'EMP-002', name: 'Juan Dela Cruz', position: 'Cashier', department: 'Sales', salary: 15000, startDate: '2023-06-01', status: 'Active', phone: '0918-234-5678' },
  { id: 'EMP-003', name: 'Ana Reyes', position: 'Stock Clerk', department: 'Inventory', salary: 13000, startDate: '2024-02-10', status: 'Active', phone: '0919-345-6789' },
  { id: 'EMP-004', name: 'Pedro Garcia', position: 'Delivery', department: 'Logistics', salary: 14000, startDate: '2024-05-20', status: 'On Leave', phone: '0920-456-7890' },
];

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', date: '2026-02-17', category: 'Utilities', description: 'Electricity Bill', amount: 4500 },
  { id: 'EXP-002', date: '2026-02-17', category: 'Rent', description: 'Store Rent - February', amount: 15000 },
  { id: 'EXP-003', date: '2026-02-16', category: 'Supplies', description: 'Packaging materials', amount: 1200 },
  { id: 'EXP-004', date: '2026-02-15', category: 'Maintenance', description: 'AC repair', amount: 3500 },
  { id: 'EXP-005', date: '2026-02-14', category: 'Transportation', description: 'Delivery fuel', amount: 800 },
];

export type UserRole = 'owner' | 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
}

export const mockUsers: User[] = [];

export interface ProductUnit {
  id: string;
  name: string; // 'Piece', 'Dozen', 'Half-Dozen', 'Gallon', 'Kilogram', etc.
  conversionRate: number; // relative to base unit (e.g., Dozen = 12)
  price: number;
  cost: number;
  isBase: boolean;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number; // This will be the price of the base unit
  cost: number; // This will be the cost of the base unit
  stock: number; // Always tracked in base units
  minStock: number;
  units: ProductUnit[];
}

export const mockProducts: Product[] = [];

export interface SalesTransaction {
  id: string;
  date: string;
  items: { productId: string; productName: string; qty: number; price: number }[];
  total: number;
  cashier: string;
  paymentMethod: string;
}

export const mockSales: SalesTransaction[] = [];

export const monthlySalesData: { month: string, sales: number, profit: number }[] = [];

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  startDate?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  phone: string;
  birthdate?: string;
  address?: string;
  photo?: string; // base64 data URL
}

export const mockEmployees: Employee[] = [];

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export const mockExpenses: Expense[] = [];

export interface GeneratedReport {
  id: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
}

export const mockReports: GeneratedReport[] = [];

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

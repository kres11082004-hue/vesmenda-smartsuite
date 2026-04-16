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

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export const mockUsers: User[] = [];

export interface ProductUnit {
  id: string;
  name: string;
  conversionRate: number;
  price: number;
  cost: number;
  isBase: boolean;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
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

export const monthlySalesData: { month: string; sales: number; profit: number }[] = [];

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
  photo?: string;
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

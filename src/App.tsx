import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSales from "./pages/AdminSales";
import AdminInventory from "./pages/AdminInventory";
import AdminHR from "./pages/AdminHR";
import AdminFinance from "./pages/AdminFinance";
import AdminReports from "./pages/AdminReports";
import CashierDashboard from "./pages/CashierDashboard";
import CashierTransactions from "./pages/CashierTransactions";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Owner */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/sales" element={<AdminSales />} />
            <Route path="/owner/inventory" element={<AdminInventory />} />
            <Route path="/owner/hr" element={<AdminHR />} />
            <Route path="/owner/finance" element={<AdminFinance />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/hr" element={<AdminHR />} />
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            {/* Cashier */}
            <Route path="/cashier" element={<CashierDashboard />} />
            <Route path="/cashier/transactions" element={<CashierTransactions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { monthlySalesData, mockSales, mockProducts, mockEmployees, mockExpenses } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const OwnerDashboard = () => {
  const totalSales = mockSales.reduce((s, t) => s + t.total, 0);
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const lowStock = mockProducts.filter(p => p.stock <= p.minStock).length;

  return (
    <DashboardLayout allowedRoles={['owner']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your store's performance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Sales" value={`₱${totalSales.toLocaleString()}`} change="+12% from last month" changeType="positive" icon={DollarSign} />
          <StatCard title="Transactions" value={mockSales.length.toString()} change="+5 today" changeType="positive" icon={ShoppingCart} />
          <StatCard title="Low Stock Items" value={lowStock.toString()} change={lowStock > 0 ? "Needs attention" : "All good"} changeType={lowStock > 0 ? "negative" : "positive"} icon={Package} />
          <StatCard title="Employees" value={mockEmployees.length.toString()} change={`${mockEmployees.filter(e => e.status === 'Active').length} active`} changeType="neutral" icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">ID</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Cashier</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Payment</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {mockSales.map(sale => (
                  <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                    <td className="py-2.5 px-3">{sale.date}</td>
                    <td className="py-2.5 px-3">{sale.cashier}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{sale.paymentMethod}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">₱{sale.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;

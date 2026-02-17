import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { monthlySalesData, mockSales, mockProducts, mockEmployees, mockExpenses } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AdminDashboard = () => {
  const totalSales = mockSales.reduce((s, t) => s + t.total, 0);
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  const categoryData = mockProducts.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) existing.value += p.stock;
    else acc.push({ name: p.category, value: p.stock });
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Staff/Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor store operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Sales" value={`₱${totalSales.toLocaleString()}`} change="+8% vs yesterday" changeType="positive" icon={DollarSign} />
          <StatCard title="Products" value={mockProducts.length.toString()} change={`${mockProducts.filter(p => p.stock <= p.minStock).length} low stock`} changeType="negative" icon={Package} />
          <StatCard title="Employees" value={mockEmployees.length.toString()} icon={Users} />
          <StatCard title="Net Profit" value={`₱${netProfit.toLocaleString()}`} change="This period" changeType="positive" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="stat-card lg:col-span-2">
            <h3 className="font-semibold mb-4">Sales & Profit Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold mb-4">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((c, i) => (
                <span key={c.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Recent Expenses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Description</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockExpenses.map(exp => (
                  <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2.5 px-3">{exp.date}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">{exp.category}</span></td>
                    <td className="py-2.5 px-3">{exp.description}</td>
                    <td className="py-2.5 px-3 text-right font-medium">₱{exp.amount.toLocaleString()}</td>
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

export default AdminDashboard;

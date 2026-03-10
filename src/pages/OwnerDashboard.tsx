import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react';
import { monthlySalesData, mockSales, mockProducts, mockEmployees, mockExpenses } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const OwnerDashboard = () => {
  const totalSales = mockSales.reduce((s, t) => s + t.total, 0);
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const lowStockProducts = mockProducts.filter(p => p.stock <= p.minStock);

  const categoryData = mockProducts.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) existing.value += p.stock;
    else acc.push({ name: p.category, value: p.stock });
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);

  return (
    <DashboardLayout allowedRoles={['owner']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Sales" value={`₱${totalSales.toLocaleString()}`} change="+15.3% from last month" changeType="positive" icon={DollarSign} />
          <StatCard title="Total Products" value={mockProducts.length.toString()} icon={Package} />
          <StatCard title="Low Stock Items" value={lowStockProducts.length.toString()} changeType={lowStockProducts.length > 0 ? "negative" : "positive"} change={lowStockProducts.length > 0 ? "Needs attention" : "All good"} icon={AlertTriangle} />
          <StatCard title="Monthly Expenses" value={`₱${totalExpenses.toLocaleString()}`} change="3.2% from last month" changeType="neutral" icon={DollarSign} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Sales Trend</h3>
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

          <div className="stat-card">
            <h3 className="font-semibold mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="value">
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

        {/* Recent Transactions */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Transaction ID</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Item</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Stock Left</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Payment Method</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {mockSales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                    <td className="py-2.5 px-3">{sale.items[0]?.productName}</td>
                    <td className="py-2.5 px-3 text-right font-medium">₱{sale.total.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      {(() => {
                        const product = mockProducts.find(p => p.id === sale.items[0]?.productId);
                        return product ? `${product.stock} left` : '-';
                      })()}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={sale.paymentMethod === 'Cash' ? 'default' : 'secondary'} className="text-xs">
                        {sale.paymentMethod}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      {(() => {
                        const product = mockProducts.find(p => p.id === sale.items[0]?.productId);
                        return product?.category || '-';
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="stat-card border-warning/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Low Stock Alerts
            </h3>
            <div className="space-y-2">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-warning/5">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-sm text-warning font-semibold">{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;

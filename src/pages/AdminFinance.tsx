import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Expense } from '@/data/mockData';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, TrendingUp, TrendingDown, PhilippinePeso } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StatCard } from '@/components/StatCard';

type DetailView = 'revenue' | 'expenses' | 'profit' | null;

const AdminFinance = () => {
  const { user } = useAuth();
  const { sales, expenses, addExpense, deleteExpense } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ date: '', category: '', description: '', amount: '' });
  const [detailView, setDetailView] = useState<DetailView>(null);

  const totalRevenue = sales.reduce((s, t) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, e) => {
    const existing = acc.find(c => c.category === e.category);
    if (existing) { existing.amount += e.amount; existing.count += 1; }
    else acc.push({ category: e.category, amount: e.amount, count: 1 });
    return acc;
  }, [] as { category: string; amount: number; count: number }[]);

  const handleAdd = () => {
    if (!form.description || !form.amount) { toast.error('Fill required fields'); return; }
    addExpense({ id: `EXP-${Date.now()}`, date: form.date || new Date().toISOString().split('T')[0], category: form.category, description: form.description, amount: +form.amount });
    toast.success('Expense added');
    setDialogOpen(false);
    setForm({ date: '', category: '', description: '', amount: '' });
  };

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Finance & Accounting</h1>
            <p className="text-violet-200 text-sm">Track expenses and profit</p>
          </div>
          {user?.role !== 'owner' && (
            <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Expense</Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={TrendingUp} changeType="positive" change="From sales" onClick={() => setDetailView('revenue')} />
          <StatCard title="Total Expenses" value={`₱${totalExpenses.toLocaleString()}`} icon={TrendingDown} changeType="negative" change="This period" onClick={() => setDetailView('expenses')} />
          <StatCard title="Net Profit" value={`₱${netProfit.toLocaleString()}`} icon={PhilippinePeso} changeType={netProfit > 0 ? "positive" : "negative"} change={netProfit > 0 ? "Profitable" : "Loss"} onClick={() => setDetailView('profit')} />
        </div>

        {/* Detail: Revenue */}
        <Dialog open={detailView === 'revenue'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Revenue Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{sales.length} transactions</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">ID</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-left py-2 px-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id} className="border-b border-border/50">
                      <td className="py-2 px-2 font-mono text-xs">{sale.id}</td>
                      <td className="py-2 px-2 text-xs">{sale.date}</td>
                      <td className="py-2 px-2 text-xs">{sale.items.map(i => `${i.productName} x${i.qty}`).join(', ')}</td>
                      <td className="py-2 px-2 text-right font-medium">₱{sale.total.toLocaleString()}</td>
                      <td className="py-2 px-2"><Badge variant="secondary" className="text-xs">{sale.paymentMethod}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail: Expenses */}
        <Dialog open={detailView === 'expenses'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-destructive" /> Expenses by Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">₱{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                {expenseByCategory.sort((a, b) => b.amount - a.amount).map(c => (
                  <div key={c.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{c.category}</p>
                      <p className="text-xs text-muted-foreground">{c.count} expense{c.count > 1 ? 's' : ''}</p>
                    </div>
                    <p className="text-sm font-bold">₱{c.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail: Profit */}
        <Dialog open={detailView === 'profit'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><PhilippinePeso className="w-5 h-5 text-primary" /> Profit Summary</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-sm font-bold">₱{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-sm font-bold">-₱{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <p className="text-sm font-medium">Net Profit</p>
                  <p className={`text-lg font-bold ${netProfit > 0 ? 'text-success' : 'text-destructive'}`}>₱{netProfit.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Profit margin: {((netProfit / totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Utilities" /></div>
              <div className="col-span-2 space-y-1"><Label>Description *</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-2 space-y-1"><Label>Amount *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            </div>
            <Button onClick={handleAdd} className="mt-2">Save Expense</Button>
          </DialogContent>
        </Dialog>

        <div className="stat-card overflow-x-auto">
          <h3 className="font-semibold mb-4">Expense Records</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-left py-2 px-3">Description</th>
                <th className="text-right py-2 px-3">Amount</th>
                {user?.role !== 'owner' && <th className="text-right py-2 px-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={user?.role !== 'owner' ? 5 : 4} className="py-8 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              ) : expenses.map(exp => (
                <tr key={exp.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3">{exp.date}</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">{exp.category}</span></td>
                  <td className="py-2.5 px-3">{exp.description}</td>
                  <td className="py-2.5 px-3 text-right font-medium">₱{exp.amount.toLocaleString()}</td>
                  {user?.role !== 'owner' && (
                    <td className="py-2.5 px-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteExpense(exp.id); toast.success('Deleted'); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFinance;

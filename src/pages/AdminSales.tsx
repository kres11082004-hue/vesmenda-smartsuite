import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockSales, SalesTransaction } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminSales = () => {
  const [sales, setSales] = useState<SalesTransaction[]>(mockSales);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<SalesTransaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = sales.filter(s => s.id.toLowerCase().includes(search.toLowerCase()) || s.cashier.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
    toast.success('Transaction deleted');
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sales Management</h1>
            <p className="text-muted-foreground text-sm">View and manage sales transactions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditItem(null)}><Plus className="w-4 h-4 mr-2" />Add Sale</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Transaction</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Transaction form would go here with product selection, quantity, and payment method fields.</p>
              <Button onClick={() => { setDialogOpen(false); toast.success('Transaction saved'); }}>Save</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Items</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Payment</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sale => (
                <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                  <td className="py-2.5 px-3">{sale.date}</td>
                  <td className="py-2.5 px-3">{sale.items.length} items</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{sale.paymentMethod}</span></td>
                  <td className="py-2.5 px-3 text-right font-medium">₱{sale.total.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(sale); setDialogOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(sale.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSales;

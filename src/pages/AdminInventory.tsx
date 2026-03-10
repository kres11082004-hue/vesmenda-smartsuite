import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockProducts, Product } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, AlertCircle, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', barcode: '', category: '', price: '', cost: '', stock: '', minStock: '' });

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const openAdd = () => { setEditItem(null); setForm({ name: '', barcode: '', category: '', price: '', cost: '', stock: '', minStock: '' }); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditItem(p); setForm({ name: p.name, barcode: p.barcode, category: p.category, price: p.price.toString(), cost: p.cost.toString(), stock: p.stock.toString(), minStock: p.minStock.toString() }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.price) { toast.error('Fill required fields'); return; }
    if (editItem) {
      setProducts(prev => prev.map(p => p.id === editItem.id ? { ...p, name: form.name, barcode: form.barcode, category: form.category, price: +form.price, cost: +form.cost, stock: +form.stock, minStock: +form.minStock } : p));
      toast.success('Product updated');
    } else {
      const newProd: Product = { id: `P-${Date.now()}`, name: form.name, barcode: form.barcode, category: form.category, price: +form.price, cost: +form.cost, stock: +form.stock, minStock: +form.minStock };
      setProducts(prev => [...prev, newProd]);
      toast.success('Product added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); toast.success('Product deleted'); };

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <p className="text-muted-foreground text-sm">Manage your product inventory</p>
          </div>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Barcode</Label><Input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-1"><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-1"><Label>Cost</Label><Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></div>
              <div className="space-y-1"><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="space-y-1"><Label>Min Stock</Label><Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} /></div>
            </div>
            <Button onClick={handleSave} className="mt-2">Save Product</Button>
          </DialogContent>
        </Dialog>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Product</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Category</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Price</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Stock</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3">
                    <div><span className="font-medium">{p.name}</span><br /><span className="text-xs text-muted-foreground font-mono">{p.barcode}</span></div>
                  </td>
                  <td className="py-2.5 px-3">{p.category}</td>
                  <td className="py-2.5 px-3 text-right">₱{p.price.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.stock <= p.minStock && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                      <span className={p.stock <= p.minStock ? 'text-warning font-medium' : ''}>{p.stock}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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

export default AdminInventory;

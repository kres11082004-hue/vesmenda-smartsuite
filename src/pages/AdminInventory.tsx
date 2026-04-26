import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Product } from '@/data/mockData';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, AlertCircle, PhilippinePeso, ScanLine } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import { StatCard } from '@/components/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type DetailView = 'products' | 'lowstock' | 'value' | null;

const AdminInventory = () => {
  const { products, setProducts } = useStore();
  const { user, logActivity } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    barcode: '', 
    category: '', 
    price: '', 
    cost: '', 
    stock: '', 
    minStock: '',
    units: [] as { id: string; name: string; conversionRate: number | string; price: number | string; cost: number | string; isBase: boolean; }[]
  });
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const lowStockCount = lowStockItems.length;
  const inventoryValue = products.reduce((s, p) => {
    // Inventory value is always based on base cost and base stock
    return s + (p.cost * p.stock);
  }, 0);

  const openAdd = () => { 
    setEditItem(null); 
    setForm({ 
      name: '', 
      barcode: '', 
      category: '', 
      price: '', 
      cost: '', 
      stock: '', 
      minStock: '',
      units: [{ id: 'u1', name: 'Piece', conversionRate: 1, price: '', cost: '', isBase: true }] 
    }); 
    setDialogOpen(true); 
  };
  
  const openEdit = (p: Product) => { 
    setEditItem(p); 
    setForm({ 
      name: p.name, 
      barcode: p.barcode, 
      category: p.category, 
      price: p.price.toString(), 
      cost: p.cost.toString(), 
      stock: p.stock.toString(), 
      minStock: p.minStock.toString(),
      units: p.units || [{ id: 'u1', name: 'Piece', conversionRate: 1, price: p.price, cost: p.cost, isBase: true }]
    }); 
    setDialogOpen(true); 
  };

  const addUnitForm = () => {
    setForm(prev => ({
      ...prev,
      units: [...prev.units, { id: `u-${Date.now()}`, name: '', conversionRate: 1, price: '', cost: '', isBase: false }]
    }));
  };

  const removeUnitForm = (id: string) => {
    setForm(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id || u.isBase)
    }));
  };

  const updateUnitForm = (id: string, field: string, value: string | number) => {
    setForm(prev => ({
      ...prev,
      units: prev.units.map(u => {
        if (u.id !== id) return u;
        const updated = { ...u, [field]: value };
        // If updating base unit price/cost, sync with main form
        if (u.isBase) {
          if (field === 'price') prev.price = value.toString();
          if (field === 'cost') prev.cost = value.toString();
        }
        return updated;
      })
    }));
  };

  const handleSave = () => {
    if (!form.name) { toast.error('Fill required fields'); return; }
    
    // Ensure we have at least a base unit
    let finalUnits = form.units.map(u => ({
      ...u,
      price: +u.price || 0,
      cost: +u.cost || 0,
      conversionRate: +u.conversionRate || 1
    }));
    
    if (finalUnits.length === 0) {
      finalUnits = [{ id: 'u1', name: 'Piece', conversionRate: 1, price: +form.price || 0, cost: +form.cost || 0, isBase: true }];
    }

    // Ensure base unit values are synced with the main product fields
    const baseUnit = finalUnits.find(u => u.isBase);
    const finalPrice = baseUnit ? baseUnit.price : +form.price;
    const finalCost = baseUnit ? baseUnit.cost : +form.cost;

    if (editItem) {
      setProducts(prev => prev.map(p => p.id === editItem.id ? { 
        ...p, 
        name: form.name, 
        barcode: form.barcode, 
        category: form.category, 
        price: finalPrice, 
        cost: finalCost, 
        stock: +form.stock, 
        minStock: +form.minStock,
        units: finalUnits
      } : p));
      logActivity('Product Updated', `Updated ${form.name} with ${finalUnits.length} units`);
      toast.success('Product updated');
    } else {
      const newProd: Product = { 
        id: `P-${Date.now()}`, 
        name: form.name, 
        barcode: form.barcode, 
        category: form.category, 
        price: finalPrice, 
        cost: finalCost, 
        stock: +form.stock, 
        minStock: +form.minStock,
        units: finalUnits
      };
      setProducts(prev => [...prev, newProd]);
      logActivity('Product Added', `Added ${form.name} with ${finalUnits.length} units`);
      toast.success('Product added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { 
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(p => p.id !== id)); 
    logActivity('Product Deleted', `Deleted ${p?.name || id}`);
    toast.success('Product deleted'); 
  };

  // Group by category for value breakdown
  const categoryBreakdown = products.reduce((acc, p) => {
    const existing = acc.find(c => c.category === p.category);
    if (existing) { existing.value += p.cost * p.stock; existing.count += 1; }
    else acc.push({ category: p.category, value: p.cost * p.stock, count: 1 });
    return acc;
  }, [] as { category: string; value: number; count: number }[]);

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory</h1>
            <p className="text-violet-200 text-sm">Manage your product inventory</p>
          </div>
          {user?.role !== 'owner' && (
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Products" value={products.length.toString()} icon={Package} onClick={() => setDetailView('products')} />
          <StatCard title="Low Stock Items" value={lowStockCount.toString()} icon={AlertCircle} changeType={lowStockCount > 0 ? "negative" : "positive"} change={lowStockCount > 0 ? "Needs restocking" : "All stocked"} onClick={() => setDetailView('lowstock')} />
          <StatCard title="Inventory Value" value={`₱${inventoryValue.toLocaleString()}`} icon={PhilippinePeso} onClick={() => setDetailView('value')} />
        </div>

        {/* Detail: All Products */}
        <Dialog open={detailView === 'products'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> All Products ({products.length})</DialogTitle>
            </DialogHeader>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2">Product</th>
                  <th className="text-left py-2 px-2">Category</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">Cost</th>
                  <th className="text-right py-2 px-2">Stock</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium">{p.name}</td>
                    <td className="py-2 px-2 text-xs">{p.category}</td>
                    <td className="py-2 px-2 text-right">₱{p.price}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">₱{p.cost}</td>
                    <td className="py-2 px-2 text-right font-medium">{p.stock}</td>
                    <td className="py-2 px-2">
                      <Badge variant={p.stock <= p.minStock ? 'destructive' : 'default'} className="text-xs">
                        {p.stock <= p.minStock ? 'Low' : 'OK'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DialogContent>
        </Dialog>

        {/* Detail: Low Stock */}
        <Dialog open={detailView === 'lowstock'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-warning" /> Low Stock Items</DialogTitle>
            </DialogHeader>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All products are well stocked!</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} • Min: {p.minStock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-warning">{p.stock} left</p>
                      <p className="text-xs text-muted-foreground">Need {p.minStock - p.stock + 10} more</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Detail: Inventory Value */}
        <Dialog open={detailView === 'value'} onOpenChange={(o) => !o && setDetailView(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><PhilippinePeso className="w-5 h-5 text-primary" /> Inventory Value Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Total Inventory Value</p>
                <p className="text-xl font-bold">₱{inventoryValue.toLocaleString()}</p>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Category</p>
              <div className="space-y-2">
                {categoryBreakdown.sort((a, b) => b.value - a.value).map(c => (
                  <div key={c.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{c.category}</p>
                      <p className="text-xs text-muted-foreground">{c.count} products</p>
                    </div>
                    <p className="text-sm font-bold">₱{c.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1"><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Barcode</Label>
                <div className="flex gap-2">
                  <Input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Barcode" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setScannerOpen(true)}><ScanLine className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-1"><Label>Base Stock (Pieces)</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
              <div className="space-y-1"><Label>Min Stock Alert</Label><Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} /></div>
              
              <div className="col-span-2 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-bold">Units & Pricing</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addUnitForm}><Plus className="w-4 h-4 mr-1" /> Add Unit</Button>
                </div>
                <div className="space-y-3">
                  {form.units.map((unit) => (
                    <div key={unit.id} className="grid grid-cols-5 gap-2 items-end p-3 rounded-lg bg-muted/30 border">
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] uppercase">Unit Name</Label>
                        <Input 
                          placeholder="e.g. Dozen" 
                          value={unit.name} 
                          onChange={e => updateUnitForm(unit.id, 'name', e.target.value)}
                          disabled={unit.isBase}
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] uppercase">Conversion</Label>
                        <Input 
                          type="number" 
                          value={unit.conversionRate} 
                          onChange={e => updateUnitForm(unit.id, 'conversionRate', e.target.value)}
                          disabled={unit.isBase}
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] uppercase">Cost (₱)</Label>
                        <Input 
                          type="number" 
                          value={unit.cost} 
                          onChange={e => updateUnitForm(unit.id, 'cost', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <Label className="text-[10px] uppercase">Price (₱)</Label>
                        <Input 
                          type="number" 
                          value={unit.price} 
                          onChange={e => updateUnitForm(unit.id, 'price', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {!unit.isBase && (
                          <Button variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => removeUnitForm(unit.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {unit.isBase && <Badge variant="secondary" className="h-6">Base</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleSave} className="mt-6 w-full h-12 text-lg">Save Product & Units</Button>
          </DialogContent>
        </Dialog>

        <BarcodeScanner
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScan={(code) => {
            setForm(prev => ({ ...prev, barcode: code }));
            toast.success(`Barcode scanned: ${code}`);
          }}
        />

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Product</th>
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-right py-2 px-3">Price</th>
                <th className="text-right py-2 px-3">Stock</th>
                {user?.role !== 'owner' && <th className="text-right py-2 px-3">Actions</th>}
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
                  {user?.role !== 'owner' && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
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

export default AdminInventory;

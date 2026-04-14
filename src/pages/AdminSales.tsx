import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SalesTransaction } from '@/data/mockData';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ReceiptDialog, { CartItem } from '@/components/ReceiptDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminSales = () => {
  const { user } = useAuth();
  const { sales, deleteSale, updateSale, products } = useStore();
  const [search, setSearch] = useState('');
  
  // Edit State
  const [editItem, setEditItem] = useState<SalesTransaction | null>(null);
  const [editFormItems, setEditFormItems] = useState<{ productId: string; productName: string; qty: number; price: number }[]>([]);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('Cash');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Receipt State
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: CartItem[];
    total: number;
    paymentMethod: 'cash' | 'gcash';
    cashReceived: number;
    change: number;
    transactionId: string;
    date: Date;
  } | null>(null);

  const filtered = sales.filter(s => s.id.toLowerCase().includes(search.toLowerCase()) || s.cashier.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction? Items will be returned to stock.')) {
      deleteSale(id);
      toast.success('Transaction deleted and inventory restored.');
    }
  };

  const handleEditClick = (sale: SalesTransaction) => {
    setEditItem(sale);
    setEditFormItems([...sale.items]);
    setEditPaymentMethod(sale.paymentMethod);
    setDialogOpen(true);
  };

  const handleUpdateItemQty = (productId: string, delta: number) => {
    setEditFormItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    if (editFormItems.length <= 1) {
      toast.error('Transaction must have at least one item');
      return;
    }
    setEditFormItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    
    const newTotal = editFormItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    
    updateSale(editItem.id, {
      items: editFormItems,
      total: newTotal,
      paymentMethod: editPaymentMethod
    }, editItem.items);
    
    setDialogOpen(false);
    toast.success('Transaction updated and stock adjusted.');
  };

  const handleRowClick = (sale: SalesTransaction) => {
    setReceiptData({
      items: sale.items.map(i => {
        const product = products.find(p => p.id === i.productId);
        return {
          product: (product || { name: i.productName, price: i.price }) as unknown as CartItem['product'],
          qty: i.qty,
          unit: product?.units?.[0] || { id: 'u1', name: 'Piece', price: i.price, conversionRate: 1 }
        };
      }),
      total: sale.total,
      paymentMethod: sale.paymentMethod.toLowerCase() === 'gcash' ? 'gcash' : 'cash',
      cashReceived: sale.total, // Assume exact
      change: 0,
      transactionId: sale.id,
      date: new Date(sale.date)
    });
    setReceiptOpen(true);
  };

  return (
    <DashboardLayout allowedRoles={['admin', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Management</h1>
            <p className="text-violet-200 text-sm">View and manage sales transactions</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    Edit Transaction {editItem?.id}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transaction Items</Label>
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                      {editFormItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">₱{item.price.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-md" onClick={() => handleUpdateItemQty(item.productId, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-md" onClick={() => handleUpdateItemQty(item.productId, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80 ml-2" onClick={() => handleRemoveItem(item.productId)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</Label>
                    <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="GCash">GCash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">New Total:</span>
                    <span className="text-xl font-bold text-primary">₱{editFormItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveEdit}>Save Changes & Sync Stock</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Items</th>
                <th className="text-left py-2 px-3">Payment</th>
                <th className="text-right py-2 px-3">Total</th>
                {(user?.role === 'admin' || user?.role === 'owner') && <th className="text-right py-2 px-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sale => (
                <tr 
                  key={sale.id} 
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(sale)}
                >
                  <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                  <td className="py-2.5 px-3 text-xs">{sale.date}</td>
                  <td className="py-2.5 px-3 font-medium text-xs">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">₱{sale.total.toLocaleString()}</td>
                  {(user?.role === 'admin' || user?.role === 'owner') && (
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleEditClick(sale)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(sale.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {receiptData && (
        <ReceiptDialog
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          items={receiptData.items}
          total={receiptData.total}
          paymentMethod={receiptData.paymentMethod}
          cashReceived={receiptData.cashReceived}
          change={receiptData.change}
          transactionId={receiptData.transactionId}
          date={receiptData.date}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminSales;

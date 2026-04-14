import { useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Product, ProductUnit } from '@/data/mockData';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScanBarcode, Plus, Minus, Trash2, Calculator, Camera, ShoppingCart, Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ReceiptDialog from '@/components/ReceiptDialog';
import BarcodeScanner from '@/components/BarcodeScanner';

interface CartItem {
  product: Product;
  qty: number;
  unit: ProductUnit;
}

interface ReceiptData {
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'gcash';
  cashReceived: number;
  change: number;
  transactionId: string;
  date: Date;
}

const CashierDashboard = () => {
  const { products, addSale, setProducts } = useStore();
  const { user, logActivity } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  
  // Unit Selection State
  const [unitSelectOpen, setUnitSelectOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState('');
  const [calcOp, setCalcOp] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const addToCartWithUnit = (product: Product, unit: ProductUnit) => {
    setCart(prev => {
      // Check if item with SAME unit already exists
      const existing = prev.find(i => i.product.id === product.id && i.unit.id === unit.id);
      const totalBaseQtyInCart = prev
        .filter(i => i.product.id === product.id)
        .reduce((s, i) => s + (i.qty * i.unit.conversionRate), 0);
      
      const newBaseQtyNeeded = unit.conversionRate;
      
      if ((totalBaseQtyInCart + newBaseQtyNeeded) > product.stock) {
        toast.error(`Insufficient stock for ${product.name}. Available: ${product.stock} pieces.`);
        return prev;
      }

      if (existing) {
        return prev.map(i => (i.product.id === product.id && i.unit.id === unit.id) ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1, unit }];
    });
    setUnitSelectOpen(false);
    setPendingProduct(null);
  };

  const initiateAddToCart = useCallback((product: Product) => {
    if (!product.units || product.units.length <= 1) {
      // If no multi-units, use the default base price/cost logic but wrap it in a unit object for consistency
      const baseUnit = product.units?.[0] || { id: 'base', name: 'Piece', conversionRate: 1, price: product.price, cost: product.cost, isBase: true };
      addToCartWithUnit(product, baseUnit);
    } else {
      setPendingProduct(product);
      setUnitSelectOpen(true);
    }
  }, []);

  const handleBarcodeScan = useCallback((code: string) => {
    const product = products.find(p => p.barcode === code);
    if (!product) { toast.error(`Product not found for barcode: ${code}`); return; }
    initiateAddToCart(product);
  }, [initiateAddToCart, products]);

  const total = cart.reduce((s, i) => s + i.unit.price * i.qty, 0);
  const change = +cashReceived - total;

  const filteredProducts = products.filter(p => 
    !barcode.trim() || 
    p.name.toLowerCase().includes(barcode.toLowerCase()) || 
    p.barcode.includes(barcode.trim())
  );

  const scanProduct = () => {
    if (!barcode.trim()) return;
    const product = products.find(p => p.barcode === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()));
    if (!product) { toast.error('Product not found'); setBarcode(''); return; }
    initiateAddToCart(product);
    setBarcode('');
    barcodeRef.current?.focus();
  };

  const updateQty = (productId: string, unitId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId || i.unit.id !== unitId) return i;
      const newQty = i.qty + delta;
      if (newQty < 1) return i;
      
      // Check total stock deduction
      const otherItemsBaseQty = prev
        .filter(item => item.product.id === productId && item.unit.id !== unitId)
        .reduce((s, item) => s + (item.qty * item.unit.conversionRate), 0);
      
      const newBaseQty = (newQty * i.unit.conversionRate) + otherItemsBaseQty;
      
      if (newBaseQty > i.product.stock) {
        toast.error(`Only ${i.product.stock} pieces available for ${i.product.name}`);
        return i;
      }
      return { ...i, qty: newQty };
    }));
  };

  const removeItem = (productId: string, unitId: string) => 
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.unit.id === unitId)));

  const handlePayment = () => {
    if (paymentMethod === 'cash' && +cashReceived < total) { toast.error('Insufficient payment'); return; }

    // Deduct stock based on conversion rates
    setProducts(prev => prev.map(p => {
      const itemsForThisProduct = cart.filter(i => i.product.id === p.id);
      if (itemsForThisProduct.length > 0) {
        const totalBaseDeduction = itemsForThisProduct.reduce((s, i) => s + (i.qty * i.unit.conversionRate), 0);
        return { ...p, stock: Math.max(0, p.stock - totalBaseDeduction) };
      }
      return p;
    }));
    
    const txnId = 'TXN-' + Date.now().toString(36).toUpperCase();
    const now = new Date();
    const dateStr = now.toLocaleString();

    // Save transaction to shared sales
    addSale({
      id: txnId,
      date: dateStr,
      items: cart.map(i => ({ 
        productId: i.product.id, 
        productName: `${i.product.name} (${i.unit.name})`, 
        qty: i.qty, 
        price: i.unit.price 
      })),
      total,
      cashier: user?.name || 'Cashier',
      paymentMethod: paymentMethod === 'cash' ? 'Cash' : 'GCash',
    });

    const receiptInfo = {
      items: [...cart],
      total,
      paymentMethod,
      cashReceived: +cashReceived,
      change: paymentMethod === 'cash' ? +cashReceived - total : 0,
      transactionId: txnId,
      date: now,
    };

    setReceiptData(receiptInfo);
    toast.success('Sale Completed');
    logActivity('Sale Completed', `Processed sale of ₱${total.toLocaleString()}`);
    setCart([]);
    setCashReceived('');
    setPaymentOpen(false);
    setReceiptOpen(true);
  };

  const calcPress = (val: string) => {
    if (val === 'C') { setCalcDisplay('0'); setCalcPrev(''); setCalcOp(''); return; }
    if (val === '=') {
      if (!calcPrev || !calcOp) return;
      const a = parseFloat(calcPrev), b = parseFloat(calcDisplay);
      let result = 0;
      if (calcOp === '+') result = a + b;
      if (calcOp === '-') result = a - b;
      if (calcOp === '×') result = a * b;
      if (calcOp === '÷') result = b !== 0 ? a / b : 0;
      setCalcDisplay(result.toString());
      setCalcPrev(''); setCalcOp('');
      return;
    }
    if (['+', '-', '×', '÷'].includes(val)) {
      setCalcPrev(calcDisplay); setCalcOp(val); setCalcDisplay('0');
      return;
    }
    setCalcDisplay(prev => prev === '0' ? val : prev + val);
  };

  return (
    <DashboardLayout allowedRoles={['cashier']}>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* Left - Scanner & Products */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                ref={barcodeRef}
                placeholder="Scan barcode or search product name..."
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && scanProduct()}
                className="pl-11 h-12 text-base"
                autoFocus
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setScannerOpen(true)} title="Scan with camera">
              <Camera className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setCalcOpen(true)}>
              <Calculator className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Add Products Grid */}
          <div className="flex-1 overflow-auto">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Quick Add</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className={`flex flex-col p-3 rounded-lg border border-border bg-card transition-colors ${p.stock <= 0 ? 'opacity-50' : 'hover:bg-muted/30'}`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <p className="text-xs font-medium truncate flex-1" title={p.name}>{p.name}</p>
                    {p.units && p.units.length > 1 && (
                      <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none bg-violet-500/10 text-violet-400 border-violet-500/20">
                        Units
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">₱{p.price}</p>
                  <p className={`text-[10px] mb-2 flex-1 ${p.stock <= p.minStock ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    {p.stock <= 0 ? 'Out of stock' : `Stock: ${p.stock} pcs`}
                  </p>
                  <Button 
                    size="sm" 
                    variant={p.stock <= 0 ? "secondary" : "default"}
                    className="w-full text-xs h-7"
                    disabled={p.stock <= 0}
                    onClick={() => initiateAddToCart(p)}
                  >
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Cart */}
        <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Current Order</h2>
            <span className="ml-auto text-sm text-muted-foreground">{cart.length} items</span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ScanBarcode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Scan a barcode or click a product to start</p>
              </div>
            ) : cart.map(item => (
              <div key={`${item.product.id}-${item.unit.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.unit.name} • ₱{item.unit.price}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, item.unit.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, item.unit.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <p className="text-sm font-semibold w-16 text-right">₱{(item.unit.price * item.qty).toLocaleString()}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.product.id, item.unit.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">₱{total.toLocaleString()}</span>
            </div>
            <Button className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 bg-primary" disabled={cart.length === 0} onClick={() => setPaymentOpen(true)}>
              Process Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Unit Selection Dialog */}
      <Dialog open={unitSelectOpen} onOpenChange={setUnitSelectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Select Unit for {pendingProduct?.name}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-4">
            {pendingProduct?.units.map(unit => (
              <button
                key={unit.id}
                onClick={() => addToCartWithUnit(pendingProduct, unit)}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold text-lg group-hover:text-primary transition-colors">{unit.name}</p>
                  <p className="text-xs text-muted-foreground">Contains {unit.conversionRate} base units</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">₱{unit.price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">₱{(unit.price / unit.conversionRate).toFixed(2)} per piece</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted text-center">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">₱{total.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                >
                  <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${paymentMethod === 'cash' ? 'text-primary' : ''}`}>Cash</p>
                    <p className="text-[10px] text-muted-foreground">Physical payment</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('gcash')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${paymentMethod === 'gcash' ? 'border-[hsl(210,100%,50%)] bg-[hsl(210,100%,50%)]/5' : 'border-border hover:border-muted-foreground/30'}`}
                >
                  <Smartphone className={`w-6 h-6 ${paymentMethod === 'gcash' ? 'text-[hsl(210,100%,50%)]' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${paymentMethod === 'gcash' ? 'text-[hsl(210,100%,50%)]' : ''}`}>GCash</p>
                    <p className="text-[10px] text-muted-foreground">Mobile payment</p>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <>
                <div className="space-y-2">
                  <Label>Cash Received</Label>
                  <Input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="Enter amount" className="h-12 text-lg" autoFocus />
                </div>
                {+cashReceived > 0 && (
                  <div className="p-3 rounded-lg bg-muted flex justify-between">
                    <span>Change</span>
                    <span className={`font-bold ${change >= 0 ? 'text-success' : 'text-destructive'}`}>₱{change.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}

            {paymentMethod === 'gcash' && (
              <div className="p-4 rounded-lg border border-border bg-muted/50 text-center space-y-1">
                <Smartphone className="w-8 h-8 mx-auto text-[hsl(210,100%,50%)]" />
                <p className="text-sm font-medium">Scan QR or confirm GCash payment</p>
                <p className="text-xs text-muted-foreground">Amount: ₱{total.toLocaleString()}</p>
              </div>
            )}

            <Button
              className="w-full h-12 font-bold bg-primary"
              onClick={handlePayment}
              disabled={paymentMethod === 'cash' ? (!cashReceived || +cashReceived < total) : cart.length === 0}
            >
              {paymentMethod === 'cash' ? 'Complete Cash Payment' : 'Confirm GCash Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Calculator</DialogTitle></DialogHeader>
          <div className="bg-muted p-4 rounded-lg text-right text-2xl font-mono mb-2 min-h-[3rem]">
            {calcPrev && <span className="text-sm text-muted-foreground block">{calcPrev} {calcOp}</span>}
            {calcDisplay}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map(btn => (
              <Button
                key={btn}
                variant={['+','-','×','÷'].includes(btn) ? 'secondary' : btn === '=' ? 'default' : 'outline'}
                className="h-12 text-lg"
                onClick={() => calcPress(btn)}
              >
                {btn}
              </Button>
            ))}
            <Button variant="destructive" className="col-span-4 h-10" onClick={() => calcPress('C')}>Clear</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
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

      {/* Camera Barcode Scanner */}
      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleBarcodeScan} />
    </DashboardLayout>
  );
};

export default CashierDashboard;

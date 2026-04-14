import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Store } from 'lucide-react';
import { useRef } from 'react';
import { Product } from '@/data/mockData';

export interface CartItem {
  product: Product;
  qty: number;
  unit: {
    id: string;
    name: string;
    price: number;
    conversionRate: number;
  };
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'gcash';
  cashReceived: number;
  change: number;
  transactionId: string;
  date: Date;
}

const ReceiptDialog = ({ open, onOpenChange, items, total, paymentMethod, cashReceived, change, transactionId, date }: ReceiptDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transactionId}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; margin: 0; width: 280px; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .total-row { font-size: 14px; font-weight: bold; margin-top: 5px; }
            .branding { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
            p { margin: 2px 0; }
            .footer { margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="branding">VESMENDA STORE</div>
            <p>Poblacion Pitogo Zamboanga Del Sur</p>
            <p class="bold">OFFICIAL RECEIPT</p>
          </div>
          <div class="line"></div>
          <div class="row"><span>Date:</span> <span>${formatDate(date)}</span></div>
          <div class="row"><span>TXN:</span> <span>${transactionId}</span></div>
          <div class="line"></div>
          <div class="bold">ITEMS</div>
          ${items.map(item => `
            <div class="row">
              <div style="flex: 1;">${item.product.name} (${item.unit.name})</div>
            </div>
            <div class="row" style="padding-left: 10px; color: #333;">
              <span>${item.qty} x ${item.unit.price.toLocaleString()}</span>
              <span>₱${(item.unit.price * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row total-row">
            <span>TOTAL AMOUNT</span>
            <span>₱${total.toLocaleString()}</span>
          </div>
          <div class="line"></div>
          <div class="row"><span>Payment Method:</span> <span class="bold">${paymentMethod.toUpperCase()}</span></div>
          ${paymentMethod === 'cash' ? `
            <div class="row"><span>Amount Tendered:</span> <span>₱${cashReceived.toLocaleString()}</span></div>
            <div class="row bold"><span>Change:</span> <span>₱${change.toFixed(2)}</span></div>
          ` : ''}
          <div class="line"></div>
          <div class="center footer">
            <p>Thank you for shopping at Vesmenda!</p>
            <p>Please keep this receipt for your records.</p>
          </div>
        </body>
        <script>
          window.onafterprint = function() { window.close(); };
          window.print();
        </script>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
             <Store className="w-5 h-5 text-primary" />
             Store Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div ref={receiptRef} className="font-mono text-xs space-y-1 p-6 bg-white border border-gray-100 rounded-2xl shadow-inner text-gray-800">
            <div className="text-center space-y-1 mb-4">
              <p className="text-lg font-bold text-gray-900 leading-none">VESMENDA STORE</p>
              <p className="text-[10px] text-gray-400">Poblacion Pitogo Zamboanga Del Sur</p>
              <div className="py-0.5 px-3 bg-green-50 text-green-600 rounded-full inline-block text-[9px] font-bold">
                OFFICIAL RECEIPT
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 uppercase tracking-widest">Date:</span>
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 uppercase tracking-widest">Transaction:</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800 line-clamp-1 flex-1">{item.product.name} ({item.unit.name})</span>
                    <span className="font-bold text-gray-900 ml-2">₱{(item.unit.price * item.qty).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{item.qty} units @ ₱{item.unit.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-lg font-extrabold text-primary">₱{total.toLocaleString()}</span>
            </div>

            <div className="border-t border-gray-50 my-4" />

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-400">PAYMENT METHOD:</span>
                <span className="font-bold text-gray-800 uppercase">{paymentMethod}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AMOUNT TENDERED:</span>
                    <span className="font-medium">₱{cashReceived.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold border-t border-gray-100 pt-1">
                    <span>CHANGE:</span>
                    <span className="text-xs">₱{change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 text-center text-[10px] space-y-1">
              <p className="text-gray-400 font-medium">Thank you for choosing Vesmenda!</p>
              <p className="text-gray-300 italic">Please keep this for your records.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
            <Button variant="outline" className="h-12 border-gray-200 rounded-xl px-6" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useRef } from 'react';
import { Product } from '@/data/mockData';

interface CartItem {
  product: Product;
  qty: number;
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
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; margin: 0; width: 280px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; }
            .total-row { font-size: 14px; font-weight: bold; }
            p { margin: 2px 0; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
        <script>window.print(); window.close();</script>
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="font-mono text-xs space-y-1 p-4 bg-muted rounded-lg">
          <div className="text-center space-y-0.5">
            <p className="text-sm font-bold">VESMENDA STORE</p>
            <p className="text-muted-foreground">Official Receipt</p>
            <p className="text-muted-foreground">{formatDate(date)}</p>
            <p className="text-muted-foreground">TXN: {transactionId}</p>
          </div>

          <div className="border-t border-dashed border-foreground/30 my-2" />

          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={idx}>
                <p className="font-medium">{item.product.name}</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>{item.qty} x ₱{item.product.price.toLocaleString()}</span>
                  <span>₱{(item.product.price * item.qty).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-foreground/30 my-2" />

          <div className="flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>₱{total.toLocaleString()}</span>
          </div>

          <div className="border-t border-dashed border-foreground/30 my-2" />

          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="font-medium uppercase">{paymentMethod}</span>
            </div>
            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Cash</span>
                  <span>₱{cashReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change</span>
                  <span>₱{change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-foreground/30 my-2" />

          <div className="text-center text-muted-foreground">
            <p>Thank you for shopping!</p>
            <p>Please come again</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Receipt
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;

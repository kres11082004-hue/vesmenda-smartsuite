import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useStore } from '@/contexts/StoreContext';
import ReceiptDialog from '@/components/ReceiptDialog';
import { Receipt } from 'lucide-react';

const CashierTransactions = () => {
  const { sales, products } = useStore();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleRowClick = (sale: any) => {
    setReceiptData({
      items: sale.items.map((i: any) => ({
        product: products.find((p) => p.id === i.productId) || { name: i.productName, price: i.price },
        qty: i.qty,
      })),
      total: sale.total,
      paymentMethod: sale.paymentMethod.toLowerCase(),
      cashReceived: sale.total,
      change: 0,
      transactionId: sale.id,
      date: new Date(sale.date),
    });
    setReceiptOpen(true);
  };

  return (
    <DashboardLayout allowedRoles={['cashier']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Transactions</h1>
          <p className="text-violet-200 text-sm">Click any row to view its receipt</p>
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
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">No transactions yet</td>
                </tr>
              ) : sales.map(sale => (
                <tr
                  key={sale.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(sale)}
                >
                  <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                  <td className="py-2.5 px-3 text-xs">{sale.date}</td>
                  <td className="py-2.5 px-3 text-xs">{sale.items.map((i: any) => `${i.productName} x${i.qty}`).join(', ')}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">₱{sale.total.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Receipt className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </td>
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

export default CashierTransactions;

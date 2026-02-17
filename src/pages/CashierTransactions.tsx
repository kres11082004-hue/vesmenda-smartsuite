import { DashboardLayout } from '@/components/DashboardLayout';
import { mockSales } from '@/data/mockData';

const CashierTransactions = () => {
  return (
    <DashboardLayout allowedRoles={['cashier']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Transactions</h1>
          <p className="text-muted-foreground text-sm">View your processed transactions</p>
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
              </tr>
            </thead>
            <tbody>
              {mockSales.map(sale => (
                <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 px-3 font-mono text-xs">{sale.id}</td>
                  <td className="py-2.5 px-3">{sale.date}</td>
                  <td className="py-2.5 px-3">{sale.items.map(i => `${i.productName} x${i.qty}`).join(', ')}</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{sale.paymentMethod}</span></td>
                  <td className="py-2.5 px-3 text-right font-medium">₱{sale.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashierTransactions;

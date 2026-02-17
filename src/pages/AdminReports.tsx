import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { FileText, Download, ShoppingCart, Package, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const reports = [
  { title: 'Sales Report', description: 'Complete sales transactions summary', icon: ShoppingCart },
  { title: 'Inventory Report', description: 'Current stock levels and valuation', icon: Package },
  { title: 'Payroll Report', description: 'Employee salary and deductions summary', icon: Users },
  { title: 'Financial Report', description: 'Revenue, expenses, and profit analysis', icon: DollarSign },
];

const AdminReports = () => {
  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Generate and download store reports</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.title} className="stat-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
                <Button variant="outline" size="sm" onClick={() => toast.success(`${r.title} generated!`)}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />Generate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;

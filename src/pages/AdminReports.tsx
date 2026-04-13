import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { FileText, Download, ShoppingCart, Package, Users, PhilippinePeso } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';

const reports = [
  { title: 'Sales Report', description: 'Complete sales transactions summary', icon: ShoppingCart },
  { title: 'Inventory Report', description: 'Current stock levels and valuation', icon: Package },
  { title: 'Payroll Report', description: 'Employee salary and deductions summary', icon: Users },
  { title: 'Financial Report', description: 'Revenue, expenses, and profit analysis', icon: PhilippinePeso },
];

const AdminReports = () => {
  const { addReport } = useStore();
  const { user } = useAuth();

  const handleGenerate = (title: string) => {
    addReport({
      id: `REP-${Date.now()}`,
      title,
      generatedAt: new Date().toLocaleString(),
      generatedBy: user?.name || 'Admin',
    });
    toast.success(`${title} generated and sent to Owner Dashboard safely in the background.`);
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-violet-200 text-sm">Generate reports and send to Owner Dashboard for review</p>
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
                <Button variant="outline" size="sm" onClick={() => handleGenerate(r.title)}>
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

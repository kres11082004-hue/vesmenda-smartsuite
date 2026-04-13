import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { useRef } from 'react';

interface PayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    name: string;
    position: string;
    salary: number;
    phone?: string;
  };
  date: string;
  referenceId: string;
}

const PayslipDialog = ({ open, onOpenChange, employee, date, referenceId }: PayslipDialogProps) => {
  const payslipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = payslipRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Employee Payslip - ${employee.name}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 13px; padding: 40px; margin: 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 15px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .branding { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .header-info { margin-bottom: 20px; }
            .total-row { font-size: 16px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { margin-top: 40px; font-style: italic; font-size: 11px; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="center header-info">
             <div class="branding">VESMENDA SMARTSUITE</div>
             <p>Poblacion Pitogo Zamboanga Del Sur</p>
             <p class="bold">OFFICIAL PAYSLIP</p>
          </div>
          <div class="line"></div>
          <div class="row"><span>Date:</span> <span>${date}</span></div>
          <div class="row"><span>Reference:</span> <span>${referenceId}</span></div>
          <div class="line"></div>
          <div class="row"><span class="bold">EMPLOYEE DETAILS</span></div>
          <div class="row"><span>Name:</span> <span>${employee.name}</span></div>
          <div class="row"><span>Position:</span> <span>${employee.position}</span></div>
          <div class="row"><span>Contact:</span> <span>${employee.phone || 'N/A'}</span></div>
          <div class="line"></div>
          <div class="row bold"><span>EARNINGS</span> <span>AMOUNT</span></div>
          <div class="row"><span>Basic Salary</span> <span>₱${employee.salary.toLocaleString()}</span></div>
          <div class="line"></div>
          <div class="row total-row">
            <span>NET PAY</span>
            <span>₱${employee.salary.toLocaleString()}</span>
          </div>
          <div class="footer center">
            <p>This is a computer-generated payslip.</p>
            <p>Signature of Employee: _________________________</p>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            Employee Payslip
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div ref={payslipRef} className="font-mono text-sm space-y-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-inner">
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-gray-900">VESMENDA SMARTSUITE</p>
              <p className="text-xs text-gray-400">Poblacion Pitogo Zamboanga Del Sur</p>
              <div className="py-1 px-3 bg-primary/10 text-primary rounded-full inline-block text-[10px] font-bold mt-2 uppercase tracking-wider">
                OFFICIAL PAYSLIP
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">REF ID:</span>
                <span className="font-mono font-medium">{referenceId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">DATE:</span>
                <span className="font-medium">{date}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 my-4" />

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Information</p>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-bold text-gray-900">{employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium text-gray-700">{employee.position}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            <div className="space-y-2">
              <div className="flex justify-between font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Basic Monthly Salary</span>
                <span className="font-bold text-gray-900">₱{employee.salary.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-900 flex justify-between items-center">
              <span className="font-extrabold text-gray-900">NET PAYOUT</span>
              <span className="text-xl font-extrabold text-primary">₱{employee.salary.toLocaleString()}</span>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 text-center text-[10px] text-gray-400 italic">
              Thank you for your hard work and dedication.
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 font-bold" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print Payslip
            </Button>
            <Button variant="outline" className="h-12 border-gray-200 rounded-xl" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayslipDialog;

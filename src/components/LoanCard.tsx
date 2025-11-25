import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface LoanCardProps {
  loan: {
    amount: number;
    fee: number;
    totalRepayment: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const LoanCard = ({ loan, isSelected, onSelect }: LoanCardProps) => {
  return (
    <Card
      onClick={onSelect}
      className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 relative ${
        isSelected
          ? 'border-2 border-primary shadow-elevated'
          : 'border border-border'
      }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
      )}
      
      <div className="text-center">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
          <p className="text-3xl font-bold text-foreground">
            KSh {loan.amount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee:</span>
            <span className="font-semibold text-foreground">
              KSh {loan.fee.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-foreground">Total Repayment:</span>
            <span className="text-primary">
              KSh {loan.totalRepayment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LoanCard;

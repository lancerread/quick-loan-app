import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLoanContext } from '@/context/LoanContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoanCard from '@/components/LoanCard';
import ConfirmModal from '@/components/ConfirmModal';
import FailedModal from '@/components/FailedModal';
import { ArrowLeft } from 'lucide-react';

const loanOptions = [
  { amount: 5500, fee: 50, totalRepayment: 5550 },
  { amount: 6800, fee: 80, totalRepayment: 6880 },
  { amount: 7800, fee: 120, totalRepayment: 7920 },
  { amount: 9800, fee: 140, totalRepayment: 9940 },
  { amount: 11200, fee: 180, totalRepayment: 11380 },
  { amount: 16800, fee: 200, totalRepayment: 17000 },
  { amount: 21200, fee: 220, totalRepayment: 21420 },
  { amount: 25600, fee: 350, totalRepayment: 25950 },
  { amount: 30000, fee: 420, totalRepayment: 30420 },
  { amount: 35400, fee: 540, totalRepayment: 35940 },
  { amount: 39800, fee: 680, totalRepayment: 40480 },
  { amount: 44200, fee: 960, totalRepayment: 45160 },
  { amount: 48600, fee: 1550, totalRepayment: 50150 },
  { amount: 60600, fee: 2000, totalRepayment: 62600 },
];

const ApplyPage = () => {
  const [, setLocation] = useLocation();
  const { formData, selectedLoan, setSelectedLoan, setModalState } = useLoanContext();

  useEffect(() => {
    if (!formData.name) {
      setLocation('/eligibility');
    }
  }, [formData, setLocation]);

  const handleLoanSelect = (loan: typeof loanOptions[0]) => {
    setSelectedLoan(loan);
  };

  const handleGetLoan = () => {
    if (selectedLoan) {
      setModalState('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation('/eligibility')}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-4 sm:p-6 shadow-elevated mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1" data-testid="text-welcome">
            Hi {formData.name}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Select your loan amount
          </p>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {loanOptions.map((loan, index) => (
            <LoanCard
              key={index}
              loan={loan}
              isSelected={
                selectedLoan?.amount === loan.amount &&
                selectedLoan?.fee === loan.fee
              }
              onSelect={() => handleLoanSelect(loan)}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGetLoan}
            disabled={!selectedLoan}
            className="w-full sm:w-auto px-12"
            data-testid="button-get-loan"
          >
            Get Loan Now
          </Button>
        </div>
      </div>

      <ConfirmModal />
      <FailedModal />
    </div>
  );
};

export default ApplyPage;

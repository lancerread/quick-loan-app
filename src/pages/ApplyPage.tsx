import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanContext } from '@/context/LoanContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoanCard from '@/components/LoanCard';
import ConfirmModal from '@/components/ConfirmModal';
import FailedModal from '@/components/FailedModal';
import { ArrowLeft } from 'lucide-react';

const loanOptions = [
  { amount: 500, fee: 50, totalRepayment: 550 },
  { amount: 1000, fee: 100, totalRepayment: 1100 },
  { amount: 2000, fee: 180, totalRepayment: 2180 },
  { amount: 3000, fee: 250, totalRepayment: 3250 },
  { amount: 5000, fee: 400, totalRepayment: 5400 },
  { amount: 10000, fee: 750, totalRepayment: 10750 },
];

const ApplyPage = () => {
  const navigate = useNavigate();
  const { formData, selectedLoan, setSelectedLoan, modalState, setModalState } = useLoanContext();

  useEffect(() => {
    if (!formData.name) {
      navigate('/eligibility');
    }
  }, [formData, navigate]);

  const handleLoanSelect = (loan: typeof loanOptions[0]) => {
    setSelectedLoan(loan);
  };

  const handleGetLoan = () => {
    if (selectedLoan) {
      setModalState('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/eligibility')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-6 sm:p-8 shadow-elevated mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Hi {formData.name}!
          </h1>
          <p className="text-muted-foreground">
            Select your desired loan amount below
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

import { useLoanContext } from '../context/LoanContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ConfirmModal = () => {
  const { selectedLoan, modalState, setModalState } = useLoanContext();

  if (!selectedLoan) return null;

  return (
    <Dialog open={modalState === 'confirm'} onOpenChange={() => setModalState('none')}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Your Loan</DialogTitle>
          <DialogDescription>
            Please review your loan details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
            <span className="text-muted-foreground">Loan Amount:</span>
            <span className="text-xl font-bold text-foreground">
              KSh {selectedLoan.amount.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
            <span className="text-muted-foreground">Processing Fee:</span>
            <span className="text-lg font-semibold text-foreground">
              KSh {selectedLoan.fee.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
            <span className="font-semibold text-foreground">Total Repayment:</span>
            <span className="text-2xl font-bold text-primary">
              KSh {selectedLoan.totalRepayment.toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setModalState('none')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => setModalState('failed')}
            className="flex-1"
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;

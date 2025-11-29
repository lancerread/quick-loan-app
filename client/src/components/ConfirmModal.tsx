import { useLoanContext } from '../context/LoanContext';
import { usePaymentHandler } from './PaymentHandler';
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
  const { selectedLoan, modalState, setModalState, formData, paymentData } = useLoanContext();
  const { initiatePayment, isProcessing } = usePaymentHandler();

  if (!selectedLoan) return null;

  const handleProceed = async () => {
    await initiatePayment(formData.phone);
  };

  return (
    <>
      {/* Confirm Modal */}
      <Dialog open={modalState === 'confirm'} onOpenChange={() => setModalState('none')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Your Loan</DialogTitle>
            <DialogDescription>
              Please review your loan details and enter your M-Pesa number
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="text-xl font-bold text-foreground" data-testid="text-loan-amount">
                KSh {selectedLoan.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <span className="text-muted-foreground">Processing Fee (to charge):</span>
              <span className="text-lg font-semibold text-destructive" data-testid="text-fee">
                KSh {selectedLoan.fee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <span className="font-semibold text-foreground">Total Repayment:</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-total">
                KSh {selectedLoan.totalRepayment.toLocaleString()}
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                An M-Pesa STK prompt will charge KSh {selectedLoan.fee.toLocaleString()} as the processing fee. You'll then receive KSh {selectedLoan.amount.toLocaleString()} as your loan.
              </p>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Payment will be sent to:</p>
              <p className="text-lg font-semibold text-foreground" data-testid="text-phone-confirm">
                {formData.phone}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setModalState('none')}
              className="flex-1"
              disabled={isProcessing}
              data-testid="button-cancel-confirm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1"
              disabled={isProcessing}
              data-testid="button-proceed-payment"
            >
              {isProcessing ? 'Processing...' : 'Proceed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Processing Modal */}
      <Dialog open={modalState === 'processing'}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Processing Fee Charge</DialogTitle>
            <DialogDescription>
              Check your phone for an M-Pesa prompt
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-center text-muted-foreground" data-testid="text-check-phone">
              We've sent an M-Pesa STK prompt to {paymentData.phone}
            </p>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Enter your M-Pesa PIN to charge the processing fee
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={modalState === 'success'} onOpenChange={() => setModalState('none')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600">Processing Fee Charged!</DialogTitle>
            <DialogDescription>
              Your loan has been approved
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center p-8 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-5xl text-green-600">✓</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-destructive/10 rounded border border-destructive/30">
                <span className="text-muted-foreground">Processing Fee Charged:</span>
                <span className="font-semibold text-destructive" data-testid="text-fee-charged">
                  KSh {selectedLoan.fee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                <span className="text-muted-foreground">Loan Approved:</span>
                <span className="font-semibold text-green-600" data-testid="text-success-amount">
                  KSh {selectedLoan.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono text-sm" data-testid="text-reference">
                  {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Processing fee of KSh {selectedLoan.fee.toLocaleString()} has been charged to your M-Pesa account. Your loan of KSh {selectedLoan.amount.toLocaleString()} will be disbursed shortly. You'll repay KSh {selectedLoan.totalRepayment.toLocaleString()} over time.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setModalState('none')}
              className="w-full"
              data-testid="button-done"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmModal;

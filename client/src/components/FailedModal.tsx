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

const FailedModal = () => {
  const { modalState, setModalState, paymentData } = useLoanContext();

  return (
    <Dialog open={modalState === 'failed'} onOpenChange={() => setModalState('none')}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-destructive">Payment Failed</DialogTitle>
          <DialogDescription>
            Unfortunately, your payment could not be processed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center p-8 bg-destructive/10 rounded-lg">
            <div className="text-5xl text-destructive">✕</div>
          </div>

          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Phone Number:</strong> {paymentData.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Reason:</strong> Payment declined or timeout
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Please check that you entered the correct M-Pesa PIN or try again with a different payment method.
          </p>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setModalState('none')}
            className="flex-1"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            onClick={() => setModalState('confirm')}
            className="flex-1"
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FailedModal;

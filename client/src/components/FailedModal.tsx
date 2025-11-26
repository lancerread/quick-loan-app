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
import { XCircle } from 'lucide-react';

const FailedModal = () => {
  const { modalState, setModalState } = useLoanContext();

  return (
    <Dialog open={modalState === 'failed'} onOpenChange={() => setModalState('none')}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Payment Failed</DialogTitle>
          <DialogDescription className="text-center text-base">
            Payment failed or was cancelled. Please ensure your phone number is correct and try again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => setModalState('none')}
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FailedModal;

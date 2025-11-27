import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ConfirmModal = () => {
  const { selectedLoan, modalState, setModalState, formData, paymentData, setPaymentData } = useLoanContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedLoan) return null;

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+254|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleProceed = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid M-Pesa phone number (e.g., 0712345678)');
      return;
    }

    setPhoneError('');
    setIsProcessing(true);

    // Simulate PayHero STK push and payment processing
    try {
      // Show "Check your phone" message
      setModalState('processing');

      // Simulate API call to PayHero (delay for demo)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo: randomly succeed or fail (90% success rate)
      const isSuccessful = Math.random() < 0.9;

      if (isSuccessful) {
        setPaymentData({
          phone: phoneNumber,
          status: 'completed',
        });
        setModalState('success');
      } else {
        setPaymentData({
          phone: phoneNumber,
          status: 'failed',
        });
        setModalState('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentData({
        phone: phoneNumber,
        status: 'failed',
      });
      setModalState('failed');
    } finally {
      setIsProcessing(false);
    }
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

            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
              <span className="text-muted-foreground">Processing Fee:</span>
              <span className="text-lg font-semibold text-foreground" data-testid="text-fee">
                KSh {selectedLoan.fee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <span className="font-semibold text-foreground">Total Repayment:</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-total">
                KSh {selectedLoan.totalRepayment.toLocaleString()}
              </span>
            </div>

            <div className="pt-4">
              <Label htmlFor="mpesamobile">M-Pesa Phone Number</Label>
              <Input
                id="mpesamobile"
                type="tel"
                placeholder="0712345678 or +254712345678"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                disabled={isProcessing}
                className={phoneError ? 'border-destructive' : ''}
                data-testid="input-phone-confirm"
              />
              {phoneError && (
                <p className="text-sm text-destructive mt-1" data-testid="error-phone-confirm">
                  {phoneError}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                You'll receive an M-Pesa STK prompt on this number
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalState('none');
                setPhoneNumber('');
                setPhoneError('');
              }}
              className="flex-1"
              disabled={isProcessing}
              data-testid="button-cancel-confirm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1"
              disabled={isProcessing || !phoneNumber.trim()}
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
            <DialogTitle className="text-2xl">Processing Payment</DialogTitle>
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
              Enter your M-Pesa PIN to complete the payment
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={modalState === 'success'} onOpenChange={() => setModalState('none')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600">Payment Successful!</DialogTitle>
            <DialogDescription>
              Your loan has been approved and processed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center p-8 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-5xl text-green-600">✓</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span className="text-muted-foreground">Amount Received:</span>
                <span className="font-semibold" data-testid="text-success-amount">
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

            <p className="text-sm text-muted-foreground text-center pt-4">
              The funds have been transferred to your M-Pesa account. You can now proceed with your needs.
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setModalState('none');
                setPhoneNumber('');
              }}
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

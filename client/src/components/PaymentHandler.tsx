import { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentState {
  externalReference: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  status: 'pending' | 'completed' | 'failed';
}

export const usePaymentHandler = () => {
  const { selectedLoan, setModalState, setPaymentData } = useLoanContext();
  const { toast } = useToast();
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  const initiatePayment = async (phoneNumber: string) => {
    if (!selectedLoan) return;

    // Rate limiting: prevent rapid consecutive attempts
    const now = Date.now();
    if (now - lastAttemptTime < 5000) {
      setPaymentData({
        phone: phoneNumber,
        status: 'failed',
      });
      setModalState('failed');
      return;
    }
    setLastAttemptTime(now);

    setIsProcessing(true);
    setModalState('processing');

    try {
      const response = await fetch('/.netlify/functions/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          amount: selectedLoan.fee,
          description: `M-Pesa Loan Processing Fee - KSh ${selectedLoan.fee}`,
        }),
      });

      const data = await response.json();

      console.log('📱 [CLIENT] Payment initiation response:', {
        ok: response.ok,
        status: response.status,
        data: data,
      });

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.details?.message || 'Payment initiation failed';
        console.error('❌ [CLIENT] Payment initiation error:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ [CLIENT] Payment initiated, starting status polling...');

      setPaymentState({
        externalReference: data.externalReference,
        checkoutRequestId: data.checkoutRequestId,
        merchantRequestId: data.merchantRequestId,
        status: 'pending',
      });

      setPaymentData({
        phone: phoneNumber,
        status: 'pending',
      });

      // Poll for payment status every 5 seconds for ~50 seconds
      pollPaymentStatus(
        data.externalReference,
        data.checkoutRequestId,
        data.merchantRequestId,
        phoneNumber
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [CLIENT] Payment initiation failed:', {
        message: errorMessage,
        error: error,
      });
      setPaymentData({
        phone: phoneNumber,
        status: 'failed',
        errorMessage: errorMessage,
      });
      setModalState('failed');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (
    externalReference: string,
    checkoutRequestId: string,
    merchantRequestId: string,
    phoneNumber: string
  ) => {
    let pollCount = 0;
    const maxPolls = 10; // ~50 seconds with 5 second intervals

    const poll = async () => {
      try {
        const response = await fetch('/.netlify/functions/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: externalReference,
          }),
        });

        const data = await response.json();

        console.log(`📊 [CLIENT] Status poll #${pollCount}:`, {
          status: data.status,
          isFinal: data.isFinal,
          data: data,
        });

        if (!response.ok) {
          const errorMessage = data.error || data.details?.message || 'Failed to check payment status';
          console.error('❌ [CLIENT] Status check error:', errorMessage);
          throw new Error(errorMessage);
        }

        // Check if we have a final status
        if (data.isFinal) {
          if (data.success) {
            setPaymentState(prev =>
              prev ? { ...prev, status: 'completed' } : null
            );
            setPaymentData({
              phone: phoneNumber,
              status: 'completed',
            });
            setModalState('success');
              // Show toast informing user about processing time and disbursement message
              toast({
                title: 'Payment received',
                description:
                  'Your payment was received. Loan processing can take up to 48 hours — you will receive a message with disbursement details.',
                duration: 10000,
              });
          } else {
            setPaymentState(prev =>
              prev ? { ...prev, status: 'failed' } : null
            );
            setPaymentData({
              phone: phoneNumber,
              status: 'failed',
            });
            setModalState('failed');
          }
          setIsProcessing(false);
          return;
        }

        // Still pending, continue polling
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 5000);
        } else {
          // Timeout - treat as pending, allow manual check via webhook
          setPaymentData({
            phone: phoneNumber,
            status: 'pending',
          });
          setModalState('processing');
          setIsProcessing(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ [CLIENT] Status check error on poll #${pollCount}:`, {
          message: errorMessage,
          error: error,
        });
        pollCount++;
        if (pollCount < maxPolls) {
          // Retry on error
          setTimeout(poll, 5000);
        } else {
          // Max retries exceeded
          setPaymentState(prev =>
            prev ? { ...prev, status: 'failed' } : null
          );
          setPaymentData({
            phone: phoneNumber,
            status: 'failed',
          });
          setModalState('failed');
          setIsProcessing(false);
        }
      }
    };

    poll();
  };

  return {
    initiatePayment,
    isProcessing,
    paymentState,
  };
};

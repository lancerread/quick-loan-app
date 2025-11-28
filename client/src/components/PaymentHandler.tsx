import { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';

interface PaymentState {
  externalReference: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  status: 'pending' | 'completed' | 'failed';
}

export const usePaymentHandler = () => {
  const { selectedLoan, setModalState, setPaymentData } = useLoanContext();
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

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

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

      // Poll for payment status every 5 seconds for 2 minutes
      pollPaymentStatus(
        data.externalReference,
        data.checkoutRequestId,
        data.merchantRequestId,
        phoneNumber
      );
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentData({
        phone: phoneNumber,
        status: 'failed',
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
    const maxPolls = 24; // 2 minutes with 5 second intervals

    const poll = async () => {
      try {
        const response = await fetch('/.netlify/functions/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalReference,
            checkoutRequestId,
            merchantRequestId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check payment status');
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
        console.error('Status check error:', error);
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

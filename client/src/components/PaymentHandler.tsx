import { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';

interface PaymentState {
  merchantRequestId: string;
  checkoutRequestId: string;
  status: 'pending' | 'completed' | 'failed';
}

export const usePaymentHandler = () => {
  const { selectedLoan, setModalState, setPaymentData } = useLoanContext();
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (phoneNumber: string) => {
    if (!selectedLoan) return;

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

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.responseMessage || 'Payment initiation failed');
      }

      setPaymentState({
        merchantRequestId: data.merchantRequestId,
        checkoutRequestId: data.checkoutRequestId,
        status: 'pending',
      });

      setPaymentData({
        phone: phoneNumber,
        status: 'pending',
      });

      // Poll for payment status every 5 seconds for 2 minutes
      pollPaymentStatus(data.merchantRequestId, data.checkoutRequestId, phoneNumber);
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
    merchantRequestId: string,
    checkoutRequestId: string,
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
            merchantRequestId,
            checkoutRequestId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();

        if (data.success) {
          setPaymentState(prev => prev ? { ...prev, status: 'completed' } : null);
          setPaymentData({
            phone: phoneNumber,
            status: 'completed',
          });
          setModalState('success');
          setIsProcessing(false);
          return;
        }

        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 5000);
        } else {
          // Timeout - assume failure
          throw new Error('Payment timeout');
        }
      } catch (error) {
        console.error('Status check error:', error);
        setPaymentState(prev => prev ? { ...prev, status: 'failed' } : null);
        setPaymentData({
          phone: phoneNumber,
          status: 'failed',
        });
        setModalState('failed');
        setIsProcessing(false);
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

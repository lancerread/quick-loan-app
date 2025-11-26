import React, { useState } from 'react';

export default function Payment() {
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    setStatus('creating');

    try {
      const res = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create payment');

      // The response shape depends on Payhero. Common patterns:
      // - data.redirectUrl (redirect user to provider-hosted checkout)
      // - data.paymentId (you may poll or open a modal)
      if (data.redirectUrl) {
        // redirect to provider checkout
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.paymentId) {
        setStatus('created: ' + data.paymentId);
        // Optionally poll verify endpoint until status changes
        // await pollPaymentStatus(data.paymentId);
      } else {
        setStatus('created — check logs');
      }
    } catch (err: any) {
      setStatus('error: ' + (err.message || String(err)));
    }
  }

  return (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-medium">Make a payment</h3>
      <form onSubmit={startPayment} className="space-y-3 mt-3">
        <div>
          <label className="block text-sm">Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm">Phone (MSISDN)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2547XXXXXXXX"
            className="w-full"
          />
        </div>
        <div>
          <button type="submit" className="btn">
            Pay
          </button>
        </div>
      </form>
      {status && <p className="mt-3">Status: {status}</p>}
    </div>
  );
}

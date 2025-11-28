interface PayHeroWebhookPayload {
  external_reference: string;
  checkout_request_id: string;
  merchant_request_id: string;
  status: 'SUCCESS' | 'FAILED' | 'QUEUED';
  mpesa_receipt_number?: string;
  amount: number;
  phone_number: string;
  timestamp: string;
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload: PayHeroWebhookPayload = await req.json();

    console.log('PayHero webhook received:', {
      externalReference: payload.external_reference,
      status: payload.status,
      mpesaReceipt: payload.mpesa_receipt_number,
      amount: payload.amount,
    });

    // In production, store this in a database
    // For now, just log and acknowledge receipt
    if (payload.status === 'SUCCESS') {
      console.log(`Payment successful: ${payload.external_reference}`);
      // Send notification to user (email, SMS, etc.)
    } else if (payload.status === 'FAILED') {
      console.log(`Payment failed: ${payload.external_reference}`);
      // Notify user of failure
    }

    // Always return 200 to confirm webhook was received
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent PayHero retrying
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

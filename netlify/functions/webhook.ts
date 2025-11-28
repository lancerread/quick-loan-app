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

    console.log('🔔 [WEBHOOK] PayHero webhook received:', {
      externalReference: payload.external_reference,
      status: payload.status,
      mpesaReceipt: payload.mpesa_receipt_number,
      amount: payload.amount,
      timestamp: payload.timestamp,
    });

    // In production, store this in a database
    // For now, just log and acknowledge receipt
    if (payload.status === 'SUCCESS') {
      console.log(`✅ [WEBHOOK] Payment successful for reference: ${payload.external_reference}`);
      console.log(`📄 [WEBHOOK] M-Pesa Receipt: ${payload.mpesa_receipt_number}`);
      // Send notification to user (email, SMS, etc.)
    } else if (payload.status === 'FAILED') {
      console.log(`❌ [WEBHOOK] Payment failed for reference: ${payload.external_reference}`);
      // Notify user of failure
    } else if (payload.status === 'QUEUED') {
      console.log(`⏳ [WEBHOOK] Payment pending for reference: ${payload.external_reference}`);
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
    console.error('❌ [WEBHOOK] Webhook processing error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Still return 200 to prevent PayHero retrying
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed with error' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

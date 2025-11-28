const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2';

interface PaymentRequest {
  phoneNumber: string;
  amount: number;
  description: string;
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: PaymentRequest = await req.json();
    const { phoneNumber, amount, description } = body;

    if (!phoneNumber || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate phone format (07... or 01...)
    if (!/^0[71]\d{8}$/.test(phoneNumber.replace(/\s/g, ''))) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number. Please use format 0712345678 or 0112345678' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const apiUsername = process.env.PAYHERO_API_USERNAME;
    const apiPassword = process.env.PAYHERO_API_PASSWORD;
    const channelId = process.env.PAYHERO_CHANNEL_ID;

    if (!apiUsername || !apiPassword || !channelId) {
      return new Response(
        JSON.stringify({ error: 'PayHero credentials not configured' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔐 [PAYMENT] Credentials check:', {
      hasUsername: !!apiUsername,
      hasPassword: !!apiPassword,
      hasChannelId: !!channelId,
      channelId: channelId,
    });

    const credentials = `${apiUsername}:${apiPassword}`;
    const basicAuth = Buffer.from(credentials).toString('base64');

    const externalReference = `REF-${Date.now()}`;

    const payload = {
      amount: amount,
      phone_number: phoneNumber,
      channel_id: channelId,
      provider: 'm-pesa',
      external_reference: externalReference,
      callback_url: `${process.env.URL || 'http://localhost:5000'}/.netlify/functions/webhook`,
      narration: description || 'M-Pesa Loan Processing Fee',
    };

    console.log('📤 [PAYMENT] Sending request to PayHero:', {
      url: `${PAYHERO_BASE_URL}/payments`,
      payload: {
        amount: payload.amount,
        phone_number: payload.phone_number,
        channel_id: payload.channel_id,
        provider: payload.provider,
        external_reference: payload.external_reference,
        narration: payload.narration,
      },
    });

    const response = await fetch(`${PAYHERO_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 [PAYMENT] Response received from PayHero:', {
      status: response.status,
      statusText: response.statusText,
    });

    const data = await response.json();

    console.log('📋 [PAYMENT] PayHero response body:', JSON.stringify(data, null, 2));

    if (!response.ok || response.status !== 201) {
      console.error('❌ [PAYMENT] PayHero error response:', {
        statusCode: response.status,
        statusText: response.statusText,
        errorData: data,
        message: data.message || data.error || 'Unknown error',
      });
      return new Response(
        JSON.stringify({ 
          error: data.message || data.error || 'Payment could not be initiated. Please check your phone number and try again.',
          details: data,
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ [PAYMENT] Payment initiated successfully:', {
      externalReference: externalReference,
      checkoutRequestId: data.checkout_request_id,
      merchantRequestId: data.merchant_request_id,
    });

    // Store transaction reference in a simple way (in production, use a database)
    // For now, we'll rely on webhook callbacks
    return new Response(
      JSON.stringify({
        success: true,
        checkoutRequestId: data.checkout_request_id,
        merchantRequestId: data.merchant_request_id,
        externalReference: externalReference,
        status: data.status,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ [PAYMENT] Unexpected error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Payment initiation failed. Please try again.',
        details: String(error),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

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

    const response = await fetch(`${PAYHERO_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || response.status !== 201) {
      console.error('PayHero error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Payment could not be initiated. Please check your phone number and try again.' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Payment initiation failed. Please try again.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

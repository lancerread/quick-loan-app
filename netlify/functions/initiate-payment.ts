import { Handler } from '@netlify/functions';

const PAYHERO_BASE_URL = 'https://sandbox.payhero.co/api/v2';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { phoneNumber, amount, description } = body;

    if (!phoneNumber || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const apiUsername = process.env.PAYHERO_API_USERNAME;
    const apiPassword = process.env.PAYHERO_API_PASSWORD;
    const accountId = process.env.PAYHERO_ACCOUNT_ID;

    if (!apiUsername || !apiPassword || !accountId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'PayHero credentials not configured' }),
      };
    }

    const credentials = `${apiUsername}:${apiPassword}`;
    const basicAuth = Buffer.from(credentials).toString('base64');

    const payload = {
      phone: phoneNumber,
      amount: amount,
      account_id: accountId,
      merchant_reference: `REF-${Date.now()}`,
      narration: description || 'M-Pesa Loan Processing Fee',
      callback_url: `${process.env.URL || 'http://localhost:5000'}/.netlify/functions/webhook`,
    };

    const response = await fetch(`${PAYHERO_BASE_URL}/mpesa_request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayHero error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `PayHero API error: ${response.status}`,
          details: errorText 
        }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        merchantRequestId: data.merchant_request_id,
        checkoutRequestId: data.checkout_request_id,
        responseCode: data.response_code,
        responseMessage: data.response_message,
      }),
    };
  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Payment initiation failed' 
      }),
    };
  }
};

export { handler };

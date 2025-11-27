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
    const { merchantRequestId, checkoutRequestId } = body;

    if (!merchantRequestId || !checkoutRequestId) {
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
      merchant_request_id: merchantRequestId,
      checkout_request_id: checkoutRequestId,
      account_id: accountId,
    };

    const response = await fetch(`${PAYHERO_BASE_URL}/mpesa_request_status`, {
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
          error: `PayHero API error: ${response.status}` 
        }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: data.status === 'success' || data.response_code === '0',
        status: data.status,
        responseCode: data.response_code,
        responseMessage: data.response_message,
        amount: data.amount,
        mpesaReceiptNumber: data.mpesa_receipt_number,
      }),
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Status check failed' 
      }),
    };
  }
};

export { handler };

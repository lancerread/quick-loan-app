const fetch = require('node-fetch');

// Initiate MPESA STK Push via Payhero
exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || '{}');
    const { amount, phone, customer_name, external_reference } = body;

    const PAYHERO_URL = process.env.PAYHERO_API_URL || 'https://backend.payhero.co.ke/api/v2/payments';
    const AUTH = process.env.PAYHERO_BASIC_AUTH; // Set this to the full Basic auth token (e.g. "Basic base64(...)")
    const CHANNEL_ID = process.env.PAYHERO_CHANNEL_ID; // numeric
    const CALLBACK_URL = process.env.PAYHERO_CALLBACK_URL; // your webhook endpoint
    const NETWORK_CODE = process.env.PAYHERO_NETWORK_CODE || '63902';

    if (!AUTH) return { statusCode: 500, body: JSON.stringify({ error: 'Missing PAYHERO_BASIC_AUTH env var' }) };
    if (!CHANNEL_ID) return { statusCode: 500, body: JSON.stringify({ error: 'Missing PAYHERO_CHANNEL_ID env var' }) };
    if (!CALLBACK_URL) return { statusCode: 500, body: JSON.stringify({ error: 'Missing PAYHERO_CALLBACK_URL env var' }) };

    if (!amount || !phone) {
      return { statusCode: 400, body: JSON.stringify({ error: 'amount and phone are required' }) };
    }

    const extRef = external_reference || `INV-${Date.now()}-${Math.floor(Math.random() * 9000)}`;

    const payload = {
      amount: Number(amount),
      phone_number: String(phone),
      channel_id: Number(CHANNEL_ID),
      provider: 'm-pesa',
      external_reference: extRef,
      customer_name: customer_name || undefined,
      callback_url: CALLBACK_URL,
      network_code: NETWORK_CODE,
    };

    const resp = await fetch(PAYHERO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH,
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));

    // Return Payhero response to frontend for handling (e.g., display status or poll)
    return {
      statusCode: resp.status || 200,
      body: JSON.stringify({ status: data.status || 'UNKNOWN', success: data.success || false, reference: data.reference, CheckoutRequestID: data.CheckoutRequestID, raw: data }),
    };
  } catch (err) {
    console.error('create-payment error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};

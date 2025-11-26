const fetch = require('node-fetch');

// Verify/check payment status by reference (GET /api/v2/payments/{reference})
exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const reference = params.reference || params.paymentId;

    if (!reference) {
      return { statusCode: 400, body: JSON.stringify({ error: 'reference (or paymentId) query param required' }) };
    }

    const AUTH = process.env.PAYHERO_BASIC_AUTH;
    const BASE = process.env.PAYHERO_API_URL_BASE || 'https://backend.payhero.co.ke/api/v2';
    const url = `${BASE}/payments/${encodeURIComponent(reference)}`;

    if (!AUTH) return { statusCode: 500, body: JSON.stringify({ error: 'Missing PAYHERO_BASIC_AUTH env var' }) };

    const resp = await fetch(url, { headers: { Authorization: AUTH } });
    const data = await resp.json().catch(() => ({}));
    return { statusCode: resp.status || 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error('verify-payment error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};

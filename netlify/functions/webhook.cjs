const crypto = require('crypto');

// Payhero will POST payment status updates to the callback_url you provided when creating payments.
// This handler logs the payload and returns 200. Optionally configure a webhook secret and verify.
exports.handler = async function (event) {
  try {
    const rawBody = event.body || '';
    let payload = {};

    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.warn('webhook: received non-json body');
    }

    // If Payhero provides a signature header, configure PAYHERO_WEBHOOK_SECRET and the header name
    // Example header names might be 'x-payhero-signature' (check docs). If you set PAYHERO_WEBHOOK_SECRET
    // we'll attempt a simple HMAC-SHA256 check. Adjust per Payhero docs if they use a different scheme.
    const signatureHeader = event.headers['x-payhero-signature'] || event.headers['X-Payhero-Signature'];
    const webhookSecret = process.env.PAYHERO_WEBHOOK_SECRET;

    if (signatureHeader && webhookSecret) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (expected !== signatureHeader) {
        console.warn('Webhook signature mismatch', { expected, signatureHeader });
        return { statusCode: 401, body: 'invalid signature' };
      }
    }

    // TODO: Replace the following with your application logic: update DB, notify user, etc.
    // Typical payload fields will include status, reference, CheckoutRequestID, amount.
    console.log('Payhero webhook payload:', payload);

    // Acknowledge quickly
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('webhook handler error', err);
    return { statusCode: 500, body: String(err) };
  }
};

import express from 'express';
import type { Request, Response } from 'express';

const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2';

const app = express();
app.use(express.json());

// Initiate payment endpoint
app.post('/.netlify/functions/initiate-payment', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, description } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone format
    if (!/^0[71]\d{8}$/.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        error: 'Invalid phone number. Please use format 0712345678 or 0112345678',
      });
    }

    const apiUsername = process.env.PAYHERO_API_USERNAME;
    const apiPassword = process.env.PAYHERO_API_PASSWORD;
    const channelId = process.env.PAYHERO_CHANNEL_ID;

    if (!apiUsername || !apiPassword || !channelId) {
      console.error('Missing PayHero credentials:', {
        username: !!apiUsername,
        password: !!apiPassword,
        channelId: !!channelId,
      });
      return res.status(500).json({ error: 'PayHero credentials not configured' });
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
      callback_url: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/.netlify/functions/webhook`,
      narration: description || 'M-Pesa Loan Processing Fee',
    };

    console.log('Calling PayHero with:', {
      url: `${PAYHERO_BASE_URL}/payments`,
      payload: payload,
    });

    const response = await fetch(`${PAYHERO_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('PayHero response:', {
      status: response.status,
      data: data,
    });

    if (!response.ok || response.status !== 201) {
      console.error('PayHero error:', data);
      return res.status(400).json({
        error: 'Payment could not be initiated. Please check your phone number and try again.',
        details: data,
      });
    }

    return res.json({
      success: true,
      checkoutRequestId: data.checkout_request_id,
      merchantRequestId: data.merchant_request_id,
      externalReference: externalReference,
      status: data.status,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({
      error: 'Payment initiation failed. Please try again.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Check status endpoint
app.post('/.netlify/functions/check-status', async (req: Request, res: Response) => {
  try {
    // Accept either `externalReference` (preferred) or `reference` (older clients)
    const externalReference = req.body.externalReference || req.body.reference;

    if (!externalReference) {
      return res.status(400).json({ error: 'Missing external reference (externalReference or reference expected)' });
    }

    const apiUsername = process.env.PAYHERO_API_USERNAME;
    const apiPassword = process.env.PAYHERO_API_PASSWORD;

    if (!apiUsername || !apiPassword) {
      return res.status(500).json({ error: 'PayHero credentials not configured' });
    }

    const credentials = `${apiUsername}:${apiPassword}`;
    const basicAuth = Buffer.from(credentials).toString('base64');

    const payload = {
      external_reference: externalReference,
    };

    console.log('Checking payment status:', externalReference);

    const response = await fetch(`${PAYHERO_BASE_URL}/transaction-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('Status check response:', {
      status: response.status,
      data: data,
    });

    if (!response.ok) {
      console.error('PayHero status check error:', data);
      return res.status(400).json({
        error: 'Could not check payment status. Please try again.',
        details: data,
      });
    }

    const isSuccess = data.status === 'SUCCESS';
    const isFailed = data.status === 'FAILED';

    return res.json({
      success: isSuccess,
      status: data.status,
      mpesaReceiptNumber: data.mpesa_receipt_number || null,
      amount: data.amount,
      isFinal: isSuccess || isFailed,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      error: 'Status check failed. Please try again.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Webhook endpoint
app.post('/.netlify/functions/webhook', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Webhook received:', {
      externalReference: payload.external_reference,
      status: payload.status,
      mpesaReceipt: payload.mpesa_receipt_number,
    });

    return res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.json({ success: true, message: 'Webhook processed' });
  }
});

export default app;

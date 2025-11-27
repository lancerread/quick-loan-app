import express from 'express';
import { z } from 'zod';
import { PayHeroService } from './payhero';

const app = express();
const payheroService = new PayHeroService();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initiate M-Pesa STK push
app.post('/api/initiate-payment', async (req, res) => {
  try {
    const body = z.object({
      phoneNumber: z.string(),
      amount: z.number(),
      accountReference: z.string(),
      description: z.string(),
    }).parse(req.body);

    const result = await payheroService.initiateStkPush(
      body.phoneNumber,
      body.amount,
      body.accountReference,
      body.description
    );

    res.json(result);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Payment initiation failed' 
    });
  }
});

// Check payment status
app.post('/api/check-payment-status', async (req, res) => {
  try {
    const body = z.object({
      merchantRequestId: z.string(),
      checkoutRequestId: z.string(),
    }).parse(req.body);

    const result = await payheroService.checkPaymentStatus(
      body.merchantRequestId,
      body.checkoutRequestId
    );

    res.json(result);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Status check failed' 
    });
  }
});

// PayHero webhook callback
app.post('/api/webhooks/payhero', (req, res) => {
  console.log('PayHero callback received:', req.body);
  res.json({ success: true });
});

export default app;

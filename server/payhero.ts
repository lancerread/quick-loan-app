const PAYHERO_BASE_URL = 'https://sandbox.payhero.co/api/v2';

export class PayHeroService {
  private apiUsername: string;
  private apiPassword: string;
  private accountId: string;

  constructor() {
    this.apiUsername = process.env.PAYHERO_API_USERNAME || '';
    this.apiPassword = process.env.PAYHERO_API_PASSWORD || '';
    this.accountId = process.env.PAYHERO_ACCOUNT_ID || '';

    if (!this.apiUsername || !this.apiPassword || !this.accountId) {
      console.warn('Warning: PayHero credentials not fully configured');
    }
  }

  private getBasicAuth(): string {
    const credentials = `${this.apiUsername}:${this.apiPassword}`;
    return Buffer.from(credentials).toString('base64');
  }

  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    description: string
  ) {
    try {
      const payload = {
        phone: phoneNumber,
        amount: amount,
        account_id: this.accountId,
        merchant_reference: `REF-${Date.now()}`,
        narration: description,
        callback_url: process.env.PAYHERO_CALLBACK_URL || 'http://localhost:5000/api/webhooks/payhero',
      };

      const response = await fetch(`${PAYHERO_BASE_URL}/mpesa_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.getBasicAuth()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayHero API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        merchantRequestId: data.merchant_request_id,
        checkoutRequestId: data.checkout_request_id,
        responseCode: data.response_code,
        responseMessage: data.response_message,
      };
    } catch (error) {
      console.error('STK Push Error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(
    merchantRequestId: string,
    checkoutRequestId: string
  ) {
    try {
      const payload = {
        merchant_request_id: merchantRequestId,
        checkout_request_id: checkoutRequestId,
        account_id: this.accountId,
      };

      const response = await fetch(`${PAYHERO_BASE_URL}/mpesa_request_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.getBasicAuth()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayHero API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return {
        success: data.status === 'success' || data.response_code === '0',
        status: data.status,
        responseCode: data.response_code,
        responseMessage: data.response_message,
        amount: data.amount,
        mpesaReceiptNumber: data.mpesa_receipt_number,
      };
    } catch (error) {
      console.error('Status Check Error:', error);
      throw error;
    }
  }
}

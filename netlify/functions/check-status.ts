const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2';

interface StatusCheckRequest {
  checkoutRequestId: string;
  merchantRequestId: string;
  externalReference: string;
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: StatusCheckRequest = await req.json();
    const { externalReference } = body;

    if (!externalReference) {
      return new Response(
        JSON.stringify({ error: 'Missing external reference' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const apiUsername = process.env.PAYHERO_API_USERNAME;
    const apiPassword = process.env.PAYHERO_API_PASSWORD;

    if (!apiUsername || !apiPassword) {
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

    const payload = {
      external_reference: externalReference,
    };

    const response = await fetch(`${PAYHERO_BASE_URL}/transaction-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayHero status check error:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Could not check payment status. Please try again.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // PayHero returns status: "SUCCESS", "QUEUED", or "FAILED"
    const isSuccess = data.status === 'SUCCESS';
    const isFailed = data.status === 'FAILED';

    return new Response(
      JSON.stringify({
        success: isSuccess,
        status: data.status,
        mpesaReceiptNumber: data.mpesa_receipt_number || null,
        amount: data.amount,
        isFinal: isSuccess || isFailed, // Indicates if polling should stop
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Status check failed. Please try again.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

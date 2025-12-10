const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    // Accept either `reference` (old client) or `externalReference` (server naming)
    const reference = body.externalReference || body.reference;

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction reference (externalReference or reference expected)' }), 
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

    const statusUrl = `${PAYHERO_BASE_URL}/transaction-status?reference=${encodeURIComponent(reference)}`;

    console.log('🔍 [STATUS] Checking payment status:', {
      reference: reference,
      url: statusUrl,
    });

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      },
    });

    console.log('📥 [STATUS] Response received:', {
      status: response.status,
      statusText: response.statusText,
    });

    const data = await response.json();

    console.log('📋 [STATUS] PayHero status response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ [STATUS] PayHero error:', {
        statusCode: response.status,
        errorData: data,
      });
      return new Response(
        JSON.stringify({ 
          error: 'Could not check payment status. Please try again.',
          details: data,
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

    console.log(`📊 [STATUS] Payment status: ${data.status}`, {
      isSuccess,
      isFailed,
      mpesaReceipt: data.mpesa_receipt_number,
    });

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
    console.error('❌ [STATUS] Unexpected error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Status check failed. Please try again.',
        details: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

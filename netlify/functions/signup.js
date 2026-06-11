exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const email = String(body.email || '').trim().toLowerCase();

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email required' }),
    };
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    console.error('[Pragma] KIT_API_KEY or KIT_FORM_ID not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Kit configuration missing' }),
    };
  }

  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          api_key: apiKey,
          email,
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[Pragma] Kit API error ${response.status}:`, responseText);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          kitError: true,
          status: response.status,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (error) {
    console.error('[Pragma] Kit fetch failed:', error.message);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
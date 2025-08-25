const CLIENT_ID: string | undefined = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const CONTENT_TOKEN: string | undefined = process.env.TINA_TOKEN;
const BASE_API_URL = 'https://content.tinajs.io';
const BRANCH = 'main';

if (!CLIENT_ID || !CONTENT_TOKEN) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_TINA_CLIENT_ID or TINA_TOKEN');
}

const headers: Record<string, string> = { 'x-api-key': CONTENT_TOKEN };

async function fetchSchema(): Promise<void> {
  try {
    const response = await fetch(`${BASE_API_URL}/db/${CLIENT_ID}/${BRANCH}/schema`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const schemaText = await response.text();
    console.log('Schema held by TinaCloud is:');
    console.log(schemaText);
  } catch (err) {
    console.error('Failed to retrieve schema from TinaCloud');
    console.error(err);
  }
}

fetchSchema();

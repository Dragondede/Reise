export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS - allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'ReiseRadar API läuft!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY nicht konfiguriert. Bitte in Vercel Settings → Environment Variables eintragen.' });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Kein Prompt angegeben.' });
    }

    // Try with Google Search grounding first
    let result = await callGemini(API_KEY, prompt, true);

    // If quota exceeded, retry without grounding
    if (result.error && (result.rateLimited || result.status === 429)) {
      await new Promise(r => setTimeout(r, 2000));
      result = await callGemini(API_KEY, prompt, false);
    }

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    return res.status(200).json({ text: result.text });

  } catch (error) {
    console.error('ReiseRadar API Error:', error);
    return res.status(500).json({ error: 'Server-Fehler: ' + (error.message || 'Unbekannter Fehler') });
  }
}

async function callGemini(apiKey, prompt, useGrounding) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  };

  if (useGrounding) {
    body.tools = [{ google_search: {} }];
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (fetchError) {
    return { error: 'Verbindung zu Google Gemini fehlgeschlagen: ' + fetchError.message, status: 502 };
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    return { error: 'Ungültige Antwort von Gemini API', status: 502 };
  }

  if (data.error) {
    const msg = data.error.message || 'Gemini API Fehler';
    const isRateLimit = msg.includes('quota') || msg.includes('rate') || msg.includes('limit') || response.status === 429;
    return {
      error: isRateLimit ? 'Zu viele Anfragen. Bitte warte 1 Minute.' : msg,
      status: response.status,
      rateLimited: isRateLimit,
    };
  }

  // Extract text from response
  let text = '';
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    text = data.candidates[0].content.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('\n');
  }

  if (!text) {
    return { error: 'Keine Ergebnisse von Gemini erhalten.', status: 200 };
  }

  return { text };
}

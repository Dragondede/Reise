export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Gemini API Key nicht konfiguriert. Bitte GEMINI_API_KEY in Vercel Environment Variables setzen.' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Kein Prompt angegeben.' });

    // Try with Google Search grounding first
    let text = await callGemini(API_KEY, prompt, true);

    // If quota exceeded, retry without grounding after short wait
    if (text === null) {
      await sleep(2000);
      text = await callGemini(API_KEY, prompt, false);
    }

    if (text === null) {
      return res.status(429).json({ error: 'Zu viele Anfragen. Bitte warte 1 Minute und versuche es erneut.' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler: ' + error.message });
  }
}

async function callGemini(apiKey, prompt, useGrounding) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  };

  // Add Google Search grounding if enabled
  if (useGrounding) {
    body.tools = [{ google_search: {} }];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  // Check for quota/rate limit errors
  if (data.error) {
    const msg = data.error.message || '';
    if (msg.includes('quota') || msg.includes('rate') || msg.includes('limit') || response.status === 429) {
      return null; // Signal to retry without grounding or show wait message
    }
    throw new Error(msg || 'Gemini API Fehler');
  }

  // Extract text
  let text = '';
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    text = data.candidates[0].content.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('\n');
  }

  return text || 'Keine Ergebnisse gefunden.';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

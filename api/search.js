module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).json({ status: 'ok' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Not allowed' });

  var API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY fehlt' });

  try {
    var prompt = req.body && req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'Kein Prompt' });

    var response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
        })
      }
    );

    var data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || 'Gemini Fehler' });

    var text = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      text = data.candidates[0].content.parts
        .filter(function(p) { return p.text; })
        .map(function(p) { return p.text; })
        .join('\n');
    }

    return res.status(200).json({ text: text || 'Keine Ergebnisse.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

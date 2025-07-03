const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const ORS_API_KEY = 'YOUR_ORS_API_KEY'; // <-- Энд өөрийн OpenRouteService API key-г тавина уу
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

app.post('/api/directions', async (req, res) => {
  try {
    const orsRes = await fetch(`${ORS_URL}?api_key=${ORS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await orsRes.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'ORS proxy error', details: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`ORS proxy server running on http://localhost:${PORT}`);
}); 
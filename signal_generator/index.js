const express = require('express');
const cors = require('cors');
const axios = require('axios');
const PineLogic = require('./pine_translator');

const app = express();
const port = 5004;
let FMP_API_KEY = 'UjCJfQmCbeDxXcMQnoWGibtSWq1kbG9a'; // Replace with your actual API key

app.use(cors());
app.use(express.json());

// Function to fetch data and generate a signal for a single asset and timeframe
async function getSignalFor(asset, timeframe) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe}/${asset}?apikey=${FMP_API_KEY}`;
    const response = await axios.get(url);
    
    if (!response.data || response.data.length === 0) {
      // console.log(`No data for ${asset} on ${timeframe}`);
      return null;
    }
    
    const historicalData = response.data;
    const pineLogic = new PineLogic(historicalData);
    const signal = pineLogic.generateSignal();

    if (signal) {
      return {
        ...signal,
        symbol: asset,
        timeframe: timeframe,
      };
    }
    return null;
  } catch (error) {
    // console.error(`Error fetching signal for ${asset} on ${timeframe}:`, error.message);
    return null;
  }
}

// Endpoint to set API key
app.post('/api/set-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey) {
    FMP_API_KEY = apiKey;
    res.status(200).json({ message: 'API Key updated successfully' });
  } else {
    res.status(400).json({ error: 'API Key is required' });
  }
});

// Endpoint for a single signal
app.get('/api/signal', async (req, res) => {
  const { asset, timeframe } = req.query;

  if (!asset || !timeframe) {
    return res.status(400).json({ error: 'Asset and timeframe are required' });
  }

  const signal = await getSignalFor(asset, timeframe);

  if (signal) {
    res.json(signal);
  } else {
    res.status(200).json({ message: 'No signal generated' });
  }
});

app.listen(port, () => {
  console.log(`Signal generator server listening at http://localhost:${port}`);
});

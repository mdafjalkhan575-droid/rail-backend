const https = require('https');

const RAPIDAPI_KEY = 'cd0d0dda39mshb25bc80ee466682p14086ejsna7a109f3ae03';
const RAPIDAPI_HOST = 'irctc1.p.rapidapi.com';

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { trainNo, type } = req.query;

  if (!trainNo) {
    return res.status(400).json({ error: 'trainNo required' });
  }

  // Choose endpoint
  let path = '';
  if (type === 'info') {
    path = `/api/v1/searchTrain?query=${trainNo}`;
  } else {
    path = `/api/v1/liveTrainStatus?trainNo=${trainNo}&startDay=1`;
  }

  const options = {
    hostname: RAPIDAPI_HOST,
    path: path,
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
      'User-Agent': 'RailTracker/1.0'
    }
  };

  return new Promise((resolve) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.status(apiRes.statusCode).json(json);
        } catch(e) {
          res.status(500).json({ error: 'Parse error', raw: data.slice(0, 200) });
        }
        resolve();
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    apiReq.end();
  });
};
      

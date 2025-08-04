const express = require('express');
const cors = require('cors');
const chartAnalysisRoutes = require('./chartAnalysisAPI');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api', chartAnalysisRoutes);

app.listen(port, () => {
  console.log(`Chart analysis server listening at http://localhost:${port}`);
});

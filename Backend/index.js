const express       = require('express');
const cors          = require('cors');
const pathRoutes    = require('./routes/pathRoutes');
const airportRoutes = require('./routes/airportRoutes');
const flightRoutes  = require('./routes/flightRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', pathRoutes);
app.use('/api', airportRoutes);
app.use('/api', flightRoutes);

app.get('/', (req, res) => res.json({ status: 'ok', service: 'SkyRoute API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SkyRoute backend running on port ${PORT}`));

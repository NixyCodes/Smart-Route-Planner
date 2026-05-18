const express = require('express');
const cors = require('cors');

const pathRoutes = require('./routes/pathRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', pathRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();
const router = require('./routes/index');
const logger = require('morgan');

app.use(logger('dev'));
app.use(cors());
app.use('/api', router);


app.get('/', (req, res, next) => {
    res.status(200).json({ message: "Default Route." });
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
})
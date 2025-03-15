const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(
    session({
        secret: 'secretKey',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.get('/', (req, res) => {
    res.send('UberEATS Backend Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

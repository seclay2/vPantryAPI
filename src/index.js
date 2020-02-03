// ./src/index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// defining the Express app
const app = express();

app.use(helmet());                      // headers/security
app.use(bodyParser.json());             // parse JSON bodies into JS objects
app.use(cors());                        // enable CORS for all requests
app.use(morgan('combined'));    // log HTTP requests

// auth
const checkJwt = require('./auth');
app.use(checkJwt);

//auth test
app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

// endpoints
// users
const UserRoutes = require('./routes/user');
app.use('/users', UserRoutes);
// items
const ItemRoutes = require('./routes/item');
app.use('/items', ItemRoutes);
// groups
const GroupRoutes = require('./routes/group');
app.use('/groups', GroupRoutes);

//database
const { startDatabase } = require('./database/mongo');

startDatabase().then(async () => {

    // start the server
    let port = process.env.PORT;
    if (port == null | port == "") {
        port = 3001;
    }
    app.listen(port, async () => {
        console.log('listening on port 3001');
    });
});
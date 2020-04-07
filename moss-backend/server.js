/*
 * Worked with https://www.youtube.com/watch?v=fgTGADljAeg
 * And/Or https://github.com/WebDevSimplified/Your-First-Node-REST-API
 */

require('dotenv').config();
// loads module and registers app specific cleanup callback...
var cleanup = require('./helpers/cleanup').Cleanup(cleanup);
const express = require('express');
var cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('./helpers/jwt');
const mongoose = require('mongoose');
const email = require('./helpers/email');

// Simple function that gets called whenever the program ends so the email connection can close gracefully
function cleanup() {
    email.closeConnection();
}

var authString = process.env.MONGO_AUTH === "true" ? `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@` : '';

mongoose.connect(`mongodb://${authString}${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
                , {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

app.use(cors());
// secure the api
app.use(jwt());

const usersRouter = require('./routes/users')
const groupsRouter = require('./routes/groups')
const calendarsRouter = require('./routes/calendars')
const eventsRouter = require('./routes/events')

app.use('/users', usersRouter)
app.use('/groups', groupsRouter)
app.use('/calendars', calendarsRouter)
app.use('/meetings', eventsRouter)

// UNTESTED!
// HTTPS support https://stackoverflow.com/a/11805909
// var privateKey = fs.readFileSync( 'privatekey.pem' );
// var certificate = fs.readFileSync( 'certificate.pem' );

// https.createServer({
//     key: privateKey,
//     cert: certificate
// }, app).listen(port);
// UNTESTED END

app.listen(port, () => console.log('Server has started'))
email.verifySMTP();
const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var routes = require('./routes/routes');
var api = require('./routes/api');
const ip = require('ip');
const cronJobs = require('./modules/cronJobs')
const cookieParser = require('cookie-parser');
app.use(express.static('public'));
app.use(cookieParser())
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use('/', routes);
app.use('/api', api);

MongoClient.connect(process.env.MONGODB_URL)
.then(client =>{
  const db = client.db('rakutest');
  console.log('DB connection SUCCESS')
  app.locals.db = db;
});
const port = process.env.PORT || 2000
const server = app.listen(port, () => {
  console.log(`Express running → PORT http://${ip.address()}:${port}`);
});

module.exports = app;

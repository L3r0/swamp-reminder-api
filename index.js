const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs-extra');
var config = require('./config.json');
var sentences = require('./data/sentences.json');
var rotation = require('./rotation');
var holiday = require('./holiday');

//Parser for the body of request
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.send(200);
  } else {
    //move on
    next();
  }
});

app.post('/shiftrotation', function(req, res) {
  let direction = req.param('direction', 1);
  rotation.shiftRotaation(direction);
  res.send(200);
}); 

app.get('/rotation', function(req, res) {
  res.json(rotation.getRotation(1));
}); 

app.get('/rotationMonth', function(req, res) {
  res.json(rotation.getRotation(4));
}); 

app.get('/sentences', function(req, res) {
  res.json(sentences);
});

app.get('/holidays', function(req, res) {
  res.json(holiday.getHolidays());
}); 

app.put('/holidays', function(req, res) {
  let data = req.body;
  holiday.updateHolidays(data);
  console.log(data);
  res.send("OK");
});


//return JSON if asked politely
/**
 * @deprecated since version 2.0
 */
app.get('/config', function(req, res) {
  res.json(config);
});

//Svae config
/**
 * @deprecated since version 2.0
 */
app.put('/config', function(req, res) {
  config = req.body;
  fs.writeJson('./config.json', config, {
      spaces: 2
    },
    function() {
      res.send("OK");
    });
});

//If options, we're also reponsding politely without CORS
app.options("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

//Launch the server
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})

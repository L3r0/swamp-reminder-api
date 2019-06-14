const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs-extra');
var config = require('./config.json');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

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

app.get('/config', function(req, res) {
  res.json(config);
});

app.put('/config', function(req, res) {
  console.log(req.body);

  config = req.body;

  fs.writeJson('./config.json', config, {
      spaces: 2
    },

    function() {
      res.send("OK");
    });
});

app.options("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})

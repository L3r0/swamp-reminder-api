const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const util = require('util');
const moment = require('moment');
const phantom = require('phantom');
const path = require('path');
const app = express();
var instance;
var page;
var config = require('./config.json');
var sentences = require('./data/sentences.json');
var rotation = require('./rotation');
var holiday = require('./holiday');

var dir = path.join(__dirname, 'images');

app.use(express.static(dir));

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

setInterval(() => {
  let now = moment();
  let yesterday = moment().subtract(1, 'day');
  if (now.hour() > 8) {
    checkImageExist(now);

    clearImages();
  }
}, 10000);

(async () => {
  //setup PhantomJS
instance = await phantom.create();
page = await instance.createPage();

//Set the viewPort size
await page.property('viewportSize', { width: 1280, height: 1400 });
await page.property('clipRect', { top: 130, left: 18, width: 950, height: 1200 });
page.on('onResourceError',(resourceError) => {
  console.error(resourceError.url + ': ' + resourceError.errorString);
});
})();

var renderImage = async(url, fileName, page) => {
  //Open the page
  const status = await page.open(url);
  console.log(`Page opened with status [${status}].`);

  if(status === 'success') {
    //Let a bit of time for page to render
    setTimeout(async () => {
      await page.render(fileName);
    }, 10000);
  }
};

var clearImages = function() {
  let directory = './images';
  fs.readdir(directory, (err, files) => {
    files.forEach(file => {
      let date = file.substring(0, file.indexOf('.'));
      let dateMoment = moment(date);
      if(dateMoment.isBefore(moment().subtract(5, 'day'))) {
        fs.unlink(directory + '/' + file);
      }
    });
  });
}

var checkImageExist = (time) => {
  let imageName = './images/' + time.format('YYYY-MM-DD') + '.jpg';
    try {
      if (fs.existsSync(imageName)) {
        //file exists, everything is fine
      } else {
        renderImage('http://sonarqube-prd.intra.arkea.com:8080/portfolio?id=BAD_Creature_Java1',imageName, page);
      }
    } catch (err) {
      console.error(err)
    }
}

//Launch the server
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})

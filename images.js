

const phantom = require('phantom');
const fs = require('fs-extra');
const moment = require('moment');
var BlinkDiff = require('blink-diff');

var instance;
var page;

//setup PhantomJS
(async () => {
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
      await page.render(fileName, {format: 'png', quality: '100'});

      //Generate diff with last image

     let yesterday = moment().subtract(1, 'day');
      var lastImage = './images/' + yesterday.format('YYYY-MM-DD') + '.png';
      var diff = new BlinkDiff({
        imageAPath: lastImage, // Use file-path
        imageBPath: fileName,
        thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        threshold: 0.01, // 1% threshold
        composition: false,
        imageOutputPath: 'images/diff.png'
      });
      diff.run(function (error, result) {
       if (error) {
          throw error;
       } else {
          console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
          console.log('Found ' + result.differences + ' differences.');
       }
      });
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
  let imageName = './images/' + time.format('YYYY-MM-DD') + '.png';
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

module.exports = {
  createImage: checkImageExist,
  clearImages: clearImages
}
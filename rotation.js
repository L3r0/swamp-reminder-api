

const moment = require('moment-ferie-fr');
const names = require('./data/names.json');
const holiday = require('./holiday');
const fs = require('fs-extra');

function isWeekend(date) {
  return (date.day() == 6 || date.day() == 0)
};


function getRotation(numberOfRotations) {
  let currentDate = moment(new Date());
  //Get historic
  let historic = JSON.parse(fs.readFileSync('./data/historic.json'));
  let whodidlast = historic[0].name;
  let saveHistoric = true;
  // If today's historic has already been saved, get the previous entry.
  // Else, save historic at the end of the process
  // Do not update on weekens
  if (moment(historic[0].date).isSame(currentDate, 'day') && !isWeekend(currentDate)) {
    whodidlast = historic[1].name;
    saveHistoric = false;
  }
  //todo : check date
  let rotation = [];
  let todayAttribution = null;
  for (let i = 0; i < names.length * numberOfRotations; i++) {
    //Add days untill we are an open day
    while (isWeekend(currentDate) && currentDate.isFerie) {
      currentDate.add(1, 'days');
    }
    //Get person's name & index
    let indexPerson = (names.indexOf(whodidlast) + 1 + i) % names.length;
    //Check if the person is on hollydays
    if (holiday.isOnHoliday(names[indexPerson], currentDate)) {
      rotation.push({
        name: names[indexPerson],
        date: 'Holiday'
      });
    } else {
      if (!todayAttribution) {
        todayAttribution = names[indexPerson];
      }
      rotation.push({
        name: names[indexPerson],
        date: moment(currentDate).format('YYYY-MM-DD')
      });
      currentDate.add(1, 'days');
    }
  }
  //save Historic if needed
  if (saveHistoric) {
    let newHistoric = [
      {
        name: todayAttribution,
        date: moment(new Date()).format('YYYY-MM-DD') 
      },
      {
        name: historic[0].name,
        date: historic[0].date 
      }
    ];
    //Save last & today in historic.json
    fs.writeFileSync('./data/historic.json', JSON.stringify(newHistoric));
  }
  return rotation;
}

function getNextName(name, sens) {
  let indexName = names.indexOf(name);
  switch(sens) {
    case  1: return names[(indexName + 1) % names.length];
    case -1: return indexName === 0 ? names[names.length - 1] : names[(indexName - 1)];
  }
}

function shiftRotaation(direction) {
  //Get historic
  let historic = JSON.parse(fs.readFileSync('./data/historic.json'));
  let newHistoric = [
    {
      name: getNextName(historic[0].name, direction),
      date: historic[0].date
    },
    {
      name: getNextName(historic[1].name, direction),
      date: historic[1].date
    }
  ]
  //Save new historic in historic.json
  fs.writeFileSync('./data/historic.json', JSON.stringify(newHistoric));
}


module.exports = {
  getRotation: getRotation,
  shiftRotaation: shiftRotaation
};
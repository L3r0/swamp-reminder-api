
const fs = require('fs-extra');
const moment = require('moment-ferie-fr');

function isOnHoliday(name, date) {
  let holidays = JSON.parse(fs.readFileSync('./data/holidays.json'));
  //Aurélien ne travaille pas le lundi
  if (name === 'Aurélien' && date.day() === 1) return true;
  for (let i = 0; i < holidays.length; i++) {
    if (holidays[i].person === name) {
      const dates = holidays[i];
      if (date.isBetween(moment(dates.start), moment(dates.end))) {
        return true;
      }
    }
  }
  return false;
}

function getHolidays() {
  return JSON.parse(fs.readFileSync('./data/holidays.json'));
}

function updateHolidays(data) {
  fs.writeFileSync('./data/holidays.json', JSON.stringify(data, null, 2));
}

module.exports = {
  isOnHoliday: isOnHoliday,
  getHolidays: getHolidays,
  updateHolidays: updateHolidays
}
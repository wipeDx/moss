const ical = require('ical');
const ical2 = require('node-ical');
const helper = require('./helper');

module.exports = {
  checkICSFeed: function(feed) {
    ical.fromURL(feed, {}, (err, data) => {
      if (err) {
        if (err.message.startsWith('Invalid URI')) {
          throw new Error('The provided URI is invalid');
        }
        else {
          throw new Error(err);
        }
      }
    });
    return true;
  },
  parseURI: function(uri) {
    uri = uri.replace('webcal://', 'https://')
    return uri;
  },
  getCalendarEvents: async function(feed, minTime, priority) {
    const webEvents = await ical2.async.fromURL(feed);
    return(parseEvents(webEvents, minTime, priority));
  }
}

function parseEvents(data, minTime, priority) {
  let timeslots = [];
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      var ev = data[k]
      if (ev.start >= minTime && data[k].type == "VEVENT") {
        //console.log(`${ev.summary} is in ${ev.location} on the ${ev.start.getDate()} of ${ev.start.getMonth()} at ${ev.start.toLocaleTimeString('en-GB')}`);
        timeslots.push({
          title: "Obtained",
          start: new Date(ev.start),
          end: new Date(ev.end),
          backgroundColor: "#6c757d",
          borderColor: helper.getBorderColor(priority),
          editable: false
        });
      }
    }
  }
  return timeslots;
}
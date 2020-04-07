const User = require('../models/user');
const googleService = require('../helpers/google');
const microsoftService = require('../helpers/microsoft');
const icsService = require('../helpers/ics');

const DAY_IN_MS = 86400000;

const MAX_RESULTS = 5;
const MAX_PADDING = 1800000; // 30 Minutes in ms

module.exports = {
  findTimeSlots: async function(settings, inviteeList) {
    console.log('Grabbing calendar events');
    const promiseEvents = grabCalendarEvents(inviteeList, new Date(settings.startDate));
    return promiseEvents.then(async events => {
      let flatMapEvents = []
      events.forEach(eventList => {flatMapEvents = flatMapEvents.concat(eventList)})
      // Final array result and calculation of optimal events
      // console.log(flatMapEvents);
      const optimalTimeslots = calculateOptimalTimeSlots(flatMapEvents, settings);
      console.log(optimalTimeslots);
      return optimalTimeslots;
    })


    //Just rejection handling after this point
    .catch(rejection => {
      if (rejection.statusCode === 401) {
        throw new Error(rejection.body)
      }
      else {
        console.log("something went wrong");
        console.log(rejection);
        throw new Error(rejection.body)
      }
    })
  }
}

async function calculateOptimalTimeSlots(busyEvents, settings) {
  // - convert all objects to simple {start: number, end: number} objects (number being unix timestamp and thus ms)
  // - offer the first 5 results
  // - calculate needed meeting duration in ms as everything is in ms
  // - go through each pair of time slots and see if the end of the later one substracted by the start of the earlier one is bigger than the time duration needed
  // - if so, add to the result list
  // - if results == max results, return list
  // - repeat?
  // Just convert hours and minutes into ms
  const givenDuration = settings.appointmentLength[0] * 3600000 + settings.appointmentLength[1] * 60000;
  // Duration of the entire time range
  const maxDuration = calculateMaxDuration(settings.timeRangeStart, settings.timeRangeEnd);
  // get the next 60 possible Dates
  const possibleDates = getPossibleDates(settings);
  // convert to friendly format
  const ev = convertBusyEvents(busyEvents);
  // merge possible dates with calendar event entries per day
  const mergedEv = mergeEvents(possibleDates, ev, givenDuration);
  const AMOUNT_NEEDED = MAX_RESULTS * settings.numAppointments;
  var optimalTimeSlots = [];

  for (let date of mergedEv) {
    if (optimalTimeSlots.length === AMOUNT_NEEDED) {
      break;
    }
    console.log(date);
    if (date.eventsOnDate.length > 0) {
      for(var i = -1; i < date.eventsOnDate.length; ++i) {
        if (optimalTimeSlots.length === AMOUNT_NEEDED) {
          break;
        }
        var earlyDateEnd;
        var lateDateStart;
        // If case catches if the latest event is still before the start time
        if (i === -1 || new Date(date.eventsOnDate[i].end).getTime() < date.date.getTime()) {
          //console.log("EarlyDateEnd is start time")
          earlyDateEnd = date.date;
        }
        else {
          //console.log("EarlyDateEnd is event time")
          earlyDateEnd = new Date(date.eventsOnDate[i].end);
        }
        if (i+1 === date.eventsOnDate.length || new Date(date.eventsOnDate[i+1].start).getTime > date.date.getTime() + maxDuration) {
          //console.log("LateDateStart is end time")
          lateDateStart = new Date(date.date.getTime() + maxDuration);
        }
        else {
          //console.log("LateDateStart is event time")
          lateDateStart = new Date(date.eventsOnDate[i+1].start);
        }

         console.log(`Looking at ${earlyDateEnd.toLocaleTimeString()} - ${lateDateStart.toLocaleTimeString()}`);

        if (lateDateStart.getTime() - earlyDateEnd.getTime() >= givenDuration) {
          //console.log(`Difference ${lateDateStart.getTime() - earlyDateEnd.getTime()} is bigger than ${givenDuration}`)
          optimalTimeSlots.push({start: earlyDateEnd, end: new Date(earlyDateEnd.getTime() + givenDuration)});
        }
      }
    }
    // Empty day!
    else {
      optimalTimeSlots.push({start: date.date, end: new Date(date.date.getTime() + givenDuration)})
    }
  }

  //console.log(optimalTimeSlots);
  return optimalTimeSlots;
}
/**
 * Merges possible dates and events on that specific day
 * @param {[Date]} possibleDates Array of dates that are possible to look at
 * @param {[{Date, Date}]} events Array of calendar events from invitees, only their start and end date
 * @param {number} duration Specified duration of the event that's about to be scheduled
 */
function mergeEvents(possibleDates, events, duration) {
  var mergedEvents = [];
  possibleDates.forEach(date => {
    var eventsOnDate = [];
    events.forEach(event => {
      const startDate = new Date(event.start);
      if (date.getDate() === startDate.getDate() && date.getMonth() === startDate.getMonth() && date.getFullYear() === startDate.getFullYear()) {
        eventsOnDate.push(event);
        console.log(event);
      }
    })
    mergedEvents.push({
      date: date,
      eventsOnDate: eventsOnDate
    });
  })
  //console.log(mergedEvents);
  return mergedEvents;
}


/**
 * Grabs the next 60 days that are possible to look up
 * @param {*} settings Settings used to create array of possible dates
 */
function getPossibleDates(settings) {
  const daysAllowed = settings.days;
  
  // Convert strings to actual date
  const startDate = new Date();
  const startDateSplit = settings.startDate.split('-');
  const startSplit = settings.timeRangeStart.split(':');
  const endDate = new Date();
  const endDateSplit = settings.endDate.split('-');
  const endSplit = settings.timeRangeEnd.split(':');
  startDate.setFullYear(startDateSplit[0], startDateSplit[1] - 1, startDateSplit[2]);
  startDate.setHours(startSplit[0]);
  startDate.setMinutes(startSplit[1]);
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  endDate.setFullYear(endDateSplit[0], endDateSplit[1] - 1, endDateSplit[2]);
  endDate.setHours(endSplit[0]);
  endDate.setMinutes(endSplit[1]);
  endDate.setSeconds(0);
  endDate.setMilliseconds(0);
  const MAX_DATES = (endDate.getTime() - startDate.getTime()) / DAY_IN_MS;
  var possibleDates = []
  var currentDate = startDate;
  // If start date is behind "right now" although it'll be checked in front end to not allow that
  if (currentDate.getTime() - Date.now() <= 0) {
    currentDate = new Date(startDate.getTime() + DAY_IN_MS);
  }

  while (possibleDates.length < MAX_DATES) {
    // Prevents softlock when first date is a not-allowed date
    if (!daysAllowed[currentDate.getDay()]) {
      currentDate = new Date(currentDate.getTime() + DAY_IN_MS);
      continue;
    }
    possibleDates.push(currentDate);
    // Gets start date or the day after the last day inserted into the array
    var currentDate = possibleDates.length == 0 ? currentDate : new Date(currentDate.getTime() + DAY_IN_MS);


  }
  return possibleDates;
}

/**
 * Converts array of grabbed events into a format where they are just the start and end time in milliseconds
 * @param {*} busyEvents Array of events to convert
 */
function convertBusyEvents(busyEvents) {
  var converted = [];
  busyEvents.forEach(event => converted.push({start: event.start.getTime(), end: event.end.getTime()}));
  return converted;
}

/**
 * Converts the human readable times into their difference in milliseconds
 * @param {string} start start time in the format of 18:00
 * @param {string} end  end time in the format of 18:00
 */
function calculateMaxDuration(start, end) {
  const startSplit = start.split(':');
  const endSplit   = end.split(':');

  const startDate = new Date(0);
  const endDate = new Date(0);

  startDate.setHours(startSplit[0]);
  startDate.setMinutes(startSplit[1]);
  endDate.setHours(endSplit[0]);
  endDate.setMinutes(endSplit[1]);
  const difference = endDate.getTime() - startDate.getTime();
  return difference;
}

async function grabCalendarEvents(inviteeList, minTime) {
  // Search for all calendars of provided userIDs
  const users = await User.find({ _id: {$in: inviteeList }}).select('calendars');
  var eventPromises = [];
    users.forEach(user => {
      user.calendars.forEach(calendar => {

        switch (calendar.type) {
          case "Google":
            eventPromises.push(googleService.getCalendarEvents(calendar.accessIdentifier, minTime))
            break;
          case "Apple":
            break;
          case "Microsoft":
            eventPromises.push(microsoftService.getCalendarEvents(calendar.accessIdentifier, minTime));
            break;
          case "ICS":
            eventPromises.push(icsService.getCalendarEvents(calendar.accessIdentifier, minTime));
            break;
          default:
            break;
        }
      })
  })
  return Promise.all(eventPromises)
}
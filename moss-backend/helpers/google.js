require('dotenv').config();
const axios = require('axios');
const {google} = require('googleapis');
const User = require ('../models/user');
const helper = require('./helper');

var oAuth2Client;
var calendar;

module.exports = {
  getCalendarEvents: async function(auth, minTime, priority) {
    let events = await getAuthorizedCalendar(auth).events.list({
      // required, it is an email, or email like id of a calendar
      calendarId: 'primary',// optional, arguments that let you filter/specify wanted events
      showDeleted: false,
      singleEvents: true,
      orderBy: 'starttime',
      timeMin: minTime.toISOString()
    });
    return parseEvents(events, priority);
  },
  requestTokenFromCode: async function(code) {
    if (oAuth2Client == undefined) {
      oAuth2Client = new google.auth.OAuth2(process.env.G_API_CLIENT_ID, process.env.G_API_CLIENT_SECRET, process.env.G_API_REDIRECT_URI);
    }
    const {tokens} = await oAuth2Client.getToken(code);

    return tokens;
  },
  // Calls a simple list of events in order to fetch the calendar's name
  getCalendarName: async function (auth) {
    const result = await getAuthorizedCalendar(auth).events.list({
      // required, it is an email, or email like id of a calendar
      calendarId: 'primary',// optional, arguments that let you filter/specify wanted events
      showDeleted: false,
      singleEvents: true,
      maxResults: 1
    });
    return result.data.summary;
  },
  // Gathers userIDs and requests auths from all their google accounts in order to insert the meeting into their calendars
  insertMeeting: function (meeting) {
    let auths = [];
    auths.push(getAuthFromUserID(meeting.creator._id));
    meeting.attendees.forEach(a => auths.push(getAuthFromUserID(a.userID._id)))
    Promise.all(auths).then(auths => {
      let concatAuths = [];
      let promiseInserts = [];
      // flatmap them
      auths.forEach(auth => concatAuths = concatAuths.concat(auth));
      concatAuths.forEach(auth => promiseInserts.push(writeCalendarMeeting(auth, meeting)));
      Promise.all(promiseInserts)
      .then(inserts => console.log(inserts))
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  }
}

// This is pretty much all we have to do
// OAuth2Client handles token refreshes, luckily
function getAuthorizedCalendar(auth) {
  if (oAuth2Client == undefined) {
    oAuth2Client = new google.auth.OAuth2(process.env.G_API_CLIENT_ID, process.env.G_API_CLIENT_SECRET, process.env.G_API_REDIRECT_URI);
  }
  if (calendar == undefined) {
    calendar = new google.calendar({version: 'v3', auth: oAuth2Client});
  }
  oAuth2Client.setCredentials(auth);
  return calendar;
}

// Parses google request and takes out any personal info and puts it into the universal event format
function parseEvents(googleRequest, priority) {
  let timeslots = [];
  googleRequest.data.items.forEach(slot => {
    timeslots.push({
      title: "Obtained",
      start: new Date(slot.start.dateTime == undefined ? slot.start.date : slot.start.dateTime),
      end: new Date(slot.end.dateTime == undefined ? slot.end.date : slot.end.dateTime),
      backgroundColor: "#6c757d",
      borderColor: helper.getBorderColor(priority),
      editable: false
    });
  });
  //console.log(timeslots);
  return timeslots;
}

function convertRepeating(repeatingInterval) {
  switch (repeatingInterval) {
    case 'WEEK': return 'WEEKLY';
    case 'DAY': return 'DAILY';
    case 'YEAR': return 'YEARLY';
    case 'MONTH': return 'MONTHLY';
    default: return '';
  }
}

// Gets users by the ID and grabs (all) the google auth codes
async function getAuthFromUserID (userID) {
  try {
    const user = await User.findById(userID);
    let googleAuths = [];
    user.calendars.forEach(
      calendar => calendar.type === "Google" ? googleAuths.push(calendar.accessIdentifier) : void 0);
    return googleAuths;
  } catch (err) {
    throw new Error(err);
  }
}

async function writeCalendarMeeting  (auth, meeting) {
  const calendar = getAuthorizedCalendar(auth);
  const recurrence = [`RRULE:FREQ=${convertRepeating(meeting.repeatingInterval)};INTERVAL=${meeting.repeatingCount}`];
  meeting.timeslots.forEach(timeslot => {
    var event = {
      'summary': meeting.name,
      'location': meeting.location,
      'description': meeting.comment,
      'start': {
        'dateTime': timeslot.start,
        'timeZone': 'UTC'
      },
      'end': {
        'dateTime': timeslot.end,
        'timeZone': 'UTC'
      },
      'recurrence': meeting.repeating ? recurrence : [],
      'reminders': {
        'useDefault': true
      }
    }
    calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    },
    (err, event) => {
      if (err) {
        console.log('Error while contacting Google Calendar service: ' + err);
        return;
      }
    });
  })
}
require('dotenv').config();
var graph = require('@microsoft/microsoft-graph-client');
const axios = require('axios');
const User = require('../models/user');
const helper = require('./helper');

const microsoft_axios = axios.create({
  baseURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/',
  timeout: 10000,
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
})

module.exports = {

  getCalendarEvents: async function(accessToken, minTime, priority) {
    const client = await getAuthenticatedClient(accessToken);
  
    const events = await client
      .api('/me/events')
      .select('start,end')
      .orderby('createdDateTime DESC')
      .get();
    
    return parseEvents(events.value, priority);
  },
  requestTokenFromCode: function(code, callback) {
            
    // https://stackoverflow.com/a/39864307
    let body = `client_id=${process.env.M_API_APP_ID}&`
    + `grant_type=authorization_code&`
    + `scope=${process.env.M_API_SCOPES_URI}&`
    + `code=${code}&`
    + `client_secret=${process.env.M_API_CLIENT_SECRET}&`
    + `redirect_uri=${process.env.M_API_REDIRECT_URI}`;

    //console.log(body);

    microsoft_axios.post(`/token?`, body).then(
      data => callback(null, data.data)
    )
    .catch(
      rejected => callback(rejected, null)
    );
  },
  getCalendarName: async function(accessToken) {
    const client = await getAuthenticatedClient(accessToken);
  
    const calendar = await client
      .api('/me/calendar')
      .get();
    return calendar.owner.address;
    //return parseEvents(events.value);
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

async function writeCalendarMeeting  (auth, meeting) {
  let promises = [];
  
  const graph = await getAuthenticatedClient(auth);
  meeting.timeslots.forEach(timeslot => {
    var event = {
      "subject": meeting.name,
      "location": {
        "displayName": meeting.location
      },
      "body": {
        "contentType": "HTML",
        "content": meeting.comment 
      },
      'start': {
        'dateTime': timeslot.start,
        'timeZone': 'UTC'
      },
      'end': {
        'dateTime': timeslot.end,
        'timeZone': 'UTC'
      },
      'recurrence': meeting.repeating ? generateRecurrence(meeting, timeslot) : undefined,
    }
    graph.api('/me/events').post(event)
    .then(res => {})
    .catch(err => console.log(err));
  });
  return promises
}


/**
 * Calls a "refresh_token" GET request on microsoft's servers in order to get a new token when the old one is expired
 * and calls the function saveNewTokens in order to insert them into the database.
 * @param {*} refreshToken 
 */
async function requestNewToken(refreshToken) {
  // https://stackoverflow.com/a/39864307
  let body = `client_id=${process.env.M_API_APP_ID}&`
  + `grant_type=refresh_token&`
  + `scope=${process.env.M_API_SCOPES_URI}&`
  + `refresh_token=${refreshToken}&`
  + `client_secret=${process.env.M_API_CLIENT_SECRET}`;

  //console.log("Requesting new access token");
  return microsoft_axios.post(`/token?`, body).then(
    data => {
      // Promise call, error is hard to test since tokens are valid for 10 minutes
      return saveNewTokens(refreshToken, data.data)
        .then(tokens => tokens)
        .catch(error => console.log(error));
    })
  .catch(
    rejected => {
      console.log(rejected);
      return rejected
    });
}

/**
 * The old token gets queried in order to get the right calendar and then
 * their respective accessIdentifier gets replaced
 * @param {*} oldRefreshToken 
 * @param {*} accessIdentifier 
 */
async function saveNewTokens(oldRefreshToken, accessIdentifier) {
  
  try {
    user = await User.findOne({ "calendars.accessIdentifier.refresh_token": oldRefreshToken}).select('calendars');
    if (!user) {
      return;
    }
    let returnTokens;
    user.calendars.forEach(calendar => {
      if (calendar.accessIdentifier.refresh_token == oldRefreshToken) {
        calendar.accessIdentifier = accessIdentifier;
        calendar.accessIdentifier.tokenCreated = new Date(Date.now()).getTime();
        returnTokens = calendar.accessIdentifier;
      }
    })
    await user.save();
    return returnTokens;
  }
  catch (err) {
    console.log(err);
  }

}

// Gets users by the ID and grabs (all) the google auth codes
async function getAuthFromUserID (userID) {
  try {
    const user = await User.findById(userID);
    let msftAuths = [];
    user.calendars.forEach(
      calendar => calendar.type === "Microsoft" ? msftAuths.push(calendar.accessIdentifier) : void 0);
    return msftAuths;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Simple parser that parses the eventlist gathered from Microsoft's servers
 * into the MOSS format without any personal info.
 * @param {*} eventList List of events gathered from Microsoft's servers
 */
function parseEvents (eventList, priority) {
  let parsedEvents = [];
  eventList.forEach(event => {
    let timeZoneOffset = new Date(event.start.dateTime).getTimezoneOffset() * 60000;
    let startTime = new Date(event.start.dateTime);
    let endTime = new Date(event.end.dateTime);
    parsedEvents.push({
      title: 'Obtained',
      backgroundColor: '#6c757d',
      start: new Date(startTime.getTime() - timeZoneOffset),
      end: new Date(endTime.getTime() - timeZoneOffset),
      borderColor: helper.getBorderColor(priority),
      editable: false
    });
  });
  return parsedEvents;
}

// TODO comment
async function getAuthenticatedClient(accessToken) {
  const rightNow = new Date(Date.now()).getTime();
  const timeDifference = ((rightNow - accessToken.tokenCreated) / 1000);
  //console.log(timeDifference + ' > ' + accessToken.expires_in);
  if (timeDifference > accessToken.expires_in) {
    console.log("Token should be expired!" + timeDifference + ' > ' + accessToken.expires_in);
    return requestNewToken(accessToken.refresh_token).then(
      data => {
        return initClient(data);
      }
    ).catch(err => {
      console.err("Error in getAuthenticatedClient: ");
      console.err(err);
    });
  }
  else {
    return initClient(accessToken);
  }
}

// TODO comment
function generateRecurrence(meeting, timeslot) {
  // recurrence: {
  //   pattern: {
  //     type: "weekly",
  //     interval: 1,
  //     daysOfWeek: [ "Monday" ]
  //   },
  //   range: {
  //     type: "endDate",
  //     startDate: "2017-09-04",
  //     endDate: "2017-12-31"
  //   }
  // },
  const start = new Date(timeslot.start);
  let pattern = undefined;
  let range = { 
    startDate: `${start.getFullYear()}-${start.getUTCMonth()+1}-${start.getUTCDate()}`,
    type: 'noEnd'
  };
  switch (meeting.repeatingInterval) {
    case "DAY":
      pattern = {
        type: 'daily',
        interval: meeting.repeatingCount,
      };
      break;
    case "WEEK":
      pattern = {
        type: 'daily',
        interval: meeting.repeatingCount * 7
      };
      break;
    case "MONTH":
      pattern = {
        type: 'absoluteMonthly',
        interval: meeting.repeatingCount,
        dayOfMonth: start.getUTCDate()
      }
      break;
    case "YEAR":
      pattern = {
        type: 'absoluteYearly',
        interval: meeting.repeatingCount,
        dayOfMonth: start.getUTCDate(),
        month: start.getUTCMonth() + 1 // +1 because it's zero based... why?!
      }
      break;
  }
  return { 'pattern': pattern, 'range': range };
}

function initClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken.access_token);
    }
  });

  return client;
}
const express = require('express')
const router = express.Router()
const Calendar = require('../models/calendar')
const User = require('../models/user');
const microsoftService = require('../helpers/microsoft');
const googleService = require('../helpers/google');
const icsService = require('../helpers/ics');
const appleService = require('../helpers/apple');

// Getting all calendar events since a minimum time (req.body.mintime) of
// all users (req.body.userids) by going through:
// 1. get all calendar (tokens) of said users
// 2. go through each calendar 
// 3. compile all calendar events
// 4. return them to the caller
router.post('/', async (req, res) => {
  try {
    const minTime = new Date(req.body.minTime);
    const userIDs = req.body.userIDs;
    const priorities = req.body.priorities;
    // Search for all calendars of provided userIDs
    const users = await User.find({ _id: {$in: userIDs }}).select('calendars');
    var eventPromises = [];
    
    // Add priority to users
    let users_priorities = [];
    for (let i = 0; i < users.length; ++i) {
      let currentUser = { _id: users[i]._id, calendars: users[i].calendars };
      for (let j = 0; j < userIDs.length; ++j) {
        if (users[i]._id.toString() === userIDs[j]) {
          currentUser.priority = priorities[j];
        }
      }
      users_priorities.push(currentUser);
    }
    console.log(req.body);
    users_priorities.forEach(async user => {
      user.calendars.forEach(async calendar => {

        switch (calendar.type) {
          case "Google":
            eventPromises.push(googleService.getCalendarEvents(calendar.accessIdentifier, minTime, user.priority))
            break;
          case "Apple":
            break;
          case "Microsoft":
            eventPromises.push(microsoftService.getCalendarEvents(calendar.accessIdentifier, minTime, user.priority));
            break;
          case "ICS":
            eventPromises.push(icsService.getCalendarEvents(calendar.accessIdentifier, minTime, user.priority))
            break;
          default:
            break;
        }
      })
    })
    let joined = Promise.all(eventPromises)
    joined.then(events => {
      let flatMapEvents = []
      events.forEach(eventList => {flatMapEvents = flatMapEvents.concat(eventList)})
      res.json(flatMapEvents)
    })
    .catch(rejection => {
      if (rejection.statusCode === 401) {
        console.log("test");
      }
      else {
        console.log("something went wrong");
        console.log(rejection);
        res.status(500).json({ message: rejection.body })
      }
    })
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Deleting one
router.delete('/:userid/:calid', async (req, res) => {
  try {
    user = await User.findOne({ _id: req.params.userid, "calendars._id" : req.params.calid  })
    console.log(user);
    if (user == null) {
      // User not found / does not exist
      return res.status(404).json({ message: 'Cannot find calendar' })
    }

    user.calendars = removeCalendarFromUser(user.calendars, req.params.calid);
    console.log(user);
    // call middleware and remove the requested user
    await user.save()
    res.json({ message: 'Deleted calendar' })
  } catch(err) {
    // something went wrong in the server
    res.status(500).json({ message: err.message })
  }
})

/**
 * Filters every calendar through the id
 * @param {*} calendarList List of calendars of the user
 * @param {*} calenderID id of calendar to be removed from list
 */
function removeCalendarFromUser(calendarList, calenderID) {
  return calendarList.filter(calendar => calendar._id.toString() !== calenderID);
}

module.exports = router
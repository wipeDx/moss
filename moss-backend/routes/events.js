const express = require('express')
const router = express.Router()
const Event = require('../models/event')
const email = require('../helpers/email')
const google = require('../helpers/google')
const microsoft = require('../helpers/microsoft')
const automaticTimeSlotSearch = require('../helpers/automaticTimeSlotSearch')

// Getting all
router.get('/', async (req, res) => {
  try {
    // Search for all events async
    const events = await Event.find()
    res.json(events)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Getting all owned by a person
router.get('/by-owner/:id', async (req, res) => {
  try {
    // Search for events with owner :id
    const events = await Event.find({creator: req.params.id})
      .populate('creator', 'name')
    res.json(events)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Getting all meetings that are marked as done
router.get('/by-done/:id', async (req, res) => {
  try {
    // Search for events with owner :id
    const events = await Event.find(
      {
        // State self explanatory
        state: {$in: ['Cancelled', 'Completed']},
        // Either the id provided is the creator
        // or one of the attendees
        $or: [{'creator': req.params.id}, {"attendees.userID": req.params.id}]
      })
      .populate('creator', 'name')
    res.json(events)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// Getting all owned by a person, dashboard version (only unset ones and the top 5)
router.get('/by-owner/:id/dashboard', async (req, res) => {
  try {
    // Search for events with owner :id
    const events = await Event.find({creator: req.params.id})
      .populate('creator', 'name')
      .sort({ created: -1 })
      .limit(5)
    res.json(events)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Getting all a person was invited to
router.get('/by-invitee/:id', async (req, res) => {
  try {
    // Search for events where :id is in attendees
    const events = await Event.find( { "attendees.userID": req.params.id })
      .populate('creator', 'name');
    res.json(events)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})
// Getting all a person was invited to (dashboard version, only unanswered ones, top 5)
router.get('/by-invitee/:id/dashboard', async (req, res) => {
  try {
    // Search for events where :id is in attendees
    const events = await Event.find( {
        "attendees.userID": req.params.id,
        "attendees.answerState": "NONE"
      })
      .populate('creator', 'name')
      .sort({ created: -1 })
      .limit(5);
    res.json(events)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Getting one
router.get('/:id', getEvent, (req, res) => {
  res.json(res.event)
})

// Automatic time slot search
router.post('/automatic-time-slot-search', async (req, res) => {
  try {
    const result = await automaticTimeSlotSearch.findTimeSlots(req.body.settings, req.body.inviteeList);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message })
  }
  
})

// Getting attendees of one
router.get('/:id/attendees', getEvent, (req, res) => {
  res.json(res.event.attendees)
})

// Creating one
router.post('/', async (req, res) => {
  // Take data from the requst sent to server
  const event = new Event({
    name: req.body.name,
    location: req.body.location,
    comment: req.body.comment,
    repeating: req.body.repeating,
    repeatingCount: req.body.repeating ? req.body.repeatingCount : -1,
    repeatingInterval: req.body.repeating ? req.body.repeatingInterval : "NONE",
    timeslots: req.body.timeslots,
    state: req.body.state,
    created: req.body.created,
    creator: req.body.creator,
    attendees: req.body.attendees
  })

  try {
    // try to save it into MongoDB
    const newEvent = await event.save()
    const populated = await newEvent.populate('attendees.userID', '_id name email').populate('creator', 'email').execPopulate();
    // send email to all invitees
    event.attendees.forEach(attendee => email.sendMeetingInvited(attendee.userID.email, event));
    // send email to creator
    email.sendMeetingCreated(event.creator.email, event);
    // return "successfully created object" with the object
    res.status(201).json(newEvent)
  } catch(err) {
    // user input data is wrong
    res.status(400).json({ message: err.message })
  }
})

// Updating one
router.patch('/:id', getEvent, async (req, res) => {
  // Old invitees
  var oldAttendeeIDs = [];
  res.event.attendees.forEach(attendee => oldAttendeeIDs.push(attendee.userID._id.toString()));

  // Is it already cancelled?
  var wasCancelled = res.event.state === "Cancelled";

  // Is it already set?
  var wasSet = res.event.state === "Completed";

  if (req.body.name != null) {
    res.event.name = req.body.name
  }
  if (req.body.comment != null) {
    res.event.comment = req.body.comment
  }
  if (req.body.location != null) {
    res.event.location = req.body.location
  }
  if (req.body.timeslots != null) {
    res.event.timeslots = req.body.timeslots
  }
  if (req.body.state != null) {
    res.event.state = req.body.state
  }
  if (req.body.repeating != null) {
    res.event.repeating = req.body.repeating
  }
  if (req.body.repeatingCount != null) {
    res.event.repeatingCount = req.body.repeatingCount
  }
  if (req.body.repeatingInterval != null) {
    res.event.repeatingInterval = req.body.repeatingInterval
  }
  if (req.body.state != null) {
    res.event.state = req.body.state
  }
  if (req.body.attendees != null) {
    res.event.attendees = req.body.attendees
  }

  try {
    const updatedEvent = await res.event.save()
    const populated = await updatedEvent.populate('attendees.userID', '_id name email').execPopulate();
    // Notify newly invited people
    if (oldAttendeeIDs.length < req.body.attendees.length) {
      populated.attendees.forEach(attendee => 
        {
          if (!oldAttendeeIDs.includes(attendee.userID._id.toString())) {
            email.sendMeetingInvited(attendee.userID.email, res.event);
          }
        })
    }

    // Notify people that meeting got set
    if (!wasCancelled && !wasSet && req.body.state === "Cancelled") {
      populated.attendees.forEach(attendee => email.sendMeetingCancelled(attendee.userID.email, updatedEvent));
      email.sendMeetingCancelled(populated.creator.email, updatedEvent);
    }
    if (!wasCancelled && !wasSet && req.body.state === "Completed") {
      populated.attendees.forEach(attendee => email.sendMeetingSet(attendee.userID.email, updatedEvent));
      email.sendMeetingSet(populated.creator.email, updatedEvent);
      google.insertMeeting(populated);
      microsoft.insertMeeting(populated);
    }

    res.json(updatedEvent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Updates a single attendee
router.patch('/:id/updateAttendee', getEvent, async (req, res) => {
  try {
    let updatedAttendee = false;
    let allAnswered = true;
    res.event.attendees.forEach(attendee => {
      if (attendee.userID._id.toString() === req.body.attendeeID) {
        attendee.answerState = req.body.answerState;
        attendee.customAnswer = req.body.customAnswer;
        updatedAttendee = true;
      }
      console.log(attendee.userID.name + ' - ' + attendee.answerState);
      allAnswered = attendee.answerState !== "NONE" && allAnswered;
    });
    if (updatedAttendee) {
      await res.event.save();

      if (allAnswered) {
        email.sendAllInviteesAnswered(res.event.creator.email, res.event);
      }

      res.status(200).json({ message: 'Updated successfully' })
    }
    else {
      res.status(404).json({ message: 'Attendee not found. Are you still invited?' })
    }
  }
  catch (err) {
    res.status(500).json({ message: err })
  }
})

// Deleting one
router.delete('/:id/:notify', getEvent, async (req, res) => {
  try {
    // call middleware and remove the requested user
    await res.event.remove()
    // Oh boy this is painful
    if (req.params.notify === 'true') {
      res.event.attendees.forEach(a => email.sendMeetingDeleted(a.userID.email, res.event));
    }
    res.json({ message: 'Deleted event' })
  } catch(err) {
    // something went wrong in the server
    res.status(500).json({ message: err.message })
  }
})

// Middleware function
async function getEvent(req, res, next) {
  let event
  try {
    event = await Event.findById(req.params.id)
      .populate('creator', '_id name email')
      .populate('attendees.userID', '_id name email')
    if (event == null) {
      // User not found / does not exist
      return res.status(404).json({ message: 'Cannot find event' })
    }
  } catch(err) {
    return res.status(500).json({ message: err.message })
  }

  res.event = event
  next()
}

module.exports = router
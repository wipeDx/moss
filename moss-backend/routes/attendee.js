const express = require('express')
const router = express.Router()
const Attendee = require('../models/attendee')

// Getting all
router.get('/', async (req, res) => {
  try {
    // Search for all users async
    const attendee = await Attendee.find()
    res.json(attendee)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Getting one
router.get('/:id', getAttendee, (req, res) => {
  res.json(res.event)
})

// Getting attendees of one
router.get('/:id/attendees', getAttendee, (req, res) => {
  res.json(res.event.attendees)
})

// Creating one
router.post('/', async (req, res) => {
  // Take data from the requst sent to server
  const attendee = new Attendee({
    user: req.body.user,
    priority: req.body.priority,
    answer_state: req.body.answer_state,

  })

  try {
    // try to save it into MongoDB
    const newAttendee = await attendee.save()
    // return "successfully created object" with the object
    res.status(201).json(newAttendee)
  } catch(err) {
    // user input data is wrong
    res.status(400).json({ message: err.message })
  }
})

// Updating one
router.patch('/:id', getAttendee, async (req, res) => {
  if (req.body.user != null) {
    res.attendee.user = req.body.user
  }
  if (req.body.priority != null) {
    res.attendee.priority = req.body.priority
  }
  if (req.body.answer_state != null) {
    res.attendee.answer_state = req.body.answer_state
  }


  try {
    const updatedAttendee = await res.attendee.save()
    res.json(updatedAttendee)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting one
router.delete('/:id', getAttendee, async (req, res) => {
  try {
    // call middleware and remove the requested user
    await res.attendee.remove()
    res.json({ message: 'Deleted attendee' })
  } catch(err) {
    // something went wrong in the server
    res.status(500).json({ message: err.message })
  }
})

// Middleware function
async function getAttendee(req, res, next) {
  let attendee
  try {
    attendee = await Attendee.findById(req.params.id)
    if (attendee == null) {
      // User not found / does not exist
      return res.status(404).json({ message: 'Cannot find attendee' })
    }
  } catch(err) {
    return res.status(500).json({ message: err.message })
  }

  res.attendee = attendee
  next()
}

module.exports = router
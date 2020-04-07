const express = require('express')
const router = express.Router()
const Group = require('../models/group')

// Getting all
router.get('/', async (req, res) => {
  try {
    // Search for all groups async and populate content
    const groups = await Group.find({})
          .populate('members')
          .populate('owner')
    console.log(groups)
    res.json(groups)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Getting one
router.get('/:id', getGroup, (req, res) => {
  res.json(res.group)
})

// Getting all members of one group
router.get('/:id/members', getGroup, (req, res) => {
  res.json(res.group.members)
})

// Add group
router.post('/', async (req, res) => {
  // Take data from the request sent to server
  const group = new Group({
    name: req.body.name,
    members: req.body.members
  })

  try {
    // try to save to MongoDB
    const newGroup = await group.save()
    // return successful
    res.status(201).json(newGroup)
  } catch (error) {
    // user input wrong
    res.status(400).json({ message: err.message })
  }
})

// Update group
router.patch('/:id', getGroup, async (req, res) => {
  if (req.body.members != null) {
    res.group.members = req.body.members
  }
  if (req.body.name != null) {
    res.group.name = req.body.name
  }

  try {
    const updatedGroup = await res.group.save()
    res.json(updatedGroup)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete group
router.delete('/:id', getGroup, async (req, res) => {
  try {
    // call middleware and remove the requested group
    await res.group.remove()
    res.json({ message: 'Deleted group' })
  } catch(err) {
    // something went wrong in the server
    res.status(500).json({ message: err.message })
  }
})

// Search
router.get('/search/:term', async (req, res) => {
  try {
    // https://stackoverflow.com/a/6969486
    const escapedTerm = req.params.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const groups = await Group.find({ name: { $regex: `^([a-z]*[ ]*(\\d)*)*${escapedTerm}([a-z]*[ ]*(\\d)*)*$`, $options: 'igm'} })

    res.json(groups)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Middleware function
async function getGroup(req, res, next) {
  let group
  try {
    group = await Group.findById(req.params.id)
      .populate('members', '-password -calendars -groups')
    if (group == null) {
      // Group not found / does not exist
      return res.status(404).json({ message: 'Cannot find group' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.group = group
  next()
}

module.exports = router
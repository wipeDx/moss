const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

const Event = new mongoose.Schema ({
  name: { 
    type: String,
    required: true
  },
  comment: {
    type: String,
  },
  location: {
    type: String,
    required: true
  },
  timeslots: [{
    name: String,
    start: Date,
    end: Date,
    bgcolor: String,
    title: String,
    extendedProps: { hashID: String }
  }],
  repeating: { 
    type: Boolean,
    required: true,
    default: false
  },
  repeatingCount: { 
    type: Number 
  },
  repeatingInterval: {
    type: String,
    enum: ["NONE", "WEEK", "YEAR", "DAY", "MONTH"]
  },
  state: { 
    type: String,
    enum: ["PendingAnswers", "PendingNewDate", "Cancelled", "Completed"], // add more
    required: true,
    default: "PendingAnswers"
  },
  created: { 
    type: Date,
    required: true,
    default: Date.now
  },
  attendees: [{ 
    userID: {
      type: ObjectId,
      required: true,
      ref: 'user'
    },
    priority: {
      type: String,
      enum: ["MOST_IMPORTANT", "NORMAL", "NOT_IMPORTANT"],
      required: true,
      default: "NORMAL"
    },
    answerState: {
      type: String,
      enum: ["YES", "NO", "NONE"],
      required: true,
      default: "NONE"
    },
    customAnswer: String
  }],
  creator: {
    type: ObjectId,
    required: true,
    ref: 'user'
  }
})

module.exports = mongoose.model('events', Event, 'events')
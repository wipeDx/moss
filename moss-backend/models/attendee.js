const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

const Attendee = new Schema ({
  user: { 
    type: Objectid,
    required: true,
    ref: 'user'
  },
  priority: { 
    type: String,
    required: true,
    enum: ["Very Important", "Important", "Normal", "Not Important"],
    default: "Normal"
  },
  answer_state: {
    type: String,
    enum: ["Yes", "No", "Maybe", "None"],
    required: true,
    default: "None"
  }
})

module.exports = mongoose.model('attendees', Attendee, 'attendees')
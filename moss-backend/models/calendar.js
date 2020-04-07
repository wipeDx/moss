const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

const Calendar = new mongoose.Schema ({
  name: { 
    type: String,
    required: true
  },
  access_identifier: { 
    type: String,
    required: true
  },
  type: { 
    type: String,
    enum: ["ICS", "Google", "Apple", "Microsoft"],
    required: true
  },
  tokenCreated: {
    type: Date,
    required: true,
    default: new Date(Date.now())
  }
})


module.exports = mongoose.model('calendar', Calendar, 'calendars')
const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var Number = mongoose.Schema.Types.Number;

const User = new mongoose.Schema ({
  email: { 
    type: String,
    required: true,
    unique: true
  },
  name: { 
    type: String
  },
  password: { 
    type: String,
    required: true
  },
  activated: {
    type: Boolean,
    default: false,
    required: true
  },
  activateToken: {
    type: String,
    required: false
  },
  uses2FA: {
    type: Boolean,
    default: false,
    required: true
  },
  otpSecret: {
    type: String
  },
  calendars: [{
    name: {
      type: String,
      required: true
    },
    accessIdentifier: {
      type: Mixed,
      required: true
    },
    type: { 
      type: String,
      enum: ["ICS", "Google", "Apple", "Microsoft"],
      required: true
    }
  }],
  groups: [{
    type: ObjectId,
    ref: 'group'
  }]
})

User.index({ name: 'text', email: 'text' })

module.exports = mongoose.model('user', User, 'users')
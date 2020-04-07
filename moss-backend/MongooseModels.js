const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const Calendars = new Schema ({
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
    }
})

const Event = new Schema ({
  name: { 
    type: String,
    required: true
  },
  startdate: { 
    type: Date,
    required: true
  }, // possible TimeRange?
  enddate: { 
    type: Date,
    required: true
  },
  repeating: { type: Boolean },
  repeating_count: { type: Number },
  state: { 
    type: String,
    enum: ["PendingAnswers", "PendingNewDate", "Cancelled", "Completed"], // add more
    required: true
  },
  created: { 
    type: Date,
    required: true,
    default: Date.now
  },
  attendees: { 
    type: Array,
    required: true
  }
})

const Group = new Schema ({
  name: { 
    type: String,
    required: true
  },
  members: { 
    type: Array,
    required: true
  },
  owner: {
    type: User,
    required: true
  }
})

const Attendee = new Schema ({
  user: { 
    type: User,
    required: true
  },
  priority: { 
    type: String,
    required: true,
    enum: ["Very Important", "Important", "Normal", "Not Important"],
    default: "Normal"
  },
  answerState: {
    type: String,
    enum: ["Yes", "No", "Maybe", "None"],
    required: true,
    default: "None"
  }
})

export default mongoose.model('user', User)
export default mongoose.model('calendars', Calendars)
export default mongoose.model('event', Event)
export default mongoose.model('group', Group)
export default mongoose.model('attendee', Attendee)
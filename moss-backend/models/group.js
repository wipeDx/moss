const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;
const Group = new mongoose.Schema ({
  name: { 
    type: String,
    required: true
  },
  members: [{ 
    type: ObjectId,
    required: true,
    ref: 'user'
  }],
})

module.exports = mongoose.model('group', Group, 'groups')
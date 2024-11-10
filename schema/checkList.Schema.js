const mongoose = require('mongoose');

const checkListSchema = new mongoose.Schema({
  checked: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

module.exports = checkListSchema;

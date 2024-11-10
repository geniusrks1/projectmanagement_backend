const mongoose = require('mongoose');
const checkListSchema = require('./checkList.Schema'); 

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'moderate', 'low'],
      required: true,
    },
    checklists: {
      type: [checkListSchema], 
      required: true,
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: 'Please add at least one checklist',
      },
    },
    status: {
      type: String,
      enum: ['backlog', 'inProgress', 'todo', 'done'],
      default: 'todo',
    },
    dueDate: { type: Date },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: mongoose.ObjectId,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual('isExpired').get(function () {
  if (!this.dueDate) {
    return false;
  }

  return new Date() > this.dueDate;
});

const Task = mongoose.model('Task', taskSchema);

module.exports = {Task};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['backlog', 'to-do', 'in-progress', 'done'],
      default: 'to-do',
    },
    category: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    assignees: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }],
    checklist: {
      type: [String],
      required: true,
    },
    sharedPublicly: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  
  taskSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  const Task = mongoose.model("Task", taskSchema);

module.exports = {
    Task
}
  
 
  
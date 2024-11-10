const express = require("express");
const router = express.Router();
const { Task } = require("../schema/task.schema");
const protectedMiddleware = require("../middleware/auth");
const moment = require('moment');


router.get("/", protectedMiddleware, async (req, res) => { 
  try {
    const { range = 7 } = req.query;
    const today = moment.utc().endOf('day');

    const tasks = await Task.find({
      createdBy: req.user._id,
      createdAt: {
        $lte: today.toDate(),
        $gt: today.clone().subtract(Number(range), 'days').toDate(),
      },
    });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred. Please try again.',
    });
  }
});


router.get("/:taskId", async (req, res) => { 
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }

});



router.post("/", protectedMiddleware, async (req, res) => { 
  try {
    const { title, priority, checklists, dueDate, createdAt, status } = req.body;

    const task = await Task.create({
      title,
      status,
      priority,
      checklists,
      dueDate,
      createdAt,
      createdBy: req.user._id,
    });

    res.status(200).json({
      message: 'success',
      data: { task },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      message: 'Error creating task',
      error: error.message,
    });
  }
});

router.patch("/:taskId", protectedMiddleware, async (req, res) => { 
  try {
    const { taskId } = req.params;
    const { title, priority, checklists, dueDate, status } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, createdBy: req.user._id },
      {
        title,
        priority,
        checklists,
        dueDate,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating task',
      error: error.message,
    });
  }
}
)

router.delete("/:taskId", protectedMiddleware, async (req, res) => { 
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a taskId',
      });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task',
      error: error.message,
    });
  }
}
)


router.get('/analytics', protectedMiddleware,async(req,res)=>{
  try {
    const tasks = await Task.find({ createdBy: req.user._id });

    const status = {
      backlog: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    };

    const priorities = {
      low: 0,
      high: 0,
      moderate: 0,
      due: 0,
    };

    tasks.forEach((el) => {
      status[el.status]++;
      priorities[el.priority]++;
      if (el.isExpired) {
        priorities.due++;
      }
    });

    res.status(200).json({
      status: 'success',
      data: { status, priorities },
    });
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving analytics',
      error: error.message,
    });
  }
})





module.exports = router;

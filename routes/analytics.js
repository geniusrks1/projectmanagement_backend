
const express = require("express");
const router = express.Router();
const { Task } = require("../schema/task.schema");
const protectedMiddleware = require("../middleware/auth");

router.get("/",protectedMiddleware, async (req, res) => { 
    
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
  });

  module.exports = router;

const express = require("express");
const router = express.Router();
const { Task } = require("../schema/task.schema");
const authMiddleware = require("../middleware/auth");
const isAuth = require("../utils/index");


// Create a new task - Only authenticated users
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      title, description, priority, dueDate, 
      status = 'to-do', category, assignees = [], 
      checklist, sharedPublicly = false 
    } = req.body;

    const { user } = req; // Extract authenticated user from middleware

    // Validate required fields
    if (!title || !priority || !checklist.length) {
      return res.status(400).json({
        message: "Title, priority, and checklist are required.",
      });
    }

    // Create a new task instance
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      status,
      category,
      creator: user, // Use authenticated user.id as creator from middleware check
      assignees,
      checklist,
      sharedPublicly,
    });

    // Save task to the database
    await task.save();

    res.status(201).json({
      message: "Task created successfully"
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ 
      message: "Task not created", 
      error: error.message 
    });
  }
});









router.get("/", async (req, res) => {
    const isAuthenticated = isAuth(req);
    const tasks = isAuthenticated ? await Task.find() : await Task.find().select("-_id -creator -assignees");
    res.status(200).json(tasks);
});



router.get("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
})

router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    if (task.creator.toString() !== req.user.toString()) {
        return res.status(401).json({ message: "You are not authorized to delete this task" });
    }
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
});






// router.put("/:id", authMiddleware, async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, logo, position, salary, jobType, remote, location, description, about, skills, information } = req.body;
//         const jobSkills = skills?.split(",").map(skill => skill.trim());
//         let job = await Job.findById(id);
//         if (!job) {
//             return res.status(404).json({ message: "Job not found" });
//         }
//         if (job.creator.toString() !== req.user.toString()) {
//             return res.status(401).json({ message: "You are not authorized to update this job" });
//         }
//         job = await Job.findByIdAndUpdate(id, { name, logo, position, salary, jobType, remote, location, description, about, skills: jobSkills, information }, { new: true });
//         //job.save
//         res.status(200).json(job);
//     }
//     catch (error) {
//         console.log(error);
//         res.status(400).json({ message: "Job not updated" });
//     }

// });



router.put('/:id', authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const { 
          title, description, priority, dueDate, 
          status, category, assignees, checklist, sharedPublicly 
      } = req.body;

      // Find the task by ID
      let task = await Task.findById(id);
      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }

      // Ensure that only the creator can update the task
      if (task.creator.toString() !== req.user.toString()) {
          return res.status(401).json({ message: 'Not authorized to update this task' });
      }

      // Update the task fields
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.status = status || task.status;
      task.category = category || task.category;
      task.assignees = assignees || task.assignees;
      task.checklist = checklist || task.checklist;
      task.sharedPublicly = sharedPublicly !== undefined ? sharedPublicly : task.sharedPublicly;

      // Save the updated task
      await task.save();

      res.status(200).json(task);
  } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Task update failed', error: error.message });
  }
});



module.exports = router;

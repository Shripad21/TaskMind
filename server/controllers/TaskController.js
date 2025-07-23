import Task from '../models/Task.js';
import TaskStreak from '../models/TaskStreak.js';
import UserDailySummary from '../models/UserDailySummary.js';
import mongoose from 'mongoose';

// Helper function to check if a recurring task should be reset
const checkIfShouldReset = (task, now) => {
  if (!task.isCompleted || task.frequency === 'once') {
    return false;
  }

  const completedDate = new Date(task.completedAt);
  
  switch (task.frequency) {
    case 'daily':
      // Reset if completed on a different day
      return completedDate.toDateString() !== now.toDateString();
    
    case 'weekly':
      // Reset if completed 7+ days ago
      const daysDiff = Math.floor((now - completedDate) / (24 * 60 * 60 * 1000));
      return daysDiff >= 7;
    
    case 'monthly':
      // Reset if completed in a different month
      return completedDate.getMonth() !== now.getMonth() || 
             completedDate.getFullYear() !== now.getFullYear();
    
    case 'yearly':
      // Reset if completed in a different year
      return completedDate.getFullYear() !== now.getFullYear();
    
    default:
      return false;
  }
};

// Reset recurring tasks that should be available again
const resetRecurringTasks = async (tasks, userId) => {
  const now = new Date();
  const tasksToUpdate = [];
  const taskIdsToUpdate = [];

  const updatedTasks = tasks.map(task => {
    const shouldReset = checkIfShouldReset(task, now);
    
    if (shouldReset) {
      tasksToUpdate.push({
        _id: task._id,
        oldCompletedAt: task.completedAt
      });
      taskIdsToUpdate.push(task._id);
      
      // Return task with reset completion status
      const updatedTask = { ...task.toObject() };
      updatedTask.isCompleted = false;
      updatedTask.status = 'active';
      delete updatedTask.completedAt;
      
      return updatedTask;
    }
    
    return task;
  });

  // Update database for tasks that should be reset
  if (taskIdsToUpdate.length > 0) {
    try {
      // Update tasks in database
      await Task.updateMany(
        { _id: { $in: taskIdsToUpdate } },
        { 
          isCompleted: false, 
          status: 'active',
          $unset: { completedAt: 1 } 
        }
      );

      // Also need to clean up related data
      await cleanupResetTasks(userId, tasksToUpdate);
      
      console.log(`Reset ${taskIdsToUpdate.length} recurring tasks for user ${userId}`);
    } catch (error) {
      console.error('Error updating recurring tasks:', error);
    }
  }

  return updatedTasks;
};

// Clean up streaks and daily summaries for reset tasks
const cleanupResetTasks = async (userId, tasksToUpdate) => {
  for (const { _id: taskId, oldCompletedAt } of tasksToUpdate) {
    try {
      const completedDate = new Date(oldCompletedAt).toISOString().slice(0, 10);
      
      // Remove from daily summaries (but don't delete the whole summary)
      await UserDailySummary.updateMany(
        { 
          userId, 
          date: completedDate,
          completedTaskIds: taskId 
        },
        { 
          $pull: { completedTaskIds: taskId },
          $inc: { tasksCompleted: -1 }
        }
      );

      // Reset the last completed date in streaks but keep the streak data
      // (You might want different logic here based on your requirements)
      await TaskStreak.updateOne(
        { userId, taskId },
        { 
          $pull: { datesCompleted: completedDate },
          $inc: { currentStreak: -1 }
        }
      );
      
    } catch (error) {
      console.error(`Error cleaning up data for task ${taskId}:`, error);
    }
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, completed, category, priority } = req.query;
    const userId = req.user.userId;
    
    // Build filter object
    let filter = { userId };
    
    if (status) filter.status = status;
    if (completed !== undefined) filter.isCompleted = completed === 'true';
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    let tasks = await Task.find(filter).sort({ createdAt: -1 });
    
    // Reset recurring tasks that should be available again
    tasks = await resetRecurringTasks(tasks, userId);
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
};

// Your existing createTask, updateTask, deleteTask functions remain the same
export const createTask = async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const taskData = {
      ...req.body,
      userId,
      priority: req.body.priority || 'medium',
      status: req.body.status || 'active',
      frequency: req.body.frequency || 'once',
      isCompleted: false
    };

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: "Could not create task" });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: "Could not update task" });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Delete task
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });
    
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Clean up related data (without transaction for now)
    try {
      await TaskStreak.deleteMany({ userId, taskId: id });
      await UserDailySummary.updateMany(
        { userId, completedTaskIds: id },
        { 
          $pull: { completedTaskIds: id },
          $inc: { tasksCompleted: -1 }
        }
      );
    } catch (cleanupError) {
      console.warn('Cleanup error (non-critical):', cleanupError);
    }

    res.json({ message: "Task deleted successfully", taskId: id });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: "Could not delete task" });
  }
};

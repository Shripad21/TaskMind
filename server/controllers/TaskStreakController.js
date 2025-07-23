import TaskStreak from '../models/TaskStreak.js';


export const markTaskCompleteToday = async (req, res) => {
  const { taskId } = req.body;
  const userId = req.user.userId;
  const today = new Date().toISOString().slice(0, 10);

  try {
    let streak = await TaskStreak.findOne({ userId, taskId });

    if (!streak) {
      streak = await TaskStreak.create({
        userId,
        taskId,
        datesCompleted: [today],
        currentStreak: 1,
        lastCompletedDate: today
      });
    } else {
      if (streak.datesCompleted.includes(today)) {
        return res.status(400).json({ error: "Already marked for today" });
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const increment = streak.lastCompletedDate === yesterday;

      streak.datesCompleted.push(today);
      streak.currentStreak = increment ? streak.currentStreak + 1 : 1;
      streak.lastCompletedDate = today;
      await streak.save();
    }

    res.json({ message: "Task marked complete", streak });
  } catch {
    res.status(500).json({ error: "Could not mark task complete" });
  }
};

export const getStreaks = async (req, res) => {
  const userId = req.user.userId;

  try {
    const streaks = await TaskStreak.find({ userId }).sort({ lastCompletedDate: -1 });
    res.json(streaks);
  } catch (error) {
    console.error('Error fetching streaks:', error);
    res.status(500).json({ error: "Could not fetch streaks" });
  }
};
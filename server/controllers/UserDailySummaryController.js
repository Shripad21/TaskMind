import UserDailySummary from '../models/UserDailySummary.js';


export const logDailySummary = async (req, res) => {
  const { taskId } = req.body;
  const userId = req.user.userId;
  const today = new Date().toISOString().slice(0, 10);

  try {
    let summary = await UserDailySummary.findOne({ userId, date: today });

    if (!summary) {
      // Check if yesterday's summary exists to maintain streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      const yesterdaySummary = await UserDailySummary.findOne({ userId, date: yesterdayStr });

      const newStreak = yesterdaySummary ? yesterdaySummary.streakCount + 1 : 1;

      summary = await UserDailySummary.create({
        userId,
        date: today,
        tasksCompleted: 1,
        completedTaskIds: [taskId],
        streakCount: newStreak
      });
    } else {
      if (summary.completedTaskIds.includes(taskId)) {
        return res.status(400).json({ error: "Already logged for this task" });
      }
      summary.completedTaskIds.push(taskId);
      summary.tasksCompleted += 1;
      await summary.save();
    }

    res.json({ message: "Daily task logged", summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not log summary" });
  }
};

export const getDailySummary = async (req, res) => {
  const { date } = req.params;
  const userId = req.user.userId;

  try {
    const summary = await UserDailySummary.findOne({ userId, date });
    
    if (!summary) {
      return res.status(404).json({ 
        error: "No summary found for this date",
        date 
      });
    }

    res.json(summary);
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ error: "Could not fetch daily summary" });
  }
};
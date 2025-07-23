import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useStreaks = () => {
  const [streaks, setStreaks] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStreaks = async () => {
    try {
      setError(null);
      const response = await api.get('/streaks');
      setStreaks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch streaks');
      console.error('Error fetching streaks:', err);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await api.get(`/daily-summary/${today}`);
      setDailySummary(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('No daily summary found for today, creating default');
        setDailySummary({
          date: new Date().toISOString().slice(0, 10),
          tasksCompleted: 0,
          completedTaskIds: [],
          streakCount: 0
        });
      } else {
        console.error('Error fetching daily summary:', err);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStreaks(), fetchDailySummary()]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDeletion = (taskId) => {
    setStreaks(prev => prev.filter(streak => streak.taskId !== taskId));
    fetchDailySummary();
  };

  useEffect(() => {
    fetchData();

    const handleTaskDeleted = (event) => {
      handleTaskDeletion(event.detail.taskId);
    };

    window.addEventListener('taskDeleted', handleTaskDeleted);

    return () => {
      window.removeEventListener('taskDeleted', handleTaskDeleted);
    };
  }, []);

  const markTaskComplete = async (taskId) => {
    try {
      setError(null);
      
      const [streakResponse, summaryResponse] = await Promise.all([
        api.post('/streaks/mark-complete', { taskId }),
        api.post('/daily-summary/log-summary', { taskId })
      ]);
      
      setDailySummary(summaryResponse.data.summary);
      await fetchStreaks();
      
      return {
        streak: streakResponse.data.streak,
        summary: summaryResponse.data.summary
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to mark task complete';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getStreakForTask = (taskId) => {
    return streaks.find(streak => streak.taskId === taskId);
  };

  // FIXED: Only count streaks that are actually active (completed today or yesterday)
  const getTotalActiveStreaks = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return streaks.filter(streak => {
      if (!streak.lastCompletedDate || streak.currentStreak === 0) return false;
      
      const lastCompleted = new Date(streak.lastCompletedDate);
      const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
      
      // Active if completed today (0 days) or yesterday (1 day)
      return daysDiff <= 1;
    }).length;
  };

  // FIXED: Get the actual longest streak ever achieved, not current streak
  const getLongestStreak = () => {
    if (streaks.length === 0) return 0;
    
    // Use longestStreak field if available, otherwise fall back to currentStreak
    return Math.max(...streaks.map(streak => 
      streak.longestStreak !== undefined ? streak.longestStreak : streak.currentStreak
    ));
  };

  // NEW: Get current daily streak (consecutive days of completing any tasks)
  const getCurrentDailyStreak = () => {
    if (!dailySummary) return 0;
    return dailySummary.streakCount || 0;
  };

  // NEW: Calculate streak statistics with proper gap detection
  const getStreakStats = () => {
    const activeStreaks = getTotalActiveStreaks();
    const longestStreak = getLongestStreak();
    const dailyStreak = getCurrentDailyStreak();
    
    // Calculate total completions across all streaks
    const totalCompletions = streaks.reduce((total, streak) => {
      return total + (streak.totalCompletions || 0);
    }, 0);

    return {
      activeStreaks,
      longestStreak,
      dailyStreak,
      totalCompletions,
      totalTasks: streaks.length
    };
  };

  // NEW: Check if a streak is broken (has gaps)
  const isStreakBroken = (streak) => {
    if (!streak.lastCompletedDate) return true;
    
    const today = new Date();
    const lastCompleted = new Date(streak.lastCompletedDate);
    const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
    
    // Streak is broken if more than 1 day has passed since last completion
    return daysDiff > 1;
  };

  // NEW: Get only currently active (non-broken) streaks
  const getActiveStreaks = () => {
    return streaks.filter(streak => 
      streak.currentStreak > 0 && !isStreakBroken(streak)
    );
  };

  return {
    streaks,
    dailySummary,
    loading,
    error,
    markTaskComplete,
    getStreakForTask,
    getTotalActiveStreaks,
    getLongestStreak,
    getCurrentDailyStreak,
    getStreakStats,
    getActiveStreaks,
    isStreakBroken,
    refetch: fetchData
  };
};

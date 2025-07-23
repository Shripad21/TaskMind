import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useStreaks } from '../hooks/useStreaks';

const Analytics = () => {
  const { tasks, loading } = useTasks();
  const { streaks, dailySummary } = useStreaks();
  const [timeFilter, setTimeFilter] = useState('7'); // 7 days, 30 days, 90 days

  const analytics = useMemo(() => {
    if (!tasks.length) return null;

    const now = new Date();
    const filterDays = parseInt(timeFilter);
    const filterDate = new Date(now.getTime() - (filterDays * 24 * 60 * 60 * 1000));

    // Filter tasks by date
    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) >= filterDate
    );

    const completedTasks = tasks.filter(task => task.isCompleted);
    const recentCompleted = completedTasks.filter(task => 
      task.completedAt && new Date(task.completedAt) >= filterDate
    );

    // Calculate completion rate
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Priority distribution
    const priorityStats = {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
    };

    // Category distribution
    const categoryStats = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Frequency distribution
    const frequencyStats = {
      once: tasks.filter(task => task.frequency === 'once').length,
      daily: tasks.filter(task => task.frequency === 'daily').length,
      weekly: tasks.filter(task => task.frequency === 'weekly').length,
      monthly: tasks.filter(task => task.frequency === 'monthly').length,
      yearly: tasks.filter(task => task.frequency === 'yearly').length,
    };

    // Overdue tasks
    const overdueTasks = tasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < now && !task.isCompleted;
    });

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: tasks.length - completedTasks.length,
      completionRate,
      recentTasks: recentTasks.length,
      recentCompleted: recentCompleted.length,
      overdueTasks: overdueTasks.length,
      priorityStats,
      categoryStats,
      frequencyStats,
    };
  }, [tasks, timeFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📊</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Create some tasks to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Insights into your productivity and task completion patterns
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{analytics.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-purple-600">{dailySummary?.streakCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.priorityStats).map(([priority, count]) => {
              const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
              const colorClass = priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${colorClass} rounded-full mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 ${colorClass} rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Frequency</h3>
          <div className="space-y-4">
            {Object.entries(analytics.frequencyStats)
              .filter(([, count]) => count > 0)
              .map(([frequency, count]) => {
              const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
              
              return (
                <div key={frequency} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{frequency}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-4">
            {Object.entries(analytics.categoryStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => {
              const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Tasks Created</p>
                <p className="text-xs text-gray-500">Last {timeFilter} days</p>
              </div>
              <span className="text-lg font-bold text-blue-600">{analytics.recentTasks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Tasks Completed</p>
                <p className="text-xs text-gray-500">Last {timeFilter} days</p>
              </div>
              <span className="text-lg font-bold text-green-600">{analytics.recentCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4">📈 Productivity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-indigo-800">
          <div>
            <h4 className="font-medium mb-2">Task Completion Trends</h4>
            <p>
              {analytics.completionRate >= 80 
                ? "Excellent! You're completing most of your tasks."
                : analytics.completionRate >= 60 
                  ? "Good progress! Consider breaking down larger tasks."
                  : "Room for improvement. Try setting more realistic goals."
              }
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Priority Balance</h4>
            <p>
              {analytics.priorityStats.high > analytics.priorityStats.low
                ? "You're handling many high-priority tasks. Great focus!"
                : "Consider adding more high-impact activities to your workflow."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

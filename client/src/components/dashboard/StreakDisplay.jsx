import React from 'react';

const StreakDisplay = ({ streaks }) => {
  if (!streaks || streaks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔥 Your Streaks
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-sm">No active streaks yet</p>
          <p className="text-xs text-gray-400">Complete tasks to build streaks!</p>
        </div>
      </div>
    );
  }

  const activeStreaks = streaks.filter(streak => streak.currentStreak > 0);
  const longestStreak = Math.max(...streaks.map(streak => streak.currentStreak));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔥 Your Streaks
      </h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">Active Streaks</p>
          <p className="text-2xl font-bold text-orange-600">{activeStreaks.length}</p>
        </div> */}
        {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">Longest Streak</p>
          <p className="text-2xl font-bold text-purple-600">{longestStreak}</p>
        </div> */}
      </div>

      {/* Individual Streaks */}
      <div className="space-y-3">
        {activeStreaks.slice(0, 5).map((streak, index) => (
          <div key={streak._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">{streak.currentStreak}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Task Streak</p>
                <p className="text-xs text-gray-500">
                  Last completed: {streak.lastCompletedDate || 'Today'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(streak.currentStreak, 5))].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-orange-400 rounded-full"></div>
              ))}
              {streak.currentStreak > 5 && (
                <span className="text-xs text-gray-500 ml-1">+{streak.currentStreak - 5}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeStreaks.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all streaks ({activeStreaks.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;

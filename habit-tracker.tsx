import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Award, TrendingUp, Target } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitTracker');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habitTracker', JSON.stringify(habits));
  }, [habits]);

  // Calculate current streak for a habit
  const calculateCurrentStreak = (completions) => {
    if (!completions.length) return 0;
    
    const sortedDates = completions.sort((a, b) => new Date(b) - new Date(a));
    const today = getTodayString();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = currentDate.toISOString().split('T')[0];
      if (sortedDates[i] === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0 && sortedDates[i] !== today) {
        // If today is not completed, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayString = currentDate.toISOString().split('T')[0];
        if (sortedDates[i] === yesterdayString) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate best streak for a habit
  const calculateBestStreak = (completions) => {
    if (!completions.length) return 0;
    
    const sortedDates = completions.sort((a, b) => new Date(a) - new Date(b));
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  // Add new habit
  const addHabit = () => {
    if (!newHabit.trim()) return;
    
    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      createdDate: getTodayString(),
      completions: []
    };
    
    setHabits([...habits, habit]);
    setNewHabit('');
    setShowAddForm(false);
  };

  // Delete habit
  const deleteHabit = (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  // Toggle habit completion for today
  const toggleCompletion = (id) => {
    const today = getTodayString();
    
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const completions = habit.completions || [];
        const isCompleted = completions.includes(today);
        
        return {
          ...habit,
          completions: isCompleted 
            ? completions.filter(date => date !== today)
            : [...completions, today]
        };
      }
      return habit;
    }));
  };

  // Check if habit is completed today
  const isCompletedToday = (habit) => {
    return habit.completions?.includes(getTodayString()) || false;
  };

  // Calculate weekly completion rate
  const getWeeklyCompletionRate = (habit) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    
    let completedDays = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      if (habit.completions?.includes(dateString)) {
        completedDays++;
      }
    }
    
    return Math.round((completedDays / 7) * 100);
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">Habit Tracker</h1>
          <div className="flex items-center justify-center text-purple-700 text-lg">
            <Calendar className="w-5 h-5 mr-2" />
            {today}
          </div>
        </div>

        {/* Add Habit Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Habit
            </button>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="Enter habit name..."
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={addHabit}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-colors duration-200"
                >
                  Add Habit
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewHabit('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-12 text-center">
            <div className="text-purple-300 mb-4">
              <Target className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">No habits yet</h3>
            <p className="text-purple-600">Add your first habit to get started on your journey!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => {
              const currentStreak = calculateCurrentStreak(habit.completions || []);
              const bestStreak = calculateBestStreak(habit.completions || []);
              const weeklyRate = getWeeklyCompletionRate(habit);
              const completed = isCompletedToday(habit);

              return (
                <div
                  key={habit.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 p-6 ${
                    completed 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-purple-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => toggleCompletion(habit.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            completed
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-purple-300 hover:border-purple-500'
                          }`}
                        >
                          {completed && <span className="text-sm">✓</span>}
                        </button>
                        <h3 className={`text-lg font-semibold ${
                          completed ? 'text-purple-800' : 'text-gray-800'
                        }`}>
                          {habit.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-purple-600 mb-1">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">CURRENT</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-800">{currentStreak}</div>
                          <div className="text-xs text-purple-600">day{currentStreak !== 1 ? 's' : ''}</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center text-purple-600 mb-1">
                            <Award className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">BEST</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-800">{bestStreak}</div>
                          <div className="text-xs text-purple-600">day{bestStreak !== 1 ? 's' : ''}</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center text-purple-600 mb-1">
                            <Target className="w-4 h-4 mr-1" />
                            <span className="text-xs font-medium">THIS WEEK</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-800">{weeklyRate}%</div>
                          <div className="text-xs text-purple-600">complete</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-purple-500 text-sm">
          Built with 💜 for consistent growth
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
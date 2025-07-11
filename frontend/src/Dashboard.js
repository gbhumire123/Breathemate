import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user] = useState({ name: 'Geetheswar' });
  const [todayProgress] = useState(75);
  const [recentSessions] = useState([
    { id: 1, date: '2024-07-12', duration: '5 min', score: 87 },
    { id: 2, date: '2024-07-11', duration: '3 min', score: 82 },
    { id: 3, date: '2024-07-10', duration: '8 min', score: 90 }
  ]);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const quickActions = [
    { name: 'Record Breath', path: '/record', icon: '🎤', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'View Journal', path: '/journal', icon: '📝', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Check Reports', path: '/reports', icon: '📊', color: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'Settings', path: '/settings', icon: '⚙️', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">BreatheMate Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-cyan-400 text-sm font-medium mb-2">Today's Progress</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-700 rounded-full h-3">
                <div
                  className="bg-cyan-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              <span className="text-white font-bold">{todayProgress}%</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-cyan-400 text-sm font-medium mb-2">Weekly Sessions</h3>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-green-400 text-sm">+3 from last week</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-cyan-400 text-sm font-medium mb-2">Average Score</h3>
            <p className="text-2xl font-bold text-white">86</p>
            <p className="text-green-400 text-sm">Excellent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className={`${action.color} p-6 rounded-lg text-white font-medium transition-colors text-center`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div>{action.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Recent Sessions</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            {recentSessions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <p className="text-gray-400">No recent sessions</p>
                <p className="text-gray-500 text-sm mt-2">Start your first breathing session to see activity here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {recentSessions.map((session, index) => (
                  <div key={session.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">Breathing Session</p>
                        <p className="text-gray-400 text-sm">{session.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Duration</p>
                        <p className="text-white font-medium">{session.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Score</p>
                        <p className={`font-bold ${
                          session.score >= 85 ? 'text-green-400' : 
                          session.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {session.score}
                        </p>
                      </div>
                      <button className="text-cyan-400 hover:text-cyan-300 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-cyan-400 font-medium mb-4">💡 Today's Health Tip</h3>
          <p className="text-gray-300">
            Practice the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7 counts, 
            and exhale for 8 counts. This can help reduce stress and improve sleep quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
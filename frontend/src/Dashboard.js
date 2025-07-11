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

  const quickActions = [
    { name: 'Record Breath', path: '/record-breath', icon: '🎤', color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'View Journal', path: '/journal', icon: '📝', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Check Reports', path: '/report', icon: '📊', color: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'Settings', path: '/settings', icon: '⚙️', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-400/20">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-300">
          Ready to track your breathing health today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-3">Today's Progress</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <span className="text-white font-bold text-lg">{todayProgress}%</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Daily breathing goal</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-3">Weekly Sessions</h3>
          <p className="text-3xl font-bold text-white">12</p>
          <p className="text-green-400 text-sm mt-1">+3 from last week</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-3">Average Score</h3>
          <p className="text-3xl font-bold text-white">86</p>
          <p className="text-green-400 text-sm mt-1">Excellent progress!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className={`${action.color} p-6 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg transform`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <div className="text-sm font-semibold">{action.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Recent Sessions</h2>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {recentSessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-400 text-lg">No recent sessions</p>
              <p className="text-gray-500 text-sm mt-2">Start your first breathing session to see activity here</p>
              <button 
                onClick={() => navigate('/record-breath')}
                className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Start Recording
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentSessions.map((session, index) => (
                <div key={session.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-semibold">Breathing Session</p>
                        <p className="text-gray-400 text-sm">{session.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
                        <p className="text-white font-semibold">{session.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Score</p>
                        <p className={`font-bold text-lg ${
                          session.score >= 85 ? 'text-green-400' : 
                          session.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {session.score}
                        </p>
                      </div>
                      <button className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
        <div className="flex items-start space-x-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-purple-400 font-semibold mb-2">Today's Health Tip</h3>
            <p className="text-gray-300 leading-relaxed">
              Practice the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7 counts, 
              and exhale for 8 counts. This can help reduce stress and improve sleep quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
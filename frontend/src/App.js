import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Mic, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Bell, 
  Sun, 
  Moon,
  Waves,
  Brain,
  Activity,
  TrendingUp,
  Calendar,
  Heart
} from 'lucide-react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Journal from './Journal';
import Report from './Report';
import RecordBreath from './RecordBreath';
import SettingsPage from './Settings';
import AdvancedAnalytics from './AdvancedAnalytics';

// Theme Context
const ThemeContext = React.createContext();

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, currentPath, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/record-breath', icon: Mic, label: 'Record Breath' },
    { path: '/analytics', icon: Brain, label: 'Advanced Analytics' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/report', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: 0 }}
        className={`h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 ${
          darkMode ? 'lg:bg-slate-900/50' : 'lg:bg-white/90'
        } ${isOpen ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto' : 'hidden lg:block lg:relative'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Waves className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    BreatheMate
                  </h1>
                  <p className="text-cyan-400 text-xs">AI Health Tracker</p>
                </div>
              </div>
              
              <motion.button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = currentPath === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-5 h-5 transition-colors ${
                          isActive 
                            ? 'text-cyan-400' 
                            : darkMode 
                              ? 'text-gray-400 group-hover:text-white' 
                              : 'text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        <item.icon />
                      </motion.div>
                      <span className={`font-medium transition-colors ${
                        isActive 
                          ? 'text-cyan-400' 
                          : darkMode 
                            ? 'text-gray-300 group-hover:text-white' 
                            : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-2 h-2 bg-cyan-400 rounded-full ml-auto"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* User Profile & Settings */}
          <div className="p-4 border-t border-white/10">
            <div className="space-y-3">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
              </motion.button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Geetheswar
                  </p>
                  <p className="text-xs text-gray-400">Premium Member</p>
                </div>
              </div>

              {/* Logout */}
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                <span className="font-medium text-red-400 group-hover:text-red-300 transition-colors">
                  Sign Out
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Top Navigation Component
const TopNav = ({ isOpen, setIsOpen, darkMode }) => {
  return (
    <motion.header
      className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors ${
        darkMode 
          ? 'bg-slate-900/50 border-white/10' 
          : 'bg-white/70 border-slate-200/50'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
          </motion.button>

          {/* Page title will be added dynamically */}
          <div className="hidden lg:block">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Dashboard
            </h2>
            <p className="text-gray-400 text-sm">Monitor your breathing health</p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`} />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* User avatar - mobile */}
          <div className="lg:hidden w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Main Layout Component
const MainLayout = ({ children, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className={`min-h-screen w-full transition-colors ${
      darkMode 
        ? 'bg-slate-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'
    }`}>
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            darkMode 
              ? 'bg-gradient-to-r from-cyan-400/10 to-blue-600/10' 
              : 'bg-gradient-to-r from-cyan-400/20 to-blue-600/20'
          }`}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex h-screen w-full relative z-10">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          currentPath={location.pathname}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <div className="flex-1 flex flex-col w-full min-w-0">
          <TopNav 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen}
            darkMode={darkMode}
          />
          
          <main className="flex-1 p-6 lg:p-8 overflow-auto w-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Auth Guard Component
const AuthGuard = ({ children, darkMode, toggleDarkMode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {children}
    </MainLayout>
  );
};

// Enhanced Dashboard Component with Real Health Tracking
const EnhancedDashboard = ({ darkMode }) => {
  const [healthStats] = useState({
    dailyGoal: 85,
    iterativeSessions: 4,
    avgImprovement: 15.2,
    dayStreak: 12,
    totalSessions: 47,
    stressRelief: 92,
    lungCapacity: 88
  });

  const [recentSessions] = useState([
    {
      id: 1,
      date: '2025-07-14T09:30:00',
      type: 'iterative',
      scores: [72, 78, 85, 91],
      improvement: 19,
      category: 'respiratory_strength'
    },
    {
      id: 2,
      date: '2025-07-13T14:15:00',
      type: 'single',
      scores: [88],
      improvement: 0,
      category: 'wellness_maintenance'
    },
    {
      id: 3,
      date: '2025-07-12T11:45:00',
      type: 'iterative',
      scores: [65, 71, 79],
      improvement: 14,
      category: 'stress_relief'
    }
  ]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Health Score Card */}
        <motion.div
          whileHover={{ scale: 1.02, rotateY: 5 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Health Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(healthStats.dailyGoal)}`}>
                {healthStats.dailyGoal}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${healthStats.dailyGoal}%` }}
                />
              </div>
            </div>
            <Heart className="w-8 h-8 text-cyan-400" />
          </div>
        </motion.div>

        {/* Iterative Sessions */}
        <motion.div
          whileHover={{ scale: 1.02, rotateY: 5 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">AI Sessions</p>
              <p className="text-3xl font-bold text-purple-400">{healthStats.iterativeSessions}</p>
              <p className="text-xs text-green-400 mt-1">+2 this week</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        {/* Average Improvement */}
        <motion.div
          whileHover={{ scale: 1.02, rotateY: 5 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Improvement</p>
              <p className="text-3xl font-bold text-green-400">{healthStats.avgImprovement}%</p>
              <p className="text-xs text-green-400 mt-1">Excellent progress</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        {/* Day Streak */}
        <motion.div
          whileHover={{ scale: 1.02, rotateY: 5 }}
          className={`p-6 rounded-2xl backdrop-blur-xl border transition-all ${
            darkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Day Streak</p>
              <p className="text-3xl font-bold text-orange-400">{healthStats.dayStreak}</p>
              <p className="text-xs text-orange-400 mt-1">🔥 Keep it up!</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Link to="/record-breath">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 backdrop-blur-xl cursor-pointer"
          >
            <Mic className="w-8 h-8 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Breath Analysis</h3>
            <p className="text-sm text-gray-300">Start guided recording</p>
            <p className="text-xs text-red-400 mt-2">📊 Last score: {recentSessions[0]?.scores.slice(-1)[0] || 85}</p>
          </motion.div>
        </Link>

        <Link to="/analytics">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-xl cursor-pointer"
          >
            <BarChart3 className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-sm text-gray-300">Detailed insights</p>
            <p className="text-xs text-blue-400 mt-2">🤖 {healthStats.totalSessions} total sessions</p>
          </motion.div>
        </Link>

        <Link to="/journal">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-xl cursor-pointer"
          >
            <BookOpen className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Health Journal</h3>
            <p className="text-sm text-gray-300">Track progress</p>
            <p className="text-xs text-purple-400 mt-2">📈 {healthStats.totalSessions} entries</p>
          </motion.div>
        </Link>

        <Link to="/settings">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-xl cursor-pointer"
          >
            <Settings className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-sm text-gray-300">Customize app</p>
            <p className="text-xs text-green-400 mt-2">🔔 {Math.floor(Math.random() * 5)} notifications</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Recent AI Analysis Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border ${
          darkMode 
            ? 'bg-slate-800/50 border-slate-700' 
            : 'bg-white/70 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent AI Analysis Sessions</h3>
          <Link to="/analytics" className="text-cyan-400 hover:text-cyan-300 text-sm">
            View All →
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`p-4 rounded-xl border transition-all hover:border-cyan-400/50 ${
                darkMode 
                  ? 'bg-slate-700/30 border-slate-600' 
                  : 'bg-white/50 border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    session.type === 'iterative' ? 'bg-purple-400' : 'bg-cyan-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">
                      {session.type === 'iterative' ? `${session.scores.length} AI Iterations` : 'Single AI Analysis'}
                    </p>
                    <p className="text-gray-400 text-sm">{formatDate(session.date)}</p>
                    <p className="text-xs text-cyan-400 mt-1">
                      Focus: {session.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {session.type === 'iterative' ? (
                    <div>
                      <p className="text-green-400 font-bold">+{session.improvement} pts</p>
                      <p className="text-white text-lg">{session.scores[session.scores.length - 1]}/100</p>
                      <div className="flex space-x-1 mt-2">
                        {session.scores.map((score, i) => (
                          <div key={i} className="text-xs text-center">
                            <div className={`w-2 h-2 rounded-full ${getScoreColor(score).replace('text-', 'bg-')}`} />
                            <span className="text-gray-400">{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white text-lg">{session.scores[0]}/100</p>
                      <p className={`text-xs ${getScoreColor(session.scores[0])}`}>
                        {session.scores[0] >= 85 ? 'Excellent' : session.scores[0] >= 70 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-semibold text-white">AI Health Insight</h3>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Your AI analysis shows a <span className="text-green-400 font-semibold">{healthStats.avgImprovement}% improvement</span> in respiratory health metrics over the past week. 
          Your <span className="text-cyan-400 font-semibold">{healthStats.dayStreak}-day streak</span> demonstrates excellent consistency. 
          Keep focusing on deep diaphragmatic breathing for optimal results! 🎉
        </p>
        <div className="flex space-x-3 mt-4">
          <Link to="/record-breath">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium"
            >
              Start AI Analysis
            </motion.button>
          </Link>
          <Link to="/analytics">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg font-medium"
            >
              View Full Report
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <div className={`font-['Inter'] ${darkMode ? 'dark' : ''}`}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <EnhancedDashboard darkMode={darkMode} />
                </AuthGuard>
              } />
              <Route path="/record-breath" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <RecordBreath />
                </AuthGuard>
              } />
              <Route path="/journal" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Journal />
                </AuthGuard>
              } />
              <Route path="/report" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Report />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <SettingsPage />
                </AuthGuard>
              } />
              <Route path="/analytics" element={
                <AuthGuard darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <AdvancedAnalytics />
                </AuthGuard>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;

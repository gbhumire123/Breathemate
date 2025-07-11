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
  Waves
} from 'lucide-react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Journal from './Journal';
import Report from './Report';
import RecordBreath from './RecordBreath';

// Theme Context
const ThemeContext = React.createContext();

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, currentPath, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/record-breath', icon: Mic, label: 'Record Breath' },
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
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 lg:relative lg:translate-x-0 lg:z-auto ${
          darkMode ? 'lg:bg-slate-900/50' : 'lg:bg-white/90'
        }`}
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
    <div className={`min-h-screen transition-colors ${
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

      <div className="flex relative z-10">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          currentPath={location.pathname}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <div className="flex-1 flex flex-col">
          <TopNav 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen}
            darkMode={darkMode}
          />
          
          <main className="flex-1 p-6 lg:p-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
                  <Dashboard />
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
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;

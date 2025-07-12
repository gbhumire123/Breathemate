import React, { useState, useEffect } from 'react';
import './App.css';

// Circular Progress Component matching Expo app
const CircularProgress: React.FC<{ percentage: number; size?: number; color?: string }> = ({ 
  percentage, 
  size = 80, 
  color = '#00ffff' 
}) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 255, 255, 0.1)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="progress-text" style={{ color }}>
        {percentage}%
      </div>
    </div>
  );
};

// Dashboard Component matching Expo app exactly
const Dashboard: React.FC<{ userName: string; onLogout: () => void }> = ({ userName, onLogout }) => {
  const [healthStats] = useState({
    dailyGoal: 75,
    weeklySessions: 12,
    averageScore: 86,
    streak: 5,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentSessions = [
    { time: '2 hours ago', score: 92, status: 'Excellent' },
    { time: 'Yesterday', score: 78, status: 'Good' },
    { time: '2 days ago', score: 85, status: 'Very Good' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header matching Expo app */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1 className="greeting">{getGreeting()}, {userName}! 👋</h1>
            <p className="subtitle">Ready to check your breathing health?</p>
          </div>
          <button className="profile-button logout-btn" onClick={onLogout}>
            <div className="profile-gradient">
              🚪
            </div>
          </button>
        </div>
      </div>

      {/* Health Overview matching Expo app */}
      <div className="overview-container">
        <h2 className="section-title">Health Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <CircularProgress percentage={healthStats.dailyGoal} size={70} />
            <p className="stat-label">Daily Goal</p>
            <p className="stat-value">{healthStats.dailyGoal}%</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container">
              📅
            </div>
            <p className="stat-label">Weekly Sessions</p>
            <p className="stat-value">{healthStats.weeklySessions}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container">
              📈
            </div>
            <p className="stat-label">Average Score</p>
            <p className="stat-value">{healthStats.averageScore}</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon-container">
              🔥
            </div>
            <p className="stat-label">Day Streak</p>
            <p className="stat-value">{healthStats.streak}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions matching Expo app */}
      <div className="quick-actions-container">
        <h2 className="section-title">Quick Actions</h2>
        
        <div className="action-grid">
          <div className="action-card record-action">
            <div className="action-gradient cyan-gradient">
              🎤
              <h3 className="action-title">Record Breath</h3>
              <p className="action-subtitle">Start a new analysis</p>
            </div>
          </div>

          <div className="action-card journal-action">
            <div className="action-gradient green-gradient">
              📖
              <h3 className="action-title">View Journal</h3>
              <p className="action-subtitle">Track your progress</p>
            </div>
          </div>

          <div className="action-card reports-action">
            <div className="action-gradient red-gradient">
              📊
              <h3 className="action-title">Check Reports</h3>
              <p className="action-subtitle">View health insights</p>
            </div>
          </div>

          <div className="action-card settings-action">
            <div className="action-gradient purple-gradient">
              ⚙️
              <h3 className="action-title">Settings</h3>
              <p className="action-subtitle">Customize your app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity matching Expo app */}
      <div className="recent-container">
        <h2 className="section-title">Recent Sessions</h2>
        
        <div className="session-list">
          {recentSessions.map((session, index) => (
            <div key={index} className="session-card">
              <div className="session-icon">
                <span style={{ color: session.score >= 80 ? '#00ff88' : '#ffaa00' }}>
                  💓
                </span>
              </div>
              <div className="session-details">
                <p className="session-time">{session.time}</p>
                <p className="session-status">{session.status}</p>
              </div>
              <div className="session-score">
                <span className="session-score-text">{session.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tip matching Expo app */}
      <div className="tip-container">
        <div className="tip-gradient">
          <div className="tip-icon">💡</div>
          <h3 className="tip-title">Today's Health Tip</h3>
          <p className="tip-text">
            Practice deep breathing exercises for 5 minutes each morning to improve your lung capacity and reduce stress.
          </p>
        </div>
      </div>
    </div>
  );
};

// Record Component with Media Upload functionality
const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'completed' | 'uploaded'>('idle');

  // Recording timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setRecordingStatus('recording');
    setUploadedFile(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingStatus('completed');
    // Simulate recording completion
    setTimeout(() => {
      alert('Recording completed! Analysis will be processed.');
    }, 500);
  };

  const handleFileUpload = (file: File) => {
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setUploadedFile(file);
      setRecordingStatus('uploaded');
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      alert('Please upload an audio or video file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleAnalyze = () => {
    if (recordingStatus === 'completed' || recordingStatus === 'uploaded') {
      alert('Analyzing breathing pattern... Results will be available in your journal.');
      setRecordingStatus('idle');
      setUploadedFile(null);
      setRecordingTime(0);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎤 Record Breath</h1>
        <p className="page-subtitle">Start your breathing analysis</p>
      </div>

      <div className="record-main">
        <div className={`record-circle ${isRecording ? 'recording' : ''} ${recordingStatus === 'completed' ? 'completed' : ''} ${recordingStatus === 'uploaded' ? 'uploaded' : ''}`}>
          <div className="record-inner-circle">
            <div className="record-icon">
              {isRecording ? '⏸️' : recordingStatus === 'completed' ? '✅' : recordingStatus === 'uploaded' ? '📁' : '🎤'}
            </div>
            {isRecording && (
              <div className="recording-timer">{formatTime(recordingTime)}</div>
            )}
          </div>
        </div>
        
        <div className="record-controls">
          {recordingStatus === 'idle' && (
            <button className="record-button-main" onClick={handleStartRecording}>
              <div className="record-gradient">
                Start Recording
              </div>
            </button>
          )}
          
          {isRecording && (
            <button className="record-button-main stop-button" onClick={handleStopRecording}>
              <div className="stop-gradient">
                Stop Recording
              </div>
            </button>
          )}

          {(recordingStatus === 'completed' || recordingStatus === 'uploaded') && (
            <button className="record-button-main analyze-button" onClick={handleAnalyze}>
              <div className="analyze-gradient">
                Analyze Recording
              </div>
            </button>
          )}
          
          <p className="record-instructions">
            {isRecording ? 'Recording in progress... Breathe naturally and keep the device steady.' :
             recordingStatus === 'completed' ? 'Recording completed! Click analyze to process your breathing pattern.' :
             recordingStatus === 'uploaded' ? `File "${uploadedFile?.name}" uploaded successfully!` :
             'Tap to start recording your breathing pattern or upload an existing audio file.'}
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <h3 className="upload-title">Or Upload Audio File</h3>
        
        <div 
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'file-uploaded' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="file-input"
            accept="audio/*,video/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="upload-label">
            {uploadedFile ? (
              <>
                <span className="upload-icon">📁</span>
                <span className="upload-text">{uploadedFile.name}</span>
                <span className="upload-subtext">File uploaded successfully</span>
              </>
            ) : (
              <>
                <span className="upload-icon">📤</span>
                <span className="upload-text">
                  {dragActive ? 'Drop your file here' : 'Click to upload or drag & drop'}
                </span>
                <span className="upload-subtext">Supports audio and video files</span>
              </>
            )}
          </label>
        </div>

        {uploadedFile && (
          <div className="file-info">
            <div className="file-details">
              <span className="file-name">📎 {uploadedFile.name}</span>
              <span className="file-size">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button 
              className="remove-file-btn"
              onClick={() => {
                setUploadedFile(null);
                setRecordingStatus('idle');
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="record-tips">
        <h3 className="tips-title">Recording Tips</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-emoji">🤫</span>
            <p>Find a quiet environment</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">📱</span>
            <p>Hold device steady</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">😌</span>
            <p>Breathe naturally</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">⏱️</span>
            <p>Record for 30 seconds</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">📤</span>
            <p>Upload existing files</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">🎵</span>
            <p>Audio/video formats supported</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Journal Component matching Expo app
const Journal = () => (
  <div className="page-container">
    <div className="page-header">
      <h1 className="page-title">📖 Health Journal</h1>
      <p className="page-subtitle">Track your breathing journey</p>
    </div>

    <div className="journal-stats">
      <div className="journal-stat-card">
        <div className="stat-icon">📈</div>
        <div className="stat-info">
          <h3>Progress Trend</h3>
          <p className="stat-value">+12% this week</p>
        </div>
      </div>
      
      <div className="journal-stat-card">
        <div className="stat-icon">🎯</div>
        <div className="stat-info">
          <h3>Goals Achieved</h3>
          <p className="stat-value">8 out of 10</p>
        </div>
      </div>
    </div>

    <div className="journal-entries">
      <h3 className="section-title">Recent Entries</h3>
      
      {[
        { date: 'Today', score: 92, notes: 'Feeling great after morning exercise' },
        { date: 'Yesterday', score: 78, notes: 'Slightly tired, but breathing improved' },
        { date: '2 days ago', score: 85, notes: 'Good session, very relaxed' },
      ].map((entry, index) => (
        <div key={index} className="journal-entry">
          <div className="entry-date">
            <span className="date-text">{entry.date}</span>
            <span className="score-badge">{entry.score}</span>
          </div>
          <p className="entry-notes">{entry.notes}</p>
        </div>
      ))}
    </div>
  </div>
);

// Settings Component matching Expo app
const Settings = () => (
  <div className="page-container">
    <div className="page-header">
      <h1 className="page-title">⚙️ Settings</h1>
      <p className="page-subtitle">Customize your experience</p>
    </div>

    <div className="settings-sections">
      <div className="settings-section">
        <h3 className="settings-section-title">Account</h3>
        <div className="settings-item">
          <span className="settings-icon">👤</span>
          <span className="settings-label">Profile Settings</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item">
          <span className="settings-icon">🔒</span>
          <span className="settings-label">Privacy & Security</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Preferences</h3>
        <div className="settings-item">
          <span className="settings-icon">🔔</span>
          <span className="settings-label">Notifications</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item">
          <span className="settings-icon">🎨</span>
          <span className="settings-label">Appearance</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Support</h3>
        <div className="settings-item">
          <span className="settings-icon">❓</span>
          <span className="settings-label">Help & FAQ</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item">
          <span className="settings-icon">📧</span>
          <span className="settings-label">Contact Support</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>
    </div>
  </div>
);

// Login Component matching Expo app exactly
const Login: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'demo@breathemate.com' && password === 'demo123') {
      onLogin(email);
    } else {
      alert('Please use demo credentials: demo@breathemate.com / demo123');
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@breathemate.com');
    setPassword('demo123');
    onLogin('demo@breathemate.com');
  };

  return (
    <div className="login-container">
      {/* Logo matching Expo app */}
      <div className="logo-container">
        <div className="logo-icon">💓</div>
        <h1 className="logo-text">BreatheMate</h1>
        <p className="tagline">AI-Powered Lung Health Tracker</p>
      </div>

      {/* Login Form matching Expo app */}
      <div className="form-container">
        <h2 className="welcome-text">Welcome Back!</h2>
        
        <div className="input-container">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Email Address"
            className="text-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-container">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-button" onClick={handleLogin}>
          <div className="login-gradient">
            Sign In
          </div>
        </button>
      </div>

      {/* Demo Credentials matching Expo app */}
      <div className="demo-container">
        <h3 className="demo-title">Demo Credentials:</h3>
        <p className="demo-text">Email: demo@breathemate.com</p>
        <p className="demo-text">Password: demo123</p>
        <button className="demo-login-button" onClick={handleDemoLogin}>
          Quick Demo Login
        </button>
      </div>
    </div>
  );
};

// Main App Component with bottom navigation matching Expo app
function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('User');

  const handleLogin = (email: string) => {
    const name = email.split('@')[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserName('User');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard userName={userName} onLogout={handleLogout} />;
      case 'record': 
        return <Record />;
      case 'journal': 
        return <Journal />;
      case 'settings': 
        return <Settings />;
      default: 
        return <Dashboard userName={userName} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="app">
      <main className="main-content">
        {renderPage()}
      </main>
      
      {/* Bottom Navigation matching Expo app */}
      {isLoggedIn && (
        <nav className="bottom-nav">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`nav-tab ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentPage('record')}
            className={`nav-tab ${currentPage === 'record' ? 'active' : ''}`}
          >
            <span className="nav-icon">🎤</span>
            <span className="nav-label">Record</span>
          </button>
          <button 
            onClick={() => setCurrentPage('journal')}
            className={`nav-tab ${currentPage === 'journal' ? 'active' : ''}`}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">Journal</span>
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className={`nav-tab ${currentPage === 'settings' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;

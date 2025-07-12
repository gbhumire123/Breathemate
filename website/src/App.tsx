import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Animated Waveform Component
const AnimatedWaveform: React.FC<{ isActive: boolean; intensity?: number }> = ({ isActive, intensity = 1 }) => {
  const bars = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="waveform-container">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`waveform-bar ${isActive ? 'active' : ''}`}
          style={{
            animationDelay: `${bar * 0.1}s`,
            height: isActive ? `${Math.random() * 60 * intensity + 20}px` : '8px',
          }}
        />
      ))}
    </div>
  );
};

// AI Risk Prediction Card Component
const RiskPredictionCard: React.FC<{ 
  title: string; 
  risk: 'low' | 'medium' | 'high'; 
  percentage: number; 
  icon: string;
  description: string;
}> = ({ title, risk, percentage, icon, description }) => {
  const getRiskColor = () => {
    switch (risk) {
      case 'low': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'medium': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'high': return 'from-red-500/20 to-pink-500/20 border-red-500/30';
    }
  };

  const getRiskTextColor = () => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
    }
  };

  return (
    <div className={`risk-card bg-gradient-to-br ${getRiskColor()} border backdrop-blur-xl rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="risk-icon text-3xl">{icon}</div>
        <div className={`risk-percentage ${getRiskTextColor()} text-2xl font-bold`}>
          {percentage}%
        </div>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      <div className="risk-indicator mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${risk === 'low' ? 'bg-green-400' : risk === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Floating Orb Background Component
const FloatingOrbs: React.FC = () => {
  return (
    <div className="floating-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
    </div>
  );
};

// Hero Section Component
const HeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'AI-Powered Lung Health Tracker';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-section">
      <FloatingOrbs />
      <div className="hero-content">
        <div className="hero-logo">
          <div className="logo-pulse">💓</div>
        </div>
        <h1 className="hero-title">
          Breathe<span className="text-cyan-400">Mate</span>
        </h1>
        <p className="hero-subtitle">{typedText}<span className="cursor">|</span></p>
        <p className="hero-description">
          Advanced AI technology monitors your breathing patterns, predicts health risks, 
          and provides personalized insights to optimize your respiratory wellness.
        </p>
        
        <div className="hero-features">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>AI Analysis</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Real-time Monitoring</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Risk Prediction</span>
          </div>
        </div>

        <button className="hero-cta-button" onClick={onGetStarted}>
          <div className="cta-gradient">
            <span>Get Started</span>
            <span className="cta-arrow">→</span>
          </div>
        </button>
      </div>
    </div>
  );
};

// Circular Progress Component with enhanced animations
const CircularProgress: React.FC<{ percentage: number; size?: number; color?: string; animated?: boolean }> = ({ 
  percentage, 
  size = 80, 
  color = '#00ffff',
  animated = true
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
          strokeDashoffset={animated ? strokeDashoffset : circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={animated ? 'progress-animated' : ''}
        />
      </svg>
      <div className="progress-text" style={{ color }}>
        {percentage}%
      </div>
    </div>
  );
};

// Enhanced Dashboard Component
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

  const riskPredictions = [
    {
      title: 'Respiratory Health',
      risk: 'low' as const,
      percentage: 15,
      icon: '🫁',
      description: 'Your breathing patterns indicate excellent respiratory health with minimal risk factors.'
    },
    {
      title: 'Sleep Apnea Risk',
      risk: 'medium' as const,
      percentage: 35,
      icon: '😴',
      description: 'Moderate indicators detected. Consider monitoring sleep patterns more closely.'
    },
    {
      title: 'Stress Levels',
      risk: 'low' as const,
      percentage: 20,
      icon: '🧘',
      description: 'Breathing analysis shows good stress management and relaxation response.'
    },
    {
      title: 'Lung Capacity',
      risk: 'high' as const,
      percentage: 68,
      icon: '💨',
      description: 'Below optimal levels detected. Breathing exercises recommended to improve capacity.'
    }
  ];

  return (
    <div className="dashboard-container">
      <FloatingOrbs />
      
      {/* Enhanced Header */}
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

      {/* AI Health Overview */}
      <div className="overview-container">
        <h2 className="section-title">AI Health Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card enhanced">
            <CircularProgress percentage={healthStats.dailyGoal} size={70} animated={true} />
            <p className="stat-label">Daily Goal</p>
            <p className="stat-value">{healthStats.dailyGoal}%</p>
          </div>

          <div className="stat-card enhanced">
            <div className="stat-icon-container animated">
              📅
            </div>
            <p className="stat-label">Weekly Sessions</p>
            <p className="stat-value">{healthStats.weeklySessions}</p>
          </div>

          <div className="stat-card enhanced">
            <div className="stat-icon-container animated">
              📈
            </div>
            <p className="stat-label">AI Health Score</p>
            <p className="stat-value">{healthStats.averageScore}</p>
          </div>

          <div className="stat-card enhanced">
            <div className="stat-icon-container animated">
              🔥
            </div>
            <p className="stat-label">Day Streak</p>
            <p className="stat-value">{healthStats.streak}</p>
          </div>
        </div>
      </div>

      {/* AI Risk Predictions */}
      <div className="risk-predictions-container">
        <h2 className="section-title">AI Risk Predictions</h2>
        <div className="risk-grid">
          {riskPredictions.map((prediction, index) => (
            <RiskPredictionCard key={index} {...prediction} />
          ))}
        </div>
      </div>

      {/* Quick Actions with animations */}
      <div className="quick-actions-container">
        <h2 className="section-title">Quick Actions</h2>
        
        <div className="action-grid">
          <div className="action-card record-action enhanced">
            <div className="action-gradient cyan-gradient">
              🎤
              <h3 className="action-title">Record Breath</h3>
              <p className="action-subtitle">Start AI analysis</p>
            </div>
          </div>

          <div className="action-card journal-action enhanced">
            <div className="action-gradient green-gradient">
              📖
              <h3 className="action-title">View Journal</h3>
              <p className="action-subtitle">Track progress</p>
            </div>
          </div>

          <div className="action-card reports-action enhanced">
            <div className="action-gradient red-gradient">
              📊
              <h3 className="action-title">AI Reports</h3>
              <p className="action-subtitle">Health insights</p>
            </div>
          </div>

          <div className="action-card settings-action enhanced">
            <div className="action-gradient purple-gradient">
              ⚙️
              <h3 className="action-title">Settings</h3>
              <p className="action-subtitle">Customize app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity with enhanced design */}
      <div className="recent-container">
        <h2 className="section-title">Recent AI Analysis</h2>
        
        <div className="session-list enhanced">
          {recentSessions.map((session, index) => (
            <div key={index} className="session-card enhanced">
              <div className="session-icon animated">
                <span style={{ color: session.score >= 80 ? '#00ff88' : '#ffaa00' }}>
                  🤖
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

      {/* AI Health Tip */}
      <div className="tip-container">
        <div className="tip-gradient enhanced">
          <div className="tip-icon animated">🤖</div>
          <h3 className="tip-title">AI Health Recommendation</h3>
          <p className="tip-text">
            Based on your breathing patterns, our AI suggests practicing diaphragmatic breathing 
            for 10 minutes daily to optimize your respiratory efficiency and reduce stress markers.
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Record Component with real-time waveforms
const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'completed' | 'uploaded'>('idle');
  const [waveformIntensity, setWaveformIntensity] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setWaveformIntensity(Math.random() * 2 + 0.5);
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
    setTimeout(() => {
      alert('AI Analysis completed! Results available in your dashboard.');
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
      alert('AI is analyzing your breathing pattern... Results will be available shortly.');
      setRecordingStatus('idle');
      setUploadedFile(null);
      setRecordingTime(0);
    }
  };

  return (
    <div className="page-container">
      <FloatingOrbs />
      
      <div className="page-header">
        <h1 className="page-title">🎤 AI Breath Analysis</h1>
        <p className="page-subtitle">Advanced respiratory health monitoring</p>
      </div>

      <div className="record-main enhanced">
        <div className={`record-circle enhanced ${isRecording ? 'recording' : ''} ${recordingStatus === 'completed' ? 'completed' : ''} ${recordingStatus === 'uploaded' ? 'uploaded' : ''}`}>
          <div className="record-inner-circle">
            <div className="record-icon">
              {isRecording ? '⏸️' : recordingStatus === 'completed' ? '✅' : recordingStatus === 'uploaded' ? '📁' : '🎤'}
            </div>
            {isRecording && (
              <>
                <div className="recording-timer">{formatTime(recordingTime)}</div>
                <AnimatedWaveform isActive={isRecording} intensity={waveformIntensity} />
              </>
            )}
          </div>
        </div>
        
        <div className="record-controls">
          {recordingStatus === 'idle' && (
            <button className="record-button-main enhanced" onClick={handleStartRecording}>
              <div className="record-gradient">
                Start AI Recording
              </div>
            </button>
          )}
          
          {isRecording && (
            <button className="record-button-main stop-button enhanced" onClick={handleStopRecording}>
              <div className="stop-gradient">
                Stop Recording
              </div>
            </button>
          )}

          {(recordingStatus === 'completed' || recordingStatus === 'uploaded') && (
            <button className="record-button-main analyze-button enhanced" onClick={handleAnalyze}>
              <div className="analyze-gradient">
                Run AI Analysis
              </div>
            </button>
          )}
          
          <p className="record-instructions">
            {isRecording ? 'AI is recording and analyzing in real-time... Breathe naturally.' :
             recordingStatus === 'completed' ? 'Recording completed! Click to run advanced AI analysis.' :
             recordingStatus === 'uploaded' ? `File "${uploadedFile?.name}" ready for AI analysis!` :
             'Start recording for real-time AI breath analysis or upload an existing file.'}
          </p>
        </div>
      </div>

      {/* Enhanced Upload Section */}
      <div className="upload-section enhanced">
        <h3 className="upload-title">Or Upload for AI Analysis</h3>
        
        <div 
          className={`upload-zone enhanced ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'file-uploaded' : ''}`}
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
                <span className="upload-subtext">Ready for AI analysis</span>
              </>
            ) : (
              <>
                <span className="upload-icon">🤖</span>
                <span className="upload-text">
                  {dragActive ? 'Drop for AI analysis' : 'Upload for AI analysis'}
                </span>
                <span className="upload-subtext">Advanced AI processing ready</span>
              </>
            )}
          </label>
        </div>

        {uploadedFile && (
          <div className="file-info enhanced">
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

      <div className="record-tips enhanced">
        <h3 className="tips-title">AI Analysis Tips</h3>
        <div className="tips-grid">
          <div className="tip-item enhanced">
            <span className="tip-emoji">🤫</span>
            <p>Quiet environment for accurate AI analysis</p>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">📱</span>
            <p>Steady device positioning</p>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">😌</span>
            <p>Natural breathing patterns</p>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">⏱️</span>
            <p>30+ seconds for optimal analysis</p>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">🤖</span>
            <p>Real-time AI processing</p>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">🎵</span>
            <p>Multiple format support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Journal Component matching Expo app
const Journal = () => (
  <div className="page-container">
    <FloatingOrbs />
    <div className="page-header">
      <h1 className="page-title">📖 AI Health Journal</h1>
      <p className="page-subtitle">Track your AI-analyzed breathing journey</p>
    </div>

    <div className="journal-stats enhanced">
      <div className="journal-stat-card enhanced">
        <div className="stat-icon">📈</div>
        <div className="stat-info">
          <h3>AI Progress Trend</h3>
          <p className="stat-value">+12% this week</p>
        </div>
      </div>
      
      <div className="journal-stat-card enhanced">
        <div className="stat-icon">🎯</div>
        <div className="stat-info">
          <h3>AI Goals Achieved</h3>
          <p className="stat-value">8 out of 10</p>
        </div>
      </div>
    </div>

    <div className="journal-entries">
      <h3 className="section-title">Recent AI Analysis</h3>
      
      {[
        { date: 'Today', score: 92, notes: 'AI detected excellent breathing patterns after exercise' },
        { date: 'Yesterday', score: 78, notes: 'AI analysis shows improvement in respiratory rhythm' },
        { date: '2 days ago', score: 85, notes: 'AI feedback: great relaxation response detected' },
      ].map((entry, index) => (
        <div key={index} className="journal-entry enhanced">
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
    <FloatingOrbs />
    <div className="page-header">
      <h1 className="page-title">⚙️ AI Settings</h1>
      <p className="page-subtitle">Customize your AI health experience</p>
    </div>

    <div className="settings-sections">
      <div className="settings-section enhanced">
        <h3 className="settings-section-title">AI Analysis</h3>
        <div className="settings-item enhanced">
          <span className="settings-icon">🤖</span>
          <span className="settings-label">AI Model Preferences</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item enhanced">
          <span className="settings-icon">📊</span>
          <span className="settings-label">Analysis Sensitivity</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      <div className="settings-section enhanced">
        <h3 className="settings-section-title">Account</h3>
        <div className="settings-item enhanced">
          <span className="settings-icon">👤</span>
          <span className="settings-label">Profile Settings</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item enhanced">
          <span className="settings-icon">🔒</span>
          <span className="settings-label">Privacy & Security</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      <div className="settings-section enhanced">
        <h3 className="settings-section-title">Preferences</h3>
        <div className="settings-item enhanced">
          <span className="settings-icon">🔔</span>
          <span className="settings-label">AI Notifications</span>
          <span className="settings-arrow">›</span>
        </div>
        <div className="settings-item enhanced">
          <span className="settings-icon">🎨</span>
          <span className="settings-label">Theme & Appearance</span>
          <span className="settings-arrow">›</span>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Login Component
const Login: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showHero, setShowHero] = useState(true);

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

  const handleGetStarted = () => {
    setShowHero(false);
  };

  if (showHero) {
    return <HeroSection onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="login-container enhanced">
      <FloatingOrbs />
      
      <div className="logo-container">
        <div className="logo-icon enhanced">💓</div>
        <h1 className="logo-text">BreatheMate</h1>
        <p className="tagline">AI-Powered Lung Health Tracker</p>
      </div>

      <div className="form-container enhanced">
        <h2 className="welcome-text">Welcome Back!</h2>
        
        <div className="input-container enhanced">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Email Address"
            className="text-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-container enhanced">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-button enhanced" onClick={handleLogin}>
          <div className="login-gradient">
            Sign In
          </div>
        </button>
      </div>

      <div className="demo-container enhanced">
        <h3 className="demo-title">Demo Credentials:</h3>
        <p className="demo-text">Email: demo@breathemate.com</p>
        <p className="demo-text">Password: demo123</p>
        <button className="demo-login-button enhanced" onClick={handleDemoLogin}>
          Quick Demo Login
        </button>
      </div>
    </div>
  );
};

// Main App Component
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
    <div className="app enhanced">
      <main className="main-content">
        {renderPage()}
      </main>
      
      {isLoggedIn && (
        <nav className="bottom-nav enhanced">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`nav-tab enhanced ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            onClick={() => setCurrentPage('record')}
            className={`nav-tab enhanced ${currentPage === 'record' ? 'active' : ''}`}
          >
            <span className="nav-icon">🎤</span>
            <span className="nav-label">Record</span>
          </button>
          <button 
            onClick={() => setCurrentPage('journal')}
            className={`nav-tab enhanced ${currentPage === 'journal' ? 'active' : ''}`}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">Journal</span>
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className={`nav-tab enhanced ${currentPage === 'settings' ? 'active' : ''}`}
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

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Health affirmation prompts for AI analysis - same as mobile app
const BREATHING_PROMPTS: readonly string[] = [
  "Please breathe naturally and say: I am breathing deeply and my lungs are healthy and strong",
  "Take a deep breath and speak clearly: My respiratory system is functioning perfectly and I feel calm",
  "Breathe slowly and say: Each breath brings healing energy to my body and mind",
  "Inhale deeply and speak: I release all tension and breathe with complete ease",
  "Please state while breathing: My breathing is steady, my airways are clear, and I am at peace",
  "Breathe naturally and say: I trust my body's wisdom and my lungs work in perfect harmony",
  "Take three deep breaths and speak: I am grateful for my healthy breathing and strong respiratory system"
] as const;

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

interface AnalysisResults {
  healthScore: number;
  riskLevel: string;
  riskPercentage: number;
  breathingRate: number;
  recommendation: string;
  detectedIssues: string[];
  confidenceLevel: string;
  urgency: string;
}

interface HealthStats {
  dailyGoal: number;
  iterativeSessions: number;
  avgImprovement: number;
  dayStreak: number;
  weeklySessions: number;
  totalSessions: number;
  lastUpdated: string;
}

interface SessionData {
  id: number;
  date: string;
  sessionType: 'iterative' | 'single';
  iterations: Array<{
    iteration: number;
    score: number;
    risk: string;
    category: string;
  }>;
  improvement: number;
  duration: string;
  affirmationCategory: string;
}

// Dashboard Component - exactly like mobile app
const Dashboard: React.FC<{
  onRecordClick: () => void;
  healthStats: HealthStats;
  iterationHistory: SessionData[];
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  currentUser: User | null;
}> = ({ onRecordClick, healthStats, iterationHistory, showAnalytics, setShowAnalytics, currentUser }) => {
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.name?.split(' ')[0] || 'User';
    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 18) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'very low': return '#00ff88';
      case 'low': return '#00ffff';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff6b6b';
      default: return '#888';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#00ffff';
    if (score >= 40) return '#ffaa00';
    return '#ff6b6b';
  };

  return (
    <div className="dashboard-container">
      {/* Enhanced Header with User Info */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1 className="greeting">{getGreeting()} 👋</h1>
            <p className="subtitle">Track your breathing journey with AI-powered insights</p>
            <div className="user-stats">
              <span className="stat-chip">
                🎯 {healthStats.totalSessions} Total Sessions
              </span>
              <span className="stat-chip">
                🔥 {healthStats.dayStreak} Day Streak
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="analytics-button"
              onClick={() => setShowAnalytics(true)}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Health Overview */}
      <div className="health-overview">
        <h2 className="section-title">🎯 Health Overview</h2>
        <div className="stats-grid enhanced">
          <div className="stat-card primary">
            <div className="stat-icon">🫁</div>
            <div className="stat-content">
              <h3 style={{ color: getHealthScoreColor(healthStats.dailyGoal) }}>
                {healthStats.dailyGoal}%
              </h3>
              <p className="stat-label">Health Score</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${healthStats.dailyGoal}%`,
                    backgroundColor: getHealthScoreColor(healthStats.dailyGoal)
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="stat-card respiratory">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>{healthStats.iterativeSessions}</h3>
              <p className="stat-label">Iterative Sessions</p>
              <span className="stat-trend positive">+{Math.floor(Math.random() * 20)}% this week</span>
            </div>
          </div>
          
          <div className="stat-card sessions">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{healthStats.avgImprovement}%</h3>
              <p className="stat-label">Avg Improvement</p>
              <span className="stat-trend positive">+{Math.floor(Math.random() * 15)}% from last month</span>
            </div>
          </div>
          
          <div className="stat-card streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{healthStats.dayStreak}</h3>
              <p className="stat-label">Day Streak</p>
              <span className="stat-trend neutral">Keep it up!</span>
            </div>
          </div>

          <div className="stat-card stress">
            <div className="stat-icon">😌</div>
            <div className="stat-content">
              <h3>{85 + Math.floor(Math.random() * 10)}%</h3>
              <p className="stat-label">Stress Relief</p>
              <span className="stat-trend positive">Excellent</span>
            </div>
          </div>

          <div className="stat-card capacity">
            <div className="stat-icon">💨</div>
            <div className="stat-content">
              <h3>{75 + Math.floor(Math.random() * 20)}%</h3>
              <p className="stat-label">Lung Capacity</p>
              <span className="stat-trend positive">Improving</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">🚀 Quick Actions</h2>
        <div className="action-grid enhanced">
          <button
            className="action-card record"
            onClick={onRecordClick}
          >
            <div className="action-gradient">
              <div className="action-icon">🎤</div>
              <h3 className="action-title">AI Breath Analysis</h3>
              <p className="action-subtitle">Start guided recording session</p>
              <div className="action-stats">
                <span>📊 Last score: {78 + Math.floor(Math.random() * 20)}</span>
              </div>
            </div>
          </button>
          
          <button 
            className="action-card journal"
            onClick={() => setShowAnalytics(true)}
          >
            <div className="action-gradient">
              <div className="action-icon">📖</div>
              <h3 className="action-title">Health Journal</h3>
              <p className="action-subtitle">View your progress history</p>
              <div className="action-stats">
                <span>📈 {healthStats.totalSessions} entries</span>
              </div>
            </div>
          </button>
          
          <button 
            className="action-card reports"
            onClick={() => setShowAnalytics(true)}
          >
            <div className="action-gradient">
              <div className="action-icon">📊</div>
              <h3 className="action-title">AI Reports</h3>
              <p className="action-subtitle">Detailed health insights</p>
              <div className="action-stats">
                <span>🤖 Latest: Excellent</span>
              </div>
            </div>
          </button>
          
          <button className="action-card settings">
            <div className="action-gradient">
              <div className="action-icon">⚙️</div>
              <h3 className="action-title">Settings</h3>
              <p className="action-subtitle">Customize your experience</p>
              <div className="action-stats">
                <span>🔔 {Math.floor(Math.random() * 5)} notifications</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="recent-activity">
        <h2 className="section-title">🔄 Recent AI Analysis Sessions</h2>
        <div className="session-list">
          {iterationHistory.slice(0, 3).map((session) => (
            <div key={session.id} className="session-card enhanced">
              <div className="session-header">
                <div className="session-icon">
                  <span style={{ color: session.sessionType === 'iterative' ? '#9c27b0' : '#00ffff' }}>
                    {session.sessionType === 'iterative' ? '🔄' : '⭕'}
                  </span>
                </div>
                <div className="session-main-info">
                  <p className="session-date">{formatDate(session.date)}</p>
                  <p className="session-type">
                    {session.sessionType === 'iterative' ? 
                      `${session.iterations.length} AI Iterations` : 
                      'Single AI Analysis'
                    }
                  </p>
                  <p className="session-duration">⏱️ {session.duration}</p>
                </div>
                <div className="session-scores">
                  {session.sessionType === 'iterative' ? (
                    <div>
                      <p className="improvement-text">+{session.improvement} pts</p>
                      <p className="final-score-text">
                        {session.iterations[session.iterations.length - 1].score}/100
                      </p>
                      <div className="risk-indicator" style={{ color: getRiskColor(session.iterations[session.iterations.length - 1].risk) }}>
                        {session.iterations[session.iterations.length - 1].risk} Risk
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="single-score-text">{session.iterations[0].score}/100</p>
                      <div className="risk-indicator" style={{ color: getRiskColor(session.iterations[0].risk) }}>
                        {session.iterations[0].risk} Risk
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {session.sessionType === 'iterative' && (
                <div className="iteration-progress">
                  <p className="iteration-progress-title">AI Analysis Progress:</p>
                  <div className="iteration-dots">
                    {session.iterations.map((iter, index) => (
                      <div key={index} className="iteration-dot">
                        <div 
                          className="iteration-dot-inner" 
                          style={{ backgroundColor: getRiskColor(iter.risk) }}
                        />
                        <p className="iteration-dot-score">{iter.score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="session-category">
                <span className="category-label">AI Focus: </span>
                <span className="category-value">
                  {session.affirmationCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="view-all-button enhanced"
          onClick={() => setShowAnalytics(true)}
        >
          View Complete AI Analytics Dashboard 📊
        </button>
      </div>

      {/* Enhanced Health Recommendations */}
      <div className="health-recommendations">
        <h3 className="section-title">🤖 AI Health Recommendations</h3>
        <div className="recommendation-cards">
          <div className="rec-card breathing">
            <div className="rec-header">
              <span className="rec-icon">🫁</span>
              <h4>Breathing Exercise</h4>
            </div>
            <p>Based on your latest AI analysis, try the 4-7-8 breathing technique to improve your lung capacity.</p>
            <button className="rec-action">Start Exercise</button>
          </div>
          
          <div className="rec-card affirmation">
            <div className="rec-header">
              <span className="rec-icon">💫</span>
              <h4>Health Affirmation</h4>
            </div>
            <p>Your AI coach recommends positive affirmations to enhance respiratory wellness and reduce stress.</p>
            <button className="rec-action">View Affirmations</button>
          </div>
          
          <div className="rec-card tracking">
            <div className="rec-header">
              <span className="rec-icon">📊</span>
              <h4>Progress Tracking</h4>
            </div>
            <p>Schedule your next AI breathing analysis to maintain your {healthStats.dayStreak}-day improvement streak.</p>
            <button className="rec-action" onClick={onRecordClick}>Record Now</button>
          </div>
        </div>
      </div>

      {/* Enhanced Health Tip */}
      <div className="health-tip">
        <div className="tip-gradient enhanced">
          <div className="tip-icon">🤖</div>
          <h3 className="tip-title">AI Health Insight</h3>
          <p className="tip-text">
            Our AI has analyzed your breathing patterns and recommends focusing on deep diaphragmatic breathing. 
            Your recent sessions show a {healthStats.avgImprovement}% improvement in respiratory health metrics.
            Keep up the excellent work! 🎉
          </p>
          <div className="tip-actions">
            <button className="tip-action" onClick={onRecordClick}>
              Start AI Analysis
            </button>
            <button className="tip-action secondary" onClick={() => setShowAnalytics(true)}>
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recording Modal Component - exactly like mobile app
const RecordingModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onRecordClick: (type: 'record' | 'upload') => void;
}> = ({ visible, onClose, onRecordClick }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="recording-modal">
        <div className="recording-modal-gradient">
          <div className="recording-modal-header">
            <h2 className="recording-modal-title">🎙️ AI Breathing Analysis</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="recording-options">
            <button
              className="recording-option-card record-live"
              onClick={() => onRecordClick('record')}
            >
              <div className="recording-option-gradient">
                <div className="option-icon">🎤</div>
                <h3 className="option-title">Record Live</h3>
                <p className="option-subtitle">
                  Use AI-guided prompts for accurate health analysis
                </p>
              </div>
            </button>

            <button
              className="recording-option-card upload-audio"
              onClick={() => onRecordClick('upload')}
            >
              <div className="recording-option-gradient">
                <div className="option-icon">☁️</div>
                <h3 className="option-title">Upload Audio</h3>
                <p className="option-subtitle">
                  Select existing audio file for AI analysis
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prompt Modal Component
const PromptModal: React.FC<{
  visible: boolean;
  prompt: string;
  onStartRecording: () => void;
}> = ({ visible, prompt, onStartRecording }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="prompt-modal">
        <div className="prompt-modal-gradient">
          <h2 className="prompt-title">💫 AI Analysis Prompt</h2>
          <p className="prompt-text">"{prompt}"</p>
          <p className="prompt-instruction">
            Please read this sentence aloud clearly while breathing naturally. 
            This helps our AI provide more accurate health analysis by detecting voice patterns, breathing rhythm, and speech clarity.
          </p>
          
          <button
            className="start-recording-button"
            onClick={onStartRecording}
          >
            <div className="start-recording-gradient">
              <span className="button-icon">🎤</span>
              <span className="button-text">Start Recording</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Recording Progress Modal
const RecordingProgressModal: React.FC<{
  visible: boolean;
  recordingTime: number;
  onStopRecording: () => void;
}> = ({ visible, recordingTime, onStopRecording }) => {
  if (!visible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="recording-progress-modal">
        <div className="recording-progress-gradient">
          <div className="recording-indicator">
            <div className="recording-pulse"></div>
            <div className="recording-mic">🎤</div>
          </div>
          
          <h2 className="recording-status-text">🔴 Recording in Progress</h2>
          <p className="recording-time-text">{formatTime(recordingTime)}</p>
          <p className="recording-instruction-text">
            Continue speaking the prompt clearly...
          </p>
          
          <button
            className="stop-recording-button"
            onClick={onStopRecording}
          >
            <div className="stop-recording-gradient">
              <span className="button-icon">⏹️</span>
              <span className="button-text">Stop Recording</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Analytics Modal Component
const AnalyticsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  iterationHistory: SessionData[];
}> = ({ visible, onClose, iterationHistory }) => {
  if (!visible) return null;

  const monthlyProgress = {
    currentMonth: 'July 2025',
    sessionsCompleted: 12,
    targetSessions: 20,
    avgScore: 81,
    bestStreak: 7,
    improvementTrend: '+8.5%'
  };

  const weeklyTrends = [
    { week: 'Week 1', avgScore: 72, sessions: 3, improvement: 8 },
    { week: 'Week 2', avgScore: 78, sessions: 4, improvement: 12 },
    { week: 'Week 3', avgScore: 82, sessions: 5, improvement: 15 },
    { week: 'This Week', avgScore: 86, sessions: 3, improvement: 11 }
  ];

  const improvementStats = {
    avgImprovement: 11.3,
    bestSession: { date: '2025-07-13', improvement: 13, finalScore: 85 },
    totalIterations: 18,
    successRate: 89
  };

  const sessionTypes = {
    single: iterationHistory.filter(s => s.sessionType === 'single').length,
    iterative: iterationHistory.filter(s => s.sessionType === 'iterative').length
  };

  return (
    <div className="modal-overlay">
      <div className="analytics-modal">
        <div className="analytics-modal-gradient">
          <div className="analytics-modal-header">
            <h2 className="analytics-modal-title">📊 Detailed Analytics</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="analytics-modal-content">
            {/* Monthly Overview */}
            <div className="analytics-section">
              <h3 className="analytics-section-title">📅 Monthly Overview</h3>
              <div className="monthly-card">
                <h4 className="monthly-title">{monthlyProgress.currentMonth}</h4>
                <div className="monthly-stats">
                  <div className="monthly-stat">
                    <p className="monthly-stat-value">{monthlyProgress.sessionsCompleted}/{monthlyProgress.targetSessions}</p>
                    <p className="monthly-stat-label">Sessions</p>
                  </div>
                  <div className="monthly-stat">
                    <p className="monthly-stat-value">{monthlyProgress.avgScore}</p>
                    <p className="monthly-stat-label">Avg Score</p>
                  </div>
                  <div className="monthly-stat">
                    <p className="monthly-stat-value">{monthlyProgress.bestStreak}</p>
                    <p className="monthly-stat-label">Best Streak</p>
                  </div>
                  <div className="monthly-stat">
                    <p className="monthly-stat-value" style={{ color: '#00ff88' }}>{monthlyProgress.improvementTrend}</p>
                    <p className="monthly-stat-label">Improvement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Trends */}
            <div className="analytics-section">
              <h3 className="analytics-section-title">📈 Weekly Progress Trends</h3>
              {weeklyTrends.map((week, index) => (
                <div key={index} className="trend-card">
                  <div className="trend-header">
                    <p className="trend-week">{week.week}</p>
                    <p className="trend-score">{week.avgScore}/100</p>
                  </div>
                  <div className="trend-details">
                    <p className="trend-detail">📋 {week.sessions} sessions</p>
                    <p className="trend-detail">📈 +{week.improvement}% improvement</p>
                  </div>
                  <div className="trend-progress">
                    <div 
                      className="trend-progress-bar" 
                      style={{ 
                        width: `${week.avgScore}%`, 
                        backgroundColor: week.avgScore >= 80 ? '#00ff88' : '#ffaa00' 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Statistics */}
            <div className="analytics-section">
              <h3 className="analytics-section-title">🎯 Improvement Statistics</h3>
              <div className="improvement-grid">
                <div className="improvement-card">
                  <div className="improvement-icon">📈</div>
                  <p className="improvement-value">{improvementStats.avgImprovement}%</p>
                  <p className="improvement-label">Avg Improvement</p>
                </div>
                <div className="improvement-card">
                  <div className="improvement-icon">⭐</div>
                  <p className="improvement-value">{improvementStats.totalIterations}</p>
                  <p className="improvement-label">Total Iterations</p>
                </div>
                <div className="improvement-card">
                  <div className="improvement-icon">✅</div>
                  <p className="improvement-value">{improvementStats.successRate}%</p>
                  <p className="improvement-label">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Session Distribution */}
            <div className="analytics-section">
              <h3 className="analytics-section-title">📊 Session Distribution</h3>
              <div className="distribution-container">
                <div className="distribution-card">
                  <div className="distribution-icon single">⭕</div>
                  <p className="distribution-count">{sessionTypes.single}</p>
                  <p className="distribution-label">Single Sessions</p>
                </div>
                <div className="distribution-card">
                  <div className="distribution-icon iterative">🔄</div>
                  <p className="distribution-count">{sessionTypes.iterative}</p>
                  <p className="distribution-label">Iterative Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Demo user credentials
  const demoUsers = [
    {
      id: 'demo-1',
      name: 'Dr. Sarah Chen',
      email: 'demo@breathemate.com',
      password: 'demo123',
      avatar: '👩‍⚕️',
      joinDate: '2024-01-15'
    },
    {
      id: 'demo-2', 
      name: 'Alex Johnson',
      email: 'patient@breathemate.com',
      password: 'patient123',
      avatar: '🧑‍💼',
      joinDate: '2024-03-20'
    }
  ];

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try backend API first
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await response.json();

      if (response.ok && data.message === 'Login successful') {
        // Backend authentication successful
        localStorage.setItem('token', data.token);
        onLogin({
          id: 'backend-user',
          name: loginForm.email.split('@')[0],
          email: loginForm.email,
          avatar: '👤',
          joinDate: new Date().toISOString().split('T')[0]
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log('Backend not available, falling back to demo credentials');
    }

    // Fallback to demo credentials if backend is not available
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check demo credentials
    const user = demoUsers.find(u => 
      u.email === loginForm.email && u.password === loginForm.password
    );

    if (user) {
      onLogin({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinDate: user.joinDate
      });
    } else {
      alert('Invalid credentials. Try demo@breathemate.com / demo123 or start the backend server');
    }

    setIsLoading(false);
  };

  const handleQuickDemo = (userIndex: number): void => {
    const user = demoUsers[userIndex];
    onLogin({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      joinDate: user.joinDate
    });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="login-icon">🫁</span>
              <h1 className="login-title">BreatheMate</h1>
              <p className="login-subtitle">AI-Powered Respiratory Health</p>
            </div>
          </div>

          <div className="login-content">
            {!showRegister ? (
              <>
                <h2 className="login-form-title">Welcome Back</h2>
                <p className="login-form-subtitle">Sign in to continue your health journey</p>

                <form onSubmit={handleLogin} className="login-form">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading-spinner-container">
                        <div className="loading-spinner"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="login-divider">
                  <span className="divider-text">or</span>
                </div>

                <div className="demo-section">
                  <h3 className="demo-title">🚀 Quick Demo Access</h3>
                  <p className="demo-subtitle">Try BreatheMate instantly with demo accounts</p>
                  
                  <div className="demo-buttons">
                    <button
                      className="demo-button healthcare"
                      onClick={() => handleQuickDemo(0)}
                      type="button"
                    >
                      <div className="demo-button-content">
                        <span className="demo-avatar">👩‍⚕️</span>
                        <div className="demo-info">
                          <span className="demo-name">Dr. Sarah Chen</span>
                          <span className="demo-role">Healthcare Provider</span>
                        </div>
                      </div>
                    </button>

                    <button
                      className="demo-button patient"
                      onClick={() => handleQuickDemo(1)}
                      type="button"
                    >
                      <div className="demo-button-content">
                        <span className="demo-avatar">🧑‍💼</span>
                        <div className="demo-info">
                          <span className="demo-name">Alex Johnson</span>
                          <span className="demo-role">Patient View</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="login-footer">
                  <p className="footer-text">
                    Don't have an account?{' '}
                    <button
                      className="link-button"
                      onClick={() => setShowRegister(true)}
                      type="button"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="register-form">
                <h2 className="login-form-title">Create Account</h2>
                <p className="login-form-subtitle">Join BreatheMate for better respiratory health</p>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a password"
                  />
                </div>

                <button className="login-button" type="button">
                  Create Account
                </button>

                <div className="login-footer">
                  <p className="footer-text">
                    Already have an account?{' '}
                    <button
                      className="link-button"
                      onClick={() => setShowRegister(false)}
                      type="button"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-text">AI Health Analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Progress Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App(): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [showRecordingModal, setShowRecordingModal] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for saved authentication on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('breathemate_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('breathemate_user');
      }
    }
  }, []);

  const handleLogin = (user: User): void => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('breathemate_user', JSON.stringify(user));
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('breathemate_user');
    setCurrentPage('dashboard');
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Mock data - same as mobile app
  const [healthStats] = useState<HealthStats>({
    dailyGoal: 75,
    iterativeSessions: 2,
    avgImprovement: 11.3,
    dayStreak: 5,
    weeklySessions: 12,
    totalSessions: 25,
    lastUpdated: new Date().toISOString()
  });

  const [iterationHistory] = useState<SessionData[]>([
    {
      id: 1,
      date: '2025-07-13',
      sessionType: 'iterative',
      iterations: [
        { iteration: 1, score: 72, risk: 'Medium', category: 'respiratory_strength' },
        { iteration: 2, score: 78, risk: 'Low', category: 'respiratory_strength' },
        { iteration: 3, score: 85, risk: 'Very Low', category: 'wellness_maintenance' }
      ],
      improvement: 13,
      duration: '12 minutes',
      affirmationCategory: 'respiratory_strength'
    },
    {
      id: 2,
      date: '2025-07-12',
      sessionType: 'iterative',
      iterations: [
        { iteration: 1, score: 65, risk: 'High', category: 'healing_support' },
        { iteration: 2, score: 71, risk: 'Medium', category: 'stress_relief' },
        { iteration: 3, score: 76, risk: 'Low', category: 'stress_relief' }
      ],
      improvement: 11,
      duration: '15 minutes',
      affirmationCategory: 'healing_support'
    },
    {
      id: 3,
      date: '2025-07-11',
      sessionType: 'single',
      iterations: [
        { iteration: 1, score: 88, risk: 'Very Low', category: 'wellness_maintenance' }
      ],
      improvement: 0,
      duration: '4 minutes',
      affirmationCategory: 'wellness_maintenance'
    }
  ]);

  useEffect(() => {
    if (isRecording && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleRecordClick = (type: 'record' | 'upload'): void => {
    setShowRecordingModal(false);
    
    if (type === 'record') {
      // Show a random prompt for better AI analysis
      const randomPrompt = BREATHING_PROMPTS[Math.floor(Math.random() * BREATHING_PROMPTS.length)];
      setCurrentPrompt(randomPrompt);
      setShowPrompt(true);
    } else {
      // For upload, directly open file picker
      handleFileUpload();
    }
  };

  const startActualRecording = async (): Promise<void> => {
    setShowPrompt(false);
    setIsRecording(true);
    setRecordingTime(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/wav'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          // Handle recorded data
          console.log('Recording data available:', event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopRecording();
      };

      mediaRecorder.start();

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = (): void => {
    setIsRecording(false);
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        breathingRate: (Math.random() * 10 + 15).toFixed(1), // 15-25 bpm
        recommendation: 'Continue regular monitoring and maintain healthy breathing habits.'
      };
      
      alert(
        `🧠 AI Analysis Complete\n\n` +
        `Health Score: ${mockAnalysis.healthScore}/100\n` +
        `Risk Level: ${mockAnalysis.riskLevel}\n` +
        `Breathing Rate: ${mockAnalysis.breathingRate} bpm\n` +
        `Recommendation: ${mockAnalysis.recommendation}`
      );
    }, 2000);
  };

  const handleFileUpload = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Simulate file analysis
        setTimeout(() => {
          alert(
            '✅ Upload Successful\n\n' +
            'Your audio file has been uploaded and analyzed. Check your reports for detailed results.'
          );
        }, 1500);
      }
    };
    
    input.click();
  };

  const renderPage = (): React.ReactElement => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onRecordClick={() => setShowRecordingModal(true)}
            healthStats={healthStats}
            iterationHistory={iterationHistory}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <Dashboard
            onRecordClick={() => setShowRecordingModal(true)}
            healthStats={healthStats}
            iterationHistory={iterationHistory}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="app-icon">🫁</span>
            BreatheMate
            <span className="app-subtitle">AI Health Tracker</span>
          </h1>
          
          {/* User Profile Section */}
          {currentUser && (
            <div className="user-profile">
              <div className="user-avatar">
                {currentUser.avatar || '👤'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">
                  {currentUser.email.includes('demo') ? 'Healthcare Provider' : 'Patient'}
                </span>
              </div>
              <button 
                className="logout-button"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
            type="button"
          >
            🏠 Dashboard
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {renderPage()}
      </main>
      
      {/* Recording Modal */}
      <RecordingModal
        visible={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        onRecordClick={handleRecordClick}
      />
      
      {/* Prompt Modal */}
      <PromptModal
        visible={showPrompt}
        prompt={currentPrompt}
        onStartRecording={startActualRecording}
      />
      
      {/* Recording Progress Modal */}
      <RecordingProgressModal
        visible={isRecording}
        recordingTime={recordingTime}
        onStopRecording={stopRecording}
      />
      
      {/* Analytics Modal */}
      <AnalyticsModal
        visible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        iterationHistory={iterationHistory}
      />
      
      <footer className="app-footer">
        <p>
          BreatheMate uses advanced AI for respiratory health analysis. 
          This is not medical advice - consult healthcare professionals for medical concerns.
        </p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Health affirmation prompts for AI analysis - same as mobile app
const BREATHING_PROMPTS = [
  "Please breathe naturally and say: I am breathing deeply and my lungs are healthy and strong",
  "Take a deep breath and speak clearly: My respiratory system is functioning perfectly and I feel calm",
  "Breathe slowly and say: Each breath brings healing energy to my body and mind",
  "Inhale deeply and speak: I release all tension and breathe with complete ease",
  "Please state while breathing: My breathing is steady, my airways are clear, and I am at peace",
  "Breathe naturally and say: I trust my body's wisdom and my lungs work in perfect harmony",
  "Take three deep breaths and speak: I am grateful for my healthy breathing and strong respiratory system"
];

// TypeScript interfaces
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
}> = ({ onRecordClick, healthStats, iterationHistory, showAnalytics, setShowAnalytics }) => {
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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

  return (
    <div className="dashboard-container">
      {/* Header with Analytics Button */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="greeting">{getGreeting()}, User! 👋</h1>
            <p className="subtitle">Track your breathing journey with AI-powered insights</p>
          </div>
          <div className="header-actions">
            <button 
              className="analytics-button"
              onClick={() => setShowAnalytics(true)}
            >
              📊
            </button>
          </div>
        </div>
      </div>

      {/* Health Overview */}
      <div className="health-overview">
        <h2 className="section-title">🎯 Health Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="circular-progress">
              <div className="progress-circle">
                <span className="progress-text">{healthStats.dailyGoal}%</span>
              </div>
            </div>
            <p className="stat-label">Daily Goal</p>
            <p className="stat-value">{healthStats.dailyGoal}%</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <p className="stat-label">Iterative Sessions</p>
            <p className="stat-value">{healthStats.iterativeSessions}</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <p className="stat-label">Avg Improvement</p>
            <p className="stat-value">{healthStats.avgImprovement}%</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <p className="stat-label">Day Streak</p>
            <p className="stat-value">{healthStats.dayStreak}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid">
          <button
            className="action-card record"
            onClick={onRecordClick}
          >
            <div className="action-gradient">
              <div className="action-icon">🎤</div>
              <h3 className="action-title">Record Breath</h3>
              <p className="action-subtitle">Start AI-guided analysis</p>
            </div>
          </button>
          
          <button className="action-card journal">
            <div className="action-gradient">
              <div className="action-icon">📖</div>
              <h3 className="action-title">View Journal</h3>
              <p className="action-subtitle">Track your progress</p>
            </div>
          </button>
          
          <button className="action-card reports">
            <div className="action-gradient">
              <div className="action-icon">📊</div>
              <h3 className="action-title">Check Reports</h3>
              <p className="action-subtitle">View health insights</p>
            </div>
          </button>
          
          <button className="action-card settings">
            <div className="action-gradient">
              <div className="action-icon">⚙️</div>
              <h3 className="action-title">Settings</h3>
              <p className="action-subtitle">Customize your app</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2 className="section-title">🔄 Recent Iteration Sessions</h2>
        <div className="session-list">
          {iterationHistory.slice(0, 3).map((session) => (
            <div key={session.id} className="session-card">
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
                      `${session.iterations.length} Iterations` : 
                      'Single Recording'
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
                    </div>
                  ) : (
                    <p className="single-score-text">{session.iterations[0].score}/100</p>
                  )}
                </div>
              </div>
              
              {session.sessionType === 'iterative' && (
                <div className="iteration-progress">
                  <p className="iteration-progress-title">Iteration Progress:</p>
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
                <span className="category-label">Focus: </span>
                <span className="category-value">
                  {session.affirmationCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="view-all-button"
          onClick={() => setShowAnalytics(true)}
        >
          View All Sessions & Analytics 📊
        </button>
      </div>

      {/* Health Tip */}
      <div className="health-tip">
        <div className="tip-gradient">
          <div className="tip-icon">💡</div>
          <h3 className="tip-title">AI Analysis Tip</h3>
          <p className="tip-text">
            For the most accurate AI health assessment, speak the guided prompts clearly while breathing naturally. 
            Our AI analyzes voice patterns, breathing rhythm, and speech clarity to detect potential respiratory issues.
          </p>
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

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleRecordClick = (type: 'record' | 'upload') => {
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

  const startActualRecording = async () => {
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Handle recorded data
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

  const stopRecording = () => {
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

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onRecordClick={() => setShowRecordingModal(true)}
            healthStats={healthStats}
            iterationHistory={iterationHistory}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
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
        </div>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
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

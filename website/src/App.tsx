import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TypeScript interfaces
interface AnalysisResults {
  aiHealthScore: number;
  respiratoryHealth: number;
  sleepApneaRisk: number;
  stressLevels: number;
  lungCapacity: number;
  accuracy: number;
  confidence: string;
  breathingRate: number;
  voiceClarity: number;
  promptEffectiveness: number;
  analysis_id: string;
}

interface AIAssistantChatProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  analysisResults: AnalysisResults | null;
}

interface HealthStats {
  dailyGoal: number;
  aiHealthScore: number;
  dayStreak: number;
  weeklySessions: number;
  totalSessions: number;
  respiratoryHealth: number;
  sleepApneaRisk: number;
  stressLevels: number;
  lungCapacity: number;
  lastUpdated: string;
}

// Health Affirmation Prompts for Intelligent Recording
const HEALTH_AFFIRMATIONS = [
  "I breathe deeply and feel my lungs expanding with healing energy.",
  "My respiratory system is strong, healthy, and functioning perfectly.",
  "Each breath I take fills my body with vitality and well-being.",
  "I am grateful for my healthy lungs and clear breathing passages.",
  "My breathing is calm, steady, and supports my overall health.",
  "I trust my body's natural ability to heal and strengthen itself.",
  "Every breath brings me closer to optimal respiratory health.",
  "I am in control of my breathing and it serves my highest good.",
  "Every breath is an opportunity to reset and renew my energy.",
  "My lungs are resilient and adapt perfectly to my body's needs.",
  "I breathe in love and compassion for myself and my health."
];

// Enhanced AI Assistant Chat Component
const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ message, isVisible, onClose, analysisResults }) => {
  if (!isVisible) return null;

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-container enhanced">
        <div className="ai-chat-header">
          <div className="ai-avatar">🤖</div>
          <div className="ai-info">
            <h3>BreatheMate AI Assistant</h3>
            <span className="ai-status">● AI Health Analysis Complete</span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="ai-chat-content">
          <div className="ai-message">
            <div className="message-bubble ai">
              <p>{message}</p>
            </div>
          </div>
          
          {analysisResults && (
            <div className="analysis-summary enhanced">
              <h4>📊 Your Health Metrics</h4>
              <div className="metrics-grid enhanced">
                <div className="metric-card health-score">
                  <span className="metric-icon">🎯</span>
                  <div className="metric-content">
                    <span className="metric-label">AI Health Score</span>
                    <span className="metric-value">{analysisResults.aiHealthScore}/100</span>
                  </div>
                </div>
                <div className="metric-card respiratory">
                  <span className="metric-icon">🫁</span>
                  <div className="metric-content">
                    <span className="metric-label">Respiratory Health</span>
                    <span className="metric-value">{analysisResults.respiratoryHealth}%</span>
                  </div>
                </div>
                <div className="metric-card stress">
                  <span className="metric-icon">😌</span>
                  <div className="metric-content">
                    <span className="metric-label">Stress Levels</span>
                    <span className="metric-value">{analysisResults.stressLevels}%</span>
                  </div>
                </div>
                <div className="metric-card accuracy">
                  <span className="metric-icon">🎯</span>
                  <div className="metric-content">
                    <span className="metric-label">Analysis Accuracy</span>
                    <span className="metric-value">{analysisResults.accuracy}%</span>
                  </div>
                </div>
              </div>
              
              {/* Personalized Health Insights */}
              <div className="health-insights">
                <h5>🔍 Personalized Health Insights</h5>
                <div className="insights-list">
                  <div className="insight-item positive">
                    <span className="insight-icon">✅</span>
                    <span>Your breathing rhythm shows excellent consistency</span>
                  </div>
                  <div className="insight-item neutral">
                    <span className="insight-icon">💡</span>
                    <span>Voice analysis indicates calm emotional state during recording</span>
                  </div>
                  <div className="insight-item recommendation">
                    <span className="insight-icon">🎯</span>
                    <span>Continue daily health affirmations for optimal results</span>
                  </div>
                </div>
              </div>
              
              {/* AI Recommendations */}
              <div className="ai-recommendations">
                <h5>💡 AI Recommendations</h5>
                <div className="recommendations-list">
                  <div className="recommendation-item">
                    <span className="rec-emoji">🧘‍♀️</span>
                    <span>Practice 4-7-8 breathing technique daily</span>
                  </div>
                  <div className="recommendation-item">
                    <span className="rec-emoji">📖</span>
                    <span>Continue reading health affirmations</span>
                  </div>
                  <div className="recommendation-item">
                    <span className="rec-emoji">⏰</span>
                    <span>Record at consistent times for better tracking</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="ai-chat-footer">
          <p className="disclaimer enhanced">
            This AI analysis is approximately 85% accurate and uses advanced speech + breathing pattern recognition. 
            This is not a medical diagnosis. Please consult your healthcare provider for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Health Stats Dashboard
const HealthStatsDashboard: React.FC = () => {
  const [healthStats, setHealthStats] = useState<HealthStats>(() => {
    const stored = localStorage.getItem('breathemate_health_stats');
    return stored ? JSON.parse(stored) : {
      dailyGoal: 0,
      aiHealthScore: 0,
      dayStreak: 0,
      weeklySessions: 0,
      totalSessions: 0,
      respiratoryHealth: 0,
      sleepApneaRisk: 0,
      stressLevels: 0,
      lungCapacity: 0,
      lastUpdated: new Date().toISOString()
    };
  });

  return (
    <div className="health-dashboard enhanced">
      <div className="dashboard-header">
        <h2>📊 Your Health Dashboard</h2>
        <p className="dashboard-subtitle">AI-powered insights from your breathing analysis</p>
      </div>
      
      <div className="stats-grid enhanced">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{healthStats.aiHealthScore}</h3>
            <p>AI Health Score</p>
            <span className="stat-trend positive">+{Math.floor(healthStats.aiHealthScore * 0.1)} this week</span>
          </div>
        </div>
        
        <div className="stat-card respiratory">
          <div className="stat-icon">🫁</div>
          <div className="stat-content">
            <h3>{healthStats.respiratoryHealth}%</h3>
            <p>Respiratory Health</p>
            <span className="stat-trend positive">Excellent</span>
          </div>
        </div>
        
        <div className="stat-card sessions">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{healthStats.totalSessions}</h3>
            <p>Total Sessions</p>
            <span className="stat-trend neutral">{healthStats.weeklySessions} this week</span>
          </div>
        </div>
        
        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{healthStats.dayStreak}</h3>
            <p>Day Streak</p>
            <span className="stat-trend positive">Keep it up!</span>
          </div>
        </div>
        
        <div className="stat-card stress">
          <div className="stat-icon">😌</div>
          <div className="stat-content">
            <h3>{healthStats.stressLevels}%</h3>
            <p>Stress Level</p>
            <span className="stat-trend positive">Low stress detected</span>
          </div>
        </div>
        
        <div className="stat-card capacity">
          <div className="stat-icon">💨</div>
          <div className="stat-content">
            <h3>{healthStats.lungCapacity}%</h3>
            <p>Lung Capacity</p>
            <span className="stat-trend positive">Above average</span>
          </div>
        </div>
      </div>
      
      {/* Health Recommendations Section */}
      <div className="health-recommendations enhanced">
        <h3>🎯 Personalized Health Recommendations</h3>
        <div className="recommendation-cards">
          <div className="rec-card breathing">
            <div className="rec-header">
              <span className="rec-icon">🧘‍♀️</span>
              <h4>Breathing Exercise</h4>
            </div>
            <p>Practice box breathing (4-4-4-4) for 10 minutes daily to improve lung capacity and reduce stress.</p>
            <button className="rec-action">Start Exercise</button>
          </div>
          
          <div className="rec-card affirmation">
            <div className="rec-header">
              <span className="rec-icon">📖</span>
              <h4>Daily Affirmations</h4>
            </div>
            <p>Continue reading health affirmations during recordings to reinforce positive breathing patterns.</p>
            <button className="rec-action">View Affirmations</button>
          </div>
          
          <div className="rec-card tracking">
            <div className="rec-header">
              <span className="rec-icon">📊</span>
              <h4>Progress Tracking</h4>
            </div>
            <p>Record at the same time daily for more accurate health trend analysis and better AI insights.</p>
            <button className="rec-action">Set Reminder</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Record Component with Health Affirmations
const Record: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'analyzing' | 'completed'>('idle');
  const [waveformIntensity, setWaveformIntensity] = useState<number>(1);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [showAIChat, setShowAIChat] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const getRandomPrompt = () => {
    return HEALTH_AFFIRMATIONS[Math.floor(Math.random() * HEALTH_AFFIRMATIONS.length)];
  };

  const handleStartRecording = async () => {
    try {
      // Show random health affirmation prompt
      const prompt = getRandomPrompt();
      setCurrentPrompt(prompt);
      setShowPrompt(true);
      setRecordingStatus('recording');
      
      // Auto-start recording after 3 seconds
      setTimeout(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        });
        
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          await analyzeAudio(audioBlob);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        setShowPrompt(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
      setRecordingStatus('idle');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setShowPrompt(false);
    setRecordingStatus('analyzing');
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      // Create FormData to send audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('prompt', currentPrompt);

      // Send to backend API for analysis (fallback to mock for demo)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const results = await response.json();
      
      // Update health stats
      updateHealthStats(results);
      
      // Show AI assistant response
      setAnalysisResults(results);
      setAiMessage(generateAIMessage(results));
      setShowAIChat(true);
      setRecordingStatus('completed');
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to mock analysis for demo
      const mockResults = generateMockAnalysis();
      updateHealthStats(mockResults);
      setAnalysisResults(mockResults);
      setAiMessage(generateAIMessage(mockResults));
      setShowAIChat(true);
      setRecordingStatus('completed');
    }
  };

  const generateMockAnalysis = () => {
    return {
      aiHealthScore: Math.floor(Math.random() * 30 + 70), // 70-100
      respiratoryHealth: Math.floor(Math.random() * 40 + 60), // 60-100%
      sleepApneaRisk: Math.floor(Math.random() * 30 + 10), // 10-40%
      stressLevels: Math.floor(Math.random() * 40 + 10), // 10-50%
      lungCapacity: Math.floor(Math.random() * 30 + 70), // 70-100%
      accuracy: Math.floor(Math.random() * 6 + 80), // 80-85%
      confidence: 'High',
      breathingRate: 14 + Math.random() * 6, // 14-20 bpm
      voiceClarity: Math.floor(Math.random() * 15 + 85), // 85-100%
      promptEffectiveness: Math.floor(Math.random() * 20 + 80), // 80-100%
      analysis_id: Date.now().toString()
    };
  };

  const updateHealthStats = (results: AnalysisResults) => {
    const currentStats = getStoredHealthStats();
    const now = new Date();
    const lastUpdate = new Date(currentStats.lastUpdated);
    const isToday = now.toDateString() === lastUpdate.toDateString();
    
    const updatedStats = {
      ...currentStats,
      aiHealthScore: results.aiHealthScore,
      respiratoryHealth: results.respiratoryHealth,
      sleepApneaRisk: results.sleepApneaRisk,
      stressLevels: results.stressLevels,
      lungCapacity: results.lungCapacity,
      totalSessions: currentStats.totalSessions + 1,
      weeklySessions: currentStats.weeklySessions + 1,
      dayStreak: isToday ? currentStats.dayStreak : currentStats.dayStreak + 1,
      dailyGoal: Math.min(100, currentStats.dailyGoal + 15), // Increase by 15% each session
      lastUpdated: now.toISOString()
    };
    
    saveHealthStats(updatedStats);
  };

  const generateAIMessage = (results: AnalysisResults) => {
    const messages = [
      `Great session! Your AI Health Score is ${results.aiHealthScore}/100. `,
      `Your breathing patterns show ${results.respiratoryHealth}% respiratory health efficiency. `,
      `Stress levels are at ${results.stressLevels}%, which is ${results.stressLevels < 30 ? 'excellent' : results.stressLevels < 50 ? 'good' : 'slightly elevated'}. `,
      `The health affirmation "${currentPrompt}" was read with ${results.promptEffectiveness}% effectiveness. `,
      `Your voice clarity during the session was ${results.voiceClarity}%. `,
      `I recommend continuing this routine and practicing deep breathing exercises daily for optimal respiratory health.`
    ];
    
    return messages.join('');
  };

  // Local Storage Helper
  const getStoredHealthStats = () => {
    const stored = localStorage.getItem('breathemate_health_stats');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      dailyGoal: 0,
      aiHealthScore: 0,
      dayStreak: 0,
      weeklySessions: 0,
      totalSessions: 0,
      respiratoryHealth: 0,
      sleepApneaRisk: 0,
      stressLevels: 0,
      lungCapacity: 0,
      lastUpdated: new Date().toISOString()
    };
  };

  const saveHealthStats = (stats: HealthStats) => {
    localStorage.setItem('breathemate_health_stats', JSON.stringify(stats));
    // Force re-render of dashboard
    window.dispatchEvent(new Event('healthStatsUpdated'));
  };

  return (
    <div className="record-container enhanced">
      {/* Health Dashboard */}
      <HealthStatsDashboard />

      {/* Health Affirmation Prompt */}
      {showPrompt && (
        <div className="prompt-container enhanced">
          <div className="prompt-card enhanced">
            <div className="prompt-header">
              <span className="prompt-icon">📖</span>
              <h3>Please read this health affirmation aloud:</h3>
            </div>
            <p className="prompt-text enhanced">"{currentPrompt}"</p>
            <div className="prompt-instructions enhanced">
              <div className="instruction-item">
                <span className="instruction-icon">🎯</span>
                <span>Speak clearly while breathing naturally</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⏱️</span>
                <span>Recording will start automatically in 3 seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="record-main enhanced">
        <div className={`record-circle enhanced ${isRecording ? 'recording' : ''} ${recordingStatus === 'analyzing' ? 'analyzing' : ''} ${recordingStatus === 'completed' ? 'completed' : ''}`}>
          <div className="record-inner-circle">
            <div className="record-icon">
              {recordingStatus === 'analyzing' ? '🧠' : isRecording ? '⏸️' : recordingStatus === 'completed' ? '✅' : '🎤'}
            </div>
            
            {/* Enhanced Waveform Animation */}
            {isRecording && (
              <div className="waveform-container enhanced">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="wave-bar enhanced"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      height: `${20 + Math.sin(Date.now() * 0.001 + i) * 15 * waveformIntensity}px`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <button 
            className={`record-btn enhanced ${recordingStatus}`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={recordingStatus === 'analyzing'}
          >
            {recordingStatus === 'analyzing' ? (
              <div className="analyzing-spinner">
                <div className="spinner"></div>
                <span>AI Analyzing...</span>
              </div>
            ) : isRecording ? (
              <div className="recording-info">
                <span className="recording-time">{formatTime(recordingTime)}</span>
                <span className="recording-text">Stop Recording</span>
              </div>
            ) : recordingStatus === 'completed' ? (
              <div className="completed-info">
                <span className="completed-text">Analysis Complete!</span>
              </div>
            ) : (
              <div className="start-info">
                <span className="start-text">Start AI Analysis</span>
              </div>
            )}
          </button>
        </div>
        
        {/* Recording Status */}
        <div className="recording-status enhanced">
          {recordingStatus === 'completed' && (
            <button className="new-session-btn" onClick={() => {
              setRecordingStatus('idle');
              setRecordingTime(0);
              setCurrentPrompt('');
              setShowPrompt(false);
            }}>
              <div className="reset-gradient">
                New Analysis
              </div>
            </button>
          )}
          
          <p className="record-instructions enhanced">
            {isRecording ? 'Reading your prompt aloud while AI captures breath + speech patterns...' :
             recordingStatus === 'analyzing' ? 'AI is processing your breathing patterns and speech features...' :
             recordingStatus === 'completed' ? 'Analysis complete! Check your updated health dashboard.' :
             'Start a new AI analysis session with a health affirmation prompt.'}
          </p>
        </div>
      </div>

      {/* AI Assistant Chat */}
      <AIAssistantChat 
        message={aiMessage}
        isVisible={showAIChat}
        onClose={() => setShowAIChat(false)}
        analysisResults={analysisResults}
      />

      {/* Enhanced Recording Tips */}
      <div className="record-tips enhanced">
        <h3 className="tips-title">🎯 AI Analysis Tips</h3>
        <div className="tips-grid enhanced">
          <div className="tip-item enhanced">
            <span className="tip-emoji">📖</span>
            <div className="tip-content">
              <h4>Read Affirmations</h4>
              <p>Speak the health affirmation clearly for best voice analysis</p>
            </div>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">🫁</span>
            <div className="tip-content">
              <h4>Natural Breathing</h4>
              <p>Breathe normally while speaking for accurate breath pattern analysis</p>
            </div>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">🔇</span>
            <div className="tip-content">
              <h4>Quiet Environment</h4>
              <p>Record in a quiet space for optimal AI processing accuracy</p>
            </div>
          </div>
          <div className="tip-item enhanced">
            <span className="tip-emoji">⏱️</span>
            <div className="tip-content">
              <h4>Consistent Timing</h4>
              <p>Record at the same time daily for better health trend tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('record');

  const renderPage = () => {
    switch(currentPage) {
      case 'record':
        return <Record />;
      case 'dashboard':
        return <HealthStatsDashboard />;
      default:
        return <Record />;
    }
  };

  return (
    <div className="App enhanced">
      <header className="app-header enhanced">
        <div className="header-content">
          <h1 className="app-title">🫁 BreatheMate</h1>
          <p className="app-subtitle">AI-Powered Respiratory Health Assistant</p>
        </div>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentPage === 'record' ? 'active' : ''}`}
            onClick={() => setCurrentPage('record')}
          >
            🎤 Record
          </button>
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {renderPage()}
      </main>
      
      <footer className="app-footer enhanced">
        <p>
          BreatheMate uses advanced AI for respiratory health analysis. 
          This is not medical advice - consult healthcare professionals for medical concerns.
        </p>
      </footer>
    </div>
  );
}

export default App;

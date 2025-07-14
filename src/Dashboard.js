import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Health affirmation prompts for AI analysis
const BREATHING_PROMPTS = [
  "Please breathe naturally and say: I am breathing deeply and my lungs are healthy and strong",
  "Take a deep breath and speak clearly: My respiratory system is functioning perfectly and I feel calm",
  "Breathe slowly and say: Each breath brings healing energy to my body and mind",
  "Inhale deeply and speak: I release all tension and breathe with complete ease",
  "Please state while breathing: My breathing is steady, my airways are clear, and I am at peace",
  "Breathe naturally and say: I trust my body's wisdom and my lungs work in perfect harmony",
  "Take three deep breaths and speak: I am grateful for my healthy breathing and strong respiratory system"
];

const DashboardScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('User');
  const [healthStats, setHealthStats] = useState({
    dailyGoal: 75,
    weeklySessions: 12,
    averageScore: 86,
    streak: 5,
  });
  
  // Enhanced state for iteration analytics
  const [iterationHistory, setIterationHistory] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState({});
  const [sessionTypes, setSessionTypes] = useState({ single: 0, iterative: 0 });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [improvementStats, setImprovementStats] = useState({
    avgImprovement: 0,
    bestSession: null,
    totalIterations: 0,
    successRate: 0
  });

  // Recording states
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingType, setRecordingType] = useState(null); // 'record' or 'upload'
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    loadUserData();
    loadIterationHistory();
    calculateAnalytics();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const name = email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadIterationHistory = async () => {
    try {
      // Simulate loading iteration history data
      const mockHistory = [
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
      ];
      
      setIterationHistory(mockHistory);
      
      // Calculate session type distribution
      const single = mockHistory.filter(s => s.sessionType === 'single').length;
      const iterative = mockHistory.filter(s => s.sessionType === 'iterative').length;
      setSessionTypes({ single, iterative });
      
    } catch (error) {
      console.log('Error loading iteration history:', error);
    }
  };

  const calculateAnalytics = () => {
    // Calculate weekly trends
    const trends = [
      { week: 'Week 1', avgScore: 72, sessions: 3, improvement: 8 },
      { week: 'Week 2', avgScore: 78, sessions: 4, improvement: 12 },
      { week: 'Week 3', avgScore: 82, sessions: 5, improvement: 15 },
      { week: 'This Week', avgScore: 86, sessions: 3, improvement: 11 }
    ];
    setWeeklyTrends(trends);

    // Calculate improvement statistics
    const mockStats = {
      avgImprovement: 11.3,
      bestSession: { date: '2025-07-13', improvement: 13, finalScore: 85 },
      totalIterations: 18,
      successRate: 89
    };
    setImprovementStats(mockStats);

    // Monthly progress
    setMonthlyProgress({
      currentMonth: 'July 2025',
      sessionsCompleted: 12,
      targetSessions: 20,
      avgScore: 81,
      bestStreak: 7,
      improvementTrend: '+8.5%'
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const startRecording = (type) => {
    setRecordingType(type);
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

  const startActualRecording = () => {
    setShowPrompt(false);
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      clearInterval(timer);
      stopRecording();
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setShowRecordingModal(false);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        healthScore: Math.floor(Math.random() * 40) + 60, // 60-100
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        breathingRate: (Math.random() * 10 + 15).toFixed(1), // 15-25 bpm
        issues: Math.random() > 0.7 ? ['Irregular breathing pattern'] : [],
        recommendation: 'Continue regular monitoring and maintain healthy breathing habits.'
      };
      
      Alert.alert(
        '🧠 AI Analysis Complete',
        `Health Score: ${mockAnalysis.healthScore}/100\n` +
        `Risk Level: ${mockAnalysis.riskLevel}\n` +
        `Breathing Rate: ${mockAnalysis.breathingRate} bpm\n` +
        `Recommendation: ${mockAnalysis.recommendation}`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleFileUpload = () => {
    setShowRecordingModal(false);
    // Simulate file upload
    Alert.alert(
      'Upload Audio File',
      'Select an audio file containing your breathing sounds for AI analysis.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Choose File', 
          onPress: () => {
            // Simulate file selection and analysis
            setTimeout(() => {
              Alert.alert(
                '✅ Upload Successful',
                'Your audio file has been uploaded and analyzed. Check your reports for detailed results.',
                [{ text: 'OK' }]
              );
            }, 1500);
          }
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = '#00ffff' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size }}>
        <View style={styles.progressCircleContainer}>
          <View style={[styles.progressCircleBackground, { width: size, height: size, borderRadius: size / 2 }]} />
          <View 
            style={[
              styles.progressCircleFill, 
              { 
                width: size * 0.8, 
                height: size * 0.8, 
                borderRadius: (size * 0.8) / 2,
                backgroundColor: color + '20'
              }
            ]} 
          />
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressText, { color }]}>{percentage}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'very low': return '#00ff88';
      case 'low': return '#00ffff';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff6b6b';
      default: return '#888';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Recording Modal Component
  const RecordingModal = () => (
    <Modal
      visible={showRecordingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRecordingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.recordingModalContainer}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.recordingModalGradient}
          >
            <View style={styles.recordingModalHeader}>
              <Text style={styles.recordingModalTitle}>🎙️ AI Breathing Analysis</Text>
              <TouchableOpacity 
                onPress={() => setShowRecordingModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.recordingOptions}>
              <TouchableOpacity
                style={styles.recordingOptionCard}
                onPress={() => startRecording('record')}
              >
                <LinearGradient
                  colors={['#00ffff', '#0080ff']}
                  style={styles.recordingOptionGradient}
                >
                  <Ionicons name="mic" size={40} color="#fff" />
                  <Text style={styles.recordingOptionTitle}>Record Live</Text>
                  <Text style={styles.recordingOptionSubtitle}>
                    Use AI-guided prompts for accurate health analysis
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recordingOptionCard}
                onPress={() => startRecording('upload')}
              >
                <LinearGradient
                  colors={['#00ff88', '#00cc66']}
                  style={styles.recordingOptionGradient}
                >
                  <Ionicons name="cloud-upload" size={40} color="#fff" />
                  <Text style={styles.recordingOptionTitle}>Upload Audio</Text>
                  <Text style={styles.recordingOptionSubtitle}>
                    Select existing audio file for AI analysis
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  // Prompt Modal Component
  const PromptModal = () => (
    <Modal
      visible={showPrompt}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.promptModalContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.15)', 'rgba(0, 128, 255, 0.15)']}
            style={styles.promptModalGradient}
          >
            <Text style={styles.promptTitle}>💫 AI Analysis Prompt</Text>
            <Text style={styles.promptText}>{currentPrompt}</Text>
            <Text style={styles.promptInstruction}>
              Please read this sentence aloud clearly while breathing naturally. 
              This helps our AI provide more accurate health analysis by detecting voice patterns, breathing rhythm, and speech clarity.
            </Text>
            
            <TouchableOpacity
              style={styles.startRecordingButton}
              onPress={startActualRecording}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ff5252']}
                style={styles.startRecordingGradient}
              >
                <Ionicons name="mic" size={24} color="#fff" />
                <Text style={styles.startRecordingText}>Start Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  // Recording in Progress Modal
  const RecordingProgressModal = () => (
    <Modal
      visible={isRecording}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.recordingProgressContainer}>
          <LinearGradient
            colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 82, 82, 0.2)']}
            style={styles.recordingProgressGradient}
          >
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingPulse} />
              <Ionicons name="mic" size={60} color="#ff6b6b" />
            </View>
            
            <Text style={styles.recordingStatusText}>🔴 Recording in Progress</Text>
            <Text style={styles.recordingTimeText}>{formatTime(recordingTime)}</Text>
            <Text style={styles.recordingInstructionText}>
              Continue speaking the prompt clearly...
            </Text>
            
            <TouchableOpacity
              style={styles.stopRecordingButton}
              onPress={stopRecording}
            >
              <LinearGradient
                colors={['#666', '#555']}
                style={styles.stopRecordingGradient}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.stopRecordingText}>Stop Recording</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  const AnalyticsModal = () => (
    <Modal
      visible={showAnalytics}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAnalytics(false)}
    >
      <LinearGradient
        colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>📊 Detailed Analytics</Text>
          <TouchableOpacity 
            onPress={() => setShowAnalytics(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Monthly Overview */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>📅 Monthly Overview</Text>
            <View style={styles.monthlyCard}>
              <Text style={styles.monthlyTitle}>{monthlyProgress.currentMonth}</Text>
              <View style={styles.monthlyStats}>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyProgress.sessionsCompleted}/{monthlyProgress.targetSessions}</Text>
                  <Text style={styles.monthlyStatLabel}>Sessions</Text>
                </View>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyProgress.avgScore}</Text>
                  <Text style={styles.monthlyStatLabel}>Avg Score</Text>
                </View>
                <View style={styles.monthlyStat}>
                  <Text style={styles.monthlyStatValue}>{monthlyProgress.bestStreak}</Text>
                  <Text style={styles.monthlyStatLabel}>Best Streak</Text>
                </View>
                <View style={styles.monthlyStat}>
                  <Text style={[styles.monthlyStatValue, { color: '#00ff88' }]}>{monthlyProgress.improvementTrend}</Text>
                  <Text style={styles.monthlyStatLabel}>Improvement</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Trends */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>📈 Weekly Progress Trends</Text>
            {weeklyTrends.map((week, index) => (
              <View key={index} style={styles.weeklyTrendCard}>
                <View style={styles.weeklyTrendHeader}>
                  <Text style={styles.weeklyTrendTitle}>{week.week}</Text>
                  <Text style={[styles.weeklyTrendImprovement, { color: week.improvement > 10 ? '#00ff88' : '#ffaa00' }]}>
                    +{week.improvement}% improvement
                  </Text>
                </View>
                <View style={styles.weeklyTrendStats}>
                  <Text style={styles.weeklyTrendStat}>Avg Score: {week.avgScore}</Text>
                  <Text style={styles.weeklyTrendStat}>Sessions: {week.sessions}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${week.avgScore}%` }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Improvement Statistics */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>🎯 Improvement Statistics</Text>
            <View style={styles.improvementStatsCard}>
              <View style={styles.improvementStatRow}>
                <View style={styles.improvementStat}>
                  <Text style={styles.improvementStatValue}>{improvementStats.avgImprovement}%</Text>
                  <Text style={styles.improvementStatLabel}>Avg Improvement</Text>
                </View>
                <View style={styles.improvementStat}>
                  <Text style={styles.improvementStatValue}>{improvementStats.totalIterations}</Text>
                  <Text style={styles.improvementStatLabel}>Total Iterations</Text>
                </View>
              </View>
              <View style={styles.improvementStatRow}>
                <View style={styles.improvementStat}>
                  <Text style={styles.improvementStatValue}>{improvementStats.successRate}%</Text>
                  <Text style={styles.improvementStatLabel}>Success Rate</Text>
                </View>
                <View style={styles.improvementStat}>
                  <Text style={styles.improvementStatValue}>
                    {improvementStats.bestSession?.improvement || 0}%
                  </Text>
                  <Text style={styles.improvementStatLabel}>Best Session</Text>
                </View>
              </View>
              {improvementStats.bestSession && (
                <View style={styles.bestSessionInfo}>
                  <Text style={styles.bestSessionText}>
                    🏆 Best session: {formatDate(improvementStats.bestSession.date)} 
                    (Final Score: {improvementStats.bestSession.finalScore})
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Session Type Distribution */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>📋 Session Types</Text>
            <View style={styles.sessionTypeCard}>
              <View style={styles.sessionTypeRow}>
                <View style={styles.sessionType}>
                  <Text style={styles.sessionTypeValue}>{sessionTypes.iterative}</Text>
                  <Text style={styles.sessionTypeLabel}>Iterative Sessions</Text>
                  <Text style={styles.sessionTypeDescription}>Multi-iteration improvement</Text>
                </View>
                <View style={styles.sessionType}>
                  <Text style={styles.sessionTypeValue}>{sessionTypes.single}</Text>
                  <Text style={styles.sessionTypeLabel}>Single Sessions</Text>
                  <Text style={styles.sessionTypeDescription}>One-time recordings</Text>
                </View>
              </View>
              <View style={styles.sessionTypeInsight}>
                <Text style={styles.sessionTypeInsightText}>
                  💡 {sessionTypes.iterative > sessionTypes.single ? 
                    'Great! You\'re focusing on iterative improvement sessions.' :
                    'Try more iterative sessions for better health insights.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Session History */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>🕒 Recent Session History</Text>
            {iterationHistory.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.sessionHistoryCard}>
                <View style={styles.sessionHistoryHeader}>
                  <Text style={styles.sessionHistoryDate}>{formatDate(session.date)}</Text>
                  <View style={[styles.sessionTypeBadge, { 
                    backgroundColor: session.sessionType === 'iterative' ? '#0080ff20' : '#00ff8820' 
                  }]}>
                    <Text style={[styles.sessionTypeBadgeText, {
                      color: session.sessionType === 'iterative' ? '#0080ff' : '#00ff88'
                    }]}>
                      {session.sessionType === 'iterative' ? 'Iterative' : 'Single'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionIterations}>
                  {session.iterations.map((iteration, idx) => (
                    <View key={idx} style={styles.iterationItem}>
                      <Text style={styles.iterationNumber}>#{iteration.iteration}</Text>
                      <Text style={styles.iterationScore}>{iteration.score}</Text>
                      <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(iteration.risk) + '30' }]}>
                        <Text style={[styles.riskText, { color: getRiskColor(iteration.risk) }]}>
                          {iteration.risk}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                {session.improvement > 0 && (
                  <View style={styles.sessionImprovement}>
                    <Text style={styles.sessionImprovementText}>
                      📈 +{session.improvement}% improvement • {session.duration}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header with Analytics Button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}! 👋</Text>
              <Text style={styles.subtitle}>Track your breathing journey with detailed insights</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.analyticsButton} 
                onPress={() => setShowAnalytics(true)}
              >
                <LinearGradient
                  colors={['#9c27b0', '#673ab7']}
                  style={styles.analyticsGradient}
                >
                  <Ionicons name="analytics" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
                <LinearGradient
                  colors={['#ff4444', '#ff6666']}
                  style={styles.profileGradient}
                >
                  <Ionicons name="log-out-outline" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Health Overview with Iteration Stats */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>🎯 Health Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <CircularProgress percentage={healthStats.dailyGoal} size={70} />
              <Text style={styles.statLabel}>Daily Goal</Text>
              <Text style={styles.statValue}>{healthStats.dailyGoal}%</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="repeat" size={30} color="#9c27b0" />
              </View>
              <Text style={styles.statLabel}>Iterative Sessions</Text>
              <Text style={styles.statValue}>{sessionTypes.iterative}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={30} color="#00ff88" />
              </View>
              <Text style={styles.statLabel}>Avg Improvement</Text>
              <Text style={styles.statValue}>{improvementStats.avgImprovement}%</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={30} color="#ff6b6b" />
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
              <Text style={styles.statValue}>{healthStats.streak}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowRecordingModal(true)}
            >
              <LinearGradient
                colors={['#00ffff', '#0080ff']}
                style={styles.actionGradient}
              >
                <Ionicons name="mic" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Record Breath</Text>
                <Text style={styles.actionSubtitle}>Start AI-guided analysis</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Journal')}
            >
              <LinearGradient
                colors={['#00ff88', '#00cc66']}
                style={styles.actionGradient}
              >
                <Ionicons name="book" size={32} color="#fff" />
                <Text style={styles.actionTitle}>View Journal</Text>
                <Text style={styles.actionSubtitle}>Track your progress</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Reports')}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ff5252']}
                style={styles.actionGradient}
              >
                <Ionicons name="bar-chart" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Check Reports</Text>
                <Text style={styles.actionSubtitle}>View health insights</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Settings')}
            >
              <LinearGradient
                colors={['#aa6bff', '#8a5cf6']}
                style={styles.actionGradient}
              >
                <Ionicons name="settings" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitle}>Customize your app</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Recent Activity with Iteration Details */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>🔄 Recent Iteration Sessions</Text>
          
          <View style={styles.sessionList}>
            {iterationHistory.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.enhancedSessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionIcon}>
                    <Ionicons 
                      name={session.sessionType === 'iterative' ? "repeat" : "radio-button-on"} 
                      size={24} 
                      color={session.sessionType === 'iterative' ? '#9c27b0' : '#00ffff'} 
                    />
                  </View>
                  <View style={styles.sessionMainInfo}>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                    <Text style={styles.sessionType}>
                      {session.sessionType === 'iterative' ? 
                        `${session.iterations.length} Iterations` : 
                        'Single Recording'
                      }
                    </Text>
                    <Text style={styles.sessionDuration}>⏱️ {session.duration}</Text>
                  </View>
                  <View style={styles.sessionScores}>
                    {session.sessionType === 'iterative' ? (
                      <View>
                        <Text style={styles.improvementText}>+{session.improvement} pts</Text>
                        <Text style={styles.finalScoreText}>
                          {session.iterations[session.iterations.length - 1].score}/100
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.singleScoreText}>{session.iterations[0].score}/100</Text>
                    )}
                  </View>
                </View>
                
                {session.sessionType === 'iterative' && (
                  <View style={styles.iterationProgress}>
                    <Text style={styles.iterationProgressTitle}>Iteration Progress:</Text>
                    <View style={styles.iterationDots}>
                      {session.iterations.map((iter, index) => (
                        <View key={index} style={styles.iterationDot}>
                          <View 
                            style={[
                              styles.iterationDotInner, 
                              { backgroundColor: getRiskColor(iter.risk) }
                            ]} 
                          />
                          <Text style={styles.iterationDotScore}>{iter.score}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                <View style={styles.sessionCategory}>
                  <Text style={styles.categoryLabel}>Focus: </Text>
                  <Text style={styles.categoryValue}>
                    {session.affirmationCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => setShowAnalytics(true)}
          >
            <Text style={styles.viewAllText}>View All Sessions & Analytics 📊</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Health Tip with Iteration Focus */}
        <View style={styles.tipContainer}>
          <LinearGradient
            colors={['rgba(156, 39, 176, 0.1)', 'rgba(103, 58, 183, 0.1)']}
            style={styles.tipGradient}
          >
            <Ionicons name="bulb" size={24} color="#9c27b0" />
            <Text style={styles.tipTitle}>💡 Iterative Session Tip</Text>
            <Text style={styles.tipText}>
              Try starting with "Healing Support" affirmations if you're feeling stressed, then let the AI adapt your session for optimal improvement. Most users see 8-15 point improvements in iterative sessions!
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
      
      <RecordingModal />
      <PromptModal />
      <RecordingProgressModal />
      <AnalyticsModal />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  profileButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  progressCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressCircleBackground: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    position: 'absolute',
  },
  progressCircleFill: {
    position: 'absolute',
  },
  progressTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 50) / 2,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sessionList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  enhancedSessionCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sessionMainInfo: {
    flex: 1,
    marginLeft: 15,
  },
  sessionDate: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  sessionType: {
    fontSize: 14,
    color: '#9c27b0',
    fontWeight: '500',
    marginTop: 2,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  sessionScores: {
    alignItems: 'flex-end',
  },
  improvementText: {
    fontSize: 14,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  finalScoreText: {
    fontSize: 16,
    color: '#00ffff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  singleScoreText: {
    fontSize: 16,
    color: '#00ffff',
    fontWeight: 'bold',
  },
  iterationProgress: {
    marginTop: 10,
    marginBottom: 10,
  },
  iterationProgressTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  iterationDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iterationDot: {
    alignItems: 'center',
  },
  iterationDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  iterationDotScore: {
    fontSize: 10,
    color: '#ccc',
    fontWeight: '500',
  },
  sessionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#888',
  },
  categoryValue: {
    fontSize: 12,
    color: '#9c27b0',
    fontWeight: '500',
  },
  viewAllButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  viewAllText: {
    color: '#9c27b0',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analyticsSection: {
    marginVertical: 15,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  
  // Weekly Trends Styles
  weeklyTrendCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  weeklyTrendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyTrendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  weeklyTrendImprovement: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  weeklyTrendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weeklyTrendStat: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  
  // Improvement Statistics Styles
  improvementStatsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  improvementStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  improvementStat: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  improvementStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 5,
  },
  improvementStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bestSessionInfo: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  bestSessionText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
  },
  
  // Session Type Styles
  sessionTypeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sessionType: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  sessionTypeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0080ff',
    marginBottom: 5,
  },
  sessionTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  sessionTypeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  sessionTypeInsight: {
    backgroundColor: 'rgba(0,128,255,0.1)',
    borderRadius: 10,
    padding: 12,
  },
  sessionTypeInsightText: {
    fontSize: 14,
    color: '#0080ff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Session History Styles
  sessionHistoryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sessionHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionHistoryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionIterations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  iterationItem: {
    alignItems: 'center',
    flex: 1,
  },
  iterationNumber: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 3,
  },
  iterationScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  riskIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sessionImprovement: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
  },
  sessionImprovementText: {
    fontSize: 12,
    color: '#00ff88',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Monthly Overview Styles
  monthlyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStat: {
    alignItems: 'center',
    flex: 1,
  },
  monthlyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 5,
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyticsGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Recording Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingModalContainer: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recordingModalGradient: {
    padding: 30,
  },
  recordingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recordingOptions: {
    gap: 20,
  },
  recordingOptionCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  recordingOptionGradient: {
    padding: 25,
    alignItems: 'center',
    minHeight: 120,
  },
  recordingOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 5,
  },
  recordingOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Prompt Modal Styles
  promptModalContainer: {
    width: width * 0.9,
    borderRadius: 20,
    backgroundColor: 'rgba(15,15,15,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    overflow: 'hidden',
  },
  promptModalGradient: {
    padding: 30,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  promptText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
    backgroundColor: 'rgba(0,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
  },
  promptInstruction: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  startRecordingButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  startRecordingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  startRecordingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Recording Progress Modal Styles
  recordingProgressContainer: {
    width: width * 0.8,
    borderRadius: 20,
    backgroundColor: 'rgba(15,15,15,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    overflow: 'hidden',
  },
  recordingProgressGradient: {
    padding: 40,
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'relative',
    marginBottom: 30,
  },
  recordingPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,107,107,0.3)',
    top: -20,
    left: -20,
  },
  recordingStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  recordingTimeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  recordingInstructionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  stopRecordingButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  stopRecordingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  stopRecordingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Health Tip Styles
  tipContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9c27b0',
    marginBottom: 8,
    marginLeft: 10,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    flex: 1,
    marginLeft: 10,
  },
});

export default DashboardScreen;
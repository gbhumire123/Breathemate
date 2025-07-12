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
      navigation.navigate('Auth');
    } catch (error) {
      console.log('Error logging out:', error);
    }
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
              <View key={index} style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendWeek}>{week.week}</Text>
                  <Text style={styles.trendScore}>{week.avgScore}/100</Text>
                </View>
                <View style={styles.trendDetails}>
                  <Text style={styles.trendDetail}>📋 {week.sessions} sessions</Text>
                  <Text style={styles.trendDetail}>📈 +{week.improvement}% improvement</Text>
                </View>
                <View style={styles.trendProgress}>
                  <View 
                    style={[
                      styles.trendProgressBar, 
                      { width: `${week.avgScore}%`, backgroundColor: week.avgScore >= 80 ? '#00ff88' : '#ffaa00' }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Improvement Statistics */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>🎯 Improvement Statistics</Text>
            <View style={styles.improvementGrid}>
              <View style={styles.improvementCard}>
                <Ionicons name="trending-up" size={24} color="#00ff88" />
                <Text style={styles.improvementValue}>{improvementStats.avgImprovement}%</Text>
                <Text style={styles.improvementLabel}>Avg Improvement</Text>
              </View>
              <View style={styles.improvementCard}>
                <Ionicons name="star" size={24} color="#ffaa00" />
                <Text style={styles.improvementValue}>{improvementStats.totalIterations}</Text>
                <Text style={styles.improvementLabel}>Total Iterations</Text>
              </View>
              <View style={styles.improvementCard}>
                <Ionicons name="checkmark-circle" size={24} color="#00ffff" />
                <Text style={styles.improvementValue}>{improvementStats.successRate}%</Text>
                <Text style={styles.improvementLabel}>Success Rate</Text>
              </View>
            </View>
            
            {improvementStats.bestSession && (
              <View style={styles.bestSessionCard}>
                <Text style={styles.bestSessionTitle}>🏆 Best Session</Text>
                <Text style={styles.bestSessionDate}>{formatDate(improvementStats.bestSession.date)}</Text>
                <Text style={styles.bestSessionScore}>
                  Final Score: {improvementStats.bestSession.finalScore}/100
                </Text>
                <Text style={styles.bestSessionImprovement}>
                  Improvement: +{improvementStats.bestSession.improvement} points
                </Text>
              </View>
            )}
          </View>

          {/* Session Type Distribution */}
          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>📊 Session Distribution</Text>
            <View style={styles.distributionContainer}>
              <View style={styles.distributionCard}>
                <View style={[styles.distributionIcon, { backgroundColor: 'rgba(0, 255, 255, 0.2)' }]}>
                  <Ionicons name="radio-button-on" size={24} color="#00ffff" />
                </View>
                <Text style={styles.distributionCount}>{sessionTypes.single}</Text>
                <Text style={styles.distributionLabel}>Single Sessions</Text>
              </View>
              <View style={styles.distributionCard}>
                <View style={[styles.distributionIcon, { backgroundColor: 'rgba(156, 39, 176, 0.2)' }]}>
                  <Ionicons name="repeat" size={24} color="#9c27b0" />
                </View>
                <Text style={styles.distributionCount}>{sessionTypes.iterative}</Text>
                <Text style={styles.distributionLabel}>Iterative Sessions</Text>
              </View>
            </View>
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
              onPress={() => navigation.navigate('Record')}
            >
              <LinearGradient
                colors={['#00ffff', '#0080ff']}
                style={styles.actionGradient}
              >
                <Ionicons name="mic" size={32} color="#fff" />
                <Text style={styles.actionTitle}>Record Breath</Text>
                <Text style={styles.actionSubtitle}>Start a new analysis</Text>
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
    marginBottom: 30,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  monthlyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  monthlyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStat: {
    alignItems: 'center',
  },
  monthlyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  trendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendWeek: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  trendScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  trendDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trendDetail: {
    fontSize: 12,
    color: '#888',
  },
  trendProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trendProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  improvementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  improvementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  improvementValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  improvementLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  bestSessionCard: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.2)',
  },
  bestSessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 8,
  },
  bestSessionDate: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  bestSessionScore: {
    fontSize: 14,
    color: '#00ffff',
    marginBottom: 2,
  },
  bestSessionImprovement: {
    fontSize: 14,
    color: '#00ff88',
  },
  distributionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  distributionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  distributionCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  distributionLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default DashboardScreen;
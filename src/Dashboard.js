import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
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

  useEffect(() => {
    loadUserData();
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

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}! 👋</Text>
              <Text style={styles.subtitle}>Ready to check your breathing health?</Text>
            </View>
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

        {/* Health Overview */}
        <View style={styles.overviewContainer}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <CircularProgress percentage={healthStats.dailyGoal} size={70} />
              <Text style={styles.statLabel}>Daily Goal</Text>
              <Text style={styles.statValue}>{healthStats.dailyGoal}%</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={30} color="#00ff88" />
              </View>
              <Text style={styles.statLabel}>Weekly Sessions</Text>
              <Text style={styles.statValue}>{healthStats.weeklySessions}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={30} color="#ffaa00" />
              </View>
              <Text style={styles.statLabel}>Average Score</Text>
              <Text style={styles.statValue}>{healthStats.averageScore}</Text>
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

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          
          <View style={styles.sessionList}>
            {[
              { time: '2 hours ago', score: 92, status: 'Excellent' },
              { time: 'Yesterday', score: 78, status: 'Good' },
              { time: '2 days ago', score: 85, status: 'Very Good' },
            ].map((session, index) => (
              <View key={index} style={styles.sessionCard}>
                <View style={styles.sessionIcon}>
                  <Ionicons 
                    name="pulse" 
                    size={24} 
                    color={session.score >= 80 ? '#00ff88' : '#ffaa00'} 
                  />
                </View>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionTime}>{session.time}</Text>
                  <Text style={styles.sessionStatus}>{session.status}</Text>
                </View>
                <View style={styles.sessionScore}>
                  <Text style={styles.sessionScoreText}>{session.score}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Health Tip */}
        <View style={styles.tipContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
            style={styles.tipGradient}
          >
            <Ionicons name="bulb" size={24} color="#00ffff" />
            <Text style={styles.tipTitle}>Today's Health Tip</Text>
            <Text style={styles.tipText}>
              Practice deep breathing exercises for 5 minutes each morning to improve your lung capacity and reduce stress.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
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
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
  sessionDetails: {
    flex: 1,
  },
  sessionTime: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  sessionStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  sessionScore: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sessionScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  tipContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tipGradient: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginTop: 10,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default DashboardScreen;
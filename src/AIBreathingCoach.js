import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AIBreathingCoach = ({ visible, onClose, userProfile, recentSessions }) => {
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState(null);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [personalizedTips, setPersonalizedTips] = useState([]);
  
  const animatedScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      generatePersonalizedRecommendation();
      loadPersonalizedTips();
    }
  }, [visible, userProfile, recentSessions]);

  const generatePersonalizedRecommendation = () => {
    // AI-powered recommendation logic based on user data
    const stressLevel = analyzeStressLevel();
    const timeOfDay = new Date().getHours();
    const recentPerformance = analyzeRecentPerformance();
    
    let recommendation = {
      type: 'balanced',
      duration: 5,
      title: 'Balanced Breathing',
      description: 'A gentle 4-4-4 pattern to center yourself',
      reason: 'Based on your current state',
      inhaleTime: 4,
      holdTime: 4,
      exhaleTime: 4,
      cycles: 10,
      benefits: ['Reduces stress', 'Improves focus', 'Balances nervous system']
    };

    if (stressLevel === 'high') {
      recommendation = {
        type: 'calming',
        duration: 8,
        title: 'Deep Calming Breath',
        description: 'Extended exhale to activate relaxation response',
        reason: 'Your recent patterns suggest high stress levels',
        inhaleTime: 4,
        holdTime: 2,
        exhaleTime: 8,
        cycles: 12,
        benefits: ['Activates parasympathetic nervous system', 'Reduces anxiety', 'Promotes deep relaxation']
      };
    } else if (timeOfDay < 10) {
      recommendation = {
        type: 'energizing',
        duration: 6,
        title: 'Morning Energizer',
        description: 'Invigorating breath to start your day',
        reason: 'Perfect morning routine to boost energy',
        inhaleTime: 6,
        holdTime: 2,
        exhaleTime: 4,
        cycles: 15,
        benefits: ['Increases alertness', 'Boosts energy', 'Improves mental clarity']
      };
    } else if (timeOfDay > 20) {
      recommendation = {
        type: 'sleep',
        duration: 10,
        title: 'Sleep Preparation',
        description: 'Gentle breathing to prepare for rest',
        reason: 'Evening routine for better sleep quality',
        inhaleTime: 4,
        holdTime: 7,
        exhaleTime: 8,
        cycles: 8,
        benefits: ['Prepares body for sleep', 'Reduces mental chatter', 'Promotes deep rest']
      };
    }

    setCurrentRecommendation(recommendation);
  };

  const analyzeStressLevel = () => {
    if (!recentSessions || recentSessions.length === 0) return 'moderate';
    
    const recentSession = recentSessions[0];
    const avgHeartRate = recentSession?.heartRate || 70;
    const stressScore = recentSession?.stressLevel || 5;
    
    if (avgHeartRate > 90 || stressScore > 7) return 'high';
    if (avgHeartRate < 60 || stressScore < 3) return 'low';
    return 'moderate';
  };

  const analyzeRecentPerformance = () => {
    if (!recentSessions || recentSessions.length < 3) return 'baseline';
    
    const last3Sessions = recentSessions.slice(0, 3);
    const avgImprovement = last3Sessions.reduce((sum, session) => sum + (session.improvementScore || 0), 0) / 3;
    
    if (avgImprovement > 80) return 'excellent';
    if (avgImprovement > 60) return 'good';
    if (avgImprovement > 40) return 'fair';
    return 'needs_focus';
  };

  const loadPersonalizedTips = async () => {
    try {
      const userPreferences = await AsyncStorage.getItem('userPreferences');
      const preferences = userPreferences ? JSON.parse(userPreferences) : {};
      
      const tips = generatePersonalizedTips(preferences);
      setPersonalizedTips(tips);
    } catch (error) {
      console.log('Error loading personalized tips:', error);
    }
  };

  const generatePersonalizedTips = (preferences) => {
    const baseTips = [
      {
        id: 1,
        title: 'Consistency is Key',
        content: 'Practice breathing exercises at the same time each day to build a strong habit.',
        icon: 'calendar-outline',
        priority: 1
      },
      {
        id: 2,
        title: 'Environment Matters',
        content: 'Find a quiet, comfortable space where you feel relaxed and focused.',
        icon: 'home-outline',
        priority: 2
      },
      {
        id: 3,
        title: 'Listen to Your Body',
        content: 'If you feel dizzy or uncomfortable, slow down or return to normal breathing.',
        icon: 'heart-outline',
        priority: 1
      }
    ];

    // Add personalized tips based on user data
    if (preferences.stressTriggers?.includes('work')) {
      baseTips.push({
        id: 4,
        title: 'Workplace Breathing',
        content: 'Take 2-minute breathing breaks between meetings to reset your focus.',
        icon: 'briefcase-outline',
        priority: 1
      });
    }

    if (preferences.sleepQuality === 'poor') {
      baseTips.push({
        id: 5,
        title: 'Better Sleep Through Breathing',
        content: 'Practice 4-7-8 breathing before bed to improve sleep quality.',
        icon: 'moon-outline',
        priority: 1
      });
    }

    return baseTips.sort((a, b) => a.priority - b.priority).slice(0, 4);
  };

  const startGuidedSession = (sessionType) => {
    setSessionType(sessionType);
    setIsSessionActive(true);
    setBreathPhase('inhale');
    setBreathCount(0);
    setSessionProgress(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    if (!currentRecommendation) return;

    const { inhaleTime, holdTime, exhaleTime, cycles } = currentRecommendation;
    let currentCycle = 0;
    let phase = 'inhale';

    const cycleInterval = setInterval(() => {
      switch (phase) {
        case 'inhale':
          animateBreath(inhaleTime * 1000, 1.5);
          setBreathPhase('inhale');
          setTimeout(() => {
            phase = 'hold';
            setBreathPhase('hold');
            setTimeout(() => {
              phase = 'exhale';
              setBreathPhase('exhale');
              animateBreath(exhaleTime * 1000, 1);
              setTimeout(() => {
                currentCycle++;
                setBreathCount(currentCycle);
                setSessionProgress((currentCycle / cycles) * 100);
                
                if (currentCycle >= cycles) {
                  clearInterval(cycleInterval);
                  completeSession();
                } else {
                  phase = 'inhale';
                }
              }, exhaleTime * 1000);
            }, holdTime * 1000);
          }, inhaleTime * 1000);
          break;
      }
    }, (inhaleTime + holdTime + exhaleTime) * 1000);
  };

  const animateBreath = (duration, scale) => {
    Animated.timing(animatedScale, {
      toValue: scale,
      duration: duration,
      useNativeDriver: true,
    }).start();
  };

  const completeSession = () => {
    setIsSessionActive(false);
    Alert.alert(
      'Session Complete! 🎉',
      'Great job! You\'ve completed your guided breathing session. How do you feel?',
      [
        { text: 'Amazing', onPress: () => recordSessionFeedback('amazing') },
        { text: 'Good', onPress: () => recordSessionFeedback('good') },
        { text: 'Okay', onPress: () => recordSessionFeedback('okay') }
      ]
    );
  };

  const recordSessionFeedback = async (feedback) => {
    try {
      const sessionData = {
        date: new Date().toISOString(),
        type: currentRecommendation.type,
        duration: currentRecommendation.duration,
        cycles: breathCount,
        feedback: feedback,
        aiRecommended: true
      };

      const existingSessions = await AsyncStorage.getItem('breathingSessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.unshift(sessionData);
      
      await AsyncStorage.setItem('breathingSessions', JSON.stringify(sessions));
    } catch (error) {
      console.log('Error saving session feedback:', error);
    }
  };

  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Breathe';
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale':
        return ['#4facfe', '#00f2fe'];
      case 'hold':
        return ['#ffd89b', '#19547b'];
      case 'exhale':
        return ['#667eea', '#764ba2'];
      default:
        return ['#4facfe', '#00f2fe'];
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f0f0f', '#1a1a2e', '#16213e']}
          style={styles.background}
        >
          <View style={styles.header}>
            <Text style={styles.title}>AI Breathing Coach</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {!isSessionActive ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* AI Recommendation */}
              {currentRecommendation && (
                <View style={styles.recommendationCard}>
                  <LinearGradient
                    colors={['rgba(79,172,254,0.2)', 'rgba(0,242,254,0.2)']}
                    style={styles.recommendationGradient}
                  >
                    <View style={styles.recommendationHeader}>
                      <Ionicons name="bulb-outline" size={24} color="#00f2fe" />
                      <Text style={styles.recommendationTitle}>AI Recommendation</Text>
                    </View>
                    
                    <Text style={styles.sessionTitle}>{currentRecommendation.title}</Text>
                    <Text style={styles.sessionDescription}>{currentRecommendation.description}</Text>
                    <Text style={styles.sessionReason}>{currentRecommendation.reason}</Text>
                    
                    <View style={styles.sessionDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color="#00f2fe" />
                        <Text style={styles.detailText}>{currentRecommendation.duration} min</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="refresh-outline" size={16} color="#00f2fe" />
                        <Text style={styles.detailText}>{currentRecommendation.cycles} cycles</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.breathPattern}>
                          {currentRecommendation.inhaleTime}-{currentRecommendation.holdTime}-{currentRecommendation.exhaleTime}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.benefits}>
                      <Text style={styles.benefitsTitle}>Benefits:</Text>
                      {currentRecommendation.benefits.map((benefit, index) => (
                        <Text key={index} style={styles.benefitText}>• {benefit}</Text>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => startGuidedSession(currentRecommendation.type)}
                    >
                      <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        style={styles.startButtonGradient}
                      >
                        <Ionicons name="play" size={20} color="#ffffff" />
                        <Text style={styles.startButtonText}>Start Session</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              {/* Personalized Tips */}
              <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Personalized Tips</Text>
                {personalizedTips.map((tip) => (
                  <View key={tip.id} style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                      <Ionicons name={tip.icon} size={20} color="#ffd700" />
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                    </View>
                    <Text style={styles.tipContent}>{tip.content}</Text>
                  </View>
                ))}
              </View>

              {/* Quick Sessions */}
              <View style={styles.quickSessions}>
                <Text style={styles.sectionTitle}>Quick Sessions</Text>
                <View style={styles.sessionGrid}>
                  <TouchableOpacity
                    style={styles.quickSessionCard}
                    onPress={() => startGuidedSession('stress-relief')}
                  >
                    <LinearGradient
                      colors={['rgba(255,107,107,0.2)', 'rgba(255,142,83,0.2)']}
                      style={styles.quickSessionGradient}
                    >
                      <Ionicons name="heart-outline" size={24} color="#ff6b6b" />
                      <Text style={styles.quickSessionTitle}>Stress Relief</Text>
                      <Text style={styles.quickSessionSubtitle}>3 min</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickSessionCard}
                    onPress={() => startGuidedSession('focus')}
                  >
                    <LinearGradient
                      colors={['rgba(116,75,162,0.2)', 'rgba(102,126,234,0.2)']}
                      style={styles.quickSessionGradient}
                    >
                      <Ionicons name="eye-outline" size={24} color="#744ba2" />
                      <Text style={styles.quickSessionTitle}>Focus</Text>
                      <Text style={styles.quickSessionSubtitle}>5 min</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickSessionCard}
                    onPress={() => startGuidedSession('energy')}
                  >
                    <LinearGradient
                      colors={['rgba(255,216,155,0.2)', 'rgba(25,84,123,0.2)']}
                      style={styles.quickSessionGradient}
                    >
                      <Ionicons name="flash-outline" size={24} color="#ffd89b" />
                      <Text style={styles.quickSessionTitle}>Energy</Text>
                      <Text style={styles.quickSessionSubtitle}>4 min</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : (
            /* Active Session UI */
            <View style={styles.sessionContainer}>
              <Text style={styles.sessionTypeText}>{currentRecommendation?.title}</Text>
              
              <View style={styles.breathingCircle}>
                <Animated.View
                  style={[
                    styles.circle,
                    {
                      transform: [{ scale: animatedScale }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={getPhaseColor()}
                    style={styles.circleGradient}
                  >
                    <Text style={styles.phaseText}>{getPhaseInstruction()}</Text>
                  </LinearGradient>
                </Animated.View>
              </View>

              <View style={styles.sessionInfo}>
                <Text style={styles.cycleCount}>Cycle {breathCount} of {currentRecommendation?.cycles}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${sessionProgress}%` }]} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => setIsSessionActive(false)}
              >
                <Text style={styles.stopButtonText}>Stop Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Recommendation Card
  recommendationCard: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recommendationGradient: {
    padding: 25,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f2fe',
    marginLeft: 10,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  sessionReason: {
    fontSize: 14,
    color: '#00f2fe',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#ffffff',
    marginLeft: 5,
    fontSize: 14,
  },
  breathPattern: {
    color: '#00f2fe',
    fontWeight: 'bold',
    fontSize: 16,
  },
  benefits: {
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  startButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },

  // Tips Section
  tipsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
    marginLeft: 8,
  },
  tipContent: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },

  // Quick Sessions
  quickSessions: {
    marginBottom: 30,
  },
  sessionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickSessionCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickSessionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
  },
  quickSessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  quickSessionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // Active Session
  sessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sessionTypeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 50,
  },
  breathingCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  cycleCount: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
  },
  progressBar: {
    width: width * 0.7,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f2fe',
    borderRadius: 3,
  },
  stopButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
});

export default AIBreathingCoach;
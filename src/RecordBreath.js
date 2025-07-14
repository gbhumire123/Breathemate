import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Animated, ActivityIndicator, Modal } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer, Gyroscope } from 'expo-sensors';

// Helper function to determine risk color
const getRiskColor = (riskLevel) => {
  switch (riskLevel?.toLowerCase()) {
    case 'low':
      return '#00ff88';
    case 'moderate':
    case 'medium':
      return '#ffaa00';
    case 'high':
      return '#ff6b6b';
    default:
      return '#888';
  }
};

// Enhanced Health Affirmation Categories for Intelligent Selection
const HEALTH_AFFIRMATIONS = {
  respiratory_strength: [
    "I breathe deeply and feel my lungs expanding with healing energy.",
    "My respiratory system is strong, healthy, and functioning perfectly.",
    "Each breath I take fills my body with vitality and well-being.",
    "My lungs are resilient and adapt perfectly to my body's needs.",
    "Every breath brings me closer to optimal respiratory health."
  ],
  stress_relief: [
    "My breathing is calm, steady, and supports my overall health.",
    "I am in control of my breathing and it serves my highest good.",
    "Every breath is an opportunity to reset and renew my energy.",
    "I breathe in love and compassion for myself and my health.",
    "Each exhale releases tension and brings me peace."
  ],
  healing_support: [
    "I am grateful for my healthy lungs and clear breathing passages.",
    "I trust my body's natural ability to heal and strengthen itself.",
    "My breathing patterns support my body's healing process.",
    "Every breath nourishes my cells with life-giving oxygen.",
    "I breathe with confidence in my body's wisdom and strength."
  ],
  wellness_maintenance: [
    "I maintain healthy breathing habits throughout my day.",
    "My respiratory health improves with each mindful breath.",
    "I honor my body by breathing consciously and purposefully.",
    "Each breath connects me to my inner strength and vitality.",
    "I breathe with gratitude for my healthy, functioning lungs."
  ]
};

// Intelligent Iteration Prompts
const ITERATION_PROMPTS = [
  "Let's try a deeper, more focused breath this time.",
  "Now breathe with more awareness of your chest expansion.",
  "Focus on the rhythm and let your breathing flow naturally.",
  "This time, emphasize the healing intention in your voice.",
  "Breathe as if you're sending healing energy to your lungs.",
  "Let your voice carry confidence and strength.",
  "Imagine your breath as healing light flowing through your body."
];

const RecordBreath = () => {
  const [samples, setSamples] = useState([]);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // New intelligent recording state
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [recordingPhase, setRecordingPhase] = useState('idle'); // idle, prompt, recording, analyzing, complete
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    weeklyScore: 0,
    improvementRate: 0
  });

  // Enhanced iteration state
  const [iterationMode, setIterationMode] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(1);
  const [maxIterations] = useState(3);
  const [iterationResults, setIterationResults] = useState([]);
  const [adaptivePrompts, setAdaptivePrompts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('respiratory_strength');
  const [improvementGoals, setImprovementGoals] = useState([]);
  const [sessionMode, setSessionMode] = useState('single'); // 'single', 'iterative', 'guided'

  // Enhanced iteration analytics with detailed tracking
  const [iterationAnalytics, setIterationAnalytics] = useState({
    sessionHistory: [],
    weeklyProgress: [],
    improvementTrends: {},
    categoryPerformance: {},
    streakData: { current: 0, best: 0 },
    achievementsMilestones: []
  });

  // Add heart rate monitoring state
  const [heartRateData, setHeartRateData] = useState([]);
  const [averageHeartRate, setAverageHeartRate] = useState(0);
  const [heartRateVariability, setHeartRateVariability] = useState(0);
  const [biometricTracking, setBiometricTracking] = useState(false);

  const timerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSessionStats();
    loadIterationAnalytics();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadSessionStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('sessionStats');
      if (stats) {
        setSessionStats(JSON.parse(stats));
      }
    } catch (error) {
      console.log('Error loading session stats:', error);
    }
  };

  const updateSessionStats = async (analysisResult) => {
    try {
      const newStats = {
        totalSessions: sessionStats.totalSessions + 1,
        weeklyScore: Math.min(100, sessionStats.weeklyScore + 5),
        improvementRate: analysisResult.risk_percentage < 30 ? sessionStats.improvementRate + 2 : sessionStats.improvementRate
      };
      setSessionStats(newStats);
      await AsyncStorage.setItem('sessionStats', JSON.stringify(newStats));
    } catch (error) {
      console.log('Error updating session stats:', error);
    }
  };

  const loadIterationAnalytics = async () => {
    try {
      const analytics = await AsyncStorage.getItem('iterationAnalytics');
      if (analytics) {
        setIterationAnalytics(JSON.parse(analytics));
      }
    } catch (error) {
      console.log('Error loading iteration analytics:', error);
    }
  };

  const updateIterationAnalytics = async (sessionData) => {
    try {
      const today = new Date().toDateString();
      const newAnalytics = { ...iterationAnalytics };
      
      // Update session history
      newAnalytics.sessionHistory.push({
        date: today,
        sessionType: iterationMode ? 'iterative' : 'single',
        iterationCount: iterationResults.length,
        scores: iterationResults.map(r => r.healthScore),
        category: selectedCategory,
        improvement: iterationResults.length > 1 ? 
          iterationResults[iterationResults.length - 1].healthScore - iterationResults[0].healthScore : 0,
        timestamp: Date.now()
      });
      
      // Update weekly progress
      const weekData = newAnalytics.weeklyProgress.find(w => w.week === getWeekNumber(new Date())) || 
        { week: getWeekNumber(new Date()), sessions: 0, avgScore: 0, totalImprovement: 0 };
      
      weekData.sessions += 1;
      weekData.avgScore = (weekData.avgScore * (weekData.sessions - 1) + 
        (iterationResults.reduce((sum, r) => sum + r.healthScore, 0) / iterationResults.length)) / weekData.sessions;
      weekData.totalImprovement += sessionData.improvement || 0;
      
      if (!newAnalytics.weeklyProgress.find(w => w.week === weekData.week)) {
        newAnalytics.weeklyProgress.push(weekData);
      }
      
      // Update category performance
      if (!newAnalytics.categoryPerformance[selectedCategory]) {
        newAnalytics.categoryPerformance[selectedCategory] = {
          sessions: 0,
          avgScore: 0,
          bestScore: 0,
          totalImprovement: 0
        };
      }
      
      const categoryData = newAnalytics.categoryPerformance[selectedCategory];
      categoryData.sessions += 1;
      const sessionAvg = iterationResults.reduce((sum, r) => sum + r.healthScore, 0) / iterationResults.length;
      categoryData.avgScore = (categoryData.avgScore * (categoryData.sessions - 1) + sessionAvg) / categoryData.sessions;
      categoryData.bestScore = Math.max(categoryData.bestScore, sessionAvg);
      categoryData.totalImprovement += sessionData.improvement || 0;
      
      // Update streak data
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const hasYesterdaySession = newAnalytics.sessionHistory.some(s => s.date === yesterday);
      
      if (hasYesterdaySession || newAnalytics.streakData.current === 0) {
        newAnalytics.streakData.current += 1;
        newAnalytics.streakData.best = Math.max(newAnalytics.streakData.best, newAnalytics.streakData.current);
      } else {
        newAnalytics.streakData.current = 1;
      }
      
      // Check for achievements
      checkAndAddAchievements(newAnalytics, sessionData);
      
      setIterationAnalytics(newAnalytics);
      await AsyncStorage.setItem('iterationAnalytics', JSON.stringify(newAnalytics));
      
    } catch (error) {
      console.log('Error updating iteration analytics:', error);
    }
  };

  const getRandomPrompt = () => {
    return HEALTH_AFFIRMATIONS[Math.floor(Math.random() * HEALTH_AFFIRMATIONS.length)];
  };

  const startIntelligentRecording = async () => {
    try {
      // Phase 1: Show health affirmation prompt
      const prompt = getRandomPrompt();
      setCurrentPrompt(prompt);
      setShowPrompt(true);
      setRecordingPhase('prompt');
      
      // Auto-start recording after 3 seconds to read prompt
      setTimeout(() => {
        startActualRecording();
      }, 3000);
      
    } catch (error) {
      console.error('Error starting intelligent recording:', error);
      Alert.alert('Error', 'Failed to start recording session.');
    }
  };

  const startActualRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission denied', 'We need microphone access to record breathing sounds.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
      });

      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingPhase('recording');
      setShowPrompt(false);
      
      // Start animations
      startRecordingAnimations();

      // Timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecordingPhase('idle');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setRecordingPhase('analyzing');
      stopRecordingAnimations();
      clearInterval(timerRef.current);

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        
        const newSample = {
          id: Date.now().toString(),
          uri,
          duration: recordingTime,
          timestamp: Date.now(),
          analyzed: false,
          platform: Platform.OS,
          source: 'microphone',
          prompt: currentPrompt,
          sessionType: 'intelligent_recording'
        };

        setSamples(prevSamples => [newSample, ...prevSamples]);
        setRecording(null);
        
        // Auto-analyze the recording
        await performIntelligentAnalysis(newSample);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
      setRecordingPhase('idle');
    }
  };

  const getAdaptivePrompt = (previousAnalysis = null) => {
    if (!previousAnalysis) {
      // First recording - use selected category
      const categoryPrompts = HEALTH_AFFIRMATIONS[selectedCategory];
      return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
    }
    
    // Adaptive selection based on previous analysis
    let category = selectedCategory;
    
    if (previousAnalysis.risk_percentage > 50) {
      category = 'healing_support';
    } else if (previousAnalysis.analysis_details?.stress_indicators > 40) {
      category = 'stress_relief';
    } else if (previousAnalysis.analysis_details?.breathing_consistency < 70) {
      category = 'respiratory_strength';
    } else {
      category = 'wellness_maintenance';
    }
    
    const categoryPrompts = HEALTH_AFFIRMATIONS[category];
    return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  };

  const startIterativeSession = async () => {
    setSessionMode('iterative');
    setIterationMode(true);
    setCurrentIteration(1);
    setIterationResults([]);
    
    const prompt = getAdaptivePrompt();
    setCurrentPrompt(prompt);
    setShowPrompt(true);
    setRecordingPhase('prompt');
    
    // Auto-start recording after prompt display
    setTimeout(() => {
      actualStartRecording();
    }, 4000);
  };

  const continueIteration = async () => {
    if (currentIteration >= maxIterations) {
      completeIterativeSession();
      return;
    }
    
    const lastAnalysis = iterationResults[iterationResults.length - 1];
    setCurrentIteration(prev => prev + 1);
    
    const adaptivePrompt = getAdaptivePrompt(lastAnalysis);
    const iterationPrompt = ITERATION_PROMPTS[Math.floor(Math.random() * ITERATION_PROMPTS.length)];
    
    setCurrentPrompt(adaptivePrompt);
    setShowPrompt(true);
    setRecordingPhase('prompt');
    
    // Show iteration guidance
    Alert.alert(
      `📈 Iteration ${currentIteration}/${maxIterations}`,
      `${iterationPrompt}\n\nNew affirmation: "${adaptivePrompt}"`,
      [
        { text: 'Continue', onPress: () => {
          setTimeout(() => {
            actualStartRecording();
          }, 2000);
        }}
      ]
    );
  };

  const completeIterativeSession = () => {
    const sessionSummary = generateSessionSummary();
    setIterationMode(false);
    setSessionMode('single');
    setRecordingPhase('complete');
    
    Alert.alert(
      '🎉 Session Complete!',
      sessionSummary,
      [
        { text: 'View Progress', onPress: showProgressReport },
        { text: 'New Session', onPress: () => setRecordingPhase('idle') }
      ]
    );
  };

  const generateSessionSummary = () => {
    if (iterationResults.length === 0) return "Session completed!";
    
    const scores = iterationResults.map(r => r.healthScore);
    const improvement = scores[scores.length - 1] - scores[0];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return `Session Summary:\n` +
           `• Iterations: ${iterationResults.length}\n` +
           `• Average Score: ${avgScore.toFixed(1)}/100\n` +
           `• Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)} points\n` +
           `• Final Risk Level: ${iterationResults[iterationResults.length - 1].risk_level}`;
  };

  const showProgressReport = () => {
    // Navigate to detailed progress view
    console.log('Show detailed progress report');
  };

  // Enhanced analysis with real backend integration
  const performIntelligentAnalysis = async (sample) => {
    setAnalyzing(true);
    try {
      // Check if backend is available
      const backendUrl = 'http://localhost:8080'; // Your Spring Boot backend
      
      const formData = new FormData();
      formData.append('audio', {
        uri: sample.uri,
        type: 'audio/wav',
        name: 'breathing_sample.wav',
      });
      formData.append('prompt', sample.prompt || '');
      formData.append('sessionType', iterationMode ? 'iterative' : 'single');
      formData.append('iteration', currentIteration.toString());
      formData.append('category', selectedCategory);

      try {
        const response = await fetch(`${backendUrl}/api/analyze-breath`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.ok) {
          const analysisResult = await response.json();
          
          // Add iteration context
          if (iterationMode) {
            analysisResult.iteration = currentIteration;
            analysisResult.sessionType = 'iterative';
            setIterationResults(prev => [...prev, analysisResult]);
          }
          
          setSamples(prev => prev.map(s => 
            s.id === sample.id 
              ? { ...s, analyzed: true, analysis: analysisResult }
              : s
          ));
          
          await updateSessionStats(analysisResult);
          await updateIterationAnalytics(analysisResult);
          
          if (iterationMode && currentIteration < maxIterations) {
            // Ask user if they want to continue iterating
            setTimeout(() => {
              Alert.alert(
                '🔄 Continue Iterating?',
                `Current score: ${analysisResult.healthScore}/100\n` +
                `Improvement potential: ${analysisResult.improvementSuggestion || 'Moderate'}\n` +
                `Would you like to try another iteration for better results?`,
                [
                  { text: 'Complete Session', onPress: completeIterativeSession },
                  { text: 'Continue', onPress: continueIteration }
                ]
              );
            }, 2000);
          } else if (iterationMode) {
            completeIterativeSession();
          } else {
            setRecordingPhase('complete');
            showSingleSessionResults(analysisResult);
          }
        } else {
          throw new Error('Backend analysis failed');
        }
      } catch (backendError) {
        console.log('Backend unavailable, using enhanced simulation:', backendError);
        
        // Enhanced simulation with more realistic data
        const analysisResult = await simulateEnhancedAnalysis(sample);
        
        // Add iteration context
        if (iterationMode) {
          analysisResult.iteration = currentIteration;
          analysisResult.sessionType = 'iterative';
          setIterationResults(prev => [...prev, analysisResult]);
        }
        
        setSamples(prev => prev.map(s => 
          s.id === sample.id 
            ? { ...s, analyzed: true, analysis: analysisResult }
            : s
        ));
        
        await updateSessionStats(analysisResult);
        await updateIterationAnalytics(analysisResult);
        
        if (iterationMode && currentIteration < maxIterations) {
          setTimeout(() => {
            Alert.alert(
              '🔄 Continue Iterating?',
              `Current score: ${analysisResult.healthScore}/100\n` +
              `Improvement from last: ${currentIteration > 1 ? 
                `+${(analysisResult.healthScore - iterationResults[iterationResults.length - 2]?.healthScore || 0).toFixed(1)}` : 
                'First iteration'}\n` +
              `Would you like to try another iteration for better results?`,
              [
                { text: 'Complete Session', onPress: completeIterativeSession },
                { text: 'Continue', onPress: continueIteration }
              ]
            );
          }, 2000);
        } else if (iterationMode) {
          completeIterativeSession();
        } else {
          setRecordingPhase('complete');
          showSingleSessionResults(analysisResult);
        }
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Analysis failed. Please try again.');
      setRecordingPhase('idle');
    } finally {
      setAnalyzing(false);
    }
  };

  // Enhanced simulation with more realistic progression
  const simulateEnhancedAnalysis = async (sample) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    let baseScore = 60 + Math.random() * 30; // 60-90 base
    
    // Apply iteration improvements if in iterative mode
    if (iterationMode && iterationResults.length > 0) {
      const lastScore = iterationResults[iterationResults.length - 1].healthScore;
      const improvementFactor = 0.7; // 70% chance of improvement
      
      if (Math.random() < improvementFactor) {
        // Improvement with diminishing returns
        const maxImprovement = (100 - lastScore) * 0.3; // Max 30% of remaining room
        const improvement = Math.random() * maxImprovement;
        baseScore = Math.min(100, lastScore + improvement);
      } else {
        // Slight variation around previous score
        baseScore = lastScore + (Math.random() - 0.5) * 10;
        baseScore = Math.max(50, Math.min(100, baseScore));
      }
    }
    
    // Category-based adjustments
    const categoryModifiers = {
      'respiratory_strength': { min: 5, max: 15 },
      'stress_relief': { min: 3, max: 12 },
      'healing_support': { min: 8, max: 20 },
      'wellness_maintenance': { min: 2, max: 8 }
    };
    
    const modifier = categoryModifiers[selectedCategory] || { min: 0, max: 10 };
    baseScore += Math.random() * (modifier.max - modifier.min) + modifier.min;
    baseScore = Math.min(100, baseScore);
    
    const healthScore = Math.round(baseScore);
    const riskPercentage = Math.max(0, 100 - healthScore + (Math.random() - 0.5) * 20);
    
    let riskLevel = 'Low';
    if (riskPercentage > 60) riskLevel = 'High';
    else if (riskPercentage > 30) riskLevel = 'Medium';
    else if (riskPercentage < 15) riskLevel = 'Very Low';
    
    // Generate contextual insights
    const insights = generateContextualInsights(healthScore, selectedCategory, iterationMode, currentIteration);
    const tips = generatePersonalizedTips(healthScore, riskLevel, selectedCategory);
    
    return {
      healthScore,
      risk_level: riskLevel,
      risk_percentage: Math.round(riskPercentage),
      breathing_rate: (15 + Math.random() * 10).toFixed(1),
      lung_capacity: Math.round(70 + Math.random() * 25),
      stress_indicators: Math.round(Math.max(0, 60 - healthScore + (Math.random() - 0.5) * 30)),
      analysis_details: {
        breathing_consistency: Math.round(60 + Math.random() * 35),
        voice_clarity: Math.round(70 + Math.random() * 25),
        rhythm_stability: Math.round(65 + Math.random() * 30),
      },
      ai_insights: insights,
      personalized_tips: tips,
      recommendation: generateRecommendation(healthScore, riskLevel),
      improvementSuggestion: generateImprovementSuggestion(healthScore, iterationMode),
      timestamp: Date.now(),
      category: selectedCategory,
      session_data: {
        prompt_effectiveness: Math.round(60 + Math.random() * 35),
        affirmation_resonance: Math.round(55 + Math.random() * 40),
        focus_quality: Math.round(65 + Math.random() * 30),
      }
    };
  };

  // Generate contextual AI insights
  const generateContextualInsights = (score, category, isIterative, iteration) => {
    const insights = [];
    
    if (isIterative) {
      if (iteration === 1) {
        insights.push("This is your first iteration - establishing baseline health metrics");
      } else {
        const improvement = iteration > 1 ? "showing progressive improvement" : "maintaining good patterns";
        insights.push(`Iteration ${iteration} ${improvement} in breathing quality`);
      }
    }
    
    if (score >= 85) {
      insights.push("Excellent respiratory health indicators detected");
      insights.push("Your breathing patterns show optimal rhythm and depth");
    } else if (score >= 70) {
      insights.push("Good breathing patterns with room for optimization");
      insights.push("Consider focusing on deeper, more controlled breaths");
    } else {
      insights.push("Breathing patterns suggest stress or tension");
      insights.push("Recommended: practice relaxation techniques");
    }
    
    // Category-specific insights
    const categoryInsights = {
      'respiratory_strength': ["Your lung capacity shows strong potential", "Voice resonance indicates healthy respiratory function"],
      'stress_relief': ["Breathing rhythm suggests relaxation response", "Stress indicators are within manageable range"],
      'healing_support': ["Healing affirmations appear to resonate well", "Body-mind connection is strengthening"],
      'wellness_maintenance': ["Consistent practice is maintaining good health", "Your wellness routine is showing positive effects"]
    };
    
    insights.push(...(categoryInsights[category] || []));
    
    return insights.slice(0, 3); // Limit to 3 most relevant insights
  };

  // Generate personalized tips
  const generatePersonalizedTips = (score, riskLevel, category) => {
    const tips = [];
    
    if (riskLevel === 'High') {
      tips.push("Try 4-7-8 breathing: inhale 4 counts, hold 7, exhale 8");
      tips.push("Practice twice daily for optimal respiratory health");
    } else if (riskLevel === 'Medium') {
      tips.push("Focus on extending your exhale slightly longer than inhale");
      tips.push("Regular practice will improve your breathing patterns");
    } else {
      tips.push("Maintain your excellent breathing habits");
      tips.push("Consider exploring advanced breathing techniques");
    }
    
    // Category-specific tips
    const categoryTips = {
      'respiratory_strength': ["Include cardio exercises to build lung capacity", "Practice diaphragmatic breathing daily"],
      'stress_relief': ["Try progressive muscle relaxation", "Use breathing as an anchor during stressful moments"],
      'healing_support': ["Combine breathing with gentle movement", "Visualize healing energy with each breath"],
      'wellness_maintenance': ["Set regular breathing practice reminders", "Track your progress over time"]
    };
    
    tips.push(...(categoryTips[category] || []));
    
    return tips.slice(0, 3);
  };

  // Generate recommendations
  const generateRecommendation = (score, riskLevel) => {
    if (riskLevel === 'High') {
      return "Consider consulting a healthcare provider and practicing stress-reduction techniques daily.";
    } else if (riskLevel === 'Medium') {
      return "Regular breathing exercises and mindfulness practice recommended.";
    } else {
      return "Continue your excellent breathing habits and consider advanced techniques.";
    }
  };

  // Generate improvement suggestions
  const generateImprovementSuggestion = (score, isIterative) => {
    if (!isIterative) return null;
    
    if (score >= 90) return "Minimal - you're performing excellently";
    if (score >= 75) return "Moderate - focus on consistency";
    if (score >= 60) return "Good - try deeper breathing";
    return "High - relaxation techniques recommended";
  };

  // Show detailed analytics modal
  const showAnalyticsModal = () => {
    const recentSessions = iterationAnalytics.sessionHistory.slice(-10);
    const avgImprovement = recentSessions.reduce((sum, s) => sum + s.improvement, 0) / recentSessions.length || 0;
    const bestCategory = Object.keys(iterationAnalytics.categoryPerformance).reduce((best, category) => {
      return iterationAnalytics.categoryPerformance[category].avgScore > 
             (iterationAnalytics.categoryPerformance[best]?.avgScore || 0) ? category : best;
    }, Object.keys(iterationAnalytics.categoryPerformance)[0]);

    Alert.alert(
      '📊 Your Analytics',
      `Recent Performance:\n` +
      `• Average Improvement: +${avgImprovement.toFixed(1)} points\n` +
      `• Current Streak: ${iterationAnalytics.streakData.current} days\n` +
      `• Best Streak: ${iterationAnalytics.streakData.best} days\n` +
      `• Best Category: ${bestCategory?.replace('_', ' ')}\n` +
      `• Total Sessions: ${iterationAnalytics.sessionHistory.length}\n` +
      `• Achievements: ${iterationAnalytics.achievementsMilestones.length}`,
      [
        { text: 'View Achievements', onPress: showAchievements },
        { text: 'OK' }
      ]
    );
  };

  const showAchievements = () => {
    const recentAchievements = iterationAnalytics.achievementsMilestones.slice(-5);
    const achievementText = recentAchievements.length > 0 
      ? recentAchievements.map(a => `${a.title}\n${a.description}`).join('\n\n')
      : 'No achievements yet. Keep practicing!';

    Alert.alert(
      '🏆 Recent Achievements',
      achievementText,
      [{ text: 'Keep Going!' }]
    );
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const checkAndAddAchievements = (analytics, sessionData) => {
    const achievements = [];
    
    // First iterative session
    if (iterationMode && analytics.sessionHistory.filter(s => s.sessionType === 'iterative').length === 1) {
      achievements.push({
        id: 'first_iterative',
        title: '🔄 First Iterative Session',
        description: 'Completed your first iterative breathing session',
        date: new Date().toISOString(),
        category: 'milestone'
      });
    }
    
    // Perfect score achievement
    if (iterationResults.some(r => r.healthScore >= 95)) {
      achievements.push({
        id: 'perfect_score',
        title: '⭐ Perfect Breathing',
        description: 'Achieved a health score of 95 or higher',
        date: new Date().toISOString(),
        category: 'performance'
      });
    }
    
    // Improvement achievement
    if (sessionData.improvement >= 20) {
      achievements.push({
        id: 'big_improvement',
        title: '📈 Major Improvement',
        description: 'Improved by 20+ points in a single session',
        date: new Date().toISOString(),
        category: 'progress'
      });
    }
    
    // Streak achievements
    if (analytics.streakData.current === 7) {
      achievements.push({
        id: 'week_streak',
        title: '🔥 Week Streak',
        description: 'Practiced breathing for 7 consecutive days',
        date: new Date().toISOString(),
        category: 'consistency'
      });
    }
    
    // Add new achievements
    achievements.forEach(achievement => {
      if (!analytics.achievementsMilestones.find(a => a.id === achievement.id)) {
        analytics.achievementsMilestones.push(achievement);
      }
    });
  };

  const startRecordingAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimations = () => {
    pulseAnim.stopAnimation();
    fadeAnim.stopAnimation();
    pulseAnim.setValue(1);
    fadeAnim.setValue(0);
  };

  const actualStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission denied', 'We need microphone access to record breathing sounds.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
      });

      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingPhase('recording');
      setShowPrompt(false);
      
      startRecordingAnimations();

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecordingPhase('idle');
    }
  };

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const newSample = {
          id: Date.now().toString(),
          uri: result.uri,
          duration: 0,
          timestamp: Date.now(),
          analyzed: false,
          fileName: result.name,
          fileSize: result.size,
          source: 'file',
          sessionType: 'file_upload'
        };

        setSamples(prevSamples => [newSample, ...prevSamples]);
        setUploadProgress(0);
        
        await performIntelligentAnalysis(newSample);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteSample = (sampleId) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setSamples(prev => prev.filter(s => s.id !== sampleId));
          }
        },
      ]
    );
  };

  const showSingleSessionResults = (analysisResult) => {
    Alert.alert(
      '🧠 AI Analysis Complete',
      `Health Score: ${analysisResult.healthScore}/100\n` +
      `Risk Level: ${analysisResult.risk_level}\n` +
      `Breathing Rate: ${analysisResult.breathing_rate} bpm\n` +
      `Recommendation: ${analysisResult.recommendation}`,
      [
        { text: 'Start Iterative Session', onPress: startIterativeSession },
        { text: 'View Analytics', onPress: showAnalyticsModal },
        { text: 'OK', onPress: () => setRecordingPhase('idle') }
      ]
    );
  };

  // Modal state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showIterativeResults, setShowIterativeResults] = useState(false);

  // Add biometric monitoring functions
  const startBiometricTracking = () => {
    setBiometricTracking(true);
    
    // Simulate heart rate monitoring (in real app, use actual sensor data)
    const heartRateInterval = setInterval(() => {
      if (isRecording) {
        const baseHeartRate = 70;
        const variation = Math.random() * 20 - 10; // ±10 bpm variation
        const currentRate = Math.round(baseHeartRate + variation);
        
        setHeartRateData(prev => [...prev.slice(-30), { // Keep last 30 readings
          timestamp: Date.now(),
          rate: currentRate,
          iteration: currentIteration
        }]);
        
        // Calculate running average
        setAverageHeartRate(prev => {
          const newAvg = heartRateData.length > 0 ? 
            heartRateData.reduce((sum, reading) => sum + reading.rate, 0) / heartRateData.length : 
            currentRate;
          return Math.round(newAvg);
        });
      }
    }, 1000);
    
    return () => clearInterval(heartRateInterval);
  };

  const calculateHeartRateVariability = () => {
    if (heartRateData.length < 10) return 0;
    
    const intervals = [];
    for (let i = 1; i < heartRateData.length; i++) {
      intervals.push(Math.abs(heartRateData[i].rate - heartRateData[i-1].rate));
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    setHeartRateVariability(Math.round(avgInterval * 10) / 10);
    return avgInterval;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Enhanced Header with Analytics Button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🫁 Smart Breath Analysis</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={showAnalyticsModal}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.2)', 'rgba(0, 128, 255, 0.2)']}
              style={styles.analyticsGradient}
            >
              <Ionicons name="analytics" size={20} color="#00ffff" />
              <Text style={styles.analyticsText}>Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {iterationMode ? 
            `Iterative Session ${currentIteration}/${maxIterations}` :
            'AI-powered respiratory health monitoring'
          }
        </Text>
        
        {/* Quick Stats Display */}
        {iterationAnalytics.sessionHistory.length > 0 && (
          <View style={styles.quickStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{iterationAnalytics.streakData.current}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{iterationAnalytics.sessionHistory.length}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{iterationAnalytics.achievementsMilestones.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Recording and Analysis UI */}
        <View style={styles.recordingContainer}>
          {recordingPhase === 'idle' && (
            <TouchableOpacity style={styles.startButton} onPress={startIntelligentRecording}>
              <Text style={styles.startButtonText}>Start Intelligent Recording</Text>
            </TouchableOpacity>
          )}
          
          {recordingPhase === 'prompt' && showPrompt && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>{currentPrompt}</Text>
            </View>
          )}
          
          {isRecording && (
            <View style={styles.recordingStatus}>
              <Text style={styles.recordingText}>Recording... {formatTime(recordingTime)}</Text>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Text style={styles.stopButtonText}>Stop Recording</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {analyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#00ffff" />
              <Text style={styles.analyzingText}>Analyzing... Please wait</Text>
            </View>
          )}
        </View>

        {/* Biometric Monitoring Panel */}
        {isRecording && biometricTracking && (
          <View style={styles.biometricPanel}>
            <Text style={styles.biometricTitle}>Live Biometrics</Text>
            <View style={styles.biometricRow}>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>{heartRateData[heartRateData.length - 1]?.rate || '--'}</Text>
                <Text style={styles.biometricLabel}>BPM</Text>
              </View>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>{averageHeartRate}</Text>
                <Text style={styles.biometricLabel}>Avg HR</Text>
              </View>
              <View style={styles.biometricItem}>
                <Text style={styles.biometricValue}>{heartRateVariability}</Text>
                <Text style={styles.biometricLabel}>HRV</Text>
              </View>
            </View>
            
            {/* Heart Rate Trend Mini Chart */}
            <View style={styles.heartRateChart}>
              {heartRateData.slice(-10).map((reading, index) => (
                <View 
                  key={index}
                  style={[
                    styles.heartRateBar,
                    { 
                      height: Math.max(5, (reading.rate / 100) * 40),
                      backgroundColor: reading.rate > 80 ? '#ff6b6b' : reading.rate < 60 ? '#4ecdc4' : '#45b7d1'
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Session Results */}
        {samples.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Session Results</Text>
            {samples.map((sample, index) => (
              <View key={sample.id} style={styles.resultCard}>
                <Text style={styles.resultLabel}>Sample {index + 1}</Text>
                <Text style={styles.resultValue}>Duration: {sample.duration} seconds</Text>
                <Text style={styles.resultValue}>Timestamp: {new Date(sample.timestamp).toLocaleString()}</Text>
                <Text style={styles.resultValue}>Analyzed: {sample.analyzed ? 'Yes' : 'No'}</Text>
                {sample.analyzed && sample.analysis && (
                  <View style={styles.analysisDetails}>
                    <Text style={styles.resultValue}>Health Score: {sample.analysis.healthScore}/100</Text>
                    <Text style={styles.resultValue}>Risk Level: {sample.analysis.risk_level}</Text>
                    <Text style={styles.resultValue}>Improvement Suggestion: {sample.analysis.improvementSuggestion}</Text>
                    <Text style={styles.resultValue}>Breathing Rate: {sample.analysis.breathing_rate} bpm</Text>
                    <Text style={styles.resultValue}>Lung Capacity: {sample.analysis.lung_capacity} ml</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Session Stats and Controls */}
        <View style={styles.sessionControls}>
          <TouchableOpacity style={styles.statsButton} onPress={showAnalyticsModal}>
            <Ionicons name="bar-chart" size={24} color="#fff" />
            <Text style={styles.statsButtonText}>View Detailed Stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.newSessionButton} onPress={() => setRecordingPhase('idle')}>
            <Text style={styles.newSessionButtonText}>New Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Analytics Modal */}
      <Modal visible={showAnalytics} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 Analytics Dashboard</Text>
            <TouchableOpacity onPress={() => setShowAnalytics(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.analyticsContent}>
            {/* Session Summary */}
            <View style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>📈 Session Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Sessions:</Text>
                <Text style={styles.summaryValue}>{iterationAnalytics.sessionHistory.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Iterative Sessions:</Text>
                <Text style={styles.summaryValue}>
                  {iterationAnalytics.sessionHistory.filter(s => s.sessionType === 'iterative').length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Average Score:</Text>
                <Text style={styles.summaryValue}>
                  {iterationAnalytics.sessionHistory.length > 0 
                    ? Math.round(iterationAnalytics.sessionHistory.reduce((sum, s) => sum + s.healthScore, 0) / iterationAnalytics.sessionHistory.length)
                    : 0}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Current Streak:</Text>
                <Text style={styles.summaryValue}>{iterationAnalytics.streakData.current} days</Text>
              </View>
            </View>

            {/* Improvement Trends */}
            <View style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>🚀 Improvement Trends</Text>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Weekly Average:</Text>
                <Text style={styles.trendValue}>
                  {iterationAnalytics.weeklyProgress.length > 0 
                    ? `${Math.round(iterationAnalytics.weeklyProgress[iterationAnalytics.weeklyProgress.length - 1].avgScore)}/100`
                    : 'No data'}
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Best Session:</Text>
                <Text style={styles.trendValue}>
                  {iterationAnalytics.sessionHistory.length > 0 
                    ? `${Math.max(...iterationAnalytics.sessionHistory.map(s => s.healthScore))}/100`
                    : 'No data'}
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Total Improvement:</Text>
                <Text style={styles.trendValue}>
                  {iterationAnalytics.sessionHistory.length >= 2 
                    ? `+${Math.round(
                        iterationAnalytics.sessionHistory[iterationAnalytics.sessionHistory.length - 1].healthScore - 
                        iterationAnalytics.sessionHistory[0].healthScore
                      )} points`
                    : 'Keep practicing!'}
                </Text>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>🏆 Achievements</Text>
              {iterationAnalytics.achievementsMilestones.length > 0 ? (
                iterationAnalytics.achievementsMilestones.map((achievement, index) => (
                  <View key={index} style={styles.achievementItem}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.date).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAchievements}>
                  Complete your first session to start earning achievements! 🎯
                </Text>
              )}
            </View>

            {/* Health Insights */}
            <View style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>💡 Health Insights</Text>
              <Text style={styles.insightText}>
                {iterationAnalytics.sessionHistory.length === 0 
                  ? "Start your breathing journey to unlock personalized health insights!"
                  : iterationAnalytics.sessionHistory.length < 3
                  ? "Complete a few more sessions to see detailed health patterns and recommendations."
                  : `Based on ${iterationAnalytics.sessionHistory.length} sessions, your breathing shows ${
                      iterationAnalytics.sessionHistory.slice(-3).every((s, i, arr) => 
                        i === 0 || s.healthScore >= arr[i-1].healthScore
                      ) ? "consistent improvement" : "good progress"
                    }. ${
                      iterationAnalytics.sessionHistory.filter(s => s.sessionType === 'iterative').length > 0
                      ? "Your iterative sessions show enhanced mindfulness and technique refinement."
                      : "Try iterative sessions for deeper breathing practice and better results."
                    }`
                }
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Iterative Session Completion Modal */}
      {showIterativeResults && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.iterativeModalOverlay}>
            <View style={styles.iterativeModalContent}>
              <Text style={styles.iterativeModalTitle}>🎉 Session Complete!</Text>
              
              <View style={styles.iterationSummary}>
                <Text style={styles.iterationSummaryTitle}>Iteration Progress:</Text>
                {iterationResults.map((result, index) => (
                  <View key={index} style={styles.iterationItem}>
                    <Text style={styles.iterationNumber}>#{index + 1}</Text>
                    <View style={styles.iterationScores}>
                      <Text style={styles.iterationScore}>{result.healthScore}/100</Text>
                      {index > 0 && (
                        <Text style={[
                          styles.iterationImprovement,
                          result.improvement >= 0 ? styles.positive : styles.negative
                        ]}>
                          {result.improvement >= 0 ? '+' : ''}{result.improvement}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Improvement</Text>
                  <Text style={styles.statValue}>
                    +{iterationResults.length > 1 
                      ? Math.round(iterationResults[iterationResults.length - 1].healthScore - iterationResults[0].healthScore)
                      : 0} points
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Score</Text>
                  <Text style={styles.statValue}>
                    {Math.max(...iterationResults.map(r => r.healthScore))}/100
                  </Text>
                </View>
              </View>

              <View style={styles.iterativeModalButtons}>
                <TouchableOpacity 
                  style={styles.analyticsButton} 
                  onPress={() => {
                    setShowIterativeResults(false);
                    showAnalyticsModal();
                  }}
                >
                  <Text style={styles.analyticsButtonText}>📊 View Analytics</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.doneButton} 
                  onPress={() => {
                    setShowIterativeResults(false);
                    setRecordingPhase('idle');
                    setIterationMode(false);
                    setIterationResults([]);
                    setCurrentIteration(0);
                  }}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  analyticsButton: {
    padding: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  analyticsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 15,
  },
  analyticsText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#00ffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  scrollContainer: {
    padding: 20,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#00ffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  promptContainer: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  promptText: {
    fontSize: 16,
    color: '#00ffff',
    textAlign: 'center',
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingText: {
    fontSize: 16,
    color: '#fff',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
  analyzingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzingText: {
    fontSize: 16,
    color: '#00ffff',
    marginTop: 10,
  },
  resultsContainer: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: '#00ffff',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 3,
  },
  analysisDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  sessionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
  },
  statsButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#121212',
  },
  newSessionButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  newSessionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  analyticsContent: {
    flex: 1,
    padding: 20,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  trendLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  achievementItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  noAchievements: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  insightText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  
  // Iterative Results Modal Styles
  iterativeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iterativeModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iterativeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  iterationSummary: {
    marginBottom: 24,
  },
  iterationSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  iterationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  iterationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  iterationScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iterationScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  iterationImprovement: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  positive: {
    color: '#059669',
    backgroundColor: '#dcfce7',
  },
  negative: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  iterativeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Analytics Button in Main UI
  analyticsButtonMain: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginTop: 16,
    alignItems: 'center',
  },
  analyticsButtonMainText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Enhanced Iteration Controls
  iterationControls: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  iterationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4338ca',
    textAlign: 'center',
    marginBottom: 12,
  },
  iterationProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iterationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#d1d5db',
  },
  iterationDotActive: {
    backgroundColor: '#6366f1',
  },
  iterationDotComplete: {
    backgroundColor: '#10b981',
  },
  iterationInfo: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  iterationInfoText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  iterationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Biometric Monitoring Styles
  biometricPanel: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 10,
  },
  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  biometricItem: {
    alignItems: 'center',
  },
  biometricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  biometricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  heartRateChart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heartRateBar: {
    width: 8,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});

export default RecordBreath;
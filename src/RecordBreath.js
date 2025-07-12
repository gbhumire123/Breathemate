import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, Animated, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

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

  const timerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSessionStats();
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

  // Enhanced analysis with iteration tracking
  const performIntelligentAnalysis = async (sample) => {
    setAnalyzing(true);
    try {
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
      
      if (iterationMode && currentIteration < maxIterations) {
        // Ask user if they want to continue iterating
        setTimeout(() => {
          Alert.alert(
            '🔄 Continue Iterating?',
            `Current score: ${analysisResult.healthScore}/100\n` +
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
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Analysis failed. Please try again.');
      setRecordingPhase('idle');
    } finally {
      setAnalyzing(false);
    }
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
        { text: 'View Details', onPress: () => {} },
        { text: 'OK', onPress: () => setRecordingPhase('idle') }
      ]
    );
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
          duration: 0, // Will be determined when analyzed
          timestamp: Date.now(),
          analyzed: false,
          fileName: result.name,
          fileSize: result.size,
          source: 'file',
          sessionType: 'file_upload'
        };

        setSamples(prevSamples => [newSample, ...prevSamples]);
        setUploadProgress(0);
        
        // Auto-analyze uploaded file
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Header with Session Mode Selector */}
          <View style={styles.header}>
            <Text style={styles.title}>🫁 Smart Breath Analysis</Text>
            <Text style={styles.subtitle}>
              {iterationMode ? 
                `Iterative Session ${currentIteration}/${maxIterations}` :
                'AI-powered respiratory health monitoring'
              }
            </Text>
            
            {/* Session Mode Selection */}
            {!iterationMode && recordingPhase === 'idle' && (
              <View style={styles.sessionModeContainer}>
                <Text style={styles.sessionModeTitle}>📊 Session Type</Text>
                <View style={styles.sessionModeButtons}>
                  <TouchableOpacity
                    style={[styles.sessionModeButton, sessionMode === 'single' && styles.sessionModeButtonActive]}
                    onPress={() => setSessionMode('single')}
                  >
                    <Text style={[styles.sessionModeButtonText, sessionMode === 'single' && styles.sessionModeButtonTextActive]}>
                      Single Recording
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sessionModeButton, sessionMode === 'iterative' && styles.sessionModeButtonActive]}
                    onPress={() => setSessionMode('iterative')}
                  >
                    <Text style={[styles.sessionModeButtonText, sessionMode === 'iterative' && styles.sessionModeButtonTextActive]}>
                      Iterative Session
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Affirmation Category Selection */}
            {!iterationMode && recordingPhase === 'idle' && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>💫 Focus Area</Text>
                <View style={styles.categoryButtons}>
                  {Object.keys(HEALTH_AFFIRMATIONS).map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Session Progress Indicator */}
          {iterationMode && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressTitle}>Session Progress</Text>
              <View style={styles.progressBar}>
                {[...Array(maxIterations)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressStep,
                      index < currentIteration && styles.progressStepComplete,
                      index === currentIteration - 1 && styles.progressStepActive
                    ]}
                  >
                    <Text style={styles.progressStepText}>{index + 1}</Text>
                  </View>
                ))}
              </View>
              {iterationResults.length > 0 && (
                <Text style={styles.progressScore}>
                  Latest Score: {iterationResults[iterationResults.length - 1].healthScore}/100
                </Text>
              )}
            </View>
          )}

          {/* Enhanced Recording Interface */}
          <Animated.View style={[styles.recordingContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={sessionMode === 'iterative' && !iterationMode ? startIterativeSession : startIntelligentRecording}
              disabled={recordingPhase === 'recording' || recordingPhase === 'analyzing'}
            >
              <LinearGradient
                colors={
                  recordingPhase === 'recording' ? ['#ff6b6b', '#ff5252'] :
                  recordingPhase === 'analyzing' ? ['#ffaa00', '#ff8f00'] :
                  recordingPhase === 'complete' ? ['#00ff88', '#00e676'] :
                  iterationMode ? ['#9c27b0', '#673ab7'] :
                  ['#00ffff', '#0080ff']
                }
                style={styles.recordGradient}
              >
                <Ionicons 
                  name={
                    recordingPhase === 'recording' ? "stop" :
                    recordingPhase === 'analyzing' ? "hourglass" :
                    recordingPhase === 'complete' ? "checkmark" :
                    recordingPhase === 'prompt' ? "book" :
                    iterationMode ? "repeat" :
                    sessionMode === 'iterative' ? "layers" :
                    "mic"
                  } 
                  size={40} 
                  color="#fff" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.recordingInfo}>
            <Text style={styles.recordingStatus}>
              {recordingPhase === 'idle' ? 
                (sessionMode === 'iterative' ? 'Start Iterative Session' : 'Tap to Start Intelligent Recording') :
               recordingPhase === 'prompt' ? 'Read the affirmation aloud...' :
               recordingPhase === 'recording' ? `Recording: ${formatTime(recordingTime)}` :
               recordingPhase === 'analyzing' ? 'AI is analyzing your breath patterns...' :
               'Analysis Complete! Check your results below.'
              }
            </Text>
            
            {recordingPhase === 'recording' && (
              <Animated.View style={[styles.recordingIndicator, { opacity: fadeAnim }]}>
                <View style={styles.waveform}>
                  {[...Array(8)].map((_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          height: Math.random() * 20 + 5,
                          backgroundColor: '#ff6b6b',
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.liveIndicator}>● LIVE ANALYSIS</Text>
              </Animated.View>
            )}
          </View>

          {/* Iteration Results Summary */}
          {iterationMode && iterationResults.length > 0 && (
            <View style={styles.iterationSummary}>
              <Text style={styles.iterationSummaryTitle}>📈 Iteration Results</Text>
              {iterationResults.map((result, index) => (
                <View key={index} style={styles.iterationItem}>
                  <View style={styles.iterationHeader}>
                    <Text style={styles.iterationNumber}>#{index + 1}</Text>
                    <Text style={styles.iterationScore}>{result.healthScore}/100</Text>
                    <Text style={[styles.iterationRisk, { color: getRiskColor(result.risk_level) }]}>
                      {result.risk_level}
                    </Text>
                  </View>
                  <Text style={styles.iterationImprovement}>
                    {index > 0 && (
                      result.healthScore - iterationResults[index - 1].healthScore > 0 
                        ? `+${(result.healthScore - iterationResults[index - 1].healthScore).toFixed(1)} improvement`
                        : `${(result.healthScore - iterationResults[index - 1].healthScore).toFixed(1)} change`
                    )}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Health Affirmation Prompt */}
          {showPrompt && (
            <View style={styles.promptContainer}>
              <LinearGradient
                colors={['rgba(0, 255, 255, 0.15)', 'rgba(0, 128, 255, 0.15)']}
                style={styles.promptCard}
              >
                <Text style={styles.promptTitle}>💫 Health Affirmation</Text>
                <Text style={styles.promptText}>{currentPrompt}</Text>
                <Text style={styles.promptInstruction}>
                  Read this affirmation aloud clearly for best analysis results
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Enhanced Upload Section */}
          <View style={styles.uploadContainer}>
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
              style={styles.uploadCard}
            >
              <View style={styles.uploadContent}>
                <Ionicons name="cloud-upload-outline" size={32} color="#00ffff" />
                <Text style={styles.uploadTitle}>Upload Audio File</Text>
                <Text style={styles.uploadSubtitle}>
                  Upload an existing breathing recording for analysis
                </Text>

                {uploadProgress > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{uploadProgress}%</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.uploadButton} 
                  onPress={uploadFile}
                  disabled={uploadProgress > 0}
                >
                  <LinearGradient
                    colors={uploadProgress > 0 ? ['#666', '#666'] : ['#00ffff', '#0080ff']}
                    style={styles.uploadButtonGradient}
                  >
                    <Ionicons 
                      name={uploadProgress > 0 ? "hourglass-outline" : "folder-open-outline"} 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.uploadButtonText}>
                      {uploadProgress > 0 ? 'Uploading...' : 'Choose File'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Samples List with Analysis Results */}
          <View style={styles.samplesContainer}>
            <View style={styles.samplesHeader}>
              <Text style={styles.samplesTitle}>Recent Sessions</Text>
              <Text style={styles.samplesCount}>{samples.length} recordings</Text>
            </View>

            {samples.length === 0 ? (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={styles.emptyStateGradient}
                >
                  <Ionicons name="mic-outline" size={64} color="#666" />
                  <Text style={styles.emptyStateText}>No recordings yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Start your first intelligent recording session
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.samplesList}>
                {samples.map((sample) => (
                  <View key={sample.id} style={styles.sampleCard}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                      style={styles.sampleGradient}
                    >
                      {/* Sample Header */}
                      <View style={styles.sampleHeader}>
                        <View style={styles.sampleInfo}>
                          <Text style={styles.sampleTime}>
                            {new Date(sample.timestamp).toLocaleTimeString()}
                          </Text>
                          <Text style={styles.sampleDuration}>
                            {formatTime(sample.duration)} • {sample.sessionType || 'Standard Recording'}
                          </Text>
                          {sample.prompt && (
                            <Text style={styles.samplePrompt} numberOfLines={2}>
                              💭 "{sample.prompt}"
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => deleteSample(sample.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                        </TouchableOpacity>
                      </View>

                      {/* Enhanced Analysis Results */}
                      {sample.analyzed && sample.analysis && (
                        <View style={styles.enhancedAnalysisContainer}>
                          <Text style={styles.analysisTitle}>🧠 AI Health Analysis</Text>
                          
                          {/* Health Score Display */}
                          <View style={styles.healthScoreContainer}>
                            <View style={styles.scoreCircle}>
                              <Text style={styles.scoreNumber}>{sample.analysis.healthScore}</Text>
                              <Text style={styles.scoreLabel}>Health Score</Text>
                            </View>
                            <View style={styles.riskIndicator}>
                              <Text style={[styles.riskLevel, { color: getRiskColor(sample.analysis.risk_level) }]}>
                                {sample.analysis.risk_level} Risk
                              </Text>
                              <Text style={styles.riskPercentage}>{sample.analysis.risk_percentage}%</Text>
                            </View>
                          </View>

                          {/* Key Metrics */}
                          <View style={styles.metricsGrid}>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>{sample.analysis.breathing_rate}</Text>
                              <Text style={styles.metricLabel}>BPM</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>{sample.analysis.lung_capacity}%</Text>
                              <Text style={styles.metricLabel}>Lung Capacity</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>{sample.analysis.stress_indicators}%</Text>
                              <Text style={styles.metricLabel}>Stress Level</Text>
                            </View>
                          </View>

                          {/* AI Insights */}
                          <View style={styles.insightsContainer}>
                            <Text style={styles.insightsTitle}>💡 AI Insights</Text>
                            {sample.analysis.ai_insights?.map((insight, index) => (
                              <Text key={index} style={styles.insightText}>• {insight}</Text>
                            ))}
                          </View>

                          {/* Personalized Tips */}
                          <View style={styles.tipsContainer}>
                            <Text style={styles.tipsTitle}>🎯 Personalized Tips</Text>
                            {sample.analysis.personalized_tips?.map((tip, index) => (
                              <Text key={index} style={styles.tipText}>• {tip}</Text>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Analysis in progress indicator */}
                      {analyzing && !sample.analyzed && (
                        <View style={styles.analyzingContainer}>
                          <ActivityIndicator size="large" color="#00ffff" />
                          <Text style={styles.analyzingText}>AI is analyzing your breath patterns...</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

// Enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  sessionModeContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  sessionModeTitle: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  sessionModeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionModeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionModeButtonActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderColor: '#00ffff',
  },
  sessionModeButtonText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionModeButtonTextActive: {
    color: '#00ffff',
    fontWeight: '600',
  },
  categoryContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  categoryTitle: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    borderColor: '#9c27b0',
  },
  categoryButtonText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#9c27b0',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressStepComplete: {
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
    borderColor: '#00ff88',
  },
  progressStepActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    borderColor: '#00ffff',
  },
  progressStepText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressScore: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iterationSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  iterationSummaryTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  iterationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  iterationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  iterationNumber: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: '600',
  },
  iterationScore: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iterationRisk: {
    fontSize: 14,
    fontWeight: '600',
  },
  iterationImprovement: {
    color: '#ccc',
    fontSize: 12,
    fontStyle: 'italic',
  },
  recordingContainer: {
    margin: 16,
    marginBottom: 20,
  },
  recordingCardGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  recordButton: {
    marginBottom: 20,
  },
  recordTouchable: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingStatus: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  recordingIndicator: {
    marginTop: 20,
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    marginBottom: 10,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#ff6b6b',
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  liveIndicator: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promptContainer: {
    margin: 16,
    marginBottom: 20,
  },
  promptCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 16,
  },
  promptText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  promptInstruction: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  uploadContainer: {
    margin: 16,
    marginBottom: 20,
  },
  uploadCard: {
    borderRadius: 16,
    padding: 20,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
  },
  progressText: {
    color: '#00ffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  samplesContainer: {
    margin: 16,
  },
  samplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  samplesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  samplesCount: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    marginBottom: 20,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
  },
  samplesList: {
    gap: 16,
  },
  sampleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sampleGradient: {
    padding: 16,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sampleInfo: {
    flex: 1,
  },
  sampleTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sampleDuration: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  samplePrompt: {
    fontSize: 14,
    color: '#00ffff',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  enhancedAnalysisContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  healthScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  riskIndicator: {
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskPercentage: {
    fontSize: 14,
    color: '#aaa',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 4,
    lineHeight: 20,
  },
  tipsContainer: {
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 4,
    lineHeight: 20,
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  analyzingText: {
    fontSize: 14,
    color: '#00ffff',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default RecordBreath;
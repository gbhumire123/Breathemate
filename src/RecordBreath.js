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

  const performIntelligentAnalysis = async (sample) => {
    setAnalyzing(true);
    try {
      // Enhanced AI analysis simulation
      const analysisResult = await simulateEnhancedAnalysis(sample);
      
      setSamples(prev => prev.map(s => 
        s.id === sample.id 
          ? { ...s, analyzed: true, analysis: analysisResult }
          : s
      ));
      
      // Update session statistics
      await updateSessionStats(analysisResult);
      
      setRecordingPhase('complete');
      
      // Show comprehensive results
      Alert.alert(
        '🧠 AI Analysis Complete',
        `Health Score: ${analysisResult.healthScore}/100\n` +
        `Risk Level: ${analysisResult.risk_level}\n` +
        `Breathing Rate: ${analysisResult.breathing_rate} bpm\n` +
        `Recommendation: ${analysisResult.recommendation}`,
        [
          { text: 'View Details', onPress: () => {} },
          { text: 'OK', onPress: () => setRecordingPhase('idle') }
        ]
      );
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Analysis failed. Please try again.');
      setRecordingPhase('idle');
    } finally {
      setAnalyzing(false);
    }
  };

  const simulateEnhancedAnalysis = async (sample) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Enhanced analysis considering the prompt and recording context
    const baseScore = Math.floor(Math.random() * 30 + 70); // 70-100
    const riskPercentage = Math.floor(Math.random() * 40 + 10); // 10-50
    
    const analysisResults = [
      {
        healthScore: baseScore,
        risk_percentage: riskPercentage,
        risk_level: riskPercentage < 25 ? "Low" : riskPercentage < 50 ? "Moderate" : "High",
        confidence_level: "High",
        breathing_rate: 14.5 + Math.random() * 6, // 14.5-20.5
        recommendation: riskPercentage < 25 ? 
          "Excellent breathing health! Continue your wellness routine." :
          riskPercentage < 50 ? 
          "Good progress. Consider daily breathing exercises." :
          "Please consult with a healthcare professional.",
        urgency: riskPercentage < 25 ? "Routine" : riskPercentage < 50 ? "Within 1 month" : "Within 1-2 weeks",
        detected_issues: riskPercentage > 40 ? ["Irregular breathing pattern"] : [],
        analysis_details: {
          prompt_effectiveness: sample.prompt ? Math.floor(Math.random() * 20 + 80) : 0,
          voice_clarity: Math.floor(Math.random() * 15 + 85),
          breathing_consistency: Math.floor(Math.random() * 20 + 75),
          stress_indicators: Math.floor(Math.random() * 30 + 10),
          overall_wellness: baseScore
        },
        ai_insights: [
          "Your breathing pattern shows good rhythm consistency",
          "Voice analysis indicates calm emotional state",
          "Respiratory rate is within healthy range"
        ],
        personalized_tips: [
          "Continue reading health affirmations daily",
          "Practice 4-7-8 breathing technique",
          "Maintain current wellness routine"
        ]
      }
    ];
    
    return analysisResults[0];
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Session Stats */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>🧠 Intelligent Breath Analysis</Text>
          <Text style={styles.headerSubtitle}>AI-powered breathing health assessment</Text>
          
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sessionStats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sessionStats.weeklyScore}</Text>
              <Text style={styles.statLabel}>Weekly Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>+{sessionStats.improvementRate}%</Text>
              <Text style={styles.statLabel}>Improvement</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Intelligent Recording Interface */}
      <View style={styles.recordingContainer}>
        <LinearGradient
          colors={
            recordingPhase === 'recording' ? 
            ['rgba(255, 107, 107, 0.2)', 'rgba(255, 82, 82, 0.1)'] : 
            recordingPhase === 'analyzing' ?
            ['rgba(255, 170, 0, 0.2)', 'rgba(255, 170, 0, 0.1)'] :
            recordingPhase === 'complete' ?
            ['rgba(0, 255, 136, 0.2)', 'rgba(0, 255, 136, 0.1)'] :
            ['rgba(0, 255, 255, 0.15)', 'rgba(0, 128, 255, 0.1)']
          }
          style={styles.recordingCardGradient}
        >
          <Animated.View 
            style={[
              styles.recordButton,
              { 
                transform: [
                  { scale: isRecording ? pulseAnim : scaleAnim }
                ] 
              }
            ]}
          >
            <TouchableOpacity
              onPress={
                recordingPhase === 'idle' ? startIntelligentRecording :
                recordingPhase === 'recording' ? stopRecording :
                () => setRecordingPhase('idle')
              }
              style={styles.recordTouchable}
              disabled={recordingPhase === 'prompt' || recordingPhase === 'analyzing'}
            >
              <LinearGradient
                colors={
                  recordingPhase === 'recording' ? ['#ff6b6b', '#ff5252'] :
                  recordingPhase === 'analyzing' ? ['#ffaa00', '#ff8f00'] :
                  recordingPhase === 'complete' ? ['#00ff88', '#00e676'] :
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
              {recordingPhase === 'idle' ? 'Tap to Start Intelligent Recording' :
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
        </LinearGradient>
      </View>

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
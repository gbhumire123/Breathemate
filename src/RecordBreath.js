import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const RecordBreathScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [samples, setSamples] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone permission is required to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      startPulseAnimation();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      Alert.alert('Error', 'Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      stopPulseAnimation();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const newSample = {
        id: Date.now(),
        uri,
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        analyzed: false,
      };

      setSamples(prev => [newSample, ...prev]);
      setRecording(null);
      setRecordingTime(0);

      Alert.alert('Success', 'Recording saved! Tap "Analyze" to get AI insights.');

    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording: ' + error.message);
    }
  };

  const analyzeSample = async (sampleId) => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysisResults = [
      {
        risk_percentage: 15,
        risk_level: "Low",
        confidence_level: "High",
        detected_issues: [],
        recommendation: "Continue regular health monitoring",
        breathing_rate: 16.2,
        analysis_details: {
          wheezing_detected: false,
          crackling_detected: false,
          rhythm_regular: true,
          breath_consistent: true
        }
      },
      {
        risk_percentage: 45,
        risk_level: "Moderate", 
        confidence_level: "Medium",
        detected_issues: ["Irregular breathing pattern"],
        recommendation: "Schedule a medical check-up",
        breathing_rate: 22.8,
        analysis_details: {
          wheezing_detected: false,
          crackling_detected: false,
          rhythm_regular: false,
          breath_consistent: false
        }
      },
      {
        risk_percentage: 78,
        risk_level: "High",
        confidence_level: "High",
        detected_issues: ["Possible wheezing detected", "Abnormally fast breathing rate"],
        recommendation: "Consult a pulmonologist immediately",
        breathing_rate: 28.5,
        analysis_details: {
          wheezing_detected: true,
          crackling_detected: false,
          rhythm_regular: false,
          breath_consistent: false
        }
      }
    ];

    const randomResult = analysisResults[Math.floor(Math.random() * analysisResults.length)];
    
    setSamples(prev => prev.map(sample => 
      sample.id === sampleId 
        ? { ...sample, analyzed: true, analysis: randomResult }
        : sample
    ));
    
    setAnalyzing(false);
  };

  const playRecording = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
    }
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
          onPress: () => setSamples(prev => prev.filter(s => s.id !== sampleId))
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return '#00ff88';
      case 'Moderate': return '#ffaa00';
      case 'High': return '#ff6b6b';
      default: return '#888';
    }
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
          <Text style={styles.title}>Breath Analysis</Text>
          <Text style={styles.subtitle}>Record your breathing for AI health insights</Text>
        </View>

        {/* Recording Interface */}
        <View style={styles.recordingContainer}>
          <Animated.View 
            style={[
              styles.recordButton,
              { transform: [{ scale: isRecording ? pulseAnim : 1 }] }
            ]}
          >
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={styles.recordTouchable}
              disabled={analyzing}
            >
              <LinearGradient
                colors={isRecording ? ['#ff6b6b', '#ff5252'] : ['#00ffff', '#0080ff']}
                style={styles.recordGradient}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={40} 
                  color="#fff" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordingText}>
            {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Tap to start recording'}
          </Text>

          {isRecording && (
            <Text style={styles.instructionText}>
              Breathe naturally near the microphone
            </Text>
          )}
        </View>

        {/* Recording Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📝 Recording Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Find a quiet environment</Text>
            <Text style={styles.tipItem}>• Hold phone 6-12 inches from mouth</Text>
            <Text style={styles.tipItem}>• Breathe naturally for 30+ seconds</Text>
            <Text style={styles.tipItem}>• Avoid talking during recording</Text>
          </View>
        </View>

        {/* Samples List */}
        {samples.length > 0 && (
          <View style={styles.samplesContainer}>
            <View style={styles.samplesHeader}>
              <Text style={styles.samplesTitle}>Your Recordings</Text>
              <Text style={styles.samplesCount}>{samples.length} samples</Text>
            </View>

            {samples.map((sample) => (
              <View key={sample.id} style={styles.sampleCard}>
                <View style={styles.sampleHeader}>
                  <View style={styles.sampleInfo}>
                    <Text style={styles.sampleTime}>
                      {new Date(sample.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.sampleDuration}>
                      Duration: {formatTime(sample.duration)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteSample(sample.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sampleActions}>
                  <TouchableOpacity
                    onPress={() => playRecording(sample.uri)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="play" size={16} color="#00ffff" />
                    <Text style={styles.actionButtonText}>Play</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => analyzeSample(sample.id)}
                    disabled={sample.analyzed || analyzing}
                    style={[
                      styles.actionButton,
                      styles.analyzeButton,
                      (sample.analyzed || analyzing) && styles.disabledButton
                    ]}
                  >
                    {analyzing ? (
                      <>
                        <Ionicons name="refresh" size={16} color="#fff" />
                        <Text style={styles.actionButtonTextWhite}>Analyzing...</Text>
                      </>
                    ) : sample.analyzed ? (
                      <>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.actionButtonTextWhite}>Analyzed</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="brain" size={16} color="#fff" />
                        <Text style={styles.actionButtonTextWhite}>Analyze</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Analysis Results */}
                {sample.analyzed && sample.analysis && (
                  <View style={styles.analysisContainer}>
                    <Text style={styles.analysisTitle}>🧠 AI Analysis Results</Text>
                    
                    <View style={styles.analysisGrid}>
                      <View style={styles.analysisItem}>
                        <Text style={styles.analysisLabel}>Risk Level</Text>
                        <View style={styles.riskContainer}>
                          <Text style={[styles.riskPercentage, { color: getRiskColor(sample.analysis.risk_level) }]}>
                            {sample.analysis.risk_percentage}%
                          </Text>
                          <Text style={[styles.riskLevel, { color: getRiskColor(sample.analysis.risk_level) }]}>
                            {sample.analysis.risk_level}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.analysisItem}>
                        <Text style={styles.analysisLabel}>Breathing Rate</Text>
                        <Text style={styles.analysisValue}>
                          {sample.analysis.breathing_rate} bpm
                        </Text>
                      </View>

                      <View style={styles.analysisItem}>
                        <Text style={styles.analysisLabel}>Confidence</Text>
                        <Text style={styles.analysisValue}>
                          {sample.analysis.confidence_level}
                        </Text>
                      </View>
                    </View>

                    {sample.analysis.detected_issues && sample.analysis.detected_issues.length > 0 && (
                      <View style={styles.issuesContainer}>
                        <Text style={styles.issuesTitle}>⚠️ Detected Issues</Text>
                        {sample.analysis.detected_issues.map((issue, index) => (
                          <Text key={index} style={styles.issueItem}>• {issue}</Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.recommendationContainer}>
                      <Text style={styles.recommendationTitle}>💡 Recommendation</Text>
                      <Text style={styles.recommendationText}>
                        {sample.analysis.recommendation}
                      </Text>
                    </View>

                    <Text style={styles.disclaimer}>
                      ⚖️ This analysis is for screening purposes only. Always consult healthcare professionals for medical diagnosis.
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {samples.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="mic-outline" size={60} color="#444" />
            <Text style={styles.emptyStateText}>No recordings yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by recording your first breathing sample above
            </Text>
          </View>
        )}
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
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordButton: {
    marginBottom: 20,
  },
  recordTouchable: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  recordGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 15,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  samplesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  samplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  sampleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sampleInfo: {
    flex: 1,
  },
  sampleTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  sampleDuration: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  sampleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    gap: 5,
  },
  analyzeButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.8)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#00ffff',
    fontWeight: '600',
  },
  actionButtonTextWhite: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  analysisContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 15,
  },
  analysisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  analysisItem: {
    flex: 1,
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskContainer: {
    alignItems: 'center',
  },
  riskPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  issuesContainer: {
    marginBottom: 15,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffaa00',
    marginBottom: 10,
  },
  issueItem: {
    fontSize: 12,
    color: '#ffaa00',
    marginBottom: 5,
  },
  recommendationContainer: {
    marginBottom: 15,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RecordBreathScreen;
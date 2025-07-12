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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const RecordBreathScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [samples, setSamples] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRecordingAnimations = () => {
    startPulseAnimation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const stopRecordingAnimations = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
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

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      startRecordingAnimations();

      // Timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      stopRecordingAnimations();
      clearInterval(timerRef.current);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const newSample = {
        id: Date.now().toString(),
        uri,
        duration: recordingTime,
        timestamp: Date.now(),
        analyzed: false,
        platform: Platform.OS,
        source: 'microphone'
      };

      setSamples(prevSamples => [newSample, ...prevSamples]);
      setRecording(null);
      
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert('Success', 'Recording saved! Tap Analyze to get AI insights.', [
        { text: 'OK', style: 'default' }
      ]);

    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playRecording = async (uri) => {
    try {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync({ uri });
      
      console.log('Playing Sound');
      await sound.playAsync();
      
      // Optional: Auto-unload the sound when it finishes playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const analyzeSample = async (sampleId) => {
    const sample = samples.find(s => s.id === sampleId);
    if (!sample) return;

    setAnalyzing(true);
    try {
      // Mock analysis for demo purposes
      const mockAnalysis = {
        risk_level: 'Low',
        risk_percentage: Math.floor(Math.random() * 30) + 10,
        breathing_rate: Math.floor(Math.random() * 10) + 15,
        recommendations: ['Continue regular breathing exercises', 'Maintain good posture'],
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSamples(prev => prev.map(s => 
        s.id === sampleId 
          ? { ...s, analyzed: true, analysis: mockAnalysis }
          : s
      ));
      
      Alert.alert('Analysis Complete', `Risk Level: ${mockAnalysis.risk_level}`);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
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
          onPress: () => {
            setSamples(prev => prev.filter(s => s.id !== sampleId));
          }
        },
      ]
    );
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '#00ff88';
      case 'moderate': return '#ffaa00';
      case 'high': return '#ff6b6b';
      default: return '#00ffff';
    }
  };

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          Alert.alert('File Too Large', 'Please select a file under 50MB.');
          return;
        }

        setUploadProgress(10);
        
        const newSample = {
          id: Date.now(),
          uri: file.uri,
          duration: 0,
          timestamp: new Date().toISOString(),
          analyzed: false,
          platform: Platform.OS,
          uploaded: true,
          name: file.name,
          size: file.size,
          type: file.mimeType,
        };

        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(uploadInterval);
              setSamples(prevSamples => [newSample, ...prevSamples]);
              Alert.alert('Success', 'Audio file uploaded successfully!');
              setUploadProgress(0);
              return 0;
            }
            return prev + 10;
          });
        }, 200);
      }
    } catch (error) {
      console.error('File upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🫁 Breath Analysis</Text>
            <Text style={styles.subtitle}>AI-powered respiratory health insights</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samples.length}</Text>
              <Text style={styles.statLabel}>Samples</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{samples.filter(s => s.analyzed).length}</Text>
              <Text style={styles.statLabel}>Analyzed</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Recording Interface */}
        <View style={styles.recordingContainer}>
          <View style={styles.recordingCard}>
            <LinearGradient
              colors={isRecording 
                ? ['rgba(255, 107, 107, 0.2)', 'rgba(255, 82, 82, 0.1)'] 
                : ['rgba(0, 255, 255, 0.15)', 'rgba(0, 128, 255, 0.1)']}
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
                      size={42} 
                      color="#fff" 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.recordingInfo}>
                <Text style={styles.recordingText}>
                  {isRecording ? `🔴 Recording: ${formatTime(recordingTime)}` : '🎤 Ready to Record'}
                </Text>
                <Text style={styles.instructionText}>
                  {isRecording 
                    ? 'Breathe normally and steadily' 
                    : 'Tap the microphone to start recording'
                  }
                </Text>
                
                {isRecording && (
                  <Animated.View style={[styles.recordingIndicator, { opacity: fadeAnim }]}>
                    <View style={styles.waveform}>
                      {[...Array(5)].map((_, i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.waveBar,
                            { 
                              height: 10 + Math.random() * 20,
                              backgroundColor: '#ff6b6b'
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.liveIndicator}>● LIVE</Text>
                  </Animated.View>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Enhanced Upload Section */}
        <View style={styles.uploadContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
            style={styles.uploadCard}
          >
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconContainer}>
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.3)', 'rgba(0, 128, 255, 0.2)']}
                  style={styles.uploadIconGradient}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color="#00ffff" />
                </LinearGradient>
              </View>
              
              <Text style={styles.uploadTitle}>📁 Upload Audio File</Text>
              <Text style={styles.uploadSubtitle}>
                Select a breathing recording from your device
              </Text>
              <Text style={styles.uploadInfo}>
                Supported: MP3, WAV, M4A, OGG • Max 50MB
              </Text>

              {uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
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

        {/* Enhanced Tips Section */}
        <View style={styles.tipsContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.08)', 'rgba(0, 128, 255, 0.05)']}
            style={styles.tipsGradient}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={24} color="#00ffff" />
              <Text style={styles.tipsTitle}>💡 Pro Recording Tips</Text>
            </View>
            <View style={styles.tipsContent}>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🔇</Text>
                <Text style={styles.tipItem}>Find a quiet environment</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>📱</Text>
                <Text style={styles.tipItem}>Hold device 6 inches from mouth</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>🫁</Text>
                <Text style={styles.tipItem}>Breathe naturally and calmly</Text>
              </View>
              <View style={styles.tipRow}>
                <Text style={styles.tipEmoji}>⏱️</Text>
                <Text style={styles.tipItem}>Record for at least 30 seconds</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Samples List */}
        {samples.length > 0 ? (
          <View style={styles.samplesContainer}>
            <View style={styles.samplesHeader}>
              <Text style={styles.samplesTitle}>🎵 Your Recordings</Text>
              <View style={styles.samplesActions}>
                <Text style={styles.samplesCount}>{samples.length} samples</Text>
                <TouchableOpacity
                  onPress={() => setSamples([])}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>

            {samples.map((sample) => (
              <View key={sample.id} style={styles.sampleCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                  style={styles.sampleCardGradient}
                >
                  <View style={styles.sampleHeader}>
                    <View style={styles.sampleInfo}>
                      <Text style={styles.sampleTime}>
                        {new Date(sample.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.sampleDuration}>
                        Duration: {formatTime(sample.duration)}
                      </Text>
                      <Text style={styles.samplePlatform}>
                        {Platform.OS === 'web' ? '💻 Web' : '📱 Mobile'} • {sample.platform}
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
                      </View>

                      {sample.analysis.recommendations && (
                        <View style={styles.recommendationContainer}>
                          <Text style={styles.recommendationTitle}>💡 Recommendations</Text>
                          {sample.analysis.recommendations.map((rec, index) => (
                            <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                          ))}
                        </View>
                      )}

                      <Text style={styles.disclaimer}>
                        * This analysis is for informational purposes only and should not replace professional medical advice.
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="mic-outline" size={64} color="#666" />
              <Text style={styles.emptyStateText}>No recordings yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by recording your breathing for AI health analysis
              </Text>
            </LinearGradient>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingCard: {
    borderRadius: 25,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  recordingCardGradient: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
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
  recordingInfo: {
    alignItems: 'center',
    marginTop: 20,
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
  recordingIndicator: {
    marginTop: 15,
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginBottom: 8,
  },
  waveBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  liveIndicator: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  uploadContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  uploadCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIconContainer: {
    marginBottom: 15,
  },
  uploadIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  uploadInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
    borderRadius: 3,
  },
  progressText: {
    color: '#00ffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '80%',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  tipsGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.15)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginLeft: 10,
  },
  tipsContent: {
    gap: 5,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipEmoji: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
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
  samplesActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  clearButtonText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sampleCardGradient: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  samplePlatform: {
    fontSize: 12,
    color: '#666',
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
  },
  analyzeButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderColor: 'rgba(0, 255, 136, 0.4)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  actionButtonTextWhite: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  analysisContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: 12,
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
  emptyStateGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
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
    Animated.timing(pulseAnim).stop();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need microphone permissions to record audio!');
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording with high quality settings
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      
      startPulseAnimation();
      startTimer();
      
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    setIsRecording(false);
    stopPulseAnimation();
    clearInterval(timerRef.current);
    
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      // Create sample object
      const newSample = {
        id: Date.now(),
        uri: uri,
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        analyzed: false,
        platform: Platform.OS,
      };

      setSamples(prev => [newSample, ...prev]);
      setRecording(null);
      
      Alert.alert('Success', 'Recording saved successfully!');
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording.');
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Breath Analysis</Text>
          <Text style={styles.subtitle}>AI-powered health insights</Text>
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
            {isRecording ? `Recording: ${formatTime(recordingTime)}` : 'Tap to Record'}
          </Text>
          <Text style={styles.instructionText}>
            {isRecording 
              ? 'Breathe normally into your microphone' 
              : 'Record 30 seconds of your normal breathing'
            }
          </Text>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadContainer}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
            style={styles.uploadCard}
          >
            <View style={styles.uploadIconContainer}>
              <Ionicons name="cloud-upload-outline" size={32} color="#00ffff" />
            </View>
            
            <Text style={styles.uploadTitle}>Upload Audio File</Text>
            <Text style={styles.uploadSubtitle}>
              Select an audio file from your device
            </Text>
            <Text style={styles.uploadInfo}>
              Supported: MP3, WAV, M4A, OGG (Max 50MB)
            </Text>

            {uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
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
          </LinearGradient>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Recording & Upload Tips</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipItem}>• Find a quiet environment for recording</Text>
            <Text style={styles.tipItem}>• Hold device 6 inches from mouth</Text>
            <Text style={styles.tipItem}>• Breathe naturally and calmly</Text>
            <Text style={styles.tipItem}>• Upload high-quality audio files for better analysis</Text>
            <Text style={styles.tipItem}>• Record for at least 30 seconds</Text>
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
              </View>
            ))}
          </View>
        )}

        {samples.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="mic-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>No recordings yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by recording your breathing for health analysis
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 30,
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
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderStyle: 'dashed',
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
  },
  tipsContent: {
    gap: 5,
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
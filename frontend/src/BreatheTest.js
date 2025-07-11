import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const BreatheTestScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [sound, setSound] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.granted) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        Alert.alert('Permission Required', 'Microphone permission is required to record audio.');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      // Simulate processing
      processAudio(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const processAudio = async (uri) => {
    // Simulate AI processing with mock data
    const mockResults = [
      { risk_percentage: 25, risk_stage: 'Low', matched_sample: 'healthy_sample_1.wav' },
      { risk_percentage: 65, risk_stage: 'Moderate', matched_sample: 'moderate_sample_2.wav' },
      { risk_percentage: 85, risk_stage: 'High', matched_sample: 'high_risk_sample_3.wav' },
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    // Simulate processing delay
    setTimeout(() => {
      setResult(randomResult);
    }, 2000);
  };

  const playRecording = async () => {
    if (recording) {
      const uri = recording.getURI();
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    }
  };

  const resetTest = () => {
    setResult(null);
    setRecording(null);
    setIsRecording(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  };

  const getRiskColor = (stage) => {
    switch (stage) {
      case 'Low': return '#39ff14';
      case 'Moderate': return '#ffaa00';
      case 'High': return '#ff0055';
      default: return '#fff';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Breathe Test</Text>
      <Text style={styles.subtitle}>Record your breathing for analysis</Text>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Analysis Complete</Text>
          <View style={styles.riskContainer}>
            <Text style={styles.riskLabel}>Risk Level:</Text>
            <Text style={[styles.riskStage, { color: getRiskColor(result.risk_stage) }]}>
              {result.risk_stage}
            </Text>
          </View>
          <Text style={styles.resultText}>
            Risk Percentage: {result.risk_percentage}%
          </Text>
          <Text style={styles.resultText}>
            Matched Pattern: {result.matched_sample}
          </Text>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetTest}>
            <Text style={styles.resetButtonText}>Take Another Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingVisual}>
            <View style={[styles.recordingIndicator, isRecording && styles.recording]} />
            {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, isRecording && styles.stopButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>

          {recording && !isRecording && (
            <TouchableOpacity style={styles.playButton} onPress={playRecording}>
              <Text style={styles.playButtonText}>Play Recording</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingVisual: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1f1f1f',
    borderWidth: 3,
    borderColor: '#00ffff',
    marginBottom: 20,
  },
  recording: {
    backgroundColor: '#ff0055',
    borderColor: '#ff0055',
  },
  recordingText: {
    color: '#ff0055',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 20,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  riskLabel: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  riskStage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00ffff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    minWidth: 150,
  },
  stopButton: {
    backgroundColor: '#ff0055',
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playButton: {
    backgroundColor: '#39ff14',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 120,
  },
  playButtonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#00ffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    minWidth: 150,
  },
  resetButtonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BreatheTestScreen;
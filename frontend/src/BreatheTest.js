import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const BreatheTestScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.granted) {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        alert('Microphone permission is required to record audio.');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);
      uploadAudio(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const uploadAudio = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'breath_audio.wav',
        type: 'audio/wav',
      });

      const response = await fetch('http://localhost:8080/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to upload audio:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Breathe Test</Text>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Risk Percentage: {result.risk_percentage}%</Text>
          <Text style={styles.resultText}>Risk Stage: {result.risk_stage}</Text>
          <Text style={styles.resultText}>Matched Sample: {result.matched_sample}</Text>
        </View>
      ) : (
        <View style={styles.recordingContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
          </TouchableOpacity>
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
    fontFamily: 'Poppins',
    color: '#00ffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontFamily: 'Roboto Mono',
    color: '#39ff14',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#00ffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BreatheTestScreen;
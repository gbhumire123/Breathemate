import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
  const progress = 0.75; // Example progress value

  const handleBreathingTest = () => {
    // Navigation will be handled by the parent navigator
    console.log('Navigate to Breathing Test');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.greeting}>Good morning, Geetheswar 👋</Text>
      <Text style={styles.tip}>Today's Tip: Stay hydrated and take deep breaths!</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleBreathingTest}>
        <Text style={styles.buttonText}>Start Breathing Test</Text>
      </TouchableOpacity>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  tip: {
    fontSize: 16,
    color: '#39ff14',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressCircle: {
    height: 150,
    width: 150,
    borderRadius: 75,
    backgroundColor: '#1f1f1f',
    borderWidth: 4,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  button: {
    backgroundColor: '#00ffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
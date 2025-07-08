import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';

const HomeScreen = () => {
  const progress = 0.75; // Example progress value

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good morning, Geetheswar 👋</Text>
      <Text style={styles.tip}>Today’s Tip: Stay hydrated and take deep breaths!</Text>

      <View style={styles.progressContainer}>
        <ProgressCircle
          style={styles.progressCircle}
          progress={progress}
          progressColor={'#00ffff'}
          backgroundColor={'#1f1f1f'}
        />
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      <TouchableOpacity style={styles.button}>
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
    fontFamily: 'Poppins',
    color: '#00ffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  tip: {
    fontSize: 16,
    fontFamily: 'Roboto Mono',
    color: '#39ff14',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressCircle: {
    height: 150,
    width: 150,
  },
  progressText: {
    fontSize: 20,
    fontFamily: 'Roboto Mono',
    color: '#00ffff',
    marginTop: -30,
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

export default HomeScreen;
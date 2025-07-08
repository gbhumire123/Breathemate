import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Simulate login logic
    Alert.alert('Success', 'Login successful!');
  };

  const handleFileUpload = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (file.type === 'cancel') {
        Alert.alert('Error', 'No file selected');
        return;
      }

      // Simulate file upload logic
      Alert.alert('Success', 'File uploaded successfully!');
      setPredictionResult('High Risk'); // Placeholder for prediction result
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.title}>Dashboard</Text>
      <Button title="Upload Audio File" onPress={handleFileUpload} />
      {predictionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Prediction Result:</Text>
          <Text style={styles.result}>{predictionResult}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 16,
    color: 'red',
  },
});

export default Login;
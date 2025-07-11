import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);

  const languages = ['English', 'Spanish', 'French'];

  const handleLanguageChange = () => {
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={(value) => setIsDarkMode(value)}
          trackColor={{ false: '#767577', true: '#00ffff' }}
          thumbColor={isDarkMode ? '#00ffff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Language</Text>
        <TouchableOpacity style={styles.languagePicker} onPress={handleLanguageChange}>
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={(value) => setNotifications(value)}
          trackColor={{ false: '#767577', true: '#00ffff' }}
          thumbColor={notifications ? '#00ffff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>BreatheMate v1.0.0</Text>
        <Text style={styles.aboutText}>AI-Powered Lung Health Tracker</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  languagePicker: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffff',
    minWidth: 100,
  },
  languageText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  section: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
});

export default SettingsScreen;
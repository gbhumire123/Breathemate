import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    dailyReminders: true,
    dataSharing: false,
    autoBackup: true,
    darkMode: true,
  });
  
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Geetheswar',
    email: 'geetheswar@example.com',
    age: '25',
    medicalConditions: '',
  });

  useEffect(() => {
    loadSettings();
    loadProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      setProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your recordings, journal entries, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'journalEntries',
                'breathingSamples',
                'appSettings',
                'userProfile'
              ]);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be prepared for export. This may take a moment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // Simulate export process
          Alert.alert('Success', 'Data exported successfully! Check your downloads folder.');
        }}
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, value, onToggle, onPress, showArrow = false }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !onToggle}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color="#00ffff" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {onToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: '#00ffff' }}
            thumbColor={value ? '#fff' : '#f4f3f4'}
          />
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#888" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your BreatheMate experience</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <SectionHeader title="Profile" />
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => setProfileModalVisible(true)}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 128, 255, 0.1)']}
              style={styles.profileGradient}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {profileData.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileData.name}</Text>
                <Text style={styles.profileEmail}>{profileData.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#00ffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive health reminders and alerts"
              value={settings.notifications}
              onToggle={() => toggleSetting('notifications')}
            />
            <SettingItem
              icon="volume-high"
              title="Sound Alerts"
              subtitle="Play sounds for important notifications"
              value={settings.soundAlerts}
              onToggle={() => toggleSetting('soundAlerts')}
            />
            <SettingItem
              icon="time"
              title="Daily Reminders"
              subtitle="Remind me to record my breathing"
              value={settings.dailyReminders}
              onToggle={() => toggleSetting('dailyReminders')}
            />
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <SectionHeader title="Privacy & Data" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="shield-checkmark"
              title="Data Sharing"
              subtitle="Share anonymous data to improve AI models"
              value={settings.dataSharing}
              onToggle={() => toggleSetting('dataSharing')}
            />
            <SettingItem
              icon="cloud-upload"
              title="Auto Backup"
              subtitle="Automatically backup your data to cloud"
              value={settings.autoBackup}
              onToggle={() => toggleSetting('autoBackup')}
            />
            <SettingItem
              icon="download"
              title="Export Data"
              subtitle="Download all your health data"
              onPress={exportData}
              showArrow
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <SectionHeader title="App Preferences" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Use dark theme throughout the app"
              value={settings.darkMode}
              onToggle={() => toggleSetting('darkMode')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Get answers to common questions"
              onPress={() => Alert.alert('Help', 'Opening help center...')}
              showArrow
            />
            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Get help from our support team"
              onPress={() => Alert.alert('Contact', 'Opening support chat...')}
              showArrow
            />
            <SettingItem
              icon="star"
              title="Rate App"
              subtitle="Help us improve by rating the app"
              onPress={() => Alert.alert('Rating', 'Thank you for your feedback!')}
              showArrow
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="information-circle"
              title="App Version"
              subtitle="1.0.0 (Build 1)"
              showArrow
            />
            <SettingItem
              icon="document-text"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => Alert.alert('Privacy', 'Opening privacy policy...')}
              showArrow
            />
            <SettingItem
              icon="document"
              title="Terms of Service"
              subtitle="Read our terms of service"
              onPress={() => Alert.alert('Terms', 'Opening terms of service...')}
              showArrow
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <SectionHeader title="Danger Zone" />
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 82, 82, 0.1)']}
              style={styles.dangerGradient}
            >
              <Ionicons name="trash" size={20} color="#ff6b6b" />
              <View style={styles.dangerText}>
                <Text style={styles.dangerTitle}>Clear All Data</Text>
                <Text style={styles.dangerSubtitle}>Permanently delete all app data</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={profileData.email}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your age"
                  placeholderTextColor="#888"
                  value={profileData.age}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, age: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medical Conditions (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="List any relevant medical conditions or medications"
                  placeholderTextColor="#888"
                  value={profileData.medicalConditions}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, medicalConditions: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <LinearGradient
                  colors={['#00ff88', '#00cc66']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 15,
    marginLeft: 5,
  },
  profileCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f0f0f',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  settingsGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  settingRight: {
    alignItems: 'center',
  },
  dangerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  dangerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dangerText: {
    marginLeft: 15,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 2,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#ff6b6b',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#00ffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
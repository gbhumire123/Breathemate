import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'good',
    symptoms: [],
  });

  const moods = [
    { value: 'excellent', label: 'Excellent', icon: '😊', color: '#00ff88' },
    { value: 'good', label: 'Good', icon: '🙂', color: '#00ffff' },
    { value: 'okay', label: 'Okay', icon: '😐', color: '#ffaa00' },
    { value: 'poor', label: 'Poor', icon: '😔', color: '#ff6b6b' },
  ];

  const commonSymptoms = [
    'Shortness of breath', 'Chest tightness', 'Wheezing', 'Cough',
    'Fatigue', 'Anxiety', 'Sleep issues', 'Exercise intolerance'
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem('journalEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.log('Error loading entries:', error);
    }
  };

  const saveEntries = async (updatedEntries) => {
    try {
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.log('Error saving entries:', error);
    }
  };

  const addEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    const entry = {
      id: Date.now(),
      ...newEntry,
      date: new Date().toISOString(),
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    saveEntries(updatedEntries);

    setNewEntry({ title: '', content: '', mood: 'good', symptoms: [] });
    setModalVisible(false);
    Alert.alert('Success', 'Journal entry added!');
  };

  const deleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEntries = entries.filter(e => e.id !== entryId);
            setEntries(updatedEntries);
            saveEntries(updatedEntries);
          }
        }
      ]
    );
  };

  const toggleSymptom = (symptom) => {
    setNewEntry(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const getMoodData = (mood) => {
    return moods.find(m => m.value === mood) || moods[1];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Journal</Text>
        <Text style={styles.subtitle}>Track your daily health and symptoms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={['#00ffff', '#0080ff']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>New Entry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={60} color="#444" />
            <Text style={styles.emptyStateText}>No journal entries yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start tracking your health journey by adding your first entry
            </Text>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            {entries.map((entry) => {
              const moodData = getMoodData(entry.mood);
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    </View>
                    <View style={styles.entryActions}>
                      <View style={[styles.moodIndicator, { backgroundColor: moodData.color + '20' }]}>
                        <Text style={styles.moodEmoji}>{moodData.icon}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteEntry(entry.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.entryContent}>{entry.content}</Text>

                  {entry.symptoms && entry.symptoms.length > 0 && (
                    <View style={styles.symptomsContainer}>
                      <Text style={styles.symptomsTitle}>Symptoms:</Text>
                      <View style={styles.symptomsList}>
                        {entry.symptoms.map((symptom, index) => (
                          <View key={index} style={styles.symptomTag}>
                            <Text style={styles.symptomText}>{symptom}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.entryFooter}>
                    <Text style={[styles.moodText, { color: moodData.color }]}>
                      Feeling {moodData.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Journal Entry</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Title Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="How are you feeling today?"
                  placeholderTextColor="#888"
                  value={newEntry.title}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, title: text }))}
                />
              </View>

              {/* Mood Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Overall Mood</Text>
                <View style={styles.moodGrid}>
                  {moods.map((mood) => (
                    <TouchableOpacity
                      key={mood.value}
                      style={[
                        styles.moodOption,
                        newEntry.mood === mood.value && styles.moodOptionSelected,
                        { borderColor: mood.color }
                      ]}
                      onPress={() => setNewEntry(prev => ({ ...prev, mood: mood.value }))}
                    >
                      <Text style={styles.moodOptionEmoji}>{mood.icon}</Text>
                      <Text style={[styles.moodOptionText, { color: mood.color }]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Symptoms */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Symptoms (if any)</Text>
                <View style={styles.symptomsGrid}>
                  {commonSymptoms.map((symptom) => (
                    <TouchableOpacity
                      key={symptom}
                      style={[
                        styles.symptomOption,
                        newEntry.symptoms.includes(symptom) && styles.symptomOptionSelected
                      ]}
                      onPress={() => toggleSymptom(symptom)}
                    >
                      <Text style={[
                        styles.symptomOptionText,
                        newEntry.symptoms.includes(symptom) && styles.symptomOptionTextSelected
                      ]}>
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Content Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your day, symptoms, or any observations..."
                  placeholderTextColor="#888"
                  value={newEntry.content}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, content: text }))}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={addEntry}>
                <LinearGradient
                  colors={['#00ff88', '#00cc66']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Entry</Text>
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
    marginBottom: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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
    lineHeight: 20,
  },
  entriesContainer: {
    paddingBottom: 30,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  entryDate: {
    fontSize: 12,
    color: '#888',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 15,
  },
  symptomsContainer: {
    marginBottom: 15,
  },
  symptomsTitle: {
    fontSize: 12,
    color: '#ffaa00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  symptomText: {
    fontSize: 10,
    color: '#ffaa00',
  },
  entryFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  moodText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    height: 120,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 2,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  moodOptionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.3)',
  },
  symptomOptionSelected: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
  },
  symptomOptionText: {
    fontSize: 12,
    color: '#888',
  },
  symptomOptionTextSelected: {
    color: '#ffaa00',
    fontWeight: 'bold',
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

export default JournalScreen;
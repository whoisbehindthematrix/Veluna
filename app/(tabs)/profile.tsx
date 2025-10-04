import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '@/contexts/CycleContext';
import { User, Settings, Calendar, Heart, Download, Trash2, Chrome as Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { state, dispatch, saveData } = useCycle();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(state.profile);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const [day, month, year] = dateOfBirth.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Update age when date of birth changes
  const handleDateOfBirthChange = (dateOfBirth: string) => {
    const age = dateOfBirth.length === 10 ? calculateAge(dateOfBirth) : editedProfile.age;
    setEditedProfile({ 
      ...editedProfile, 
      dateOfBirth,
      age: age > 0 ? age : editedProfile.age
    });
  };

  const saveProfile = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: editedProfile });
    setIsEditing(false);
    saveData();
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const exportData = () => {
    // In a real app, this would export data to a file
    Alert.alert('Export Data', 'Data export functionality would be implemented here.');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your cycle data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'LOAD_DATA', payload: { entries: [], profile: editedProfile } });
            Alert.alert('Success', 'All data cleared.');
          },
        },
      ]
    );
  };

  const wellnessGoalOptions = [
    'Better mood tracking',
    'Improved sleep',
    'Pain management',
    'Exercise optimization',
    'Nutrition planning',
    'Fertility awareness',
    'General wellness',
  ];

  const toggleWellnessGoal = (goal: string) => {
    const currentGoals = editedProfile.wellnessGoals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    setEditedProfile({ ...editedProfile, wellnessGoals: updatedGoals });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#fdf2f8', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.homeIconContainer}>
          <View style={styles.backToHomeButton}>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Home size={20} color="#ec4899" />
            </TouchableOpacity>
            <Text style={styles.backToHomeText}>Home</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#ec4899" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Your Profile</Text>
              <Text style={styles.subtitle}>Manage your cycle preferences</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Cycle Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Cycle Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={24} color="#ec4899" />
            <Text style={styles.statNumber}>{state.profile.averageCycleLength}</Text>
            <Text style={styles.statLabel}>Days Average Cycle</Text>
          </View>
          <View style={styles.statCard}>
            <Heart size={24} color="#f97316" />
            <Text style={styles.statNumber}>{state.entries.length}</Text>
            <Text style={styles.statLabel}>Logged Days</Text>
          </View>
          <View style={styles.statCard}>
            <Settings size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{state.cycleDay}</Text>
            <Text style={styles.statLabel}>Current Day</Text>
          </View>
        </View>
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity
            onPress={() => isEditing ? saveProfile() : setIsEditing(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth (DD-MM-YYYY)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={editedProfile.dateOfBirth || ''}
              onChangeText={handleDateOfBirthChange}
              placeholder="DD-MM-YYYY"
              maxLength={10}
              editable={isEditing}
            />
            {editedProfile.dateOfBirth && (
              <Text style={styles.ageDisplay}>Age: {editedProfile.age} years</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Average Cycle Length (days)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={editedProfile.averageCycleLength.toString()}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, averageCycleLength: parseInt(text) || 28 })}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Period Start Date</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={editedProfile.lastPeriodStart || ''}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, lastPeriodStart: text })}
              placeholder="YYYY-MM-DD"
              editable={isEditing}
            />
          </View>
        </View>
      </View>

      {/* Wellness Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wellness Goals</Text>
        <Text style={styles.sectionSubtitle}>Select areas you'd like to focus on</Text>
        
        <View style={styles.goalsContainer}>
          {wellnessGoalOptions.map((goal, index) => {
            const isSelected = (editedProfile.wellnessGoals || []).includes(goal);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.goalChip,
                  isSelected && styles.goalChipSelected,
                  !isEditing && styles.goalChipDisabled
                ]}
                onPress={() => isEditing && toggleWellnessGoal(goal)}
                disabled={!isEditing}
              >
                <Text style={[
                  styles.goalChipText,
                  isSelected && styles.goalChipTextSelected
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionSubtitle}>Export or clear your cycle data</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Download size={20} color="#059669" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllData}>
            <Trash2 size={20} color="#dc2626" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Note */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your data is stored locally on your device and never shared with third parties. 
          Your privacy is our priority.
        </Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  homeIconContainer: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  backToHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    margin: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ec4899',
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  ageDisplay: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  goalChipSelected: {
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
  },
  goalChipDisabled: {
    opacity: 0.6,
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  goalChipTextSelected: {
    color: '#ec4899',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  dangerText: {
    color: '#dc2626',
  },
  privacyNote: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  privacyText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
/**
 * QuickNoteModal Component
 * 
 * A reusable modal for creating and editing quick notes
 * Features: Title, Icon, Text, and Reminder toggle
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Save, Bell, BellOff, Trash2 } from 'lucide-react-native';
import AppText from './AppText';
import { useTheme } from '@/src/context/ThemeContext';
import type { QuickNote } from '@/src/store/slices/cycleSlice';
import NeuPressable from './NeuPressable';
import { addOpacityToHex, darkenColor } from '@/src/utils';
import NeuButton from './NeuButton';

// ============================================================================
// TYPES
// ============================================================================

export interface QuickNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
  initialNote?: QuickNote | null;
  date: string; // ISO date string
}

// Common icon options for quick notes
const ICON_OPTIONS = [
  { emoji: '📝', name: 'Note' },
  { emoji: '💭', name: 'Thought' },
  { emoji: '💡', name: 'Idea' },
  { emoji: '🎯', name: 'Goal' },
  { emoji: '💊', name: 'Medication' },
  { emoji: '😊', name: 'Feeling' },
  { emoji: '🏋️', name: 'Exercise' },
  { emoji: '🍎', name: 'Food' },
  { emoji: '💤', name: 'Sleep' },
  { emoji: '❤️', name: 'Health' },
  { emoji: '⚡', name: 'Energy' },
  { emoji: '🌙', name: 'Night' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function QuickNoteModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialNote,
  date,
}: QuickNoteModalProps) {
  const { theme, accentColor } = useTheme();
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [text, setText] = useState('');
  const [reminder, setReminder] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  // Load initial note data when modal opens or note changes
  useEffect(() => {
    if (visible) {
      if (initialNote) {
        setTitle(initialNote.title || '');
        setIcon(initialNote.icon || '');
        setText(initialNote.text || '');
        setReminder(initialNote.reminder || false);
      } else {
        // Reset to defaults for new note
        setTitle('');
        setIcon('');
        setText('');
        setReminder(false);
      }
      setShowIconPicker(false);
    }
  }, [visible, initialNote]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your note.');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Validation Error', 'Please enter some text for your note.');
      return;
    }

    onSave({
      date,
      title: title.trim(),
      icon: icon || undefined,
      text: text.trim(),
      reminder,
      reminderTime: reminder ? new Date().toISOString() : undefined,
    });

    // Reset form
    setTitle('');
    setIcon('');
    setText('');
    setReminder(false);
    onClose();
  };

  const handleDelete = () => {
    if (!initialNote?.id || !onDelete) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(initialNote.id!);
            onClose();
          },
        },
      ]
    );
  };

  const isEditing = !!initialNote?.id;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dynamicStyles.container}
      >
        <View style={dynamicStyles.overlay}>
          <View style={[dynamicStyles.modalContent, { backgroundColor: theme.cardBackground }]}>
            {/* Header */}
            <View style={[dynamicStyles.header, { borderBottomColor: addOpacityToHex(accentColor, 0.2) }]}>
              <View style={dynamicStyles.headerLeft}>
                <NeuPressable
                  backgroundColor={accentColor}
                  shadowColor={accentColor}
                  borderRadius={16}
                  pressDepth={0}
                  style={dynamicStyles.headerIconWrapper}
                  contentStyle={dynamicStyles.headerIconContent}
                  disabled={true}
                >
                  <Text style={dynamicStyles.headerIconText}>📝</Text>
                </NeuPressable>
                <View>
                  <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>
                    {isEditing ? 'Edit Quick Note' : 'New Quick Note'}
                  </AppText>
                  <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </AppText>
                </View>
              </View>
              <NeuPressable
                onPress={onClose}
                backgroundColor={theme.cardBackground}
                shadowColor={accentColor}
                borderRadius={18}
                pressDepth={4}
                style={dynamicStyles.closeButtonWrapper}
                contentStyle={dynamicStyles.closeButtonContent}
              >
                <X size={20} color={accentColor} />
              </NeuPressable>
            </View>

            <ScrollView
              style={dynamicStyles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title Input */}
              <View style={dynamicStyles.inputSection}>
                <View style={dynamicStyles.labelRow}>
                  <AppText style={[dynamicStyles.label, { color: theme.textPrimary }]}>Title</AppText>
                  <AppText style={dynamicStyles.required}>*</AppText>
                </View>
                <TextInput
                  style={[dynamicStyles.input, { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: accentColor, 
                    color: theme.textPrimary 
                  }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Give your note a title"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {/* Icon Picker */}
              <View style={dynamicStyles.inputSection}>
                <AppText style={[dynamicStyles.label, { color: theme.textPrimary }]}>Icon (Optional)</AppText>
                <NeuPressable
                  onPress={() => setShowIconPicker(!showIconPicker)}
                  backgroundColor={theme.cardBackground}
                  shadowColor={accentColor}
                  borderRadius={16}
                  pressDepth={5}
                  style={dynamicStyles.iconPickerButtonWrapper}
                  contentStyle={dynamicStyles.iconPickerButtonContent}
                >
                  {icon ? (
                    <Text style={dynamicStyles.iconDisplay}>{icon}</Text>
                  ) : (
                    <AppText style={[dynamicStyles.iconPlaceholder, { color: theme.textSecondary }]}>Tap to select icon</AppText>
                  )}
                </NeuPressable>

                {showIconPicker && (
                  <View style={[dynamicStyles.iconGrid, { 
                    backgroundColor: addOpacityToHex(accentColor, 0.08), 
                    borderColor: addOpacityToHex(accentColor, 0.3) 
                  }]}>
                    {ICON_OPTIONS.map((iconOption, index) => (
                      <NeuPressable
                        key={index}
                        onPress={() => {
                          setIcon(iconOption.emoji);
                          setShowIconPicker(false);
                        }}
                        backgroundColor={icon === iconOption.emoji ? accentColor : theme.cardBackground}
                        shadowColor={icon === iconOption.emoji ? accentColor : '#000'}
                        borderRadius={14}
                        pressDepth={icon === iconOption.emoji ? 0 : 4}
                        style={dynamicStyles.iconOptionWrapper}
                        contentStyle={dynamicStyles.iconOptionContent}
                      >
                        <Text style={[dynamicStyles.iconOptionEmoji, { color: icon === iconOption.emoji ? theme.cardBackground : theme.textPrimary }]}>{iconOption.emoji}</Text>
                      </NeuPressable>
                    ))}
                    {icon && (
                      <NeuPressable
                        onPress={() => {
                          setIcon('');
                          setShowIconPicker(false);
                        }}
                        backgroundColor="#fee2e2"
                        shadowColor="#dc2626"
                        borderRadius={14}
                        pressDepth={5}
                        style={dynamicStyles.iconOptionWrapper}
                        contentStyle={dynamicStyles.iconOptionContent}
                      >
                        <X size={20} color="#dc2626" />
                      </NeuPressable>
                    )}
                  </View>
                )}
              </View>

              {/* Text Input */}
              <View style={dynamicStyles.inputSection}>
                <View style={dynamicStyles.labelRow}>
                  <AppText style={[dynamicStyles.label, { color: theme.textPrimary }]}>Note Content</AppText>
                  <AppText style={dynamicStyles.required}>*</AppText>
                </View>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea, { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: accentColor, 
                    color: theme.textPrimary 
                  }]}
                  value={text}
                  onChangeText={setText}
                  placeholder="Write your thoughts, reminders, or anything you want to remember..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Reminder Toggle */}
              <View style={[dynamicStyles.reminderSection, { 
                backgroundColor: addOpacityToHex(accentColor, 0.08), 
                borderColor: addOpacityToHex(accentColor, 0.3) 
              }]}>
                <View style={dynamicStyles.reminderHeader}>
                  {reminder ? (
                    <View style={[dynamicStyles.reminderIconWrapper, { backgroundColor: accentColor }]}>
                      <Bell size={20} color={theme.cardBackground} />
                    </View>
                  ) : (
                    <View style={[dynamicStyles.reminderIconWrapper, { backgroundColor: addOpacityToHex(accentColor, 0.15), borderColor: accentColor }]}>
                      <BellOff size={20} color={accentColor} />
                    </View>
                  )}
                  <AppText style={[dynamicStyles.reminderLabel, { color: theme.textPrimary }]}>Set Reminder</AppText>
                </View>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: '#e5e7eb', true: accentColor }}
                  thumbColor="#fff"
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={[dynamicStyles.actions, { borderTopColor: addOpacityToHex(accentColor, 0.2) }]}>
              {isEditing && onDelete && (
                <NeuPressable
                  onPress={handleDelete}
                  backgroundColor="#fee2e2"
                  shadowColor="#dc2626"
                  borderRadius={16}
                  pressDepth={6}
                  style={dynamicStyles.deleteButtonWrapper}
                  contentStyle={dynamicStyles.deleteButtonContent}
                >
                  <Trash2 size={18} color="#dc2626" />
                  <AppText style={dynamicStyles.deleteButtonText}>Delete</AppText>
                </NeuPressable>
              )}
              <NeuButton
                onPress={handleSave}
                disabled={!title.trim() || !text.trim()}
                backgroundColor={theme.cardBackground}
                shadowColor={darkenColor(accentColor, 0.2)}
                title={isEditing ? 'Update' : 'Save'}
                
                textStyle={{ color: theme.cardBackground }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopColor: accentColor,
    borderLeftColor: accentColor,
    borderRightColor: accentColor,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  headerIconWrapper: {
    alignSelf: 'flex-start',
  },
  headerIconContent: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButtonWrapper: {
    alignSelf: 'flex-start',
  },
  closeButtonContent: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: accentColor,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  required: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  input: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  iconPickerButtonWrapper: {
    alignSelf: 'stretch',
  },
  iconPickerButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderRadius: 16,
  },
  iconDisplay: {
    fontSize: 36,
  },
  iconPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 3,
  },
  iconOptionWrapper: {
    alignSelf: 'flex-start',
  },
  iconOptionContent: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 14,
  },
  iconOptionEmoji: {
    fontSize: 24,
  },
  reminderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 24,
    borderRadius: 18,
    borderWidth: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 2,
  },
  saveButtonWrapper: {
    flex: 1,
    alignSelf: 'stretch',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  deleteButtonWrapper: {
    alignSelf: 'flex-start',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});


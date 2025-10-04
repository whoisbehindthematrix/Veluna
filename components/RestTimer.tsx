import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';

interface RestTimerProps {
  visible: boolean;
  initialTime: number; // in seconds
  onClose: () => void;
  onComplete: () => void;
}

export function RestTimer({ visible, initialTime, onClose, onComplete }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeLeft(initialTime);
      setIsRunning(true);
      setIsCompleted(false);
    }
  }, [visible, initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const addTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds);
    if (isCompleted) {
      setIsCompleted(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Rest Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.timerDisplay}>
            <Text style={[
              styles.timeText,
              isCompleted && styles.completedText,
              timeLeft <= 10 && timeLeft > 0 && styles.warningText
            ]}>
              {formatTime(timeLeft)}
            </Text>
            
            {isCompleted && (
              <Text style={styles.completedLabel}>Rest Complete!</Text>
            )}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={toggleTimer}
            >
              {isRunning ? (
                <Pause size={24} color="#fff" />
              ) : (
                <Play size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetTimer}
            >
              <RotateCcw size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickAdd}>
            <Text style={styles.quickAddLabel}>Add Time:</Text>
            <View style={styles.quickAddButtons}>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(15)}
              >
                <Text style={styles.quickAddText}>+15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(30)}
              >
                <Text style={styles.quickAddText}>+30s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(60)}
              >
                <Text style={styles.quickAddText}>+1m</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onClose}
          >
            <Text style={styles.skipButtonText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timeText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  completedText: {
    color: '#10b981',
  },
  warningText: {
    color: '#ef4444',
  },
  completedLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#3b82f6',
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  quickAdd: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quickAddLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
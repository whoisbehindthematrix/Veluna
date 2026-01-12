import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import type { FlashMode } from 'expo-camera';
import Constants from 'expo-constants';
// Use legacy API for file info to avoid deprecation runtime error
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Zap, RefreshCcw, Check, Salad, Sun, Apple, Moon } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { supabase } from '@/lib/supabase';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface ScanResult {
  foodName?: string;
  portion?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface FoodScanModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: MealType;
  onMealTypeChange: (type: MealType) => void;
  onAddFromScan: (payload: { analysis: ScanResult; name: string; note?: string }) => void;
}

export const FoodScanModal: React.FC<FoodScanModalProps> = ({
  visible,
  onClose,
  mealType,
  onMealTypeChange,
  onAddFromScan,
}) => {
  const { theme, accentColor } = useTheme();
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const apiBase = useMemo(() => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
    if (envUrl) return envUrl;
    const hostUri = Constants.expoConfig?.hostUri || Constants.expoConfig?.updates?.url;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host) return `http://${host}:4000`;
    }
    return 'http://10.0.2.2:4000';
  }, []);
  const FLASH_OFF: FlashMode = 'off';
  const FLASH_ON: FlashMode = 'on';
  const [flash, setFlash] = useState<FlashMode>(FLASH_OFF);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  const [customName, setCustomName] = useState('');
  const [note, setNote] = useState('');

  const mealTypes: { key: MealType; name: string; icon: React.ReactNode; color: string }[] = useMemo(
    () => [
      {
        key: 'breakfast',
        name: 'Breakfast',
        icon: <Salad size={18} color={'#fbbf24'} />,
        color: '#fbbf24',
      },
      {
        key: 'lunch',
        name: 'Lunch',
        icon: <Sun size={18} color={'#f97316'} />,
        color: '#f97316',
      },
      {
        key: 'dinner',
        name: 'Dinner',
        icon: <Moon size={18} color={'#8b5cf6'} />,
        color: '#8b5cf6',
      },
      {
        key: 'snack',
        name: 'Snacks',
        icon: <Apple size={18} color={'#10b981'} />,
        color: '#10b981',
      },
    ],
    [accentColor]
  );

  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  useEffect(() => {
    let isMounted = true;
    const requestPermission = async () => {
      setIsRequesting(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (isMounted) {
        setHasPermission(status === 'granted');
        setIsRequesting(false);
      }
    };

    if (visible) {
      requestPermission();
      setResult(null);
      setPhotoUri(null);
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.45, // initial lower quality
        skipProcessing: true,
      });

      const compressedUri = await compressIfNeeded(photo.uri);
      setPhotoUri(compressedUri);

      const formData = new FormData();
      formData.append('photo', {
        uri: compressedUri,
        name: 'food.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('prompt', 'Scan this meal.');

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${apiBase}/api/food/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Analysis failed');
      }

      setResult(json.data as ScanResult);
    } catch (error: any) {
      console.error('Food scan failed', error);
      setResult(null);
      Alert.alert(
        'Scan failed',
        'Could not reach the scan service. Ensure the API is running and reachable from your device.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = () => {
    if (!result) return;
    const name = customName.trim() || result.foodName || 'Meal';
    onAddFromScan({ analysis: result, name, note: note.trim() || undefined });
    onClose();
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === FLASH_OFF ? FLASH_ON : FLASH_OFF));
  };

  const compressIfNeeded = async (uri: string) => {
    const getSizeOk = async (targetUri: string) => {
      const info = await FileSystem.getInfoAsync(targetUri);
      return info.exists && typeof info.size === 'number' ? info.size : null;
    };

    const initialSize = await getSizeOk(uri);
    if (initialSize !== null && initialSize <= MAX_SIZE_BYTES) return uri;

    // Dynamically load manipulator to avoid build-time typing issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ImageManipulator = require('expo-image-manipulator');

    let workingUri = uri;
    let quality = 0.4;
    let width = 1600;

    for (let i = 0; i < 4; i++) {
      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ resize: { width } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      const size = await getSizeOk(result.uri);
      if (size !== null && size <= MAX_SIZE_BYTES) {
        return result.uri;
      }

      // Prepare next iteration: reduce size and quality
      workingUri = result.uri;
      width = Math.max(720, Math.floor(width * 0.75));
      quality = Math.max(0.25, quality * 0.8);
    }

    const finalSize = await getSizeOk(workingUri);
    if (finalSize !== null && finalSize > MAX_SIZE_BYTES) {
      console.warn('Image still above 2MB after compression');
    }
    return workingUri;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={dynamicStyles.overlay}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.35)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={dynamicStyles.headerRow}>
          <TouchableOpacity style={dynamicStyles.iconButton} onPress={onClose}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.iconButton} onPress={toggleFlash}>
            <Zap size={18} color={flash === FLASH_ON ? accentColor : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.cameraContainer}>
          {hasPermission === false && (
            <View style={dynamicStyles.permissionCard}>
              <Text style={dynamicStyles.permissionTitle}>Camera access needed</Text>
              <Text style={dynamicStyles.permissionText}>
                Enable camera to scan your meals and log nutrition.
              </Text>
              <TouchableOpacity style={[dynamicStyles.ctaButton, { backgroundColor: accentColor }]} onPress={() => Camera.requestCameraPermissionsAsync()}>
                <Text style={dynamicStyles.ctaText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasPermission && (
            <CameraView
              ref={(ref) => {
                cameraRef.current = ref;
              }}
              style={dynamicStyles.camera}
              facing="back"
              flash={flash}
              ratio="4:3"
              
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.55)']}
                locations={[0, 0.35, 1]}
                style={dynamicStyles.cameraOverlay}
              >
                <View style={dynamicStyles.captureHint}>
                  <View style={dynamicStyles.captureIconCircle}>
                    {mealType === 'breakfast' && (
                      <Salad size={26} color="rgba(255,255,255,0.9)" />
                    )}
                    {mealType === 'lunch' && (
                      <Sun size={26} color="rgba(255,255,255,0.9)" />
                    )}
                    {mealType === 'dinner' && (
                      <Moon size={26} color="rgba(255,255,255,0.9)" />
                    )}
                    {mealType === 'snack' && (
                      <Apple size={26} color="rgba(255,255,255,0.9)" />
                    )}
                  </View>
                  <Text style={dynamicStyles.captureTitle}>Align your meal</Text>
                  <Text style={dynamicStyles.captureSubtitle}>
                    Good lighting gives better nutrition estimates.
                  </Text>
                </View>
              </LinearGradient>
            </CameraView>
          )}
        </View>

        <View style={[dynamicStyles.bottomSheet, { backgroundColor: theme.cardBackground }]}>
          <View style={dynamicStyles.mealTypeRow}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.key}
                style={[
                  dynamicStyles.mealChip,
                  { borderColor: `${meal.color}40` },
                  mealType === meal.key && {
                    backgroundColor: `${meal.color}20`,
                    borderColor: meal.color,
                  },
                ]}
                onPress={() => onMealTypeChange(meal.key)}
              >

                <View style={dynamicStyles.mealChipIcon}>
                  {meal.icon}
                </View>
                <Text
                  style={[
                    dynamicStyles.mealChipLabel,
                    { color: theme.textSecondary },
                    mealType === meal.key && { color: meal.color, fontWeight: '700' },
                  ]}
                >
                  {meal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={dynamicStyles.actionRow}>
            <TouchableOpacity
              style={[dynamicStyles.secondaryButton, { borderColor: theme.border }]}
              onPress={() => {
                setResult(null);
                setPhotoUri(null);
              }}
            >
              <RefreshCcw size={18} color={theme.textSecondary} />
              <Text style={[dynamicStyles.secondaryText, { color: theme.textSecondary }]}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.captureButton,
                { backgroundColor: isProcessing ? `${accentColor}70` : accentColor },
              ]}
              onPress={handleCapture}
              disabled={isProcessing || !hasPermission}
              activeOpacity={0.9}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={dynamicStyles.captureText}>Scan Meal</Text>
              )}
            </TouchableOpacity>
          </View>

          {result && (
            <View style={[dynamicStyles.resultCard, { borderColor: `${accentColor}40` }]}>
              <View style={dynamicStyles.resultHeader}>
                <Check size={18} color={accentColor} />
                <Text style={[dynamicStyles.resultTitle, { color: theme.textPrimary }]}>
                  {result.foodName || 'Meal detected'}
                </Text>
              </View>
              <Text style={[dynamicStyles.resultSubtitle, { color: theme.textSecondary }]}>
                {result.portion || '1 serving'}
              </Text>

              <View style={dynamicStyles.inputGroup}>
                <Text style={[dynamicStyles.inputLabel, { color: theme.textSecondary }]}>Meal name</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.cardBackground }]}
                  placeholder={result.foodName || 'Meal name'}
                  placeholderTextColor={theme.textSecondary}
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={[dynamicStyles.inputLabel, { color: theme.textSecondary }]}>Note (optional)</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.cardBackground }]}
                  placeholder="Add a note"
                  placeholderTextColor={theme.textSecondary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>

              <View style={dynamicStyles.macrosRow}>
                <MacroPill label="Calories" value={`${Math.round(result.calories || 0)} kcal`} accent={accentColor} themeText={theme.textPrimary} />
                <MacroPill label="Protein" value={`${Math.round(result.protein || 0)} g`} accent={accentColor} themeText={theme.textPrimary} />
                <MacroPill label="Carbs" value={`${Math.round(result.carbs || 0)} g`} accent={accentColor} themeText={theme.textPrimary} />
                <MacroPill label="Fat" value={`${Math.round(result.fat || 0)} g`} accent={accentColor} themeText={theme.textPrimary} />
              </View>
              <TouchableOpacity
                style={[dynamicStyles.primaryButton, { backgroundColor: accentColor }]}
                onPress={handleAdd}
              >
                <Text style={dynamicStyles.primaryText}>Add to log</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isRequesting && (
          <View style={dynamicStyles.permissionOverlay}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={dynamicStyles.permissionLoading}>Requesting camera access...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const MacroPill = ({
  label,
  value,
  accent,
  themeText,
}: {
  label: string;
  value: string;
  accent: string;
  themeText: string;
}) => (
  <View style={[styles.macroPill, { borderColor: `${accent}40` }]}>
    <Text style={[styles.macroLabel, { color: themeText }]}>{label}</Text>
    <Text style={[styles.macroValue, { color: accent }]}>{value}</Text>
  </View>
);

const createStyles = (theme: any, accentColor: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'flex-end',
    },
    headerRow: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 80,
      paddingBottom: 16,
    },
    camera: {
      width: 'auto',
      height: 'auto',
      aspectRatio: 1 / 1,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cameraOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    captureHint: {
      padding: 16,
      alignItems: 'center',
    },
    captureIconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    captureTitle: {
      color: '#fff',
      fontSize: 18,
      fontFamily: 'Bold',
    },
    captureSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      marginTop: 6,
    },
    bottomSheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 14,
      gap: 12,
    },
    mealTypeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    mealChip: {
      flex: 1,
      flexDirection: 'column',
    paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      // flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
  mealChipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
    mealChipLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
    },
    secondaryText: {
      fontWeight: '600',
      fontSize: 13,
    },
    captureButton: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureText: {
      color: '#fff',
      fontFamily: 'Bold',
      fontSize: 15,
    },
    resultCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      gap: 8,
      backgroundColor: theme.cardBackground,
      shadowColor: accentColor,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    resultSubtitle: {
      fontSize: 13,
      marginBottom: 6,
    },
    macrosRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    primaryButton: {
      marginTop: 6,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    inputGroup: {
      gap: 6,
      marginVertical: 6,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 42,
    },
    permissionCard: {
      width: '100%',
      padding: 20,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.35)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      gap: 10,
    },
    permissionTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    permissionText: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      lineHeight: 20,
    },
    ctaButton: {
      marginTop: 4,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    ctaText: {
      color: '#fff',
      fontWeight: '700',
    },
    permissionOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    permissionLoading: {
      marginTop: 10,
      color: '#fff',
    },
  });

const styles = StyleSheet.create({
  macroPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default FoodScanModal;

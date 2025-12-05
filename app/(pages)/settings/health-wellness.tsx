/**
 * Health & Wellness Settings Page
 * 
 * Handles health and wellness related settings:
 * - Activity level
 * - Daily calorie goal
 * - Height & weight
 * - Target weight
 * - Units system
 * - Wellness goals
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Activity as ActivityIcon,
  ChevronLeft,
  Globe,
  RefreshCcw,
  Ruler,
  Save,
  Target,
  Weight,
} from 'lucide-react-native';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import api from '@/lib/api';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { UserProfile as UserProfileState } from '@/src/store/slices/userProfileSlice';
import {
  BackendProfile,
  formatDateTime,
  toStringValue,
  toNumberOrNull,
} from '@/lib/profileUtils';

// ============================================================================
// TYPES
// ============================================================================

type HealthWellnessFormState = {
  activityLevel: string;
  dailyCalorieGoal: string;
  height: string;
  weight: string;
  targetWeight: string;
  unitsSystem: string;
  wellnessGoals: string;
};

const DEFAULT_FORM: HealthWellnessFormState = {
  activityLevel: '',
  dailyCalorieGoal: '',
  height: '',
  weight: '',
  targetWeight: '',
  unitsSystem: '',
  wellnessGoals: '',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HealthWellnessSettingsScreen() {
  const router = useRouter();
  const { theme, accentColor } = useTheme();
  const { profile, status, error, refresh } = useUserProfile();
  
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const profileRef = useRef<UserProfileState | null>(profile ?? null);
  const refreshInFlightRef = useRef(false);
  const loadingInFlightRef = useRef(false);

  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);
  const [form, setForm] = useState<HealthWellnessFormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Keep profile ref in sync
  useEffect(() => {
    profileRef.current = profile ?? null;
  }, [profile]);

  // Load profile metadata
  const metadata = {
    updatedAt: backendProfile?.updatedAt ?? profile?.updatedAt ?? null,
    lastSyncedAt: backendProfile?.lastSyncedAt ?? profile?.lastSyncedAt ?? null,
  };

  // Populate form from profile data
  const applyFormFromProfile = useCallback((data: BackendProfile | null, storeProfile: UserProfileState | null) => {
    if (!data && !storeProfile) {
      setForm(DEFAULT_FORM);
      return;
    }

    const source = data ?? null;
    const fallback = storeProfile ?? null;

    setForm({
      activityLevel: source?.activityLevel ?? fallback?.activityLevel ?? 'moderate',
      dailyCalorieGoal: toStringValue(source?.dailyCalorieGoal ?? fallback?.dailyCalorieGoal ?? 2000),
      height: toStringValue(source?.height ?? fallback?.height),
      weight: toStringValue(source?.weight ?? fallback?.weight),
      targetWeight: toStringValue(source?.targetWeight ?? fallback?.targetWeight),
      unitsSystem: source?.unitsSystem ?? fallback?.unitsSystem ?? 'metric',
      wellnessGoals: Array.isArray(source?.wellnessGoals)
        ? source.wellnessGoals.join(', ')
        : Array.isArray(fallback?.wellnessGoals)
        ? fallback.wellnessGoals.join(', ')
        : '',
    });
  }, []);

  // Load profile from API
  const loadProfile = useCallback(async () => {
    if (loadingInFlightRef.current) return;

    loadingInFlightRef.current = true;

    try {
      setLoading(true);
      console.log('🔵 [Health & Wellness] Loading profile from API...');

      const response = await api.get('/auth/me');
      console.log('✅ [Health & Wellness] API Response received');

      const userData = response.data?.user;
      if (!userData) {
        throw new Error('No user data received from server');
      }

      const profileData = userData.profile;
      if (!profileData) {
        throw new Error('No profile data found in user object');
      }

      console.log('📦 [Health & Wellness] Profile loaded successfully');
      setBackendProfile(profileData);
      applyFormFromProfile(profileData, profileRef.current);
    } catch (err: any) {
      console.error('❌ [Health & Wellness] Failed to load profile', err);
      Alert.alert(
        'Profile Error',
        err.response?.data?.message || err.message || 'Unable to load profile right now.'
      );
    } finally {
      loadingInFlightRef.current = false;
      setLoading(false);
    }
  }, [applyFormFromProfile]);

  // Auto-load profile on mount
  useEffect(() => {
    if (!profile && status === 'idle' && !refreshInFlightRef.current) {
      refreshInFlightRef.current = true;
      const maybePromise = refresh();
      if (maybePromise && typeof maybePromise.finally === 'function') {
        maybePromise.finally(() => {
          refreshInFlightRef.current = false;
        });
      } else {
        refreshInFlightRef.current = false;
      }
    }

    if (profile) {
      refreshInFlightRef.current = false;
    }
  }, [profile, status, refresh]);

  // Update form when profile data changes
  useEffect(() => {
    applyFormFromProfile(backendProfile, profile ?? null);
  }, [backendProfile, profile, applyFormFromProfile]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = (field: keyof HealthWellnessFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      console.log('🔵 [Health & Wellness] Saving settings...');

      const payload = {
        activityLevel: form.activityLevel.trim() || backendProfile?.activityLevel || profile?.activityLevel || 'moderate',
        dailyCalorieGoal: toNumberOrNull(form.dailyCalorieGoal, backendProfile?.dailyCalorieGoal ?? profile?.dailyCalorieGoal ?? 2000),
        height: toNumberOrNull(form.height, backendProfile?.height ?? profile?.height ?? null),
        weight: toNumberOrNull(form.weight, backendProfile?.weight ?? profile?.weight ?? null),
        targetWeight: toNumberOrNull(form.targetWeight, backendProfile?.targetWeight ?? profile?.targetWeight ?? null),
        unitsSystem: form.unitsSystem?.trim() || backendProfile?.unitsSystem || profile?.unitsSystem || 'metric',
        wellnessGoals: form.wellnessGoals
          ? form.wellnessGoals.split(',').map(item => item.trim()).filter(Boolean)
          : backendProfile?.wellnessGoals ?? profile?.wellnessGoals ?? [],
      };

      console.log('📤 [Health & Wellness] Saving payload:', payload);

      const response = await api.put('/auth/me', payload);
      console.log('✅ [Health & Wellness] Save successful');

      const userData = response.data?.user;
      if (!userData) {
        throw new Error('No user data received from server');
      }

      const profileData = userData.profile || userData;
      if (!profileData) {
        throw new Error('No profile data received from server');
      }

      if (response.data && 'success' in response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to update settings.');
      }

      setBackendProfile(profileData);
      applyFormFromProfile(profileData, profileRef.current);

      const refreshPromise = refresh();
      if (refreshPromise && typeof refreshPromise.finally === 'function') {
        refreshPromise.catch(() => undefined);
      }

      Alert.alert('Settings Updated', 'Your health & wellness settings have been saved successfully.');
    } catch (err: any) {
      console.error('❌ [Health & Wellness] Failed to save settings', err);
      Alert.alert(
        'Unable to Save',
        err.response?.data?.message || err.message || 'Please try again in a moment.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    const promises: Promise<unknown>[] = [loadProfile()];
    const refreshPromise = refresh();
    if (refreshPromise && typeof refreshPromise.then === 'function') {
      promises.push(refreshPromise.catch(() => undefined));
    }
    await Promise.all(promises);
  }, [loadProfile, refresh]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const isBusy = loading || saving;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient as [string, string]} style={dynamicStyles.header}>
          <View style={dynamicStyles.headerTopRow}>
            <TouchableOpacity 
              style={[dynamicStyles.backButton, { 
                backgroundColor: `${accentColor}20`, 
                borderColor: theme.border 
              }]} 
              onPress={() => router.back()}
            >
              <ChevronLeft size={18} color={accentColor} />
              <AppText style={[dynamicStyles.backButtonText, { color: accentColor }]}>Back</AppText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.refreshButton, { 
                borderColor: theme.border,
                backgroundColor: theme.primarySoft,
              }]} 
              onPress={handleRefresh}
            >
              <RefreshCcw size={18} color={accentColor} />
              <AppText style={[dynamicStyles.refreshText, { color: accentColor }]}>Refresh</AppText>
            </TouchableOpacity>
          </View>

          <AppText style={[dynamicStyles.headerTitle, { color: theme.textPrimary }]}>Health & Wellness</AppText>
          <AppText style={[dynamicStyles.headerSubtitle, { color: theme.textSecondary }]}>
            Configure your health goals and preferences for personalized insights.
          </AppText>
        </LinearGradient>

        {/* Loading Banner */}
        {isBusy && (
          <View style={[dynamicStyles.loadingBanner, { backgroundColor: `${accentColor}20` }]}>
            <ActivityIndicator color={accentColor} size="small" />
            <AppText style={[dynamicStyles.loadingText, { color: accentColor }]}>
              {saving ? 'Saving changes…' : 'Loading settings…'}
            </AppText>
          </View>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <View style={dynamicStyles.errorBanner}>
            <AppText style={dynamicStyles.errorTitle}>We hit a snag</AppText>
            <AppText style={dynamicStyles.errorBody}>{String(error)}</AppText>
          </View>
        )}

        {/* Health & Wellness Form */}
        <View style={[dynamicStyles.card, { 
          backgroundColor: theme.cardBackground, 
          borderColor: theme.border,
          shadowColor: accentColor,
        }]}>
          <AppText style={[dynamicStyles.sectionLabel, { color: theme.textPrimary }]}>Activity & Nutrition</AppText>

          <View style={dynamicStyles.fieldRow}>
            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<ActivityIcon size={18} color={accentColor} />}
              label="Activity level"
              value={form.activityLevel}
              placeholder="moderate"
              onChangeText={v => handleChange('activityLevel', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />

            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<Target size={18} color={accentColor} />}
              label="Daily calorie goal"
              value={form.dailyCalorieGoal}
              placeholder="2000"
              keyboardType="numeric"
              onChangeText={v => handleChange('dailyCalorieGoal', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />
          </View>

          <View style={dynamicStyles.fieldRow}>
            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<Weight size={18} color={accentColor} />}
              label="Current weight"
              value={form.weight}
              placeholder="60"
              keyboardType="numeric"
              onChangeText={v => handleChange('weight', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />

            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<Weight size={18} color={accentColor} />}
              label="Target weight"
              value={form.targetWeight}
              placeholder="55"
              keyboardType="numeric"
              onChangeText={v => handleChange('targetWeight', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />
          </View>

          <ProfileField
            theme={theme}
            accentColor={accentColor}
            dynamicStyles={dynamicStyles}
            icon={<Ruler size={18} color={accentColor} />}
            label="Height"
            value={form.height}
            placeholder="170"
            keyboardType="numeric"
            onChangeText={v => handleChange('height', v)}
          />

          <View style={dynamicStyles.fieldRow}>
            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<Globe size={18} color={accentColor} />}
              label="Units system"
              value={form.unitsSystem}
              placeholder="metric / imperial"
              onChangeText={v => handleChange('unitsSystem', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />

            <ProfileField
              theme={theme}
              accentColor={accentColor}
              dynamicStyles={dynamicStyles}
              icon={<Target size={18} color={accentColor} />}
              label="Wellness goals"
              helper="Separate with commas"
              value={form.wellnessGoals}
              placeholder="sleep, mood, nutrition"
              onChangeText={v => handleChange('wellnessGoals', v)}
              containerStyle={dynamicStyles.fieldHalf}
            />
          </View>
        </View>

        {/* Metadata Section */}
        <View style={[dynamicStyles.card, { 
          backgroundColor: theme.cardBackground, 
          borderColor: theme.border,
          shadowColor: accentColor,
        }]}>
          <AppText style={[dynamicStyles.sectionLabel, { color: theme.textPrimary }]}>Sync Information</AppText>
          <MetadataRow theme={theme} dynamicStyles={dynamicStyles} label="Last synced" value={formatDateTime(metadata.lastSyncedAt)} />
          <MetadataRow theme={theme} dynamicStyles={dynamicStyles} label="Last updated" value={formatDateTime(metadata.updatedAt)} />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            dynamicStyles.saveButton, 
            { 
              backgroundColor: accentColor,
              shadowColor: accentColor,
            },
            saving && { opacity: 0.6 }
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Save size={20} color="#fff" />
          <AppText style={dynamicStyles.saveButtonText}>
            {saving ? 'Saving…' : 'Save Changes'}
          </AppText>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ProfileField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  keyboardType,
  editable = true,
  containerStyle,
  theme,
  accentColor,
  dynamicStyles,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  helper?: string;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
  containerStyle?: any;
  theme: any;
  accentColor: string;
  dynamicStyles: any;
}) {
  return (
    <View style={[dynamicStyles.fieldContainer, containerStyle]}>
      <View style={dynamicStyles.fieldLabelRow}>
        <View style={[dynamicStyles.fieldIcon, { backgroundColor: `${accentColor}20` }]}>{icon}</View>
        <AppText style={[dynamicStyles.fieldLabel, { color: theme.textPrimary }]}>{label}</AppText>
      </View>
      <TextInput
        style={[
          dynamicStyles.input, 
          { 
            backgroundColor: theme.cardBackground, 
            borderColor: theme.border, 
            color: theme.textPrimary 
          },
          !editable && { backgroundColor: theme.primarySoft, color: theme.textSecondary }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        editable={editable}
        keyboardType={keyboardType}
      />
      {helper ? <AppText style={[dynamicStyles.helperText, { color: theme.textSecondary }]}>{helper}</AppText> : null}
    </View>
  );
}

function MetadataRow({ label, value, theme, dynamicStyles }: { label: string; value: string; theme: any; dynamicStyles: any }) {
  return (
    <View style={[dynamicStyles.metaRow, { borderBottomColor: theme.border }]}>
      <AppText style={[dynamicStyles.metaLabel, { color: theme.textSecondary }]}>{label}</AppText>
      <AppText style={[dynamicStyles.metaValue, { color: theme.textPrimary }]}>{value}</AppText>
    </View>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  backButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  refreshText: {
    fontWeight: '600',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loadingText: {
    fontWeight: '600',
    fontSize: 13,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    color: '#b91c1c',
    fontWeight: '700',
    marginBottom: 6,
  },
  errorBody: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldHalf: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});


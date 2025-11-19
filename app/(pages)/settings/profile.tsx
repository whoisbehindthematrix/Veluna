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
  Calendar,
  ChevronLeft,
  Droplet,
  Globe,
  RefreshCcw,
  Ruler,
  Save,
  Target,
  User,
  Weight,
} from 'lucide-react-native';
import AppText from '@/components/core-components/AppText';
import { lightTheme as theme } from '@/styles/theme';
import { apiGet, apiPut } from '@/lib/api';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { UserProfile as UserProfileState } from '@/src/store/slices/userProfileSlice';

type ApiProfileResponse = {
  success?: boolean;
  message?: string;
  data?: BackendProfile;
};

type BackendProfile = {
  id?: string;
  userId?: string;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  timezone?: string | null;
  averageCycleLength?: number | null;
  periodDuration?: number | null;
  lutealPhaseDays?: number | null;
  lastPeriodStart?: string | null;
  menopauseStatus?: string | null;
  wellnessGoals?: string[] | null;
  dailyCalorieGoal?: number | null;
  activityLevel?: string | null;
  height?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  unitsSystem?: 'metric' | 'imperial' | null;
  theme?: string | null;
  notifications?: Record<string, unknown> | null;
  language?: string | null;
  onboardingCompleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastSyncedAt?: string | null;
};

type FormState = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  timezone: string;
  averageCycleLength: string;
  periodDuration: string;
  lutealPhaseDays: string;
  dailyCalorieGoal: string;
  activityLevel: string;
  height: string;
  weight: string;
  targetWeight: string;
  unitsSystem: string;
  wellnessGoals: string;
};

const DEFAULT_FORM: FormState = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  timezone: '',
  averageCycleLength: '',
  periodDuration: '',
  lutealPhaseDays: '',
  dailyCalorieGoal: '',
  activityLevel: '',
  height: '',
  weight: '',
  targetWeight: '',
  unitsSystem: '',
  wellnessGoals: '',
};

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, status, error, refresh } = useUserProfile();

  const profileRef = useRef<UserProfileState | null>(profile ?? null);
  const refreshInFlightRef = useRef(false);
  const loadingInFlightRef = useRef(false);

  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileRef.current = profile ?? null;
  }, [profile]);

  const metadata = useMemo(
    () => ({
      createdAt: backendProfile?.createdAt ?? profile?.createdAt ?? null,
      updatedAt: backendProfile?.updatedAt ?? profile?.updatedAt ?? null,
      lastSyncedAt: backendProfile?.lastSyncedAt ?? profile?.lastSyncedAt ?? null,
      lastPeriodStart: backendProfile?.lastPeriodStart ?? profile?.lastPeriodStart ?? null,
    }),
    [backendProfile, profile]
  );

  const applyFormFromProfile = useCallback(
    (data: BackendProfile | null, storeProfile: UserProfileState | null) => {
      if (!data && !storeProfile) {
        setForm(DEFAULT_FORM);
        return;
      }

      const source = data ?? null;
      const fallback = storeProfile ?? null;

      const nextForm: FormState = {
        fullName: source?.fullName ?? fallback?.displayName ?? fallback?.firstName ?? '',
        gender: source?.gender ?? fallback?.gender ?? '',
        dateOfBirth: normaliseDateInput(source?.dateOfBirth ?? fallback?.dateOfBirth ?? ''),
        timezone: source?.timezone ?? fallback?.timezone ?? '',
        averageCycleLength: toStringValue(source?.averageCycleLength ?? fallback?.averageCycleLength),
        periodDuration: toStringValue(source?.periodDuration ?? fallback?.periodDuration),
        lutealPhaseDays: toStringValue(source?.lutealPhaseDays ?? fallback?.lutealPhaseDays),
        dailyCalorieGoal: toStringValue(source?.dailyCalorieGoal ?? fallback?.dailyCalorieGoal),
        activityLevel: source?.activityLevel ?? fallback?.activityLevel ?? '',
        height: toStringValue(source?.height ?? fallback?.height),
        weight: toStringValue(source?.weight ?? fallback?.weight),
        targetWeight: toStringValue(source?.targetWeight ?? fallback?.targetWeight),
        unitsSystem: (source?.unitsSystem ?? fallback?.unitsSystem ?? '') || '',
        wellnessGoals: Array.isArray(source?.wellnessGoals)
          ? source?.wellnessGoals.join(', ')
          : Array.isArray(fallback?.wellnessGoals)
          ? fallback?.wellnessGoals.join(', ')
          : '',
      };

      setForm(nextForm);
    },
    []
  );

  const loadProfile = useCallback(async () => {
    if (loadingInFlightRef.current) {
      return;
    }

    loadingInFlightRef.current = true;

    try {
      setLoading(true);
      const response = await apiGet<ApiProfileResponse>('/api/profile');
      const data = response?.data ?? (response as unknown as BackendProfile | null);

      if (!data || (response && 'success' in response && response.success === false)) {
        throw new Error(response?.message || 'Unable to load profile.');
      }

      setBackendProfile(data);
      applyFormFromProfile(data, profileRef.current);
    } catch (err: any) {
      console.error('Failed to load profile', err);
      Alert.alert('Profile', err?.message || 'Unable to load profile right now.');
    } finally {
      loadingInFlightRef.current = false;
      setLoading(false);
    }
  }, [applyFormFromProfile]);

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

  useEffect(() => {
    applyFormFromProfile(backendProfile, profile ?? null);
  }, [backendProfile, profile, applyFormFromProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const payload = buildPayload(form, backendProfile, profileRef.current);
      const response = await apiPut<ApiProfileResponse>('/api/profile', payload);

      if (response && 'success' in response && response.success === false) {
        throw new Error(response.message || 'Failed to update profile.');
      }

      const data = response?.data ?? (response as unknown as BackendProfile | null);

      if (data) {
        setBackendProfile(data);
        applyFormFromProfile(data, profileRef.current);
      }

      const refreshPromise = refresh();
      if (refreshPromise && typeof refreshPromise.finally === 'function') {
        refreshPromise.catch(() => undefined);
      }
      Alert.alert('Profile updated', 'Your profile details have been saved.');
    } catch (err: any) {
      console.error('Failed to save profile', err);
      Alert.alert('Unable to save', err?.message || 'Please try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    const promises: Promise<unknown>[] = [loadProfile()];
    const refreshPromise = refresh();
    if (refreshPromise && typeof refreshPromise.then === 'function') {
      promises.push(
        refreshPromise.catch(() => undefined)
      );
    }
    await Promise.all(promises);
  }, [loadProfile, refresh]);

  const isBusy = loading || saving;

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.headerGradient as [string, string]} style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={18} color={theme.primary} />
            <AppText style={styles.backButtonText}>Back</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <RefreshCcw size={18} color={theme.primary} />
            <AppText style={styles.refreshText}>Refresh</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.headerTitle}>Profile Details</AppText>
        <AppText style={styles.headerSubtitle}>
          Keep your personal information updated so we can personalise your wellness insights.
        </AppText>
      </LinearGradient>

      {(isBusy || saving) && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator color={theme.primary} size="small" />
          <AppText style={styles.loadingText}>
            {saving ? 'Saving changes…' : 'Fetching latest profile…'}
          </AppText>
        </View>
      )}

      {/* ERROR */}
      {error && !loading ? (
        <View style={styles.errorBanner}>
          <AppText style={styles.errorTitle}>We hit a snag</AppText>
          <AppText style={styles.errorBody}>{String(error)}</AppText>
        </View>
      ) : null}

      {/* PERSONAL INFORMATION */}
      <View style={styles.card}>
        <AppText style={styles.sectionLabel}>Personal information</AppText>

        <ProfileField
          icon={<User size={18} color={theme.primary} />}
          label="Full name"
          value={form.fullName}
          placeholder="Jane Doe"
          onChangeText={v => handleChange('fullName', v)}
        />

        <ProfileField
          icon={<Calendar size={18} color={theme.primary} />}
          label="Date of birth"
          helper="Format: YYYY-MM-DD"
          value={form.dateOfBirth}
          placeholder="1995-02-14"
          onChangeText={v => handleChange('dateOfBirth', v)}
        />

        <FieldRow>
          <ProfileField
            icon={<Target size={18} color={theme.primary} />}
            label="Gender"
            value={form.gender}
            placeholder="female"
            onChangeText={v => handleChange('gender', v)}
            containerStyle={styles.fieldHalf}
          />

          <ProfileField
            icon={<Globe size={18} color={theme.primary} />}
            label="Timezone"
            value={form.timezone}
            placeholder="UTC"
            onChangeText={v => handleChange('timezone', v)}
            containerStyle={styles.fieldHalf}
          />
        </FieldRow>
      </View>

      {/* HEALTH & WELLNESS */}
      <View style={styles.card}>
        <AppText style={styles.sectionLabel}>Health & wellness</AppText>

        <FieldRow>
          <ProfileField
            icon={<ActivityIcon size={18} color={theme.primary} />}
            label="Activity level"
            value={form.activityLevel}
            placeholder="moderate"
            onChangeText={v => handleChange('activityLevel', v)}
            containerStyle={styles.fieldHalf}
          />

          <ProfileField
            icon={<Target size={18} color={theme.primary} />}
            label="Daily calorie goal"
            value={form.dailyCalorieGoal}
            placeholder="2000"
            keyboardType="numeric"
            onChangeText={v => handleChange('dailyCalorieGoal', v)}
            containerStyle={styles.fieldHalf}
          />
        </FieldRow>

        <FieldRow>
          <ProfileField
            icon={<Weight size={18} color={theme.primary} />}
            label="Current weight"
            value={form.weight}
            placeholder="60"
            keyboardType="numeric"
            onChangeText={v => handleChange('weight', v)}
            containerStyle={styles.fieldHalf}
          />

          <ProfileField
            icon={<Weight size={18} color={theme.primary} />}
            label="Target weight"
            value={form.targetWeight}
            placeholder="55"
            keyboardType="numeric"
            onChangeText={v => handleChange('targetWeight', v)}
            containerStyle={styles.fieldHalf}
          />
        </FieldRow>

        <ProfileField
          icon={<Ruler size={18} color={theme.primary} />}
          label="Height"
          value={form.height}
          placeholder="170"
          keyboardType="numeric"
          onChangeText={v => handleChange('height', v)}
        />

        <FieldRow>
          <ProfileField
            icon={<Globe size={18} color={theme.primary} />}
            label="Units system"
            value={form.unitsSystem}
            placeholder="metric / imperial"
            onChangeText={v => handleChange('unitsSystem', v)}
            containerStyle={styles.fieldHalf}
          />

          <ProfileField
            icon={<Target size={18} color={theme.primary} />}
            label="Wellness goals"
            helper="Separate with commas."
            value={form.wellnessGoals}
            placeholder="sleep, mood, nutrition"
            onChangeText={v => handleChange('wellnessGoals', v)}
            containerStyle={styles.fieldHalf}
          />
        </FieldRow>
      </View>

      {/* METADATA */}
      <View style={styles.card}>
        <AppText style={styles.sectionLabel}>Sync & metadata</AppText>
        <MetadataRow label="Last synced" value={formatDateTime(metadata.lastSyncedAt)} />
        <MetadataRow label="Last updated" value={formatDateTime(metadata.updatedAt)} />
        <MetadataRow label="Created" value={formatDateTime(metadata.createdAt)} />
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Save size={20} color="#fff" />
        <AppText style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save changes'}</AppText>
      </TouchableOpacity>

      <View style={{ height: 48 }} />
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

function toStringValue(value?: number | null): string {
  return value === undefined || value === null ? '' : String(value);
}

function toNumberOrNull(value: string, fallback?: number | null): number | null {
  if (!value.trim()) {
    return fallback ?? null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback ?? null;
}

function normaliseDateInput(value: string | null | undefined): string {
  if (!value) return '';
  if (value.length === 10 && value.includes('-')) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildPayload(
  form: FormState,
  backendProfile: BackendProfile | null,
  storeProfile: UserProfileState | null
) {
  const numeric = <T extends keyof FormState>(field: T, fallback?: number | null) =>
    toNumberOrNull(form[field], fallback);

  const resolvedDateOfBirth = (() => {
    const raw = form.dateOfBirth.trim();
    if (!raw) {
      return backendProfile?.dateOfBirth ?? storeProfile?.dateOfBirth ?? null;
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime())
      ? backendProfile?.dateOfBirth ?? storeProfile?.dateOfBirth ?? null
      : parsed.toISOString();
  })();

  return {
    fullName: form.fullName || null,
    dateOfBirth: resolvedDateOfBirth,
    gender: form.gender || null,
    timezone: form.timezone || null,
    averageCycleLength: numeric('averageCycleLength', backendProfile?.averageCycleLength ?? storeProfile?.averageCycleLength ?? null),
    periodDuration: numeric('periodDuration', backendProfile?.periodDuration ?? storeProfile?.periodDuration ?? null),
    lutealPhaseDays: numeric('lutealPhaseDays', backendProfile?.lutealPhaseDays ?? storeProfile?.lutealPhaseDays ?? null),
    dailyCalorieGoal: numeric('dailyCalorieGoal', backendProfile?.dailyCalorieGoal ?? storeProfile?.dailyCalorieGoal ?? null),
    activityLevel: form.activityLevel || backendProfile?.activityLevel || storeProfile?.activityLevel || null,
    height: numeric('height', backendProfile?.height ?? storeProfile?.height ?? null),
    weight: numeric('weight', backendProfile?.weight ?? storeProfile?.weight ?? null),
    targetWeight: numeric('targetWeight', backendProfile?.targetWeight ?? storeProfile?.targetWeight ?? null),
    unitsSystem:
      form.unitsSystem?.trim() ||
      backendProfile?.unitsSystem ||
      storeProfile?.unitsSystem ||
      'metric',
    wellnessGoals: form.wellnessGoals
      ? form.wellnessGoals.split(',').map(item => item.trim()).filter(Boolean)
      : backendProfile?.wellnessGoals ?? storeProfile?.wellnessGoals ?? [],
    menopauseStatus: backendProfile?.menopauseStatus ?? storeProfile?.menopauseStatus ?? null,
    lastPeriodStart: backendProfile?.lastPeriodStart ?? storeProfile?.lastPeriodStart ?? null,
    notifications: backendProfile?.notifications ?? storeProfile?.notifications ?? null,
    language: backendProfile?.language ?? storeProfile?.language ?? null,
    onboardingCompleted:
      backendProfile?.onboardingCompleted ?? storeProfile?.onboardingCompleted ?? false,
  };
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.fieldRow}>{children}</View>;
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <AppText style={styles.metaLabel}>{label}</AppText>
      <AppText style={styles.metaValue}>{value}</AppText>
    </View>
  );
}

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
}) {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <View style={styles.fieldLabelRow}>
        <View style={styles.fieldIcon}>{icon}</View>
        <AppText style={styles.fieldLabel}>{label}</AppText>
      </View>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        editable={editable}
        keyboardType={keyboardType}
      />
      {helper ? <AppText style={styles.helperText}>{helper}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  backButtonText: {
    color: theme.primary,
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
    borderColor: theme.border,
    backgroundColor: '#ffffff55',
  },
  refreshText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.primarySoft,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loadingText: {
    color: theme.primary,
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
    backgroundColor: theme.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
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
    backgroundColor: theme.primarySoft,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: theme.primarySoft,
    color: theme.textSecondary,
  },
  helperText: {
    fontSize: 11,
    color: theme.textSecondary,
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
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  metaLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  metaValue: {
    fontSize: 12,
    color: theme.textPrimary,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.primary,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: theme.primary,
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


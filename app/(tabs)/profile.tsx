import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { signOut } from '@/src/store/slices/authSlice';
import { calculatePredictions, updateCurrentPhase, resetCycle } from '@/src/store/slices/cycleSlice';
import { Settings, Calendar, Heart, Download, Trash2, LogOut, BarChart3, UserCircle2 } from 'lucide-react-native';
import { useCycleInsights } from '@/hooks/useCycleInsights';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/src/context/ThemeContext';
import api from '@/lib/api';

// ============================================================================
// HELPERS
// ============================================================================

// Helper to add opacity to hex colors
const addOpacityToHex = (hex: string, opacity: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Convert opacity (0-1) to hex (00-FF)
  const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${cleanHex}${hexOpacity}`;
};

const getPhaseBadgeColor = (phase: string) => {
  switch (phase) {
    case 'menstrual':
      return '#e42a50';
    case 'luteal':
      return '#8b5cf6';
    case 'follicular':
      return '#3b82f6';
    case 'ovulatory':
      return '#fbbf24';
    default:
      return '#6b7280';
  }
};

const getPhaseIconImage = (phase: string) => {
  switch (phase) {
    case 'menstrual':
      return require('../../assets/images/hotwaterbottle.png');
    case 'luteal':
      return require('../../assets/images/lutealobj.png');
    case 'follicular':
      return require('../../assets/images/follipobj.png');
    case 'ovulatory':
      return require('../../assets/images/ovuobj.png');
    default:
      return require('../../assets/images/menstal.png');
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, accentColor } = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);
  const { profile: userProfile } = useUserProfile();
  const { cycle: cycleState, periodStats, cycleStats, dataQualityMeta } = useCycleInsights();
  
  // ✅ Store backend profile data
  const [backendProfile, setBackendProfile] = useState<{
    fullName?: string | null;
    wellnessGoals?: string[];
    averageCycleLength?: number;
    periodDuration?: number;
    lutealPhaseDays?: number;
  } | null>(null);

  // ✅ Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data?.user;
        if (userData?.profile) {
          setBackendProfile(userData.profile);
        }
      } catch (error) {
        console.warn('Failed to fetch profile for display:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (cycleState.entries.length >= 2) {
      dispatch(calculatePredictions());
      dispatch(updateCurrentPhase());
    }
  }, [cycleState.entries.length, dispatch]);

  // ✅ Get user name from backend profile, Redux profile, or auth
  const userName = useMemo(() => {
    // Priority: backend profile > Redux userProfile > auth user
    if (backendProfile?.fullName) {
      return backendProfile.fullName.trim();
    }
    if (userProfile) {
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
      }
      if (userProfile.displayName) {
        return userProfile.displayName;
      }
    }
    return 'Your Name';
  }, [backendProfile, userProfile]);

  // ✅ Get email from auth
  const userEmail = useMemo(() => {
    return user?.email || 'No email linked';
  }, [user]);

  // ✅ Get wellness goals (backend > Redux)
  const wellnessGoals = useMemo(() => {
    return backendProfile?.wellnessGoals || 
           userProfile?.wellnessGoals || 
           [];
  }, [backendProfile, userProfile]);

  // ✅ Get average cycle length (backend > Redux > cycleState)
  const averageCycleLength = useMemo(() => {
    return backendProfile?.averageCycleLength || 
           userProfile?.averageCycleLength || 
           cycleState.profile.averageCycleLength || 
           28;
  }, [backendProfile, userProfile, cycleState.profile.averageCycleLength]);

  // ✅ Get average period length (backend > Redux > cycleState)
  const averagePeriodLength = useMemo(() => {
    return backendProfile?.periodDuration || 
           userProfile?.periodDuration || 
           cycleState.profile.periodDuration || 
           5;
  }, [backendProfile, userProfile, cycleState.profile.periodDuration]);

  // ✅ Get luteal phase days (backend > Redux > cycleState)
  const lutealPhaseDays = useMemo(() => {
    return backendProfile?.lutealPhaseDays || 
           userProfile?.lutealPhaseDays || 
           cycleState.profile.lutealPhaseDays || 
           14;
  }, [backendProfile, userProfile, cycleState.profile.lutealPhaseDays]);

  const phaseBadgeColor = useMemo(
    () => getPhaseBadgeColor(cycleState.currentPhase.name),
    [cycleState.currentPhase.name]
  );

  const phaseIcon = useMemo(
    () => getPhaseIconImage(cycleState.currentPhase.name),
    [cycleState.currentPhase.name]
  );

  const exportData = useCallback(
    () => Alert.alert('Export Data', 'Data export feature coming soon.'),
    []
  );

  const clearAllData = useCallback(() => {
    Alert.alert('Clear All Data', 'This will remove all cycle data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          dispatch(resetCycle());
          Alert.alert('Cleared', 'All data removed.');
        },
      },
    ]);
  }, [dispatch]);

  const handleSignOut = useCallback(async () => {
    try {
      await dispatch(signOut()).unwrap();
      router.replace('/(pages)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  }, [dispatch, router]);

  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  return (
    <ScrollView style={[dynamicStyles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <ProfileHeader
        phaseDescription={cycleState.currentPhase.description}
        phaseBadgeColor={phaseBadgeColor}
        phaseIcon={phaseIcon}
        userName={userName}
        userEmail={userEmail}
        theme={theme}
        accentColor={accentColor}
        onNavigateHome={() => router.push('/')}
        onOpenSettings={() => router.push('/(pages)/settings')}
      />

      <CycleAnalyticsSection
        cycleStats={cycleStats}
        periodStats={periodStats}
        dataQualityMeta={dataQualityMeta}
        averageCycleLength={averageCycleLength}
        averagePeriodLength={averagePeriodLength}
        lutealPhaseDays={lutealPhaseDays}
        theme={theme}
        accentColor={accentColor}
      />

      <WellnessGoalsSection 
        wellnessGoals={wellnessGoals}
        theme={theme}
        accentColor={accentColor}
      />

      <DataManagementSection 
        onExport={exportData} 
        onClearAll={clearAllData}
        theme={theme}
        accentColor={accentColor}
      />

      <SignOutButton 
        onPress={handleSignOut}
        theme={theme}
        accentColor={accentColor}
      />

      <PrivacyNote theme={theme} accentColor={accentColor} />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ✅ Map wellness goal IDs to labels
const WELLNESS_GOAL_LABELS: Record<string, string> = {
  mood: 'Better mood tracking',
  sleep: 'Improved sleep',
  pain: 'Pain management',
  exercise: 'Exercise optimization',
  nutrition: 'Nutrition planning',
  fertility: 'Fertility awareness',
  wellness: 'General wellness',
};

type ProfileHeaderProps = {
  phaseDescription: string;
  phaseBadgeColor: string;
  phaseIcon: ImageSourcePropType;
  userName: string;
  userEmail: string;
  theme: any;
  accentColor: string;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
};

function ProfileHeader({
  phaseDescription,
  phaseBadgeColor,
  phaseIcon,
  userName,
  userEmail,
  theme,
  accentColor,
  onNavigateHome,
  onOpenSettings,
}: ProfileHeaderProps) {
  const headerStyles = createHeaderStyles(theme, accentColor);
  
  return (
    <LinearGradient colors={theme.headerGradient} style={headerStyles.header}>
      <View style={headerStyles.homeIconContainer}>
        <View style={headerStyles.backToHomeButton}>
          <TouchableOpacity onPress={onNavigateHome}>
            <UserCircle2 size={28} color={accentColor} />
          </TouchableOpacity>
          <Text style={headerStyles.backToHomeText}>Profile</Text>
        </View>

        <TouchableOpacity style={headerStyles.settingsButton} onPress={onOpenSettings}>
          <Settings size={28} color={accentColor} />
        </TouchableOpacity>
      </View>

      <View style={[headerStyles.profileHeaderContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View
          style={[
            headerStyles.avatarContainer,
            { borderColor: `${phaseBadgeColor}80` },
          ]}
        >
          <Image
            source={require('../../assets/images/dp.png')}
            style={headerStyles.avatarImage}
            resizeMode="contain"
          />
          <View
            style={[headerStyles.phaseBadge, { backgroundColor: phaseBadgeColor }]}
          >
            <Image
              source={phaseIcon}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={headerStyles.userInfoSection}>
          <Text style={[headerStyles.userName, { color: theme.textPrimary }]}>{userName}</Text>
          <Text style={[headerStyles.userEmail, { color: theme.textSecondary }]}>{userEmail}</Text>
          <View style={headerStyles.cycleDayContainer}>
            <View style={headerStyles.phaseInfo}>
              <Text style={[headerStyles.phaseDescription, { color: theme.textSecondary }]}>{phaseDescription}</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

type CycleAnalyticsSectionProps = {
  cycleStats: ReturnType<typeof useCycleInsights>['cycleStats'];
  periodStats: ReturnType<typeof useCycleInsights>['periodStats'];
  dataQualityMeta: ReturnType<typeof useCycleInsights>['dataQualityMeta'];
  averageCycleLength: number;
  averagePeriodLength: number;
  lutealPhaseDays: number;
  theme: any;
  accentColor: string;
};

function CycleAnalyticsSection({
  cycleStats,
  periodStats,
  dataQualityMeta,
  averageCycleLength,
  averagePeriodLength,
  lutealPhaseDays,
  theme,
  accentColor,
}: CycleAnalyticsSectionProps) {
  // ✅ Use calculated stats if available, otherwise use profile values
  const displayCycleLength = cycleStats.averageCycleLength || averageCycleLength;
  const displayPeriodLength = periodStats.averagePeriodLength || averagePeriodLength;
  const statsStyles = createStatsStyles(theme, accentColor);

  return (
    <View style={statsStyles.statsContainer}>
      <View style={statsStyles.sectionHeaderRow}>
        <Text style={[statsStyles.sectionTitle, { color: theme.textPrimary }]}>Cycle Analytics</Text>
        <View
          style={[
            statsStyles.qualityBadge,
            { backgroundColor: `${dataQualityMeta.color}20` },
          ]}
        >
          <Text
            style={[statsStyles.qualityBadgeText, { color: dataQualityMeta.color }]}
          >
            {dataQualityMeta.label}
          </Text>
        </View>
      </View>

      <View style={statsStyles.statsGrid}>
        <StatCard
          icon={<Calendar size={24} color={accentColor} />}
          iconBackground={addOpacityToHex(accentColor, 0.2)}
          value={displayCycleLength}
          label="Avg Cycle Length"
          theme={theme}
        />
        <StatCard
          icon={<Heart size={24} color={accentColor} />}
          iconBackground={addOpacityToHex(accentColor, 0.2)}
          value={displayPeriodLength}
          label="Avg Period Length"
          theme={theme}
        />
        <StatCard
          icon={<BarChart3 size={24} color={accentColor} />}
          iconBackground={addOpacityToHex(accentColor, 0.2)}
          value={lutealPhaseDays}
          label="Luteal Phase"
          theme={theme}
        />
      </View>
    </View>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  iconBackground: string;
  value: number;
  label: string;
  theme: any;
};

function StatCard({ icon, iconBackground, value, label, theme }: StatCardProps) {
  const statStyles = createStatCardStyles(theme);
  
  return (
    <View style={[statStyles.statCard, { backgroundColor: theme.cardBackground }]}>
      <View style={{ backgroundColor: iconBackground, padding: 10, borderRadius: 45 }}>
        {icon}
      </View>
      <Text style={[statStyles.statNumber, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[statStyles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

type WellnessGoalsSectionProps = {
  wellnessGoals: string[];
  theme: any;
  accentColor: string;
};

function WellnessGoalsSection({ wellnessGoals, theme, accentColor }: WellnessGoalsSectionProps) {
  const goalsStyles = createGoalsStyles(theme, accentColor);
  
  // ✅ Map goal IDs/strings to display labels
  const displayGoals = useMemo(() => {
    if (!wellnessGoals || wellnessGoals.length === 0) {
      return [];
    }
    
    return wellnessGoals.map((goal) => {
      // If goal is already a label, use it; otherwise map from WELLNESS_GOAL_LABELS
      const label = WELLNESS_GOAL_LABELS[goal.toLowerCase()] || goal;
      return { id: goal, label };
    });
  }, [wellnessGoals]);

  if (displayGoals.length === 0) {
    return (
      <View style={goalsStyles.section}>
        <Text style={[goalsStyles.sectionTitle, { color: theme.textPrimary }]}>Wellness Goals</Text>
        <Text style={[goalsStyles.sectionSubtitle, { color: theme.textSecondary }]}>No goals set yet</Text>
        <View style={goalsStyles.goalsContainer}>
          <Text style={[goalsStyles.emptyGoalsText, { color: theme.textSecondary }]}>
            Add wellness goals in Settings → Profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={goalsStyles.section}>
      <Text style={[goalsStyles.sectionTitle, { color: theme.textPrimary }]}>Wellness Goals</Text>
      <Text style={[goalsStyles.sectionSubtitle, { color: theme.textSecondary }]}>Areas you focus on</Text>
      <View style={goalsStyles.goalsContainer}>
        {displayGoals.map((goal) => (
          <View key={goal.id} style={[goalsStyles.goalChip, { backgroundColor: addOpacityToHex(accentColor, 0.08), borderColor: addOpacityToHex(accentColor, 0.25) }]}>
            <Text style={[goalsStyles.goalChipText, { color: accentColor }]}>{goal.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type DataManagementSectionProps = {
  onExport: () => void;
  onClearAll: () => void;
  theme: any;
  accentColor: string;
};

function DataManagementSection({ onExport, onClearAll, theme, accentColor }: DataManagementSectionProps) {
  const dataStyles = createDataManagementStyles(theme, accentColor);
  
  return (
    <View style={dataStyles.section}>
      <Text style={[dataStyles.sectionTitle, { color: theme.textPrimary }]}>Data Management</Text>
      <Text style={[dataStyles.sectionSubtitle, { color: theme.textSecondary }]}>Export or clear your cycle data</Text>

      <View style={dataStyles.actionButtons}>
        <TouchableOpacity 
          style={[dataStyles.actionButton, { backgroundColor: addOpacityToHex(theme.success, 0.1) }]} 
          onPress={onExport}
        >
          <Download size={20} color={theme.success} />
          <Text style={[dataStyles.actionButtonText, { color: theme.success }]}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dataStyles.actionButton, dataStyles.dangerButton, { backgroundColor: addOpacityToHex('#dc2626', 0.1) }]}
          onPress={onClearAll}
        >
          <Trash2 size={20} color="#dc2626" />
          <Text style={[dataStyles.actionButtonText, dataStyles.dangerText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SignOutButton({ onPress, theme, accentColor }: { onPress: () => void; theme: any; accentColor: string }) {
  const signOutStyles = createSignOutStyles(theme, accentColor);
  
  return (
    <TouchableOpacity 
      style={[signOutStyles.signOutButton, { backgroundColor: accentColor }]} 
      onPress={onPress}
    >
      <LogOut size={20} color="#fff" />
      <Text style={signOutStyles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

function PrivacyNote({ theme, accentColor }: { theme: any; accentColor: string }) {
  const privacyStyles = createPrivacyStyles(theme);
  
  return (
    <View style={[privacyStyles.privacyNote, { backgroundColor: addOpacityToHex(accentColor, 0.08) }]}>
      <Text style={[privacyStyles.privacyText, { color: theme.textPrimary }]}>
        🔒 Your data is stored locally and never shared with third parties. Your privacy is our priority.
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES (Dynamic with theme support)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: { flex: 1 },
});

const createHeaderStyles = (theme: any, accentColor: string) => StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30 },
  homeIconContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backToHomeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backToHomeText: { fontSize: 20, fontWeight: '600', color: theme.textPrimary },
  settingsButton: { padding: 4 },
  profileHeaderContent: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  avatarContainer: { position: 'relative', marginRight: 16, borderWidth: 4, borderRadius: 50 },
  avatarImage: { width: 100, height: 100, borderRadius: 45, backgroundColor: theme.primarySoft },
  phaseBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14 },
  userInfoSection: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700' },
  userEmail: { fontSize: 12, fontWeight: '600' },
  cycleDayContainer: { flexDirection: 'row-reverse', marginTop: 12, alignItems: 'center', gap: 16 },
  cycleDayInfo: { alignItems: 'flex-end' },
  cycleDayLabel: { fontSize: 12 },
  cycleDayValue: { fontSize: 24, fontWeight: '700', backgroundColor: `${accentColor}20`, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 45, alignSelf: 'center', textAlign: 'center' },
  phaseInfo: { flex: 1 },
  phaseDescription: { fontSize: 12, fontFamily: 'Bold' },
});

const createStatsStyles = (theme: any, accentColor: string) => StyleSheet.create({
  statsContainer: { margin: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  qualityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  qualityBadgeText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Bold' },
});

const createStatCardStyles = (theme: any) => StyleSheet.create({
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statNumber: { fontSize: 24, fontWeight: '700', marginTop: 8 },
  statLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

const createGoalsStyles = (theme: any, accentColor: string) => StyleSheet.create({
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Bold' },
  sectionSubtitle: { fontSize: 14, marginBottom: 16 },
  goalsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  goalChipText: { fontSize: 14, fontWeight: '600' },
  emptyGoalsText: { fontSize: 14, fontStyle: 'italic', padding: 16, textAlign: 'center' },
});

const createDataManagementStyles = (theme: any, accentColor: string) => StyleSheet.create({
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Bold' },
  sectionSubtitle: { fontSize: 14, marginBottom: 16 },
  actionButtons: { gap: 12 },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dangerButton: {},
  actionButtonText: { fontSize: 16, fontWeight: '600' },
  dangerText: { color: '#dc2626' },
});

const createSignOutStyles = (theme: any, accentColor: string) => StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  signOutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const createPrivacyStyles = (theme: any) => StyleSheet.create({
  privacyNote: { margin: 20, padding: 16, borderRadius: 12 },
  privacyText: { fontSize: 14, lineHeight: 20 },
});

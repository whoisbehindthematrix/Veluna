import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/src/store/slices/authSlice';
import { calculatePredictions, updateCurrentPhase, resetCycle } from '@/src/store/slices/cycleSlice';
import { Settings, Calendar, Heart, Download, Trash2, LogOut, BarChart3, UserCircle2 } from 'lucide-react-native';
import { useCycleInsights } from '@/hooks/useCycleInsights';

// ============================================================================
// HELPERS
// ============================================================================

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
  const user = useSelector((s: RootState) => s.auth.user);
  const { cycle: cycleState, periodStats, cycleStats, dataQualityMeta } = useCycleInsights();

  useEffect(() => {
    if (cycleState.entries.length >= 2) {
      dispatch(calculatePredictions());
      dispatch(updateCurrentPhase());
    }
  }, [cycleState.entries.length, dispatch]);

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    dispatch(signOut());
    router.replace('/(pages)/login');
  }, [dispatch, router]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader
        phaseDescription={cycleState.currentPhase.description}
        phaseBadgeColor={phaseBadgeColor}
        phaseIcon={phaseIcon}
        userEmail={user?.email || 'No email linked'}
        onNavigateHome={() => router.push('/')}
        onOpenSettings={() => router.push('/(pages)/settings')}
      />

      <CycleAnalyticsSection
        cycleStats={cycleStats}
        periodStats={periodStats}
        dataQualityMeta={dataQualityMeta}
        lutealPhaseDays={cycleState.profile.lutealPhaseDays}
        periodLengthFallback={cycleState.profile.periodDuration}
      />

      <WellnessGoalsSection />

      <DataManagementSection onExport={exportData} onClearAll={clearAllData} />

      <SignOutButton onPress={handleSignOut} />

      <PrivacyNote />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const WELLNESS_GOALS = [
  { id: 'mood', label: 'Better mood tracking' },
  { id: 'sleep', label: 'Improved sleep' },
  { id: 'pain', label: 'Pain management' },
  { id: 'exercise', label: 'Exercise optimization' },
  { id: 'nutrition', label: 'Nutrition planning' },
  { id: 'fertility', label: 'Fertility awareness' },
  { id: 'wellness', label: 'General wellness' },
] as const;

type ProfileHeaderProps = {
  phaseDescription: string;
  phaseBadgeColor: string;
  phaseIcon: ImageSourcePropType;
  userEmail: string;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
};

function ProfileHeader({
  phaseDescription,
  phaseBadgeColor,
  phaseIcon,
  userEmail,
  onNavigateHome,
  onOpenSettings,
}: ProfileHeaderProps) {
  return (
    <LinearGradient colors={['#fdf2f8', '#f8fafc']} style={styles.header}>
      <View style={styles.homeIconContainer}>
        <View style={styles.backToHomeButton}>
          <TouchableOpacity onPress={onNavigateHome}>
            <UserCircle2 size={28} color="#ec4899" />
          </TouchableOpacity>
          <Text style={styles.backToHomeText}>Profile</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
          <Settings size={28} color="#ec4899" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeaderContent}>
        <View
          style={[
            styles.avatarContainer,
            { borderColor: `${phaseBadgeColor}80` },
          ]}
        >
          <Image
            source={require('../../assets/images/dp.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
          <View
            style={[styles.phaseBadge, { backgroundColor: phaseBadgeColor }]}
          >
            <Image
              source={phaseIcon}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.userName}>Your Name</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          <View style={styles.cycleDayContainer}>
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseDescription}>{phaseDescription}</Text>
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
  lutealPhaseDays: number;
  periodLengthFallback: number;
};

function CycleAnalyticsSection({
  cycleStats,
  periodStats,
  dataQualityMeta,
  lutealPhaseDays,
  periodLengthFallback,
}: CycleAnalyticsSectionProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Cycle Analytics</Text>
        <View
          style={[
            styles.qualityBadge,
            { backgroundColor: `${dataQualityMeta.color}20` },
          ]}
        >
          <Text
            style={[styles.qualityBadgeText, { color: dataQualityMeta.color }]}
          >
            {dataQualityMeta.label}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<Calendar size={24} color="#ec4899" />}
          iconBackground="#ec489920"
          value={cycleStats.averageCycleLength}
          label="Avg Cycle Length"
        />
        <StatCard
          icon={<Heart size={24} color="#f97316" />}
          iconBackground="#f9731620"
          value={periodStats.averagePeriodLength || periodLengthFallback}
          label="Avg Period Length"
        />
        <StatCard
          icon={<BarChart3 size={24} color="#8b5cf6" />}
          iconBackground="#8b5cf620"
          value={lutealPhaseDays}
          label="Luteal Phase"
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
};

function StatCard({ icon, iconBackground, value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={{ backgroundColor: iconBackground, padding: 10, borderRadius: 45 }}>
        {icon}
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WellnessGoalsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Wellness Goals</Text>
      <Text style={styles.sectionSubtitle}>Areas you focus on</Text>
      <View style={styles.goalsContainer}>
        {WELLNESS_GOALS.map((goal) => (
          <View key={goal.id} style={[styles.goalChip, { opacity: 0.8 }]}>
            <Text style={styles.goalChipText}>{goal.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type DataManagementSectionProps = {
  onExport: () => void;
  onClearAll: () => void;
};

function DataManagementSection({ onExport, onClearAll }: DataManagementSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Data Management</Text>
      <Text style={styles.sectionSubtitle}>Export or clear your cycle data</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onExport}>
          <Download size={20} color="#059669" />
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={onClearAll}
        >
          <Trash2 size={20} color="#dc2626" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.signOutButton} onPress={onPress}>
      <LogOut size={20} color="#fff" />
      <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

function PrivacyNote() {
  return (
    <View style={styles.privacyNote}>
      <Text style={styles.privacyText}>
        🔒 Your data is stored locally and never shared with third parties. Your privacy is our priority.
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES (trimmed & clean)
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30 },
  homeIconContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backToHomeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backToHomeText: { fontSize: 20, fontWeight: '600', color: 'black' },
  settingsButton: { padding: 4 },
  profileHeaderContent: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'flex-start',
    borderColor: '#fce7f3',
    borderWidth: 1,
  },
  avatarContainer: { position: 'relative', marginRight: 16, borderWidth: 4, borderRadius: 50 },
  avatarImage: { width: 100, height: 100, borderRadius: 45, backgroundColor: '#fdf2f8' },
  phaseBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14 },
  userInfoSection: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  userEmail: { fontSize: 12,fontWeight: '600',  color: '#6b7280' },
  cycleDayContainer: { flexDirection: 'row-reverse', marginTop: 12, alignItems: 'center', gap: 16 },
  cycleDayInfo: { alignItems: 'flex-end' },
  cycleDayLabel: { fontSize: 12, color: '#9ca3af' },
  cycleDayValue: { fontSize: 24, fontWeight: '700', color: '#ec4899', backgroundColor: '#ec489920', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 45, alignSelf: 'center', textAlign: 'center' },
  phaseInfo: { flex: 1 },
  phaseDescription: { fontSize: 12,fontFamily: 'Bold',  color: '#6b7280' },
  statsContainer: { margin: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  qualityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  qualityBadgeText: { fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12,fontWeight: '600', color: '#6b7280', textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Bold', color: '#1f2937', },
  sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16, },
  goalsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  goalChipText: { fontSize: 14, color: '#4b5563' },
  actionButtons: { gap: 12 },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  dangerButton: { backgroundColor: '#fef2f2' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#059669' },
  dangerText: { color: '#dc2626' },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ff69b4',
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  signOutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  privacyNote: { margin: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12 },
  privacyText: { fontSize: 14, color: '#1e40af', lineHeight: 20 },
});

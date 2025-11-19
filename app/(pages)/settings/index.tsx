import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
	Bell,
	Calendar,
	ChevronRight,
	Database,
	Info,
	Lock,
	MoonStar,
	Palette,
	ShieldCheck,
	UserCog,
	Dumbbell,
	Apple,
	Brain,
	Settings,
	CloudUpload,
	Activity,
	Cpu,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AppText from '@/components/core-components/AppText';
import { lightTheme as theme } from '@/styles/theme';

export default function SettingsScreen() {
	const router = useRouter();
	const [notificationPrefs, setNotificationPrefs] = useState({
		periodPredictions: true,
		workoutReminders: false,
		nutritionTips: true,
	});

	const toggleNotification = (key: keyof typeof notificationPrefs, value: boolean) => {
		setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
	};

	const SectionHeader = ({ title }: { title: string }) => (
		<AppText style={styles.sectionHeader}>{title}</AppText>
	);

	const cyclePreferenceRows = useMemo(
		() => [
			{
				id: 'cycleDefaults',
				icon: <Calendar size={20} color={theme.primary} />,
				label: 'Cycle Length & Period Defaults',
				description: 'Adjust average cycle length and period duration for predictions.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				onPress: () => router.push('/(pages)/settings/cycle-duration'),
			},
			{
				id: 'symptoms',
				icon: <Activity size={20} color={theme.primary} />,
				label: 'Symptoms & Daily Log',
				description: 'Customize symptom tracking prompts and reminders.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
			{
				id: 'phaseRecommendations',
				icon: <Brain size={20} color={theme.primary} />,
				label: 'Phase Recommendations',
				description: 'Select the insights you want to see across phases.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
		],
		[router]
	);

	const accountRows = useMemo(
		() => [
			{
				id: 'profileSecurity',
				icon: <UserCog size={20} color={theme.primary} />,
				label: 'Profile & Security',
				description: 'Update email, password, and secure sign-in.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				onPress: () => router.push('/(pages)/settings/profile'),
			},
			{
				id: 'dataPrivacy',
				icon: <ShieldCheck size={20} color={theme.primary} />,
				label: 'Data Privacy',
				description: 'Manage analytics sharing and data export.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
			{
				id: 'backupRestore',
				icon: <CloudUpload size={20} color={theme.primary} />,
				label: 'Backup & Restore',
				description: 'Sync with cloud or keep data local only.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
		],
		[router]
	);

	const advancedRows = useMemo(
		() => [
			{
				id: 'hormoneEngine',
				icon: <Cpu size={20} color={theme.primary} />,
				label: 'Hormone Engine',
				description: 'View prediction inputs and confidence levels.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
			{
				id: 'aiInsights',
				icon: <Brain size={20} color={theme.primary} />,
				label: 'AI Insights',
				description: 'Configure nutrition AI suggestions and feedback.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
			{
				id: 'diagnostics',
				icon: <Settings size={20} color={theme.primary} />,
				label: 'App Diagnostics',
				description: 'Version, logs, and support tools.',
				action: <ChevronRight size={20} color={theme.textSecondary} />,
				disabled: true,
			},
		],
		[]
	);

	const dataRows = useMemo(
		() => [
			{
				id: 'exportData',
				icon: <Database size={20} color={theme.primary} />,
				label: 'Export Cycle Data',
				description: 'Download your full history securely.',
				action: <Database size={20} color={theme.accent} />,
				disabled: true,
			},
			{
				id: 'clearLocal',
				icon: <Lock size={20} color="#dc2626" />,
				label: 'Clear Local Data',
				description: 'Remove data from this device only.',
				action: <Lock size={20} color="#dc2626" />,
				disabled: true,
			},
		],
		[]
	);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header */}
			<LinearGradient colors={theme.headerGradient} style={styles.header}>
				<View style={styles.headerTopRow}>
					<Text style={styles.headerTitle}>Settings</Text>
					<TouchableOpacity style={styles.helpButton}>
						<Info size={20} color={theme.primary} />
						<AppText style={styles.helpButtonText}>Help</AppText>
					</TouchableOpacity>
				</View>
				<Text style={styles.headerSubtitle}>
					Tune your experience, manage your cycle insights, and stay in control of your data.
				</Text>
			</LinearGradient>

			{/* Cycle Preferences */}
			<SectionHeader title="Cycle Preferences" />
			<View style={styles.section}>
				{cyclePreferenceRows.map(({ id, ...row }) => (
					<SettingsRow key={id} {...row} />
				))}
			</View>
			{/* Account & Privacy */}
			<SectionHeader title="Account & Privacy" />
			<View style={styles.section}>
				{accountRows.map(({ id, ...row }) => (
					<SettingsRow key={id} {...row} />
				))}
			</View>

			{/* Notifications */}
			<SectionHeader title="Notifications & Reminders" />
			<View style={styles.section}>
				<SettingsRow
					icon={<Bell size={20} color={theme.primary} />}
					label="Period Predictions"
					description="Get notified before your next predicted period."
					action={
						<Switch
							value={notificationPrefs.periodPredictions}
							onValueChange={(value) => toggleNotification('periodPredictions', value)}
							trackColor={{ false: '#e5e7eb', true: theme.primary }}
							thumbColor={theme.primary}
						/>
					}
				/>
				<SettingsRow
					icon={<Dumbbell size={20} color={theme.primary} />}
					label="Workout Reminders"
					description="Receive phase-based workout nudges."
					action={
						<Switch
							value={notificationPrefs.workoutReminders}
							onValueChange={(value) => toggleNotification('workoutReminders', value)}
							trackColor={{ false: '#e5e7eb', true: theme.primary }}
							thumbColor={theme.primary}
						/>
					}
				/>
				<SettingsRow
					icon={<Apple size={20} color={theme.primary} />}
					label="Nutrition Tips"
					description="Smart meal suggestions tailored to your cycle phase."
					action={
						<Switch
							value={notificationPrefs.nutritionTips}
							onValueChange={(value) => toggleNotification('nutritionTips', value)}
							trackColor={{ false: '#e5e7eb', true: theme.primary }}
							thumbColor={theme.primary}
						/>
					}
				/>
			</View>

			{/* Appearance */}
			<SectionHeader title="Appearance" />
			<View style={styles.section}>
				<SettingsRow
					icon={<MoonStar size={20} color={theme.primary} />}
					label="Theme"
					description="Switch between light and dark appearance."
					action={
						<View style={styles.themeBadge}>
							<MoonStar size={16} color={theme.primary} />
							<Text style={styles.themeBadgeText}>Light (Auto soon)</Text>
						</View>
					}
				/>
				<SettingsRow
					icon={<Palette size={20} color={theme.primary} />}
					label="Accent Color"
					description="Personalize charts and highlights."
					action={<ChevronRight size={20} color={theme.textSecondary} />}
				/>
			</View>

			

			{/* Advanced */}
			<SectionHeader title="Advanced" />
			<View style={styles.section}>
				{advancedRows.map(({ id, ...row }) => (
					<SettingsRow key={id} {...row} />
				))}
			</View>

			{/* Data & Legal */}
			<SectionHeader title="Data & Legal" />
			<View style={styles.section}>
				{dataRows.map(({ id, ...row }) => (
					<SettingsRow key={id} {...row} />
				))}
			</View>

			<AppText style={styles.footerNote}>
				🔒 Veluna keeps your cycle insights private. Toggle sharing only when you choose to connect with trusted partners.
			</AppText>

			<View style={{ height: 48 }} />
		</ScrollView>
	);
}

export function SettingsRow({
	icon,
	label,
	description,
	action,
	onPress,
	disabled,
  }: {
	icon?: React.ReactNode;
	label: string;
	description: string;
	action: React.ReactNode;
	onPress?: () => void;
	disabled?: boolean;
  }) {
	const [scale] = useState(new Animated.Value(1));
	const isInteractive = Boolean(onPress) && !disabled;
  
	const handlePressIn = () => {
	  if (!isInteractive) return;
	  Animated.spring(scale, {
		toValue: 0.97,
		useNativeDriver: true,
		speed: 40,
	  }).start();
	};
  
	const handlePressOut = () => {
	  if (!isInteractive) return;
	  Animated.spring(scale, {
		toValue: 1,
		useNativeDriver: true,
		speed: 40,
	  }).start();
	};
  
	return (
	  <Pressable
		onPress={onPress}
		onPressIn={handlePressIn}
		onPressOut={handlePressOut}
		android_ripple={
			isInteractive ? { color: theme.primarySoft, borderless: false } : undefined
		}
		style={({ pressed }) => [{ opacity: pressed && isInteractive ? 0.95 : 1 }]}
		disabled={!isInteractive}
	  >
		<Animated.View
			style={[
				styles.settingsRow,
				{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 },
			]}
		>
		  {icon && <View style={styles.settingsIcon}>{icon}</View>}
		  <View style={styles.settingsRowText}>
			<Text style={styles.settingsRowLabel}>{label}</Text>
			<Text style={styles.settingsRowDescription}>{description}</Text>
		  </View>
		  <View style={styles.settingsRowAction}>{action}</View>
		</Animated.View>
	  </Pressable>
	);
  }
/* --- Styles --- */
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.background },

	header: {
		paddingTop: 60,
		paddingHorizontal: 24,
		paddingBottom: 32,
		borderBottomLeftRadius: 32,
		borderBottomRightRadius: 32,
	},
	headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	headerTitle: { fontSize: 32, fontWeight: '700', color: theme.primary, letterSpacing: -0.5 },
	headerSubtitle: { fontSize: 15, color: theme.textSecondary, lineHeight: 22 },
	helpButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 12,
		backgroundColor: theme.primarySoft,
	},
	helpButtonText: { color: theme.primary, fontWeight: '600', fontSize: 13 },

	sectionHeader: {
		fontSize: 14,
		fontWeight: '600',
		color: theme.textSecondary,
		marginBottom: 8,
		marginTop: 28,
		paddingHorizontal: 24,
	},

	section: {
		marginHorizontal: 20,
		backgroundColor: theme.cardBackground,
		borderRadius: 20,
		paddingHorizontal: 20,
		paddingVertical: 16,
		shadowColor: theme.shadow,
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.05,
		shadowRadius: 20,
		elevation: 3,
		borderWidth: 1,
		borderColor: theme.border,
	},

	settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
	settingsIcon: { backgroundColor: theme.primarySoft, padding: 10, borderRadius: 10 },
	settingsRowText: { flex: 1, gap: 4 },
	settingsRowLabel: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
	settingsRowDescription: { fontSize: 12, color: theme.textSecondary, lineHeight: 20 },
	settingsRowAction: { marginLeft: 12, minWidth: 28, alignItems: 'flex-end' },

	themeBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		backgroundColor: theme.primarySoft,
	},
	themeBadgeText: { color: theme.primary, fontWeight: '600', fontSize: 12 },

	footerNote: {
		marginHorizontal: 24,
		marginTop: 24,
		fontSize: 13,
		color: theme.textSecondary,
		lineHeight: 20,
	},
});

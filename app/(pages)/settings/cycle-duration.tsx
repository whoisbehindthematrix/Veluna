import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import AppText from '@/components/core-components/AppText';
import { RootState, AppDispatch } from '@/src/store';
import {
	updateProfile as updateCycleProfile,
	calculatePredictions,
	updateCurrentPhase,
} from '@/src/store/slices/cycleSlice';
import { lightTheme as theme } from '@/styles/theme';
import { ChevronLeft, Calendar, Ruler, Droplet, Clock3, Save } from 'lucide-react-native';

export default function CycleDurationSettingsScreen() {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const cycleState = useSelector((state: RootState) => state.cycle);

	const [isEditing, setIsEditing] = useState(false);
	const [editedProfile, setEditedProfile] = useState({
		dateOfBirth: '',
		averageCycleLength: cycleState.profile.averageCycleLength || 28,
		lastPeriodStart: cycleState.profile.lastPeriodStart || '',
		periodDuration: cycleState.profile.periodDuration || 5,
		lutealPhaseDays: cycleState.profile.lutealPhaseDays || 14,
	});

	useEffect(() => {
		setEditedProfile(prev => ({
			...prev,
			averageCycleLength: cycleState.profile.averageCycleLength || 28,
			lastPeriodStart: cycleState.profile.lastPeriodStart || '',
			periodDuration: cycleState.profile.periodDuration || 5,
			lutealPhaseDays: cycleState.profile.lutealPhaseDays || 14,
		}));
	}, [cycleState.profile]);

	const calculateAge = useCallback((dateOfBirth: string): number => {
		if (!dateOfBirth || dateOfBirth.length !== 10) return 0;
		try {
			const [day, month, year] = dateOfBirth.split('-').map(Number);
			const birthDate = new Date(year, month - 1, day);
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			return age;
		} catch {
			return 0;
		}
	}, []);

	const saveProfile = () => {
		dispatch(updateCycleProfile({
			averageCycleLength: editedProfile.averageCycleLength,
			lastPeriodStart: editedProfile.lastPeriodStart || null,
			periodDuration: editedProfile.periodDuration,
			lutealPhaseDays: editedProfile.lutealPhaseDays,
		}));

		dispatch(calculatePredictions());
		dispatch(updateCurrentPhase());

		setIsEditing(false);
		Alert.alert('Saved', 'Cycle defaults updated successfully.');
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			// behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				<LinearGradient colors={theme.headerGradient} style={styles.header}>
					<View style={styles.headerTopRow}>
						<AppText
							style={styles.backButton}
							onPress={() => router.back()}
						>
							<ChevronLeft size={18} color={theme.primary} />
							
							<AppText style={styles.fieldIcon}>Back</AppText>
						</AppText>
						<View style={{ width: 60 }} />
					</View>
					<AppText style={styles.headerTitle}>Cycle Length & Defaults</AppText>
					<AppText style={styles.headerSubtitle}>
						Keep your predictions precise by keeping these core cycle values up to date.
					</AppText>
				</LinearGradient>

				<View style={styles.card}>
					<AppText style={styles.sectionTitle}>Cycle Timing</AppText>

					<SettingsField
						icon={<Calendar size={18} color={theme.primary} />}
						label="Date of Birth (DD-MM-YYYY)"
						helper={
							editedProfile.dateOfBirth
								? `Age: ${calculateAge(editedProfile.dateOfBirth)} years`
								: 'Used to fine-tune hormonal insights.'
						}
						value={editedProfile.dateOfBirth}
						editable={isEditing}
						onChangeText={dateOfBirth => setEditedProfile(prev => ({ ...prev, dateOfBirth }))}
						placeholder="DD-MM-YYYY"
						keyboardType="numbers-and-punctuation"
					/>

					<SettingsField
						icon={<Ruler size={18} color={theme.primary} />}
						label="Average Cycle Length (days)"
						helper={`Calculated: ${cycleState.predictions.analytics?.averageCycle || cycleState.profile.averageCycleLength} days`}
						value={editedProfile.averageCycleLength.toString()}
						editable={isEditing}
						onChangeText={text =>
							setEditedProfile(prev => ({
								...prev,
								averageCycleLength: parseInt(text, 10) || prev.averageCycleLength,
							}))
						}
						keyboardType="numeric"
					/>

					<SettingsField
						icon={<Droplet size={18} color={theme.primary} />}
						label="Period Duration (days)"
						helper={`Average from logs: ${cycleState.predictions.analytics?.averagePeriod || cycleState.profile.periodDuration} days`}
						value={editedProfile.periodDuration.toString()}
						editable={isEditing}
						onChangeText={text =>
							setEditedProfile(prev => ({
								...prev,
								periodDuration: parseInt(text, 10) || prev.periodDuration,
							}))
						}
						keyboardType="numeric"
					/>

					<SettingsField
						icon={<Clock3 size={18} color={theme.primary} />}
						label="Luteal Phase Length (days)"
						helper="Typical range: 9-16 days (most common: 14)"
						value={editedProfile.lutealPhaseDays.toString()}
						editable={isEditing}
						onChangeText={text =>
							setEditedProfile(prev => ({
								...prev,
								lutealPhaseDays: parseInt(text, 10) || prev.lutealPhaseDays,
							}))
						}
						keyboardType="numeric"
					/>

					<SettingsField
						icon={<Calendar size={18} color={theme.primary} />}
						label="Last Period Start Date"
						helper="Helps us place you in the right phase immediately."
						value={editedProfile.lastPeriodStart || ''}
						editable={isEditing}
						onChangeText={lastPeriodStart =>
							setEditedProfile(prev => ({ ...prev, lastPeriodStart }))
						}
						placeholder="YYYY-MM-DD"
						keyboardType="numbers-and-punctuation"
					/>
				</View>

				<View style={styles.actionsRow}>
					<AppText
						style={[styles.actionButton, styles.outlineButton]}
						onPress={() => setIsEditing(prev => !prev)}
					>
						{isEditing ? 'Cancel' : 'Edit'}
					</AppText>

					<AppText
						style={[styles.actionButton, styles.primaryButton, !isEditing && { opacity: 0.4 }]}
						
						onPress={isEditing ? saveProfile : undefined}
					>
						<Save size={18} color="#fff" /> Save Changes
					</AppText>
				</View>

				<AppText style={styles.footerText}>
					Updating these values recalculates your current phase, predictions, and insights instantly.
				</AppText>

				<View style={{ height: 48 }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
function SettingsField({
	icon,
	label,
	value,
	helper,
	editable,
	onChangeText,
	placeholder,
	keyboardType,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	helper?: string;
	editable: boolean;
	onChangeText: (val: string) => void;
	placeholder?: string;
	keyboardType?: 'default' | 'numeric' | 'numbers-and-punctuation';
}) {
	const [localValue, setLocalValue] = useState(value);

	// When parent (Redux or screen) updates — sync it once.
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	return (
		<View style={styles.field}>
			<View style={styles.fieldLabelRow}>
				<View style={styles.fieldIcon}>{icon}</View>
				<AppText style={styles.fieldLabel}>{label}</AppText>
			</View>

			<TextInput
				style={[styles.input, !editable && styles.inputDisabled]}
				value={localValue}
				onChangeText={setLocalValue}
				onBlur={() => onChangeText(localValue)} // ✅ sync back only when user finishes typing
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
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	backButton: {
		color: theme.primary,
		fontWeight: '600',
		fontSize: 14,
        backgroundColor: theme.primarySoft,
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: theme.border,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: theme.textPrimary,
		letterSpacing: -0.3,
	},
	headerSubtitle: {
		fontSize: 14,
		color: theme.textSecondary,
		lineHeight: 20,
	},
	card: {
		marginTop: 24,
		marginHorizontal: 20,
		backgroundColor: theme.cardBackground,
		borderRadius: 24,
		paddingHorizontal: 20,
		paddingVertical: 24,
		shadowColor: theme.shadow,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.07,
		shadowRadius: 18,
		elevation: 4,
		borderWidth: 1,
		borderColor: theme.border,
		gap: 18,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: theme.textPrimary,
		marginBottom: 6,
	},
	field: {
		gap: 10,
	},
	fieldLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 0,
	},
	fieldIcon: {
		width: 36,
		height: 36,
		borderRadius: 12,
		// backgroundColor: theme.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fieldLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: theme.textPrimary,
	},
	input: {
		backgroundColor: '#ffffff',
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: theme.border,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		fontWeight: '500',
		color: theme.textPrimary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	inputDisabled: {
		backgroundColor: theme.primarySoft,
		color: theme.textSecondary,
	},
	helperText: {
		fontSize: 12,
		color: theme.textSecondary,
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginHorizontal: 20,
		marginTop: 24,
		gap: 12,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 16,
		textAlign: 'center',
		fontWeight: '700',
		fontSize: 15,
	},
	outlineButton: {
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: theme.primary,
		color: theme.primary,
	},
	primaryButton: {
		backgroundColor: theme.primary,
		color: '#ffffff',
		flexDirection: 'row',
		textAlign: 'center',
		overflow: 'hidden',
	},
	footerText: {
		marginHorizontal: 24,
		marginTop: 24,
		color: theme.textSecondary,
		fontSize: 13,
		lineHeight: 20,
		textAlign: 'center',
	},
});
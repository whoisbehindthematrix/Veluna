import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AppButton from '@/components/core-components/Button';

type QuickActionsProps = {
	onLogSymptoms: () => void;
};

export default function QuickActions({ onLogSymptoms }: QuickActionsProps) {
	const router = useRouter();

	return (
		<View style={styles.section}>
			<View style={styles.actionsContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<ChevronRight size={25} strokeWidth={3} color="#61606076" />
				</View>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingTop: 14 }}>
					<TouchableOpacity
						style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#ee4445' }]}
						onPress={() => router.push('/food')}
					>
						<Text style={styles.actionText}>Food</Text>
						<Text style={{ color: '#ffffff9d' }}>Tracking</Text>
						<AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
						<Image source={require('../assets/images/food.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 6, right: -2 }} resizeMode='contain' />
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#8b5cf6' }]}
						onPress={() => router.push('/exercise')}
					>
						<Text style={styles.actionText}>Exercise</Text>
						<Text style={{ color: '#ffffff9d' }}>Tracking</Text>
						<AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
						<Image source={require('../assets/images/dumbbel.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 8, right: -2 }} resizeMode='contain' />
					</TouchableOpacity>
				</View>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingTop: 0 }}>
					<TouchableOpacity
						style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#e42a50' }]}
						onPress={() => router.push('/exercise')} // Note: This was '/exercise' in your original code.
					>
						<Text style={styles.actionText}>Logs</Text>
						<Text style={{ color: '#ffffff9d' }}>Periods</Text>
						<AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
						<Image source={require('../assets/images/menstal.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 6, right: 0 }} resizeMode='contain' />
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.actionButton, styles.actionButton3D, { backgroundColor: '#10b981' }]}
						onPress={onLogSymptoms}
					>
						<Text style={styles.actionText}>Note</Text>
						<Text style={{ color: '#ffffff9d' }}>take note</Text>
						<AppButton title="Go" variant="secondary" size="xs" style={{ marginTop: 8, backgroundColor: '#ffffff33', borderColor: '#ffffff55', alignSelf: 'flex-start' }} iconPosition='right' icon={<ChevronRight size={16} color="#ffffff" strokeWidth={3} />} />
						<Image source={require('../assets/images/notes.png')} style={{ width: 80, height: 100, position: 'absolute', bottom: 8, right: 2 }} resizeMode='contain' />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginHorizontal: 20,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Bold',
		color: '#1f29375b',
		marginBottom: 0,
	},
	actionsContainer: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		backgroundColor: '#f3f4f6',
		padding: 16,
		borderRadius: 16,
		gap: 8,
	},
	actionButton: {
		flex: 2,
		backgroundColor: '#fff',
		padding: 16,
		width: 160,
		borderRadius: 16,
		alignItems: 'flex-start',
	},
	actionButton3D: {
		// elevation: 8,
		// shadowColor: '#000',
		// shadowOffset: { width: 0, height: 4 },
		// shadowOpacity: 0.15,
		// shadowRadius: 8,
		// transform: [{ translateY: -2 }],
	},
	actionText: {
		marginTop: 8,
		fontSize: 20,
		fontFamily: 'Bold',
		color: 'white',
		textAlign: 'left',
	},
});
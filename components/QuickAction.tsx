import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';

type QuickActionsProps = {
    onLogSymptoms?: () => void;
};

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
// Calculate width for 3 cards with padding and gaps
const CARD_WIDTH = (width - 40 - (CARD_GAP * 2)) / 3;

export default function QuickAction({ onLogSymptoms }: QuickActionsProps) {
    const router = useRouter();
    const { theme, accentColor } = useTheme();
    
    const dynamicStyles = useMemo(() => createStyles(theme, accentColor, CARD_WIDTH), [theme, accentColor]);

    const actions = [
        {
            id: 'food',
            title: 'Food',
            subtitle: 'Tracking',
            image: require('../assets/images/food.png'),
            route: '/food',
            color: '#ee4445' // Kept for reference or accent usage
        },
        {
            id: 'exercise',
            title: 'Exercise',
            subtitle: 'Tracking',
            image: require('../assets/images/dumbbel.png'),
            route: '/exercise',
            color: '#E9B63B'
        },
        {
            id: 'logs',
            title: 'Logs',
            subtitle: 'Periods',
            image: require('../assets/images/menstal.png'), // Fixed typo in filename based on context
            route: '/calendar', // Use action for the logic button
            color: '#e42a50'
        },
        // {
        //     id: 'logs',
        //     title: 'Logs',
        //     subtitle: 'Periods',
        //     image: require('../assets/images/menstal.png'), // Fixed typo in filename based on context
        //     action: '/calendar', // Use action for the logic button
        //     color: '#e42a50'
        // },
    ];

    const handlePress = (item: any) => {
        if (item.action) {
            item.action();
        } else if (item.route) {
            router.push(item.route);
        }
    };

    return (
        <View style={dynamicStyles.section}>
            <View style={dynamicStyles.headerRow}>
                <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
                <ChevronRight size={20} color={theme.textSecondary} />
            </View>

            <View style={dynamicStyles.cardsRow}>
                {actions.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[dynamicStyles.card, {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.border,
                            shadowColor: accentColor,
                        }]} 
                        onPress={() => handlePress(item)}
                        activeOpacity={0.8}
                    >
                        {/* Image Container */}
                        <View style={[dynamicStyles.imageContainer, { 
                            backgroundColor: item.color,
                            borderColor: theme.border,
                        }]}>
                            <Image 
                                source={item.image} 
                                style={dynamicStyles.cardImage} 
                                resizeMode="contain" 
                            />
                        </View>

                        {/* Footer Section */}
                        <View style={dynamicStyles.cardFooter}>
                            <View style={dynamicStyles.textContainer}>
                                <Text style={[dynamicStyles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                                <Text style={[dynamicStyles.cardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                            </View>
                            
                            <View style={[dynamicStyles.iconCircle, { 
                                borderColor: `${item.color}20`,
                                backgroundColor: item.color,
                            }]}>
                                <ChevronRight size={14} color={"white"} strokeWidth={3} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string, cardWidth: number) => StyleSheet.create({
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Bold',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: CARD_GAP,
    },
    card: {
        width: cardWidth,
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardImage: {
        width: '85%',
        height: '85%',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontFamily: 'Bold',
        lineHeight: 20,
    },
    cardSubtitle: {
        fontSize: 11,
        fontFamily: 'Regular',
        marginTop: 2,
    },
    iconCircle: {
        position: 'absolute',
        right: 0,
        bottom: 10,
        width: 22,
        height: 22,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
});
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Palette } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { phaseRecommendations } from '@/data/phaseRecommendation';

// Phase colors from phase recommendations
const PHASE_COLORS = [
  {
    color: phaseRecommendations.menstrual.color,
    name: 'Menstrual',
    label: 'Menstrual Phase',
  },
  {
    color: phaseRecommendations.follicular.color,
    name: 'Follicular',
    label: 'Follicular Phase',
  },
  {
    color: phaseRecommendations.ovulatory.color,
    name: 'Ovulatory',
    label: 'Ovulatory Phase',
  },
  {
    color: phaseRecommendations.luteal.color,
    name: 'Luteal',
    label: 'Luteal Phase',
  },
];

// Default color themes/presets
const DEFAULT_COLOR_THEMES = [
  { color: '#f97316', name: 'Orange', label: 'Default' },
  { color: '#ec4899', name: 'Pink', label: 'Pink' },
  { color: '#3b82f6', name: 'Blue', label: 'Blue' },
  { color: '#10b981', name: 'Green', label: 'Green' },
];

// Other accent colors
const OTHER_ACCENT_COLORS = [
  { color: '#f43f5e', name: 'Rose' },
  { color: '#9333ea', name: 'Purple' },
  { color: '#2dd4bf', name: 'Teal' },
  { color: '#ef4444', name: 'Red' },
  { color: '#f59e0b', name: 'Amber' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#8b5cf6', name: 'Violet' },
  { color: '#14b8a6', name: 'Emerald' },
];

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const { accentColor, themeName, setAccentColor, setThemeName, theme } =
    useTheme();

  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  // Helper to determine if a color is dark (for checkmark visibility)
  const isDarkColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={theme.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dynamicStyles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={dynamicStyles.backButton}
        >
          <View style={dynamicStyles.backButtonIcon}>
            <ChevronLeft size={20} color={accentColor} />
          </View>
          <Text style={[dynamicStyles.backButtonText, { color: accentColor }]}>
            Back
          </Text>
        </TouchableOpacity>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.headerIcon}>
            <Palette size={24} color={accentColor} />
          </View>
          <Text style={[dynamicStyles.headerTitle, { color: theme.textPrimary }]}>
            Appearance
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <View style={dynamicStyles.card}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
            Theme
          </Text>
          <Text style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
            Choose between light and dark mode
          </Text>
          <View style={dynamicStyles.themeRow}>
            <TouchableOpacity
              style={[
                dynamicStyles.themeOption,
                themeName === 'light' && dynamicStyles.themeOptionSelected,
                {
                  borderColor: themeName === 'light' ? accentColor : theme.border,
                  backgroundColor: themeName === 'light' ? `${accentColor}20` : theme.cardBackground,
                },
              ]}
              onPress={() => setThemeName('light')}
            >
              <View style={[
                dynamicStyles.themePreview,
                { backgroundColor: '#ffffff', borderColor: theme.border }
              ]}>
                <View style={[dynamicStyles.themePreviewTop, { backgroundColor: '#f3f4f6' }]} />
                <View style={dynamicStyles.themePreviewContent}>
                  <View style={[dynamicStyles.themePreviewBar, { backgroundColor: accentColor, width: '60%' }]} />
                  <View style={[dynamicStyles.themePreviewBar, { backgroundColor: theme.border, width: '80%' }]} />
                </View>
              </View>
              <Text style={[dynamicStyles.themeOptionText, { color: theme.textPrimary }]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dynamicStyles.themeOption,
                themeName === 'dark' && dynamicStyles.themeOptionSelected,
                {
                  borderColor: themeName === 'dark' ? accentColor : theme.border,
                  backgroundColor: themeName === 'dark' ? `${accentColor}20` : theme.cardBackground,
                },
              ]}
              onPress={() => setThemeName('dark')}
            >
              <View style={[
                dynamicStyles.themePreview,
                { backgroundColor: '#161616', borderColor: theme.border }
              ]}>
                <View style={[dynamicStyles.themePreviewTop, { backgroundColor: '#212023' }]} />
                <View style={dynamicStyles.themePreviewContent}>
                  <View style={[dynamicStyles.themePreviewBar, { backgroundColor: accentColor, width: '60%' }]} />
                  <View style={[dynamicStyles.themePreviewBar, { backgroundColor: theme.border, width: '80%' }]} />
                </View>
              </View>
              <Text style={[dynamicStyles.themeOptionText, { color: theme.textPrimary }]}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default Color Themes */}
        <View style={dynamicStyles.card}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
            Default Colors
          </Text>
          <Text style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
            Choose from preset accent colors
          </Text>
          <View style={dynamicStyles.colorGrid}>
            {DEFAULT_COLOR_THEMES.map((item) => {
              const selected = item.color.toLowerCase() === accentColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    dynamicStyles.colorOption,
                    { backgroundColor: item.color },
                    selected && dynamicStyles.selectedColor,
                    {
                      borderColor: selected ? accentColor : 'transparent',
                      borderWidth: selected ? 3 : 2,
                    },
                  ]}
                  onPress={() => setAccentColor(item.color)}
                >
                  {selected && (
                    <Text style={[
                      dynamicStyles.checkmark,
                      { color: isDarkColor(item.color) ? '#fff' : '#000' }
                    ]}>
                      ✓
                    </Text>
                  )}
                  {!selected && (
                    <View style={dynamicStyles.colorLabel}>
                      <Text style={[
                        dynamicStyles.colorLabelText,
                        { color: isDarkColor(item.color) ? '#fff' : '#000' }
                      ]}>
                        {item.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Phase Colors */}
        <View style={dynamicStyles.card}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
            Phase Colors
          </Text>
          <Text style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
            Match your accent color with your cycle phase
          </Text>
          <View style={dynamicStyles.colorGrid}>
            {PHASE_COLORS.map((item) => {
              const selected = item.color.toLowerCase() === accentColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    dynamicStyles.colorOptionWithLabel,
                    { backgroundColor: item.color },
                    selected && dynamicStyles.selectedColor,
                    {
                      borderColor: selected ? accentColor : 'transparent',
                      borderWidth: selected ? 3 : 2,
                    },
                  ]}
                  onPress={() => setAccentColor(item.color)}
                >
                  <View style={dynamicStyles.colorCircle}>
                    {selected && (
                      <Text style={[
                        dynamicStyles.checkmark,
                        { color: isDarkColor(item.color) ? '#fff' : '#000' }
                      ]}>
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      dynamicStyles.phaseLabel,
                      { color: isDarkColor(item.color) ? '#fff' : '#000' }
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Other Accent Colors */}
        <View style={dynamicStyles.card}>
          <Text style={[dynamicStyles.sectionTitle, { color: theme.textPrimary }]}>
            More Colors
          </Text>
          <Text style={[dynamicStyles.sectionDescription, { color: theme.textSecondary }]}>
            Additional accent color options
          </Text>
          <View style={dynamicStyles.colorGrid}>
            {OTHER_ACCENT_COLORS.map((item) => {
              const selected = item.color.toLowerCase() === accentColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    dynamicStyles.colorOption,
                    { backgroundColor: item.color },
                    selected && dynamicStyles.selectedColor,
                    {
                      borderColor: selected ? accentColor : 'transparent',
                      borderWidth: selected ? 3 : 2,
                    },
                  ]}
                  onPress={() => setAccentColor(item.color)}
                >
                  {selected && (
                    <Text style={[
                      dynamicStyles.checkmark,
                      { color: isDarkColor(item.color) ? '#fff' : '#000' }
                    ]}>
                      ✓
                    </Text>
                  )}
                  {!selected && (
                    <View style={dynamicStyles.colorLabel}>
                      <Text style={[
                        dynamicStyles.colorLabelText,
                        { color: isDarkColor(item.color) ? '#fff' : '#000' }
                      ]}>
                        {item.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${accentColor}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${accentColor}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 10,
  },
  themeOptionSelected: {
    borderWidth: 3,
  },
  themePreview: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  themePreviewTop: {
    height: 16,
    width: '100%',
  },
  themePreviewContent: {
    flex: 1,
    padding: 6,
    gap: 4,
  },
  themePreviewBar: {
    height: 4,
    borderRadius: 2,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  colorOptionWithLabel: {
    width: 80,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkmark: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  colorLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorLabelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});

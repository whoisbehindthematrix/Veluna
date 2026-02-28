import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { ChevronDown, Flame, Scale } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import HormoneChart from '../components/HormoneChart';
import { estimateHormonesForCycle } from '../lib/hormoneEngine';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import { darkenColor } from '../utils';

export type RangeKey = '1y' | '6m' | '4m' | '1m' | 'this';

const CONTENT_PADDING = 24;
const CARD_PADDING = 10;
const SECTION_SPACING = 20;
const CHIP_GAP = 10;
const NEU_SHADOW_OFFSET = 5;
const NEU_BORDER_WIDTH = 3;
const CARD_RADIUS = 16;
const CHIP_RADIUS = 12;

// Dummy data for Calories & Weight (replace with real data later)
const DUMMY_CALORIES = { current: 1290, target: 2340, timeframe: '1d', description: 'Calories intake & physical activity today.' };
const DUMMY_WEIGHT = { valueLbs: 198, height: "6'0\"", description: 'Healthy weight is 72-82kg.' };

export default function HormoneChartScreen() {
  const { mock } = useApp();
  const { theme, accentColor } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - CONTENT_PADDING * 2 - CARD_PADDING * 2;

  const [range, setRange] = useState<RangeKey>('1m');
  const [hormone, setHormone] = useState<
    'all' | 'estrogen' | 'progesterone' | 'lh' | 'fsh'
  >('all');
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const rangeTriggerRef = useRef<View>(null);

  const dynamicStyles = useMemo(
    () => createStyles(theme, accentColor),
    [theme, accentColor]
  );

  const data = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    if (range === '1y') from.setMonth(from.getMonth() - 12);
    else if (range === '6m') from.setMonth(from.getMonth() - 6);
    else if (range === '4m') from.setMonth(from.getMonth() - 4);
    else if (range === '1m') from.setMonth(from.getMonth() - 1);
    else from.setDate(1);

    const fromISO = from.toISOString().split('T')[0];
    const series = mock.cycles
      .map((c) =>
        estimateHormonesForCycle(c.startDate, c.length || 28)
      )
      .flat()
      .filter((e) => e.date >= fromISO && e.date <= todayISO)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
    return series.length > 0
      ? series
      : estimateHormonesForCycle(
        mock.cycles[mock.cycles.length - 1].startDate,
        mock.cycles[mock.cycles.length - 1].length || 28
      );
  }, [mock.cycles, range]);

  const todayValues = useMemo(() => {
    const t = data.find((d) => d.date === selectedDate) || data[data.length - 1];
    return t;
  }, [data, selectedDate]);

  const rangeOptions: { k: RangeKey; label: string }[] = [
    { k: '1y', label: '1 Year' },
    { k: '6m', label: '6 Months' },
    { k: '4m', label: '4 Months' },
    { k: '1m', label: '1 Month' },
    { k: 'this', label: 'This month' },
  ];

  const currentRangeLabel = rangeOptions.find((o) => o.k === range)?.label ?? '1M';

  const openRangeDropdown = useCallback(() => {
    rangeTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownAnchor({ x, y, width, height });
      setRangeDropdownOpen(true);
    });
  }, []);

  const closeRangeDropdown = useCallback(() => {
    setRangeDropdownOpen(false);
    setDropdownAnchor(null);
  }, []);

  const selectRange = useCallback(
    (k: RangeKey) => {
      setRange(k);
      closeRangeDropdown();
    },
    [closeRangeDropdown]
  );

  const hormoneOptions: { k: typeof hormone; label: string }[] = [
    { k: 'all', label: 'All' },
    { k: 'estrogen', label: 'Est' },
    { k: 'progesterone', label: 'Prog' },
    { k: 'lh', label: 'LH' },
    { k: 'fsh', label: 'FSH' },
  ];

  const hormoneColors = {
    estrogen: '#ec4899',
    progesterone: '#8b5cf6',
    lh: '#10b981',
    fsh: '#06b6d4',
  } as const;

  return (
    <ScrollView
      style={[dynamicStyles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={dynamicStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <AppText
          variant="bold"
          style={[dynamicStyles.title, { color: theme.textPrimary }]}
        >
          ------  Health Insights  ------
        </AppText>
        <Text
          style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          Track patterns over time
        </Text>
      </View>

      {/* Calories & Weight cards */}
      <View style={dynamicStyles.statsRow}>
        {/* Calories card */}
        <View style={[dynamicStyles.neuCardWrapper, dynamicStyles.statCardWrapper]}>
          <View
            style={[
              dynamicStyles.neuShadow,
              {
                backgroundColor: (theme as { mode?: string }).mode === 'dark' ? '#0a0a0a' : darkenColor(theme.accent, 10),
                borderRadius: CARD_RADIUS + NEU_BORDER_WIDTH,
              },
            ]}
          />
          <View
            style={[
              dynamicStyles.statCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: darkenColor(theme.accent, -30),
                borderRadius: CARD_RADIUS,
                borderWidth: NEU_BORDER_WIDTH,
              },
            ]}
          >
            <View style={dynamicStyles.statCardTop}>
              <View style={[dynamicStyles.statIconCircle, { backgroundColor: '#f97316' }]}>
                <Flame size={20} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={[dynamicStyles.statBadge, { color: theme.textSecondary }]}>
                {DUMMY_CALORIES.timeframe}
              </Text>
            </View>
            <Text style={[dynamicStyles.statCardTitle, { color: theme.textPrimary }]}>
              Calories
            </Text>
            <Text style={[dynamicStyles.statCardDesc, { color: theme.textSecondary }]}>
              {DUMMY_CALORIES.description}
            </Text>
            <Text style={[dynamicStyles.statCardValue, { color: theme.textPrimary }]}>
              <Text style={dynamicStyles.statCardValueMain}>{DUMMY_CALORIES.current}</Text>
              <Text style={dynamicStyles.statCardValueUnit}>/{DUMMY_CALORIES.target}Kcal</Text>
            </Text>
          </View>
        </View>

        {/* Weight card */}
        <View style={[dynamicStyles.neuCardWrapper, dynamicStyles.statCardWrapper]}>
          <View
            style={[
              dynamicStyles.neuShadow,
              {
                backgroundColor: (theme as { mode?: string }).mode === 'dark' ? '#0a0a0a' : darkenColor(theme.accent, 10),
                borderRadius: CARD_RADIUS + NEU_BORDER_WIDTH,
              },
            ]}
          />
          <View
            style={[
              dynamicStyles.statCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: darkenColor(theme.accent, -30),
                borderRadius: CARD_RADIUS,
                borderWidth: NEU_BORDER_WIDTH,
              },
            ]}
          >
            <View style={dynamicStyles.statCardTop}>
              <View style={[dynamicStyles.statIconCircle, { backgroundColor: '#22c55e' }]}>
                <Scale size={20} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={[dynamicStyles.statBadge, { color: theme.textSecondary }]}>
                {DUMMY_WEIGHT.height}
              </Text>
            </View>
            <Text style={[dynamicStyles.statCardTitle, { color: theme.textPrimary }]}>
              Weight
            </Text>
            <Text style={[dynamicStyles.statCardDesc, { color: theme.textSecondary }]}>
              {DUMMY_WEIGHT.description}
            </Text>
            <Text style={[dynamicStyles.statCardValue, { color: theme.textPrimary }]}>
              <Text style={dynamicStyles.statCardValueMain}>{DUMMY_WEIGHT.valueLbs}</Text>
              <Text style={dynamicStyles.statCardValueUnit}>lbs</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Hormone filter chips */}
      <View style={dynamicStyles.section}>
        <Text
          style={[dynamicStyles.sectionLabel, { color: theme.textPrimary }]}
        >
          Hormone
        </Text>
        <View style={dynamicStyles.chipRow}>
          {hormoneOptions.map((opt) => {
            const isActive = hormone === opt.k;
            return (
              <TouchableOpacity
                key={opt.k}
                onPress={() => setHormone(opt.k)}
                activeOpacity={0.85}
                style={dynamicStyles.neuChipWrapper}
              >
                <View
                  style={[
                    dynamicStyles.neuChip,
                    {
                      backgroundColor: isActive
                        ? accentColor
                        : theme.cardBackground,
                      borderWidth: NEU_BORDER_WIDTH,
                      borderColor: isActive ? accentColor : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      dynamicStyles.chipTextSmall,
                      {
                        color: isActive ? '#fff' : theme.textSecondary,
                        fontWeight: isActive ? '800' : '600',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Chart card — 3D neubrutalism */}
      <View style={dynamicStyles.neuCardWrapper}>
        <View
          style={[
            dynamicStyles.neuShadow,
            {
              backgroundColor: (theme as { mode?: string }).mode === 'dark' ? '#0a0a0a' : darkenColor(theme.accent, 10),
              borderRadius: CARD_RADIUS + NEU_BORDER_WIDTH,
            },
          ]}
        />
        <View
          style={[
            dynamicStyles.chartCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              borderRadius: CARD_RADIUS,
              borderWidth: NEU_BORDER_WIDTH,
            },
          ]}
        >
          <View style={dynamicStyles.chartHeader}>
            <View style={dynamicStyles.chartHeaderLeft}>
              <Text
                style={[dynamicStyles.chartTitle, { color: theme.textPrimary }]}
              >
                Hormone Levels
              </Text>
              <Text
                style={[
                  dynamicStyles.chartSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Drag on chart to pick a date
              </Text>
            </View>
            <Pressable
              ref={rangeTriggerRef}
              onPress={openRangeDropdown}
              style={[
                dynamicStyles.dropdownTrigger,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Time range: ${currentRangeLabel}. Tap to change.`}
              accessibilityState={{ expanded: rangeDropdownOpen }}
            >
              <Text
                style={[
                  dynamicStyles.dropdownTriggerText,
                  { color: theme.textPrimary },
                ]}
                numberOfLines={1}
              >
                {currentRangeLabel}
              </Text>
              <ChevronDown
                size={18}
                color={theme.textSecondary}
                style={dynamicStyles.dropdownChevron}
              />
            </Pressable>
          </View>

          {/* Time range dropdown modal */}
          <Modal
            visible={rangeDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={closeRangeDropdown}
            statusBarTranslucent
          >
            <Pressable
              style={dynamicStyles.dropdownBackdrop}
              onPress={closeRangeDropdown}
              accessibilityLabel="Close time range menu"
            >
              {dropdownAnchor !== null && (
                <Pressable
                  style={[
                    dynamicStyles.dropdownMenu,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.border,
                      top: dropdownAnchor.y + dropdownAnchor.height + 6,
                      left: dropdownAnchor.x,
                      minWidth: dropdownAnchor.width,
                    },
                  ]}
                  onPress={() => { }}
                >
                  <ScrollView
                    style={dynamicStyles.dropdownMenuScroll}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    bounces={false}
                    showsVerticalScrollIndicator={true}
                  >
                    {rangeOptions.map((opt) => (
                      <Pressable
                        key={opt.k}
                        onPress={() => selectRange(opt.k)}
                        style={({ pressed }) => [
                          dynamicStyles.dropdownItem,
                          {
                            backgroundColor:
                              range === opt.k
                                ? accentColor
                                : pressed
                                  ? theme.primarySoft
                                  : 'transparent',
                          },
                        ]}
                        accessibilityRole="menuitem"
                        accessibilityLabel={opt.label}
                        accessibilityState={{
                          selected: range === opt.k,
                        }}
                      >
                        <Text
                          style={[
                            dynamicStyles.dropdownItemText,
                            {
                              color: range === opt.k ? '#fff' : theme.textPrimary,
                              fontWeight: range === opt.k ? '700' : '500',
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Pressable>
              )}
            </Pressable>
          </Modal>
          <HormoneChart
            data={data}
            width={chartWidth}
            height={220}
            selectedDate={selectedDate}
            hormone={hormone}
            onDateChange={setSelectedDate}
          />
        </View>
      </View>

      {/* Selected date values card */}
      {todayValues && (
        <View style={dynamicStyles.neuCardWrapper}>
          <View
            style={[
              dynamicStyles.neuShadow,
              {
                backgroundColor: (theme as { mode?: string }).mode === 'dark' ? '#0a0a0a' : darkenColor(theme.accent, 10),
                borderRadius: CARD_RADIUS + NEU_BORDER_WIDTH,
              },
            ]}
          />
          <View
            style={[
              dynamicStyles.valuesCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                borderRadius: CARD_RADIUS,
                borderWidth: NEU_BORDER_WIDTH,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 4 , justifyContent: 'space-between'}}>
              <Text style={[
                dynamicStyles.valuesTitle,
                { color: theme.textPrimary },
              ]} >Current Date Level: </Text>
              <Text
                style={[
                  dynamicStyles.valuesTitle,
                  { color: theme.textPrimary },
                ]}
              >
                {todayValues.date}
              </Text>
            </View>

            <View style={dynamicStyles.valuesList}>
              <View
                style={[
                  dynamicStyles.valueRow,
                  { borderBottomColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    dynamicStyles.valueLabel,
                    { color: hormoneColors.estrogen },
                  ]}
                >
                  Estrogen
                </Text>
                <Text
                  style={[dynamicStyles.valueText, { color: theme.textPrimary }]}
                >
                  {Math.round(todayValues.estrogen)} pg/mL
                </Text>
              </View>
              <View
                style={[
                  dynamicStyles.valueRow,
                  { borderBottomColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    dynamicStyles.valueLabel,
                    { color: hormoneColors.progesterone },
                  ]}
                >
                  Progesterone
                </Text>
                <Text
                  style={[dynamicStyles.valueText, { color: theme.textPrimary }]}
                >
                  {Math.round(todayValues.progesterone)} ng/mL
                </Text>
              </View>
              <View
                style={[
                  dynamicStyles.valueRow,
                  { borderBottomColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    dynamicStyles.valueLabel,
                    { color: hormoneColors.lh },
                  ]}
                >
                  LH
                </Text>
                <Text
                  style={[dynamicStyles.valueText, { color: theme.textPrimary }]}
                >
                  {Math.round(todayValues.lh)} mIU/mL
                </Text>
              </View>
              <View style={[dynamicStyles.valueRow, dynamicStyles.valueRowLast]}>
                <Text
                  style={[
                    dynamicStyles.valueLabel,
                    { color: hormoneColors.fsh },
                  ]}
                >
                  FSH
                </Text>
                <Text
                  style={[dynamicStyles.valueText, { color: theme.textPrimary }]}
                >
                  {Math.round(todayValues.fsh)} mIU/mL
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: any, _accentColor: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: CONTENT_PADDING,
      paddingBottom: CONTENT_PADDING + 16,
    },
    header: {
      marginBottom: SECTION_SPACING + 4,
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
    },
    section: {
      marginBottom: SECTION_SPACING,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CHIP_GAP,
    },
    neuChipWrapper: {
      marginBottom: 0,
    },
    neuChip: {
      paddingVertical: 6,
      paddingHorizontal: 18,
      borderRadius: CHIP_RADIUS,
    },
    chipText: {
      fontSize: 14,
    },
    chipTextSmall: {
      fontSize: 12,
    },
    neuCardWrapper: {
      position: 'relative',
      marginBottom: SECTION_SPACING,
    },
    neuShadow: {
      position: 'absolute',
      left: NEU_SHADOW_OFFSET,
      top: NEU_SHADOW_OFFSET,
      right: -NEU_SHADOW_OFFSET,
      bottom: -NEU_SHADOW_OFFSET,
    },
    chartCard: {
      padding: CARD_PADDING,
      position: 'relative',
    },
    chartHeader: {
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chartHeaderLeft: {
      flex: 1,
      minWidth: 0,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    chartSubtitle: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingLeft: 12,
      paddingRight: 10,
      borderRadius: CHIP_RADIUS,
      borderWidth: NEU_BORDER_WIDTH,
      gap: 6,
      maxWidth: '48%',
    },
    dropdownTriggerText: {
      fontSize: 12,
      fontWeight: '700',
      flexShrink: 1,
    },
    dropdownChevron: {
      flexShrink: 0,
    },
    dropdownBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
    },
    dropdownMenu: {
      position: 'absolute',
      borderRadius: 12,
      borderWidth: NEU_BORDER_WIDTH,
      overflow: 'hidden',
      maxHeight: 280,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    dropdownMenuScroll: {
      maxHeight: 272,
    },
    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 30,
      justifyContent: 'center',
    },
    dropdownItemText: {
      fontSize: 12,
    },
    valuesCard: {
      padding: CARD_PADDING,
      position: 'relative',
    },
    valuesTitle: {
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    valuesList: {
      gap: 0,
    },
    valueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    valueRowLast: {
      borderBottomWidth: 0,
    },
    valueLabel: {
      fontSize: 14,
      fontWeight: '700',
    },
    valueText: {
      fontSize: 14,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: SECTION_SPACING,
    },
    statCardWrapper: {
      flex: 1,
      marginBottom: 0,
    },
    statCard: {
      padding: CARD_PADDING + 4,
      position: 'relative',
      minHeight: 140,
    },
    statCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statBadge: {
      fontSize: 12,
      fontWeight: '600',
    },
    statCardTitle: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: -0.2,
      marginBottom: 4,
    },
    statCardDesc: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
    },
    statCardValue: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    statCardValueMain: {
      fontSize: 20,
    },
    statCardValueUnit: {
      fontSize: 14,
      fontWeight: '700',
      opacity: 0.9,
    },
  });

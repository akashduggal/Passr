import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { useFilters } from '../../../context/FilterContext';

const LIVING_COMMUNITIES = [
  { id: 'hyve', label: 'The Hyve' },
  { id: 'paseo', label: 'Paseo on University' },
  { id: 'skye', label: 'Skye at McClintock' },
  { id: 'tooker', label: 'Tooker' },
  { id: 'villas', label: 'The Villas on Apache' },
  { id: 'union', label: 'Union Tempe' },
  { id: 'district', label: 'The District on Apache' },
];

const CAMPUSES = [
  { id: 'tempe', label: 'Tempe Campus' },
  { id: 'downtown', label: 'Downtown Phoenix' },
  { id: 'west', label: 'West Campus' },
  { id: 'polytechnic', label: 'Polytechnic' },
];

export default function FiltersScreen() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const router = useRouter();
  const {
    selectedLivingCommunities,
    setSelectedLivingCommunities,
    distance,
    setDistance,
    selectedCampuses,
    setSelectedCampuses,
    resetFilters,
  } = useFilters();

  const [livingCommunityDropdownOpen, setLivingCommunityDropdownOpen] = useState(false);

  const toggleLivingCommunity = (id) => {
    setSelectedLivingCommunities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getLivingCommunityLabel = () => {
    if (selectedLivingCommunities.length === 0) return 'Select communities';
    if (selectedLivingCommunities.length === 1) {
      const community = LIVING_COMMUNITIES.find((c) => c.id === selectedLivingCommunities[0]);
      return community?.label || 'Select communities';
    }
    return `${selectedLivingCommunities.length} selected`;
  };

  const toggleCampus = (id) => {
    setSelectedCampuses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    resetFilters();
    setLivingCommunityDropdownOpen(false);
  };

  const handleApply = () => {
    router.back();
  };
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Living Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Living Community</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setLivingCommunityDropdownOpen(!livingCommunityDropdownOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{getLivingCommunityLabel()}</Text>
            <Ionicons
              name={livingCommunityDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          {livingCommunityDropdownOpen && (
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {LIVING_COMMUNITIES.map((community) => {
                const isSelected = selectedLivingCommunities.includes(community.id);
                return (
                  <TouchableOpacity
                    key={community.id}
                    style={styles.dropdownOption}
                    onPress={() => toggleLivingCommunity(community.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color={ASU.white} />}
                    </View>
                    <Text style={styles.optionText}>{community.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={distance}
              onValueChange={(v) => setDistance(Math.round(v))}
              minimumTrackTintColor={ASU.maroon}
              maximumTrackTintColor={ASU.gray6}
              thumbTintColor={ASU.maroon}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 mi</Text>
              <Text style={styles.sliderValue}>{distance} miles</Text>
              <Text style={styles.sliderLabel}>10 mi</Text>
            </View>
          </View>
        </View>

        {/* Campus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus</Text>
          {CAMPUSES.map((campus) => {
            const isSelected = selectedCampuses.includes(campus.id);
            return (
              <TouchableOpacity
                key={campus.id}
                style={styles.option}
                onPress={() => toggleCampus(campus.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={ASU.white} />}
                </View>
                <Text style={styles.optionText}>{campus.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.7}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: ASU.gray7,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  checkboxSelected: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  optionText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ASU.maroon,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: ASU.maroon,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: ASU.white,
  },
});

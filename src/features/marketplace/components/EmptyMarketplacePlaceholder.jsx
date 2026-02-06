import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

export default function EmptyMarketplacePlaceholder({ category }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {/* Background Circle */}
        <View style={styles.circle}>
          <Ionicons name="planet-outline" size={80} color={ASU.maroon} style={styles.mainIcon} />
        </View>
        
        {/* Floating Elements for "Creative" look */}
        <Ionicons name="leaf" size={30} color={ASU.green} style={[styles.floatingIcon, styles.iconTopRight]} />
        <Ionicons name="pricetag" size={24} color={ASU.gold} style={[styles.floatingIcon, styles.iconBottomLeft]} />
        <Ionicons name="search" size={20} color={theme.textSecondary} style={[styles.floatingIcon, styles.iconTopLeft]} />
      </View>

      <Text style={styles.title}>No listings found</Text>
      <Text style={styles.subtitle}>
        {category 
          ? `There are no active listings in ${category} yet.`
          : "It looks a bit empty here."}
      </Text>
      <Text style={styles.description}>
        Be the first to pass it on! List an item to give it a second life and earn some cash.
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push({ pathname: '/dashboard/add-listing', params: { initialCategory: category } })}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color={ASU.white} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>List an Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 400,
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ASU.maroon + '15', // 15% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIcon: {
    opacity: 0.9,
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.8,
  },
  iconTopRight: {
    top: 10,
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  iconBottomLeft: {
    bottom: 10,
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  iconTopLeft: {
    top: 20,
    left: 10,
    opacity: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ASU.maroon,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: ASU.maroon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: ASU.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

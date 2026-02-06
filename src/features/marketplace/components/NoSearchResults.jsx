import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

export default function NoSearchResults({ query, onClear }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.circle}>
          <Ionicons name="search" size={64} color={theme.textSecondary} style={styles.searchIcon} />
          <View style={styles.questionMarkContainer}>
            <Ionicons name="help" size={24} color={ASU.white} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>No matches found</Text>
      <Text style={styles.subtitle}>
        We couldn't find any listings matching "{query}"
      </Text>
      <Text style={styles.suggestion}>
        Double check your spelling or try different keywords.
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={onClear}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Clear Search</Text>
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
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    opacity: 0.5,
  },
  questionMarkContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: ASU.maroon,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestion: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  buttonText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 15,
  },
});

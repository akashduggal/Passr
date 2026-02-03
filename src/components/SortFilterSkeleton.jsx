import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

export default function SortFilterSkeleton({ style }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = getStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Sort Dropdown Skeleton */}
      <View style={styles.dropdownSkeleton}>
         <Animated.View
          style={[
            styles.shimmer,
            { opacity: shimmerOpacity, backgroundColor: theme.border },
          ]}
        />
      </View>
      
      {/* Filter Button Skeleton */}
      <View style={styles.filterSkeleton}>
         <Animated.View
          style={[
            styles.shimmer,
            { opacity: shimmerOpacity, backgroundColor: theme.border },
          ]}
        />
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  dropdownSkeleton: {
    flex: 1,
    height: 44,
    backgroundColor: theme.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterSkeleton: {
    width: 100,
    height: 44,
    backgroundColor: theme.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  shimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

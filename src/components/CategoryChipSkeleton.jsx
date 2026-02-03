import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

export default function CategoryChipSkeleton({ style }) {
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
    <View style={[styles.chipSkeleton, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          { opacity: shimmerOpacity, backgroundColor: theme.border },
        ]}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  chipSkeleton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
    height: 36,
    width: 100,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});

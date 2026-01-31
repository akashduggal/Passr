import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme, ASU } from '../theme';

export default function ProductTileSkeleton({ style }) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
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

  return (
    <View style={[styles.productTile, style]}>
      {/* Image Skeleton */}
      <View style={styles.productImageContainer}>
        <Animated.View
          style={[
            styles.shimmer,
            styles.imageShimmer,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>

      {/* Info Skeleton */}
      <View style={styles.productInfo}>
        {/* Title Skeleton - 2 lines */}
        <View style={styles.titleContainer}>
          <Animated.View
            style={[
              styles.shimmer,
              styles.titleLine1,
              { opacity: shimmerOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmer,
              styles.titleLine2,
              { opacity: shimmerOpacity },
            ]}
          />
        </View>

        {/* Meta Skeleton */}
        <View style={styles.metaContainer}>
          <Animated.View
            style={[
              styles.shimmer,
              styles.metaChip,
              { opacity: shimmerOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmer,
              styles.metaChip2,
              { opacity: shimmerOpacity },
            ]}
          />
        </View>

        {/* Footer Skeleton */}
        <View style={styles.footerContainer}>
          <Animated.View
            style={[
              styles.shimmer,
              styles.priceSkeleton,
              { opacity: shimmerOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.shimmer,
              styles.dateSkeleton,
              { opacity: shimmerOpacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  productTile: {
    width: '48%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ASU.gray6,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    backgroundColor: ASU.gray5,
    borderRadius: 4,
  },
  imageShimmer: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 12,
  },
  titleContainer: {
    marginBottom: 6,
    gap: 6,
  },
  titleLine1: {
    height: 16,
    width: '90%',
  },
  titleLine2: {
    height: 16,
    width: '60%',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metaChip: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
  metaChip2: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceSkeleton: {
    height: 20,
    width: 50,
    borderRadius: 4,
  },
  dateSkeleton: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
});

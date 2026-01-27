import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, ASU, getTheme } from '../theme';
import { useTheme } from '../ThemeContext';

export default function SellerInfoCard({ 
  sellerName, 
  location, 
  isVerified = false,
  showSectionTitle = false,
  onPress,
  noCard = false,
  lightText = false,
}) {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { activeOpacity: 0.7, onPress } : {};
  const styles = getStyles(theme, lightText);

  return (
    <View style={styles.container}>
      {showSectionTitle && (
        <Text style={styles.sectionTitle}>Seller</Text>
      )}
      <CardWrapper style={[styles.sellerCard, noCard && styles.sellerCardNoCard]} {...cardProps}>
        <View style={styles.sellerAvatar}>
          <Ionicons name="person" size={24} color={ASU.white} />
        </View>
        <View style={styles.sellerMeta}>
          <View style={styles.sellerNameRow}>
            <Text style={[styles.sellerName, lightText && styles.sellerNameLight]}>{sellerName}</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={ASU.gold} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.sellerLocationRow}>
            <Ionicons name="location-outline" size={16} color={lightText ? ASU.white : theme.textSecondary} />
            <Text style={[styles.sellerLocation, lightText && styles.sellerLocationLight]}>{location || 'ASU'}</Text>
          </View>
          <View style={[styles.campusChip, lightText && styles.campusChipLight]}>
            <Text style={[styles.campusChipText, lightText && styles.campusChipTextLight]}>Arizona State University</Text>
          </View>
        </View>
      </CardWrapper>
    </View>
  );
}

const getStyles = (theme, lightText) => StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  sellerCardNoCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    borderRadius: 0,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ASU.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerMeta: {
    marginLeft: 14,
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
    backgroundColor: ASU.gold + '15', // 15 hex = ~8% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: ASU.gold,
  },
  sellerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sellerLocation: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  campusChip: {
    alignSelf: 'flex-start',
    backgroundColor: ASU.gray6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  campusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text,
  },
  sellerNameLight: {
    color: ASU.white,
    fontSize: 22,
    fontWeight: '700',
  },
  sellerLocationLight: {
    color: ASU.white,
    opacity: 0.9,
  },
  campusChipLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  campusChipTextLight: {
    color: ASU.white,
  },
});

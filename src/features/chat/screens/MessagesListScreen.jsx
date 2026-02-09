import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { useChats } from '../../../hooks/queries/useChatQueries';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesListScreen() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  const router = useRouter();

  const { data: chats, isLoading, refetch, isRefetching } = useChats();

  const renderItem = ({ item }) => {
    // Determine the other participant and listing details
    // Adjust this based on actual API response structure
    const otherUser = item.other_user || item.participants?.[0] || { name: 'User' };
    const listing = item.listing || {};
    const lastMessage = item.last_message || {};

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => router.push({
          pathname: '/chat/[id]',
          params: { id: item.id }
        })}
      >
        <View style={styles.avatarContainer}>
          {otherUser.avatar_url ? (
            <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.avatarText}>
                {otherUser.name ? otherUser.name[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser.name || 'Unknown User'}
            </Text>
            {lastMessage.created_at && (
              <Text style={styles.time}>
                {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
              </Text>
            )}
          </View>
          
          <Text style={styles.listingTitle} numberOfLines={1}>
            {listing.title || 'Item Inquiry'}
          </Text>
          
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage.content || 'No messages yet'}
          </Text>
        </View>

        {listing.images && listing.images.length > 0 && (
          <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={ASU.maroon} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={ASU.maroon} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation from a listing!</Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderAvatar: {
    backgroundColor: ASU.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    marginRight: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 8,
  },
  listingTitle: {
    fontSize: 12,
    color: theme.primary,
    marginBottom: 2,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  listingImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
});

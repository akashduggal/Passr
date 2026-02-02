import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

const ISSUE_TYPES = ['Listing issue', 'Offers / payments', 'Account & profile', 'Other'];

const MOCK_RAISED_ISSUES = [
  {
    id: '1',
    subject: 'Offer not updating after acceptance',
    topic: 'Offers / payments',
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'I accepted an offer on my desk but the chat still says offer pending.',
  },
  {
    id: '2',
    subject: 'Can\'t upload more than 4 photos',
    topic: 'Listing issue',
    status: 'In progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: 'Add listing form only allows 4 images. FAQ says 6.',
  },
  {
    id: '3',
    subject: 'Password reset email not received',
    topic: 'Account & profile',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    description: 'Requested password reset twice. No email in inbox or spam.',
  },
  {
    id: '4',
    subject: 'Filter by campus not saving selection',
    topic: 'Listing issue',
    status: 'Open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'When I apply filters and select a campus, the selection resets after closing the filters screen. Happens every time.',
  },
  {
    id: '5',
    subject: 'Seller not receiving push when buyer sends offer',
    topic: 'Offers / payments',
    status: 'In progress',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    description: 'I sent an offer on a dresser. Seller says they never got a notification. Notification settings are enabled.',
  },
  {
    id: '6',
    subject: 'Profile photo not updating',
    topic: 'Account & profile',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    description: 'Changed my profile picture but it still shows the old one on product detail and in chat. Restarted app, no change.',
  },
  {
    id: '7',
    subject: 'Schedule pickup date picker shows past dates',
    topic: 'Other',
    status: 'Open',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    description: 'In chat, when scheduling pickup, I can still scroll to past dates in the date selector. Expected them to be hidden.',
  },
  {
    id: '8',
    subject: 'Wishlist count wrong on profile',
    topic: 'Account & profile',
    status: 'In progress',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    description: 'My wishlist shows 12 items but I only added 5. After removing one, count went to 15. Seems to increment incorrectly.',
  },
  {
    id: '9',
    subject: 'Images in listing appear cropped',
    topic: 'Listing issue',
    status: 'Open',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    description: 'Uploaded 6 photos for a couch. On the listing detail page, edges are cropped. Same images look fine in my gallery.',
  },
  {
    id: '10',
    subject: 'Refund request for duplicate charge',
    topic: 'Offers / payments',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    description: 'I was charged twice for the same offer. Transaction IDs: #8821 and #8822. Please refund the duplicate.',
  },
];

function formatIssueDate(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  // const topPadding = insets.top + headerHeight + 8;
  const topPadding = insets.top + 8;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  // Filter issues based on active tab
  const filteredIssues = raisedIssues.filter((issue) => {
    if (activeTab === 'open') {
      return issue.status === 'Open' || issue.status === 'In progress';
    } else {
      return issue.status === 'Resolved';
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.subtitle}>
              Have an issue? Create a ticket and we will help you resolve it.
            </Text>
          </View>
        <View style={styles.section}>
          {MOCK_RAISED_ISSUES.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No raised issues</Text>
              <Text style={[styles.emptyStateBody, { color: theme.textSecondary }]}>
                When you report a problem, it will appear here. Tap the + button below to submit a new issue.
              </Text>
            </View>
          ) : (
            MOCK_RAISED_ISSUES.map((issue) => (
              <View
                key={issue.id}
                style={[styles.issueCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.issueCardHeader}>
                  <Text style={[styles.issueSubject, { color: theme.text }]} numberOfLines={2}>
                    {issue.subject}
                  </Text>
                  <View style={[styles.issueStatusBadge, issue.status === 'Resolved' && { backgroundColor: ASU.green + '20' }, issue.status === 'In progress' && { backgroundColor: ASU.gold + '20' }, issue.status === 'Open' && { backgroundColor: ASU.maroon + '20' }]}>
                    <Text style={[styles.issueStatusText, issue.status === 'Resolved' && { color: ASU.green }, issue.status === 'In progress' && { color: ASU.gold }, issue.status === 'Open' && { color: ASU.maroon }]}>
                      {issue.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.issueTopic, { color: theme.textSecondary }]}>{issue.topic}</Text>
                <Text style={[styles.issueDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                  {issue.description}
                </Text>
                <Text style={[styles.issueDate, { color: theme.textSecondary }]}>{formatIssueDate(issue.createdAt)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: ASU.maroon }]}
          onPress={openNewIssueModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={ASU.white} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={newIssueModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeNewIssueModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeNewIssueModal}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable style={[styles.newIssueSheet, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.newIssueModalHeader}>
                <Text style={[styles.newIssueModalTitle, { color: theme.text }]}>New issue</Text>
                <TouchableOpacity onPress={closeNewIssueModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.newIssueModalScroll}
                contentContainerStyle={styles.newIssueModalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.fieldLabel}>Topic</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.issueChipsContainer}
                >
                  {ISSUE_TYPES.map((type) => {
                    const isSelected = selectedIssueType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[styles.issueChip, isSelected && styles.issueChipSelected]}
                        onPress={() => setSelectedIssueType(type)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.issueChipText,
                            isSelected && styles.issueChipTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.fieldLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Short summary (e.g. Offer not updating)"
                  placeholderTextColor={theme.placeholder}
                  value={subject}
                  onChangeText={setSubject}
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Describe what happened, which listing or offer this is about, and any details that can help."
                  placeholderTextColor={theme.placeholder}
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane-outline" size={18} color={ASU.white} />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    stickyHeader: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: theme.background,
    },
    listScroll: {
      flex: 1,
    },
    listScrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    headerCard: {
      alignItems: 'flex-start',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyStateIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: 20,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateBody: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      maxWidth: 280,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalKeyboardView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    newIssueSheet: {
      maxHeight: '90%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    newIssueModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    newIssueModalTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    newIssueModalScroll: {
      maxHeight: 400,
    },
    newIssueModalScrollContent: {
      padding: 20,
      paddingBottom: 32,
    },
    section: {
      marginBottom: 28,
    },
    raisedTicketsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 32,
    },
    raisedTicketsTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
    },
    textarea: {
      minHeight: 120,
      marginTop: 4,
    },
    issueChipsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
      paddingRight: 8,
    },
    issueChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    issueChipSelected: {
      backgroundColor: ASU.maroon,
      borderColor: ASU.maroon,
    },
    issueChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    issueChipTextSelected: {
      color: ASU.white,
    },
    submitButton: {
      marginTop: 20,
      backgroundColor: ASU.maroon,
      borderRadius: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: ASU.white,
    },
    issueCard: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
    },
    issueCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 6,
    },
    issueSubject: {
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    issueStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    issueStatusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    issueTopic: {
      fontSize: 13,
      marginBottom: 6,
    },
    issueDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    issueDate: {
      fontSize: 12,
    },
  });

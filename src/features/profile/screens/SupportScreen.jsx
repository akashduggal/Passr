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
  const [selectedIssueType, setSelectedIssueType] = useState('Listing issue');
  const [newIssueModalVisible, setNewIssueModalVisible] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  
  // Use MOCK_RAISED_ISSUES as initial state for issues to render
  const [filteredIssues, setFilteredIssues] = useState(MOCK_RAISED_ISSUES);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Open, Resolved

  // Filter issues based on search and tab
  const getVisibleIssues = () => {
    return filteredIssues.filter(issue => {
      const matchesSearch = 
        issue.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'All' ? true : 
        activeTab === 'Open' ? (issue.status === 'Open' || issue.status === 'In progress') :
        (issue.status === 'Resolved');

      return matchesSearch && matchesTab;
    });
  };

  const visibleIssues = getVisibleIssues();
  
  const styles = getStyles(theme, insets);

  const openNewIssueModal = () => setNewIssueModalVisible(true);
  const closeNewIssueModal = () => {
    setNewIssueModalVisible(false);
    // Reset form
    setSubject('');
    setDetails('');
    setSelectedIssueType('Listing issue');
  };

  const handleSubmit = () => {
    if (!subject.trim() || !details.trim()) {
      Alert.alert('Missing fields', 'Please fill in both subject and description.');
      return;
    }

    const newIssue = {
      id: Date.now().toString(),
      subject: subject.trim(),
      topic: selectedIssueType,
      status: 'Open',
      createdAt: new Date(),
      description: details.trim(),
    };

    setFilteredIssues([newIssue, ...filteredIssues]);
    closeNewIssueModal();
    Alert.alert('Ticket Created', 'We have received your issue and will look into it shortly.');
  };

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
              Track your tickets and get help.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search issues..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabsContainer}>
            {['All', 'Open', 'Resolved'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab, 
                  activeTab === tab && styles.activeTab,
                  { borderColor: activeTab === tab ? ASU.maroon : theme.border }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText, 
                  activeTab === tab && styles.activeTabText,
                  { color: activeTab === tab ? ASU.maroon : theme.textSecondary }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        <View style={styles.section}>
          {visibleIssues.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconWrap, { backgroundColor: theme.surface }]}>
                <Ionicons name="search" size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No tickets found</Text>
              <Text style={[styles.emptyStateBody, { color: theme.textSecondary }]}>
                Try adjusting your search or create a new ticket.
              </Text>
            </View>
          ) : (
            visibleIssues.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                activeOpacity={0.9}
                style={[styles.issueCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTopicBadge}>
                    <Text style={styles.cardTopicText}>{issue.topic}</Text>
                  </View>
                  <View style={[
                    styles.statusPill, 
                    issue.status === 'Resolved' && { backgroundColor: '#E8F5E9' },
                    issue.status === 'In progress' && { backgroundColor: '#FFF8E1' },
                    issue.status === 'Open' && { backgroundColor: '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      issue.status === 'Resolved' && { color: '#2E7D32' },
                      issue.status === 'In progress' && { color: '#F57F17' },
                      issue.status === 'Open' && { color: '#C62828' }
                    ]}>
                      {issue.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.issueSubject, { color: theme.text }]} numberOfLines={1}>
                  {issue.subject}
                </Text>
                
                <Text style={[styles.issueDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                  {issue.description}
                </Text>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.issueDate, { color: theme.textSecondary }]}>
                    {formatIssueDate(issue.createdAt)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>
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
        statusBarTranslucent={true}
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

const getStyles = (theme, insets) =>
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
      backgroundColor: ASU.maroon,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      marginHorizontal: 20,
      marginBottom: 20,
      paddingHorizontal: 16,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      height: '100%',
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 10,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: theme.surface,
    },
    activeTab: {
      backgroundColor: theme.surface, // Or maybe fill it? Let's keep it outline but colored border
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeTabText: {
      fontWeight: '700',
    },
    section: {
      paddingBottom: 100, // Space for FAB
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 40,
    },
    emptyStateIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateBody: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    issueCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 0, // Clean look
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    cardTopicBadge: {
      backgroundColor: theme.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    cardTopicText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    issueSubject: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },
    issueDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    issueDate: {
      fontSize: 12,
      fontWeight: '500',
    },
    
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalKeyboardView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    newIssueSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '85%',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    newIssueModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    newIssueModalTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    newIssueModalScroll: {
      flex: 1,
    },
    newIssueModalScrollContent: {
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : Math.max(24, insets.bottom + 24),
    },
    fieldLabel: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.text,
    },
    textarea: {
      minHeight: 120,
      paddingTop: 14,
    },
    issueChipsContainer: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 4,
      marginBottom: 8,
    },
    issueChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    issueChipSelected: {
      backgroundColor: ASU.maroon,
      borderColor: ASU.maroon,
    },
    issueChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    issueChipTextSelected: {
      color: ASU.white,
    },
    submitButton: {
      marginTop: 32,
      backgroundColor: ASU.maroon,
      borderRadius: 14,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      shadowColor: ASU.maroon,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: ASU.white,
    },
  });

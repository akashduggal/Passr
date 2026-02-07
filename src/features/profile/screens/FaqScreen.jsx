import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { faqService } from '../../../services/FaqService';

export default function FaqScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  // FAQ State
  const [faqs, setFaqs] = useState([]);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const data = await faqService.getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs', error);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaqId(prev => prev === id ? null : id);
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions about Passr.
          </Text>
        </View>


        <View style={styles.section}>
          {loadingFaqs ? (
            <ActivityIndicator size="large" color={ASU.maroon} style={{ marginTop: 40 }} />
          ) : faqs.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconWrap, { backgroundColor: theme.surface }]}>
                <Ionicons name="help-circle-outline" size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No FAQs available</Text>
              <Text style={[styles.emptyStateBody, { color: theme.textSecondary }]}>
                Please check back later.
              </Text>
            </View>
          ) : (
            faqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <TouchableOpacity
                  key={faq.id}
                  activeOpacity={0.8}
                  style={[styles.faqCard, { backgroundColor: theme.surface }]}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <View style={styles.faqHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.faqCategory, { color: ASU.maroon }]}>{faq.category}</Text>
                      <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </View>
                  {isExpanded && (
                    <View style={styles.faqBody}>
                      <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
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
    section: {
      paddingBottom: 20,
    },
    faqCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    faqCategory: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      marginRight: 8,
    },
    faqBody: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    faqAnswer: {
      fontSize: 15,
      lineHeight: 24,
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
  });

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'List in Seconds',
    description: 'Sellers: Snap a photo, set a price, and post your listing. It’s the easiest way to reach students.',
    icon: 'camera-plus',
  },
  {
    id: '2',
    title: 'Make Your Offer',
    description: 'Buyers: Found something? Make a single offer or bundle multiple items from a seller to get a better deal.',
    icon: 'basket-plus',
  },
  {
    id: '3',
    title: 'Chat & Negotiate',
    description: 'Chat securely to discuss details. Sellers can Accept or Reject offers directly within the conversation.',
    icon: 'chat-processing',
  },
  {
    id: '4',
    title: 'Schedule Pickup',
    description: 'Once a deal is struck, use the chat to agree on a safe pickup time and location on campus.',
    icon: 'map-marker-check',
  },
  {
    id: '5',
    title: 'Mark as Sold',
    description: 'Transaction complete? Sellers simply mark the item as "Sold" to close the listing.',
    icon: 'check-decagram',
  },
];

export default function OnboardingScreen() {
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const handlePageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <PagerView
          style={styles.pagerView}
          initialPage={0}
          ref={pagerRef}
          onPageSelected={handlePageSelected}
        >
          {slides.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={slide.icon}
                  size={120}
                  color={theme.primary}
                />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          ))}
        </PagerView>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPage === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    alignItems: 'flex-end',
    zIndex: 10,
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    right: 0,
    left: 0,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.surface,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: theme.gray5,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: theme.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

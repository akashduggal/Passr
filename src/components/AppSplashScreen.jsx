import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { ASU } from '../theme';

export default function AppSplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <Image 
            source={require('../../assets/Passr_logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.appName}>Passr</Text>
          <Text style={styles.tagline}>The Marketplace for{'\n'}ASU Students</Text>
        </Animated.View>
      </View>
      
      {/* Decorative Circles */}
      <View style={styles.circleDecoration1} />
      <View style={styles.circleDecoration2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASU.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  appName: {
    fontSize: 56,
    fontWeight: '800',
    color: ASU.white,
    marginBottom: 16,
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
    color: ASU.white,
    lineHeight: 28,
    opacity: 0.9,
    textAlign: 'center',
  },
  circleDecoration1: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circleDecoration2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const product = params.product ? JSON.parse(params.product) : null;
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to home and reset stack
              router.dismissAll();
              router.replace('/(tabs)/dashboard'); 
            },
          },
        ]
      );
    }, 1500);
  };

  const imageUri = product.images?.[0]?.detail?.uri || product.images?.[0] || null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.productCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.productImage} />
            ) : (
               <View style={styles.placeholderImage}>
                 <Ionicons name="image-outline" size={32} color={theme.textSecondary} />
               </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
                <Ionicons name="card-outline" size={24} color={theme.text} />
                <Text style={styles.paymentText}>Visa ending in 4242</Text>
                <TouchableOpacity>
                    <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.section}>
             <View style={styles.row}>
                 <Text style={styles.rowLabel}>Subtotal</Text>
                 <Text style={styles.rowValue}>${product.price}</Text>
             </View>
             <View style={styles.row}>
                 <Text style={styles.rowLabel}>Tax (Estimated)</Text>
                 <Text style={styles.rowValue}>${(product.price * 0.08).toFixed(2)}</Text>
             </View>
             <View style={[styles.row, styles.totalRow]}>
                 <Text style={styles.totalLabel}>Total</Text>
                 <Text style={styles.totalValue}>${(product.price * 1.08).toFixed(2)}</Text>
             </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  content: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginTop: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: ASU.maroon,
  },
  paymentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
  },
  paymentText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
  },
  changeText: {
      color: ASU.maroon,
      fontWeight: '600',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  rowLabel: {
      fontSize: 16,
      color: theme.textSecondary,
  },
  rowValue: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '600',
  },
  totalRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
  },
  totalLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
  },
  totalValue: {
      fontSize: 20,
      fontWeight: '700',
      color: ASU.maroon,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  placeOrderButton: {
    backgroundColor: ASU.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: ASU.black,
  },
  backButton: {
      marginTop: 20,
      padding: 12,
      backgroundColor: ASU.maroon,
      borderRadius: 8,
      alignSelf: 'center',
  },
  backButtonText: {
      color: 'white',
      fontWeight: '600',
  }
});

import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';
import { ENABLE_TICKETS } from '../../../constants/featureFlags';
import { compressListingImage } from '../../../utils/imageCompression';
import { listingService } from '../../../services/ListingService';

const BASE_CATEGORIES = ['Furniture', 'Electronics', 'Escooters', 'Kitchen'];
const CATEGORIES = ENABLE_TICKETS ? [...BASE_CATEGORIES, 'Tickets'] : BASE_CATEGORIES;
const CONDITIONS = ['New', 'Like New', 'Fair', 'Good'];
const CONDITION_ICONS = {
  'New': 'sparkles-outline',
  'Like New': 'star-outline',
  'Fair': 'build-outline',
  'Good': 'checkmark-done-outline',
};
const MAX_IMAGES = 6;
const MAX_DESCRIPTION_LENGTH = 200;
const headerHeight = Platform.OS === 'ios' ? 44 : 56;
const BRANDS_BY_CATEGORY = {
  Furniture: ['IKEA', 'Wayfair', 'Ashley', 'West Elm', 'Target', 'Other'],
  Electronics: ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Other'],
  Escooters: ['Xiaomi', 'Segway', 'Razor', 'Gotrax', 'Hiboy', 'Other'],
  Kitchen: ['KitchenAid', 'Cuisinart', 'Instant Pot', 'Ninja', 'Hamilton Beach', 'Other'],
  Tickets: ['Concert', 'Music Festival', 'Stand-up Comedy', 'Sports', 'Theater', 'Other'],
};

const LIVING_COMMUNITIES = [
  { id: 'hyve', label: 'The Hyve' },
  { id: 'paseo', label: 'Paseo on University' },
  { id: 'skye', label: 'Skye at McClintock' },
  { id: 'tooker', label: 'Tooker' },
  { id: 'villas', label: 'The Villas on Apache' },
  { id: 'union', label: 'Union Tempe' },
  { id: 'district', label: 'The District on Apache' },
].sort((a, b) => a.label.localeCompare(b.label));

export default function AddListingScreen({ isTab = false }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingListing = params.listingData ? JSON.parse(params.listingData) : null;
  const isEditing = !!editingListing;

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  
  const initialCommunityId = editingListing?.livingCommunity 
    ? LIVING_COMMUNITIES.find(c => c.label === editingListing.livingCommunity)?.id || editingListing.livingCommunity
    : null;

  const [images, setImages] = useState(editingListing?.images || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(editingListing?.title || '');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [price, setPrice] = useState(editingListing?.price ? editingListing.price.toString() : '');
  const [selectedCategory, setSelectedCategory] = useState(editingListing?.category || params.initialCategory || null);
  const [selectedBrand, setSelectedBrand] = useState(editingListing?.brand || null);
  const [selectedCondition, setSelectedCondition] = useState(editingListing?.condition || null);
  const [selectedCommunity, setSelectedCommunity] = useState(initialCommunityId);
  const [isUrgent, setIsUrgent] = useState(editingListing?.urgent || false);
  const [eventDate, setEventDate] = useState(editingListing?.eventDate || '');
  const [venue, setVenue] = useState(editingListing?.venue || '');
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [brandPickerVisible, setBrandPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const selectedCategoryLabel = selectedCategory ?? 'e.g. Furniture';
  const selectedLabel = selectedCommunity
    ? LIVING_COMMUNITIES.find((c) => c.id === selectedCommunity)?.label ?? 'Select community'
    : 'Select community';

  const availableBrands = useMemo(() => {
    if (!selectedCategory) return [];
    return BRANDS_BY_CATEGORY[selectedCategory] || [];
  }, [selectedCategory]);

  const brandPlaceholder = availableBrands[0] ? `e.g. ${availableBrands[0]}` : 'e.g. IKEA';
  const selectedBrandLabel = selectedBrand ?? brandPlaceholder;

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title || '');
      setDescription(editingListing.description || '');
      setPrice(editingListing.price ? editingListing.price.toString() : '');
      setSelectedCategory(editingListing.category || null);
      setSelectedBrand(editingListing.brand || null);
      setSelectedCondition(editingListing.condition || null);
      
      const communityId = editingListing.livingCommunity 
        ? LIVING_COMMUNITIES.find(c => c.label === editingListing.livingCommunity)?.id || editingListing.livingCommunity
        : null;
      setSelectedCommunity(communityId);
      
      setIsUrgent(editingListing.urgent || false);
      setEventDate(editingListing.eventDate || '');
      setVenue(editingListing.venue || '');

      if (editingListing.images && editingListing.images.length > 0) {
        setImages(editingListing.images);
        if (editingListing.coverImage) {
          const idx = editingListing.images.findIndex(img => {
            const imgUri = typeof img === 'string' ? img : (img.thumbnail?.uri || img.originalUri);
            const coverUri = typeof editingListing.coverImage === 'string' ? editingListing.coverImage : (editingListing.coverImage.thumbnail?.uri || editingListing.coverImage.originalUri);
            return imgUri === coverUri;
          });
          if (idx !== -1) setSelectedCoverIndex(idx);
        }
      } else {
        setImages([]);
      }
    } else if (params.initialCategory) {
      setSelectedCategory(params.initialCategory);
    }
  }, [params.listingData, params.initialCategory]);

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS === 'web') return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos.');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') return false;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera access to take photos.');
      return false;
    }
    return true;
  };

  const checkImageLimit = () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', `You can add up to ${MAX_IMAGES} images.`);
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not available', 'Taking a photo is not supported on web.');
      return;
    }
    if (isCompressing) return;
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    if (!checkImageLimit()) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(result.assets.map((a) => compressListingImage(a.uri)));
        setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
      } catch (e) {
        Alert.alert('Compression failed', e?.message ?? 'Could not process images.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const pickImage = async () => {
    if (isCompressing) return;
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;
    if (!checkImageLimit()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - images.length,
    });

    if (!result.canceled && result.assets) {
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(result.assets.map((asset) => compressListingImage(asset.uri)));
        setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
      } catch (e) {
        Alert.alert('Compression failed', e?.message ?? 'Could not process images.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (index === selectedCoverIndex) {
      setSelectedCoverIndex(0);
    } else if (index < selectedCoverIndex) {
      setSelectedCoverIndex((prev) => prev - 1);
    }
  };

  const getDisplayUri = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return image.thumbnail?.uri ?? image.originalUri ?? null;
  };

  const renderImageTile = (index) => {
    const image = images[index];
    const isEmpty = !image;
    const displayUri = getDisplayUri(image);
    const isCover = index === selectedCoverIndex;

    return (
      <View key={index} style={styles.imageTile}>
        {isEmpty ? (
          <TouchableOpacity
            style={[styles.placeholderTile, { borderColor: theme.border }]}
            onPress={takePhoto}
            activeOpacity={0.7}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <ActivityIndicator size="small" color={ASU.maroon} />
            ) : (
              <Ionicons name="camera-outline" size={28} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => setSelectedCoverIndex(index)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: displayUri }} 
              style={[styles.image, isCover && styles.coverImageBorder]} 
              resizeMode="cover" 
            />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: ASU.maroon }]}
              onPress={() => removeImage(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={ASU.white} />
            </TouchableOpacity>
            
            {isCover && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Cover</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !selectedCategory || !selectedCondition || !selectedCommunity) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const coverImg = images[selectedCoverIndex] || images[0];
      let orderedImages = [...images];
      
      // Ensure cover image is first in the array for compatibility with other views
      if (selectedCoverIndex > 0 && coverImg) {
        orderedImages.splice(selectedCoverIndex, 1);
        orderedImages.unshift(coverImg);
      }

      const listingData = {
        title,
        description,
        price: parseFloat(price),
        category: selectedCategory,
        brand: selectedBrand,
        condition: selectedCondition,
        livingCommunity: selectedCommunity 
          ? LIVING_COMMUNITIES.find(c => c.id === selectedCommunity)?.label || selectedCommunity
          : null,
        urgent: isUrgent,
        eventDate,
        venue,
        images: orderedImages,
        coverImage: coverImg,
      };

      if (isEditing) {
        await listingService.updateListing({
          ...listingData,
          id: editingListing.id,
        });
        Alert.alert('Success', 'Listing updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/dashboard');
              }
            },
          },
        ]);
      } else {
        await listingService.addListing(listingData);
        Alert.alert('Success', 'Listing posted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setTitle('');
              setDescription('');
              setPrice('');
              setImages([]);
              setSelectedCategory(null);
              setSelectedBrand(null);
              setSelectedCondition(null);
              setSelectedCommunity(null);
              setIsUrgent(false);
              setEventDate('');
              setVenue('');
              router.push('/dashboard');
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent, 
          isTab && { paddingTop: insets.top + headerHeight + 8 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category & Brand Row */}
        <View style={styles.section}>
          <View style={styles.categoryBrandRow}>
            <View style={styles.pickerHalf}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Category</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setCategoryPickerVisible(true)}
              >
                <Text style={[styles.pickerTriggerText, { color: selectedCategory ? theme.text : theme.placeholder }]} numberOfLines={1}>
                  {selectedCategoryLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerHalf}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{ENABLE_TICKETS && selectedCategory === 'Tickets' ? 'Event type' : 'Brand'}</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setBrandPickerVisible(true)}
                disabled={!selectedCategory}
              >
                <Text style={[styles.pickerTriggerText, { color: selectedBrand ? theme.text : theme.placeholder }]} numberOfLines={1}>
                  {selectedBrandLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal visible={categoryPickerVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setCategoryPickerVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerHeaderTitle, { color: theme.text }]}>Category</Text>
                <TouchableOpacity onPress={() => setCategoryPickerVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[styles.pickerDone, { color: ASU.maroon }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.textSecondary}
                >
                  <Picker.Item label="e.g. Furniture" value={null} color={theme.placeholder} />
                  {CATEGORIES.map((c) => (
                    <Picker.Item key={c} label={c} value={c} color={theme.text} />
                  ))}
                </Picker>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={brandPickerVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setBrandPickerVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerHeaderTitle, { color: theme.text }]}>{ENABLE_TICKETS && selectedCategory === 'Tickets' ? 'Event type' : 'Brand'}</Text>
                <TouchableOpacity onPress={() => setBrandPickerVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[styles.pickerDone, { color: ASU.maroon }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedBrand}
                  onValueChange={(v) => setSelectedBrand(v)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.textSecondary}
                >
                  <Picker.Item label={brandPlaceholder} value={null} color={theme.placeholder} />
                  {availableBrands.map((brand) => (
                    <Picker.Item key={brand} label={brand} value={brand} color={theme.text} />
                  ))}
                </Picker>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Photos</Text>
          {Platform.OS !== 'web' && (
            <View style={styles.photoOptionsRow}>
              <TouchableOpacity
                style={[styles.photoOptionButton, { backgroundColor: theme.surface, borderColor: ASU.maroon }]}
                onPress={pickImage}
                activeOpacity={0.7}
                disabled={isCompressing}
              >
                <Ionicons name="images-outline" size={22} color={ASU.maroon} />
                <Text style={styles.photoOptionText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.imageGrid}>
            {Array.from({ length: 6 }).map((_, index) => renderImageTile(index))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Title</Text>
          <TextInput
            style={[styles.titleInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g. Office Desk Chair"
            placeholderTextColor={theme.placeholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.descriptionInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Describe the item you're selling..."
            placeholderTextColor={theme.placeholder}
            value={description}
            onChangeText={(text) => {
              if (text.length <= MAX_DESCRIPTION_LENGTH) setDescription(text);
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <View style={styles.charCounterContainer}>
            <Text style={[styles.charCounter, { color: theme.textSecondary }, description.length >= MAX_DESCRIPTION_LENGTH && styles.charCounterLimit]}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>
        </View>

        {/* Price & Urgent */}
        <View style={styles.section}>
          <View style={styles.priceUrgentRow}>
            <View style={styles.priceUrgentItem}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Price</Text>
              <View style={[styles.priceInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.pricePrefix, { color: theme.textSecondary }]}>$</Text>
                <TextInput
                  style={[styles.priceInput, { color: theme.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.placeholder}
                  value={price}
                  onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={styles.priceUrgentItem}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Mark as urgent</Text>
              <TouchableOpacity
                style={[styles.urgentToggle, isUrgent && styles.urgentToggleActive]}
                onPress={() => setIsUrgent((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons name={isUrgent ? 'flash' : 'flash-outline'} size={22} color={isUrgent ? ASU.white : theme.textSecondary} />
                <Text style={[styles.urgentToggleText, isUrgent && styles.urgentToggleTextActive]}>{isUrgent ? 'Urgent' : 'No'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Condition</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer} style={styles.chipsScrollView}>
            {CONDITIONS.map((condition) => {
              const isSelected = selectedCondition === condition;
              const iconName = CONDITION_ICONS[condition];
              return (
                <TouchableOpacity
                  key={condition}
                  style={[styles.chip, isSelected && styles.chipSelected, { borderColor: theme.border }]}
                  onPress={() => setSelectedCondition(condition)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName} size={18} color={isSelected ? ASU.white : theme.textSecondary} style={styles.chipIcon} />
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected, { color: isSelected ? ASU.white : theme.text }]}>{condition}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Living Community */}
        <View style={styles.section}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Living Community</Text>
          <TouchableOpacity
            style={[styles.pickerTrigger, styles.pickerFull, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={[styles.pickerTriggerText, { color: selectedCommunity ? theme.text : theme.placeholder }]}>{selectedLabel}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Modal visible={pickerVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerHeaderTitle, { color: theme.text }]}>Living Community</Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={[styles.pickerDone, { color: ASU.maroon }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCommunity}
                  onValueChange={(v) => setSelectedCommunity(v)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.textSecondary}
                >
                  <Picker.Item label="Select community" value={null} color={theme.placeholder} />
                  {LIVING_COMMUNITIES.map((c) => (
                    <Picker.Item key={c.id} label={c.label} value={c.id} color={theme.text} />
                  ))}
                </Picker>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Event date & Venue (Tickets only) */}
        {selectedCategory === 'Tickets' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Event details</Text>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Event date</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Mar 15, 7:00 PM"
              placeholderTextColor={theme.placeholder}
              value={eventDate}
              onChangeText={setEventDate}
            />
            <Text style={[styles.rowLabel, { color: theme.text, marginTop: 12 }]}>Venue</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. State Farm Stadium"
              placeholderTextColor={theme.placeholder}
              value={venue}
              onChangeText={setVenue}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Listing' : 'Post Listing'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryBrandRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerHalf: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerFull: {
    width: '100%',
  },
  pickerTriggerText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  photoOptionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  photoOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  photoOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: ASU.maroon,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageTile: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  placeholderTile: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  descriptionInput: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  charCounterContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  charCounter: {
    fontSize: 12,
  },
  charCounterLimit: {
    color: 'red',
  },
  priceUrgentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  priceUrgentItem: {
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  pricePrefix: {
    fontSize: 16,
    marginRight: 4,
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  urgentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ASU.gray4,
    gap: 6,
  },
  urgentToggleActive: {
    backgroundColor: ASU.gold,
    borderColor: ASU.gold,
  },
  urgentToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: ASU.gray5,
  },
  urgentToggleTextActive: {
    color: ASU.white,
  },
  chipsScrollView: {
    maxHeight: 40,
  },
  chipsContainer: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: ASU.maroon,
    borderColor: ASU.maroon,
  },
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: ASU.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ASU.white, // Will need to adapt to theme, but modal usually has white background
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ASU.gray2,
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerWrapper: {
    maxHeight: 250,
  },
  picker: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: ASU.maroon,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: ASU.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ASU.maroon,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadgeText: {
    color: ASU.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  coverImageBorder: {
    borderWidth: 3,
    borderColor: ASU.maroon,
  },
});

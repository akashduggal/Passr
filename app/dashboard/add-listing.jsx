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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { getTheme, ASU } from '../theme';
import { ENABLE_TICKETS } from '../featureFlags';

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

export default function AddListing() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [brandPickerVisible, setBrandPickerVisible] = useState(false);
  const styles = getStyles(theme);

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
    setSelectedBrand(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== 'Tickets') {
      setEventDate('');
      setVenue('');
    }
  }, [selectedCategory]);

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
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    if (!checkImageLimit()) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  };

  const pickImage = async () => {
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
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const renderImageTile = (index) => {
    const image = images[index];
    const isEmpty = !image;
    return (
      <View key={index} style={styles.imageTile}>
        {isEmpty ? (
          <TouchableOpacity
            style={[styles.placeholderTile, { borderColor: theme.border }]}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: ASU.maroon }]}
              onPress={() => removeImage(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={ASU.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
                onPress={takePhoto}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={22} color={ASU.maroon} />
                <Text style={styles.photoOptionText}>Take Photo</Text>
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
              placeholder="e.g. Sat, Mar 15 · 7:00 PM"
              placeholderTextColor={theme.placeholder}
              value={eventDate}
              onChangeText={setEventDate}
            />
            <Text style={[styles.rowLabel, { color: theme.text, marginTop: 12 }]}>Venue</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Footprint Center, Phoenix"
              placeholderTextColor={theme.placeholder}
              value={venue}
              onChangeText={setVenue}
            />
          </View>
        )}

        {/* Post */}
        <View style={styles.uploadButtonContainer}>
          <TouchableOpacity style={styles.postButton} onPress={() => Alert.alert('Post', 'Listing posted (mock).')} activeOpacity={0.8}>
            <Ionicons name="send" size={20} color={ASU.white} />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 32 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    rowLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    categoryBrandRow: { flexDirection: 'row', gap: 12 },
    pickerHalf: { flex: 1 },
    pickerFull: { alignSelf: 'stretch' },
    pickerTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    pickerTriggerText: { fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    pickerHeaderTitle: { fontSize: 18, fontWeight: '700' },
    pickerDone: { fontSize: 16, fontWeight: '600' },
    pickerWrapper: { paddingHorizontal: 12 },
    picker: { height: 180 },
    photoOptionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    photoOptionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 8,
    },
    photoOptionText: { fontSize: 14, fontWeight: '600', color: ASU.maroon },
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    imageTile: { width: '31%', aspectRatio: 1 },
    placeholderTile: {
      width: '100%',
      height: '100%',
      backgroundColor: ASU.gray6,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    imageContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    image: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: ASU.gray6 },
    removeButton: { position: 'absolute', top: 4, right: 4, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    titleInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
    descriptionInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 120 },
    charCounterContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
    charCounter: { fontSize: 13 },
    charCounterLimit: { color: ASU.maroon, fontWeight: '600' },
    priceUrgentRow: { flexDirection: 'row', gap: 16 },
    priceUrgentItem: { flex: 1 },
    priceInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
    pricePrefix: { fontSize: 16, marginRight: 4 },
    priceInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
    urgentToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ASU.gray5,
      backgroundColor: ASU.gray6,
    },
    urgentToggleActive: { backgroundColor: ASU.maroon, borderColor: ASU.maroon },
    urgentToggleText: { fontSize: 14, fontWeight: '600', color: ASU.gray },
    urgentToggleTextActive: { color: ASU.white },
    chipsContainer: { flexDirection: 'row', gap: 10, paddingRight: 16 },
    chipsScrollView: { marginHorizontal: -4 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      gap: 6,
    },
    chipSelected: { backgroundColor: ASU.maroon, borderColor: ASU.maroon },
    chipIcon: {},
    chipText: { fontSize: 14, fontWeight: '600' },
    chipTextSelected: { color: ASU.white },
    uploadButtonContainer: { marginTop: 24 },
    postButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ASU.maroon,
      borderRadius: 12,
      paddingVertical: 16,
      gap: 10,
    },
    postButtonText: { fontSize: 16, fontWeight: '700', color: ASU.white },
  });

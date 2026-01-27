import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { getTheme, ASU } from './theme';

function formatScheduleDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatScheduleTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Dates from today through 1 month from today. */
function getSelectableDates(todayStart, endDate) {
  const dates = [];
  const cur = new Date(todayStart);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getDateOptionLabel(d, todayStart) {
  const dStart = new Date(d);
  dStart.setHours(0, 0, 0, 0);
  if (dStart.getTime() === todayStart.getTime()) return 'Today';
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dStart.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Chat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const isSeller = params.isSeller === 'true';
  const buyerName = params.buyerName || 'Buyer';
  const listingId = params.listingId || '';
  const offerAmount = params.offerAmount ? parseFloat(params.offerAmount) : 0;
  const productTitle = params.productTitle || 'Product';
  const productPrice = params.productPrice ? parseFloat(params.productPrice) : 0;
  const offerAcceptedFromParams = params.offerAccepted === 'true';

  const [offerAccepted, setOfferAccepted] = useState(offerAcceptedFromParams || false);
  const [isOnline] = useState(true);
  const [messages, setMessages] = useState(() => {
    const initial = [
      {
        id: 1,
        text: `Hi! I'm interested in your ${productTitle}. I'd like to make an offer of $${offerAmount.toFixed(0)}.`,
        sender: 'buyer',
        timestamp: new Date(),
      },
    ];
    if (isSeller && offerAcceptedFromParams) {
      return [
        ...initial,
        {
          id: 2,
          text: 'Hi, thanks for your interest!',
          sender: 'seller',
          timestamp: new Date(),
        },
      ];
    }
    return initial;
  });
  const [inputText, setInputText] = useState('');
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showScheduleErrors, setShowScheduleErrors] = useState(false);
  const [scheduleTimePastWarning, setScheduleTimePastWarning] = useState(false);

  const acceptOffer = () => {
    setOfferAccepted(true);
    const sellerMessage = {
      id: messages.length + 1,
      text: 'Hi',
      sender: 'seller',
      timestamp: new Date(),
    };
    setMessages([...messages, sellerMessage]);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: isSeller ? 'seller' : 'buyer',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const confirmSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      setShowScheduleErrors(true);
      return;
    }
    
    // Validate: date+time must not be in the past
    const selectedDateTime = new Date(scheduleDate);
    selectedDateTime.setHours(scheduleTime.getHours(), scheduleTime.getMinutes(), 0, 0);
    const now = new Date();
    if (selectedDateTime <= now) {
      // Date+time is in the past, clear time and show error
      setScheduleTime(null);
      setShowScheduleErrors(true);
      return;
    }
    
    setShowScheduleErrors(false);
    const dateStr = formatScheduleDate(scheduleDate);
    const timeStr = formatScheduleTime(scheduleTime);
    const note = scheduleLocation.trim();
    const text = note
      ? `Pickup scheduled \n${dateStr} at ${timeStr}\n\nNote\n${note}`
      : `Pickup scheduled \n${dateStr} at ${timeStr}`;
    const sysMessage = {
      id: messages.length + 1,
      text,
      sender: 'seller',
      timestamp: new Date(),
    };
    setMessages([...messages, sysMessage]);
    setScheduleModalVisible(false);
    setScheduleDate(null);
    setScheduleTime(null);
    setScheduleLocation('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const openScheduleModal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in15 = new Date();
    in15.setMinutes(in15.getMinutes() + 15);
    in15.setSeconds(0, 0);
    const mins = in15.getMinutes();
    const rounded = Math.ceil(mins / 15) * 15;
    if (rounded === 60) {
      in15.setHours(in15.getHours() + 1);
      in15.setMinutes(0);
    } else {
      in15.setMinutes(rounded);
    }
    setScheduleDate(today);
    setScheduleTime(in15);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowScheduleErrors(false);
    setScheduleTimePastWarning(false);
    setScheduleModalVisible(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalVisible(false);
    setScheduleDate(null);
    setScheduleTime(null);
    setScheduleLocation('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowScheduleErrors(false);
    setScheduleTimePastWarning(false);
  };

  const scheduleDateError = showScheduleErrors && !scheduleDate;
  const scheduleTimeError = showScheduleErrors && !scheduleTime;

  // Get start of today (midnight) for date picker minimumDate
  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const todayStart = getStartOfToday();
  const now = new Date();
  const oneMonthLater = (() => {
    const end = new Date(todayStart);
    end.setMonth(end.getMonth() + 1);
    return end;
  })();
  const selectableDates = getSelectableDates(todayStart, oneMonthLater);
  const timePickerValue = scheduleTime || now;

  // If selected date is today, minimum time should be current time; otherwise allow any time
  const isSelectedDateToday = scheduleDate && 
    scheduleDate.toDateString() === now.toDateString();
  const timeMinimumDate = isSelectedDateToday ? now : null;

  const headerTitle = isSeller ? buyerName : 'ASU Student';
  const showAcceptMock = !isSeller && !offerAccepted;
  const showPendingOverlay = !isSeller && !offerAccepted;
  const chatEnabled = offerAccepted;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <View style={[styles.statusIndicator, isOnline ? styles.statusOnline : styles.statusOffline]}>
                <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          {isSeller && chatEnabled && (
            <TouchableOpacity
              style={styles.headerScheduleButton}
              onPress={openScheduleModal}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.6}
            >
              <Ionicons name="calendar-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.productCard}>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1}>{productTitle}</Text>
            <Text style={styles.productPrice}>${productPrice.toFixed(0)}</Text>
          </View>
          <View style={styles.offerInfo}>
            <Text style={styles.offerLabel}>{isSeller ? 'Accepted offer' : 'Your offer'}</Text>
            <Text style={styles.offerAmount}>${offerAmount.toFixed(0)}</Text>
          </View>
        </View>

        {showAcceptMock && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={acceptOffer}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptButtonText}>Accept Offer (Mock)</Text>
          </TouchableOpacity>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {showPendingOverlay && (
            <View style={styles.pendingOverlay}>
              <View style={styles.pendingCard}>
                <Ionicons name="time-outline" size={32} color={ASU.gold} />
                <Text style={styles.pendingTitle}>Offer Pending</Text>
                <Text style={styles.pendingText}>
                  Waiting for seller to accept your offer of ${offerAmount.toFixed(0)}
                </Text>
              </View>
            </View>
          )}
          {messages.map((message) => {
            // Perspective-aware alignment:
            // - When seller views: buyer messages on left, seller messages on right
            // - When buyer views: buyer messages on right, seller messages on left
            const isFromCurrentUser = (isSeller && message.sender === 'seller') || (!isSeller && message.sender === 'buyer');
            const bubbleStyle = isFromCurrentUser ? styles.buyerMessage : styles.sellerMessage;
            const textStyle = isFromCurrentUser ? styles.buyerMessageText : styles.sellerMessageText;
            const timeStyle = isFromCurrentUser ? styles.buyerMessageTime : styles.sellerMessageTime;

            return (
              <View
                key={message.id}
                style={[styles.messageBubble, bubbleStyle]}
              >
                <Text style={[styles.messageText, textStyle]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, timeStyle]}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={[styles.input, !chatEnabled && styles.inputDisabled]}
            placeholder={chatEnabled ? 'Type a message...' : 'Chat disabled until offer is accepted'}
            placeholderTextColor={theme.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={chatEnabled}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || !chatEnabled) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || !chatEnabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && chatEnabled ? ASU.white : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Schedule pickup modal (seller only) */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeScheduleModal}
      >
        <KeyboardAvoidingView
          style={styles.scheduleModalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={closeScheduleModal}
          >
            <Pressable
              style={styles.scheduleModalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scheduleModalScrollContent}
              >
                <View style={styles.scheduleModalHeader}>
              <Text style={styles.scheduleModalTitle}>Schedule pickup</Text>
              <TouchableOpacity
                onPress={closeScheduleModal}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.scheduleFieldLabel}>Date <Text style={styles.scheduleRequired}>*</Text></Text>
            <TouchableOpacity
              style={[styles.scheduleInput, styles.schedulePickerRow, scheduleDateError && styles.scheduleInputError]}
              onPress={() => { setShowTimePicker(false); setShowDatePicker(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.schedulePickerValue, { color: scheduleDate ? theme.text : theme.placeholder }]}>
                {scheduleDate ? formatScheduleDate(scheduleDate) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            {scheduleDateError && <Text style={styles.scheduleError}>Date is required</Text>}
            {showDatePicker && (
              <ScrollView
                style={styles.scheduleDateList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {selectableDates.map((d) => (
                  <TouchableOpacity
                    key={d.getTime()}
                    style={[
                      styles.scheduleDateOption,
                      scheduleDate && d.toDateString() === scheduleDate.toDateString() && styles.scheduleDateOptionSelected,
                    ]}
                    onPress={() => {
                      setScheduleDate(d);
                      setShowScheduleErrors(false);
                      setScheduleTimePastWarning(false);
                      const dStart = new Date(d);
                      dStart.setHours(0, 0, 0, 0);
                      const isToday = dStart.getTime() === todayStart.getTime();
                      if (isToday && scheduleTime) {
                        const combined = new Date(d);
                        combined.setHours(scheduleTime.getHours(), scheduleTime.getMinutes(), 0, 0);
                        if (combined <= now) setScheduleTime(null);
                      }
                      setShowDatePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.scheduleDateOptionText, { color: theme.text }]}>
                      {getDateOptionLabel(d, todayStart)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.scheduleFieldLabel}>Time <Text style={styles.scheduleRequired}>*</Text></Text>
            <TouchableOpacity
              style={[styles.scheduleInput, styles.schedulePickerRow, scheduleTimeError && styles.scheduleInputError]}
              onPress={() => { setShowDatePicker(false); setShowTimePicker(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.schedulePickerValue, { color: scheduleTime ? theme.text : theme.placeholder }]}>
                {scheduleTime ? formatScheduleTime(scheduleTime) : 'Select time'}
              </Text>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            {scheduleTimeError && <Text style={styles.scheduleError}>Time is required</Text>}
            {scheduleTimePastWarning && (
              <Text style={styles.scheduleTimeWarning}>Please select a time in the future</Text>
            )}
            {showTimePicker && (
              <>
                <View style={Platform.OS === 'ios' ? styles.schedulePickerWrapper : undefined}>
                  <DateTimePicker
                    value={timePickerValue}
                    mode="time"
                    minuteInterval={15}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    themeVariant={isDarkMode ? 'dark' : 'light'}
                    textColor={Platform.OS === 'ios' ? (isDarkMode ? '#FFFFFF' : '#191919') : undefined}
                    onChange={(event, date) => {
                      if (Platform.OS === 'android') setShowTimePicker(false);
                      if (date != null) {
                        // Validate: if date is today, time must be in the future
                        if (scheduleDate) {
                          const selectedDateStart = new Date(scheduleDate);
                          selectedDateStart.setHours(0, 0, 0, 0);
                          const isToday = selectedDateStart.getTime() === todayStart.getTime();
                          if (isToday) {
                            const selectedDateTime = new Date(scheduleDate);
                            selectedDateTime.setHours(date.getHours(), date.getMinutes(), 0, 0);
                            if (selectedDateTime <= now) {
                              setScheduleTimePastWarning(true);
                              return;
                            }
                          }
                        }
                        setScheduleTimePastWarning(false);
                        setScheduleTime(date);
                        setShowScheduleErrors(false);
                      }
                    }}
                    minimumDate={timeMinimumDate}
                  />
                </View>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.schedulePickerDone}
                    onPress={() => {
                      const selectedTime = timePickerValue;
                      // Validate: if date is today, time must be in the future
                      if (scheduleDate) {
                        const selectedDateStart = new Date(scheduleDate);
                        selectedDateStart.setHours(0, 0, 0, 0);
                        const isToday = selectedDateStart.getTime() === todayStart.getTime();
                        if (isToday) {
                          const selectedDateTime = new Date(scheduleDate);
                          selectedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
                          if (selectedDateTime <= now) {
                            setScheduleTimePastWarning(true);
                            setShowTimePicker(false);
                            return;
                          }
                        }
                      }
                      setScheduleTimePastWarning(false);
                      setScheduleTime(selectedTime);
                      setShowTimePicker(false);
                      setShowScheduleErrors(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.schedulePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <Text style={styles.scheduleFieldLabel}>Location / notes (optional)</Text>
            <TextInput
              style={[styles.scheduleInput, styles.scheduleInputMultiline]}
              placeholder="e.g. Tooker House lobby"
              placeholderTextColor={theme.placeholder}
              value={scheduleLocation}
              onChangeText={setScheduleLocation}
              multiline
            />
                <TouchableOpacity
                  style={styles.scheduleConfirmButton}
                  onPress={confirmSchedule}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scheduleConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusOnline: {
    backgroundColor: ASU.green + '20',
  },
  statusOffline: {
    backgroundColor: ASU.gray5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: ASU.green,
  },
  statusTextOffline: {
    color: theme.textSecondary,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  offerInfo: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  offerLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  offerAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.maroon,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
  },
  buyerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: ASU.maroon,
    borderBottomRightRadius: 4,
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  buyerMessageText: {
    color: ASU.white,
  },
  sellerMessageText: {
    color: theme.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  buyerMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sellerMessageTime: {
    color: theme.textSecondary,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ASU.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: ASU.gray6,
  },
  acceptButton: {
    backgroundColor: ASU.gold,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  headerScheduleButton: {
    // padding: 8,
  },
  scheduleModalWrapper: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  scheduleModalContent: {
    maxHeight: '90%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  scheduleModalScrollContent: {
    paddingBottom: 24,
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  scheduleFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    marginTop: 12,
  },
  scheduleRequired: {
    color: ASU.maroon,
  },
  scheduleInput: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  schedulePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleInputError: {
    borderColor: ASU.maroon,
    borderWidth: 1.5,
  },
  scheduleError: {
    fontSize: 12,
    color: ASU.maroon,
    marginTop: 4,
    marginBottom: 4,
  },
  scheduleTimeWarning: {
    fontSize: 12,
    color: ASU.orange,
    marginTop: 4,
    marginBottom: 4,
  },
  schedulePickerValue: {
    fontSize: 16,
  },
  schedulePickerWrapper: {
    backgroundColor: theme.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  schedulePickerDone: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  schedulePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: ASU.maroon,
  },
  scheduleDateList: {
    maxHeight: 220,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scheduleDateOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  scheduleDateOptionSelected: {
    backgroundColor: theme.surface,
  },
  scheduleDateOptionText: {
    fontSize: 16,
  },
  scheduleInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scheduleConfirmButton: {
    backgroundColor: ASU.maroon,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  scheduleConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.white,
  },
  pendingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  pendingCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ASU.gold,
    borderStyle: 'dashed',
    width: '100%',
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 12,
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputDisabled: {
    backgroundColor: ASU.gray6,
    opacity: 0.6,
  },
});

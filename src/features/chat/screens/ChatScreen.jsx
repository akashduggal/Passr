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
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { getTheme, ASU } from '../../../theme';

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

import { chatService } from '../../../services/ChatService';
import { offerService } from '../../../services/OfferService';
import auth from '../../../services/firebaseAuth';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);

  const isSeller = params.isSeller === 'true';
  const buyerName = params.buyerName || 'Buyer';
  const sellerName = params.sellerName || 'ASU Student';
  const listingId = params.listingId || '';
  
  // Parse offer data if available
  const offerData = params.offerData ? JSON.parse(params.offerData) : null;
  const isBundle = offerData && offerData.items && offerData.items.length > 1;

  const productTitle = isBundle 
    ? `Bundle Offer (${offerData.items.length} items)`
    : (offerData ? offerData.items[0].title : (params.productTitle || 'Product'));
    
  const productPrice = isBundle
    ? offerData.items.reduce((sum, item) => sum + (item.price || 0), 0)
    : (offerData ? offerData.items[0].price : (params.productPrice ? parseFloat(params.productPrice) : 0));

  const offerAmount = offerData 
    ? offerData.totalOfferAmount 
    : (params.offerAmount ? parseFloat(params.offerAmount) : 0);
    
  const offerAcceptedFromParams = params.offerAccepted === 'true';

  const [offerAccepted, setOfferAccepted] = useState(offerAcceptedFromParams || false);
  const [isOnline] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  
  // Schedule state
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showScheduleErrors, setShowScheduleErrors] = useState(false);
  const [scheduleTimePastWarning, setScheduleTimePastWarning] = useState(false);

  const currentUser = auth().currentUser;

  useEffect(() => {
    const initChat = async () => {
      try {
        const otherUserId = isSeller ? params.buyerId : params.sellerId;
        const offerId = params.offerId;
        
        if ((!otherUserId && !params.buyerId && !params.sellerId) || !listingId) {
             console.log("Missing params for chat init", params);
             return;
        }
        
        // Fallback for missing otherUserId if not passed explicitly but maybe in offerData? 
        // But for now assume params are correct from previous steps.
        const targetUserId = otherUserId || (isSeller ? offerData?.buyerId : offerData?.sellerId);

        if (!targetUserId) return;

        const chat = await chatService.createOrGetChat(targetUserId, listingId, offerId);
        setChatId(chat._id);
        
        const fetchMessagesAndStatus = async () => {
          try {
            const msgs = await chatService.getMessages(chat._id);
            // Sort by createdAt asc
            msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            setMessages(msgs.map(m => ({
                id: m._id,
                text: m.text,
                type: m.type || 'text',
                schedule: m.schedule || null,
                sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                timestamp: new Date(m.createdAt),
            })));

            // Poll offer status if we have an offerId and it's not accepted yet
            if (offerId) {
              const offer = await offerService.getOfferById(offerId);
              if (offer && offer.status === 'accepted') {
                setOfferAccepted(true);
              }
            }
          } catch(e) {
            console.error("Error fetching data:", e);
          }
        };

        fetchMessagesAndStatus();
      } catch (err) {
        console.error("Chat init error", err);
      }
    };

    initChat();
  }, [listingId, params.buyerId, params.sellerId, params.offerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() && chatId) {
      const text = inputText.trim();
      setInputText(''); // Optimistic clear
      try {
        await chatService.sendMessage(chatId, text);
        // Messages will be updated by poller, or we can optimistic add.
        // Let's rely on poller for simplicity or manual fetch
        const msgs = await chatService.getMessages(chatId);
        msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(msgs.map(m => ({
            id: m._id,
            text: m.text,
            type: m.type || 'text',
            schedule: m.schedule || null,
            sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
            timestamp: new Date(m.createdAt),
        })));
      } catch (error) {
        console.error("Send message error", error);
        // Restore text if failed?
        setInputText(text); 
      }
    }
  };



  const handleAcceptOffer = async () => {
    try {
        if (!params.offerId) return;
        await offerService.acceptOffer(params.offerId);
        setOfferAccepted(true);
        Alert.alert("Success", "Offer accepted!");
        
        // Refresh messages
        if (chatId) {
            const msgs = await chatService.getMessages(chatId);
            msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(msgs.map(m => ({
                id: m._id,
                text: m.text,
                type: m.type || 'text',
                schedule: m.schedule || null,
                sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                timestamp: new Date(m.createdAt),
            })));
        }
    } catch (error) {
        Alert.alert("Error", "Failed to accept offer");
    }
  };

  const handleRejectOffer = async () => {
      Alert.alert(
          "Reject Offer",
          "Are you sure you want to reject this offer?",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Reject", 
                  style: "destructive",
                  onPress: async () => {
                      try {
                        if (!params.offerId) return;
                        await offerService.rejectOffer(params.offerId);
                        setOfferAccepted(false);
                        Alert.alert("Success", "Offer rejected.");
                        
                        // Refresh messages
                        if (chatId) {
                            const msgs = await chatService.getMessages(chatId);
                            msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            setMessages(msgs.map(m => ({
                                id: m._id,
                                text: m.text,
                                type: m.type || 'text',
                                schedule: m.schedule || null,
                                sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                                timestamp: new Date(m.createdAt),
                            })));
                        }
                      } catch (error) {
                        Alert.alert("Error", "Failed to reject offer");
                      }
                  }
              }
          ]
      );
  };

  const confirmSchedule = async () => {
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
    const text = `Pickup scheduled for ${dateStr} at ${timeStr}`;
    
    const scheduleData = {
        date: scheduleDate.toISOString(),
        time: scheduleTime.toISOString(),
        location: note
    };
    
    // Send system message via API
    if (chatId) {
        try {
            await chatService.sendMessage(chatId, text, null, 'schedule', scheduleData);
            // Refresh messages
            const msgs = await chatService.getMessages(chatId);
            msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(msgs.map(m => ({
                id: m._id,
                text: m.text,
                type: m.type || 'text',
                schedule: m.schedule || null,
                sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                timestamp: new Date(m.createdAt),
            })));
        } catch (e) {
            console.error("Failed to send schedule message", e);
        }
    }

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

  const handleReschedule = (message) => {
    if (!message.schedule) return;
    setScheduleDate(new Date(message.schedule.date));
    setScheduleTime(new Date(message.schedule.time));
    setScheduleLocation(message.schedule.location || '');
    setScheduleModalVisible(true);
  };

  const handleCancelSchedule = () => {
    Alert.alert(
      "Cancel Pickup",
      "Are you sure you want to cancel this scheduled pickup?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            if (chatId) {
                try {
                    await chatService.sendMessage(chatId, 'Pickup cancelled', null, 'schedule_cancellation');
                    const msgs = await chatService.getMessages(chatId);
                    msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    setMessages(msgs.map(m => ({
                        id: m._id,
                        text: m.text,
                        type: m.type || 'text',
                        schedule: m.schedule || null,
                        sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                        timestamp: new Date(m.createdAt),
                    })));
                } catch (e) {
                    console.error("Failed to cancel schedule", e);
                }
            }
          }
        }
      ]
    );
  };

  const handleAcceptSchedule = () => {
    Alert.alert(
      "Confirm Pickup",
      "Are you sure you want to accept this pickup time?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Accept", 
          onPress: async () => {
            if (chatId) {
                try {
                    await chatService.sendMessage(chatId, 'Pickup confirmed', null, 'schedule_acceptance');
                    const msgs = await chatService.getMessages(chatId);
                    msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    setMessages(msgs.map(m => ({
                        id: m._id,
                        text: m.text,
                        type: m.type || 'text',
                        schedule: m.schedule || null,
                        sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                        timestamp: new Date(m.createdAt),
                    })));
                } catch (e) {
                    console.error("Failed to accept schedule", e);
                }
            }
          }
        }
      ]
    );
  };

  const handleRejectSchedule = () => {
    Alert.alert(
      "Decline Pickup",
      "Are you sure you want to decline this pickup time?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Decline", 
          style: "destructive",
          onPress: async () => {
            if (chatId) {
                try {
                    await chatService.sendMessage(chatId, 'Pickup declined', null, 'schedule_rejection');
                    const msgs = await chatService.getMessages(chatId);
                    msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    setMessages(msgs.map(m => ({
                        id: m._id,
                        text: m.text,
                        type: m.type || 'text',
                        schedule: m.schedule || null,
                        sender: m.user._id === currentUser?.uid ? (isSeller ? 'seller' : 'buyer') : (isSeller ? 'buyer' : 'seller'),
                        timestamp: new Date(m.createdAt),
                    })));
                } catch (e) {
                    console.error("Failed to reject schedule", e);
                }
            }
          }
        }
      ]
    );
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

  const headerTitle = isSeller ? buyerName : sellerName;
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

        {isSeller && (
            <View style={{ flexDirection: 'row', padding: 12 }}>
                {!offerAccepted && (
                    <TouchableOpacity 
                        style={[styles.acceptButton, { flex: 1, marginRight: 6, margin: 0 }]} 
                        onPress={handleAcceptOffer}
                    >
                        <Text style={styles.acceptButtonText}>Accept Offer</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                    style={[styles.acceptButton, { backgroundColor: ASU.maroon, flex: 1, marginLeft: !offerAccepted ? 6 : 0, margin: 0 }]} 
                    onPress={handleRejectOffer}
                >
                    <Text style={[styles.acceptButtonText, { color: ASU.white }]}>
                        {offerAccepted ? "Reject Offer" : "Reject"}
                    </Text>
                </TouchableOpacity>
            </View>
        )}

        {showAcceptMock && (
          <View style={{ padding: 10, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Offer status: {offerAccepted ? "Accepted" : "Pending"}</Text>
          </View>
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
          {(() => {
            const lastScheduleIndex = messages.map(m => m.type).lastIndexOf('schedule');
            const lastCancellationIndex = messages.map(m => m.type).lastIndexOf('schedule_cancellation');
            const lastAcceptanceIndex = messages.map(m => m.type).lastIndexOf('schedule_acceptance');
            const lastRejectionIndex = messages.map(m => m.type).lastIndexOf('schedule_rejection');

            return messages.map((message, index) => {
            // Perspective-aware alignment:
            // - When seller views: buyer messages on left, seller messages on right
            // - When buyer views: buyer messages on right, seller messages on left
            const isFromCurrentUser = (isSeller && message.sender === 'seller') || (!isSeller && message.sender === 'buyer');
            const bubbleStyle = isFromCurrentUser ? styles.buyerMessage : styles.sellerMessage;
            const textStyle = isFromCurrentUser ? styles.buyerMessageText : styles.sellerMessageText;
            const timeStyle = isFromCurrentUser ? styles.buyerMessageTime : styles.sellerMessageTime;

            if (message.type === 'schedule' && message.schedule) {
                const isLatestSchedule = index === lastScheduleIndex;
                const isCancelled = lastCancellationIndex > index;
                const isOutdated = !isLatestSchedule && !isCancelled;
                
                let scheduleStatus = 'pending';
                if (isLatestSchedule && !isCancelled) {
                    const hasAccepted = lastAcceptanceIndex > index;
                    const hasRejected = lastRejectionIndex > index;
                    
                    if (hasAccepted && (!hasRejected || lastAcceptanceIndex > lastRejectionIndex)) {
                        scheduleStatus = 'accepted';
                    } else if (hasRejected && (!hasAccepted || lastRejectionIndex > lastAcceptanceIndex)) {
                        scheduleStatus = 'rejected';
                    }
                }

                let headerText = 'Pickup Scheduled';
                let headerIcon = 'calendar';
                
                if (isCancelled) {
                    headerText = 'Pickup Cancelled';
                    headerIcon = 'close-circle';
                } else if (isOutdated) {
                    headerText = 'Rescheduled';
                    headerIcon = 'calendar';
                } else if (scheduleStatus === 'accepted') {
                    headerText = 'Pickup Confirmed';
                    headerIcon = 'checkmark-circle';
                } else if (scheduleStatus === 'rejected') {
                    headerText = 'Pickup Declined';
                    headerIcon = 'close-circle';
                }

                return (
                   <View key={message.id} style={[
                       styles.messageBubble, 
                       bubbleStyle, 
                       styles.scheduleBubble,
                       !isFromCurrentUser && { borderWidth: 1, borderColor: theme.border },
                       (isCancelled || isOutdated) && { opacity: 0.7 }
                   ]}>
                       <View style={[
                           styles.scheduleHeader, 
                           isCancelled && { backgroundColor: theme.border },
                           isFromCurrentUser && !isCancelled && { backgroundColor: 'rgba(255,255,255,0.1)', borderBottomColor: 'rgba(255,255,255,0.2)' }
                       ]}>
                           <Ionicons 
                               name={headerIcon} 
                               size={20} 
                               color={isCancelled ? theme.textSecondary : (isFromCurrentUser ? ASU.white : (scheduleStatus === 'accepted' ? '#2E7D32' : (scheduleStatus === 'rejected' ? '#C62828' : theme.primary)))} 
                           />
                           <Text style={[
                               styles.scheduleTitle, 
                               isCancelled && { color: theme.textSecondary },
                               isFromCurrentUser && !isCancelled && { color: ASU.white },
                               !isFromCurrentUser && !isCancelled && scheduleStatus === 'accepted' && { color: '#2E7D32' },
                               !isFromCurrentUser && !isCancelled && scheduleStatus === 'rejected' && { color: '#C62828' }
                           ]}>
                               {headerText}
                           </Text>
                       </View>
                       <Text style={[
                           styles.scheduleDate, 
                           isCancelled && { textDecorationLine: 'line-through', color: theme.textSecondary },
                           isFromCurrentUser && !isCancelled && { color: ASU.white }
                       ]}>
                           {new Date(message.schedule.date).toLocaleDateString()} at {new Date(message.schedule.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </Text>
                       {message.schedule.location ? (
                           <View style={styles.scheduleLocationContainer}>
                               <Ionicons 
                                   name="location-outline" 
                                   size={16} 
                                   color={isCancelled ? theme.textSecondary : (isFromCurrentUser ? 'rgba(255,255,255,0.8)' : theme.textSecondary)} 
                               />
                               <Text style={[
                                   styles.scheduleLocation, 
                                   isCancelled && { textDecorationLine: 'line-through' },
                                   isFromCurrentUser && !isCancelled && { color: 'rgba(255,255,255,0.8)' }
                               ]}>{message.schedule.location}</Text>
                           </View>
                       ) : null}
                       
                       {!isCancelled && !isOutdated && (scheduleStatus === 'accepted' || scheduleStatus === 'rejected') && (
                           <View style={{ marginTop: 8, padding: 8, backgroundColor: isFromCurrentUser ? 'rgba(255,255,255,0.1)' : theme.background, borderRadius: 8 }}>
                               <Text style={{ color: isFromCurrentUser ? ASU.white : theme.text, fontSize: 13, textAlign: 'center' }}>
                                   {scheduleStatus === 'accepted' 
                                        ? (isSeller ? "✅ Buyer accepted this time" : "✅ You accepted this time")
                                        : (isSeller ? "❌ Buyer declined this time" : "❌ You declined this time")
                                   }
                               </Text>
                           </View>
                       )}

                       {/* Action Buttons for Seller on Active Schedule */}
                       {isSeller && isLatestSchedule && !isCancelled && (
                           <View style={{ flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: isFromCurrentUser ? 'rgba(255,255,255,0.2)' : theme.border, paddingTop: 8 }}>
                               <TouchableOpacity 
                                   style={{ flex: 1, alignItems: 'center', padding: 8 }}
                                   onPress={() => handleReschedule(message)}
                               >
                                   <Text style={{ color: isFromCurrentUser ? ASU.white : theme.primary, fontWeight: '600', fontSize: 14 }}>Reschedule</Text>
                               </TouchableOpacity>
                               <View style={{ width: 1, backgroundColor: isFromCurrentUser ? 'rgba(255,255,255,0.2)' : theme.border }} />
                               <TouchableOpacity 
                                   style={{ flex: 1, alignItems: 'center', padding: 8 }}
                                   onPress={handleCancelSchedule}
                               >
                                   <Text style={{ color: isFromCurrentUser ? 'rgba(255,255,255,0.8)' : theme.textSecondary, fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                               </TouchableOpacity>
                           </View>
                       )}
                       
                       {/* Action Buttons for Buyer on Active Pending Schedule */}
                       {!isSeller && isLatestSchedule && !isCancelled && scheduleStatus === 'pending' && (
                           <View style={{ flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: isFromCurrentUser ? 'rgba(255,255,255,0.2)' : theme.border, paddingTop: 8 }}>
                               <TouchableOpacity 
                                   style={{ flex: 1, alignItems: 'center', padding: 8 }}
                                   onPress={handleAcceptSchedule}
                               >
                                   <Text style={{ color: '#2E7D32', fontWeight: '600', fontSize: 14 }}>Accept</Text>
                               </TouchableOpacity>
                               <View style={{ width: 1, backgroundColor: isFromCurrentUser ? 'rgba(255,255,255,0.2)' : theme.border }} />
                               <TouchableOpacity 
                                   style={{ flex: 1, alignItems: 'center', padding: 8 }}
                                   onPress={handleRejectSchedule}
                               >
                                   <Text style={{ color: '#C62828', fontWeight: '600', fontSize: 14 }}>Decline</Text>
                               </TouchableOpacity>
                           </View>
                       )}

                        <Text style={[
                            styles.messageTime, 
                            { 
                                color: isFromCurrentUser ? 'rgba(255,255,255,0.7)' : theme.textSecondary, 
                                marginTop: 8, 
                                marginRight: 12, 
                                marginBottom: 8 
                            }
                        ]}>
                         {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </Text>
                   </View>
                );
           }

           if (message.type === 'schedule_cancellation') {
               return (
                   <View key={message.id} style={{ alignItems: 'center', marginVertical: 12 }}>
                       <View style={{ backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                           <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                               🚫 Pickup cancelled by seller
                           </Text>
                       </View>
                   </View>
               );
           }
           
           if (message.type === 'schedule_acceptance') {
               return (
                   <View key={message.id} style={{ alignItems: 'center', marginVertical: 12 }}>
                       <View style={{ backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                           <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: '500' }}>
                               ✅ Pickup confirmed by buyer
                           </Text>
                       </View>
                   </View>
               );
           }

           if (message.type === 'schedule_rejection') {
               return (
                   <View key={message.id} style={{ alignItems: 'center', marginVertical: 12 }}>
                       <View style={{ backgroundColor: theme.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border }}>
                           <Text style={{ color: '#C62828', fontSize: 12, fontWeight: '500' }}>
                               ❌ Pickup declined by buyer
                           </Text>
                       </View>
                   </View>
               );
           }

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
          });
          })()}
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
                            // Don't close, user sees error? or we could reset time?
                            // Let's just keep the picker open or let them fix it
                            return; 
                          }
                        }
                      }
                      setScheduleTime(selectedTime);
                      setScheduleTimePastWarning(false);
                      setShowTimePicker(false);
                      setShowScheduleErrors(false);
                    }}
                  >
                    <Text style={styles.schedulePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <Text style={styles.scheduleFieldLabel}>Location / Note</Text>
            <TextInput
              style={[styles.scheduleInput, styles.scheduleInputNote]}
              placeholder="e.g. Meet at Tooker House lobby"
              placeholderTextColor={theme.placeholder}
              value={scheduleLocation}
              onChangeText={setScheduleLocation}
              multiline
              maxLength={200}
            />

            <TouchableOpacity
              style={styles.scheduleConfirmButton}
              onPress={confirmSchedule}
              activeOpacity={0.8}
            >
              <Text style={styles.scheduleConfirmButtonText}>Schedule Pickup</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  backButton: {
    padding: 4,
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
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: ASU.green + '15',
    borderColor: ASU.green + '30',
  },
  statusOffline: {
    backgroundColor: theme.border,
    borderColor: theme.border,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  statusTextOnline: {
    color: ASU.green,
  },
  statusTextOffline: {
    color: theme.textSecondary,
  },
  headerScheduleButton: {
    padding: 8,
    marginLeft: 8,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  offerInfo: {
    alignItems: 'flex-end',
  },
  offerLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  offerAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: ASU.maroon,
  },
  acceptButton: {
    backgroundColor: ASU.gold,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: ASU.black,
    fontWeight: '700',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },
  pendingOverlay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pendingCard: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pendingTitle: {
    fontSize: 16,
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
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 2,
  },
  buyerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: ASU.maroon,
    borderBottomRightRadius: 4,
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  buyerMessageText: {
    color: ASU.white,
  },
  sellerMessageText: {
    color: theme.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  buyerMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  sellerMessageTime: {
    color: theme.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: theme.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ASU.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2, // Align with input bottom
  },
  sendButtonDisabled: {
    backgroundColor: theme.border,
  },
  // Schedule Modal
  scheduleModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  scheduleModalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  scheduleModalScrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    marginTop: 16,
  },
  scheduleRequired: {
    color: theme.primary,
  },
  scheduleInput: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: theme.text,
  },
  schedulePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schedulePickerValue: {
    fontSize: 15,
  },
  scheduleInputError: {
    borderColor: theme.primary,
  },
  scheduleError: {
    fontSize: 12,
    color: theme.primary,
    marginTop: 4,
    marginLeft: 4,
  },
  scheduleInputNote: {
    height: 80,
    textAlignVertical: 'top',
  },
  scheduleDateList: {
    maxHeight: 150,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    backgroundColor: theme.background,
  },
  scheduleDateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  scheduleDateOptionSelected: {
    backgroundColor: ASU.gold + '20',
  },
  scheduleDateOptionText: {
    fontSize: 14,
  },
  scheduleTimeWarning: {
    fontSize: 12,
    color: theme.primary,
    marginTop: 4,
    marginLeft: 4,
  },
  schedulePickerWrapper: {
    marginTop: 8,
    backgroundColor: theme.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  schedulePickerDone: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  schedulePickerDoneText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  scheduleConfirmButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  scheduleConfirmButtonText: {
    color: ASU.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scheduleBubble: {
    minWidth: 200,
    maxWidth: '80%',
    padding: 0, 
    overflow: 'hidden',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '15',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.primary + '20',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
    marginLeft: 8,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  scheduleLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scheduleLocation: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 4,
  },
});

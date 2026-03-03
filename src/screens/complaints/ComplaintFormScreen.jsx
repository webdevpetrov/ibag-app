import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, HelperText, Snackbar, Chip, ActivityIndicator, Modal, Portal } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { MONTHS } from '../../utils/dates';
import { RESOLUTION_OPTIONS } from '../../config/complaints';

const MAX_SUBJECT = 100;
const MAX_DESCRIPTION = 500;
const MAX_IMAGES = 3;

function formatOrderLabel(order) {
  const d = new Date(order.created_at);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()].toLowerCase();
  const year = d.getFullYear();
  const total = parseFloat(order.total).toFixed(2);
  return `#${order.id} — ${day} ${month} ${year} — ${total} лв.`;
}

export default function ComplaintFormScreen({ navigation }) {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderPickerVisible, setOrderPickerVisible] = useState(false);

  const [orderId, setOrderId] = useState(null);
  const [orderLabel, setOrderLabel] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const allOrders = [];
        let p = 1;
        let last = 1;
        do {
          const data = await api.getOrders(token, p);
          allOrders.push(...(data.data ?? []));
          last = data.meta?.last_page ?? 1;
          p++;
        } while (p <= last);
        setOrders(allOrders);
        } catch {
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [token]);

  function selectOrder(order) {
    setOrderId(order.id);
    setOrderLabel(formatOrderLabel(order));
    setOrderPickerVisible(false);
    if (fieldErrors.order_id) {
      setFieldErrors((prev) => ({ ...prev, order_id: undefined }));
    }
  }

  async function pickImage(source) {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Лимит', `Можете да добавите максимум ${MAX_IMAGES} снимки.`);
      return;
    }

    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Достъп', 'Достъпът до камерата е отказан.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        exif: false,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Достъп', 'Достъпът до галерията е отказан.');
        return;
      }
      const remaining = MAX_IMAGES - images.length;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
        exif: false,
      });
    }

    if (!result.canceled && result.assets?.length) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.mimeType || 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const errors = {};
    if (!orderId) errors.order_id = ['Изберете поръчка.'];
    if (!subject.trim()) {
      errors.subject = ['Темата е задължителна.'];
    } else if (subject.trim().length < 5) {
      errors.subject = ['Темата трябва да е поне 5 символа.'];
    }
    if (!description.trim()) {
      errors.description = ['Описанието е задължително.'];
    } else if (description.trim().length < 10) {
      errors.description = ['Описанието трябва да е поне 10 символа.'];
    }
    if (!desiredResolution) errors.desired_resolution = ['Изберете желано решение.'];
    return errors;
  }

  async function handleSave() {
    setFieldErrors({});
    setGeneralError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('order_id', String(orderId));
    formData.append('subject', subject.trim());
    formData.append('description', description.trim());
    formData.append('desired_resolution', desiredResolution);

    images.forEach((img) => {
      const name = img.fileName || img.uri.split('/').pop() || 'photo.jpg';
      formData.append('images[]', {
        uri: img.uri,
        name,
        type: 'image/jpeg',
      });
    });

    try {
      await api.createComplaint(token, formData);
      navigation.goBack();
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Нещо се обърка.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.sectionTitle}>Поръчка *</Text>
        <Pressable
          style={[styles.pickerButton, fieldErrors.order_id && styles.pickerButtonError]}
          onPress={() => setOrderPickerVisible(true)}
        >
          <Text style={[styles.pickerText, !orderId && styles.pickerPlaceholder]} numberOfLines={1}>
            {orderLabel || 'Изберете поръчка'}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#999" />
        </Pressable>
        <HelperText type="error" visible={!!fieldErrors.order_id}>
          {fieldErrors.order_id?.[0]}
        </HelperText>

        <Text style={styles.sectionTitle}>Тема *</Text>
        <TextInput
          mode="outlined"
          value={subject}
          onChangeText={(text) => setSubject(text.slice(0, MAX_SUBJECT))}
          autoCorrect={false}
          error={!!fieldErrors.subject}
          style={styles.input}
          placeholder="Кратко описание на проблема"
        />
        <View style={styles.helperRow}>
          <HelperText type="error" visible={!!fieldErrors.subject} style={styles.flex1}>
            {fieldErrors.subject?.[0]}
          </HelperText>
          <Text style={styles.charCounter}>{subject.length}/{MAX_SUBJECT}</Text>
        </View>

        <Text style={styles.sectionTitle}>Описание *</Text>
        <TextInput
          mode="outlined"
          value={description}
          onChangeText={(text) => setDescription(text.slice(0, MAX_DESCRIPTION))}
          multiline
          numberOfLines={4}
          autoCorrect={false}
          error={!!fieldErrors.description}
          style={styles.input}
          placeholder="Опишете подробно проблема"
        />
        <View style={styles.helperRow}>
          <HelperText type="error" visible={!!fieldErrors.description} style={styles.flex1}>
            {fieldErrors.description?.[0]}
          </HelperText>
          <Text style={styles.charCounter}>{description.length}/{MAX_DESCRIPTION}</Text>
        </View>

        <Text style={styles.sectionTitle}>Желано решение *</Text>
        <View style={styles.chipRow}>
          {RESOLUTION_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={desiredResolution === opt.value}
              onPress={() => {
                setDesiredResolution(opt.value);
                if (fieldErrors.desired_resolution) {
                  setFieldErrors((prev) => ({ ...prev, desired_resolution: undefined }));
                }
              }}
              style={[styles.chip, desiredResolution === opt.value && styles.chipSelected]}
              textStyle={desiredResolution === opt.value ? styles.chipTextSelected : undefined}
            >
              {opt.label}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!fieldErrors.desired_resolution}>
          {fieldErrors.desired_resolution?.[0]}
        </HelperText>

        <Text style={styles.sectionTitle}>Снимки (до {MAX_IMAGES})</Text>
        <View style={styles.imagesRow}>
          {images.map((img, index) => (
            <View key={img.uri} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.imagePreview} />
              <Pressable style={styles.imageRemove} onPress={() => removeImage(index)}>
                <MaterialCommunityIcons name="close-circle" size={22} color="#EF4444" />
              </Pressable>
            </View>
          ))}
          {images.length < MAX_IMAGES && (
            <View style={styles.imageActions}>
              <Pressable style={styles.imageAddButton} onPress={() => pickImage('gallery')}>
                <MaterialCommunityIcons name="image-plus" size={28} color={theme.colors.primary} />
                <Text style={styles.imageAddText}>Галерия</Text>
              </Pressable>
              <Pressable style={styles.imageAddButton} onPress={() => pickImage('camera')}>
                <MaterialCommunityIcons name="camera-plus" size={28} color={theme.colors.primary} />
                <Text style={styles.imageAddText}>Камера</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor={theme.colors.primary}
        >
          Подай рекламация
        </Button>
      </ScrollView>

      <Portal>
        <Modal
          visible={orderPickerVisible}
          onDismiss={() => setOrderPickerVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Изберете поръчка</Text>
          {ordersLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.modalLoader} />
          ) : orders.length === 0 ? (
            <Text style={styles.modalEmpty}>Нямате поръчки</Text>
          ) : (
            <ScrollView style={styles.modalScroll}>
              {orders.map((order) => (
                <Pressable
                  key={order.id}
                  style={[styles.modalItem, orderId === order.id && styles.modalItemActive]}
                  onPress={() => selectOrder(order)}
                >
                  <Text style={[styles.modalItemText, orderId === order.id && styles.modalItemTextActive]}>
                    {formatOrderLabel(order)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Button mode="text" onPress={() => setOrderPickerVisible(false)} style={styles.modalClose}>
            Затвори
          </Button>
        </Modal>
      </Portal>

      <Snackbar
        visible={!!generalError}
        onDismiss={() => setGeneralError('')}
        duration={4000}
      >
        {generalError}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  charCounter: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
  },
  chipTextSelected: {
    color: '#fff',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerButtonError: {
    borderColor: '#c00',
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imageRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageAddButton: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  imageAddText: {
    fontSize: 11,
    color: theme.colors.primary,
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalLoader: {
    marginVertical: 24,
  },
  modalEmpty: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginVertical: 24,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  modalItemText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  modalItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalClose: {
    marginTop: 12,
  },
});

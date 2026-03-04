import { useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { TextInput, Button, Text, HelperText, Snackbar, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';

const LABEL_OPTIONS = ['Вкъщи', 'Офис'];
const MAX_NOTES = 240;

export default function AddressFormScreen({ navigation, route }) {
  const existing = route.params?.address;
  const isEdit = !!existing;

  const { token, user } = useAuth();
  const headerHeight = useHeaderHeight();

  const [label, setLabel] = useState(existing?.label || LABEL_OPTIONS[0]);
  const [customLabel, setCustomLabel] = useState(
    existing && !LABEL_OPTIONS.includes(existing.label) ? existing.label : '',
  );
  const [city, setCity] = useState(existing?.city || '');
  const [postalCode, setPostalCode] = useState(existing?.postal_code || '');
  const [district, setDistrict] = useState(existing?.district || '');
  const [street, setStreet] = useState(existing?.street || '');
  const [block, setBlock] = useState(existing?.block || '');
  const [entrance, setEntrance] = useState(existing?.entrance || '');
  const [floor, setFloor] = useState(existing?.floor || '');
  const [apartment, setApartment] = useState(existing?.apartment || '');
  const [hasElevator, setHasElevator] = useState(existing?.has_elevator || false);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [contactFirstName, setContactFirstName] = useState(() => {
    if (existing?.contact_name) {
      const parts = existing.contact_name.split(' ');
      return parts[0] || '';
    }
    return user?.name?.split(' ')[0] || '';
  });
  const [contactLastName, setContactLastName] = useState(() => {
    if (existing?.contact_name) {
      const parts = existing.contact_name.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    const parts = (user?.name || '').split(' ');
    return parts.slice(1).join(' ') || '';
  });
  const [contactPhone, setContactPhone] = useState(existing?.contact_phone || '');
  const [isDefault, setIsDefault] = useState(existing?.is_default || false);
  const [lat, setLat] = useState(existing?.lat || null);
  const [lng, setLng] = useState(existing?.lng || null);

  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const effectiveLabel = LABEL_OPTIONS.includes(label) ? label : customLabel || label;

  async function handleGetLocation() {
    setGeoLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeneralError('Достъпът до местоположението е отказан.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);

      const [result] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (result) {
        if (result.city) setCity(result.city);
        if (result.postalCode) setPostalCode(result.postalCode);
        if (result.district) setDistrict(result.district);
        if (result.street) {
          const streetStr = result.streetNumber
            ? `${result.street} ${result.streetNumber}`
            : result.street;
          setStreet(streetStr);
        }
      }
    } catch {
      setGeneralError('Неуспешно определяне на местоположението.');
    } finally {
      setGeoLoading(false);
    }
  }

  function validate() {
    const errors = {};
    if (!city.trim()) errors.city = ['Градът е задължителен.'];
    if (!contactFirstName.trim()) errors.contact_first_name = ['Собственото име е задължително.'];
    if (!contactLastName.trim()) errors.contact_last_name = ['Фамилното име е задължително.'];
    if (!contactPhone.trim()) errors.contact_phone = ['Телефонът е задължителен.'];
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
    const contactName = `${contactFirstName.trim()} ${contactLastName.trim()}`.trim();
    const data = {
      label: effectiveLabel,
      lat,
      lng,
      city: city.trim(),
      postal_code: postalCode.trim(),
      district: district.trim(),
      street: street.trim(),
      block: block.trim(),
      entrance: entrance.trim(),
      floor: floor.trim(),
      apartment: apartment.trim(),
      has_elevator: hasElevator,
      notes: notes.trim(),
      contact_name: contactName,
      contact_phone: contactPhone.trim(),
      is_default: isDefault,
    };

    try {
      if (isEdit) {
        await api.updateAddress(token, existing.id, data);
      } else {
        await api.createAddress(token, data);
      }
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

  const locationSummary = [district, city].filter(Boolean).join(', ');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.sectionTitle}>Етикет</Text>
        <View style={styles.chipRow}>
          {LABEL_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={label === opt}
              onPress={() => { setLabel(opt); setCustomLabel(''); }}
              style={[styles.chip, label === opt && styles.chipSelected]}
              textStyle={label === opt ? styles.chipTextSelected : undefined}
            >
              {opt}
            </Chip>
          ))}
          <Chip
            selected={!LABEL_OPTIONS.includes(label)}
            onPress={() => setLabel('custom')}
            style={[styles.chip, !LABEL_OPTIONS.includes(label) && styles.chipSelected]}
            textStyle={!LABEL_OPTIONS.includes(label) ? styles.chipTextSelected : undefined}
          >
            Друго
          </Chip>
        </View>
        {!LABEL_OPTIONS.includes(label) && (
          <>
            <TextInput
              label="Име на адреса"
              mode="outlined"
              value={customLabel}
              onChangeText={setCustomLabel}
              autoCorrect={false}
              style={styles.input}
            />
            <View style={styles.spacer} />
          </>
        )}

        <Text style={styles.sectionTitle}>Местоположение</Text>
        {locationSummary ? (
          <View style={styles.locationBar}>
            <Text style={styles.locationText} numberOfLines={1}>{locationSummary}</Text>
            <Button
              mode="contained"
              onPress={handleGetLocation}
              loading={geoLoading}
              disabled={geoLoading}
              buttonColor={theme.colors.primary}
              compact
            >
              Редактирай местоположение
            </Button>
          </View>
        ) : (
          <Button
            mode="outlined"
            icon="crosshairs-gps"
            onPress={handleGetLocation}
            loading={geoLoading}
            disabled={geoLoading}
            style={styles.geoButton}
            textColor={theme.colors.primary}
          >
            Текущо местоположение
          </Button>
        )}

        <TextInput
          label="Град *"
          mode="outlined"
          value={city}
          onChangeText={setCity}
          autoCorrect={false}
          error={!!fieldErrors.city}
          style={styles.input}
        />
        <HelperText type="error" visible={!!fieldErrors.city}>
          {fieldErrors.city?.[0]}
        </HelperText>

        <View style={styles.row}>
          <TextInput
            label="Пощ. код"
            mode="outlined"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.gap} />
          <TextInput
            label="Район"
            mode="outlined"
            value={district}
            onChangeText={setDistrict}
            autoCorrect={false}
            style={[styles.input, styles.flex2]}
          />
        </View>
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Информация за адреса</Text>

        <TextInput
          label="Улица, номер"
          mode="outlined"
          value={street}
          onChangeText={setStreet}
          autoCorrect={false}
          style={styles.input}
        />
        <View style={styles.spacer} />

        <View style={styles.row}>
          <TextInput
            label="Блок"
            mode="outlined"
            value={block}
            onChangeText={setBlock}
            autoCorrect={false}
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.gap} />
          <TextInput
            label="Вход"
            mode="outlined"
            value={entrance}
            onChangeText={setEntrance}
            autoCorrect={false}
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.gap} />
          <TextInput
            label="Етаж"
            mode="outlined"
            value={floor}
            onChangeText={setFloor}
            autoCorrect={false}
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.gap} />
          <TextInput
            label="Ап./Звънец"
            mode="outlined"
            value={apartment}
            onChangeText={setApartment}
            autoCorrect={false}
            style={[styles.input, styles.flex1]}
          />
        </View>
        <View style={styles.spacer} />

        <View style={styles.elevatorRow}>
          <Text style={styles.elevatorLabel}>Асансьор</Text>
          <View style={styles.segmented}>
            <Pressable
              style={[styles.segmentedBtn, hasElevator && styles.segmentedBtnActive]}
              onPress={() => setHasElevator(true)}
            >
              <Text style={[styles.segmentedText, hasElevator && styles.segmentedTextActive]}>Да</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentedBtn, !hasElevator && styles.segmentedBtnActive]}
              onPress={() => setHasElevator(false)}
            >
              <Text style={[styles.segmentedText, !hasElevator && styles.segmentedTextActive]}>Не</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Коментар към адреса</Text>
        <TextInput
          mode="outlined"
          value={notes}
          onChangeText={(text) => setNotes(text.slice(0, MAX_NOTES))}
          multiline
          numberOfLines={3}
          autoCorrect={false}
          placeholder="Пример: 'Не звънете по телефона', 'Звънете на домофона', 'Входът е от дясно'"
          style={styles.input}
        />
        <Text style={styles.charCounter}>{MAX_NOTES - notes.length}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Лице за контакт</Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <TextInput
              label="Собствено име *"
              mode="outlined"
              value={contactFirstName}
              onChangeText={setContactFirstName}
              autoCapitalize="words"
              autoCorrect={false}
              error={!!fieldErrors.contact_first_name || !!fieldErrors.contact_name}
              style={styles.input}
            />
            <HelperText type="error" visible={!!fieldErrors.contact_first_name || !!fieldErrors.contact_name}>
              {fieldErrors.contact_first_name?.[0] || fieldErrors.contact_name?.[0]}
            </HelperText>
          </View>
          <View style={styles.gap} />
          <View style={styles.flex1}>
            <TextInput
              label="Фамилно име *"
              mode="outlined"
              value={contactLastName}
              onChangeText={setContactLastName}
              autoCapitalize="words"
              autoCorrect={false}
              error={!!fieldErrors.contact_last_name}
              style={styles.input}
            />
            <HelperText type="error" visible={!!fieldErrors.contact_last_name}>
              {fieldErrors.contact_last_name?.[0]}
            </HelperText>
          </View>
        </View>

        <TextInput
          label="Телефон *"
          mode="outlined"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          autoCorrect={false}
          error={!!fieldErrors.contact_phone}
          style={styles.input}
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
        />
        <HelperText type="error" visible={!!fieldErrors.contact_phone}>
          {fieldErrors.contact_phone?.[0]}
        </HelperText>

        <View style={styles.defaultRow}>
          <Pressable
            style={[styles.defaultToggle, isDefault && styles.defaultToggleActive]}
            onPress={() => setIsDefault((v) => !v)}
          >
            <Text style={[styles.defaultToggleText, isDefault && styles.defaultToggleTextActive]}>
              {isDefault ? 'Адрес по подразбиране' : 'Задай като адрес по подразбиране'}
            </Text>
          </Pressable>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor={theme.colors.primary}
        >
          {isEdit ? 'Обнови адрес' : 'Запази адрес'}
        </Button>
      </ScrollView>

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
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  geoButton: {
    marginBottom: 16,
    borderColor: theme.colors.primary,
  },
  input: {
    marginBottom: 0,
    backgroundColor: theme.colors.surface,
  },
  spacer: {
    height: 12,
  },
  row: {
    flexDirection: 'row',
  },
  gap: {
    width: 10,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  elevatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  elevatorLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  segmentedBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
  },
  segmentedBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  segmentedTextActive: {
    color: '#fff',
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 13,
    color: theme.colors.primary,
    marginTop: 4,
  },
  defaultRow: {
    marginBottom: 16,
  },
  defaultToggle: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  defaultToggleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  defaultToggleText: {
    fontSize: 15,
    color: '#999',
  },
  defaultToggleTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
});

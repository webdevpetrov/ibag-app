import { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/client';
import theme from '../../config/theme';
import { formatDate, formatFullDate } from '../../utils/dates';
import { COMPLAINT_STATUS, RESOLUTION_LABELS } from '../../config/complaints';

export default function ComplaintDetailScreen({ route, navigation }) {
  const { complaintId } = route.params;
  const { token } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getComplaint(token, complaintId);
        setComplaint(data.data ?? data);
      } catch (err) {
        setError(err.message || 'Грешка при зареждане.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, complaintId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !complaint) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Рекламацията не е намерена.'}</Text>
        <Button mode="text" onPress={() => navigation.goBack()}>Назад</Button>
      </View>
    );
  }

  const status = COMPLAINT_STATUS[complaint.status] || COMPLAINT_STATUS.pending;
  const { day, month } = formatDate(complaint.created_at);
  const resolutionLabel = RESOLUTION_LABELS[complaint.desired_resolution] || complaint.desired_resolution;
  const images = complaint.images ?? [];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.list}>
      <View style={styles.dateBanner}>
        <Text style={styles.dateDay}>{day}</Text>
        <View>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Дата:</Text>
          <Text style={styles.infoValue}>{formatFullDate(complaint.created_at)}</Text>
        </View>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Статус:</Text>
          <Text style={[styles.infoValueBold, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Поръчка:</Text>
          <Text style={styles.infoValueBold}>#{complaint.order_id}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Тема</Text>
        <Text style={styles.subjectText}>{complaint.subject}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Описание</Text>
        <Text style={styles.descriptionText}>{complaint.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Желано решение</Text>
        <Text style={styles.resolutionText}>{resolutionLabel}</Text>
      </View>

      {images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Снимки</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.url }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {complaint.admin_notes && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Отговор</Text>
            <View style={styles.responseBox}>
              <MaterialCommunityIcons name="message-reply-text-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.responseText}>{complaint.admin_notes}</Text>
            </View>
          </View>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 16,
  },
  dateDay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },
  infoCell: {
    minWidth: '30%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  infoValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  resolutionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  imagesScroll: {
    marginTop: 4,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  divider: {
    marginVertical: 4,
  },
  responseBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  responseText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

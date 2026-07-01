import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/auth';
import { formatNotification, getNotifications, Notification } from '../../lib/api';

export default function InboxScreen() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getNotifications(token)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Inbox</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver notificaciones</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => login(email, password).catch(() => {})}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Actividad</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.read && styles.unread]}>
            <Text style={styles.itemText}>{formatNotification(item)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sin notificaciones aún</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  unread: { backgroundColor: '#eff6ff' },
  itemText: { fontSize: 15, color: '#1f2937' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});

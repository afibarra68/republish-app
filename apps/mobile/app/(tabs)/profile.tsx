import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/auth';
import { getUserPosts, Post } from '../../lib/api';

export default function ProfileScreen() {
  const { token, user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user?.profile.username) return;
    setLoadingPosts(true);
    getUserPosts(user.profile.username)
      .then((res) => setPosts(res.items))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [user?.profile.username]);

  if (!token || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Perfil</Text>
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
        {mode === 'register' && (
          <>
            <TextInput style={styles.input} placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Nombre" value={displayName} onChangeText={setDisplayName} />
          </>
        )}
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            mode === 'login'
              ? login(email, password).catch(() => {})
              : register(email, password, username, displayName).catch(() => {})
          }
        >
          <Text style={styles.buttonText}>{mode === 'login' ? 'Entrar' : 'Registrarse'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switch}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>@{user.profile.username}</Text>
      <Text style={styles.displayName}>{user.profile.displayName}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>{user.profile.postCount} posts</Text>
        <Text style={styles.stat}>{user.profile.followerCount} seguidores</Text>
        <Text style={styles.stat}>{user.profile.followingCount} siguiendo</Text>
      </View>
      <TouchableOpacity onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      <Text style={styles.gridTitle}>Publicaciones</Text>
      {loadingPosts ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          numColumns={3}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Link href={`/post/${item._id}`} style={styles.gridItem}>
              <Text numberOfLines={2} style={styles.gridCaption}>{item.caption}</Text>
            </Link>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aún no has publicado nada</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, paddingHorizontal: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  switch: { marginTop: 16, textAlign: 'center', color: '#2563eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e5e7eb', alignSelf: 'center' },
  name: { marginTop: 12, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  displayName: { textAlign: 'center', color: '#6b7280' },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  stat: { color: '#374151' },
  logout: { alignSelf: 'center', marginTop: 12 },
  logoutText: { color: '#ef4444' },
  gridTitle: { marginTop: 24, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  gridItem: { flex: 1, margin: 2, padding: 8, minHeight: 90, backgroundColor: '#f3f4f6', borderRadius: 6 },
  gridCaption: { fontSize: 11, color: '#374151' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});

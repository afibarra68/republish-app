import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { api, Post, FeedResponse } from '../../lib/api';

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<FeedResponse>('/explore/trending')
      .then((res) => setPosts(res.items))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explorar</Text>
      <FlatList
        data={posts}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Link href={`/post/${item._id}`} style={styles.gridItem}>
            <Text numberOfLines={2}>{item.caption}</Text>
            {item.commerce && <Text style={styles.price}>${item.commerce.price}</Text>}
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, padding: 8 },
  header: { fontSize: 24, fontWeight: '700', padding: 8 },
  gridItem: { flex: 1, margin: 4, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, minHeight: 100 },
  price: { marginTop: 8, fontWeight: '700', color: '#2563eb' },
});

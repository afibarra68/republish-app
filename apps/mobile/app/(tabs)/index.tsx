import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { getFeed, Post } from '../../lib/api';
import { useAuth } from '../../context/auth';

function PostCard({ post }: { post: Post }) {
  const image = post.media?.[0]?.url;
  return (
    <Link href={`/post/${post._id}`} asChild>
      <TouchableOpacity style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        <View style={styles.body}>
          <Text style={styles.author}>{post.authorSnapshot.displayName}</Text>
          <Text style={styles.caption} numberOfLines={2}>{post.caption}</Text>
          {post.commerce && (
            <Text style={styles.price}>
              ${post.commerce.price} {post.commerce.currency} · {post.commerce.category}
            </Text>
          )}
          <Text style={styles.stats}>
            {post.likeCount} likes · {post.saveCount} saved
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function HomeScreen() {
  const { token } = useAuth();
  const [feedType, setFeedType] = useState<'for-you' | 'following'>('for-you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFeed(feedType, token || undefined)
      .then((res) => setPosts(res.items))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [feedType, token]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Publish</Text>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setFeedType('for-you')}>
          <Text style={[styles.tab, feedType === 'for-you' && styles.tabActive]}>Para ti</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFeedType('following')}>
          <Text style={[styles.tab, feedType === 'following' && styles.tabActive]}>Siguiendo</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {feedType === 'following'
                ? 'Sigue vendedores para ver su feed aquí'
                : 'No posts yet. Publish from Cursor!'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', gap: 24, paddingHorizontal: 16, paddingVertical: 12 },
  tab: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  tabActive: { color: '#2563eb', fontWeight: '700' },
  card: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9fafb' },
  image: { width: '100%', height: 200 },
  placeholder: { backgroundColor: '#e5e7eb' },
  body: { padding: 12 },
  author: { fontWeight: '600', fontSize: 14 },
  caption: { marginTop: 4, color: '#374151' },
  price: { marginTop: 8, fontWeight: '700', color: '#2563eb' },
  stats: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});

import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPost, Post, recordView } from '../../lib/api';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) {
      getPost(id).then(setPost).catch(() => setPost(null));
      recordView(id).catch(() => {});
    }
  }, [id]);

  if (!post) return <ActivityIndicator style={{ marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container}>
      {post.media?.[0]?.url && (
        <Image source={{ uri: post.media[0].url }} style={styles.image} />
      )}
      <View style={styles.body}>
        <Text style={styles.author}>{post.authorSnapshot.displayName}</Text>
        <Text style={styles.caption}>{post.caption}</Text>
        {post.commerce && (
          <View style={styles.commerce}>
            <Text style={styles.price}>${post.commerce.price} {post.commerce.currency}</Text>
            <Text>{post.commerce.category} · {post.commerce.commerceType}</Text>
          </View>
        )}
        <Text style={styles.stats}>
          {post.likeCount} likes · {post.commentCount} comments · {post.saveCount} saved
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Contactar vendedor</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  body: { padding: 16 },
  author: { fontWeight: '700', fontSize: 16 },
  caption: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  commerce: { marginTop: 16, padding: 12, backgroundColor: '#eff6ff', borderRadius: 8 },
  price: { fontSize: 22, fontWeight: '700', color: '#2563eb' },
  stats: { marginTop: 16, color: '#6b7280' },
  cta: { marginTop: 24, backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

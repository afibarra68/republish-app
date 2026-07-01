import { View, Text, StyleSheet } from 'react-native';

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publicar desde Cursor</Text>
      <Text style={styles.text}>
        Usa el MCP server de Publish en Cursor para publicar con un prompt y fotos.
      </Text>
      <Text style={styles.steps}>
        1. Escribe tu venta en Cursor{'\n'}
        2. Adjunta fotos{'\n'}
        3. IA genera el anuncio{'\n'}
        4. Confirma → live en el feed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  text: { fontSize: 16, color: '#374151', lineHeight: 24 },
  steps: { marginTop: 24, fontSize: 16, lineHeight: 28, color: '#1f2937' },
});

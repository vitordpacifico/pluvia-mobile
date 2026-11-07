import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 10, marginBottom: 16 },
  item: { flexDirection: 'row', gap: 12 },
  pressionado: { opacity: 0.7 },
  miniatura: { width: 72, height: 72, borderRadius: raio.m, backgroundColor: cores.borda },
  texto: { flex: 1, gap: 4 },
  titulo: { fontSize: 17, fontWeight: '700', color: cores.texto },
  ia: { fontSize: 15, fontWeight: '700', color: cores.primaria },
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
});

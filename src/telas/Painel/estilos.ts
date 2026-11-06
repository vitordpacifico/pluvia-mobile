import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contador: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: raio.m,
    padding: 12,
    gap: 6,
  },
  numero: { fontSize: 32, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  textoItem: { flex: 1, fontSize: 16, color: cores.texto },
  acaoSimulacao: { gap: 8 },
});

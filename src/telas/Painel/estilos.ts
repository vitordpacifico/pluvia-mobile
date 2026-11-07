import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contador: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: raio.m,
    padding: 12,
    gap: 4,
  },
  numero: { fontSize: 32, fontWeight: '800' },
  rotuloContador: { fontSize: 14, fontWeight: '700' },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  nivel: { fontSize: 22, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
});

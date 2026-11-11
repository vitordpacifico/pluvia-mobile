import { StyleSheet } from 'react-native';

import { cores, raio, sombra } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contador: {
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: raio.g,
    padding: 14,
    gap: 6,
    backgroundColor: cores.superficie,
    ...sombra,
  },
  iconeContador: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numero: { fontSize: 28, fontWeight: '800', color: cores.texto },
  rotuloContador: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto },
  nivel: { fontSize: 22, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
});

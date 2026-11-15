import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detalhe: { flexShrink: 1, fontSize: 15, lineHeight: 21, color: cores.textoSecundario },
  explicacao: { fontSize: 15, lineHeight: 22, color: cores.texto },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.m, backgroundColor: cores.borda },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeCabecalho: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
  },
  categoria: { fontSize: 20, fontWeight: '800', color: cores.primaria },
  linhaConfianca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  valorConfianca: { fontSize: 16, fontWeight: '800', color: cores.texto },
  trilhoConfianca: { height: 8, borderRadius: 999, backgroundColor: cores.superficieSuave, overflow: 'hidden' },
  barraConfianca: { height: 8, borderRadius: 999, backgroundColor: cores.primaria },
  nota: { fontSize: 13, lineHeight: 19, color: cores.textoSecundario },
  pista: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  textoPista: { flex: 1, fontSize: 15, lineHeight: 21, color: cores.textoSecundario },
  pistaReforca: { color: cores.sucesso, fontWeight: '700' },
});

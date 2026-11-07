import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.m, backgroundColor: cores.borda },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pressionado: { opacity: 0.7 },
  relatoTitulo: { fontSize: 17, fontWeight: '700', color: cores.texto },
  status: { fontSize: 15, fontWeight: '700', color: cores.primaria },
});

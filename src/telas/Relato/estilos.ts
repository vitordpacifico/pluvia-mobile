import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  detalhe: { fontSize: 15, color: cores.textoSecundario },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.m, backgroundColor: cores.borda },
  categoria: { fontSize: 20, fontWeight: '800', color: cores.primaria },
  nota: { fontSize: 13, color: cores.textoSecundario },
  pista: { fontSize: 15, color: cores.textoSecundario },
  pistaReforca: { color: cores.sucesso, fontWeight: '700' },
});

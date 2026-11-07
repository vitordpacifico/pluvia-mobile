import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 10, marginBottom: 16 },
  vazio: { fontSize: 16, color: cores.textoSecundario, lineHeight: 23 },
  naoLido: { borderColor: cores.primaria, borderWidth: 2 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipo: { fontSize: 14, fontWeight: '700', color: cores.primaria },
  titulo: { fontSize: 17, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 15, lineHeight: 21, color: cores.texto },
  detalhe: { fontSize: 13, color: cores.textoSecundario },
});

import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  local: { fontSize: 18, fontWeight: '700', color: cores.texto },
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  consulta: { gap: 8 },
  nota: { fontSize: 13, color: cores.textoSecundario },
});

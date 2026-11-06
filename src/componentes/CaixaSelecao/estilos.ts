import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, minHeight: ALVO_MINIMO_TOQUE },
  texto: { flex: 1, fontSize: 15, lineHeight: 21, color: cores.texto, paddingTop: 2 },
  erro: { fontSize: 15, color: cores.perigo, fontWeight: '600' },
});

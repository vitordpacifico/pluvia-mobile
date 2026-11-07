import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { gap: 10 },
  nivel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texto: { flex: 1, fontSize: 16, color: cores.texto },
});

import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  marca: { alignItems: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 },
  nomeApp: { fontSize: 32, fontWeight: '800', color: cores.primaria, letterSpacing: 1 },
  slogan: { fontSize: 17, lineHeight: 24, color: cores.texto, textAlign: 'center' },
  botoesDemo: { gap: 10 },
});

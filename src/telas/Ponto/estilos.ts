import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  endereco: { fontSize: 15, color: cores.textoSecundario },
  nivel: { fontSize: 40, fontWeight: '800', color: cores.texto },
  orientacao: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  limite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textoLimite: { fontSize: 16, color: cores.texto },
});

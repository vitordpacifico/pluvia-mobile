import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  nome: { fontSize: 17, fontWeight: '700', color: cores.texto },
  detalhe: { fontSize: 15, color: cores.textoSecundario, lineHeight: 21 },
});

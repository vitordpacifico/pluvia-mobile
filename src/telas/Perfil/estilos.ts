import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  formulario: { gap: 14 },
  dado: { gap: 2 },
  rotuloDado: { fontSize: 14, color: cores.textoSecundario },
  valorDado: { fontSize: 17, color: cores.texto, fontWeight: '600' },
  seguido: { gap: 8 },
  nomeSeguido: { fontSize: 16, color: cores.texto },
});

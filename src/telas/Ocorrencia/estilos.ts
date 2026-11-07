import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  endereco: { fontSize: 16, color: cores.textoSecundario },
  distancia: { fontSize: 16, fontWeight: '700', color: cores.primaria },
  explicacao: { fontSize: 16, lineHeight: 23, color: cores.texto },
  dado: { fontSize: 15, color: cores.textoSecundario },
  mudanca: { gap: 2, paddingVertical: 4 },
  mudancaHora: { fontSize: 14, fontWeight: '700', color: cores.texto },
  mudancaTexto: { fontSize: 15, color: cores.textoSecundario },
});

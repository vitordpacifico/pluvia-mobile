import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 10, marginBottom: 16 },
  vazio: { fontSize: 16, color: cores.textoSecundario, lineHeight: 23 },
  cartaoTexto: { gap: 6 },
  ponto: { fontSize: 18, fontWeight: '700', color: cores.texto },
  detalhe: { fontSize: 15, color: cores.textoSecundario },
  orientacao: { fontSize: 15, color: cores.texto },
  confirmado: { fontSize: 15, color: cores.sucesso, fontWeight: '600' },
});

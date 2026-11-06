import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 10, marginBottom: 16 },
  subtitulo: { fontSize: 16, color: cores.textoSecundario },
  consulta: { fontSize: 13, color: cores.textoSecundario },
  vazio: { fontSize: 16, color: cores.textoSecundario, textAlign: 'center', marginTop: 32 },
});

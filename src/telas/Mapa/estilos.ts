import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 12, marginBottom: 12 },
  subtitulo: { fontSize: 16, color: cores.textoSecundario },
  linhaCentro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  centro: { fontSize: 16, color: cores.textoSecundario, flex: 1 },
  centroNome: { fontWeight: '700', color: cores.texto },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: raio.g,
    backgroundColor: cores.primaria,
  },
  resumoNumero: { fontSize: 34, fontWeight: '800', color: cores.textoSobrePrimaria },
  resumoTexto: { fontSize: 16, fontWeight: '600', color: cores.textoSobrePrimaria, flex: 1 },
  botoes: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  risco: { gap: 6 },
  riscoTexto: { fontSize: 15, color: cores.texto },
  nota: { fontSize: 13, color: cores.textoSecundario },
  consulta: { fontSize: 13, color: cores.textoSecundario },
  vazio: { fontSize: 16, color: cores.textoSecundario, textAlign: 'center', marginTop: 16 },
  rodape: { gap: 16, marginTop: 20 },
});

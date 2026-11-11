import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  principal: { overflow: 'hidden', paddingTop: 22 },
  faixaEstado: { position: 'absolute', top: 0, left: 0, right: 0, height: 6 },
  linhaLocal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  endereco: { flex: 1, fontSize: 15, color: cores.textoSecundario },
  chipDistancia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: cores.primariaSuave,
  },
  distancia: { fontSize: 14, fontWeight: '700', color: cores.primaria },
  explicacao: { fontSize: 15, lineHeight: 22, color: cores.texto },
  dado: { fontSize: 14, lineHeight: 20, color: cores.textoSecundario },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeInfo: {
    width: 38,
    height: 38,
    borderRadius: raio.p + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
  },
  textoInfo: { flex: 1 },
  rotuloInfo: { fontSize: 12, fontWeight: '700', color: cores.textoSecundario },
  valorInfo: { fontSize: 15, color: cores.texto },
  mudanca: { flexDirection: 'row', gap: 12 },
  trilho: { alignItems: 'center', width: 16 },
  bolinha: { width: 14, height: 14, borderRadius: 999, marginTop: 3, borderWidth: 3 },
  bolinhaAtiva: { borderColor: '#E53935', backgroundColor: '#FDECEE' },
  bolinhaEncerrada: { borderColor: '#43A047', backgroundColor: '#E8F5E9' },
  linhaTempo: { flex: 1, width: 2, backgroundColor: cores.borda, marginVertical: 2 },
  mudancaCorpo: { flex: 1, paddingBottom: 16, gap: 2 },
  mudancaHora: { fontSize: 14, fontWeight: '700', color: cores.texto },
  mudancaTexto: { fontSize: 14, lineHeight: 20, color: cores.textoSecundario },
});

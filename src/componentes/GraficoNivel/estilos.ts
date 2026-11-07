import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const ALTURA_GRAFICO = 160;

export const estilos = StyleSheet.create({
  area: {
    height: ALTURA_GRAFICO,
    borderBottomWidth: 1,
    borderColor: cores.borda,
    justifyContent: 'flex-end',
  },
  barras: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: ALTURA_GRAFICO },
  barra: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  linha: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.textoSecundario,
  },
  rotuloLinha: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.texto,
    alignSelf: 'flex-start',
    marginTop: -9,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  eixo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  textoEixo: { fontSize: 12, color: cores.textoSecundario },
  vazio: { fontSize: 15, color: cores.textoSecundario },
});

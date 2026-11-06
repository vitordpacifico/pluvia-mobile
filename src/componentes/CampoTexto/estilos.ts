import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  campo: { gap: 6 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  dica: { fontSize: 14, color: cores.textoSecundario },
  linhaEntrada: { flexDirection: 'row', alignItems: 'center' },
  entrada: {
    flex: 1,
    minHeight: ALVO_MINIMO_TOQUE,
    borderWidth: 1,
    borderColor: cores.textoSecundario,
    borderRadius: raio.m,
    paddingHorizontal: 12,
    fontSize: 17,
    color: cores.texto,
    backgroundColor: cores.superficie,
  },
  entradaComErro: { borderColor: cores.perigo, borderWidth: 2 },
  botaoMostrar: {
    minWidth: ALVO_MINIMO_TOQUE,
    minHeight: ALVO_MINIMO_TOQUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  erro: { fontSize: 15, color: cores.perigo, fontWeight: '600' },
});

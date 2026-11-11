import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  campo: { gap: 6 },
  rotulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  dica: { fontSize: 13, lineHeight: 18, color: cores.textoSecundario },
  linhaEntrada: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: raio.m,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
  },
  linhaFocada: { borderColor: cores.primaria, backgroundColor: cores.superficie },
  linhaComErro: { borderColor: cores.perigo, backgroundColor: cores.perigoSuave },
  entrada: {
    flex: 1,
    minHeight: ALVO_MINIMO_TOQUE + 4,
    paddingHorizontal: 16,
    fontSize: 16,
    color: cores.texto,
    outlineWidth: 0,
  },
  botaoMostrar: {
    minWidth: ALVO_MINIMO_TOQUE,
    minHeight: ALVO_MINIMO_TOQUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  erro: { fontSize: 14, color: cores.perigo, fontWeight: '600' },
});

import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 10 },
  rotulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  escolhido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: raio.m,
    backgroundColor: cores.sucessoSuave,
  },
  textoEscolhido: { fontSize: 15, fontWeight: '700', color: cores.sucesso, flex: 1 },
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: ALVO_MINIMO_TOQUE - 4,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipMarcado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoChip: { fontSize: 14, fontWeight: '700', color: cores.texto },
  textoChipMarcado: { color: cores.textoSobrePrimaria },
  vazio: { fontSize: 14, color: cores.textoSecundario },
  erro: { fontSize: 14, fontWeight: '600', color: cores.erroTexto },
});

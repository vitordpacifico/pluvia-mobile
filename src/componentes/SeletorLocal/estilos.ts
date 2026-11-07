import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 10 },
  rotulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  escolhido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  textoEscolhido: { fontSize: 16, fontWeight: '600', color: cores.texto, flex: 1 },
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: ALVO_MINIMO_TOQUE,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipMarcado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoChip: { fontSize: 15, fontWeight: '600', color: cores.texto },
  textoChipMarcado: { color: cores.textoSobrePrimaria },
  vazio: { fontSize: 15, color: cores.textoSecundario },
  erro: { fontSize: 14, fontWeight: '600', color: cores.erroTexto },
});

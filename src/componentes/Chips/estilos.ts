import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 8 },
  rotulo: { fontSize: 14, fontWeight: '700', color: cores.textoSecundario },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  texto: { fontSize: 14, fontWeight: '700', color: cores.texto },
  textoMarcado: { color: cores.textoSobrePrimaria },
});

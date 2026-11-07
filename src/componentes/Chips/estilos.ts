import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 6 },
  rotulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: ALVO_MINIMO_TOQUE,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: cores.primaria,
    backgroundColor: cores.superficie,
  },
  chipMarcado: { backgroundColor: cores.primaria },
  texto: { fontSize: 15, fontWeight: '700', color: cores.primaria },
  textoMarcado: { color: cores.textoSobrePrimaria },
});

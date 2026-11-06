import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  botao: {
    minHeight: ALVO_MINIMO_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: raio.m,
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.superficie, borderWidth: 2, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.superficie, borderWidth: 2, borderColor: cores.perigo },
  link: { backgroundColor: 'transparent' },
  atenuado: { opacity: 0.6 },
  texto: { fontSize: 16, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  textoLink: { textDecorationLine: 'underline' },
});

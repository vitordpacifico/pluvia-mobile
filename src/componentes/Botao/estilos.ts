import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  botao: {
    minHeight: ALVO_MINIMO_TOQUE + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: raio.m,
  },
  primario: { backgroundColor: cores.primaria, boxShadow: '0 4px 12px rgba(1, 42, 208, 0.25)' },
  secundario: { backgroundColor: cores.primariaSuave },
  perigo: { backgroundColor: cores.perigoSuave },
  link: { backgroundColor: 'transparent', minHeight: ALVO_MINIMO_TOQUE, paddingHorizontal: 8 },
  atenuado: { opacity: 0.6 },
  texto: { fontSize: 16, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  textoLink: { textDecorationLine: 'underline' },
});

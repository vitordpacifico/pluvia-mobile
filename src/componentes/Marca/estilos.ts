import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: raio.g,
    backgroundColor: cores.primaria,
  },
  nome: { fontSize: 40, fontWeight: '800', color: cores.textoSobrePrimaria },
});

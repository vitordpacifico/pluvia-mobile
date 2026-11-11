import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
  textoNumero: { fontSize: 14, fontWeight: '800', color: cores.textoSobrePrimaria },
  titulo: { flex: 1, fontSize: 17, fontWeight: '800', color: cores.texto },
});

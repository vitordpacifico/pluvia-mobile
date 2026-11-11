import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio, sombra } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  cartao: {
    minHeight: ALVO_MINIMO_TOQUE,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raio.g,
    padding: 14,
    ...sombra,
  },
  pressionado: { opacity: 0.75 },
  icone: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  corpo: { flex: 1, gap: 6 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titulo: { fontSize: 16, fontWeight: '700', color: cores.texto, flex: 1 },
  distancia: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.primaria,
    backgroundColor: cores.primariaSuave,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  endereco: { fontSize: 14, color: cores.textoSecundario },
  rodape: { fontSize: 12, color: cores.textoSecundario },
  seta: { alignSelf: 'center' },
});

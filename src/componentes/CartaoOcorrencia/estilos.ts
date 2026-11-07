import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  cartao: {
    minHeight: ALVO_MINIMO_TOQUE,
    backgroundColor: cores.superficie,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    gap: 8,
  },
  pressionado: { opacity: 0.7 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, flex: 1 },
  distancia: { fontSize: 15, fontWeight: '700', color: cores.primaria },
  endereco: { fontSize: 15, color: cores.textoSecundario },
  rodape: { fontSize: 13, color: cores.textoSecundario },
});

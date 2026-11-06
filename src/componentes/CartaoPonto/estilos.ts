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
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  nome: { fontSize: 18, fontWeight: '700', color: cores.texto, flex: 1 },
  endereco: { fontSize: 14, color: cores.textoSecundario },
  // flexWrap evita que o texto saia do cartao com a fonte do celular aumentada.
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nivel: { fontSize: 16, fontWeight: '600', color: cores.texto },
  atualizacao: { fontSize: 13, color: cores.textoSecundario },
  antigo: { color: cores.avisoTexto, fontWeight: '700' },
});

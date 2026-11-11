import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: { gap: 10, marginBottom: 16 },
  cartao: { flexDirection: 'row', alignItems: 'flex-start' },
  pressionado: { opacity: 0.75 },
  icone: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  corpo: { flex: 1, gap: 4 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tipo: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  naoLido: { width: 10, height: 10, borderRadius: 999, backgroundColor: cores.primaria },
  titulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 14, lineHeight: 20, color: cores.texto },
  detalhe: { fontSize: 12, color: cores.textoSecundario },
});

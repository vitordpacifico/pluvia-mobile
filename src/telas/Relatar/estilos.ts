import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  detalhe: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: raio.m, backgroundColor: cores.borda },
  areaFoto: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: raio.m,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.borda,
    backgroundColor: cores.superficieSuave,
  },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pressionado: { opacity: 0.75 },
  relato: { flexDirection: 'row', alignItems: 'center' },
  relatoCorpo: { flex: 1, gap: 6 },
  relatoTitulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  chipStatus: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  status: { fontSize: 13, fontWeight: '700' },
});

import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
  iniciais: { fontSize: 24, fontWeight: '800', color: cores.textoSobrePrimaria },
  identidade: { flex: 1, gap: 6 },
  nome: { fontSize: 20, fontWeight: '800', color: cores.texto },
  chipPerfil: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: cores.primariaSuave,
  },
  textoPerfil: { fontSize: 13, fontWeight: '700', color: cores.primaria },
  formulario: { gap: 14 },
  dado: { gap: 2 },
  rotuloDado: { fontSize: 14, color: cores.textoSecundario },
  valorDado: { fontSize: 17, color: cores.texto, fontWeight: '600' },
  seguido: { gap: 8 },
  nomeSeguido: { fontSize: 16, color: cores.texto },
});

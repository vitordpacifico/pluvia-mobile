import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 8 },
  rotulo: { fontSize: 15, fontWeight: '700', color: cores.texto },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcao: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: ALVO_MINIMO_TOQUE,
    borderWidth: 2,
    borderColor: cores.borda,
    borderRadius: raio.m,
    padding: 14,
    gap: 4,
    backgroundColor: cores.superficie,
  },
  opcaoMarcada: { backgroundColor: cores.primariaSuave, borderColor: cores.primaria },
  textoOpcao: { fontSize: 16, fontWeight: '700', color: cores.texto },
  descricao: { fontSize: 13, lineHeight: 18, color: cores.textoSecundario },
  textoMarcado: { color: cores.primaria },
});

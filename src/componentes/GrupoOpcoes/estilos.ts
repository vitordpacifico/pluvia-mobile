import { StyleSheet } from 'react-native';

import { ALVO_MINIMO_TOQUE, cores, raio } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  grupo: { gap: 6 },
  rotulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcao: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: ALVO_MINIMO_TOQUE,
    borderWidth: 2,
    borderColor: cores.primaria,
    borderRadius: raio.m,
    padding: 12,
    gap: 2,
    backgroundColor: cores.superficie,
  },
  opcaoMarcada: { backgroundColor: cores.primaria },
  textoOpcao: { fontSize: 17, fontWeight: '700', color: cores.primaria },
  descricao: { fontSize: 14, color: cores.texto },
  textoMarcado: { color: cores.textoSobrePrimaria },
});

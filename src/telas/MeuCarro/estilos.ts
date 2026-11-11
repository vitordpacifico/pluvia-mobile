import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  topoCarro: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconeCarro: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.sucessoSuave,
  },
  iconeCarroAlerta: { backgroundColor: cores.perigoSuave },
  textoCarro: { flex: 1, gap: 2 },
  rotuloCarro: { fontSize: 13, fontWeight: '700', color: cores.textoSecundario },
  local: { fontSize: 17, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  consulta: { gap: 8 },
  nota: { fontSize: 13, color: cores.textoSecundario },
});

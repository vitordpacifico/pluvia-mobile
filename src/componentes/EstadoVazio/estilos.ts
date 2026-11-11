import { StyleSheet } from 'react-native';

import { cores } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  vazio: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 24 },
  icone: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
    marginBottom: 4,
  },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: 14, lineHeight: 20, color: cores.textoSecundario, textAlign: 'center' },
});

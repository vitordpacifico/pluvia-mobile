import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 1,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  seloGrande: { paddingHorizontal: 14, paddingVertical: 7, gap: 7 },
  texto: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  textoGrande: { fontSize: 16 },
});

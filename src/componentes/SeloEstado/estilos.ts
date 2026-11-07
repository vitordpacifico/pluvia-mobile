import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 1,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  seloGrande: { paddingHorizontal: 14, paddingVertical: 9, gap: 8 },
  texto: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  textoGrande: { fontSize: 18 },
});

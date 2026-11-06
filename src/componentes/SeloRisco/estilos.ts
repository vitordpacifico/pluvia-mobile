import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  seloGrande: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  texto: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  textoGrande: { fontSize: 22 },
});

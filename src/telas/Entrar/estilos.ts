import { StyleSheet } from 'react-native';

import { cores, espaco } from '@/estilos/tema';

export const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.primaria },
  rolagem: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingBottom: espaco.g + espaco.p },
  topo: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 40,
    paddingBottom: 72,
    paddingHorizontal: 28,
    backgroundColor: cores.primaria,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  slogan: { fontSize: 16, lineHeight: 23, color: '#DCE6FF', textAlign: 'center', fontWeight: '500' },
  cartaoLogin: { marginTop: -48, marginHorizontal: espaco.m },
  cartaoDemo: { marginTop: espaco.m, marginHorizontal: espaco.m },
  botoesDemo: { gap: 10 },
  rodape: { marginTop: espaco.m, marginHorizontal: espaco.g },
});

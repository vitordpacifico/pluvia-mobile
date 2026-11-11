import { StyleSheet } from 'react-native';

import { cores, espaco, raio, sombra } from './tema';

export const estilosComuns = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.m, gap: espaco.m, paddingBottom: espaco.g + espaco.p },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.g,
    padding: 18,
    gap: 12,
    ...sombra,
  },
  titulo: { fontSize: 26, fontWeight: '800', color: cores.texto, letterSpacing: -0.3 },
  tituloSecao: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 23, color: cores.texto },
  legenda: { fontSize: 15, lineHeight: 21, color: cores.textoSecundario },
  rodape: { fontSize: 13, lineHeight: 19, color: cores.textoSecundario, textAlign: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: espaco.m },
  separador: { height: 12 },
});

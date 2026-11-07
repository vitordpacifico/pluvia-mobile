import { StyleSheet } from 'react-native';

import { cores, espaco, raio } from './tema';

export const estilosComuns = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.m, gap: espaco.m, paddingBottom: espaco.g + espaco.p },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.m,
    gap: 10,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto },
  tituloSecao: { fontSize: 18, fontWeight: '700', color: cores.texto },
  texto: { fontSize: 16, lineHeight: 23, color: cores.texto },
  legenda: { fontSize: 15, color: cores.textoSecundario },
  rodape: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: espaco.m },
  separador: { height: 12 },
});

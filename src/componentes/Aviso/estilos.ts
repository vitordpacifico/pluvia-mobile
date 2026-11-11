import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const CORES_AVISO = {
  info: { fundo: cores.infoFundo, texto: cores.infoTexto, icone: 'information-outline' },
  aviso: { fundo: cores.avisoFundo, texto: cores.avisoTexto, icone: 'alert-circle-outline' },
  erro: { fundo: cores.erroFundo, texto: cores.erroTexto, icone: 'close-circle-outline' },
  sucesso: { fundo: cores.sucessoSuave, texto: cores.sucesso, icone: 'check-circle-outline' },
} as const;

export const estilos = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: raio.m,
    alignItems: 'flex-start',
  },
  texto: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});

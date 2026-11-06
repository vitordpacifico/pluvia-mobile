import { StyleSheet } from 'react-native';

import { cores, raio } from '@/estilos/tema';

export const CORES_AVISO = {
  info: { fundo: cores.infoFundo, texto: cores.infoTexto, icone: 'information-outline' },
  aviso: { fundo: cores.avisoFundo, texto: cores.avisoTexto, icone: 'alert-circle' },
  erro: { fundo: cores.erroFundo, texto: cores.erroTexto, icone: 'close-circle' },
  sucesso: { fundo: '#E8F5E9', texto: cores.sucesso, icone: 'check-circle' },
} as const;

export const estilos = StyleSheet.create({
  aviso: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: raio.m, alignItems: 'flex-start' },
  texto: { flex: 1, fontSize: 15, lineHeight: 21 },
});

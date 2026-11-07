import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { Aviso } from '@/dominio/local';

const CANAL_AVISOS = 'avisos-alagamento';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarCanalDeAlertas(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_AVISOS, {
    name: 'Avisos de alagamento',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 400, 200, 400],
  });
}

export async function notificacoesPermitidas(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function pedirPermissaoDeNotificacao(): Promise<boolean> {
  if (await notificacoesPermitidas()) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function notificarAviso(aviso: Aviso): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: aviso.titulo,
      body: aviso.texto,
      data: aviso.ocorrenciaId ? { ocorrenciaId: aviso.ocorrenciaId } : {},
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_AVISOS } : null,
  });
}

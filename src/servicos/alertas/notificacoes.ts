import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { INFO_RISCO } from '@/dominio/risco';
import type { PontoMonitorado } from '@/dominio/tipos';

const CANAL_ALERTAS = 'alertas-alagamento';

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
  await Notifications.setNotificationChannelAsync(CANAL_ALERTAS, {
    name: 'Alertas de alagamento',
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

export async function notificarMudancaDeRisco(ponto: PontoMonitorado): Promise<void> {
  const info = INFO_RISCO[ponto.risco];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${info.rotulo}: ${ponto.nome}`,
      body: `Água em ${ponto.nivelAtualCm.toFixed(0)} cm. ${info.orientacao}`,
      data: { pontoId: ponto.id },
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_ALERTAS } : null,
  });
}

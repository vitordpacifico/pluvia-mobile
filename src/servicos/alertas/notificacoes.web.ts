import { router } from 'expo-router';

import type { Aviso } from '@/dominio/local';

function suportado(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function configurarCanalDeAlertas(): Promise<void> {}

export async function notificacoesPermitidas(): Promise<boolean> {
  return suportado() && Notification.permission === 'granted';
}

export async function pedirPermissaoDeNotificacao(): Promise<boolean> {
  if (!suportado()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function notificarAviso(aviso: Aviso): Promise<void> {
  if (!(await notificacoesPermitidas())) return;
  const notificacao = new Notification(aviso.titulo, { body: aviso.texto, tag: aviso.chave });
  notificacao.onclick = () => {
    window.focus();
    if (aviso.ocorrenciaId) router.push({ pathname: '/ocorrencia/[id]', params: { id: aviso.ocorrenciaId } });
    notificacao.close();
  };
}

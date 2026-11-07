import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';

import { calcularAvisos } from '@/dominio/avisos';
import type { Aviso } from '@/dominio/local';
import type { Ocorrencia } from '@/dominio/ocorrencia';
import type { RiscoEstimado } from '@/dominio/riscoEstimado';
import {
  lerEstadoConhecido,
  lerPreferencias,
  registrarAvisos,
  salvarEstadoConhecido,
} from '@/servicos/armazenamento/avisosServico';
import { listarLocais } from '@/servicos/armazenamento/locaisServico';
import { formatarHoraCurta } from '@/utilitarios/formato';

import { notificacoesPermitidas, notificarAviso } from './notificacoes';

export async function verificarAvisos(
  usuarioId: string,
  ocorrencias: Ocorrencia[],
  riscos: RiscoEstimado[],
  agora: () => Date = () => new Date(),
): Promise<Aviso[]> {
  const [locais, preferencias, conhecido] = await Promise.all([
    listarLocais(usuarioId),
    lerPreferencias(usuarioId),
    lerEstadoConhecido(usuarioId),
  ]);
  const resultado = calcularAvisos({
    locais,
    preferencias,
    ocorrencias,
    riscos,
    conhecido,
    agora: agora(),
    formatarHora: formatarHoraCurta,
  });
  await salvarEstadoConhecido(usuarioId, resultado.conhecido);
  const registrados = await registrarAvisos(usuarioId, resultado.avisos);
  if (registrados.length === 0 || preferencias.silenciado) return registrados;

  const podeNotificar = await notificacoesPermitidas().catch(() => false);
  for (const aviso of registrados) {
    if (podeNotificar) await notificarAviso(aviso).catch(() => undefined);
    AccessibilityInfo.announceForAccessibility(`${aviso.titulo}. ${aviso.texto}`);
  }
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  return registrados;
}

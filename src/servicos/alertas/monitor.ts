import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';

import { gravidade, INFO_RISCO } from '@/dominio/risco';
import type { PontoMonitorado } from '@/dominio/tipos';
import { registrarAlerta } from '@/servicos/armazenamento/alertasServico';
import {
  atualizarUltimoRisco,
  listarPontosSeguidos,
} from '@/servicos/armazenamento/pontosSeguidosServico';

import { notificacoesPermitidas, notificarMudancaDeRisco } from './notificacoes';

/**
 * Compara o risco de cada ponto seguido com o último risco conhecido.
 * Quando piora, registra o alerta, notifica, vibra e avisa o leitor de tela.
 * Devolve quantos alertas novos foram criados.
 */
export async function verificarPontosSeguidos(
  usuarioId: string,
  pontos: PontoMonitorado[],
  agora: () => Date = () => new Date(),
): Promise<number> {
  const seguidos = await listarPontosSeguidos(usuarioId);
  let novos = 0;

  for (const seguido of seguidos) {
    const ponto = pontos.find((p) => p.id === seguido.pontoId);
    if (!ponto || ponto.risco === seguido.ultimoRisco) continue;

    await atualizarUltimoRisco(usuarioId, ponto.id, ponto.risco);
    if (gravidade(ponto.risco) <= gravidade(seguido.ultimoRisco)) continue;

    await registrarAlerta(usuarioId, {
      pontoId: ponto.id,
      pontoNome: ponto.nome,
      risco: ponto.risco,
      nivelCm: ponto.nivelAtualCm,
      detectadoEm: ponto.riscoDetectadoEm ?? ponto.atualizadoEm,
      recebidoEm: agora().toISOString(),
    });
    novos++;

    if (await notificacoesPermitidas().catch(() => false)) await notificarMudancaDeRisco(ponto);
    await Haptics.notificationAsync(
      ponto.risco === 'EVACUACAO'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => undefined);
    AccessibilityInfo.announceForAccessibility(
      `${INFO_RISCO[ponto.risco].rotulo} em ${ponto.nome}. ${INFO_RISCO[ponto.risco].orientacao}`,
    );
  }
  return novos;
}

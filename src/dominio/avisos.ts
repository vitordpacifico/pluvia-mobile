import { distanciaMetros, formatarDistancia } from './geo';
import type { Aviso, LocalMonitorado, PreferenciasAviso } from './local';
import { textoEncerramento, type Ocorrencia, type StatusOcorrencia } from './ocorrencia';
import { AVISO_INCERTEZA, type FaixaRisco, type RiscoEstimado } from './riscoEstimado';

export interface EstadoConhecido {
  iniciado: boolean;
  ocorrencias: Record<string, StatusOcorrencia>;
  riscos: Record<string, FaixaRisco>;
}

export const ESTADO_INICIAL: EstadoConhecido = { iniciado: false, ocorrencias: {}, riscos: {} };

export type NovoAviso = Omit<Aviso, 'id' | 'lidoEm'>;

interface Entrada {
  locais: readonly LocalMonitorado[];
  preferencias: PreferenciasAviso;
  ocorrencias: readonly Ocorrencia[];
  riscos: readonly RiscoEstimado[];
  conhecido: EstadoConhecido;
  agora: Date;
  formatarHora: (iso: string) => string;
}

function localMaisProximo(
  locais: readonly LocalMonitorado[],
  alvo: Ocorrencia['local'],
  folgaM = 0,
): { local: LocalMonitorado; distanciaM: number } | null {
  let melhor: { local: LocalMonitorado; distanciaM: number } | null = null;
  for (const local of locais) {
    const distanciaM = distanciaMetros(local.local, alvo);
    if (distanciaM > local.raioM + folgaM) continue;
    if (!melhor || distanciaM < melhor.distanciaM) melhor = { local, distanciaM };
  }
  return melhor;
}

export function calcularAvisos({
  locais,
  preferencias,
  ocorrencias,
  riscos,
  conhecido,
  agora,
  formatarHora,
}: Entrada): { avisos: NovoAviso[]; conhecido: EstadoConhecido } {
  const avisos: NovoAviso[] = [];
  const proximo: EstadoConhecido = {
    iniciado: true,
    ocorrencias: { ...conhecido.ocorrencias },
    riscos: { ...conhecido.riscos },
  };
  const recebidoEm = agora.toISOString();

  for (const ocorrencia of ocorrencias) {
    const anterior = conhecido.ocorrencias[ocorrencia.id];
    proximo.ocorrencias[ocorrencia.id] = ocorrencia.status;
    if (!conhecido.iniciado || anterior === ocorrencia.status) continue;

    const perto = localMaisProximo(locais, ocorrencia.local);
    if (!perto) continue;
    const onde = `${ocorrencia.referencia}, ${ocorrencia.bairro}, a ${formatarDistancia(perto.distanciaM)} de ${perto.local.nome}`;

    if (anterior === undefined && ocorrencia.status === 'ATIVO' && preferencias.novos) {
      const comunitario = ocorrencia.fonte.tipo === 'COMUNIDADE';
      avisos.push({
        tipo: 'NOVO',
        chave: `NOVO:${ocorrencia.id}`,
        titulo: `${comunitario ? 'Possível alagamento' : 'Alagamento'} perto de ${perto.local.nome}`,
        texto: `${ocorrencia.titulo}: ${onde}. Fonte: ${ocorrencia.fonte.nome}, às ${formatarHora(ocorrencia.registradaEm)}.`,
        ocorrenciaId: ocorrencia.id,
        localId: perto.local.id,
        detectadoEm: ocorrencia.registradaEm,
        recebidoEm,
      });
    }

    if (anterior === 'ATIVO' && ocorrencia.status === 'ENCERRADO' && preferencias.encerramentos) {
      avisos.push({
        tipo: 'ENCERRADO',
        chave: `ENCERRADO:${ocorrencia.id}`,
        titulo: `Ocorrência encerrada perto de ${perto.local.nome}`,
        texto: `${ocorrencia.titulo}: ${onde}. ${textoEncerramento(ocorrencia, formatarHora) ?? ''}`.trim(),
        ocorrenciaId: ocorrencia.id,
        localId: perto.local.id,
        detectadoEm: ocorrencia.encerradaEm ?? ocorrencia.atualizadaEm,
        recebidoEm,
      });
    }
  }

  for (const risco of riscos) {
    const anterior = conhecido.riscos[risco.id];
    proximo.riscos[risco.id] = risco.faixa;
    if (!conhecido.iniciado || anterior === risco.faixa || risco.faixa !== 'ELEVADO') continue;
    if (!preferencias.riscoElevado) continue;

    const perto = localMaisProximo(locais, risco.centro, risco.raioM);
    if (!perto) continue;
    avisos.push({
      tipo: 'RISCO',
      chave: `RISCO:${risco.id}:${risco.calculadoEm}`,
      titulo: `Risco estimado elevado perto de ${perto.local.nome}`,
      texto: `${risco.bairro}: ${risco.motivo} ${AVISO_INCERTEZA}`,
      ocorrenciaId: null,
      localId: perto.local.id,
      detectadoEm: risco.calculadoEm,
      recebidoEm,
    });
  }

  return { avisos, conhecido: proximo };
}

export function tempoAteReceber(aviso: Pick<Aviso, 'detectadoEm' | 'recebidoEm'>): number {
  return Math.max(0, Date.parse(aviso.recebidoEm) - Date.parse(aviso.detectadoEm));
}

export function mediaTempoAteReceber(avisos: readonly Aviso[]): number | null {
  const considerados = avisos.filter((a) => a.tipo === 'NOVO');
  if (considerados.length === 0) return null;
  return considerados.reduce((soma, a) => soma + tempoAteReceber(a), 0) / considerados.length;
}

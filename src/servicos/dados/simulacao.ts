import { aplicarRegraDeConfirmacao } from '@/dominio/risco';
import { nivelPelaDistancia } from '@/dominio/sensor';
import type { FonteDeDados, Leitura, LimitesRisco, PontoMonitorado } from '@/dominio/tipos';
import { CHAVES, lerJSON, salvarJSON } from '@/servicos/armazenamento/armazenamento';

/**
 * Simulacao IoT, usada enquanto a API em C# e o ESP32 nao estao ligados ao app.
 *
 * Cada ponto imita um ESP32 com sensor ultrassonico preso a 2,5 m do chao. A cada 10 s o
 * "sensor" mede a distancia ate a agua, com um pequeno ruido, e o nivel e calculado como
 * altura de instalacao - distancia. A regra das duas leituras seguidas define o risco.
 *
 * Nomes, enderecos, limites e niveis sao ficticios.
 */

const INTERVALO_LEITURA_MS = 10_000;
const LEITURAS_POR_CONSULTA = 40;
const DURACAO_CHUVA_S = 360;
const ALTURA_INSTALACAO_CM = 250;
const NIVEL_SEM_CHUVA_CM = 2;

/**
 * Chuva forte em 6 minutos: normal ate 30 s, sobe ate 48 cm aos 150 s,
 * fica parada ate 210 s, desce ate 300 s e volta ao normal.
 */
function nivelDaChuvaForte(segundos: number): number {
  if (segundos < 0) return NIVEL_SEM_CHUVA_CM;
  if (segundos < 30) return 3;
  if (segundos < 150) return 3 + ((segundos - 30) * 45) / 120;
  if (segundos < 210) return 48;
  if (segundos < 300) return 48 - ((segundos - 210) * 45) / 90;
  return 3;
}

interface Chuva {
  inicio: number;
  /** A chuva do Ponto A se repete, para sempre haver o que demonstrar. */
  repetir: boolean;
}

interface PontoSimulado {
  id: string;
  nome: string;
  endereco: string;
  regiao: string;
  /** Simula um sensor que parou de enviar leituras ha este tempo. */
  semSinalHaMs?: number;
}

const LIMITES_PADRAO: LimitesRisco = { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 };

export const PONTOS_SIMULADOS: readonly PontoSimulado[] = [
  { id: 'demo-a', nome: 'Ponto de demonstração A', endereco: 'Endereço a definir', regiao: 'São Paulo, SP' },
  { id: 'demo-b', nome: 'Ponto de demonstração B', endereco: 'Endereço a definir', regiao: 'São Paulo, SP' },
  {
    id: 'demo-c',
    nome: 'Ponto de demonstração C',
    endereco: 'Endereço a definir',
    regiao: 'São Paulo, SP',
    semSinalHaMs: 2 * 60 * 60_000,
  },
];

const chuvas = new Map<string, Chuva>();
let limitesPersonalizados: Record<string, LimitesRisco> = {};
let carregamentoDosLimites: Promise<void> | null = null;

/** Recomeca do zero: so o Ponto A tem chuva, que comeca agora. */
export function reiniciarSimulacao(): void {
  chuvas.clear();
  chuvas.set('demo-a', { inicio: Date.now(), repetir: true });
}
reiniciarSimulacao();

/** Acao do agente: comeca agora uma chuva forte, de 6 minutos, no ponto escolhido. */
export function simularChuvaForte(pontoId: string): void {
  if (!PONTOS_SIMULADOS.some((p) => p.id === pontoId)) throw new Error('Ponto não encontrado.');
  chuvas.set(pontoId, { inicio: Date.now(), repetir: false });
}

/** Os limites ajustados pelo agente ficam salvos no celular. */
function carregarLimites(): Promise<void> {
  carregamentoDosLimites ??= lerJSON<Record<string, LimitesRisco>>(CHAVES.limitesSimulacao, {})
    .then((salvos) => {
      limitesPersonalizados = { ...salvos, ...limitesPersonalizados };
    })
    .catch(() => undefined);
  return carregamentoDosLimites;
}

function limitesDe(pontoId: string): LimitesRisco {
  return limitesPersonalizados[pontoId] ?? LIMITES_PADRAO;
}

function nivelReal(pontoId: string, instante: number): number {
  const chuva = chuvas.get(pontoId);
  if (!chuva) return NIVEL_SEM_CHUVA_CM;
  let segundos = (instante - chuva.inicio) / 1000;
  if (chuva.repetir && segundos >= 0) segundos %= DURACAO_CHUVA_S;
  return nivelDaChuvaForte(segundos);
}

/** Pequena oscilacao, como a de um sensor real, sem alterar o nivel de risco. */
function ruido(instante: number): number {
  return Math.sin(instante / 7000) * 0.4;
}

/** O que o sensor mediria: a distancia entre ele e a superficie da agua. */
function medirDistancia(pontoId: string, instante: number): number {
  return ALTURA_INSTALACAO_CM - nivelReal(pontoId, instante) + ruido(instante);
}

function gerarLeituras(ponto: PontoSimulado, agora: number): Leitura[] {
  const ultimoInstante = agora - (ponto.semSinalHaMs ?? 0);
  const ultimoPasso = Math.floor(ultimoInstante / INTERVALO_LEITURA_MS);
  const leituras: Leitura[] = [];

  for (let i = LEITURAS_POR_CONSULTA - 1; i >= 0; i--) {
    const instante = (ultimoPasso - i) * INTERVALO_LEITURA_MS;
    const nivel = nivelPelaDistancia(ALTURA_INSTALACAO_CM, medirDistancia(ponto.id, instante));
    leituras.push({
      pontoId: ponto.id,
      nivelCm: Math.round(nivel * 10) / 10,
      medidoEm: new Date(instante).toISOString(),
    });
  }
  return leituras;
}

function montarPonto(ponto: PontoSimulado, agora: number): PontoMonitorado {
  const limites = limitesDe(ponto.id);
  const leituras = gerarLeituras(ponto, agora);
  const ultima = leituras[leituras.length - 1];
  const { risco, detectadoEm } = aplicarRegraDeConfirmacao(leituras, limites);
  return {
    id: ponto.id,
    nome: ponto.nome,
    endereco: ponto.endereco,
    regiao: ponto.regiao,
    nivelAtualCm: ultima.nivelCm,
    risco,
    riscoDetectadoEm: detectadoEm,
    atualizadoEm: ultima.medidoEm,
    limites,
  };
}

/** Atraso artificial, para o app tambem lidar com o tempo de resposta de uma rede. */
function aguardar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

function buscarPonto(pontoId: string): PontoSimulado {
  const ponto = PONTOS_SIMULADOS.find((p) => p.id === pontoId);
  if (!ponto) throw new Error('Ponto não encontrado.');
  return ponto;
}

export const fonteSimulada: FonteDeDados = {
  simulada: true,

  async listarPontos() {
    await Promise.all([carregarLimites(), aguardar(300)]);
    const agora = Date.now();
    return PONTOS_SIMULADOS.map((ponto) => montarPonto(ponto, agora));
  },

  async listarLeituras(pontoId) {
    await aguardar(300);
    return gerarLeituras(buscarPonto(pontoId), Date.now()).slice(-18);
  },

  async registrarConfirmacao() {
    await aguardar(300);
  },

  async atualizarLimites(pontoId, limites) {
    buscarPonto(pontoId);
    await carregarLimites();
    limitesPersonalizados = { ...limitesPersonalizados, [pontoId]: limites };
    await salvarJSON(CHAVES.limitesSimulacao, limitesPersonalizados);
  },
};

import { aplicarRegraDeConfirmacao } from '@/dominio/risco';
import { nivelPelaDistancia } from '@/dominio/sensor';
import type { FonteDeDados, Leitura, LimitesRisco, PontoMonitorado } from '@/dominio/tipos';
import { CHAVES, lerJSON, salvarJSON } from '@/servicos/armazenamento/armazenamento';

/**
 * Simulação IoT, usada enquanto a API em C# e o ESP32 não estão ligados ao app.
 *
 * Cada ponto imita um ESP32 com sensor ultrassônico preso a 2,5 m do chão. A cada 10 s o
 * "sensor" mede a distância até a água, com um pequeno ruído, e o nível é calculado como
 * altura de instalação - distância. A regra das duas leituras seguidas define o risco.
 *
 * Nomes, endereços, limites e níveis são fictícios.
 */

const INTERVALO_LEITURA_MS = 10_000;
const LEITURAS_POR_CONSULTA = 40;
const DURACAO_CHUVA_S = 360;
const ALTURA_INSTALACAO_CM = 250;
const NIVEL_SEM_CHUVA_CM = 2;

/**
 * Chuva forte em 6 minutos: normal até 30 s, sobe até 48 cm aos 150 s,
 * fica parada até 210 s, desce até 300 s e volta ao normal.
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
  /** Simula um sensor que parou de enviar leituras há este tempo. */
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
let carregamento: Promise<void> | null = null;
/** Verdadeiro quando o agente mexeu na simulação antes de o estado salvo ser lido. */
let alteradaNestaSessao = false;

/** Situação inicial: só o Ponto A tem chuva, que começa agora. */
function definirChuvaPadrao(): void {
  chuvas.clear();
  chuvas.set('demo-a', { inicio: Date.now(), repetir: true });
}
definirChuvaPadrao();

function salvarChuvas(): void {
  salvarJSON(CHAVES.chuvasSimulacao, Object.fromEntries(chuvas)).catch(() => undefined);
}

/** Recomeça do zero e apaga as chuvas simuladas pelo agente. */
export function reiniciarSimulacao(): void {
  alteradaNestaSessao = true;
  definirChuvaPadrao();
  salvarChuvas();
}

/** Ação do agente: começa agora uma chuva forte, de 6 minutos, no ponto escolhido. */
export function simularChuvaForte(pontoId: string): void {
  if (!PONTOS_SIMULADOS.some((p) => p.id === pontoId)) throw new Error('Ponto não encontrado.');
  alteradaNestaSessao = true;
  chuvas.set(pontoId, { inicio: Date.now(), repetir: false });
  salvarChuvas();
}

function ehChuva(valor: unknown): valor is Chuva {
  if (typeof valor !== 'object' || valor === null) return false;
  const chuva = valor as Record<string, unknown>;
  return typeof chuva.inicio === 'number' && typeof chuva.repetir === 'boolean';
}

/**
 * Lê uma única vez o que ficou salvo no celular: os limites ajustados pelo agente e as chuvas
 * em andamento. Assim a simulação continua de onde parou quando o app é aberto de novo.
 */
function carregarEstadoSalvo(): Promise<void> {
  carregamento ??= Promise.all([
    lerJSON<Record<string, LimitesRisco>>(CHAVES.limitesSimulacao, {}),
    lerJSON<Record<string, unknown> | null>(CHAVES.chuvasSimulacao, null),
  ])
    .then(([limites, chuvasSalvas]) => {
      limitesPersonalizados = { ...limites, ...limitesPersonalizados };
      if (!chuvasSalvas || alteradaNestaSessao) return;
      chuvas.clear();
      for (const [pontoId, chuva] of Object.entries(chuvasSalvas)) {
        if (ehChuva(chuva)) chuvas.set(pontoId, chuva);
      }
    })
    .catch(() => undefined);
  return carregamento;
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

/** Pequena oscilação, como a de um sensor real, sem alterar o nível de risco. */
function ruido(instante: number): number {
  return Math.sin(instante / 7000) * 0.4;
}

/** O que o sensor mediria: a distância entre ele e a superfície da água. */
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

/** Atraso artificial, para o app também lidar com o tempo de resposta de uma rede. */
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
    await Promise.all([carregarEstadoSalvo(), aguardar(300)]);
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
    await carregarEstadoSalvo();
    limitesPersonalizados = { ...limitesPersonalizados, [pontoId]: limites };
    await salvarJSON(CHAVES.limitesSimulacao, limitesPersonalizados);
  },
};

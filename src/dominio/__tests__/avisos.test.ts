import { calcularAvisos, ESTADO_INICIAL, mediaTempoAteReceber, type EstadoConhecido } from '../avisos';
import { PREFERENCIAS_PADRAO, type Aviso } from '../local';
import { local, ocorrencia, risco, VILA_MARIANA } from '@/testes/fabricas';

const AGORA = new Date('2026-11-07T15:00:00Z');
const hora = (iso: string) => iso.slice(11, 16);

function calcular(entrada: Partial<Parameters<typeof calcularAvisos>[0]> = {}) {
  return calcularAvisos({
    locais: [local()],
    preferencias: PREFERENCIAS_PADRAO,
    ocorrencias: [],
    riscos: [],
    conhecido: { ...ESTADO_INICIAL, iniciado: true },
    agora: AGORA,
    formatarHora: hora,
    ...entrada,
  });
}

it('na primeira verificação só registra o que já existe, sem avisar', () => {
  const { avisos, conhecido } = calcular({ ocorrencias: [ocorrencia()], conhecido: ESTADO_INICIAL });
  expect(avisos).toEqual([]);
  expect(conhecido).toEqual({ iniciado: true, ocorrencias: { o1: 'ATIVO' }, riscos: {} });
});

it('avisa um alagamento novo dentro do raio de um local', () => {
  const nova = ocorrencia({ registradaEm: '2026-11-07T14:59:30Z' });
  const { avisos } = calcular({ ocorrencias: [nova] });
  expect(avisos).toHaveLength(1);
  expect(avisos[0]).toMatchObject({
    tipo: 'NOVO',
    chave: 'NOVO:o1',
    titulo: 'Alagamento perto de Meu carro',
    ocorrenciaId: 'o1',
    localId: 'carro',
    detectadoEm: '2026-11-07T14:59:30Z',
    recebidoEm: '2026-11-07T15:00:00.000Z',
  });
  expect(avisos[0].texto).toContain('a 260 m de Meu carro');
});

it('chama o relato comunitário de possível alagamento', () => {
  const comunitaria = ocorrencia({ fonte: { tipo: 'COMUNIDADE', nome: 'Relato comunitário verificado' } });
  expect(calcular({ ocorrencias: [comunitaria] }).avisos[0].titulo).toBe('Possível alagamento perto de Meu carro');
});

it('não avisa o que está fora do raio', () => {
  expect(calcular({ ocorrencias: [ocorrencia({ local: VILA_MARIANA })] }).avisos).toEqual([]);
});

it('avisa o encerramento sem dizer que a via está liberada', () => {
  const conhecido: EstadoConhecido = { iniciado: true, ocorrencias: { o1: 'ATIVO' }, riscos: {} };
  const encerrada = ocorrencia({ status: 'ENCERRADO', encerradaEm: '2026-11-07T14:50:00Z' });
  const { avisos } = calcular({ ocorrencias: [encerrada], conhecido });
  expect(avisos[0]).toMatchObject({ tipo: 'ENCERRADO', detectadoEm: '2026-11-07T14:50:00Z' });
  expect(avisos[0].texto).toContain('Isso não garante que a via esteja liberada.');
});

it('não repete o aviso quando a situação não muda', () => {
  const conhecido: EstadoConhecido = { iniciado: true, ocorrencias: { o1: 'ATIVO' }, riscos: {} };
  expect(calcular({ ocorrencias: [ocorrencia()], conhecido }).avisos).toEqual([]);
});

it('avisa quando o risco estimado sobe para elevado perto de um local', () => {
  const conhecido: EstadoConhecido = { iniciado: true, ocorrencias: {}, riscos: { r1: 'MODERADO' } };
  const { avisos } = calcular({ riscos: [risco({ faixa: 'ELEVADO' })], conhecido });
  expect(avisos[0]).toMatchObject({ tipo: 'RISCO', titulo: 'Risco estimado elevado perto de Meu carro' });
  expect(avisos[0].texto).toContain('pode mudar rapidamente');
});

it('respeita os tipos de aviso que a pessoa desligou', () => {
  const preferencias = { ...PREFERENCIAS_PADRAO, novos: false, riscoElevado: false };
  const resultado = calcular({ preferencias, ocorrencias: [ocorrencia()], riscos: [risco({ faixa: 'ELEVADO' })] });
  expect(resultado.avisos).toEqual([]);
  expect(resultado.conhecido.ocorrencias.o1).toBe('ATIVO');
});

it('calcula o tempo médio só dos avisos de alagamento novo', () => {
  const aviso = (tipo: Aviso['tipo'], segundos: number): Aviso => ({
    id: `${tipo}${segundos}`,
    tipo,
    chave: '',
    titulo: '',
    texto: '',
    ocorrenciaId: null,
    localId: 'carro',
    detectadoEm: '2026-11-07T15:00:00Z',
    recebidoEm: new Date(Date.parse('2026-11-07T15:00:00Z') + segundos * 1000).toISOString(),
    lidoEm: null,
  });
  expect(mediaTempoAteReceber([])).toBeNull();
  expect(mediaTempoAteReceber([aviso('NOVO', 10), aviso('NOVO', 30), aviso('ENCERRADO', 999)])).toBe(20_000);
});

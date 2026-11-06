import { criarFonteHttp } from '../api';

const PONTO_VALIDO = {
  id: 'p1',
  nome: 'Ponto 1',
  endereco: 'Rua A, 10',
  regiao: 'Centro, São Paulo, SP',
  nivelAtualCm: 14.5,
  risco: 'ATENCAO',
  riscoDetectadoEm: '2026-11-05T14:00:50Z',
  atualizadoEm: '2026-11-05T14:01:00Z',
  limites: { atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 },
};

function responder(status: number, corpo: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  }) as jest.Mock;
}

const api = criarFonteHttp('https://api.exemplo.com/');

afterEach(() => jest.restoreAllMocks());

describe('listarPontos', () => {
  it('le uma resposta valida e monta a URL sem barra dupla', async () => {
    responder(200, [PONTO_VALIDO]);
    const pontos = await api.listarPontos();
    expect(pontos).toEqual([PONTO_VALIDO]);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe('https://api.exemplo.com/api/pontos');
  });

  it('aceita riscoDetectadoEm ausente', async () => {
    responder(200, [{ ...PONTO_VALIDO, riscoDetectadoEm: undefined }]);
    expect((await api.listarPontos())[0].riscoDetectadoEm).toBeNull();
  });

  it('recusa um risco desconhecido', async () => {
    responder(200, [{ ...PONTO_VALIDO, risco: 'PERIGO' }]);
    await expect(api.listarPontos()).rejects.toThrow('campo "risco"');
  });

  it('recusa um numero invalido', async () => {
    responder(200, [{ ...PONTO_VALIDO, nivelAtualCm: '14' }]);
    await expect(api.listarPontos()).rejects.toThrow('campo "nivelAtualCm"');
  });

  it('recusa uma resposta que nao e lista', async () => {
    responder(200, { erro: 'x' });
    await expect(api.listarPontos()).rejects.toThrow('era esperada uma lista');
  });

  it('explica o erro de HTTP', async () => {
    responder(503, null);
    await expect(api.listarPontos()).rejects.toThrow('código 503');
  });
});

it('ordena as leituras pela data', async () => {
  responder(200, [
    { pontoId: 'p1', nivelCm: 2, medidoEm: '2026-11-05T14:00:20Z' },
    { pontoId: 'p1', nivelCm: 1, medidoEm: '2026-11-05T14:00:10Z' },
  ]);
  const leituras = await api.listarLeituras('p1');
  expect(leituras.map((l) => l.nivelCm)).toEqual([1, 2]);
});

it('envia a confirmacao de seguranca por POST', async () => {
  responder(204, null);
  await api.registrarConfirmacao('p1', '2026-11-05T14:03:12Z');
  const [url, opcoes] = (globalThis.fetch as jest.Mock).mock.calls[0];
  expect(url).toBe('https://api.exemplo.com/api/confirmacoes');
  expect(opcoes.method).toBe('POST');
  expect(JSON.parse(opcoes.body)).toEqual({ pontoId: 'p1', confirmadoEm: '2026-11-05T14:03:12Z' });
});

it('envia os novos limites por PUT', async () => {
  responder(204, null);
  await api.atualizarLimites('p 1', { atencaoCm: 12, alertaCm: 30, evacuacaoCm: 45 });
  const [url, opcoes] = (globalThis.fetch as jest.Mock).mock.calls[0];
  expect(url).toBe('https://api.exemplo.com/api/pontos/p%201/limites');
  expect(opcoes.method).toBe('PUT');
  expect(JSON.parse(opcoes.body)).toEqual({ atencaoCm: 12, alertaCm: 30, evacuacaoCm: 45 });
});

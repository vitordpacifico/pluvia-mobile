import { criarFonteHttp } from '../api';

const OCORRENCIA = {
  id: 'oc-1',
  titulo: 'Alagamento na via',
  bairro: 'Ipiranga',
  referencia: 'Rua Silva Bueno, 1000',
  local: { latitude: -23.5893, longitude: -46.6047 },
  fonte: { tipo: 'OFICIAL', nome: 'CGE-SP' },
  status: 'ATIVO',
  registradaEm: '2026-11-07T14:20:00Z',
  atualizadaEm: '2026-11-07T14:55:00Z',
  encerradaEm: null,
  historico: [{ status: 'ATIVO', em: '2026-11-07T14:20:00Z', descricao: 'Registrada.' }],
};

const RELATO = {
  id: 'rel-1',
  autorId: 'u1',
  tipo: 'RUA_ALAGADA',
  descricao: '',
  bairro: 'Cambuci',
  referencia: 'Rua Lavapés',
  local: { latitude: -23.5679, longitude: -46.6178 },
  ocorridoEm: '2026-11-07T14:55:00Z',
  enviadoEm: '2026-11-07T14:56:00Z',
  fotoUrl: 'https://api.exemplo.com/fotos/1.jpg',
  triagem: { categoria: 'INDICIO', confianca: 0.84, analisadaEm: '2026-11-07T14:56:01Z' },
  status: 'EM_ANALISE',
  revisadoEm: null,
  motivoRecusa: null,
  ocorrenciaId: null,
};

function responder(...corpos: { status?: number; corpo: unknown }[]) {
  const mock = jest.fn();
  for (const { status = 200, corpo } of corpos) {
    mock.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => corpo });
  }
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

const api = criarFonteHttp('https://api.exemplo.com/');

describe('listarOcorrencias', () => {
  it('lê uma resposta válida e monta a URL sem barra dupla', async () => {
    const fetch = responder({ corpo: [OCORRENCIA] });
    expect(await api.listarOcorrencias()).toEqual([OCORRENCIA]);
    expect(fetch.mock.calls[0][0]).toBe('https://api.exemplo.com/ocorrencias');
  });

  it('recusa status, fonte ou coordenada inválidos', async () => {
    responder({ corpo: [{ ...OCORRENCIA, status: 'ALAGADO' }] });
    await expect(api.listarOcorrencias()).rejects.toThrow('campo "status"');
    responder({ corpo: [{ ...OCORRENCIA, fonte: { tipo: 'TWITTER', nome: 'x' } }] });
    await expect(api.listarOcorrencias()).rejects.toThrow('campo "tipo"');
    responder({ corpo: [{ ...OCORRENCIA, local: { latitude: '-23' } }] });
    await expect(api.listarOcorrencias()).rejects.toThrow('campo "latitude"');
  });

  it('recusa uma resposta que não é lista e explica erros HTTP', async () => {
    responder({ corpo: { erro: true } });
    await expect(api.listarOcorrencias()).rejects.toThrow('era esperada uma lista');
    responder({ status: 503, corpo: null });
    await expect(api.listarOcorrencias()).rejects.toThrow('código 503');
  });
});

it('lê os riscos estimados e recusa faixa desconhecida', async () => {
  const risco = {
    id: 'r1',
    bairro: 'Cambuci',
    centro: { latitude: -23.56, longitude: -46.62 },
    raioM: 900,
    faixa: 'ELEVADO',
    calculadoEm: '2026-11-07T15:00:00Z',
    validoAte: '2026-11-07T16:00:00Z',
    motivo: 'Chuva forte.',
  };
  responder({ corpo: [risco] });
  expect(await api.listarRiscos()).toEqual([risco]);
  responder({ corpo: [{ ...risco, faixa: 'ALTISSIMO' }] });
  await expect(api.listarRiscos()).rejects.toThrow('campo "faixa"');
});

it('envia a foto para análise e depois o relato com o id da foto', async () => {
  const fetch = responder({ corpo: { fotoId: 'foto-1' } }, { corpo: RELATO });
  const { autorId: _autor, id: _id, enviadoEm: _env, triagem: _t, status: _s, revisadoEm: _r, motivoRecusa: _m, ocorrenciaId: _o, fotoUrl: _f, ...novo } = RELATO;
  const relato = await api.enviarRelato('u1', { ...novo, tipo: 'RUA_ALAGADA', fotoUri: 'file:///foto.jpg' });

  expect(fetch.mock.calls[0][0]).toBe('https://api.exemplo.com/fotos/analise');
  expect(fetch.mock.calls[1][0]).toBe('https://api.exemplo.com/relatos');
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({ autorId: 'u1', fotoId: 'foto-1' });
  expect(relato).toMatchObject({ id: 'rel-1', status: 'EM_ANALISE', triagem: { categoria: 'INDICIO', simulada: false } });
});

it('filtra os relatos pela query string e revisa um relato', async () => {
  const fetch = responder({ corpo: [RELATO] }, { corpo: { ...RELATO, status: 'PUBLICADO' } });
  await api.listarRelatos({ autorId: 'u1', status: 'EM_ANALISE' });
  expect(fetch.mock.calls[0][0]).toBe('https://api.exemplo.com/relatos?autorId=u1&status=EM_ANALISE');
  const revisado = await api.revisarRelato('rel-1', { publicar: true });
  expect(fetch.mock.calls[1][0]).toBe('https://api.exemplo.com/relatos/rel-1/revisao');
  expect(revisado.status).toBe('PUBLICADO');
});

it('encerra uma ocorrência e simula chuva pelos endpoints do contrato', async () => {
  const fetch = responder({ status: 204, corpo: null }, { status: 204, corpo: null });
  await api.encerrarOcorrencia('oc 1');
  await api.simularChuva('sensor-1');
  expect(fetch.mock.calls[0][0]).toBe('https://api.exemplo.com/ocorrencias/oc%201/encerramento');
  expect(fetch.mock.calls[1][0]).toBe('https://api.exemplo.com/sensores/leituras');
});

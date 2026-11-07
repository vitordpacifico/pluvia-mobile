import { estadoExibido, MINUTOS_SEM_ATUALIZACAO, semDadosRecentes, textoEncerramento } from '../ocorrencia';
import { ocorrencia } from '@/testes/fabricas';

const AGORA = Date.parse('2026-11-07T15:00:00Z');
const minutosAtras = (minutos: number) => new Date(AGORA - minutos * 60_000).toISOString();

describe('estadoExibido', () => {
  it('mostra confirmado e ativo quando a fonte oficial atualizou há pouco', () => {
    expect(estadoExibido(ocorrencia({ atualizadaEm: minutosAtras(5) }), AGORA)).toBe('ATIVO');
  });

  it('separa o relato comunitário do registro oficial', () => {
    const comunitaria = ocorrencia({
      fonte: { tipo: 'COMUNIDADE', nome: 'Relato comunitário verificado' },
      atualizadaEm: minutosAtras(5),
    });
    expect(estadoExibido(comunitaria, AGORA)).toBe('COMUNITARIO');
  });

  it('avisa sem dados recentes quando a fonte para de atualizar', () => {
    const antiga = ocorrencia({ atualizadaEm: minutosAtras(MINUTOS_SEM_ATUALIZACAO + 1) });
    expect(semDadosRecentes(antiga, AGORA)).toBe(true);
    expect(estadoExibido(antiga, AGORA)).toBe('SEM_DADOS');
  });

  it('mantém encerrada mesmo sem atualização recente', () => {
    const encerrada = ocorrencia({ status: 'ENCERRADO', atualizadaEm: minutosAtras(300) });
    expect(semDadosRecentes(encerrada, AGORA)).toBe(false);
    expect(estadoExibido(encerrada, AGORA)).toBe('ENCERRADO');
  });
});

it('escreve o encerramento sem garantir que a via está liberada', () => {
  const encerrada = ocorrencia({ status: 'ENCERRADO', encerradaEm: '2026-11-07T14:32:00Z' });
  const texto = textoEncerramento(encerrada, () => '14:32');
  expect(texto).toBe(
    'Ocorrência encerrada pela fonte às 14:32. Isso não garante que a via esteja liberada.',
  );
  expect(textoEncerramento(ocorrencia(), () => '00:00')).toBeNull();
});

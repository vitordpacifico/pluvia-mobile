import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { ESTADO_INICIAL } from '@/dominio/avisos';
import { local, ocorrencia, risco } from '@/testes/fabricas';

import { atualizarLista, CHAVES, lerJSON, lerLista } from '../armazenamento';
import {
  contarNaoLidos,
  lerEstadoConhecido,
  lerPreferencias,
  listarAvisos,
  marcarTodosComoLidos,
  registrarAvisos,
  salvarPreferencias,
} from '../avisosServico';
import { lerCopiaMapa, salvarCopiaMapa } from '../cacheServico';
import { CHAVES_COFRE } from '../cofre';
import { adicionarFavorito, ErroLocal, listarLocais, removerLocal, salvarCarro } from '../locaisServico';

function novoAviso(chave: string, recebidoEm: string) {
  return {
    tipo: 'NOVO' as const,
    chave,
    titulo: 'Alagamento perto de Meu carro',
    texto: 'Texto',
    ocorrenciaId: 'o1',
    localId: 'carro',
    detectadoEm: '2026-11-07T14:00:00Z',
    recebidoEm,
  };
}

beforeEach(() => AsyncStorage.clear());

describe('armazenamento', () => {
  it('devolve o padrão para chave inexistente ou JSON corrompido', async () => {
    expect(await lerJSON('x', 7)).toBe(7);
    await AsyncStorage.setItem('x', '{quebrado');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await lerJSON('x', 7)).toBe(7);
  });

  it('trata como lista vazia o que não for lista', async () => {
    await AsyncStorage.setItem('l', '{"a":1}');
    expect(await lerLista('l')).toEqual([]);
  });

  it('não perde alterações feitas ao mesmo tempo', async () => {
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => atualizarLista<number>('n', (lista) => [...lista, i])),
    );
    expect((await lerLista<number>('n')).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i),
    );
  });
});

describe('avisos', () => {
  it('lista do mais recente para o mais antigo, sem repetir a mesma chave', async () => {
    await registrarAvisos('u1', [novoAviso('NOVO:o1', '2026-11-07T14:00:10Z')]);
    const repetidos = await registrarAvisos('u1', [
      novoAviso('NOVO:o1', '2026-11-07T14:00:20Z'),
      novoAviso('NOVO:o2', '2026-11-07T14:05:00Z'),
    ]);
    expect(repetidos).toHaveLength(1);
    const lista = await listarAvisos('u1');
    expect(lista.map((a) => a.chave)).toEqual(['NOVO:o2', 'NOVO:o1']);
  });

  it('conta e marca os não lidos', async () => {
    await registrarAvisos('u1', [novoAviso('a', '2026-11-07T14:00:00Z'), novoAviso('b', '2026-11-07T14:01:00Z')]);
    expect(await contarNaoLidos('u1')).toBe(2);
    await marcarTodosComoLidos('u1', '2026-11-07T15:00:00Z');
    expect(await contarNaoLidos('u1')).toBe(0);
  });

  it('completa as preferências com o padrão e lê o estado conhecido', async () => {
    expect(await lerPreferencias('u1')).toEqual({ novos: true, encerramentos: true, riscoElevado: true, silenciado: false });
    await salvarPreferencias('u1', { novos: false, encerramentos: true, riscoElevado: true, silenciado: true });
    expect((await lerPreferencias('u1')).silenciado).toBe(true);
    expect(await lerEstadoConhecido('u1')).toEqual(ESTADO_INICIAL);
    await AsyncStorage.setItem(CHAVES.estadoAvisos('u1'), '"quebrado"');
    expect(await lerEstadoConhecido('u1')).toEqual(ESTADO_INICIAL);
  });
});

describe('locais monitorados', () => {
  it('guarda o carro e os favoritos no cofre, nunca no AsyncStorage', async () => {
    await salvarCarro('u1', { ...local(), raioM: 500 });
    await adicionarFavorito('u1', { ...local({ nome: 'Trabalho' }), raioM: 1000 });

    expect(SecureStore.setItemAsync).toHaveBeenLastCalledWith(
      CHAVES_COFRE.locais('u1'),
      expect.stringContaining('Trabalho'),
      expect.anything(),
    );
    const tudo = JSON.stringify(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys()));
    expect(tudo).not.toContain('-23.5679');
    expect((await listarLocais('u1')).map((l) => l.tipo)).toEqual(['CARRO', 'FAVORITO']);
  });

  it('troca o carro em vez de criar outro', async () => {
    const primeiro = await salvarCarro('u3', local());
    const segundo = await salvarCarro('u3', local({ referencia: 'Outra rua' }));
    expect(segundo.id).toBe(primeiro.id);
    expect(await listarLocais('u3')).toHaveLength(1);
  });

  it('limita os favoritos e remove um local', async () => {
    for (let i = 0; i < 5; i++) await adicionarFavorito('u2', local({ nome: `Local ${i}` }));
    await expect(adicionarFavorito('u2', local())).rejects.toThrow(ErroLocal);
    const [primeiro] = await listarLocais('u2');
    await removerLocal('u2', primeiro.id);
    expect(await listarLocais('u2')).toHaveLength(4);
  });
});

it('guarda e lê a cópia do mapa para usar sem conexão', async () => {
  expect(await lerCopiaMapa()).toBeNull();
  await salvarCopiaMapa({ ocorrencias: [ocorrencia()], riscos: [risco()], salvoEm: '2026-11-07T15:00:00Z' });
  const copia = await lerCopiaMapa();
  expect(copia?.ocorrencias[0].id).toBe('o1');
  expect(copia?.salvoEm).toBe('2026-11-07T15:00:00Z');
});

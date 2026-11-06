import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import type { PontoMonitorado } from '@/dominio/tipos';
import { lerCopiaPontos, salvarCopiaPontos } from '@/servicos/armazenamento/cacheServico';
import { fonteDeDados } from '@/servicos/dados/fonte';

/** De quanto em quanto tempo o app consulta os pontos enquanto está aberto. */
export const INTERVALO_ATUALIZACAO_MS = 10_000;

/** De onde vieram os pontos mostrados: da consulta mais recente ou da cópia salva no celular. */
export type OrigemDados = 'rede' | 'copia-local';

interface EstadoDados {
  pontos: PontoMonitorado[];
  carregando: boolean;
  erro: string | null;
  origem: OrigemDados | null;
  /** Momento em que os pontos mostrados foram obtidos. */
  obtidosEm: Date | null;
  simulada: boolean;
  recarregar: () => Promise<void>;
}

const DadosContext = createContext<EstadoDados | null>(null);

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) return erro.message;
  return 'Não foi possível carregar os dados.';
}

/**
 * Uma única consulta periódica, compartilhada por todas as telas e pelo monitor de risco.
 * Cada resposta é salva no AsyncStorage. Sem conexão, o app mostra a última cópia salva.
 */
export function DadosProvider({ children }: { children: ReactNode }) {
  const [pontos, setPontos] = useState<PontoMonitorado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [origem, setOrigem] = useState<OrigemDados | null>(null);
  const [obtidosEm, setObtidosEm] = useState<Date | null>(null);
  const emAndamento = useRef(false);
  const recebeuDaRede = useRef(false);

  /** Ignora a chamada se já houver uma consulta em andamento. */
  const recarregar = useCallback((): Promise<void> => {
    if (emAndamento.current) return Promise.resolve();
    emAndamento.current = true;
    return fonteDeDados
      .listarPontos()
      .then((lista) => {
        const agora = new Date();
        recebeuDaRede.current = true;
        setPontos(lista);
        setOrigem('rede');
        setObtidosEm(agora);
        setErro(null);
        salvarCopiaPontos(lista, agora).catch((e) =>
          console.warn('Falha ao salvar a cópia local dos pontos', e),
        );
      })
      .catch((e: unknown) => setErro(mensagemDeErro(e)))
      .finally(() => {
        emAndamento.current = false;
        setCarregando(false);
      });
  }, []);

  // Mostra a cópia salva enquanto a primeira consulta não responde.
  useEffect(() => {
    lerCopiaPontos()
      .then((copia) => {
        if (!copia || recebeuDaRede.current) return;
        setPontos(copia.pontos);
        setOrigem('copia-local');
        setObtidosEm(copia.salvoEm);
        setCarregando(false);
      })
      .catch((e) => console.warn('Falha ao ler a cópia local dos pontos', e));
  }, []);

  useEffect(() => {
    recarregar();
    const intervalo = setInterval(() => {
      if (AppState.currentState === 'active') recarregar();
    }, INTERVALO_ATUALIZACAO_MS);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') recarregar();
    });
    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, [recarregar]);

  const valor = useMemo(
    () => ({
      pontos,
      carregando,
      erro,
      origem,
      obtidosEm,
      simulada: fonteDeDados.simulada,
      recarregar,
    }),
    [pontos, carregando, erro, origem, obtidosEm, recarregar],
  );

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados(): EstadoDados {
  const contexto = useContext(DadosContext);
  if (!contexto) throw new Error('useDados precisa estar dentro de DadosProvider.');
  return contexto;
}

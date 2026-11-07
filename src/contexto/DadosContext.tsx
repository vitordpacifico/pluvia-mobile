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

import type { Ocorrencia } from '@/dominio/ocorrencia';
import type { RiscoEstimado } from '@/dominio/riscoEstimado';
import type { SensorNivel } from '@/dominio/tipos';
import { lerCopiaMapa, salvarCopiaMapa } from '@/servicos/armazenamento/cacheServico';
import { fonteDeDados } from '@/servicos/dados/fonte';

export const INTERVALO_ATUALIZACAO_MS = 10_000;

export type OrigemDados = 'rede' | 'copia-local';

interface EstadoDados {
  ocorrencias: Ocorrencia[];
  riscos: RiscoEstimado[];
  sensores: SensorNivel[];
  carregando: boolean;
  erro: string | null;
  origem: OrigemDados | null;
  obtidosEm: Date | null;
  simulada: boolean;
  recarregar: () => Promise<void>;
}

const DadosContext = createContext<EstadoDados | null>(null);

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error && erro.message) return erro.message;
  return 'Não foi possível carregar os dados.';
}

export function DadosProvider({ children }: { children: ReactNode }) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [riscos, setRiscos] = useState<RiscoEstimado[]>([]);
  const [sensores, setSensores] = useState<SensorNivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [origem, setOrigem] = useState<OrigemDados | null>(null);
  const [obtidosEm, setObtidosEm] = useState<Date | null>(null);
  const emAndamento = useRef(false);
  const recebeuDaRede = useRef(false);

  const recarregar = useCallback((): Promise<void> => {
    if (emAndamento.current) return Promise.resolve();
    emAndamento.current = true;
    return Promise.all([
      fonteDeDados.listarOcorrencias(),
      fonteDeDados.listarRiscos(),
      fonteDeDados.listarSensores(),
    ])
      .then(([novasOcorrencias, novosRiscos, novosSensores]) => {
        const agora = new Date();
        recebeuDaRede.current = true;
        setOcorrencias(novasOcorrencias);
        setRiscos(novosRiscos);
        setSensores(novosSensores);
        setOrigem('rede');
        setObtidosEm(agora);
        setErro(null);
        salvarCopiaMapa({
          ocorrencias: novasOcorrencias,
          riscos: novosRiscos,
          salvoEm: agora.toISOString(),
        }).catch((e) => console.warn('Falha ao salvar a cópia local do mapa', e));
      })
      .catch((e: unknown) => setErro(mensagemDeErro(e)))
      .finally(() => {
        emAndamento.current = false;
        setCarregando(false);
      });
  }, []);

  useEffect(() => {
    lerCopiaMapa()
      .then((copia) => {
        if (!copia || recebeuDaRede.current) return;
        setOcorrencias(copia.ocorrencias);
        setRiscos(copia.riscos);
        setOrigem('copia-local');
        setObtidosEm(new Date(copia.salvoEm));
        setCarregando(false);
      })
      .catch((e) => console.warn('Falha ao ler a cópia local do mapa', e));
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
      ocorrencias,
      riscos,
      sensores,
      carregando,
      erro,
      origem,
      obtidosEm,
      simulada: fonteDeDados.simulada,
      recarregar,
    }),
    [ocorrencias, riscos, sensores, carregando, erro, origem, obtidosEm, recarregar],
  );

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados(): EstadoDados {
  const contexto = useContext(DadosContext);
  if (!contexto) throw new Error('useDados precisa estar dentro de DadosProvider.');
  return contexto;
}

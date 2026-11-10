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

import { ehCidadao } from '@/dominio/usuario';
import { verificarAvisos } from '@/servicos/alertas/monitor';
import { pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { contarNaoLidos } from '@/servicos/armazenamento/avisosServico';

import { useAutenticacao } from './AutenticacaoContext';
import { useDados } from './DadosContext';
import { useLocais } from './LocaisContext';

interface EstadoAvisos {
  naoLidos: number;
  versao: number;
  avisarMudanca: () => void;
}

const AvisosContext = createContext<EstadoAvisos | null>(null);

export function AvisosProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  const { ocorrencias, riscos, origem } = useDados();
  const { locais } = useLocais();
  const [naoLidos, setNaoLidos] = useState(0);
  const [versao, setVersao] = useState(0);
  const verificando = useRef(false);
  const usuarioId = usuario && ehCidadao(usuario) ? usuario.id : null;

  const avisarMudanca = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    if (!usuarioId) return;
    pedirPermissaoDeNotificacao().catch(() => undefined);
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;
    contarNaoLidos(usuarioId)
      .then(setNaoLidos)
      .catch((e) => console.warn('Falha ao contar os avisos', e));
  }, [usuarioId, versao]);

  useEffect(() => {
    if (!usuarioId || origem !== 'rede' || verificando.current) return;
    verificando.current = true;
    verificarAvisos(usuarioId, ocorrencias, riscos)
      .then((novos) => {
        if (novos.length > 0) avisarMudanca();
      })
      .catch((erro) => console.warn('Falha ao verificar os avisos', erro))
      .finally(() => {
        verificando.current = false;
      });
  }, [usuarioId, ocorrencias, riscos, origem, locais, avisarMudanca]);

  const valor = useMemo(
    () => ({ naoLidos: usuarioId ? naoLidos : 0, versao, avisarMudanca }),
    [usuarioId, naoLidos, versao, avisarMudanca],
  );
  return <AvisosContext.Provider value={valor}>{children}</AvisosContext.Provider>;
}

export function useAvisos(): EstadoAvisos {
  const contexto = useContext(AvisosContext);
  if (!contexto) throw new Error('useAvisos precisa estar dentro de AvisosProvider.');
  return contexto;
}

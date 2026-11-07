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
import { verificarPontosSeguidos } from '@/servicos/alertas/monitor';
import { contarAlertasPendentes } from '@/servicos/armazenamento/alertasServico';

import { useAutenticacao } from './AutenticacaoContext';
import { useDados } from './DadosContext';

interface EstadoAlertas {
  pendentes: number;
  versao: number;
  avisarMudanca: () => void;
}

const AlertasContext = createContext<EstadoAlertas | null>(null);

export function AlertasProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  const { pontos, origem } = useDados();
  const [pendentes, setPendentes] = useState(0);
  const [versao, setVersao] = useState(0);
  const verificando = useRef(false);
  const usuarioId = usuario && ehCidadao(usuario) ? usuario.id : null;

  const avisarMudanca = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    if (!usuarioId) return;
    contarAlertasPendentes(usuarioId)
      .then(setPendentes)
      .catch((e) => console.warn('Falha ao contar os alertas', e));
  }, [usuarioId, versao]);

  useEffect(() => {
    if (!usuarioId || origem !== 'rede' || pontos.length === 0 || verificando.current) return;
    verificando.current = true;
    verificarPontosSeguidos(usuarioId, pontos)
      .then((novos) => {
        if (novos > 0) avisarMudanca();
      })
      .catch((erro) => console.warn('Falha ao verificar os pontos seguidos', erro))
      .finally(() => {
        verificando.current = false;
      });
  }, [usuarioId, pontos, origem, avisarMudanca]);

  const valor = useMemo(
    () => ({ pendentes: usuarioId ? pendentes : 0, versao, avisarMudanca }),
    [usuarioId, pendentes, versao, avisarMudanca],
  );
  return <AlertasContext.Provider value={valor}>{children}</AlertasContext.Provider>;
}

export function useAlertas(): EstadoAlertas {
  const contexto = useContext(AlertasContext);
  if (!contexto) throw new Error('useAlertas precisa estar dentro de AlertasProvider.');
  return contexto;
}
